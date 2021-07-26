'use strict'
const DEBUG = true
const KEY = 'AIzaSyDEUekXeyIKJUreRaX78lsEYBt8JGHYmHE'
let user = ''
let token = ''
const dbObject = {}
/**
 * Initiates the authentication elements
 */
async function initAuth(){
	const $sign = $('#sign')
	const $signIn = $('#sign-in')
	const $email = $('#email')
	const $password = $('#password')

	// Try to sign in with preexisting token
	const auth = localStorage.getItem('AUTH')
	if(auth) signInWithToken(JSON.parse(auth))

	$signIn.addEventListener('submit', event=>{
		event.preventDefault()
		signInWithEmail( $email.value, $password.value )
		$signIn.reset()
		$signIn.classList.add('loading')
	})
	$signIn.addEventListener('input', ()=>{
		$signIn.classList.remove('invalid')
	})
	$sign.addEventListener('click', event=>{
		event.preventDefault()
		user ? signOut() : $email.focus()
	})
	$('.cancel',$signIn).addEventListener('click', ()=>{
		$signIn.reset()
		document.activeElement.blur()
	})
}

/**
 * Sign in to Firebase with email and password
 * @param {string} email 
 * @param {string} password 
 */
async function signInWithEmail( email, password ) {
	const res = await googleapis(
		'identitytoolkit.googleapis.com/v1/accounts:signInWithPassword',
		{ email, password, returnSecureToken: true }
	)
	if(res.error) {
		const classes = $('#sign-in').classList
		classes.remove('loading')
		classes.add('invalid')
		return
	}
	setAuth({
		idToken: res.idToken,
		refreshToken: res.refreshToken,
		expiresAt: timestamp() + parseInt(res.expiresIn)
	})
}

/**
 * Sign in to Firebase with stored refresh token
 * @param {string} refreshToken 
 */
async function signInWithToken(auth) {
	
	if(!auth.refreshToken) return false
	
	if( auth.idToken && auth.expiresAt && (auth.expiresAt-timestamp()>60) ) return setAuth(auth)
	
	const res = await googleapis(
		'securetoken.googleapis.com/v1/token',
		{ refresh_token: auth.refreshToken, grant_type: 'refresh_token' }
	)
	if(res.error) return false

	return setAuth({
		idToken: res.id_token,
		refreshToken: res.refresh_token,
		expiresAt: timestamp() + parseInt(res.expires_in),
	})
}

/**
 * Sign out of Firebase
 */
async function signOut(){
	localStorage.removeItem('AUTH')
	token = user = ''
	updateAuth(false)
}
async function setAuth(auth) {
	token = '?auth=' + auth.idToken
	user = await getUser(auth.idToken)
	localStorage.setItem('AUTH',JSON.stringify(auth))
	updateAuth(Boolean(user))
	setTimeout(
		signInWithToken,
		(auth.expiresAt-timestamp()-60)*1000,
		auth,
	) // One minute before idToken expires
}
async function getUser(idToken) {
	const { users: { 0: { email } } } = await googleapis(
		'identitytoolkit.googleapis.com/v1/accounts:lookup',
		{ idToken }
	)
	return email
}
async function updateAuth(signedIn){
	document.body.classList.toggle('signed-in',signedIn)
	$('#sign').value = `Sign ${signedIn ? 'out' : 'in'}`
	document.activeElement.blur()
}
const dbBrowserResources = () => Promise.all(['locationIDs','locations','categories','snippets'].map(dbLive))
async function initBrowser(){
	dbBrowserResources()
	Object.assign(navigator.serviceWorker.subscriptionList,{
		locationsIDs: updateBrowser,
		locations: updateBrowser,
		categories: updateBrowser,
		snippets: updateBrowser,
	})
	updateBrowser()
	$('#search').addEventListener('input',({target:{value:query}})=>{
		$$('.preview>.title',$('#browser')).forEach($title=>{
			const $preview = $title.parentElement
			const show = query ? $title.textContent.toLowerCase().includes(query.toLowerCase()) : true
			show ? $preview.removeAttribute('hidden') : $preview.setAttribute('hidden','')
		})
	})
	$('#sources').addEventListener('click',async ()=>{
		Object.values(await dbOnce('sources')).forEach(
			url => window.open(url,'_blank')
		)
	})
	$('#new').addEventListener('click', async () => {
		history.pushState({},'',makeID())
		updateEditor() 
	})
}
async function updateBrowser(){
	const $browser = $('#browser')
	const [ locationIDs, locations, categories, snippets ] = await dbBrowserResources()
	$browser.replaceChildren(
		$browser.firstElementChild,
		...locationIDs
			.filter( id => id in locations)
			.map( id => makeGroup('location', id, locations[id], ( locations[id].categoryIDs || [] )
				.filter( id => id in categories)
				.map( id => makeGroup('category', id, categories[id], ( categories[id].articleIDs || [] )
					.filter( id => id in snippets )
					.map( id => makePreview(id, snippets[id])
	))))))

	$$('textarea',$browser).forEach(initTextarea)
}
function makeGroup(
	type, id,
	{ title, color },
	children,
){
	const parent = {
		'category': 'categories',
		'location': 'locations',
	}[type]

	const $group = $template(type)

	const $id = $('.id',$group)
	$id.id = id
	$id.href = '#'+id
	$id.innerHTML = '#'+id

	const $title = $('.title',$group)
	$title.value = title
	addChangeListener($title, ({ target: { value: title } }) => 
		dbWrite(parent+'/'+id, { title })
	)

	if(type=='category'){
		const $color = $('.color',$group) 
		$color.value = color
		addChangeListener($color, ({ target: { value: color } }) =>
			dbWrite(parent+'/'+id, { color })
		)
	}

	$group.append(...children)

	return $group
}

