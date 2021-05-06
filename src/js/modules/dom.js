/**
 * Shortcut for querySelector
 * @param {string} query 
 * @param {Element} parent 
 * @returns {Element}
 */
const $ = (query,parent=document) => parent.querySelector(query)

/**
 * Shortcut for querySelectorAll
 * @param {string} query 
 * @param {Element} parent 
 * @returns {Element[]}
 */
const $$ = (query,parent=document) => Array.from(parent.querySelectorAll(query))

/**
 * Clones a template element
 * @param {string} id
 * @returns {Element}
 */
const $template = id => $('#template-'+id).content.cloneNode(true).querySelector('*')

