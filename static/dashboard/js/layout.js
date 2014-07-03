var dialogOptions = {
	minHeight: 600,
	minWidth: 805,
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
		d3.json("dataSetNum", function(error, result) {
			var vardlg = "map_dlg_" + result.NewLinkNum,
				varbar = "map_selectbar_" + result.NewLinkNum,
				cvs = "map_cvs_" + result.NewLinkNum;
			var opt = $.extend({
				title: "Map of Link " + result.NewLinkNum,
				position: ['left', 36],
				close: function(event, ui) {
					var tmp = $(this).attr("id");
					//alert("deleting" + tmp);
					delete map[tmp.split("_")[2]];
					$(this).dialog('destroy').remove();
				}
			}, dialogOptions);
			$("#map").clone().attr("id", vardlg).addClass("visdlg").dialog(opt)
				.dialogExtend(dialogExtendOptions);
			$('#' + vardlg + ' > div:eq(0)').attr("id", varbar);
			$('#' + vardlg + ' > div:eq(2)').attr("id", cvs); //getThis = $('#mainDiv > div:eq(0) > div:eq(1)');

			CreateSource(null, function(response) {
				dataset[result.NewLinkNum] = response;
				map[result.NewLinkNum] = $("#" + cvs).vismap().data("vis-vismap");
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
				alert("enter!");
				console.log(map[result.NewLinkNum]);
				map[result.NewLinkNum].update("init");
			});

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

			CreateSource(null, function(response) {
				dataset[result.NewLinkNum] = response;
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
	});

	// Location dialogue
	$("#location_table_btn").click(function() {
		createDialog('location', true);
	});
	// Resource dialogue
	$("#resource_table_btn").click(function() {
		createDialog('resource', true);
	});
	// People dialogue
	$("#person_table_btn").click(function() {
		createDialog('person', true);
	});
	// Organization dialogue
	$("#organization_table_btn").click(function() {
		createDialog('organization', true);
	});
	// Event dialogue
	$("#event_table_btn").click(function() {
		createDialog('event', true);
	});
	// Message dialogue
	$("#message_table_btn").click(function() {
		createDialog('message', true);
	});
	// Network dialogue
	$("#network_btn").click(function() {
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
						sid = tmp.split("_")[2];
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
			CreateSource(null, function(response) {
				dataset[result.NewLinkNum] = response;
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
		});
	});
});

function createDialog(table_type, new_dialog) {
	$.ajax({
		url: 'get_table/',
		type: 'post',
		data: {
			'table_type': table_type,
			'headers': tableHeaders[table_type],
		},
		success: function(xhr) {
			var linkNo = xhr.linkNo;
			$(xhr.html).dialog($.extend(dialogOptions, dialogExtendOptions, {
				title: table_type + 's of link ' + linkNo,
				position: ['left', 36],
				height: 800,
				close: function(event, ui) {
					delete tables[table_type][$(this).attr("id").split("_")[2]];
					$(this).dialog('destroy').remove();
				}
			}));
			tables[table_type][linkNo] = new SIIL.DataTable($(xhr.html).find('table'));
			CreateSource(null, function(response) {
				dataset[linkNo] = response;
				DlgTcolor[linkNo] = randomcolor();
				$($(xhr.html).attr('id')).siblings('.ui-dialog-titlebar').css("background-color", "rgb(" +
					DlgTcolor[linkNo].red + "," +
					DlgTcolor[linkNo].green + "," +
					DlgTcolor[linkNo].blue + ")"
				);
				timeextent[linkNo] = [];
				htimeline[linkNo] = [];
				dindex[linkNo] = [];
				msgID[linkNo] = [];
				hshape[linkNo] = [];
				tables[table_type][linkNo].update();
			});
		}
	});
};
