var dialogOptions = {
    minHeight: 300,
    minWidth: 800,
    "modal": false,
    "resizable": false,
    "draggable": true,
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

var tableHeaders = {
	'event': ["ID", "Name", "Type", "Description", "Date"],
	'location': ['ID', 'Name', 'Frequency'],
	'message': ['ID', 'Content', 'Date'],
	'person': ['ID', 'Name', 'Gender', 'Race', 'Nationality', 'Frequency'],
	'organization': ['ID', 'Name', 'Type', 'Nationality', 'Ethnicity', 'Religion', 'Frequency'],
	'resource': ['ID', 'Name', 'Condition', 'Type', 'Frequency'],
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
        }, {
            minHeight: 330,
            minWidth: 805,
            maxWidth: 805,
            maxHeight: 330,
            "modal": false,
            "resizable": false,
            "draggable": true,
        });

        $("#mynotes_dlg").clone().attr("id", dlg).dialog(opt).dialogExtend(dialogExtendOptions);
        $("#" + dlg + ' > table:eq(0)').attr("id", table);
        $("#" + dlg + ' > div:eq(0) > button:eq(0)').attr("id", new_note);
        // $("#" + dlg + ' > input:eq(1)').attr("id",edit_note);

        var note_widget = $("#" + table).visnotetable({}).data("vis-visnotetable");
        note_widget.update();

    });
    // map dialogue
    $("#map_btn").click(function() {
        $.ajax({
            url: "map_template/",
            type: "post",
            data: {
                selfType: "map",
            },
            success: function(xhr) {
                var opt = $.extend({
                    title: "Map of Link " + xhr.linkNo,
                    position: ['left', 36],
                    close: function(event, ui) {
                        var tmp = $(this).attr("id");
                        delete map[tmp.split("_")[2]];
                        $(this).dialog('destroy').remove();
                    }
                }, dialogOptions);
                alert("enter map");
                
                CreateSource(null, function(response) {
                    dataset[xhr.linkNo] = response;
                    map[xhr.linkNo] = $(xhr.html).find(".cvs").vismap().data("vis-vismap");
                    DlgTcolor[xhr.linkNo] = randomcolor();
                    $(xhr.html).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[xhr.linkNo].red + "," +
                        DlgTcolor[xhr.linkNo].green + "," +
                        DlgTcolor[xhr.linkNo].blue + ")"
                    );
                    timeextent[xhr.linkNo] = [];
                    htimeline[xhr.linkNo] = [];
                    dindex[xhr.linkNo] = [];
                    msgID[xhr.linkNo] = [];
                    hshape[xhr.linkNo] = [];
                    $(xhr.html).dialog(opt)
                    .dialogExtend(dialogExtendOptions);
                    map[xhr.linkNo].update("init");
                });
            }

        });

    });
    // timeline dialogue
    $("#timeline_btn").click(function() {

        $.ajax({
            url: "timeline_template/",
            type: "post",
            data: {
                selfType: "timeline",
            },
            success: function(xhr) {
                var opt = $.extend({
                    title: "Timeline of Link " + xhr.linkNo
                }, dialogOptions);
                opt.height = 200;
                opt.width = 1000;
                $(xhr.html).dialog(opt)
                    .dialogExtend(dialogExtendOptions);
                CreateSource(null, function(response) {
                    dataset[xhr.linkNo] = response;
                    timeextent[xhr.linkNo] = [];
                    htimeline[xhr.linkNo] = [];
                    dindex[xhr.linkNo] = [];
                    msgID[xhr.linkNo] = [];
                    hshape[xhr.linkNo] = [];
                    timelineset[xhr.linkNo] = $(xhr.html).find(".cvs").timeline({
                        "dimension": dataset[xhr.linkNo]['dDate'],
                    }).data("vis-timeline");

                    DlgTcolor[xhr.linkNo] = randomcolor();
                    $(xhr.html).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[xhr.linkNo].red + "," +
                        DlgTcolor[xhr.linkNo].green + "," +
                        DlgTcolor[xhr.linkNo].blue + ")"
                    );
                    timelineset[xhr.linkNo].update();
                });
            }

        });
    });

    // Location dialogue
    $("#location_table_btn").click(function() {
        createDialog('location', null, null);
    });
    // Resource dialogue
    $("#resource_table_btn").click(function() {
        createDialog('resource', null, null);
    });
    // People dialogue
    $("#person_table_btn").click(function() {
        createDialog('person', null, null);
    });
    // Organization dialogue
    $("#organization_table_btn").click(function() {
        createDialog('organization', null, null);
    });
    // Event dialogue
    $("#event_table_btn").click(function() {
        createDialog('event', null, null);
    });
    // Message dialogue
    $("#message_table_btn").click(function() {
        createDialog('message', null, null);
    });
    // Network dialogue
    $("#network_btn").click(function() {
        $.ajax({
            url: "network_template/",
            type: "post",
            data: {
                selfType: "network",
            },
            success: function(xhr) {
                var opt = $.extend({
                    title: "Network of Link " + xhr.linkNo,
                    position: ['left', 36],
                    close: function(event, ui) {
                        var tmp = $(this).attr("id"),
                            sid = tmp.split("_")[2];
                        delete network[sid];
                        $(this).dialog('destroy').remove();
                    },
                    resize: function() {
                        network[xhr.linkNo].resize();
                    },
                    height: 660,
                    width: 996
                }, dialogOptions);
                $(xhr.html).dialog(opt).dialogExtend(dialogExtendOptions);
                network[xhr.linkNo] = new SIIL.Network($(xhr.html).find('.cvs').attr("id"));
                CreateSource(null, function(response) {
                    dataset[xhr.linkNo] = response;
                    events_id = [];
                    dataset[xhr.linkNo]['dDate'].top(Infinity).forEach(function(p, i) {
                        events_id.push(p.uid);
                    });
                    data = {};
                    data['events_id'] = events_id;
                    DlgTcolor[xhr.linkNo] = randomcolor();
                    $(xhr.html).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
                        DlgTcolor[xhr.linkNo].red + "," +
                        DlgTcolor[xhr.linkNo].green + "," +
                        DlgTcolor[xhr.linkNo].blue + ")"
                    );
                    timeextent[xhr.linkNo] = [];
                    htimeline[xhr.linkNo] = [];
                    dindex[xhr.linkNo] = [];
                    msgID[xhr.linkNo] = [];
                    hshape[xhr.linkNo] = [];
                    network[xhr.linkNo].update(data);
                });
            }


        });
    });
});

