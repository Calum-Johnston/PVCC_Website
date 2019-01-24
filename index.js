"use strict";
var express = require('express');
var app = express();
app.use(express.static('public'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))

var events = [{
    title: 'Event 1',
    start: '2019-01-24T13:13:55.008',
    end: '2019-01-24T14:14:55.008'
    },
    {
    title: 'Event 2',
    start: '2019-01-25T15:13:55',
    end: '2019-01-25T16:13:55'
    }];

app.get('/events', function(req, resp){
    resp.send(events);
}) 


app.listen(1010);