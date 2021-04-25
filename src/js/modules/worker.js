async function initWorker(){
	if ('serviceWorker' in navigator)
		navigator.serviceWorker.register('/worker.js')
}
