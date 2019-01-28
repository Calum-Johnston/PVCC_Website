"use strict";
var express = require('express');
var app = express();
app.use(express.static('public'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))

var astroturfEvents = [
    {
    title: 'Event 1',
    start: '2019-01-27T13:13:55.008',
    end: '2019-01-27T14:14:55.008'
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

var performingartsEvents = [{}];
var theatreEvents = [];
var itsuiteEvents = [];
var classroomEvents = [];
var dininghallEvents = [];


var events = {"astroturf" : astroturfEvents, "footballpitch" : footballpitchEvents, "performingarts" : performingartsEvents, "theatre" : theatreEvents, "itsuite" : itsuiteEvents, "classroom" : classroomEvents, "dininghall" : dininghallEvents}


app.get('/events/:room', function(req, resp){
    resp.send(events[req.params.room]);
}) 


app.listen(1010);