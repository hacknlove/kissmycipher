const mapHexDecode = {
  'g': 0,
  'h': 1,
  'i': 2,
  'j': 3,
  'k': 4,
  'l': 5,
  'm': 6,
  'n': 7,
  'o': 8,
  'p': 9,
  'a': 'a',
  'b': 'b',
  'c': 'c',
  'd': 'd',
  'e': 'e',
  'f': 'f',
}

const plugins = {}

function decode (x) {
  const type = x[0]

  switch(type) {
    case '0':
      return [false, x.substr(1)]
    case '1':
      return [true, x.substr(1)]
    case '2':
      return [NaN, x.substr(1)]
    case '3':
      return [-Infinity, x.substr(1)]
    case '4':
      return [Infinity, x.substr(1)]
    case '5':
      return [undefined, x.substr(1)]
    case '!':
      return [null, x.substr(1)]
    case 'x':
      return decodeInteger(x.substr(1))
    case 'X':
      return decodeInteger(x.substr(1), true)
    case 'q':
      return decodeFloat(x.substr(1))
    case 'Q':
      return decodeFloat(x.substr(1), true)
    case '(':
      return decodeObject(x.substr(1))
    case '_':
      return decodeArray(x.substr(1))
    case 's':
      return decodeSet(x.substr(1))
    case 'S':
      return decodeMap(x.substr(1))
    case 'Z':
      return decodeDate(x.substr(1))
    case 'v':
      if (typeof Buffer !== undefined) {
        return decodeBuffer(x.substr(1))
      }
      throw new Error('Buffer not defined')
    case ')':
      return decodePlugin(x.substr(1))
  }
  if (mapHexDecode[x[0].toLowerCase()] !== undefined) {
    return decodeString(x)
  }
  throw new Error(`Unknown type: ${x.substr(10)}...`)
}

function decodeInteger(x, isNegative) {
  const parsed = x.match(/^([a-p]*[A-P])(.*)/)
  if (!parsed) {
    throw new Error(`Wrong integer at ${x.substr(0, 10)}...`)
  }

  return [parseInt((isNegative ? '-' : '') + Array.from(parsed[1].toLowerCase()).map(x => mapHexDecode[x]).join(''), 16), parsed[2]]
}

function decodeFloat(x, isNegative) {
  const parse = x.match(/^([g-p]*[G-P])([g-p]*[G-P])(.*)/)
  if (!parse) {
    throw new Error(`Wrong float at ${x.substr(0, 10)}...`)
  }

  return [parseFloat((isNegative ? '-' : '') + Array.from(parse[1].toLowerCase()).map(x => mapHexDecode[x]).join('') + '.' + Array.from(parse[2].toLowerCase()).map(x => mapHexDecode[x]).join('')), parse[3]]
}

function decodeObject(x) {
  const object = {}
  let items = x
  for (;items[0] && items[0] !== '.';) {
    const [key, rest1] = decodeString(items)
    const [value, rest2] = decode(rest1)

    object[key] = value

    items = rest2
  }  
  return [object, items.substr(1)]
}

function decodeArray(x) {
  const array = []
  let items = x
  for (; items[0] && items[0] !== '.';) {
    const [value, rest1] = decode(items)
    array.push(value)
    items = rest1
  }
  return [array, items.substr(1)]
}

function decodeSet(x) {
  const set = new Set()
  let items = x
  for (; items[0] && items[0] !== '.';) {
    const [value, rest1] = decode(items)
    set.add(value)
    items = rest1
  }
  return [set, items.substr(1)]
}

function decodeMap(x) {
  const map = new Map()
  let items = x
  for (; items[0] && items[0] !== '.';) {
    const [key, rest1] = decode(items)
    const [value, rest2] = decode(rest1)
    map.set(key, value)
    items = rest2
  }
  return [map, items.substr(1)]
}

function decodeDate(x) {
  const [integer, rest] = decodeInteger(x)
  return [new Date(integer), rest]
}

function decodeString(x) {
  const [length, rest] = decodeInteger(x)
  return [rest.substr(0, length), rest.substr(length)]
}

function decodePlugin(x) {
  const [name, rest1] = decodeString(x)
  const plugin = plugins[name]

  if (!plugin) {
    throw new Error(`Missing plugin ${name}`)
  }

  const [params, rest2] = decodeArray(rest1)


  return [plugin(...params), rest2]
}

function decodeBuffer(x) {
  const [base64url, rest] = decodeString(x)

  return [Buffer.from(base64url, 'base64url'), rest]
}

function main(x) {
  const [value, rest] = decode(x)

  if (rest) {
    throw new Error(`Extra characters ${x.substr(0, 10)}...`)
  }
  return value
}

exports.plugins = plugins

exports.decencode = main

exports.verify = function verify (x, cb) {
  const [signature, serializedData] = decode(x)
  const verification = cb(signature, serializedData)

  if (verification.then) {
    return verification.then(() => main(serializedData)) 
  }

  return main(serializedData)
}