/*
  heX ([0-9]->[g-p] and last character upperCase)


  integer positive: 'x'heX
  integer negatie: 'X'heX
  float positive: 'q'heXheX -> hex.hex -> dec.dec 
  float negative: 'Q'heXheX -> hex.hex -> dec.dec 
  false: '0'
  true: '1'
  NaN: '2
  -Infinity: '3'
  +Infinity: '4'
  undefined: '5'
  string: (heX with the length)string
  null: '!'
  array: '_'anyanyany'.'
  object: '('stringanystringanystringany'.'
  set: 's'anyanyany'.'
  map: 'S'anyanyanyanyanyany'.'
  date: 'Z'hex (miliseconds)
  buffer: 'v'heX string(base64)
  plugin: ')'anyanyany'.' parameters to be passed to the plugin, after deserialized
*/

const mapHexEncode = {
  0: 'g',
  1: 'h',
  2: 'i',
  3: 'j',
  4: 'k',
  5: 'l',
  6: 'm',
  7: 'n',
  8: 'o',
  9: 'p',
  a: 'a',
  b: 'b',
  c: 'c',
  d: 'd',
  e: 'e',
  f: 'f',
  '.': '.',
}
const plugins = []

function encode(x) {
  switch (typeof x) {
    case 'string':
      return encodeString(x)
    case 'number':
      return encodeNumber(x)
    case 'boolean':
      return encodeBoolean(x)
    case 'undefined':
      return encodeUndefined(x)
    case 'object':
      return encodeObject(x)
    case 'function':
      throw new Error('functions cannot be encoded')
  }
}

function encodeString(x) {
  return encodeInteger(x.length) + x
}
function encodeNumber (x) {
  if (Number.isInteger(x)) {
    return (x < 0 ? 'X' : 'x') + encodeInteger(x)
  }
  if(Number.isFinite(x)) {
    return (x < 0 ? 'Q' : 'q' ) + encodeFloat(x)
  }
  if (Number.isNaN(x)) {
    return '2'
  }
  return x < 0
    ? '3' // -Infinity
    : '4' // +Infinity 
}

function encodeBoolean(x) {
  return x
    ? '1' // true
    : '0' // false
}

function encodeUndefined(x) {
  return '5'
}

function encodeObject(x) {
  if (Array.isArray(x)) {
    return '_' + x.map(encode).join('') + '.'
  }

  if (x === null) {
    return '!'
  }

  if (x instanceof Set) {
    return 's' + Array.from(x).map(encode).join('') + '.'
  }

  if (x instanceof Map) {
    return 'S' + Array.from(x.entries()).map(encodeKeyValue).join('') + '.'
  }

  if (x instanceof Date) {
    return 'Z' + encodeInteger(x.getTime())
  }

  if (typeof Buffer !== undefined && x instanceof Buffer) {
    return 'v' + encodeString(x.toString('base64url'))
  }

  const plugin = x.__urlize || plugins.find(plugin => plugin.match(x))

  if (plugin) {
    return ')' + [plugin.name, ...plugin.values(x)].map(encode).join('') + '.'
  }

  return '(' + Object.entries(x).map(encodeKeyValue).join('') + '.'
}

function encodeInteger(x) {
  const hex = Array.from(x.toString(16))
  const last = hex.length - 1
  return Array.from(hex).map((x, i) => i === last ? mapHexEncode[x].toUpperCase() : mapHexEncode[x]).join('')
}

function encodeFloat(x) {
  return Array.from(x.toString(10)).map(c => mapHexEncode[c]).join('').replace(/(.)\./, (total, s) => s.toUpperCase()).replace(/.$/, s => s.toUpperCase())
}
function encodeKeyValue([x ,y]) {
  return encode(x) + encode(y)
}

exports.cencode = (x) => encode(x).replace(/\.*$/, '')

exports.sign = function sign(x, signing) {
  const serialized = encode(x).replace(/\.+$/, '')
  const signature = signing(serialized)

  if (!signature.then) {
    return encode(signature) + serialized
  }
  return signature.then(signature => encode(signature) + serialized)
}

exports.plugins = plugins