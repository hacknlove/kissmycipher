# kissmycipher

Symmetric-key cipher as strong as you need.

It is full customizable, based on PRNG and xor operations, and its code is short and clean without anything obscure or hard to understand.

## Why?

Why I did it?

I have not found a convenient way to encrypt and decrypt in browser side and server side.

I also have been using my own hashing algorith kissmyhash, and I realized I could use the same approach to design a simetric key cipher algorithm, so I did it.

My goals were to don't have limits on the key size or encryption strength, also I wanted the algorithm to be very clear and the library astonishing easy to use, and completely customizable, and I made it.

Why should you use it?

You might want to write some end to end encryption. You might also need the strongest future-prof encryption you can get. You might not trust AES algorithm or implementations and you feel better using a algorithm you can understand and whose core you can tweak have.

Why should you not use it?

Currently this is the only implementation. If you need to encrypt or decrypt in other programming languages, this is not for you, yet.

## Examples

```javascript
const { encrypt, decrypt } = require('kissmycipher')

// Text encryption - decryption
encrypted = kissmycipher.encrypt('password', 'hola mundo')
// -> 'pdZaT_1Xmqy5egoxl_4SZBpMeOS90wUbzPJi_sYDvb3pEz1Z7VhkbtmyKTw'
kissmycipher.decrypt('password', encrypted)
// -> 'hola mundo'

// Object encryption - decryption
encrypted = kissmycipher.encrypt('password',  {hello: ' world'})
// -> 'nkt62ouDOESMQ9Cuk57txJ6CtoMQ33_uhnWvp1J4PwSDwzK9zap9oMKbQmbl9G8pPxw'
kissmycipher.decrypt('password', encrypted)
// -> { hello: ' world' }

// Change strength
encrypted = kissmycipher.encrypt('password', 'hola mundo', { strength: 500 })
// -> '3r8FuDMsA6k0YX5uPlWUj2dd2lo0Ne3V9__Krwg1oErry3rIkC2FV9zlBWzbtnYhF7bkDFSDUBmdvAm7RhElx0zQf_h5FR9AFA2Tyux1vika2eof5ytJPfXz8c7JGgJwJsOXbnpTK9FkrWWJ_dB9eIJKZwtwqjkczap_iKicVROikxOwg0sBFC1B0fD-KdYXL6sTnHADaGvdtoyjUYr4EB7iIrFhknv571RcJAgSHSGYxlhGSzqHyq4RyX7TnA_iQpQyAUdF7zz7vpmBGUCLig9QrTkla4mNvgAX4sJ4-Om2owDDgeCET2ZGD5jySXbc49SnNNUG9IuLHInxdnkFhORU7btsUmQErwG7G6ypkh3p-jiQ0drbHwntz0Z-7vyK20qXSZd-j4nre9qFGUywpWIbaYMVgU8SCsl3zcUuY-Ognd7mmrVqLKkrPhJ8A67pun_7l0A74ybVUr8wM-KDCnumOwW5eMt44SsIX5XB2jeOMF1tcpcHA78fpyB9-kKhQEUtQIGFCHB_fFzRhq9VdX3sHhpaJdHLIkQYyfl46ypmLO6ohds5L5ic_BHcaXLxeAbkD14OCqTW_uq6pqTwWiW7NyrB9-M5m03kHBvmjwmppsbM18Bjhj9ZJ9OT-yI9j_FEMrx2YiRUqhNaxlwaW3h6DhHkFUQ2TIj3PBaOMzY'
kissmycipher.decrypt('password', encrypted)
// -> 'hola mundo'

// Use a different PRNG
const seedrandom = require('seedrandom')
encrypted = kissmycipher.encrypt('password', 'hola mundo', { prng: seedrandom.xorwow })
// -> 'w05FFxo1hVPXlCfViSof7Sr08vRfUI6DM49PTkngH4MB_biwV1QLyuZm2YY'
kissmycipher.decrypt('password', encrypted)
// -> 'hola mundo'

// using a different serializer/deserializer
const bencode=require('bencode')
encrypted = kissmycipher.encrypt('password', 'hola mundo', { serializer: bencode.encode, deserializer: (bytes) => bencode.decode(bytes, 'utf-8')})
// -> '422wH8VTvpPJhVeB_sJmSmVH426UABXj2GQfqcOX_Vh00YLs-jXiKkSshyaG'
kissmycipher.decrypt('password', encrypted, { serializer: bencode.encode, deserializer: (bytes) => bencode.decode(bytes, 'utf-8')})
// -> 'hola mundo'


```

## Reference

### `encrypt(password, data, [options]) -> encrypted`

#### password
Password must be a string.

The password is the key itself, It is not used to generate a fixed length key, so the longer the better.

#### data
it can be anything, but It must be serializable by EJSON.stringify or the custom serializer you set in that case.

#### options.prng
You can set a different pseudorandom number generator.

It should be a function that accepts an integer seed, and it should return an object with the method int32 that returns the pseudo random numbers.

It defaults to seedrandom

#### options.serializer
You can set a different serializer. It should be a function that returns an array of numbers, or Uint8Array.

#### options.strength
The greater the number the stronger the encryption. It increses the size of the encrypted data.

#### encrypted
The response of the function is an url compatible Base64 encoded string.

### `decrypt(password, encrypted, [options]) -> data`

#### password
It must be the same password that has been used for encryption

### encrypted
It must be the encrypted data

#### options.prng
It must be the same prng used for the encryption.

#### options.serializer
You can set a different serializer. It should be a function that returns an array of numbers, or Uint8Array.

#### options.strength
The greater the number the stronger the encryption. It increses the size of the encrypted data.

## Warnings about customizations

If you intend to share with other people data encrypted with a custom serializator, strength, or prng, they will need the password and those settings to decrypt the data.
# kissmycipher
