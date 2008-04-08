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

var pref = Cc['@mozilla.org/preferences-service;1']
    .getService(Ci.nsIPrefService)
    .getBranch('extensions.notifyme.');


// INITIALIZATION
// ----------------------------------------------------------------------

function init() {
    window.sizeToContent();
    displayKey('sound', eval(pref.getCharPref('toggleSoundKey')));
}

// UTILITIES
// ----------------------------------------------------------------------

function toggleSound(status){
    saveKey('sound', status);
}

function saveKey(which, desc) {
    function capitalize(s) {
        return s.substr(0, 1).toUpperCase() + s.substr(1);
    }
    pref.setCharPref('toggle' + capitalize(which) + 'Key', desc);
}

function displayKey(which, desc) {
    _('toggle-' + which + '-key').checked = desc;
}

function _(id) {
    return document.getElementById('notifyme-' + id);''
}