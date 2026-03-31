from rest_framework import serializers
from .models import (User, Vehicle, ParkingSlot, ParkingRecord, ParkingLot, 
                     Reservation, Payment, PricingConfig, ParkingStaff)


# ===== REGISTER / USER =====
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'phone')

    def create(self, validated_data):
        role = validated_data.get('role', 'customer')

        user = User(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            phone=validated_data.get('phone', ''),
            role=role
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


# ===== USER SERIALIZER (ADMIN dùng) =====
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone', 'is_active', 'created_at')
        read_only_fields = ('created_at',)


# ===== VEHICLE =====
class VehicleSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Vehicle
        fields = ('id', 'plate_number', 'vehicle_type', 'brand', 'color', 'user', 'username', 'is_active', 'created_at')
        read_only_fields = ('user', 'created_at')


# ===== PARKING LOT =====
class ParkingLotSerializer(serializers.ModelSerializer):
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    available_slots = serializers.SerializerMethodField()
    occupied_slots = serializers.SerializerMethodField()

    class Meta:
        model = ParkingLot
        fields = ('id', 'name', 'location', 'address', 'owner', 'owner_name', 'total_slots', 
                  'available_slots', 'occupied_slots', 'latitude', 'longitude', 'is_active', 'created_at')
        read_only_fields = ('owner', 'created_at')

    def get_available_slots(self, obj):
        return obj.get_available_slots_count()

    def get_occupied_slots(self, obj):
        return obj.get_occupied_slots_count()


# ===== PRICING CONFIG =====
class PricingConfigSerializer(serializers.ModelSerializer):
    parking_lot_name = serializers.CharField(source='parking_lot.name', read_only=True)

    class Meta:
        model = PricingConfig
        fields = ('id', 'parking_lot', 'parking_lot_name', 'rate_per_hour', 'minimum_fee', 
                  'daily_max_fee', 'peak_hours_start', 'peak_hours_end', 'peak_rate_multiplier')


# ===== PARKING SLOT =====
class ParkingSlotSerializer(serializers.ModelSerializer):
    parking_lot_name = serializers.CharField(source='parking_lot.name', read_only=True)

    class Meta:
        model = ParkingSlot
        fields = ('id', 'parking_lot', 'parking_lot_name', 'slot_number', 'slot_type', 
                  'status', 'qr_code', 'created_at')
        read_only_fields = ('qr_code', 'created_at')


# ===== RESERVATION =====
class ReservationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    vehicle_plate = serializers.CharField(source='vehicle.plate_number', read_only=True)
    lot_name = serializers.CharField(source='parking_lot.name', read_only=True)
    slot_number = serializers.CharField(source='slot.slot_number', read_only=True, allow_null=True)

    class Meta:
        model = Reservation
        fields = ('id', 'user', 'user_name', 'vehicle', 'vehicle_plate', 'parking_lot', 
                  'lot_name', 'slot', 'slot_number', 'reserved_from', 'reserved_to', 
                  'status', 'payment_status', 'estimated_fee', 'qr_code', 
                  'confirmed_by', 'confirmed_at', 'created_at')
        read_only_fields = ('user', 'qr_code', 'created_at')


# ===== PARKING RECORD =====
class ParkingRecordSerializer(serializers.ModelSerializer):
    plate_number = serializers.CharField(source='vehicle.plate_number', read_only=True, allow_null=True)
    slot_number = serializers.CharField(source='slot.slot_number', read_only=True, allow_null=True)
    username = serializers.CharField(source='vehicle.user.username', read_only=True, allow_null=True)
    lot_name = serializers.CharField(source='parking_lot.name', read_only=True)

    class Meta:
        model = ParkingRecord
        fields = ('id', 'vehicle', 'plate_number', 'username', 'slot', 'slot_number', 
                  'parking_lot', 'lot_name', 'entry_time', 'exit_time', 'duration_hours', 
                  'fee', 'status', 'created_at')
        read_only_fields = ('duration_hours', 'fee', 'created_at')


# ===== PAYMENT =====
class PaymentSerializer(serializers.ModelSerializer):
    reservation_id = serializers.CharField(source='reservation.id', read_only=True, allow_null=True)
    record_id = serializers.CharField(source='parking_record.id', read_only=True, allow_null=True)

    class Meta:
        model = Payment
        fields = ('id', 'reservation', 'reservation_id', 'parking_record', 'record_id', 
                  'amount', 'method', 'status', 'transaction_id', 'payment_time', 'created_at')
        read_only_fields = ('transaction_id', 'payment_time', 'created_at')


# ===== PARKING STAFF =====
class ParkingStaffSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True)
    lot_name = serializers.CharField(source='parking_lot.name', read_only=True)

    class Meta:
        model = ParkingStaff
        fields = ('id', 'user', 'user_name', 'parking_lot', 'lot_name', 'position', 'is_active', 'created_at')
        read_only_fields = ('created_at',)