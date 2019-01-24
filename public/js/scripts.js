//carousel controls

$(".carousel-control-next").on("click", function(){
    $('.carousel').carousel('next');
});
$(".carousel-control-prev").on("click", function(){
    $('.carousel').carousel('prev');
 });

//load header and footer
$(function(){
    $("body").prepend("<div id='header'></div>");
    $("body").append("<div id='footer'></div>");
  $("#header").load("includes/header.html"); 
  $("#footer").load("includes/footer.html"); 
});

//calendar functions

$('#calendar').fullCalendar({
    columnFormat: 'ddd D/M',
    defaultView: 'agendaWeek',
    height: 440,
    contentHeight:420,
    header: {
        left: 'title',
        right: 'prev,next today '
    },

    titleFormat: '[Room]',
    allDaySlot: false,
    businessHours:
        {
                start: '08:00',
                end:   '22:30',
                dow: [ 0, 1, 2, 3, 4, 5, 6]
        },
    events: {
        url: "http://127.0.0.1:1010/events",
    },
    eventBackgroundColor: "rgb(255, 201, 45)",
    eventTextColor: "black",
    eventBorderColor:"rgb(255, 201, 45)"
});

