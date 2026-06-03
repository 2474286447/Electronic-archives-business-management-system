import type { ReactNode } from 'react'

interface SurfacePanelProps {
  children: ReactNode
  className?: string
  title?: string
  description?: string
  actions?: ReactNode
  variant?: 'default' | 'command' | 'map'
}

export function SurfacePanel({ children, className = '', title, description, actions, variant = 'default' }: SurfacePanelProps) {
  return (
    <section className={`surface-panel surface-panel-${variant} ${className}`}>
      {title || description || actions ? (
        <div className="surface-panel-head">
          <div>
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {actions ? <div className="surface-panel-actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  )
}

export function PrototypeCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <SurfacePanel className={className}>{children}</SurfacePanel>
}
