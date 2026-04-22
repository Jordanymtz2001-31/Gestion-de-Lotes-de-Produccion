from rest_framework.routers import DefaultRouter
from . import views
from django.urls import path, include

router = DefaultRouter()
router.register(r'proveedores', views.ProveedorViewSet, basename='proveedor')

urlpatterns = [
    path('', include(router.urls)),
]