from django.shortcuts import render
from models import *
from workbench.models import *
from django.http import HttpResponse
import json
import networkx as nx
from networkx.readwrite import json_graph
from itertools import combinations
from django.template import Context
from django.db.models import Q
from django.contrib.gis.geos import *
from itertools import chain
import copy
import sys
from time import strftime, gmtime
import datetime
from dateutil import parser
from datetime import timedelta
import pytz
import sys  
import ast
from django.template.loader import render_to_string
reload(sys)  
sys.setdefaultencoding('utf8')  

linkCount = 0
viewtypes = ['event', 'message', 'person', 'organization', 'location', 'resource', 'timeline', 'map', 'network']
def LinkNum(request):
    global linkCount
    linkCount +=1
    response = {}
    response['NewLinkNum'] = str(linkCount)
    return HttpResponse(json.dumps(response), mimetype='application/json')

def get_table(request):
    global linkCount
    global viewtypes
    link_no = request.REQUEST.get('link_no')
    parentID = request.REQUEST.get('parentID',None)
    response = {}
    if len(link_no) == 0:
        linkCount += 1
        link_no = linkCount
    table_type = request.REQUEST.get('table_type', '')
    headers = request.POST.getlist('headers[]')
    response = {}
    response['html'] = render_to_string("dashboard/table.html", {'table_type': table_type, 'viewtypes': viewtypes, 'columns': headers, 'id': str(link_no), 'parent_id': parentID})
    response['linkNo'] = link_no
    return HttpResponse(json.dumps(response), mimetype='application/json')

def network_template(request):
    global linkCount
    link_no = request.REQUEST.get('link_no')
    if len(link_no) == 0:
        linkCount += 1
        link_no = linkCount
    global viewtypes
    parentID = request.REQUEST.get('parentID',None)
    response = {}
    response['html'] = render_to_string("dashboard/network.html", {'viewtypes': viewtypes, 'id': str(link_no), 'parent_id': parentID})
    response['linkNo'] = link_no
    return HttpResponse(json.dumps(response), mimetype='application/json')

def timeline_template(request):
    global linkCount
    link_no = request.REQUEST.get('link_no')
    if len(link_no) == 0:
        linkCount += 1
        link_no = linkCount
    global viewtypes
    parentID = request.REQUEST.get('parentID',None)
    response = {}
    response['html'] = render_to_string("dashboard/timeline.html", {'viewtypes': viewtypes, 'id': str(link_no), 'parent_id': parentID})
    response['linkNo'] = link_no
    return HttpResponse(json.dumps(response), mimetype='application/json')

def map_template(request):
    global linkCount
    link_no = request.REQUEST.get('link_no')
    if len(link_no) == 0:
        linkCount += 1
        link_no = linkCount
    global viewtypes
    parentID = request.REQUEST.get('parentID',None)
    response = {}
    response['html'] = render_to_string("dashboard/map.html", {'viewtypes': viewtypes, 'id': str(linkCount), 'parent_id': parentID})
    response['linkNo'] = linkCount
    return HttpResponse(json.dumps(response), mimetype='application/json')



def index(request):
    bbox    = request.REQUEST.getlist('map')
    time    = request.REQUEST.getlist('time')
    message_ids   = request.REQUEST.getlist('messages')
    dialogs = []
    if (len(bbox) != 0):
        dialogs.append("map")
    if (len(time) != 0): 
        dialogs.append("timeline")
    if (len(message_ids) != 0): 
        dialogs.append("message_table")
    return render(request, 'dashboard/index.html', Context({"dialogs": dialogs}))

def queryEvent(request):
    response = {}
    response['aaData'] = [] # this field name is required by client 
    events = Event.objects.all().order_by('date')
    for event in events:
        date_begin = ""
        date_end = ""
        if event.date_begin != None:
            date_begin = event.date_begin.strftime('%m/%d/%Y')
        if event.date_end != None:
            date_end = event.date_end.strftime('%m/%d/%Y')

        record = [event.name, event.types, date_begin, date_end]
        response['aaData'].append(record)

    return HttpResponse(json.dumps(response), mimetype='application/json')

def filter_data_by_time(request):
    response = {'entities': [], 'messages': []}
    start = request.REQUEST.get('start', None)
    end = request.REQUEST.get('end', None)
    events = Event.objects.filter(date_begin__range=[parser.parse(start), parser.parse(end)]).order_by('date_begin')
    messages = Message.objects.filter(date__range=[parser.parse(start), parser.parse(end)]).order_by('date')
    linked_entities = list(events)
    for event in events:
        entities = list(chain(event.findTargets(), event.findSources()))
        linked_entities += entities
    for entity in linked_entities:
        response['entities'].append(entity.id)
    for message in messages:
        response['messages'].append(message.uid)
    return HttpResponse(json.dumps(response), mimetype='application/json')

