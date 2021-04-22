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

	const story = Object.assign(article,notif,{markdown})
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
	$('#media',$editor).replaceChildren(...(story.thumbURLs||[]).map(url=>{
		const $thumb = $template('thumb')
		$('img',$thumb).src = url
		return $thumb
	}))
	$$('textarea',$editor).forEach(updateTextarea)
}
