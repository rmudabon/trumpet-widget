from django.db import transaction
from django.db.models import F
from rest_framework.viewsets import ModelViewSet

from .models import Widget
from .serializers import WidgetSerializer


class WidgetViewSet(ModelViewSet):
    queryset = Widget.objects.all().order_by("position")
    serializer_class = WidgetSerializer

    @transaction.atomic
    def perform_create(self, serializer):
        position = serializer.validated_data["position"]
        Widget.objects.filter(position__gte=position).update(position=F("position") + 1)
        serializer.save()

    @transaction.atomic
    def perform_destroy(self, instance):
        position = instance.position
        instance.delete()
        Widget.objects.filter(position__gt=position).update(position=F("position") - 1)
