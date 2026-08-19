from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.products.models import Product, Category, Brand
from apps.orders.models import Order
from apps.reviews.models import Review

User = get_user_model()

class DashboardStatsSerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_orders = serializers.IntegerField()
    total_customers = serializers.IntegerField()
    total_products = serializers.IntegerField()
    total_categories = serializers.IntegerField()
    total_brands = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    low_stock_products = serializers.IntegerField()
    out_of_stock_products = serializers.IntegerField()
    average_order_value = serializers.DecimalField(max_digits=10, decimal_places=2)
    monthly_revenue = serializers.ListField(child=serializers.DictField())
    top_products = serializers.ListField(child=serializers.DictField())
    category_performance = serializers.ListField(child=serializers.DictField())
    recent_orders = serializers.ListField(child=serializers.DictField())
    new_customers = serializers.ListField(child=serializers.DictField())
    low_stock_product_list = serializers.ListField(child=serializers.DictField())
