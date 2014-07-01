$.widget("vis.visnotetable", $.vis.viscontainer, {
    options: {},
    createNote: function() {
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
                    wb_widget.destroy();
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
        }).data("vis-visworkbench");
    },
    editNote: function(nid) {
        wb_count++;
        var wb_dlg = "wb_dlg_" + wb_count,
            wb_ct = "wb_ctner_" + wb_count,
            wb_btn1 = "wb_save_edit_note_" + wb_count,
            wb_btn2 = "wb_publish_edit_note_" + wb_count,
            wb_btn3 = "wb_discard_note_" + wb_count,

            opt = $.extend({
                title: "Workbench Editing",
                position: ['left', 72],
                close: function(event, ui) {
                    var tmp = $(this).attr("id");
                    wb_widget.destroy();
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
            "noteid": nid,
        }).data("vis-visworkbench");
        // $.ajax({
        //     url: "note",
        //     type: "POST",
        //     data: notePara,
        //     error: function(xhr) {
        //         if (xhr.status == 403) {
        //             alert('Failed to load notes: ' + xhr.responseText);
        //         } else {
        //             alert('Failed to load notes: please contact administrator.');
        //         }

        //     },
        //     success: function(result) {
        //         self.update();
        //         alert("node updated!");


        //     }
        // });
    },
    deleteNote: function(nid) {
        var self = this;
        var notePara = {};
        notePara.content = "";
        notePara.id = nid;
        $.ajax({
            url: 'workbench/note',
            type: "POST",
            success: function() {
                self.update();
            },
            failure: function(xhr) {
                alert("failed to delete Note!")
            },
            data: notePara,
        });
    },
    _create: function() {
        // initialize DataTable
        this.tbName = this.element.attr("id");
        this.tbType = this.tbName.split("_")[0];
        this.SID = this.tbName.split("_")[2];
        this.new_edit_button = "mynotes_new_" + this.SID;
        this.table = $('#' + this.tbName).dataTable({
            "bJQueryUI": true,
            "bDestroy": true,
            "bScrollCollapse": true,
            "bAutoWidth": false,
            'sScrollX': '100%',
            'sScrollY': '100%',
            "sRowSelect": "multi",
            "sDom": "RlfrtipS",
            "fnCreatedRow": function(nRow, aData, iDataIndex) {
                $(nRow).addClass("note_row");
                $(nRow).attr("id", "note_row_" + aData[0]);
                if (aData[5] == true) {
                    $(nRow).addClass("note_published");
                }
            },
        });

        this.Tinstance = this.table.api();

        var self = this;

        $("#"+this.new_edit_button).click(function(){
            self.createNote();
        })
        
        $("#" + self.tbName + "_filter" + ' > label:eq(0)' + ' > input:eq(0)').attr("id", self.tbName + "_input").bind("paste cut keyup", function() { //change(function(){
            //alert("change");//unbind("click").bind("click", function(e) {
            $("#" + self.tbName).removeHighlight();
            $("#" + self.tbName).highlight($("#" + self.tbName + "_input").val()); //$('table#id tr').each(function () {// + " tr"
        });
        // this.element.removeClass("hidden");
        $("#" + this.tbType + "_dlg_" + this.SID).removeClass("hidden");
        this.element.addClass("visnotetable");
    },
    update: function() {
        var self = this;
        var notePara = {};
        notePara.type = "user_all";

        $.ajax({
            url: "notes",
            type: "POST",
            data: notePara,
            error: function(xhr) {
                if (xhr.status == 403) {
                    alert('Failed to load notes: ' + xhr.responseText);
                } else {
                    alert('Failed to load notes: please contact administrator.');
                }
                $("#" + this.tbType + '_dlg_' + this.SID).dialog("close");
            },
            success: function(result) {

                var Notes = result.notes;
                var data = [];
                for (var i = 0; i < Notes.length; i++) {
                    data.push([Notes[i].id, Notes[i].author, Notes[i].title, Notes[i].content, Notes[i].pir, Notes[i].published, Notes[i].created_at, Notes[i].updated_at]);
                }



                self.Tinstance.clear();

                self.Tinstance.rows.add(data).draw();

                var $links = self.table.$('tr').find('a.ref-link');
                $links.on('click', function() {

                    alert("clicked ref-link");
                    var linkBtn = this;
                    var visID = $(linkBtn).attr("vid");
                    alert("visid = " + visID);
                    $.ajax({
                        url: "visOnceMore",
                        type: "GET",
                        data: {
                            'visID': visID
                        },
                        success: function(xhr) {
                            console.log(xhr.html);
                            var elements = $(xhr.html);
                            elements.each(function() {
                                // var found = $('.visdlg', $(this));
                                // found.each(function() {
                                $(this).addClass("regenerated").dialog($.extend({
                                    title: "Regenerated VIS",
                                    position: ['left', 56],
                                    close: function(event, ui) {
                                        var tmp = $(this).attr("id");
                                        //alert("deleting" + tmp);
                                        $(this).dialog('destroy').remove();
                                    },
                                    height: 800
                                }, dialogOptions))
                                    .dialogExtend(dialogExtendOptions);
                                // });
                            })
                        },
                        error: function(xhr) {
                            alert("ERROR: " + xhr.responseText);
                        }
                    });
                });
            }
        });



        $.contextMenu({
            selector: '.note_row',
            build: function($trigger, e) {
                var published = $trigger.hasClass("note_published");
                var menuItems;
                if (published) {
                    menuItems = {
                        "cite_note": {
                            name: "Cite"
                        },
                        "separator": "--------",
                        "add_note": {
                            name: "Add a note",
                            icon: "page_white_add"
                        },
                    }
                } else {
                    menuItems = {
                        "delete_note": {
                            name: "Delete",
                            icon: "page_white_delete"
                        },
                        "edit_note": {
                            name: "Edit",
                            icon: "page_white_edit"
                        },
                        "separator": "--------",
                        "add_note": {
                            name: "Add a note",
                            icon: "page_white_add"
                        },
                    }
                }
                return {
                    items: menuItems,
                    callback: function(key, options) {
                        self.id_selected = parseInt(options.$trigger.children().eq(0).text());
                        console.log(options.$trigger);
                        //alert(self.id_selected);
                        switch (key) {
                            case "cite_note":
                                //citation.addSelection("Claim", self.id_selected);
                                break;
                            case "delete_note":
                                $('<div>').append("<p>This note will be permanently deleted. Are you sure?</p>").dialog({
                                    resizable: false,
                                    height: 180,
                                    modal: true,
                                    title: "Confirm",
                                    buttons: {
                                        "Delete Note": function() {
                                            self.deleteNote(self.id_selected);
                                            $(this).dialog("close");
                                        },
                                        Cancel: function() {
                                            $(this).dialog("close");
                                        }
                                    }
                                });
                                break;
                            case "edit_note":
                                self.editNote(self.id_selected);
                                break;
                            case "add_note":
                                self.createNote();
                                break;
                        }
                    }
                }
            }
        });


    },
    resize: function() {
        this.table.fnSettings().oScroll.sY = $("#" + this.tbType + "_dlg_" + this.SID).height();
        this.table.fnAdjustColumnSizing();
    },
    destroy: function() {
    },
});