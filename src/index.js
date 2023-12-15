const htmlparser2 = require('htmlparser2')

module.exports = htmlToPortableText

function htmlToPortableText(html, overrides = {} ) {
  let keyCounter = 0

  const markNodes = {
    'b': 'strong',
    'strong': 'strong',
    'u': 'underlined',
    'i': 'em',
    'em': 'em',
  }
  const markDefNodes = {
    'a': 'externalLink'
  }
  const listNodes = {
    'ol': 'number',
    'ul': 'bullet',
  }
  const listItemNodes = ['li']
  const styleNodes = {
    'p': 'normal',
    'h1': 'h1',
    'h2': 'h2',
    'h3': 'h3',
    ...overrides,
  }

  const specialNodes = {
    'br': _ => [addSpanToBlock({ text: '\n', marks: [] })]
  }

  const parsedDOM = htmlparser2.parseDocument(html)

  const initialState = { marks: [], level: 0, listItem: null }
  const instructions = parsedDOM.children.flatMap(x =>
    domToPortableInstructions(x, { atRoot: true, state: initialState })
  )
  const portableText = instructionsToPortableText(instructions)

  return portableText

  function domToPortableInstructions(node, { atRoot, state }) {
    const isInList = Boolean(state.listItem)

    return (
      node.type === 'text'                 ? handleSpan(node, state) :
      node.name in specialNodes            ? specialNodes[node.name](node, state) :
      node.name in markNodes               ? handleMarkNode(node, state) :
      node.name in markDefNodes            ? handleMarkDefNode(node, state) :
      node.name in listNodes               ? handleListNode(node, state) :
      listItemNodes.includes(node.name)    ? handleListItemNode(node, state) :
      node.name in styleNodes && !isInList ? handleStyleNode(node, state) :
      atRoot                               ? handleUnknownRootNode(node, state) :
      handleChildren(node, state)
    )
  }

  function handleSpan(node, state) {
    const containsOnlyWhitespace = /^\s*$/.test(node.data)

    return containsOnlyWhitespace ? [] : [addSpanToBlock({ text: node.data, marks: state.marks })]
  }

  function handleMarkNode(node, state) {
    const mark = markNodes[node.name]
    return handleChildren(node, { ...state, marks: state.marks.concat([mark]) })
  }

  function handleMarkDefNode(node, state) {
    const key = `${keyCounter++}`
    return [
      addMarkDef({ _key: key, _type: markDefNodes[node.name], ...node.attribs }),
      ...handleChildren(node, { ...state, marks: state.marks.concat([key]) })
    ]
  }

  function handleListNode(node, state) {
    const listItem = listNodes[node.name]
    return handleChildren(node, { ...state, level: state.level + 1, listItem })
  }

  function handleListItemNode(node, state) {
    return [
      createBlock({ style: 'normal', level: state.level, listItem: state.listItem }),
      ...handleChildren(node, state),
      closeBlock()
    ]
  }

  function handleStyleNode(node, state) {
    return [
      createBlock({ style: styleNodes[node.name] }),
      ...handleChildren(node, state),
      closeBlock()
    ]
  }

  function handleChildren(node, state) {
    return node.children.flatMap(
      node => domToPortableInstructions(node, { atRoot: false, state })
    )
  }

  function handleUnknownRootNode(node, state) {
    return [
      createBlock({ style: 'normal' }),
      ...handleChildren(node, state),
      closeBlock(),
    ]
  }

  function instructionsToPortableText(instructions) {
    const { result } = instructions.reduce(
      ({ result, currentBlock }, { type, info }) => {

        if (type === closeBlock)
          return {
            result: removeLastIfEmpty(result, { currentBlock }),
            currentBlock: null
          }

        const createNewBlock = !currentBlock || type === createBlock
        const blockConfig = type === createBlock ? info : { style: 'normal' }
        const nextCurrentBlock = createNewBlock
          ? block({ children: [], ...blockConfig })
          : currentBlock

        if (type === addSpanToBlock)
          nextCurrentBlock.children.push(span(info))

        if (type === addMarkDef)
          nextCurrentBlock.markDefs = (nextCurrentBlock.markDefs || []).concat([info])

        if (!createNewBlock) return { result, currentBlock }

        return {
          result: removeLastIfEmpty(result, { currentBlock }).concat([nextCurrentBlock]),
          currentBlock: nextCurrentBlock
        }
      },
      { result: [], currentBlock: null }
    )

    return result
  }

  function removeLastIfEmpty(result, { currentBlock }) {
    if (!currentBlock || currentBlock.children.length) return result

    return result.slice(0, result.length - 1)
  }

  function addMarkDef(info) {
    return { type: addMarkDef, info }
  }

  function closeBlock() {
    return { type: closeBlock }
  }

  function addSpanToBlock(info) {
    return { type: addSpanToBlock, info }
  }

  function createBlock(info, options) {
    return { type: createBlock, info, options }
  }

  function block({ style, children, level = undefined, listItem = undefined }) {
    return {
      style,
      _type: 'block',
      children,
      ...(Boolean(level || listItem) && { level, listItem })
    }
  }

  function span({ text, marks }) {
    return {
      _type: 'span',
      text,
      ...(marks.length && { marks }),
    }
  }
}
