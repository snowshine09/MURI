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
        // "sScrollY": calcDataTableHeight(),
        // 'sScrollY': '500',
        //      , "aoColumns": [ 
        //             {"sWidth": "1%"} , // column 1 will be hidden
        //             {"sWidth": "19%"} ,
        //             {"sWidth": "60%"},
        //             {"sWidth": "20%"},
        //        ],x
        // for multi select with ctrl and shift
        "sRowSelect": "multi",
        "sDom": "RlfrtipS",
        // "fnPreRowSelect": function(e, nodes, isSelect) {
        //     if (e) {
        //         mySelectList = myDeselectList = null;
        //         if (e.shiftKey && nodes.length == 1) {
        //             myDeselectList = this.fnGetSelected();
        //             mySelectList = myGetRangeOfRows(cgTableObject, myLastSelection, nodes[0]);
        //         } else {
        //             myLastSelection = nodes[0];
        //             if (!e.ctrlKey) {
        //                 myDeselectList = this.fnGetSelected();
        //                 if (!isSelect) {
        //                     mySelectList = nodes;
        //                 }
        //             }
        //         }
        //     }
        //     return true;
        // },
        // "fnRowSelected": mySelectEventHandler,
        // "fnRowDeselected": mySelectEventHandler,
        //      , "aaData": d 
        //        "sPaginationType": "full_numbers"
    });
    this.Tinstance = this.table.api();

    $("#" + this.tbType + "_dlg_" + this.SID).removeClass("hidden");

};

SIIL.DataTable.prototype.resize = function() {
    this.table.fnSettings().oScroll.sY = $("#" + this.tbType + "_dlg_" + this.SID).height();
    this.table.fnAdjustColumnSizing();
}



