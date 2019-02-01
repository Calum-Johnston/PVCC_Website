//load facilities
$(function(){    
    $.get("/facilities", function(data){
        $("#facilities .request-result").html(" ");
        //alert(data);
        for (i = 0; i < 3; i++){
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
            
            
            $("#facilities .request-result").append('<div class="col-12 col-md-6 col-lg-4 mb-4"><div class="card text-white"><img class="card-img-top" src="img/'+imagePath+'" alt="Card image cap"><div class="card-img-overlay"><h5 class="card-title">'+roomName+'</h5><p class="card-text">'+roomDescription+'</p><a href="#" class="btn btn-primary">Read More</a></div></div></div>')
        
        }
        

    });
    
    //load what's on  
    $.get("/classes", function(data){
        $("#classes .request-result").html(" ");
        //alert(data);
        for (i = 0; i < 3; i++){
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


            $("#facilities .request-result").append('<div class="col-12 col-md-6 col-lg-4 mb-4"><div class="card"><img class="card-img-top" src="img/'+imagePath+'" alt="Card image cap"><div class="card-body"><h5 class="card-title">'+roomName+'</h5><p class="card-text">'+roomDescription+'</p><a href="#" class="btn btn-primary">Go somewhere</a></div></div></div>')

        }


    });
});
