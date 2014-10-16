SIIL.DataTable = function($div, table_type, link_no) {
	var self = this;
	self.SID = link_no;
	self.tbType = table_type;
	self.tbName = $div.find('table').attr('id');
	$("#" + self.tbType + "_dlg_" + self.SID).parent().addClass('link_' + self.SID);

	self.isfuzzy = $("#" + self.tbType + "_dlg_" + self.SID).find('.checkbox_input').is(":checked");

	self.table = $('#' + self.tbName).DataTable({
		autoWidth: true,
		scrollY: '100%',
		dom: 'lftirp',
		pagingType: 'full',
		columns: tableHeaders[table_type],
		ordering:true,
		orderFixed:[tableHeaders[table_type].length-1,'desc'],
	});
	if (self.tbType != 'message') {
		self.table.column('ID:name').visible(false);
	}

	$("#" + self.tbType + "_dlg_" + self.SID).find('.checkbox_input').change(function(event) {
		event.preventDefault();
		self.isfuzzy = $("#" + self.tbType + "_dlg_" + self.SID).find('.checkbox_input').is(":checked");
		tables[table_type][link_no].update('');
	});

	$("#" + self.tbType + "_dlg_" + self.SID).find('.showcontext').click(function(event) {
		event.preventDefault();
		self.parentID = $("#"+self.tbType+"_ctxt_"+self.SID).html().split(" ")[4];
		var b4toggleText = $("#"+self.tbType+"_ctxt_"+self.SID).html().split(" ")[0],
			ToggledText = $("#"+self.tbType+"_ctxt_"+self.SID).html().split(" ")[0] == "Show" ? "Hide" : "Show";
		$("#"+self.tbType+"_ctxt_"+self.SID).html(ToggledText + " Context in Link " + self.parentID);
		if (b4toggleText == "Show") {
			if (tables[table_type][self.parentID] != undefined) {
				var indexes = $("#" + self.tbType + "_table_" + self.parentID).DataTable().rows().eq(0).filter(function(rowIdx) {
					var tmp = $("#" + self.tbType + "_table_" + self.parentID).DataTable().cell(rowIdx, 0).data();
					return $.inArray(tmp, originIDs[self.SID]) != -1 ? true : false;
				});

				$("#" + self.tbType + "_table_" + self.parentID).DataTable().rows(indexes).nodes().to$().css("background-color", DlgTcolor[self.SID]);
				$("#" + self.tbType + "_table_" + self.parentID).DataTable().rows(indexes).nodes().to$().removeClass("row_selected");
			} else alert("Parent link has already been removed!");
		} else {
			$("#" + self.tbType + "_table_" + self.parentID).DataTable().rows(indexes).nodes().to$().css("background-color", "");
			tables[table_type][self.parentID].update("brush");
		}
	});
	var cmb = $div.find('.selectbar').attr('id');

	$("#" + cmb).attr("selectedIndex", 0).change(function(event) {
		event.preventDefault();
		var x = $("#" + cmb + " option:selected").val();
		generateOthers(self.tbName, x);
		$("#" + cmb + " option:selected").removeAttr('selected');
		$("#" + cmb).attr("selectedIndex", 0);
	});

	$("#" + self.tbName + "_filter" + ' > label:eq(0)' + ' > input:eq(0)').attr("id", self.tbName + "_input").bind("paste cut keyup", function() {
		$('#' + self.tbName).removeHighlight();
		$('#' + self.tbName).highlight($("#" + self.tbName + "_input").val());
	});
};

