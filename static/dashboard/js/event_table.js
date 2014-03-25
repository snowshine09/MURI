$.widget("vis.visdatatable", $.vis.viscontainer, {
    options: {},
    _create: function() {},
    destroy: function() {},
});
SIIL.DataTable = function(div) {
    // initialize DataTable
    this.columns = [];
    this.name = div.split("_")[0].split("#")[1]; // Temporary trick: use div name to distinguish data
    // var calcDataTableHeight = function() {
    //     return $("#" + this.name + "_dlg").height() * 55 / 100;
    // };


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
        "fnPreRowSelect": function(e, nodes, isSelect) {
            if (e) {
                mySelectList = myDeselectList = null;
                if (e.shiftKey && nodes.length == 1) {
                    myDeselectList = this.fnGetSelected();
                    mySelectList = myGetRangeOfRows(cgTableObject, myLastSelection, nodes[0]);
                } else {
                    myLastSelection = nodes[0];
                    if (!e.ctrlKey) {
                        myDeselectList = this.fnGetSelected();
                        if (!isSelect) {
                            mySelectList = nodes;
                        }
                    }
                }
            }
            return true;
        },
        "fnRowSelected": mySelectEventHandler,
        "fnRowDeselected": mySelectEventHandler,
        //      , "aaData": d 
        //        "sPaginationType": "full_numbers"
    });
    
    $("#" + this.name + "_dlg").removeClass("hidden");
    //$("#"+this.name+"_dlg").append($(div));

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
    this.table.fnSettings().oScroll.sY = $("#" + this.name + "_dlg").height();
    this.table.fnAdjustColumnSizing();
}

SIIL.DataTable.prototype.update = function() {
    // prepare data for DataTable
    if (dDate == null) {
        return;
    }
    var data = [];
    switch (this.name) {
        case "location":
            dFootprint.group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push([d.key[0], d.key[1]].concat([d.value]));
                }
            });
            break;
        case "message":
            dMessage.group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key);
                }
            });
            break;
        case "event":
            dEvent.group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key);
                }
            });
            break;
        case "resource":
            dResource.group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key.concat([d.value]));
                }
            });
            break;
        case "person":
            dPerson.group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key.concat([d.value]));
                }
            });
            break;
        case "organization":
            dOrganization.group().top(Infinity).forEach(function(d) {
                if (d.value != 0 && d.key[0] != undefined) {
                    data.push(d.key.concat([d.value]));
                }
            });
            break;
    }
    this.table.fnClearTable();
    this.table.fnAddData(data);
    this.table.fnAdjustColumnSizing();
    if (this.name != 'message') {
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
            switch (self.name) {
                case "location":
                    dFootprint.filterAll();
                    break;
                case "message":
                    dMessage.filterAll();
                    break;
                case "event":
                    dEvent.filterAll();
                    break;
                case "resource":
                    dResource.filterAll();
                    break;
                case "person":
                    dPerson.filterAll();
                    break;
                case "organization":
                    dOrganization.filterAll();
                    break;
            }
        } else {
            records_id = [];
            self.table.$('tr.row_selected').each(function(idx, $row) {
                row = self.table.fnGetData($row);
                records_id.push(row[0]);
            });
            var count = 0;
            switch (self.name) {
                case "location":
                    dFootprint.filter(function(d) {
                        for (var i = 0; i < records_id.length; i++) {
                            if (d[0] === records_id[i]) {
                                count++;
                                return true;
                            }
                        }
                    });
                    break;
                case "message":
                    dMessage.filter(function(d) {
                        for (var i = 0; i < records_id.length; i++) {
                            if (d[0] === records_id[i]) {
                                count++;
                                return true;
                            }
                        }
                    });
                    break;
                case "event":
                    dEvent.filter(function(d) {
                        for (var i = 0; i < records_id.length; i++) {
                            if (d[0] === records_id[i]) {
                                count++;
                                return true;
                            }
                        }
                    });
                    break;
                case "resource":
                    dResource.filter(function(d) {
                        for (var i = 0; i < records_id.length; i++) {
                            if (d[0] === records_id[i]) {
                                count++;
                                return true;
                            }
                        }
                    });
                    break;
                case "person":
                    dPerson.filter(function(d) {
                        for (var i = 0; i < records_id.length; i++) {
                            if (d[0] === records_id[i]) {
                                count++;
                                return true;
                            }
                        }
                    });
                    break;
                case "organization":
                    dOrganization.filter(function(d) {
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
        renderAllExcept([self.name + 'Table']);
    });

    this.table.$('tr').mouseover(function() {
        if (self.name == 'location') {
            var data = self.table.fnGetData(this);
            highlight(data[0]); // data[0]: event id
        }
    });
    var localtable = this.table;

    //   $("#" + this.name + "_dlg").resize(function() {
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