$.widget("vis.visdatatable", $.vis.viscontainer, {
    options: {},
    _create: function() {},
    destroy: function() {},
});
SIIL.DataTable = function(div) {
    // initialize DataTable
    this.columns = [];
    this.SID = div.split("_")[2];
    this.tbType = div.split("_")[0].split("#")[1];
    this.tbName = this.tbType + '_tb_' + this.SID;
    this.table = $(div).dataTable({
        "bJQueryUI": true,
        "bDestroy": true,
        "bScrollCollapse": true,
        "bAutoWidth": true,
        'sScrollX': '100%',
        "sRowSelect": "multi",
        "sDom": "RlfrtipS",
    });
    this.Tinstance = this.table.api();

    $("#" + this.tbType + "_dlg_" + this.SID).removeClass("hidden");
    var self = this,
        cmb = self.tbType + "_selectbar_" + self.SID;

    $("#" + cmb).attr("selectedIndex", -1)
        .change(function() {
            var x = $("#" + cmb + " option:selected").val();
            generateOthers(self.tbName, x);
            $("#" + cmb + " option:selected").removeAttr('selected');
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
            this.Tinstance.clear();
            this.Tinstance.rows.add(self.data).draw();
            this.table.fnAdjustColumnSizing();
            break;

    }
    //alert("index highlighting before judging!");
    if (dindex[self.SID].length != 0) {
        //alert("index highlighting!");
        var indexes = this.Tinstance.rows().eq(0).filter(function(rowIdx) {
            var tmp = self.Tinstance.cell(rowIdx, 0).data();
            return $.inArray(tmp, dindex[self.SID]) != -1 ? true : false;
        });

        // Add a class to those rows using an index selector
        this.table.$('tr.row_selected').removeClass("row_selected");
        console.log(indexes);
        this.Tinstance.rows(indexes)
            .nodes()
            .to$()
            .addClass('row_selected');
    } else this.table.$('tr.row_selected').removeClass("row_selected");

    if (this.tbType != 'message') {
        this.table.fnSetColumnVis(0, false); // set column 1 - id invisible
    } else {
        if (msgID[self.SID].length != 0) {
            var indexes = this.Tinstance.rows().eq(0).filter(function(rowIdx) {
                var tmp = self.Tinstance.cell(rowIdx, 0).data();
                return $.inArray(tmp, msgID[self.SID]) != -1 ? true : false;
            });

            // Add a class to those rows using an index selector
            this.table.$('tr.row_selected').removeClass("row_selected");
            console.log(indexes);
            this.Tinstance.rows(indexes)
                .nodes()
                .to$()
                .addClass('row_selected');
        } else this.table.$('tr.row_selected').removeClass("row_selected");

    }

    this.table.$('tr').click(function(e) {
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
        if (selected_rows.length == 0) {
            // switch (self.tbType) {
            //     case "location":
            //         dataset[self.SID]['dFootprint'].filterAll();
            //         break;
            //     case "message":
            //         dataset[self.SID]['dMessage'].filterAll();
            //         break;
            //     case "event":
            //         dataset[self.SID]['dEvent'].filterAll();
            //         break;
            //     case "resource":
            //         dataset[self.SID]['dResource'].filterAll();
            //         break;
            //     case "person":
            //         dataset[self.SID]['dPerson'].filterAll();
            //         break;
            //     case "organization":
            //         dataset[self.SID]['dOrganization'].filterAll();
            //         break;
            // }
            dindex[self.SID] = [];
        } else {
            if (timeextent[self.SID] != undefined) {
                var start, end; //for the brushed range reflected on timeline
                self.table.$('tr.row_selected').each(function(idx, $row) {
                    row = self.table.fnGetData($row);
                    if (start == null) {
                        start = end = row[2];
                    } else {
                        start = start < row[2] ? start : row[2];
                        end = end > row[2] ? end : row[2];
                    }
                });
                timeextent[self.SID] = [];
                timeextent[self.SID].push(start);
                timeextent[self.SID].push(end);
            }

            var pParam = {};
            if (self.tbType == "message") { //message propogating
                pParam['src_id'] = [];

                self.table.$('tr.row_selected').each(function(idx, $row) {
                    row = self.table.fnGetData($row);
                    pParam['src_id'].push(row[0]);
                });
            } else { //entities propogating
                pParam['ett_id'] = [];
                self.table.$('tr.row_selected').each(function(idx, $row) {
                    row = self.table.fnGetData($row);
                    pParam['ett_id'].push(row[0]);
                });
            }

            //selected items are not empty, which requires to update the shared dataset (dindex[]) 

            dindex[self.SID] = [];
            $.post("propagate", pParam, function(eid) {

                for (var i = 0; i < eid['ett'].length; i++) {
                    //console.log(eid['ett'][i]);
                    dindex[self.SID].push(eid['ett'][i]['uid']);
                }
                for (var i = 0; i < eid['msg'].length; i++) {
                    //console.log(eid['msg'][i]);
                    msgID[self.SID].push(eid['msg'][i]['uid']);
                }

                renderAllExcept([self.tbName], "brush");
            });

        }

    });

    // this.table.$('tr').mouseover(function() {
    //     if (self.name == 'location') {
    //         var data = self.table.fnGetData(this);
    //         highlight(data[0]); // data[0]: event id
    //     }
    // });
    // var localtable = this.table;

};

SIIL.DataTable.prototype.destroy = function() {
    this.table.remove();
};