function createDialog(table_type, link_no, create_source_params) {
	var new_link = (link_no == null);
	$.ajax({
		url: 'get_table/',
		type: 'post',
		data: {
			'table_type': table_type,
			'headers': tableHeaders[table_type],
			'new_link': new_link,
		},
		success: function(xhr) {
			if (new_link) {
				link_no = xhr.linkNo;
			}
			if ($("#" + table_type + "_dlg_" + link_no).length) {
				return;
			}
			$(xhr.html).dialog($.extend({
				title: table_type + 's of link ' + link_no,
				position: ['left', 36],
				close: function(event, ui) {
					delete tables[table_type][$(this).attr("id").split("_")[2]];
					$(this).dialog('destroy').remove();
				}
			}, dialogOptions)).dialogExtend(dialogExtendOptions);
			tables[table_type][link_no] = new SIIL.DataTable($(xhr.html), table_type, link_no);
			if (new_link) {
				CreateSource(create_source_params, function(response) {
					dataset[link_no] = response;
					DlgTcolor[link_no] = randomcolor();
					$('#' + $(xhr.html).attr('id')).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
						DlgTcolor[link_no].red + "," +
						DlgTcolor[link_no].green + "," +
						DlgTcolor[link_no].blue + ")"
					);
					timeextent[link_no] = [];
					htimeline[link_no] = [];
					dindex[link_no] = [];
					msgID[link_no] = [];
					hshape[link_no] = [];
					tables[table_type][link_no].update();
				});
				if (create_source_params != null && create_source_params['type'] === 'message') {
					dataset[link_no]["parent"] = create_source_params['self_id'];
				}
			} else {
				tables[table_type][link_no].update();
				$('#' + $(xhr.html).attr('id')).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
					DlgTcolor[link_no].red + "," +
					DlgTcolor[link_no].green + "," +
					DlgTcolor[link_no].blue + ")"
				);
			}
		}
	});
};