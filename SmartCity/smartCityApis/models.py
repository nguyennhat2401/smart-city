from django.db import models
from datetime import timedelta

# ==== User để đăng nhập ====
class User(models.Model):
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, default="staff")  # admin hoặc nhân viên

    def __str__(self):
        return self.username


# ==== Chỗ đỗ xe ====
class ParkingSlot(models.Model):
    slot_number = models.CharField(max_length=10)
    status = models.CharField(max_length=20, default="empty")  # empty / occupied

    def __str__(self):
        return f"{self.slot_number} ({self.status})"


# ==== Lịch sử xe vào/ra ====
class ParkingRecord(models.Model):
    plate_number = models.CharField(max_length=20)
    slot = models.ForeignKey(ParkingSlot, on_delete=models.CASCADE)
    entry_time = models.DateTimeField()
    exit_time = models.DateTimeField(null=True, blank=True)
    fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return f"{self.plate_number} - {self.slot.slot_number} - {self.entry_time}"

    def calculate_fee(self, rate_per_hour=10000):
        """
        Tính tiền dựa vào thời gian đỗ xe.
        rate_per_hour: giá tiền 1 giờ
        """
        if self.exit_time:
            duration = self.exit_time - self.entry_time
            hours = duration.total_seconds() / 3600
            self.fee = round(hours * rate_per_hour, 0)
            self.save()