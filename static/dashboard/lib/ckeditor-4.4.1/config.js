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
    { name: 'styles' },
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
 config.stylesSet = 'my_styles';
 //config.extraPlugins='xmltemplates, templates';
 //config.templates_files = [ 'plugins/templates/templates/default.js' ];
};

// CKEDITOR.stylesSet.add( 'my_styles', [
//     // Block-level styles.
//     { name: 'Blue Title', element: 'h2', styles: { color: 'Blue' } },
//     { name: 'Red Title',  element: 'h3', styles: { color: 'Red' } },

//     // Inline styles.
//     { name: 'CSS Style', element: 'li', attributes: { 'class': 'question' }, styles: { 'background-color': 'Yellow' } },
//     { name: 'Marker: Yellow', element: 'span', styles: { "background-color":rgba(255, 166, 166, 0.21), 'font-weight':'bold'} }
// ]);