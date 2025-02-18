from rest_framework.serializers import ModelSerializer  # type: ignore
from .models import GeoData


class GeoDataSerializer(ModelSerializer):
    class Meta:
        model = GeoData
        fields = "__all__"
        extra_kwargs = {
            "type": {"read_only": True},
            "country_name": {"read_only": True},
            "latitude": {"read_only": True},
            "longitude": {"read_only": True},
            "country_flag_emoji_unicode": {"read_only": True},
            "raw_response": {"read_only": True},
            "status": {"read_only": True},
            "created_at": {"read_only": True},
            "updated_at": {"read_only": True},
        }
