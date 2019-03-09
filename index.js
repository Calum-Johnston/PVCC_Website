"use strict";
/* jshint -W097 */
/* jshint esversion: 6 */
/* jshint node: true */
/* jshint browser: true */
/* jshint jquery: true */
/* jshint devel: true */

/*#########################
         Packages
#########################*/

// DEFAULT PACKAGES
const fs = require('fs');
const express = require('express');
const readline = require('readline');
const bodyParser = require('body-parser');
const app = express();

// Packges(s) required to connect to google calendar
const {google} = require('googleapis');

// Package(s) required for sending emails
const nodemailer = require('nodemailer');  // Enables emails to be sent
const inlineCss = require('inline-css');  // Writes CSS directly into HTML

// Package(s) required for database connection
const mysql = require("mysql");







/*#########################
         VARIABLES
#########################*/

// Arrays that hold lists of events to be placed on Full Calendar calendarId

var astroturfEvents = [
    {
    title: 'Event 1',
    start: '2019-02-05T13:13:55.008',
    end: '2019-02-05T14:14:55.008'
    },
    {
    title: 'Event 2',
    start: '2019-01-27T15:13:55',
    end: '2019-01-27T16:13:55'
    }
];

var footballpitchEvents = [{
    title: 'Football Pitch event 1',
    start: '2019-01-28T13:11:55.008',
    end: '2019-01-28T14:14:55.008'
    },
    {
    title: 'Football Pitch event 2',
    start: '2019-01-29T15:13:55',
    end: '2019-01-29T18:13:55'
    }
];

// Variables hold event information
var performingartsEvents = [];
var theatreEvents = [];
var itsuiteEvents = [];
var classroomEvents = [];
var dininghallEvents = [];

// Dictionary that stores the relationship between room name and array of events
var eventsDict = {"Astro Turf" : astroturfEvents,  "Class Room" : classroomEvents, "Dining Hall" : dininghallEvents, "Football Pitch" : footballpitchEvents, "IT Suite" : itsuiteEvents, "Performing Arts" : performingartsEvents, "Theatre" : theatreEvents };

// Dictionary that stores the relationship between HTML names (sent via post requests) to actual location names
var locationsDict = {"astroturf": "Astro Turf", "classroom":"Class Room", "dininghall":"Dining Hall", "footballpitch":"Football Pitch", "itsuite":"IT Suite", "performingarts":"Performing Arts", "theatre":"Theatre"};

// Other variables
var calendar;
var authObj;
var email;






/*#################################
   GOOGLE CALENDAR FUNCTIONALITY
#################################*/

// Sets permission for editing calendar
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// Name of the token file
const TOKEN_PATH = 'token.json';

// Authorise server to interact with calendar
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);

  // If successful the server is started
  authorize(JSON.parse(content), startServer);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */

function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the next 10 events on the user's primary calendar.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */







/*###########################
  MYSQL DATABASE CONNECTION
###########################*/

// Defines the database credentials
const con = mysql.createConnection({
  host: "localhost",
  user: "web-admin",
  password: "password",
  database: "pvcc"
});

// Establishes connecction with the database
con.connect(function(error){
  if (error) {
    console.log('FAILED to connect to the database');
    throw error;
  }
  console.log("Connected to database");
});

// Sets the database for the current server
global.con = con;







 /*#######################################
    EXPRESS FUNCTIONS, REQUEST HANDLING
 #######################################*/

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader('cache-control', 'private, max-age=0, no-cache, no-store, must-revalidate');
  res.setHeader('expires', '0');
  res.setHeader('pragma', 'no-cache');
  next();
});
app.use(express.static('public'));

// === CREATE EVENT ===
// Handles the post request for creating events
app.post('/events', function(req, resp){

  // Creates an event object which stores all data sent in request
  var eventInfo = {
    "name": req.body.name,
    "email": req.body.email,
    "telephone": req.body.telephone,
    "dateTimeStart": (new Date(req.body.date + " " + req.body.timeFrom)).toISOString(),
    "dateTimeEnd": (new Date(req.body.date + " " + req.body.timeUntil)).toISOString(),
    "rooms": req.body.rooms
  };

  // Validates the captcha (** NOT WORKING **)
  /*
  if(req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
    return resp.json({"responseCode" : 1,"responseDesc" : "Please select captcha"});
  }

  // Put your secret key here.
  var secretKey = "6LeakZMUAAAAAJ3ppyXG4OjcAACeLdMv4yd9NcRI";
  // req.connection.remoteAddress will provide IP address of connected user.
  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + secretKey + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
  // Hitting GET request to the URL, Google will respond with success or error scenario.
  req(verificationUrl ,function(error, response, body) {
    body = JSON.parse(body);
    // Success will be true or false depending upon captcha validation.
    if(body.success !== undefined && !body.success) {
      return resp.json({"responseCode" : 1,"responseDesc" : "Failed captcha verification"});
    }
    resp.json({"responseCode" : 0,"responseDesc" : "Sucess"});
  });
  */
  //call function to check if the event is valid, i.e. not overlapping other events
  //send resp to validateEvent due to calendar API taking too long to respond, resp
  //ends up getting processed first otherwise.

  // Validates the event
  validateEvent(eventInfo, resp);

});

