from django.urls import path
from . import views

urlpatterns = [
    path('enter/', views.enter_parking),
    path('exit/', views.exit_parking),
    path('slots/', views.list_slots),
    path('slots/<int:pk>/', views.slot_detail),
    path('slots/create/', views.slot_create),
    path('slots/update/<int:pk>/', views.slot_update),
    path('slots/delete/<int:pk>/', views.slot_delete),
    path('register/', views.register),
    path('login/', views.login),
    path('stats/day/', views.stats_day),
    path('stats/month/', views.stats_month),
    path('stats/year/', views.stats_year),
]
