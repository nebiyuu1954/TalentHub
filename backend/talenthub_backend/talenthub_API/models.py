from django.db import models

# Create your models here.
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class User(AbstractUser):
    ROLE_CHOICES = [
        ('not_assigned', 'Not Assigned'),
        ('admin', 'Admin'),
        ('employer', 'Employer'),
        ('applicant', 'Applicant'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='not_assigned')

    def __str__(self):
        return self.email


class Job(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField(blank=True) 
    salary = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True) 
    salary_confidential = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='jobs'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title



class Application(models.Model):
    STATUS_CHOICES = [
        ('applied', 'Applied'),
        ('shortlisted', 'Shortlisted'),
        ('rejected', 'Rejected'),
    ]
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='applied')
    applied_at = models.DateTimeField(auto_now_add=True)
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} → {self.job.title} ({self.status})"
