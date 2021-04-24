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
const dbPath = path => 'https://ahs-app.firebaseio.com/'+path+'.json'+token

/**
 * Writes to the database
 * @param {string} path 
 * @param {Object} request 
 */
const dbWrite = async ( path, request ) => await fetch(
	dbPath(path), 
	{
		body: JSON.stringify(request),
		headers: { 'Content-Type': 'application/json' },
		method: 'PATCH',
	}
)

/**
 * Reads the database once
 * @param {string} path 
 * @returns {*} response
 */
const dbOnce = async ( path ) => (await fetch(dbPath(path))).json()

/**
 * Reads the database and updates it live
 * @param {string} path 
 * @param {function} callback 
 * @returns {*} response
 */
const dbLive = async ( path, callback ) => {
	if(path in dbObject)
		return dbObject[path]

	dbObject[path] = ''
	
	return new Promise(resolve=>{
		const source = new EventSource(dbPath(path))
		console.log(source)
		let first = true
		source.addEventListener('put', ({data})=>{
			const payload = JSON.parse(data)
			console.log('put')
			if(first) {
				first = false
				dbObject[path] = payload.data
				resolve(payload.data)
			} else {
				let modifiedPath = payload.path.split('/').filter(x=>x)
				let object = dbObject[path]
				while(modifiedPath.length>1)
				object = object[modifiedPath.shift()]
				object[modifiedPath[0]] = payload.data
				if(callback) callback()
			}
		})
		window.addEventListener('beforeunload', () => {
			source.close()
		})
	})
}

/**
 * 
 * @param {string} path 
 * @param {Object} request 
 * @returns {*} response
 */
const googleapis = async (path,request) => (await post(path+'?key='+KEY,request)).json()
