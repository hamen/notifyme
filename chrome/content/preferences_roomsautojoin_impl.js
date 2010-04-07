/*
  This file is part of 'Notify me'.

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

  Author: Ivan Morgillo < imorgillo [at] sanniolug [dot] org >
*/

var spPpPref = {
    pref : Components.classes['@mozilla.org/preferences-service;1']
    .getService(Components.interfaces.nsIPrefService)
    .getBranch('extensions.notifyme.'),
    
    loader: Components.classes['@mozilla.org/moz/jssubscript-loader;1']
     	.getService(Components.interfaces.mozIJSSubScriptLoader),

    utils: {},
    roomsarray: new Array(),
    pref_roomsarray: [],
    initList: "",
    account: {}
};

// INITIALIZATION
// ----------------------------------------------------------------------
spPpPref.init = function () {
    XMPP.accounts.forEach(function (account) {
			      _('account').appendItem(account.jid);			      
			  });

    window.sizeToContent();
    spPpPref.loader.loadSubScript('chrome://notifyme/content/lib/util_impl.js', spPpPref.utils);
    
    try {
	this.roomsarray = spPpPref.utils.getJSON().parse(spPpPref.pref.getCharPref('rooms2join'));	
    } catch (e) {
	spPpPref.pref.setCharPref('rooms2join', "[]");
    }

    this.initList = document.getElementById('thelist');   
    //    roomsarray.forEach(printElt);
    this.roomsarray.forEach(spPpPref.appendToList);
};

spPpPref.addItem = function (){
    // Gets rooms list and current room user wants to add
    var list = document.getElementById('thelist');
    
    var roomid = document.getElementById('roomid').value;
    var nick = document.getElementById('nickid').value;
    var account = _('account').selectedIndex;
    account = XMPP.accounts[account];
    
    if (nick != "" && roomid != ""){
	var room2save = {
	    room: roomid,
	    userNick: nick,
	    userAccount: account.jid
	};
    } else {
	alert("room: " + room + "userNick: " + userNick + "userAccount: " + userAccount);
	return false;
    }

    list.appendItem(room2save.room + room2save.userNick + " with " + room2save.userAccount, room2save);
   
    var roomsSavedList = spPpPref.roomsarray;

    roomsSavedList.push(room2save);
    
    var rooms2saveJSON = spPpPref.utils.getJSON().stringify(roomsSavedList);
    spPpPref.pref.setCharPref('rooms2join', rooms2saveJSON);
};

spPpPref.removeSelectedRoom = function (){
    
    var list = document.getElementById('thelist');
    var count = list.selectedCount;
    while (count--){
	var item = list.selectedItems[0];
	list.removeItemAt(list.getIndexOfItem(item));
	spPpPref.roomsarray.splice(list.getIndexOfItem(item), 1);
    }
    
    spPpPref.pref_roomsarray = spPpPref.roomsarray.toSource();
    spPpPref.pref.setCharPref('rooms2join', spPpPref.pref_roomsarray);
    //alert(pref_roomsarray);
};

spPpPref.receivedRET = function (event) {
    if (event.keyCode == KeyEvent.DOM_VK_RETURN) {
        spPpPref.addItem();
	return false;
    }
    return true;
};

spPpPref.printElt = function (element, index, array) {
    alert("[" + index + "] is " + element.toSource());
};

spPpPref.appendToList = function(element, index, array) {
    spPpPref.initList.appendItem(element.room + element.userNick + " with " + element.userAccount, element);
};

spPpPref.getRooms = function (){
    spPpPref.roomsarray = spPpPref.utils.getJSON().parse(spPpPref.pref.getCharPref('rooms2join'));
    return spPpPref.roomsarray;
};

function _(id) {
    return document.getElementById(id);
}