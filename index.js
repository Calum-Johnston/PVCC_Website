"use strict";
var express = require('express');
var app = express();
app.use(express.static('public'));



var pgp = require('pg-promise')(/*options*/)
var db = pgp('postgres://rvlfvkiyapwqjn:94a8a38395f889bd74f8f0122380259c34861321bd50ab750ffc5e33126e40b0@ec2-54-217-208-105.eu-west-1.compute.amazonaws.com:5432/d5uo2kinlb47c5')

db.one('SELECT $1 AS value', 123)
  .then(function (data) {
    console.log('DATA:', data.value)
  })
  .catch(function (error) {
    console.log('ERROR:', error)
  })


const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))



const port=process.env.PORT || 3000
module.exports = app.listen(port);