def filter_data(request):
    print "enter filter_data"
    response = {'dataItems': []}
    data_type = request.REQUEST.get('type')
    filter_type = request.REQUEST.get('filter_type', '')
    ids = request.POST.getlist('id[]', None)
    if len(filter_type) == 0:
        events = Event.objects.all().order_by('date_begin')
        print "queryEvent"
    else:
        print "not queryEvent"
        # if filter_type == data_type:##literally one to one mapping relationship without any propagation
        #     etts = []
        #     response["origin"] = []
            # if(filter_type == "event"):# no need to calculate frequency
            #     etts = Event.objects.filter(id__in=ids).order_by('date_begin')
            #     for ett in etts:
            #         response['dataItems'].append(ett.getKeyAttr())
            #     return HttpResponse(json.dumps(response), mimetype='application/json')
            # elif(filter_type == "message"): # no need to calculate frequency
            #     msgs = Message.objects.filter(uid__in = ids)
            #     # messages_dup = ids
            #     # for msg in msgs:
            #     #     messages_dup.extend([message for message in msg.message_set.all()])
            #     # messages = list(set(messages_dup))
            #     for message in msgs:
            #         response['dataItems'].append(message.getKeyAttr())
            #     return HttpResponse(json.dumps(response), mimetype='application/json')
            # else:
            #     if(filter_type == "person"):
            #         etts = Person.objects.filter(pk__in=ids)
            #     elif(filter_type == "organization"):
            #         etts = Organization.objects.filter(pk__in=ids)
            #     elif(filter_type == "location"):
            #         etts = Entity.objects.filter(pk__in=ids)
            #     elif(filter_type == "resource"):
            #         etts = Resource.objects.filter(pk__in=ids)
            #     entity_dup = []
            #     print "ids=",ids
            #     print "etts=",etts
            #     for ett in etts:
            #         print "ett",ett
            #         entity_dup.extend([ett])
            #         entity_dup.extend([entity for entity in list(chain(ett.findTargets(), ett.findSources())) if hasattr(entity, data_type)])
            #     print "entity_dup = ", entity_dup
            #     for p in list(set(entity_dup)):
            #         entity_info = p.getKeyAttr()
            #         entity_info['frequency'] = entity_dup.count(p)
            #         response['dataItems'].append(entity_info)
            #     return HttpResponse(json.dumps(response), mimetype='application/json')

                
        print "ids = []", ids    
        ##after propagating, with the associated events (derived from entities) and 
        if filter_type == "event" or filter_type == "person" or filter_type == "organization" or filter_type == "location" or filter_type == "resource":
            events = Entity.objects.filter(id__in=ids)
            linked_entities = list(events.select_subclasses())
            for eve in events:
                entities = list(chain(eve.findTargets(), eve.findSources()))
                linked_entities += entities
            relations = Relationship.objects.filter( Q(source__in=linked_entities) & Q(target__in=linked_entities) )
            for relation in relations:
                ids.extend([relation.source.id, relation.target.id])
            events = Event.objects.filter(id__in=ids).order_by('date_begin')
        elif filter_type == "message":
            msgs = Message.objects.filter(uid__in=ids)
            evt_id = []
            for msg in msgs:
                print "original msg = ", msg.uid, msg.content
                msg_events = msg.event.all()
                for eve in msg_events:
                    print eve.id
                    evt_id.append(eve.id)
            events = Event.objects.filter(id__in=evt_id).order_by('date_begin')
        elif filter_type == "network":
            src_entt = Entity.objects.filter(id__in=ids)
            ett_id = []
            linked_entities = list(src_entt.select_subclasses())
            for ett in src_entt:
                entities = list(chain(ett.findTargets(), ett.findSources()))
                linked_entities+=entities
            for single_ett in linked_entities:
                if(single_ett.id not in ett_id):
                    ett_id.append(single_ett.id)
            events = Event.objects.filter(id__in=ett_id).order_by('date_begin')
        elif filter_type == "timeline":
            start = request.REQUEST.get('start', None)
            end = request.REQUEST.get('end', None)
            events = Event.objects.filter(date_begin__range=[parser.parse(start), parser.parse(end)]).order_by('date_begin')
        else:
            return HttpResponse('Invalid filter type.', status=403)
    if data_type == 'event':
        for event in events:
            response['dataItems'].append(event.getKeyAttr())
    elif data_type == 'message':
        messages_dup = []
        for event in events:
            messages_dup.extend([message for message in event.message_set.all()])
        
        messages = list(set(messages_dup))
        for message in messages:
            print "message after mapping to event and back", message.uid, message.content
            response['dataItems'].append(message.getKeyAttr())
    elif data_type == 'person' or data_type == 'organization' or data_type == 'resource':
        entity_dup = []
        for event in events:
            entity_dup.extend([entity for entity in list(chain(event.findTargets(), event.findSources())) if hasattr(entity, data_type)])
        for p in list(set(entity_dup)):
            entity_info = p.getKeyAttr()
            entity_info['frequency'] = entity_dup.count(p)
            response['dataItems'].append(entity_info)
    elif data_type == 'location':
        entity_dup = []
        for event in events:
            entity_dup.extend([entity for entity in list(chain(event.findTargets(), event.findSources())) if hasattr(entity, 'footprint')])
        for p in list(set(entity_dup)):
            entity_info = p.getKeyAttr()
            entity_info['frequency'] = entity_dup.count(p)
            response['dataItems'].append(entity_info)
    elif data_type == 'timeline': 
        dates_dup = []
        for event in events:
            dates_dup.extend([message.date.strftime('%m/%d/%Y') for message in event.message_set.all() if message.date is not None])
        dates = list(set(dates_dup))
        for date in sorted(dates):
            response['dataItems'].append((date, dates_dup.count(date)))
    else:
        return HttpResponse('Invalid filter type: ' + data_type, status=403)
    return HttpResponse(json.dumps(response), mimetype='application/json')

