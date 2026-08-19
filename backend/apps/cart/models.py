from decimal import Decimal
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from apps.products.models import Product

class Cart(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart for {self.user.email}"

    class Meta:
        db_table = 'carts'

    @property
    def subtotal(self):
        return sum(item.total for item in self.items.all())

    @property
    def total_items(self):
        return sum(item.quantity for item in self.items.all())

    @property
    def tax_amount(self):
        return self.subtotal * Decimal('0.18')  # 18% GST

    @property
    def shipping_cost(self):
        if self.subtotal >= 500:
            return 0
        return 49

    @property
    def discount_amount(self):
        total = self.subtotal
        discount = 0
        # 10% off on orders above 1000
        if total >= 1000:
            discount = total * Decimal('0.10')
        return min(discount, total)

    @property
    def grand_total(self):
        return self.subtotal + self.tax_amount + self.shipping_cost - self.discount_amount

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    class Meta:
        db_table = 'cart_items'
        unique_together = ['cart', 'product']

    @property
    def total(self):
        return self.product.effective_price * self.quantity
