SIIL.DataTable = function($div, table_type, link_no) {
	var self = this;
	self.SID = link_no;
	self.tbType = table_type;
	self.tbName = $div.find('table').attr('id');
	self.table = $('#' + self.tbName).dataTable({
		"bJQueryUI": true,
		"bDestroy": true,
		"bAutoWidth": true,
		'sScrollY': '100%',
		"sRowSelect": "multi",
		"sDom": "RlfrtipS",
	});
	self.Tinstance = self.table.api();
	var cmb = $div.find('.selectbar').attr('id');

	$("#" + cmb).attr("selectedIndex", 0).change(function() {
		var x = $("#" + cmb + " option:selected").val();
		generateOthers(self.tbName, x);
		$("#" + cmb + " option:selected").removeAttr('selected');
		$("#" + cmb).attr("selectedIndex", 0);
	});

	$("#" + self.tbName + "_filter" + ' > label:eq(0)' + ' > input:eq(0)').attr("id", self.tbName + "_input").bind("paste cut keyup", function() {
		self.table.removeHighlight();
		self.table.highlight($("#" + self.tbName + "_input").val());
	});
};

SIIL.DataTable.prototype.resize = function() {
	this.table.fnSettings().oScroll.sY = $("#" + this.tbType + "_dlg_" + this.SID).height();
	this.table.fnAdjustColumnSizing();
}

