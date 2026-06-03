import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { App as AntApp, ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import App from './App'
import { AuthProvider } from './auth/AuthProvider'
import 'antd/dist/reset.css'
import './styles/design-system.css'
import './styles/app.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1565c0',
          borderRadius: 8,
          fontFamily: 'Inter, "Microsoft YaHei", "PingFang SC", system-ui, sans-serif'
        }
      }}
    >
      <AntApp>
        <HashRouter>
          <AuthProvider>
            <App />
          </AuthProvider>
        </HashRouter>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
)

