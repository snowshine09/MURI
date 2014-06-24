/**
 * @license Copyright (c) 2003-2014, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

// Register a templates definition set named "default".
CKEDITOR.addTemplates('default', {
	// The name of sub folder which hold the shortcut preview images of the
	// templates.
	imagesPath: CKEDITOR.getUrl(CKEDITOR.plugins.getPath('templates') + 'templates/images/'),

	// The templates definitions.
	templates: [{
		title: 'PIR and subquestions',
		image: 'template1.gif',
		description: 'One main PIR (Priority Intelligence Requirement) with derived questions as entry points',
		html: '<h3 class = "PIR">' +
			'Type the PIR here' +
			'</h3>' +
			'<p class = "question">' +
			'Type the correspondent questions here' +
			'</p>' +
			'<a href = alert("add");> Add more...' +
			'</a>'

	}, {
		title: 'Question and hypotheses',
		image: 'template2.gif',
		description: 'A template that is used to specify concrete hypotheses for the assigned question',
		html: '<table cellspacing="0" cellpadding="0" style="width:100%" border="0">' +
			'<tr>' +
			'<td style="width:50%">' +
			'<h3>Title 1</h3>' +
			'</td>' +
			'<td></td>' +
			'<td style="width:50%">' +
			'<h3>Title 2</h3>' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td>' +
			'Text 1' +
			'</td>' +
			'<td></td>' +
			'<td>' +
			'Text 2' +
			'</td>' +
			'</tr>' +
			'</table>' +
			'<a href = alert("more text");>' +
			'More text goes here.' +
			'</a>'
	}, {
		title: 'Hypotheses and claims',
		image: 'template3.gif',
		description: 'A hypotheses with associated claims and inferences.',
		html: '<table cellspacing="0" cellpadding="0" style="width:100%" border="0">' +
			'<tr>' +
			'<td style="width:50%">' +
			'<h4>Hypothesis goes here</h4>' +
			'</td>' +
			'<td></td>' +
			'<td style="width:50%">' +
			'<h3>Title 2</h3>' +
			'</td>' +
			'</tr>' +
			'<tr>' +
			'<td>' +
			'Text 1' +
			'</td>' +
			'<td></td>' +
			'<td>' +
			'Text 2' +
			'</td>' +
			'</tr>' +
			'</table>' +
			'<a href = alert("more text");>' +
			'More hypotheses goes here.' +
			'</a>'
	}, {
		title: 'Claim and evidences',
		image: 'template3.gif',
		description: 'Claims with reasons and warrants associated with visual evidences in the schematized structures.',
		html: '<table cellspacing="0" cellpadding="0" style="width:100%" border="1">' +
			'<tr>' +
			'<td class = "claim-editor" style="width:50%">' +
			'<h3>Claim goes here</h3>' +
			'</td>' +
			'<td style="width:50%">' +
			'<p class = "evidence">Elaborations supported with evidences</p>' +
			'</td>' +
			'</tr>' +
			'</table>'
	}]
});