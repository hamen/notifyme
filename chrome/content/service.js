// GLOBAL DEFINITIONS
// ----------------------------------------------------------------------

/* Inizialize popup alert */
const alertService = Components
    .classes['@mozilla.org/alerts-service;1']
    .getService(Components.interfaces.nsIAlertsService);

/* Enable external scripts import */
const loader = Cc['@mozilla.org/moz/jssubscript-loader;1']
    .getService(Ci.mozIJSSubScriptLoader);

/* SHOULD ENABLE TO READ/WRITE FIREFOX PREFS */
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

// ----------------------------------------------------------------------

var count = 0;
var win;
var sound;
var popup;

var channel;
var XMPP;
var account;

var roster;
var avatar;
var myreply;

function init() {
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
	    // Detect if sidebar is not Expanded and msg body is not blank
	    if(message.stanza.body == undefined){
		// Fold
	    }

	    else if((isCompact()) || win.windowState == win.STATE_MINIMIZED){
		msgbody = new String(message.stanza.body);
		account = message.account;
		var address = XMPP.JID(message.stanza.@from).address;
		//dump(address + " before getAvatar \n");
		getAvatar(address);

		// Detect if users wants alert poput
		popup = eval(pref.getBoolPref('togglePopupKey'));
		
		// Detect if somebody D&Ded you an image or a link
		if(popup){
		    if(msgbody.match("image:") != null || msgbody.match("<img") != null ){
			//dump("got image\n");
			var nick =  XMPP.nickFor(message.session.name, XMPP.JID(message.stanza.@from).address);
			showmsgpopup(nick, "has sent you an image");
		    }
		    else if (msgbody.match("http://") != null || msgbody.match("<a href=") != null ){
			//dump("got url\n");
			var nick =  XMPP.nickFor(message.session.name, XMPP.JID(message.stanza.@from).address);
			showmsgpopup(nick, "probably has sent you a link");
		    }
		    else{
			// dump("got message\n");
			
			/* Check if msg body is longer than 40 chars and cut it */
			if(msgbody.length > 40){
			    
			    msgbody = msgbody.substring(0,41) + " ...";
			}
			else msgbody;
			
			var nick =  XMPP.nickFor(message.session.name, XMPP.JID(message.stanza.@from).address);

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
    
    //    alertService.showAlertNotification("chrome://notifyme/skin/logo96.png", contact, text, false, "", null);
    alertService.showAlertNotification(avatar, contact, text, false, "", null);
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
    //dump(address + " in getAvatar \n");
    
    XMPP.send(account,
              <iq to={address} type='get'><vCard xmlns='vcard-temp'/><cache-control xmlns={ns_x4m_in}/></iq>,
	      function(reply) {
		  // dump(reply.stanza.toXMLString());
		  myreply = reply;

		  var photo = reply.stanza..ns_vcard::PHOTO;
		  if(photo == undefined){
		      //dump("photo is undefined \n");
		      avatar = defaultAvatar;
		  }
		  else avatar = 'data:' + photo.ns_vcard::TYPE + ';base64,' + photo.ns_vcard::BINVAL;
	      });
}