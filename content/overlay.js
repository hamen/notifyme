var address;

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
	    alert('Got out params \n online checkbox is: ' + params.out.online + ' and offline is: ' +params.out.offline);
	}
	else {
	    // User clicked cancel. Typically, nothing is done here.
	}
    }
};

window.addEventListener("load", function(e) { Dialog.onLoad(e); }, false);