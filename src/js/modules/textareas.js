async function initTextarea($textarea){
	$textarea.setAttribute('rows',1)
	$textarea.addEventListener('input',()=>{
		$textarea.style.height = 'auto'
		$textarea.style.height = $textarea.scrollHeight+'px'
	})

	if(!$textarea.hasAttribute('multi-line')) remapEnter($textarea)
}
async function updateTextarea($textarea){
	$textarea.dispatchEvent(new Event('input'))
}
function remapEnter($input){
	$input.addEventListener('keydown',event=>{
		if(event.key!='Enter') return
		event.preventDefault()
		$input.blur()
		return false
	})
}
