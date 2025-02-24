import pytest  # type: ignore
from geolocation.models import GeoData


@pytest.mark.django_db
def test_geo_data_str():
    instance = GeoData.objects.create(ip_or_url="127.0.0.1")
    assert str(instance) == "127.0.0.1"


@pytest.mark.django_db
def test_geo_data_ip_or_url_required():
    instance = GeoData()
    with pytest.raises(Exception):
        instance.full_clean()
