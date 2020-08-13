//move web location
function homepage(){
    location.replace("homepage.html");
}

function bulletin(){
    location.replace("bulletin.html");
}

function back1(){
    location.replace("index.html");
}

function back2(){
    location.replace("toc.html");
}

function notif(){
    location.replace("notifs.html");
}

document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {
      direction: 'left'
    });
  });

//textarea autoexpand
document.addEventListener('input', function (event) {
    if (event.target.tagName.toLowerCase() !== 'textarea') return;
    autoExpand(event.target);
}, false);

var autoExpand = function (field) {
	// Reset field height
	field.style.height = 'inherit';

	// Get the computed styles for the element
	var computed = window.getComputedStyle(field);

	// Calculate the height
	var height = parseInt(computed.getPropertyValue('border-top-width'), 10)
	             + parseInt(computed.getPropertyValue('padding-top'), 10)
	             + field.scrollHeight
	             + parseInt(computed.getPropertyValue('padding-bottom'), 10)
	             + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

	field.style.height = height + 'px';
};

//id generator ---NOT USING---
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

//bulletin constants
const category = document.getElementById('topic');
//const number = document.getElementById('number');
const id = document.getElementById('id');
const title = document.getElementById('title');
// const author = document.getElementById('author');
// const image = document.getElementById('image');
const timestamp = document.getElementById('timestamp');
const body = document.getElementById('textarea1');
//const imgNum = document.getElementById('imgNum');

const addBtn1 = document.getElementById('addBtn1');
const updateBtn1 = document.getElementById('updateBtn1');
const removeBtn1 = document.getElementById('removeBtn1');

const database = firebase.database();

function timedRefresh(timeoutPeriod) {
	setTimeout("location.reload(true);",timeoutPeriod);
}

//to add, update, remove, and read data from firebase
addBtn1.addEventListener('click', (e) => {
    e.preventDefault();

    var htmlValue = body.value.includes("</"); 

     //convert date to unix timestamp
    var unixTimestamp = parseInt((new Date(timestamp.value).getTime() / 1000).toFixed(0));  

    var newPostRef = database.ref('/bulletin/' + category.value).push();
    // var postId = newPostRef.key;

    if(body.value != '' && title.value != '' && unixTimestamp != ''){
        newPostRef.set({
            articleBody: body.value,
            articleTitle: title.value,
            articleUnixEpoch: unixTimestamp,
            hasHTML: htmlValue,
        });


        M.toast({html: 'Added Article!', classes: 'rounded'}); 
        timedRefresh(1000);
    }else{
        M.toast({html: 'Missing input(s)!', classes: 'rounded'}); 
    }
});

var counter = 0; 
updateBtn1.addEventListener('click', (e) => {
    e.preventDefault();
    counter = counter + 1;
    
    var htmlValue = body.value.includes("</"); 
    var unixTimestamp = parseInt((new Date(timestamp.value).getTime() / 1000).toFixed(0));  

    const newData = {
        // articleAuthor: author.value,
        articleBody: body.value,
        articleTitle: title.value,
        articleUnixEpoch: unixTimestamp,
        hasHTML: htmlValue,
    };

    if(id.value){
        database.ref('/bulletin/' + category.value + '/' + id.value).update(newData);
        M.toast({html: 'Updated Article!', classes: 'rounded'});
        timedRefresh(1000);
    }else{
        M.toast({html: 'Provide an ID first!', classes: 'rounded'});
    }

});


removeBtn1.addEventListener('click', (e) => {
    e.preventDefault();

    if(id.value){
        database.ref('/bulletin/' + category.value + '/' + id.value).remove()
        .then(() => {
            M.toast({html: 'Removed Article!', classes: 'rounded'});
            timedRefresh(1000);
        })
        .catch(error => {
            console.error(error);
        });
    }else{
        M.toast({html: 'Provide an ID first!', classes: 'rounded'});
    }
});



//id listener
var postId; 

