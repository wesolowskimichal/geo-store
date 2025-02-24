from rest_framework.generics import ListCreateAPIView  # type: ignore
from rest_framework.generics import RetrieveDestroyAPIView  # type: ignore
from rest_framework.views import APIView  # type: ignore
from rest_framework.filters import OrderingFilter  # type: ignore
from rest_framework.pagination import PageNumberPagination  # type: ignore
from rest_framework.response import Response  # type: ignore
from django_filters.rest_framework import DjangoFilterBackend  # type: ignore
from drf_spectacular.utils import extend_schema, OpenApiResponse  # type: ignore
from django.db import OperationalError
from .models import GeoData
from .serializers import BulkDeleteSerializer
from .serializers import GeoDataSerializer
from .serializers import GeoDataShortSerializer
from .services import get_geolocation_data
from .exceptions import IPStackAPIException
from .exceptions import DatabaseUnavailableException


class GeoDataPagination(PageNumberPagination):
    page_size = 25
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response(
            {
                "data": data,
                "meta": {
                    "total": self.page.paginator.count,
                    "page": self.page.number,
                    "last_page": self.page.paginator.num_pages,
                },
            }
        )


class GeoDataListCreateAPIView(ListCreateAPIView):
    queryset = GeoData.objects.all()
    fliter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = {
        "ip_or_url": ["exact", "icontains"],
        "type": ["exact", "icontains"],
        "country_name": ["exact", "icontains"],
        "latitude": ["exact", "gte", "lte"],
        "longitude": ["exact", "gte", "lte"],
        "status": ["exact"],
    }
    ordering_fields = ["updated_at"]
    ordering = ["-updated_at"]
    pagination_class = GeoDataPagination

    def get_serializer_class(self):
        if self.request.method == "GET":
            return GeoDataShortSerializer
        return GeoDataSerializer

    def get(self, request, *args, **kwargs):
        try:
            return super().get(request, *args, **kwargs)
        except OperationalError as exc:
            raise DatabaseUnavailableException() from exc

    def perform_create(self, serializer):
        try:
            instance = serializer.save()
        except OperationalError as exc:
            raise DatabaseUnavailableException() from exc
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
                instance.type = service_data.get("type", "")
                instance.country_name = service_data.get("country_name", "")
                instance.latitude = service_data.get("latitude")
                instance.longitude = service_data.get("longitude")
                instance.raw_response = service_data
                instance.status = "SUCCESS"
                instance.country_flag_emoji_unicode = service_data.get(
                    "location", {}
                ).get("country_flag_emoji_unicode", "")
                instance.save(
                    update_fields=[
                        "type",
                        "country_name",
                        "latitude",
                        "longitude",
                        "raw_response",
                        "status",
                        "country_flag_emoji_unicode",
                    ]
                )


class GeoDataDestroyDetailAPIView(RetrieveDestroyAPIView):
    queryset = GeoData.objects.all()
    serializer_class = GeoDataSerializer

    lookup_field = "pk"

    def get(self, request, *args, **kwargs):
        try:
            return super().get(request, *args, **kwargs)
        except OperationalError as exc:
            raise DatabaseUnavailableException() from exc

    def delete(self, request, *args, **kwargs):
        try:
            return super().delete(request, *args, **kwargs)
        except OperationalError as exc:
            raise DatabaseUnavailableException() from exc


class GeoDataDestroyBulkAPIView(APIView):
    @extend_schema(
        description="Deletes multiple GeoData records given a list of IDs provided in the request body.",
        request=BulkDeleteSerializer,
        responses={204: OpenApiResponse(description="Bulk delete successful.")},
    )
    def post(self, request):
        serializer = BulkDeleteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ids = serializer.validated_data["ids"]
        try:
            GeoData.objects.filter(id__in=ids).delete()
        except OperationalError as exc:
            raise DatabaseUnavailableException() from exc
        return Response(status=204)
