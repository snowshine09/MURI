from django.shortcuts import render
from models import *
from django.http import HttpResponse
import json
import networkx as nx
from networkx.readwrite import json_graph
from itertools import combinations
from django.template import Context
from django.db.models import Q
from itertools import chain
import copy
import sys

linkCount = 0
def LinkNum(request):
    global linkCount
    linkCount +=1
    response = {}
    response['NewLinkNum'] = str(linkCount)
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

def getData(request):
    response = {}
    response['events'] = []
    events_id = request.POST.getlist('events_id[]', None)
    if events_id != []:
        print "condition is not empty", events_id
        events = Event.objects.filter(id__in=events_id).order_by('date_begin')
    else: 
        events = Event.objects.all().order_by('date_begin')
    ##events = Event.objects.all().order_by('date_begin')
    for event in events:
        e_info = {}
        e_info = event.getKeyAttr()


        e_info['organizations']  = [] 
        e_info['resources']  = [] 
        e_info['persons']  = [] 
        e_info['footprints']  = [] 
        e_info['messages']  = [] 

        for mes in event.message_set.all():
            e_info['messages'].append(mes.getKeyAttr())

        linked_entities = list(chain(event.findTargets(), event.findSources()))
        for entity in linked_entities:
            #print entity.getKeyAttr(),entity
            if hasattr(entity, 'organization'):
                e_info['organizations'].append(entity.getKeyAttr())
            elif hasattr(entity, 'resource'):
                e_info['resources'].append(entity.getKeyAttr())
            elif hasattr(entity, 'person'):
                #print entity,hasattr(entity,"node"),hasattr(entity,"person"),dir(entity)
                e_info['persons'].append(entity.getKeyAttr())
            elif hasattr(entity, 'footprint'):
                e_info['footprints'].append(entity.getKeyAttr())

        response['events'] += flatten(e_info)
    print "returned object len:",len(response['events']),sys.getsizeof(response['events'])
    return HttpResponse(json.dumps(response), mimetype='application/json')

def flatten(dic):
    res = []
    for person in dic['persons']+[{}]: ## {} is used to confirm that in the case (or event_info) where person is not available, other related entities can still be recorded
    	rec = {}
    	rec['uid'] = dic['uid']
    	rec['name'] = dic['name']
    	rec['types'] = dic['types']
    	rec['date'] = dic['date']
    	rec['excerpt'] = dic['excerpt']

        if len(dic['persons']) != 0 and person == {}:
            continue
    	rec['person'] = person
        for org in dic['organizations']+[{}]:
                if len(dic['organizations']) != 0 and org == {}:
                    continue
                rec['organization'] = org
                for resource in dic['resources']+[{}]:
                    if len(dic['resources']) != 0 and resource == {}:
                        continue
                    rec['resource'] = resource
                    for fp in dic['footprints']+[{}]:
                        if len(dic['footprints']) != 0 and fp == {}:
                            continue
                        rec['footprint'] = fp
                        for mes in dic['messages']+[{}]:
                            if len(dic['messages']) != 0 and mes == {}:
                                continue
                            rec['message'] = mes
                            # print rec
                            res.append(copy.deepcopy(rec))
    #print "res",len(res),sys.getsizeof(res)
    return res

def prepareNetwork(request):
    if request.method == 'POST':
        response = {}
        response['nodes'] = []
        response['links'] = []
        node_types = request.POST.getlist('entities[]', None)
        events_id = request.POST.getlist('events_id[]', None)
        print events_id, "is the events ids for network (prepareNetwork)"
        if node_types == None or events_id == None:
            return

        graph = nx.DiGraph()

        events = Entity.objects.filter(id__in=events_id)
        linked_entities = list(events.select_subclasses())

        for eve in events:
            entities = list(chain(eve.findTargets(), eve.findSources()))
            linked_entities += entities
        for entity in linked_entities:
            graph.add_node(entity.id, entity.getKeyAttr())

        relations = Relationship.objects.filter( Q(source__in=linked_entities) & Q(target__in=linked_entities) )
        for relation in relations:
            graph.add_edge(relation.source.id, relation.target.id, relation.getAllAttr())

        return HttpResponse(json_graph.dumps(graph), mimetype='application/json')
    return

def related_entities(request):
    if request.method == 'POST':
        response = {}
        response['ett'] = []
        response['msg'] = []
        src_id = request.POST.getlist('src_id[]', None)##src entities id
        ett_id = request.POST.getlist('ett_id[]', None)##src entities id
        
        if src_id == None and ett_id == None:
            return
        print ett_id, "is the entities ids for linked entities (related_entities)"
        print src_id, "is the messages ids for linked entities (related_entities)"
        
        ## comment: search for entities given msgs/entities
        msgs = Message.objects.filter(uid__in=src_id)
        if(len(ett_id)==0): 
            ett_id = []
        for msg in msgs:
            events = msg.event.all()
            for eve in events:
                print eve.id
                ett_id.append(eve.id)
        src_entt = Entity.objects.filter(id__in=ett_id)
        linked_entities = list(src_entt.select_subclasses())
        for ett in src_entt:
            entities = list(chain(ett.findTargets(), ett.findSources()))
            #print entities
            linked_entities += entities
        for entity in linked_entities:
            response['ett'].append(entity.getKeyAttr())
        if len(src_id) == 0:##search for messages given entities
            src_entt = Entity.objects.filter(id__in=ett_id)
            linked_entities = list(src_entt.select_subclasses())
            for ett in src_entt:
                entities = list(chain(ett.findTargets(), ett.findSources()))
                linked_entities+=entities
            for single_ett in linked_entities:
                if(single_ett.id not in ett_id):
                    ett_id.append(single_ett.id)
            ##function used to calculate the complete connected enntites recursively
            ##ett_id = connected_entities(ett_id,len(ett_id));
                #print entities
            ett_src = Event.objects.filter(id__in=ett_id)##first propagate to broad entities than settle to event_type and search for related mesgs
            
            msgs_id = []
            for ett in ett_src:
                for mes in ett.message_set.all():
                    print "message", mes
                    msgs_id.append(mes.uid)
            msgs = Message.objects.filter(uid__in=msgs_id)        
            for msg in msgs:
                response['msg'].append(msg.getKeyAttr())
        return HttpResponse(json.dumps(response), mimetype='application/json')
    return
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
