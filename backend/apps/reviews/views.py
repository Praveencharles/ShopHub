from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, NotFound
from django.shortcuts import get_object_or_404
from .models import Review
from .serializers import ReviewSerializer
from apps.products.models import Product
from ecommerce.pagination import StandardPagination
from ecommerce.exceptions import create_error_response


class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    pagination_class = StandardPagination
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['product', 'rating', 'is_approved']
    ordering_fields = ['created_at', 'rating']

    def get_queryset(self):
        queryset = Review.objects.select_related('user', 'product').all()
        if not self.request.user.is_authenticated or self.request.user.role != 'admin':
            queryset = queryset.filter(is_approved=True)
        return queryset

    def perform_create(self, serializer):
        product_id = self.request.data.get('product') or serializer.initial_data.get('product')
        product = get_object_or_404(Product, id=product_id)
        if Review.objects.filter(user=self.request.user, product=product).exists():
            raise ValidationError({'error': 'You have already reviewed this product'})
        serializer.save()

    def update(self, request, *args, **kwargs):
        review = self.get_object()
        if review.user != request.user and request.user.role != 'admin':
            return create_error_response(403, 'You cannot edit this review')
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        review = self.get_object()
        if review.user != request.user and request.user.role != 'admin':
            return create_error_response(403, 'You cannot delete this review')
        product = review.product
        response = super().destroy(request, *args, **kwargs)
        if product:
            # Recalculate product rating after deletion
            from django.db.models import Avg, Count
            avg = Review.objects.filter(product=product, is_approved=True).aggregate(
                avg_rating=Avg('rating'), count=Count('id')
            )
            product.average_rating = avg['avg_rating'] or 0
            product.review_count = avg['count'] or 0
            product.save(update_fields=['average_rating', 'review_count', 'updated_at'])
        return response

    @action(detail=False, methods=['get'])
    def product_reviews(self, request):
        product_id = request.query_params.get('product_id')
        if not product_id:
            return create_error_response(400, 'product_id is required')
        reviews = self.get_queryset().filter(product_id=product_id)
        serializer = self.get_serializer(reviews, many=True)
        return Response({'success': True, 'data': serializer.data})

    @action(detail=False, methods=['post'])
    def submit(self, request):
        """Create a review with error-tolerant product id handling."""
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        product_id = request.data.get('product')
        try:
            product = Product.objects.get(id=product_id)
        except (Product.DoesNotExist, TypeError, ValueError):
            raise NotFound('Product not found')
        if Review.objects.filter(user=request.user, product=product).exists():
            raise ValidationError({'error': 'You have already reviewed this product'})
        review = serializer.save()
        return Response({
            'success': True,
            'message': 'Review submitted successfully',
            'data': self.get_serializer(review).data
        }, status=status.HTTP_201_CREATED)
