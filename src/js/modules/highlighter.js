async function initHighlighter($section){
	const input = $('.input',$section)
	const output = $('.output',$section)
	const syntax = {
		bold: /([*_])\1.+?\1\1/gm,
		italic: /([*_]).+?\1/gm,
		strike: /(~~).+?\1/gm,
		hr: /\s{0,3}([-+* ]{3,})$/gm,
		heading: /^#{1,6}\s.+$/gm,
		link: /(!?(\[.*?\]\((https?\:\/\/|mailto).*?\))|(https?\:\/\/\S*)|(\S+@\S+\.\S+))/gm,
		list: /^((\d+\.)|[-+*]).+$/gm,
	}
	input.addEventListener('input',async ()=>{
		let buffer = output.textContent = input.value
		for(const key in syntax){
			const regex = syntax[key]
			buffer = buffer.replace(regex,match=>
				`<span class=${key}>${
					match.replace(/[-_.!~*"'()]/g,char=>'&#'+char.charCodeAt()+';')
				}</span>`
			)
		}
		output.innerHTML = buffer
	})
}
