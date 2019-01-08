// Modules
var fs = require('fs');
var path = require('path');

/*
 * CAMERA 
 */


/**
 *  Check that there's an email input before taking picture
 *  (We store images on capture under the user's email--not optimal, but it works)
 */
function checkEmail() {
    if(document.getElementById("email").value == "") {
        return false;
    } else {
        take_snapshot();
    }
};

/**
 *  Setup raw image data as buffer to be written to .jpeg file
 */
function decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');

    return response;
}

/**
 *  Handle snapshot button click event
 */
function take_snapshot() {
    WebCamera.snap( function(data_uri) {
        // display snapshot
        document.getElementById('my_result').innerHTML = '<img id="screenshot" src="'+data_uri+'"/>';
        // upload image
        var data = data_uri;
        var imageBuffer = decodeBase64Image(data);

        var email = document.getElementById("email").value;
        var fileLocation = path.join('data/rushee-images/', email + '.jpeg');
        
        fs.writeFile(fileLocation, imageBuffer.data, function(err) {
            if(err) {
                return console.log(err);
            }
        
            console.log("The file was saved!");
        }); 
    });
};

/*
 * FORM 
 */


 /**
 *  Form handler
 */
function submitForm(event) {
    event.preventDefault();

    // Store data as rushee JSON 
    let firstname = document.getElementById("firstname").value;
    let lastname = document.getElementById("lastname").value;
    let year = $('input[name=radio]:checked').val();
    let address = document.getElementById("address").value;
    let telephone = document.getElementById("telephone").value;
    let email = document.getElementById("email").value;
    
    let rusheeJSON = {
        "rusheeProfile": {
            "firstname": firstname,
            "lastname": lastname,
            "year": year,
            "address": address,
            "telephone": telephone,
            "email": email 
        },
        "eventAttendance": { // Stored using eventID — "round#event#" no space.  true = attended, false = did not attend
            "11": false,
            "12": false,
            "13": false,
            "21": false,
            "22": false,
            "23": false,
            "31": false,
            "32": false
        },
        "roundInvites": {
            "1": false,
            "2": false,
            "3": false
        },
        "comments": []
    };

    // Backup on machine
    var fileLocation = path.join('data/rushee-profiles/', rusheeJSON.rusheeProfile.email + '.json');
    var data = JSON.stringify(rusheeJSON);
    fs.writeFile(fileLocation, data, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    }); 

    location.reload();  // reload page

}