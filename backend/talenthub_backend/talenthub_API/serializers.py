# serializers.py
from rest_framework import serializers
from talenthub_API.models import User, Job, Application

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']


class JobSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Job
        fields = ['id', 'title', 'description', 'created_by', 'created_at']


class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.ReadOnlyField(source='job.title')
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Application
        fields = ['id', 'job', 'job_title', 'user', 'username', 'status', 'applied_at']