from rest_framework import serializers
from .models import Widget

class WidgetSerializer(serializers.ModelSerializer):
    value = serializers.CharField(allow_blank=True, trim_whitespace=False)

    class Meta:
        model = Widget
        fields = '__all__'
