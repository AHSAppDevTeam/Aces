/**
 * Initiates the editor panel
 */
import { ldb } from '../config'
import { $, $$, $template, addChangeListener } from './dom'
import { dbRead, dbWrite } from './network'
import {
	roundedTimestamp,
	LocalISOStringToTimestamp,
	timestampToLocalISOString
} from './time'
import { typography } from './typography'
import * as highlighter from './highlighter'
import { initTextarea } from './inputs'
import { remapEnter } from './inputs'
import { urlID } from './utils'
import { dispatchInput } from './inputs'

export async function editinit() {
	const $editor = $('#editor')
	const $media = $('#media')
	const $categoryID = $('#categoryID')
	const $$textarea = $$('textarea', $editor)
	const $url = $('#url')
	const $markdownWrapper = $('#markdown-wrapper')

	const templateStory = await storyTemplate()
	const story = await syncStory(templateStory, 1)
	$editor.addEventListener('input', async () => {
		$('#status').textContent = ['Drafts', 'Debug', 'Trash'].includes(story.categoryID)
			? 'new edits unsaved; old version in drafts'
			: 'new edits unsaved; old version published'
	})
	$('#status').textContent = ['Drafts', 'Debug', 'Trash'].includes(story.categoryID)
		? 'all edits saved in drafts'
		: 'all edits saved & published'

	addChangeListener($editor, async ({ target }) => {
		if (!user) return false
		switch (target.id) {
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
		const story = await syncStory(templateStory, 1)
		await dbWrite('inputs', { [id]: story })

		$('#status').textContent = ['Drafts', 'Debug', 'Trash'].includes(story.categoryID)
			? 'all edits saved in drafts'
			: 'all edits saved & published'

		return updateBrowser()
	})

	highlighter.init($markdownWrapper)
	$$textarea.forEach(initTextarea)
	remapEnter($url)

	$categoryID.replaceChildren(...Object.entries(ldb.categories).map(([id, category]) => {
		const $option = document.createElement('option')
		$option.value = id
		$option.textContent = category.title
		return $option
	}))

	updateEditor()
	window.addEventListener('popstate', updateEditor)
}

/**
 * Create a template story from the schemas.
 * @returns {Promise<Object>} story
 */
async function storyTemplate() {
	const schema = await dbRead("schemas/input")
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
			tags: [],
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
	let story = await dbRead('inputs/' + id) || {}
	story = { ...await storyTemplate(), ...story }
	document.title = story.title
	syncStory(story, 0)

	$('#status').textContent = ['Drafts', 'Debug', 'Trash'].includes(story.categoryID)
		? 'all edits saved in drafts'
		: 'all edits saved & published'

	$$('#editor textarea').forEach(dispatchInput)
	$$('.preview.open').forEach($preview => $preview.classList.remove('open'))
	$$('#preview-' + id).forEach($preview => {
		$preview.classList.add('open')
		$preview.scrollIntoView()
	})
}

/**
 * Encode a story into the URL parameters string
 * @param {Object} story
 */
async function encodeStory(story) {
	const params = new URLSearchParams(window.location.search)
	params.set('input', encodeURIComponent(JSON.stringify(story)))
	history.replaceState({}, '', `${id}?${params}`)
}

/**
 * Create a story object out of some data
 * @param {Object} story 
 * @param {Int} direction 0: from database, 1: from editor 
 */
async function syncStory(base, direction) {
	let story = { ...base }
	for (const property in story) {
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
	if (direction) {
		story.videoIDs = []
		story.imageURLs = []
		story.thumbURLs = []
		$$('#media>.thumb').forEach(({ dataset }) => {
			const { thumbURL, imageURL, videoID } = JSON.parse(dataset.media)
			story.thumbURLs.push(thumbURL)
			if (imageURL) story.imageURLs.push(imageURL)
			if (videoID) story.videoIDs.push(videoID)
		})
	} else {
		const mediaSets = story.thumbURLs.map(
			(thumbURL, index) =>
			({
				thumbURL,
				videoID: story.videoIDs[index],
				imageURL: story.imageURLs[index - story.videoIDs.length],
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
function $thumb(mediaSet) {
	const $thumb = $template('thumb')
	const $media = $('#media')
	$thumb.dataset.media = JSON.stringify(mediaSet)
	$('img', $thumb).src = mediaSet.thumbURL
	$('.delete', $thumb).addEventListener('click', () => {
		$thumb.remove()
		dispatchChange($media)
	}, { once: true })
	$('.move-ahead', $thumb).addEventListener('click', () => {
		if ($thumb.previousSibling) $media.insertBefore($thumb, $thumb.previousSibling)
		dispatchChange($media)
	})
	$('.move-behind', $thumb).addEventListener('click', () => {
		if ($thumb.nextSibling) $media.insertBefore($thumb.nextSibling, $thumb)
		dispatchChange($media)
	})
	$thumb.addEventListener('dragover', event => event.preventDefault())
	$thumb.addEventListener('dragstart', () => $thumb.classList.add('dragged'))
	$thumb.addEventListener('drop', () => {
		const $dragged = ('.dragged', $media)
		$dragged.classList.remove('dragged')
		$media.insertBefore($thumb, $dragged)
		dispatchChange($media)
	})
	return $thumb
}
