import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatters';
import {
  Waves,
  Filter,
  Check,
  ArrowRight,
  RefreshCw,
  Users,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

/**
 * ActivityRecapSection Component
 * Executive summary cards showcasing operational performance and credit consumption per wahana
 * with quick-filter interaction linking into the transaction ledger.
 */
export function ActivityRecapSection({
  activities = [],
  summary = null,
  isLoading = false,
  activeFilterId = null,
  onFilterLedger = () => { },
  onClearFilter = () => { },
  showFullAnalyticsLink = false,
  title = 'Rekapitulasi per Wahana',
  subtitle = 'Performa pemakaian kredit, frekuensi main, dan pendapatan bersih tiap wahana air.',
  filterButtonText = 'Filter Ledger',
  selectedButtonText = 'Sedang Difilter'
}) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Section Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-primary-600)' }}>
            <Waves size={20} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Monitoring Aktivitas
            </span>
          </div>
          <h2 style={{ margin: '0.15rem 0 0 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <span>{title}</span>
            {summary && (
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--color-primary-700)',
                  background: 'var(--color-primary-50)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  border: '1px solid var(--color-primary-200)'
                }}
              >
                Total Bersih: {formatCurrency(summary.total_net_amount || 0)}
              </span>
            )}
          </h2>
          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {activeFilterId && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClearFilter}
              style={{
                fontSize: '0.8125rem',
                padding: '0.35rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                borderColor: 'var(--color-primary-200)',
                color: 'var(--color-primary-600)'
              }}
            >
              <RotateCcw size={14} /> Reset Filter Wahana
            </button>
          )}

          {showFullAnalyticsLink && (
            <Link
              to="/admin/activity-summary"
              className="btn btn-secondary"
              style={{
                fontSize: '0.8125rem',
                padding: '0.35rem 0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                textDecoration: 'none'
              }}
            >
              Lihat Analitik Penuh <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div
          className="sport-card"
          style={{
            background: 'var(--color-bg-surface)',
            padding: '2.5rem 1rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)'
          }}
        >
          <RefreshCw size={28} className="loading-spin" style={{ color: 'var(--color-primary-600)', marginBottom: '0.5rem' }} />
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Memuat rekapitulasi per wahana...
          </p>
        </div>
      ) : activities.length === 0 ? (
        <div
          className="sport-card"
          style={{
            background: 'var(--color-bg-surface)',
            padding: '2rem 1rem',
            textAlign: 'center',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--color-border)'
          }}
        >
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Belum ada data aktivitas terdaftar.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}
        >
          {activities.map((act) => {
            const isSelected = activeFilterId === act.id;

            return (
              <div
                key={act.id}
                className="sport-card"
                style={{
                  background: isSelected ? 'var(--color-primary-50)' : 'var(--color-bg-surface)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-xl)',
                  border: isSelected ? '2px solid var(--color-primary-500)' : '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.875rem',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 12px rgba(37, 99, 235, 0.12)' : 'none'
                }}
              >
                {/* Card Top: Name & Status */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.0625rem', fontWeight: 700, color: 'var(--color-text-main)' }}>
                      {act.name}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        textTransform: 'uppercase',
                        background: act.status === 'ACTIVE' ? 'var(--color-secondary-50)' : '#f1f5f9',
                        color: act.status === 'ACTIVE' ? 'var(--color-secondary-700)' : 'var(--color-text-muted)',
                        border: `1px solid ${act.status === 'ACTIVE' ? 'var(--color-secondary-200)' : '#e2e8f0'}`
                      }}
                    >
                      {act.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div style={{ marginTop: '0.25rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                    Tarif:{' '}
                    <strong style={{ color: 'var(--color-text-main)' }}>
                      {formatCurrency(act.price)}
                    </strong>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.625rem',
                    background: isSelected ? '#ffffff' : 'var(--color-bg-main)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>
                      Total Main
                    </span>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--color-text-main)' }}>
                      {act.deduction_count}x
                    </strong>
                    {act.refund_count > 0 && (
                      <span style={{ fontSize: '0.6875rem', color: 'var(--color-danger-primary)', display: 'block' }}>
                        (-{act.refund_count} refund)
                      </span>
                    )}
                  </div>

                  <div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>
                      Partisipan
                    </span>
                    <strong style={{ fontSize: '0.9375rem', color: 'var(--color-text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Users size={12} style={{ color: 'var(--color-primary-600)' }} />
                      {act.unique_participants_count}
                    </strong>
                  </div>

                  <div style={{ gridColumn: 'span 2', borderTop: '1px solid var(--color-border)', paddingTop: '0.4rem' }}>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'block' }}>
                      Pemakaian Kredit
                    </span>
                    <strong style={{ fontSize: '1rem', color: 'var(--color-primary-600)' }}>
                      {formatCurrency(act.net_amount)}
                    </strong>
                  </div>
                </div>

                {/* Share Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6875rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--color-text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <TrendingUp size={11} /> Pangsa Kredit
                    </span>
                    <strong style={{ color: 'var(--color-text-main)' }}>
                      {act.share_percentage}%
                    </strong>
                  </div>
                  <div
                    style={{
                      height: '6px',
                      background: 'var(--color-border)',
                      borderRadius: '999px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, Math.max(0, act.share_percentage))}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--color-primary-500) 0%, var(--color-secondary-500) 100%)',
                        borderRadius: '999px'
                      }}
                    />
                  </div>
                </div>

                {/* Filter Action Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      onClearFilter();
                    } else {
                      onFilterLedger(act.id, act.name);
                    }
                  }}
                  className={isSelected ? 'btn btn-primary' : 'btn btn-secondary'}
                  style={{
                    width: '100%',
                    fontSize: '0.8125rem',
                    padding: '0.45rem 0.75rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.35rem'
                  }}
                >
                  {isSelected ? (
                    <>
                      <Check size={14} /> {selectedButtonText}
                    </>
                  ) : (
                    <>
                      <Filter size={14} /> {filterButtonText}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

ActivityRecapSection.propTypes = {
  activities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
      deduction_count: PropTypes.number.isRequired,
      refund_count: PropTypes.number.isRequired,
      gross_amount: PropTypes.number.isRequired,
      refund_amount: PropTypes.number.isRequired,
      net_amount: PropTypes.number.isRequired,
      unique_participants_count: PropTypes.number.isRequired,
      share_percentage: PropTypes.number.isRequired
    })
  ),
  summary: PropTypes.shape({
    total_activities: PropTypes.number,
    total_deductions: PropTypes.number,
    total_refunds: PropTypes.number,
    total_gross_amount: PropTypes.number,
    total_refund_amount: PropTypes.number,
    total_net_amount: PropTypes.number,
    total_unique_participants: PropTypes.number
  }),
  isLoading: PropTypes.bool,
  activeFilterId: PropTypes.string,
  onFilterLedger: PropTypes.func,
  onClearFilter: PropTypes.func,
  showFullAnalyticsLink: PropTypes.bool,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  filterButtonText: PropTypes.string,
  selectedButtonText: PropTypes.string
};
