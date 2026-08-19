from rest_framework import serializers
from .models import Order, OrderItem
from apps.products.serializers import ProductListSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_sku', 'product_image', 'quantity', 'price', 'total']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'user_name', 'user_email',
            'status', 'payment_status', 'shipping_address', 'billing_address',
            'payment_method', 'subtotal', 'tax_amount', 'shipping_cost',
            'discount_amount', 'total', 'tracking_number', 'notes',
            'transaction_id', 'invoice_url', 'created_at', 'updated_at', 'items'
        ]
        read_only_fields = ['id', 'order_number', 'user', 'created_at', 'updated_at']

class OrderCreateSerializer(serializers.Serializer):
    shipping_address_id = serializers.IntegerField(required=False)
    shipping_address = serializers.CharField(required=False)
    billing_address = serializers.CharField(required=False)
    payment_method = serializers.ChoiceField(choices=['razorpay', 'stripe', 'cod'])
    notes = serializers.CharField(required=False, allow_blank=True)

    def validate(self, attrs):
        if not attrs.get('shipping_address_id') and not attrs.get('shipping_address'):
            raise serializers.ValidationError("Shipping address is required")
        return attrs

class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['status', 'tracking_number']

class OrderListSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()
    first_item = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status', 'payment_method',
            'total', 'item_count', 'first_item', 'created_at'
        ]

    def get_item_count(self, obj):
        return obj.items.count()

    def get_first_item(self, obj):
        item = obj.items.first()
        if item:
            return {'name': item.product_name, 'image': item.product_image}
        return None