function makePreview(id,snippet){
	const $preview = $template('preview')

	$preview.id = 'preview-'+id

	const $title = $('.title',$preview)
	$title.addEventListener('click',async (event) => {
		document.title = snippet.title
		history.pushState({}, '', id)
		updateEditor()
		event.preventDefault()		
	})
	$title.href = id

	const $featured = $('.featured',$preview)
	addChangeListener($featured, async ({ target: { checked: featured } }) =>
		dbWrite('inputs/'+id,{featured})
	)

	const $archived = $('.archived',$preview)
	addChangeListener($archived, async ({ target: { checked: archived } }) =>
		dbWrite('inputs/'+id,{categoryID:archived ? 'archived' : 'drafts'})
	)

	updatePreview($preview,snippet)

	return $preview
}

function updatePreview($preview,snippet){
	$('.title',$preview).innerHTML = snippet.title || 'Untitled Article'
	$('.featured',$preview).checked = snippet.featured
	$('.media',$preview).replaceChildren(...(snippet.thumbURLs||[]).map(thumbURL=>{
		const $img = document.createElement('img')
		$img.src = thumbURL
		$img.loading = 'lazy'
		$img.alt = ''
		return $img
	}))
}
/**
 * Shortcut for querySelector
 * @param {string} query 
 * @param {Element} parent 
 * @returns {Element}
 */
const $ = (query,parent=document) => parent.querySelector(query)

/**
 * Shortcut for querySelectorAll
 * @param {string} query 
 * @param {Element} parent 
 * @returns {Element[]}
 */
const $$ = (query,parent=document) => Array.from(parent.querySelectorAll(query))

/**
 * Clones a template element
 * @param {string} id
 * @returns {Element}
 */
const $template = id => $('#template-'+id).content.cloneNode(true).querySelector('*')

/**
 * Adds a change event listener that also displays success
 * @param {Element} $element 
 * @param {callback} callback 
 */
const addChangeListener = async ($element, callback) =>
	$element.addEventListener( 'change', async event => {
		let $displayer = event.target
		do $displayer = $displayer.parentElement
		while ( !$displayer.classList.contains('card') )
		$displayer.classList.add('changed')
		await callback(event)
		$displayer.classList.remove('changed')
	})

/**
 * Initiates the editor panel
 */
async function initEditor() {
	const $editor = $('#editor')
	const $media = $('#media')
	const $categoryID = $('#categoryID')
	const $$textarea = $$('textarea',$editor)
	const $url = $('#url')
	const $markdownWrapper = $('#markdown-wrapper')

	addChangeListener($editor, async ({target}) => {
		if(!user) return false
		switch(target.id){
			case 'upload':
				const mediaSets = await Promise.all(Array.from(target.files).map(imgbb))
				$media.prepend(...mediaSets.map($thumb))
				delete target.files
				break
			case 'url':
				$media.prepend($thumb(await youtube(target.value) || await imgbb(target.value)))
				target.value = ''
				break
		}	
		const id = urlID()
		const templateStory = await storyTemplate()
		const story = await syncStory( templateStory, 1 )
		await dbWrite('inputs',{[id]: story})
		return updateBrowser()
	})

	initHighlighter($markdownWrapper)
	$$textarea.forEach(initTextarea)
	remapEnter($url)
	
	const [locationIDs,locations,categories] = await Promise.all([
		dbCache('locationIDs'),dbLive('locations'),dbLive('categories')
	])
	$categoryID.replaceChildren(...locationIDs.filter(id=>id in locations).map(id=>{
		const $group = document.createElement('optgroup')
		$group.setAttribute('label',locations[id].title)
		$group.append(...locations[id].categoryIDs.filter(id=>id in categories).map(id=>{
			const $option = document.createElement('option')
			$option.value = id
			$option.textContent = categories[id].title
			return $option
		}))
		return $group
	}))	

	updateEditor()
	window.addEventListener('popstate',updateEditor)
}

