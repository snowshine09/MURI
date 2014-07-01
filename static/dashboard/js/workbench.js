$.widget("vis.visworkbench", $.Widget, {
    options: {
        wb_count: null,
        noteid: null
    },
    _create: function() {
        var wbID = this.options.wb_count;
        var self = this;

        //alert("wbID" + wbID);

        //self.editor.focusManager.add( CKEDITOR.dom.element( document.getElementsByClassName( "visdlg") ), 1 );


        CKEDITOR.config.extraPlugins = 'contextmenu,abbr,markmenu,templates,embedvis'; //,dragndrop';
        if (this.options.noteid != null) {
            //alert("enter editing noteid = " + this.options.noteid);
            $.ajax({
                url: "notes",
                type: "POST",
                data: {
                    id: [this.options.noteid],
                    type: "id"
                },
                error: function(xhr) {
                    if (xhr.status == 403) {
                        alert('Failed to load notes: ' + xhr.responseText);
                    } else {
                        alert('Failed to load notes: please contact administrator.');
                    }

                },
                success: function(result) {
                    // console.log(result.notes[0].content);
                    // alert("enter editing!");
                    // self.editor.insertHtml(result.notes[0].content);
                    $("#wb_editor_" + wbID).val(result.notes[0].content);
                    // alert($("#wb_editor_" + wbID).val());
                    self.editor = CKEDITOR.replace("wb_editor_" + wbID);
                    self.editor.on('focus', function() {

                        var index_highest = 0;
                        // var prev_zi = $("#wb_dlg_" + wbID).parent(".ui-dialog").attr("z-index");
                        // find the highest index among opened dialogs
                        $(".ui-dialog").each(function() {
                            // always use a radix when using parseInt
                            var index_current = parseInt($(this).css("zIndex"), 10); //10 refers to the numerical system under use
                            if (index_current > index_highest) {
                                index_highest = index_current;
                            }
                        });
                        //set the clicked one upfront in terms of the layered position
                        $("#wb_dlg_" + wbID).parent(".ui-dialog").css("zIndex", index_highest + 1);

                    });
                    $("#wb_save_edit_note_" + wbID + ", #wb_publish_edit_note_" + wbID).click(function(event) {
                        self.editNote(event);
                    });

                    $("#wb_discard_note_" + wbID).click(function(event) {
                        $("#wb_editor_" + wbID).val('');
                        $("#wb_dlg_" + wbID).addClass("hidden").dialog("destroy");
                    });

                    self.element.removeClass("hidden");
                    self.element.addClass("visworkbench");
                    // self._super("_create");
                }
            });


        } else {
            self.editor = CKEDITOR.replace("wb_editor_" + wbID);
            self.editor.on('focus', function() {

                var index_highest = 0;
                // var prev_zi = $("#wb_dlg_" + wbID).parent(".ui-dialog").attr("z-index");
                // find the highest index among opened dialogs
                $(".ui-dialog").each(function() {
                    // always use a radix when using parseInt
                    var index_current = parseInt($(this).css("zIndex"), 10); //10 refers to the numerical system under use
                    if (index_current > index_highest) {
                        index_highest = index_current;
                    }
                });
                //set the clicked one upfront in terms of the layered position
                $("#wb_dlg_" + wbID).parent(".ui-dialog").css("zIndex", index_highest + 1);
                //console.log(document.getElementById("wb_editor_" + wbID).getElementsByTagName("iframe"));

            });
            // $("#wb_dlg_" + wbID).on('click', function() {
            //     var cke_content = document.getElementById("cke_wb_editor_"+wbID);//"cke_" + wbID + "_contents");
            //     var frmbody = cke_content.getElementsByTagName("iframe")[0].contentDocument.getElementsByTagName('body')[0];
            //     $(frmbody).attr('contenteditable',"true");
            //     $(frmbody).attr('spellcheck',"true");
            //     $(frmbody).addClass("cke_editable cke_editable_themed cke_contents_ltr cke_show_borders");

            //     console.log(frmbody);
            //     //alert("click on dialog");
            // });

            $("#wb_save_new_note_" + wbID + ", #wb_publish_new_note_" + wbID).click(function(event) {
                self.createNote(event);
            });

            $("#wb_discard_note_" + wbID).click(function(event) {
                $("#wb_editor_" + wbID).val('');
                $("#wb_dlg_" + wbID).addClass("hidden").dialog("destroy");
            });

            this.element.removeClass("hidden");
            this.element.addClass("visworkbench");
            this._super("_create");
        }



    },

    createNote: function(event) {
        var self = this,
            wbID = this.options.wb_count;
        event.preventDefault();
        var newNote;
        if (event.target.id == "wb_save_new_note_" + wbID) {
            newNote = self.getNoteContent(true, false);
        } else if (event.target.id == "wb_publish_new_note_" + wbID) {
            newNote = self.getNoteContent(true, true);
        }
        if (newNote != false) {
            $.ajax({
                url: 'workbench/note',
                type: "POST",
                data: newNote,
                success: function() {

                    $(".mynotes").each(function() {
                        console.log($(this));
                        //alert("mhynotes");
                        $(this).data("vis-visnotetable").update();
                    });
                    $("#wb_editor_" + wbID).val('');
                    $("#wb_dlg_" + wbID).addClass("hidden").dialog("destroy");
                },
                error: function(xhr) {
                    if (xhr.status == 403) {
                        console.log(xhr);
                        var res = JSON.parse(xhr.responseText);
                        alert(res.errors);
                    } else {
                        alert("Unknown error.");
                    }
                },
            });

        }
    },
    editNote: function(event) {
        var self = this;
        event.preventDefault();
        var newNote;
        if (event.target.id == "wb_save_edit_note_" + self.options.wb_count) {
            newNote = self.getNoteContent(false, false);
        } else if (event.target.id == "wb_publish_edit_note_" + self.options.wb_count) {
            newNote = self.getNoteContent(false, true);
        }
        if (newNote != false) {
            newNote.id = this.options.noteid;
            $.ajax({
                url: 'workbench/note',
                type: "POST",
                data: newNote,
                success: function() {
                    $("#wb_editor_" + self.options.wb_count).val('');
                    $("#wb_dlg_" + self.options.wb_count).addClass("hidden").dialog("destroy");
                    $(".visnotetable").each(function() {
                        $(this).data("vis-visnotetable").update();
                    });
                },
                error: function(xhr) {
                    if (xhr.status == 403) {
                        var res = JSON.parse(xhr.responseText);
                        alert(res.errors);
                    } else {
                        alert("Unknown error.");
                    }
                },
            });
        }
    },
    destroy: function() {
        //this.element.remove();
        this.element.removeClass("visworkbench");
        this._super("_destroy");
    },
    getNoteContent: function(create, publish) {
        var self = this,
            wbID = this.options.wb_count;
        var n = {};
        if (create) {
            n.id = -1;
            n.content = self.editor.getData();
            // n.content = $('#claim-new-iframe').contents().find('body').html()
        } else {
            n.content = self.editor.getData(); //tinyMCE.get('claim-edit').getContent();
            // n.content = $('#claim-edit-iframe').contents().find('body').html()
        }
        n.content = n.content.replace(/(&nbsp;)+/g, ' ');
        if (n.content.length == 0) {
            alert('The content of the claim cannot be empty.');
            return false;
        }
        if (create) {
            n.timeCreated = new Date().toGMTString();
        }
        n.timeUpdated = new Date().toGMTString();
        n.published = publish;
        n.visIDs = visxml[self.editor.name];
        visxml[self.editor.name] = [];


        // for (var i = 0; i < visxml[self.editor.name].length; i++) {
        //     console.log(visxml[self.editor.name][i]);
        //     switch (Object.keys(visxml[self.editor.name][i])) {
        //         case 'network':

        //             n.content = n.content.replace("<" + self.editor.name + "_network>", '<a href=#>');
        //             '<a href=\x22my_link\x22>'

        //     }
        // }

        // var allvisdlg = d3.selectAll(".visdlg");
        // var serializer = new XMLSerializer(),
        //     xmlString = "";
        // allvisdlg[0].forEach(function(visElement) {
        //     var visd = d3.select(visElement).node();
        //     xmlString = xmlString + serializer.serializeToString(visd);
        // });
        //console.log(xmlString);
        return n;
    },
});