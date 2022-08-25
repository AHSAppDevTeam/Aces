/**
 * Initates the markdown syntax highlighter on an element
 * @param {Element} $section
 */

import { $ } from './dom'
export async function init($section) {
	const input = $('.input', $section)
	const output = $('.output', $section)
	const syntax = {
		bold: /\*\*(.+?)\*\*/gm,
		italic: /\*(.+?)\*/gm,
		strike: /~~(.+?)~~/gm,
		hr: /\s{0,3}([-+* ]{3,})$/gm,
		heading: /^#{1,6}\s(.+)$/gm,
		link: /(!?\[.*?\]\((?:https?:\/\/|mailto:)\S*\)|\bhttps?:\/\/\S*|\b\S*@\S*?\.\S*)/gm,
		list: /^((\d+\.)|[-+*]).+$/gm,
	}
	input.addEventListener('input', async () => {
		let buffer = output.textContent = sanitize(input.value)
		for (const key in syntax) {
			const regex = syntax[key]
			buffer = buffer.replace(regex,
				(match, p1) =>
					`<span class=${key}>${escape(match.slice(0, match.indexOf(p1)))
					+
					p1
					+
					escape(match.slice(match.indexOf(p1) + p1.length))
					}</span>`
			)
		}
		output.innerHTML = buffer
	})
}
const sanitize = (string) => string.replace(/</g, '&lt;').replace(/>/g, '&gt;')
const escape = (string) => string.replace(/[-_.!~*"'()]/g, char => '&#' + char.charCodeAt() + ';')
