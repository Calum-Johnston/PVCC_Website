/*###############################
######Booking form stuff#########
###############################*/

"use strict";
/* jshint -W097 */
/* jshint esversion: 6 */
/* jshint node: true */
/* jshint browser: true */
/* jshint jquery: true */
/* jshint devel: true */

// Variable stores price
var totalCost = 0;

$(document).ready(function(){

  // disable end-time and hide errors and price by default
  $("#end-time").attr("disabled", 'disabled');
  $(".error").hide();
  $("#div-price").hide();
  $("#paypal-label").hide();
  $('#paypal-button-container').hide();
  $("#edit-details").hide();
  $("#room-label").hide();

  // loading the event types into dropdown box and dynamically selecting rooms when an event is selected
  $.getJSON('/eventrooms', function(data){

    $.each(data, function(key, value){
      $("#dropdownList").append('<li class="event"><a href="#">' + value.eventName + '</a></li>');
    });

    $(".event").on('click', function(e){

      // Resets price
      totalCost = 0;

      e.preventDefault();

      // hide and reset price when selecting new event
      $("#div-price").hide();
      $("#show-price").text("");

      $("#submitButton").removeClass('disabled');

      // showing value of chosen event on dropdown button
      $("#dropdownMenuButton").html($(this).text() + "&nbsp;" + "<span class='caret'></span>");

      // Matching events to rooms
      const value = $(this).text();
      outputRooms(value);
      $("#room-label").show();
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

    $(this).on('input', function(){
      // reset the price
      $("#show-price").text("");
      $("#div-price").hide(500);

      $('.event-button').each(function(i, obj) {
        $(this).removeClass('active');
        totalCost = 0;
      });
    });
  });


  $("#end-time").on('click', function(){
    $("#time-error").hide(500);
    $("#submitButton").removeClass('disabled');

    $(this).on('input', function(){
      // reset the price
      $("#show-price").text("");
      $("#div-price").hide(500);

      $('.event-button').each(function(i, obj) {
        $(this).removeClass('active');
        totalCost = 0;
      });
    });
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
              var price = value.price;

              // if clicked, make active and vice versa; add rooms to selection box
              if ($("#" + id).hasClass('active')){
                // unselected
                $("#" + id).removeClass('active');
                $('#room-selection').val(textData.replace(($("#" + id).text() + ","), ""));

                // now subtract current from original
                totalCost -= price;
                if (totalCost < 1){
                  $("#div-price").hide(500);
                }
                else {
                  if (price.toString().length > 2){
                    totalCost = Math.round(totalCost) - 0.01;
                  }
                  else {
                    totalCost = totalCost - 0.01;
                  }
                  $("#show-price").text("£" + totalCost);
                }
              }
              else {
                // selected
                $("#" + id).addClass('active');

                const time = getEndTime() - getStartTime();

                price = price * time;
                totalCost += price;

                // add price to original price
                if (totalCost < 1){
                  $("#show-price").append(Math.round(totalCost * time) - 0.01);
                }
                else {
                  totalCost = Math.round(totalCost) - 0.01;
                  $("#show-price").text("£" + totalCost);
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

  $("#edit-details").on('click', function(){
    // enable all input fields again, remove paypal buttons and show check for avaliability button
    $(".input-type").prop("disabled", false);
    $(".event-button").prop("disabled", false);
    $("#edit-details").hide(500);
    $("#paypal-label").hide(500);
    $("#paypal-button-container").hide(500);
    $('#submitButton').show(500);
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
      $('#submitButton').hide();
      $(".input-type").prop("disabled", true);
      $(".event-button").prop("disabled", true);
      $("#div-captcha").remove();
      $("#edit-details").show(500);
      $("#paypal-label").show(500);
      $("#paypal-button-container").show(500);
    }
    return false;
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
      "private": $("#private").prop("checked"), //returns if yes tickbox is ticked
      "rooms": $('#room-selection').val(),
      "price": parseFloat(($("#show-price").text()).substring(1, ($("#show-price").text()).length)) //returns total price, formatted as a float
    }),
    contentType:"application/json; charset=utf-8",
    dataType:"json",
    success: function(data){
      if(data.response === true){
        window.location.replace("/bookingConfirmation.html");
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

/* ##########################
##PAYMENT STUFF##
###########################*/

paypal.Buttons({
  createOrder: function(data, actions){
    // Set up the transaction
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: totalCost
        }
      }]
    });
  },
  onApprove: function(data, actions){
    // Capture the funds from the transaction
    return actions.order.capture().then(function(details){
      alert('Transaction completed by ' + details.payer.name.given_name);
      postEvent();
    });
  },
  onError: function(error){
    console.log('Invalid Payment' + error);
    postEvent();
  }
}).render('#paypal-button-container');