SIIL.DataTable.prototype.update = function(uType) {

	if (dataset[this.SID]['dDate'] == null) {
		return;
	}

	var self = this;
	self.data = [];

	switch (uType) {
		case "init":
			this.table.fnClearTable();
			this.table.fnAddData(self.data);
			this.table.fnAdjustColumnSizing();
			break;
		case "brush":

			break;
		case "filter":
			break;
		default:
			switch (this.tbType) {
				case "location":
					dataset[this.SID]['dFootprint'].group().top(Infinity).forEach(function(d) {
						if (d.value != 0 && d.key[0] != undefined) {
							self.data.push([d.key[0], d.key[1]].concat([d.value]));
						}
					});
					break;
				case "message":
					// alert("during updating the DT: length of dataset /set/" + self.SID + ' ' + dataset[self.SID]['set'].groupAll().value());
					// alert("during updating the DT: length of dataset /dmessage/" + self.SID + ' ' +dataset[this.SID]['dMessage'].group().top(Infinity).length);
					dataset[this.SID]['dMessage'].group().top(Infinity).forEach(function(d) {
						if (d.value != 0 && d.key[0] != undefined) {
							//if(d.value ==0) alert("such dimesion of message does not exist!");
							//else 
							self.data.push(d.key);
						}
					});
					// dataset[this.SID]['dMessage'].top(Infinity).forEach(function(d) {
					//     //console.log("filtered dMessage "+d);
					//     if (d.message.uid!= undefined && d.message.content!= undefined && d.message.date!=undefined) {
					//         self.data.push([d.message.uid,d.message.content,d.message.date]);
					//     }
					// });
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
							//dindex[self.SID].push(d.key[0]);  
						}
					});
					break;
				case "organization":
					dataset[this.SID]['dOrganization'].group().top(Infinity).forEach(function(d) {
						if (d.value != 0 && d.key[0] != undefined) {
							self.data.push(d.key.concat([d.value]));
							//dindex[self.SID].push(d.key[0]);  
						}
					});
					break;
			}
			self.Tinstance.clear();
			console.log(self.data);
			self.Tinstance.rows.add(self.data).draw();
			console.log(self.Tinstance.rows());
			self.table.fnAdjustColumnSizing();
			break;

	}
	//alert("index highlighting before judging!");
	if (dindex[self.SID].length != 0) {
		//alert("index highlighting!");
		var indexes = self.Tinstance.rows().eq(0).filter(function(rowIdx) {
			var tmp = self.Tinstance.cell(rowIdx, 0).data();
			return $.inArray(tmp, dindex[self.SID]) != -1 ? true : false;
		});

		// Add a class to those rows using an index selector
		self.table.$('tr.row_selected').removeClass("row_selected");
		console.log(indexes);
		self.Tinstance.rows(indexes)
			.nodes()
			.to$()
			.addClass('row_selected');
	} else self.table.$('tr.row_selected').removeClass("row_selected");

	if (self.tbType != 'message') {
		self.table.fnSetColumnVis(0, false); // set column 1 - id invisible
	} else {
		if (msgID[self.SID].length != 0) {
			var indexes = self.Tinstance.rows().eq(0).filter(function(rowIdx) {
				var tmp = self.Tinstance.cell(rowIdx, 0).data();
				return $.inArray(tmp, msgID[self.SID]) != -1 ? true : false;
			});

			// Add a class to those rows using an index selector
			self.table.$('tr.row_selected').removeClass("row_selected");
			console.log(indexes);
			self.Tinstance.rows(indexes)
				.nodes()
				.to$()
				.addClass('row_selected');
		} else self.table.$('tr.row_selected').removeClass("row_selected");

	}

	if (self.tbType == "location") {
		if (hshape[self.SID].length != 0) {
			var indexes = self.Tinstance.rows().eq(0).filter(function(rowIdx) {
				var tmp = self.Tinstance.cell(rowIdx, 0).data();
				return $.inArray(tmp, hshape[self.SID]) != -1 ? true : false;
			});

			// Add a class to those rows using an index selector
			self.table.$('tr.row_selected').removeClass("row_selected");

			self.Tinstance.rows(indexes)
				.nodes()
				.to$()
				.addClass('row_selected');
		} else self.table.$('tr.row_selected').removeClass("row_selected");
	}

	self.table.$('tr').bind("click", function(e) { //not clear why if not unbind the click event, the clicking will be triggered multiple times
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

		var selected_rows = self.table.$('tr.row_selected');
		if (selected_rows.length != 0) {
			//timeextent[self.SID] != undefined
			// var start, end; //for the brushed range reflected on timeline
			// self.table.$('tr.row_selected').each(function(idx, $row) {
			//     var row = self.table.fnGetData($row), 
			//     dDate = self.tbType == "message"? new Date(row[2]):row[4];

			//     if (start == null) {
			//         start = end = dDate;
			//     } else {
			//         start = start < dDate ? start : dDate;
			//         end = end > dDate ? end : dDate;
			//     }
			// });
			// timeextent[self.SID] = [];
			// timeextent[self.SID].push(start);
			// timeextent[self.SID].push(end);
			htimeline[self.SID] = [];
			self.table.$('tr.row_selected').each(function(idx, $row) {
				var row = self.table.fnGetData($row),
					dDate = (self.tbType == "message" ? (new Date(row[2])) : row[4]);
				if ($.inArray(dDate, htimeline[self.SID]) == -1) htimeline[self.SID].push(dDate);
			});

			if (self.tbType == "location") {
				self.table.$('tr.row_selected').each(function(idx, $row) {
					row = self.table.fnGetData($row);
					if ($.inArray(row[0], hshape[self.SID]) == -1) hshape[self.SID].push(row[0]);
				});
			}

			var pParam = {};
			if (self.tbType == "message") { //message propogating
				pParam['src_id'] = [];

				self.table.$('tr.row_selected').each(function(idx, $row) {
					row = self.table.fnGetData($row);
					pParam['src_id'].push(row[0]);
				});
				msgID[self.SID] = pParam['src_id'];
				dindex[self.SID] = [];
			} else { //entities propogating
				pParam['ett_id'] = [];
				self.table.$('tr.row_selected').each(function(idx, $row) {
					row = self.table.fnGetData($row);
					pParam['ett_id'].push(row[0]);
				});
				dindex[self.SID] = pParam['ett_id'];
				msgID[self.SID] = [];
			}
			$.ajaxSetup({
				async: false
			});
			$.post("propagate", pParam, function(eid) {
				console.log(eid);
				for (var i = 0; i < eid['ett'].length; i++) {
					if ($.inArray(eid['ett'][i]['uid'], dindex[self.SID]) == -1) dindex[self.SID].push(eid['ett'][i]['uid']);
					if (eid['ett'][i]['date'] != undefined && eid['ett'][i]['date'].length != 0 && $.inArray(new Date(eid['ett'][i]['date']), htimeline[self.SID]) == -1) htimeline[self.SID].push(new Date(eid['ett'][i]['date']));
				}
				for (var i = 0; i < eid['msg'].length; i++) {

					if ($.inArray(eid['msg'][i]['uid'], msgID[self.SID]) == -1) msgID[self.SID].push(eid['msg'][i]['uid']);
					if (eid['msg'][i]['date'] != undefined && eid['msg'][i]['date'].length != 0 && $.inArray(new Date(eid['msg'][i]['date']), htimeline[self.SID]) == -1) htimeline[self.SID].push(new Date(eid['msg'][i]['date']));
				}
				if (dindex[self.SID].length == 0) alert("dindex is empty");
				else if (msgID[self.SID].length == 0) alert("msgID is empty");
				renderAllExcept(self.tbName, "brush");
			});
		} else {
            renderAllExcept(self.tbName, "brush");
        }
	});
};

SIIL.DataTable.prototype.destroy = function() {
	this.table.remove();
};