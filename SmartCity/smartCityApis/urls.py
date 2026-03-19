from django.urls import path
from . import views

urlpatterns = [

    # ===== HOME =====
    path('', views.home),

    # ===== AUTH =====
    path('register/', views.register),
    path('login/', views.login),
    path('profile/', views.profile),

    # ===== USER (ADMIN) =====


    # ===== VEHICLE =====
    path('vehicles/', views.list_vehicles),
    path('vehicles/create/', views.create_vehicle),
    path('vehicles/<int:pk>/update/', views.update_vehicle),
    path('vehicles/<int:pk>/delete/', views.delete_vehicle),

    # ===== PARKING LOT =====
    path('lots/', views.list_lots),
    path('lots/create/', views.create_lot),
    path('lots/<int:pk>/update/', views.update_lot),
    path('lots/<int:pk>/delete/', views.delete_lot),

    # ===== SLOT =====
    path('slots/', views.list_slots),
    path('slots/<int:pk>/', views.slot_detail),
    path('slots/create/', views.slot_create),
    path('slots/<int:pk>/update/', views.slot_update),
    path('slots/<int:pk>/delete/', views.slot_delete),
    path('slots/empty/', views.empty_slots),

    # ===== PARKING =====
    path('enter/', views.enter_parking),
    path('exit/', views.exit_parking),

    path('records/', views.list_records),
    path('records/<int:pk>/', views.record_detail),
    path('records/active/', views.active_records),
    path('records/history/', views.history_records),

    # ===== PAYMENT =====
    path('payments/', views.list_payments),
    path('payments/<int:pk>/', views.payment_detail),
    path('payments/create/', views.create_payment),

    # ===== STATISTICS =====
    path('stats/day/', views.stats_day),
    path('stats/month/', views.stats_month),
    path('stats/year/', views.stats_year),
]