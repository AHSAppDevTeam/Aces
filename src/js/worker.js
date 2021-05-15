if('EventSource' in self) self.addEventListener('fetch', event => event.respondWith(response(event.request)))
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()))
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()))

const response = request => new Promise(async (resolve)=>{

	// Only respond to certain fetches
	if(!request.headers.get('Aces-Accept')) return resolve(fetch(request))

	// Remove token from request for cache retrieval
	const anonRequest = new Request(request.url.split('?')[0], request) 
	
	// Return cached response if exists
	const cache = await caches.open('v5')
	const cachedResponse = await cache.match(anonRequest)
	if(cachedResponse) return resolve(cachedResponse)

	// Put a placeholder response in the cache
	cache.put(anonRequest,new Response('{}'))

	// Create an EventSource for recieving Server-Sent Events (SSE)
	const source = new EventSource(request.url)
	source.addEventListener('put',async (message) => {

		// Parse SSE message data
		let { path, data } = JSON.parse(message.data)

		// Get old response
		const cachedResponse = await cache.match(anonRequest)
		let body = await cachedResponse.json()

		// Find where the modification took place
		let p = path.split('/').filter(Boolean)
		let [p0,p1,p2,p3] = p

		// Place modified data appropriately
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

		// Put modified response in cache
		console.log(request.url)
		console.log(body)
		const response = new Response(JSON.stringify(body))
		cache.put(anonRequest,response.clone())

		// Reply to original intercepted fetch request
		resolve(response.clone())
	})
})
