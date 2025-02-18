from rest_framework.generics import CreateAPIView  # type: ignore
from django.db import OperationalError
from .models import GeoData
from .serializers import GeoDataSerializer
from .services import get_geolocation_data
from .exceptions import IPStackAPIException
from .exceptions import DatabaseUnavailableException


class GeoDataCreateAPIView(CreateAPIView):
    queryset = GeoData.objects.all()
    serializer_class = GeoDataSerializer

    def perform_create(self, serializer):
        try:
            instance = serializer.save()
        except OperationalError as exc:
            raise DatabaseUnavailableException(
                detail="Database is currently unavailable."
            ) from exc
        try:
            service_data = get_geolocation_data(instance.ip_or_url)
        except IPStackAPIException as exc:
            instance.raw_response = {"error": exc.detail}
            instance.status = "FAILED"
            instance.save(update_fields=("raw_response", "status"))
        else:
            if service_data.get("success") is False:
                instance.raw_response = service_data
                instance.status = "FAILED"
                instance.save(update_fields=["raw_response", "status"])
            else:
                instance.country_name = service_data.get("country_name", "")
                instance.latitude = service_data.get("latitude")
                instance.longitude = service_data.get("longitude")
                instance.raw_response = service_data
                instance.status = "SUCCESS"
                instance.save(
                    update_fields=[
                        "country_name",
                        "latitude",
                        "longitude",
                        "raw_response",
                        "status",
                    ]
                )
