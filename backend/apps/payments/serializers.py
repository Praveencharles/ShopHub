from rest_framework import serializers
from .models import Payment

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class RazorpayOrderSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()

class StripePaymentIntentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField()
