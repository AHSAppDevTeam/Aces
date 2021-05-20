/**
 * Initiates the resize bar
 */
async function initResize(){
	// resize bar
	const $resize = $('#resize')

	// left panel
	const $editor = $('#editor')

	// focus the resize bar if a mouse clicks or finger touches it 
	$resize.addEventListener('pointerdown',()=>$resize.focus())

	// watch for mouse or finger movement
	window.addEventListener('pointermove',(event)=>{
		// checks if the resize bar is focused, if not then do nothing
		if($resize !== document.activeElement) return
		
		// resize the left panel so the resize bar is horizontally centered under the pointer
		$editor.style.width = (event.x-$resize.offsetWidth/2)/window.innerWidth*100+'vw'
		
		// the resized textareas need to have their line wrapping adjusted
		$$('textarea').forEach(dispatchInput)
		
		// prevent default behaviors which may accidentally other stuff
		event.preventDefault()
	})

	// unfocus the resize bar if the mouse click or finger dragging ends
	window.addEventListener('pointerup',()=>$resize.blur())
}
