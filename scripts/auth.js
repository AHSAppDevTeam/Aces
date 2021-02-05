let user
let signedIn = false

const auth = {
	modal: document.querySelector('.sign-in'),

	email: document.querySelector('.email'),
	password: document.querySelector('.password'),
}

document
 .querySelector('.sign-in')
 .addEventListener('submit',event=>{
	event.preventDefault()
	signIn(
		auth.email.value,
		auth.password.value,
	)
	auth.modal.classList.add('loading')
},false)

document
 .querySelector('.sign')
 .addEventListener('click', event=>{
	if(signedIn){
		firebase.auth().signOut()
	} else{
		auth.modal.hidden = false
		auth.email.focus()
	}
 })


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
