from rest_framework import serializers
from talenthub_API.models import User, Job, Application
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']


class UserCreateSerializer(BaseUserCreateSerializer):
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=False)

    class Meta(BaseUserCreateSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'password', 'role')

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)

class JobSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.username')

    class Meta:
        model = Job
        fields = [
            'id',
            'title',
            'description',
            'requirements',
            'salary',
            'salary_confidential',
            'created_by',
            'created_at'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get('request')
        if instance.salary_confidential:
            if not request or (request.user != instance.created_by and not request.user.is_superuser):
                data['salary'] = "Confidential"
        return data


class ApplicationSerializer(serializers.ModelSerializer):
    job_title = serializers.ReadOnlyField(source='job.title')
    username = serializers.ReadOnlyField(source='user.username')
    resume = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Application
        fields = [
            'id',
            'job',
            'job_title',
            'user',
            'username',
            'status',
            'applied_at',
            'resume'
        ]