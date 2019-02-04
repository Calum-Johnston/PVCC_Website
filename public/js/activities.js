//load activities
$(function(){    
    //if there is not url parameter present, load all the facilites on page load, oterwie, load the specific parameter
    console.log($.urlParam("id"))
    if ($.urlParam("id") == null || $.urlParam("id") == 0){
        loadActivities();
    } else {
        loadActivity($.urlParam("id"))
    }
});

function loadActivity(activityId){
        $.get("/activities/"+activityId, function(data){
        var activityId = data[0].activityId
        var imagePath = data[0].activityImage
        var activityName = data[0].activityName
        var activityDescription = data[0].activityDescription
        
        //Change path to filler image if none is assigned and provide full path if it is
        //***apply undefined condition to other parts of site
        if (imagePath == "" || imagePath == undefined){
            imagePath = "img/activities/room.jpg"
        } else {
            imagePath = "img/activities/" + imagePath
        }
        
        $("#activities .request-result").html(" ");
        $("<img class='col-6' src=" + imagePath + " />").hide().appendTo("#activities .request-result").fadeIn()
        $("<div class='col-6 activityDescription'><h2>" + activityName + "</h2><p>" + activityDescription + "</p></div>").hide().appendTo("#activities .request-result").fadeIn()
        
        
        $('<div class="fb-share-button" data-href="http://127.0.0.1:1010/activities.html?id=2" data-layout="button" data-size="large" data-mobile-iframe="true"><a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2F127.0.0.1%3A1010%2Factivities.html%3Fid%3D' + activityId + '&amp;src=sdkpreparse" class="fb-xfbml-parse-ignore">Share</a></div>').hide().appendTo("#activities .request-result .activityDescription").fadeIn()


    });
    
}

//get and display full range of activities
function loadActivities(){
    $.get("/activities", function(data){
        $("#activities .request-result").html(" ");
        //alert(data);
        for (i = 0; i < data.length; i++){
            if (data[i] == undefined){
                break
            }
            
            var activityId = data[i].activityId
            var imagePath = data[i].activityImage
            var activityName = data[i].activityName
            var activityDescription = data[i].activityDescription
            var activityId = data[i].activityId
            
            //Change path to filler image if none is assigned and provide full path if it is
            if (imagePath == ""){
                imagePath = "img/activities/room.jpg"
            } else {
                imagePath = "img/activities/" + imagePath
            }
            
            //convert room description into a preview of the description text of 120 characters to the nearest word.
            activityDescription = activityDescription.substring(0,activityDescription.lastIndexOf(" ",120)) + "..."
            
            $('<div class="col-12 col-md-6 col-lg-4 mb-4"><div class="card"><img class="card-img-top" src="'+imagePath+'" alt="Card image cap"><div class="card-body"><h5 class="card-title">'+activityName+'</h5><p class="card-text">'+activityDescription+'</p><a id="'+activityId+'" class="btn btn-primary activityLink text-white">See Full Description</a></div></div></div>').hide().appendTo("#activities .request-result").fadeIn()
        
        }
        

    });
    
}

//load individual activity onto the screenn for the user.
$("#activities .request-result").on("click", ".activityLink", function(){
    var activityId = $(this).attr("id")
    loadActivity(activityId)
});

$("#activities .request-result").on("click", "#goBack", function(){
    loadActivities()
});



