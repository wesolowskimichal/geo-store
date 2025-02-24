import pytest  # type: ignore
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


@pytest.mark.django_db
class TestGeoDataDestroyBulkAPIView(BaseAPITestCase):
    """
    Tests for POST /api/geodata/bulk-destroy/ using GeoDataDestroyBulkAPIView.
    """

    def test_bulk_destroy_success(self):
        """
        Bulk delete multiple existing GeoData records.
        Expect 204 No Content and records are removed.
        """
        # Create multiple GeoData records.
        payload1 = {"ip_or_url": "1.1.1.1"}
        payload2 = {"ip_or_url": "8.8.8.8"}
        geo1 = GeoData.objects.create(**payload1)
        geo2 = GeoData.objects.create(**payload2)

        url = reverse("geodata-destroy-bulk")
        data = {"ids": [geo1.id, geo2.id]}
        response = self.client.post(url, data, format="json")
        assert response.status_code == status.HTTP_204_NO_CONTENT, response.data

        # Verify that both records are deleted.
        assert not GeoData.objects.filter(id=geo1.id).exists()
        assert not GeoData.objects.filter(id=geo2.id).exists()

    def test_bulk_destroy_with_nonexistent_ids(self):
        """
        Attempt to bulk delete including an ID that does not exist.
        Expect 204 No Content and deletion of any existing records.
        """
        payload = {"ip_or_url": "1.1.1.1"}
        geo = GeoData.objects.create(**payload)

        url = reverse("geodata-destroy-bulk")
        # Include one valid and one non-existent ID.
        data = {"ids": [geo.id, 999999]}
        response = self.client.post(url, data, format="json")
        assert response.status_code == status.HTTP_204_NO_CONTENT, response.data

        # Verify that the existing record is deleted.
        assert not GeoData.objects.filter(id=geo.id).exists()
