from django.db import OperationalError
import pytest
from rest_framework.test import APIClient  # type: ignore
from django.urls import reverse

from geolocation.exceptions import IPStackAPIException


def fake_save_raise_operational_error(*args, **kwargs):
    raise OperationalError("Database is down")


def fake_get_geolocation_data_success(ip_or_domain: str):
    """Simulate a successful IPStack response."""
    return {
        "country_name": "Testland",
        "latitude": 12.34,
        "longitude": 56.78,
        "some_extra_field": "value",
    }


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


def fake_get_geolocation_data_exception(ip_or_domain: str):
    """Simulate a network or other exception during the service call."""
    raise IPStackAPIException(detail="Network Error")


@pytest.mark.django_db
def test_create_geodata_success(monkeypatch):
    """
    Test that when the service returns a successful response,
    the GeoData record is updated with geolocation data and status is "SUCCESS".
    """
    monkeypatch.setattr(
        "geolocation.views.get_geolocation_data", fake_get_geolocation_data_success
    )
    client = APIClient()
    url = reverse("geodata-create")
    payload = {"ip_or_url": "1.1.1.1", "type": "ip"}
    response = client.post(url, payload, format="json")
    assert response.status_code == 201, response.data
    data = response.data

    assert data["status"] == "SUCCESS"
    assert data["country_name"] == "Testland"
    assert data["latitude"] == 12.34
    assert data["longitude"] == 56.78


@pytest.mark.django_db
def test_create_geodata_failure_response(monkeypatch):
    """
    Test that when the service returns a JSON response with "success": false,
    the GeoData record is updated with the error details and status remains "FAILED".
    """
    monkeypatch.setattr(
        "geolocation.views.get_geolocation_data", fake_get_geolocation_data_failure
    )
    client = APIClient()
    url = reverse("geodata-create")
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
def test_create_geodata_exception(monkeypatch):
    """
    Test that when the service raises an exception,
    the GeoData record is updated with the error message and status is "FAILED".
    """
    monkeypatch.setattr(
        "geolocation.views.get_geolocation_data", fake_get_geolocation_data_exception
    )
    client = APIClient()
    url = reverse("geodata-create")
    payload = {"ip_or_url": "1.1.1.1", "type": "ip"}
    response = client.post(url, payload, format="json")
    assert response.status_code == 201, response.data
    data = response.data

    assert data["status"] == "FAILED"
    assert data["raw_response"].get("error") == "Network Error"


@pytest.mark.django_db
def test_database_unavailable(monkeypatch):
    """
    Test that when serializer.save() fails due to a database error,
    the view raises a DatabaseUnavailableException resulting in a 503 response.
    """
    monkeypatch.setattr(
        "geolocation.serializers.GeoDataSerializer.save",
        fake_save_raise_operational_error,
    )

    client = APIClient()
    url = reverse("geodata-create")
    payload = {"ip_or_url": "1.1.1.1", "type": "ip"}
    response = client.post(url, payload, format="json")
    assert response.status_code == 503, response.data
    data = response.data
    assert "The database is unavailable" in data.get("detail", "")
