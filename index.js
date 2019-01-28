"use strict";
var express = require('express');
var app = express();
app.use(express.static('public'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))



const port=process.env.PORT || 3000
module.exports = app.listen(port);