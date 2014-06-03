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

    $("#" + cmb).attr("selectedIndex", 0)
        .change(function() {
            var x = $("#" + cmb + " option:selected").val();
            generateOthers(self.tbName, x);
            $("#" + cmb + " option:selected").removeAttr('selected');
            $("#" + cmb).attr("selectedIndex", 0);
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
            self.Tinstance.rows.add(self.data).draw();
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

    self.table.$('tr').unbind("click").bind("click", function(e) { //not clear why if not unbind the click event, the clicking will be triggered multiple times
        // alert("click event triggered");
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
            htimeline[self.SID] = [];
        } else {
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
                    dDate = self.tbType == "message" ? new Date(row[2]) : row[4];
                if ($.inArray(dDate, htimeline[self.SID]) == -1) htimeline[self.SID].push(dDate);

            });


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

            //selected items are not empty, which requires to update the shared dataset (dindex[]) 

            $.ajaxSetup({
                async: false
            });

            $.post("propagate", pParam, function(eid) {
                console.log(eid);
                for (var i = 0; i < eid['ett'].length; i++) {

                    if ($.inArray(eid['ett'][i]['uid'], dindex[self.SID]) == -1) dindex[self.SID].push(eid['ett'][i]['uid']);
                    if (eid['ett'][i]['date'] != undefined && eid['ett'][i]['date'].length!=0 && $.inArray(eid['ett'][i]['date'], htimeline[self.SID]) == -1) htimeline[self.SID].push(eid['ett'][i]['date']);
                }
                for (var i = 0; i < eid['msg'].length; i++) {

                    if ($.inArray(eid['msg'][i]['uid'], msgID[self.SID]) == -1) msgID[self.SID].push(eid['msg'][i]['uid']);
                    if (eid['msg'][i]['date'] != undefined && eid['msg'][i]['date'].length!=0 && $.inArray(eid['msg'][i]['date'], htimeline[self.SID]) == -1) htimeline[self.SID].push(eid['msg'][i]['date']);
                }
                if (dindex[self.SID].length == 0) alert("dindex is empty");
                else if (msgID[self.SID].length == 0) alert("msgID is empty");
                renderAllExcept(self.tbName, "brush");
                // alert("renderAllExcept finished! for "+self.tbName);
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