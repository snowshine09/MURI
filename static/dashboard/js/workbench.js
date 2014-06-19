$.widget("vis.visworkbench", $.Widget, {
    options: {
        wb_count: null
    },
    _create: function() {
        $("#wb_dlg").removeClass("hidden");
        alert(this.option("wb_count"));
        // console.log(this.option);
        // console.log(this.options);
        var edID = "wb_editor_" + this.options("wb_count");
        var self = this, editor = CKEDITOR.replace(edID);

        CKEDITOR.config.extraPlugins = 'contextmenu,abbr,markmenu,templates';

        $("#save_new_note, #publish_new_note").click(function(event) {
            self.createNote(event);
        });
        // $("#save_edit_note, #publish_edit_note").click(function(event) {
        //     self.editNote(event);
        // });
        alert("create widget visworkbench");

        this.element.addClass("visworkbench");
        this._super("_create");
    },

    createNote: function(event) {
        var self = this;
        event.preventDefault();
        var newNote;
        if (event.target.id == "save_new_note") {
            newNote = self.getNoteContent(true, false);
        } else if (event.target.id == "publish_new_note") {
            newNote = self.getNoteContent(true, true);
        }
        console.log(newNote);
        if (newNote != false) {
            $.ajax({
                url: 'workbench/note',
                type: "POST",
                data: newNote,
                success: function() {
                    // self.update();
                    $("#workbench").val('');
                    $("#workbench_container").addClass("hidden").dialog("close");
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
        if (event.target.id == "save-edit-claim") {
            newNote = self.getNoteContent(false, false);
        } else if (event.target.id == "publish-edit-claim") {
            newNote = self.getNoteContent(false, true);
        }
        if (newNote != false) {
            newNote.id = self.id_selected;
            $.ajax({
                url: 'geodeliberator/claim/',
                type: "POST",
                data: newNote,
                success: function() {
                    self.update();
                    tinyMCE.get('claim-edit').setContent('');
                    $("#edit-claim-form").addClass("hidden").dialog("close");
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
    deleteNote: function(id) {
        var self = this;
        $.ajax({
            url: 'geodeliberator/claim/',
            type: "POST",
            success: function() {
                self.update();
            },
            failure: function(xhr) {
                alert("failed to delete claim!")
            },
            data: {
                id: id,
                content: ''
            }
        });
    },
    _saveNote: function() {},

    destroy: function() {
        //this.element.remove();
        this.element.removeClass("visworkbench");
        $("#workbench_container").removeClass("hidden");
        $("wb_dlg").removeClass("hidden");
        this._super("_destroy");
    },
    getNoteContent: function(create, publish) {
        var self = this;
        var n = {};
        if (create) {
            n.id = -1;
            n.content = CKEDITOR.instances.workbench.getData();
            // n.content = $('#claim-new-iframe').contents().find('body').html()
        } else {
            n.content = CKEDITOR.instances.workbench.getData(); //tinyMCE.get('claim-edit').getContent();
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

        var allvisdlg = d3.selectAll(".visdlg");
        var serializer = new XMLSerializer(),
            xmlString = "";
        allvisdlg[0].forEach(function(visElement) {
            var visd = d3.select(visElement).node();
            xmlString = xmlString + serializer.serializeToString(visd);

        });
        n.visxml = xmlString;
        console.log(xmlString);
        return n;
    },
});

SIIL.Workbench = function(div) {
    $(".accordion").accordion({
        collapsible: true,
        header: "> div > div.accordion-header"
    }).sortable({
        axis: "y",
        handle: "h3",
        stop: function(event, ui) {
            // IE doesn't register the blur when sorting
            // so trigger focusout handlers to remove .ui-state-focus
            ui.item.children("h3").triggerHandler("focusout");
        }
    });
    $(".rich_editor").jqte();

    $(document).contextmenu({
        delegate: ".jqte_editor",
        menu: "#contextmenu",
        select: function(event, ui) {
            markText('blockquote', ui.cmd);
        }
    });

    // get the selected text as plain format
    function selectionGet() {
        // for webkit, mozilla, opera
        if (window.getSelection)
            return window.getSelection();
        // for ie
        else if (document.selection && document.selection.createRange && document.selection.type != "None")
            return document.selection.createRange();
    }

    function markText(tag, classvalue) {
        if (window.getSelection) {
            var selObj = selectionGet(),
                selRange, newElement, documentFragment;

            if (selObj.anchorNode && selObj.getRangeAt) {
                selRange = selObj.getRangeAt(0);

                // create to new element
                newElement = document.createElement(tag);

                // add the attribute to the new element
                $(newElement).removeClass();
                $(newElement).addClass(classvalue);

                // extract to the selected text
                documentFragment = selRange.extractContents();


                // add the contents to the new element
                newElement.appendChild(documentFragment);

                selRange.insertNode(newElement);
                selObj.removeAllRanges();

                // if the attribute is "style", change styles to around tags
                //				if(tAttr=="style")
                //					affectStyleAround($(newElement),tVal);
                //				// for other attributes
                //				else
                //					affectStyleAround($(newElement),false);
            }
        }
        // for ie
        else if (document.selection && document.selection.createRange && document.selection.type != "None") {
            var range = document.selection.createRange();
            var selectedText = range.htmlText;

            var newText = '<' + tTag + ' ' + tAttr + '="' + tVal + '">' + selectedText + '</' + tTag + '>';

            document.selection.createRange().pasteHTML(newText);
        }
    }
};

SIIL.Workbench.prototype.destroy = function() {
    $(".jqte").remove();
    $(".inner-center").append("<textarea class='rich_editor'></textarea>");
};