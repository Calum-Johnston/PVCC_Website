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

const jwt = require('jwt-simple');

const ADMIN = 'admin';
const ADMIN_PASSWORD = 'password';

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


//events dict stores arrays of events generated from the google calendar. Entries in the form: "roomname":[arrayOfEvents]
var eventsDict = {}

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


//secure admin secion

const SECRET = "mysecret"

app.post('/login',
  function (req, resp) {
    if (req.body.password === ADMIN_PASSWORD) {
        resp.send(jwt.encode({ ADMIN }, SECRET))
      }
});


function userIsAllowed(req, callback) {
    try {
        var decodedCookies = decodeURIComponent(req.headers.cookie).split(";");
        for(var i = 0; i <decodedCookies.length; i++) {
            var cookie = decodedCookies[i]
            while (cookie.charAt(0) == ' '){
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf("adminToken=") == 0) {
              var token = cookie.substring(11, cookie.length);
                break;
            }

        }


        const result = jwt.decode(token, SECRET)["ADMIN"];
        if (result === ADMIN) {
            callback(true)
        } else {
            callback(false);
        }
    } catch (err) {
        callback(false);
    }

};

// This function returns a middleware function
var protectPath = function(regex) {
  return function(req, res, next) {

    if (!regex.test(req.url)) { return next(); }
    userIsAllowed(req, function(allowed) {
      if (allowed) {
        next(); // send the request to the next handler, which is express.static
      } else {
        res.redirect('/admin/login.html');
        return;
      }
    });
  };
};
//end of secure

app.use(protectPath(/^.*\/secure\/.*$/)); //secure directory


app.post("/testLogin", function(req,resp){
    userIsAllowed(req, function(allowed) {
        if (allowed) {
            resp.send(true)
        } else {
            resp.send(false)
            return;
        }
    });
})


// end of secure admin section






app.use(express.static('public'));

