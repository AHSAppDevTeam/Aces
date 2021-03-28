js=$(cd js && cat modules/*.js config.js auth.js init.js resize.js)
css=$(cd css && cat *.css)
printf "
<!DOCTYPE html>
<html lang='en-US' dir='ltr'>
  	<head>
		<meta charset='utf-8'>

		<title>Aces</title>
		<meta name='description' content='Arcadia High School App Content Editing System'>
		<meta name='author' content='Xing Liu'>
		<meta name='viewport' content='width=device-width, initial-scale=1.0'>

		<link rel='icon' type='image/png' href='/icon.png'>
		<style>%s</style>
	</head>
	<body>
		<main id='editor'>
			<header>
				<input type='button'
					class='remove'
					title='remove article (alt+r)'
					value='Remove'
					accesskey='r'>
				<input type='button'
					class='render'
					title='toggle preview/edit mode (alt+v)'
					value='Preview'
					accesskey='v'>
				<input type='button'
					class='publish'
					title='publish article (alt+p)'
					value='Publish'
					accesskey='p'>
			</header>
			<label>
				<span>title</span>
				<textarea class='title' accesskey='t'></textarea>
			</label>
			<label>
				<span>author</span>
				<textarea class='author' accesskey='a'></textarea>
			</label>
			<label>
				<span>date</span>
				<input class='date' type='date'>
			</label>
			<label class='half-width pad'>
				<input class='featured' type='checkbox'>
				feature
			</label>
			<label class='half-width pad'>
				<input class='notified' type='checkbox'>
				notify
			</label>
			<label>
				<span>notification body</span>
				<textarea class='notif'></textarea>
			</label>
			<label class='pad'>
				<span>images and videos</span>
				<section class='media'>
					<section class='new'>
						<label class='upload'>
							<input type='file' multiple accept='image/*'>
						</label>
						<input class='url' type='url' placeholder='Image/YouTube URL'>
						<!-- insert images -->
					</section>
				</section>
			</label>
			<label>
				<span>article body</span>
				<section class='markdown'>
					<label>
						<textarea class='input' accesskey='b'></textarea>
					</label>
					<code class='output'></code>
				</section>
			</label>
			<section class='body'></section>
			<label>
				<span>ID (click to copy)</span>
				<input class='id' readonly>
			</label>
		</main>
		<div id='resize' tabindex='0'></div>
		<aside id='browser'>
			<header>
				<input type='text'
					class='search'
					title='search articles (alt+/)'
					placeholder='Search titles'
					accesskey='/'>
				<input type='button'
					class='refresh'
					title='refresh articles (alt+u)'
					value='↻'
					accesskey='u'>
				<a type='button'
					class='sources'
					title='view resources'
					href='sources.html'
					target='_blank'>🕮</a>
				<input type='button'
					class='sign'
					title='sign in/out (alt+s)'
					value='Sign in'
					accesskey='s'>
			</header>
			<!-- insert previews -->
		</aside>
		<form class='sign-in' tabindex='0'>
			<label>
				email
				<input class='email' type='email'
				autocomplete='on' spellcheck='false' required>
			</label>
			<label>
				password
				<input class='password' type='password'
				autocomplete='on' spellcheck='false' required>
			</label>
			<input type='button' class='cancel' value='✕'>
			<input type='submit' value='sign in'>
		</form>

		<!-- TEMPLATES -->
		<template id='template-preview'>
			<article class='preview' class='not-published'>
				<a class='title'></a>
				<section class='actions'>
					<label title='feature/unfeature (f)'>
						<input class='featured' type='checkbox'>
						<svg viewBox='-1 -1 26 26' stroke-width='2.2' width='24' height='24'>
							<path d='M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z'/>
						</svg>
					</label>
					<!--<label title='move to archive (a)' class='archive'>
						<svg viewBox='0 0 24 24' stroke-width='0' width='24' height='24'>
							<path d='M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM6.24 5h11.52l.81.97H5.44l.8-.97zM5 19V8h14v11H5zm8.45-9h-2.9v3H8l4 4 4-4h-2.55z'/>
						</svg>
					</label>-->
				</section>
			</article>
		</template>
		<template id='template-image'>
			<section class='image' draggable='true'>
				<img>
				<input type='button' class='delete' value='×'>
			</section>
		</template>
		<script>%s</script>
  </body>
</html>
" "${css}" "${js}"