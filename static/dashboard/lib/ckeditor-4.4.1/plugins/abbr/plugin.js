/**
 * Basic sample plugin inserting abbreviation elements into CKEditor editing area.
 *
 * Created out of the CKEditor Plugin SDK:
 * http://docs.ckeditor.com/#!/guide/plugin_sdk_sample_1
 */

// Register the plugin within the editor.
CKEDITOR.plugins.add( 'abbr', {

	// Register the icons.
	icons: 'abbr',

	// The plugin initialization logic goes inside this method.
	init: function( editor ) {
		//alert("initalize abbr");

		// Define an editor command that opens our dialog.
		editor.addCommand( 'abbr', new CKEDITOR.dialogCommand( 'abbrDialog' ) );

		// Create a toolbar button that executes the above command.
		editor.ui.addButton( 'Abbr', {

			// The text part of the button (if available) and tooptip.
			label: 'Insert Abbreviation',

			// The command to execute on click.
			command: 'abbr',

			// The button placement in the toolbar (toolbar group name).
			toolbar: 'insert'
		});

		if ( editor.contextMenu ) {
			editor.addMenuGroup( 'AnnoGroup' );
			editor.addMenuItem( 'QuestionMarker', {
                        label: 'Mark as Question',
                        // icon: this.path + 'icons/question.png',
                        command: 'markQuestion',
                        group: 'AnnoGroup'
                    });
			editor.addMenuItem( 'ClaimMarker', {
                        label: 'Mark as Claim',
                        // icon: this.path + 'icons/claims.png',
                        command: 'markClaim',
                        group: 'AnnoGroup'
                    });
            editor.addMenuItem( 'ProofMarker', {
                label: 'Mark as Proof',
                // icon: this.path + 'icons/proof.png',
                command: 'markProof',
                group: 'AnnoGroup'
            });
			editor.contextMenu.addListener( function( element ) {
				if ( element.getAscendant( 'abbr', true ) ) {
					return { abbrItem: CKEDITOR.TRISTATE_OFF };
				}
			});
		}

		// Register our dialog file. this.path is the plugin folder path.
		CKEDITOR.dialog.add( 'abbrDialog', this.path + 'dialogs/abbr.js' );
	}
});

