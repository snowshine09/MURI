# Create your views here.
from models import PIR, IW, Note
import json
from django.views.decorators.http import require_GET
from django.http import HttpResponse
from dateutil import parser
from HTMLParser import HTMLParser, HTMLParseError
#from django.template import RequestContext
from django.views.decorators.csrf import csrf_protect, csrf_exempt

# @require_GET
# def getPIRs(request):
# 	res = []
# 	pirs = PIR.objects.all().order_by("-date_created")
# 	for pir in pirs:
# 		pir_unit = {}
# 		pir_unit["pir"] = {}
# 		pir_unit["pir"]["name"] = pir.name
# 		pir_unit["pir"]["id"] = pir.id
# 		pir_unit["iw"] = []

# 	iws = pir.iw_set.all()
# 	for iw in iws:
# 		pir_unit["iw"].append(iw.content)
# 	try:
# 		note = Note.objects.get(pir=pir)
# 	except Note.DoesNotExist:
# 		pir_unit["note"] = {}
# 		res.append(pir_unit)
# 	else:
# 		pir_unit["note"] = {}
# 		pir_unit["note"]["content"] = note.content
# 		pir_unit["note"]["date_created"] = note.date_created.strftime('%m/%d/%Y')
# 		res.append(pir_unit)

# 	return HttpResponse(json.dumps(res), mimetype='application/json')

# @require_GET
# def getNote(request, pir):
# 	res = {}
# 	pir = int(pir)
# 	try:
# 		pir = PIR.objects.get(id=pir)
# 	except PIR.DoesNotExist:
# 		print "Warning: unknown pir requested"
# 		return
# 	else:
# 		note = Note.objects.get(pir=pir)
# 		res["content"] = note.content
# 		res["title"]   = note.title
# 	return HttpResponse(json.dumps(res), mimetype='application/json')

@csrf_exempt
def storeNote(request):
	print "enter storeNote"
	response = {}
	response['success'] = True
	NoteId = request.REQUEST.get('id')
	content = request.REQUEST.get('content')
	if int(NoteId) <= 0:
		# a new note is to be added to the databse
		try:
			addNote(True, request)
		except Exception as e:
			response['success'] = False
			response['errors'] = str(e)
	if int(NoteId) > 0:
		if len(content) == 0:
			# delete a note
			try:
				note = Note.objects.get(id=NoteId)
				note.delete();
			except Exception as e:
				response['success'] = False
				response['errors'] = str(e)
			return HttpResponse(json.dumps(response), mimetype='application/json')
		else:
			# edit an existing note
			try:
				addNote(False, request)
			except Exception as e:
				response['success'] = False
				response['errors'] = str(e)
	if response['success'] == False:
		return HttpResponse(json.dumps(response), mimetype='application/json', status=403)
	else:
		return HttpResponse(json.dumps(response), mimetype='application/json')

# @transaction.commit_on_success
@csrf_exempt
def addNote(new, request):
	print "enter addNote"
	# userId = "fake me!" #request.session['currUserId']
	content = request.REQUEST.get('content')
	NoteId = request.REQUEST.get('id')

	timeCreated = request.REQUEST.get('timeCreated')
	timeUpdated = request.REQUEST.get('timeUpdated')
	publish = request.REQUEST.get('published')
	xml = request.REQUEST.get('visxml')
	if (publish == "true"):
		publish_value = True
	else:
		publish_value = False


	author = 1 #User.objects.get(id=int(userId))

	try:
		if new:
			newnote = Note(content=content, author_id=author, date_created = parser.parse(timeCreated), date_updated=parser.parse(timeUpdated), published=publish_value,vis = xml)
		else:
			note = Note.objects.get(id=NoteId)
			timeCreated = note.created_at # get the original create time
			note.delete(); # also deletes all citations items with "note"
			newnote = Note(id=NoteId, content=content, author=author, forum=forum, created_at=timeCreated, updated_at=parser.parse(timeUpdated), published=publish_value,vis = xml)
		newnote.save();
	 
	except Note.DoesNotExist:
		print "Note does not exist"
		raise
	except Exception as e:
		raise