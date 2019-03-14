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

//load header and footer
$(function(){
    $("body").prepend("<div id='header'></div>");
    $("body").append("<div id='filler'></div>");
    $("body").append("<div id='footer'></div>");
    $("#header").load("includes/header.html", function(){
        $("#footer").load("includes/footer.html", function(){
            var currentHeight = $("html").height();
            var windowHeight = $(window).height();
            var difference = windowHeight - currentHeight;
            if (difference > 0){
                $('#filler').css("min-height", difference);
            }
        });
    });


});

//carousel controls
$(".carousel-control-next").on("click", function(){
    $('.carousel').carousel('next');
});
$(".carousel-control-prev").on("click", function(){
    $('.carousel').carousel('prev');
 });
