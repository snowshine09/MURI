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
var dataset = {};
var DlgTcolor = {};
var dindex = {}; //for brushing, record selected entities' indexes
var msgID = {};
var timeextent = {}; //two elements array to control and reflect change of timeline
var htimeline = {}; //discontinuous time
var visxml = {};
var cindex = {};


//dynamic generation coordinated windows
function generateOthers(div, vis) { //div is source, vis is target

	self = {};
	self.SID = div.split("_")[2];
	self.Type = div.split("_")[0];
	var target = {};
	target.Type = vis.split("_")[0];
	target.Src = vis.split("_")[1];

	switch (target.Src) {
		case 'self': // in existing link
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
				case "event":
				case "person":
				case "organization":
				case "resource":
                case "location":
					createDialog(target.Type, self.SID, null);
					break;
			}
			break;
		case 'subset':
			var count = 0;

			if (self.Type == 'message' && msgID[self.SID].length == 0) {
				alert("Nothing is selected for further subfiltering from " + div + "! (Select first please!)");
				break;
			} else if (self.Type == 'timeline' && htimeline[self.SID].length == 0) {
				alert("Nothing is selected for further subfiltering from " + div + "! (Select first please!)");
				break;
			} else if (dindex[self.SID].length == 0) {
				alert("Nothing is selected for further subfiltering from " + div + "! (Select first please!)");
				break;
			}
			switch (self.Type) {
				case 'map':
					break;
				case 'message':
					createDialog('message', null, {
						'filter_type': 'message',
						'id': msgID[self.SID],
					});
					break;
				case 'event':
					createDialog('event', null, {
						'filter_type': 'event',
						'id': dindex[self.SID]
					});
					break;
				case 'person':
				case 'organization':
				case 'location':
				case 'resource':
					createDialog(self.Type, null, {
						'filter_type': 'event',
						'id': dindex[self.SID]
					});
					break;
				case 'network':
					createNetwork(null, {
						'filter_type': 'event',
						'id': dindex[self.SID]
					});
					break;
				case 'timeline':
					createTimeline(null, {
						'filter_type': 'timeline',
						'start': htimeline[self.SID][0],
						'end': htimeline[self.SID][htimeline[self.SID].length - 1]
					});
			}
			break;
	}
}

function renderAllExcept(self_name, SID, type) {
	var toDraw = []
	var all = ['map', 'location', 'timeline', 'network', 'person', 'message', 'resource', 'event', 'organization'];
	for (var i = 0; i < all.length; i++) {
		if (all[i] != self_name) {
			toDraw.push(all[i])
		}
	}
	for (var i = 0; i < toDraw.length; i++) {
		switch (toDraw[i]) {
			case "map":
				if (map[SID]) map[SID].update();
				break;
			case "timeline":
				if (timelineset[SID]) timelineset[SID].update();
				break;
			case "network":
				if (network[SID]) network[SID].update(type);
				break;
			case "person":
			case "message":
			case "location":
			case "resource":
			case "event":
			case "organization":
				if (tables[toDraw[i]][SID]) tables[toDraw[i]][SID].update(type);
				break;
		}
	}
}

function propagate(self_type, SID, source_ids, callback) {
    var param = {};
    msgID[SID] = [];
    dindex[SID] = [];
    htimeline[SID] = [];
    if (self_type === 'message') {
        param['msg_ids'] = source_ids;
        msgID[SID] = source_ids;
    } else { // propagate from entities
        param['entity_ids'] = source_ids;
        dindex[SID] = source_ids;
    }
    if (source_ids.length > 0) {
        $.ajax({
            url: 'propagate/',
            type: 'post',
            async: false,
            data: param,
            success: function(eid) {
                dindex[SID] = eid['ett_idset'];
                msgID[SID] = eid['msg_idset'];
                for (var i = 0; i < eid['dateset'].length; i++) {
                    htimeline[SID].push(new Date(eid['dateset'][i]))
                }
                renderAllExcept(self_type, SID, "brush");
                if ('function' === typeof callback) {
                    callback();
                }
            }
        });
    } else {
        renderAllExcept(self_type, SID, "brush");
    }
}

function highlight(footprint_id) {
	if (map) {
		map.highlight([footprint_id]);
	}
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