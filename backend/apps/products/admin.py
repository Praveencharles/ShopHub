from django.contrib import admin
from .models import Category, Brand, Product, ProductImage, Wishlist, InventoryLog

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'sku', 'price', 'stock_quantity', 'status', 'is_featured', 'average_rating', 'sales_count']
    list_filter = ['status', 'category', 'brand', 'is_featured']
    search_fields = ['name', 'sku', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline]

admin.site.register(Category)
admin.site.register(Brand)
admin.site.register(Product, ProductAdmin)
admin.site.register(ProductImage)
admin.site.register(Wishlist)
admin.site.register(InventoryLog)
