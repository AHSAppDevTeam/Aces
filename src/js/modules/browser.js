import {
	ref, onValue
} from 'firebase/database'
import { ldb, db } from '../config'
import { $, $$, $template, addChangeListener } from './dom'
import { initTextarea } from './inputs'

export async function browserinit() {
	onValue(ref(db, "snippets"), (snap) => {
		ldb.snippets = snap.val()
		updateBrowser()
	})
	onValue(ref(db, "categories"), (snap) => {
		ldb.categories = Object.fromEntries(
			Object.entries(snap.val())
				.sort(([, a], [, b]) => a.sort - b.sort)
		)
		updateBrowser()
	})
	$('#search').addEventListener('input', ({ target: { value: query } }) => {
		$$('.preview>.title', $('#browser')).forEach($title => {
			const $preview = $title.parentElement
			const show = query ? $title.textContent.toLowerCase().includes(query.toLowerCase()) : true
			show ? $preview.removeAttribute('hidden') : $preview.setAttribute('hidden', '')
		})
	})
	$('#sources').addEventListener('click', async () => {
		Object.values(await dbOnce('sources')).forEach(
			url => window.open(url, '_blank')
		)
	})
	$('#new').addEventListener('click', async () => {
		history.pushState({}, '', makeID())
		updateEditor()
	})
}
async function updateBrowser() {
	if (!(ldb.categories && ldb.snippets)) return false
	const $browser = $('#browser')
	$browser.replaceChildren(
		$browser.firstElementChild,
		...Object.entries(ldb.categories)
			.map(([id, category]) => makeGroup('category', id, category,
				(category.articleIDs || [])
					.filter(id => id in ldb.snippets)
					.map(id => makePreview(id, ldb.snippets[id])
					))))

	$$('textarea', $browser).forEach(initTextarea)
}
function makeGroup(
	type, id,
	{ title, color },
	children,
) {
	const parent = {
		'category': 'categories',
		'location': 'locations',
	}[type]

	const $group = $template(type)

	const $id = $('.id', $group)
	$id.id = id
	$id.href = '#' + id
	$id.innerHTML = '#' + id

	const $title = $('.title', $group)
	$title.value = title
	addChangeListener($title, ({ target: { value: title } }) =>
		dbWrite(parent + '/' + id, { title })
	)

	if (type == 'category') {
		const $color = $('.color', $group)
		$color.value = color
		addChangeListener($color, ({ target: { value: color } }) =>
			dbWrite(parent + '/' + id, { color })
		)
	}

	$group.append(...children)

	return $group
}

function makePreview(id, snippet) {
	const $preview = $template('preview')

	$preview.id = 'preview-' + id

	const $title = $('.title', $preview)
	$title.addEventListener('click', async (event) => {
		document.title = snippet.title
		history.pushState({}, '', id)
		updateEditor()
		event.preventDefault()
	})
	$title.href = id

	const $featured = $('.featured', $preview)
	addChangeListener($featured, async ({ target: { checked: featured } }) =>
		dbWrite('inputs/' + id, { featured })
	)

	const $archived = $('.archived', $preview)
	addChangeListener($archived, async ({ target: { checked: archived } }) =>
		dbWrite('inputs/' + id, { categoryID: archived ? 'archived' : 'drafts' })
	)

	updatePreview($preview, snippet)

	return $preview
}

function updatePreview($preview, snippet) {
	$('.title', $preview).innerHTML = snippet.title || 'Untitled Article'
	$('.featured', $preview).checked = snippet.featured
	$('.media', $preview).replaceChildren(...(snippet.thumbURLs || []).map(thumbURL => {
		const $img = document.createElement('img')
		$img.src = thumbURL
		$img.loading = 'lazy'
		$img.alt = ''
		return $img
	}))
}
