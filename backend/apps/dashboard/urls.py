from django.urls import path
from . import views

urlpatterns = [
    path('stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
    path('revenue/', views.RevenueChartView.as_view(), name='dashboard-revenue'),
]
