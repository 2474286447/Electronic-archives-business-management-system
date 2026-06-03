import JSEncrypt from 'jsencrypt'

export function encryptPasswordWithPem(plainText: string, publicKeyPem: string) {
  if (!plainText) return ''
  const enc = new JSEncrypt()
  enc.setPublicKey(publicKeyPem)
  const cipher = enc.encrypt(String(plainText))
  if (!cipher) {
    throw new Error('密码 RSA 加密失败，请刷新页面后重试')
  }
  return cipher
}
