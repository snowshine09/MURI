var dialogOptions = {
    //        "title" : "Workbench",
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
        $("<div>").dialog($.extend({
            "title": "Map",
        }, container_options))
            .vismap({
                dimension: dFootprint,
            });
    });
    // timeline dialogue
    $("#timeline_btn").click(function() {
        d3.json("dataSetNum", function(error, result) {
                    var vardlg = "timeline_dlg_" + result.NewLinkNum,
                        varbar = "timeline_selectbar_" + result.NewLinkNum,
                        cvs = "timeline_cvs_" + result.NewLinkNum;
                    $("#timeline").clone().attr("id", vardlg).dialog($.extend({
                        title: "Timeline of Link " + result.NewLinkNum
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > div:eq(1)').attr("id", cvs); //getThis = $('#mainDiv > div:eq(0) > div:eq(1)');
                    timeline[result.NewLinkNum] = vardlg.Network("#" + cvs);
                    dataset[result.NewLinkNum] = CopySource();
                    timeline[result.NewLinkNum].update();
                });

        $("<div>").dialog($.extend({
            "title": "Timeline",
            "width": 1000,
            "height": 200,
        }, {
            "modal": false,
            "resizable": true,
            "draggable": true,
        }))
            .vistimeline({
                dimension: dDate,
            });
    });
    // network dialogue
    // $("#network_btn").click(function() {
    //     $("#network").dialog($.extend({
    //         "title": "Network",
    //          "width": 1000,
    //         "height": 200,
    //     }))
    //     .visnetwork();
    // });
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
                            alert("deleting"+tmp);
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
                    dataset[result.NewLinkNum] = CopySource();
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
                    alert($("#" + vardlg).html());
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                    messageTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                    dataset[result.NewLinkNum] = CopySource();
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
                            //eval(vartb+'\.resize();');
                            locationTable[result.NewLinkNum].resize();
                        },
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                    locationTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                    dataset[result.NewLinkNum] = CopySource();
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
                            alert("deleting"+tmp);
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
                    resourceTable[result.NewLinkNum].update();
                });
                break;
            case "network":
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "network_dlg_" + result.NewLinkNum,
                        varbar = "network_selectbar_" + result.NewLinkNum,
                        cvs = "network_cvs_" + result.NewLinkNum;
                    $("#network").clone().attr("id", vardlg).dialog($.extend({
                        title: "Network of Link " + result.NewLinkNum
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > div:eq(1)').attr("id", cvs); //getThis = $('#mainDiv > div:eq(0) > div:eq(1)');
                    network[result.NewLinkNum] = new SIIL.Network("#" + cvs);
                    dataset[result.NewLinkNum] = CopySource();
                    network[result.NewLinkNum].update();
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