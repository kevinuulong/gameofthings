function remove(element){
    element.parentNode.removeChild(element);
}

window.onload= function(){

    var socket = io('thegameofthings.herokuapp.com',{'forceNew':true}), 
        host = document.getElementById("hostthing"),
        join = document.getElementById("join-button"),
        hostscreen = false;

    host.addEventListener("click", function(){
        socket.emit('createGame', {
            
        });
        console.log("new game registered");
    });

    join.addEventListener("click", function(){
        document.getElementById("join-screen").style.display = "none";
    });

    socket.on('reloadCheck', function(){
        var thingid = document.getElementById("thing-id").value,
            username = document.getElementById("username").value;

        console.log('reloadCheck')
        if(thingid.length!=0&&username.length!=0){
            socket.emit('joinGame', {
                room: thingid,
                username: username
            });
        }
        
    })

    document.getElementById("join-button").addEventListener("click", function(){
        var thingid = document.getElementById("thing-id").value;
        socket.emit('joinGame', {
            room: thingid,
            username: document.getElementById("username").value
        });
        document.getElementById("join-screen").style.display = "none";
        document.getElementById("player-screen").style.display = "grid";
    });

    socket.on('newGame', function(data){
        document.getElementById("join-screen").style.display = "none";
        document.getElementById("host-screen").style.display = "grid";
        document.getElementById("image0").setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `https://quickchart.io/qr?text=http%3A%2F%2Fthegameofthings.herokuapp.com%2F%3Fid%3D${data.game}`);
        document.getElementById("thing-id-host").innerHTML = data.game;
        hostscreen = true;
    });

    socket.on('err', function(data){
        alert(data.msg);
    });

    socket.on('newUser', function(data){
        document.getElementById("playerlist").innerHTML += "<li class='needsupdate'>" + data.username + "</li>";
        document.getElementsByClassName("needsupdate")[document.getElementsByClassName("needsupdate").length-1].style.background = randomcolor();
    });

    document.getElementById("start-button").addEventListener("click", function(){
        socket.emit('startGame', {
            room: document.getElementById("thing-id-host").innerHTML
        });
        //Don't think this is necessary anymore: document.getElementById("join-card").style.display = "none";
    });

    document.getElementById("shuffle").addEventListener("click", function(){
        socket.emit('startGame', {
            room: document.getElementById("thing-id-host").innerHTML
        });
        //Don't think this is necessary anymore: document.getElementById("join-card").style.display = "none";
    });

    socket.on('newThing', function(data){
        if (hostscreen){
            document.getElementById("host-screen").style.display = "none";
            document.getElementById("thing-screen").style.background = randomcolor();
            document.getElementById("thing-screen").style.display = "block";
            document.getElementById("thing").innerHTML = data.thing;
            document.getElementById("thing-results").innerHTML = data.thing;
        } else{
            document.getElementById("thing-player").innerHTML = data.thing;
            document.getElementById("player-screen").style.display = "flex";
            document.getElementById("waiting").style.display = "none";
            document.getElementById("player-screen").style.background = randomcolor();
            document.getElementById('player-thing-dialog').style.display = "block";
            document.getElementById("response-box").value = "";
        }
    });

    document.getElementById("resend").addEventListener("click", function(){
        socket.emit('resendrequest', {
            thing: document.getElementById("thing").innerHTML,
            room: document.getElementById("thing-id-host").innerHTML
        })
    });

    socket.on('resend', function(data){
        if (!hostscreen){
            document.getElementById("thing-player").innerHTML = data.thing;
            document.getElementById("player-screen").style.display = "flex";
            document.getElementById("waiting").style.display = "none";
            document.getElementById("count").style.display = "none";
            document.getElementById("player-screen").style.background = randomcolor();
            document.getElementById('player-thing-dialog').style.display = "block";
            document.getElementById("response-box").value = "";
        }
    });

    document.getElementById("response-box").addEventListener("keydown", function(e){
        if(e.keyCode == 13){
            socket.emit('receiveResponse', {
                response: document.getElementById("response-box").value,
                room: document.getElementById("thing-id").value
            });
            document.getElementById("player-thing-dialog").style.display = "none";
            document.getElementById("count").style.display = "block";
        }
        
    });

    socket.on('responsecount', function(data){
        if (data.count == 1){
            document.getElementById("count").innerHTML = data.count + ' thing submitted';
        } else{
            document.getElementById("count").innerHTML = data.count + ' things submitted';
        }
        
    });

    socket.on('displayresponses', function(data){
        var responses = data.shuffled;
        document.getElementById("thing-screen").style.display = "none";
        document.getElementById("things-screen").style.display = "block";
        document.getElementById("count").style.display = "none";
        console.log(responses);
        for (i = 0; i < responses.length; i++){
            document.getElementById("responses").innerHTML += "<h1 class='answer'><span class='needsupdate' onclick='remove(this);'>"+ responses[i]+"</span></h1>";
            document.getElementsByClassName("needsupdate")[document.getElementsByClassName("needsupdate").length-1].style.background = randomcolor();
        }
    });

    document.getElementById("reveal").addEventListener("click", function(){
        socket.emit('revealresponses', {
            room: document.getElementById("thing-id-host").innerHTML
        });
    });
};