/**
 * Create a template story from the schemas.
 * @returns {Promise<Object>} story
 */
async function storyTemplate(){
	const schema = await dbCache('schemas/input')
	const template = {}
	for (const key in schema)
		template[key] = {
			'Array<String>': [],
			'String': '',
			'Boolean': false,
			'Int': 0,
		}[schema[key]]
	return {
		...template,
		...{
			title: 'Untitled Article',
			author: 'Content Editors',
			timestamp: roundedTimestamp(),
			notifTimestamp: roundedTimestamp(),
			categoryID: 'Drafts',
			blurb: 'Notification text.',
			markdown: 'A *quick* brown **fox** jumps over a lazy [dog](https://en.wikipedia.org/wiki/Dog).'
		}
	}
}

/**
 * Update the editor with a new article ID from the URL
 */
async function updateEditor() {
	const id = urlID()
	history.replaceState({}, '', id)
	let story = await dbOnce('inputs/' + id) || {}
	story = {...await storyTemplate(),...story}
	document.title = story.title
	syncStory(story,0)
	$$('#editor textarea').forEach(dispatchInput)
	$$('.preview.open').forEach($preview=>$preview.classList.remove('open'))
	$$('#preview-'+id).forEach($preview=>{
		$preview.classList.add('open')
		$preview.scrollIntoView()
	})
}

/**
 * Encode a story into the URL parameters string
 * @param {Object} story
 */
async function encodeStory(story){
	const params = new URLSearchParams(window.location.search)
	params.set('input',encodeURIComponent(JSON.stringify(story)))
	history.replaceState({}, '', `${id}?${params}`)
}

/**
 * Create a story object out of some data
 * @param {Object} story 
 * @param {Int} direction 0: from database, 1: from editor 
 */
async function syncStory(base,direction){
	let story = {...base}
	for(const property in story){
		const $element = $('#' + property, $('#editor'))
		if (!$element) continue
		switch ($element.type) {
			case 'checkbox':
			case 'radio':
				direction
				? story[property] = $element.checked
				: $element.checked = story[property]
				break
			case 'datetime-local':
				direction
				? story[property] = LocalISOStringToTimestamp($element.value)
				: $element.value = timestampToLocalISOString(story[property])
				break
			case 'hidden':
				direction
				? story[property] = JSON.parse($element.value)
				: $element.value = JSON.stringify(story[property])
				break
			default:
				direction
				? story[property] = typography($element.value)
				: $element.value = story[property]
				break
		}
	}
	if(direction) {
		story.videoIDs = []
		story.imageURLs = []
		story.thumbURLs = []
		$$('#media>.thumb').forEach( ({dataset}) => {
			const {thumbURL, imageURL, videoID} = JSON.parse(dataset.media)
			story.thumbURLs.push(thumbURL)
			if(imageURL) story.imageURLs.push(imageURL)
			if(videoID) story.videoIDs.push(videoID)
		})
	} else {
		const mediaSets = story.thumbURLs.map(
			(thumbURL,index) =>
			({
				thumbURL,
				videoID: story.videoIDs[index],
				imageURL: story.imageURLs[index-story.videoIDs.length],
			})
		)
		$('#media').replaceChildren(...mediaSets.map($thumb))
	}
	return story
}

/**
 * Create a thumbnail element from a set of image URLs
 * @param {Object} mediaSet 
 * @returns {Element}
 */
function $thumb(mediaSet){
	const $thumb = $template('thumb')
	const $media = $('#media')
	$thumb.dataset.media = JSON.stringify(mediaSet)
	$('img',$thumb).src = mediaSet.thumbURL
	$('.delete',$thumb).addEventListener('click',()=>{
		$thumb.remove()
		dispatchChange($media)
	},{once:true})
	$('.move-ahead',$thumb).addEventListener('click',()=>{
		if($thumb.previousSibling) $media.insertBefore($thumb,$thumb.previousSibling)
		dispatchChange($media)
	})
	$('.move-behind',$thumb).addEventListener('click',()=>{
		if($thumb.nextSibling) $media.insertBefore($thumb.nextSibling,$thumb)
		dispatchChange($media)
	})
	$thumb.addEventListener('dragover',event=>event.preventDefault())
	$thumb.addEventListener('dragstart',()=>$thumb.classList.add('dragged'))
	$thumb.addEventListener('drop',()=>{
		const $dragged = ('.dragged',$media)
		$dragged.classList.remove('dragged')
		$media.insertBefore($thumb,$dragged)
		dispatchChange($media)
	})
	return $thumb
}
/**
 * Initates the markdown syntax highlighter on an element
 * @param {Element} $section
 */