// === DELETE EVENT ===
// Handles request to delete a given event by ID
app.post('events/delete/:id', function(req,resp){

  // Gets the ID of the event to be deleted
  var params = {
    calendarId: 'primary',
    eventId: req.params.id, // Gets the ID (needs testing)
  };

  // Deletes the event from the calendar
  calendar.events.delete(params, function(err) {
    if (err) {
      console.log('Deleting resulted in an error');
      return;
    }
    console.log('Event: ' + req.params.id + " deleted!");
  });
});

// === DISPLAY CALENDAR ===
// Handles full calendar events,
app.get('/events/:room', function(req, resp){
  resp.send(eventsDict[locationsDict[req.params.room]]);
});


// === LOAD FACILITIES ===
// Load information abut all facilities
app.get("/facilities", function(req, resp){
  con.query("SELECT * FROM rooms", function (err, result, fields) {
    if (err) throw err;
      resp.send(result);
    });
});

// === LOAD INDIVIDUAL FACILITY ===
// Loads information about a given facility
app.get("/facilities/:id", function(req, resp){
    var roomId = req.params.id;
    if (roomId != "undefined"){
            con.query("SELECT * FROM rooms WHERE roomId="+roomId, function (err, result, fields) {
              if (err) throw err;
              resp.send(result);
          });
    }
});

// === LOAD ACTIVITIES
//load a list of all activities
app.get("/activities", function(req, resp){
       con.query("SELECT * FROM activities", function (err, result, fields) {
        if (err) throw err;
        resp.send(result);
      });
});

// === INDIVIDUAL ACTIVITIES ===
// Returns information about a given activity by ID
app.get("/activities/:id", function(req, resp){
    var activityId = req.params.id;
    if (activityId != "undefined"){
            con.query("SELECT * FROM activities WHERE activityId="+activityId, function (err, result, fields) {
              if (err) throw err;
              resp.send(result);
          });
    }
});


// === GETS ROOM & EVENT DATA ===
// Load a list of event rooms
app.get("/eventrooms", function(req, resp){

  // Queries the database for rooms and events
  con.query("SELECT rooms.roomId, rooms.roomName, commonevents.eventId, commonevents.eventName  FROM commonevents INNER JOIN eventrooms ON commonevents.eventId = eventrooms.eventId INNER JOIN rooms ON eventrooms.roomId = rooms.roomId", function (err, result, fields) {
    if (err) throw err;

    var eventrooms = {};
    for (var i = 0; i < result.length; i++){
      if (result[i].eventId in eventrooms){
          eventrooms[result[i].eventId].rooms.push({"roomName" : result[i].roomName, "roomId" : result[i].roomId});
      }
      else {
          eventrooms[result[i].eventId] = {"eventName" : result[i].eventName, "rooms" : [{"roomName" : result[i].roomName, "roomId" : result[i].roomId}]};
      }
    }
    resp.send(eventrooms);
  });
});







/*#########################
         FUNCTIONS
#########################*/

// Function that retrieves all events from google calendar on startup -> populates website calendar
function populateEvents(){

  var minDate = new Date(Date.now());
  var maxDate = new Date(Date.now());

  // Gets all events within the past and future year
  minDate.setMonth(minDate.getMonth() -12);
  maxDate.setMonth(maxDate.getMonth() + 12);

  var isoMinDateTime = minDate.toISOString();
  var isoMaxDateTime = maxDate.toISOString();

  calendar.events.list({

    calendarId: 'primary',
    timeMin: isoMinDateTime,
    timeMax: isoMaxDateTime,
    maxResults: 1000,
    singleEvents: true,
    orderBy: 'startTime',

  }, (err, res) => {

    if (err) return console.log('The API returned an error: ' + err);

    // Creates an events object
    var clashDiscovered = false;
    const events = res.data.items;

    // Checks that events have actually been returned
    if (events.length){

      // Loop through all events
      events.map((event, i) => {

        // Gets a list of rooms from the event
        var rooms = event.location.split(', ');
        // Remove any none room types
        rooms.pop();

        var j;

        // Creates an object to be pushed onto correct room arrays
        var eventCalendarObj = {
          title: event.summary,
          start: event.start.dateTime,
          end: event.end.dateTime
        };

        // Push event onto arrays corresponding to rooms booked
        for(j = 0; j < rooms.length; j++){
          eventsDict[rooms[j]].push(eventCalendarObj);
        }

      });
    }
  });
}

