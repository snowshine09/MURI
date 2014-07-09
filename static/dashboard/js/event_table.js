SIIL.DataTable = function($div, table_type, link_no) {
	var self = this;
	self.SID = link_no;
	self.tbType = table_type;
	self.tbName = $div.find('table').attr('id');
	self.table = $('#' + self.tbName).DataTable({
		autoWidth: true,
		scrollY: '100%',
		dom: 'lftirp',
		pagingType: 'full',
		columns: tableHeaders[table_type],
	});
	if (self.tbType != 'message') {
		self.table.column('ID:name').visible(false);
	}
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
				for (var i = 0; i < dataset[this.SID]['location'].length; i++) {
					var item = dataset[this.SID]['location'][i];
					self.data.push([item.uid, item.name, item.frequency]);
				}
				break;
			case "message":
				for (var i = 0; i < dataset[this.SID]['message'].length; i++) {
					var item = dataset[this.SID]['message'][i];
					self.data.push([item.uid, item.content, item.date]);
				}
				break;
			case "event":
				for (var i = 0; i < dataset[this.SID]['event'].length; i++) {
					var item = dataset[this.SID]['event'][i];
					self.data.push([item.uid, item.name, item.types, item.excerpt, item.date]);
				}
				break;
			case "resource":
				for (var i = 0; i < dataset[this.SID]['resource'].length; i++) {
					var item = dataset[this.SID]['resource'][i];
					self.data.push([item.uid, item.name, item.condition, item.resource_type, item.frequency]);
				}
				break;
			case "person":
				for (var i = 0; i < dataset[this.SID]['person'].length; i++) {
					var item = dataset[this.SID]['person'][i];
					self.data.push([item.uid, item.name, item.gender, item.race, item.nationality, item.frequency]);
				}
				break;
			case "organization":
				for (var i = 0; i < dataset[this.SID]['organization'].length; i++) {
					var item = dataset[this.SID]['organization'][i];
					self.data.push([item.uid, item.name, item.types, item.nationality, item.ethnicity, item.religion, item.frequency]);
				}
				break;
		}
		self.table.clear();
		self.table.rows.add(self.data).draw();
		self.table.columns.adjust().draw();
	}

	// highlighting
	if (self.tbType == 'message') {
		// highlight entries in Message table
		if (msgID[self.SID].length != 0) {
			var indexes = self.table.rows().eq(0).filter(function(rowIdx) {
				var tmp = self.table.cell(rowIdx, 0).data();
				return $.inArray(tmp, msgID[self.SID]) != -1 ? true : false;
			});
			self.table.$('tr.row_selected').removeClass("row_selected");
			self.table.rows(indexes).nodes().to$().addClass('row_selected');
		} else {
			self.table.$('tr.row_selected').removeClass("row_selected");
		}
	} else {
		// highlight entries in Entity table
		if (dindex[self.SID].length != 0) {
			var indexes = self.table.rows().eq(0).filter(function(rowIdx) {
				var tmp = self.table.cell(rowIdx, 0).data();
				return $.inArray(tmp, dindex[self.SID]) != -1 ? true : false;
			});
			self.table.$('tr.row_selected').removeClass("row_selected");
			self.table.rows(indexes).nodes().to$().addClass('row_selected');
		} else {
			self.table.$('tr.row_selected').removeClass("row_selected");
		}
	}

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