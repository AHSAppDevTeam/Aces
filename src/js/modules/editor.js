/**
 * Initiates the editor panel
 */
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
		return publishStory()
	})

	initHighlighter($markdownWrapper)
	$$textarea.forEach(initTextarea)
	remapEnter($url)
	
	const [locationIDs,locations,categories] = await Promise.all([
		dbCache('locationIDs'),dbLive('locations'),dbLive('categories')
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

/**
 * Create a template story from the schemas.
 * @returns {Object} story
 */
async function storyTemplate(){
	const schema = (await dbCache('schemas')).story
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

/**
 * Update the editor with a new article ID from the URL
 */
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

/**
 * Get the address of a category in a legacy database
 * @param {string} categoryID 
 * @returns {string}
 */
async function legacyAddress(categoryID){
	return Object.entries(await dbLive('locations')).find(
		([,{categoryIDs}]) => categoryIDs.includes(categoryID)
	)[0] + '/' + categoryID
}

/**
 * Encode a story into the URL parameters string
 * @param {Object} story
 */
async function encodeStory(story){
	const params = new URLSearchParams(window.location.search)
	params.set('story',encodeURIComponent(JSON.stringify(story)))
	history.replaceState({}, '', `${id}?${params}`)
}

/**
 * Publish a story into the database
 * @returns {Promise[]} tasks
 */
async function publishStory(){
	if(!user) return []
	const tasks = []

	const id = urlID()
	const story = await syncStory( await storyTemplate() ,1)

	const oldStory = ( await dbOnce('storys/'+id) ) || {}
	const changes = diff(oldStory,story)
	const formattedChanges = formattedDiff(oldStory,story)
	
	for(const type of ['story','article','snippet','notif']){
		if(type==='notif' && !story.notified) continue
		const keys = Object.keys((await dbCache('schemas'))[type])
		const object = Object.fromEntries(
			Object.entries(story).filter(([key])=>keys.includes(key))
		)
		tasks.push(dbWrite(type+'s',{[id]: object}))
	}
	
	const legacyMap = (await dbCache('schemas')).legacy
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
	tasks.push(dbWrite( await legacyAddress(story.categoryID), {[id]: legacyStory}, true))

	console.log(story.timestamp)
	if( changes.includes('timestamp') || changes.includes('categoryID') ){
		const categories = await dbLive('categories')
		const snippets = await dbLive('snippets')
		const siblingIDs = categories[story.categoryID].articleIDs.filter(x=>x!==id)
		const index = siblingIDs.findIndex(id=>snippets[id].timestamp < story.timestamp)
		index < 0 ? siblingIDs.push(id) : siblingIDs.splice(index,0,id)
		tasks.push( dbWrite( 'categories/'+story.categoryID, {articleIDs: siblingIDs} ) )
		if( changes.includes('categoryID') && 'categoryID' in oldStory ) {
			const oldSiblingIDs = categories[oldStory.categoryID].articleIDs.filter(x=>x!==id)
			tasks.push(
				dbWrite( 'categories/'+oldStory.categoryID, {articleIDs: oldSiblingIDs} ),
				dbWrite( await legacyAddress(oldStory.categoryID), { [id]: null}, true ),
			)
		}
	}
	tasks.push(discord(id,'✏️ '+story.title,formattedChanges))
	return tasks
}

/**
 * Create a story object out of some data
 * @param {Object} story 
 * @param {Int} direction 0: from database, 1: from editor 
 */
async function syncStory(base,direction){
	let story = {...base}
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
				? story[property] = LocalISOStringToTimestamp($element.value)
				: $element.value = timestampToLocalISOString(story[property])
				break
			default:
				direction
				? story[property] = typography($element.value)
				: $element.value = story[property]
				break
		}
	}
	if(direction) {
		story.date = timestampToLocalHumanString(story.timestamp)
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
	return story
}

/**
 * Create a thumbnail element from a set of image URLs
 * @param {Object} urlSet 
 * @returns {Element}
 */
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
