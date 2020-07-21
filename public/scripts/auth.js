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
    
  const auth = firebase.auth();

//   function signUp(){

//     var email = document.getElementById("email");
//     var password = document.getElementById("password"); 

//     const promise = auth.createUserWithEmailAndPassword(email.value, password.value);
//     promise.catch(e => alert(e.message));

//     alert("Signed up.");
// }

 
function login(){
    var email = document.getElementById("email");
    var password = document.getElementById("password"); 

    const promise = auth.signInWithEmailAndPassword(email.value, password.value);
    promise.catch(e => alert(e.message));
    alert("Signed in with " + email.value + ".");
    //Take user to a different location or homepage
    location.replace("toc.html");
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