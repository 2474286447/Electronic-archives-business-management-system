import type { ReactNode } from 'react'

interface ModulePageProps {
  title: string
  description?: string
  eyebrow?: string
  actions?: ReactNode
  children: ReactNode
}

export function ModulePage({ title, description, actions, children }: ModulePageProps) {
  return (
    <div className="module-page">
      <header className="module-header">
        <div className="module-title-block">
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="module-actions">{actions}</div> : null}
      </header>
      {children}
    </div>
  )
}
