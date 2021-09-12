const seedrandom = require('seedrandom');
const base64Url = require('base64url');
const { cencode, decencode } = require('cencode');

const conf = {
  deserializer: (bytes) => decencode(bytes.toString()),
  serializer: (data) => isoBuffer.from(cencode(data)),
  prng: seedrandom,
  strength: 32
}

exports.conf = conf

let getRandomKey;
let isoBuffer;

if (process.browser) {
  getRandomKey = function getRandomKeyBrowser(length = 32) {
    const randomKey = new Uint8Array(length);
    window.crypto.getRandomValues(randomKey);
    return randomKey;
  };
  isoBuffer = require('buffer/').Buffer

} else {
  const crypto = require('crypto');

  getRandomKey = function getRandomKeyServer(length = 32) {
    return crypto.randomBytes(length);
  };
  isoBuffer = Buffer
}

function espreadValue(lastValue, value, key) {
  const rng = seedrandom(lastValue + value);

  for (let i = key.length; i-- >= 1;) {
    key[i] ^= rng.int32() & 255;
  }
  return rng.int32();
}

function cipher(password, message) {
  let lastValue = espreadValue(password.length, message.length, message);

  for (let i = password.length; i-- >= 1;) {
    lastValue = espreadValue(lastValue, password[i], message);
  }
}

function appendBuffer(key, payload) {
  const tmp = new Uint8Array(key.length + payload.length);

  tmp.set(new Uint8Array(key));
  tmp.set(new Uint8Array(payload), key.length);
  return tmp;
}

exports.decrypt = function decrypt(password, sealed, { strength = conf.strength, deserializer = conf.deserializer, prng = conf.prng } = {}) {
  const message = base64Url.toBuffer(sealed);
  password = isoBuffer.from(password);

  cipher(password, message, prng);

  const key = message.slice(0, strength);
  const payload = message.slice(strength);
  cipher(key, payload, prng);

  return deserializer(payload);
}

exports.encrypt = function encrypt(password, data, { strength = conf.strength, serializer = conf.serializer, prng = conf.prng } = {}) {
  const randomKey = getRandomKey(strength);
  password = isoBuffer.from(password);

  const payload = serializer(data);
  cipher(randomKey, payload, prng);

  const message = appendBuffer(randomKey, payload);

  cipher(password, message, prng);

  return base64Url.encode(message);
}
