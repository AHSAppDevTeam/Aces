let user = ''
let token = ''

sign_in_with_token(localStorage.get('refresh_token'))

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
	sign_in_with_email(
		auth.email.value,
		auth.password.value,
	)
	auth.modal.reset()
	auth.modal.classList.add('loading')
})
auth.sign
 .addEventListener('click', event=>{
	event.preventDefault()
	if(user){
		localStorage.set('refresh_token','')
	} else{
		auth.email.focus()
	}
 })
auth.modal
 .querySelector('.cancel')
 .addEventListener('click', ()=>{
	document.activeElement.blur()
})
function update_auth(signed_in){
	document.body.classList.toggle('signed-in',signed_in)
	auth.sign.value = `Sign ${signed_in ? 'out' : 'in'}`
	document.activeElement.blur()

	document.querySelector('.editor .remove').disabled
	= document.querySelector('.editor .publish').disabled
	= !signed_in

	if(signed_in) updateSecrets()
}
async function sign_in_with_email(email,password) {
	const res = await fetch(
		'identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
		{ email, password, returnSecureToken: true }
	)
	if(res.error) return auth.modal.classList.add('invalid')
	setTokens(res.idToken,res.refreshToken)
}
async function sign_in_with_token(refresh_token) {
	if(!refresh_token) return false
	const res = await fetch_json(
		'securetoken.googleapis.com/v1/token',
		{ refresh_token, grant_type: 'refresh_token' }
	)
	if(res.error) return false
	set_auth(res.id_token,res.refresh_token)
}
async function set_auth(idToken,refreshToken){
	token = idToken
	user = get_user(token)
	localStorage.setItem('refresh_token',refreshToken)
	update_auth(Boolean(user))
}
async function get_user(idToken){
	const res = await fetch_json(
		'identitytoolkit.googleapis.com/v1/accounts:lookup',
		{ idToken }
	)
	return res.email
}
