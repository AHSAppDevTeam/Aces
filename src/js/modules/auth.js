/**
 * Initiates the authentication elements
 */
async function initAuth(){
	const $sign = $('#sign')
	const $signIn = $('#sign-in')
	const $email = $('#email')
	const $password = $('#password')

	// Try to sign in with preexisting token
	signInWithToken(JSON.parse(localStorage.getItem('AUTH'))||{})

	$signIn.addEventListener('submit', event=>{
		event.preventDefault()
		signInWithEmail( $email.value, $password.value )
		$signIn.reset()
		$signIn.classList.add('loading')
	})
	$signIn.addEventListener('input', ()=>{
		$signIn.classList.remove('invalid')
	})
	$sign.addEventListener('click', event=>{
		event.preventDefault()
		user ? signOut() : $email.focus()
	})
	$('.cancel',$signIn).addEventListener('click', ()=>{
		$signIn.reset()
		document.activeElement.blur()
	})
}

/**
 * Sign in to Firebase with email and password
 * @param {string} email 
 * @param {string} password 
 */
async function signInWithEmail( email, password ) {
	const res = await googleapis(
		'identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
		{ email, password, returnSecureToken: true }
	)
	if(res.error) {
		const classes = $('#signIn').classList
		classes.remove('loading')
		classes.add('invalid')
		return
	}
	setAuth({
		idToken: res.idToken,
		refreshToken: res.refreshToken,
		expiresAt: timestamp() + parseInt(res.expiresIn)
	})
}

/**
 * Sign in to Firebase with stored refresh token
 * @param {string} refreshToken 
 */
async function signInWithToken(auth) {
	
	if(!auth.refreshToken) return false
	
	if( auth.idToken && auth.expiresAt && (auth.expiresAt-timestamp()>60) ) return setAuth(auth)
	
	const res = await googleapis(
		'securetoken.googleapis.com/v1/token',
		{ refresh_token: auth.refreshToken, grant_type: 'refresh_token' }
	)
	if(res.error) return false

	return setAuth({
		idToken: res.id_token,
		refreshToken: res.refresh_token,
		expiresAt: timestamp() + parseInt(res.expires_in),
	})
}

/**
 * Sign out of Firebase
 */
async function signOut(){
	localStorage.setItem('AUTH','')
	token = user = ''
	updateAuth(false)
}
async function setAuth(auth) {
	token = '?auth=' + auth.idToken
	user = await getUser(auth.idToken)
	localStorage.setItem('AUTH',JSON.stringify(auth))
	updateAuth(Boolean(user))
	setTimeout(
		signInWithToken,
		(auth.expiresAt-timestamp()-60)*1000,
		auth,
	) // One minute before idToken expires
}
async function getUser(idToken) {
	const { users: { 0: { email } } } = await googleapis(
		'identitytoolkit.googleapis.com/v1/accounts:lookup',
		{ idToken }
	)
	return email
}
async function updateAuth(signedIn){
	document.body.classList.toggle('signed-in',signedIn)
	$('#sign').value = `Sign ${signedIn ? 'out' : 'in'}`
	document.activeElement.blur()
}
