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

/**
 * Adds a change event listener that also displays success
 * @param {Element} $element 
 * @param {callback} callback 
 */
const addChangeListener = async ($element, callback) =>
	$element.addEventListener( 'change', async event => {
		let $displayer = event.target
		do $displayer = $displayer.parentElement
		while ( !$displayer.classList.contains('card') )
		$displayer.classList.add('changed')
		await Promise.all(await callback(event))
		$displayer.classList.remove('changed')
	})

