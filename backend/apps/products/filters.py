import django_filters
from django.db.models import Q
from .models import Product


class ProductFilter(django_filters.FilterSet):
    """Filter products by name/slug for category & brand, price, rating, stock etc."""

    category = django_filters.CharFilter(method='filter_category')
    brand = django_filters.CharFilter(method='filter_brand')
    min_price = django_filters.NumberFilter(method='filter_price')
    max_price = django_filters.NumberFilter(method='filter_price')
    rating = django_filters.NumberFilter(method='filter_rating')
    in_stock = django_filters.BooleanFilter(method='filter_in_stock')
    status = django_filters.CharFilter(field_name='status')
    is_featured = django_filters.BooleanFilter(field_name='is_featured')
    is_new_arrival = django_filters.BooleanFilter(field_name='is_new_arrival')
    stock_quantity__gte = django_filters.NumberFilter(field_name='stock_quantity', lookup_expr='gte')
    stock_quantity__lte = django_filters.NumberFilter(field_name='stock_quantity', lookup_expr='lte')

    class Meta:
        model = Product
        fields = [
            'category', 'brand', 'status', 'is_featured', 'is_new_arrival',
            'min_price', 'max_price', 'rating', 'in_stock',
            'stock_quantity__gte', 'stock_quantity__lte',
        ]

    def filter_category(self, queryset, name, value):
        return queryset.filter(
            Q(category__name__iexact=value) | Q(category__slug__iexact=value)
        )

    def filter_brand(self, queryset, name, value):
        return queryset.filter(
            Q(brand__name__iexact=value) | Q(brand__slug__iexact=value)
        )

    def filter_price(self, queryset, name, value):
        # Effective price = discount_price (when present) else price
        if name == 'min_price':
            return queryset.filter(
                Q(discount_price__isnull=True, price__gte=value)
                | Q(discount_price__isnull=False, discount_price__gte=value)
            )
        return queryset.filter(
            Q(discount_price__isnull=True, price__lte=value)
            | Q(discount_price__isnull=False, discount_price__lte=value)
        )

    def filter_rating(self, queryset, name, value):
        return queryset.filter(average_rating__gte=value)

    def filter_in_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock_quantity__gt=0)
        return queryset.filter(stock_quantity__lte=0)
