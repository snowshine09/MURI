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
		red: Math.floor(Math.random() * 128 + 128),
		green: Math.floor(Math.random() * 128 + 128),
		blue: Math.floor(Math.random() * 128 + 128)
	};
};

var tableHeaders = {
	'event': [{'title': 'ID', 'name': 'ID'}, {'title': 'Name', 'name': 'Name'}, {'title': 'Type', 'name': 'Type'}, {'title': 'Description', 'name': 'Description'}, {'title': 'Date', 'name': 'Date'}],
	'location': [{'title': 'ID', 'name': 'ID'}, {'title': 'Name', 'name': 'Name'}, {'title': 'Frequency', 'name': 'Frequency'}],
	'message': [{'title': 'ID', 'name': 'ID'}, {'title': 'Content', 'name': 'Content'}, {'title': 'Date', 'name': 'Date'}],
	'person': [{'title': 'ID', 'name': 'ID'}, {'title': 'Name', 'name': 'Name'}, {'title': 'Gender', 'name': 'Gender'}, {'title': 'Race', 'name': 'Race'}, {'title': 'Nationality', 'name': 'Nationality'}, {'title': 'Frequency', 'name': 'Frequency'}],
	'organization': [{'title': 'ID', 'name': 'ID'}, {'title': 'Name', 'name': 'Name'}, {'title': 'Type', 'name': 'Type'}, {'title': 'Nationality', 'name': 'Nationality'}, {'title': 'Ethnicity', 'name': 'Ethnicity'}, {'title': 'Religion', 'name': 'Religion'}, {'title': 'Frequency', 'name': 'Frequency'}],
	'resource': [{'title': 'ID', 'name': 'ID'}, {'title': 'Name', 'name': 'Name'}, {'title': 'Condition', 'name': 'Condition'}, {'title': 'Type', 'name': 'Type'}, {'title': 'Frequency', 'name': 'Frequency'}],
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
	$("#map_btn").click(function() {
		createMap(null, null);
	});
	$("#timeline_btn").click(function() {
		createTimeline(null, null);
	});
	$("#location_table_btn").click(function() {
		createDialog('location', null, null);
	});
	$("#resource_table_btn").click(function() {
		createDialog('resource', null, null);
	});
	$("#person_table_btn").click(function() {
		createDialog('person', null, null);
	});
	$("#organization_table_btn").click(function() {
		createDialog('organization', null, null);
	});
	$("#event_table_btn").click(function() {
		createDialog('event', null, null);
	});
	$("#message_table_btn").click(function() {
		createDialog('message', null, null);
	});
	$("#network_btn").click(function() {
		createNetwork(null, null);
	});
});

function initNewLink(create_source_params, link_no, callback) {
	CreateSource(create_source_params, function(response) {
		dataset[link_no] = response;
		timeextent[link_no] = [];
		htimeline[link_no] = [];
		dindex[link_no] = [];
		msgID[link_no] = [];
		hshape[link_no] = [];
		callback();
	});
};

function createMap(link_no, create_source_params) {
	var new_link = (link_no == null);
	$.ajax({
		url: "map_template/",
		type: "post",
		data: {
			selfType: "map",
			new_link: 'new_link',
		},
		success: function(xhr) {
			if (new_link) {
				link_no = xhr.linkNo;
			}
			if ($("#map_dlg_" + link_no).length) {
				return;
			}
			$(xhr.html).dialog($.extend({}, dialogOptions, {
				title: 'Map of link ' + link_no,
				position: ['left', 36],
				width: 600,
				height: 600,
				close: function(event, ui) {
					delete map[$(this).attr("id").split("_")[2]];
					$(this).dialog('destroy').remove();
				}
			})).dialogExtend(dialogExtendOptions);
			if (new_link) {
				initNewLink(null, link_no, function() {
					map[link_no] = $(xhr.html).find(".cvs").vismap().data("vismap");
					DlgTcolor[xhr.linkNo] = randomcolor();
					$('#' + $(xhr.html).attr('id')).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
						DlgTcolor[xhr.linkNo].red + "," +
						DlgTcolor[xhr.linkNo].green + "," +
						DlgTcolor[xhr.linkNo].blue + ")"
					);
					map[xhr.linkNo].update("init");
				});
			} else {
				map[link_no] = $(xhr.html).find(".cvs").vismap().data("vismap");
				$('#' + $(xhr.html).attr('id')).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
					DlgTcolor[xhr.linkNo].red + "," +
					DlgTcolor[xhr.linkNo].green + "," +
					DlgTcolor[xhr.linkNo].blue + ")"
				);
				map[xhr.linkNo].update("init");
			}
		}
	});
};

