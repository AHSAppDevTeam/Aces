const $templatePreview = $`#template-preview`

function makePreview(id,snippet){
	const $preview = $templatePreview.content.cloneNode(true).querySelector('article')

	$preview.id = 'preview-'+id

	const $title = $('.title',$preview)
	$title.addEventListener('click',event=>{
		document.title = snippet.title
		history.pushState({}, '', rot13(id))
		editArticle()
		event.preventDefault()		
	})
	$title.href = rot13(id)

	const $featured = $('.featured',$preview)
	$featured.addEventListener('change',()=>{
		const featured = {featured:$featured.checked}
		db('snippets/'+id,featured)
		db('articles/'+id,featured)
		postWebhook(id,($featured.checked ? '⭐ ' : '💔 ') + snippet.title,'')
	})

	updatePreview($preview,snippet)

	return $preview
}

function updatePreview($preview,snippet){
	$('.title',$preview).innerHTML = snippet.title
	$('.featured',$preview).checked = snippet.featured
}