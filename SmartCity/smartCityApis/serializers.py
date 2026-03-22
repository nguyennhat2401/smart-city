from rest_framework import serializers
from .models import ParkingSlot, ParkingRecord
from django.contrib.auth.models import User


class ParkingSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParkingSlot
        fields = '__all__'


class ParkingRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParkingRecord
        fields = '__all__'

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password')

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user

