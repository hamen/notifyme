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

var Dialog = {
  onLoad: function init() {
    // initialization code
    this.initialized = true;
    
    var env = {};
    //    loader.loadSubScript('chrome://xmpp4moz/content/xmpp.js', env);
    // var XMPP = env.XMPP;
    
    },

  notifyMe: function showDialog(xulPopupNode) {
	// Get clicked contact JID address
	var xulContact = $(xulPopupNode, '^ .contact');
	var address = xulContact.getAttribute('address');
	//alert('address is: ' + address);


	// Open Dialog and pass it clicked contact JID address 
	var params = {inn:{address:address, online:false, offline:false, away:false, busy:false}, out:null};
	var checkboxes;

	window.openDialog("chrome://notifyme/content/dialog.xul", "",
			  "chrome, dialog, modal, resizable=yes", params).focus();
	if (params.out) {
	    // User clicked ok. Process changed arguments;
	    /*alert('Got out params \n online checkbox is: ' + params.out.online
		  + '\n offline is: ' +params.out.offline
		  + '\n away is: ' + params.out.away
		  + '\n busy is: ' + params.out.busy);
	    */

	    var boxes = params.out;
	    var counts = {offline:0, online:0, away:0, busy:0};
	    
	    // Reset counts
	    counts.online = 0;
	    counts.offline = 0;
	    counts.away = 0;
	    counts.busy = 0;

	    // watchonMsgs();
	    watchonUser(address, boxes, counts);
	}
	else {
	    // User clicked cancel. Typically, nothing is done here.
	}
    }
};

var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
                              .getService(Components.interfaces.nsIAlertsService);


window.addEventListener("load", function(e) {
	
	try {
	    Components.classes['@hamen.org/notifyme/service;1'].getService(Components.interfaces.nsIXMPPPresenceNotificationService);
	} catch(exp) {
	    Components.utils.reportError(exp); // report the error and continue execution
	}
	
	Dialog.onLoad(e);
	
    }, false);


function detectedContact(presence, checkboxes, address, counts) {
    
    
    if(presence.stanza.@type == 'unavailable' && checkboxes.offline && counts.offline < 1){
	showStatusPopup(address, 'offline');
	counts.offline = 1;
	window.getAttention();
    }
    else if (presence.stanza.show == 'away' && checkboxes.away == true && counts.away < 1){
	showStatusPopup(address, 'away');
	counts.away = 1;
	window.getAttention();
    }
    else if (presence.stanza.show == 'dnd' && checkboxes.busy && counts.busy < 1){
	showStatusPopup(address, 'busy');
	counts.busy = 1;
	window.getAttention();
    }
    else if (presence.stanza.@type == undefined && presence.stanza.show != 'dnd' && presence.stanza.show != 'away' && checkboxes.online && counts.online < 1){
	showStatusPopup(address, 'online');
	counts.online = 1;
	window.getAttention();
    }
}

// AlertNotification has user alias as title
function showStatusPopup(contact, status){

    //    alert(document.hasFocus());

    alertsService.showAlertNotification("chrome://notifyme/skin/logo96.png", 
					contact, "has changed status to " + status, 
					false, "", null);
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