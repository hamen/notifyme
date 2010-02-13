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

// GLOBALS
var channel;
var account;
var counter = 0;

var window;
var XMPP;


// Application detecting
// const appCheck = Components
//   .classes["@mozilla.org/preferences-service;1"]
//   .getService(Components.interfaces.nsIPrefService)
//   .getBranch('general.useragent.extra.');

var wm = Components
  .classes["@mozilla.org/appshell/window-mediator;1"]
  .getService(Components.interfaces.nsIWindowMediator);

// var children = appCheck.getChildList("", {});
// if (children == "thunderbird"){
//   window = wm.getMostRecentWindow("");
//  }
// if (children == "firefox"){
//   window = wm.getMostRecentWindow("navigator:browser");
//  }

// Mozilla Firefox Preferences managing interface
const prefManager = Components
    .classes["@mozilla.org/preferences-service;1"]
    .getService(Components.interfaces.nsIPrefService)
    .getBranch('extensions.notifyme.');

var rooms;
var akk;
var x4m;
var nick = "hamen";

// --------------------------------------------------------------
function init(XMPP) {
    

    channel = XMPP.createChannel();

    channel.on( { event: 'connector', state: 'disconnected'},
		function(transport){
		    //alert("event: \'connector\', state: \'disconnected\'");
		    var check = prefManager.getBoolPref('autorec');
		    if(check) receivedDisconnection(transport.account, XMPP);
		} );

    channel.on( { event: 'presence', direction: 'out'},
		function(presence){
		    //alert("event: \'presence\', direction: \'out\'");
		    newSM(presence);} );

    channel.on( { event: 'connector', state: 'active'},
		function(transport){
		    //alert("event: \'connector\', state: \'connected\'");

		    setSM(transport.account, XMPP);
		    
		    // Rooms auto-join
		    var check = prefManager.getBoolPref('autojoin');
		    if (check){
			joinRooms(transport.account, XMPP);
		    }
		} );
}


function finish() {
    channel.release();
}

function receivedDisconnection(account, XMPP) {
  window = wm.getMostRecentWindow("navigator:browser");
  if (window){
    window.focus();
      window.setTimeout(function() {
	  XMPP.up(account, function() {
	      setSM(account, XMPP);
	      
	      // Rooms auto-join
	      var check = prefManager.getBoolPref('autojoin');
	      if (check){
		joinRooms(account, XMPP);
	      }
	    });
	}, 3000)
      }
}

function newSM(presence){
    if(presence.stanza.status != undefined){
	storeSM(presence.stanza.toXMLString());
    }
}

function storeSM(msg){
    prefManager.setCharPref('statusmessage', msg);
    return;
}

function getSM(){
    try {
	if (prefManager.getCharPref('statusmessage') != ""){
	    var msg = prefManager.getCharPref('statusmessage');
	    return msg;
	}
    } catch (e) {
	storeSM(".");
    }
}

function setSM(acc, XMPP){

    if (counter != 3){
      window = wm.getMostRecentWindow("navigator:browser");
      if (window){
	window.focus();
	  window.setTimeout(function() {
	      var statusmessage = getSM();
	      XMPP.send(acc, statusmessage);
	    },7000);
	counter++;
      } else{
	window.setTimeout(function() {}, 1000000);
	counter = 0;
      }
      return;
    }
}

function joinRooms(acc, XMPP){
  window = wm.getMostRecentWindow("navigator:browser");
  if (window){
    window.focus();
    window.setTimeout(function() {
	//alert('autojoin: ');
	roomsarray = eval(prefManager.getCharPref('rooms2join'));
	    
	akk = acc;
	x4m = XMPP;

	roomsarray.forEach(join);
	    
      }, 5000);
  }
}

function join(element, index, array){
    // alert('account is: ' + akk + ' and room is: ' + element);
    x4m.send(akk, '<presence to="'+ element +'"><x xmlns="http://jabber.org/protocol/muc"/></presence>');
}

function printElt(element, index, array) {
    alert("[" + index + "] is " + element);
}