async function initHighlighter($section){
	const input = $('.input',$section)
	const output = $('.output',$section)
	const syntax = {
		bold: /\*\*(.+?)\*\*/gm,
		italic: /\*(.+?)\*/gm,
		strike: /~~(.+?)~~/gm,
		hr: /\s{0,3}([-+* ]{3,})$/gm,
		heading: /^#{1,6}\s(.+)$/gm,
		link: /(!?\[.*?\]\((?:https?:\/\/|mailto:)\S*\)|\bhttps?:\/\/\S*|\b\S*@\S*?\.\S*)/gm,
		list: /^((\d+\.)|[-+*]).+$/gm,
	}
	input.addEventListener('input',async ()=>{
		let buffer = output.textContent = sanitize(input.value)
		for(const key in syntax){
			const regex = syntax[key]
			buffer = buffer.replace(regex,
				(match,p1)=>
				`<span class=${key}>${
					escape(match.slice(0,match.indexOf(p1)))
					+
					p1
					+
					escape(match.slice(match.indexOf(p1)+p1.length))
				}</span>`
			)
		}
		output.innerHTML = buffer
	})
}
const sanitize = (string) => string.replace(/</g,'&lt;').replace(/>/g,'&gt;')
const escape = (string) => string.replace(/[-_.!~*"'()]/g,char=>'&#'+char.charCodeAt()+';')
/**
 * Gfycat-like human-friendly ID generator
 * @returns {string} ID
 */
function makeID(){
	const adjectives = `abandoned,able,absolute,adorable,adventurous,academic,acceptable,acclaimed,accomplished,accurate,aching,acidic,acrobatic,active,actual,adept,admirable,admired,adolescent,adorable,adored,advanced,afraid,affectionate,aged,aggravating,aggressive,agile,agitated,agonizing,agreeable,ajar,alarmed,alarming,alert,alienated,alive,all,altruistic,amazing,ambitious,ample,amused,amusing,anchored,ancient,angelic,angry,anguished,animated,annual,another,antique,anxious,any,apprehensive,appropriate,apt,arctic,arid,aromatic,artistic,ashamed,assured,astonishing,athletic,attached,attentive,attractive,austere,authentic,authorized,automatic,avaricious,average,aware,awesome,awful,awkward,babyish,bad,back,baggy,bare,barren,basic,beautiful,belated,beloved,beneficial,better,best,bewitched,big,big-hearted,biodegradable,bite-sized,bitter,black,black-and-white,bland,blank,blaring,bleak,blind,blissful,blond,blue,blushing,bogus,boiling,bold,bony,boring,bossy,both,bouncy,bountiful,bowed,brave,breakable,brief,bright,brilliant,brisk,broken,bronze,brown,bruised,bubbly,bulky,bumpy,buoyant,burdensome,burly,bustling,busy,buttery,buzzing,calculating,calm,candid,canine,capital,carefree,careful,careless,caring,cautious,cavernous,celebrated,charming,cheap,cheerful,cheery,chief,chilly,chubby,circular,classic,clean,clear,clear-cut,clever,close,closed,cloudy,clueless,clumsy,cluttered,coarse,cold,colorful,colorless,colossal,comfortable,common,compassionate,competent,complete,complex,complicated,composed,concerned,concrete,confused,conscious,considerate,constant,content,conventional,cooked,cool,cooperative,coordinated,corny,corrupt,costly,courageous,courteous,crafty,crazy,creamy,creative,creepy,criminal,crisp,critical,crooked,crowded,cruel,crushing,cuddly,cultivated,cultured,cumbersome,curly,curvy,cute,cylindrical,damaged,damp,dangerous,dapper,daring,darling,dark,dazzling,dead,deadly,deafening,dear,dearest,decent,decimal,decisive,deep,defenseless,defensive,defiant,deficient,definite,definitive,delayed,delectable,delicious,delightful,delirious,demanding,dense,dental,dependable,dependent,descriptive,deserted,detailed,determined,devoted,different,difficult,digital,diligent,dim,dimpled,dimwitted,direct,disastrous,discrete,disfigured,disgusting,disloyal,dismal,distant,downright,dreary,dirty,disguised,dishonest,dismal,distant,distinct,distorted,dizzy,dopey,doting,double,downright,drab,drafty,dramatic,dreary,droopy,dry,dual,dull,dutiful,each,eager,earnest,early,easy,easy-going,ecstatic,edible,educated,elaborate,elastic,elated,elderly,electric,elegant,elementary,elliptical,embarrassed,embellished,eminent,emotional,empty,enchanted,enchanting,energetic,enlightened,enormous,enraged,entire,envious,equal,equatorial,essential,esteemed,ethical,euphoric,even,evergreen,everlasting,every,evil,exalted,excellent,exemplary,exhausted,excitable,excited,exciting,exotic,expensive,experienced,expert,extraneous,extroverted,extra-large,extra-small,fabulous,failing,faint,fair,faithful,fake,false,familiar,famous,fancy,fantastic,far,faraway,far-flung,far-off,fast,fat,fatal,fatherly,favorable,favorite,fearful,fearless,feisty,feline,female,feminine,few,fickle,filthy,fine,finished,firm,first,firsthand,fitting,fixed,flaky,flamboyant,flashy,flat,flawed,flawless,flickering,flimsy,flippant,flowery,fluffy,fluid,flustered,focused,fond,foolhardy,foolish,forceful,forked,formal,forsaken,forthright,fortunate,fragrant,frail,frank,frayed,free,French,fresh,frequent,friendly,frightened,frightening,frigid,frilly,frizzy,frivolous,front,frosty,frozen,frugal,fruitful,full,fumbling,functional,funny,fussy,fuzzy,gargantuan,gaseous,general,generous,gentle,genuine,giant,giddy,gigantic,gifted,giving,glamorous,glaring,glass,gleaming,gleeful,glistening,glittering,gloomy,glorious,glossy,glum,golden,good,good-natured,gorgeous,graceful,gracious,grand,grandiose,granular,grateful,grave,gray,great,greedy,green,gregarious,grim,grimy,gripping,grizzled,gross,grotesque,grouchy,grounded,growing,growling,grown,grubby,gruesome,grumpy,guilty,gullible,gummy,hairy,half,handmade,handsome,handy,happy,happy-go-lucky,hard,hard-to-find,harmful,harmless,harmonious,harsh,hasty,hateful,haunting,healthy,heartfelt,hearty,heavenly,heavy,hefty,helpful,helpless,hidden,hideous,high,high-level,hilarious,hoarse,hollow,homely,honest,honorable,honored,hopeful,horrible,hospitable,hot,huge,humble,humiliating,humming,humongous,hungry,hurtful,husky,icky,icy,ideal,idealistic,identical,idle,idiotic,idolized,ignorant,ill,illegal,ill-fated,ill-informed,illiterate,illustrious,imaginary,imaginative,immaculate,immaterial,immediate,immense,impassioned,impeccable,impartial,imperfect,imperturbable,impish,impolite,important,impossible,impractical,impressionable,impressive,improbable,impure,inborn,incomparable,incompatible,incomplete,inconsequential,incredible,indelible,inexperienced,indolent,infamous,infantile,infatuated,inferior,infinite,informal,innocent,insecure,insidious,insignificant,insistent,instructive,insubstantial,intelligent,intent,intentional,interesting,internal,international,intrepid,ironclad,irresponsible,irritating,itchy,jaded,jagged,jam-packed,jaunty,jealous,jittery,joint,jolly,jovial,joyful,joyous,jubilant,judicious,juicy,jumbo,junior,jumpy,juvenile,kaleidoscopic,keen,key,kind,kindhearted,kindly,klutzy,knobby,knotty,knowledgeable,knowing,known,kooky,kosher,lame,lanky,large,last,lasting,late,lavish,lawful,lazy,leading,lean,leafy,left,legal,legitimate,light,lighthearted,likable,likely,limited,limp,limping,linear,lined,liquid,little,live,lively,livid,loathsome,lone,lonely,long,long-term,loose,lopsided,lost,loud,lovable,lovely,loving,low,loyal,lucky,lumbering,luminous,lumpy,lustrous,luxurious,mad,made-up,magnificent,majestic,major,male,mammoth,married,marvelous,masculine,massive,mature,meager,mealy,mean,measly,meaty,medical,mediocre,medium,meek,mellow,melodic,memorable,menacing,merry,messy,metallic,mild,milky,mindless,miniature,minor,minty,miserable,miserly,misguided,misty,mixed,modern,modest,moist,monstrous,monthly,monumental,moral,mortified,motherly,motionless,mountainous,muddy,muffled,multicolored,mundane,murky,mushy,musty,muted,mysterious,naive,narrow,nasty,natural,naughty,nautical,near,neat,necessary,needy,negative,neglected,negligible,neighboring,nervous,new,next,nice,nifty,nimble,nippy,nocturnal,noisy,nonstop,normal,notable,noted,noteworthy,novel,noxious,numb,nutritious,nutty,obedient,obese,oblong,oily,oblong,obvious,occasional,odd,oddball,offbeat,offensive,official,old,old-fashioned,only,open,optimal,optimistic,opulent,orange,orderly,organic,ornate,ornery,ordinary,original,other,our,outlying,outgoing,outlandish,outrageous,outstanding,oval,overcooked,overdue,overjoyed,overlooked,palatable,pale,paltry,parallel,parched,partial,passionate,past,pastel,peaceful,peppery,perfect,perfumed,periodic,perky,personal,pertinent,pesky,pessimistic,petty,phony,physical,piercing,pink,pitiful,plain,plaintive,plastic,playful,pleasant,pleased,pleasing,plump,plush,polished,polite,political,pointed,pointless,poised,poor,popular,portly,posh,positive,possible,potable,powerful,powerless,practical,precious,present,prestigious,pretty,precious,previous,pricey,prickly,primary,prime,pristine,private,prize,probable,productive,profitable,profuse,proper,proud,prudent,punctual,pungent,puny,pure,purple,pushy,putrid,puzzled,puzzling,quaint,qualified,quarrelsome,quarterly,queasy,querulous,questionable,quick,quick-witted,quiet,quintessential,quirky,quixotic,quizzical,radiant,ragged,rapid,rare,rash,raw,recent,reckless,rectangular,ready,real,realistic,reasonable,red,reflecting,regal,regular,reliable,relieved,remarkable,remorseful,remote,repentant,required,respectful,responsible,repulsive,revolving,rewarding,rich,rigid,right,ringed,ripe,roasted,robust,rosy,rotating,rotten,rough,round,rowdy,royal,rubbery,rundown,ruddy,rude,runny,rural,rusty,sad,safe,salty,same,sandy,sane,sarcastic,sardonic,satisfied,scaly,scarce,scared,scary,scented,scholarly,scientific,scornful,scratchy,scrawny,second,secondary,second-hand,secret,self-assured,self-reliant,selfish,sentimental,separate,serene,serious,serpentine,several,severe,shabby,shadowy,shady,shallow,shameful,shameless,sharp,shimmering,shiny,shocked,shocking,shoddy,short,short-term,showy,shrill,shy,sick,silent,silky,silly,silver,similar,simple,simplistic,sinful,single,sizzling,skeletal,skinny,sleepy,slight,slim,slimy,slippery,slow,slushy,small,smart,smoggy,smooth,smug,snappy,snarling,sneaky,sniveling,snoopy,sociable,soft,soggy,solid,somber,some,spherical,sophisticated,sore,sorrowful,soulful,soupy,sour,Spanish,sparkling,sparse,specific,spectacular,speedy,spicy,spiffy,spirited,spiteful,splendid,spotless,spotted,spry,square,squeaky,squiggly,stable,staid,stained,stale,standard,starchy,stark,starry,steep,sticky,stiff,stimulating,stingy,stormy,straight,strange,steel,strict,strident,striking,striped,strong,studious,stunning,stupendous,stupid,sturdy,stylish,subdued,submissive,substantial,subtle,suburban,sudden,sugary,sunny,super,superb,superficial,superior,supportive,sure-footed,surprised,suspicious,svelte,sweaty,sweet,sweltering,swift,sympathetic,tall,talkative,tame,tan,tangible,tart,tasty,tattered,taut,tedious,teeming,tempting,tender,tense,tepid,terrible,terrific,testy,thankful,that,these,thick,thin,third,thirsty,this,thorough,thorny,those,thoughtful,threadbare,thrifty,thunderous,tidy,tight,timely,tinted,tiny,tired,torn,total,tough,traumatic,treasured,tremendous,tragic,trained,tremendous,triangular,tricky,trifling,trim,trivial,troubled,true,trusting,trustworthy,trusty,truthful,tubby,turbulent,twin,ugly,ultimate,unacceptable,unaware,uncomfortable,uncommon,unconscious,understated,unequaled,uneven,unfinished,unfit,unfolded,unfortunate,unhappy,unhealthy,uniform,unimportant,unique,united,unkempt,unknown,unlawful,unlined,unlucky,unnatural,unpleasant,unrealistic,unripe,unruly,unselfish,unsightly,unsteady,unsung,untidy,untimely,untried,untrue,unused,unusual,unwelcome,unwieldy,unwilling,unwitting,unwritten,upbeat,upright,upset,urban,usable,used,useful,useless,utilized,utter,vacant,vague,vain,valid,valuable,vapid,variable,vast,velvety,venerated,vengeful,verifiable,vibrant,vicious,victorious,vigilant,vigorous,villainous,violet,violent,virtual,virtuous,visible,vital,vivacious,vivid,voluminous,wan,warlike,warm,warmhearted,warped,wary,wasteful,watchful,waterlogged,watery,wavy,wealthy,weak,weary,webbed,wee,weekly,weepy,weighty,weird,welcome,well-documented,well-groomed,well-informed,well-lit,well-made,well-off,well-to-do,well-worn,wet,which,whimsical,whirlwind,whispered,white,whole,whopping,wicked,wide,wide-eyed,wiggly,wild,willing,wilted,winding,windy,winged,wiry,wise,witty,wobbly,woeful,wonderful,wooden,woozy,wordy,worldly,worn,worried,worrisome,worse,worst,worthless,worthwhile,worthy,wrathful,wretched,writhing,wrong,wry,yawning,yearly,yellow,yellowish,young,youthful,yummy,zany,zealous,zesty,zigzag`
	.split(',')
	const animals = `aardvark,albatross,alligator,alpaca,ant,anteater,antelope,ape,armadillo,baboon,badger,barracuda,bat,bear,beaver,bee,bird,bison,boar,butterfly,camel,caribou,cassowary,cat,caterpillar,cattle,chamois,cheetah,chicken,chimpanzee,chinchilla,chough,coati,cobra,cockroach,cod,cormorant,coyote,crab,crocodile,crow,curlew,deer,dinosaur,dog,dolphin,donkey,dotterel,dove,dragonfly,duck,dugong,dunlin,eagle,echidna,eel,elephant,elk,emu,falcon,ferret,finch,fish,flamingo,fly,fox,frog,gaur,gazelle,gerbil,giraffe,gnat,goat,goose,gorilla,goshawk,grasshopper,grouse,guanaco,gull,hamster,hare,hawk,hedgehog,heron,herring,hippopotamus,hornet,horse,hummingbird,hyena,ibex,ibis,jackal,jaguar,jay,jellyfish,kangaroo,kinkajou,koala,kouprey,kudu,lapwing,lark,lemur,leopard,lion,llama,lobster,locust,loris,louse,lyrebird,magpie,mallard,manatee,mandrill,mink,mongoose,monkey,moose,mouse,mosquito,narwhal,newt,nightingale,octopus,okapi,opossum,ostrich,otter,owl,oyster,parrot,panda,partridge,peafowl,pelican,penguin,pheasant,pork,pigeon,pony,porcupine,porpoise,quail,quelea,quetzal,rabbit,raccoon,rat,raven,reindeer,rhinoceros,salamander,salmon,sandpiper,sardine,seahorse,shark,sheep,shrew,skunk,sloth,snail,snake,spider,squirrel,starling,swan,tapir,tarsier,termite,tiger,toad,turtle,wallaby,walrus,wasp,weasel,whale,wolf,wolverine,wombat,wren,yak,zebra`
	.split(',')
	
	return [randomElement(adjectives),randomElement(adjectives),randomElement(animals)].join('-')
}
/**
 * Initiates a textarea
 * @param {Element} $textarea
 */
async function initTextarea($textarea){
	// reset default attributes
	$textarea.setAttribute('rows',1)

	// on input, adjust the <textarea>'s display height to that of its contents
	$textarea.addEventListener('input',()=>{
		$textarea.style.height = 'auto'
		$textarea.style.height = $textarea.scrollHeight+'px'
	})

	// unless the textarea is multi-line, make the enter key trigger the 'change' event
	remapEnter($textarea, $textarea.hasAttribute('multi-line'))

	// if the window resizes horizontally, update the textarea's display heights
	window.addEventListener('resize',()=>{
		if(window.oldInnerWidth !== window.innerWidth) {
			$$('textarea').forEach(dispatchInput)
			window.oldInnerWidth = window.innerWidth
		}
	})
}
/**
 * Programmatically trigger the 'input' event on an element
 * @param {Element} $element
 */
async function dispatchInput($element){
	$element.dispatchEvent(new Event('input'))
}
/**
 * Programmatically trigger the 'change' event on an element
 * @param {Element} $element 
 */
async function dispatchChange($element){
	$element.dispatchEvent(new Event('change', { bubbles: true } ))
}
/**
 * Assign the enter key to trigger the 'change' event
 * @param {Element} $input 
 */
function remapEnter($input,needCtrl=false){
	$input.addEventListener('keydown',event=>{
		if( event.key!=='Enter' || ( needCtrl && !event.ctrlKey ) ) return
		event.preventDefault()
		$input.blur()
		return false
	})
}
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
/**
 * Initiates the resize bar
 */
async function initResize(){
	// resize bar
	const $resize = $('#resize')

	// left panel
	const $editor = $('#editor')

	// focus the resize bar if a mouse clicks or finger touches it 
	$resize.addEventListener('pointerdown',()=>$resize.focus())

	// watch for mouse or finger movement
	window.addEventListener('pointermove',(event)=>{
		// checks if the resize bar is focused, if not then do nothing
		if($resize !== document.activeElement) return
		
		// resize the left panel so the resize bar is horizontally centered under the pointer
		$editor.style.width = (event.x-$resize.offsetWidth/2)/window.innerWidth*100+'vw'
		
		// the resized textareas need to have their line wrapping adjusted
		$$('textarea').forEach(dispatchInput)
		
		// prevent default behaviors which may accidentally other stuff
		event.preventDefault()
	})

	// unfocus the resize bar if the mouse click or finger dragging ends
	window.addEventListener('pointerup',()=>$resize.blur())
}
/**
 * Number of seconds since the Unix Epoch
 * @returns {number}
 */
const timestamp = () => Math.floor(Date.now()/1000)

/**
 * Number of seconds since the Unix Epoch,
 * rounded to the nearest minute
 * @returns {number}
 */
const roundedTimestamp = () => Math.floor(timestamp()/60)*60

/**
 * 
 * @returns {number} Timezone offset in seconds
 */
 const timezoneOffset = () => new Date().getTimezoneOffset()*60

 /**
  * 
  * @param {number} timestamp Unix timestamp in seconds 
  * @returns {Date} Date object
  */
 const timestampToLocalDate = timestamp => new Date((parseInt(timestamp) - timezoneOffset())*1000)
 
 const timestampToLocalISOString = timestamp => timestampToLocalDate(timestamp).toISOString().slice(0,19)
 
 const timestampToLocalHumanString = timestamp => timestampToLocalDate(timestamp).toLocaleDateString(undefined, {
	 weekday: 'long',
	 month: 'long',
	 day: 'numeric'
 })
 
 /**
  * 
  * @param {string} ISOString ISO datetime string
  * @returns {number} Unix timestamp in seconds 
  */
 const LocalISOStringToTimestamp = ISOString => Math.floor(new Date(ISOString+'Z').getTime()/1000) + timezoneOffset()
 const typography = text => text
		// Smart quotes
		/* opening singles */
		.replace(/(^|[-\u2014\s(\["])'/g,'$1‘')
		/* closing singles & apostrophes */
		.replace(/'/g,'’')
		/* opening doubles */
		.replace(/(^|[-\u2014/\[(\u2018\s])"/g,'$1“')
		/* closing doubles */
		.replace(/"/g,'”')
	// Dashes
		/* em-dashes */
		.replace(/\s--\s?/g,' — ')
		/* en-dashes */
		.replace(/--/g,'–')
/**
 * Shifts every character 13 places down the alphabet; swaps - and .
 * @param {string} string 
 * @returns {string}
 */
const rot13 = string => string.replace(/[a-z]/gi,c=>'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijklm.-'['ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-.'.indexOf(c)])

/**
 * 
 * @param {array} array array
 * @returns {*} random element of the array
 */
const randomElement = array => array[Math.floor(Math.random()*array.length)]

const urlID = () => {
	let id = window.location.pathname.split('/').pop() // Last portion of the path is the ID
	if (id.includes('.')) id = rot13(id) // A . indicates that the ID is ciphered.
	if (!id.includes('-')) id = makeID()
	return id
}
async function initWorker(){
	if (!('serviceWorker' in navigator)) return
	navigator.serviceWorker.register('/worker.js')
	navigator.serviceWorker.subscriptionList = { }
	navigator.serviceWorker.addEventListener('message', ({data:{type,path}}) => {
		console.log(data)
		const list = navigator.serviceWorker.subscriptionList
		if(type=='update' && path in list) (list[path])()
	})
	// navigator.serviceWorker.getRegistrations().then(function (registrations) {
	// 	for (const registration of registrations) {
	// 		// unregister service worker
	// 		console.log('serviceWorker unregistered')
	// 		registration.unregister()
	// 	}
	// })
}
initWorker()
initEditor()
initBrowser()
initResize()
initAuth()
