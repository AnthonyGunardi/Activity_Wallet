import { useState, useRef, useEffect } from 'react';
import { Filter, ArrowDownLeft, RotateCcw, ChevronDown, Check } from 'lucide-react';

const FILTER_OPTIONS = [
  {
    value: '',
    label: 'Semua Jenis Transaksi',
    shortLabel: 'Semua Jenis',
    badge: null,
    badgeClass: '',
    description: 'Semua riwayat debit & kredit',
    icon: Filter,
    iconColor: 'var(--color-primary-600)',
    iconBg: 'var(--color-primary-50)'
  },
  {
    value: 'DEDUCTION',
    label: 'DEDUCTION (Pemotongan)',
    shortLabel: 'DEDUCTION',
    badge: 'Pemotongan',
    badgeClass: 'badge-danger',
    description: 'Pengurangan saldo aktivitas wahana',
    icon: ArrowDownLeft,
    iconColor: '#dc2626',
    iconBg: '#fee2e2'
  },
  {
    value: 'REFUND',
    label: 'REFUND (Pengembalian)',
    shortLabel: 'REFUND',
    badge: 'Pengembalian',
    badgeClass: 'badge-success',
    description: 'Pemulihan saldo kredit peserta',
    icon: RotateCcw,
    iconColor: '#16a34a',
    iconBg: '#dcfce7'
  }
];

/**
 * TransactionTypeFilter Component
 * Accessible, styled floating dropdown for filtering transactions by type in admin views.
 * Preserves a synchronized hidden combobox for assistive technologies and automated testing.
 *
 * @param {{
 *   value: string,
 *   onChange: (eventOrValue: any) => void,
 *   id?: string
 * }} props
 */
export function TransactionTypeFilter({ value = '', onChange, id = 'tx-type-filter' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = FILTER_OPTIONS.find((opt) => opt.value === value) || FILTER_OPTIONS[0];
  const IconComponent = selectedOption.icon;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (nextValue) => {
    setIsOpen(false);
    if (onChange) {
      onChange({ target: { value: nextValue } });
    }
  };

  return (
    <div className="tx-filter-container" ref={dropdownRef}>
      {/* Synchronized accessible select input for RTL and screen-reader combobox querying */}
      <select
        id={id}
        role="combobox"
        aria-label="Filter jenis transaksi"
        value={value}
        onChange={onChange}
        tabIndex={-1}
        className="tx-filter-sr-select"
      >
        {FILTER_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Styled Interactive Trigger */}
      <button
        type="button"
        className={`tx-filter-trigger ${isOpen ? 'is-open' : ''} ${value ? 'has-active-filter' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Pilih jenis transaksi"
        title="Pilih jenis transaksi"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: selectedOption.iconColor
            }}
          >
            <IconComponent size={16} />
          </span>
          <span
            style={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              fontWeight: value ? 600 : 500
            }}
          >
            {selectedOption.label}
          </span>
        </div>

        <ChevronDown
          size={16}
          style={{
            color: 'var(--color-text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-fast)',
            flexShrink: 0
          }}
        />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div className="tx-filter-dropdown-menu" role="listbox" aria-label="Pilihan jenis transaksi">
          <div className="tx-filter-menu-header">Pilih Jenis Transaksi</div>
          {FILTER_OPTIONS.map((opt) => {
            const isSelected = opt.value === value;
            const ItemIcon = opt.icon;

            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`tx-filter-menu-item ${isSelected ? 'is-selected' : ''}`}
                onClick={() => handleSelect(opt.value)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div
                    className="tx-filter-item-icon-box"
                    style={{ background: opt.iconBg, color: opt.iconColor }}
                  >
                    <ItemIcon size={15} />
                  </div>
                  <div className="tx-filter-item-content">
                    <div className="tx-filter-item-title-row">
                      <span>{opt.shortLabel}</span>
                      {opt.badge && (
                        <span
                          className={`badge ${opt.badgeClass}`}
                          style={{ fontSize: '0.625rem', padding: '0.05rem 0.35rem' }}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    <span className="tx-filter-item-desc">{opt.description}</span>
                  </div>
                </div>

                {isSelected && (
                  <Check
                    size={16}
                    style={{
                      color: 'var(--color-primary-600)',
                      flexShrink: 0,
                      marginLeft: '0.5rem'
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
