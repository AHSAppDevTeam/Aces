# Overview of the AHS|ACES codebase

## JavaScript

### `modules/`

Third-party modules are placed here. `firebase-*.js` are Firebase SDKs used for database reading, writing, and authentication. `marked.js` is a converter between Markdown syntax and HTML.

### `config.js`

This configures the Firebase SDKs with the appropriate information, such as the public API key and the URL of the database.

### `auth.js`

Our Firebase Realtime Database grants read-access to anyone with the public API key. It only allows write access (publishing and deleting) to users who are authenticated. ACES uses Firebase's email-and-password authentication system.

### `init.js`

This handles the initialization of the webpage. It calls the first load of articles and notification data.

### `search.js`

Article search

Simple exact-match searches.

### `resize.js`

Resize bar

### `editor.js`

Editor

### `preview.js`

The user interface consists of an editor (`editor`), a file browser (`browser`), and a sign-in form (`auth`).

The `previews` object holds all available articles. Snippets of its contents are directly displayed in the browser. When a preview is clicked, it updates the editor with the corresponding article.

The editor relies on Firebase's JavaScript SDK to fetch and submit articles.

### `article.js`

The Article class

### `remote.js`

Writes articles & notifications to the remote Firebase Realtime Database. For the notifications, it also posts them to a separate Firebase Cloud Messaging database.
