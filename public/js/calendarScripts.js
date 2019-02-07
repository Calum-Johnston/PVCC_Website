/* #########################################
##########Full calendar javascript##########
###Made by Tom, added by Peter 31/01/2019###
###########################################*/

$( document ).ready(function() {
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
            url: "http://127.0.0.1:1010/events/astroturf",
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

var nameDict = {"astro-turf" : "Astro Turf", "football-pitch" : "Football Pitch", "performing-arts" : "Performing Arts", "theatre" : "Theatre", "it-suite" : "IT Suite", "class-room" : "Class Room", "dining-hall" : "Dining Hall" }

$(document).on('click', '.dropdown-item', function() {
    changeRooms(nameDict[$(this).attr('id')]);
})
