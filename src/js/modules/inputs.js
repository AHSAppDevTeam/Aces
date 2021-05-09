/**
 * Initiates a textarea
 * @param {Element} $textarea
 */
async function initTextarea($textarea){
	// reset default attributes
	$textarea.setAttribute('rows',1)

	// on input, adjust the <textarea>'s display height to that of its contents
	$textarea.addEventListener('input',()=>{
		$textarea.style.height = 'auto'
		$textarea.style.height = $textarea.scrollHeight+'px'
	})

	// unless the textarea is multi-line, make the enter key trigger the 'change' event
	remapEnter($textarea, $textarea.hasAttribute('multi-line'))

	// if the window resizes horizontally, update the textarea's display heights
	window.addEventListener('resize',()=>{
		if(window.oldInnerWidth !== window.innerWidth) {
			$$('textarea').forEach(dispatchInput)
			window.oldInnerWidth = window.innerWidth
		}
	})
}
/**
 * Programmatically trigger the 'input' event on an element
 * @param {Element} $element
 */
async function dispatchInput($element){
	$element.dispatchEvent(new Event('input'))
}
/**
 * Programmatically trigger the 'change' event on an element
 * @param {Element} $element 
 */
async function dispatchChange($element){
	$element.dispatchEvent(new Event('change'))
}
/**
 * Assign the enter key to trigger the 'change' event
 * @param {Element} $input 
 */
function remapEnter($input,needCtrl=false){
	$input.addEventListener('keydown',event=>{
		if( event.key!=='Enter' || ( needCtrl && !event.ctrlKey ) ) return
		event.preventDefault()
		$input.blur()
		return false
	})
}
