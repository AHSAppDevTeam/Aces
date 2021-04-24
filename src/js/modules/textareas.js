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
	if(!$textarea.hasAttribute('multi-line')) remapEnter($textarea)

	// if the window resizes horizontally, update the textarea's display heights
	window.addEventListener('resize',()=>{
		if(window.oldInnerWidth !== window.innerWidth) {
			$$('textarea').forEach(updateTextarea)
			window.oldInnerWidth = window.innerWidth
		}
	})
}
/**
 * Programmatically trigger the 'input' event on a textarea
 * @param {Element} $textarea
 */
async function updateTextarea($textarea){
	$textarea.dispatchEvent(new Event('input'))
}
/**
 * Assign the enter key to trigger the 'change' event
 * @param {Element} $input 
 */
function remapEnter($input){
	$input.addEventListener('keydown',event=>{
		if(event.key!='Enter') return
		event.preventDefault()
		$input.blur()
		return false
	})
}
