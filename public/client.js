function remove(element){
    element.parentNode.removeChild(element);
}

window.onload= function(){

    var socket = io('thegameofthings.herokuapp.com',{'forceNew':true}), 
        host = document.getElementById("host-a-thing"),
        join = document.getElementById("submit-id"), //probably not needed anymore
        hostscreen = false;

    host.addEventListener("click", function(){
        socket.emit('createGame', {
            
        });
        console.log("new game registered");
    });

    document.getElementById("submit-thing-id").addEventListener("click", function(){
        document.getElementById("thing-id-input-box").style.display = "none";
        document.getElementById("submit-thing-id").style.display = "none";
        document.getElementById("username-input-box").style.display = "block";
        document.getElementById("submit-username").style.display = "inline-block";
        document.getElementById("host-a-thing").style.display = "none";
    });

    socket.on('reloadCheck', function(){
        var thingid = document.getElementById("thing-id-input-box").value,
            username = document.getElementById("username-input-box").value;

        console.log('reloadCheck')
        if(thingid.length!=0&&username.length!=0){
            socket.emit('joinGame', {
                room: thingid,
                username: username
            });
        }
        
    })

    document.getElementById("submit-username").addEventListener("click", function(){
        var thingid = document.getElementById("thing-id-input-box").value;
        socket.emit('joinGame', {
            room: thingid,
            username: document.getElementById("username-input-box").value
        });
        document.getElementById("join-card").style.display = "none";
    });

    socket.on('newGame', function(data){
        document.getElementById("thing-id-input-box").style.display = "none";
        document.getElementById("submit-thing-id").style.display = "none";
        document.getElementById("host-a-thing").style.display = "none";
        document.getElementById("title").innerHTML = data.game;
        document.getElementById("explainer").style.display = "block";
        document.getElementById("explainer").innerHTML = "to join enter the thing-id above and a username";
        document.getElementById("start-game").style.display = "inline-block";
        document.getElementById("players").style.display = "flex";
        hostscreen = true;
    });

    socket.on('err', function(data){
        alert(data.msg);
    });

    socket.on('newUser', function(data){
        //alert(data.username + " joined");
        document.getElementById("players").innerHTML += "<div>" + data.username + "</div>";
    });

    document.getElementById("start-game").addEventListener("click", function(){
        socket.emit('startGame', {
            room: document.getElementById("title").innerHTML
        });
        document.getElementById("join-card").style.display = "none";
    });

    document.getElementById("newthing").addEventListener("click", function(){
        socket.emit('startGame', {
            room: document.getElementById("title").innerHTML
        });
        document.getElementById("join-card").style.display = "none";
    });

    socket.on('newThing', function(data){
        if (hostscreen){
            document.getElementById("hostscreen").style.display = "block";
            document.getElementById("hostthing").innerHTML = data.thing;
        } else{
            document.getElementById("playerscreen").style.display = "block";
            document.getElementById("playerresponseinputbox").value = "";
        }
    });

    document.getElementById("submitresponse").addEventListener("click", function(){
        socket.emit('receiveResponse', {
            response: document.getElementById("playerresponseinputbox").value,
            room: document.getElementById("thing-id-input-box").value
        });
        document.getElementById("playerscreen").style.display = "none";
        document.getElementById("playerresponsecount").style.display = "block";
    });

    socket.on('responsecount', function(data){
        if (data.count == 1){
            document.getElementById("playerresponsecount").innerHTML = data.count + ' thing received';
        } else{
            document.getElementById("playerresponsecount").innerHTML = data.count + ' things received';
        }
        
    });

    socket.on('displayresponses', function(data){
        var responses = data.shuffled;
        document.getElementById("playerresponsecount").style.display = "none";
        console.log(responses);
        for (i = 0; i < responses.length; i++){
            document.getElementById("flex-container-host").innerHTML += "<div onclick='remove(this);'>"+ responses[i]+"</div>";
        }
    });

    document.getElementById("revealresponses").addEventListener("click", function(){
        socket.emit('revealresponses', {
            room: document.getElementById("title").innerHTML
        });
    });
};
