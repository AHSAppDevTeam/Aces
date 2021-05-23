const timestamp = () => Math.trunc(Date.now()/1000/60)*60

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
const timezoneOffset = () => new Date().getTimezoneOffset()*60

/**
 * 
 * @param {number} timestamp Unix timestamp in seconds 
 * @returns {Date} Date object
 */
const timestampToLocalDate = timestamp => new Date((parseInt(timestamp) - timezoneOffset())*1000)

const timestampToLocalISOString = timestamp => timestampToLocalDate(timestamp).toISOString().slice(0,19)

const timestampToLocalHumanString = timestamp => timestampToLocalDate(timestamp).toLocaleDateString(undefined, {
	weekday: 'long',
	month: 'long',
	day: 'numeric'
})

/**
 * 
 * @param {string} ISOString ISO datetime string
 * @returns {number} Unix timestamp in seconds 
 */
const LocalISOStringToTimestamp = ISOString => Math.trunc(new Date(ISOString+'Z').getTime()/1000) + timezoneOffset()


/**
 * 
 * @param {array} array array
 * @returns {*} random element of the array
 */
const randomElement = array => array[Math.floor(Math.random()*array.length)]

const urlID = () => {
	let id = window.location.pathname.split('/').pop() // Last portion of the path is the ID
	if (id.includes('.')) id = rot13(id) // A . indicates that the ID is ciphered.
	if (!id.includes('-')) id = makeID()
	return id
}
