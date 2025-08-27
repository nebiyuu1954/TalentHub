# views.py

from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from django.core.paginator import Paginator, EmptyPage
from django.shortcuts import get_object_or_404
from talenthub_API.models import User, Job, Application
from talenthub_API.serializers import UserSerializer, JobSerializer, ApplicationSerializer
from rest_framework.permissions import IsAuthenticated


from .models import Application, Job
from .serializers import ApplicationSerializer



class UserView(APIView):
    permission_classes = [permissions.IsAdminUser]
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get(self, request):
        users = User.objects.all()

        # simple filtering
        username = request.query_params.get('username')
        email = request.query_params.get('email')
        role = request.query_params.get('role')

        if username:
            users = users.filter(username__icontains=username)
        if email:
            users = users.filter(email__icontains=email)
        if role:
            users = users.filter(role__iexact=role)

        # simple sorting
        sort_by = request.query_params.get('sort', 'id')
        if sort_by in ['id', 'username', 'email', 'role']:
            users = users.order_by(sort_by)

        # simple pagination
        perpage = int(request.query_params.get('perpage', 10))
        page = int(request.query_params.get('page', 1))

        paginator = Paginator(users, per_page=perpage)
        try:
            users = paginator.page(number=page)
        except EmptyPage:
            users = []

        serializer = UserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SingleUserView(APIView):
    permission_classes = [permissions.IsAdminUser]
    throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get_object(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def get(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        user = self.get_object(pk)
        if not user:
            return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        user.delete()
        return Response({"detail": "User successfully deleted"}, status=status.HTTP_200_OK)



class JobView(APIView):
    permission_classes = [IsAuthenticated]
    # throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get(self, request):
        if request.user.is_superuser or request.user.role in ['employer', 'applicant']:
            jobs = Job.objects.all().order_by('-created_at')

            # simple filtering
            title = request.query_params.get('title')
            if title:
                jobs = jobs.filter(title__icontains=title)

            # simple sorting
            sort_by = request.query_params.get('sort', 'id')
            if sort_by in ['id', 'title', 'salary', 'created_at']:
                jobs = jobs.order_by(sort_by)

            # Pagination
            perpage = int(request.query_params.get('perpage', 6))
            page = int(request.query_params.get('page', 1))

            paginator = Paginator(jobs, per_page=perpage)
            try:
                jobs = paginator.page(number=page)
            except EmptyPage:
                jobs = []

            serializer = JobSerializer(jobs, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

    def post(self, request):
        if request.user.role != 'employer' and not request.user.is_superuser:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        serializer = JobSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SingleJobView(APIView):
    permission_classes = [IsAuthenticated]
    # throttle_classes = [AnonRateThrottle, UserRateThrottle]

    def get(self, request, pk):
        if request.user.is_superuser or request.user.role in ['employer', 'applicant']:
            job = get_object_or_404(Job, pk=pk)
            serializer = JobSerializer(job, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

    def put(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        if request.user != job.created_by and not request.user.is_superuser:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        serializer = JobSerializer(job, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(created_by=job.created_by)  # keep original creator
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        if request.user != job.created_by and not request.user.is_superuser:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        serializer = JobSerializer(job, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save(created_by=job.created_by)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        job = get_object_or_404(Job, pk=pk)
        if request.user != job.created_by and not request.user.is_superuser:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        job.delete()
        return Response({"detail": "Job successfully deleted"}, status=status.HTTP_200_OK)


class ApplicationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        role = user.role.lower()

        if user.is_superuser:
            applications = Application.objects.all()
        elif role == 'applicant':
            applications = Application.objects.filter(user=user)
        elif role == 'employer':
            applications = Application.objects.filter(job__created_by=user)
        else:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        status_param = request.query_params.get('status')
        if status_param:
            applications = applications.filter(status=status_param.lower())

        # simple pagination
        perpage = int(request.query_params.get('perpage', 6))
        page = int(request.query_params.get('page', 1))
        paginator = Paginator(applications.order_by('-applied_at'), per_page=perpage)

        try:
            applications = paginator.page(page)
        except EmptyPage:
            applications = []

        serializer = ApplicationSerializer(applications, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        user = request.user
        role = user.role.lower()

        if role != 'applicant':
            return Response({"detail": "Only applicants can apply"}, status=status.HTTP_403_FORBIDDEN)

        job_id = request.data.get('job')
        job = get_object_or_404(Job, pk=job_id)

        if job.created_by == user:
            return Response({"detail": "You cannot apply to your own job"}, status=status.HTTP_400_BAD_REQUEST)

        if Application.objects.filter(job=job, user=user).exists():
            return Response({"detail": "You have already applied to this job"}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        if 'resume' in request.FILES:
            data['resume'] = request.FILES['resume']

        serializer = ApplicationSerializer(data=data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=user, job=job, status='applied')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SingleApplicationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        application = get_object_or_404(Application, pk=pk)
        user = request.user
        role = user.role.lower()

        if user.is_superuser or \
           (role == 'applicant' and application.user == user) or \
           (role == 'employer' and application.job.created_by == user):
            serializer = ApplicationSerializer(application, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

    def patch(self, request, pk):
        application = get_object_or_404(Application, pk=pk)
        user = request.user
        role = user.role.lower()

        if not (user.is_superuser or (role == 'employer' and application.job.created_by == user)):
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        allowed_statuses = dict(Application.STATUS_CHOICES).keys()
        new_status = request.data.get('status')

        if new_status not in allowed_statuses:
            return Response({"detail": f"Invalid status. Allowed: {allowed_statuses}"}, status=status.HTTP_400_BAD_REQUEST)

        application.status = new_status
        application.save()
        serializer = ApplicationSerializer(application, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk):
        application = get_object_or_404(Application, pk=pk)
        user = request.user
        role = user.role.lower()

        if user.is_superuser or \
           (role == 'applicant' and application.user == user) or \
           (role == 'employer' and application.job.created_by == user):
            application.delete()
            return Response({"detail": "Application deleted"}, status=status.HTTP_200_OK)

        return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
