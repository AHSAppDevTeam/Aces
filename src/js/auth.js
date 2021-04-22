let user = ''
let token = ''
let secrets

sign_in_with_token(localStorage.getItem('refresh_token'))

const auth = {
	sign: $`#sign`,
	modal: $`#sign-in`,

	email: $`#email`,
	password: $`#password`,
}
auth.modal
 .addEventListener('submit',event=>{
	event.preventDefault()
	sign_in_with_email(
		auth.email.value,
		auth.password.value,
	)
	auth.modal.reset()
	auth.modal.classList.add('loading')
})
auth.modal
 .addEventListener('input',event=>{
	 auth.modal.classList.remove('invalid')
 })
auth.sign
 .addEventListener('click', event=>{
	event.preventDefault()
	if(user){
		sign_out()
	} else {
		auth.email.focus()
	}
 })
auth.modal
 .querySelector('.cancel')
 .addEventListener('click', ()=>{
	auth.modal.reset()
	document.activeElement.blur()
})
