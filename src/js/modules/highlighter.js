async function initHighlighter($section){
	const input = $('.input',$section)
	const output = $('.output',$section)
	const syntax = {
		link: /(!?(\[.*?\]\((https?\:\/\/|mailto).*?\))|((https?\:\/\/|mailto)\S*))/gm,
		bold: /([*_])\1.+?\1\1/gm,
		italic: /([*_]).+?\1/gm,
		strike: /(~~).+?\1/gm,
		hr: /\s{0,3}([-+* ]{3,})$/gm,
		heading: /^#{1,6}.+$/gm,
		list: /^((\d+\.)|[-+*]).+$/gm,
	}
	input.addEventListener('input',async ()=>{
		let buffer = output.textContent = input.value
		for(const key in syntax){
			const regex = syntax[key]
			buffer = buffer.replace(regex,match=>
				encodeURIComponent(`<span class=${key}>${match}</span>`) // encode reserved characters
				.replace(/[-_.!~*'()]/g,char=>`&#${char.charCodeAt()};`) // encode unreserved characters
			)
		}
		for(const key in syntax){
			buffer = decodeURIComponent(buffer)
		}
		output.innerHTML = buffer
	})
}
