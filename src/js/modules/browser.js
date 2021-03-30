function makeGroup(type,id,title,children){
	const $group = $template(type)
	const $title = $('.title',$group)
	$title.id = id
	$title.href = '#'+id
	$title.innerHTML = title
	$group.append(...children)
	return $group
}

function makePreview(id,snippet){
	const $preview = $template('preview')

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
		postWebhook(rot13(id),($featured.checked ? '⭐ ' : '💔 ') + snippet.title,'')
	})

	updatePreview($preview,snippet)

	return $preview
}

function updatePreview($preview,snippet){
	$('.title',$preview).innerHTML = snippet.title
	$('.featured',$preview).checked = snippet.featured
}
