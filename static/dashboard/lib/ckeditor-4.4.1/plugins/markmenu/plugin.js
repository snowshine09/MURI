CKEDITOR.plugins.add('markmenu', {
    init: function(editor) {
        icons: 'question,claim,proof',
        editor.addCommand('markQuestion', {
            exec: function(editor) {
                var EDTselection = editor.getSelection();
                var text = ''; //EDTselection.getSelectedText();
                var html = getSelectedHTML(editor);
                html = Preprocess(html); //remove tags
                var litags = $('<div>'+html+'</div>').find("li");
                if (litags.length != 0) {
                    ultext = '';
                    for (i = 0; i < litags.length; i++) {
                        ultext = ultext + '<li class = "question"  style="background-color:rgba(255, 166, 166, 0.21);font-weight:bold;">'+$(litags[i]).html()+ '</li>';// question-'+i+' qlevel-2
                    }
                    text = '<ul>' +ultext + '</ul>';
                }
                else {
                    text = '<h3 class = "question" style="background-color:rgba(255, 166, 166, 0.21);font-weight:bold;">' + html + '</h3>';
                }
                editor.insertHtml(text);
            }
        });
        editor.addCommand('markClaim', {
            exec: function(editor) {
                var EDTselection = editor.getSelection();
                var text = ''; //EDTselection.getSelectedText();
                var html = getSelectedHTML(editor);
                var litags = $('<div>'+html+'</div>').find("li");
                if (litags.length != 0) {
                    ultext = '';
                    for (i = 0; i < litags.length; i++) {
                        ultext = ultext + '<li class = "claim"  style="background-color:rgba(226, 214, 69, 0.21);font-weight:bold;">'+$(litags[i]).html()+ '</li>';// question-'+i+' qlevel-2
                    }
                    text = '<ul>' +ultext + '</ul>';
                }
                else {
                    text = '<h3 class = "claim" style="background-color:rgba(226, 214, 69, 0.21);font-weight:bold;">' + html + '</h3>';
                }
                editor.insertHtml(text);
                //editor.insertHtml('<span class = "claim" style="background-color:rgba(226, 214, 69, 0.21)">&emsp;Claim: <span style="font-weight:bold;">' + text + '</span></span>');
            }
        });
        var self = this;
        editor.addCommand('markProof', {
            exec: function(editor) {
                var EDTselection = editor.getSelection();
                var text = ''; //EDTselection.getSelectedText();
                var html = getSelectedHTML(editor);
                var litags = $('<div>'+html+'</div>').find("li");
                if (litags.length != 0) {
                    ultext = '';
                    for (i = 0; i < litags.length; i++) {
                        ultext = ultext + '<li class = "evidence"  style="background-color:rgba(86, 179, 241, 0.21);font-weight:bold;">'+$(litags[i]).html()+ '</li>';// question-'+i+' qlevel-2
                    }
                    text = '<ul>' +ultext + '</ul>';
                }
                else {
                    text = '<h3 class = "evidence" style="background-color:rgba(86, 179, 241, 0.21);font-weight:bold;">' + html + '</h3>';
                }
                editor.insertHtml(text);
                // editor.insertHtml('<span class = "evidence" style="background-color:rgba(86, 179, 241, 0.21)">&emsp;&emsp;Proof: <span style="font-weight:bold;">' + text + '</span></span>');
            }
        });
        editor.ui.addButton('question', {

            // The text part of the button (if available) and tooptip.
            label: 'Annotate As Question',

            // The command to execute on click.
            command: 'markQuestion',
            icon: this.path + 'icons/question.png',
            // The button placement in the toolbar (toolbar group name).
            toolbar: 'tools'
        });

        editor.ui.addButton('claim', {

            // The text part of the button (if available) and tooptip.
            label: 'Annotate as claim',

            // The command to execute on click.
            command: 'markClaim',
            icon: this.path + 'icons/claim.png',
            // The button placement in the toolbar (toolbar group name).
            toolbar: 'tools'
        });

        editor.ui.addButton('proof', {

            // The text part of the button (if available) and tooptip.
            label: 'Annotate as proof',

            // The command to execute on click.
            command: 'markProof',
            icon: this.path + 'icons/proof.png',
            // The button placement in the toolbar (toolbar group name).
            toolbar: 'tools'
        });
        if (editor.contextMenu) {

            editor.contextMenu.addListener(function(element, selection) {
                editor.selectionChange(1);
                if (editor.getSelection().getSelectedText() == '\n' || editor.getSelection().getSelectedText().length == 0) {
                    editor.removeMenuItem('QuestionMarker');
                    editor.removeMenuItem('ClaimMarker');
                    editor.removeMenuItem('ProofMarker');
                } else {
                    editor.addMenuGroup('AnnoGroup');
                    editor.addMenuItem('QuestionMarker', {
                        label: 'Mark as Question',
                        icon: self.path + 'icons/question.png',
                        command: 'markQuestion',
                        group: 'AnnoGroup'
                    });
                    editor.addMenuItem('ClaimMarker', {
                        label: 'Mark as Claim',
                        icon: self.path + 'icons/claim.png',
                        command: 'markClaim',
                        group: 'AnnoGroup'
                    });
                    editor.addMenuItem('ProofMarker', {
                        label: 'Mark as Proof',
                        icon: self.path + 'icons/proof.png',
                        command: 'markProof',
                        group: 'AnnoGroup'
                    });

                    return {
                        QuestionMarker: CKEDITOR.TRISTATE_OFF,
                        ProofMarker: CKEDITOR.TRISTATE_OFF,
                        ClaimMarker: CKEDITOR.TRISTATE_OFF
                    };
                }
            });
        }
    }

});

function getSelectedHTML(editor) {
    var sel = editor.getSelection();
    var ranges = sel.getRanges();
    var el = new CKEDITOR.dom.element("div");
    for (var i = 0, len = ranges.length; i < len; ++i) {
        el.append(ranges[i].cloneContents());
    }
    return el.getHtml();

}

function Preprocess(html){
    var html = '<div>'+html+'</div>'
    console.log(html);
    // var qtags = $(html).find('.question'), ctags = $(html).find('.claim'), ptags = $(html).find('.evidence');
    // if(qtags.length!=0){
    //     for(i = 0; i< qtags.length; i++){
    //         qtags[i].removeClass('question').removeAttr( 'style' )
    //         $(html).find('.question')[i].replaceWith(qtags[i]);

    //     }
    // }
    // if(ctags.length!=0){
    //     for(i = 0; i< ctags.length; i++){
    //         $(ctags[i]).removeClass('claim').removeAttr( 'style' )
    //         $(html).find('.claim')[i].replaceWith(ctags[i]);

    //     }
    // }
    // if(ptags.length!=0){
    //     for(i = 0; i< ptags.length; i++){
    //         $(html).find(ptags[i]).replaceWith($(ptags[i]).removeClass('evidence').removeAttr( 'style' ));

    //     }
    // }
    // $(html).children().each(function(index,ele){
    //     $(ele).removeClass('question').removeAttr( 'style' );
    //     $(ele).removeClass('claim').removeAttr( 'style' );
    //     $(ele).removeClass('evidence').removeAttr( 'style' );
    // });
    $(html).find('.question').removeClass('question').removeAttr( 'style' );
    $(html).find('.claim').removeClass('claim').removeAttr( 'style' );
    $(html).find('.evidence').removeClass('evidence').removeAttr( 'style' );
    console.log(html);
    console.log($(html).html());
    return $(html).html();
}