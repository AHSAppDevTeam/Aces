let $editor, decorator
async function initEditor() {
	$editor = $('#editor')

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
		$('#media',$editor).prepend(...urlSets.map($thumb))
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
	const storySchema = await db('schemas/story')
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
	const story = await db('storys/' + id)

	if (!story) return false

	Object.assign(story, await storyTemplate())
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
	$$('textarea',$editor).forEach(updateTextarea)
}
async function publishStory(){
	const id = window.location.pathname.split('/').pop()
	const story = await storyTemplate()
	await syncStory(story,1)
	for(const type of ['article','snippet','notif']){
		const keys = Object.keys(await db('schemas/'+type))
		const object = Object.fromEntries(
			Object.entries(story).filter(([key])=>keys.includes(key))
		)
		db(type+'s/'+id,object)
	}
	discord(id,'✏️'+story.title,JSON.stringify(story))
}
async function syncStory(story,direction){
	for(const property in story){
		const $element = $('#' + property, $editor)
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
