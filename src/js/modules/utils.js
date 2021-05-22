const timestamp = () => Math.trunc(Date.now()/1000)

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

/**
 * Returns list of properties whose values are different between two objects 
 * @param {Object} a 
 * @param {Object} b 
 * @returns {Array}
 */
const diff = (a,b) => Object.keys({ ...a, ...b })
.filter( k => JSON.stringify(a[k]||0) !== JSON.stringify(b[k]||0) )

/**
 * Returns a formatted list of properties and their before and after values
 * @param {Object} a 
 * @param {Object} b 
 * @returns {String}
 */
const formattedDiff = (a,b) => diff(a,b)
.map( k =>
  [k,a[k],b[k]]
  .map( s => s === undefined ? null : s )
  .map( JSON.stringify )
  .map( s => s.length > 16 ? s.substring(0,16) + '...' : s )
)
.map(([k,a,b])=>`${k}: ${a} → ${b}`)
.join('\n')
