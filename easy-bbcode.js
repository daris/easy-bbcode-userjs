// ==UserScript==
// @name        Easy BBCode
// @description Shows a bbcode bar
// @include     https://fluxbb.org/*
// @include     http://fluxbb.org/*
// @include     http://localhost/*
// @author      daris
// ==/UserScript==

ebbc =
{
	fluxbb_smilies : {
		':)' : 'smile.png',
		'=)' : 'smile.png',
		':|' : 'neutral.png',
		'=|' : 'neutral.png',
		':(' : 'sad.png',
		'=(' : 'sad.png',
		':D' : 'big_smile.png',
		'=D' : 'big_smile.png',
		':o' : 'yikes.png',
		':O' : 'yikes.png',
		';)' : 'wink.png',
		':/' : 'hmm.png',
		':P' : 'tongue.png',
		':p' : 'tongue.png',
		':lol:' : 'lol.png',
		':mad:' : 'mad.png',
		':rolleyes:' : 'roll.png',
		':cool:' : 'cool.png'
	},

	init : function()
	{
		window.addEventListener('DOMContentLoaded', ebbc.bbcodeOnLoad, false);
	},

	insertText : function(msgfield, open, close)
	{
		// IE support
		if (document.selection && document.selection.createRange)
		{
			msgfield.focus();
			sel = document.selection.createRange();
			sel.text = open + sel.text + close;
		}

		// Moz support
		else if (msgfield.selectionStart || msgfield.selectionStart == '0')
		{
			var startPos = msgfield.selectionStart;
			var endPos = msgfield.selectionEnd;
			var selText = msgfield.value.substring(startPos, endPos);

			msgfield.value = msgfield.value.substring(0, startPos) + open + selText + close + msgfield.value.substring(endPos, msgfield.value.length);
			if (selText != '')
			{
				msgfield.selectionStart = endPos + open.length + close.length;
				msgfield.selectionEnd = msgfield.selectionStart;
			}
			else
			{
				msgfield.selectionStart = startPos + open.length;
				msgfield.selectionEnd = msgfield.selectionStart;
			}
		}

		// Fallback support for other browsers
		else
			msgfield.value += open + close;

		msgfield.focus();

		return;
	},

	getQuoteText : function()
	{
		//IE
		if (document.selection && document.selection.createRange())
			quote_text = document.selection.createRange().text;

		//NS,FF,SM
		if (document.getSelection)
			quote_text = document.getSelection();
	},

	quote : function(form, field, id)
	{
		var msgfield = document.getElementById(form).elements[field];

		blockpost = document.getElementById('p' + id);
		postlefttags = ebbc.getElementsByClassName('postleft', blockpost);
		if (postlefttags.length > 0)
		{
			postleft = postlefttags[0];

			dt = postleft.getElementsByTagName('dt')[0];
			a = dt.getElementsByTagName('a')[0];

			user_name = a.text;
			postleft = ebbc.getElementsByClassName('postright', blockpost)[0];
			postmsg = ebbc.getElementsByClassName('postmsg', postleft)[0];
		}
		else
		{
			item_info = ebbc.getElementsByClassName('item-info', blockpost)[0];
			user = ebbc.getElementsByClassName('user', item_info)[0];
			user_name = user.getElementsByTagName('a')[0].text;
			postmsg = ebbc.getElementsByClassName('bbcode-formatted', blockpost)[0];
		}

		message = postmsg.innerHTML;

		// Remove "last edited by" text
		message = message.replace(/<p class="postedit"><em>.*?<\/em><\/p>/g, '');

		// Smilies
		for (smile in ebbc.fluxbb_smilies)
			message = message.replace(new RegExp('<img src=".*?' + ebbc.fluxbb_smilies[smile] + '" width="\\d+" height="\\d+" alt=".*?">', 'g'), smile);

		// Links
		message = message.replace(/<a href="(.*?)">(.*?)<\/a>/g, ebbc.urlReplace);

		// Code/quote blocks
		message = message.replace(/<div class="quotebox"><cite>(.*?) (wrote|napisał):<\/cite><blockquote><div>/g, '[quote=$1]');
		message = message.replace(/<div class="quotebox"><blockquote><div>/g, '[quote]');
		message = message.replace(/<\/div><\/blockquote><\/div>/g, '[/quote]');
		message = message.replace(/<div class="codebox"><pre><code>/g, '[code]');
		message = message.replace(/<\/code><\/pre><\/div>/g, '[/code]');

		message = message.replace(/<strong>/g, '[b]');
		message = message.replace(/<\/strong>/g, '[/b]');
		message = message.replace(/<em>/g, '[i]');
		message = message.replace(/<\/em>/g, '[/i]');
		message = message.replace(/<span class="bbu">(.*?)<\/span>/g, '[u]$1[/u]');

		// Lists
		message = message.replace(/<ol class="decimal">/g, '[list=1]');
		message = message.replace(/<ol.*>/g, '[list]');
		message = message.replace(/<li>/g, '[*]');
		message = message.replace(/<\/li>/g, '[/*]');
		message = message.replace(/<\/ol>/g, '[/list]');

		// Decode html special chars
		message = message.replace(/&lt;/g, "<");
		message = message.replace(/&gt;/g, ">");
		message = message.replace(/&quot;/g, "\"");
		message = message.replace(/&#039;/g, "'");
		message = message.replace(/&nbsp;/g, " ");
		message = message.replace(/&amp;/g, "&");

		// Deal with newlines
		message = message.replace(/<\/p><p>/g, "\n");
		message = message.replace(/<p>/g, '');
		message = message.replace(/<\/p>/g, '');
		message = message.replace(/<br>/g, "\n");

		// Strip tabs
		message = message.replace(new RegExp("^[\\n\\t]+", "g"), "");
		message = message.replace(new RegExp("[\\n\\t]+$", "g"), "");

		startq = '[quote=' + user_name + ']' + (quote_text != '' ? quote_text : message) + '[/quote]';
		ebbc.insertText(msgfield, startq, '');
	},

	urlReplace : function()
	{
		if (arguments[1].substring(0, 20) == arguments[2].substring(0, 20))
			return '[url]' + arguments[1] + '[/url]';
		else
			return '[url=' + arguments[1] + ']' + arguments[2] + '[/url]';
	},

	showBbcodeBar : function(form, msgfield, no_smilies, quote_field)
	{
		if (!document.getElementById(form))
			return false;

		if (!document.getElementById(form).elements[msgfield])
			return false;

		var html = '';
		if (!no_smilies)
		{
			html += '<div style="float: right; margin-top: 4px; margin-right: 10px">';
			for (s in ebbc.fluxbb_smilies)
				html += '<img onclick="ebbc.insertText(\'' + s + '\', \'\');" src="img/smilies/' + ebbc.fluxbb_smilies[s] + '" width="15" height="15" style="margin-right: 3px" alt="' + s + '" title="' + s + '" />';
			html += '</diV>';
		}

		html += '<div>';
		html += '<input type="button" value="b" name="b" onclick="ebbc.insertText(this.form.elements[\'' + msgfield + '\'], \'[b]\',\'[/b]\')" /> ';
		html += '<input type="button" value="i" name="i" onclick="ebbc.insertText(this.form.elements[\'' + msgfield + '\'], \'[i]\',\'[/i]\')" /> ';
		html += '<input type="button" value="u" name="u" onclick="ebbc.insertText(this.form.elements[\'' + msgfield + '\'], \'[u]\',\'[/u]\')" /> ';
		html += '<input type="button" value="url" name="url" onclick="ebbc.insertText(this.form.elements[\'' + msgfield + '\'], \'[url]\',\'[/url]\')" /> ';
		html += '<input type="button" value="img" name="img" onclick="ebbc.insertText(this.form.elements[\'' + msgfield + '\'], \'[img]\',\'[/img]\')" /> ';
		html += '<input type="button" value="code" name="code" onclick="ebbc.insertText(this.form.elements[\'' + msgfield + '\'], \'[code]\',\'[/code]\')" /> ';
		html += '<input type="button" value="quote" name="quote" onclick="ebbc.insertText(this.form.elements[\'' + msgfield + '\'], \'[quote]\',\'[/quote]\')" />';
		html += '</div>';

		msg_field = document.getElementById(form).elements[msgfield];
		label = msg_field.parentNode;
		if (label.tagName.toLowerCase() != 'label')
			label = msg_field

		fldset = label.parentNode;
		div = document.createElement('div');
		div.setAttribute('class', 'bbcode-bar');
		div.setAttribute('style', 'margin-bottom: 4px;');
		div.innerHTML = html;
		fldset.insertBefore(div, label);

		if (label.getElementsByTagName('strong').length > 0)
		{
			label.getElementsByTagName('strong')[0].style.display = 'none';
			if (label.getElementsByTagName('br').length > 0)
				label.getElementsByTagName('br')[0].style.display = 'none';
		}

		if (!quote_field)
			quote_field = 'blockpost';

		if (quote_field == 'blockpost')
		{
			blockposts = ebbc.getElementsByClassName('blockpost');
			for (i in blockposts)
			{
				id = blockposts[i].id.replace('p', '');
				postfootright = ebbc.getElementsByClassName('postfootright', blockposts[i])[0];
				ul = postfootright.getElementsByTagName('ul')[0];
				quote = ebbc.getElementsByClassName('postquote', ul)[0];
				a = quote.getElementsByTagName('a');

				ul.innerHTML += '<li class="postquickquote"><span><a onmousedown="ebbc.getQuoteText();" onclick="ebbc.quote(\'' + form + '\', \'' + msgfield + '\', \'' + id + '\'); return false;" href="' + a.href + '">&quot; &quot;</a></span></li>';
			}
		}
		else if (quote_field == 'ticket-history')
		{
			blockposts = ebbc.getElementsByClassName(quote_field);
			var id = 0;

			for (i in blockposts)
			{
				blockposts[i].setAttribute('id', 'p' + id);

				if (ebbc.getElementsByClassName('bbcode-formatted', blockposts[i]).length == 0)
					continue;

				item_info = ebbc.getElementsByClassName('time', blockposts[i])[0];

				item_info.innerHTML = '<a onmousedown="ebbc.getQuoteText();" onclick="ebbc.quote(\'' + form + '\', \'' + msgfield + '\', \'' + id + '\'); return false;" href="javascript:;">&quot; &quot;</a> | ' + item_info.innerHTML;
				id++;
			}
		}
	},

	getElementsByClassName : function(classname, node)
	{
		if (!node) node = document.getElementsByTagName("body")[0];
		var a = [];
		var re = new RegExp('\\b' + classname + '\\b');
		var els = node.getElementsByTagName("*");
		for (var i=0,j=els.length; i<j; i++)
			if (re.test(els[i].className)) a.push(els[i]);
		return a;
	},

	bbcodeOnLoad : function()
	{
		ebbc.showBbcodeBar('quickpostform', 'req_message');
		ebbc.showBbcodeBar('edit', 'req_message');
		ebbc.showBbcodeBar('post', 'req_message');

		if (window.location.href.indexOf('tickets') != -1)
		{
			if (!document.forms[0].name)
				document.forms[0].setAttribute('id', 'ticket-form');
			ebbc.showBbcodeBar('ticket-form', 'comment', 1, 'ticket-history');
			ebbc.showBbcodeBar('ticket-form', 'description', 1);
		}
	}
};

var uw = (this.unsafeWindow) ? this.unsafeWindow : window;
uw.ebbc = ebbc;
uw.ebbc.init();
