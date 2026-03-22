from django.contrib.auth import authenticate
from django.db.models import Sum
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime

from .models import ParkingSlot, ParkingRecord
from .serializers import ParkingSlotSerializer, ParkingRecordSerializer, RegisterSerializer

RATE_PER_HOUR = 10000  # tiền 1 giờ

# ----- Xe vào bãi -----
@api_view(['POST'])
def enter_parking(request):
    plate_number = request.data.get('plate_number')
    slot_number = request.data.get('slot_number')

    try:
        slot = ParkingSlot.objects.get(slot_number=slot_number)
    except ParkingSlot.DoesNotExist:
        return Response({"error": "Slot not found"}, status=404)

    if slot.status == 'occupied':
        return Response({"error": "Slot is already occupied"}, status=400)

    record = ParkingRecord.objects.create(
        plate_number=plate_number,
        slot=slot,
        entry_time=timezone.now()
    )
    slot.status = 'occupied'
    slot.save()

    return Response({"message": f"Vehicle {plate_number} entered slot {slot_number}"})


# ----- Xe ra bãi -----
@api_view(['POST'])
def exit_parking(request):
    plate_number = request.data.get('plate_number')

    try:
        record = ParkingRecord.objects.get(plate_number=plate_number, exit_time=None)
    except ParkingRecord.DoesNotExist:
        return Response({"error": "Vehicle not found or already exited"}, status=404)

    record.exit_time = timezone.now()
    duration_hours = (record.exit_time - record.entry_time).total_seconds() / 3600
    record.fee = round(duration_hours * RATE_PER_HOUR, 0)
    record.save()

    slot = record.slot
    slot.status = 'empty'
    slot.save()

    return Response({
        "plate_number": plate_number,
        "slot": slot.slot_number,
        "entry_time": record.entry_time,
        "exit_time": record.exit_time,
        "fee": record.fee
    })


# ----- Danh sách slot -----
@api_view(['GET'])
def list_slots(request):
    slots = ParkingSlot.objects.all()
    serializer = ParkingSlotSerializer(slots, many=True)
    return Response(serializer.data)

def home(request):
    return HttpResponse("Welcome to SmartCity API")

# ----- Lấy chi tiết 1 slot -----
@api_view(['GET'])
def slot_detail(request, pk):
    try:
        slot = ParkingSlot.objects.get(pk=pk)
    except ParkingSlot.DoesNotExist:
        return Response({"error": "Slot not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ParkingSlotSerializer(slot)
    return Response(serializer.data)

# ----- Tạo slot mới -----
@api_view(['POST'])
def slot_create(request):
    serializer = ParkingSlotSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----- Cập nhật slot -----
@api_view(['PUT'])
def slot_update(request, pk):
    try:
        slot = ParkingSlot.objects.get(pk=pk)
    except ParkingSlot.DoesNotExist:
        return Response({"error": "Slot not found"}, status=status.HTTP_404_NOT_FOUND)

    serializer = ParkingSlotSerializer(slot, data=request.data, partial=True)  # partial=True để update 1 vài field
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ----- Xóa slot -----
@api_view(['DELETE'])
def slot_delete(request, pk):
    try:
        slot = ParkingSlot.objects.get(pk=pk)
    except ParkingSlot.DoesNotExist:
        return Response({"error": "Slot not found"}, status=status.HTTP_404_NOT_FOUND)

    slot.delete()
    return Response({"message": "Slot deleted"}, status=status.HTTP_204_NO_CONTENT)

# ----- Đăng ký -----
@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ----- Đăng nhập -----
@api_view(['POST'])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        })
    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# ----- Thống kê theo ngày -----
@api_view(['GET'])
def stats_day(request):
    """
    GET /api/parking/stats/day/?date=YYYY-MM-DD
    """
    date_str = request.GET.get('date', timezone.now().date().isoformat())
    date_obj = datetime.strptime(date_str, "%Y-%m-%d").date()

    records = ParkingRecord.objects.filter(
        exit_time__date=date_obj
    )

    total_vehicles = records.count()
    total_revenue = records.aggregate(total=Sum('fee'))['total'] or 0

    return Response({
        "date": date_str,
        "total_vehicles": total_vehicles,
        "total_revenue": total_revenue
    })


# ----- Thống kê theo tháng -----
@api_view(['GET'])
def stats_month(request):
    """
    GET /api/parking/stats/month/?month=YYYY-MM
    """
    month_str = request.GET.get('month', timezone.now().strftime("%Y-%m"))
    year, month = map(int, month_str.split('-'))

    records = ParkingRecord.objects.filter(
        exit_time__year=year,
        exit_time__month=month
    )

    total_vehicles = records.count()
    total_revenue = records.aggregate(total=Sum('fee'))['total'] or 0

    return Response({
        "month": month_str,
        "total_vehicles": total_vehicles,
        "total_revenue": total_revenue
    })


# ----- Thống kê theo năm -----
@api_view(['GET'])
def stats_year(request):
    """
    GET /api/parking/stats/year/?year=YYYY
    """
    year = int(request.GET.get('year', timezone.now().year))

    records = ParkingRecord.objects.filter(
        exit_time__year=year
    )

    total_vehicles = records.count()
    total_revenue = records.aggregate(total=Sum('fee'))['total'] or 0

    return Response({
        "year": year,
        "total_vehicles": total_vehicles,
        "total_revenue": total_revenue
    })