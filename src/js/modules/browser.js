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
	
	$('#search',$browser).addEventListener('input',({target:{value:query}})=>{
		$$('.preview>h4>.title',$browser).forEach($title=>{
			const $preview = $title.parentElement.parentElement
			const show = query ? $title.textContent.toLowerCase().includes(query.toLowerCase()) : true
			show ? $preview.removeAttribute('hidden') : $preview.setAttribute('hidden','')
		})
	})
}
function makeGroup(
	type, id,
	{ title, color },
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

	const $title = $('.title',$group)
	$title.value = title
	$title.addEventListener('change',({target:{value:title}})=>{
		db(parent+'/'+id,{title})
		postWebhook('#'+id,`➡️ \`${bracket(id,type)}\` ${title}`)
	})

	if(type=='category'){
		const $color = $('.color',$group) 
		$color.value = color
		$color.addEventListener('change',({target:{value:color}})=>{
			db(parent+'/'+id,{color})
			postWebhook('#'+id,`🎨 \`${bracket(id,type)}\` ${color}`)
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
