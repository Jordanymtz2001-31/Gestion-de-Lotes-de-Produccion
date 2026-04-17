from rest_framework.routers import DefaultRouter
from api import views 
from django.urls import path, include

router = DefaultRouter()
router.register(r'usuarios', views.UsuarioViewSet, basename='usuario')

urlpatterns = [
        path('login/', views.LoginView.as_view(), name='login'),
        path('', include(router.urls)),
]

#Es decir que las urls de la api son: http://127.0.0.1:8000/usuario/
