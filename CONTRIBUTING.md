# Contributing to AHS|ACES

AHS|ACES (Arcadia High School App Content Editing System) is a single static webpage that can read and edit articles from the Arcadia High Mobile database.

## Basics

To start programming ACES, clone this repository and open it with the code editor of your choice.

You will have to build the project for any JavaScript or CSS changes to take effect. Building locally requires a Bash shell (preinstalled on Linux/MacOS, available through WSL on Windows). Run `sh build.sh` at the root project directory. If you cannot build locally, push your changes to the remote repository and GitHub Actions will auto-build it.

## Rules

- Please follow the [Code of Conduct](CODE_OF_CONDUCT.md)
- To ensure anyone can be a content editor, regardless of whether they have disabilities such as visual impairments, make sure the editor adheres to most, if not all, of the [WCAG 2.0 accessibility standards](https://www.w3.org/TR/2006/WD-WCAG20-20060427/appendixB.html).
- Using tabs for indentation is preferred, but whatever floats your boat.
- Do not track user data except for logging the authors of database write requests.

## Code documentation

### JavaScript

#### `modules/`

Third-party modules

#### `config.js`

Firebase configuration

#### `auth.js`

Firebase authentication

The app's Firebase Realtime Database grants read-access to anyone with the public API key. It only allows write access (publishing and deleting) to users who are authenticated. ACES uses Firebase's email-and-password authentication system.

#### `init.js`

ACES initialization

#### `search.js`

Article search

Simple exact-match searches.

#### `resize.js`

Resize bar

#### `editor.js`

Editor

#### `preview.js`

The user interface consists of an editor (`editor`), a file browser (`browser`), and a sign-in form (`auth`).

The `previews` object holds all available articles. Snippets of its contents are directly displayed in the browser. When a preview is clicked, it updates the editor with the corresponding article.

The editor relies on Firebase's JavaScript SDK to fetch and submit articles.

#### `article.js`

The Article class

#### `remote.js`

Write articles & notifications to remote
