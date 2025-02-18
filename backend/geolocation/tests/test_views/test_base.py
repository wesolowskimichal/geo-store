from django.db import OperationalError
from rest_framework.test import APIClient  # type: ignore
from django.urls import reverse

from geolocation.exceptions import IPStackAPIException


class BaseAPITestCase:
    client = APIClient()

    @staticmethod
    def fake_save_raise_operational_error(*args, **kwargs):
        raise OperationalError("Database is down")

    @staticmethod
    def fake_get_geolocation_data_success(ip_or_domain: str):
        """Simulate a successful IPStack response."""
        return {
            "country_name": "Testland",
            "latitude": 12.34,
            "longitude": 56.78,
            "some_extra_field": "value",
        }

    @staticmethod
    def fake_get_geolocation_data_failure(ip_or_domain: str):
        """Simulate a failed IPStack response (e.g. invalid access key)."""
        return {
            "success": False,
            "error": {
                "code": 101,
                "type": "invalid_access_key",
                "info": "Message",
            },
        }

    @staticmethod
    def fake_get_geolocation_data_exception(ip_or_domain: str):
        """Simulate a network or other exception during the service call."""
        raise IPStackAPIException(detail="Network Error")

    def run_database_unavailable_test(self, monkeypatch, attr: str, fake_func):
        """
        Helper to test that when serializer.save() fails due to a database error,
        the view returns a 503 response with the expected error detail.
        """
        monkeypatch.setattr(attr, fake_func)

        client = APIClient()
        url = reverse("geodata-create")
        payload = {"ip_or_url": "1.1.1.1", "type": "ip"}
        response = client.post(url, payload, format="json")
        assert response.status_code == 503, response.data
        data = response.data
        assert "database is unavailable" in str(data.get("detail")).lower()
