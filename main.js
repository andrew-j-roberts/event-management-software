// Modules
const {app, BrowserWindow} = require('electron');
const url = require('url');
const path = require('path');


let mainWindow;

// Listen for app to be ready
app.on('ready', function() {
    // Create new window
    mainWindow = new BrowserWindow({});
    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'pages/dashboard.html'),
        protocol:'file:',
        slashes: true
    }));
    // Quit app when closed
    mainWindow.on('closed', function(){
        app.quit();
    });
});

// Used to pass data between views
global.sharedObject = {
    selectedRusheeEmail: 'default value',
    selectedCheckinRound: 'Round 1',
    selectedCheckinEvent: 'Event 1',
    selectedRusheeTable: '0'
}
