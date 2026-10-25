from django.shortcuts import render
from .models import Widget
from .serializers import WidgetSerializer
from rest_framework.viewsets import ModelViewSet

# Create your views here.
class WidgetViewSet(ModelViewSet):
    queryset = Widget.objects.all().order_by("position")
    serializer_class = WidgetSerializer
