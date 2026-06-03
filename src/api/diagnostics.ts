import { authApi } from './auth'
import { generateUUID } from '../utils/id'

export async function checkAuthApiHealth() {
  const result = {
    rsaPublicKey: false,
    captcha: false,
    errors: [] as string[]
  }

  try {
    const rsa = await authApi.getRsaPublicKey()
    result.rsaPublicKey = rsa.code === 0 || rsa.code === 200
    if (!result.rsaPublicKey) result.errors.push('RSA 公钥接口当前不可匿名访问')
  } catch (error) {
    result.errors.push(`RSA 公钥接口失败：${error instanceof Error ? error.message : String(error)}`)
  }

  try {
    const captchaRes = await fetch(authApi.getCaptchaImageUrl(generateUUID()))
    result.captcha = captchaRes.ok && (captchaRes.headers.get('content-type') || '').includes('image')
    if (!result.captcha) result.errors.push('图片验证码接口返回异常')
  } catch (error) {
    result.errors.push(`图片验证码接口失败：${error instanceof Error ? error.message : String(error)}`)
  }

  return result
}
