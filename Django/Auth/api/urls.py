from rest_framework.routers import DefaultRouter
from api import views 
from django.urls import path, include

router = DefaultRouter()
router.register(r'usuarios', views.UsuarioViewSet, basename='usuario')

urlpatterns = [
        path('login/', views.LoginView.as_view(), name='login'),
        path('verify/', views.VerifyView.as_view(), name='verify'),
        path('', include(router.urls)),
]

#Es decir que las urls de la api para CRUD basico son: http://127.0.0.1:8000/usuario/
#Es decir que las urls de la api para login son: http://127.0.0.1:8000/login/
