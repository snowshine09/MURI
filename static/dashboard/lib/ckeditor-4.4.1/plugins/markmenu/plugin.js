CKEDITOR.plugins.add( 'markmenu', {
    init: function( editor ) {
    	icons: 'question,claim,proof',
    	editor.addCommand( 'markQuestion', {
    	  	exec: function( editor ) {
    	  		var text = editor.getSelection().getSelectedText();
    	  		editor.insertHtml( '<span style="background-color:Yellow">Question: <span style="font-weight:bold;">'+text+'</span></span>' );
    	  	}
	    });
    	editor.addCommand( 'markClaim', {
    	  	exec: function( editor ) {
    	  		var text = editor.getSelection().getSelectedText();
    	  		editor.insertHtml( '<span style="background-color:Green">&emsp;Claim: <span style="font-weight:bold;">'+text+'</span></span>' );
    	  	}
	    });
        var self = this;
    	editor.addCommand( 'markProof', {
    	  	exec: function( editor ) {
    	  		var text = editor.getSelection().getSelectedText();
    	  		editor.insertHtml( '<span style="background-color:Red">&emsp;&emsp;Proof: <span style="font-weight:bold;">'+text+'</span></span>' );
    	  	}
	    });
    	editor.ui.addButton( 'question', {

            // The text part of the button (if available) and tooptip.
            label: 'Annotate As Question',

            // The command to execute on click.
            command: 'markQuestion',
            icon: this.path + 'icons/question.png',
            // The button placement in the toolbar (toolbar group name).
            toolbar: 'insert'
        });

        editor.ui.addButton( 'claim', {

            // The text part of the button (if available) and tooptip.
            label: 'Annotate as claim',

            // The command to execute on click.
            command: 'markClaim',
            icon: this.path + 'icons/claim.png',
            // The button placement in the toolbar (toolbar group name).
            toolbar: 'insert'
        });

        editor.ui.addButton( 'proof', {

            // The text part of the button (if available) and tooptip.
            label: 'Annotate as proof',

            // The command to execute on click.
            command: 'markProof',
            icon: this.path + 'icons/proof.png',
            // The button placement in the toolbar (toolbar group name).
            toolbar: 'insert'
        });
		if (editor.contextMenu) {
            
            editor.contextMenu.addListener( function( element,selection ) {
                editor.selectionChange( 1 );
                if (editor.getSelection().getSelectedText()=='\n' || editor.getSelection().getSelectedText().length == 0) { 
                    editor.removeMenuItem('QuestionMarker');
                    editor.removeMenuItem('ClaimMarker');
                    editor.removeMenuItem('ProofMarker');
                }
                else{
                    editor.addMenuGroup( 'AnnoGroup' );
                    editor.addMenuItem( 'QuestionMarker', {
                                label: 'Mark as Question',
                                icon: self.path + 'icons/question.png',
                                command: 'markQuestion',
                                group: 'AnnoGroup'
                            });
                    editor.addMenuItem( 'ClaimMarker', {
                                label: 'Mark as Claim',
                                icon: self.path + 'icons/claim.png',
                                command: 'markClaim',
                                group: 'AnnoGroup'
                            });
                    editor.addMenuItem( 'ProofMarker', {
                        label: 'Mark as Proof',
                        icon:self.path + 'icons/proof.png',
                        command: 'markProof',
                        group: 'AnnoGroup'
                    });

                    return { QuestionMarker: CKEDITOR.TRISTATE_OFF,ProofMarker: CKEDITOR.TRISTATE_OFF,ClaimMarker: CKEDITOR.TRISTATE_OFF };
                }
            });
        }
  	} 	 		
    
});