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

var sameplacepp = {
    onLoad: function init() {
	// initialization code
	this.initialized = true;
	sameplacepp.loader.loadSubScript('chrome://notifyme/content/lib/util_impl.js', sameplacepp.utils);
	sameplacepp.loader.loadSubScript('chrome://notifyme/content/autorec.js', sameplacepp.arec);
	sameplacepp.arec.autorec.init(XMPP);
    },

    utils: {},
    arec: {},

    loader: Components.classes['@mozilla.org/moz/jssubscript-loader;1']
	.getService(Components.interfaces.mozIJSSubScriptLoader),
    /*
    alertsService: Components.classes["@mozilla.org/alerts-service;1"]
     .getService(Components.interfaces.nsIAlertsService),
     */
    usersArray: new Array(),
    userIsAlreadyIn: {},
    
  notifyMe: function showDialog(xulPopupNode) {
	/* Initialize interfaces to manage prefs */
	const pref = Components
	.classes["@mozilla.org/preferences-service;1"]
	.getService(Components.interfaces.nsIPrefService)
	.getBranch('extensions.notifyme.');

	// Gets clicked contact JID address
	var xulContact = $(xulPopupNode, '^ .contact');
	var address = xulContact.getAttribute('address');
	var account = xulContact.getAttribute('account');
	//alert('account is: ' +account + ' and address is: ' +address);
	// Obtains contact nick as you aliased it in your contact list, i.e. Ivan for imorgillo@sameplace.cc
	var nick = XMPP.nickFor(account, address);
	//alert('nick is: ' + nick);

	sameplacepp.usersArray = eval(pref.getCharPref('usersArray'));
	
	var length = sameplacepp.usersArray.length;
	var i;
	for (i=0; i<length; i++){
	    var user = sameplacepp.usersArray[i];
	    
	    if(user.address == address){
		//alert('gia\' presente');
		var params = {
		    inn:{
			nick:user.nick,
			online:user.boxes.online,
			offline:user.boxes.offline,
			away:user.boxes.away,
			busy:user.boxes.busy
		    },
		    out:null
		};
		
		sameplacepp.userIsAlreadyIn = {status: true,
				   index: i};
	    }
	}
	
	
	if(!sameplacepp.userIsAlreadyIn.status){
	    var params = {
		inn:{
		    nick:nick,
		    online:false,
		    offline:false,
		    away:false,
		    busy:false
		},
		out:null
	    };	    
	}
	// Opens Dialog and passes clicked contact JID address to it 
	var checkboxes;

	window.openDialog("chrome://notifyme/content/watchOnUser.xul", "",
			  "chrome, dialog, modal, resizable=yes", params).focus();
	
	if (params.out) {
	    
	    var boxes = params.out;
	    var counts = {
		offline:0,
		online:0,
		away:0,
		busy:0
	    };

	    // Reset counts
	    counts.online = 0;
	    counts.offline = 0;
	    counts.away = 0;
	    counts.busy = 0;

	    if(sameplacepp.userIsAlreadyIn.status) sameplacepp.usersArray.splice(sameplacepp.userIsAlreadyIn.index,1);
	    
	    if(sameplacepp.userIsAlreadyIn.status && 
	       boxes.online == false && 
	       boxes.offline == false && 
	       boxes.away == false && 
	       boxes.busy == false ){
		   var u = new sameplacepp.User(address, nick, boxes, counts);
		   sameplacepp.usersArray.push(u);
		   sameplacepp.usersArray.pop();
		   sameplacepp.userIsAlreadyIn.status = false;

		pref.setCharPref('usersArray', sameplacepp.usersArray.toSource());
	    }
	    else {
		var u = new sameplacepp.User(address, nick, boxes, counts);
		sameplacepp.usersArray.push(u);

		// Save array in prefs
		pref.setCharPref('usersArray', sameplacepp.usersArray.toSource());
		sameplacepp.watchonUser(u);
	    } 

	    //
	    /* then
	    var array = new Array();
	    array = eval(pref.getCharPref('sameplacepp.usersArray'));
	    */

	    
	}
	else {
	    // User clicked cancel. Typically, nothing is done here.
	}
  },
    watchonUser: function(user) {
	// Start to sniff the channel
	var channel = XMPP.createChannel();
	
	channel.on({
		       event     : 'presence',
		       direction : 'in',
		       stanza : function(s) {
			   return XMPP.JID(s.@from).address == user.address;
		       }},
		   function(presence) { 
		       /*
			var nick =  XMPP.nickFor(presence.session.name,
			XMPP.JID(presence.stanza.@from).address);
			*/
		       sameplacepp.detectedContact(presence, user);
		   });
    },
    detectedContact: function(presence, user) {
	var text;
	var account = presence.account;
	var avatar = sameplacepp.utils.getAvatar(account, XMPP.JID(presence.stanza.@from).address, XMPP);
	
	if(presence.stanza.@type == 'unavailable' && user.boxes.offline && user.counts.offline < 1){
	    sameplacepp.utils.showmsgpopup(avatar, user.nick, "has changed status to UNAVAILABLE", false);	
	    user.counts.offline = 1;
	    window.getAttention();
	}
	else if (presence.stanza.show == 'away' && user.boxes.away == true && user.counts.away < 1){
	    sameplacepp.utils.showmsgpopup(avatar, user.nick, "has changed status to AWAY", false);	
	    user.counts.away = 1;
	    window.getAttention();
	}
	else if (presence.stanza.show == 'dnd' && user.boxes.busy && user.counts.busy < 1){
	    sameplacepp.utils.showmsgpopup(avatar, user.nick, "has changed status to BUSY", false);	
	    user.counts.busy = 1;
	    window.getAttention();
	}
	else if (presence.stanza.@type == undefined &&
		 presence.stanza.show != 'dnd' &&
		 presence.stanza.show != 'away' &&
		 user.boxes.online && user.counts.online < 1){
	    sameplacepp.utils.showmsgpopup(avatar, user.nick, "has changed status to AVAILABLE", false);	
	    user.counts.online = 1;
	    window.getAttention();
	}
	
    }
};

// ------------------------------------------------------------------------

window.addEventListener("load", function(e) {
	
	try {
	    Components
		.classes['@hamen.org/notifyme/service;1']
		.getService(Components.interfaces.nsIXMPPPresenceNotificationService);

	} catch(exp) {
	    Components.utils.reportError(exp); // report the error and continue execution
	}
	
	sameplacepp.onLoad(e);
	
    }, false);

sameplacepp.User = function( a, n, b, c){
    this.address = a;
    this.nick = n;
    this.boxes = b;
    this.counts = c;
};

sameplacepp.getElementsByClass = function(searchClass,node,tag) {
	var classElements = new Array();
	if ( node == null )
		node = document;
	if ( tag == null )
		tag = '*';
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	var pattern = new RegExp('(^|\\\\s)'+searchClass+'(\\\\s|$)');
	for (i = 0, j = 0; i < elsLen; i++) {
		if ( pattern.test(els[i].className) ) {
			classElements[j] = els[i];
			j++;
		}
	}
	return classElements;
};
