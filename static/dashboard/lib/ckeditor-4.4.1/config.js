/**
 * @license Copyright (c) 2003-2013, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.html or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	config.toolbarGroups = [
    { name: 'clipboard',   groups: [ 'clipboard', 'undo' ] },
    { name: 'editing',     groups: [ 'find', 'selection', 'spellchecker' ] },
    { name: 'links' },
    // { name: 'insert' },
    // { name: 'forms' },
    { name: 'tools' },
    { name: 'document',    groups: [ 'mode', 'document', 'doctools' ] },
    // { name: 'others' },
    '/',
    { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
    { name: 'paragraph',   groups: [ 'list', 'indent', 'blocks', 'align' ] },
    // { name: 'styles' },
    // { name: 'colors' },
    // { name: 'about' }
];
//templates_files : ['xml:fcktemplates.xml']
// config.removePlugins= 'pastetext,clipboard,pastefromword';
 config.allowedContent = true;
 config.enterMode = CKEDITOR.ENTER_BR;
 config.height = '330px';
 config.width = '100%';
 config.removePlugins = 'elementspath';
 //config.extraPlugins='xmltemplates, templates';
 //config.templates_files = [ 'plugins/templates/templates/default.js' ];
};
