var dialogOptions = {
    "width": 800,
    "height": 500,
    "modal": false,
    "resizable": true,
    "draggable": true,
    //        "close" : function(){
    //            $(this).empty(); 
    //        }
};
// dialog-extend options
var dialogExtendOptions = {
    "closable": true,
    "maximizable": true,
    "minimizable": true,
    "minimizeLocation": "left",
    "collapsable": true,
    "dblclick": "collapse",
};

function randomcolor() {
    return {
        red: Math.floor(Math.random() * 256),
        green: Math.floor(Math.random() * 256),
        blue: Math.floor(Math.random() * 256)
    };
};

var wb_count = 0;
$(document).ready(function() {
    

    $("#workbench_btn").click(function() {
        wb_count++;
        var wb_dlg = "wb_dlg_" + wb_count,
            wb_ct = "wb_ctner_" + wb_count,
            wb_btn1 = "wb_save_new_note_" + wb_count,
            wb_btn2 = "wb_publish_new_note_" + wb_count,
            wb_btn3 = "wb_discard_note_" + wb_count,

            opt = $.extend({
                title: "Workbench",
                position: ['left', 72],
                close: function(event, ui) {
                    var tmp = $(this).attr("id");
                    //alert("deleting" + tmp);
                    // delete eventTable[tmp.split("_")[2]];
                    wb_widget.destroy();
                    //$("#workbench_container").addClass("hidden");
                    $(this).dialog('destroy').remove();
                },
            }, dialogOptions);

        $("#wb_dlg").clone().attr("id", wb_dlg).dialog(opt).dialogExtend(dialogExtendOptions);
        wb_bt1 = $("#" + wb_dlg + ' > div:eq(0) > button:eq(0)').attr("id", wb_btn1);
        wb_bt2 = $("#" + wb_dlg + ' > div:eq(0) > button:eq(1)').attr("id", wb_btn2);
        wb_bt3 = $("#" + wb_dlg + ' > div:eq(0) > button:eq(2)').attr("id", wb_btn3);
        wb_edt = $("#" + wb_dlg + " > textarea:eq(0)").attr("id", "wb_editor_" + wb_count);

        var wb_widget = $("#" + wb_dlg).visworkbench({
            "wb_count": wb_count,
            "mode": "create",
        }).data("vis-visworkbench");



    });
    var noteList_count = 0;
    $("#mynotes_btn").click(function() {
        noteList_count++;
        var dlg = "mynotes_dlg_" + noteList_count,
            table = "mynotes_tb_" + noteList_count,
            new_note = "mynotes_new_" + noteList_count;
            // edit_note = "mynotes_edit_" + noteList_count;

            opt = $.extend({
                title: "My Notes",
                position: ['left', 72],
                close: function(event, ui) {
                    var tmp = $(this).attr("id");
                    $(this).dialog('destroy').remove();
                },
            }, dialogOptions);

        $("#mynotes_dlg").clone().attr("id", dlg).dialog(opt).dialogExtend(dialogExtendOptions);
        $("#" + dlg + ' > table:eq(0)').attr("id", table);
        $("#" + dlg + ' > div:eq(0) > button:eq(0)').attr("id",new_note);
        // $("#" + dlg + ' > input:eq(1)').attr("id",edit_note);
    

        var note_widget = $("#" + table).addClass("mynotes").visnotetable({}).data("vis-visnotetable");
        note_widget.update();

    });
    // map dialogue
    $("#map_btn").click(function() {
        d3.json("dataSetNum", function(error, result) {
            var vardlg = "map_dlg_" + result.NewLinkNum,
                varbar = "map_selectbar_" + result.NewLinkNum,
                cvs = "map_cvs_" + result.NewLinkNum;
            var opt = $.extend({
                title: "Map of Link " + result.NewLinkNum
            }, dialogOptions);
            $("#map").clone().attr("id", vardlg).addClass("visdlg").dialog(opt)
                .dialogExtend(dialogExtendOptions);
            $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
            $('#' + vardlg + ' > div:eq(2)').attr("id", cvs); //getThis = $('#mainDiv > div:eq(0) > div:eq(1)');

            dataset[result.NewLinkNum] = CopySource();
            map[result.NewLinkNum] = $("#" + cvs).vismap({
                "dimension": dataset[result.NewLinkNum]['dFootprint'],
            }).data("vis-vismap");

            DlgTcolor[result.NewLinkNum] = randomcolor();
            $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                DlgTcolor[result.NewLinkNum].red + "," +
                DlgTcolor[result.NewLinkNum].green + "," +
                DlgTcolor[result.NewLinkNum].blue + ")"
            );
            timeextent[result.NewLinkNum] = [];
            htimeline[result.NewLinkNum] = [];
            dindex[result.NewLinkNum] = [];
            msgID[result.NewLinkNum] = [];
            hshape[result.NewLinkNum] = [];
            map[result.NewLinkNum].update("init");
        });

    });
    // timeline dialogue
    $("#timeline_btn").click(function() {

        d3.json("dataSetNum", function(error, result) {
            var vardlg = "timeline_dlg_" + result.NewLinkNum,
                varbar = "timeline_selectbar_" + result.NewLinkNum,
                cvs = "timeline_cvs_" + result.NewLinkNum;
            var opt = $.extend({
                title: "Timeline of Link " + result.NewLinkNum
            }, dialogOptions);
            opt.height = 200;
            opt.width = 1000;
            $("#timeline").clone().attr("id", vardlg).addClass("visdlg").dialog(opt)
                .dialogExtend(dialogExtendOptions);
            $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
            $('#' + vardlg + ' > div:eq(2)').attr("id", cvs); //getThis = $('#mainDiv > div:eq(0) > div:eq(1)');

            dataset[result.NewLinkNum] = CopySource();
            timeextent[result.NewLinkNum] = [];
            htimeline[result.NewLinkNum] = [];
            dindex[result.NewLinkNum] = [];
            msgID[result.NewLinkNum] = [];
            hshape[result.NewLinkNum] = [];
            timelineset[result.NewLinkNum] = $("#" + cvs).timeline({
                "dimension": dataset[result.NewLinkNum]['dDate'],
            }).data("vis-timeline");

            DlgTcolor[result.NewLinkNum] = randomcolor();
            $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                DlgTcolor[result.NewLinkNum].red + "," +
                DlgTcolor[result.NewLinkNum].green + "," +
                DlgTcolor[result.NewLinkNum].blue + ")"
            );
            timelineset[result.NewLinkNum].update();
        });
    });

    // Location dialogue
    $("#location_table_btn").click(function() {
        showDialogs(["location_table"]);
    });
    // Resource dialogue
    $("#resource_table_btn").click(function() {
        showDialogs(["resource_table"]);
    });
    // People dialogue
    $("#person_table_btn").click(function() {
        showDialogs(["person_table"]);
    });
    // Organization dialogue
    $("#organization_table_btn").click(function() {
        showDialogs(["organization_table"]);
    });
    // Event dialogue
    $("#event_table_btn").click(function() {
        showDialogs(["event_table"]);
    });
    // Message dialogue
    $("#message_table_btn").click(function() {
        showDialogs(["message_table"]);
    });
    // Network dialogue
    $("#network_btn").click(function() {
        showDialogs(["network"]);
    });
});

