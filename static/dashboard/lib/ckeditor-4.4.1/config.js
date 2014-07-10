/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function(config) {
	config.toolbar = [
		['Cut', 'Copy', 'Paste'],
		['Undo', 'Redo'],
		['Bold', 'Italic'],
		['NumberedList', 'BulletedList'],
		['question', 'claim', 'confirm_evidence', 'disconfirm_evidence', '-', 'RemoveFormat'],
		['network']
	];
	config.forcePasteAsPlainText = true;
	config.allowedContent = true;
	config.enterMode = CKEDITOR.ENTER_BR;
	config.height = '330px';
	config.width = '100%';
};
