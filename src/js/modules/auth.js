async function sign_in_with_email(email,password) {
	const res = await googleapis(
		'identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
		{ email, password, returnSecureToken: true }
	)
	if(res.error) {
		auth.modal.classList.remove('loading')
		auth.modal.classList.add('invalid')
		return false
	}
	set_auth(res.idToken,res.refreshToken)
}
async function sign_in_with_token(refresh_token) {
	if(!refresh_token) return false
	const res = await googleapis(
		'securetoken.googleapis.com/v1/token',
		{ refresh_token, grant_type: 'refresh_token' }
	)
	if(res.error) return false
	set_auth(res.id_token,res.refresh_token)
}
async function sign_out(){
	localStorage.setItem('refresh_token','')
	token = user = ''
	update_auth(false)
}
async function set_auth(idToken,refreshToken){
	token = '?auth='+idToken
	user = await get_user(idToken)
	secrets = await db('secrets')
	localStorage.setItem('refresh_token',refreshToken)
	update_auth(Boolean(user))
}
async function get_user(idToken){
	const { users: { 0: { email } } } = await googleapis(
		'identitytoolkit.googleapis.com/v1/accounts:lookup',
		{ idToken }
	)
	return email
}
async function update_auth(signed_in){
	document.body.classList.toggle('signed-in',signed_in)
	auth.sign.value = `Sign ${signed_in ? 'out' : 'in'}`
	document.activeElement.blur()

	$('#remove',$editor).disabled
	= $('#publish',$editor).disabled
	= !signed_in
}
