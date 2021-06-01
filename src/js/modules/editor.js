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
		if(!user) return false
		switch(target.id){
			case 'upload':
				const mediaSets = await Promise.all(Array.from(target.files).map(imgbb))
				$media.prepend(...mediaSets.map($thumb))
				delete target.files
				break
			case 'url':
				$media.prepend($thumb(await youtube(target.value) || await imgbb(target.value)))
				target.value = ''
				break
		}	
		const id = urlID()
		const templateStory = await storyTemplate()
		const story = await syncStory( templateStory, 1 )
		await dbWrite('storys',{[id]: story})
		return updateEditor()
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
 * @returns {Promise<Object>} story
 */
async function storyTemplate(){
	const schema = await dbCache('schemas/story')
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
			timestamp: roundedTimestamp(),
			notifTimestamp: roundedTimestamp(),
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
	$$('#preview-'+id).forEach($preview=>{
		$preview.classList.add('open')
		$preview.scrollIntoView()
	})
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
			case 'hidden':
				direction
				? story[property] = JSON.parse($element.value)
				: $element.value = JSON.stringify(story[property])
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
		story.editTimestamp = timestamp()
	} else {
		const mediaSets = story.thumbURLs.map(
			(thumbURL,index) =>
			({
				thumbURL,
				videoID: story.videoIDs[index],
				imageURL: story.imageURLs[index-story.videoIDs.length],
			})
		)
		$('#media').replaceChildren(...mediaSets.map($thumb))
	}
	return story
}

/**
 * Create a thumbnail element from a set of image URLs
 * @param {Object} mediaSet 
 * @returns {Element}
 */
function $thumb(mediaSet){
	const $thumb = $template('thumb')
	const $media = $('#media')
	$thumb.dataset.media = JSON.stringify(mediaSet)
	$('img',$thumb).src = mediaSet.thumbURL
	$('.delete',$thumb).addEventListener('click',()=>{
		$thumb.remove()
		dispatchChange($media)
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
