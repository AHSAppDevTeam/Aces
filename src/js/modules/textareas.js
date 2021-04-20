async function initTextarea($textarea){
	$textarea.setAttribute('rows',1)
	$textarea.addEventListener('input',()=>{
		$textarea.style.height = 'auto'
		$textarea.style.height = $textarea.scrollHeight+'px'
	})

	if(!$textarea.hasAttribute('multi-line'))
		$textarea.addEventListener('keydown',(event)=>{
			if(event.key!='Enter') return
			event.preventDefault()
			$textarea.blur()
			return false
		})
	updateTextarea()
}
async function updateTextarea($textarea){
	$textarea.dispatchEvent(new Event('input'))
}