function showDialogs(dialogs) {

    for (var i = 0, len = dialogs.length; i < len; i++) {
        switch (dialogs[i]) {
            // case "map":
            //     $("#map").dialog($.extend({
            //         title: "Map",
            //         resizeStop: function() {
            //             map.updateSize(); //to prevent resize-zoom error
            //         },
            //         dragStop: function() {
            //             map.updateSize(); //to prevent drag-zoom error
            //         },
            //         close: function() {
            //             map.destroy();
            //         },
            //         position: ['left+400', 36]
            //     }, dialogOptions))
            //         .dialogExtend($.extend({
            //             maximize: function() {
            //                 map.updateSize();
            //             },
            //         }, dialogExtendOptions));
            //     map = new SIIL.Map("#map");
            //     map.update();
            //     break;
            // case "timeline":
            //     var opt = $.extend({title: "Timeline"}, dialogOptions);
            //     opt.height = 200;
            //     opt.width = 1000;
            //     $("#timeline").dialog(opt).dialogExtend(dialogExtendOptions);
            //     timeline = new SIIL.Timeline("#timeline");
            //     timeline.each(render);
            //     break;
            case "event_table":
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "event_dlg_" + result.NewLinkNum,
                        vartb = "event_tb_" + result.NewLinkNum,
                        varbar = "event_selectbar_" + result.NewLinkNum;
                    $("#event_dlg").clone().attr("id", vardlg).addClass("visdlg").dialog($.extend({
                        title: "Events of Link " + result.NewLinkNum,
                        position: ['left', 36],
                        close: function(event, ui) {
                            var tmp = $(this).attr("id");
                            alert("deleting" + tmp);
                            delete eventTable[tmp.split("_")[2]];
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
                    eventTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                    dataset[result.NewLinkNum] = CopySource(null);
                    DlgTcolor[result.NewLinkNum] = randomcolor();
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[result.NewLinkNum].red + "," +
                        DlgTcolor[result.NewLinkNum].green + "," +
                        DlgTcolor[result.NewLinkNum].blue + ")"
                    );
                    timeextent[result.NewLinkNum] = [];
                    htimeline[result.NewLinkNum] = [];
                    dindex[result.NewLinkNum] = [];
                    msgID[result.NewLinkNum] = [];
                    hshape[result.NewLinkNum] = [];
                    eventTable[result.NewLinkNum].update();
                });

                break;
            case "message_table":
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "message_dlg_" + result.NewLinkNum,
                        vartb = "message_tb_" + result.NewLinkNum,
                        varbar = "message_selectbar_" + result.NewLinkNum;
                    $("#message_dlg").clone().attr("id", vardlg).addClass("visdlg").dialog($.extend({
                        title: "Messages of Link " + result.NewLinkNum,
                        position: ['left', 36],
                        close: function(event, ui) {
                            var tmp = $(this).attr("id");
                            delete messageTable[tmp.split("_")[2]];
                            $(this).dialog('destroy').remove();
                        },
                        resize: function() {
                            messageTable[result.NewLinkNum].resize();
                        },
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    // alert($("#" + vardlg).html());
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                    messageTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                    dataset[result.NewLinkNum] = CopySource();
                    DlgTcolor[result.NewLinkNum] = randomcolor();
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[result.NewLinkNum].red + "," +
                        DlgTcolor[result.NewLinkNum].green + "," +
                        DlgTcolor[result.NewLinkNum].blue + ")"
                    );
                    timeextent[result.NewLinkNum] = [];
                    htimeline[result.NewLinkNum] = [];
                    dindex[result.NewLinkNum] = [];
                    msgID[result.NewLinkNum] = [];
                    hshape[result.NewLinkNum] = [];
                    messageTable[result.NewLinkNum].update();
                });

                break;
            case "location_table":
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "location_dlg_" + result.NewLinkNum,
                        vartb = "location_tb_" + result.NewLinkNum,
                        varbar = "location_selectbar_" + result.NewLinkNum;
                    if (hshape[self.SID] == undefined) hshape[self.SID] = [];
                    $("#location_dlg").clone().attr("id", vardlg).addClass("visdlg").dialog($.extend({
                        title: "Locations of Link " + result.NewLinkNum,
                        position: ['left', 36],
                        close: function(event, ui) {
                            var tmp = $(this).attr("id");
                            // alert(tmp);
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
                    dataset[result.NewLinkNum] = CopySource();
                    DlgTcolor[result.NewLinkNum] = randomcolor();
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[result.NewLinkNum].red + "," +
                        DlgTcolor[result.NewLinkNum].green + "," +
                        DlgTcolor[result.NewLinkNum].blue + ")"
                    );
                    timeextent[result.NewLinkNum] = [];
                    htimeline[result.NewLinkNum] = [];
                    dindex[result.NewLinkNum] = [];
                    msgID[result.NewLinkNum] = [];
                    hshape[result.NewLinkNum] = [];
                    locationTable[result.NewLinkNum].update();
                });
                break;
            case "person_table":
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "person_dlg_" + result.NewLinkNum,
                        vartb = "person_tb_" + result.NewLinkNum,
                        varbar = "person_selectbar_" + result.NewLinkNum;
                    $("#person_dlg").clone().attr("id", vardlg).addClass("visdlg").dialog($.extend({
                        title: "Persons of Link " + result.NewLinkNum,
                        position: ['left', 36],
                        close: function(event, ui) {
                            var tmp = $(this).attr("id");
                            //alert("deleting" + tmp);
                            delete personTable[tmp.split("_")[2]];
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

                    personTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                    dataset[result.NewLinkNum] = CopySource();


                    //assign a random color to the dialog's titlebar
                    // this.titlecolor = randomcolor();
                    //DlgTcolor[result.NewLinkNum] = this.titlecolor;
                    DlgTcolor[result.NewLinkNum] = randomcolor();
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        // this.titlecolor.red + "," +
                        // this.titlecolor.green + "," +
                        // this.titlecolor.blue + ")"
                        DlgTcolor[result.NewLinkNum].red + "," +
                        DlgTcolor[result.NewLinkNum].green + "," +
                        DlgTcolor[result.NewLinkNum].blue + ")"
                    );
                    timeextent[result.NewLinkNum] = [];
                    htimeline[result.NewLinkNum] = [];
                    dindex[result.NewLinkNum] = [];
                    msgID[result.NewLinkNum] = [];
                    hshape[result.NewLinkNum] = [];
                    personTable[result.NewLinkNum].update();
                });
                break;
            case "organization_table":
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "organization_dlg_" + result.NewLinkNum,
                        vartb = "organization_tb_" + result.NewLinkNum,
                        varbar = "organization_selectbar_" + result.NewLinkNum;
                    $("#organization_dlg").clone().attr("id", vardlg).addClass("visdlg").dialog($.extend({
                        title: "Organizations of Link " + result.NewLinkNum,
                        position: ['left', 36],
                        resize: function() {
                            //eval(vartb+'\.resize();');
                            organizationTable[result.NewLinkNum].resize();
                        },
                        height: 800
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                    organizationTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                    dataset[result.NewLinkNum] = CopySource();
                    DlgTcolor[result.NewLinkNum] = randomcolor();
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[result.NewLinkNum].red + "," +
                        DlgTcolor[result.NewLinkNum].green + "," +
                        DlgTcolor[result.NewLinkNum].blue + ")"
                    );
                    timeextent[result.NewLinkNum] = [];
                    htimeline[result.NewLinkNum] = [];
                    dindex[result.NewLinkNum] = [];
                    msgID[result.NewLinkNum] = [];
                    hshape[result.NewLinkNum] = [];
                    organizationTable[result.NewLinkNum].update();
                });
                break;
            case "resource_table":
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "resource_dlg_" + result.NewLinkNum,
                        vartb = "resource_tb_" + result.NewLinkNum,
                        varbar = "resource_selectbar_" + result.NewLinkNum;
                    $("#resource_dlg").clone().attr("id", vardlg).addClass("visdlg").dialog($.extend({
                        title: "Resources of Link " + result.NewLinkNum,
                        position: ['left', 36],
                        resize: function() {
                            //eval(vartb+'\.resize();');
                            resourceTable[result.NewLinkNum].resize();
                        },
                        height: 800
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                    resourceTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                    dataset[result.NewLinkNum] = CopySource();
                    DlgTcolor[result.NewLinkNum] = randomcolor();
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[result.NewLinkNum].red + "," +
                        DlgTcolor[result.NewLinkNum].green + "," +
                        DlgTcolor[result.NewLinkNum].blue + ")"
                    );
                    timeextent[result.NewLinkNum] = [];
                    htimeline[result.NewLinkNum] = [];
                    dindex[result.NewLinkNum] = [];
                    msgID[result.NewLinkNum] = [];
                    hshape[result.NewLinkNum] = [];
                    resourceTable[result.NewLinkNum].update();
                });
                break;
            case "network":
                d3.json("dataSetNum", function(error, result) {
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
                            var tmp = $(this).attr("id"),
                                sid = tmp.split("_")[2],
                                tb = "event_tb_" + sid;
                            delete network[sid];
                            $(this).dialog('destroy').remove();
                        },
                        resize: function() {
                            network[result.NewLinkNum].resize();
                        }
                    }, dialogOptions);
                    opt.height = 660;
                    opt.width = 996;
                    $("#network").clone().attr("id", vardlg).addClass("visdlg").dialog(opt)
                        .dialogExtend(dialogExtendOptions);
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > div:eq(1) > div:eq(1)').attr("id", ctxt_bar);
                    $('#' + vardlg + ' > div:eq(1) > div:eq(0)').attr("id", rs_bar);
                    $('#' + vardlg + ' > div:eq(1) > div:eq(2) > div:eq(0)').attr("id", grav_bar);
                    $('#' + vardlg + ' > div:eq(2)').attr("id", mode_bar);
                    $('#' + vardlg + ' > div:eq(2) > div:eq(0) > label:eq(0) > input:eq(0)').attr("id", pbar).attr("name", "mode_" + result.NewLinkNum);
                    $('#' + vardlg + ' > div:eq(2) > div:eq(1) > label:eq(0) > input:eq(0)').attr("id", bbar).attr("name", "mode_" + result.NewLinkNum);
                    $('#' + vardlg + ' > div:eq(3)').attr("id", cvs);
                    network[result.NewLinkNum] = new SIIL.Network("#" + cvs);
                    dataset[result.NewLinkNum] = CopySource();
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
                    timeextent[result.NewLinkNum] = [];
                    htimeline[result.NewLinkNum] = [];
                    dindex[result.NewLinkNum] = [];
                    msgID[result.NewLinkNum] = [];
                    hshape[result.NewLinkNum] = [];
                    network[result.NewLinkNum].update(data);
                });
                break;
        }
    }
}