# BEFORE YOU PUBLISH
- Read [Libraries van Kaliber](https://docs.google.com/document/d/1FrJi-xWtKkbocyMVK5A5_hupjl5E4gD4rDvATDlxWyc/edit#heading=h.bb3md3gyf493).
- Make sure your example works.
- Make sure your package.json is correct. Have you change the library title?
- Update the bin/postInstall script. It should refer to your library.
- Update the `<title>` tag in `index.html.js`.
- Remove 'BEFORE YOU PUBLISH' and 'PUBLISHING' from this document.

# PUBLISHING
- Make sure you are added to the kaliber organization on NPM
- run `yarn publish`
- Enter a correct version, we adhere to semantic versioning (semver)
- run `git push`
- run `git push --tags`
- Send everybody an email to introduce them to your library!

# Kaliber HTML to portableText plugin
A plugin for converting html to portableText

## Usage
`htmlToPortableText(html, overrides = {})`

```js
const htmlToPortableText = require('@kaliber/html-to-portable-text')

const portableText = processHTML('<p><h1>This</strong><em>is HTML</em></p>')

function processHTML(html) {
  return removeUndefinedValues(htmlToPortableText(html, { h1: 'heading', h2: 'subheading' }))
}

function removeUndefinedValues(o) {
  return JSON.parse(JSON.stringify(o))
}
```

## Development

```
> yarn
> yarn link
> yarn watch
```

```
yarn link @kaliber/html-to-portable-text
```

## Publish

```
yarn publish
git push
git push --tags
```
---
![](https://media.giphy.com/media/C6JQPEUsZUyVq/giphy.gif)

## Disclaimer
This library is intended for internal use, we provide __no__ support, use at your own risk. It does not import React, but expects it to be provided, which [@kaliber/build](https://kaliberjs.github.io/build/) can handle for you.

This library is not transpiled.
