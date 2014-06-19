# -*- coding: utf-8 -*-
from south.utils import datetime_utils as datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Entity'
        db.create_table(u'dashboard_entity', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('security_info', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('date_as_of', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('date_first_info', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('affiliation', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('allegiance', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('intelligence_evaluation', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('guid', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=500, null=True, blank=True)),
            ('date_begin', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('date_end', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('entity_type', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
        ))
        db.send_create_signal(u'dashboard', ['Entity'])

        # Adding model 'Footprint'
        db.create_table(u'dashboard_footprint', (
            (u'entity_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dashboard.Entity'], unique=True, primary_key=True)),
            ('shape', self.gf('django.contrib.gis.db.models.fields.GeometryField')(null=True, blank=True)),
            ('imprecision', self.gf('django.db.models.fields.FloatField')(null=True, blank=True)),
        ))
        db.send_create_signal(u'dashboard', ['Footprint'])

        # Adding model 'Person'
        db.create_table(u'dashboard_person', (
            (u'entity_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dashboard.Entity'], unique=True, primary_key=True)),
            ('first_name', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('middle_name', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('last_name', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('prefix', self.gf('django.db.models.fields.CharField')(max_length=10, null=True, blank=True)),
            ('suffix', self.gf('django.db.models.fields.CharField')(max_length=10, null=True, blank=True)),
            ('primary_citizenship', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('secondary_citizenship', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('nationality', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('alias', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('place_birth', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('place_death', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('ethnicity', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('race', self.gf('django.db.models.fields.CharField')(max_length=10, null=True, blank=True)),
            ('gender', self.gf('django.db.models.fields.CharField')(max_length=10, null=True, blank=True)),
            ('marital_status', self.gf('django.db.models.fields.CharField')(max_length=10, null=True, blank=True)),
            ('religion', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('status', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
        ))
        db.send_create_signal(u'dashboard', ['Person'])

        # Adding model 'Organization'
        db.create_table(u'dashboard_organization', (
            (u'entity_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dashboard.Entity'], unique=True, primary_key=True)),
            ('types', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('nationality', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('ethnicity', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('religion', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('date_founded', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('registration_country', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('registration_state', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
        ))
        db.send_create_signal(u'dashboard', ['Organization'])

        # Adding model 'Event'
        db.create_table(u'dashboard_event', (
            (u'entity_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dashboard.Entity'], unique=True, primary_key=True)),
            ('types', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('category', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('nationality', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('purpose', self.gf('django.db.models.fields.CharField')(max_length=500, null=True, blank=True)),
        ))
        db.send_create_signal(u'dashboard', ['Event'])

        # Adding model 'Message'
        db.create_table(u'dashboard_message', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('uid', self.gf('django.db.models.fields.CharField')(max_length=10)),
            ('content', self.gf('django.db.models.fields.CharField')(max_length=1000)),
            ('date', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
        ))
        db.send_create_signal(u'dashboard', ['Message'])

        # Adding M2M table for field event on 'Message'
        m2m_table_name = db.shorten_name(u'dashboard_message_event')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('message', models.ForeignKey(orm[u'dashboard.message'], null=False)),
            ('event', models.ForeignKey(orm[u'dashboard.event'], null=False))
        ))
        db.create_unique(m2m_table_name, ['message_id', 'event_id'])

        # Adding model 'Unit'
        db.create_table(u'dashboard_unit', (
            (u'entity_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dashboard.Entity'], unique=True, primary_key=True)),
            ('unit_number', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('unit_type', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('echelon', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('country', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('role', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('parent_echelon', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
        ))
        db.send_create_signal(u'dashboard', ['Unit'])

        # Adding model 'Resource'
        db.create_table(u'dashboard_resource', (
            (u'entity_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dashboard.Entity'], unique=True, primary_key=True)),
            ('condition', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('operational_status', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('availability', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('country', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('resource_type', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
        ))
        db.send_create_signal(u'dashboard', ['Resource'])

        # Adding model 'Equipment'
        db.create_table(u'dashboard_equipment', (
            (u'resource_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dashboard.Resource'], unique=True, primary_key=True)),
        ))
        db.send_create_signal(u'dashboard', ['Equipment'])

        # Adding model 'Weapon'
        db.create_table(u'dashboard_weapon', (
            (u'resource_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dashboard.Resource'], unique=True, primary_key=True)),
            ('make', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('model', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('equipment_code', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
        ))
        db.send_create_signal(u'dashboard', ['Weapon'])

        # Adding model 'Vehicle'
        db.create_table(u'dashboard_vehicle', (
            (u'resource_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dashboard.Resource'], unique=True, primary_key=True)),
            ('vin', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('year', self.gf('django.db.models.fields.CharField')(max_length=10, null=True, blank=True)),
            ('make', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('model', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('license_number', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('license_state', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('license_country', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('color', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('category', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('usage', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('fuel_type', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
        ))
        db.send_create_signal(u'dashboard', ['Vehicle'])

        # Adding model 'Facility'
        db.create_table(u'dashboard_facility', (
            (u'resource_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dashboard.Resource'], unique=True, primary_key=True)),
            ('types', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('primary_function', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('O_suffix', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('BE_number', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('PIN', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
        ))
        db.send_create_signal(u'dashboard', ['Facility'])

        # Adding model 'Document'
        db.create_table(u'dashboard_document', (
            (u'resource_ptr', self.gf('django.db.models.fields.related.OneToOneField')(to=orm['dashboard.Resource'], unique=True, primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('title_short', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('author', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('is_broken_link', self.gf('django.db.models.fields.NullBooleanField')(null=True, blank=True)),
            ('url', self.gf('django.db.models.fields.URLField')(max_length=100, null=True, blank=True)),
            ('language', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('medium', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('types', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('date_approved', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('date_published', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
        ))
        db.send_create_signal(u'dashboard', ['Document'])

        # Adding model 'Relationship'
        db.create_table(u'dashboard_relationship', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('source', self.gf('django.db.models.fields.related.ForeignKey')(related_name='relates_as_source', to=orm['dashboard.Entity'])),
            ('target', self.gf('django.db.models.fields.related.ForeignKey')(related_name='relates_as_target', to=orm['dashboard.Entity'])),
            ('description', self.gf('django.db.models.fields.CharField')(max_length=500, null=True, blank=True)),
            ('types', self.gf('django.db.models.fields.CharField')(max_length=100, null=True, blank=True)),
            ('frequency', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('intelligence_evaluation', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('date_begin', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('date_end', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('date_as_of', self.gf('django.db.models.fields.DateTimeField')(null=True, blank=True)),
            ('security_info', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
            ('guid', self.gf('django.db.models.fields.CharField')(max_length=50, null=True, blank=True)),
        ))
        db.send_create_signal(u'dashboard', ['Relationship'])


    def backwards(self, orm):
        # Deleting model 'Entity'
        db.delete_table(u'dashboard_entity')

        # Deleting model 'Footprint'
        db.delete_table(u'dashboard_footprint')

        # Deleting model 'Person'
        db.delete_table(u'dashboard_person')

        # Deleting model 'Organization'
        db.delete_table(u'dashboard_organization')

        # Deleting model 'Event'
        db.delete_table(u'dashboard_event')

        # Deleting model 'Message'
        db.delete_table(u'dashboard_message')

        # Removing M2M table for field event on 'Message'
        db.delete_table(db.shorten_name(u'dashboard_message_event'))

        # Deleting model 'Unit'
        db.delete_table(u'dashboard_unit')

        # Deleting model 'Resource'
        db.delete_table(u'dashboard_resource')

        # Deleting model 'Equipment'
        db.delete_table(u'dashboard_equipment')

        # Deleting model 'Weapon'
        db.delete_table(u'dashboard_weapon')

        # Deleting model 'Vehicle'
        db.delete_table(u'dashboard_vehicle')

        # Deleting model 'Facility'
        db.delete_table(u'dashboard_facility')

        # Deleting model 'Document'
        db.delete_table(u'dashboard_document')

        # Deleting model 'Relationship'
        db.delete_table(u'dashboard_relationship')


    models = {
        u'dashboard.document': {
            'Meta': {'object_name': 'Document', '_ormbases': [u'dashboard.Resource']},
            'author': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'date_approved': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'date_published': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'is_broken_link': ('django.db.models.fields.NullBooleanField', [], {'null': 'True', 'blank': 'True'}),
            'language': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'medium': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            u'resource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dashboard.Resource']", 'unique': 'True', 'primary_key': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'title_short': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'types': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'})
        },
        u'dashboard.entity': {
            'Meta': {'object_name': 'Entity'},
            'affiliation': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'allegiance': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'date_as_of': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'date_begin': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'date_end': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'date_first_info': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            'entity_type': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'guid': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'intelligence_evaluation': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'security_info': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'})
        },
        u'dashboard.equipment': {
            'Meta': {'object_name': 'Equipment', '_ormbases': [u'dashboard.Resource']},
            u'resource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dashboard.Resource']", 'unique': 'True', 'primary_key': 'True'})
        },
        u'dashboard.event': {
            'Meta': {'object_name': 'Event', '_ormbases': [u'dashboard.Entity']},
            'category': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            u'entity_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dashboard.Entity']", 'unique': 'True', 'primary_key': 'True'}),
            'nationality': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'purpose': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            'types': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'})
        },
        u'dashboard.facility': {
            'BE_number': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'Meta': {'object_name': 'Facility', '_ormbases': [u'dashboard.Resource']},
            'O_suffix': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'PIN': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'primary_function': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            u'resource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dashboard.Resource']", 'unique': 'True', 'primary_key': 'True'}),
            'types': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'})
        },
        u'dashboard.footprint': {
            'Meta': {'object_name': 'Footprint', '_ormbases': [u'dashboard.Entity']},
            u'entity_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dashboard.Entity']", 'unique': 'True', 'primary_key': 'True'}),
            'imprecision': ('django.db.models.fields.FloatField', [], {'null': 'True', 'blank': 'True'}),
            'shape': ('django.contrib.gis.db.models.fields.GeometryField', [], {'null': 'True', 'blank': 'True'})
        },
        u'dashboard.message': {
            'Meta': {'object_name': 'Message'},
            'content': ('django.db.models.fields.CharField', [], {'max_length': '1000'}),
            'date': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'event': ('django.db.models.fields.related.ManyToManyField', [], {'symmetrical': 'False', 'to': u"orm['dashboard.Event']", 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'uid': ('django.db.models.fields.CharField', [], {'max_length': '10'})
        },
        u'dashboard.organization': {
            'Meta': {'object_name': 'Organization', '_ormbases': [u'dashboard.Entity']},
            'date_founded': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            u'entity_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dashboard.Entity']", 'unique': 'True', 'primary_key': 'True'}),
            'ethnicity': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'nationality': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'registration_country': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'registration_state': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'religion': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'types': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'})
        },
        u'dashboard.person': {
            'Meta': {'object_name': 'Person', '_ormbases': [u'dashboard.Entity']},
            'alias': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            u'entity_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dashboard.Entity']", 'unique': 'True', 'primary_key': 'True'}),
            'ethnicity': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'first_name': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'gender': ('django.db.models.fields.CharField', [], {'max_length': '10', 'null': 'True', 'blank': 'True'}),
            'last_name': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'marital_status': ('django.db.models.fields.CharField', [], {'max_length': '10', 'null': 'True', 'blank': 'True'}),
            'middle_name': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'nationality': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'place_birth': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'place_death': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'prefix': ('django.db.models.fields.CharField', [], {'max_length': '10', 'null': 'True', 'blank': 'True'}),
            'primary_citizenship': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'race': ('django.db.models.fields.CharField', [], {'max_length': '10', 'null': 'True', 'blank': 'True'}),
            'religion': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'secondary_citizenship': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'status': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'suffix': ('django.db.models.fields.CharField', [], {'max_length': '10', 'null': 'True', 'blank': 'True'})
        },
        u'dashboard.relationship': {
            'Meta': {'object_name': 'Relationship'},
            'date_as_of': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'date_begin': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'date_end': ('django.db.models.fields.DateTimeField', [], {'null': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.CharField', [], {'max_length': '500', 'null': 'True', 'blank': 'True'}),
            'frequency': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'guid': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'intelligence_evaluation': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'security_info': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'source': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'relates_as_source'", 'to': u"orm['dashboard.Entity']"}),
            'target': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'relates_as_target'", 'to': u"orm['dashboard.Entity']"}),
            'types': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'})
        },
        u'dashboard.resource': {
            'Meta': {'object_name': 'Resource', '_ormbases': [u'dashboard.Entity']},
            'availability': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'condition': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'country': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            u'entity_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dashboard.Entity']", 'unique': 'True', 'primary_key': 'True'}),
            'operational_status': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'resource_type': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'})
        },
        u'dashboard.unit': {
            'Meta': {'object_name': 'Unit', '_ormbases': [u'dashboard.Entity']},
            'country': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'echelon': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            u'entity_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dashboard.Entity']", 'unique': 'True', 'primary_key': 'True'}),
            'parent_echelon': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'role': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'unit_number': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'unit_type': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'})
        },
        u'dashboard.vehicle': {
            'Meta': {'object_name': 'Vehicle', '_ormbases': [u'dashboard.Resource']},
            'category': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'color': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'fuel_type': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'license_country': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'license_number': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'license_state': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'make': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            u'resource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dashboard.Resource']", 'unique': 'True', 'primary_key': 'True'}),
            'usage': ('django.db.models.fields.CharField', [], {'max_length': '100', 'null': 'True', 'blank': 'True'}),
            'vin': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'year': ('django.db.models.fields.CharField', [], {'max_length': '10', 'null': 'True', 'blank': 'True'})
        },
        u'dashboard.weapon': {
            'Meta': {'object_name': 'Weapon', '_ormbases': [u'dashboard.Resource']},
            'equipment_code': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'make': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '50', 'null': 'True', 'blank': 'True'}),
            u'resource_ptr': ('django.db.models.fields.related.OneToOneField', [], {'to': u"orm['dashboard.Resource']", 'unique': 'True', 'primary_key': 'True'})
        }
    }

    complete_apps = ['dashboard']