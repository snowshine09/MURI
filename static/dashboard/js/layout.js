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

$(document).ready(function() {
    var container_options = {
        "width": 800,
        "height": 500,
        "modal": false,
        "resizable": true,
        "draggable": true,
    };
    // workbench dialogue
    $("#workbench_btn").click(function() {
        $("#workbench_container").dialog($.extend({
            "title": "Workbench",
        }, container_options))
            .visworkbench();
    });
    // map dialogue
    $("#map_btn").click(function() {
        // $("<div>").dialog($.extend({
        //     "title": "Map",
        // }, container_options))
        //     .vismap({
        //         dimension: dFootprint,
        //     });
        d3.json("dataSetNum", function(error, result) {
            var vardlg = "map_dlg_" + result.NewLinkNum,
                varbar = "map_selectbar_" + result.NewLinkNum,
                cvs = "map_cvs_" + result.NewLinkNum;
            var opt = $.extend({
                title: "Map of Link " + result.NewLinkNum
            }, dialogOptions);
            $("#map").clone().attr("id", vardlg).dialog(opt)
                .dialogExtend(dialogExtendOptions);
            $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
            $('#' + vardlg + ' > div:eq(2)').attr("id", cvs); //getThis = $('#mainDiv > div:eq(0) > div:eq(1)');

            dataset[result.NewLinkNum] = CopySource();
            map[result.NewLinkNum] = $("#" + cvs).vismap({
                "dimension": dataset[result.NewLinkNum]['dFootprint'],
            });

            DlgTcolor[result.NewLinkNum] = randomcolor();
                    $('#' + vardlg).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[result.NewLinkNum].red + "," +
                        DlgTcolor[result.NewLinkNum].green + "," +
                        DlgTcolor[result.NewLinkNum].blue + ")"
                    );
            //map[result.NewLinkNum].update();
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
            $("#timeline").clone().attr("id", vardlg).dialog(opt)
                .dialogExtend(dialogExtendOptions);
            $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
            $('#' + vardlg + ' > div:eq(2)').attr("id", cvs); //getThis = $('#mainDiv > div:eq(0) > div:eq(1)');

            dataset[result.NewLinkNum] = CopySource();
            timeextent[result.NewLinkNum] = [];
            htimeline[result.NewLinkNum] = [];
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
                    $("#event_dlg").clone().attr("id", vardlg).dialog($.extend({
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
                    dindex[result.NewLinkNum] = [];
                    eventTable[result.NewLinkNum].update();
                });

                break;
            case "message_table":
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "message_dlg_" + result.NewLinkNum,
                        vartb = "message_tb_" + result.NewLinkNum,
                        varbar = "message_selectbar_" + result.NewLinkNum;
                    $("#message_dlg").clone().attr("id", vardlg).dialog($.extend({
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
                    msgID[result.NewLinkNum] = [];
                    dindex[result.NewLinkNum] = [];
                    messageTable[result.NewLinkNum].update();
                });

                break;
            case "location_table":
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "location_dlg_" + result.NewLinkNum,
                        vartb = "location_tb_" + result.NewLinkNum,
                        varbar = "location_selectbar_" + result.NewLinkNum;
                    $("#location_dlg").clone().attr("id", vardlg).dialog($.extend({
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
                    dindex[result.NewLinkNum] = [];
                    locationTable[result.NewLinkNum].update();
                });
                break;
            case "person_table":
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "person_dlg_" + result.NewLinkNum,
                        vartb = "person_tb_" + result.NewLinkNum,
                        varbar = "person_selectbar_" + result.NewLinkNum;
                    $("#person_dlg").clone().attr("id", vardlg).dialog($.extend({
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
                    dindex[result.NewLinkNum] = [];
                    personTable[result.NewLinkNum].update();
                });
                break;
            case "organization_table":
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "organization_dlg_" + result.NewLinkNum,
                        vartb = "organization_tb_" + result.NewLinkNum,
                        varbar = "organization_selectbar_" + result.NewLinkNum;
                    $("#organization_dlg").clone().attr("id", vardlg).dialog($.extend({
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
                    dindex[result.NewLinkNum] = [];
                    organizationTable[result.NewLinkNum].update();
                });
                break;
            case "resource_table":
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "resource_dlg_" + result.NewLinkNum,
                        vartb = "resource_tb_" + result.NewLinkNum,
                        varbar = "resource_selectbar_" + result.NewLinkNum;
                    varbar = "resource_selectbar_" + self.SID
                    $("#resource_dlg").clone().attr("id", vardlg).dialog($.extend({
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
                    dindex[result.NewLinkNum] = [];
                    resourceTable[result.NewLinkNum].update();
                });
                break;
            case "network":
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "network_dlg_" + result.NewLinkNum,
                        varbar = "network_selectbar_" + result.NewLinkNum,
                        cvs = "network_cvs_" + result.NewLinkNum,
                        rs_bar = "network_reset_"+result.NewLinkNum,
                        ctxt_bar = "network_ctxt_"+result.NewLinkNum,
                        grav_bar = "network_gravity_"+result.NewLinkNum,
                        bbar = "network_brush_" + result.NewLinkNum,
                        pbar = "network_pan_" + result.NewLinkNum;
                    var opt = $.extend({
                        title: "Network of Link " + result.NewLinkNum,
                        position: ['left', 36],
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
                    $('#' + vardlg + ' > div:eq(2) > div:eq(0) > label:eq(0) > input:eq(0)').attr("id", pbar);
                    $('#' + vardlg + ' > div:eq(2) > div:eq(1) > label:eq(0) > input:eq(0)').attr("id", bbar);
                    $('#' + vardlg + ' > div:eq(3)').attr("id", cvs);
                    network[result.NewLinkNum] = new SIIL.Network("#" + cvs);
                    dataset[result.NewLinkNum] = CopySource();
                    events_id = []
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
                    dindex[result.NewLinkNum] = [];
                    network[result.NewLinkNum].update(data);
                });
                break;
                //             case "workbench":
                //                 var dialogLayout;
                //                 $("#workbench").dialog($.extend({
                //                     title: "Workbench",
                //                     open:        function() {
                //                                                     var layout_settings = {
                //                                                         zIndex:          0       // HANDLE BUG IN CHROME - required if using 'modal' (background mask)
                //                                                 ,    resizeWithWindow:   false   // resizes with the dialog, not the window
                //                                                 ,    spacing_open:       6
                //                                                 ,    spacing_closed:     6
                //                                                 ,    west__size:         '30%' 
                //                                                 ,    west__minSize:      100 
                //                                                 ,    west__maxSize:      300 
                //                                                 ,       center__childOptions: {
                //                                                     center__paneSelector:    ".inner-center"
                //                                                         ,       north__size: 150 
                //                                                         ,       spacing_open: 6
                //                                                     ,        north__minSize:     100 
                //                                                         ,    north__maxSize:     300 

                //                                                 }
                // //                                                ,  south__closable:    false 
                // //                                                ,  south__resizable:   false 
                // //                                                ,  south__slidable:    false 
                //                                                 //,  applyDefaultStyles:     true // DEBUGGING
                //                                         };
                //                          if (!dialogLayout) {
                //                              // init layout *the first time* dialog opens
                //                              dialogLayout = $("#workbench").layout( layout_settings );
                //                                                         } else
                //                              // just in case - probably not required
                //                              dialogLayout.resizeAll();
                //                      }
                //      ,   resize:     function() { if (dialogLayout) dialogLayout.resizeAll(); },
                //                         close: function() {
                //                             workbench.destroy();
                //                         },

                //                 }, dialogOptions))
                //                     .dialogExtend(dialogExtendOptions);
                //                 workbench = new SIIL.Workbench("#workbench");
                //                 break;
        }
    }
}