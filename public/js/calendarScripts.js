/* #########################################
##########Full calendar javascript##########
###Made by Tom, added by Peter 31/01/2019###
###########################################*/
var nameDict = {}

$( document ).ready(function() {

    $.get("/facilities", function(data){

      $('#dropdown-menu').html(" ");

      for (i = 0; i < data.length; i++){
        if (data[i] == "undefined"){
          alert("Data incorrectly loaded");
          break;
        }else{

          var roomID = data[i].roomId.toString();
          var roomName = data[i].roomName;
          var roomType = data[i].roomType;

          nameDict[roomID] = roomName;


          //select based on room type in row
          switch(roomType){
            case "sports":
              $('<a class="dropdown-item" id="' + roomID +'">' + roomName +'</a>').appendTo("#dropdown-menu .sportsDropDown");
              break;
            case "technology":
              $('<a class="dropdown-item" id="' + roomID +'">' + roomName +'</a>').appendTo("#dropdown-menu .techDropDown");
              break;
            case "arts":
              $('<a class="dropdown-item" id="' + roomID +'">' + roomName +'</a>').appendTo("#dropdown-menu .artsDropDown");
              break;
            case "misc":
              $('<a class="dropdown-item" id="' + roomID +'">' + roomName +'</a>').appendTo("#dropdown-menu .miscDropDown");
              break;
            default:
              alert("No valid room type found");
          }
        }
      }
      console.log(nameDict);


    })


    $('#calendar').fullCalendar({
        columnFormat: 'ddd D/M',
        defaultView: 'agendaWeek',
        height: 600,
        contentHeight:600,
        scrollTime: '10:00:00',
        header: {
            left: 'title',
            right: 'prev,next today '
        },
        eventClick: function(calEvent, jsEvent, view) {
            location.replace("/activities.html");
        },

        titleFormat: '[]',
        allDaySlot: false,
        businessHours:
            {
                    start: '10:00',
                    end:   '22:00',
                    dow: [ 0, 1, 2, 3, 4, 5, 6]
            },
        events: {
            url: "http://127.0.0.1:1010/events/1",
        },
        eventBackgroundColor: "rgb(255, 201, 45)",
        eventTextColor: "black",
        eventBorderColor:"rgb(255, 201, 45)"
    })
    var bookBtn = $('#book-btn')
    $('.fc-right').append(bookBtn);
    var calendarTitle = $('#calendar-title')
    $('.fc-left').append(calendarTitle);
})

function changeRooms(room) {
    var prevRoom = $('.fc-left h3').text();
    $(".fc-left h3").html(room);
    prevRoom = prevRoom.toLowerCase();
    prevRoom = prevRoom.replace(/\s/g, '');
    room = room.toLowerCase();
    room = room.replace(/\s/g, '');
    var removeSource = 'http://127.0.0.1:1010/events/' + prevRoom;
    var newSource = 'http://127.0.0.1:1010/events/' + room;
    $('#calendar').fullCalendar( 'removeEventSource', removeSource )
    $("#calendar").fullCalendar('addEventSource', newSource);
    $('#calendar').fullCalendar( 'refetchEvents' );
}

$(document).on('click', '.dropdown-item', function() {
    changeRooms(nameDict[$(this).attr('id')]);
})
