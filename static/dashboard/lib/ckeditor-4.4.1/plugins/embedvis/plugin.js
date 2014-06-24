CKEDITOR.plugins.add('embedvis', {
    init: function(editor) {
        icons: 'network,person,location',
        editor.addCommand('embednw', {
            exec: function(editor) {
                var allvisdlg = d3.selectAll(".visdlg");
                var serializer = new XMLSerializer(),
                    xmlString = "";
                allvisdlg[0].forEach(function(visElement) {
                    var visd = d3.select(visElement).node();
                    xmlString = xmlString + serializer.serializeToString(visd);

                });
                // var tagname = editor.name + "_network"; //wb_editor_1_netowrk



                //store into the database table Vis and mark as unsaved
                var newvis = {};
                newvis.type = "network";
                newvis.date_updated = new Date().toGMTString();
                newvis.vis = xmlString;
                newvis.saved = false;
                $.ajax({
                    url: 'workbench/visEmbed',
                    type: "POST",
                    data: newvis,
                    success: function(res) {
                        editor.insertHtml('<a href="#" vid="' + res.id + '" class="ref-link"><sup>[' + newvis.date_updated + ' ' + newvis.type + ']</sup></a>');
                        if (visxml[editor.name] == undefined) visxml[editor.name] = [];
                        visxml[editor.name].push(res.id);
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
        });
        var self = this;
        // editor.addCommand('embednw', {
        //     exec: function(editor) {
        //         var text = editor.getSelection().getSelectedText();
        //         editor.insertHtml('<span style="background-color:Green">&emsp;Claim: <span style="font-weight:bold;">' + text + '</span></span>');
        //     }
        // });

        // editor.addCommand('markProof', {
        //     exec: function(editor) {
        //         var text = editor.getSelection().getSelectedText();
        //         editor.insertHtml('<span style="background-color:Red">&emsp;&emsp;Proof: <span style="font-weight:bold;">' + text + '</span></span>');
        //     }
        // });
        editor.ui.addButton('network', {

            // The text part of the button (if available) and tooptip.
            label: 'Insert network visual components',

            // The command to execute on click.
            command: 'embednw',
            icon: this.path + 'icons/network.png',
            // The button placement in the toolbar (toolbar group name).
            toolbar: 'links'
        });

        // editor.ui.addButton('claim', {

        //     // The text part of the button (if available) and tooptip.
        //     label: 'Annotate as claim',

        //     // The command to execute on click.
        //     command: 'markClaim',
        //     icon: this.path + 'icons/claim.png',
        //     // The button placement in the toolbar (toolbar group name).
        //     toolbar: 'insert'
        // });

        // editor.ui.addButton('proof', {

        //     // The text part of the button (if available) and tooptip.
        //     label: 'Annotate as proof',

        //     // The command to execute on click.
        //     command: 'markProof',
        //     icon: this.path + 'icons/proof.png',
        //     // The button placement in the toolbar (toolbar group name).
        //     toolbar: 'insert'
        // });
        if (editor.contextMenu) {

            editor.contextMenu.addListener(function(element, selection) {

                editor.addMenuGroup('VisGroup');
                editor.addMenuItem('VisNetwork', {
                    label: 'Insert network as visual components',
                    icon: self.path + 'icons/network.png',
                    command: 'embednw',
                    group: 'VisGroup'
                });
                // editor.addMenuItem('ClaimMarker', {
                //     label: 'Mark as Claim',
                //     icon: self.path + 'icons/claim.png',
                //     command: 'markClaim',
                //     group: 'AnnoGroup'
                // });
                // editor.addMenuItem('ProofMarker', {
                //     label: 'Mark as Proof',
                //     icon: self.path + 'icons/proof.png',
                //     command: 'markProof',
                //     group: 'AnnoGroup'
                // });

                return {
                    VisNetwork: CKEDITOR.TRISTATE_OFF
                    // ,
                    // ProofMarker: CKEDITOR.TRISTATE_OFF,
                    // ClaimMarker: CKEDITOR.TRISTATE_OFF
                };

            });
        }
    }

});