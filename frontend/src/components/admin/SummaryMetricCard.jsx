/**
 * SummaryMetricCard Component
 * High-contrast metric card displaying critical event KPIs for outdoor visibility.
 *
 * @param {{
 *   title: string,
 *   value: string|number,
 *   subtitle?: string,
 *   icon: import('react').ReactNode,
 *   color?: string,
 *   bgColor?: string
 * }} props
 */
export function SummaryMetricCard({
  title,
  value,
  subtitle,
  icon,
  color = 'var(--color-primary-600)',
  bgColor = 'var(--color-primary-50)'
}) {
  return (
    <div
      className="sport-card"
      style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--color-border)',
        padding: '1.25rem 1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        flex: '1 1 240px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-lg)',
            background: bgColor,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: '1.625rem',
            fontWeight: 900,
            color: 'var(--color-text-main)',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}
        >
          {value}
        </div>
        {subtitle && (
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--color-text-dim)' }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
