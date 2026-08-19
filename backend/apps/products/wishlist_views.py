from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Wishlist, Product
from .serializers import WishlistSerializer
from ecommerce.exceptions import create_error_response

class WishlistView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user).select_related('product')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def create(self, request, *args, **kwargs):
        product_id = request.data.get('product_id')
        if Wishlist.objects.filter(user=request.user, product_id=product_id).exists():
            return create_error_response(400, 'Product already in wishlist')
        return super().create(request, *args, **kwargs)

class WishlistDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, product_id):
        wishlist_item = get_object_or_404(Wishlist, user=request.user, product_id=product_id)
        wishlist_item.delete()
        return Response({
            'success': True,
            'message': 'Product removed from wishlist'
        })

class MoveToCartView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, product_id):
        wishlist_item = get_object_or_404(Wishlist, user=request.user, product_id=product_id)
        product = wishlist_item.product
        wishlist_item.delete()

        from apps.cart.models import Cart, CartItem
        cart, _ = Cart.objects.get_or_create(user=request.user)
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': 1}
        )
        if not created:
            if product.stock_quantity > cart_item.quantity:
                cart_item.quantity += 1
                cart_item.save()

        return Response({
            'success': True,
            'message': 'Product moved to cart'
        })
