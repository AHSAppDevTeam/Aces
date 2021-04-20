async function initBrowser(){
	const $browser = $('#browser')

	const [ locationIDs, locations, categories, snippets ] =
	await Promise.all([ 
		db('locationIDs'), db('locations'), db('categories'), db('snippets')
	])
	
	$browser.append(
		...locationIDs
			.map(id=>makeGroup('location', id, locations[id], locations[id].categoryIDs
				.map(id=>makeGroup('category', id, categories[id], categories[id].articleIDs
					.map(id=>makePreview(id, snippets[id])
	))))))

	$$('textarea',$browser).forEach(initTextarea)
}
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
		postWebhook('#'+id,`➡️ ${bracket(id,type)} ➡️ ${title}`)
	})


	if(type=='category'){

		$colorLightMode = $('.color-light-mode',$group) 
		$colorDarkMode = $('.color-dark-mode',$group)

		$colorLightMode.value = colorLightMode
		$colorDarkMode.value = colorDarkMode

		$colorLightMode.addEventListener('change',({target:{value:colorLightMode}})=>{
			db(parent+'/'+id,{colorLightMode})
			postWebhook('#'+id,`🎨 ${bracket(id,type)} 🎨 ${colorLightMode} 🏙`)
		})
		$colorDarkMode.addEventListener('change',({target:{value:colorDarkMode}})=>{
			db(parent+'/'+id,{colorDarkMode})
			postWebhook('#'+id,`🎨 ${bracket(id,type)} 🎨 ${colorDarkMode} 🌃`)
		})
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
		history.pushState({}, '', id)
		editArticle()
		event.preventDefault()		
	})
	$title.href = id

	const $featured = $('.featured',$preview)
	$featured.addEventListener('change',({target:{checked:featured}})=>{
		db('snippets/'+id,{featured})
		db('articles/'+id,{featured})
		postWebhook(id,(featured ? '⭐ ' : '💔 ') + snippet.title)
	})

	updatePreview($preview,snippet)

	return $preview
}

function updatePreview($preview,snippet){
	$('.title',$preview).innerHTML = snippet.title
	$('.featured',$preview).checked = snippet.featured
}
