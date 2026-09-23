import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  X,
  Send,
  Search,
  CameraOff,
  SwitchCamera,
  AlertCircle,
  CheckCircle2,
  User,
  Loader2,
  Video,
  VideoOff
} from 'lucide-react';
import { participantApi } from '../../api/participantApi';
import { formatCurrency } from '../../utils/formatters';

/**
 * TransferModal Component
 * Allows participant to transfer activity credit peer-to-peer to another active participant
 * via QR camera scanning or manual token fallback with instant verification and balance guards.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   sender: {
 *     name: string,
 *     qr_code: string,
 *     current_balance: number
 *   },
 *   onTransferSuccess?: (result: Object) => void
 * }} props
 */
export function TransferModal({ isOpen, onClose, sender, onTransferSuccess }) {
  const [step, setStep] = useState('scan'); // 'scan' | 'amount' | 'success'
  const [manualCode, setManualCode] = useState('');
  const [recipient, setRecipient] = useState(null);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferResult, setTransferResult] = useState(null);

  // Camera states
  const [cameraActive, setCameraActive] = useState(true);
  const [cameraStatus, setCameraStatus] = useState('idle'); // 'idle' | 'initializing' | 'active' | 'error' | 'disabled'
  const [cameraError, setCameraError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCameraIndex, setSelectedCameraIndex] = useState(0);

  const scannerRef = useRef(null);
  const lastScannedRef = useRef({ code: '', time: 0 });
  const isSearchingRef = useRef(isSearching);
  isSearchingRef.current = isSearching;

  const handleVerifyRecipient = async (codeToVerify) => {
    const targetCode = (codeToVerify || manualCode).trim();
    if (!targetCode) return;

    setIsSearching(true);
    setSearchError('');

    try {
      const response = await participantApi.getTransferRecipient(targetCode, sender?.qr_code);
      setRecipient(response.recipient);
      setStep('amount');
    } catch (err) {
      const msg =
        err?.error?.message ||
        err?.message ||
        'Gagal memverifikasi penerima. Pastikan kode peserta benar dan aktif.';
      setSearchError(msg);
    } finally {
      setIsSearching(false);
    }
  };

  const verifyRecipientRef = useRef(handleVerifyRecipient);
  verifyRecipientRef.current = handleVerifyRecipient;

  // Reset modal state on open/close
  useEffect(() => {
    if (isOpen) {
      setStep('scan');
      setManualCode('');
      setRecipient(null);
      setAmount('');
      setNotes('');
      setSearchError('');
      setIsSearching(false);
      setIsSubmitting(false);
      setTransferResult(null);
      setCameraActive(true);
    }
  }, [isOpen]);

  // Handle camera scanner lifecycle in Step 'scan'
  useEffect(() => {
    if (!isOpen || step !== 'scan') {
      return;
    }

    let isMounted = true;
    let html5QrCode = null;

    const initScanner = async () => {
      if (!cameraActive) {
        setCameraStatus('disabled');
        return;
      }

      setCameraStatus('initializing');
      setCameraError('');

      if (typeof window === 'undefined' || !navigator?.mediaDevices?.getUserMedia) {
        if (isMounted) {
          setCameraStatus('error');
          setCameraError('Kamera tidak didukung atau izin tidak tersedia di peramban ini.');
        }
        return;
      }

      try {
        const qrContainer = document.getElementById('participant-transfer-qr-reader');
        if (!qrContainer) {
          if (isMounted) setCameraStatus('error');
          return;
        }

        html5QrCode = new Html5Qrcode('participant-transfer-qr-reader');
        scannerRef.current = html5QrCode;

        let availableDevices = [];
        try {
          availableDevices = await Html5Qrcode.getCameras();
          if (isMounted && availableDevices && availableDevices.length > 0) {
            setCameras(availableDevices);
          }
        } catch (_devErr) {
          // Fallback to environment
        }

        const cameraConfig =
          availableDevices.length > 0 && availableDevices[selectedCameraIndex]
            ? { deviceId: { exact: availableDevices[selectedCameraIndex].id } }
            : { facingMode: 'environment' };

        const scanConfig = {
          fps: 10,
          qrbox: { width: 200, height: 200 },
          aspectRatio: 1.5
        };

        await html5QrCode.start(
          cameraConfig,
          scanConfig,
          (decodedText) => {
            const now = Date.now();
            if (
              decodedText &&
              !isSearchingRef.current &&
              (decodedText !== lastScannedRef.current.code || now - lastScannedRef.current.time > 2500)
            ) {
              lastScannedRef.current = { code: decodedText, time: now };
              verifyRecipientRef.current(decodedText.trim());
            }
          },
          () => {
            // Ignore per-frame decode misses
          }
        );

        if (isMounted) {
          setCameraStatus('active');
        }
      } catch (err) {
        if (isMounted) {
          setCameraStatus('error');
          const errorMsg = err?.message || String(err);
          if (errorMsg.includes('NotAllowedError') || errorMsg.includes('Permission')) {
            setCameraError('Izin akses kamera ditolak. Silakan izinkan kamera atau gunakan input manual.');
          } else if (errorMsg.includes('NotFoundError') || errorMsg.includes('DevicesNotFoundError')) {
            setCameraError('Kamera tidak terdeteksi pada perangkat.');
          } else {
            setCameraError('Tidak dapat membuka kamera. Pastikan kamera tidak digunakan oleh aplikasi lain.');
          }
        }
      }
    };

    initScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current) {
        const instance = scannerRef.current;
        scannerRef.current = null;
        if (instance.isScanning) {
          instance
            .stop()
            .then(() => {
              try {
                instance.clear();
              } catch (_clearErr) {
                // Ignore DOM clear errors on unmount
              }
            })
            .catch(() => {});
        } else {
          try {
            instance.clear();
          } catch (_clearErr) {
            // Ignore DOM clear errors on unmount
          }
        }
      }
    };
  }, [isOpen, step, cameraActive, selectedCameraIndex]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleVerifyRecipient(manualCode);
  };

  const handleSwitchCamera = () => {
    if (cameras.length > 1) {
      setSelectedCameraIndex((prev) => (prev + 1) % cameras.length);
    }
  };

  const amountNum = parseInt(amount, 10) || 0;
  const maxBalance = sender?.current_balance || 0;
  const isAmountExceeded = amountNum > maxBalance;
  const isAmountValid = amountNum > 0 && !isAmountExceeded;

  const handleExecuteTransfer = async (e) => {
    e.preventDefault();
    if (!isAmountValid || !recipient || isSubmitting) return;

    setIsSubmitting(true);
    setSearchError('');

    try {
      const payload = {
        sender_qr_code: sender.qr_code,
        recipient_qr_code: recipient.qr_code,
        amount: amountNum,
        notes: notes.trim()
      };

      const res = await participantApi.transferBalance(payload);
      setTransferResult(res.transfer);
      setStep('success');
      if (onTransferSuccess) {
        onTransferSuccess(res.transfer);
      }
    } catch (err) {
      const msg =
        err?.error?.message ||
        err?.message ||
        'Gagal memproses transfer saldo. Silakan coba lagi.';
      setSearchError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="sport-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '1.25rem',
          position: 'relative'
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            borderBottom: '1px solid var(--color-border)',
            paddingBottom: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(2, 132, 199, 0.12)',
                color: 'var(--color-primary-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Send size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
                Transfer Saldo Aktivitas
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                Dari: {sender?.name} ({sender?.qr_code})
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              padding: '0.25rem'
            }}
            aria-label="Tutup modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Global Error Banner */}
        {searchError && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '8px',
              background: 'var(--color-danger-bg)',
              border: '1px solid var(--color-danger-border)',
              color: 'var(--color-danger-text)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{searchError}</span>
          </div>
        )}

        {/* STEP 1: SCANNER & MANUAL CODE */}
        {step === 'scan' && (
          <div>
            {/* Live Camera Viewfinder */}
            <div
              style={{
                position: 'relative',
                background: '#020617',
                borderRadius: '12px',
                overflow: 'hidden',
                minHeight: '220px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem'
              }}
            >
              <div
                id="participant-transfer-qr-reader"
                style={{
                  width: '100%',
                  display: cameraActive && cameraStatus !== 'error' ? 'block' : 'none'
                }}
              />

              {/* Viewfinder Overlay & Laser */}
              {cameraActive && cameraStatus === 'active' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <div
                    style={{
                      width: '180px',
                      height: '180px',
                      border: '2px dashed var(--color-primary-500)',
                      borderRadius: '12px',
                      position: 'relative',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: '5%',
                        right: '5%',
                        height: '2px',
                        background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                        boxShadow: '0 0 8px #38bdf8',
                        animation: 'scannerLaser 2s ease-in-out infinite'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Initializing / Loading */}
              {cameraActive && cameraStatus === 'initializing' && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem' }}>
                  <Loader2 size={28} className="loading-spin" style={{ margin: '0 auto 0.5rem auto' }} />
                  <p style={{ margin: 0, fontSize: '0.8125rem' }}>Mengaktifkan kamera...</p>
                </div>
              )}

              {/* Camera Error or Disabled Fallback View */}
              {(!cameraActive || cameraStatus === 'error') && (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1.5rem 1rem' }}>
                  <CameraOff size={32} style={{ color: '#ef4444', margin: '0 auto 0.5rem auto' }} />
                  <p style={{ margin: 0, fontSize: '0.8125rem', color: '#fca5a5' }}>
                    {cameraError || 'Kamera sedang dinonaktifkan.'}
                  </p>
                </div>
              )}

              {/* Floating Camera Controls */}
              <div
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  display: 'flex',
                  gap: '0.375rem',
                  zIndex: 20
                }}
              >
                {cameras.length > 1 && cameraActive && (
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    title="Ganti Kamera"
                    style={{
                      padding: '0.375rem',
                      background: 'rgba(15, 23, 42, 0.75)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      color: '#fff',
                      cursor: 'pointer'
                    }}
                  >
                    <SwitchCamera size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setCameraActive((prev) => !prev)}
                  title={cameraActive ? 'Matikan Kamera' : 'Nyalakan Kamera'}
                  style={{
                    padding: '0.375rem',
                    background: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  {cameraActive ? <VideoOff size={16} /> : <Video size={16} />}
                </button>
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: '0 0 0.75rem 0' }}>
              Arahkan kamera ke kode QR gelang / kartu peserta penerima
            </p>

            {/* Manual Token Input Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '0.75rem 0',
                color: 'var(--color-text-muted)',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              <div style={{ flex: 1, borderTop: '1px solid var(--color-border)' }} />
              <span style={{ padding: '0 0.5rem' }}>Atau Masukkan Kode Peserta Manual</span>
              <div style={{ flex: 1, borderTop: '1px solid var(--color-border)' }} />
            </div>

            {/* Manual Form */}
            <form onSubmit={handleManualSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: SEPA-002"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                style={{ flex: 1, fontSize: '0.9375rem', textTransform: 'uppercase' }}
                disabled={isSearching}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSearching || !manualCode.trim()}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', whiteSpace: 'nowrap' }}
              >
                {isSearching ? <Loader2 size={16} className="loading-spin" /> : <Search size={16} />}
                Cari Penerima
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: NOMINAL & CONFIRMATION */}
        {step === 'amount' && recipient && (
          <form onSubmit={handleExecuteTransfer}>
            {/* Recipient Identity Card */}
            <div
              style={{
                padding: '0.875rem',
                borderRadius: '10px',
                background: 'rgba(2, 132, 199, 0.08)',
                border: '1px solid rgba(2, 132, 199, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--color-primary-600)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  <User size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Penerima:</div>
                  <strong style={{ fontSize: '1rem', color: 'var(--color-text-main)' }}>{recipient.name}</strong>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary-600)', fontWeight: 600 }}>
                    {recipient.qr_code}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setStep('scan');
                  setSearchError('');
                }}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
              >
                Ganti Penerima
              </button>
            </div>

            {/* Sender Current Balance Reminder */}
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Sisa Saldo Anda:</span>
              <strong style={{ fontSize: '1rem', color: 'var(--color-primary-600)' }}>
                {formatCurrency(maxBalance)}
              </strong>
            </div>

            {/* Nominal Transfer Input */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                htmlFor="transfer-nominal-input"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  marginBottom: '0.375rem',
                  color: 'var(--color-text-main)'
                }}
              >
                Nominal Transfer (Rp)
              </label>
              <div style={{ position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    left: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: 'var(--color-text-muted)'
                  }}
                >
                  Rp
                </span>
                <input
                  id="transfer-nominal-input"
                  type="number"
                  className="form-input"
                  placeholder="0"
                  min="1"
                  max={maxBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={{
                    paddingLeft: '2.5rem',
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: isAmountExceeded ? 'var(--color-danger-text)' : 'var(--color-text-main)'
                  }}
                  disabled={isSubmitting}
                />
              </div>

              {/* Quick Amount Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '0.5rem' }}>
                {[50000, 100000, 200000].map((nominal) => (
                  <button
                    key={nominal}
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setAmount(String(nominal))}
                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                    disabled={isSubmitting || nominal > maxBalance}
                  >
                    {formatCurrency(nominal)}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setAmount(String(maxBalance))}
                  style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', fontWeight: 700 }}
                  disabled={isSubmitting || maxBalance <= 0}
                >
                  Semua Saldo
                </button>
              </div>

              {isAmountExceeded && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-danger-text)',
                    marginTop: '0.375rem',
                    fontWeight: 600
                  }}
                >
                  Nominal melebihi sisa saldo Anda (Maksimal: {formatCurrency(maxBalance)})
                </div>
              )}
            </div>

            {/* Optional Notes */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label
                htmlFor="transfer-notes-input"
                style={{
                  display: 'block',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  marginBottom: '0.375rem',
                  color: 'var(--color-text-muted)'
                }}
              >
                Catatan (Opsional)
              </label>
              <input
                id="transfer-notes-input"
                type="text"
                className="form-input"
                placeholder="Misal: untuk sewa Jet Ski bareng"
                maxLength={255}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ fontSize: '0.875rem' }}
                disabled={isSubmitting}
              />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep('scan')}
                disabled={isSubmitting}
              >
                Kembali
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isAmountValid || isSubmitting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
              >
                {isSubmitting ? (
                  <Loader2 size={16} className="loading-spin" />
                ) : (
                  <Send size={16} />
                )}
                Kirim Saldo {amountNum > 0 && !isAmountExceeded ? formatCurrency(amountNum) : ''}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS RECEIPT */}
        {step === 'success' && transferResult && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(34, 197, 94, 0.12)',
                color: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto'
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>
              Transfer Saldo Berhasil!
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Kredit aktivitas telah berhasil dikirimkan secara langsung ke penerima.
            </p>

            <div
              style={{
                padding: '1rem',
                borderRadius: '10px',
                background: 'var(--color-bg-secondary)',
                border: '1px solid var(--color-border)',
                textAlign: 'left',
                marginBottom: '1.25rem',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Penerima:</span>
                <strong style={{ color: 'var(--color-text-main)' }}>{transferResult.recipient_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Nominal Transfer:</span>
                <strong style={{ color: 'var(--color-danger-text)' }}>
                  -{formatCurrency(transferResult.amount)}
                </strong>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px dashed var(--color-border)',
                  paddingTop: '0.5rem'
                }}
              >
                <span style={{ color: 'var(--color-text-muted)' }}>Sisa Saldo Anda:</span>
                <strong style={{ color: 'var(--color-primary-600)' }}>
                  {formatCurrency(transferResult.sender_balance)}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={onClose}
              style={{ width: '100%' }}
            >
              Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
