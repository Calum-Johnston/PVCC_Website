"use strict";
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');


const mysql = require("mysql");

/*#########################
#########VARIABLES#########
#########################*/

//Arrays that hold lists of events to be placed on Full Calendar calendarId

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

var performingartsEvents = [];
var theatreEvents = [];
var itsuiteEvents = [];
var classroomEvents = [];
var dininghallEvents = [];

//dictionary stores relationship between room name and array of events
var eventsDict = {"Astro Turf" : astroturfEvents,  "Class Room" : classroomEvents, "Dining Hall" : dininghallEvents, "Football Pitch" : footballpitchEvents, "IT Suite" : itsuiteEvents, "Performing Arts" : performingartsEvents, "Theatre" : theatreEvents };

//dictionary stores relationship between html names (sent via post request) to actual location names
var locationsDict = {"astroturf": "Astro Turf", "classroom":"Class Room", "dininghall":"Dining Hall", "footballpitch":"Football Pitch", "itsuite":"IT Suite", "performingarts":"Performing Arts", "theatre":"Theatre"};

var calendar;
var authObj;


/*#################################
###GOOGLE CALENDAR FUNCTIONALITY###
#################################*/

// Sets permission for editing calendar
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
//name of token file
const TOKEN_PATH = 'token.json';
// Authorise server to interact with calendar
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // If successful, server is starter
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
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

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
##MYSQL DATABASE CONNECTION##
###########################*/
const con = mysql.createConnection({
      host: "localhost",
      user: "web-admin",
      password: "password",
      database: "pvcc"
    });
//establish connecction
con.connect(function(error){
    if (error) {
        throw error;
    }
    console.log("Connected to database");
})
global.con = con;


 /*#######################################
 ###EXPRESS FUNCTIONS, REQUEST HANDLING###
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

//handles the post request for creating events
app.post('/events', function(req,resp){

  //event object, stores all data sent in request
  var eventInfo = {
    "name":req.body["name"],
    "email":req.body["email"],
    "telephone":req.body["telephone"],
    "dateTimeStart": (new Date(req.body["date"] + " " + req.body["timeFrom"])).toISOString(),
    "dateTimeEnd": (new Date(req.body["date"] + " " + req.body["timeUntil"])).toISOString(),
    "rooms":req.body["rooms"]
  };

  //call function to check if the event is valid, i.e. not overlapping other events
  //send resp to validateEvent due to calendar API taking too long to respond, resp
  //ends up getting processed first otherwise.
  validateEvent(eventInfo, resp);

});

//handles request to delete a given event by ID
app.post('events/delete/:id', function(req,resp){
  var params = {
    calendarId: 'primary',
    eventId: id,
  };

  calendar.events.delete(params, function(err) {
    if (err) {
      console.log('Deleting resulted in an error');
      return;
    }
    console.log('Event: ' + id + " deleted!");
  })
});

//handles full calendar events,
app.get('/events/:room', function(req, resp){
    resp.send(eventsDict[locationsDict[req.params.room]]);
})


//facilities page ***
//load a list of all the facilities.
app.get("/facilities", function(req, resp){
       con.query("SELECT * FROM rooms", function (err, result, fields) {
        if (err) throw err;
        resp.send(result);
      });
})

//return information about a given facility
app.get("/facilities/:id", function(req, resp){
    var roomId = req.params.id
    if (roomId != "undefined"){
            con.query("SELECT * FROM rooms WHERE roomId="+roomId, function (err, result, fields) {
              if (err) throw err;
              resp.send(result);
          });
    }
})

//activities page
//load a list of all activities
app.get("/activities", function(req, resp){
       con.query("SELECT * FROM activities", function (err, result, fields) {
        if (err) throw err;
        resp.send(result);
      });
})

//return information about a given activity by ID
app.get("/activities/:id", function(req, resp){
    var activityId = req.params.id
    if (activityId != "undefined"){
            con.query("SELECT * FROM activities WHERE activityId="+activityId, function (err, result, fields) {
              if (err) throw err;
              resp.send(result);
          });
    }
})









/*#########################
#########FUNCTIONS#########
#########################*/


//called once the authorisation has taken place, server won't start otherwise
function startServer(auth){
  calendar = google.calendar({version: 'v3', auth});
  authObj = auth

  populateEvents();

  app.listen(1010, () => console.log("Booking system listening on port 1010!"));
}



//function that retrieves all events from google calendar on startup, populates website calendar
function populateEvents(){

  var minDate = new Date(Date.now());
  var maxDate = new Date(Date.now());

  //gets all events within the past and future year
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
    //events object
    var clashDiscovered = false;
    const events = res.data.items;

    //check events have actually been returned
    if (events.length){

      //loop through all events
      events.map((event, i) => {
        var rooms = event["location"].split(', ');
        //remove blank room
        rooms.pop()

        var j;

        //create object to be pushed onto correct room arrays
        var eventCalendarObj = {
          title: event["summary"],
          start: event["start"]["dateTime"],
          end: event["end"]["dateTime"]
        }

        //push event onto arrays corresponding to rooms booked
        for(j = 0; j < rooms.length; j++){
          eventsDict[rooms[j]].push(eventCalendarObj);
        }

      })
    }
  });
};

//takes a JSON object with the event information, creates an event if the authentication is valid
function createEvent(eventInfo){

  var eventObj = {
    'summary': 'Example event',
    'location': eventInfo["rooms"],
    'description': 'Test event',
    'start': {
      'dateTime': eventInfo["dateTimeStart"],
      'timeZone': 'Europe/London',
    },
    'end': {
      'dateTime': eventInfo["dateTimeEnd"],
      'timeZone': 'Europe/London',
    },

  };


  //google calendar API command to create new event
  var event = calendar.events.insert({
  auth: authObj,
  calendarId: 'primary',
  resource: eventObj,
  }, function(err, event) {


  if (err) {
    console.log('There was an error contacting the Calendar service: ' + err);
    return;
  }else{


    console.log(event["data"]["id"]);
    //If successful, add to Tom's array here!

    var rooms = eventInfo["rooms"].split(', ');
    var i;


    //JSON object that stores data in format suitable for Full calendar plugin
    var eventCalendarObj = {
      title: eventObj["summary"],
      start: eventInfo["dateTimeStart"],
      end: eventInfo["dateTimeEnd"]
    }

    for(i = 0; i < rooms.length; i ++){
      eventsDict[rooms[i]].push(eventCalendarObj);
    }

  }
  console.log('Event created!');
  });
};

/*function that checks if an event is able to be put on the calendar,
ensures that it is within the opening times and doesn't overlap with
other events using the same rooms. Will probably require stricter
conditions in the future*/
function validateEvent(newEventInfo, resp){

  //calendar.events.list retrieves all upcoming events on the calendar
  calendar.events.list({

    calendarId: 'primary',
    timeMin: newEventInfo["dateTimeStart"],
    timeMax: newEventInfo["dateTimeEnd"],
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
      const requestedRooms = newEventInfo["rooms"].split(', ');

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
        };
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
      resp.send({"response": true});
    }

  });

};

//function from https://stackoverflow.com/questions/16227197/compute-intersection-of-two-arrays-in-javascript/16227294
function intersectArrays(a, b) {
    var t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        return b.indexOf(e) > -1;
    });
};
