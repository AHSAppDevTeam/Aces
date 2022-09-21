/**
 * Initiates the authentication elements
 */
import { auth, user } from "../config.js"
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
    signInWithRedirect(auth, provider)
  })

  getRedirectResult(auth)
    .then(result => {
      if (!result) return false
      user = result.user
      updateAuth(true)
    })
}

async function updateAuth(signedIn) {
  document.body.classList.toggle('signed-in', signedIn)
  $('#sign').value = `Sign ${signedIn ? 'out' : 'in'}`
  document.activeElement.blur()
}
