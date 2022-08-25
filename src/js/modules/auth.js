/**
 * Initiates the authentication elements
 */
async function initAuth(){
	const $sign = $('#sign')

	const provider = new GoogleAuthProvider()
	provider.setCustomParameters({
	  'hd': 'ausd.net'
	})

	$sign.addEventListener("click", event => {
		 event.preventDefault()
		 signInWithRedirect(auth, provider)
	})
	
	getRedirectResult(auth)
}

async function updateAuth(signedIn){
	document.body.classList.toggle('signed-in',signedIn)
	$('#sign').value = `Sign ${signedIn ? 'out' : 'in'}`
	document.activeElement.blur()
}
