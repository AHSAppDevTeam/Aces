const $templatePreview = $`#template-preview`

function makePreview(id,snippet){
	const $preview = $templatePreview.content.cloneNode(true).querySelector('article')
	$('.title',$preview).addEventListener('click',event=>{
		document.title = 'Aces: '+snippet.title
		history.pushState({}, '', id)
		editArticle(id)
		event.preventDefault()		
	})
	updatePreview($preview,id,snippet)
	return $preview
}

function updatePreview($preview,id,snippet){
	const $title = $('.title',$preview)
	$title.innerHTML = snippet.title
	$title.href = rot13(id)
	$('.featured',$preview).checked = snippet.featured
}