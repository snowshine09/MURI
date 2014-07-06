from django.conf.urls import patterns, include, url
from views import *


# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', index),
    url(r'^data$', getData),
    url(r'^dataSetNum$', LinkNum),
    url(r'^events/all$', queryEvent),
    url(r'^network$', prepareNetwork),
    url(r'^propagate/$', related_entities),
    url(r'^notes$', notes),
    url(r'^visOnceMore$', visRetrieve),
    # url(r'^note$', storeNote),
    # url(r'^$', 'eventviewer.views.home', name='home'),
    # url(r'^eventviewer/', include('eventviewer.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^workbench/', include('workbench.urls')),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^get_table/', get_table),
    url(r'^network_template/', network_template),
    url(r'^timeline_template/', timeline_template),
    url(r'^map_template/', map_template),
)
