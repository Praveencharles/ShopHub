import json
import stripe
import razorpay
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.db import transaction
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Payment
from .serializers import RazorpayOrderSerializer, StripePaymentIntentSerializer
from apps.orders.models import Order
from ecommerce.exceptions import create_error_response

stripe.api_key = settings.STRIPE_SECRET_KEY

class RazorpayOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = RazorpayOrderSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        order = get_object_or_404(Order, id=serializer.validated_data['order_id'], user=request.user)
        if order.payment_status == Order.PaymentStatus.COMPLETED:
            return create_error_response(400, 'Order already paid')

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        razorpay_order = client.order.create({
            'amount': int(order.total * 100),
            'currency': 'INR',
            'receipt': order.order_number,
            'notes': {'order_id': str(order.id)}
        })

        Payment.objects.create(
            order=order,
            user=request.user,
            payment_method=Payment.Method.RAZORPAY,
            transaction_id=razorpay_order['id'],
            amount=order.total,
            gateway_response=razorpay_order,
        )

        return Response({
            'success': True,
            'data': {
                'razorpay_order_id': razorpay_order['id'],
                'amount': razorpay_order['amount'],
                'currency': razorpay_order['currency'],
                'key_id': settings.RAZORPAY_KEY_ID,
                'order_number': order.order_number,
            }
        })

class RazorpayVerifyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_signature = request.data.get('razorpay_signature')

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }

        try:
            client.utility.verify_payment_signature(params_dict)
            payment = get_object_or_404(Payment, transaction_id=razorpay_order_id)
            payment.payment_status = Payment.Status.SUCCESS
            payment.transaction_id = razorpay_payment_id
            payment.gateway_response = params_dict
            payment.paid_at = None
            from django.utils import timezone
            payment.paid_at = timezone.now()
            payment.save()

            order = payment.order
            order.payment_status = Order.PaymentStatus.COMPLETED
            order.transaction_id = razorpay_payment_id
            order.save()

            return Response({
                'success': True,
                'message': 'Payment verified successfully',
                'data': {'payment_id': razorpay_payment_id, 'order_id': order.id}
            })
        except razorpay.errors.SignatureVerificationError:
            return create_error_response(400, 'Payment verification failed')

class StripePaymentIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = StripePaymentIntentSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        order = get_object_or_404(Order, id=serializer.validated_data['order_id'], user=request.user)
        if order.payment_status == Order.PaymentStatus.COMPLETED:
            return create_error_response(400, 'Order already paid')

        intent = stripe.PaymentIntent.create(
            amount=int(order.total * 100),
            currency='usd',
            metadata={'order_id': order.id, 'order_number': order.order_number},
        )

        Payment.objects.create(
            order=order,
            user=request.user,
            payment_method=Payment.Method.STRIPE,
            transaction_id=intent['id'],
            amount=order.total,
            gateway_response=intent,
        )

        return Response({
            'success': True,
            'data': {
                'client_secret': intent['client_secret'],
                'publishable_key': settings.STRIPE_PUBLISHABLE_KEY,
            }
        })

class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return Response({'error': 'Invalid payload'}, status=400)
        except stripe.error.SignatureVerificationError:
            return Response({'error': 'Invalid signature'}, status=400)

        if event['type'] == 'payment_intent.succeeded':
            intent = event['data']['object']
            payment = get_object_or_404(Payment, transaction_id=intent['id'])
            payment.payment_status = Payment.Status.SUCCESS
            from django.utils import timezone
            payment.paid_at = timezone.now()
            payment.save()

            order = payment.order
            order.payment_status = Order.PaymentStatus.COMPLETED
            order.transaction_id = intent['id']
            order.save()

        elif event['type'] == 'payment_intent.payment_failed':
            intent = event['data']['object']
            payment = get_object_or_404(Payment, transaction_id=intent['id'])
            payment.payment_status = Payment.Status.FAILED
            payment.save()

        return Response({'status': 'success'})
