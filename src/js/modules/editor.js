let $editor, decorator
async function initEditor() {
	$editor = $('#editor')

	initHighlighter($('.markdown', $editor))

	$$('textarea',editor).forEach(initTextarea)

	$('.markdown', $editor).addEventListener('input', ({ target }) => {
		$('.body', $editor).innerHTML = md(target.value)
	})

	$('#render', $editor).addEventListener('click', ({ target }) => {
		const previewing = target.value == 'Preview'
		target.value = previewing ? 'Edit' : 'Preview'
		$editor.classList.toggle('render', previewing)
	})
	$('#upload', $editor).addEventListener('change', async ({ target: { files } }) => {
		const url_sets = await Promise.all(Array.from(files).map(imgbb))
		$('#media',$editor).prepend(...url_sets.map($thumb))
	})

	editArticle()
}
async function editArticle() {
	let id = window.location.pathname.split('/').pop() // Last portion of the path is the ID
	if (id.includes('.')) id = rot13(id) // A . indicates that the ID is ciphered.
	if (!id.includes('-')) return
	updateEditor(id)
	history.replaceState({}, '', id)
}

async function updateEditor(id) {
	const [
		article, markdown, notif
	] = await Promise.all([
		db('articles/' + id), db('markdowns/' + id), db('notifs/' + id)
	])

	if (!article) return false

	const story = Object.assign(default_story,article,notif,{markdown})
	document.title = story.title
	for (const property in story) {
		const $element = $('#' + property, $editor)
		if (!$element) continue
		const value = story[property]
		switch ($element.type) {
			case 'checkbox':
			case 'radio':
				$element.checked = value
				break
			case 'datetime-local':
				$element.value = timestamp_to_date(value)
				break
			default:
				$element.value = value
				break
		}
	}
	const url_sets = story.thumbURLs.map(
		(thumbURL,index) =>
		({
			thumb: thumbURL,
			image: story.videoIDs[index] || story.imageURLs[index-story.videoIDs.length]
		})
	)
	$('#media',$editor).replaceChildren(...url_sets.map($thumb))
	$$('textarea',$editor).forEach(updateTextarea)
}
function $thumb(url_set){
	const $thumb = $template('thumb')
	$thumb.dataset.thumb = url_set.thumb
	$thumb.dataset.image = url_set.image
	$('img',$thumb).src = url_set.thumb
	return $thumb
}
