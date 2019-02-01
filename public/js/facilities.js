//load facilities
$(function(){    
    loadFacilities();
});

//get and display full range of facilities
function loadFacilities(){
    $.get("/facilities", function(data){
        $("#facilities .request-result").html(" ");
        //alert(data);
        for (i = 0; i < data.length; i++){
            if (data[i] == undefined){
                break
            }
            
            var roomId = data[i].roomId
            var imagePath = data[i].roomImage
            var roomName = data[i].roomName
            var roomDescription = data[i].roomDescription
            var roomId = data[i].roomId
            
            //Change path to filler image if none is assigned and provide full path if it is
            if (imagePath == ""){
                imagePath = "facilities/room.jpg"
            } else {
                imagePath = "facilities/" + imagePath
            }
            
            //convert room description into a preview of the description text of 120 characters to the nearest word.
            roomDescription = roomDescription.substring(0,roomDescription.lastIndexOf(" ",120)) + "..."
            
            $('<div class="col-12 col-md-6 col-lg-4 mb-4"><div class="card"><img class="card-img-top" src="img/'+imagePath+'" alt="Card image cap"><div class="card-body"><h5 class="card-title">'+roomName+'</h5><p class="card-text">'+roomDescription+'</p><a id="'+roomId+'" class="btn btn-primary facilityLink">Go somewhere</a></div></div></div>').hide().appendTo("#facilities .request-result").fadeIn()
        
        }
        

    });
    
}

//load individual facility onto the screenn for the user.
$("#facilities .request-result").on("click", ".facilityLink", function(){
    var facilityId = $(this).attr("id")
    $.get("/facilities/"+facilityId, function(data){
        var roomId = data[0].roomId
        var imagePath = data[0].roomImage
        var roomName = data[0].roomName
        var roomDescription = data[0].roomDescription
        var roomId = data[0].roomId
        
        //Change path to filler image if none is assigned and provide full path if it is
        if (imagePath == ""){
            imagePath = "img/facilities/room.jpg"
        } else {
            imagePath = "img/facilities/" + imagePath
        }
        
        $("#facilities .request-result").html(" ");
        $("<img class='col-6' src=" + imagePath + " />").hide().appendTo("#facilities .request-result").fadeIn()
        $("<div class='col-6'><h2>" + roomName + "</h2><p>" + roomDescription + "</p></div>").hide().appendTo("#facilities .request-result").fadeIn()
    
        
        $('<button type="button" class="btn btn-primary" id="goBack">Go Back</button>').hide().appendTo("#facilities .request-result div").fadeIn()

    });
});

$("#facilities .request-result").on("click", "#goBack", function(){
    loadFacilities()
});



