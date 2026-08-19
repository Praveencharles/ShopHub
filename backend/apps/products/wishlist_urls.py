from django.urls import path
from . import wishlist_views

urlpatterns = [
    path('', wishlist_views.WishlistView.as_view(), name='wishlist'),
    path('<int:product_id>/', wishlist_views.WishlistDetailView.as_view(), name='wishlist-detail'),
    path('move-to-cart/<int:product_id>/', wishlist_views.MoveToCartView.as_view(), name='move-to-cart'),
]
