var Dialog = {
  onLoad: function init() {
    // initialization code
    this.initialized = true;
    var channel = XMPP.createChannel();

  },

  notifyMe: function showDialog(xulPopupNode) {
	// Get clicked contact JID address
	var xulContact = $(xulPopupNode, '^ .contact');
	address = xulContact.getAttribute('address');
	//alert('address is: ' + address);


	// Open Dialog and pass it clicked contact JID address 
	var params = {inn:{address:address, online:true}, out:null};       
	window.openDialog("chrome://notifyme/content/dialog.xul", "",
			  "chrome, dialog, modal, resizable=yes", params).focus();
	if (params.out) {
	    // User clicked ok. Process changed arguments; e.g. write them to disk or whatever
	    alert('Got out params \n online checkbox is: ' + params.out.online + '\n offline is: ' +params.out.offline);
	    
	    // Start to sniff the channel
	    channel.on({
		    event : 'presence',
			direction : 'in',
			stanza : function(s) {
			return XMPP.JID(s.@from).address == address;
		    }},
		function(presence) { detectedContact(presence, params); });
	}
	else {
	    // User clicked cancel. Typically, nothing is done here.
	}
    }
};

var address;

window.addEventListener("load", function(e) { Dialog.onLoad(e); }, false);

function detectedContact(presence, params) {
    if(presence.stanza.@type == 'unavailable' && params.out.offline)
	alert(address + ' has gone offline!');
    else if (presence.stanza.show == 'away')
	alert(address + ' changed status to AWAY');
    else if (presence.stanza.show == 'dnd')
	alert(address + ' changed status to BUSY');
    else if (params.out.online)
	alert(address + ' has come online!');
}
