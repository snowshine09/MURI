SIIL.DataTable = function($div, table_type, link_no) {
	var self = this;
	self.SID = link_no;
	self.tbType = table_type;
	self.tbName = $div.find('table').attr('id');
	self.table = $('#' + self.tbName).DataTable({
		autoWidth: true,
		scrollY: '100%',
		stateSave: true,
		dom: 'lfpt',
		pagingType: 'full',
		columns: tableHeaders[table_type],
	});
	var cmb = $div.find('.selectbar').attr('id');

	$("#" + cmb).attr("selectedIndex", 0).change(function() {
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
		switch (this.tbType) {
			case "location":
				dataset[this.SID]['dFootprint'].group().top(Infinity).forEach(function(d) {
					if (d.value != 0 && d.key[0] != undefined) {
						self.data.push([d.key[0], d.key[1]].concat([d.value]));
					}
				});
				break;
			case "message":
				dataset[this.SID]['dMessage'].group().top(Infinity).forEach(function(d) {
					if (d.value != 0 && d.key[0] != undefined) {
						self.data.push(d.key);
					}
				});
				break;
			case "event":
				dataset[this.SID]['dEvent'].group().top(Infinity).forEach(function(d) {
					if (d.value != 0 && d.key[0] != undefined) {
						self.data.push(d.key);
					}
				});
				break;
			case "resource":
				dataset[this.SID]['dResource'].group().top(Infinity).forEach(function(d) {
					if (d.value != 0 && d.key[0] != undefined) {
						self.data.push(d.key.concat([d.value]));
					}
				});
				break;
			case "person":
				dataset[this.SID]['dPerson'].group().top(Infinity).forEach(function(d) {
					if (d.value != 0 && d.key[0] != undefined) {
						self.data.push(d.key.concat([d.value]));
					}
				});
				break;
			case "organization":
				dataset[this.SID]['dOrganization'].group().top(Infinity).forEach(function(d) {
					if (d.value != 0 && d.key[0] != undefined) {
						self.data.push(d.key.concat([d.value]));
					}
				});
				break;
		}
		self.table.clear();
		self.table.rows.add(self.data).draw();
		self.table.columns.adjust().draw();
	}

	// highlighting
	self.table.$('tr.row_selected').removeClass("row_selected");
	if (dindex[self.SID].length != 0) {
		var indexes = self.table.rows().eq(0).filter(function(rowIdx) {
			var tmp = self.table.cell(rowIdx, 0).data();
			return $.inArray(tmp, dindex[self.SID]) != -1 ? true : false;
		});
		self.table.rows(indexes).nodes().to$().addClass('row_selected');
	}

	if (self.tbType != 'message') {
		self.table.column('ID:name').visible(false);
	} else {
		if (msgID[self.SID].length != 0) {
			var indexes = self.table.rows().eq(0).filter(function(rowIdx) {
				var tmp = self.table.cell(rowIdx, 0).data();
				return $.inArray(tmp, msgID[self.SID]) != -1 ? true : false;
			});

			// Add a class to those rows using an index selector
			self.table.$('tr.row_selected').removeClass("row_selected");
			self.table.rows(indexes).nodes().to$().addClass('row_selected');
		} else {
			self.table.$('tr.row_selected').removeClass("row_selected");
		}
	}

	if (self.tbType == "location") {
		if (hshape[self.SID].length != 0) {
			var indexes = self.table.rows().eq(0).filter(function(rowIdx) {
				var tmp = self.table.cell(rowIdx, 0).data();
				return $.inArray(tmp, hshape[self.SID]) != -1 ? true : false;
			});

			// Add a class to those rows using an index selector
			self.table.$('tr.row_selected').removeClass("row_selected");

			self.table.rows(indexes).nodes().to$().addClass('row_selected');
		} else {
			self.table.$('tr.row_selected').removeClass("row_selected");
		}
	}
	$("#" + self.tbName).parents('.ui-dialog-content').find('.selected-count').text(self.table.$('tr.row_selected').length);
	self.table.$('tr').unbind('click').bind('click', function(e) { //not clear why if not unbind the click event, the clicking will be triggered multiple times
		dindex[self.SID] = [];
		msgID[self.SID] = [];
		hshape[self.SID] = [];
		htimeline[self.SID] = [];
		if ($(this).hasClass('row_selected')) {
			$(this).removeClass('row_selected');
		} else {
			if (!e.shiftKey) {
				self.table.$('tr.row_selected').removeClass('row_selected');
			}
			document.getSelection().removeAllRanges(); // disable text selection when shift+clik
			$(this).addClass('row_selected');
		}
		$("#" + self.tbName).parents('.ui-dialog-content').find('.selected-count').text(self.table.$('tr.row_selected').length);
		if (self.tbType == "location") {
			hshape[self.SID] = self.table.cells('.row_selected', 'ID:name').data().toArray();
		}
		var selected_rows = self.table.rows('.row_selected');
		if (selected_rows.length > 0) {
			$.ajax({
				url: "propagate/",
				type: 'post',
				async: false,
				data: {
					'ids': self.table.cells('.row_selected', 'ID:name').data().toArray(),
					'type': self.tbType
				},
				success: function(eid) {
					dindex[self.SID] = eid['ett_idset'];
					msgID[self.SID] = eid['msg_idset'];
                    for (var i = 0; i < eid['dateset'].length; i++) {
                        htimeline[self.SID].push(new Date(eid['dateset'][i]))
                    }
					renderAllExcept(self.tbName, "brush");
				}
			});
		} else {
			renderAllExcept(self.tbName, "brush");
		}
	});
};

SIIL.DataTable.prototype.destroy = function() {
	this.table.remove();
};