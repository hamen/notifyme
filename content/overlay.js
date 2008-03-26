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
    var channel = XMPP.createChannel();

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

	    watchon(address, boxes, counts);
	}
	else {
	    // User clicked cancel. Typically, nothing is done here.
	}
    }
};

//var address;
// var counts = {offline:0, online:0, away:0, busy:0};

var alertsService = Components.classes["@mozilla.org/alerts-service;1"]
                              .getService(Components.interfaces.nsIAlertsService);


window.addEventListener("load", function(e) { Dialog.onLoad(e); }, false);


function detectedContact(presence, checkboxes, address, counts) {

    if(presence.stanza.@type == 'unavailable' && checkboxes.offline && counts.offline < 1){
	showPopup(address, 'offline');
	counts.offline = 1;
    }
    else if (presence.stanza.show == 'away' && checkboxes.away == true && counts.away < 1){
	showPopup(address, 'away');
	counts.away = 1;
    }
    else if (presence.stanza.show == 'dnd' && checkboxes.busy && counts.busy < 1){
	showPopup(address, 'busy');
	counts.busy = 1;

    }
    else if (presence.stanza.@type == undefined && presence.stanza.show != 'dnd' && presence.stanza.show != 'away' && checkboxes.online && counts.online < 1){
	showPopup(address, 'online');
	counts.online = 1;
    }
}

function showPopup(contact, status){

alertsService.showAlertNotification("chrome://notifyme/skin/logo96.png", 
                                    contact, "has changed status to " + status, 
                                    false, "", null);

}


function watchon(contact, boxes, counts){
// Start to sniff the channel
	    channel.on({
		    event : 'presence',
			direction : 'in',
			stanza : function(s) {
			return XMPP.JID(s.@from).address == contact;
		    }},
		function(presence) { detectedContact(presence, boxes, contact, counts); });

}