def prepareNetwork(request):
    response = {}
    response['nodes'] = []
    response['links'] = []
    events_id = request.POST.getlist('events_id[]', None)
    graph = nx.DiGraph()
    events = Entity.objects.filter(id__in=events_id)
    linked_entities = list(events.select_subclasses())

    for eve in events:
        entities = list(chain(eve.findTargets(), eve.findSources()))
        linked_entities += entities
    for entity in linked_entities:
        if entity.date_begin is not None:
            date = entity.date_begin.strftime('%m/%d/%Y') 
        else: date = ''
        graph.add_node(entity.id, {'uid': entity.id, 'node': type(entity).__name__, 'name': entity.name, 'date': date})

    relations = Relationship.objects.filter( Q(source__in=linked_entities) & Q(target__in=linked_entities) )
    for relation in relations:
        graph.add_edge(relation.source.id, relation.target.id, relation.getAllAttr())

    return HttpResponse(json_graph.dumps(graph), mimetype='application/json')

def related_entities(request):
    response = {'ett_idset': [], 'ett_dateset': [], 'msg_idset': [], 'msg_dateset': []}

    msg_ids = request.POST.getlist('msg_ids[]', None)
    entity_ids = request.POST.getlist('entity_ids[]', None)

    msgs = Message.objects.filter(uid__in=msg_ids)
    if (len(entity_ids)==0): 
        entity_ids = []

    for msg in msgs:
        entity_ids.extend([event.id for event in msg.event.all()])
    ori_entities = Entity.objects.filter(id__in=entity_ids)
    linked_entities = list(ori_entities.select_subclasses())
    for entity in ori_entities:
        linked_entities.extend(list(chain(entity.findTargets(), entity.findSources())))
        # linked_entities.extend+=list(chain(entity.findTargets(), entity.findSources()))
    relations = Relationship.objects.filter( Q(source__in=linked_entities) & Q(target__in=linked_entities) )
    response['ett_idset'] = list(set([entity.id for entity in linked_entities]))
    for relation in relations:
        response['ett_idset'].extend([relation.source.id, relation.target.id])
    
    response['ett_dateset'] = list(set([entity.date_begin.strftime('%m/%d/%Y') for entity in linked_entities if entity.date_begin is not None]))


    if len(msg_ids) == 0:
        entity_ids.extend([entity.id for entity in linked_entities])
        msgs_id = []
        for event in Event.objects.filter(id__in=entity_ids):
            msgs_id.extend([msg.uid for msg in event.message_set.all()])
        msgs = Message.objects.filter(uid__in=msgs_id)        
    response['msg_idset'] = list(set([message.uid for message in msgs]))
    response['msg_dateset'] = list(set([message.date.strftime('%m/%d/%Y') for message in msgs if message.date is not None]))

    response['dateset'] = list(set(chain(response['ett_dateset'], response['msg_dateset'])))
    return HttpResponse(json.dumps(response), mimetype='application/json')

