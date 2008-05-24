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

  Ivan Morgillo < imorgillo [at] sanniolug [dot] org >

*/

var Dialog = {
  onLoad: function init() {
    // initialization code
    this.initialized = true;
	
    },

  notifyMe: function showDialog(xulPopupNode) {
	// Gets clicked contact JID address
	var xulContact = $(xulPopupNode, '^ .contact');
	var address = xulContact.getAttribute('address');
	
	// Opens Dialog and passes clicked contact JID address to it 
	var params = {inn:{address:address, online:false, offline:false, away:false, busy:false}, out:null};
	var checkboxes;

	window.openDialog("chrome://notifyme/content/dialog.xul", "",
			  "chrome, dialog, modal, resizable=yes", params).focus();
	if (params.out) {
	    
	    var boxes = params.out;
	    var counts = {offline:0, online:0, away:0, busy:0};
	    
	    // Reset counts
	    counts.online = 0;
	    counts.offline = 0;
	    counts.away = 0;
	    counts.busy = 0;

	    watchonUser(address, boxes, counts);
	}
	else {
	    // User clicked cancel. Typically, nothing is done here.
	}
    }
};

// GLOBALS
var Cc = Components.classes;
var Ci = Components.interfaces;

const loader = Cc['@mozilla.org/moz/jssubscript-loader;1']
    .getService(Ci.mozIJSSubScriptLoader);

const alertsService = Components.classes["@mozilla.org/alerts-service;1"]
                              .getService(Components.interfaces.nsIAlertsService);
// EXTERNAL SCRIPTS
var utils = {};
loader.loadSubScript('chrome://notifyme/content/lib/util_impl.js', utils);

var autorec = {};
    loader.loadSubScript('chrome://notifyme/content/autorec.js', autorec);
    autorec.init();
// ------------------------------------------------------------------------

window.addEventListener("load", function(e) {
	
	try {
	    Components
		.classes['@hamen.org/notifyme/service;1']
		.getService(Components.interfaces.nsIXMPPPresenceNotificationService);

	} catch(exp) {
	    Components.utils.reportError(exp); // report the error and continue execution
	}
	
	Dialog.onLoad(e);
	
    }, false);


function detectedContact(presence, checkboxes, address, counts) {
    var text;
    var account = presence.account;
    var avatar = utils.getAvatar(account, XMPP.JID(presence.stanza.@from).address, XMPP);
    
    if(presence.stanza.@type == 'unavailable' && checkboxes.offline && counts.offline < 1){
	utils.showmsgpopup(avatar, address, "has changed status to UNAVAILABLE", false);	
	counts.offline = 1;
    }
    else if (presence.stanza.show == 'away' && checkboxes.away == true && counts.away < 1){
	utils.showmsgpopup(avatar, address, "has changed status to AWAY", false);	
	counts.away = 1;
    }
    else if (presence.stanza.show == 'dnd' && checkboxes.busy && counts.busy < 1){
	utils.showmsgpopup(avatar, address, "has changed status to BUSY", false);	
	counts.busy = 1;
    }
    else if (presence.stanza.@type == undefined &&
	     presence.stanza.show != 'dnd' &&
	     presence.stanza.show != 'away' &&
	     checkboxes.online && counts.online < 1){
	utils.showmsgpopup(avatar, address, "has changed status to AVAILABLE", false);	
	counts.online = 1;
    }
    window.getAttention();
}

function watchonUser(contact, boxes, counts){
// Start to sniff the channel
    var channel = XMPP.createChannel();

    channel.on({
	    event     : 'presence',
	    direction : 'in',
		stanza : function(s) {
		return XMPP.JID(s.@from).address == contact;
	    }},
	function(presence) { 
	    var nick =  XMPP.nickFor(presence.session.name, XMPP.JID(presence.stanza.@from).address);
	    detectedContact(presence, boxes, nick, counts); });
}