import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { Eye, Fingerprint, KeyRound, RefreshCw, ShieldCheck, UserRound } from 'lucide-react'
import { authApi } from '../api/auth'
import { getApiMessage, isApiSuccess } from '../api/result'
import { defaultSystemConfig, normalizeSystemConfigFromApi, systemConfigApi } from '../api/systemConfig'
import { useAuth } from '../auth/AuthProvider'
import { generateUUID } from '../utils/id'
import { encryptPasswordWithPem } from '../utils/rsaPassword'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, setSession, clearAuth, loadMenus } = useAuth()
  const [mode, setMode] = useState('password')
  const [form, setForm] = useState({ username: '', password: '', code: '', uuid: '' })
  const [captchaUrl, setCaptchaUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [systemConfig, setSystemConfig] = useState(defaultSystemConfig)

  const from = location.state?.from || '/dashboard'
  const footerItems = useMemo(() => [
    systemConfig.login.showCopyright ? systemConfig.platform.copyright : '',
    systemConfig.login.showVersion ? systemConfig.platform.version : '',
    systemConfig.login.showTechnicalSupport ? `技术支持 ${systemConfig.login.technicalSupport}` : ''
  ].filter(Boolean), [systemConfig])

  useEffect(() => {
    clearAuth()
    systemConfigApi.getAllConfig()
      .then((res) => {
        if (isApiSuccess(res) && res.data) {
          setSystemConfig(normalizeSystemConfigFromApi(res.data))
        }
      })
      .catch(() => {})
  }, [clearAuth])

  const refreshCaptcha = () => {
    setErrorMessage('')
    const uuid = generateUUID()
    setForm((current) => ({ ...current, uuid, code: '' }))
    setCaptchaUrl(authApi.getCaptchaImageUrl(uuid))
  }

  useEffect(() => {
    refreshCaptcha()
  }, [])

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const updateForm = (key: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!form.username || !form.password || !form.code) {
      setErrorMessage('请输入用户名、密码和验证码')
      return
    }

    setLoading(true)
    setErrorMessage('')
    try {
            const publicKeyRes = await authApi.getPublicKey()
      if (!isApiSuccess(publicKeyRes)) {
        refreshCaptcha()
        throw new Error(getApiMessage(publicKeyRes, '获取登录公钥失败'))
      }

      const publicKeyData = publicKeyRes.data
      const publicKey = typeof publicKeyData === 'string' ? publicKeyData : publicKeyData?.publicKey
      if (!publicKey) {
        refreshCaptcha()
        throw new Error('获取登录公钥失败')
      }

      const encryptedPassword = encryptPasswordWithPem(form.password, publicKey)
      const loginRes = await authApi.login({
        username: form.username,
        password: '',
        encryptedPassword,
        captcha: form.code,
        uuid: form.uuid,
        clientType: 'web',
        deviceId: ''
      })

      if (!isApiSuccess(loginRes)) {
        refreshCaptcha()
        throw new Error(getApiMessage(loginRes, '登录失败'))
      }

      const token = loginRes.token || loginRes.data?.token || ''
      if (!token) {
        refreshCaptcha()
        throw new Error('登录成功但未返回 token')
      }

      let user = loginRes.data?.user || loginRes.user || null
      let permissions = loginRes.data?.permissions || loginRes.permissions || []

      setSession({ token, user, permissions })

      try {
        const infoRes = await authApi.getCurrentUserPermissions()
        if (isApiSuccess(infoRes)) {
          user = infoRes.data?.user || infoRes.user || user
          permissions = infoRes.data?.permissions || infoRes.permissions || permissions
          setSession({ token, user, permissions })
        }
      } catch (error) {
        console.warn('登录后获取用户权限失败:', error)
      }

      await loadMenus(true)
      window.dispatchEvent(new CustomEvent('auth-user-updated'))
      navigate(from, { replace: true })
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="hero-shade" />
        <div className="login-hero-content">
          <div className="hero-badge"><Fingerprint size={18} /> RFID 实时监控</div>
          <h1>{systemConfig.login.title}</h1>
          <p>{systemConfig.login.subtitle}</p>
          <div className="hero-metrics">
            <div><strong>12,486</strong><span>在库档案</span></div>
            <div><strong>98.7%</strong><span>标签在线率</span></div>
            <div><strong>26</strong><span>今日任务</span></div>
          </div>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <div className="login-heading">
            <ShieldCheck size={28} />
            <div>
              <h2>账号登录</h2>
              <p>进入档案业务与 RFID 库房管理后台</p>
            </div>
          </div>
          <div className="segmented">
            <button className={mode === 'password' ? 'active' : ''} onClick={() => setMode('password')} type="button">
              <KeyRound size={16} /> 密码登录
            </button>
            <button className={mode === 'face' ? 'active' : ''} onClick={() => setMode('face')} type="button">
              <Eye size={16} /> 人脸登录
            </button>
          </div>
          {mode === 'password' ? (
            <form className="login-form" onSubmit={handleLogin}>
              <label>
                <span>用户名</span>
                <div className="input-wrap"><UserRound size={17} /><input value={form.username} onChange={updateForm('username')} placeholder="请输入用户名" /></div>
              </label>
              <label>
                <span>密码</span>
                <div className="input-wrap"><KeyRound size={17} /><input value={form.password} onChange={updateForm('password')} type="password" placeholder="请输入密码" /></div>
              </label>
              <label>
                <span>验证码</span>
                <div className="captcha-row">
                  <div className="input-wrap"><input value={form.code} onChange={updateForm('code')} placeholder="验证码" /></div>
                  <button className="captcha-code image" onClick={refreshCaptcha} type="button" title="刷新验证码">
                    {captchaUrl ? <img src={captchaUrl} alt="验证码" /> : <RefreshCw size={15} />}
                  </button>
                </div>
              </label>
              {errorMessage ? <div className="form-error">{errorMessage}</div> : null}
              <Button block className="primary-action" htmlType="submit" loading={loading} type="primary">
                登录
              </Button>
            </form>
          ) : (
            <div className="face-placeholder">
              <Fingerprint size={34} />
              <h3>人脸登录已预留</h3>
              <p>请接入人脸采集设备后使用。</p>
            </div>
          )}
          <footer className="login-footer">{footerItems.map((item) => <span key={item}>{item}</span>)}</footer>
        </div>
      </section>
    </div>
  )
}


