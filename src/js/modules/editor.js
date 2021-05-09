async function initEditor() {
	const $editor = $('#editor')
	const $media = $('#media')
	const $categoryID = $('#categoryID')
	const $$textarea = $$('textarea',$editor)
	const $url = $('#url')
	const $markdownWrapper = $('#markdown-wrapper')

	addChangeListener($editor, async ({target}) => {
		switch(target.id){
			case 'upload':
				const urlSets = await Promise.all(Array.from(target.files).map(imgbb))
				$media.prepend(...urlSets.map($thumb))
				break
			case 'url':
				$media.prepend($thumb(await imgbb(target.value)))
				break
		}
		await publishStory()
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

	updateEditor()
	window.addEventListener('popstate',updateEditor)
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
			blurb: 'Notification text.',
			markdown: 'A *quick* brown **fox** jumps over a lazy [dog](https://en.wikipedia.org/wiki/Dog).'
		}
	}
}
async function updateEditor() {
	const id = urlID()
	history.replaceState({}, '', id)
	let story = await dbOnce('storys/' + id) || {}
	story = {...await storyTemplate(),...story}
	document.title = story.title
	syncStory(story,0)
	$$('#editor textarea').forEach(dispatchInput)
	$$('.preview.open').forEach($preview=>$preview.classList.remove('open'))
	const $preview = $('#preview-'+id)
	$preview.classList.add('open')
	$preview.scrollIntoView()
}
async function legacyAddress(categoryID){
	return Object.entries(await dbLive('locations')).find(
		([,{categoryIDs}]) => categoryIDs.includes(categoryID)
	)[0] + '/' + categoryID
}
async function encodeStory(story){
	const params = new URLSearchParams(window.location.search)
	params.set('story',encodeURIComponent(JSON.stringify(story)))
	history.replaceState({}, '', `${id}?${params}`)
}
async function publishStory(){
	const id = urlID()
	const story = await storyTemplate()
	await syncStory(story,1)
	
	if(!user) return false
	const oldStory = {...story, ...await dbOnce('storys/'+id)}
	for(const type of ['story','article','snippet','notif']){
		if(type==='notif' && !story.notified) continue
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
		const categories = await dbLive('categories')
		const snippets = await dbLive('snippets')
		const siblingIDs = categories[story.categoryID].articleIDs
		const index = siblingIDs.findIndex(id=>snippets[id].timestamp < story.timestamp)
		index < 0 ? siblingIDs.push(id) : siblingIDs.splice(index,0,id)
		const oldSiblingIDs = categories[oldStory.categoryID].articleIDs.filter(x=>x!==id)
		dbWrite( 'categories/'+story.categoryID, {articleIDs: siblingIDs} )
		dbWrite( 'categories/'+oldStory.categoryID, {articleIDs: oldSiblingIDs} )
		dbWrite( await legacyAddress(oldStory.categoryID), { [id]: null}, true )
	}
	discord(id,'✏️ '+story.title,diff(story,oldStory))
	return true
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
	const $media = $('#media')
	$thumb.dataset.media = JSON.stringify(urlSet)
	$('img',$thumb).src = urlSet.thumbURL
	$('.delete',$thumb).addEventListener('click',()=>{
		$thumb.remove()
		dispatchChange($('#editor'))
	},{once:true})
	$('.move-ahead',$thumb).addEventListener('click',()=>{
		if($thumb.previousSibling) $media.insertBefore($thumb,$thumb.previousSibling)
		dispatchChange($media)
	})
	$('.move-behind',$thumb).addEventListener('click',()=>{
		if($thumb.nextSibling) $media.insertBefore($thumb.nextSibling,$thumb)
		dispatchChange($media)
	})
	$thumb.addEventListener('dragover',event=>event.preventDefault())
	$thumb.addEventListener('dragstart',()=>$thumb.classList.add('dragged'))
	$thumb.addEventListener('drop',()=>{
		const $dragged = ('.dragged',$media)
		$dragged.classList.remove('dragged')
		$media.insertBefore($thumb,$dragged)
		dispatchChange($media)
	})
	return $thumb
}
