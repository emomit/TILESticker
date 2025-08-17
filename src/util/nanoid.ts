
const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
export function nanoid(size = 12) {
  let id = ''
  const cryptoObj = crypto?.getRandomValues?.(new Uint8Array(size))
  for (let i = 0; i < size; i++) {
    const n = cryptoObj ? cryptoObj[i]! % alphabet.length : Math.floor(Math.random() * alphabet.length)
    id += alphabet[n]
  }
  return id
}

