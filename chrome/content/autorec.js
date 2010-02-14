/*
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, version 3 of the License.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA

Author: Ivan Morgillo, <imorgillo [at] sanniolug [dot] org>
*/

var autorec = {
    channel: {},
    account: {},
    counter: 0,
    window: {},
    XMPP: {},
    x4m: {},
    akk: {},

    wm: Components
	.classes["@mozilla.org/appshell/window-mediator;1"]
	.getService(Components.interfaces.nsIWindowMediator),
    prefManager: Components
	.classes["@mozilla.org/preferences-service;1"]
	.getService(Components.interfaces.nsIPrefService)
	.getBranch('extensions.notifyme.'),

    init: function(XMPP) {
	autorec.XMPP = XMPP;

	autorec.channel = XMPP.createChannel();

	autorec.channel.on( { event: 'connector', state: 'disconnected'},
		    function(transport){
			//alert("event: \'connector\', state: \'disconnected\'");
			var check = autorec.prefManager.getBoolPref('autorec');
			if(check) autorec.receivedDisconnection(transport.account, XMPP);
		    } );

	autorec.channel.on( { event: 'presence', direction: 'out'},
		    function(presence){
			//alert("event: \'presence\', direction: \'out\'");
			autorec.newSM(presence);} );

	autorec.channel.on( { event: 'connector', state: 'active'},
		    function(transport){
			//alert("event: \'connector\', state: \'connected\'");

			autorec.setSM(transport.account, autorec.XMPP);
			
			// Rooms auto-join
			var check = autorec.prefManager.getBoolPref('autojoin');
			if (check){
			    autorec.joinRooms(transport.account, autorec.XMPP);
			}
		    } );
    }
};

// Application detecting
// const appCheck = Components
//   .classes["@mozilla.org/preferences-service;1"]
//   .getService(Components.interfaces.nsIPrefService)
//   .getBranch('general.useragent.extra.');

// var children = appCheck.getChildList("", {});
// if (children == "thunderbird"){
//   window = wm.getMostRecentWindow("");
//  }
// if (children == "firefox"){
//   window = wm.getMostRecentWindow("navigator:browser");
//  }

// --------------------------------------------------------------

autorec.finish = function() {
    this.channel.release();
};

autorec.receivedDisconnection = function(account, XMPP) {
    autorec.window = autorec.wm.getMostRecentWindow("navigator:browser");
    if (autorec.window){
	autorec.window.focus();
	autorec.window.setTimeout(function() {
			      autorec.XMPP.up(account, function() {
					  autorec.setSM(account, autorec.XMPP);
					  
					  // Rooms auto-join
					  var check = autorec.prefManager.getBoolPref('autojoin');
					  if (check){
					      autorec.joinRooms(account, account.XMPP);
					  }
				      });
			  }, 3000);
    }
};

autorec.newSM = function(presence) {
    if(presence.stanza.status != undefined){
	autorec.storeSM(presence.stanza.toXMLString());
    }
};

autorec.storeSM = function(msg) {
    autorec.prefManager.setCharPref('statusmessage', msg);
    return;
};

autorec.getSM = function() {
    try {
	if (autorec.prefManager.getCharPref('statusmessage') != ""){
	    var msg = autorec.prefManager.getCharPref('statusmessage');
	    return msg;
	}
    } catch (e) {
	autorec.storeSM(".");
    }
    return ".";
};

autorec.setSM = function(acc, XMPP) {

    if (autorec.counter != 3){
      autorec.window = autorec.wm.getMostRecentWindow("navigator:browser");
      if (autorec.window){
	  autorec.window.focus();
	  autorec.window.setTimeout(function() {
	      var statusmessage = autorec.getSM();
	      this.XMPP.send(acc, statusmessage);
	    },7000);
	autorec.counter++;
      } else{
	autorec.window.setTimeout(function() {}, 1000000);
	autorec.counter = 0;
      }
      return;
    }
};

autorec.joinRooms = function(acc, XMPP) {
    autorec.window = autorec.wm.getMostRecentWindow("navigator:browser");
    if (autorec.window){
	autorec.window.focus();
	autorec.window.setTimeout(function() {
				      //alert('autojoin: ');
				      autorec.roomsarray = eval(autorec.prefManager.getCharPref('rooms2join'));
				      
				      autorec.akk = acc;
				      autorec.x4m = XMPP;

				      roomsarray.forEach(autorec.join);
				      
				  }, 5000);
    }
};

autorec.join = function(element, index, array) {
    // alert('account is: ' + akk + ' and room is: ' + element);
    autorec.x4m.send(autorec.akk, '<presence to="'+ element +'"><x xmlns="http://jabber.org/protocol/muc"/></presence>');
};

autorec.printElt = function(element, index, array) {
    alert("[" + index + "] is " + element);
};
