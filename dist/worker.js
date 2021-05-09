self.addEventListener('fetch', event => event.respondWith(response(event.request)))

self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))
self.sources = []
const response = request => new Promise(async (resolve)=>{
	if(!request.headers.get('Aces-Accept')) return resolve(fetch(request))
	const cache = await caches.open('v4')
	const cachedResponse = await cache.match(request)
	console.log(request.url,cachedResponse)
	if(cachedResponse) return resolve(cachedResponse)
	cache.put(request,new Response())
	const eventStream = await fetch(
		request.url,
		{ headers: { Accept: 'text/event-stream' } }
	)
	const reader = eventStream.body.getReader()
	let first = true
	while (true) {
		const { done, value } = await reader.read()
		if(done) break
		const { event, data } = Object.fromEntries(
			new TextDecoder().decode(value)
			.split('\n').filter(Boolean).map(
				x => x.split(/:\s?(.+)/).filter(Boolean)
			)
		)
		switch ( event ){
			case 'put':
				const payload = JSON.parse(data)
				let responseObject = payload.data
				if (first) { first = false } else {
					const cachedResponse = await cache.match(request)
					responseObject = await cachedResponse.json()
					let modifiedPath = payload.path.split('/').filter(x=>x)
					while(modifiedPath.length>1)
						responseObject = responseObject[modifiedPath.shift()]
					responseObject[modifiedPath[0]] = payload.data
					const clients = await self.clients.matchAll({type:'window'})
					for(const client of clients)
						client.postMessage({
							type: 'update',
							path: request.headers.get('path'),
						})
				}
				const response = new Response(JSON.stringify(responseObject))
				cache.put(request,response.clone())
				resolve(response.clone())
			// case 'patch':
		}
	}
})
