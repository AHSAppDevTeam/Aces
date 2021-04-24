const dbPath = path => 'https://ahs-app.firebaseio.com/'+path+'.json'+token
async function post(path,request){
	const response = await fetch('https://'+path,
		{
			body: JSON.stringify(request),
			headers: { 'Content-Type': 'application/json' },
			method: 'POST',
		}	
	) 
	return await response.json()
}
async function imgbb(data){
	const body = new FormData()
	body.append('image',data)
	const response = await fetch(
		'https://'+secrets.imgbb,
		{ method: 'POST', body }
	)
	const result = await response.json()
	return {
		imageURL: result.data.image.url,
		thumbURL: result.data.thumb.url,
	}
}
async function db(path,request){

	if(request)
		return fetch( dbPath(path), {
			body: JSON.stringify(request),
			headers: { 'Content-Type': 'application/json' },
			method: 'PATCH',
		})

	if(path in dbObject)
		return dbObject[path]

	const source = new EventSource(dbPath(path))
	let first = true
	return new Promise(resolve=>{
		source.addEventListener('put', ({data})=>{
			const payload = JSON.parse(data)
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
			}
		})
	})
}
async function googleapis(path,request){
	return await post(path+'?key='+KEY,request)
}
