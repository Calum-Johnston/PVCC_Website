"use strict";
/* jshint -W097 */
/* jshint esversion: 6 */
/* jshint node: true */
/* jshint browser: true */
/* jshint jquery: true */
/* jshint devel: true */
//sam stuff

//from sitepoint || src: https://www.sitepoint.com/url-parameters-jquery/
$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^[?|?]*]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
};
//end

//carousel controls

//load header and footer
$(function(){
    $("body").prepend("<div id='header'></div>");
    $("body").append("<div id='footer'></div>");
    $("#header").load("includes/header.html");
    $("#footer").load("includes/footer.html");
});

//carousel controls
$(".carousel-control-next").on("click", function(){
    $('.carousel').carousel('next');
});
$(".carousel-control-prev").on("click", function(){
    $('.carousel').carousel('prev');
 });

/*###############################
######Booking form stuff#########
###############################*/

$(document).ready(function(){

  // disable end-time and hide errors and price by default
  $("#end-time").attr("disabled", 'disabled');
  $(".error").hide();
  $("#div-price").hide();

  // loading the event types into dropdown box and dynamically selecting rooms when an event is selected
  $.getJSON('/eventrooms', function(data){

    $.each(data, function(key, value){
      $("#dropdownList").append('<li class="event"><a href="#">' + value.eventName + '</a></li>');
    });

    $(".event").on('click', function(e){
      e.preventDefault();

      // hide and reset price when selecting new event
      $("#div-price").hide();
      $("#show-price").text("£");

      $("#submitButton").removeClass('disabled');

      // showing value of chosen event on dropdown button
      $("#dropdownMenuButton").html($(this).text() + "&nbsp;" + "<span class='caret'></span>");

      // Matching events to rooms
      const value = $(this).text();
      outputRooms(value);
    });
  });

  $("#start-time").on('click', function(){
    $("#time-error").hide(500);
    $("#submitButton").removeClass('disabled');

    let date = new Date($("#date").val());
    let day = date.getDay();

    if (day == 0 || day == 6){
      // date selected is a weekend - open 8AM to 9PM
      $("#start-time").attr({
        "min": "08:00"
      });
    }
    else{
      // date selected is a weekday - open 4PM to 9PM
      $("#start-time").attr({
        "min": "16:00"
      });
    }
    $("#end-time").removeAttr("disabled");
  });


  $("#end-time").on('click', function(){
    $("#time-error").hide(500);
    $("#submitButton").removeClass('disabled');
    });
  });

  function getStartTime(){
    let startTime = $("#start-time").val();
    const startHour = parseInt(startTime.substring(0, 2));
    const startMinute = parseInt(startTime.substring(3, 5));
    startTime = startHour + (startMinute/60);
    return startTime;
  }

  function getEndTime(){
    let endTime = $("#end-time").val();
    let endHour = parseInt(endTime.substring(0, 2));
    let endMinute = parseInt(endTime.substring(3, 5));
    endTime = endHour + (endMinute/60);
    return endTime;
  }


  // disabling and enabling checkboxes
  $("#public").on('click', function(){
    if ($(this).prop("checked")){
      $("#private").attr("disabled", true);
    }
    else {
      $("#private").removeAttr("disabled");
    }
  });
  $("#private").on('click', function(){
    if ($(this).prop("checked")){
      $("#public").attr("disabled", true);
    }
    else {
      $("#public").removeAttr("disabled");
    }
  });

  function outputRooms(eventType){

    // removing everything from previous options
    $(".event-button").remove();
    $('#room-selection').val("");

    // outputting the rooms according to event type
    $.getJSON('/eventrooms', function(data){
      $.each(data, function(key, value){
        if (eventType == value.eventName){
          // found match - now output rooms
          $.each(value.rooms, function(key2, value2){
            $("<button type='button' class='btn btn-warning event-button' id='" + value2.roomId + "'>" + value2.roomName + "</button>").appendTo("#roomList");
          });
          $("#room-empty").remove();
          return false;
        }
      });

      $(".event-button").on('click', function(){

        const id = $(this).attr('id');
        // getting the price of the room
        let textData = $('#room-selection').val();
        const roomName = $(this).text();
        $("#room-empty").hide(500);

        $.getJSON('/roomprices', function(data){
          $.each(data, function(key, value){
            if (roomName == key){
              let price = value.price;
              let originalPrice = $("#show-price").text(); // price before newly clicked room added

              if (originalPrice == "£"){
                originalPrice = 0;
              }
              else {
                // remove pound sign and convert to int
                originalPrice = originalPrice.substring(1, originalPrice.length);
                originalPrice = parseFloat(originalPrice);
              }

              // if clicked, make active and vice versa; add rooms to selection box
              if ($("#" + id).hasClass('active')){
                // unselected
                $("#" + id).removeClass('active');
                $('#room-selection').val(textData.replace(($("#" + id).text() + ","), ""));

                // now subtract current from original
                price = originalPrice - price;
                if (price < 1){
                  $("#div-price").hide(500);
                  price = 0;
                  originalPrice = 0;
                  $("#show-price").text("£");
                }
                else {
                  if (price.toString().length > 2){
                    price = Math.round(price) - 0.01;
                  }
                  else {
                    price = price - 0.01;
                  }
                  $("#show-price").text("£" + price);
                }
              }
              else {
                // selected
                $("#" + id).addClass('active');

                const time = getEndTime() - getStartTime();

                // add price to original price
                if (originalPrice < 1){
                  $("#show-price").append(Math.round(price * time) - 0.01);
                }
                else {
                  price = price * time;
                  price = originalPrice + price;
                  price = Math.round(price) - 0.01;
                  $("#show-price").text("£" + price);
                }
                $("#div-price").show(500);

                if (textData){
                  $('#room-selection').val(textData + $("#" + id).text() + ", ");
                }
                else{
                  $('#room-selection').val($("#" + id).text() + ", ");
                }
              }
              return false;
            }
          });
        });
      });
    });
  }

  // validating the form inputs
  $("#name").on('input', function(){
    let input = $(this);
    let regex = /^[a-zA-Z ,.'-]+$/;
    let name = regex.test(input.val());
    if(!name){
      if (input.val() == ""){
        $("#name-empty").show(500);
      }
      else{
        $("#name-error").show(500);
      }
      $("#submitButton").addClass('disabled');
    }
    else{
      $("#name-empty").hide(500);
      $("#name-error").hide(500);
      $("#submitButton").removeClass('disabled');
    }
  });

  $("#phone").on('input', function(){
    let input = $(this);
    let regex = /^[0-9-]*$/;
    let phone = regex.test(input.val());
    if (!phone){
      $("#phone-error").show(500);
      $("#submitButton").addClass('disabled');
    }
    else{
      $("#phone-error").hide(500);
      $("#submitButton").removeClass('disabled');
    }
  });

  $("#dropdownMenuButton").on('click', function(){
    $("#room-empty").remove();
  });

  $("#bookingform").on('submit', function(e){

    var bookingValid = false;
    // show error if no rooms selected
    $('.event-button').each(function(i, obj) {
        if ($(this).hasClass('active')){
          bookingValid = true;
          return false;
        }
    });

    if (!bookingValid){
      console.log("invalid");
      e.preventDefault();
      if ($("#room-empty").length){
        $("#room-empty").show(500);
      }
      else{
        $("<span class='error' id='room-empty'>A room must be selected</span>").appendTo("#roomList");
        $("#room-empty").show(500);
      }
      return false;
    }

    // make sure booking is at least one hour long
    const startTime = getStartTime();
    const endTime = getEndTime();

    let bookingLength = endTime - startTime;
    if (bookingLength < 1){
      e.preventDefault();
      $("#time-error").show(500);
      $("#submitButton").addClass('disabled');
    }
    else{
      bookingValid = true;
    }

    if (bookingValid){
      postEvent();
    }
    return false;
});

var price = parseFloat(($("#show-price").text()).substring(1, ($("#show-price").text()).length));

/* ##########################
##Google Calendar API Stuff##
###########################*/

function postEvent(){
  $.ajax({
    type:"POST",
    url: "http://127.0.0.1:1010/events",
    data: JSON.stringify({
      "name": $('#name').val(),
      "email": $('#emailaddress').val(),
      "telephone": $('#phone').val(),
      "title": $('#title').val(),
      "description": $("#description").val(),
      "date": $('#date').val(),
      "timeFrom": $('#start-time').val(),
      "timeUntil": $('#end-time').val(),
      "private": $("#private").prop("checked"), //returns if yes tickbox is ticked
      "rooms": $('#room-selection').val(),
      "price": parseFloat(($("#show-price").text()).substring(1, ($("#show-price").text()).length)) //returns total price, formatted as a float
    }),
    contentType:"application/json; charset=utf-8",
    dataType:"json",
    success: function(data){
      if(data.response === true){
        alert("Booking created!");
      }
      else{
        alert("Clash detected, booking not made.");
      }
    },
    error: function(){
      alert("Booking not made, ensure all data has been enterted correctly.");
    }
  });
  return false;
}
