from django.urls import path
from .views import GeoDataListCreateAPIView
from .views import GeoDataDestroyDetailAPIView
from .views import GeoDataDestroyBulkAPIView

urlpatterns = [
    path("geodata/", GeoDataListCreateAPIView.as_view(), name="geodata-list-create"),
    path(
        "geodata/<int:pk>/",
        GeoDataDestroyDetailAPIView.as_view(),
        name="geodata-destroy-detail",
    ),
    path(
        "geodata/bulk-delete/",
        GeoDataDestroyBulkAPIView.as_view(),
        name="geodata-destroy-bulk",
    ),
]
