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

//homepage constants
const category = document.getElementById('category');
const isFeatured = document.getElementById('isFeatured');
//const number = document.getElementById('number');
const id = document.getElementById('id');
const title = document.getElementById('title');
const author = document.getElementById('author');
const image = document.getElementById('image');
const timestamp = document.getElementById('timestamp');
const body = document.getElementById('textarea1');
//const imgNum = document.getElementById('imgNum');

const addBtn = document.getElementById('addBtn');
const updateBtn = document.getElementById('updateBtn');
const removeBtn = document.getElementById('removeBtn');

const database = firebase.database(); 
//const rootRef = database.ref('homepage');

addBtn.addEventListener('click', (e) => {
    e.preventDefault();

    $('#isFeatured').on('change', function(){
        this.value = this.checked ? "true" : "false";
        // alert(this.value);
     }).change();

    //detect html tags
    var htmlValue = body.value.includes("</"); 

    //convert date to unix timestamp
    var unixTimestamp = parseInt((new Date(timestamp.value).getTime() / 1000).toFixed(0));  
    //var unixTimestamp = new Date().getTime();

    var newPostRef = database.ref('/homepage/' + category.value).push();
    var postId = newPostRef.key;

    newPostRef.set({
        articleAuthor: author.value,
        articleBody: body.value,
        articleTitle: title.value,
        articleUnixEpoch: unixTimestamp, 
        hasHTML: htmlValue, 
        isFeatured: JSON.parse(isFeatured.value.toLowerCase()), 
    });

    database.ref('/homepage/' + category.value + '/' + postId + '/articleImages/').set({
        0: image.value,
    });

    if(category.value == "asb"){
        database.ref('homepage').child('asb').once('child_added', function (snapshot) {
                var data = snapshot.val();
                var key = snapshot.key;
                var time = timeConverter(data.articleUnixEpoch); 
                var li = document.createElement("li");
        
                var a = document.createTextNode("ID: " + key);
                var b = document.createTextNode("isFeatured: " + data.isFeatured);
                var c = document.createTextNode("Images: " + data.articleImages);
                var d = document.createTextNode("Date: " + time);
                var e = document.createTextNode("Title: " + data.articleTitle);
                var f = document.createTextNode("Author: " + data.articleAuthor);
                var g = document.createTextNode("Body: " + data.articleBody);
                var h = document.createTextNode("hasHTML: " + data.hasHTML);
        
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
                var br6 = document.createElement("br");
                li.appendChild(br6);
                li.appendChild(g);
                var br7 = document.createElement("br");
                li.appendChild(br7);
                li.appendChild(h);
        
        
                var list = document.getElementById("myUL1");
                list.insertBefore(li, list.childNodes[0]);
        });
    }

    if(category.value == "district"){
        database.ref('homepage').child('district').once('child_added', function (snapshot) {
            var data = snapshot.val();
            var key = snapshot.key;
            var time = timeConverter(data.articleUnixEpoch); 
            var li = document.createElement("li");

            var a = document.createTextNode("ID: " + key);
            var b = document.createTextNode("isFeatured: " + data.isFeatured);
            var c = document.createTextNode("Images: " + data.articleImages);
            var d = document.createTextNode("Date: " + time);
            var e = document.createTextNode("Title: " + data.articleTitle);
            var f = document.createTextNode("Author: " + data.articleAuthor);
            var g = document.createTextNode("Body: " + data.articleBody);
            var h = document.createTextNode("hasHTML: " + data.hasHTML);

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
            var br6 = document.createElement("br");
            li.appendChild(br6);
            li.appendChild(g);
            var br7 = document.createElement("br");
            li.appendChild(br7);
            li.appendChild(h);


            var list = document.getElementById("myUL2");
            list.insertBefore(li, list.childNodes[0]);
        });
    }

    if(category.value == "sports"){
        database.ref('homepage').child('sports').once('child_added', function (snapshot) {
            var data = snapshot.val();
            var key = snapshot.key;
            var time = timeConverter(data.articleUnixEpoch); 
            var li = document.createElement("li");

            var a = document.createTextNode("ID: " + key);
            var b = document.createTextNode("isFeatured: " + data.isFeatured);
            var c = document.createTextNode("Images: " + data.articleImages);
            var d = document.createTextNode("Date: " + time);
            var e = document.createTextNode("Title: " + data.articleTitle);
            var f = document.createTextNode("Author: " + data.articleAuthor);
            var g = document.createTextNode("Body: " + data.articleBody);
            var h = document.createTextNode("hasHTML: " + data.hasHTML);

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
            var br6 = document.createElement("br");
            li.appendChild(br6);
            li.appendChild(g);
            var br7 = document.createElement("br");
            li.appendChild(br7);
            li.appendChild(h);


            var list = document.getElementById("myUL3");
            list.insertBefore(li, list.childNodes[0]);
        });
    }
});


