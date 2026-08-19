from rest_framework import serializers
from django.db.models import Avg, Count
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'user_name', 'user_email', 'product', 'rating', 'title', 'comment', 'is_verified_purchase', 'is_approved', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'is_verified_purchase', 'is_approved', 'created_at', 'updated_at']

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

    @staticmethod
    def _update_product_rating(product):
        avg = Review.objects.filter(product=product, is_approved=True).aggregate(
            avg_rating=Avg('rating'), count=Count('id')
        )
        product.average_rating = avg['avg_rating'] or 0
        product.review_count = avg['count'] or 0
        product.save(update_fields=['average_rating', 'review_count', 'updated_at'])

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        product = validated_data['product']

        # Check verified purchase
        from apps.orders.models import Order
        validated_data['is_verified_purchase'] = Order.objects.filter(
            user=validated_data['user'],
            items__product=product,
            status__in=['delivered']
        ).exists()
        # Auto-approve so the review appears immediately
        validated_data['is_approved'] = True

        review = super().create(validated_data)
        self._update_product_rating(product)
        return review

    def update(self, instance, validated_data):
        instance = super().update(instance, validated_data)
        self._update_product_rating(instance.product)
        return instance
