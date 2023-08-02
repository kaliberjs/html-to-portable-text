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
