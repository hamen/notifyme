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
    
    loader: Components.classes['@mozilla.org/moz/jssubscript-loader;1']
     	.getService(Components.interfaces.mozIJSSubScriptLoader),
    utils: {},

    wm: Components
	.classes["@mozilla.org/appshell/window-mediator;1"]
	.getService(Components.interfaces.nsIWindowMediator),
    prefManager: Components
	.classes["@mozilla.org/preferences-service;1"]
	.getService(Components.interfaces.nsIPrefService)
	.getBranch('extensions.notifyme.'),

    init: function(XMPP) {
	autorec.loader.loadSubScript('chrome://notifyme/content/lib/util_impl.js', autorec.utils);
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
	autorec.storeSM("_");
    }
    return "_";
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
				      autorec.roomsarray = autorec.utils.getJSON().parse(autorec.prefManager.getCharPref('rooms2join'));
				     
				      for (var i = 0; i < autorec.roomsarray.length; i++){
					  // dump("acc: " + acc + "\n" + 
					  //      "autorec.roomsarray[i].userAccount: " +
					  //      autorec.roomsarray[i].userAccount + "\n" +
					  //      "acc.indexOf(autorec.roomsarray[i].userAccount): " + 
					  //      acc.indexOf(autorec.roomsarray[i].userAccount));
					  if (acc.indexOf(autorec.roomsarray[i].userAccount) == 0){
					      XMPP.send(acc, '<presence to="'+ 
							autorec.roomsarray[i].room + autorec.roomsarray[i].userNick +
							'"><x xmlns="http://jabber.org/protocol/muc"/></presence>');
					      }
				      }
				  }, 5000);
    }
};

autorec.printElt = function(element, index, array) {
    alert("[" + index + "] is " + element);
};
