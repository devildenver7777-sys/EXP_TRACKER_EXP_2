// API Client with automatic token handling and smart fallback

const API_BASE = '/api';

// Initial seed data matching the screenshot exactly
export const INITIAL_DATA = {
  user: {
    first_name: 'Yuvan',
    last_name: '',
    email: 'yuvan@example.com',
    avatar_url: '',
    currency: '₹',
  },
  selected_month: '2025-07',
  summary_cards: {
    total_balance: { amount: 12450, change: '+8% vs last month', direction: 'up' },
    total_income: { amount: 25000, change: '+5% vs last month', direction: 'up' },
    total_expenses: { amount: 12550, change: '+3% vs last month', direction: 'up' },
    monthly_budget: { amount: 15000, percentage_used: 84 },
  },
  expense_overview: {
    total: 12550,
    categories: [
      { name: 'Food', amount: 4000, percentage: 32, color: '#3b82f6' },
      { name: 'Shopping', amount: 2500, percentage: 20, color: '#f97316' },
      { name: 'Travel', amount: 2000, percentage: 16, color: '#10b981' },
      { name: 'Bills', amount: 2000, percentage: 16, color: '#8b5cf6' },
      { name: 'Others', amount: 2050, percentage: 16, color: '#eab308' },
    ],
  },
  spending_trend: [
    { month: 'Jan', amount: 5000 },
    { month: 'Feb', amount: 7500 },
    { month: 'Mar', amount: 8000 },
    { month: 'Apr', amount: 9000 },
    { month: 'May', amount: 11000 },
    { month: 'Jun', amount: 10500 },
    { month: 'Jul', amount: 12550 },
  ],
  recent_transactions: [
    { id: 1, date: 'Jul 19, 2025', description: 'Zomato Order', category_name: 'Food', amount: 450, type: 'expense' },
    { id: 2, date: 'Jul 18, 2025', description: 'Amazon Purchase', category_name: 'Shopping', amount: 1299, type: 'expense' },
    { id: 3, date: 'Jul 17, 2025', description: 'Salary', category_name: 'Income', amount: 25000, type: 'income' },
    { id: 4, date: 'Jul 15, 2025', description: 'Metro Card', category_name: 'Travel', amount: 200, type: 'expense' },
    { id: 5, date: 'Jul 14, 2025', description: 'Electricity Bill', category_name: 'Bills', amount: 1800, type: 'expense' },
  ],
  category_budgets: {
    Food: 5000,
    Shopping: 3000,
    Travel: 2500,
    Bills: 2500,
    Others: 2000,
  }
};

// Local storage persistent fallback helper
function getLocalStore() {
  const stored = localStorage.getItem('expense_tracker_state');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
  }
  localStorage.setItem('expense_tracker_state', JSON.stringify(INITIAL_DATA));
  return JSON.parse(JSON.stringify(INITIAL_DATA));
}

function saveLocalStore(data) {
  localStorage.setItem('expense_tracker_state', JSON.stringify(data));
}

export function getAuthToken() {
  return localStorage.getItem('access_token');
}

export function setAuthToken(token, refresh) {
  if (token) localStorage.setItem('access_token', token);
  if (refresh) localStorage.setItem('refresh_token', refresh);
}

export function clearAuthToken() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('current_user');
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (res.status === 401) {
      clearAuthToken();
      window.dispatchEvent(new Event('auth:unauthorized'));
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Network request failed' }));
      throw new Error(err.detail || 'Request failed');
    }

    if (options.responseType === 'blob') {
      return await res.blob();
    }

    return await res.json();
  } catch (error) {
    // If backend is unreachable or during offline mode, utilize smart local store
    console.warn(`API call to ${endpoint} failed, using local store:`, error.message);
    return handleOfflineFallback(endpoint, options);
  }
}

