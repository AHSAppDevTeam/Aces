function back(){
    location.replace("toc.html");
}


const notifTitle = document.getElementById('notifTitle');
const notifID = document.getElementById('notifID');
const topic = document.getElementById('topic');
const notifBody = document.getElementById('notifBody');
const id = document.getElementById('id');

const postBtn = document.getElementById('postnotif');
const removeBtn = document.getElementById('removeBtn1');

const database = firebase.database();

postBtn.addEventListener('click', (e) => {
    e.preventDefault();

     //convert date to unix timestamp
    var unixTimestamp = parseInt((new Date().getTime() / 1000).toFixed(0));
    
    //change topic to numbers (0...4)
    var numberTopic;
    if(topic.value == "mandatory"){
        numberTopic = 0;
    }else if(topic.value == "general"){
        numberTopic = 1;
    }else if(topic.value == "asb"){
        numberTopic = 2;
    }else if(topic.value == "district"){
        numberTopic = 3;
    }else{
        numberTopic = 4; 
    }

    var newPostRef = database.ref('/notifications/').push();
    // var postId = newPostRef.key;

    newPostRef.set({
        notificationArticleID: notifID.value,
        notificationBody: notifBody.value,
        notificationCategory: numberTopic,
        notificationTitle: notifTitle.value,
        notificationUnixEpoch: unixTimestamp,
    });

    M.toast({html: 'Sent Notification! Refresh the screen to see the updated feed!', classes: 'rounded'});
});

removeBtn1.addEventListener('click', (e) => {
    e.preventDefault();

    database.ref('/notifications/' + id.value).remove()
    .then(() => {
        window.alert('Article ' + id.value + ' removed from database.');
    })
    .catch(error => {
        console.error(error);
    });
    
    M.toast({html: 'Removed Notification! Refresh the screen to see the updated feed!', classes: 'rounded'});
});

var postId; 

 database.ref('notifications').once('child_changed', snapshot => {
     postId = snapshot.key;
 });

 function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var time = month + ' ' + date + ', ' + year;
    return time;
  }

 database.ref('notifications').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot){

        var data = childSnapshot.val();
        var key = childSnapshot.key;
        var time = timeConverter(data.notificationUnixEpoch); 
        var li = document.createElement("li");

        var a = document.createTextNode("Notification ID: " + key);
        var b = document.createTextNode("Title: " + data.notificationTitle);
        var c = document.createTextNode("Article ID: " + data.notificationArticleID);
        var d = document.createTextNode("Date: " + time);
        var e = document.createTextNode("Body: " + data.notificationBody);
        var f = document.createTextNode("Category: " + data.notificationCategory);

        li.appendChild(a);
        var br1 = document.createElement("br");
        li.appendChild(br1);
        li.appendChild(b);
        var br2 = document.createElement("br");
        li.appendChild(br2);
        li.appendChild(c);
        var br3 = document.createElement("br");
        li.appendChild(br3);
        li.appendChild(d);
        var br4 = document.createElement("br");
        li.appendChild(br4);
        li.appendChild(e);
        var br5 = document.createElement("br");
        li.appendChild(br5);
        li.appendChild(f);


        var list = document.getElementById("myUL1");
        list.insertBefore(li, list.childNodes[0]);
    });
});