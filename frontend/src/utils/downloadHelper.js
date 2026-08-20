const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Initiates an authenticated direct file download from the backend API.
 * Creates an in-memory blob URL and triggers a native browser download event.
 *
 * @param {string} endpoint - API path (e.g. '/api/v1/admin/reports/participants/export?format=csv')
 * @param {string} defaultFilename - Fallback filename if Content-Disposition header is absent
 * @returns {Promise<void>}
 */
export async function downloadReport(endpoint, defaultFilename = 'report.csv') {
  const token = localStorage.getItem('sepa_auth_token');
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  if (!response.ok) {
    let errorMsg = `Gagal mengunduh laporan (Status: ${response.status}).`;
    try {
      const errJson = await response.json();
      if (errJson?.error?.message) {
        errorMsg = errJson.error.message;
      }
    } catch (_err) {
      // Non-JSON error response
    }
    throw new Error(errorMsg);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition');
  let filename = defaultFilename;

  if (disposition && disposition.includes('filename=')) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) {
      filename = match[1].trim();
    }
  }

  const blobUrl = window.URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = blobUrl;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  window.URL.revokeObjectURL(blobUrl);
}
