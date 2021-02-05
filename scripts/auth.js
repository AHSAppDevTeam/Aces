let user
const auth = {
  modal: document.querySelector('.auth'),

  signIn: document.querySelector('.sign-in'),
  email: document.querySelector('.email'),
  password: document.querySelector('.password'),
  remember: document.querySelector('.remember'),

  signOut: document.querySelector('.sign-out')
}


auth.signIn.addEventListener('change',event=>{
  auth.modal.classList.remove('invalid','loading')
})
auth.signIn.addEventListener('submit',event=>{
  event.preventDefault()
  signIn(
    auth.email.value,
    auth.password.value,
  )
  auth.modal.classList.add('loading')
},false)
auth.signOut.addEventListener('submit',event=>{
  event.preventDefault()
  signOut()
},false)


firebase.auth().onAuthStateChanged(function(user) {
  document.body.classList.toggle('signed-in',Boolean(user))
})

function signIn(email,password) {
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      user = userCredential.user      
      auth.modal.classList.remove('loading')
    })
    .catch((error) => {
      switch(error.code){
        case 'auth/wrong-password':
        case 'auth/invalid-email':
          auth.modal.classList.add('invalid')
          break
      }
    })
}
function signOut(){
  firebase.auth().signOut()
}