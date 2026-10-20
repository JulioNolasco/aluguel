const API_BASE = '/api/v1';

function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem('playloc_token');
  const headers = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...getAuthHeaders(isFormData),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/csv')) {
    return response.blob();
  }

  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.detail || 'Ocorreu um erro na requisição.';
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me'),
    updateMe: (userData) => request('/auth/me', { method: 'PUT', body: JSON.stringify(userData) }),
  },

  // Consoles
  consoles: {
    list: (params = {}) => {
      const q = new URLSearchParams();
      if (params.start_date) q.append('start_date', params.start_date);
      if (params.end_date) q.append('end_date', params.end_date);
      if (params.model_type) q.append('model_type', params.model_type);
      return request(`/consoles?${q.toString()}`);
    },
    get: (id) => request(`/consoles/${id}`),
    create: (data) => request('/consoles', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/consoles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/consoles/${id}`, { method: 'DELETE' }),
  },

  // Accessories & Games
  accessories: {
    list: (category) => {
      const q = category ? `?category=${category}` : '';
      return request(`/accessories${q}`);
    },
    get: (id) => request(`/accessories/${id}`),
    create: (data) => request('/accessories', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/accessories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/accessories/${id}`, { method: 'DELETE' }),
  },

  // Bookings
  bookings: {
    simulate: (simData) => request('/bookings/simulate', { method: 'POST', body: JSON.stringify(simData) }),
    create: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
    list: (status) => {
      const q = status ? `?status=${status}` : '';
      return request(`/bookings${q}`);
    },
    get: (id) => request(`/bookings/${id}`),
    pay: (id, payment_method = 'pix') => request(`/bookings/${id}/pay?payment_method=${payment_method}`, { method: 'POST' }),
    updateStatus: (id, statusData) => request(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify(statusData) }),
    exportCsv: async () => {
      const blob = await request('/bookings/export/csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_locacoes_ps5_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    },
  },

  // Inspections
  inspections: {
    create: (data) => request('/inspections', { method: 'POST', body: JSON.stringify(data) }),
    listForBooking: (bookingId) => request(`/inspections/booking/${bookingId}`),
    listAll: () => request('/inspections'),
  },

  // Documents
  documents: {
    upload: (docType, file) => {
      const fd = new FormData();
      fd.append('doc_type', docType);
      fd.append('file', file);
      return request('/documents/upload', { method: 'POST', body: fd });
    },
    getMy: () => request('/documents/my'),
    listAll: () => request('/documents'),
    updateStatus: (id, status, notes) => {
      const fd = new FormData();
      fd.append('status_str', status);
      if (notes) fd.append('notes', notes);
      return request(`/documents/${id}/status`, { method: 'PUT', body: fd });
    },
  },

  // Financial
  financial: {
    getKpis: () => request('/financial/kpis'),
    listTransactions: (params = {}) => {
      const q = new URLSearchParams();
      if (params.type) q.append('type', params.type);
      if (params.category) q.append('category', params.category);
      return request(`/financial/transactions?${q.toString()}`);
    },
    createTransaction: (data) => request('/financial/transactions', { method: 'POST', body: JSON.stringify(data) }),
    exportCsv: async () => {
      const blob = await request('/financial/export/csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `balanco_financeiro_ps5_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    },
  },
};
