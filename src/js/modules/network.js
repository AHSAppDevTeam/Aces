/**
 * Sends an HTTP GET request
 * @param {string} path 
 * @param {Object} request 
 * @returns {json} response
 */
const post = async ( path, request ) => fetch(
	'https://'+path,
	{
		body: JSON.stringify(request),
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
	}	
)

/**
 * @typedef {Object} urlSet
 * @property {string} imageURL URL of full image
 * @property {string} thumbURL URL of thumbnail
 */

/**
 * Uploads an image to ImgBB.com
 * @param {*} data URL or image file
 * @returns {urlSet}
 */
const imgbb = async ( data ) => {
	const body = new FormData()
	body.append('image',data)
	const response = await fetch(
		'https://' + await dbOnce('secrets/imgbb'),
		{ method: 'POST', body }
	)
	const result = await response.json()
	return {
		imageURL: result.data.image.url,
		thumbURL: result.data.thumb.url,
	}
}

/**
 * Expands relative path to Firebase realtime database URL
 * @param {string} path 
 * @returns {string} full path
 */
const dbPath = path => 'https://ahs-app.firebaseio.com/'+path+'.json'+(path.includes('secrets') ? token : '')

const db = async ( path='', request={} ) => ( await fetch( dbPath(path), request ) ).json()

/**
 * Reads the database once
 * @param {string} path 
 * @returns {Promise} response
 */
const dbOnce = async ( path ) => db( path )

/**
 * Reads the database and updates it live
 * @param {string} path 
 * @returns {Promise} response
 */
const dbLive = async ( path ) => db( path, { 
	headers: { 'Aces-Accept': 'text/event-stream' } 
})

/**
 * Writes to the database
 * @param {string} path 
 * @param {Object} body 
 * @returns {Promise} return
 */
const dbWrite = async ( path, body ) => db( path, {
	body: JSON.stringify(body),
	headers: { 'Content-Type': 'application/json' },
	method: 'PATCH',
})

/**
 * 
 * @param {string} path 
 * @param {Object} request 
 * @returns {Promise} response
 */
const googleapis = async (path,request) => (await post(path+'?key='+KEY,request)).json()
