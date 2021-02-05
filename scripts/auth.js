let user
let signedIn = false

const auth = {
	sign: document.querySelector('.sign'),
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
})

auth.sign
 .addEventListener('click', event=>{
	event.preventDefault()
	if(signedIn){
		firebase.auth().signOut()
	} else{
		auth.email.focus()
	}
 })
auth.modal
 .querySelector('.cancel')
 .addEventListener('click', ()=>{
	document.activeElement.blur()
})


firebase.auth().onAuthStateChanged((user)=>{
	signedIn = Boolean(user)
	document.body.classList.toggle('signed-in',signedIn)
	auth.sign.value = `Sign ${signedIn ? 'out' : 'in'}`
	document.activeElement.blur()
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
