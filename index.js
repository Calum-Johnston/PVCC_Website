"use strict";
var express = require('express');
var app = express();

var mysql = require("mysql");

app.use(express.static('public'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))

//database connection
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
    console.log("Connected to dataase");
})
global.con = con;

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

//load a list of all activities
app.get("/activities", function(req, resp){
       con.query("SELECT * FROM activites", function (err, result, fields) {
        if (err) throw err;
        resp.send(result);
      }); 
})

//return information about a given activity by ID
app.get("/activities/:id", function(req, resp){
    var activityId = req.params.id
    if (activityId != "undefined"){        
            con.query("SELECT * FROM activites WHERE activityId="+activityId, function (err, result, fields) {
              if (err) throw err;
              resp.send(result);
          });
    }   
})

 


const port=1010
module.exports = app.listen(port);

