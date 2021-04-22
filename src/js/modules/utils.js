const getTimestamp = async () => Math.floor(Date.now()/1000)
const rot13 = string => string.replace(/[a-z]/gi,c=>'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm.-'['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-.'.indexOf(c)])
const bracket = (id,type) => {
	let brackets = type == 'location' ? '{}'
	: type == 'category' ? '[]'
	: type == 'article' ? '<>'
	: '""'
	return brackets[0] + id + brackets[1]	
}
const offset = () => new Date().getTimezoneOffset()*60
const timestampToDate = timestamp => new Date((timestamp + offset())*1000).toISOString().slice(0,16)
const dateToTimestamp = date => Math.trunc(new Date(date).getTime()/1000) - offset()
