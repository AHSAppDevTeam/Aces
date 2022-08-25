import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/9.9.1/firebase-app.js"

import {
  getAuth, signInWithRedirect, getRedirectResult, GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/9.9.1/firebase-auth.js"

import {
  getDatabase, ref, get, set, onValue
} from "https://www.gstatic.com/firebasejs/9.9.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDweQSkpqQSGP42qBgoiSm5VAhDoe9dJA8",
  authDomain: "arcadia-high-mobile.firebaseapp.com",
  databaseURL: "https://ahs-app.firebaseio.com",
  projectId: "arcadia-high-mobile",
  storageBucket: "arcadia-high-mobile.appspot.com",
  messagingSenderId: "654225823864",
  appId: "1:654225823864:web:944772a5cadae0c8b7758d",
  measurementId: "G-YGN0551PM8"
}
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getDatabase()

const DEBUG = true
const KEY = 'AIzaSyDEUekXeyIKJUreRaX78lsEYBt8JGHYmHE'
let user = ''
let token = ''
const ldb = {} // local DB
