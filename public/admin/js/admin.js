//load facilities
$(function(){  
    
    

    //load drop down of options
    $.get("/activities", function(data){
        //alert(data);
        for (i = 0; i < data.length; i++){
            if (data[i] == undefined){
                break
            }

            var activityId = data[i].activityId
            var imagePath = data[i].activityImage
            var activityName = data[i].activityName
            var activityDescription = data[i].activityDescription

            //Change path to filler image if none is assigned and provide full path if it is
            if (imagePath == ""){
                imagePath = "img/activities/activity.jpg"
            } else {
                imagePath = "img/activities/" + imagePath
            }

            $("#activitiesDropdown").append('<a class="dropdown-item" data-name="' + activityId + '" href="#">' + activityName + '</a>')

        }


    });
    
    
    $('#activitiesForm').on('click', '.dropdown-item', function() {
        if($(this).attr("data-name") != 0){

            $.get('/activities/'+$(this).attr("data-name"), function(data){

                var activityId = data[0].activityId
                var imagePath = data[0].activityImage
                var activityName = data[0].activityName
                var activityDescription = data[0].activityDescription


                //alert(data)
                $('#id').val(activityId)
                $('#name').val(activityName)
                $('#description').val(activityDescription)
                $('#imagePath').val(imagePath)


            })
        } else {
            $('#id').val("0")
            $('#name').val("New Event")
            $('#imagePath').val("")
            $('#description').val("Activity Description")
        }

        $('#activityDetails').removeClass('d-none')
    });
    
    
    $('.form').on('submit', function(){
        return confirm("Are you sure you want to make this submission? The information you have entered will be displayed on the website.")
    })

    
    
    
        
     //load drop down of options
    $.get("/facilities", function(data){
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
                imagePath = "img/facilities/activity.jpg"
            } else {
                imagePath = "img/facilities/" + imagePath
            }

            $("#facilitiesDropdown").append('<a class="dropdown-item" data-name="' + roomId + '" href="#">' + roomName + '</a>')

        }


    });
    
    
        $('#facilitiesForm').on('click', '.dropdown-item', function() {
        if($(this).attr("data-name") != 0){

            $.get('/facilities/'+$(this).attr("data-name"), function(data){
                
               var roomId = data[0].roomId
                var imagePath = data[0].roomImage
                var roomName = data[0].roomName
                var roomDescription = data[0].roomDescription
                var roomId = data[0].roomId
                var roomPrice = data[0].price
                var roomType = data[0].roomType

                
                //alert(data)
                $('#id').val(roomId)
                $('#name').val(roomName)
                $('#description').val(roomDescription)
                 $('#roomPrice').val(roomPrice)
                 $('#roomType').val(roomType)


            })
        } else {
            $('#id').val("0")
            $('#name').val("New Event")
            $('#imagePath').val("")
            $('#description').val("Activity Description")
        }

        $('#facilityDetails').removeClass('d-none')
    });
    
    
    $('.form').on('submit', function(){
        return confirm("Are you sure you want to make this submission? The information you have entered will be displayed on the website.")
    })
    
    $('#adminLoginForm').on('submit', function(){        
        $.post("/login", {password: $("#adminKey").val()}, function(data) {
              var d = new Date();
              d.setTime(d.getTime() + 30*60*1000);
              var expires = "expires="+ d.toUTCString();
              document.cookie = "adminToken=" + data + ";" + expires + ";path=/admin";
                console.log(document.cookie)
            });
        return false;
    });
    
    
    


});




