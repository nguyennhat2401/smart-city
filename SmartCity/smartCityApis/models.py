from django.db import models
from django.contrib.auth.models import AbstractUser


# ===== USER (Custom để có role) =====
class User(AbstractUser):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('businessuser', 'Business User'),
        ('admin', 'Admin'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')

    def __str__(self):
        return self.username


# ===== BÃI ĐỖ XE =====
class ParkingLot(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'businessuser'})

    def __str__(self):
        return self.name


# ===== SLOT =====
class ParkingSlot(models.Model):
    STATUS_CHOICES = (
        ('empty', 'Empty'),
        ('occupied', 'Occupied'),
    )

    slot_number = models.CharField(max_length=10)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="empty")
    parking_lot = models.ForeignKey(ParkingLot, on_delete=models.CASCADE, related_name='slots', null=True)

    def __str__(self):
        return f"{self.slot_number} ({self.status})"


# ===== XE =====
class Vehicle(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles', null=True)
    plate_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=50, default='car')

    def __str__(self):
        return self.plate_number


# ===== LỊCH SỬ XE =====
class ParkingRecord(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, null=True, blank=True)
    slot = models.ForeignKey(ParkingSlot, on_delete=models.CASCADE)

    entry_time = models.DateTimeField()
    exit_time = models.DateTimeField(null=True, blank=True)

    fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.vehicle.plate_number} - {self.slot.slot_number}"

    def calculate_fee(self, rate_per_hour=10000):
        if self.exit_time:
            duration = self.exit_time - self.entry_time
            hours = duration.total_seconds() / 3600

            # tối thiểu 1 giờ
            hours = max(hours, 1)

            self.fee = int(hours * rate_per_hour)
            self.save()


# ===== THANH TOÁN =====
class Payment(models.Model):
    record = models.ForeignKey(ParkingRecord, on_delete=models.CASCADE, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_time = models.DateTimeField(auto_now_add=True)
    method = models.CharField(max_length=50, default='cash')  # cash / momo / vnpay

    def __str__(self):
        return f"{self.record.vehicle.plate_number} - {self.amount}"