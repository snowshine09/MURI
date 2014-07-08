CKEDITOR.plugins.add('embedvis', {
    init: function(editor) {
        icons: 'network,person,location',
        editor.addCommand('embednw', {
            exec: function(editor) {
                var allvisdlg = d3.selectAll(".visdlg"),
                    IDs = [];
                var newvis = {};
                newvis.date_updated = new Date().toGMTString();
                newvis.saved = false;
                for (i = 0; i < allvisdlg[0].length; i++) {
                    if ($(allvisdlg[0][i]).dialogExtend("state") != "minimized") {
                        var vType = $(allvisdlg[0][i]).attr("id").split("_")[0],
                            SID = $(allvisdlg[0][i]).attr("id").split("_")[2];
                        alert("store dialog " + vType + SID);
                        if (newvis[SID] == undefined) {
                            newvis[SID] = {};
                            IDs.push(SID);
                            newvis[SID].types_info = {};
                            newvis[SID].dsource = [];
                            for (j = 0; j < dataset[SID]['event'].length; j++) {
                                newvis[SID].dsource.push(dataset[SID]['event'][j]['uid']);
                            }
                            newvis[SID].color = $(allvisdlg[0][i]).siblings(".ui-dialog-titlebar").css("background-color");
                            newvis[SID].dindex = dindex[SID];
                            newvis[SID].msgID = msgID[SID];
                            newvis[SID].htimeline = htimeline[SID];
                            newvis[SID].timeextent = timeextent[SID];
                            // var hTL = '';
                            // if (htimeline[SID] != undefined) {
                            //     for (j = 0; j < htimeline[SID].length; j++) {
                            //         if (j == 0) hTL += htimeline[SID][j];
                            //         else hTL += ',' + htimeline[SID][j];
                            //     }
                            //     newvis[SID].htimeline = hTL;
                            // }
                            // if (timeextent[SID] != undefined) {
                            //     newvis[SID].timeextent = timeextent[SID][0] + ',' + timeextent[SID][1];
                            // }
                        }
                        newvis[SID].types_info[vType] = $(allvisdlg[0][i]).parent().position()['left'] + ',' + $(allvisdlg[0][i]).parent().position()['top'];
                    }
                }
                newvis.SIDs = IDs;

                console.log(newvis);

                $.ajax({
                    url: 'workbench/visEmbed',
                    type: "POST",
                    data: {
                        "newvis": JSON.stringify(newvis)
                    },
                    success: function(res) {
                        editor.insertHtml('<a href="#" vid="' + res.id + '" class="ref-link"><sup>[' + newvis.date_updated + ' ]</sup></a>');
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
            // var tagname = editor.name + "_network"; //wb_editor_1_netowrk

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