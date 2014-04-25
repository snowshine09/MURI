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
        srcData = data;
        return data;
        alert("end loading data!");

    });
    //alert("end of create source");
}

function CopySource() {
    var response = {};
    response['set'] = crossfilter(srcData); //jQuery.extend(true, {}, sourceDataset);
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
    $("#progressbar").progressbar({
        value: false
    });
    CreateSource();
    $("#progressbar").remove();


});

//dynamic generation coordinated windows
function generateOthers(div, vis) {
    alert(div + vis);
    self = {};
    self.SID = div.split("_")[2];
    self.Type = div.split("_")[0].split("#")[1];

    switch (vis) {
        case "Timeline":
            // alert("Yet to come");
            break;
        case "Map":
            // alert("Yet to come");
            break;
        case "Network":
            // var nwNo = (Object.keys(network).length + 1).toString(),
            //     nw = "network_" + self.SID + '_' + nwNo,
            //     sbar = "nw-selectbar_" + self.SID,
            //     cmb = "nw-combobox_" + self.SID,
            //     cvs = "nw-cvs_" + self.SID;
            var vardlg = "network_dlg_" + self.SID,
                varbar = "network_selectbar_" + self.SID,
                cvs = "network_cvs_" + self.SID;
            if (document.getElementById(vardlg)) {
                break;
            }
            $("#network").clone().attr("id", vardlg).dialog($.extend({
                title: "Network of Link " + self.SID,
                close: function(event, ui) {
                    var tmp = $(this).attr("id"),
                        sid = tmp.split("_")[2];
                    delete network[sid];
                    $(this).dialog('destroy').remove();
                },
            }, dialogOptions))
                .dialogExtend(dialogExtendOptions);
            $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
            $('#' + vardlg + ' > div:eq(1)').attr("id", cvs); //getThis = $('#mainDiv > div:eq(0) > div:eq(1)');
            network[self.SID] = new SIIL.Network("#" + cvs);
            network[self.SID].update();

            break;

        case "Messages":
            var vardlg = "message_dlg_" + self.SID,
                vartb = "message_tb_" + self.SID,
                varbar = "message_selectbar_" + self.SID;
            if (document.getElementById(vardlg)) {
                break;
            }
            $("#message_dlg").clone().attr("id", vardlg).dialog($.extend({
                title: "Messages of Link " + self.SID,
                position: ['left', 36],
                close: function(event, ui) {
                    var tmp = $(this).attr("id"),
                        sid = tmp.split("_")[2],
                        tb = "message_tb_" + sid;
                    // alert(tmp);
                    delete messageTable[sid];
                    $(this).dialog('destroy').remove();
                },
                resize: function() {
                    messageTable[self.SID].resize();
                },
                height: 800
            }, dialogOptions))
                .dialogExtend(dialogExtendOptions);
            $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
            $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
            alert(vartb);
            messageTable[self.SID] = new SIIL.DataTable("#" + vartb); //messageTable's key should include both Id and subID related to the vis type
            messageTable[self.SID].update();
            break;
        case "Events":
            var vardlg = "event_dlg_" + self.SID,
                vartb = "event_tb_" + self.SID,
                varbar = "event_selectbar_" + self.SID;
            if (document.getElementById(vardlg)) {
                break;
            }
            $("#event_dlg").clone().attr("id", vardlg).dialog($.extend({
                title: "Events of Link " + self.SID,
                position: ['left', 36 + 800],
                close: function(event, ui) {
                    var tmp = $(this).attr("id"),
                        sid = tmp.split("_")[2],
                        tb = "event_tb_" + sid;
                    alert(sid);
                    delete eventTable[sid];
                    if ($('#' + tb).hasClass('row_selected')) {
                        dataset[sid]['dEvent'].filterAll();
                        renderAllExcept([tb]);
                        $('#' + tb).removeClass('row_selected');
                    }
                    $(this).dialog('destroy').remove();
                },
                resize: function() {
                    //eval(vartb+'\.resize();');
                    eventTable[self.SID].resize();
                },
                height: 800
            }, dialogOptions))
                .dialogExtend(dialogExtendOptions);
            $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
            $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
            eventTable[self.SID] = new SIIL.DataTable("#" + vartb); //messageTable's key should include both Id and subID related to the vis type
            eventTable[self.SID].update();
            break;
        case "People":
            var vardlg = "person_dlg_" + self.SID,
                vartb = "person_tb_" + self.SID,
                varbar = "person_selectbar_" + self.SID;
            if (document.getElementById(vardlg)) {
                break;
            }
            $("#person_dlg").clone().attr("id", vardlg).dialog($.extend({
                title: "People of Link " + self.SID,
                position: ['left', 36 + 800 * 2],
                close: function(event, ui) {
                    var tmp = $(this).attr("id");
                    // alert(tmp);
                    delete personTable[tmp.split("_")[1]];
                    $(this).dialog('destroy').remove();
                },
                resize: function() {
                    //eval(vartb+'\.resize();');
                    personTable[self.SID].resize();
                },
                height: 800
            }, dialogOptions))
                .dialogExtend(dialogExtendOptions);
            $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
            $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
            personTable[self.SID] = new SIIL.DataTable("#" + vartb); //messageTable's key should include both Id and subID related to the vis type
            personTable[self.SID].update();

            break;

    }

}
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
    var toDraw = [],
        except = [],
        SID = charts[0].split("_")[2];
    switch (charts[0].split("_")[0]) {
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
        case "network":
            except = ["network"]
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