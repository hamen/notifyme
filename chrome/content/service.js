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

// ----------------------------------------------------------------------
var count = 0;
var win;
var sound;
function init() {
    /* Make xmpp4moz available here */
    var env = {};
    loader.loadSubScript('chrome://xmpp4moz/content/xmpp.js', env);
    var XMPP = env.XMPP;
    

    XMPP.createChannel().on({
	    event     : 'message',
	    direction : 'in',
		}, function(message) {
	    // Detect if sidebar is not Expanded and msg body is not blank
	    if(isCompact() && message.stanza.body != undefined){
		// Detect if somebody D&Ded you an image
		msgbody = new String(message.stanza.body);
		
		if(msgbody.match("image:") != null || msgbody.match("<img") != null ){
		    dump("got image\n");
		    var nick =  XMPP.nickFor(message.session.name, XMPP.JID(message.stanza.@from).address);
		    showmsgpopup(nick, "has sent you an image");
		}
		else if (msgbody.match("http://") != null || msgbody.match("<a href=") != null ){
		    dump("got url\n");
		    var nick =  XMPP.nickFor(message.session.name, XMPP.JID(message.stanza.@from).address);
		    showmsgpopup(nick, "probably has sent you a link");
		}
		else{
		    dump("got message\n");
		    
		    /* Check if msg body is longer than 20 chars and cut it */
		    if(msgbody.length > 40){

			msgbody = msgbody.substring(0,41) + " ...";
		    }
		    else msgbody;
		    
		    var nick =  XMPP.nickFor(message.session.name, XMPP.JID(message.stanza.@from).address);
		    showmsgpopup(nick, msgbody);
		    //setTimeout(getFocus, 2);
		}
	    }
	    else count = 0;
        });
}

/* Show an alert popup and play a sound alert */
function showmsgpopup(contact, text){
    dump('count is: ' + count);

    //    if (count < 1){
	alertService.showAlertNotification("chrome://notifyme/skin/logo96.png", contact, text, false, "", null);
	//count++;

	// Check prefs to play / not to play a sound alert
	sound = eval(pref.getCharPref('toggleSoundKey'));
	if (sound) player.play(music);

	//}
}

function isCompact(){

    var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
    
    // MEMO: Specifing navigator:browser Notify me won't work with Thunderbird
    win = wm.getMostRecentWindow("navigator:browser");
    if(win.sameplace.isCompact()) return true;
    else return false;
}

/*
function show(title, availability, message) {
    availability = availability || 'unavailable';

    if(!this._busy) {
        this._busy = true;
        alertService.showAlertNotification(
            'chrome://xmpp4moz/skin/status/' + availability + '.png',
            title, message, false, 'JabBiff', this);
    }
}
*/

function getFocus(){
    win.focus();
}

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

/*

Usare display_filters per le emoticon nell'alert

bard:
hanno la funzionalita` di base ma a te servira` produrre un oggetto xul <image> piuttosto che uno e4x <img>
guarda se puoi prendere la translation testo->xml da li`, e la parte che genera lo xul dalla contact list (che lo fa per le url)

*/