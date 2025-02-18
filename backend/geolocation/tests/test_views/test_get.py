import pytest
from rest_framework import status  # type: ignore
from django.urls import reverse
from geolocation.models import GeoData

from geolocation.tests.test_views.test_base import BaseAPITestCase


@pytest.mark.django_db
class TestGetAPI(BaseAPITestCase):
    """
    Tests for:
     - GET /api/geodata/ (list) => uses GeoDataShortSerializer
     - GET /api/geodata/<pk>/ (detail) => uses GeoDataSerializer
    """

    def test_list_geodata(self):
        """
        Ensure GET /api/geodata/ returns a list of objects using the short serializer,
        which includes most fields except raw_response.
        """
        list_url = reverse("geodata-list-create")

        create_payload_1 = {"ip_or_url": "1.1.1.1"}
        create_payload_2 = {"ip_or_url": "8.8.8.8"}
        GeoData.objects.create(**create_payload_1)
        GeoData.objects.create(**create_payload_2)

        response = self.client.get(list_url, format="json")
        assert response.status_code == status.HTTP_200_OK, response.data
        data = response.data
        assert isinstance(data, list)
        assert len(data) >= 2

        for item in data:
            assert "id" in item
            assert "ip_or_url" in item
            assert "type" in item
            assert "country_name" in item
            assert "latitude" in item
            assert "longitude" in item
            assert "country_flag_emoji_unicode" in item
            assert "status" in item
            assert "created_at" in item
            assert "updated_at" in item

            assert (
                "raw_response" not in item
            ), "Short serializer should omit raw_response"

    def test_detail_geodata(self):
        """
        Ensure GET /api/geodata/<pk>/ returns full details using the GeoDataSerializer,
        which includes *all* fields, including raw_response.
        """
        payload = {"ip_or_url": "1.1.1.1"}
        new_id = GeoData.objects.create(**payload).id

        detail_url = reverse("geodata-detail", args=[new_id])
        response = self.client.get(detail_url, format="json")
        assert response.status_code == status.HTTP_200_OK, response.data
        data = response.data

        assert data["id"] == new_id
        assert data["ip_or_url"] == "1.1.1.1"
        assert "type" in data
        assert "country_name" in data
        assert "latitude" in data
        assert "longitude" in data
        assert "country_flag_emoji_unicode" in data
        assert "status" in data
        assert "created_at" in data
        assert "updated_at" in data
        assert "raw_response" in data

    def test_detail_geodata_404(self):
        """
        Ensure GET /api/geodata/<pk>/ returns 404 for a non-existent record.
        """
        detail_url = reverse("geodata-detail", args=[999999])
        response = self.client.get(detail_url, format="json")
        assert response.status_code == status.HTTP_404_NOT_FOUND, response.data

    def test_list_db_unavailable(self, monkeypatch):
        """
        Test that when get_queryset fails due to a database error,
        the view returns a 503 response with the appropriate error detail.
        """
        monkeypatch.setattr(
            "geolocation.views.GeoDataListCreateAPIView.get_queryset",
            self.fake_save_raise_operational_error,
        )

        list_url = reverse("geodata-list-create")
        response = self.client.get(list_url)
        assert response.status_code == 503, response.data
        data = response.data
        assert "database is unavailable" in str(data.get("detail")).lower()

    def test_detail_db_unavailable(self, monkeypatch):
        """
        Test that when get_queryset fails due to a database error,
        the view returns a 503 response with the appropriate error detail.
        """
        monkeypatch.setattr(
            "geolocation.views.GeoDataDetailAPIView.get_queryset",
            self.fake_save_raise_operational_error,
        )

        detail_url = reverse("geodata-detail", args=[999999])
        response = self.client.get(detail_url)
        assert response.status_code == 503, response.data
        data = response.data
        assert "database is unavailable" in str(data.get("detail")).lower()
