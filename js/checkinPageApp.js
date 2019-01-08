/**
 *  Check-in page
 * 
 *  Saves rushee checkins to both attendance files [data/event-attendance/round?/round?-event?-attendance.json] 
 *  and rushee objects
 */

// Modules
var fs = require('fs');
const remote = require('electron').remote; 

// Fields
let round = remote.getGlobal('sharedObject').selectedCheckinRound;
let event = remote.getGlobal('sharedObject').selectedCheckinEvent;
let attendanceFileURL = 'data/event-attendance/round' + round + '/round' + round + '-event' + event + '-attendance.json';

 /**
 *  Page setup - updates title based on the round and event #
 */
function setupPage() {
    var numToString = {
        "1": "First",
        "2": "Second",
        "3": "Third"
    }
    document.getElementById('round').innerHTML = numToString[round] + " Round";
    document.getElementById('event').innerHTML = "- Event " + event;
}

 /**
 *  Handle sign in button event
 */
function buttonClicked() {
    var email = document.getElementById('email').value;
    console.log("Checked in: " + email);
    rusheeCheckin(email);
}

 /**
 *  Check in rushee — update both attendance file and rushee object
 */
function rusheeCheckin(email) {
    // Update backup attendance file
    getEventJSON(email, function(attendanceJSON){
        attendanceJSON.rushees.push(email);

        var attendanceString = JSON.stringify(attendanceJSON);  //reserialize to JSON
        fs.writeFile(attendanceFileURL, attendanceString, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        }); 
    });

    // Update rushee object
    getRusheeJSON(email, function(rusheeJSON) {
        var eventID = "" + round + event;
        rusheeJSON.eventAttendance[eventID] = true;

        var absoluteURL = 'data/rushee-profiles/' + email + '.json';
        var newData = JSON.stringify(rusheeJSON);  //reserialize to JSON
        fs.writeFile(absoluteURL, newData, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        }); 
    });
}

/**
 *  Handles event attednance json
 *  @param1: rushee email
 *  @param2: callback function to handle rushee JSON object 
 */
function getEventJSON(email, onDoneLoading) {
    fs.readFile(attendanceFileURL, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        onDoneLoading(JSON.parse(data));
    });
}

/**
 *  Handles rushee profile information
 *  @param1: rushee email
 *  @param2: callback function to handle rushee JSON object 
 */
function getRusheeJSON(email, onDoneLoading) {
    var absoluteURL = 'data/rushee-profiles/' + email + '.json';
    fs.readFile(absoluteURL, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        onDoneLoading(JSON.parse(data));
    });
}