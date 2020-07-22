firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      document.getElementById("user_div").style.display = "initial";
      document.getElementById("login_div").style.display = "none";

      var user = firebase.auth().currentUser;

      if(user != null){
          var email_id = user.email; 

          document.getElementById("user_para").innerHTML = "Welcome to the AHS Content Editing System. <br/> You are currently logged in as: " + email_id;
      }

    } else {
      // No user is signed in.
      document.getElementById("login_div").style.display = "initial";
      document.getElementById("user_div").style.display = "none";
    }
  });


function login(){
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value; 

    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        
        alert("Error: " + errorMessage);
    });
}

function signOut(){
    firebase.auth().signOut();
}

//   function signUp(){
//     var email = document.getElementById("email");
//     var password = document.getElementById("password"); 

//     const promise = auth.createUserWithEmailAndPassword(email.value, password.value);
//     promise.catch(e => alert(e.message));

//     alert("Signed up.");
// }