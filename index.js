"use strict";
var express = require('express');
var app = express();

var mysql = require("mysql");

app.use(express.static('public'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))


app.post("/db", function(req, resp){
    var con = mysql.createConnection({
      host: "localhost",
      user: "web-admin",
      password: "password",
        database: "pvcc"
    });

    con.connect(function(err) {
      if (err) throw err;
       con.query("SELECT * FROM rooms", function (err, result, fields) {
        if (err) throw err;
        resp.send(result);
      });
    });
    
})

 


const port=1010
module.exports = app.listen(port);

