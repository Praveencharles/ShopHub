from django.db.models import Sum, Count, Q, Avg
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from apps.orders.models import Order
from apps.products.models import Product, Category, Brand
from apps.reviews.models import Review
from ecommerce.permissions import IsAdminUser

User = get_user_model()

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Revenue calculations
        total_revenue = Order.objects.filter(
            payment_status=Order.PaymentStatus.COMPLETED,
            status__in=['delivered', 'shipped', 'processing']
        ).aggregate(total=Sum('total'))['total'] or 0

        total_orders = Order.objects.count()
        total_customers = User.objects.filter(role='customer').count()
        total_products = Product.objects.filter(status='active').count()
        total_categories = Category.objects.filter(is_active=True).count()
        total_brands = Brand.objects.filter(is_active=True).count()
        pending_orders = Order.objects.filter(status='pending').count()
        low_stock_products = Product.objects.filter(
            status='active',
            stock_quantity__gt=0,
            stock_quantity__lte=F('low_stock_threshold')
        ).count()
        out_of_stock = Product.objects.filter(status='active', stock_quantity=0).count()
        avg_order_value = Order.objects.filter(
            payment_status=Order.PaymentStatus.COMPLETED
        ).aggregate(avg=Avg('total'))['avg'] or 0

        # Monthly revenue for last 12 months
        twelve_months_ago = timezone.now() - timedelta(days=365)
        monthly_revenue = Order.objects.filter(
            payment_status=Order.PaymentStatus.COMPLETED,
            created_at__gte=twelve_months_ago
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            revenue=Sum('total'),
            count=Count('id')
        ).order_by('month')

        # Top selling products
        top_products = Product.objects.filter(status='active').order_by('-sales_count')[:10].values(
            'id', 'name', 'sales_count', 'stock_quantity'
        )

        # Category performance
        category_performance = Category.objects.filter(is_active=True).annotate(
            product_count=Count('products', filter=Q(products__status='active')),
            total_sales=Sum('products__sales_count'),
        ).values('id', 'name', 'product_count', 'total_sales').order_by('-total_sales')[:10]

        # Recent orders
        recent_orders = Order.objects.select_related('user').order_by('-created_at')[:10].values(
            'id', 'order_number', 'user__email', 'status', 'payment_status', 'total', 'created_at'
        )

        # New customers
        new_customers = User.objects.filter(role='customer').order_by('-date_joined')[:10].values(
            'id', 'email', 'username', 'date_joined'
        )

        # Low stock products
        from django.db.models import F
        low_stock_list = Product.objects.filter(
            status='active',
            stock_quantity__gt=0,
            stock_quantity__lte=F('low_stock_threshold')
        ).order_by('stock_quantity')[:10].values(
            'id', 'name', 'sku', 'stock_quantity', 'low_stock_threshold'
        )

        return Response({
            'success': True,
            'data': {
                'total_revenue': total_revenue,
                'total_orders': total_orders,
                'total_customers': total_customers,
                'total_products': total_products,
                'total_categories': total_categories,
                'total_brands': total_brands,
                'pending_orders': pending_orders,
                'low_stock_products': low_stock_products,
                'out_of_stock_products': out_of_stock,
                'average_order_value': avg_order_value,
                'monthly_revenue': list(monthly_revenue),
                'top_products': list(top_products),
                'category_performance': list(category_performance),
                'recent_orders': list(recent_orders),
                'new_customers': list(new_customers),
                'low_stock_product_list': list(low_stock_list),
            }
        })

class RevenueChartView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdminUser]

    def get(self, request):
        twelve_months_ago = timezone.now() - timedelta(days=365)
        data = Order.objects.filter(
            payment_status=Order.PaymentStatus.COMPLETED,
            created_at__gte=twelve_months_ago
        ).annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            revenue=Sum('total'),
            orders=Count('id')
        ).order_by('month')

        return Response({'success': True, 'data': list(data)})
