
////////////
/* RESIZE */
////////////

const resize = document.querySelector('.resize')
resize.addEventListener('pointerdown',_=>{
	document.body.style.pointerEvents = document.body.style.userSelect = 'none'
	resize.focus()
	window.addEventListener('pointerup',event=>{
		editor.style.width = event.x/window.innerWidth*100+'vw'
		document.body.style.pointerEvents = document.body.style.userSelect = 'auto'
	}, {once:true})
})
