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
                     Reservation, PricingConfig, ParkingStaff,MonthlyPass)
from .serializers import (ParkingSlotSerializer, ParkingRecordSerializer, VehicleSerializer,
                          RegisterSerializer, UserSerializer, ReservationSerializer, 
                          PaymentSerializer, ParkingLotSerializer, PricingConfigSerializer,
                          ParkingStaffSerializer,UpdateProfileSerializer, MonthlyPassSerializer)


# ===== PERMISSIONS =====
def is_customer(user):
    return user.role == 'customer'

def is_business_user(user):
    return user.role in ['businessuser', 'staff'] or is_admin(user)
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


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):

    if request.method == 'GET':
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    if request.method == 'PUT':
        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


# ===== VEHICLE - CUSTOMER =====
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_vehicles(request):
    """Khách xem xe của mình"""
    # if not is_customer(request.user):
    #     return Response({"error": "Permission denied"}, status=403)
    
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
    "price_per_hour": lot.pricing.rate_per_hour,
    "minimum_fee": lot.pricing.minimum_fee,
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

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Reservation, ParkingStaff
from .serializers import ReservationSerializer


def is_staff_user(user):
    return user.role == "staff"


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import ParkingStaff, Reservation
from .serializers import ReservationSerializer
import traceback


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def staff_reservations(request):
    try:
        print("===== DEBUG START =====")
        print("USER:", request.user)
        print("AUTH:", request.auth)

        # CHECK USER
        if not request.user.is_authenticated:
            return Response({"error": "Chưa đăng nhập"}, status=401)

        # LẤY STAFF
        staff = ParkingStaff.objects.filter(user=request.user).first()
        print("STAFF:", staff)

        if not staff:
            return Response({"error": "Không tìm thấy staff"}, status=400)

        print("PARKING LOT:", staff.parking_lot)

        # QUERY RESERVATION
        reservations = Reservation.objects.filter(
            parking_lot=staff.parking_lot
        )

        print("RESERVATIONS COUNT:", reservations.count())

        # SERIALIZE
        serializer = ReservationSerializer(reservations, many=True)

        print("===== SUCCESS =====")
        return Response(serializer.data)

    except Exception as e:
        print("===== ERROR =====")
        print(str(e))
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_reservation_status(request, pk):
    if request.user.role != "staff":
        return Response({"error": "Permission denied"}, status=403)

    try:
        reservation = Reservation.objects.get(id=pk)
    except Reservation.DoesNotExist:
        return Response({"error": "Reservation not found"}, status=404)

    # Kiểm tra staff thuộc đúng bãi
    staff = ParkingStaff.objects.filter(
        user=request.user,
        parking_lot=reservation.parking_lot,
        is_active=True
    ).first()

    if not staff:
        return Response({"error": "Bạn không thuộc bãi này"}, status=403)

    new_status = request.data.get("status")

    if new_status not in ["confirmed", "cancelled"]:
        return Response({"error": "Status không hợp lệ"}, status=400)

    reservation.status = new_status

    # ✅ FIX QUAN TRỌNG
    if new_status == "confirmed":
        reservation.confirmed_by = request.user
        reservation.confirmed_at = timezone.now()

        # set slot thành reserved
        if reservation.slot:
            reservation.slot.status = "reserved"
            reservation.slot.save()

    reservation.save()

    return Response({
        "message": f"Cập nhật thành công -> {new_status}"
    })
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_staff_info(request):
    """Staff xem mình thuộc bãi nào"""
    if request.user.role != 'staff':
        return Response({"error": "Permission denied"}, status=403)

    try:
        staff = ParkingStaff.objects.get(user=request.user, is_active=True)
        serializer = ParkingStaffSerializer(staff)
        return Response(serializer.data)
    except ParkingStaff.DoesNotExist:
        return Response({"error": "Bạn chưa được phân công bãi xe"}, status=404)
