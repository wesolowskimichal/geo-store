from geolocation.tests.test_views.test_base import BaseAPITestCase
import pytest
from rest_framework.test import APIClient  # type: ignore
from django.urls import reverse


class TestPostAPI(BaseAPITestCase):
    @pytest.mark.django_db
    def test_invalid_payload(self):
        """
        Test that when an invalid payload is sent,
        the view returns a 400 response with the appropriate error detail.
        """
        client = APIClient()
        url = reverse("geodata-list-create")
        payload = {"invalid_field": None}
        response = client.post(url, payload, format="json")
        assert response.status_code == 400, response.data
        data = response.data
        assert "ip_or_url" in data

    @pytest.mark.django_db
    def test_create_geodata_success(self, monkeypatch):
        """
        Test that when the service returns a successful response,
        the GeoData record is updated with geolocation data and status is "SUCCESS".
        """
        monkeypatch.setattr(
            "geolocation.views.get_geolocation_data",
            self.fake_get_geolocation_data_success,
        )
        client = APIClient()
        url = reverse("geodata-list-create")
        payload = {"ip_or_url": "1.1.1.1"}
        response = client.post(url, payload, format="json")
        assert response.status_code == 201, response.data
        data = response.data

        assert data["ip_or_url"] == "1.1.1.1"
        assert data["type"] == "ipv4"
        assert data["country_name"] == "Testland"
        assert data["latitude"] == 12.12
        assert data["longitude"] == -21.21
        assert data["country_flag_emoji_unicode"] == "+1F1F9 +1F1F3"
        assert data["raw_response"] is not None
        assert data["status"] == "SUCCESS"
        assert data["created_at"] is not None
        assert data["updated_at"] is not None

    @pytest.mark.django_db
    def test_create_geodata_failure_response(self, monkeypatch):
        """
        Test that when the service returns a JSON response with "success": false,
        the GeoData record is updated with the error details and status remains "FAILED".
        """
        monkeypatch.setattr(
            "geolocation.views.get_geolocation_data",
            self.fake_get_geolocation_data_failure,
        )
        client = APIClient()
        url = reverse("geodata-list-create")
        payload = {"ip_or_url": "1.1.1.1", "type": "ip"}
        response = client.post(url, payload, format="json")
        assert response.status_code == 201, response.data
        data = response.data

        assert data["status"] == "FAILED"
        assert "error" in data["raw_response"]

        assert data["country_name"] == ""
        assert data["latitude"] is None
        assert data["longitude"] is None

    @pytest.mark.django_db
    def test_create_geodata_exception(self, monkeypatch):
        """
        Test that when the service raises an exception,
        the GeoData record is updated with the error message and status is "FAILED".
        """
        monkeypatch.setattr(
            "geolocation.views.get_geolocation_data",
            self.fake_get_geolocation_data_exception,
        )
        client = APIClient()
        url = reverse("geodata-list-create")
        payload = {"ip_or_url": "1.1.1.1", "type": "ip"}
        response = client.post(url, payload, format="json")
        assert response.status_code == 201, response.data
        data = response.data

        assert data["status"] == "FAILED"
        assert data["raw_response"].get("error") == "Network Error"

    @pytest.mark.django_db
    def test_database_unavailable(self, monkeypatch):
        """
        Test that when serializer.save() fails due to a database error,
        the view returns a 503 response with the appropriate error detail.
        """
        monkeypatch.setattr(
            "geolocation.serializers.GeoDataSerializer.save",
            self.fake_save_raise_operational_error,
        )

        payload = {"ip_or_url": "1.1.1.1", "type": "ip"}
        create_url = reverse("geodata-list-create")
        response = self.client.post(create_url, payload, format="json")
        assert response.status_code == 503, response.data
        data = response.data
        assert "database is unavailable" in str(data.get("detail")).lower()
