const get_timestamp = async () => Math.floor(Date.now()/1000)
const rot13 = string => string.replace(/[a-z]/gi,c=>'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm.-'['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-.'.indexOf(c)])
const bracket = (id,type) => {
	let brackets = type == 'location' ? '{}'
	: type == 'category' ? '[]'
	: type == 'article' ? '<>'
	: '""'
	return brackets[0] + id + brackets[1]	
}
