const timestamp = () => Math.floor(Date.now()/1000)

/**
 * Shifts every character 13 places down the alphabet; swaps - and .
 * @param {string} string 
 * @returns {string}
 */
const rot13 = string => string.replace(/[a-z]/gi,c=>'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm.-'['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-.'.indexOf(c)])

/**
 * Brackets an ID by its type
 * @param {string} id 
 * @param {string} type
 * @returns {string} bracketed ID
 */
const bracket = (id,type) => {
	let brackets = type == 'location' ? '{}'
	: type == 'category' ? '[]'
	: type == 'article' ? '<>'
	: '""'
	return brackets[0] + id + brackets[1]	
}

/**
 * 
 * @returns {number} Timezone offset in seconds
 */
const offset = () => new Date().getTimezoneOffset()*60

/**
 * 
 * @param {number} timestamp Unix timestamp in seconds 
 * @returns {string} ISO datetime string
 */
const timestampToDate = timestamp => new Date((timestamp + offset())*1000).toISOString().slice(0,16)

/**
 * 
 * @param {string} date ISO datetime string
 * @returns {number} Unix timestamp in seconds 
 */
const dateToTimestamp = date => Math.trunc(new Date(date).getTime()/1000) - offset()

/**
 * 
 * @param {array} array array
 * @returns {*} random element of the array
 */
const randomElement = array => array[Math.floor(Math.random()*array.length)]
