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
var timelineset = {};
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
var gCondition = {};
var DlgTcolor = {};
var dindex = {}; //for brushing, record selected entities' indexes
var msgID = {};
var timeextent = {}; //two elements array to control and reflect change of timeline
var htimeline = {}; //discontinuous time
var hshape = {};

function CreateSource() {
    $.post("data", null, function(result) {
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
    });
}

function CopySource(rawdata) {
    //alert("enterCopy=>rawdata:" + rawdata);
    var response = {},
        dsource = rawdata || srcData;
    if (rawdata) {
        alert(rawdata.length + " is raw ; " + srcData.length + "is sourceCopy; !! USED is" + dsource.length);
    }
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

// function FilterSource(cond, newSID, vis) {
//     var instances = null;
//     // $.ajax({
//     //     url: 'data',
//     //     type: "POST",
//     //     data: cond,
//     alert("inside FIlter condition =" + cond);
//     $.post("data", cond, function(dt, status) {
//         // success: function(result) {
//         console.log("cond:" + cond);
//         console.log("dt:" + dt);
//         alert("Filter from backend:" + dt.events);

//         instances = dt.events;
//         var wktParser = new OpenLayers.Format.WKT();
//         var footprints = [];
//         instances.forEach(function(d, i) {
//             alert(d.date);
//             d.date = new Date(d.date);
//             var fp = d.footprint;
//             if (fp.shape) {
//                 var feature = wktParser.read(fp.shape);
//                 var origin_prj = new OpenLayers.Projection("EPSG:" + fp.srid);
//                 var dest_prj = new OpenLayers.Projection("EPSG:900913");
//                 feature.geometry.transform(origin_prj, dest_prj); // projection of google map
//                 feature.attributes.id = fp.uid;
//                 feature.attributes.name = fp.name;
//                 fp.shape = feature;
//             }
//         });


//         // },
//         // failure: function(xhr) {
//         //     alert("failed to add claim!");
//         // },
//         alert("FilterSource returns " + instances.length + " first event is " + instances);
//         dataset[newSID] = CopySource(instances);
//         delete gCondition["events_id"];

//         network[newSID].update();
//     });

// }
//dynamic generation coordinated windows
function generateOthers(div, vis, arg) { //div is source, vis is target

    self = {};
    self.SID = div.split("_")[2];
    self.Type = div.split("_")[0];
    var target = {};
    target.Type = vis.split("_")[0]; // e.g. message_self , message_subset
    target.Src = vis.split("_")[1];


    switch (target.Src) { //data source /result sets are equivalent or not
        case 'self': //data equivalent
            switch (target.Type) {
                case "timeline":
                    var vardlg = "timeline_dlg_" + self.SID,
                        varbar = "timeline_selectbar_" + self.SID,
                        cvs = "timeline_cvs_" + self.SID;
                    if (document.getElementById(vardlg)) {
                        break;
                    }
                    var opt = $.extend({
                        title: "Timeline of Link " + self.SID
                    }, dialogOptions);
                    opt.height = 400;
                    opt.width = 1000;
                    // htimeline[self.SID] = [];
                    timeextent[self.SID] = [];
                    $("#timeline").clone().attr("id", vardlg).dialog(opt)
                        .dialogExtend(dialogExtendOptions);
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > div:eq(2)').attr("id", cvs);
                    timelineset[self.SID] = $("#" + cvs).timeline({
                        "dimension": dataset[self.SID]['dDate'],
                    }).data("vis-timeline");
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[self.SID].red + "," +
                        DlgTcolor[self.SID].green + "," +
                        DlgTcolor[self.SID].blue + ")"
                    );
                    timelineset[self.SID].update();
                    break;
                case "map":
                    var vardlg = "map_dlg_" + self.SID,
                        varbar = "map_selectbar_" + self.SID,
                        cvs = "map_cvs_" + self.SID;
                    if (document.getElementById(vardlg)) {
                        break;
                    }
                    var opt = $.extend({
                        title: "Map of Link " + self.SID
                    }, dialogOptions);
                    $("#map").clone().attr("id", vardlg).dialog(opt)
                        .dialogExtend(dialogExtendOptions);
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > div:eq(2)').attr("id", cvs);
                    map[self.SID] = $("#" + cvs).vismap({
                        "dimension": dataset[self.SID]['dFootprint'],
                    }).data("vis-vismap");
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[self.SID].red + "," +
                        DlgTcolor[self.SID].green + "," +
                        DlgTcolor[self.SID].blue + ")"
                    );
                    if(hshape[self.SID] == undefined)hshape[self.SID] = [];
                    map[self.SID].update("init");
                    break;
                case "network":
                    // var vardlg = "network_dlg_" + self.SID,
                    //     varbar = "network_selectbar_" + self.SID,
                    //     cvs = "network_cvs_" + self.SID,
                    //     bbar = "network_brush_" + self.SID,
                    //     pbar = "network_pan_" + self.SID;
                    // $("#network").clone().attr("id", vardlg).dialog($.extend({
                    //     title: "Network of Link " + self.SID,
                    //     resizeStop: function(event, ui) {
                    //         network[self.SID].resize(); //$('#'+vis+"_cvs_"+).outerWidth() + ", height: " + $(this).outerHeight());
                    //     }
                    // }, dialogOptions))
                    //     .dialogExtend(dialogExtendOptions);
                    // $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    // $('#' + vardlg + ' > div:eq(2)').attr("id", cvs);
                    // $('#' + vardlg + ' > div:eq(1) > div:eq(1)').attr("id", bbar);
                    // $('#' + vardlg + ' > div:eq(1) > div:eq(0)').attr("id", pbar); //getThis = $('#mainDiv > div:eq(0) > div:eq(1)');

                    var vardlg = "network_dlg_" + self.SID,
                        varbar = "network_selectbar_" + self.SID,
                        cvs = "network_cvs_" + self.SID,
                        rs_bar = "network_reset_" + self.SID,
                        ctxt_bar = "network_ctxt_" + self.SID,
                        grav_bar = "network_gravity_" + self.SID,
                        mode_bar = "network_mode_" + self.SID,
                        bbar = "network_brush_" + self.SID,
                        pbar = "network_pan_" + self.SID;
                    if (document.getElementById(vardlg)) {
                        break;
                    }
                    var opt = $.extend({
                        title: "Network of Link " + self.SID,
                        position: ['left', 36],
                        resizeStop: function(event, ui) {
                            network[self.SID].resize();
                        }
                    }, dialogOptions);
                    opt.height = 660;
                    opt.width = 996;
                    $("#network").clone().attr("id", vardlg).dialog(opt)
                        .dialogExtend(dialogExtendOptions);
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > div:eq(1) > div:eq(1)').attr("id", ctxt_bar);
                    $('#' + vardlg + ' > div:eq(1) > div:eq(0)').attr("id", rs_bar);
                    $('#' + vardlg + ' > div:eq(1) > div:eq(2) > div:eq(0)').attr("id", grav_bar);
                    $('#' + vardlg + ' > div:eq(2)').attr("id", mode_bar);
                    $('#' + vardlg + ' > div:eq(2) > div:eq(0) > label:eq(0) > input:eq(0)').attr("id", pbar);
                    $('#' + vardlg + ' > div:eq(2) > div:eq(1) > label:eq(0) > input:eq(0)').attr("id", bbar);
                    $('#' + vardlg + ' > div:eq(3)').attr("id", cvs);
                    network[self.SID] = new SIIL.Network("#" + cvs);
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[self.SID].red + "," +
                        DlgTcolor[self.SID].green + "," +
                        DlgTcolor[self.SID].blue + ")"
                    );
                    network[self.SID].update();
                    break;
                case "message":
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
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[self.SID].red + "," +
                        DlgTcolor[self.SID].green + "," +
                        DlgTcolor[self.SID].blue + ")"
                    );
                    msgID[self.SID] = [];
                    messageTable[self.SID] = new SIIL.DataTable("#" + vartb); //messageTable's key should include both Id and subID related to the vis type
                    messageTable[self.SID].update();
                    break;
                case "event":
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
                            delete eventTable[sid];
                            $(this).dialog('destroy').remove();
                        },
                        resize: function() {
                            eventTable[self.SID].resize();
                        },
                        height: 800
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[self.SID].red + "," +
                        DlgTcolor[self.SID].green + "," +
                        DlgTcolor[self.SID].blue + ")"
                    );
                    eventTable[self.SID] = new SIIL.DataTable("#" + vartb); //messageTable's key should include both Id and subID related to the vis type
                    eventTable[self.SID].update();
                    break;
                case "person":
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
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[self.SID].red + "," +
                        DlgTcolor[self.SID].green + "," +
                        DlgTcolor[self.SID].blue + ")"
                    );
                    personTable[self.SID] = new SIIL.DataTable("#" + vartb); //messageTable's key should include both Id and subID related to the vis type
                    personTable[self.SID].update();

                    break;
                case "organization":
                    var vardlg = "organization_dlg_" + self.SID,
                        vartb = "organization_tb_" + self.SID,
                        varbar = "organization_selectbar_" + self.SID;
                    if (document.getElementById(vardlg)) {
                        break;
                    }
                    $("#organization_dlg").clone().attr("id", vardlg).dialog($.extend({
                        title: "Organizations of Link " + self.SID,
                        position: ['left', 36],
                        resize: function() {
                            //eval(vartb+'\.resize();');
                            organizationTable[self.SID].resize();
                        },
                        height: 800
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                    organizationTable[self.SID] = new SIIL.DataTable("#" + vartb);
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[self.SID].red + "," +
                        DlgTcolor[self.SID].green + "," +
                        DlgTcolor[self.SID].blue + ")"
                    );
                    organizationTable[self.SID].update();
                    break;
                case "resource":
                    var vardlg = "resource_dlg_" + self.SID,
                        vartb = "resource_tb_" + self.SID,
                        varbar = "resource_selectbar_" + self.SID;
                    if (document.getElementById(vardlg)) {
                        break;
                    }
                    $("#resource_dlg").clone().attr("id", vardlg).dialog($.extend({
                        title: "Resources of Link " + self.SID,
                        position: ['left', 36],
                        resize: function() {
                            //eval(vartb+'\.resize();');
                            resourceTable[self.SID].resize();
                        },
                        height: 800
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                    resourceTable[self.SID] = new SIIL.DataTable("#" + vartb);
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[self.SID].red + "," +
                        DlgTcolor[self.SID].green + "," +
                        DlgTcolor[self.SID].blue + ")"
                    );
                    resourceTable[self.SID].update();
                    break;
                case "location":
                    var vardlg = "location_dlg_" + self.SID,
                        vartb = "location_tb_" + self.SID,
                        varbar = "location_selectbar_" + self.SID;
                    if (document.getElementById(vardlg)) {
                        break;
                    }
                    if(hshape[self.SID] == undefined)hshape[self.SID] = [];
                    $("#location_dlg").clone().attr("id", vardlg).dialog($.extend({
                        title: "Locations of Link " + self.SID,
                        position: ['left', 36],
                        close: function(event, ui) {
                            var tmp = $(this).attr("id");
                            // alert(tmp);
                            delete locationTable[tmp.split("_")[2]];
                            $(this).dialog('destroy').remove();
                        },
                        resize: function() {
                            locationTable[self.SID].resize();
                        },
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                    locationTable[self.SID] = new SIIL.DataTable("#" + vartb);
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[self.SID].red + "," +
                        DlgTcolor[self.SID].green + "," +
                        DlgTcolor[self.SID].blue + ")"
                    );
                    locationTable[self.SID].update();
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
            d3.json("dataSetNum", function(error, result) {
                dataset[result.NewLinkNum] = CopySource();
                //alert("length of dataset " + result.NewLinkNum + ' ' + dataset[result.NewLinkNum]['set'].groupAll().value());
                pParam = {};
                switch (self.Type) {
                    case "message":
                        //("before filtering:length of dataset " + result.NewLinkNum + " " + dataset[result.NewLinkNum]['set'].groupAll().value());
                        console.log(dataset[result.NewLinkNum]['dMessage'].top(Infinity));
                        dataset[result.NewLinkNum]['FilterdMessage'] = dataset[result.NewLinkNum]['set'].dimension(function(d) {
                            var mes = d.message;
                            return [mes.uid, mes.content, mes.date]
                        });
                        dataset[result.NewLinkNum]['FilterdMessage'].filter(function(d) {
                            // alert("dMessage dimension data " + d);
                            for (var i = 0; i < msgID[self.SID].length; i++) {
                                if (d[0] === msgID[self.SID][i]) {
                                    return true;
                                }
                            }
                        });
                        //alert("after: length of dataset " + result.NewLinkNum + ' ' + dataset[result.NewLinkNum]['set'].groupAll().value());
                        break;
                    case "timeline":
                        dataset[result.NewLinkNum]['FilterdDate'] = dataset[result.NewLinkNum]['set'].dimension(function(d) {
                            return d.date;
                        });
                        dataset[result.NewLinkNum]['FilterdDate'].filter(function(d) {
                            if (+d.date >= +timeextent[self.SID][0] && +d.date <= +timeextent[self.SID][1]) {
                                //if($.inArray(d.date, htimeline[self.SID]) != -1) {
                                return true;
                            }
                        });
                        break;
                    case "network":
                    case "person":
                    case "organization":
                    case "location":
                    case "resource":
                    case "event":
                        // alert("before filtering:length of dataset " + result.NewLinkNum + " " + dataset[result.NewLinkNum]['set'].groupAll().value());
                        // alert("len of dindex " + dindex[self.SID].length);
                        // console.log(dindex[self.SID]);
                        // console.log(dataset[result.NewLinkNum]['dDate'].top(Infinity));
                        dataset[result.NewLinkNum]['FilterdEvent'] = dataset[result.NewLinkNum]['set'].dimension(function(d) {
                            return [d.uid, d.name, d.types, d.excerpt, d.date];
                        });
                        dataset[result.NewLinkNum]['FilterdEvent'].filter(function(d) {
                            for (var i = 0; i < dindex[self.SID].length; i++) {
                                if (d[0] == dindex[self.SID][i]) {
                                    return true;
                                }
                            }
                        });
                        //alert("after: length of dataset " + result.NewLinkNum + ' ' + dataset[result.NewLinkNum]['set'].groupAll().value());
                        break;
                    default:
                        alert("not captured self type!");
                }

                dindex[result.NewLinkNum] = [];
                msgID[result.NewLinkNum] = [];
                htimeline[result.NewLinkNum] = [];
                switch (target.Type) {
                    case "timeline":
                        timeextent[result.NewLinkNum] = [];
                        var vardlg = "timeline_dlg_" + result.NewLinkNum,
                            varbar = "timeline_selectbar_" + result.NewLinkNum,
                            cvs = "timeline_cvs_" + result.NewLinkNum;
                        var opt = $.extend({
                            title: "Timeline of Link " + result.NewLinkNum,
                            close: function(event, ui) {
                                var tmp = $(this).attr("id");
                                delete timelineset[tmp.split("_")[2]];
                                $(this).dialog('destroy').remove();
                            },
                            resize: function() {
                                timelineset[result.NewLinkNum].resize();
                            }
                        }, dialogOptions);
                        opt.height = 400;
                        opt.width = 1000;
                        timeextent[result.NewLinkNum] = [];
                        $("#timeline").clone().attr("id", vardlg).dialog(opt)
                            .dialogExtend(dialogExtendOptions);
                        $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                        $('#' + vardlg + ' > div:eq(2)').attr("id", cvs);
                        timelineset[result.NewLinkNum] = $("#" + cvs).timeline({
                            "dimension": dataset[result.NewLinkNum]['dDate'],
                        }).data("vis-timeline");
                        $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                            DlgTcolor[result.NewLinkNum].red + "," +
                            DlgTcolor[result.NewLinkNum].green + "," +
                            DlgTcolor[result.NewLinkNum].blue + ")"
                        );
                        timelineset[result.NewLinkNum].update();
                        break;
                    case "map":
                        break;
                    case "network":

                        var vardlg = "network_dlg_" + result.NewLinkNum,
                            varbar = "network_selectbar_" + result.NewLinkNum,
                            cvs = "network_cvs_" + result.NewLinkNum,
                            rs_bar = "network_reset_" + result.NewLinkNum,
                            ctxt_bar = "network_ctxt_" + result.NewLinkNum,
                            grav_bar = "network_gravity_" + result.NewLinkNum,
                            mode_bar = "network_mode_" + result.NewLinkNum,
                            bbar = "network_brush_" + result.NewLinkNum,
                            pbar = "network_pan_" + result.NewLinkNum;
                        var opt = $.extend({
                            title: "Network of Link " + result.NewLinkNum,
                            position: ['left', 36],
                            close: function(event, ui) {
                                var tmp = $(this).attr("id");
                                delete network[tmp.split("_")[2]];
                                $(this).dialog('destroy').remove();
                            },
                            resize: function() {
                                network[result.NewLinkNum].resize();
                            }
                        }, dialogOptions);
                        opt.height = 660;
                        opt.width = 996;
                        $("#network").clone().attr("id", vardlg).dialog(opt)
                            .dialogExtend(dialogExtendOptions);
                        $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                        $('#' + vardlg + ' > div:eq(1) > div:eq(1)').attr("id", ctxt_bar);
                        $('#' + vardlg + ' > div:eq(1) > div:eq(0)').attr("id", rs_bar);
                        $('#' + vardlg + ' > div:eq(1) > div:eq(2) > div:eq(0)').attr("id", grav_bar);
                        $('#' + vardlg + ' > div:eq(2)').attr("id", mode_bar);
                        $('#' + vardlg + ' > div:eq(2) > div:eq(0) > label:eq(0) > input:eq(0)').attr("id", pbar);
                        $('#' + vardlg + ' > div:eq(2) > div:eq(1) > label:eq(0) > input:eq(0)').attr("id", bbar);
                        $('#' + vardlg + ' > div:eq(3)').attr("id", cvs);
                        network[result.NewLinkNum] = new SIIL.Network("#" + cvs);
                        events_id = [];
                        dataset[result.NewLinkNum]['dDate'].top(Infinity).forEach(function(p, i) {
                            events_id.push(p.uid);
                        });
                        data = {};
                        data['events_id'] = events_id;
                        DlgTcolor[result.NewLinkNum] = randomcolor();
                        $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                            DlgTcolor[result.NewLinkNum].red + "," +
                            DlgTcolor[result.NewLinkNum].green + "," +
                            DlgTcolor[result.NewLinkNum].blue + ")"
                        );
                        network[result.NewLinkNum].update();
                        break;
                    case "message":
                        var vardlg = "message_dlg_" + result.NewLinkNum,
                            vartb = "message_tb_" + result.NewLinkNum,
                            varbar = "message_selectbar_" + result.NewLinkNum;
                        if (document.getElementById(vardlg)) {
                            break;
                        }
                        $("#message_dlg").clone().attr("id", vardlg).dialog($.extend({
                            title: "Messages of Link " + result.NewLinkNum,
                            position: ['left', 36],
                            close: function(event, ui) {
                                var tmp = $(this).attr("id"),
                                    sid = tmp.split("_")[2],
                                    tb = "message_tb_" + sid;
                                delete messageTable[sid];
                                $(this).dialog('destroy').remove();
                            },
                            resize: function() {
                                messageTable[result.NewLinkNum].resize();
                            },
                            height: 800
                        }, dialogOptions))
                            .dialogExtend(dialogExtendOptions);
                        $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                        $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                        DlgTcolor[result.NewLinkNum] = randomcolor();
                        $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                            DlgTcolor[result.NewLinkNum].red + "," +
                            DlgTcolor[result.NewLinkNum].green + "," +
                            DlgTcolor[result.NewLinkNum].blue + ")"
                        );
                        messageTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb); //messageTable's key should include both Id and subID related to the vis type
                        messageTable[result.NewLinkNum].update();
                        break;
                    case "event":
                        var vardlg = "event_dlg_" + result.NewLinkNum,
                            vartb = "event_tb_" + result.NewLinkNum,
                            varbar = "event_selectbar_" + result.NewLinkNum;
                        if (document.getElementById(vardlg)) {
                            alert("already exist!");
                            break;
                        }
                        $("#event_dlg").clone().attr("id", vardlg).dialog($.extend({
                            title: "Events of Link " + result.NewLinkNum,
                            position: ['left', 36 + 800],
                            close: function(event, ui) {
                                var tmp = $(this).attr("id"),
                                    sid = tmp.split("_")[2],
                                    tb = "event_tb_" + sid;
                                delete eventTable[sid];
                                $(this).dialog('destroy').remove();
                            },
                            resize: function() {
                                eventTable[result.NewLinkNum].resize();
                            },
                            height: 800
                        }, dialogOptions))
                            .dialogExtend(dialogExtendOptions);
                        $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                        $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                        DlgTcolor[result.NewLinkNum] = randomcolor();
                        $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                            DlgTcolor[result.NewLinkNum].red + "," +
                            DlgTcolor[result.NewLinkNum].green + "," +
                            DlgTcolor[result.NewLinkNum].blue + ")"
                        );
                        eventTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb); //messageTable's key should include both Id and subID related to the vis type
                        eventTable[result.NewLinkNum].update();
                        break;
                    case "person":
                        var vardlg = "person_dlg_" + result.NewLinkNum,
                            vartb = "person_tb_" + result.NewLinkNum,
                            varbar = "person_selectbar_" + result.NewLinkNum;
                        if (document.getElementById(vardlg)) {
                            break;
                        }
                        $("#person_dlg").clone().attr("id", vardlg).dialog($.extend({
                            title: "People of Link " + result.NewLinkNum,
                            position: ['left', 36 + 800],
                            close: function(event, ui) {
                                var tmp = $(this).attr("id");
                                delete personTable[tmp.split("_")[1]];
                                $(this).dialog('destroy').remove();
                            },
                            resize: function() {
                                personTable[result.NewLinkNum].resize();
                            },
                            height: 800
                        }, dialogOptions))
                            .dialogExtend(dialogExtendOptions);
                        $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                        $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                        DlgTcolor[result.NewLinkNum] = randomcolor();
                        $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                            DlgTcolor[result.NewLinkNum].red + "," +
                            DlgTcolor[result.NewLinkNum].green + "," +
                            DlgTcolor[result.NewLinkNum].blue + ")"
                        );
                        personTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb); //messageTable's key should include both Id and subID related to the vis type
                        personTable[result.NewLinkNum].update();

                        break;
                    case "organization":
                        var vardlg = "organization_dlg_" + result.NewLinkNum,
                            vartb = "organization_tb_" + result.NewLinkNum,
                            varbar = "organization_selectbar_" + result.NewLinkNum;
                        $("#organization_dlg").clone().attr("id", vardlg).dialog($.extend({
                            title: "Organizations of Link " + result.NewLinkNum,
                            position: ['left', 36],
                            close: function(event, ui) {
                                var tmp = $(this).attr("id");
                                delete organizationTable[tmp.split("_")[2]];
                                $(this).dialog('destroy').remove();
                            },
                            resize: function() {
                                organizationTable[result.NewLinkNum].resize();
                            },
                            height: 800
                        }, dialogOptions))
                            .dialogExtend(dialogExtendOptions);
                        $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                        $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                        organizationTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                        DlgTcolor[result.NewLinkNum] = randomcolor();
                        $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                            DlgTcolor[result.NewLinkNum].red + "," +
                            DlgTcolor[result.NewLinkNum].green + "," +
                            DlgTcolor[result.NewLinkNum].blue + ")"
                        );
                        organizationTable[result.NewLinkNum].update();
                        break;
                    case "resource":
                        var vardlg = "resource_dlg_" + result.NewLinkNum,
                            vartb = "resource_tb_" + result.NewLinkNum,
                            varbar = "resource_selectbar_" + result.NewLinkNum;
                        $("#resource_dlg").clone().attr("id", vardlg).dialog($.extend({
                            title: "Resources of Link " + result.NewLinkNum,
                            position: ['left', 36],
                            close: function(event, ui) {
                                var tmp = $(this).attr("id");
                                delete resourceTable[tmp.split("_")[2]];
                                $(this).dialog('destroy').remove();
                            },
                            resize: function() {
                                resourceTable[result.NewLinkNum].resize();
                            },
                            height: 800
                        }, dialogOptions))
                            .dialogExtend(dialogExtendOptions);
                        $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                        $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                        resourceTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                        DlgTcolor[result.NewLinkNum] = randomcolor();
                        $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                            DlgTcolor[result.NewLinkNum].red + "," +
                            DlgTcolor[result.NewLinkNum].green + "," +
                            DlgTcolor[result.NewLinkNum].blue + ")"
                        );
                        resourceTable[result.NewLinkNum].update();
                        break;
                    case "location":
                        var vardlg = "location_dlg_" + result.NewLinkNum,
                            vartb = "location_tb_" + result.NewLinkNum,
                            varbar = "location_selectbar_" + result.NewLinkNum;
                        hshape[result.NewLinkNum] = [];
                        $("#location_dlg").clone().attr("id", vardlg).dialog($.extend({
                            title: "Locations of Link " + result.NewLinkNum,
                            position: ['left', 36],
                            close: function(event, ui) {
                                var tmp = $(this).attr("id");
                                delete locationTable[tmp.split("_")[2]];
                                $(this).dialog('destroy').remove();
                            },
                            resize: function() {
                                locationTable[result.NewLinkNum].resize();
                            },
                        }, dialogOptions))
                            .dialogExtend(dialogExtendOptions);
                        $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                        $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                        locationTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                        DlgTcolor[result.NewLinkNum] = randomcolor();
                        $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                            DlgTcolor[result.NewLinkNum].red + "," +
                            DlgTcolor[result.NewLinkNum].green + "," +
                            DlgTcolor[result.NewLinkNum].blue + ")"
                        );
                        locationTable[result.NewLinkNum].update();
                        break;
                    default:
                        alert("not captured target type -- subset goal unclear");
                }


            });
            break;

        default:
            alert("not captured variation(target.src) type -- result source unclear");
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
    //alert("renderAllExcept from "+except_name);
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
                if (personTable[SID]) personTable[SID].update(coorType);
                break;
            case "message":
                if (messageTable[SID]) messageTable[SID].update(coorType);
                break;
            case "location":
                if (locationTable[SID]) locationTable[SID].update(coorType);
                break;
            case "resource":
                if (resourceTable[SID]) resourceTable[SID].update(coorType);
                break;
            case "event":
                if (eventTable[SID]) eventTable[SID].update(coorType);
                break;
            case "organization":
                if (organizationTable[SID]) organizationTable[SID].update(coorType);
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
    if (eventTable[sid]) {
        eventTable[sid].update();
    }
    if (locationTable[sid]) {
        locationTable[sid].update();
    }
    if (messageTable[sid]) {
        messageTable[sid].update();
    }
    if (resourceTable[sid]) {
        resourceTable[sid].update();
    }
    if (organizationTable[sid]) {
        organizationTable[sid].update();
    }
    if (personTable[sid]) {
        personTable[sid].update();
    }

}

function renderAllButMap(sid) {
    if (timeline[sid]) {
        timeline[sid].each(render);
    }
    if (messageTable[sid]) {
        messageTable[sid].update();
    }
    if (resourceTable[sid]) {
        resourceTable[sid].update();
    }
    if (locationTable[sid]) {
        locationTable[sid].update();
    }
    if (eventTable[sid]) {
        eventTable[sid].update();
    }
    if (organizationTable[sid]) {
        organizationTable[sid].update();
    }
    if (personTable[sid]) {
        personTable[sid].update();
    }
    if (network[sid]) {
        network[sid].update();
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