# ===== CHECK-IN/OUT - CUSTOMER & STAFF =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_in(request):
    """Nhân viên check-in (scan QR từ khách hoặc vé tháng)"""
    try:
        vehicle_id = request.data.get('vehicle_id')
        lot_id = request.data.get('parking_lot_id')

        # ===== VALIDATE =====
        if not vehicle_id or not lot_id:
            return Response(
                {"error": "vehicle_id and parking_lot_id are required"},
                status=400
            )

        # ===== CHECK ROLE =====
        if not is_business_user(request.user):
            return Response({"error": "Permission denied"}, status=403)

        # ===== GET OBJECT =====
        try:
            vehicle = Vehicle.objects.get(pk=vehicle_id)
        except Vehicle.DoesNotExist:
            return Response({"error": "Vehicle not found"}, status=404)

        try:
            lot = ParkingLot.objects.get(pk=lot_id)
        except ParkingLot.DoesNotExist:
            return Response({"error": "Parking lot not found"}, status=404)

        now = timezone.now()

        # ===== CHECK ĐÃ CHECK-IN CHƯA =====
        active = ParkingRecord.objects.filter(
            vehicle=vehicle,
            status='in_progress'
        ).first()

        if active:
            return Response(
                {"error": "Vehicle already checked-in"},
                status=400
            )

        # ===== CHECK MONTHLY PASS =====
        monthly_pass = MonthlyPass.objects.filter(
            vehicle=vehicle,
            parking_lot=lot,
            status='active',
            start_date__lte=now,
            end_date__gte=now
        ).first()

        reservation = None

        # ===== NẾU KHÔNG CÓ VÉ THÁNG → CHECK RESERVATION =====
        if not monthly_pass:
            reservation = Reservation.objects.filter(
                vehicle=vehicle,
                parking_lot=lot,
                status='confirmed'
            ).first()

            if not reservation:
                return Response(
                    {"error": "No valid reservation or monthly pass"},
                    status=400
                )

        # ===== TÌM SLOT TRỐNG =====
        slot = ParkingSlot.objects.filter(
            parking_lot=lot,
            status='empty'
        ).first()

        if not slot:
            return Response(
                {"error": "No available slot"},
                status=400
            )

        # update slot
        slot.status = 'occupied'
        slot.save()

        # ===== CREATE RECORD =====
        record = ParkingRecord.objects.create(
            vehicle=vehicle,
            reservation=reservation if reservation else None,
            parking_lot=lot,
            slot=slot,
            entry_time=now,
            status='in_progress',
            entry_by=request.user
        )

        # ===== UPDATE RESERVATION =====
        if reservation:
            reservation.status = 'checked_in'
            reservation.save()

        return Response({
            "message": "Check-in successful",
            "type": "monthly_pass" if monthly_pass else "reservation",
            "record_id": record.id,
            "plate_number": vehicle.plate_number,
            "parking_lot": lot.name,
            "slot": slot.slot_number
        })

    except Exception as e:
        return Response({"error": str(e)}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_out(request):
    try:
        record_id = request.data.get('record_id')

        record = ParkingRecord.objects.get(pk=record_id, status='in_progress')
        record.exit_time = timezone.now()
        record.exit_by = request.user if is_business_user(request.user) else None

        # ===== CHECK VÉ THÁNG =====
        now = timezone.now()
        has_monthly_pass = MonthlyPass.objects.filter(
            vehicle=record.vehicle,
            parking_lot=record.parking_lot,
            status='active',
            start_date__lte=now,
            end_date__gte=now
        ).exists()

        # ===== TÍNH TIỀN =====
        if has_monthly_pass:
            fee = 0
            record.fee = 0
            record.duration_hours = 0
        else:
            fee = record.calculate_fee()

        record.status = 'completed'
        record.save()

        # ===== GIẢI PHÓNG SLOT =====
        if record.slot:
            record.slot.status = 'empty'
            record.slot.save()

        return Response({
            "message": "Check-out successful",
            "fee": str(fee),
            "duration_hours": record.duration_hours,
            "type": "monthly_pass" if has_monthly_pass else "normal"
        })

    except ParkingRecord.DoesNotExist:
        return Response({"error": "Record not found"}, status=404)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
        
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
    # if not is_business_user(request.user):
    #     return Response({"error": "Permission denied"}, status=403)
    
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
            (is_business_user(request.user) )):
        return Response({"error": "Permission denied"}, status=403)
    # and record.parking_lot.owner == request.user
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
    """Tạo bãi + auto tạo slot theo loại xe"""
    if not is_business_user(request.user):
        return Response({"error": "Permission denied"}, status=403)

    try:
        name = request.data.get('name')
        location = request.data.get('location')

        car_slots = int(request.data.get('car_slots', 0))
        motor_slots = int(request.data.get('motorbike_slots', 0))
        bike_slots = int(request.data.get('bike_slots', 0))

        total_slots = car_slots + motor_slots + bike_slots

        if not all([name, location]):
            return Response({"error": "Name and location required"}, status=400)

        # ===== CREATE LOT =====
        lot = ParkingLot.objects.create(
            name=name,
            location=location,
            address=request.data.get('address', ''),
            owner=request.user,
            total_slots=total_slots,
        )

        PricingConfig.objects.create(parking_lot=lot)

        # ===== AUTO CREATE SLOT =====
        def generate_slots(prefix_list, count, slot_type):
            slots = []
            index = 0

            for letter in prefix_list:
                for num in range(1, 100):  # dư cho nhiều slot
                    if index >= count:
                        break

                    slot = ParkingSlot.objects.create(
                        parking_lot=lot,
                        slot_number=f"{letter}{num}",
                        slot_type=slot_type
                    )
                    slots.append(slot)
                    index += 1

                if index >= count:
                    break
            return slots

        created = []
        created += generate_slots(['A', 'B'], car_slots, 'car')
        created += generate_slots(['C', 'D', 'G'], motor_slots, 'motorbike')
        created += generate_slots(['E', 'F'], bike_slots, 'bike')

        serializer = ParkingLotSerializer(lot)

        return Response({
            "lot": serializer.data,
            "slots_created": len(created)
        }, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=400)

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
        
        user = User.objects.get(pk=user_id, role='staff')
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

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_staff(request):
    """ADMIN xóa nhân viên khỏi bãi"""
    if not is_admin(request.user):
        return Response({"error": "Permission denied"}, status=403)

    try:
        user_id = request.data.get('user_id')
        lot_id = request.data.get('parking_lot_id')

        staff = ParkingStaff.objects.get(
            user__id=user_id,
            parking_lot__id=lot_id
        )

        staff.delete()

        return Response({"message": "Removed staff from parking lot"}, status=200)

    except ParkingStaff.DoesNotExist:
        return Response({"error": "Staff not found"}, status=404)

    except Exception as e:
        return Response({"error": str(e)}, status=400)
    
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_staff_lot(request):
    """ADMIN đổi bãi xe cho nhân viên"""
    if not is_admin(request.user):
        return Response({"error": "Permission denied"}, status=403)

    try:
        user_id = request.data.get('user_id')
        new_lot_id = request.data.get('parking_lot_id')

        staff = ParkingStaff.objects.get(user__id=user_id)
        new_lot = ParkingLot.objects.get(pk=new_lot_id)

        staff.parking_lot = new_lot
        staff.position = request.data.get('position', staff.position)
        staff.save()

        serializer = ParkingStaffSerializer(staff)
        return Response(serializer.data)

    except ParkingStaff.DoesNotExist:
        return Response({"error": "Staff not found"}, status=404)

    except ParkingLot.DoesNotExist:
        return Response({"error": "Parking lot not found"}, status=404)

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
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_monthly_pass(request):
    try:
        vehicle_id = request.data.get('vehicle_id')
        lot_id = request.data.get('parking_lot_id')
        months = int(request.data.get('months', 1))

        #  xe phải thuộc user đó
        vehicle = Vehicle.objects.get(pk=vehicle_id, user=request.user)
        lot = ParkingLot.objects.get(pk=lot_id)

        start_date = timezone.now()
        end_date = start_date + timedelta(days=30 * months)

        price = 200000 * months

        mp = MonthlyPass.objects.create(
            user=request.user,
            vehicle=vehicle,
            parking_lot=lot,
            start_date=start_date,
            end_date=end_date,
            price=price,
            status='active'
        )

        return Response({
            "message": "Tạo vé tháng thành công",
            "id": mp.id
        })

    except Vehicle.DoesNotExist:
        return Response({"error": "Xe không thuộc tài khoản"}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=400)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_monthly_passes(request):
    passes = MonthlyPass.objects.filter(user=request.user).order_by('-created_at')
    return Response(MonthlyPassSerializer(passes, many=True).data)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def extend_monthly_pass(request, pk):
    if not is_business_user(request.user):
        return Response({"error": "Permission denied"}, status=403)

    try:
        mp = MonthlyPass.objects.get(pk=pk)

        months = int(request.data.get('months', 1))
        mp.end_date += timedelta(days=30 * months)
        mp.status = 'active'
        mp.save()

        return Response({"message": "Gia hạn thành công"})

    except MonthlyPass.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
    
@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def cancel_monthly_pass(request, pk):
    try:
        mp = MonthlyPass.objects.get(pk=pk)

        if mp.user != request.user and request.user.role != "staff":
            return Response({"error": "Permission denied"}, status=403)

        mp.status = 'cancelled'
        mp.save()

        return Response({"message": "Đã hủy vé tháng"})

    except MonthlyPass.DoesNotExist:
        return Response({"error": "Not found"}, status=404)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def all_monthly_passes(request):

    if request.user.role != "staff":
        return Response({"error": "Permission denied"}, status=403)

    passes = MonthlyPass.objects.select_related(
        'vehicle', 'parking_lot', 'user'
    ).order_by('-created_at')

    data = []
    for p in passes:
        data.append({
            "id": p.id,
            "vehicle_id": p.vehicle.id,
            "parking_lot_id": p.parking_lot.id,
            "vehicle_plate": p.vehicle.plate_number,
            "vehicle_type": p.vehicle.vehicle_type,
            "parking_name": p.parking_lot.name,
            "user_name": f"{p.user.first_name} {p.user.last_name}",
            "start_date": p.start_date,
            "end_date": p.end_date,
            "price": p.price,
            "status": p.status
        })

    return Response(data)