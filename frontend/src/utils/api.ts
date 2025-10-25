const API_BASE_URL = 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

// Set auth token in localStorage
const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

// Remove auth token from localStorage
const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

// API request helper with authentication
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    
    if (response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } finally {
      removeAuthToken();
    }
  },

  getProfile: async () => {
    return await apiRequest('/auth/profile');
  },
};

// Products API
export const productsAPI = {
  getAll: async (params: { search?: string; page?: number; limit?: number; category?: string } = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();
    
    return await apiRequest(`/products?${queryString}`);
  },

  getAutocomplete: async (query: string) => {
    return await apiRequest(`/products/autocomplete?q=${encodeURIComponent(query)}`);
  },

  getById: async (id: number) => {
    return await apiRequest(`/products/${id}`);
  },

  create: async (product: {
    name: string;
    description?: string;
    price: number;
    stock_quantity?: number;
    category?: string;
    sku?: string;
  }) => {
    return await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  update: async (id: number, product: Partial<{
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    category: string;
    sku: string;
  }>) => {
    return await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  delete: async (id: number) => {
    return await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  getCategories: async () => {
    return await apiRequest('/products/meta/categories');
  },
};

// Billing API
export const billingAPI = {
  getAll: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    user_id?: number;
    date_from?: string;
    date_to?: string;
  } = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();
    
    return await apiRequest(`/billing?${queryString}`);
  },

  getById: async (id: number) => {
    return await apiRequest(`/billing/${id}`);
  },

  create: async (items: { product_id: number; quantity: number }[]) => {
    return await apiRequest('/billing', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  updateStatus: async (id: number, status: 'pending' | 'completed' | 'cancelled') => {
    return await apiRequest(`/billing/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  getStats: async (params: { date_from?: string; date_to?: string } = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();
    
    return await apiRequest(`/billing/stats/summary?${queryString}`);
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    return await apiRequest('/health');
  },
};

export { getAuthToken, setAuthToken, removeAuthToken };
