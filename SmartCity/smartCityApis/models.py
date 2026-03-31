from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid


# ===== USER (Custom để có role) =====
class User(AbstractUser):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('businessuser', 'Business User'),
        ('admin', 'Admin'),
    ]

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


# ===== BÃI ĐỖ XE =====
class ParkingLot(models.Model):
    name = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    address = models.TextField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'businessuser'}, related_name='parking_lots')
    
    total_slots = models.IntegerField(default=0)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.owner.username if self.owner else 'No owner'})"

    def get_available_slots_count(self):
        """Đếm số chỗ trống"""
        return self.slots.filter(status='empty').count()

    def get_occupied_slots_count(self):
        """Đếm số chỗ đang dùng"""
        return self.slots.filter(status='occupied').count()


# ===== PRICING =====
class PricingConfig(models.Model):
    """Cấu hình giá theo khung giờ"""
    parking_lot = models.OneToOneField(ParkingLot, on_delete=models.CASCADE, related_name='pricing')
    
    rate_per_hour = models.DecimalField(max_digits=10, decimal_places=2, default=10000)  # VND
    minimum_fee = models.DecimalField(max_digits=10, decimal_places=2, default=10000)
    daily_max_fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    peak_hours_start = models.TimeField(blank=True, null=True)  # Ví dụ: 08:00
    peak_hours_end = models.TimeField(blank=True, null=True)    # Ví dụ: 18:00
    peak_rate_multiplier = models.FloatField(default=1.0)  # 1.5x rate_per_hour
    
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pricing - {self.parking_lot.name}"


