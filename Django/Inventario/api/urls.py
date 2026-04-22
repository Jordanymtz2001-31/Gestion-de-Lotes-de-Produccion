from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'productos', views.ProductoViewSet, basename='producto')

urlpatterns = [
    path('stock/', views.StockPorProductoView, name='stock-por-producto'),
    path('', include(router.urls)),
]