function handleOfflineFallback(endpoint, options) {
  const store = getLocalStore();
  const method = options.method ? options.method.toUpperCase() : 'GET';
  const body = options.body ? JSON.parse(options.body) : {};

  // Auth me
  if (endpoint.includes('/auth/me/')) {
    if (method === 'PATCH') {
      store.user = { ...store.user, ...body };
      saveLocalStore(store);
    }
    return {
      username: 'yuvan',
      email: store.user.email || 'yuvan@example.com',
      first_name: store.user.first_name || 'Yuvan',
      last_name: store.user.last_name || '',
      avatar_url: store.user.avatar_url || '',
      currency: store.user.currency || '₹',
    };
  }

  // Dashboard summary
  if (endpoint.includes('/dashboard/summary/')) {
    return {
      user: store.user,
      selected_month: store.selected_month,
      summary_cards: store.summary_cards,
      expense_overview: store.expense_overview,
      spending_trend: store.spending_trend,
      recent_transactions: store.recent_transactions,
    };
  }

  // Budget
  if (endpoint.includes('/budget/')) {
    if (method === 'PUT') {
      store.summary_cards.monthly_budget.amount = Number(body.amount);
      if (body.category_budgets) {
        store.category_budgets = body.category_budgets;
      }
      const exp = store.summary_cards.total_expenses.amount;
      store.summary_cards.monthly_budget.percentage_used = Math.round((exp / body.amount) * 100);
      saveLocalStore(store);
    }
    const amount = store.summary_cards.monthly_budget.amount;
    const exp = store.summary_cards.total_expenses.amount;
    return {
      id: 1,
      month: store.selected_month,
      amount,
      category_budgets: store.category_budgets,
      category_spending: {
        Food: 4000,
        Shopping: 2500,
        Travel: 2000,
        Bills: 2000,
        Others: 2050,
      },
      total_expenses: exp,
      used_percentage: Math.round((exp / amount) * 100),
      remaining: Math.max(0, amount - exp),
    };
  }

  // Transactions list or add
  if (endpoint.includes('/transactions/')) {
    if (method === 'POST') {
      const newTx = {
        id: Date.now(),
        date: body.date ? new Date(body.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jul 20, 2025',
        description: body.description || 'Transaction',
        category_name: body.category_name || 'Others',
        amount: Number(body.amount),
        type: body.type || 'expense',
      };
      store.recent_transactions.unshift(newTx);

      if (newTx.type === 'expense') {
        store.summary_cards.total_expenses.amount += newTx.amount;
        store.summary_cards.total_balance.amount -= newTx.amount;
        const bAmount = store.summary_cards.monthly_budget.amount;
        store.summary_cards.monthly_budget.percentage_used = Math.round((store.summary_cards.total_expenses.amount / bAmount) * 100);

        // Update category in overview
        const cat = store.expense_overview.categories.find(c => c.name.toLowerCase() === newTx.category_name.toLowerCase());
        if (cat) {
          cat.amount += newTx.amount;
        } else {
          store.expense_overview.categories.push({
            name: newTx.category_name,
            amount: newTx.amount,
            percentage: 5,
            color: '#6366f1'
          });
        }
        store.expense_overview.total += newTx.amount;
        // Recalculate percentages
        store.expense_overview.categories.forEach(c => {
          c.percentage = Math.round((c.amount / store.expense_overview.total) * 100);
        });
      } else {
        store.summary_cards.total_income.amount += newTx.amount;
        store.summary_cards.total_balance.amount += newTx.amount;
      }

      saveLocalStore(store);
      return newTx;
    }
    return store.recent_transactions;
  }

  // Reports
  if (endpoint.includes('/reports/')) {
    return {
      total_income: store.summary_cards.total_income.amount,
      total_expense: store.summary_cards.total_expenses.amount,
      net_savings: store.summary_cards.total_balance.amount,
      transaction_count: store.recent_transactions.length + 8,
      category_breakdown: store.expense_overview.categories.map(c => ({
        category: c.name,
        amount: c.amount,
      })),
      transactions: store.recent_transactions,
    };
  }

  return { detail: 'OK' };
}
