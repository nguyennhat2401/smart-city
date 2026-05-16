from rest_framework import serializers
from .models import (User, Vehicle, ParkingSlot, ParkingRecord, ParkingLot, 
                     Reservation, Payment, PricingConfig, ParkingStaff, MonthlyPass)


# ===== REGISTER / USER =====
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'password', 'role',
            'email', 'first_name', 'last_name',
            'phone', 'address'
        )

    def create(self, validated_data):
        password = validated_data.pop('password')

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user


# ===== USER SERIALIZER (ADMIN dùng) =====
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'role',
            'email', 'first_name', 'last_name',
            'phone', 'address',
            'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_login',
            'created_at', 'updated_at'
        )

class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'email', 'first_name', 'last_name',
            'phone', 'address'
        )

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
    user_name = serializers.SerializerMethodField()
    vehicle_plate = serializers.SerializerMethodField()
    vehicle_type = serializers.SerializerMethodField()
    lot_name = serializers.SerializerMethodField()
    slot_number = serializers.SerializerMethodField()

    def get_user_name(self, obj):
        return obj.user.username if obj.user else None

    def get_vehicle_plate(self, obj):
        return obj.vehicle.plate_number if obj.vehicle else None

    def get_vehicle_type(self, obj):
        return obj.vehicle.vehicle_type if obj.vehicle else None

    def get_lot_name(self, obj):
        return obj.parking_lot.name if obj.parking_lot else None

    def get_slot_number(self, obj):
        return obj.slot.slot_number if obj.slot else None

    class Meta:
        model = Reservation
        fields = '__all__'


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

# ===== MONTHLYPASS =====

class MonthlyPassSerializer(serializers.ModelSerializer):
    plate_number = serializers.CharField(source='vehicle.plate_number', read_only=True)
    lot_name = serializers.CharField(source='parking_lot.name', read_only=True)
    vehicle_type = serializers.CharField(source='vehicle.vehicle_type', read_only=True)

    class Meta:
        model = MonthlyPass
        fields = '__all__'