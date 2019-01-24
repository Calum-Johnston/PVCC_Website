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