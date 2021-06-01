/**
 * Sends an HTTP GET request
 * @param {string} path 
 * @param {Object} request 
 * @returns {Promise<Response>} response
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
 * @typedef {Object} mediaSet
 * @property {Boolean} isVideo Whether the original is a video or an image
 * @property {string?} videoID ID of YouTube video if isVideo
 * @property {string?} imageURL URL of full image otherwise
 * @property {string} thumbURL URL of thumbnail
 */

/**
 * Uploads an image to ImgBB.com
 * @param {*} data URL or image file
 * @returns {Promise<mediaSet>}
 */
const imgbb = async ( data ) => {
	const body = new FormData()
	body.append('image',data)
	const response = await fetch(
		'https://' + await dbOnce('secrets/imgbb'),
		{ method: 'POST', body }
	)
	const { data: { image, medium, thumb } } = await response.json()
	return {
		imageURL: medium ? medium.url : image.url,
		thumbURL: thumb.url,
	}
}

/**
 * Get the ID of a YouTube video and upload its thumbnail to ImgBB.com
 * @param {string} videoURL YouTube video URL
 * @returns {Promise<mediaSet}
 */
const youtube = async ( videoURL ) => {
	const { hostname, pathname, searchParams } = new URL(videoURL)
	let videoID
	switch(hostname) {
		case 'youtu.be':
			videoID = pathname.slice(1)
			break
		case 'youtube.com':
		case 'www.youtube.com':
			videoID = searchParams.get('v')
			break
		default:
			return false
	}
	const { thumbURL }= await imgbb(`https://img.youtube.com/vi/${videoID}/mqdefault.jpg`)
	return { videoID, thumbURL }
}

/**
 * Expands relative path to Firebase realtime database URL
 * @param {string} path Relative path
 * @param {boolean} legacy Use legacy database
 * @returns {string} full path
 */
const dbPath = ( path, legacy ) => (
	'https://'+
	(legacy ? 'arcadia-high-mobile' : 'ahs-app')+
	'.firebaseio.com/'+
	path+
	'.json'+
	token
)

/**
 * Performs a fetch to a database
 * @param {string} path 
 * @param {Object?} request 
 * @param {Boolean} legacy 
 * @returns {Promise<Object>} response
 */
const db = async ( path='', request={}, legacy=false ) => ( await fetch( dbPath(path, legacy), request ) ).json()

/**
 * Reads a cached database
 * @param {string} path 
 * @returns {Promise<Object>} response
 */
 const dbCache = async ( path ) => db( path, {
	 headers: { Aces: 'cache' }
 } )

/**
 * Reads the database and updates it live
 * @param {string} path 
 * @returns {Promise<Object>} response
 */
const dbLive = async ( path ) => db( path, { 
	headers: { Aces: 'live' } 
})

/**
 * Reads the database once
 * @param {string} path 
 * @returns {Promise<Object>} response
 */
const dbOnce = async ( path ) => db( path, {
	headers: { Aces: 'once' }
} )

/**
 * Writes to the database
 * @param {string} path 
 * @param {Object} body 
 * @param {boolean} legacy Use legacy database
 * @returns {(Promise<Object>|Boolean)} return
 */
const dbWrite = async ( path, body, legacy ) => user ? db( path, {
	body: JSON.stringify(body),
	headers: { 'Content-Type': 'application/json' },
	method: 'PATCH',
}, legacy ) : false

/**
 * 
 * @param {string} path 
 * @param {Object} request 
 * @returns {Promise<Object>} response
 */
const googleapis = async (path,request) => (await post(path+'?key='+KEY,request)).json()
