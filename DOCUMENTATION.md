# AHS|ACES Documentation

## `modules/`: Third-party modules

## `config.js`: Firebase configuration

## `auth.js`: Firebase authentication

The app's Firebase Realtime Database grants read-access to anyone with the public API key. It only allows write access (publishing and deleting) to users who are authenticated. ACES uses Firebase's email-and-password authentication system.

## `init.js`: ACES initialization

## `search.js`: Article search

Simple exact-match searches.

## `resize.js`: Resize bar

## `editor.js`: Editor

## `preview.js`: Browser

The user interface consists of an editor (`editor`), a file browser (`browser`), and a sign-in form (`auth`).

The `previews` object holds all available articles. Snippets of its contents are directly displayed in the browser. When a preview is clicked, it updates the editor with the corresponding article.

The editor relies on Firebase's JavaScript SDK to fetch and submit articles.

## `article.js`: The Article class

## `remote.js`: Write articles & notifications to remote