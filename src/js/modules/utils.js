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
