/**
 * Initiates the resize bar
 */
import { $, $$ } from './dom'
export async function init(){
	let x
	
	// resize bar
	const $resize = $('#resize')

	// resize preview ghost
	const $ghost = $('#resize-ghost')

	// left panel
	const $editor = $('#editor')

	// focus the resize bar if a mouse clicks or finger touches it 
	$resize.addEventListener('pointerdown',()=>$resize.focus())

	// watch for mouse or finger movement
	window.addEventListener('pointermove',(event)=>{
		// checks if the resize bar is focused, if not then do nothing
		if($resize == document.activeElement) {
			x = (event.x-$resize.offsetWidth/2)/window.innerWidth*100 + 'vw'
			$ghost.style.transform = 'translateX(' + x + ')'
		}
	})

	// unfocus the resize bar if the mouse click or finger dragging ends
	window.addEventListener('pointerup',()=>{
		$resize.blur()
		
		// resize the left panel so the resize bar is horizontally centered under the pointer
		$editor.style.width = x

		// the resized textareas need to have their line wrapping adjusted
		$$('textarea').forEach(dispatchInput)
		
		// prevent default behaviors which may accidentally other stuff
		event.preventDefault()
	})
}
