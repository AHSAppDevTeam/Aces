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
 * @returns {Date} Date object
 */
const timestampToDate = timestamp => new Date((parseInt(timestamp) + offset())*1000)

const timestampToISOString = timestamp => timestampToDate(timestamp).toISOString().slice(0,19)

const timestampToHumanString = timestamp => timestampToDate(timestamp).toLocaleDateString(undefined, {
	weekday: 'long',
	month: 'long',
	day: 'numeric'
})

/**
 * 
 * @param {string} ISOString ISO datetime string
 * @returns {number} Unix timestamp in seconds 
 */
const ISOStringToTimestamp = ISOString => Math.trunc(new Date(ISOString+'Z').getTime()/1000) - offset()


/**
 * 
 * @param {array} array array
 * @returns {*} random element of the array
 */
const randomElement = array => array[Math.floor(Math.random()*array.length)]
