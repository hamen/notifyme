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

// Called once when the dialog displays
function onLoad() {
  // Use the arguments passed to us by the caller
  document.getElementById("address").value = window.arguments[0].inn.nick;
  document.getElementById("online").checked = window.arguments[0].inn.online;
  document.getElementById("offline").checked = window.arguments[0].inn.offline;
  document.getElementById("away").checked = window.arguments[0].inn.away;
  document.getElementById("busy").checked = window.arguments[0].inn.busy;
}

// Called once if and only if the user clicks OK
function onOK() {
   // Return the changed arguments.
   // Notice if user clicks cancel, window.arguments[0].out remains null
   // because this function is never called
    window.arguments[0].out = null;

    window.arguments[0].out = {online:document.getElementById("online").checked,
			       offline:document.getElementById("offline").checked,
			       away:document.getElementById("away").checked,
			       busy:document.getElementById("busy").checked};
    return true;
}

function onCancel(){
    
    //    alert('Cancel');
}