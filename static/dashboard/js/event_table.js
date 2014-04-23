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
    //alert(div);
    var stri = $(div).html();
    //alert(stri);
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
    //test temporarily for what aoData is 
    //var oSettings = this.table.fnSettings();
    //alert( oSettings.aoData );

    $("#" + this.tbType + "_dlg_" + this.SID).removeClass("hidden");
    //$("#"+this.tbType+"_dlg").append($(div));

    // $('div.dataTables_scrollBody').height($('div.dataTables_wrapper').height());

    function mySelectEventHandler(nodes) {
        if (myDeselectList) {
            var nodeList = myDeselectList;
            myDeselectList = null;
            this.fnDeselect(nodeList);
        }
        if (mySelectList) {
            var nodeList = mySelectList;
            mySelectList = null;
            this.fnSelect(nodeList);
        }
    }

    function myGetRangeOfRows(oDataTable, fromNode, toNode) {
        var
        fromPos = oDataTable.fnGetPosition(fromNode),
            toPos = oDataTable.fnGetPosition(toNode);
        oSettings = oDataTable.fnSettings(),
        fromIndex = $.inArray(fromPos, oSettings.aiDisplay),
        toIndex = $.inArray(toPos, oSettings.aiDisplay),
        result = [];

        if (fromIndex >= 0 && toIndex >= 0 && toIndex != fromIndex) {
            for (var i = Math.min(fromIndex, toIndex); i < Math.max(fromIndex, toIndex); i++) {
                var dataIndex = oSettings.aiDisplay[i];
                result.push(oSettings.aoData[dataIndex].nTr);
            }
        }
        return result.length > 0 ? result : null;
    }
};

SIIL.DataTable.prototype.resize = function() {
    this.table.fnSettings().oScroll.sY = $("#" + this.tbType + "_dlg_" + this.SID).height();
    this.table.fnAdjustColumnSizing();
}

SIIL.DataTable.prototype.update = function() {
    // prepare data for DataTable
    if (dataset[this.SID]['dDate'] == null) {
        return;
    }
    var data = [];
    // var ds = dataset[this.SID];
    // alert("ds"+ds);
    // console.log(ds);
    // console.log(this.SID);

    switch (this.tbType) {
        case "location":
            dataset[this.SID]['dFootprint'].group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push([d.key[0], d.key[1]].concat([d.value]));
                    console.log(d);
                }
            });
            break;
        case "message":
            dataset[this.SID]['dMessage'].group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key);
                    //console.log("message"+d);
                }
            });
            break;
        case "event":
            dataset[this.SID]['dEvent'].group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key);
                    //console.log("event:"+d);
                }
            });
            break;
        case "resource":
            dataset[this.SID]['dResource'].group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key.concat([d.value]));
                }
            });
            break;
        case "person":
            dataset[this.SID]['dPerson'].group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key.concat([d.value]));
                }
            });
            break;
        case "organization":
            dataset[this.SID]['dOrganization'].group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key.concat([d.value]));
                }
            });
            break;
    }
    this.table.fnClearTable();
    this.table.fnAddData(data);
    this.table.fnAdjustColumnSizing();
    if (this.tbType != 'message') {
        this.table.fnSetColumnVis(0, false); // set column 1 - id invisible
    }

    var self = this;
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
        } else {
            records_id = [];
            self.table.$('tr.row_selected').each(function(idx, $row) {
                row = self.table.fnGetData($row);
                records_id.push(row[0]);
            });
            var count = 0;
            switch (self.tbType) {
                case "location":
                    dataset[self.SID]['dFootprint'].filter(function(d) {
                        for (var i = 0; i < records_id.length; i++) {
                            if (d[0] === records_id[i]) {
                                count++;
                                return true;
                            }
                        }
                    });
                    break;
                case "message":
                    dataset[self.SID]['dMessage'].filter(function(d) {
                        for (var i = 0; i < records_id.length; i++) {
                            if (d[0] === records_id[i]) {
                                count++;
                                return true;
                            }
                        }
                    });
                    break;
                case "event":
                    dataset[self.SID]['dEvent'].filter(function(d) {
                        for (var i = 0; i < records_id.length; i++) {
                            if (d[0] === records_id[i]) {
                                count++;
                                return true;
                            }
                        }
                    });
                    break;
                case "resource":
                    dataset[self.SID]['dResource'].filter(function(d) {
                        for (var i = 0; i < records_id.length; i++) {
                            if (d[0] === records_id[i]) {
                                count++;
                                return true;
                            }
                        }
                    });
                    break;
                case "person":
                    dataset[self.SID]['dPerson'].filter(function(d) {
                        for (var i = 0; i < records_id.length; i++) {
                            if (d[0] === records_id[i]) {
                                count++;
                                return true;
                            }
                        }
                    });
                    break;
                case "organization":
                    dataset[self.SID]['dOrganization'].filter(function(d) {
                        for (var i = 0; i < records_id.length; i++) {
                            if (d[0] === records_id[i]) {
                                count++;
                                return true;
                            }
                        }
                    });
                    break;
            }
        }
        renderAllExcept([self.tbName]);
    });

    this.table.$('tr').mouseover(function() {
        if (self.name == 'location') {
            var data = self.table.fnGetData(this);
            highlight(data[0]); // data[0]: event id
        }
    });
    var localtable = this.table;

    //   $("#" + this.tbType + "_dlg").resize(function() {
    //     var oSettings = localtable.fnSettings();
    //     oSettings.oScroll.sY = calcDataTableHeight();
    //     localtable.fnDraw();
    // });
    //        function fnGetSelected (OTableLocal) {
    //            alert('hi');
    //        }
};

SIIL.DataTable.prototype.destroy = function() {
    this.table.remove();
};