from django.urls import include, path
from rest_framework.routers import SimpleRouter

from .views import WidgetViewSet

router = SimpleRouter()

router.register(r'widgets', WidgetViewSet, basename='widget')

urlpatterns = [
    path('', include(router.urls))
]