if(category.value = "Academics"){
    database.ref('bulletin').child('Academics').once('child_changed', snapshot => {
        postId = snapshot.key;
    });
}else if(category.value = "Athletics"){
    database.ref('bulletin').child('Athletics').once('child_changed', snapshot => {
        postId = snapshot.key; 
    });
}else if(category.value = "Clubs"){
    database.ref('bulletin').child('Clubs').once('child_changed', snapshot => {
        postId = snapshot.key; 
    });
}else if(category.value = "Colleges"){
    database.ref('bulletin').child('Colleges').once('child_changed', snapshot => {
        postId = snapshot.key; 
    });
}else{
    database.ref('bulletin').child('Reference').once('child_changed', snapshot => {
        postId = snapshot.key; 
    });
}



function timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var time = month + ' ' + date + ', ' + year;
    return time;
  }

//getting data from the server
database.ref('bulletin').child('Academics').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot){

        var data = childSnapshot.val();
        var key = childSnapshot.key;
        var time = timeConverter(data.articleUnixEpoch); 
        var li = document.createElement("li");
        li.setAttribute("class", "forFeed")

        var a = document.createTextNode("ID: " + key);
        var b = document.createTextNode("Title: " + data.articleTitle);
        var c = document.createTextNode("Date: " + time);
        var d = document.createTextNode("Body: " + data.articleBody);
        var e = document.createTextNode("hasHTML: " + data.hasHTML);

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


        var list = document.getElementById("myUL1");
        list.insertBefore(li, list.childNodes[0]);
    });
});

database.ref('bulletin').child('Athletics').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot){
        var data = childSnapshot.val();
        var key = childSnapshot.key;
        var time = timeConverter(data.articleUnixEpoch); 
        var li = document.createElement("li");
        li.setAttribute("class", "forFeed")

        var a = document.createTextNode("ID: " + key);
        var b = document.createTextNode("Title: " + data.articleTitle);
        var c = document.createTextNode("Date: " + time);
        var d = document.createTextNode("Body: " + data.articleBody);
        var e = document.createTextNode("hasHTML: " + data.hasHTML);

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



        var list = document.getElementById("myUL2");
        list.insertBefore(li, list.childNodes[0]);
       });
});

database.ref('bulletin').child('Clubs').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot){
        var data = childSnapshot.val();
        var key = childSnapshot.key;
        var time = timeConverter(data.articleUnixEpoch); 
        var li = document.createElement("li");
        li.setAttribute("class", "forFeed")

        var a = document.createTextNode("ID: " + key);
        var b = document.createTextNode("Title: " + data.articleTitle);
        var c = document.createTextNode("Date: " + time);
        var d = document.createTextNode("Body: " + data.articleBody);
        var e = document.createTextNode("hasHTML: " + data.hasHTML);

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


        var list = document.getElementById("myUL3");
        list.insertBefore(li, list.childNodes[0]);
       });
});

database.ref('bulletin').child('Colleges').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot){
        var data = childSnapshot.val();
        var key = childSnapshot.key;
        var time = timeConverter(data.articleUnixEpoch); 
        var li = document.createElement("li");
        li.setAttribute("class", "forFeed")

        var a = document.createTextNode("ID: " + key);
        var b = document.createTextNode("Title: " + data.articleTitle);
        var c = document.createTextNode("Date: " + time);
        var d = document.createTextNode("Body: " + data.articleBody);
        var e = document.createTextNode("hasHTML: " + data.hasHTML);

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


        var list = document.getElementById("myUL4");
        list.insertBefore(li, list.childNodes[0]);
       });
});

database.ref('bulletin').child('Reference').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot){
        var data = childSnapshot.val();
        var key = childSnapshot.key;
        var time = timeConverter(data.articleUnixEpoch); 
        var li = document.createElement("li");
        li.setAttribute("class", "forFeed")

        var a = document.createTextNode("ID: " + key);
        var b = document.createTextNode("Title: " + data.articleTitle);
        var c = document.createTextNode("Date: " + time);
        var d = document.createTextNode("Body: " + data.articleBody);
        var e = document.createTextNode("hasHTML: " + data.hasHTML);

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


        var list = document.getElementById("myUL5");
        list.insertBefore(li, list.childNodes[0]);
       });
});
