
const $ = (query,parent=document) => parent.querySelector(query)
const $$ = (query,parent=document) => Array.from(parent.querySelectorAll(query))
