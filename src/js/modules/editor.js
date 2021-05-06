async function initEditor() {
	const $editor = $('#editor')
	const $media = $('#media')
	const $categoryID = $('#categoryID')
	const $$textarea = $$('textarea',$editor)
	const $url = $('#url')
	const $markdownWrapper = $('#markdown-wrapper')

	$editor.addEventListener('change',async ({target}) => {
		switch(target.id){
			case 'upload':
				const urlSets = await Promise.all(Array.from(target.files).map(imgbb))
				$media.prepend(...urlSets.map($thumb))
				break
			case 'url':
				$media.prepend($thumb(await imgbb(target.value)))
				break
		}
		publishStory(target)
	})

	initHighlighter($markdownWrapper)
	$$textarea.forEach(initTextarea)
	remapEnter($url)
	
	const [locationIDs,locations,categories] = await Promise.all([
		dbLive('locationIDs'),dbLive('locations'),dbLive('categories')
	])
	$categoryID.replaceChildren(...locationIDs.filter(id=>id in locations).map(id=>{
		const $group = document.createElement('optgroup')
		$group.setAttribute('label',locations[id].title)
		$group.append(...locations[id].categoryIDs.filter(id=>id in categories).map(id=>{
			const $option = document.createElement('option')
			$option.value = id
			$option.textContent = categories[id].title
			return $option
		}))
		return $group
	}))	

	editArticle()
	window.addEventListener('popstate',editArticle)
}
async function editArticle() {
	let id = window.location.pathname.split('/').pop() // Last portion of the path is the ID
	if (id.includes('.')) id = rot13(id) // A . indicates that the ID is ciphered.
	if (!id.includes('-')) id = makeID()
	updateEditor(id)
}
async function storyTemplate(){
	const schema = (await dbLive('schemas')).story
	const template = {}
	for (const key in schema)
		template[key] = {
			'Array<String>': [],
			'String': '',
			'Boolean': false,
			'Int': 0,
		}[schema[key]]
	return {
		...template,
		...{
			title: 'Untitled Article',
			author: 'Content Editors',
			timestamp: timestamp(),
			notifTimestamp: timestamp(),
			categoryID: 'Drafts',
			blurb: 'You will not believe what this fox did!',
			markdown: 'A *quick* brown **fox** jumps over a lazy [dog](https://en.wikipedia.org/wiki/Dog).'
		}
	}
}
async function updateEditor(id) {
	history.replaceState({}, '', id)
	let story = await dbOnce('storys/' + id) || {}
	story = {...await storyTemplate(),...story}
	document.title = story.title
	syncStory(story,0)
	$$('#editor textarea').forEach(dispatchInput)
}
async function legacyAddress(categoryID){
	return Object.entries(await dbLive('locations')).find(
		([,{categoryIDs}]) => categoryIDs.includes(categoryID)
	)[0] + '/' + categoryID
}
async function publishStory(target){
	target.parentElement.classList.add('changed')
	const id = window.location.pathname.split('/').pop()
	const story = await storyTemplate()
	await syncStory(story,1)
	history.replaceState({}, '', id+'?state='+encodeURIComponent(JSON.stringify(story)))
	if(!user) return
	const oldStory = {...story, ...await dbOnce('storys/'+id)}
	for(const type of ['story','article','snippet','notif']){
		const keys = Object.keys((await dbLive('schemas'))[type])
		const object = Object.fromEntries(
			Object.entries(story).filter(([key])=>keys.includes(key))
		)
		dbWrite(type+'s',{[id]: object})
	}
	
	const legacyMap = (await dbLive('schemas')).legacy
	const legacyStory = {
		...Object.fromEntries(
			Object.entries(story)
			.filter(([key])=>key in legacyMap)
			.map(([key,value]) => [legacyMap[key],value])
		),
		...{
			hasHTML: true,
		}
	}
	dbWrite( await legacyAddress(story.categoryID), {[id]: legacyStory}, true)

	if(story.categoryID !== oldStory.categoryID){
		const storySiblingIDs = (await dbLive('categories'))
			[story.categoryID]
			.articleIDs
			.concat([id])
			.sort(async (a,b)=>(
				(await dbLive('snippets'))[a].timestamp
				-
				(await dbLive('snippets'))[b].timestamp
			))
		const oldStorySiblingIDs = (await dbLive('categories'))
			[oldStory.categoryID]
			.articleIDs
			.filter(x=>x!==id)
		dbWrite( 'categories/'+story.categoryID, {articleIDs: storySiblingIDs} )
		dbWrite( 'categories/'+oldStory.categoryID, {articleIDs: oldStorySiblingIDs} )
		dbWrite( await legacyAddress(oldStory.categoryID), { [id]: null}, true )
	}
	discord(id,'✏️ '+story.title,diff(story,oldStory))
	target.parentElement.classList.remove('changed')
}

function diff(newer,older){
	return Object.keys({...newer,...older}).map(key=>{
		switch((key in newer)-(key in older)){
			case 1:
				return 'Created '+key
			case 0:
				return JSON.stringify(newer[key]) === JSON.stringify(older[key])
				? null : 'Modified '+key
			case -1:
				return 'Deleted '+key
		}
	}).filter(x=>x).join('\n')
}
async function syncStory(story,direction){
	for(const property in story){
		const $element = $('#' + property, $('#editor'))
		if (!$element) continue
		switch ($element.type) {
			case 'checkbox':
			case 'radio':
				direction
				? story[property] = $element.checked
				: $element.checked = story[property]
				break
			case 'datetime-local':
				direction
				? story[property] = ISOStringToTimestamp($element.value)
				: $element.value = timestampToISOString(story[property])
				break
			default:
				direction
				? story[property] = typography($element.value)
				: $element.value = story[property]
				break
		}
	}
	if(direction) {
		story.date = timestampToHumanString(story.timestamp)
		story.body = md(story.markdown)
		story.videoIDs = []
		story.imageURLs = []
		story.thumbURLs = []
		$$('#media>.thumb').forEach( ({dataset}) => {
			const {thumbURL, imageURL, videoID} = JSON.parse(dataset.media)
			story.thumbURLs.push(thumbURL)
			if(imageURL) story.imageURLs.push(imageURL)
			if(videoID) story.videoIDs.push(videoID)
		})
	} else {
		const urlSets = story.thumbURLs.map(
			(thumbURL,index) =>
			({
				thumbURL,
				videoID: story.videoIDs[index],
				imageURL: story.imageURLs[index-story.videoIDs.length],
			})
		)
		$('#media').replaceChildren(...urlSets.map($thumb))
	}
}
function $thumb(urlSet){
	const $thumb = $template('thumb')
	$thumb.dataset.media = JSON.stringify(urlSet)
	$('img',$thumb).src = urlSet.thumbURL
	$('.close',$thumb).addEventListener('click',()=>{
		$thumb.remove()
		dispatchChange($('#editor'))
	},{once:true})
	return $thumb
}
