from django.contrib.auth import authenticate
from django.db.models import Sum, Q
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime, timedelta

from .models import (ParkingSlot, ParkingRecord, Vehicle, User, Payment, ParkingLot,
                     Reservation, PricingConfig, ParkingStaff)
from .serializers import (ParkingSlotSerializer, ParkingRecordSerializer, VehicleSerializer,
                          RegisterSerializer, UserSerializer, ReservationSerializer, 
                          PaymentSerializer, ParkingLotSerializer, PricingConfigSerializer,
                          ParkingStaffSerializer)


# ===== PERMISSIONS =====
def is_customer(user):
    return user.role == 'customer'

def is_business_user(user):
    return user.role == 'businessuser'

def is_admin(user):
    return user.is_staff or user.role == 'admin'


# ===== HOME =====
def home(request):
    return HttpResponse("Welcome to SmartCity Parking Management API")


# ===== AUTH =====
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "message": "User created successfully",
            "user": {"id": user.id, "username": user.username, "role": user.role}
        }, status=201)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({"error": "Username and password required"}, status=400)
    
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role
            }
        }, status=200)
    return Response({"error": "Invalid credentials"}, status=401)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


# ===== VEHICLE - CUSTOMER =====
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_vehicles(request):
    """Khách xem xe của mình"""
    if not is_customer(request.user):
        return Response({"error": "Permission denied"}, status=403)
    
    vehicles = Vehicle.objects.filter(user=request.user)
    serializer = VehicleSerializer(vehicles, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_vehicle(request):
    """Khách thêm xe mới"""
    if not is_customer(request.user):
        return Response({"error": "Permission denied"}, status=403)
    
    plate_number = request.data.get('plate_number')
    if not plate_number:
        return Response({"error": "Plate number required"}, status=400)
    
    if Vehicle.objects.filter(plate_number=plate_number).exists():
        return Response({"error": "Plate number already registered"}, status=400)
    
    vehicle = Vehicle.objects.create(
        user=request.user,
        plate_number=plate_number,
        vehicle_type=request.data.get('vehicle_type', 'car'),
        brand=request.data.get('brand', ''),
        color=request.data.get('color', '')
    )
    serializer = VehicleSerializer(vehicle)
    return Response(serializer.data, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_vehicle(request, pk):
    """Khách xóa xe"""
    if not is_customer(request.user):
        return Response({"error": "Permission denied"}, status=403)
    
    try:
        vehicle = Vehicle.objects.get(pk=pk, user=request.user)
        vehicle.delete()
        return Response({"message": "Vehicle deleted"})
    except Vehicle.DoesNotExist:
        return Response({"error": "Vehicle not found"}, status=404)


# ===== PARKING LOT - CUSTOMER =====
@api_view(['GET'])
@permission_classes([AllowAny])
def list_lots(request):
    """Khách xem danh sách bãi"""
    lots = ParkingLot.objects.filter(is_active=True)
    serializer = ParkingLotSerializer(lots, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def lot_detail(request, pk):
    """Khách xem chi tiết bãi"""
    try:
        lot = ParkingLot.objects.get(pk=pk, is_active=True)
        serializer = ParkingLotSerializer(lot)
        return Response(serializer.data)
    except ParkingLot.DoesNotExist:
        return Response({"error": "Parking lot not found"}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def available_slots(request, lot_id):
    """Khách xem chỗ trống theo bãi"""
    try:
        lot = ParkingLot.objects.get(pk=lot_id)
        slots = lot.slots.filter(status='empty')
        serializer = ParkingSlotSerializer(slots, many=True)
        return Response({
            "parking_lot": lot.name,
            "total_available": slots.count(),
            "slots": serializer.data
        })
    except ParkingLot.DoesNotExist:
        return Response({"error": "Parking lot not found"}, status=404)


# ===== RESERVATION - CUSTOMER =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_reservation(request):
    """Khách đặt chỗ"""
    if not is_customer(request.user):
        return Response({"error": "Permission denied"}, status=403)
    
    try:
        vehicle_id = request.data.get('vehicle_id')
        lot_id = request.data.get('parking_lot_id')
        reserved_from = request.data.get('reserved_from')
        reserved_to = request.data.get('reserved_to')
        
        # Kiểm tra dữ liệu
        if not all([vehicle_id, lot_id, reserved_from, reserved_to]):
            return Response({"error": "Missing required fields"}, status=400)
        
        vehicle = Vehicle.objects.get(pk=vehicle_id, user=request.user)
        lot = ParkingLot.objects.get(pk=lot_id)
        
        # Kiểm tra chỗ trống
        available_slot = lot.slots.filter(status='empty').first()
        if not available_slot:
            return Response({"error": "No available slots"}, status=400)
        
        # Tính tiền
        from_dt = datetime.fromisoformat(reserved_from)
        to_dt = datetime.fromisoformat(reserved_to)
        duration_hours = (to_dt - from_dt).total_seconds() / 3600
        duration_hours = max(duration_hours, 1)
        
        pricing = lot.pricing
        estimated_fee = float(duration_hours) * float(pricing.rate_per_hour)
        estimated_fee = max(estimated_fee, float(pricing.minimum_fee))
        
        # Tạo reservation
        reservation = Reservation.objects.create(
            user=request.user,
            vehicle=vehicle,
            parking_lot=lot,
            slot=available_slot,
            reserved_from=from_dt,
            reserved_to=to_dt,
            estimated_fee=estimated_fee,
            status='pending',
            payment_status='unpaid'
        )
        
        serializer = ReservationSerializer(reservation)
        return Response(serializer.data, status=201)
        
    except Vehicle.DoesNotExist:
        return Response({"error": "Vehicle not found"}, status=404)
    except ParkingLot.DoesNotExist:
        return Response({"error": "Parking lot not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_reservations(request):
    """Khách xem đặt chỗ của mình"""
    if not is_customer(request.user):
        return Response({"error": "Permission denied"}, status=403)
    
    reservations = Reservation.objects.filter(user=request.user).order_by('-created_at')
    serializer = ReservationSerializer(reservations, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_reservation(request, pk):
    """Khách hủy đặt chỗ"""
    if not is_customer(request.user):
        return Response({"error": "Permission denied"}, status=403)
    
    try:
        reservation = Reservation.objects.get(pk=pk, user=request.user)
        if reservation.status == 'checked_in':
            return Response({"error": "Cannot cancel checked-in reservation"}, status=400)
        
        reservation.status = 'cancelled'
        reservation.save()
        
        # Giải phóng slot
        if reservation.slot:
            reservation.slot.status = 'empty'
            reservation.slot.save()
        
        return Response({"message": "Reservation cancelled"})
    except Reservation.DoesNotExist:
        return Response({"error": "Reservation not found"}, status=404)


# ===== CHECK-IN/OUT - CUSTOMER & STAFF =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_in(request):
    """Khách check-in (QR hoặc manual)"""
    try:
        qr_code = request.data.get('qr_code')
        vehicle_id = request.data.get('vehicle_id')
        lot_id = request.data.get('parking_lot_id')
        
        # Tìm reservation từ QR hoặc manual
        if qr_code:
            reservation = Reservation.objects.get(qr_code=qr_code, status='confirmed')
        else:
            if not all([vehicle_id, lot_id]):
                return Response({"error": "QR code or vehicle/lot required"}, status=400)
            vehicle = Vehicle.objects.get(pk=vehicle_id)
            lot = ParkingLot.objects.get(pk=lot_id)
            reservation = Reservation.objects.get(
                vehicle=vehicle, 
                parking_lot=lot, 
                status='confirmed'
            )
        
        # Tạo parking record
        record = ParkingRecord.objects.create(
            vehicle=reservation.vehicle,
            reservation=reservation,
            slot=reservation.slot,
            parking_lot=reservation.parking_lot,
            entry_time=timezone.now(),
            entry_by=request.user if is_business_user(request.user) else None
        )
        
        # Cập nhật slot
        if reservation.slot:
            reservation.slot.status = 'occupied'
            reservation.slot.save()
        
        # Cập nhật reservation
        reservation.status = 'checked_in'
        reservation.save()
        
        return Response({
            "message": "Check-in successful",
            "record_id": record.id,
            "parking_lot": reservation.parking_lot.name
        })
        
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_out(request):
    """Khách check-out"""
    try:
        record_id = request.data.get('record_id')
        
        record = ParkingRecord.objects.get(pk=record_id, status='in_progress')
        record.exit_time = timezone.now()
        record.exit_by = request.user if is_business_user(request.user) else None
        
        # Tính tiền
        fee = record.calculate_fee()
        record.status = 'completed'
        record.save()
        
        # Giải phóng slot
        if record.slot:
            record.slot.status = 'empty'
            record.slot.save()
        
        return Response({
            "message": "Check-out successful",
            "fee": str(fee),
            "duration_hours": record.duration_hours
        })
        
    except ParkingRecord.DoesNotExist:
        return Response({"error": "Record not found or already checked out"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ===== PARKING RECORD - CUSTOMER & STAFF =====
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_parking_history(request):
    """Khách xem lịch sử gửi xe"""
    if not is_customer(request.user):
        return Response({"error": "Permission denied"}, status=403)
    
    records = ParkingRecord.objects.filter(
        vehicle__user=request.user,
        status='completed'
    ).order_by('-exit_time')
    serializer = ParkingRecordSerializer(records, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def active_parking(request):
    """Khách xem xe đang gửi"""
    if not is_customer(request.user):
        return Response({"error": "Permission denied"}, status=403)
    
    records = ParkingRecord.objects.filter(
        vehicle__user=request.user,
        status='in_progress'
    )
    serializer = ParkingRecordSerializer(records, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def active_records(request):
    """STAFF xem xe đang gửi"""
    if not is_business_user(request.user):
        return Response({"error": "Permission denied"}, status=403)
    
    records = ParkingRecord.objects.filter(status='in_progress')
    serializer = ParkingRecordSerializer(records, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def record_detail(request, pk):
    """Chi tiết lịch sử gửi xe"""
    record = ParkingRecord.objects.get(pk=pk)
    
    # Kiểm tra quyền
    if not (is_admin(request.user) or 
            (is_customer(request.user) and record.vehicle.user == request.user) or
            (is_business_user(request.user) and record.parking_lot.owner == request.user)):
        return Response({"error": "Permission denied"}, status=403)
    
    serializer = ParkingRecordSerializer(record)
    return Response(serializer.data)


# ===== PAYMENT - CUSTOMER =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def make_payment(request):
    """Khách thanh toán (tạm thời chỉ tiền mặt)"""
    if not is_customer(request.user):
        return Response({"error": "Permission denied"}, status=403)
    
    try:
        reservation_id = request.data.get('reservation_id')
        method = 'cash'  # Tạm thời chỉ cho thanh toán bằng tiền mặt
        
        reservation = Reservation.objects.get(pk=reservation_id, user=request.user)
        
        # Tạo payment
        payment = Payment.objects.create(
            reservation=reservation,
            amount=reservation.estimated_fee,
            method=method,
            status='pending'
        )
        
        # Đánh dấu thanh toán hoàn tất
        payment.mark_completed()
        
        # Xác nhận reservation
        reservation.status = 'confirmed'
        reservation.save()
        
        serializer = PaymentSerializer(payment)
        return Response(serializer.data, status=201)
        
    except Reservation.DoesNotExist:
        return Response({"error": "Reservation not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_payments(request):
    """Khách xem lịch sử thanh toán"""
    if not is_customer(request.user):
        return Response({"error": "Permission denied"}, status=403)
    
    payments = Payment.objects.filter(
        Q(reservation__user=request.user) | 
        Q(parking_record__vehicle__user=request.user)
    ).order_by('-created_at')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


# ===== PARKING LOT - BUSINESS USER & ADMIN =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_lot(request):
    """BUSINESS USER tạo bãi"""
    if not is_business_user(request.user):
        return Response({"error": "Permission denied"}, status=403)
    
    name = request.data.get('name')
    location = request.data.get('location')
    total_slots = request.data.get('total_slots', 0)
    
    if not all([name, location]):
        return Response({"error": "Name and location required"}, status=400)
    
    lot = ParkingLot.objects.create(
        name=name,
        location=location,
        address=request.data.get('address', ''),
        owner=request.user,
        total_slots=total_slots,
        latitude=request.data.get('latitude'),
        longitude=request.data.get('longitude')
    )
    
    # Tạo pricing config
    PricingConfig.objects.create(parking_lot=lot)
    
    serializer = ParkingLotSerializer(lot)
    return Response(serializer.data, status=201)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_lot(request, pk):
    """BUSINESS USER & ADMIN cập nhật bãi"""
    try:
        lot = ParkingLot.objects.get(pk=pk)
        
        # Kiểm tra quyền
        if not (is_admin(request.user) or lot.owner == request.user):
            return Response({"error": "Permission denied"}, status=403)
        
        lot.name = request.data.get('name', lot.name)
        lot.location = request.data.get('location', lot.location)
        lot.address = request.data.get('address', lot.address)
        lot.total_slots = request.data.get('total_slots', lot.total_slots)
        if request.data.get('latitude'):
            lot.latitude = request.data.get('latitude')
        if request.data.get('longitude'):
            lot.longitude = request.data.get('longitude')
        lot.save()
        
        serializer = ParkingLotSerializer(lot)
        return Response(serializer.data)
        
    except ParkingLot.DoesNotExist:
        return Response({"error": "Parking lot not found"}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_lot(request, pk):
    """ADMIN xóa bãi"""
    if not is_admin(request.user):
        return Response({"error": "Permission denied"}, status=403)
    
    try:
        lot = ParkingLot.objects.get(pk=pk)
        lot.delete()
        return Response({"message": "Parking lot deleted"})
    except ParkingLot.DoesNotExist:
        return Response({"error": "Parking lot not found"}, status=404)


# ===== SLOT =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_slots(request):
    """BUSINESS USER & ADMIN tạo slot"""
    if not (is_business_user(request.user) or is_admin(request.user)):
        return Response({"error": "Permission denied"}, status=403)
    
    try:
        lot_id = request.data.get('parking_lot_id')
        lot = ParkingLot.objects.get(pk=lot_id)
        
        # Kiểm tra quyền
        if not (is_admin(request.user) or lot.owner == request.user):
            return Response({"error": "Permission denied"}, status=403)
        
        count = request.data.get('count', 1)
        start_number = request.data.get('start_number', 1)
        
        slots = []
        for i in range(count):
            slot = ParkingSlot.objects.create(
                parking_lot=lot,
                slot_number=f"A{start_number + i}",
                slot_type=request.data.get('slot_type', 'standard')
            )
            slots.append(slot)
        
        serializer = ParkingSlotSerializer(slots, many=True)
        return Response(serializer.data, status=201)
        
    except ParkingLot.DoesNotExist:
        return Response({"error": "Parking lot not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ===== PRICING =====
@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def manage_pricing(request, lot_id):
    """BUSINESS USER & ADMIN quản lý giá"""
    try:
        lot = ParkingLot.objects.get(pk=lot_id)
        
        # Kiểm tra quyền
        if not (is_admin(request.user) or lot.owner == request.user):
            return Response({"error": "Permission denied"}, status=403)
        
        pricing = lot.pricing
        
        if request.method == 'GET':
            serializer = PricingConfigSerializer(pricing)
            return Response(serializer.data)
        
        # PUT
        pricing.rate_per_hour = request.data.get('rate_per_hour', pricing.rate_per_hour)
        pricing.minimum_fee = request.data.get('minimum_fee', pricing.minimum_fee)
        pricing.daily_max_fee = request.data.get('daily_max_fee', pricing.daily_max_fee)
        pricing.peak_hours_start = request.data.get('peak_hours_start', pricing.peak_hours_start)
        pricing.peak_hours_end = request.data.get('peak_hours_end', pricing.peak_hours_end)
        pricing.peak_rate_multiplier = request.data.get('peak_rate_multiplier', pricing.peak_rate_multiplier)
        pricing.save()
        
        serializer = PricingConfigSerializer(pricing)
        return Response(serializer.data)
        
    except ParkingLot.DoesNotExist:
        return Response({"error": "Parking lot not found"}, status=404)


# ===== STAFF MANAGEMENT - ADMIN =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_staff(request):
    """ADMIN gán nhân viên cho bãi"""
    if not is_admin(request.user):
        return Response({"error": "Permission denied"}, status=403)
    
    try:
        user_id = request.data.get('user_id')
        lot_id = request.data.get('parking_lot_id')
        
        user = User.objects.get(pk=user_id, role='businessuser')
        lot = ParkingLot.objects.get(pk=lot_id)
        
        staff, created = ParkingStaff.objects.get_or_create(
            user=user,
            parking_lot=lot,
            defaults={'position': request.data.get('position', '')}
        )
        
        serializer = ParkingStaffSerializer(staff)
        return Response(serializer.data, status=201 if created else 200)
        
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lot_staff(request, lot_id):
    """ADMIN & BUSINESS USER xem nhân viên bãi"""
    try:
        lot = ParkingLot.objects.get(pk=lot_id)
        
        if not (is_admin(request.user) or lot.owner == request.user):
            return Response({"error": "Permission denied"}, status=403)
        
        staff = ParkingStaff.objects.filter(parking_lot=lot)
        serializer = ParkingStaffSerializer(staff, many=True)
        return Response(serializer.data)
        
    except ParkingLot.DoesNotExist:
        return Response({"error": "Parking lot not found"}, status=404)


# ===== STATISTICS =====
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def lot_statistics(request, lot_id):
    """Thống kê bãi"""
    try:
        lot = ParkingLot.objects.get(pk=lot_id)
        
        # Kiểm tra quyền
        if not (is_admin(request.user) or lot.owner == request.user):
            return Response({"error": "Permission denied"}, status=403)
        
        # Thống kê hôm nay
        today = timezone.now().date()
        today_records = lot.parking_records.filter(entry_time__date=today)
        today_completed = today_records.filter(status='completed')
        today_revenue = today_completed.aggregate(Sum('fee'))['fee__sum'] or 0
        
        # Thống kê tổng quát
        total_capacity = lot.total_slots
        available_now = lot.get_available_slots_count()
        occupied_now = lot.get_occupied_slots_count()
        
        return Response({
            "parking_lot": lot.name,
            "capacity": total_capacity,
            "available_now": available_now,
            "occupied_now": occupied_now,
            "today_vehicles": today_records.count(),
            "today_completed": today_completed.count(),
            "today_revenue": float(today_revenue)
        })
        
    except ParkingLot.DoesNotExist:
        return Response({"error": "Parking lot not found"}, status=404)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stats_date_range(request):
    """Thống kê theo khoảng ngày"""
    try:
        from_date = request.GET.get('from_date')
        to_date = request.GET.get('to_date')
        lot_id = request.GET.get('lot_id')
        
        if lot_id:
            lot = ParkingLot.objects.get(pk=lot_id)
            if not (is_admin(request.user) or lot.owner == request.user):
                return Response({"error": "Permission denied"}, status=403)
            
            records = lot.parking_records.filter(status='completed')
        else:
            if not is_admin(request.user):
                return Response({"error": "Permission denied"}, status=403)
            records = ParkingRecord.objects.filter(status='completed')
        
        if from_date:
            records = records.filter(exit_time__gte=from_date)
        if to_date:
            records = records.filter(exit_time__lte=to_date)
        
        revenue = records.aggregate(Sum('fee'))['fee__sum'] or 0
        
        return Response({
            "total_vehicles": records.count(),
            "total_revenue": float(revenue),
            "average_fee": float(revenue) / records.count() if records.count() > 0 else 0,
            "from_date": from_date,
            "to_date": to_date
        })
        
    except Exception as e:
        return Response({"error": str(e)}, status=400)