SIIL.DataTable.prototype.update = function(uType) {
	var self = this;
	self.data = [];
	if (uType !== 'brush') { // initializing a table
		if (!self.isfuzzy && originIDs[self.SID].length != 0) {
			switch (this.tbType) {
				case "location":
					for (var i = 0; i < dataset[this.SID]['location'].length; i++) {
						var item = dataset[this.SID]['location'][i];
						if ($.inArray(item.uid, originIDs[self.SID]) != -1) self.data.push([item.uid, item.name, item.frequency,0]);
					}
					break;
				case "message":
					for (var i = 0; i < dataset[this.SID]['message'].length; i++) {
						var item = dataset[this.SID]['message'][i];
						if ($.inArray(item.uid, originIDs[self.SID]) != -1) self.data.push([item.uid, item.content, item.date,0]);
					}
					break;
				case "event":
					for (var i = 0; i < dataset[this.SID]['event'].length; i++) {
						var item = dataset[this.SID]['event'][i];
						if ($.inArray(item.uid, originIDs[self.SID]) != -1) self.data.push([item.uid, item.name, item.types, item.excerpt, item.date,0]);
					}
					break;
				case "resource":
					for (var i = 0; i < dataset[this.SID]['resource'].length; i++) {
						var item = dataset[this.SID]['resource'][i];
						if ($.inArray(item.uid, originIDs[self.SID]) != -1) self.data.push([item.uid, item.name, item.condition, item.resource_type, item.frequency,0]);
					}
					break;
				case "person":
					for (var i = 0; i < dataset[this.SID]['person'].length; i++) {
						var item = dataset[this.SID]['person'][i];
						if ($.inArray(item.uid, originIDs[self.SID]) != -1) self.data.push([item.uid, item.name, item.gender, item.race, item.nationality, item.frequency,0]);
					}
					break;
				case "organization":
					for (var i = 0; i < dataset[this.SID]['organization'].length; i++) {
						var item = dataset[this.SID]['organization'][i];
						if ($.inArray(item.uid, originIDs[self.SID]) != -1) self.data.push([item.uid, item.name, item.types, item.nationality, item.ethnicity, item.religion, item.frequency,0]);
					}
					break;
			}
		} else {
			switch (this.tbType) {
				case "location":
					for (var i = 0; i < dataset[this.SID]['location'].length; i++) {
						var item = dataset[this.SID]['location'][i];
						self.data.push([item.uid, item.name, item.frequency,0]);
					}
					break;
				case "message":
					for (var i = 0; i < dataset[this.SID]['message'].length; i++) {
						var item = dataset[this.SID]['message'][i];
						self.data.push([item.uid, item.content, item.date,0]);
					}
					break;
				case "event":
					for (var i = 0; i < dataset[this.SID]['event'].length; i++) {
						var item = dataset[this.SID]['event'][i];
						self.data.push([item.uid, item.name, item.types, item.excerpt, item.date,0]);
					}
					break;
				case "resource":
					for (var i = 0; i < dataset[this.SID]['resource'].length; i++) {
						var item = dataset[this.SID]['resource'][i];
						self.data.push([item.uid, item.name, item.condition, item.resource_type, item.frequency,0]);
					}
					break;
				case "person":
					for (var i = 0; i < dataset[this.SID]['person'].length; i++) {
						var item = dataset[this.SID]['person'][i];
						self.data.push([item.uid, item.name, item.gender, item.race, item.nationality, item.frequency,0]);
					}
					break;
				case "organization":
					for (var i = 0; i < dataset[this.SID]['organization'].length; i++) {
						var item = dataset[this.SID]['organization'][i];
						self.data.push([item.uid, item.name, item.types, item.nationality, item.ethnicity, item.religion, item.frequency,0]);
					}
					break;
			}

		}
		self.table.clear();
		self.table.rows.add(self.data).draw();
		self.table.columns.adjust().draw();
		if (originIDs[self.SID].length != 0) {
			var indexes = self.table.rows().eq(0).filter(function(rowIdx) {
				var tmp = self.table.cell(rowIdx, 0).data();
				return $.inArray(tmp, originIDs[self.SID]) != -1 ? false : true;
			});

			self.table.rows(indexes).nodes().to$().addClass('row_origin');
		}
	}

	// highlighting
	if (self.tbType == 'message') {
		// highlight entries in Message table
		if (msgID[self.SID].length != 0) {
			var indexes = self.table.rows().eq(0).filter(function(rowIdx) {
				var tmp = self.table.cell(rowIdx, 0).data();
				self.table.cell(rowIdx, 3).data(0).draw();
				return $.inArray(tmp, msgID[self.SID]) != -1 ? true : false;
			});
			self.table.$('tr.row_selected').removeClass("row_selected");
			self.table.rows(indexes).nodes().to$().addClass('row_selected');
			self.table.rows(indexes).eq(0).filter(function(rowIdx) {
				self.table.cell(rowIdx, 3).data(1).draw();
			});
		} else {
			self.table.$('tr.row_selected').removeClass("row_selected");
			self.table.rows().eq(0).filter(function(rowIdx) {
				self.table.cell(rowIdx, 3).data(0).draw();
			});
		}
	} else {
		// highlight entries in Entity table
		if (dindex[self.SID].length != 0) {
			var indexes = self.table.rows().eq(0).filter(function(rowIdx) {
				var tmp = self.table.cell(rowIdx, 0).data();
				self.table.cell(rowIdx, tableHeaders[self.tbType].length-1).data(0).draw();
				return $.inArray(tmp, dindex[self.SID]) != -1 ? true : false;
			});
			self.table.$('tr.row_selected').removeClass("row_selected");
			self.table.rows(indexes).nodes().to$().addClass('row_selected');
			self.table.rows(indexes).eq(0).filter(function(rowIdx) {
				self.table.cell(rowIdx, tableHeaders[self.tbType].length-1).data(1).draw();
			});
		} else {
			self.table.$('tr.row_selected').removeClass("row_selected");
			self.table.rows(indexes).eq(0).filter(function(rowIdx) {
				self.table.cell(rowIdx, tableHeaders[self.tbType].length-1).data(0).draw();
			});
		}
	}

	//show distinguished seed (original ids) in the datarecords from its parents

	$("#" + self.tbName).parents('.ui-dialog-content').find('.selected-count').text(self.table.$('tr.row_selected').length);
	self.table.$('tr').unbind('click').bind('click', function(e) { //not clear why if not unbind the click event, the clicking will be triggered multiple times
		document.getSelection().removeAllRanges();
		if (e.shiftKey) {
			$(this).toggleClass('row_selected');
		} else {
			if (self.table.$('tr.row_selected').length == 1 && $(this).hasClass('row_selected')) {
				$(this).removeClass('row_selected');
			} else {
				self.table.$('tr.row_selected').removeClass('row_selected');
				$(this).addClass('row_selected');
			}
		}
		$("#" + self.tbName).parents('.ui-dialog-content').find('.selected-count').text(self.table.$('tr.row_selected').length);
		if (self.tbType === 'event') {
			$('.new-footprint-form').find('.related-events').text(self.table.cells('.row_selected', 'ID:name').data().toArray().join(' '));
		}
		propagate(self.tbType, self.SID, self.table.cells('.row_selected', 'ID:name').data().toArray());
	});
};