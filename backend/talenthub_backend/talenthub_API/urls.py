from django.contrib import admin
from django.urls import path
from .views import (
    JobView, SingleJobView,
    ApplicationView, SingleApplicationView,
    UserView, SingleUserView
)



urlpatterns = [
    path('admin/users/', UserView.as_view(), name='user-list-create'),
    path('admin/users/<int:pk>/', SingleUserView.as_view(), name='user-detail'),


    path('jobs/', JobView.as_view(), name='job-list-create'),
    path('jobs/<int:pk>/', SingleJobView.as_view(), name='job-detail'),

    path('applications/', ApplicationView.as_view(), name='application-list-create'),
    path('applications/<int:pk>/', SingleApplicationView.as_view(), name='application-detail'),

]
