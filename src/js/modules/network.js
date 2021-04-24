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
		'https://' + (await db('secrets')).imgbb,
		{ method: 'POST', body }
	)
	const result = await response.json()
	return {
		imageURL: result.data.image.url,
		thumbURL: result.data.thumb.url,
	}
}
async function db(path,{request=false,once=false,callback=false}={}){
	
	const url = dbPath(path)

	if(request)
		return fetch( url, {
			body: JSON.stringify(request),
			headers: { 'Content-Type': 'application/json' },
			method: 'PATCH',
		})

	if(once)
		return (await fetch(url)).json()

	if(path in dbObject)
		return dbObject[path]

	dbObject[path] = ''
	
	return new Promise(resolve=>{
		const source = new EventSource(url)
		let first = true
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
			if(callback) callback()
		})
		window.addEventListener('beforeunload', () => {
			source.close()
		})
	})
}
async function googleapis(path,request){
	return await post(path+'?key='+KEY,request)
}