SIIL.DataTable.prototype.update = function(uType) {
    //var coType = coorType || srcData;
    // prepare data for DataTable

    if (dataset[this.SID]['dDate'] == null) {
        return;
    }

    var self = this,
        cmb = self.tbType + "_selectbar_" + self.SID;
    //alert(cmb);
    $("#" + cmb).attr("selectedIndex", -1)
        .change(function() {
            var x = $("#" + cmb + " option:selected").val();
            alert(x);
            generateOthers(self.tbName, x);
        });

    var data = [];
    switch (this.tbType) {
        case "location":
            dataset[this.SID]['dFootprint'].group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push([d.key[0], d.key[1]].concat([d.value]));
                    //dindex[self.SID].push(d.key[0]);  
                    //console.log(d);
                }
            });
            break;
        case "message":
            dataset[this.SID]['dMessage'].group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key);
                    //dindex[self.SID].push(d.key[0]);  
                    //console.log("message"+d);
                }
            });
            break;
        case "event":
            dataset[this.SID]['dEvent'].group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key);
                    //dindex[self.SID].push(d.key[0]);  
                    // console.log("event:" + d.key + " value:" + d.value);
                }
            });
            break;
        case "resource":
            dataset[this.SID]['dResource'].group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key.concat([d.value]));
                    //dindex[self.SID].push(d.key[0]);  
                }
            });
            break;
        case "person":
            dataset[this.SID]['dPerson'].group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key.concat([d.value]));
                    //dindex[self.SID].push(d.key[0]);  
                }
            });
            break;
        case "organization":
            dataset[this.SID]['dOrganization'].group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key.concat([d.value]));
                    //dindex[self.SID].push(d.key[0]);  
                }
            });
            break;
    }
    //console.log(data);
    switch (uType) {
        case "init":
            this.table.fnClearTable();
            this.table.fnAddData(data);
            this.table.fnAdjustColumnSizing();
            break;
        case "brush":


            var indexes = this.Tinstance.rows().eq(0).filter(function(rowIdx) {
                var tmp = self.Tinstance.cell(rowIdx, 0).data();
                return $.inArray(tmp, dindex[self.SID]) != -1 ? true : false;
                // var included = $.inArray(tmp, dindex[self.SID])!=-1;
                // console.log(included);
                // return included;

            });

            // Add a class to those rows using an index selector
            this.table.$('tr.row_selected').removeClass("row_selected");
            console.log(indexes);
            this.Tinstance.rows(indexes)
                .nodes()
                .to$()
                .addClass('row_selected');

            break;
        case "filter":
            break;
        default:
            this.Tinstance.clear();
            this.Tinstance.rows.add(data).draw();
            this.table.fnAdjustColumnSizing();
            break;

    }

    if (this.tbType != 'message') {
        this.table.fnSetColumnVis(0, false); // set column 1 - id invisible
    }

    var self = this,
        coorType = '';
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
            switch (self.tbType) {
                case "location":
                    dataset[self.SID]['dFootprint'].filterAll();
                    break;
                case "message":
                    dataset[self.SID]['dMessage'].filterAll();
                    break;
                case "event":
                    dataset[self.SID]['dEvent'].filterAll();
                    break;
                case "resource":
                    dataset[self.SID]['dResource'].filterAll();
                    break;
                case "person":
                    dataset[self.SID]['dPerson'].filterAll();
                    break;
                case "organization":
                    dataset[self.SID]['dOrganization'].filterAll();
                    break;
            }
            dindex[self.SID] = [];
        } else {
            var pParam = {};
            pParam['src_id'] = [];
            self.table.$('tr.row_selected').each(function(idx, $row) {
                row = self.table.fnGetData($row);
                pParam['src_id'].push(row[0]);
            });
            //selected items are not empty, which requires to update the shared dataset (dindex[]) 

            dindex[self.SID] = [];
            $.post("propagate", pParam, function(eid) {

                for (var i = 0; i < eid['id'].length; i++) {
                    console.log(eid['id'][i]);
                    dindex[self.SID].push(eid['id'][i]['uid']);
                }
                var count = 0;
                switch (self.tbType) {
                    case "location":
                        dataset[self.SID]['dFootprint'].filter(function(d) {
                            for (var i = 0; i < dindex[self.SID].length; i++) {
                                if (d[0] === dindex[self.SID][i]) {
                                    count++;
                                    return true;
                                }
                            }
                        });
                        break;
                    case "message":
                        dataset[self.SID]['dMessage'].filter(function(d) {
                            for (var i = 0; i < dindex[self.SID].length; i++) {
                                if (d[0] === dindex[self.SID][i]) {
                                    count++;
                                    return true;
                                }
                            }
                        });
                        break;
                    case "event":
                        dataset[self.SID]['dEvent'].filter(function(d) {
                            for (var i = 0; i < dindex[self.SID].length; i++) {
                                if (d[0] === dindex[self.SID][i]) {
                                    count++;
                                    return true;
                                }
                            }
                        });
                        break;
                    case "resource":
                        dataset[self.SID]['dResource'].filter(function(d) {
                            for (var i = 0; i < dindex[self.SID].length; i++) {
                                if (d[0] === dindex[self.SID][i]) {
                                    count++;
                                    return true;
                                }
                            }
                        });
                        break;
                    case "person":
                        dataset[self.SID]['dPerson'].filter(function(d) {
                            for (var i = 0; i < dindex[self.SID].length; i++) {
                                if (d[0] === dindex[self.SID][i]) {
                                    count++;
                                    return true;
                                }
                            }
                        });
                        break;
                    case "organization":
                        dataset[self.SID]['dOrganization'].filter(function(d) {
                            for (var i = 0; i < dindex[self.SID].length; i++) {
                                if (d[0] === dindex[self.SID][i]) {
                                    count++;
                                    return true;
                                }
                            }
                        });
                        break;
                }
                renderAllExcept([self.tbName], "brush");
            });

        }
        
    });

    this.table.$('tr').mouseover(function() {
        if (self.name == 'location') {
            var data = self.table.fnGetData(this);
            highlight(data[0]); // data[0]: event id
        }
    });
    var localtable = this.table;

};

SIIL.DataTable.prototype.destroy = function() {
    this.table.remove();
};