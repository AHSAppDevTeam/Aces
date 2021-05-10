if('EventSource' in self) self.addEventListener('fetch', event => event.respondWith(response(event.request)))
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))
const response = request => new Promise(async (resolve)=>{
	if(!request.headers.get('Aces-Accept')) return resolve(fetch(request))
	const cache = await caches.open('v4')
	const cachedResponse = await cache.match(request)
	if(cachedResponse) return resolve(cachedResponse)
	cache.put(request,new Response('{}'))
	const source = new EventSource(request.url)
	source.addEventListener('put',async (message) => {
		let { path, data } = JSON.parse(message.data)
		const cachedResponse = await cache.match(request)
		let body = await cachedResponse.json()
		let p = path.split('/').filter(Boolean)
		let [p0,p1,p2,p3] = p
		switch(p.length){
			case 0: body = data
				break
			case 1: body[p0] = data
				break
			case 2: body[p0][p1] = data
				break
			case 3: body[p0][p1][p2] = data
				break
			case 4: body[p0][p1][p2][p3] = data
				break
		}
		const response = new Response(JSON.stringify(body))
		cache.put(request,response.clone())
		resolve(response.clone())
	})
})
