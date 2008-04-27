// GLOBAL DEFINITIONS
// ----------------------------------------------------------------------

/* Inizialize popup alert */
const alertService = Components
    .classes['@mozilla.org/alerts-service;1']
    .getService(Components.interfaces.nsIAlertsService);

/* Enable external scripts import */
const loader = Cc['@mozilla.org/moz/jssubscript-loader;1']
    .getService(Ci.mozIJSSubScriptLoader);

/* Initialize interfaces to manage prefs */
const pref = Components
    .classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService)
    .getBranch('extensions.notifyme.');

/* Initialize interfaces to play a sound alert*/
var player = Components.classes["@mozilla.org/sound;1"].createInstance(Components.interfaces.nsISound) ;
var ioservice = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService) ;
var music = ioservice.newURI ("chrome://notifyme/content/alert.wav" , "" , null ) ; 

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

var channel;
var XMPP;
var account;

var roster;
var avatar = defaultAvatar;

// ----------------------------------------------------------------------


function init() {
    /* Check if an old version left prefs type as String and fix it to Boolean*/
    if (pref.getPrefType('togglePopupKey') != "128" || pref.getPrefType('toggleSoundKey') != "128" ){
	//dump("PREF_BOOL");
	pref.deleteBranch("");
    }

    /* Make xmpp4moz available here */
    var env = {};
    loader.loadSubScript('chrome://xmpp4moz/content/xmpp.js', env);
    XMPP = env.XMPP;

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
		// Fold
	    }
	    
	    // Detects if sidebar is not Expanded OR Firefox is minimized OR Firefox is another desktop
	    else if((isCompact()) || win.windowState == win.STATE_MINIMIZED){
		msgbody = new String(message.stanza.body);
		account = message.account;
		var address = XMPP.JID(message.stanza.@from).address;

		// Detects if message comes from a room and obtain contact nick by resourse
		if(message.stanza.@type == "groupchat"){
		    var nick = XMPP.JID(message.stanza.@from).resource + " from " + XMPP.JID(message.stanza.@from).address;
		}
		else{
		// Obtain contact nick as you aliased it in your contact list, i.e. Ivan for imorgillo@sameplace.cc
		    var nick = XMPP.nickFor(message.session.name, XMPP.JID(message.stanza.@from).address);
		}
				
		getAvatar(address);

		// Detects if users wants alert poput
		popup = eval(pref.getBoolPref('togglePopupKey'));
		
		// Detects if somebody D&Ded you an image or a link
		if(popup){
		    if(msgbody.match("image:") != null || msgbody.match("<img") != null ){
			showmsgpopup(nick, "has sent you an image");
		    }
		    else if (msgbody.match("http://") != null || msgbody.match("<a href=") != null ){
			showmsgpopup(nick, "probably has sent you a link");
		    }
		    else{
			/* Checks if msg body is longer than 40 chars and cuts it */
			if(msgbody.length > 40) msgbody = msgbody.substring(0,41) + " ...";
			showmsgpopup(nick, msgbody, avatar);
		    }
		}
	    }
	    
	    else{
		// Fold
	    }
	    
        });
}

/* Show an alert popup and play a sound alert */
function showmsgpopup(contact, text){
    
    alertService.showAlertNotification(avatar, contact, text, false, "", null);
    
    // Force avatar to default avatar due a lag in avatar update
    avatar = defaultAvatar;

    // Check prefs to play / not to play a sound alert
    sound = eval(pref.getBoolPref('toggleSoundKey'));
    if (sound) player.play(music);
}


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

function getAvatar(address){
    // address is something like hamen_testing2@sameplace.cc

    XMPP.send(account,
              <iq to={address} type='get'><vCard xmlns='vcard-temp'/><cache-control xmlns={ns_x4m_in}/></iq>,
	      function(reply) {

		  var photo = reply.stanza..ns_vcard::PHOTO;
		  if(photo == undefined){
		      avatar = defaultAvatar;
		  }
		  else avatar = 'data:' + photo.ns_vcard::TYPE + ';base64,' + photo.ns_vcard::BINVAL;
	      });
}