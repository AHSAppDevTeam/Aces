function fetchBrowserResources(callback){
	return ['locationIDs','locations','categories','snippets'].map(item=>dbLive(item,callback))
} 
async function initBrowser(){	
	await Promise.all(fetchBrowserResources(updateBrowser))
	Object.assign(navigator.serviceWorker.subscriptionList,{
		locationsIDs: updateBrowser,
		locations: updateBrowser,
		categories: updateBrowser,
		snippets: updateBrowser,
	})
	updateBrowser()
	$('#search').addEventListener('input',({target:{value:query}})=>{
		$$('.preview>h4>.title',$('#browser')).forEach($title=>{
			const $preview = $title.parentElement.parentElement
			const show = query ? $title.textContent.toLowerCase().includes(query.toLowerCase()) : true
			show ? $preview.removeAttribute('hidden') : $preview.setAttribute('hidden','')
		})
	})
}
async function updateBrowser(){
	const $browser = $('#browser')
	const [ locationIDs, locations, categories, snippets ] =
	await Promise.all(fetchBrowserResources())
	
	$browser.replaceChildren(
		$browser.firstElementChild,
		...locationIDs
			.filter(id=>id in locations)
			.map(id=>makeGroup('location', id, locations[id], locations[id].categoryIDs
				.filter(id=>id in categories)
				.map(id=>makeGroup('category', id, categories[id], categories[id].articleIDs
					.filter(id=>id in snippets)
					.map(id=>makePreview(id, snippets[id])
	))))))

	$$('textarea',$browser).forEach(initTextarea)
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
		dbWrite(parent+'/'+id,{title})
		discord('#'+id,`➡️ \`${bracket(id,type)}\` ${title}`)
	})

	if(type=='category'){
		const $color = $('.color',$group) 
		$color.value = color
		$color.addEventListener('change',({target:{value:color}})=>{
			dbWrite(parent+'/'+id,{color})
			discord('#'+id,`🎨 \`${bracket(id,type)}\` ${color}`)
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
		dbWrite('snippets/'+id,{featured})
		dbWrite('articles/'+id,{featured})
		discord(id,(featured ? '⭐ ' : '💔 ') + snippet.title)
	})

	updatePreview($preview,snippet)

	return $preview
}

function updatePreview($preview,snippet){
	$('.title',$preview).innerHTML = snippet.title
	$('.featured',$preview).checked = snippet.featured
}
