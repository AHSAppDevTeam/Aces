firebase.auth().onAuthStateChanged(function(user) {
    if (user == null) {
      // User is not signed in.
      window.location.replace("/public/index.html");
    }
  });