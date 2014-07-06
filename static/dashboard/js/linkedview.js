var formatNumber = d3.format(",d"),
	formatChange = d3.format("+,d"),
	formatDate = d3.time.format("%B %d, %Y"),
	formatTime = d3.time.format("%I:%M %p");

var tables = {
	'event': {},
	'location': {},
	'message': {},
	'person': {},
	'organization': {},
	'resource': {}
};
var network = {};
var map = {};
var timelineset = {};
var workbench = {};
var sourceDataset = {};
var dataset = {};
var DlgTcolor = {};
var dindex = {}; //for brushing, record selected entities' indexes
var msgID = {};
var timeextent = {}; //two elements array to control and reflect change of timeline
var htimeline = {}; //discontinuous time
var hshape = {};
var visxml = {};
var cindex = {};

function CreateSource(param, callback) {
	var response = {}
	$.post("data", param, function(result) {
		// Various formatters.
		var dsource = result.events;
		var wktParser = new OpenLayers.Format.WKT();
		var footprints = [];

		dsource.forEach(function(d, i) {
			d.date = new Date(d.date);
			var fp = d.footprint;
			if (fp.shape) {
				var feature = wktParser.read(fp.shape);
				var origin_prj = new OpenLayers.Projection("EPSG:" + fp.srid);
				var dest_prj = new OpenLayers.Projection("EPSG:900913");
				feature.geometry.transform(origin_prj, dest_prj); // projection of google map
				feature.attributes.id = fp.uid;
				feature.attributes.name = fp.name;
				fp.shape = feature;
			}
		});

		response['set'] = crossfilter(dsource); //jQuery.extend(true, {}, sourceDataset);
		response['dDate'] = response['set'].dimension(function(d) {
			return d.date;
		});
		response['dFootprint'] = response['set'].dimension(function(d) {
			return [d.footprint.uid, d.footprint.name, d.footprint.shape, d.footprint.srid];
		});
		response['gDate'] = response['dDate'].group(d3.time.day);
		response['dResource'] = response['set'].dimension(function(d) {
			var res = d.resource;
			return [res.uid, res.name, res.condition, res.resource_type];
		});
		response['dEvent'] = response['set'].dimension(function(d) {
			return [d.uid, d.name, d.types, d.excerpt, d.date];
		});
		response['dPerson'] = response['set'].dimension(function(d) {
			return [d.person.uid, d.person.name, d.person.gender, d.person.race, d.person.nationality];
		});
		response['dOrganization'] = response['set'].dimension(function(d) {
			var org = d.organization;
			return [org.uid, org.name, org.types, org.nationality, org.ethnicity, org.religion];
		});
		response['dMessage'] = response['set'].dimension(function(d) {
			var mes = d.message;
			return [mes.uid, mes.content, mes.date]
		});
		if ("function" === typeof callback) {
			callback(response);
		}
	});
}

