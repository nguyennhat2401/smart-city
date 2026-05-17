from django.test import TestCase
from django.utils import timezone
from .models import User, ParkingLot, PricingConfig, ParkingRecord, Vehicle, ParkingSlot
from datetime import datetime, time, timedelta
from decimal import Decimal

class ModelLogicTest(TestCase):
    def setUp(self):
        # Create a business user
        self.owner = User.objects.create_user(username='owner', password='password', role='businessuser')
        
        # Create a parking lot
        self.lot = ParkingLot.objects.create(
            name="Test Lot",
            location="Test Location",
            owner=self.owner,
            total_slots=10
        )
        
        # Create pricing config
        self.pricing = PricingConfig.objects.create(
            parking_lot=self.lot,
            rate_per_hour=Decimal('10000.00'),
            minimum_fee=Decimal('5000.00'),
            daily_max_fee=Decimal('100000.00'),
            peak_hours_start=time(8, 0),
            peak_hours_end=time(18, 0),
            peak_rate_multiplier=1.5
        )
        
        # Create a customer and vehicle
        self.customer = User.objects.create_user(username='customer', password='password', role='customer')
        self.vehicle = Vehicle.objects.create(user=self.customer, plate_number="ABC-123")
        
        # Create a slot
        self.slot = ParkingSlot.objects.create(parking_lot=self.lot, slot_number="A1")

    def test_calculate_fee_basic(self):
        # 2 hours at normal rate (off-peak)
        entry = timezone.make_aware(datetime(2026, 5, 16, 20, 0)) # 8 PM (off-peak)
        exit = entry + timedelta(hours=2)
        
        record = ParkingRecord.objects.create(
            vehicle=self.vehicle,
            parking_lot=self.lot,
            slot=self.slot,
            entry_time=entry,
            exit_time=exit
        )
        
        fee = record.calculate_fee()
        self.assertEqual(fee, 20000.00)
        self.assertEqual(record.duration_hours, 2.0)

    def test_calculate_fee_peak_hours(self):
        # 2 hours at peak rate (8 AM - 10 AM)
        entry = timezone.make_aware(datetime(2026, 5, 16, 9, 0)) # 9 AM (peak)
        exit = entry + timedelta(hours=2)
        
        record = ParkingRecord.objects.create(
            vehicle=self.vehicle,
            parking_lot=self.lot,
            slot=self.slot,
            entry_time=entry,
            exit_time=exit
        )
        
        fee = record.calculate_fee()
        # 2 hours * 10000 * 1.5 = 30000
        self.assertEqual(fee, 30000.00)

    def test_calculate_fee_minimum(self):
        # 15 minutes should be charged as 1 hour minimum
        entry = timezone.make_aware(datetime(2026, 5, 16, 20, 0))
        exit = entry + timedelta(minutes=15)
        
        record = ParkingRecord.objects.create(
            vehicle=self.vehicle,
            parking_lot=self.lot,
            slot=self.slot,
            entry_time=entry,
            exit_time=exit
        )
        
        fee = record.calculate_fee()
        self.assertEqual(fee, 10000.00) # Min hours is 1 -> 1 * 10000

    def test_calculate_fee_daily_max(self):
        # 24 hours at off-peak would be 240,000, but capped at 100,000
        entry = timezone.make_aware(datetime(2026, 5, 16, 20, 0))
        exit = entry + timedelta(hours=24)
        
        record = ParkingRecord.objects.create(
            vehicle=self.vehicle,
            parking_lot=self.lot,
            slot=self.slot,
            entry_time=entry,
            exit_time=exit
        )
        
        fee = record.calculate_fee()
        self.assertEqual(fee, 100000.00)

    def test_slot_status_counts(self):
        # Create more slots
        ParkingSlot.objects.create(parking_lot=self.lot, slot_number="A2", status='occupied')
        ParkingSlot.objects.create(parking_lot=self.lot, slot_number="A3", status='empty')
        
        # setup had one A1 as empty
        self.assertEqual(self.lot.get_available_slots_count(), 2) # A1 and A3
        self.assertEqual(self.lot.get_occupied_slots_count(), 1) # A2