var counter = 0; 
updateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    counter = counter + 1; 

    $('#isFeatured').on('change', function(){
        this.value = this.checked ? "true" : "false";
        // alert(this.value);
     }).change();
    

    var htmlValue = body.value.includes("</"); 
    var unixTimestamp = parseInt((new Date(timestamp.value).getTime() / 1000).toFixed(0));

    const newData = {
        articleAuthor: author.value,
        articleBody: body.value,
        articleTitle: title.value,
        articleUnixEpoch: unixTimestamp, 
        hasHTML: htmlValue, 
        isFeatured: JSON.parse(isFeatured.value.toLowerCase()), 
    };

    const newImg1 = {
        1: image.value,
    };

    const newImg2 = {
        2: image.value,
    };
    if(counter == 1){
        database.ref('/homepage/' + category.value + '/' + id.value + '/articleImages/').update(newImg1);
    }else{
    database.ref('/homepage/' + category.value + '/' + id.value + '/articleImages/').update(newImg2);
    }
    database.ref('/homepage/' + category.value + '/' + id.value).update(newData);

    alert("Please refresh the screen after updating the article!");
});
    
removeBtn.addEventListener('click', (e) => {
    e.preventDefault();

    database.ref('/homepage/' + category.value + '/' + id.value).remove()
    .then(() => {
        window.alert('Article ' + id.value + ' removed from database.');
    })
    .catch(error => {
        console.error(error);
    });

    alert("Please refresh the screen after removing an article!");
});

//id listener
var postId; 

if(category.value = "asb"){
    database.ref('homepage').child('asb').once('child_changed', snapshot => {
        postId = snapshot.key;
    });
}else if(category.value = "district"){
    database.ref('homepage').child('district').once('child_changed', snapshot => {
        postId = snapshot.key;
    });
}else{
    database.ref('homepage').child('sports').once('child_changed', snapshot => {
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
database.ref('homepage').child('asb').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot){
        //console.log(childSnapshot.val());
        var data = childSnapshot.val();
        var key = childSnapshot.key;
        var time = timeConverter(data.articleUnixEpoch); 
        var li = document.createElement("li");

        var a = document.createTextNode("ID: " + key);
        var b = document.createTextNode("isFeatured: " + data.isFeatured);
        var c = document.createTextNode("Images: " + data.articleImages);
        var d = document.createTextNode("Date: " + time);
        var e = document.createTextNode("Title: " + data.articleTitle);
        var f = document.createTextNode("Author: " + data.articleAuthor);
        var g = document.createTextNode("Body: " + data.articleBody);
        var h = document.createTextNode("hasHTML: " + data.hasHTML);

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
        var br6 = document.createElement("br");
        li.appendChild(br6);
        li.appendChild(g);
        var br7 = document.createElement("br");
        li.appendChild(br7);
        li.appendChild(h);


        var list = document.getElementById("myUL1");
        list.insertBefore(li, list.childNodes[0]);

       });
});

database.ref('homepage').child('district').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot){

        var data = childSnapshot.val();
        var key = childSnapshot.key;
        var time = timeConverter(data.articleUnixEpoch); 
        var li = document.createElement("li");

        var a = document.createTextNode("ID: " + key);
        var b = document.createTextNode("isFeatured: " + data.isFeatured);
        var c = document.createTextNode("Images: " + data.articleImages);
        var d = document.createTextNode("Date: " + time);
        var e = document.createTextNode("Title: " + data.articleTitle);
        var f = document.createTextNode("Author: " + data.articleAuthor);
        var g = document.createTextNode("Body: " + data.articleBody);
        var h = document.createTextNode("hasHTML: " + data.hasHTML);

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
        var br6 = document.createElement("br");
        li.appendChild(br6);
        li.appendChild(g);
        var br7 = document.createElement("br");
        li.appendChild(br7);
        li.appendChild(h);


        var list = document.getElementById("myUL2");
        list.insertBefore(li, list.childNodes[0]);

       });
});

database.ref('homepage').child('sports').once('value', function (snapshot) {
    snapshot.forEach(function (childSnapshot){

        var data = childSnapshot.val();
        var key = childSnapshot.key;
        var time = timeConverter(data.articleUnixEpoch); 
        var li = document.createElement("li");

        var a = document.createTextNode("ID: " + key);
        var b = document.createTextNode("isFeatured: " + data.isFeatured);
        var c = document.createTextNode("Images: " + data.articleImages);
        var d = document.createTextNode("Date: " + time);
        var e = document.createTextNode("Title: " + data.articleTitle);
        var f = document.createTextNode("Author: " + data.articleAuthor);
        var g = document.createTextNode("Body: " + data.articleBody);
        var h = document.createTextNode("hasHTML: " + data.hasHTML);


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
        var br6 = document.createElement("br");
        li.appendChild(br6);
        li.appendChild(g);
        var br7 = document.createElement("br");
        li.appendChild(br7);
        li.appendChild(h);


        var list = document.getElementById("myUL3");
        list.insertBefore(li, list.childNodes[0]);

       });
});
