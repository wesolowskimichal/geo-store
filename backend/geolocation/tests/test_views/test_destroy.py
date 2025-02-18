import pytest
from rest_framework import status  # type: ignore
from rest_framework.test import APIClient  # type: ignore
from django.urls import reverse

from geolocation.tests.test_views.test_base import BaseAPITestCase
from geolocation.models import GeoData


@pytest.mark.django_db
class TestDestroyAPI(BaseAPITestCase):
    """
    Tests for DELETE /api/geodata/<pk>/ using GeoDataDestroyDetailAPIView.
    """

    def test_destroy_existing(self):
        """
        Destroy an existing GeoData record. Expect 204 No Content.
        """
        payload = {"ip_or_url": "1.1.1.1"}

        new_id = GeoData.objects.create(**payload).id
        detail_url = reverse("geodata-destroy-detail", args=[new_id])

        delete_response = self.client.delete(detail_url)
        assert (
            delete_response.status_code == status.HTTP_204_NO_CONTENT
        ), delete_response.data

        get_response = self.client.get(detail_url)
        assert get_response.status_code == status.HTTP_404_NOT_FOUND, get_response.data
        assert GeoData.objects.count() == 0

    def test_destroy_non_existent(self):
        """
        Destroy a non-existent GeoData record. Expect 404 Not Found.
        """
        client = APIClient()
        detail_url = reverse("geodata-destroy-detail", args=[999999])
        delete_response = client.delete(detail_url)
        assert (
            delete_response.status_code == status.HTTP_404_NOT_FOUND
        ), delete_response.data

    def test_destroy_db_unavailable(self, monkeypatch):
        """
        Simulate a database error during destroy. Expect 503 Service Unavailable.
        """
        payload = {"ip_or_url": "127.0.0.1"}
        id = GeoData.objects.create(**payload).id

        monkeypatch.setattr(
            "geolocation.views.GeoDataDestroyDetailAPIView.destroy",
            self.fake_save_raise_operational_error,
        )

        delete_response = self.client.delete(
            reverse("geodata-destroy-detail", args=[id])
        )
        assert delete_response.status_code == 503, delete_response.data
        data = delete_response.data
        assert "database is unavailable" in str(data.get("detail")).lower()
