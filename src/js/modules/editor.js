async function initEditor() {
	const $editor = $('#editor')

	initHighlighter($('#markdown-wrapper'))
	$$('textarea',$editor).forEach(initTextarea)

	$('#markdown').addEventListener('input', ({ target: { value } }) => {
		$('#body').innerHTML = md(value)
	})
	$('#render').addEventListener('click', ({ target }) => {
		const previewing = target.value == 'Preview'
		target.value = previewing ? 'Edit' : 'Preview'
		$editor.classList.toggle('render', previewing)
	})
	$('#upload').addEventListener('change', async ({ target: { files } }) => {
		const urlSets = await Promise.all(Array.from(files).map(imgbb))
		$('#media').prepend(...urlSets.map($thumb))
	})
	$('#publish').addEventListener('click',publishStory)
	remapEnter($('#url'))

	editArticle()
}
async function editArticle() {
	let id = window.location.pathname.split('/').pop() // Last portion of the path is the ID
	if (id.includes('.')) id = rot13(id) // A . indicates that the ID is ciphered.
	if (!id.includes('-')) return
	updateEditor(id)
	history.replaceState({}, '', id)
}
async function storyTemplate(){
	const storySchema = (await dbLive('schemas')).story
	const storyTemplate = {}
	for (const property in storySchema) {
		storyTemplate[property] = {
			'Array<String>': [],
			'String': '',
			'Boolean': false,
			'Int': 0,
		}[storySchema[property]]
	}
	return storyTemplate
}
async function updateEditor(id) {
	let story = await dbOnce('storys/' + id)

	if (!story) return false

	story = {...await storyTemplate(),...story}
	document.title = story.title
	syncStory(story,0)
	const urlSets = story.thumbURLs.map(
		(thumbURL,index) =>
		({
			thumbURL,
			videoID: story.videoIDs[index],
			imageURL: story.imageURLs[index-story.videoIDs.length],
		})
	)
	$('#media').replaceChildren(...urlSets.map($thumb))
	$$('#editor textarea').forEach(updateTextarea)
	const [locationIDs,locations,categories] = await Promise.all([
		dbLive('locationIDs'),dbLive('locations'),dbLive('categories')
	])
	$('#categoryID').replaceChildren(...locationIDs.filter(id=>id in locations).map(id=>{
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
}
async function publishStory(){
	const id = window.location.pathname.split('/').pop()
	const story = await storyTemplate()
	const oldStory = {...story, ...await dbOnce('storys/'+id)}
	await syncStory(story,1)
	for(const type of ['story','article','snippet','notif']){
		const keys = Object.keys((await dbLive('schemas'))[type])
		const object = Object.fromEntries(
			Object.entries(story).filter(([key])=>keys.includes(key))
		)
		dbWrite(type+'s/'+id,object)
	}
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
		dbWrite( 'categories/'+story.categoryID+'/articleIDs', storySiblingIDs )
		dbWrite( 'categories/'+oldStory.categoryID+'/articleIDs', oldStorySiblingIDs )
	}
	discord(id,'✏️ '+story.title,diff(story,oldStory))
}
function diff(newer,older){
	return Object.keys({...newer,...older}).map(key=>{
		switch((key in newer)-(key in older)){
			case 1:
				return 'Created '+key
			case 0:
				return newer[key] === older[key]
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
				? story[property] = dateToTimestamp($element.value)
				: $element.value = timestampToDate(story[property])
				break
			default:
				direction
				? story[property] = $element.value
				: $element.value = story[property]
				break
		}
	}
}
function $thumb(urlSet){
	const $thumb = $template('thumb')
	$thumb.dataset.thumbURL = urlSet.thumbURL
	$thumb.dataset.imageURL = urlSet.imageURL
	$thumb.dataset.videoID = urlSet.videoID
	$('img',$thumb).src = urlSet.thumbURL
	return $thumb
}
