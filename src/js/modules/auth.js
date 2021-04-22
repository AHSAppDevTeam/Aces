async function initAuth(){
	const $sign = $('#sign')
	const $signIn = $('#sign-in')
	const $email = $('#email')
	const $password = $('#password')

	signInWithToken(localStorage.getItem('refresh_token'))

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
async function signInWithEmail( email, password ) {
	const res = await googleapis(
		'identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
		{ email, password, returnSecureToken: true }
	)
	if(res.error) {
		const classes = $('signIn').classList
		classes.remove('loading')
		classes.add('invalid')
		return false
	}
	setAuth(res.idToken,res.refreshToken)
}
async function signInWithToken(refreshToken) {
	if(!refreshToken) return false
	const res = await googleapis(
		'securetoken.googleapis.com/v1/token',
		{ refresh_token: refreshToken, grant_type: 'refresh_token' }
	)
	if(res.error) return false
	setAuth(res.id_token,res.refresh_token)
}
async function signOut(){
	localStorage.setItem('refresh_token','')
	token = user = ''
	updateAuth(false)
}
async function setAuth(idToken,refreshToken) {
	token = '?auth=' + idToken
	user = await getUser(idToken)
	secrets = await db('secrets')
	localStorage.setItem('refresh_token',refreshToken)
	updateAuth(Boolean(user))
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

	$('#remove',$editor).disabled
	= $('#publish',$editor).disabled
	= !signedIn
}