// Takes a JSON object with the event information and creates an event if the authentication is valid
function createEvent(eventInfo){

  // Creates the event object
  var eventObj = {
    'summary': 'Example event',
    'location': eventInfo.rooms,
    'description': 'Test event',
    'start': {
      'dateTime': eventInfo.dateTimeStart,
      'timeZone': 'Europe/London',
    },
    'end': {
      'dateTime': eventInfo.dateTimeEnd,
      'timeZone': 'Europe/London',
    },

  };


  // Google calendar API command to create new event in the google calendar
  var event = calendar.events.insert({
  auth: authObj,
  calendarId: 'primary',
  resource: eventObj,
  }, function(err, event) {


  if (err) {
    console.log('There was an error contacting the Calendar service: ' + err);
    return;
  }else{

    console.log(event.data.id);
    //If successful, add to Tom's array here!

    var rooms = eventInfo.rooms.split(', ');
    var i;


    //JSON object that stores data in format suitable for Full calendar plugin
    var eventCalendarObj = {
      title: eventObj.summary,
      start: eventInfo.dateTimeStart,
      end: eventInfo.dateTimeEnd
    };

    for(i = 0; i < rooms.length; i ++){
      eventsDict[rooms[i]].push(eventCalendarObj);
    }

  }

  console.log('Event created!');
  });
}

/*function that checks if an event is able to be put on the calendar,
ensures that it is within the opening times and doesn't overlap with
other events using the same rooms. Will probably require stricter
conditions in the future*/
function validateEvent(newEventInfo, resp){

  //calendar.events.list retrieves all upcoming events on the calendar
  calendar.events.list({

    calendarId: 'primary',
    timeMin: newEventInfo.dateTimeStart,
    timeMax: newEventInfo.dateTimeEnd,
    maxResults: 100,
    singleEvents: true,
    orderBy: 'startTime',

  }, (err, res) => {

    if (err) return console.log('The API returned an error: ' + err);
    //events object
    var clashDiscovered = false;
    const events = res.data.items;

    if (events.length) {
      //rooms requested to be booked by the user
      const requestedRooms = newEventInfo.rooms.split(', ');

      events.map((event, i) => {
        //get the list of rooms of current event being evaluated
        const rooms = event.location.split(', ');

        //intersect the two room arrays to see if they are booking taken rooms
        var matchingRooms = intersectArrays(requestedRooms, rooms);

        //if there is more than 0 matching rooms then there is a clash
        if (matchingRooms.length > 0){
          //if time and room clash is found
          console.log("Booking clash detected.");
          clashDiscovered = true;
          resp.send({"response": false});
        }
      });

      if (!clashDiscovered){
        //if time clash but no room clash
        console.log("No room clashes, creating event...");
        createEvent(newEventInfo);
        resp.send({"response": true});
      }

    } else {
      //if there no time clashes
      console.log("No events in that time range, no possibility for clashing booking, creating event...");
      createEvent(newEventInfo);
      sendConfirmation(newEventInfo);
      resp.send({"response": true});
    }

  });

}

// Function from https://stackoverflow.com/questions/16227197/compute-intersection-of-two-arrays-in-javascript/16227294
function intersectArrays(a, b) {
    var t;
    if (b.length > a.length) {t = b; b = a; a = t;} // indexOf to loop over shorter
    return a.filter(function (e) {
        return b.indexOf(e) > -1;
    });
}







/*#########################
      EMAIL FUNCTIONS
#########################*/

// Functions sends a confirmation email when a successful booking occurs
function sendConfirmation(confirmedEventInfo){

  console.log(confirmedEventInfo);

  // Gets the email data to be sent
  var email_Data = getEmailData();

  // Establoshes connection with gmail service
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: 'OAuth2',
      user: 'pvcc.test.email@gmail.com',
      clientId: '9199051241-vsse329fgo2n7jg07mhnni9gcgj4sbrr.apps.googleusercontent.com',
      clientSecret: 'xdXOGNakrG-RxnHmM9gbWYPa',
      refreshToken: '1/7GX2cKvcfC0JpTQ5kEIT8pe9T_eH2RCeJFOdhMlRcgg',
      accessToken: 'ya29.Glu_BprH1s_GYP39mUPJaOuxvN8O9XnN00-wALUxUWKYm7A7c3D9cJ9dzth1Y8rWD1PN4GqB0aWI70G8FCmmUZX8Q8En12vh8TQSWuJFucz7s0J3IxJR3lDtJt42'
    }
  });

  // Defines email recipient and content
  var mailOptions = {
    from: 'pvcc.test.email@gmail.com',
    to: confirmedEventInfo.email,
    subject: 'Booking Request',
    text: email_Data
  };

  // Sends the email
  transporter.sendMail(mailOptions, function(err, res){
    if(err){
      console.log("Error in sending email");
      console.log(err);
    }
    else{
      console.log("Booking successful");
    }
  });
}

// Function returns email data with inline css
function getEmailData(){
  fs.readFile('public/email/email-template.html', (err, content) => {
    inlineCss(content, {url: ' '})
    .then(function(content){
      return content;
    });
  });
}




/*#########################
      CORE FUNCTIONS
#########################*/

// Function called to start the server after authorisation has occured **REQUIRED**
function startServer(auth){
  calendar = google.calendar({version: 'v3', auth});
  authObj = auth;

  populateEvents();

  app.listen(1010, () => console.log("Booking system listening on port 1010!"));
}
