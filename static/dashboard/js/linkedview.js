// var dDate // date dimension
//     , gDate // group by date
//     , dFootprint, dPerson, dOrganization, dEvent, dResource, dMessage, gAll // group for all
//     ;

var formatNumber = d3.format(",d"),
    formatChange = d3.format("+,d"),
    formatDate = d3.time.format("%B %d, %Y"),
    formatTime = d3.time.format("%I:%M %p");

var network = {};
var map = {};
var timeline = {};
var resourceTable = {};
var personTable = {};
var organizationTable = {};
var messageTable = {};
var workbench = {};
var eventTable = {};
var locationTable = {};
var sourceDataset = {};
var srcData = null;
var dataset = {};

function CreateSource() {
    d3.json("data", function(error, result) {
        // Various formatters.
        var data = result.events;
        var wktParser = new OpenLayers.Format.WKT();
        var footprints = [];

        data.forEach(function(d, i) {
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

        // A nest operator, for grouping the flight list.
        // var nestByDate = d3.nest()
        //   .key(function(d) { return d3.time.day(d.date); });

        // Create the crossfilter for the relevant dimensions and groups.
        //global sourceDataset;
        //sourceDataset = crossfilter(data);
        srcData = data;
        return data;
        // //gAll = sourceDataset.groupAll();
        // dDate = sourceDataset.dimension(function(d) {
        //     return d.date;
        // });
        // dFootprint = sourceDataset.dimension(function(d) {
        //     return [d.footprint.uid, d.footprint.name, d.footprint.shape, d.footprint.srid];
        // });
        // gDate = dDate.group(d3.time.day);
        // dResource = sourceDataset.dimension(function(d) {
        //     var res = d.resource;
        //     return [res.uid, res.name, res.condition, res.resource_type];
        // });
        // dEvent = sourceDataset.dimension(function(d) {
        //     return [d.uid, d.name, d.types, d.excerpt, d.date];
        // });
        // dPerson = sourceDataset.dimension(function(d) {
        //     return [d.person.uid, d.person.name, d.person.gender, d.person.race, d.person.nationality];
        // });
        // dOrganization = sourceDataset.dimension(function(d) {
        //     var org = d.organization;
        //     return [org.uid, org.name, org.types, org.nationality, org.ethnicity, org.religion];
        // });
        // dMessage = sourceDataset.dimension(function(d) {
        //     var mes = d.message;
        //     return [mes.uid, mes.content, mes.date]
        // });
    alert("end loading data!");

    });
    //alert("end of create source");
}

function CopySource() {
    var response = {};
    response['set'] = crossfilter(srcData);//jQuery.extend(true, {}, sourceDataset);
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
    return response;
}
$(document).ready(function() {
    // show progress bar before data is loaded
    alert("progress");
    $("#progressbar").progressbar({
        value: false
    });
    CreateSource();
    alert("end");
    $("#progressbar").remove();


});
//
//
// Renders the specified chart or list.
function render(method) {
    d3.select(this).call(method); // I don't understand, what method is being called?
}

// Whenever the brush moves, re-render everything.
function renderAll() {
    if (map) {
        map.update();
    }
    renderAllButMap();
}

function renderAllExcept(charts) {
    var toDraw = [],except = [], SID = charts[0].split("_")[2];
    switch(charts[0].split("_")[0]){
        case "location":
            except = ["locationTable"]
            break;
        case "message":
            except = ["messageTable"]
            break;
        case "event":
            except = ["eventTable"]
            break;
        case "resource":
            except = ["resourceTable"]
            break;
        case "person":
            except = ["personTable"]
            break;
        case "organization":
            except = ["organizationTable"]
            break;
    }
    var all = ['map', 'locationTable', 'timeline', 'network', 'personTable', 'messageTable', 'resourceTable', 'eventTable', 'organizationTable'];
    for (var i = 0, len = all.length; i < len; i++) {
        if (except.indexOf(all[i]) === -1) {
            toDraw.push(all[i])
        }
    }
    for (var i = 0, len = toDraw.length; i < len; i++) {
        switch (toDraw[i]) {
            case "map":
                if (map[SID]) map[SID].update();
                break;
            case "timeline":
                if (timeline[SID]) timeline[SID].each(render);
                break;
            case "network":
                if (network[SID]) network[SID].update();
                break;
            case "personTable":
                if (personTable[SID]) personTable[SID].update();
                break;
            case "messageTable":
                if (messageTable[SID]) messageTable[SID].update();
                break;
            case "locationTable":
                if (locationTable[SID]) locationTable[SID].update();
                break;
            case "resourceTable":
                if (resourceTable[SID]) resourceTable[SID].update();
                break;
            case "eventTable":
                if (eventTable[SID]) eventTable[SID].update();
                break;
            case "organizationTable":
                if (organizationTable[SID]) organizationTable[SID].update();
                break;
        }
    }

}

function renderAllButNetwork() {
    if (map) {
        map.update();
    }
    if (timeline) {
        timeline.each(render);
    }
    if (eventTable) {
        eventTable.update();
    }
    if (locationTable) {
        locationTable.update();
    }
    if (messageTable) {
        messageTable.update();
    }
    if (resourceTable) {
        resourceTable.update();
    }
    if (organizationTable) {
        organizationTable.update();
    }
    if (personTable) {
        personTable.update();
    }

}

function renderAllButMap() {
    if (timeline) {
        timeline.each(render);
    }
    if (messageTable) {
        messageTable.update();
    }
    if (resourceTable) {
        resourceTable.update();
    }
    if (locationTable) {
        locationTable.update();
    }
    if (eventTable) {
        eventTable.update();
    }
    if (organizationTable) {
        organizationTable.update();
    }
    if (personTable) {
        personTable.update();
    }
    if (network) {
        network.update();
    }
}

function highlight(footprint_id) {
    if (map) map.highlight([footprint_id]);
    //  var eve = null; // the target event
    //  var NoException = {};
    //  try {
    //      // NoException: dirty trick to do 'break' in forEach
    //      dDate.top(Infinity).forEach(function(p, i) {
    //          if (p.id == event_id) {
    //              eve = p;
    //              throw NoException;
    //          }
    //      });
    //  } catch(e) {
    //      if (e !== NoException) throw e;
    //      var footprints_id = [];
    //      for (var i = 0; i < eve.footprints.length; i++) {
    //          footprints_id.push(eve.footprints[i].id);
    //      }
    //      if (map) {
    //          map.highlight(footprints_id);
    //      }
    //  }
}

function highlightFromNetwork(ids) {
    for (var i = 0, len = ids.length; i < len; i++) {
        dDate.top(Infinity).forEach(function(p, i) {});
    }
}

function unhighlightFromNetwork(ids) {
    for (var i = 0, len = ids.length; i < len; i++) {}
}