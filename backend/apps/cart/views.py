from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
from apps.products.models import Product
from ecommerce.exceptions import create_error_response

class CartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        return Response({'success': True, 'data': serializer.data})

    def delete(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        serializer = CartSerializer(cart)
        return Response({'success': True, 'data': serializer.data, 'message': 'Cart cleared'})

class CartItemAddView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        product = get_object_or_404(Product, id=product_id, status='active')
        if product.stock_quantity < quantity:
            return create_error_response(400, f'Only {product.stock_quantity} items available')
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            new_qty = cart_item.quantity + quantity
            if product.stock_quantity < new_qty:
                return create_error_response(400, f'Only {product.stock_quantity - cart_item.quantity} more items available')
            cart_item.quantity = new_qty
            cart_item.save()
        serializer = CartSerializer(cart)
        return Response({
            'success': True,
            'message': 'Product added to cart',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)

class CartItemUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, item_id):
        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        quantity = request.data.get('quantity', cart_item.quantity)
        if quantity < 1:
            cart_item.delete()
            serializer = CartSerializer(cart)
            return Response({'success': True, 'data': serializer.data, 'message': 'Item removed'})
        if cart_item.product.stock_quantity < quantity:
            return create_error_response(400, f'Only {cart_item.product.stock_quantity} items available')
        cart_item.quantity = quantity
        cart_item.save()
        serializer = CartSerializer(cart)
        return Response({'success': True, 'data': serializer.data, 'message': 'Quantity updated'})

class CartItemDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        cart = get_object_or_404(Cart, user=request.user)
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()
        serializer = CartSerializer(cart)
        return Response({'success': True, 'data': serializer.data, 'message': 'Item removed from cart'})
