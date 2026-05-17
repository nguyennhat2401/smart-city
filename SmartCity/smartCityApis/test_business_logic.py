import pytest
from django.utils import timezone
from datetime import datetime, time, timedelta
from decimal import Decimal
from smartCityApis.models import User, ParkingLot, PricingConfig, ParkingRecord, Vehicle, ParkingSlot, Payment, MonthlyPass

@pytest.mark.django_db
class TestParkingBusinessLogic:
    @pytest.fixture
    def setup_data(self):
        # Create a business user
        owner = User.objects.create_user(username='owner_pytest', password='password', role='businessuser')
        
        # Create a parking lot
        lot = ParkingLot.objects.create(
            name="Pytest Lot",
            location="Pytest Location",
            owner=owner,
            total_slots=10
        )
        
        # Create pricing config
        pricing = PricingConfig.objects.create(
            parking_lot=lot,
            rate_per_hour=Decimal('10000.00'),
            minimum_fee=Decimal('5000.00'),
            daily_max_fee=Decimal('100000.00'),
            peak_hours_start=time(8, 0),
            peak_hours_end=time(18, 0),
            peak_rate_multiplier=1.5
        )
        
        # Create a customer and vehicle
        customer = User.objects.create_user(username='customer_pytest', password='password', role='customer')
        vehicle = Vehicle.objects.create(user=customer, plate_number="PY-789")
        
        # Create a slot
        slot = ParkingSlot.objects.create(parking_lot=lot, slot_number="B1")
        
        return {
            'owner': owner,
            'lot': lot,
            'pricing': pricing,
            'customer': customer,
            'vehicle': vehicle,
            'slot': slot
        }

    def test_calculate_fee_off_peak(self, setup_data):
        data = setup_data
        entry = timezone.make_aware(datetime(2026, 5, 16, 20, 0)) # 8 PM
        exit = entry + timedelta(hours=3)
        
        record = ParkingRecord.objects.create(
            vehicle=data['vehicle'],
            parking_lot=data['lot'],
            slot=data['slot'],
            entry_time=entry,
            exit_time=exit
        )
        
        fee = record.calculate_fee()
        assert fee == 30000.00
        assert record.duration_hours == 3.0

    def test_calculate_fee_peak(self, setup_data):
        data = setup_data
        entry = timezone.make_aware(datetime(2026, 5, 16, 10, 0)) # 10 AM (Peak)
        exit = entry + timedelta(hours=2)
        
        record = ParkingRecord.objects.create(
            vehicle=data['vehicle'],
            parking_lot=data['lot'],
            slot=data['slot'],
            entry_time=entry,
            exit_time=exit
        )
        
        fee = record.calculate_fee()
        # 2 hours * 10000 * 1.5 = 30000
        assert fee == 30000.00

    def test_payment_mark_completed(self, setup_data):
        data = setup_data
        record = ParkingRecord.objects.create(
            vehicle=data['vehicle'],
            parking_lot=data['lot'],
            slot=data['slot'],
            entry_time=timezone.now()
        )
        
        payment = Payment.objects.create(
            parking_record=record,
            amount=Decimal('20000.00'),
            method='momo',
            status='pending'
        )
        
        payment.mark_completed()
        
        assert payment.status == 'completed'
        assert payment.payment_time is not None

    def test_monthly_pass_validation(self, setup_data):
        data = setup_data
        now = timezone.now()
        
        # Valid pass
        valid_pass = MonthlyPass.objects.create(
            user=data['customer'],
            vehicle=data['vehicle'],
            parking_lot=data['lot'],
            start_date=now - timedelta(days=5),
            end_date=now + timedelta(days=25),
            price=Decimal('500000.00'),
            status='active'
        )
        assert valid_pass.is_valid() is True
        
        # Expired pass
        expired_pass = MonthlyPass.objects.create(
            user=data['customer'],
            vehicle=data['vehicle'],
            parking_lot=data['lot'],
            start_date=now - timedelta(days=40),
            end_date=now - timedelta(days=10),
            price=Decimal('500000.00'),
            status='active'
        )
        assert expired_pass.is_valid() is False
        
        # Cancelled pass
        cancelled_pass = MonthlyPass.objects.create(
            user=data['customer'],
            vehicle=data['vehicle'],
            parking_lot=data['lot'],
            start_date=now - timedelta(days=5),
            end_date=now + timedelta(days=25),
            price=Decimal('500000.00'),
            status='cancelled'
        )
        assert cancelled_pass.is_valid() is False
