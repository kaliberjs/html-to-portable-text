const { expect, test } = require('@jest/globals')
const htmlToPortableText = require('../src/index')

function block(info) {
  return (...children) => ({
    _type: 'block',
    style: 'normal',
    ...info,
    children
  })
}

function span(text, marks) {
  return {
    _type: 'span',
    text,
    ...(marks && { marks })
  }
}

const tests = {
  textOnly: {
    input: 'aap',
    output: [block()(span('aap'))]
  },
  singleDiv: {
    input: '<div>aap</div>',
    output: [block()(span('aap'))]
  },
  nestedDiv: {
    input: '<div><div>aap</div></div>',
    output: [block()(span('aap'))]
  },
  nestedDivII: {
    input: '<div>noot<div>aap</div></div>',
    output: [block()(span('noot'), span('aap'))]
  },
  sequentialDiv: {
    input: '<div>noot</div><div>aap</div>',
    output: [block()(span('noot')), block()(span('aap'))]
  },
  nestedDivIII: {
    input: '<div><div>aap</div>noot</div>',
    output: [block()(span('aap'), span('noot'))]
  },
  singleBold: {
    input: '<b>aap</b>',
    output: [block()(span('aap', ['strong']))]
  },
  partiallyBold: {
    input: '<b>aap</b>noot',
    output: [block()(span('aap', ['strong']), span('noot'))]
  },
  partiallyBoldII: {
    input: '<b>aap</b><div>noot</div>',
    output: [block()(span('aap', ['strong'])), block()(span('noot'))] // aangepast, dit was origineel 1 block met 2 spans
  },
  partiallyBoldAndNestedDiv: {
    input: '<div><div>aap</div><b>noot</b></div>',
    output: [block()(span('aap'), span('noot', ['strong']))]
  },
  singleDivWithBold: {
    input: '<div><b>noot</b></div>',
    output: [block()(span('noot', ['strong']))]
  },
  boldAndUnderlined: {
    input: '<b><u>aap</u></b>',
    output: [block()(span('aap', ['strong', 'underlined']))]
  },
  boldAndPartiallyUnderlined: {
    input: '<b>aap<u>noot</u></b>',
    output: [block()(span('aap', ['strong']), span('noot', ['strong', 'underlined']))]
  },
  boldAndPartiallyDivedUnderlined: {
    input: '<b>aap<div><u>noot</u></div></b>',
    output: [block()(span('aap', ['strong']), span('noot', ['strong', 'underlined']))]
  },
  externalLink: {
    input: '<a href="./">aap</a>',
    output: [
      block({ markDefs: [{ _type: 'externalLink', _key: '0', href: './' }] })(
        span('aap', ['0'])
      )
    ]
  },
  doubleExternalLink: {
    input: '<a href="./aap">aap</a><a href="./noot">noot</a>',
    output: [
      block({
        markDefs: [
          { _type: 'externalLink', _key: '0', href: './aap' },
          { _type: 'externalLink', _key: '1', href: './noot' }
        ]
      })(
        span('aap', ['0']),
        span('noot', ['1']),
      )
    ]
  },
  boldExternalLink: {
    input: '<a href="./"><b>aap</b></a>',
    output: [
      block({ markDefs: [{ _type: 'externalLink', _key: '0', href: './' }] })(
        span('aap', ['0', 'strong']),
      )
    ]
  },
  partiallyBoldExternalLink: {
    input: '<a href="./">aap<b>noot</b></a>',
    output: [
      block({ markDefs: [{ _type: 'externalLink', _key: '0', href: './' }] })(
        span('aap', ['0']),
        span('noot', ['0', 'strong']),
      )
    ]
  },
  partiallyBoldAndPartiallyBoldAndUnderlinedExternalLink: {
    input: '<a href="./">aap<b>noot<u>mies</u></b></a>',
    output: [
      block({ markDefs: [{ _type: 'externalLink', _key: '0', href: './' }] })(
        span('aap', ['0']),
        span('noot', ['0', 'strong']),
        span('mies', ['0', 'strong', 'underlined']),
      )
    ]
  },
  partiallyBoldAndPartiallydUnderlinedExternalLink: {
    input: '<a href="./">aap<b>noot</b><u>mies</u></a>',
    output: [
      block({ markDefs: [{ _type: 'externalLink', _key: '0', href: './' }] })(
        span('aap', ['0']),
        span('noot', ['0', 'strong']),
        span('mies', ['0', 'underlined']),
      )
    ]
  },
  externalLinkAndBoldText: {
    input: '<a href="./">aap</a><b>noot</b>',
    output: [
      block({ markDefs: [{ _type: 'externalLink', _key: '0', href: './' }] })(
        span('aap', ['0']),
        span('noot', ['strong']),
      )
    ]
  },
  divWithExternalLinkAndBoldText: {
    input: '<div><a href="./">aap</a><b>noot</b></div>',
    output: [
      block({ markDefs: [{ _type: 'externalLink', _key: '0', href: './' }] })(
        span('aap', ['0']),
        span('noot', ['strong']),
      )
    ]
  },
  paragraph: {
    input: '<p>aap</p>',
    output: [block()(span('aap'))]
  },
  twoParagraphs: {
    input: '<p>aap</p><p>noot</p>',
    output: [block()(span('aap')), block()(span('noot'))]
  },
  divWithTwoParagraphs: {
    input: '<div><p>aap</p><p>noot</p></div>',
    output: [block()(span('aap')), block()(span('noot'))]
  },
  divWithTextAndParagraph: {
    input: '<div>aap<p>noot</p></div>',
    output: [block()(span('aap')), block()(span('noot'))]
  },
  divWithParagraphAndText: {
    input: '<div><p>aap</p>noot</div>',
    output: [block()(span('aap')), block()(span('noot'))]
  },
  heading: {
    input: '<h1>aap</h1>',
    output: [block({ style: 'h1' })(span('aap'))]
  },
  headingWithSubHeading: {
    input: '<h1>aap</h1><h2>noot</h2>',
    output: [block({ style: 'h1' })(span('aap')), block({ style: 'h2' })(span('noot'))]
  },
  headingWithParagraph: {
    input: '<h1>aap</h1><p>noot</p>',
    output: [block({ style: 'h1' })(span('aap')), block()(span('noot'))]
  },
  headingWithParagraphInDiv: {
    input: '<div><h1>aap</h1><p>noot</p></div>',
    output: [block({ style: 'h1' })(span('aap')), block()(span('noot'))]
  },
  headingWithSubheadingAndParagraphInDiv: {
    input: '<div><h1>aap</h1><h2>noot</h2><p><h3>mies</h3>wim</p></div>',
    output: [
      block({ style: 'h1' })(span('aap')),
      block({ style: 'h2' })(span('noot')),
      block({ style: 'h3' })(span('mies')),
      block({ style: 'normal' })(span('wim')),
    ]
  },
  simpleOrderedList: {
    input: '<ol><li>aap</li><li>noot</li></ol>',
    output: [
      block({ level: 1, listItem: 'number' })(span('aap')),
      block({ level: 1, listItem: 'number' })(span('noot')),
    ]
  },
  simpleUnOrderedList: {
    input: '<ul><li>aap</li><li>noot</li><li>mies</li></ul>',
    output: [
      block({ level: 1, listItem: 'bullet' })(span('aap')),
      block({ level: 1, listItem: 'bullet' })(span('noot')),
      block({ level: 1, listItem: 'bullet' })(span('mies')),
    ]
  },
  nestedList: {
    input: '<ul><li>aap<ol><li>noot</li><li>mies</li><li>noot</li></ol></li><li>wim</li></ul>',
    output: [
      block({ level: 1, listItem: 'bullet' })(span('aap')),
      block({ level: 2, listItem: 'number' })(span('noot')),
      block({ level: 2, listItem: 'number' })(span('mies')),
      block({ level: 2, listItem: 'number' })(span('noot')),
      block({ level: 1, listItem: 'bullet' })(span('wim')),
    ]
  },
  whiteSpaces: {
    input: '\n<ul>\n <li>aap</li>\n <li>noot</li>\n <li>mies</li>\n <li></ul>',
    output: [
      block({ level: 1, listItem: 'bullet' })(span('aap')),
      block({ level: 1, listItem: 'bullet' })(span('noot')),
      block({ level: 1, listItem: 'bullet' })(span('mies')),
    ]
  },
  whiteSpaces_2: {
    input: '&nbsp;\n<ul>\n&nbsp;<li>aap</li>\n&nbsp;<li>noot</li>\n<li>mies</li>\n &nbsp;<li></ul>',
    output: [
      block({ level: 1, listItem: 'bullet' })(span('aap')),
      block({ level: 1, listItem: 'bullet' })(span('noot')),
      block({ level: 1, listItem: 'bullet' })(span('mies')),
    ]
  },
  pInList: {
    input: '<ul><li><p>aap</p></li><li>noot</li></ul>',
    output: [
      block({ level: 1, listItem: 'bullet' })(span('aap')),
      block({ level: 1, listItem: 'bullet' })(span('noot')),
    ]
  },
  h1AndPInList: {
    input: '<ul><li><p><h1>aap</h1>noot</p></li><li><h1>mies</h1><p>wim</p></li></ul>',
    output: [
      block({ level: 1, listItem: 'bullet' })(span('aap'), span('noot')),
      block({ level: 1, listItem: 'bullet' })(span('mies'), span('wim')),
    ]
  },
  problematicExample1: {
    input: `<p>aap<br/>noot<br>mies<br /><br />wim</p>`,
    output: [
      block({ style: 'normal' })(
        span('aap'), span('\n'),
        span('noot'), span('\n'),
        span('mies'), span('\n'),
        span('\n'),
        span('wim')
      )
    ]
  },
}

Object.entries(tests).forEach(
  ([k, { input, output }]) => {
    test(k, () => {

      const result = htmlToPortableText(input)
      expect(result).toEqual(output)
    })
  }
)
