import pytest
from smartCityApis.serializers import RegisterSerializer
from smartCityApis.models import User

@pytest.mark.django_db
class TestSerializersValidation:
    def test_register_serializer_valid(self):
        data = {
            'username': 'newuser',
            'password': 'strongpassword123',
            'email': 'newuser@example.com',
            'role': 'customer'
        }
        serializer = RegisterSerializer(data=data)
        assert serializer.is_valid()
        user = serializer.save()
        assert user.username == 'newuser'
        assert user.check_password('strongpassword123')
        assert user.role == 'customer'

    def test_register_serializer_missing_fields(self):
        data = {
            'username': 'baduser'
            # missing password
        }
        serializer = RegisterSerializer(data=data)
        assert not serializer.is_valid()
        assert 'password' in serializer.errors
