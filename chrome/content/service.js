/*
  This file is part of 'Notify me' (SamePlace addon).

  'Notify me' is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License,
  or any later version.
  
  'Notify me' is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License
  along with 'Notify me'.  If not, see <http://www.gnu.org/licenses/>.
*/

// GLOBAL DEFINITIONS
// ----------------------------------------------------------------------



/* Enable external scripts import */
const loader = Cc['@mozilla.org/moz/jssubscript-loader;1']
    .getService(Ci.mozIJSSubScriptLoader);

/* Initialize interfaces to manage prefs */
const pref = Components
    .classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService)
    .getBranch('extensions.notifyme.');



/* NameSpaces */
const ns_muc      = new Namespace('http://jabber.org/protocol/muc');
const ns_muc_user = new Namespace('http://jabber.org/protocol/muc#user');
const ns_composing = new Namespace('http://jabber.org/protocol/chatstates');
const ns_roster     = 'jabber:iq:roster';
const ns_x4m_in = 'http://hyperstruct.net/xmpp4moz/protocol/internal';
const ns_vcard  = 'vcard-temp';
const defaultAvatar = 'chrome://notifyme/skin/logo96.png';

/* Global vars */
var win;
var sound;
var popup;
var roomspopup;

var channel;
var XMPP;
var account;
var util = {};

var roster;
var avatar;

// ----------------------------------------------------------------------


function init() {
    // Component loading check
    dump("XPCOM Component has been loaded \n");

    /* Checks if an old version left prefs type as String and fix it to Boolean*/
    if (pref.getPrefType('togglePopupKey') != "128" || pref.getPrefType('toggleSoundKey') != "128"  ){
	
	pref.deleteBranch("");
    }

    // Makes xmpp4moz available here 
    var env = {};
    loader.loadSubScript('chrome://xmpp4moz/content/xmpp.js', env);
    XMPP = env.XMPP;

    // Makes utils.js available here    
    loader.loadSubScript('chrome://notifyme/content/lib/util_impl.js', util);
    
    channel = XMPP.createChannel(
				 <query xmlns="http://jabber.org/protocol/disco#info">
				 <feature var="http://jabber.org/protocol/muc"/>
				 <feature var="http://jabber.org/protocol/muc#user"/>
				 <feature var="http://jabber.org/protocol/xhtml-im"/>
				 <feature var="http://jabber.org/protocol/chatstates"/>
				 </query>);    
 
    channel.on({
	    event     : 'message',
	    direction : 'in',
		}, function(message) {
	    // Detects if msg body is not blank
	    if(message.stanza.body == undefined){
		//dump("message.stanza.body == undefined \n");
	    }
	    
	    /* Detects if sidebar is not Expanded OR
	       Firefox is minimized OR
	       Firefox is another desktop OR
	       Firefox is on current desktop but behind others windows (Firefox 3 only) */
	    else if((isCompact()) || win.windowState == win.STATE_MINIMIZED || !(win.document.hasFocus && win.document.hasFocus())){
		msgbody = new String(message.stanza.body);
		account = message.account;
		var address = XMPP.JID(message.stanza.@from).address;
		
		// Detects if users wants alert popups AND/OR sound.
		popup = eval(pref.getBoolPref('togglePopupKey'));
		roomspopup = eval(pref.getBoolPref('toggleRoomsKey'));
		sound = eval(pref.getBoolPref('toggleSoundKey'));

		// Detects if message comes from a room and obtain contact nick by resourse
		if(message.stanza.@type == "groupchat" && roomspopup){
		    var nick = XMPP.JID(message.stanza.@from).resource + " from " + XMPP.JID(message.stanza.@from).address;
		    avatar = util.getAvatar(account, address, XMPP);
		    
		    composeAndSend(nick, msgbody, avatar);
		}
		
		else if(message.stanza.@type == "chat" && popup){
		// Obtains contact nick as you aliased it in your contact list, i.e. Ivan for imorgillo@sameplace.cc
		    var nick = XMPP.nickFor(message.session.name, XMPP.JID(message.stanza.@from).address);
		    avatar = util.getAvatar(account, address, XMPP);
		    
		    composeAndSend(nick, msgbody, avatar);
		}
	    }
	    
	    else{
		//dump("Sidebar is exanded \n");
	    }
	    
        });
}


/* Detects if Sidebar is not expanded */
function isCompact(){

    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    // MEMO: Specifing navigator:browser Notify me won't work with Thunderbird
    win = wm.getMostRecentWindow("navigator:browser");
    if(win.sameplace.isCompact()) return true;
    else return false;
}

/*
// Jabiff legacy. It could be usefull in the future.

function observe(subject, topic, data) {
    if(data != 'JabBiff')
        return;
        
    switch(topic) {
    case 'alertfinished':
        this._busy = false;
        break;
    case 'alertclickcallback':
        break;
    }
}
*/


// Detects if somebody sent you a link, an image or a long message
function composeAndSend(nick, body, avatar){

    if(body.match("image:") != null || body.match("<img") != null ){
	util.showmsgpopup(avatar, nick, "has sent you an image", sound);
    }
    else if (body.match("http://") != null || body.match("<a href=") != null ){
	util.showmsgpopup(avatar, nick, "has sent you a link", sound);
    }
    else{
	/* Checks if msg body is longer than 50 chars and cuts it */
	if(body.length > 50) body = body.substring(0,41) + " ...";
	util.showmsgpopup(avatar, nick, body, sound);
    }
}