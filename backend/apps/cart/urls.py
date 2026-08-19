from django.urls import path
from . import views

urlpatterns = [
    path('', views.CartView.as_view(), name='cart'),
    path('add/', views.CartItemAddView.as_view(), name='cart-add'),
    path('update/<int:item_id>/', views.CartItemUpdateView.as_view(), name='cart-update'),
    path('remove/<int:item_id>/', views.CartItemDeleteView.as_view(), name='cart-remove'),
]
