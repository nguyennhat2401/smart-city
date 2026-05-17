import pytest
from unittest.mock import patch, MagicMock
from smartCityApis.views import login
from rest_framework.test import APIRequestFactory

@pytest.mark.django_db
class TestMockingExample:
    def test_login_with_mock_authenticate(self):
        factory = APIRequestFactory()
        # Mocking the 'authenticate' function used in views.py
        with patch('smartCityApis.views.authenticate') as mock_auth:
            # Create a mock user
            mock_user = MagicMock()
            mock_user.username = 'mockuser'
            mock_user.role = 'customer'
            mock_user.id = 1
            
            # Configure the mock to return our mock user
            mock_auth.return_value = mock_user
            
            # Prepare request
            request = factory.post('/api/login/', {'username': 'mockuser', 'password': 'password'}, format='json')
            
            # Call the view
            response = login(request)
            
            # Assertions
            assert response.status_code == 200
            assert 'access' in response.data
            assert response.data['user']['username'] == 'mockuser'
            
            # Verify the mock was called correctly
            mock_auth.assert_called_once_with(username='mockuser', password='password')

    def test_login_failed_with_mock(self):
        factory = APIRequestFactory()
        with patch('smartCityApis.views.authenticate') as mock_auth:
            # Configure mock to return None (authentication failed)
            mock_auth.return_value = None
            
            request = factory.post('/api/login/', {'username': 'wrong', 'password': 'wrong'}, format='json')
            response = login(request)
            
            assert response.status_code == 401
            assert response.data['error'] == 'Invalid credentials'