// === CREATE EVENT ===
// Handles the post request for creating events
app.post('/events', function(req, resp){

  // Creates an event object which stores all data sent in request
  var eventInfo = {
    "name": req.body.name,
    "email": req.body.email,
    "telephone": req.body.telephone,
    "title": req.body.title,
    "description": req.body.description,
    "dateTimeStart": (new Date(req.body.date + " " + req.body.timeFrom)).toISOString(),
    "dateTimeEnd": (new Date(req.body.date + " " + req.body.timeUntil)).toISOString(),
    "private": req.body.private,
    "rooms": req.body.rooms,
    "price": req.body.price
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
app.get('/delete-event/:id', function(req, resp){

  // Gets the ID of the event to be deleted
  var params = {
    calendarId: 'primary',
    eventId: req.params.id
  };

  // Deletes the event from the Google Calendar
  calendar.events.delete(params, function(err) {
    if (err) {
      console.log('Deleting resulted in an error');
      return;
    }
    console.log('Event: ' + req.params.id + " deleted!");
  });

  // Update website calendar to follow google calendar


  for (var key in eventsDict){
    //filters every array, removes event object if its ID = id of deleted google calendar event
    eventsDict[key] = eventsDict[key].filter(function(value, index, arr){
      return value["id"] != req.params.id;
    });
  };
  // Redirect user elsewhere
  return resp.redirect('/');
});


// === DISPLAY CALENDAR ===
// Handles full calendar events,
app.get('/events/:room', function(req, resp){
  console.log(req.params.room);
  if (eventsDict[req.params.room] == undefined){
    eventsDict[req.params.room] = [];
  }
  resp.send(eventsDict[req.params.room]);
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
            con.query("SELECT * FROM rooms WHERE roomId='"+roomId+"'", function (err, result, fields) {
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
            var sql = "SELECT * FROM activities WHERE activityId="+activityId
            con.query(sql, function (err, result, fields) {
              if (err) throw err;
              resp.send(result);
          });
    }
});


const multer = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img')
  },
  filename: function (req, file, cb) {
    var originalname = file.originalname
    if (req.url == "/activities"){
        var extension = originalname.substr(originalname.lastIndexOf("."))
        console.log(req.url + "/" + req.body.activityId + extension)
        cb(null, req.url + "/" + req.body.activityId + extension)
    } else if (req.url == "/facilities") {
        var extension = originalname.substr(originalname.lastIndexOf("."))
        console.log(req.url + "/" + req.body.facilityId + extension)
        cb(null, req.url + "/" + req.body.facilityId + extension)
    }
  }
})

var upload = multer({ storage: storage })



//insert an activity
app.post('/activities', upload.single('image'), (req, resp) => {
    var activityId = req.body.activityId;
    var activityName = req.body.activityName;
    var activityDescription = req.body.activityDescription.replace("\n", "<br />");
    var image = req.file;

    var sql = ""
    if (req.body.submit == "Submit"){
        //insert new activity if it does't already exist
        if (activityId == 0 && image){
            sql = "INSERT INTO activities (activityName, activityDescription, activityImage) VALUES('" +  activityName + "', '" +  activityDescription + "', '" +  image.filename
        } else if (activityId == 0 && !image){
            sql = "INSERT INTO activities (activityName, activityDescription, activityImage) VALUES('" +  activityName + "', '" +  activityDescription +"', '/activities/default.jpg')"
        } else if (activityId != 0 && image){
            sql = "UPDATE activities SET activityName = '" +  activityName + "', activityDescription = '" +  activityDescription + "', activityImage = '" +  image.filename + "'   WHERE activityId = " + activityId
        } else if (activityId != 0 && !image){
            sql = "UPDATE activities SET activityName = '" +  activityName + "', activityDescription = '" +  activityDescription + "' WHERE activityId = " + activityId
        }
    } else if (req.body.submit == "Delete") {
        sql = "DELETE FROM activities WHERE activityId = " + activityId
        
        //delete the image since it is no longer needed
        fs.unlink('public/img/activities/'+activityId+'.jpg', function (err) {
            if (err) {
                console.log("image not deleted")
            } else {
                console.log('Image deleted!');
            }
        });  
        
    }

    con.query(sql, function (err, result, fields) {
      if (err) throw err;

        resp.redirect("/activities.html")

    });


});



//insert a facilitiy
app.post('/facilities', upload.single('image'), (req, resp) => {
    var facilityId = req.body.facilityId;
    var facilityName = req.body.facilityName;
    var facilityDescription = req.body.facilityDescription.replace("\n", "<br />");
    var image = req.file;

    var facilityType = req.body.roomType;
    var facilityPrice = req.body.roomPrice;

    
    var sql = ""
    if (req.body.submit == "Submit"){
        //insert new activity if it does't already exist
        if (facilityId == 0 && image){
            sql = "INSERT INTO rooms (roomName, roomDescription, roomImage, roomType, price) VALUES('" +  facilityName + "', '" +  facilityDescription + "', '" +  image.filename + "', '" +  facilityType + "', '" +  facilityPrice + "')"
        } else if (facilityId == 0 && !image){
            sql = "INSERT INTO rooms (roomName, roomDescription, roomImage, roomType, price) VALUES('" +  facilityName + "', '" +  facilityDescription + "', '/facilities/default.jpg', '" +  facilityType + "', '" +  facilityPrice + "')"
        } else if (facilityId != 0 && image){
            sql = "UPDATE rooms SET roomName = '" +  facilityName + "', roomDescription = '" +  facilityDescription + "', roomImage = '" +  image.filename + "', roomType = '" +  facilityType + "', price = '" +  facilityPrice + "'   WHERE roomId = " + facilityId
        } else if (facilityId != 0 && !image){
            sql = "UPDATE rooms SET roomName = '" +  facilityName + "', roomDescription = '" +  facilityDescription + "', roomType = '" +  facilityType + "', price = '" +  facilityPrice + "'   WHERE roomId = " + facilityId
        } 

    } else if (req.body.submit == "Delete") {
        sql = "DELETE FROM rooms WHERE roomId = " + facilityId
        
        //delete the image since it is no longer needed
        fs.unlink('public/img/facilities/'+facilityId+'.jpg', function (err) {
            if (err) {
                console.log("image not deleted")
            } else {
                console.log('Image deleted!');
            }
        }); 
        
    }

    console.log(sql)
    con.query(sql, function (err, result, fields) {

      if (err) throw err;        

        resp.redirect("/facilities.html")

    });

});


// === GETS ROOM & EVENT DATA ===
// Load a list of event rooms
app.get("/eventrooms", function(req, resp){

  // Queries the database for rooms and events
  con.query("SELECT rooms.roomId, rooms.roomName, rooms.price, commonevents.eventId, commonevents.eventName  FROM commonevents INNER JOIN eventrooms ON commonevents.eventId = eventrooms.eventId INNER JOIN rooms ON eventrooms.roomId = rooms.roomId", function (err, result, fields) {
    if (err) throw err;

    var eventrooms = {};
    for (var i = 0; i < result.length; i++){
      if (result[i].eventId in eventrooms){
          eventrooms[result[i].eventId].rooms.push({"roomName" : result[i].roomName, "roomId" : result[i].roomId, "price": result[i].price});
      }
      else {
          eventrooms[result[i].eventId] = {"eventName" : result[i].eventName, "rooms" : [{"roomName" : result[i].roomName, "roomId" : result[i].roomId, "price": result[i].price}]};
      }
    }
    resp.send(eventrooms);
  });
});

app.get("/roomprices", function(req, resp){

  // query that returns dictionary of rooms and prices
  con.query("SELECT rooms.roomName, rooms.price FROM rooms", function(err, result, fields){
    if (err) throw err;

    var roomPrices = {};
    for (var i = 0; i < result.length; i++){
      if (result[i].roomName in roomPrices){
        roomPrices[result[i].roomName].push({"price" : result[i].price});
      }
      else{
        roomPrices[result[i].roomName] = {"price" : result[i].price};
      }
    }
    resp.send(roomPrices);
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
        // Remove any none room types, not sure this is needed anymore
        //  rooms.pop();

        var j;

        // Creates an object to be pushed onto correct room arrays
        var eventCalendarObj = {
          title: event.summary,
          start: event.start.dateTime,
          end: event.end.dateTime,
          id: event.id
        };

        //checks if the event is Private, sets title to private if it is
        if (event.private == true){
          eventCalendarObj["title"] = "Private Event";
        }

        // Push event onto arrays corresponding to rooms booked
        for(j = 0; j < rooms.length - 1; j++){
          //set to lower case and remove whitespace
          var room = rooms[j];
          room = room.toLowerCase();
          room = room.replace(/\s/g, '');

          //check for empty string (end of array of google calendar)
          if (room != null){

            if (eventsDict[room] == undefined){
              //set up dictionary entry
              eventsDict[room] = [];
            }
            eventsDict[room].push(eventCalendarObj);

          }
        }


      });
    }
  });

}

