from django.urls import path
from .views import GeoDataCreateAPIView

urlpatterns = [
    path("geodata/", GeoDataCreateAPIView.as_view(), name="geodata-create"),
]
