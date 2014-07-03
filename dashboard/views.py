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
from itertools import chain
import copy
import sys
from time import strftime, gmtime
import datetime
from dateutil import parser
from datetime import timedelta
import pytz
import sys  
from django.template.loader import render_to_string
reload(sys)  
sys.setdefaultencoding('utf8')  

linkCount = 0
def LinkNum(request):
    global linkCount
    linkCount +=1
    response = {}
    response['NewLinkNum'] = str(linkCount)
    return HttpResponse(json.dumps(response), mimetype='application/json')

def get_table(request):
    global linkCount
    linkCount += 1
    table_type = request.REQUEST.get('table_type', '')
    headers = request.POST.getlist('headers[]')
    response = {}
    response['html'] = render_to_string("dashboard/table.html", {'table_type': table_type, 'columns': headers, 'id': str(linkCount)})
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

def getData(request):
    response = {}
    response['events'] = []
    ids = request.POST.getlist('id[]', None)
    dtype = request.REQUEST.get('type', None)
    if ids == []:
        events = Event.objects.all().order_by('date_begin')
        
    else:
        if dtype == "event":
            print "event set condition is not empty", ids
            events = Event.objects.filter(id__in=ids).order_by('date_begin')
        elif dtype == "message":
            print "message set condition is not empty", ids
            msgs = Message.objects.filter(uid__in=ids)
            evt_id = []
            for msg in msgs:
                msg_events = msg.event.all()
                for eve in msg_events:
                    print eve.id
                    evt_id.append(eve.id)
            events = Event.objects.filter(id__in=evt_id)
        elif dtype == "entity":
            print "entity set condition is not empty", ids
            src_entt = Entity.objects.filter(id__in=ids)
            ett_id = []
            linked_entities = list(src_entt.select_subclasses())
            for ett in src_entt:
                entities = list(chain(ett.findTargets(), ett.findSources()))
                linked_entities+=entities
            for single_ett in linked_entities:
                if(single_ett.id not in ett_id):
                    ett_id.append(single_ett.id)
            events = Event.objects.filter(id__in=ett_id)
        elif dtype == "time":
            start = request.REQUEST.get('start', None)
            end = request.REQUEST.get('end', None)
            events = Event.objects.filter(date__range=[parser.parse(start), parser.parse(end)])

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

def notes(request):
    print "enter get Notes"
    response={}
    response["notes"] =[]
    author = 1
    nt_type = request.REQUEST.get('type')
    if nt_type == "user_all":
        for note in Note.objects.filter(author_id = author):
            print "enter Filter Note Object"
            note_info = {}
            note_info["id"] = str(note.id)
            note_info["author"] = str(note.author_id)
            pir_brief = PIR.objects.filter(id=note.pir_id)
            note_info["pir"] = str(pir_brief)
            note_info["title"] = note.title
            note_info["content"] = str(note.content)
            note_info["published"] = note.published
            note_info["created_at"] = strftime("%m/%d/%y %H:%M:%S", note.date_created.timetuple())
            note_info['updated_at'] = strftime("%m/%d/%y %H:%M:%S", note.date_updated.timetuple())
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
            note_info["created_at"] = strftime("%m/%d/%y %H:%M:%S", note.date_created.timetuple())
            note_info['updated_at'] = strftime("%m/%d/%y %H:%M:%S", note.date_updated.timetuple())
            response["notes"].append(note_info) 

    return HttpResponse(json.dumps(response), mimetype='application/json')

# def switchNote(mode):
#     return {
#         'edit': 1,
#         'b': 2,
#         }.get(x, 9) 

def visRetrieve(request):
    print "enter vis Retrieve"
    response={}
    vid = request.REQUEST.get('visID')
    print vid
    visrec = Vis.objects.get(id = vid)
    response["html"] = visrec.vis 
    response["author"] = visrec.author_id
    response["note"]=visrec.note_id
    response["type"] = visrec.type 
    return HttpResponse(json.dumps(response), mimetype='application/json')


