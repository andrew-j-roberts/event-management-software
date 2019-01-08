/**
 *  Rushee profile app
 * 
 *  Sets up rushee profile page — displays rushee information, event & round attendance, & comments
 *  Allows for adding/removing rushee round invites & adding comments
 */

// Modules
var fs = require('fs');
var path = require('path');
const remote = require('electron').remote; 

// Page details
let email = remote.getGlobal('sharedObject').selectedRusheeEmail;

getRusheeProfile(email, function(data){
    profilePageSetup(data);
});

var eventAttendance = {
    "11": defaultNo,
    "12": defaultNo,
    "13": defaultNo,
    "21": defaultNo,
    "22": defaultNo,
    "23": defaultNo,
    "31": defaultNo,
    "32": defaultNo,
};

var roundInvites = {
    "1": defaultNo,
    "2": defaultNo,
    "3": defaultNo
};

var defaultNo = '<span class="glyphicon glyphicon-remove" style="color:#FF0000;"></span>';
var defaultYes = '<span class="glyphicon glyphicon-ok" style="color:#00FF00;"></span>';

/**
 *  passes rushee profile information into callback
 *  @param1: rushee email
 *  @param2: callback function to handle rushee JSON object 
 */
function getRusheeProfile(email, onDoneLoading) {
    var absoluteURL = 'data/rushee-profiles/' + email + '.json';
    fs.readFile(absoluteURL, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        onDoneLoading(JSON.parse(data));
    });
}

/**
 *  updates the event attendance JSON on profile page
 *  @param1: rushee email
 *  @param2: rushee profile page event attendance JSON
 */
function getRusheeEventAttendance(email, rusheeEventRecord) {
    getRusheeProfile(email, function(rusheeJSON) {
        for (var key in rusheeJSON.eventAttendance) {
            if (rusheeJSON.eventAttendance[key]) {
                rusheeEventRecord[key] = defaultYes;
            } else {
                rusheeEventRecord[key] = defaultNo;
            }
        };
    });
}

/**
 *  updates the round invites JSON on profile page
 *  @param1: rushee email
 *  @param2: rushee profile page round invites JSON
 */
function getRusheeRoundInvites(email, roundInvites) {
    getRusheeProfile(email, function(rusheeJSON) {
        for (var key in rusheeJSON.roundInvites) {
            if (rusheeJSON.roundInvites[key]) {
                roundInvites[key] = defaultYes;
            } else {
                roundInvites[key] = defaultNo;
            }
        };
    });
}

/**
 *  returns round JSON information
 *  @param1: round number 
 *  @param2: callback function to handle the round JSON when we add it
 */
function getRoundJSON(roundNum, onDoneLoading) {
    var absoluteURL = 'data/round-invites/round' + roundNum + '.json';
    fs.readFile(absoluteURL, 'utf8', function (err,data) {
        if (err) {
          return console.log(err);
        }
        onDoneLoading(JSON.parse(data));
    });
}

/**
 *  adds invite for rushee into the round invite
 *  @param1: round number
 */
function addRusheeRoundInvite(roundNum) {
    // UPDATE ROUND JSON
    getRoundJSON(roundNum, function(roundJSON) {
        // add email to round invite list
        if (roundJSON.rushees.indexOf(email) === -1) {
            roundJSON.rushees.push(email);
        }
        var roundData = JSON.stringify(roundJSON);

        var absoluteURL = 'data/round-invites/round' + roundNum + '.json';
        fs.writeFile(absoluteURL, roundData, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        }); 

        document.getElementById('' + roundNum).innerHTML = defaultYes;    
    });
    
    // UPDATE RUSHEE JSON
    getRusheeProfile(email, function(rusheeJSON) {
        rusheeJSON.roundInvites['' + roundNum] = true;
        var newData = JSON.stringify(rusheeJSON);  //reserialize to JSON
        var absoluteURL = 'data/rushee-profiles/' + email + '.json';
        fs.writeFile(absoluteURL, newData, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        }); 
    });
}

/**
 *  removes invite for rushee from JSON & their object
 *  @param1: round number
 */
function removeRusheeRoundInvite(roundNum) {
    // UPDATE ROUND JSON
    getRoundJSON(roundNum, function(roundJSON) {
         // remove all occurances of email 
        roundJSON.rushees = roundJSON.rushees.filter(e => e !== email);
        var roundData = JSON.stringify(roundJSON);

        var absoluteURL = 'data/round-invites/round' + roundNum + '.json';
        fs.writeFile(absoluteURL, roundData, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        }); 

        document.getElementById('' + roundNum).innerHTML = defaultNo;
    });

    // UPDATE RUSHEE JSON
    getRusheeProfile(email, function(rusheeJSON) {
        rusheeJSON.roundInvites['' + roundNum] = false;
        var newData = JSON.stringify(rusheeJSON);  //reserialize to JSON
        var absoluteURL = 'data/rushee-profiles/' + email + '.json';
        fs.writeFile(absoluteURL, newData, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        }); 
    });
}

/**
 *  updates rushee profile page front end
 *  @param1: rushee JSON 
 */
function profilePageSetup(rusheeJSON) {
    // information
    document.getElementById('firstName').innerHTML = rusheeJSON.rusheeProfile.firstname;
    document.getElementById('lastName').innerHTML = rusheeJSON.rusheeProfile.lastname;
    document.getElementById('year').innerHTML = rusheeJSON.rusheeProfile.year;
    document.getElementById('address').innerHTML = rusheeJSON.rusheeProfile.address;
    document.getElementById('phoneNum').innerHTML = rusheeJSON.rusheeProfile.telephone;
    document.getElementById('uvaid').innerHTML = rusheeJSON.rusheeProfile.email;
    // image
    document.getElementById('rusheePic').src = '../data/rushee-images/' + rusheeJSON.rusheeProfile.email + '.jpeg';
}

/**
 *  returns to the table of rushees
 */
function back() {
    window.history.back();
}

/**
 *  adds comment to the rushee JSON, reloads page to reflect change
 */
function addComment() {
    getRusheeProfile(email, function(rusheeJSON){
        // get comment
        let comment = document.getElementById("addComment").value;
        document.getElementById("addComment").value = '';
        document.getElementById("addComment").blur();
        // append to comments array of rushee object
        rusheeJSON["comments"].push(comment);
        var newData = JSON.stringify(rusheeJSON);
        var absoluteURL = 'data/rushee-profiles/' + email + '.json';
        fs.writeFile(absoluteURL, newData, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
        location.reload();  // reflect added comment
    });
}