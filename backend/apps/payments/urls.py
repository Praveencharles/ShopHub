from django.urls import path
from . import views

urlpatterns = [
    path('razorpay/order/', views.RazorpayOrderView.as_view(), name='razorpay-order'),
    path('razorpay/verify/', views.RazorpayVerifyView.as_view(), name='razorpay-verify'),
    path('stripe/intent/', views.StripePaymentIntentView.as_view(), name='stripe-intent'),
    path('stripe/webhook/', views.StripeWebhookView.as_view(), name='stripe-webhook'),
]
