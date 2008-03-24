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
	var params = {inn:{address:address, online:false, offline:false, away:false, busy:false}, out:null};
	var checkboxes;

	window.openDialog("chrome://notifyme/content/dialog.xul", "",
			  "chrome, dialog, modal, resizable=yes", params).focus();
	if (params.out) {
	    // User clicked ok. Process changed arguments; e.g. write them to disk or whatever
	    /*alert('Got out params \n online checkbox is: ' + params.out.online
		  + '\n offline is: ' +params.out.offline
		  + '\n away is: ' + params.out.away
		  + '\n busy is: ' + params.out.busy);
	    */
	    boxes = params.out;
	    
	    // Reset counts
	    counts.online = 0;
	    counts.offline = 0;
	    counts.away = 0;
	    counts.busy = 0;

	    // Start to sniff the channel
	    channel.on({
		    event : 'presence',
			direction : 'in',
			stanza : function(s) {
			return XMPP.JID(s.@from).address == address;
		    }},
		function(presence) { detectedContact(presence, boxes); });
	}
	else {
	    // User clicked cancel. Typically, nothing is done here.
	}
    }
};

var address;
var counts = {offline:0, online:0, away:0, busy:0};

window.addEventListener("load", function(e) { Dialog.onLoad(e); }, false);


function detectedContact(presence, checkboxes) {
    /*
    alert('Got out params \n online checkbox is: ' + checkboxes.online
	  + '\n offline is: ' + checkboxes.offline
	  + '\n away is: ' + checkboxes.away
	  + '\n busy is: ' + checkboxes.busy);
    */

    if(presence.stanza.@type == 'unavailable' && checkboxes.offline && counts.offline < 1){
	alert(address + ' has gone offline!');
	counts.offline = 1;
    }
    else if (presence.stanza.show == 'away' && checkboxes.away == true && counts.away < 1){
	    alert(address + ' changed status to AWAY');
	    counts.away = 1;
    }
    else if (presence.stanza.show == 'dnd' && checkboxes.busy && counts.busy < 1){
	alert(address + ' changed status to BUSY' );
	counts.busy = 1;

    }
    else if (presence.stanza.@type == undefined && presence.stanza.show != 'dnd' && presence.stanza.show != 'away' && checkboxes.online && counts.online < 1){
	alert(address + ' has come online!');
	counts.online = 1;
    }
}