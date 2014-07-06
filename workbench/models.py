from django.db import models
from django.contrib.auth.models import User

# Create your models here.


class PIR(models.Model):
    author = models.ForeignKey(User, null=True, blank=True)
    name   = models.CharField(max_length=500)
    content   = models.CharField(max_length=500, null=True, blank=True)
    date_created = models.DateTimeField(null=True, blank=True)

    def __unicode__(self):
        return self.name

class IW(models.Model):
    author = models.ForeignKey(User, null=True, blank=True)
    content   = models.CharField(max_length=500)
    date_created = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    pir    = models.ManyToManyField(PIR)

    def __unicode__(self):
        return self.content[:20]


class Note(models.Model):
    author = models.ForeignKey(User, null=True, blank=True)
    title  = models.CharField(max_length=500, null=True, blank=True)
    content   = models.CharField(max_length=5000, null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    date_updated = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    pir = models.ForeignKey(PIR, null=True, blank=True)
    #vis = models.TextField(null=True, blank=True)
    published = models.BooleanField(default=False)
    def __unicode__(self):
        return self.content[:50]

class Vis(models.Model):
    # author = models.ForeignKey(User, null=True, blank=True)
    type  = models.CharField(max_length=500, null=True, blank=True)
    color = models.CharField(max_length=500, null=True, blank=True)
    position = models.CharField(max_length=100, null=True, blank=True)
    dsource = models.CharField(max_length=500, null=True, blank=True)
    dindex = models.CharField(max_length=500, null=True, blank=True)
    msgID = models.CharField(max_length=500, null=True, blank=True)
    htimeline = models.CharField(max_length=500, null=True, blank=True)
    timeextent = models.CharField(max_length=500, null=True, blank=True)
    date_updated = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    saved =  models.BooleanField(default=False)
    note = models.ForeignKey(Note, null=True, blank=True,related_name = 'vis_note')
    # def __unicode__(self):
    #     return self.id