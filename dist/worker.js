async function initWorker(){
	if ('serviceWorker' in navigator)
		navigator.serviceWorker.register('/worker.js')
}
self.addEventListener('fetch',(event)=>{
	const {headers, url} = event.request;
	const isSSERequest = headers.get('content-type') === 'text/event-stream';

	// We process only SSE connections
	if (!isSSERequest) return

	// Response Headers for SSE
	const sseHeaders = {
		'content-type': 'text/event-stream',
	}
	// Function formatting data for SSE
	const sseChunkData = (data, event, retry, id) =>
		Object.entries({event, id, data, retry})
		.filter(([, value]) => ![undefined, null].includes(value))
		.map(([key, value]) => `${key}: ${value}`)
		.join('\n') + '\n\n'

	// Table with server connections, where key is url, value is EventSource
	const serverConnections = {}
	// For each url, we open only one connection to the server and use it for subsequent requests
	const getServerConnection = url => {
		if (!serverConnections[url]) serverConnections[url] = new EventSource(url);

		return serverConnections[url]
	}

	// When we receive a message from the server, we forward it to the browser
	const onServerMessage = (controller, {data, type, retry, lastEventId}) => {
		const responseText = sseChunkData(data, type, retry, lastEventId)
		const responseData = Uint8Array.from(responseText, x => x.charCodeAt(0))
		controller.enqueue(responseData)
	}

	const stream = new ReadableStream({
		start: controller => getServerConnection(url).onmessage = onServerMessage.bind(null, controller)
	})
	const response = new Response(stream, {headers: sseHeaders})

	event.respondWith(response)
})
