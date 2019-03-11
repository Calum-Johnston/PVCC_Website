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
    var results = new RegExp('[\?&]' + name + '=([^[?|?]]*)').exec(window.location.href);
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

/*###########################
######Back end STUFF#########
############################*/

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

      $("#room-empty").hide(500);
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

  $("#start-time").on('input', function(){
    recalculatePrice();
  });

  $("#end-time").on('click', function(){
    $("#time-error").hide(500);
    $("#submitButton").removeClass('disabled');

    const originalTime = getEndTime();
    $("#end-time").on('input', function(){
      const newTime = getEndTime();
      if (newTime - originalTime > 0){
        recalculatePrice("higher");
      }
      else{
        recalculatePrice("lower");
      }
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

  function recalculatePrice(difference){

    let time = getEndTime() - getStartTime();
    if (time > 0){
      if ($("#div-price").is(":visible")){
        $("#show-price").show(500);
        let price = $("#show-price").text();
        price = price.substring(1, price.length);
        price = parseFloat(price);
        if (difference == "higher"){
          price = price * time;
          price = Math.round(price) - 0.01;
        }
        else {
          console.log("what now?");
        }
        $("#show-price").text("£" + price);
      }
    }
    else{
      $("#show-price").hide(500);
    }
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
          return false;
        }
      });

      $(".event-button").on('click', function(){

        const id = $(this).attr('id');
        // getting the price of the room
        let textData = $('#room-selection').val();
        const roomName = $(this).text();

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

  $(".event-button").on('click', function(){
    if ($("#room-selection").val() != ""){
      $("#room-empty").hide(500);
      $("#submitButton").removeClass('disabled');
    }
  });

  $("#bookingform").on('submit', function(e){

    var bookingValid = true;
    // show error if booking form rooms box is empty
    if ($("#room-selection").val() == ""){
      e.preventDefault();
      $("#room-empty").show(500);
      $("#submitButton").addClass('disabled');
      bookingValid = false;
    }
    else{
      $("#room-empty").hide(500);
      $("#submitButton").removeClass('disabled');
    }

    // make sure booking is at least one hour long
    const startTime = getStartTime();
    const endTime = getEndTime();

    let bookingLength = endTime - startTime;
    if (bookingLength < 1){
      bookingValid = false;
      e.preventDefault();
      $("#time-error").show(500);
      $("#submitButton").addClass('disabled');
    }

    if (bookingValid){
      postEvent();
    }

    return false;

  });
});



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
      "private": $("#private").prop("checked"), // not sure about this
      "rooms": $('#room-selection').val(),
      "price": parseFloat(($("#show-price").text()).substring(1, ($("#show-price").text()).length)) // not sure if this works
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
