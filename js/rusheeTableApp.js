/**
 *  Table backend
 * 
 *  Uses a jquery plugin DataTables, sets up the dataset
 */

// Modules
var fs = require('fs');
var path = require('path');
var http = require('http');
var json2xls = require('json2xls');
const remote = require('electron').remote; 

/**
 *  returns dictionary of rounds & associated arrays of rushees TABLE OBJECTS
 *  ["round#": [RusheeJSON, ...], ... ]
 *  @param1: name of directory containing rushee JSON objects
 *  @param2: callback function to handle rushee JSON object 
 */
function getRusheeTableObjects(dirname, onFileContent) {
    var dataset = [];
    dataset["0"] = []; // open house
    dataset["1"] = []; // first round
    dataset["2"] = []; // second round 
    dataset["3"] = []; // third round

    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            console.log(err);
            return;
        }
        filenames.forEach(function(filename) {
            fs.readFile(path.resolve(dirname, filename), 'utf-8', function(err, content) {
                if (err) {
                    console.log(err);
                    return;
                }
                var rusheeJSON = JSON.parse(content);
                var rusheeTableObject = onFileContent(rusheeJSON);

                dataset["0"].push(rusheeTableObject); // add all rushees to open house array

                if (rusheeJSON.roundInvites["1"]) {
                    dataset["1"].push(rusheeTableObject);
                };

                if(rusheeJSON.roundInvites["2"]) {
                    dataset["2"].push(rusheeTableObject);
                };

                if(rusheeJSON.roundInvites["3"]) {
                    dataset["3"].push(rusheeTableObject);
                };

            });
        });
    });

    return dataset;
}

/**
 *  returns dictionary of rounds & associated arrays of rushee JSON OBJECTS
 *  ["round#": [RusheeJSON, ...], ... ]
 *  @param1: name of directory containing rushee JSON objects
 *  @param2: callback function to handle rushee JSON object 
 */
function getRusheeDictionary(dirname) {
    var dataset = [];
    dataset["0"] = []; // open house
    dataset["1"] = []; // first round
    dataset["2"] = []; // second round 
    dataset["3"] = []; // third round

    fs.readdir(dirname, function(err, filenames) {
        if (err) {
            console.log(err);
            return;
        }
        filenames.forEach(function(filename) {
            fs.readFile(path.resolve(dirname, filename), 'utf-8', function(err, content) {
                if (err) {
                    console.log(err);
                    return;
                }
                var rusheeJSON = JSON.parse(content);
                dataset["0"].push(rusheeJSON); // add all rushees to open house array

                if (rusheeJSON.roundInvites["1"]) {
                    dataset["1"].push(rusheeJSON);
                };

                if(rusheeJSON.roundInvites["2"]) {
                    dataset["2"].push(rusheeJSON);
                };

                if(rusheeJSON.roundInvites["3"]) {
                    dataset["3"].push(rusheeJSON);
                };

            });
        });
    });

    return dataset;
}

/**
 *  returns array of rushee table objects from locally stored 
 */
function loadRushees(roundNumber) {
    var roundDictionary = getRusheeTableObjects(path.resolve(__dirname, '../data/rushee-profiles'), formatRushee);
    return roundDictionary[roundNumber];
}

/**
 *  returns individual rushee table object
 *  @param1: file name (email)
 *  @param2: rushee JSON
 */
function formatRushee(rusheeJSON) {
    var rusheeTableObject = new Array(
        rusheeJSON.rusheeProfile.firstname,
        rusheeJSON.rusheeProfile.lastname,
        rusheeJSON.rusheeProfile.year,
        rusheeJSON.rusheeProfile.address,
        rusheeJSON.rusheeProfile.email
    );

    return rusheeTableObject;
}

/**
 *  Sets up the table to reflect which round was clicked 
 */
function roundClicked(roundNumber) {
    remote.getGlobal('sharedObject').selectedRusheeTable = roundNumber;
}

/**
 *  Exports the data from the table in excel format 
 */
function exportRushees() {
    // get appropriate dataset based on which set of rushees is being viewed
    // asyncs with readFile are out of whack.. I tried for a while but ended up cheating.  Sorry.
    var roundID = remote.getGlobal('sharedObject').selectedRusheeTable;
    var roundDictionary = getRusheeDictionary(path.resolve(__dirname, '../data/rushee-profiles'));

    // cool download code from https://stackoverflow.com/questions/3665115/create-a-file-in-memory-for-user-to-download-not-through-server
    setTimeout(function(){ 
        var dataset = roundDictionary[roundID];
        
        // clean dataset to only include rushee information
        var formattedDataSet = [];
        var rusheeProfile = {};
        for (var i = 0; i<dataset.length; i++) {
            rusheeProfile = dataset[i].rusheeProfile;
            rusheeProfile.comments = dataset[i].comments;
            formattedDataSet.push(rusheeProfile);
        }
    
        var xls = json2xls(formattedDataSet);
        fs.writeFileSync('data.xlsx', xls, 'binary');
        
        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(new Blob(['Test,Text'], {type: 'text/csv'}));
        a.download = 'rushee-data.csv';
        
        // Append anchor to body.
        document.body.appendChild(a);
        a.click();
        // Remove anchor from body
        document.body.removeChild(a);

     }, 500);   
}