from django.urls import path
from .views import GeoDataListCreateAPIView
from .views import GeoDataDetailAPIView

urlpatterns = [
    path("geodata/", GeoDataListCreateAPIView.as_view(), name="geodata-list-create"),
    path("geodata/<int:pk>/", GeoDataDetailAPIView.as_view(), name="geodata-detail"),
]
