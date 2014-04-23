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
        $("<div>").dialog($.extend({
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
                    // eval("var dataSet" + result);
                    //console.log(result);

                    var vardlg = "event_dlg_" + result.NewLinkNum,
                        vartb = "event_tb_" + result.NewLinkNum,
                        varbar = "nw-selectbar_"+ result.NewLinkNum;
                    $("#event_dlg").clone().attr("id", vardlg).dialog($.extend({
                        title: "Events of Link " + result.NewLinkNum,
                        position: ['left', 36],
                        close: function(event, ui) {
                            // delete eventTable[result.NewLinkNum],
                            var tmp = $(this).attr("id");
                            alert(tmp);
                            delete eventTable[tmp.split("_")[2]];
                            //alert(eventTable[tmp.split("_")[1]]);
                            $(this).dialog('destroy').remove();
                            alert("!");
                        },
                        resize: function() {
                            eventTable[result.NewLinkNum].resize();
                        },
                        height: 800
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    //$("#" + vardlg).children().attr("id", vartb);
                    $('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
                    $('#' + vardlg + ' > table:eq(0)').attr("id", vartb);
                    eventTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                    dataset[result.NewLinkNum] = CopySource();
                    // console.log(dataset[result.NewLinkNum]);
                    eventTable[result.NewLinkNum].update();

                    // console.log(eventTable);
                    // console.log(dataset);
                    // console.log(window.dic0);
                    // eventTable = new SIIL.DataTable("#event_table");
                    // eventTable.update();

                });

                break;
            case "message_table":
                // $("#message_dlg").dialog($.extend({
                //     title: "Messages",
                //     position: ['left', 36],
                //     resize: function() {
                //         messageTable.resize();
                //     },
                //     height: 800
                // }, dialogOptions))
                //     .dialogExtend(dialogExtendOptions);
                // messageTable = new SIIL.DataTable("#message_table");
                // messageTable.update();
                d3.json("dataSetNum", function(error, result) {
                    // eval("var dataSet" + result);
                    //console.log(result);

                    var vardlg = "message_dlg_" + result.NewLinkNum,
                        vartb = "message_tb_" + result.NewLinkNum;
                    $("#message_dlg").clone().attr("id", vardlg).dialog($.extend({
                        title: "Messages of Link " + result.NewLinkNum,
                        position: ['left', 36],
                        close: function(event, ui) {
                            var tmp = $(this).attr("id");
                            // alert(tmp);
                            delete messageTable[tmp.split("_")[1]];
                            $(this).dialog('destroy').remove();
                        },
                        resize: function() {
                            //eval(vartb+'\.resize();');
                            messageTable[result.NewLinkNum].resize();
                        },
                        height: 800
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    alert($("#" + vardlg).html());
                    //$("#" + vardlg).children().attr("id", vartb);
                    $('#' + vardlg + ' >table:eq(0)').attr("id", vartb);
                    messageTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                    dataset[result.NewLinkNum] = CopySource();
                    messageTable[result.NewLinkNum].update();
                });

                break;
            case "location_table":
                // $("#location_dlg").dialog($.extend({
                //     title: "Locations",
                //     resize: function() {
                //         locationTable.resize();
                //         //     var oSettings = localtable.fnSettings();
                //         //     oSettings.oScroll.sY = calcDataTableHeight();
                //         //     localtable.fnDraw();
                //     },
                //     width: 200
                // }, dialogOptions))
                //     .dialogExtend(dialogExtendOptions);
                // locationTable = new SIIL.DataTable("#location_table");
                // locationTable.update();
                d3.json("dataSetNum", function(error, result) {
                    // eval("var dataSet" + result);
                    //console.log(result);

                    var vardlg = "location_dlg_" + result.NewLinkNum,
                        vartb = "location_tb_" + result.NewLinkNum;
                    $("#location_dlg").clone().attr("id", vardlg).dialog($.extend({
                        title: "Locations of Link " + result.NewLinkNum,
                        position: ['left', 36],
                        close: function(event, ui) {
                            var tmp = $(this).attr("id");
                            // alert(tmp);
                            delete locationTable[tmp.split("_")[1]];
                            $(this).dialog('destroy').remove();
                        },
                        resize: function() {
                            //eval(vartb+'\.resize();');
                            locationTable[result.NewLinkNum].resize();
                        },
                        height: 800
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    $("#" + vardlg).children().attr("id", vartb);
                    locationTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                    dataset[result.NewLinkNum] = CopySource();
                    locationTable[result.NewLinkNum].update();
                });
                break;
            case "person_table":
                // $("#person_dlg").dialog($.extend({
                //     title: "People",
                //     resize: function() {
                //         personTable.resize();
                //     },
                // }, dialogOptions))
                //     .dialogExtend(dialogExtendOptions);
                // personTable = new SIIL.DataTable("#person_table");
                // personTable.update();
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "person_dlg_" + result.NewLinkNum,
                        vartb = "person_tb_" + result.NewLinkNum;
                    $("#person_dlg").clone().attr("id", vardlg).dialog($.extend({
                        title: "Persons of Link " + result.NewLinkNum,
                        position: ['left', 36],
                        resize: function() {
                            personTable[result.NewLinkNum].resize();
                        },
                        height: 800
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    $("#" + vardlg).children().attr("id", vartb);
                    personTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                    dataset[result.NewLinkNum] = CopySource();
                    personTable[result.NewLinkNum].update();
                });
                break;
            case "organization_table":
                // $("#organization_dlg").dialog($.extend({
                //     title: "Organizations",
                //     resize: function() {
                //         organizationTable.resize();
                //     },
                // }, dialogOptions))
                //     .dialogExtend(dialogExtendOptions);
                // organizationTable = new SIIL.DataTable("#organization_table");
                // organizationTable.update();
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "organization_dlg_" + result.NewLinkNum,
                        vartb = "organization_tb_" + result.NewLinkNum;
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
                    $("#" + vardlg).children().attr("id", vartb);
                    organizationTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                    dataset[result.NewLinkNum] = CopySource();
                    organizationTable[result.NewLinkNum].update();
                });
                break;
            case "resource_table":
                // $("#resource_dlg").dialog($.extend({
                //     title: "Resources",
                //     resize: function() {
                //         resourceTable.resize();
                //     },
                // }, dialogOptions))
                //     .dialogExtend(dialogExtendOptions);
                // resourceTable = new SIIL.DataTable("#resource_table");
                // resourceTable.update();
                d3.json("dataSetNum", function(error, result) {
                    var vardlg = "resource_dlg_" + result.NewLinkNum,
                        vartb = "resource_tb_" + result.NewLinkNum;
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
                    $("#" + vardlg).children().attr("id", vartb);
                    resourceTable[result.NewLinkNum] = new SIIL.DataTable("#" + vartb);
                    dataset[result.NewLinkNum] = CopySource();
                    resourceTable[result.NewLinkNum].update();
                });
                break;
            case "network":
                d3.json("dataSetNum", function(error, result) {
                    var nw = "network_" + result.NewLinkNum,
                        sbar = "nw-selectbar_" + result.NewLinkNum,
                        cmb = "nw-combobox_" + result.NewLinkNum,
                        cvs = "nw-cvs_" + result.NewLinkNum;
                    $("#network").clone().attr("id", nw).dialog($.extend({
                        title: "Network of Link " + result.NewLinkNum
                    }, dialogOptions))
                        .dialogExtend(dialogExtendOptions);
                    $("#" + nw).children().attr("id", sbar);
                    $("#" + sbar).children().attr("id", cmb);
                    $('#' + nw + ' > div:eq(1)').attr("id", cvs);; //getThis = $('#mainDiv > div:eq(0) > div:eq(1)');
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