window.addEventListener('touchmove',(event)=>event.preventDefault())
$('#resize').addEventListener('pointerdown',({target})=>{
	target.focus()
	window.addEventListener('mousemove',resizeListener)
	window.addEventListener('touchmove',resizeListener)

	window.addEventListener('mouseup',removeResizeListener,{once:true})
	window.addEventListener('touchend',removeResizeListener,{once:true})
})
function resizeListener(event){
	$editor.style.width = (event.x||event.touches[0].pageX)/window.innerWidth*100+'vw'
	event.preventDefault()
}
function removeResizeListener(){
	window.removeEventListener('mousemove',resizeListener)
	window.removeEventListener('touchmove',resizeListener)
}