import { authinit } from "./modules/auth.js"
import { editinit } from "./modules/editor.js"
import { browserinit } from "./modules/browser.js"
import { resizeinit } from "./modules/resize.js"
import '../css/style.css'

authinit()
editinit()
browserinit()
resizeinit()