//dynamic generation coordinated windows
function generateOthers(div, vis) { //div is source, vis is target

	self = {};
	self.SID = div.split("_")[2];
	self.Type = div.split("_")[0];
	var target = {};
	target.Type = vis.split("_")[0]; // e.g. message_self , message_subset
	target.Src = vis.split("_")[1];

	switch (target.Src) {
		case 'self': //data equivalent
			switch (target.Type) {
				case "timeline":
					createTimeline(self.SID, null);
					break;
				case "map":
					createMap(self.SID, null);
					break;
				case "network":
					createNetwork(self.SID, null);
					break;
				case "message":
					createDialog('message', self.SID, null);
					msgID[self.SID] = [];
					break;
				case "event":
				case "person":
				case "organization":
				case "resource":
					createDialog(target.Type, self.SID, null);
					break;
				case "location":
					createDialog('location', self.SID, null);
					if (hshape[self.SID] == undefined) hshape[self.SID] = [];
					break;
			}
			break;
		case 'subset': //self is like the source related info, whilst the result related is the target subset
			var count = 0;

			if (self.Type == 'message' && msgID[self.SID].length == 0) {
				alert("Nothing is selected for further subfiltering from " + div + "! (Select first please!)");
				break;
			} else if (self.Type == 'timeline' && timeextent[self.SID].length == 0) {
				alert("Nothing is selected for further subfiltering from " + div + "! (Select first please!)");
				break;
			} else if (dindex[self.SID].length == 0) {
				alert("Nothing is selected for further subfiltering from " + div + "! (Select first please!)");
				break;
			}
			$.ajaxSetup({
				async: false
			});

			switch (self.Type) {
				case 'map':
					break;
				case 'message':
					createDialog('message', null, {
						'type': 'message',
						'id': msgID[self.SID],
						'self_id': self.SID
					});
					break;
				case 'event':
					createDialog('event', null, {
						'type': 'event',
						'id': dindex[self.SID]
					});
					break;
				case 'person':
				case 'organization':
				case 'location':
				case 'resource':
					createDialog(self.Type, null, {
						'type': 'event',
						'id': dindex[self.SID]
					});
					break;
				case 'network':
					createNetwork(null, {
						'type': 'entity',
						'id': dindex[self.SID]
					});
					break;
				case 'timeline':
					createTimeline(null, {
						'type': 'time',
						'start': timeextent[self.SID][0],
						'end': timeextent[self.SID][1]
					});
			}
			break;
	}
}
//
// Renders the specified chart or list.
function render(method) {
	d3.select(this).call(method); // I don't understand, what method is being called?
}

// Whenever the brush moves, re-render everything.
function renderAll(sid) {
	if (map[sid]) {
		map[sid].update();
	}
	renderAllButMap(sid);
}

function renderAllExcept(except_name, coorType) {
	var toDraw = [],
		except_type = except_name.split("_")[0],
		SID = except_name.split("_")[2];

	var all = ['map', 'location', 'timeline', 'network', 'person', 'message', 'resource', 'event', 'organization'];
	for (var i = 0, len = all.length; i < len; i++) {
		if (all[i] != except_type) {
			toDraw.push(all[i])
		}
	}
	for (var i = 0, len = toDraw.length; i < len; i++) {
		switch (toDraw[i]) {
			case "map":
				if (map[SID]) map[SID].update(coorType);
				break;
			case "timeline":
				if (timelineset[SID]) timelineset[SID].update();
				break;
			case "network":
				if (network[SID]) network[SID].update(coorType);
				break;
			case "person":
			case "message":
			case "location":
			case "resource":
			case "event":
			case "organization":
				if (tables[toDraw[i]][SID]) tables[toDraw[i]][SID].update(coorType);
				break;
		}
	}
}

function renderAllButNetwork(sid) {
	if (map[sid]) {
		map[sid].update();
	}
	if (timeline[sid]) {
		timeline[sid].each(render);
	}
}

function renderAllButMap(sid) {
	if (timeline[sid]) {
		timeline[sid].each(render);
	}
	if (tables['event'][sid]) {
		tables['event'][sid].update();
	}
	if (tables['location'][sid]) {
		tables['location'][sid].update();
	}
	if (tables['message'][sid]) {
		tables['message'][sid].update();
	}
	if (tables['resource'][sid]) {
		tables['resource'][sid].update();
	}
	if (tables['organization'][sid]) {
		tables['organization'][sid].update();
	}
	if (tables['person'][sid]) {
		tables['person'][sid].update();
	}
	if (network[sid]) {
		network[sid].update();
	}
}

function highlight(footprint_id) {
	if (map) {
		map.highlight([footprint_id]);
	}
}

function highlightFromNetwork(ids) {
	for (var i = 0, len = ids.length; i < len; i++) {
		dDate.top(Infinity).forEach(function(p, i) {});
	}
}

function unhighlightFromNetwork(ids) {
	for (var i = 0, len = ids.length; i < len; i++) {}
}

function showcontext(event) {
	event.preventDefault();
	console.log(event.target);
	alert("showcontext");
	var parentID = event.target.parentElement.parentElement.parentElement.id.split("_")[2],
		parentType = event.target.parentElement.parentElement.parentElement.id.split("_")[0];
	cindex[parentID] = [];
	switch (parentType) {
		case "message":

			break;
		default:
			break;
	}

}