// Takes a JSON object with the event information and creates an event if the authentication is valid
function createEvent(eventInfo){

  // Creates the event object
  var eventObj = {
    'summary': eventInfo.title,
    'location': eventInfo.rooms,
    'description': eventInfo.description,
    'start': {
      'dateTime': eventInfo.dateTimeStart,
      'timeZone': 'Europe/London',
    },
    'end': {
      'dateTime': eventInfo.dateTimeEnd,
      'timeZone': 'Europe/London',
    },
     //use this google calendar event variable to track if event is private or not. True == Private, public otherwise
    attendeesOmitted: eventInfo.private,

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


    var eventId = event.data.id;
    //If successful, add to Tom's array here!

    var rooms = eventInfo.rooms.split(', ');
    var i;


    //JSON object that stores data in format suitable for Full calendar plugin
    var eventCalendarObj = {
      title: eventObj.summary,
      start: eventInfo.dateTimeStart,
      end: eventInfo.dateTimeEnd,
      id: eventId

    };

    if (eventInfo.private == true){
      eventCalendarObj["title"] = "Private Event";
    }

    for(i = 0; i < rooms.length; i ++){
      var room = rooms[i];
      room = room.toLowerCase();
      room = room.replace(/\s/g, '');

      if (eventsDict[room] == undefined){
        eventsDict[room] = [];
      }
      eventsDict[room].push(eventCalendarObj);
    }

  }
  console.log('Event created!');
  sendConfirmation(eventInfo, event.data.id);
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
        rooms.pop();
        
        for (var i = 0; i < rooms.length; i++){
          console.log(rooms[i]);
        }
        //intersect the two room arrays to see if they are booking taken rooms
        console.log("Requested rooms: " + requestedRooms);
        console.log("Events rooms: " + rooms);
        //var matchingRooms = intersectArrays(requestedRooms, rooms);
        const matched = requestedRooms.some(r=> rooms.includes(r));
        console.log("Matched rooms:" + matched);

        //if there is more than 0 matching rooms then there is a clash
        if (matched == true){
          //if time and room clash is found

          console.log("Booking clash detected.");
          clashDiscovered = true;
          resp.send({"response": false});
        }
      });

      if (!clashDiscovered){
        //if time clash but no room clash
        console.log("No room clashes, creating event...");
        // Passes createEvent() as a callback for sendConfirmation()
        createEvent(newEventInfo);

        // Sends teh response to the website
        resp.send({"response": true});
      }

    } else {
      //if there no time clashes
      console.log("No events in that time range, no possibility for clashing booking, creating event...");

      // Passes createEvent() as a callback for sendConfirmation()
      createEvent(newEventInfo);

      // Sends the response to the website
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

// Gets the temp email to send when server loads
var email;
getEmailData();

// Defines a global variable to store the id
var id;

// Functions sends a confirmation email when a successful booking occurs
function sendConfirmation(confirmedEventInfo, id){

  // Establoshes connection with gmail service
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: false,
    auth: {
      type: 'OAuth2',
      user: 'pvcc.test.email@gmail.com',
      clientId: '9199051241-vsse329fgo2n7jg07mhnni9gcgj4sbrr.apps.googleusercontent.com',
      clientSecret: 'xdXOGNakrG-RxnHmM9gbWYPa',
      refreshToken: '1/GuHiUqBGEtBi5lJqQ4wuP3ECVQJXzXKqiFu1-KpKgeI',
      accessToken: 'ya29.GlvHBjW5ZOEKhTXzQM0JyDQF43X6leB8rT7s6O8ia2X2cJ1aF1m5t8SOeQevMB8amX_ULHVbXnUAv7hbhVY9uOhP_e4Y_4BGZH2VK-_DDM7ZIazKQ_TIBBOKJjsd'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Edits the data for the email
  email = email.replace("BOOKING-NAME", confirmedEventInfo.name);
  email = email.replace("BOOKING-ROOMS", confirmedEventInfo.rooms);
  email = email.replace("BOOKING-DATE", confirmedEventInfo.dateTimeStart.split("T")[0]);
  email = email.replace("BOOKING-TIME", confirmedEventInfo.dateTimeStart.split("T")[1].substring(0, 5) + " - " + confirmedEventInfo.dateTimeEnd.split("T")[1].substring(0, 5));
  email = email.replace('BOOKING-ID', id);

  // Defines email recipient and content
  var mailOptions = {
    from: 'pvcc.test.email@gmail.com',
    to: confirmedEventInfo.email,
    subject: 'Booking Request',
    html: email
  };

  // Sends the email
  transporter.sendMail(mailOptions, function(err, res){
    if(err){
      console.log("Error in sending email");
      console.log(err);
    }
    else{
      console.log("Booking email sent");
    }
  });

  // Resets the data for the email
  email = email.replace(confirmedEventInfo.name, "BOOKING-NAME");
  email = email.replace(confirmedEventInfo.rooms, "BOOKING-ROOMS");
  email = email.replace(confirmedEventInfo.dateTimeStart.split("T")[0], "BOOKING-DATE");
  email = email.replace(confirmedEventInfo.dateTimeStart.split("T")[1].substring(0, 5) + " - " + confirmedEventInfo.dateTimeEnd.split("T")[1].substring(0, 5), "BOOKING-TIME");
  email = email.replace(id, "BOOKING-ID");

}

// Function returns email data with inline css
function getEmailData(){
  fs.readFile('public/email/email-template.html', (err, content) => {
    inlineCss(content, {url: ' '})
    .then(function(content){
      email = content;
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