def connected_entities(ett_id,length):
    src_entt = Entity.objects.filter(id__in=ett_id)
    linked_entities = list(src_entt.select_subclasses())
    for ett in src_entt:
        entities = list(chain(ett.findTargets(), ett.findSources()))
        linked_entities+=entities
    for single_ett in linked_entities:
        if(single_ett.id not in ett_id):
            ett_id.append(single_ett.id)
    if(len(ett_id)==length): 
        return length
    else:
        print "recursing", len(ett_id)
        return connected_entities(ett_id,len(ett_id))

def notes(request):
    response={}
    response["notes"] =[]
    author = 1
    nt_type = request.REQUEST.get('type')
    if nt_type == "user_all":
        for note in Note.objects.filter(author_id = author):
            print "enter Filter Note Object"
            note_info = {}
            note_info["id"] = str(note.id)
            note_info["author"] = str(note.author.username)
            pir_brief = PIR.objects.filter(id=note.pir_id)
            note_info["pir"] = str(pir_brief)
            note_info["title"] = note.title
            note_info["content"] = str(note.content)
            note_info["published"] = note.published
            note_info["created_at"] = strftime("%m/%d/%y %H:%M", note.date_created.timetuple())
            note_info['updated_at'] = strftime("%m/%d/%y %H:%M", note.date_updated.timetuple())
            response["notes"].append(note_info)    
    elif nt_type == "id":
        notes_id = request.POST.getlist('id[]', None)
        for note in Note.objects.filter(id__in = notes_id):
            note_info = {}
            note_info["id"] = str(note.id)
            note_info["author"] = str(note.author_id)
            pir_brief = PIR.objects.filter(id=note.pir_id)
            note_info["pir"] = str(pir_brief)
            note_info["title"] = note.title
            note_info["content"] = str(note.content)
            note_info["published"] = note.published
            note_info["created_at"] = strftime("%m/%d/%y %H:%M", note.date_created.timetuple())
            note_info['updated_at'] = strftime("%m/%d/%y %H:%M", note.date_updated.timetuple())
            response["notes"].append(note_info) 

    return HttpResponse(json.dumps(response), mimetype='application/json')

def footprint(request):
    response = {}
    name = request.REQUEST.get('name')
    created_at = request.REQUEST.get('created_at')
    shape = request.REQUEST.get('shape')
    srid = request.REQUEST.get('srid')
    footprint = Footprint.objects.create(name=name, date_as_of=parser.parse(created_at), shape=GEOSGeometry('SRID=%s;%s' % (srid, shape)), entity_type='place')
    event_ids = request.POST.getlist('entities[]')
    for event_id in event_ids:
        event = Event.objects.get(id=event_id)
        Relationship.objects.create(source=event, target=footprint, date_as_of=parser.parse(created_at))
    response['id'] = footprint.id
    return HttpResponse(json.dumps(response), mimetype='application/json')


def visRetrieve(request):
    global linkCount 
    print "enter vis Retrieve"
    response={}
    vid = request.REQUEST.get('visID')
    # print vid
    visrec = Vis.objects.get(id = vid)
    visJSON = ast.literal_eval(visrec.visJSON)

    print 'visJSON',visJSON
    print 'SIDs', type(visJSON)
    for SID in visJSON['SIDs']:
        linkCount = linkCount + 1
        visJSON[SID]['linkNo'] = linkCount
    response["date_updated"] = visrec.date_updated.strftime('%m/%d/%Y')
    # response["dsource"]=visrec.dsource
    # response["type"] = visrec.type 
    # response["dindex"] = visrec.dindex 
    # response["msgID"] = visrec.msgID 
    # response["htimeline"] = visrec.htimeline 
    # response["timeextent"] = visrec.timeextent 
    # response["note"] = visrec.note
    # response["NewLinkNum"] = linkCount
    # visSIDs = request.POST.getlist('SIDs[]',None)

    # for SID in visSIDs:
    #   src_info = request.REQUEST.get(SID)
    #   visSrc = src_info.dsource
    #   vistypes_info = src_info.types_info
    #   viscolor = src_info.color
    #   vishtimeline = src_info.htimeline
    #   visdindex = src_info.dindex
    #   visMSG =  src_info.msgID
    #   vistimeextent = src_info.timeextent
    #   for vistype in vistypes_info:
    #       print type_info
    # SIDs = ",".join(visSIDs)
    response["visJSON"] = visJSON
    return HttpResponse(json.dumps(response), mimetype='application/json')


