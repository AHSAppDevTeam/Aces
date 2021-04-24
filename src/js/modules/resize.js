async function initResize(){
	const $resize = $('#resize')
	$resize.addEventListener('pointerdown',()=>$resize.focus())
	window.addEventListener('pointermove',(event)=>{
		if($resize !== document.activeElement) return
		$('#editor').style.width = (event.x-$resize.offsetWidth/2)/window.innerWidth*100+'vw'
		$$('textarea').forEach(updateTextarea)
		event.preventDefault()
	})
	window.addEventListener('pointerup',()=>$resize.blur())
}
