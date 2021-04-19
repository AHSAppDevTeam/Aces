function makeGroup(
	type, id,
	{ title, colorLightMode, colorDarkMode },
	children,
){
	const parent = {
		'category': 'categories',
		'location': 'locations',
	}[type]

	const $group = $template(type)

	const $id = $('.id',$group)
	$id.id = id
	$id.href = '#'+id
	$id.innerHTML = '#'+id

	$title = $('.title',$group)
	$title.value = title
	$title.addEventListener('change',({target:{value:title}})=>{
		db(parent+'/'+id,{title})
		postWebhook('#'+id,`➡️ renamed ${type} <${id}> to ${title}`)
	})

	if(type=='category'){
		$('.color-light-mode',$group).value = colorLightMode
		$('.color-dark-mode',$group).value = colorDarkMode
	}

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
	$featured.addEventListener('change',({target:{checked:featured}})=>{
		db('snippets/'+id,{featured})
		db('articles/'+id,{featured})
		postWebhook(rot13(id),(featured ? '⭐ ' : '💔 ') + snippet.title)
	})

	updatePreview($preview,snippet)

	return $preview
}

function updatePreview($preview,snippet){
	$('.title',$preview).innerHTML = snippet.title
	$('.featured',$preview).checked = snippet.featured
}
