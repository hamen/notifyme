// GLOBAL DEFINITIONS
// ----------------------------------------------------------------------

const alertService = Components
    .classes['@mozilla.org/alerts-service;1']
    .getService(Components.interfaces.nsIAlertsService);
const loader = Cc['@mozilla.org/moz/jssubscript-loader;1']
    .getService(Ci.mozIJSSubScriptLoader);
const prefBranch = Components
    .classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService)
    .getBranch('extensions.notifyme.');

const ns_muc      = new Namespace('http://jabber.org/protocol/muc');
const ns_muc_user = new Namespace('http://jabber.org/protocol/muc#user');
const ns_composing = new Namespace('http://jabber.org/protocol/chatstates');

// ----------------------------------------------------------------------
var count = 0;
var win;

function init() {
    var env = {};
    loader.loadSubScript('chrome://xmpp4moz/content/xmpp.js', env);
    var XMPP = env.XMPP;

    XMPP.createChannel().on({
	    event     : 'message',
	    direction : 'in',
		}, function(message) {
	    if(isCompact() && message.stanza.ns_composing::composing == undefined){
		var nick =  XMPP.nickFor(message.session.name, XMPP.JID(message.stanza.@from).address);
		showmsgpopup(nick, message.stanza.body);
	    }
	    else count = 0;
        });
}

function showmsgpopup(contact, text){
    if (count < 1){
	alertService.showAlertNotification("chrome://notifyme/skin/logo96.png", contact, text, false, "", null);
	count++;
    }
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