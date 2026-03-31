from django.urls import path
from . import views

urlpatterns = [
    # ===== HOME =====
    path('', views.home),

    # ===== AUTH =====
    path('auth/register/', views.register),
    path('auth/login/', views.login),
    path('auth/profile/', views.profile),

    # ===== VEHICLE - CUSTOMER =====
    path('vehicles/', views.list_vehicles),
    path('vehicles/create/', views.create_vehicle),
    path('vehicles/<int:pk>/delete/', views.delete_vehicle),

    # ===== PARKING LOT =====
    path('lots/', views.list_lots),
    path('lots/<int:pk>/', views.lot_detail),
    path('lots/create/', views.create_lot),
    path('lots/<int:pk>/update/', views.update_lot),
    path('lots/<int:pk>/delete/', views.delete_lot),
    path('lots/<int:lot_id>/available-slots/', views.available_slots),
    path('lots/<int:lot_id>/staff/', views.lot_staff),
    path('lots/<int:lot_id>/statistics/', views.lot_statistics),

    # ===== PARKING SLOTS =====
    path('slots/create/', views.create_slots),

    # ===== RESERVATION - CUSTOMER =====
    path('reservations/create/', views.create_reservation),
    path('reservations/my/', views.my_reservations),
    path('reservations/<int:pk>/cancel/', views.cancel_reservation),

    # ===== CHECK-IN/OUT =====
    path('parking/check-in/', views.check_in),
    path('parking/check-out/', views.check_out),

    # ===== PARKING RECORD =====
    path('records/my-history/', views.my_parking_history),
    path('records/my-active/', views.active_parking),
    path('records/active/', views.active_records),  # STAFF
    path('records/<int:pk>/', views.record_detail),

    # ===== PAYMENT =====
    path('payments/create/', views.make_payment),
    path('payments/my/', views.my_payments),

    # ===== PRICING CONFIG =====
    path('lots/<int:lot_id>/pricing/', views.manage_pricing),

    # ===== STAFF MANAGEMENT - ADMIN =====
    path('staff/assign/', views.assign_staff),

    # ===== STATISTICS =====
    path('statistics/date-range/', views.stats_date_range),
]