function createTimeline(link_no, create_source_params) {
	var new_link = (link_no == null);
	$.ajax({
		url: "timeline_template/",
		type: "post",
		data: {
			selfType: "timeline",
			'new_link': new_link,
		},
		success: function(xhr) {
			if (new_link) {
				link_no = xhr.linkNo;
			}
			if ($("#timeline_dlg_" + link_no).length) {
				return;
			}
			$(xhr.html).dialog($.extend({}, dialogOptions, {
				title: 'Timeline of link ' + link_no,
				position: ['left', 36],
				width: 'auto',
				height: 'auto',
				minHeight: '0',
				close: function(event, ui) {
					delete timelineset[$(this).attr("id").split("_")[2]];
					$(this).dialog('destroy').remove();
				}
			})).dialogExtend(dialogExtendOptions);
			if (new_link) {
				initNewLink(null, link_no, function() {
					timelineset[link_no] = $(xhr.html).find(".cvs").timeline().data("timeline");
					DlgTcolor[link_no] = randomcolor();
					$('#' + $(xhr.html).attr('id')).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
						DlgTcolor[link_no].red + "," +
						DlgTcolor[link_no].green + "," +
						DlgTcolor[link_no].blue + ")"
					);
					timelineset[link_no].update();
				});
			} else {
				timelineset[link_no] = $(xhr.html).find(".cvs").timeline().data("timeline");
				$('#' + $(xhr.html).attr('id')).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
					DlgTcolor[link_no].red + "," +
					DlgTcolor[link_no].green + "," +
					DlgTcolor[link_no].blue + ")"
				);
				timelineset[link_no].update();
			}
		}
	});
};

function createNetwork(link_no, create_source_params) {
	var new_link = (link_no == null);
	$.ajax({
		url: "network_template/",
		type: "post",
		data: {
			selfType: "network",
			'new_link': new_link,
		},
		success: function(xhr) {
			if (new_link) {
				link_no = xhr.linkNo;
			}
			if ($("#network_dlg_" + link_no).length) {
				return;
			}
			$(xhr.html).dialog($.extend({}, dialogOptions, {
				title: 'Network of link ' + link_no,
				position: ['left', 36],
				width: 800,
				height: 800,
				close: function(event, ui) {
					delete network[$(this).attr("id").split("_")[2]];
					$(this).dialog('destroy').remove();
				}
			})).dialogExtend(dialogExtendOptions);
			network[link_no] = new SIIL.Network($(xhr.html), link_no);
			if (new_link) {
				initNewLink(create_source_params, link_no, function() {
					DlgTcolor[link_no] = randomcolor();
					$('#' + $(xhr.html).attr('id')).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
						DlgTcolor[link_no].red + "," +
						DlgTcolor[link_no].green + "," +
						DlgTcolor[link_no].blue + ")"
					);
					network[link_no].update();
				});
			} else {
				network[link_no].update();
				$('#' + $(xhr.html).attr('id')).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
					DlgTcolor[link_no].red + "," +
					DlgTcolor[link_no].green + "," +
					DlgTcolor[link_no].blue + ")"
				);
			}
		}
	});
};

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
				DlgTcolor[link_no] = randomcolor();
				initNewLink(create_source_params, link_no, function() {
					$('#' + $(xhr.html).attr('id')).siblings('.ui-dialog-titlebar').css("background", "rgb(" +
						DlgTcolor[link_no].red + "," +
						DlgTcolor[link_no].green + "," +
						DlgTcolor[link_no].blue + ")"
					);
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