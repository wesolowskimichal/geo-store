from typing import TYPE_CHECKING
from typing import TypeAlias
from django.db.models import Model
from django.db.models import CharField
from django.db.models import FloatField
from django.db.models import DateTimeField
from django.db.models import JSONField
from django.urls import reverse

if TYPE_CHECKING:
    GeoCharField: TypeAlias = CharField["GeoData", str]
    GeoFloatField: TypeAlias = FloatField["GeoData", float]
    GeoDateTimeField: TypeAlias = DateTimeField["GeoData", str]
else:
    GeoCharField = CharField
    GeoFloatField = FloatField
    GeoDateTimeField = DateTimeField


class GeoData(Model):
    ip_or_url: GeoCharField = CharField(max_length=255)
    type: GeoCharField = CharField(max_length=255, blank=True)
    country_name: GeoCharField = CharField(max_length=100, blank=True)
    latitude: GeoFloatField = FloatField(blank=True, null=True)
    longitude: GeoFloatField = FloatField(blank=True, null=True)
    country_flag_emoji_unicode: GeoCharField = CharField(max_length=100, blank=True)
    raw_response = JSONField(blank=True, null=True)
    created_at: GeoDateTimeField = DateTimeField(auto_now_add=True)
    updated_at: GeoDateTimeField = DateTimeField(auto_now=True)

    def get_absolute_url(self) -> str:
        return reverse("geodata-detail", args=[str(self.pk)])

    def __str__(self) -> str:
        return self.ip_or_url
