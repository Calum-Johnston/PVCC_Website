"use strict";
var express = require('express');
var app = express();

var mysql = require("mysql");

app.use(express.static('public'));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))

//connect to the database
function dbconnect(){
    var con = mysql.createConnection({
      host: "localhost",
      user: "web-admin",
      password: "password",
        database: "pvcc"
    });
    
    return con
}

//load a list of all the facilities.
app.get("/facilities", function(req, resp){
    var con = dbconnect()

    //var facility = req.query.facilityId)
    
    con.connect(function(err) {
      if (err) throw err;
       con.query("SELECT * FROM rooms", function (err, result, fields) {
        if (err) throw err;
        resp.send(result);
      });
    });
    
})

//return infomration about a given facility
app.get("/facilities/:id", function(req, resp){
    var con = dbconnect()

    var roomId = req.params.id
    console.log(roomId)

    
    if (roomId != "undefined"){
        con.connect(function(err) {
          if (err) throw err;            
            con.query("SELECT * FROM rooms WHERE roomId="+roomId, function (err, result, fields) {
              if (err) throw err;
              resp.send(result);
          });
            
        });       
    }
     
})

 


const port=1010
module.exports = app.listen(port);

