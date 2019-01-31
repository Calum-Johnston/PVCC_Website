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


//load facilities
$(function(){    
    $("#facilities .request-result").html(" ");
    $.post("/db", function(data){
        //alert(data);
        for (i = 0; i < data.length; i++){
            $("#facilities .request-result").append('<div class="col-12 col-md-4 mb-4"><div class="card"><img class="card-img-top" src="img/'+data[i].roomImage+'" alt="Card image cap"><div class="card-body"><h5 class="card-title">'+data[i].roomName+'</h5><p class="card-text">'+data[i].roomDescription.substring(0,data[i].roomDescription.lastIndexOf(" ",120))+'...</p><a href="#" class="btn btn-primary">Go somewhere</a></div></div></div>')
        
        }
        

    });
});