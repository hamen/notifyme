var Dialog = {
  onLoad: function() {
    // initialization code
    this.initialized = true;
    var channel = XMPP.createChannel();
  },

  onMenuItemCommand: function() {
    window.open("chrome://notifyme/content/dialog.xul", "", "chrome");
  }
};

window.addEventListener("load", function(e) { Dialog.onLoad(e); }, false);