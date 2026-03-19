from rest_framework import serializers
from .models import User, Vehicle, ParkingSlot, ParkingRecord, ParkingLot


# ===== REGISTER / USER =====
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'password', 'role')

    def create(self, validated_data):
        role = validated_data.get('role', 'customer')

        user = User(
            username=validated_data['username'],
            role=role
        )
        user.set_password(validated_data['password'])  # QUAN TRỌNG
        user.save()
        return user


# ===== USER SERIALIZER (ADMIN dùng) =====
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'role')


# ===== VEHICLE =====
class VehicleSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Vehicle
        fields = ('id', 'plate_number', 'vehicle_type', 'user', 'username')
        read_only_fields = ('user',)


# ===== PARKING LOT =====
class ParkingLotSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = ParkingLot
        fields = ('id', 'name', 'location', 'owner', 'owner_name')
        read_only_fields = ('owner',)


# ===== PARKING SLOT =====
class ParkingSlotSerializer(serializers.ModelSerializer):
    parking_lot_name = serializers.CharField(source='parking_lot.name', read_only=True)

    class Meta:
        model = ParkingSlot
        fields = ('id', 'slot_number', 'status', 'parking_lot', 'parking_lot_name')


# ===== PARKING RECORD =====
class ParkingRecordSerializer(serializers.ModelSerializer):
    plate_number = serializers.CharField(source='vehicle.plate_number', read_only=True)
    slot_number = serializers.CharField(source='slot.slot_number', read_only=True)
    username = serializers.CharField(source='vehicle.user.username', read_only=True)

    class Meta:
        model = ParkingRecord
        fields = (
            'id',
            'vehicle',
            'plate_number',
            'username',
            'slot',
            'slot_number',
            'entry_time',
            'exit_time',
            'fee'
        )


# ===== PAYMENT =====
class PaymentSerializer(serializers.ModelSerializer):
    plate_number = serializers.CharField(source='record.vehicle.plate_number', read_only=True)

    class Meta:
        model = ParkingRecord  # ⚠ sẽ sửa bên dưới
        fields = ('id', 'plate_number', 'fee')