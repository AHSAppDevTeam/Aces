import {
  initializeApp
} from 'firebase/app'

import {
  getAuth
} from 'firebase/auth'

import {
  getDatabase
} from 'firebase/database'

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
export const auth = getAuth(app)
export const db = getDatabase()

const DEBUG = true
const KEY = 'AIzaSyDEUekXeyIKJUreRaX78lsEYBt8JGHYmHE'
let user = ''
let token = ''
export const ldb = {} // local DB
