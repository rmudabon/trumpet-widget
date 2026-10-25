from django.db import models

# Create your models here.
class Widget(models.Model):
    class WidgetType(models.TextChoices):
        TEXT = 'text', 'Text'

    widget_type = models.CharField(max_length=10, choices=WidgetType.choices, default=WidgetType.TEXT, null=False)
    value = models.TextField(blank=True, null=False)
    position = models.PositiveIntegerField(null=False)