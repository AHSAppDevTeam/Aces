 // Your web app's Firebase configuration
 var firebaseConfig = {
    apiKey: "AIzaSyDEUekXeyIKJUreRaX78lsEYBt8JGHYmHE",
    authDomain: "arcadia-high-mobile.firebaseapp.com",
    databaseURL: "https://arcadia-high-mobile.firebaseio.com",
    projectId: "arcadia-high-mobile",
    storageBucket: "arcadia-high-mobile.appspot.com",
    messagingSenderId: "654225823864",
    appId: "1:654225823864:web:944772a5cadae0c8b7758d"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  var auth = firebase.auth();

function signUp(){

    var email = document.getElementById("email");
    var password = document.getElementById("password"); 

    const promise = auth.createUserWithEmailAndPassword(email.value, password.value);
    promise.catch(e => alert(e.message));

    alert("Signed up.");
}

 
function login(){
    var email = document.getElementById("email");
    var password = document.getElementById("password"); 

    const promise = auth.signInWithEmailAndPassword(email.value, password.value);
    promise.catch(e => alert(e.message));
    alert("Signed in with " + email.value + ".");
    //Take user to a different location or homepage
    location.replace("index.html");
}

function signOut(){
    auth.signOut();
    alert("Signed out.");
}

auth.onAuthStateChanged(function(user){
    if(user){
        var email = user.email;
        alert("Active user: " + email);
        //is signed in
    }else{
        //alert("No active user.")
        //no user is signed in
    }
});

//move web location
function homepage(){
    location.replace("homepage.html");
}

function bulletin(){
    location.replace("bulletin.html");
}

function back1(){
    location.replace("login.html");
}

function back2(){
    location.replace("index.html");
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
const number = document.getElementById('number');
const id = document.getElementById('id');
const title = document.getElementById('title');
const author = document.getElementById('author');
const image = document.getElementById('image');
const timestamp = document.getElementById('timestamp');
const body = document.getElementById('textarea1');
const imgNum = document.getElementById('imgNum');

const addBtn = document.getElementById('addBtn');
const updateBtn = document.getElementById('updateBtn');
const removeBtn = document.getElementById('removeBtn');

const database = firebase.database();
//const rootRef = database.ref('homepage');

//to add, update, remove, and read data from firebase
addBtn.addEventListener('click', (e) => {
    e.preventDefault();

    $('#isFeatured').on('change', function(){
        this.value = this.checked ? "true" : "false";
        // alert(this.value);
     }).change();

     //convert date to unix timestamp
    var unixTimestamp = parseInt((new Date(timestamp.value).getTime() / 1000).toFixed(0));  

    var newPostRef = database.ref('/homepage/' + category.value).push();
    var postId = newPostRef.key;

    newPostRef.set({
        articleAuthor: author.value,
        articleBody: body.value,
        articleTitle: title.value,
        articleUnixEpoch: unixTimestamp, 
        isFeatured: JSON.parse(isFeatured.value.toLowerCase()), 
    });

    database.ref('/homepage/' + category.value + '/' + postId + '/articleImages/').set({
        0: image.value,
    });

    //var elem = document.getElementById('');
    //elem.parentNode.removeChild(elem);
});

var counter = 0; 
updateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    counter = counter + 1; 

    $('#isFeatured').on('change', function(){
        this.value = this.checked ? "true" : "false";
        // alert(this.value);
     }).change();
    
    var unixTimestamp = parseInt((new Date(timestamp.value).getTime() / 1000).toFixed(0));  

    const newData = {
        articleAuthor: author.value,
        articleBody: body.value,
        articleTitle: title.value,
        articleUnixEpoch: unixTimestamp, 
        isFeatured: JSON.parse(isFeatured.value.toLowerCase()), 
    };

    const newImg1 = {
        1: image.value,
    };

    const newImg2 = {
        2: image.value,
    };
    if(counter == 1){
        database.ref('/homepage/' + category.value + '/' + postId + '/articleImages/').update(newImg1);
    }else{
    database.ref('/homepage/' + category.value + '/' + postId + '/articleImages/').update(newImg2);
    }
    database.ref('/homepage/' + category.value + '/' + postId).update(newData);
});

removeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    database.ref('/homepage/' + category.value + '/' + postId).remove()
    .then(() => {
        window.alert('Article ' + postId + ' removed from database.');
    })
    .catch(error => {
        console.error(error);
    });
});

//id listener
var postId; 

if(category.value = "asb"){
    database.ref('homepage').child('asb').once('child_changed', snapshot => {
        postId = snapshot.key; 
        console.log(snapshot.key);
    });
}else if(category.value = "district"){
    database.ref('homepage').child('district').once('child_changed', snapshot => {
        postId = snapshot.key; 
        console.log(snapshot.key);
    });
}else{
    database.ref('homepage').child('sports').once('child_changed', snapshot => {
        postId = snapshot.key; 
        console.log(snapshot.key);
    });
}