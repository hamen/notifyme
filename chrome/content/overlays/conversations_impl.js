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

var sendTo = load('chrome://sameplace/content/send_to.js', {});
var win = getSameplace();

function init() {
}

function finish() {
}

function getSameplace() {
  var wm = Components
    .classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator);
  // MEMO: Specifing navigator:browser Notify me won't work with Thunderbird
  return wm.getMostRecentWindow("navigator:browser");
}

function showAlert() {

}

function selectedContact(event) {
    var account = event.target.getAttribute('account');
    var address = event.target.getAttribute('address');
    var type = XMPP.isMUC(account, address) ? 'groupchat' : 'normal';
   
    var xulPanel = getCurrent();
    var adrs2invite2 = xulPanel.getAttribute('address');
    var adrs2invite2Type = XMPP.isMUC(account, adrs2invite2) ? 'groupchat' : 'normal';
    
    var url, text;
    text = "Join us!";
    url = "xmpp:" + adrs2invite2 + "?join";
    
    if (adrs2invite2Type === 'groupchat') {
      XMPP.send(account,
		<message to={address} type={type}>
		<body>{url}</body>
		<html xmlns="http://jabber.org/protocol/xhtml-im">
		<body xmlns="http://www.w3.org/1999/xhtml">
		<a href={url}>{text || url}</a>
		</body>
		</html>
		<x xmlns="jabber:x:oob">
		<url>{url}</url>
		</x>
		</message>);
    }
    else {
      alert("You can only invite users to rooms");
    }
}