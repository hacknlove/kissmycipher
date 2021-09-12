# kissmycipher

Symmetric-key cipher for browser and node, fully customizable and as strong as you need.

## v2.0.0
This version uses a new default serializer more eficient in size, and also it fixes a bug that prevent unicode characters from being correctly encrypted/decrypted

But, it's incompatible with previous version.

Anything encripted with v1 cannot be decrypted with v2, and viceversa.
## Examples

```javascript
const { encrypt, decrypt } = require('kissmycipher')

// Text encryption - decryption
encrypted = encrypt('password', 'hola mundo')
// -> 'tyPreEM5O9QQI6HjapMVd_pB4RnJS5BKKGSSvpL2TU2e5ZiDL-rqsvkv2w'
decrypt('password', encrypted)
// -> 'hola mundo'

// Object encryption - decryption
encrypted = encrypt('password',  {hello: ' world'})
// -> 'epTDSyPjELSzeCBUyUFF6V16reXNUKdYkOG0HxzArBNQjUKwGHD412D5xRNsYw'
decrypt('password', encrypted)
// -> { hello: ' world' }

// Change strength
encrypted = encrypt('password', 'hola mundo', { strength: 500 })
// -> 'jbmiSqYLmh8LrEkNmrO8Fet-5qHJWITpw5AbWW0I-gX7mE7ILlNPvCzhr8zy-r4xqd60RR3TLlHUyBtsxceW-kKGWhDPVj0DXIUv4KWK4gEQDwEONNLHlvsql3aBpi8RoIsRbzcu0FFb5Wz4mXM134c5NWTeD6QPZMIF5EDtHudVl-GORhibrf3IqcdlIQzFcDmw_bCLnMlQ3w67QRqMnMrrnZAdy4exjDNexKU8gx8irR1e50zzfuzQfRdEgkjGtCa3ko015io2lSb9qAtOL_RtL5xSLsHkYNt1icgextAxTy3Od6SDDLBv3AQR0fv1JKqsap0mIffZrJ-nSszvC2X2Yl6zC8fpmXSXbtZx_pOy5fekNg3Z3PqUq7jGtwawImf0x2KLtcpmIwlO3CIs56qsDac7F3ckGoQm5rtdVPXkxGoNB5hgsrJnZELQi0VpLdGihaiV-N7yTkIYzA_QEg6YSyEfmJJtIYIoQYp56rU-haF84TkeRtexf2SipNkNQsnS_LF81hl51z4xsXlQPdMhKCmOIV0yYQKI2NMX2WlEaICYYRVUCxJDdfes1Y-Wkprdge9iDoN0T39FYcYNfi3Lig4GlmVb8_BqFvk1hwv0ATgXT6pkRqN9Qo4-5nZBMH_wZi0uBu62qwWthzOz1vd72DaXkhVrOHiiEkjSuQ'
decrypt('password', encrypted, { strength: 500 })
// -> 'hola mundo'

// Use a different PRNG
const seedrandom = require('seedrandom')
encrypted = encrypt('password', 'hola mundo', { prng: seedrandom.xorwow })
// -> 'GHwmfiAJzMSqvCsYRAD55XXup0e3Qs6GLsJol2s35fg5c9txiZeL3K4-eQ'
decrypt('password', encrypted, { prng: seedrandom.xorwow })
// -> 'hola mundo'

// using a different serializer/deserializer
const bencode=require('bencode')
encrypted = encrypt('password', 'hola mundo', { serializer: bencode.encode })
// -> '422wH8VTvpPJhVeB_sJmSmVH426UABXj2GQfqcOX_Vh00YLs-jXiKkSshyaG'
decrypt('password', encrypted, { deserializer: (bytes) => bencode.decode(bytes, 'utf-8')})
// -> 'hola mundo'


```

## Reference

### `encrypt(password, data, [options]) -> encrypted`

#### password
Password must be a string.
The longer the better. 

#### data
it can be anything, serializable.

#### options.prng
You can set a different pseudorandom number generator.

It should be a function that accepts an integer seed, and it should return an object with the method int32 that returns the pseudo random numbers.

It defaults to seedrandom

#### options.serializer
You can set a different serializer. It should be a function that returns an array of numbers, or Uint8Array.

#### options.strength
The greater the number the stronger the encryption. 

Warning: It increses the size of the encrypted data.

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

### conf
you can use the object conf to set the default configuration, instead of passing once and again your custom configuration to encrypt and decrypt

**Example:**
```
const { conf } = require('kissmycipher')

conf.strength = 64
```