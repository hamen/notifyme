// Called once when the dialog displays
function onLoad() {
  // Use the arguments passed to us by the caller
  document.getElementById("address").value = window.arguments[0].inn.address;
  document.getElementById("online").checked = window.arguments[0].inn.online;
}

// Called once if and only if the user clicks OK
function onOK() {
   // Return the changed arguments.
   // Notice if user clicks cancel, window.arguments[0].out remains null
   // because this function is never called
    window.arguments[0].out = null;

    window.arguments[0].out = {address:document.getElementById("address").value,
			       online:document.getElementById("online").checked,
			       offline:document.getElementById("offline").checked,
			       away:document.getElementById("away").checked,
			       busy:document.getElementById("busy").checked};
    return true;
}

function onCancel(){
    
    //    alert('Cancel');
}