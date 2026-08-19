from rest_framework import viewsets, status, permissions, generics, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Order, OrderItem
from .serializers import (
    OrderSerializer, OrderCreateSerializer, OrderStatusUpdateSerializer, OrderListSerializer
)
from apps.cart.models import Cart, CartItem
from apps.accounts.models import Address
from apps.products.models import Product, InventoryLog
from ecommerce.permissions import IsAdminUser, IsOwnerOrAdmin
from ecommerce.pagination import StandardPagination
from ecommerce.exceptions import create_error_response

class OrderViewSet(viewsets.ModelViewSet):
    pagination_class = StandardPagination
    filterset_fields = ['status', 'payment_status', 'payment_method']
    search_fields = ['order_number', 'user__email', 'user__username']
    ordering_fields = ['created_at', 'total']

    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        if self.action == 'create':
            return OrderCreateSerializer
        if self.action in ('update_status',):
            return OrderStatusUpdateSerializer
        return OrderSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Order.objects.prefetch_related('items').all()
        return Order.objects.prefetch_related('items').filter(user=user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        cart = get_object_or_404(Cart, user=request.user)
        cart_items = cart.items.select_related('product').all()

        if not cart_items.exists():
            return create_error_response(400, 'Cart is empty')

        # Validate stock
        for item in cart_items:
            if item.quantity > item.product.stock_quantity:
                return create_error_response(400, f'{item.product.name} has only {item.product.stock_quantity} items available')

        # Get addresses
        shipping_addr_id = serializer.validated_data.get('shipping_address_id')
        shipping_addr_text = serializer.validated_data.get('shipping_address')
        billing_addr_text = serializer.validated_data.get('billing_address')

        if shipping_addr_id:
            address = get_object_or_404(Address, id=shipping_addr_id, user=request.user)
            shipping_addr_text = str(address)
            if not billing_addr_text:
                billing_addr_text = str(address)

        subtotal = cart.subtotal
        tax_amount = cart.tax_amount
        shipping_cost = cart.shipping_cost
        discount_amount = cart.discount_amount
        total = cart.grand_total

        order = Order.objects.create(
            user=request.user,
            status=Order.Status.PENDING,
            shipping_address=shipping_addr_text,
            billing_address=billing_addr_text,
            payment_method=serializer.validated_data['payment_method'],
            subtotal=subtotal,
            tax_amount=tax_amount,
            shipping_cost=shipping_cost,
            discount_amount=discount_amount,
            total=total,
            notes=serializer.validated_data.get('notes', ''),
        )

        # Create order items and update stock
        for cart_item in cart_items:
            product = cart_item.product
            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=product.name,
                product_sku=product.sku,
                product_image=product.images.filter(is_primary=True).first().image.url if product.images.filter(is_primary=True).exists() else None,
                quantity=cart_item.quantity,
                price=product.effective_price,
                total=cart_item.total,
            )

            # Reduce stock
            product.stock_quantity -= cart_item.quantity
            product.sales_count += cart_item.quantity
            product.save()

            InventoryLog.objects.create(
                product=product,
                quantity_changed=-cart_item.quantity,
                previous_stock=product.stock_quantity + cart_item.quantity,
                new_stock=product.stock_quantity,
                action=InventoryLog.Action.ORDER_PLACED,
                reference=f"Order #{order.order_number}",
                created_by=request.user,
            )

        # Clear cart
        cart_items.delete()

        return Response({
            'success': True,
            'message': 'Order placed successfully',
            'data': OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            old_status = order.status
            order.status = serializer.validated_data.get('status', order.status)
            order.tracking_number = serializer.validated_data.get('tracking_number', order.tracking_number)
            order.save()

            # If cancelled, restore stock
            if order.status == Order.Status.CANCELLED and old_status not in (Order.Status.CANCELLED, Order.Status.DELIVERED):
                for item in order.items.all():
                    if item.product:
                        item.product.stock_quantity += item.quantity
                        item.product.save()
                        InventoryLog.objects.create(
                            product=item.product,
                            quantity_changed=item.quantity,
                            previous_stock=item.product.stock_quantity - item.quantity,
                            new_stock=item.product.stock_quantity,
                            action=InventoryLog.Action.ORDER_CANCELLED,
                            reference=f"Order #{order.order_number} cancelled",
                            created_by=request.user,
                        )

            return Response({
                'success': True,
                'message': 'Order status updated',
                'data': OrderSerializer(order).data
            })
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status in (Order.Status.SHIPPED, Order.Status.DELIVERED):
            return create_error_response(400, 'Cannot cancel shipped or delivered order')
        if order.status == Order.Status.CANCELLED:
            return create_error_response(400, 'Order already cancelled')

        order.status = Order.Status.CANCELLED
        order.save()

        for item in order.items.all():
            if item.product:
                item.product.stock_quantity += item.quantity
                item.product.save()

        return Response({'success': True, 'message': 'Order cancelled successfully'})

    def destroy(self, request, pk=None):
        order = self.get_object()
        if request.user.role != 'admin' and order.user != request.user:
            return create_error_response(403, 'You cannot delete this order')
        if request.user.role != 'admin' and order.status != Order.Status.CANCELLED:
            return create_error_response(400, 'Only cancelled orders can be deleted')
        order.delete()
        return Response({'success': True, 'message': 'Order deleted successfully'})
