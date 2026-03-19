from django.contrib.auth import authenticate
from django.db.models import Sum
from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import datetime

from .models import ParkingSlot, ParkingRecord, Vehicle, User, Payment, ParkingLot
from .serializers import ParkingSlotSerializer, ParkingRecordSerializer, RegisterSerializer

RATE_PER_HOUR = 10000


# ===== HOME =====
def home(request):
    return HttpResponse("Welcome to SmartCity API")


# ===== AUTH =====
@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User created"}, status=201)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
def login(request):
    user = authenticate(
        username=request.data.get('username'),
        password=request.data.get('password')
    )
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token)
        })
    return Response({"error": "Invalid credentials"}, status=401)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    return Response({
        "username": request.user.username,
        "role": request.user.role
    })


# ===== VEHICLE =====
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_vehicles(request):
    vehicles = Vehicle.objects.filter(user=request.user)
    return Response([{"id": v.id, "plate_number": v.plate_number} for v in vehicles])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_vehicle(request):
    v = Vehicle.objects.create(
        user=request.user,
        plate_number=request.data.get('plate_number')
    )
    return Response({"id": v.id})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_vehicle(request, pk):
    v = Vehicle.objects.get(pk=pk, user=request.user)
    v.plate_number = request.data.get('plate_number', v.plate_number)
    v.save()
    return Response({"message": "updated"})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_vehicle(request, pk):
    Vehicle.objects.get(pk=pk, user=request.user).delete()
    return Response({"message": "deleted"})


# ===== PARKING LOT =====
@api_view(['GET'])
def list_lots(request):
    lots = ParkingLot.objects.all()
    return Response([{"id": l.id, "name": l.name} for l in lots])


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_lot(request):
    if request.user.role != 'businessuser':
        return Response({"error": "Permission denied"}, status=403)

    lot = ParkingLot.objects.create(
        name=request.data.get('name'),
        location=request.data.get('location'),
        owner=request.user
    )
    return Response({"id": lot.id})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_lot(request, pk):
    lot = ParkingLot.objects.get(pk=pk)
    lot.name = request.data.get('name', lot.name)
    lot.location = request.data.get('location', lot.location)
    lot.save()
    return Response({"message": "updated"})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_lot(request, pk):
    ParkingLot.objects.get(pk=pk).delete()
    return Response({"message": "deleted"})


# ===== SLOT =====
@api_view(['GET'])
def list_slots(request):
    slots = ParkingSlot.objects.all()
    return Response(ParkingSlotSerializer(slots, many=True).data)


@api_view(['GET'])
def slot_detail(request, pk):
    slot = ParkingSlot.objects.get(pk=pk)
    return Response(ParkingSlotSerializer(slot).data)


@api_view(['POST'])
def slot_create(request):
    serializer = ParkingSlotSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['PUT'])
def slot_update(request, pk):
    slot = ParkingSlot.objects.get(pk=pk)
    serializer = ParkingSlotSerializer(slot, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['DELETE'])
def slot_delete(request, pk):
    ParkingSlot.objects.get(pk=pk).delete()
    return Response({"message": "deleted"})


@api_view(['GET'])
def empty_slots(request):
    slots = ParkingSlot.objects.filter(status='empty')
    return Response(ParkingSlotSerializer(slots, many=True).data)


# ===== PARKING =====
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def enter_parking(request):
    plate = request.data.get('plate_number')
    slot_id = request.data.get('slot_id')

    vehicle, _ = Vehicle.objects.get_or_create(
        user=request.user,
        plate_number=plate
    )

    slot = ParkingSlot.objects.get(id=slot_id)

    if slot.status == 'occupied':
        return Response({"error": "Slot occupied"}, status=400)

    record = ParkingRecord.objects.create(
        vehicle=vehicle,
        slot=slot,
        entry_time=timezone.now()
    )

    slot.status = 'occupied'
    slot.save()

    return Response({"record_id": record.id})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def exit_parking(request):
    plate = request.data.get('plate_number')

    vehicle = Vehicle.objects.get(plate_number=plate)
    record = ParkingRecord.objects.get(vehicle=vehicle, exit_time=None)

    record.exit_time = timezone.now()

    duration = (record.exit_time - record.entry_time).total_seconds() / 3600
    duration = max(duration, 1)

    fee = int(duration * RATE_PER_HOUR)
    record.fee = fee
    record.save()

    slot = record.slot
    slot.status = 'empty'
    slot.save()

    Payment.objects.create(record=record, amount=fee)

    return Response({"fee": fee})


@api_view(['GET'])
def list_records(request):
    r = ParkingRecord.objects.all()
    return Response(ParkingRecordSerializer(r, many=True).data)


@api_view(['GET'])
def record_detail(request, pk):
    r = ParkingRecord.objects.get(pk=pk)
    return Response(ParkingRecordSerializer(r).data)


@api_view(['GET'])
def active_records(request):
    r = ParkingRecord.objects.filter(exit_time=None)
    return Response(ParkingRecordSerializer(r, many=True).data)


@api_view(['GET'])
def history_records(request):
    r = ParkingRecord.objects.filter(exit_time__isnull=False)
    return Response(ParkingRecordSerializer(r, many=True).data)


# ===== PAYMENT =====
@api_view(['GET'])
def list_payments(request):
    payments = Payment.objects.all()
    return Response([{"id": p.id, "amount": p.amount} for p in payments])


@api_view(['GET'])
def payment_detail(request, pk):
    p = Payment.objects.get(pk=pk)
    return Response({"id": p.id, "amount": p.amount})


@api_view(['POST'])
def create_payment(request):
    p = Payment.objects.create(
        record_id=request.data.get('record_id'),
        amount=request.data.get('amount')
    )
    return Response({"id": p.id})


# ===== STATISTICS =====
@api_view(['GET'])
def stats_day(request):
    date = request.GET.get('date', timezone.now().date().isoformat())
    d = datetime.strptime(date, "%Y-%m-%d").date()

    records = ParkingRecord.objects.filter(exit_time__date=d)

    return Response({
        "date": date,
        "vehicles": records.count(),
        "revenue": records.aggregate(Sum('fee'))['fee__sum'] or 0
    })


@api_view(['GET'])
def stats_month(request):
    month = request.GET.get('month', timezone.now().strftime("%Y-%m"))
    y, m = map(int, month.split('-'))

    records = ParkingRecord.objects.filter(
        exit_time__year=y,
        exit_time__month=m
    )

    return Response({
        "month": month,
        "vehicles": records.count(),
        "revenue": records.aggregate(Sum('fee'))['fee__sum'] or 0
    })


@api_view(['GET'])
def stats_year(request):
    year = int(request.GET.get('year', timezone.now().year))

    records = ParkingRecord.objects.filter(exit_time__year=year)

    return Response({
        "year": year,
        "vehicles": records.count(),
        "revenue": records.aggregate(Sum('fee'))['fee__sum'] or 0
    })