# ===== SLOT =====
class ParkingSlot(models.Model):
    STATUS_CHOICES = (
        ('empty', 'Empty'),
        ('occupied', 'Occupied'),
        ('reserved', 'Reserved'),
        ('maintenance', 'Maintenance'),
    )

    parking_lot = models.ForeignKey(ParkingLot, on_delete=models.CASCADE, related_name='slots')
    slot_number = models.CharField(max_length=10)
    slot_type = models.CharField(max_length=20, default='standard')  # standard, disabled, etc.
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="empty")
    
    qr_code = models.CharField(max_length=100, unique=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        unique_together = ('parking_lot', 'slot_number')
        ordering = ['parking_lot', 'slot_number']

    def __str__(self):
        lot_name = self.parking_lot.name if self.parking_lot else "Unknown"
        return f"{lot_name} - {self.slot_number} ({self.status})"

    def save(self, *args, **kwargs):
        if not self.qr_code:
            self.qr_code = str(uuid.uuid4())
        super().save(*args, **kwargs)


# ===== XE =====
class Vehicle(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vehicles')
    
    plate_number = models.CharField(max_length=20, unique=True)
    vehicle_type = models.CharField(max_length=50, default='car')  # car, motorcycle, etc.
    
    brand = models.CharField(max_length=100, blank=True, null=True)
    color = models.CharField(max_length=50, blank=True, null=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        user_name = self.user.username if self.user else "Unknown"
        return f"{self.plate_number} ({user_name})"


# ===== ĐẶT CHỖ (RESERVATION) =====
class Reservation(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('checked_in', 'Checked In'),
        ('checked_out', 'Checked Out'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reservations')
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='reservations')
    parking_lot = models.ForeignKey(ParkingLot, on_delete=models.CASCADE, related_name='reservations')
    slot = models.ForeignKey(ParkingSlot, on_delete=models.SET_NULL, null=True, blank=True, related_name='reservations')
    
    reserved_from = models.DateTimeField()
    reserved_to = models.DateTimeField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, default='unpaid')  # unpaid, paid, partial
    
    estimated_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    qr_code = models.CharField(max_length=100, unique=True, blank=True)
    
    confirmed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, 
                                     related_name='confirmed_reservations', 
                                     limit_choices_to={'role': 'businessuser'})
    confirmed_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Reservation {self.id} - {self.vehicle.plate_number}"

    def save(self, *args, **kwargs):
        if not self.qr_code:
            self.qr_code = str(uuid.uuid4())
        super().save(*args, **kwargs)


# ===== LỊCH SỬ XE (CHECK-IN/OUT) =====
class ParkingRecord(models.Model):
    STATUS_CHOICES = (
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )

    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='parking_records')
    reservation = models.OneToOneField(Reservation, on_delete=models.SET_NULL, null=True, blank=True, related_name='parking_record')
    slot = models.ForeignKey(ParkingSlot, on_delete=models.SET_NULL, null=True, blank=True, related_name='parking_records')
    parking_lot = models.ForeignKey(ParkingLot, on_delete=models.CASCADE, related_name='parking_records', null=True)

    entry_time = models.DateTimeField()
    exit_time = models.DateTimeField(null=True, blank=True)

    duration_hours = models.FloatField(null=True, blank=True)  # Tính toán tự động
    fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    
    entry_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                 related_name='entry_records', 
                                 limit_choices_to={'role': 'businessuser'})
    exit_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                               related_name='exit_records',
                               limit_choices_to={'role': 'businessuser'})
    
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        ordering = ['-entry_time']

    def __str__(self):
        vehicle_plate = self.vehicle.plate_number if self.vehicle else "Unknown"
        return f"{vehicle_plate} - {self.entry_time}"

    def calculate_fee(self):
        """Tính tiền dựa trên cấu hình giá"""
        if not self.exit_time:
            return None
            
        pricing = self.parking_lot.pricing
        
        duration = self.exit_time - self.entry_time
        hours = duration.total_seconds() / 3600
        hours = max(hours, 1)  # Tối thiểu 1 giờ
        
        self.duration_hours = hours
        
        # Tính tiền cơ bản
        base_fee = float(hours) * float(pricing.rate_per_hour)
        
        # Kiểm tra giờ cao điểm
        if pricing.peak_hours_start and pricing.peak_hours_end:
            entry_hour = self.entry_time.time()
            if pricing.peak_hours_start <= entry_hour < pricing.peak_hours_end:
                base_fee *= pricing.peak_rate_multiplier
        
        # Áp dụng mức tối thiểu
        fee = max(base_fee, float(pricing.minimum_fee))
        
        # Áp dụng mức tối đa hàng ngày
        if pricing.daily_max_fee:
            fee = min(fee, float(pricing.daily_max_fee))
        
        self.fee = fee
        return fee


# ===== THANH TOÁN =====
class Payment(models.Model):
    PAYMENT_METHOD = (
        ('cash', 'Cash'),
        ('momo', 'Momo'),
        ('vnpay', 'VNPay'),
        ('credit_card', 'Credit Card'),
    )
    
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    )

    reservation = models.OneToOneField(Reservation, on_delete=models.CASCADE, related_name='payment', null=True, blank=True)
    parking_record = models.OneToOneField(ParkingRecord, on_delete=models.CASCADE, related_name='payment', null=True, blank=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=50, choices=PAYMENT_METHOD, default='cash')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    transaction_id = models.CharField(max_length=100, unique=True, blank=True)
    
    payment_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.id} - {self.amount} VND ({self.status})"

    def mark_completed(self):
        """Đánh dấu thanh toán hoàn tất"""
        self.status = 'completed'
        self.payment_time = timezone.now()
        self.save()
        
        if self.reservation:
            self.reservation.payment_status = 'paid'
            self.reservation.save()


# ===== NHÂN VIÊN BÃI XE (STAFF) =====
class ParkingStaff(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parking_staff',
                               limit_choices_to={'role': 'businessuser'})
    parking_lot = models.ForeignKey(ParkingLot, on_delete=models.CASCADE, related_name='staff')
    
    position = models.CharField(max_length=100, blank=True)  # Cashier, Gate Keeper, etc.
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)

    class Meta:
        unique_together = ('user', 'parking_lot')

    def __str__(self):
        return f"{self.user.username} - {self.parking_lot.name}"