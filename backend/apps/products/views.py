from rest_framework import viewsets, filters, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, Exists, OuterRef
from .models import Category, Brand, Product, ProductImage, InventoryLog
from .serializers import (
    CategorySerializer, BrandSerializer, ProductListSerializer,
    ProductDetailSerializer, InventoryLogSerializer
)
from ecommerce.permissions import IsAdminOrReadOnly
from ecommerce.pagination import StandardPagination
from ecommerce.exceptions import create_error_response
from .filters import ProductFilter

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.annotate(product_count=Count('products', filter=Q(products__status='active')))
    serializer_class = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']

    def get_queryset(self):
        return Category.objects.annotate(
            product_count=Count('products', filter=Q(products__status='active'))
        ).filter(is_active=True)

class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.annotate(product_count=Count('products', filter=Q(products__status='active')))
    serializer_class = BrandSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    filterset_fields = ['is_active']
    search_fields = ['name', 'description']

    def get_queryset(self):
        queryset = Brand.objects.annotate(
            product_count=Count('products', filter=Q(products__status='active'))
        ).filter(is_active=True)
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(Exists(
                Product.objects.filter(
                    brand=OuterRef('pk'),
                    category__name__iexact=category
                )
            ))
        return queryset

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    filterset_class = ProductFilter
    search_fields = ['name', 'description', 'sku', 'tags']
    ordering_fields = ['price', 'created_at', 'sales_count', 'average_rating', 'name', 'stock_quantity']
    pagination_class = StandardPagination

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductDetailSerializer

    def get_queryset(self):
        queryset = Product.objects.select_related('category', 'brand').prefetch_related('images')
        if self.action == 'list':
            if not self.request.user.is_authenticated or self.request.user.role != 'admin':
                queryset = queryset.filter(status=Product.Status.ACTIVE)
        return queryset

    @action(detail=False, methods=['get'])
    def featured(self, request):
        products = self.get_queryset().filter(is_featured=True)[:8]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response({'success': True, 'data': serializer.data})

    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        products = self.get_queryset().filter(is_new_arrival=True)[:8]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response({'success': True, 'data': serializer.data})

    @action(detail=False, methods=['get'])
    def best_selling(self, request):
        products = self.get_queryset().order_by('-sales_count')[:8]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response({'success': True, 'data': serializer.data})

    @action(detail=False, methods=['get'])
    def top_rated(self, request):
        products = self.get_queryset().filter(review_count__gt=0).order_by('-average_rating')[:8]
        serializer = ProductListSerializer(products, many=True, context={'request': request})
        return Response({'success': True, 'data': serializer.data})

    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        product = self.get_object()
        related = self.get_queryset().filter(
            Q(category=product.category) | Q(brand=product.brand)
        ).exclude(id=product.id)[:8]
        serializer = ProductListSerializer(related, many=True, context={'request': request})
        return Response({'success': True, 'data': serializer.data})

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            product = serializer.save()
            images = request.FILES.getlist('images')
            for idx, image in enumerate(images):
                ProductImage.objects.create(
                    product=product,
                    image=image,
                    is_primary=(idx == 0)
                )
            return Response({
                'success': True,
                'message': 'Product created successfully',
                'data': ProductDetailSerializer(product, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response({'success': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

class InventoryLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = InventoryLogSerializer
    permission_classes = [permissions.IsAdminUser]
    filterset_fields = ['product', 'action']
    ordering_fields = ['created_at']
    pagination_class = StandardPagination

    def get_queryset(self):
        return InventoryLog.objects.select_related('product', 'created_by').all()
