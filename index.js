"use strict";
var express = require('express');
var app = express();
app.use(express.static('public'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))



app.listen(1010);