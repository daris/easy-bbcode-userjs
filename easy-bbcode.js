var fluxbb_smilies = {
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
};

function insert_text(open, close)
{
	if (document.getElementsByName('req_message'))
		msgfield = document.getElementsByName('req_message')[0];
	else
		document.all.req_message;

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
}


/***********
* Functions for mod QuickQuote v1.1 by D.S.Denton
***********/

quote_text = '';
function get_quote_text()
{
	//IE
	if (document.selection && document.selection.createRange())
		quote_text = document.selection.createRange().text;

	//NS,FF,SM
	if (document.getSelection)
		quote_text = document.getSelection();
}

function Quote(id)
{
	blockpost = document.getElementById('p' + id);
	postleft = getElementsByClassName('postleft', blockpost)[0];
	dt = postleft.getElementsByTagName('dt')[0];
	a = dt.getElementsByTagName('a')[0];
	user_name = a.text;
	
	postleft = getElementsByClassName('postright', blockpost)[0];
	postmsg = getElementsByClassName('postmsg', postleft)[0];
	message = postmsg.innerHTML;
	message = message.replace(/<p class="postedit"><em>.*?<\/em><\/p>/g, '');

	for (smile in fluxbb_smilies)
		message = message.replace(new RegExp('<img src=".*?' + fluxbb_smilies[smile] + '" width="\\d+" height="\\d+" alt=".*?">', 'g'), smile);

	message = message.replace(/<a href="(.*?)">(.*?)<\/a>/g, url_replace);
	
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

	message = message.replace(/&lt;/g, "<");
	message = message.replace(/&gt;/g, ">");
	message = message.replace(/&quot;/g, "\"");
	message = message.replace(/&#039;/g, "'");
	message = message.replace(/&nbsp;/g, " ");
	message = message.replace(/&amp;/g, "&");

	message = message.replace(/<\/p><p>/g, "\n");
	message = message.replace(/<p>/g, '');
	message = message.replace(/<\/p>/g, '');
	message = message.replace(/<br>/g, "\n");

	message = message.replace(new RegExp("^[\\n\\t]+", "g"), "");
	message = message.replace(new RegExp("[\\n\\t]+$", "g"), "");

	startq = '[quote=' + user_name + ']' + (quote_text != '' ? quote_text : message) + '[/quote]';
	insert_text(startq,'');
}

function url_replace()
{
	if (arguments[1].substring(0, 20) == arguments[2].substring(0, 20))
		return '[url]' + arguments[1] + '[/url]';
	else
		return '[url=' + arguments[1] + ']' + arguments[2] + '[/url]';
}

addEventListener('load', function (e)
{
	if (document.getElementsByName('req_message').length > 0)
	{
		var html = '<div style="float: right; margin-right: 10px">';
		for (s in fluxbb_smilies)
			html += '<img onclick="insert_text(\'' + s + '\', \'\');" src="img/smilies/' + fluxbb_smilies[s] + '" width="15" height="15" style="margin-right: 3px" alt="' + s + '" title="' + s + '" />';
		html += '</diV>';
		html += '<div>';
		html += '<input type="button" value="B" name="B" onclick="insert_text(\'[b]\',\'[/b]\')" /> ';
		html += '<input type="button" value="I" name="I" onclick="insert_text(\'[i]\',\'[/i]\')" /> ';
		html += '<input type="button" value="U" name="U" onclick="insert_text(\'[u]\',\'[/u]\')" /> ';
		html += '<input type="button" value="URL" name="URL" onclick="insert_text(\'[url]\',\'[/url]\')" /> ';
		html += '<input type="button" value="IMG" name="IMG" onclick="insert_text(\'[img]\',\'[/img]\')" /> ';
		html += '<input type="button" value="CODE" name="CODE" onclick="insert_text(\'[code]\',\'[/code]\')" /> ';
		html += '<input type="button" value="QUOTE" name="QUOTE" onclick="insert_text(\'[quote]\',\'[/quote]\')" />';
		html += '</div>';

		msg_field = document.getElementsByName('req_message')[0];
		label = msg_field.parentNode;
		fldset = label.parentNode;
		div = document.createElement('div');
		div.innerHTML = html;
		fldset.insertBefore(div, msg_field.parentNode);
		
		if (label.getElementsByTagName('strong').length > 0)
		{
			label.getElementsByTagName('strong')[0].style.display = 'none';
			if (label.getElementsByTagName('br').length > 0)
				label.getElementsByTagName('br')[0].style.display = 'none';
		}

		blockposts = getElementsByClassName('blockpost');
		for (i in blockposts)
		{
			id = blockposts[i].id.replace('p', '');
			postfootright = getElementsByClassName('postfootright', blockposts[i])[0];
			ul = postfootright.getElementsByTagName('ul')[0];
			quote = getElementsByClassName('postquote', ul)[0];
			a = quote.getElementsByTagName('a');

			ul.innerHTML += '<li class="postquickquote"><span><a onmousedown="get_quote_text();" onclick="Quote(\'' + id + '\'); return false;" href="' + a.href + '">Quick quote</a></span></li>';
		}
	}
}, false);

function getElementsByClassName(classname, node)
{
	if (!node) node = document.getElementsByTagName("body")[0];
	var a = [];
	var re = new RegExp('\\b' + classname + '\\b');
	var els = node.getElementsByTagName("*");
	for (var i=0,j=els.length; i<j; i++)
		if (re.test(els[i].className)) a.push(els[i]);
	return a;
}