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

/// GLOBAL DEFINITIONS
// ----------------------------------------------------------------------

var Cc = Components.classes;
var Ci = Components.interfaces;
var Cr = Components.results;

const pref = Cc['@mozilla.org/preferences-service;1']
    .getService(Ci.nsIPrefService)
    .getBranch('extensions.notifyme.');
var roomsautojoin;
var symbol;

// INITIALIZATION
// ----------------------------------------------------------------------
function init() {
    window.sizeToContent();
    // Install load and unload handlers

    window.addEventListener("load", function(e) { RoomsAutojoin.startup(); }, false);
    window.addEventListener("unload", function(e) { RoomsAutojoin.shutdown(); }, false);
}

var RoomsAutojoin = {
	prefs: null,
	tickerSymbol: "",
	
	// Initialize the extension
	
	startup: function()
	{
	    // Register to receive notifications of preference changes
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
	    .getService(Components.interfaces.nsIPrefService)
	    .getBranch("extensions.notifyme.");
	  
	    this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
	    this.prefs.addObserver("", this, false);
	    
	    this.tickerSymbol = this.prefs.getBoolPref("roomsautojoin");
	    	    
	    this.refreshInformation();		
	    window.setInterval(this.refreshInformation, 10*60*1000);
	},
	
	// Clean up after ourselves and save the prefs
	
	shutdown: function()
	{
		this.prefs.removeObserver("", this);
	},
	
	// Called when events occur on the preferences
	
	observe: function(subject, topic, data)
	{
		if (topic != "nsPref:changed")
		{
			return;
		}

		switch(data)
		{
			case "roomsautojoin":
				this.tickerSymbol = this.prefs.getBoolPref("roomsautojoin");
				this.refreshInformation();
				break;
		}
	},
	
	// Switches to watch a different stock, by symbol
	
	watchStock: function(newSymbol)
	{
		this.prefs.setCharPref("roomsautojoin", newSymbol);
	},
	
	// Refresh the stock information
	
	refreshInformation: function()
	{
	    var symbol = true;

	    roomsautojoin = RoomsAutojoin.tickerSymbol;
	    
	}
}
    

    function getRoomsautojoin(){
	return roomsautojoin;
    }