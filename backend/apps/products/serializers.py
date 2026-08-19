from rest_framework import serializers
from .models import Category, Brand, Product, ProductImage, Wishlist, InventoryLog

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = '__all__'

class BrandSerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Brand
        fields = '__all__'

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary']

class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True, allow_null=True)
    primary_image = serializers.SerializerMethodField()
    effective_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    sku = serializers.CharField(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'sku', 'price', 'discount_price', 'effective_price',
            'discount_percentage', 'category_name', 'brand_name', 'stock_quantity',
            'in_stock', 'is_low_stock', 'status', 'is_featured', 'is_new_arrival',
            'average_rating', 'review_count', 'primary_image', 'sales_count', 'created_at'
        ]

    def get_primary_image(self, obj):
        primary = obj.images.filter(is_primary=True).first()
        if primary:
            return self.context['request'].build_absolute_uri(primary.image.url) if 'request' in self.context else primary.image.url
        first_img = obj.images.first()
        if first_img:
            return self.context['request'].build_absolute_uri(first_img.image.url) if 'request' in self.context else first_img.image.url
        return None

class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False)
    brand_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    effective_price = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    in_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def create(self, validated_data):
        validated_data.pop('category_id', None)
        validated_data.pop('brand_id', None)
        category_id = self.initial_data.get('category_id')
        brand_id = self.initial_data.get('brand_id')
        if category_id:
            validated_data['category'] = Category.objects.get(id=category_id)
        if brand_id:
            validated_data['brand'] = Brand.objects.get(id=brand_id)
        return super().create(validated_data)

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'product', 'product_id', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class InventoryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
