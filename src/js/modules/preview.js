const $templatePreview = $('#template-preview')

function makePreview(snippet){
	const $preview = $templatePreview.content.cloneNode(true).querySelector('article')

	$preview.id = 'preview-'+snippet.id

	const $title = $('.title',$preview)
	$title.addEventListener('click',event=>{
		document.title = snippet.title
		history.pushState({}, '', rot13(snippet.id))
		editArticle()
		event.preventDefault()		
	})
	$title.href = rot13(snippet.id)

	const $featured = $('.featured',$preview)
	$featured.addEventListener('change',()=>{
		const featured = {featured:$featured.checked}
		db('snippets/'+snippet.id,featured)
		db('articles/'+snippet.id,featured)
		postWebhook(rot13(snippet.id),($featured.checked ? '⭐ ' : '💔 ') + snippet.title,'')
	})

	updatePreview($preview,snippet)

	return $preview
}

function updatePreview($preview,snippet){
	$('.title',$preview).innerHTML = snippet.title
	$('.featured',$preview).checked = snippet.featured
}