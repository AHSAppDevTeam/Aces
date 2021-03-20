const $templatePreview = $`#template-preview`

function makePreview(){
	const $preview = $templatePreview.content.cloneNode(true).querySelector('article')
	updatePreview($preview,...arguments)
	return $preview
}

function updatePreview($preview,id,snippet){
	const $title = $('.title',$preview)
	$title.innerHTML = snippet.title
	$title.href = rot13(id)
	$('.featured',$preview).checked = snippet.featured
}