/**
 * Initiates the authentication elements
 */
import * as fire from "../config.js"
import {
	signInWithRedirect, getRedirectResult, GoogleAuthProvider
} from 'firebase/auth'
import { $ } from './dom'

export async function authinit() {
	const $sign = $('#sign')

	const provider = new GoogleAuthProvider()
	provider.setCustomParameters({
		'hd': 'ausd.net'
	})

	$sign.addEventListener("click", event => {
		event.preventDefault()
		signInWithRedirect(fire.auth, provider)
	})

	getRedirectResult(fire.auth)
}

async function updateAuth(signedIn) {
	document.body.classList.toggle('signed-in', signedIn)
	$('#sign').value = `Sign ${signedIn ? 'out' : 'in'}`
	document.activeElement.blur()
}
