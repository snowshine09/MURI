from django.conf.urls import patterns, include, url
from views import *

# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^pirs$', getPIRs),
    # url(r'^pir/(\d+)/note$', getNote),
    url(r'^note$', storeNote),
    # url(r'^newnote$', insertNote),
    # url(r'^updatenote$', updateNote),
    # url(r'^deletenote$', deleteNote),
    url(r'^visEmbed$', visEmbed),
)
