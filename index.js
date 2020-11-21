const seedrandom = require('seedrandom');
const bencode = require('bencode');
const base64Url = require('base64url');
const { EJSON } = require('bson');

function defaultDeserializer (bytes) {
  return EJSON.parse(String.fromCharCode(...bytes));
}
function defaultSerializer (data) {
  return EJSON.stringify(data).split('').map(a => a.charCodeAt(0))
}

let getRandomKey;

if (process.browser) {
  getRandomKey = function getRandomKeyBrowser(length = 32) {
    const randomKey = new Uint8Array(length);
    window.crypto.getRandomValues(randomKey);
    return randomKey;
  };
} else {
  const crypto = require('crypto');

  getRandomKey = function getRandomKeyServer(length = 32) {
    return crypto.randomBytes(length);
  };
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

exports.decrypt = function decrypt(password, sealed, { strength = 32, serializer = defaultSerializer, deserializer = defaultDeserializer, prng = seedrandom } = {}) {
  const message = base64Url.toBuffer(sealed);
  password = password.split('').map(a => a.charCodeAt(0));

  cipher(password, message, prng);

  const key = message.slice(0, strength);
  const payload = message.slice(strength);

  cipher(key, payload, prng);

  return deserializer(payload);
}

exports.encrypt = function encrypt(password, data, { strength = 32, serializer = defaultSerializer, prng = seedrandom } = {}) {
  const randomKey = getRandomKey(strength);
  password = password.split('').map(a => a.charCodeAt(0));

  const payload = serializer(data);
  cipher(randomKey, payload, prng);

  const message = appendBuffer(randomKey, payload);

  cipher(password, message, prng);

  return base64Url.encode(message);
}
