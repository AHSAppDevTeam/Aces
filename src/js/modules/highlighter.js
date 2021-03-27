function initHighlighter($section){
	const input = $('.input',$section)
	const output = $('.output',$section)
	const syntax = {
		bold: /([*_]{2}).*?\1/g,
		italic: /([*_]).?\1/g,
		strike: /(~{2}).*?\1/g,
		hr: /\s{0,3}([-+* ]{3,})$/g,
		heading: /^#{1,6} *.+|(^|\n).+\n[-=]+$/g,
		list: /^\s*((\d+\.)|[-+*])/g,
		link: /(!?(\[.*?\]\((https?\:\/\/|mailto).*?\))|((https?\:\/\/|mailto)\S*))/g,
	}
	input.addEventListener('input',()=>{
		output.textContent = input.value

		for(const key in syntax){
			const regex = syntax[key]
			output.innerHTML = output.innerHTML.replace(
				regex, `<span class=${key}>$&</span>`
			)
		}
	})
}
