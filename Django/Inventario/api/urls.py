from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'lotes', views.LoteViewSet, basename='lotes')
router.register(r'movimientos', views.MovimientoViewSet, basename='movimientos')

urlpatterns = [
    path('', include(router.urls)),
]