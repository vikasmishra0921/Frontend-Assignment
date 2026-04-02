import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  IndianRupee,
  CreditCard,
  Filter,
  Moon,
  Plus,
  Search,
  ShieldCheck,
  SunMedium,
  TrendingDown,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './App.css'

type Role = 'admin' | 'viewer'
type Theme = 'light' | 'dark'
type TransactionType = 'income' | 'expense'
type SortOption = 'latest' | 'oldest' | 'highest' | 'lowest'

type Transaction = {
  id: number
  date: string
  title: string
  category: string
  type: TransactionType
  amount: number
  note?: string
}

const STORAGE_KEYS = {
  transactions: 'finance-dashboard-transactions',
  role: 'finance-dashboard-role',
  theme: 'finance-dashboard-theme',
}

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

const initialTransactions: Transaction[] = [
  { id: 1, date: '2026-01-05', title: 'Salary Deposit', category: 'Salary', type: 'income', amount: 5200, note: 'Monthly payroll' },
  { id: 2, date: '2026-01-08', title: 'Apartment Rent', category: 'Housing', type: 'expense', amount: 1650, note: 'Downtown apartment' },
  { id: 3, date: '2026-01-10', title: 'Freelance Project', category: 'Side Hustle', type: 'income', amount: 980, note: 'Landing page redesign' },
  { id: 4, date: '2026-01-14', title: 'Groceries', category: 'Food', type: 'expense', amount: 148, note: 'Weekly restock' },
  { id: 5, date: '2026-01-18', title: 'Metro Card', category: 'Transport', type: 'expense', amount: 86, note: 'Monthly transit pass' },
  { id: 6, date: '2026-02-01', title: 'Salary Deposit', category: 'Salary', type: 'income', amount: 5200, note: 'Monthly payroll' },
  { id: 7, date: '2026-02-06', title: 'Coffee Meetings', category: 'Food', type: 'expense', amount: 64, note: 'Client catch-ups' },
  { id: 8, date: '2026-02-11', title: 'Investment Dividend', category: 'Investments', type: 'income', amount: 320, note: 'Quarterly distribution' },
  { id: 9, date: '2026-02-17', title: 'Utilities', category: 'Bills', type: 'expense', amount: 214, note: 'Electricity and internet' },
  { id: 10, date: '2026-03-02', title: 'Salary Deposit', category: 'Salary', type: 'income', amount: 5200, note: 'Monthly payroll' },
  { id: 11, date: '2026-03-06', title: 'Gym Membership', category: 'Health', type: 'expense', amount: 72, note: 'Monthly renewal' },
  { id: 12, date: '2026-03-12', title: 'Flight Booking', category: 'Travel', type: 'expense', amount: 540, note: 'Conference trip' },
  { id: 13, date: '2026-03-18', title: 'Restaurant', category: 'Food', type: 'expense', amount: 96, note: 'Team dinner' },
  { id: 14, date: '2026-03-21', title: 'Tax Refund', category: 'Refund', type: 'income', amount: 760, note: 'Annual filing return' },
]

const defaultForm = {
  title: '',
  date: '2026-03-28',
  category: 'Food',
  type: 'expense' as TransactionType,
  amount: '',
  note: '',
}

const chartColors = ['#6d5efc', '#22c55e', '#f97316', '#06b6d4', '#ef4444', '#facc15']

const loadTransactions = () => {
  const saved = localStorage.getItem(STORAGE_KEYS.transactions)
  if (!saved) return initialTransactions

  try {
    const parsed = JSON.parse(saved) as Transaction[]
    return parsed.length ? parsed : initialTransactions
  } catch {
    return initialTransactions
  }
}

const loadRole = (): Role => {
  const saved = localStorage.getItem(STORAGE_KEYS.role)
  return saved === 'admin' ? 'admin' : 'viewer'
}

const loadTheme = (): Theme => {
  const saved = localStorage.getItem(STORAGE_KEYS.theme)
  return saved === 'dark' ? 'dark' : 'light'
}

const formatSignedAmount = (type: TransactionType, amount: number) =>
  `${type === 'income' ? '+' : '-'}${currency.format(amount)}`

const formatMonth = (date: string) =>
  new Date(date).toLocaleString('en-IN', { month: 'short', year: '2-digit' })

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions)
  const [role, setRole] = useState<Role>(loadRole)
  const [theme, setTheme] = useState<Theme>(loadTheme)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('latest')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(defaultForm)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.role, role)
  }, [role])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.theme, theme)
    document.documentElement.dataset.theme = theme
  }, [theme])

  const categories = useMemo(() => {
    const unique = new Set(transactions.map((transaction) => transaction.category))
    return Array.from(unique).sort()
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return [...transactions]
      .filter((transaction) => {
        const matchesSearch =
          !normalizedSearch ||
          [transaction.title, transaction.category, transaction.note ?? '']
            .join(' ')
            .toLowerCase()
            .includes(normalizedSearch)

        const matchesType = typeFilter === 'all' || transaction.type === typeFilter
        const matchesCategory =
          categoryFilter === 'all' || transaction.category === categoryFilter

        return matchesSearch && matchesType && matchesCategory
      })
      .sort((left, right) => {
        switch (sortBy) {
          case 'oldest':
            return +new Date(left.date) - +new Date(right.date)
          case 'highest':
            return right.amount - left.amount
          case 'lowest':
            return left.amount - right.amount
          case 'latest':
          default:
            return +new Date(right.date) - +new Date(left.date)
        }
      })
  }, [transactions, search, typeFilter, categoryFilter, sortBy])

  const financials = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === 'income')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const expenses = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce((sum, transaction) => sum + transaction.amount, 0)
    const balance = income - expenses

    return { income, expenses, balance, savingsRate: income ? ((income - expenses) / income) * 100 : 0 }
  }, [transactions])

  const balanceTrendData = useMemo(() => {
    const sorted = [...transactions].sort((left, right) => +new Date(left.date) - +new Date(right.date))

    return sorted.reduce<Array<{ label: string; balance: number }>>((accumulator, transaction) => {
      const previousBalance = accumulator.at(-1)?.balance ?? 0
      const nextBalance =
        previousBalance + (transaction.type === 'income' ? transaction.amount : -transaction.amount)

      accumulator.push({
        label: new Date(transaction.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        balance: nextBalance,
      })

      return accumulator
    }, [])
  }, [transactions])

  const expenseBreakdown = useMemo(() => {
    const totals = transactions
      .filter((transaction) => transaction.type === 'expense')
      .reduce<Record<string, number>>((accumulator, transaction) => {
        accumulator[transaction.category] = (accumulator[transaction.category] ?? 0) + transaction.amount
        return accumulator
      }, {})

    return Object.entries(totals)
      .map(([name, value]) => ({ name, value }))
      .sort((left, right) => right.value - left.value)
  }, [transactions])

  const monthlyComparison = useMemo(() => {
    const grouped = transactions.reduce<Record<string, { income: number; expenses: number }>>(
      (accumulator, transaction) => {
        const month = formatMonth(transaction.date)
        const existing = accumulator[month] ?? { income: 0, expenses: 0 }
        existing[transaction.type === 'income' ? 'income' : 'expenses'] += transaction.amount
        accumulator[month] = existing
        return accumulator
      },
      {},
    )

    return Object.entries(grouped).map(([month, values]) => ({
      month,
      ...values,
      net: values.income - values.expenses,
    }))
  }, [transactions])

  const insights = useMemo(() => {
    const topCategory = expenseBreakdown[0]
    const latestMonth = monthlyComparison.at(-1)
    const previousMonth = monthlyComparison.at(-2)

    const monthDelta =
      latestMonth && previousMonth ? latestMonth.expenses - previousMonth.expenses : 0

    return {
      topCategory,
      monthDelta,
      latestMonth,
      previousMonth,
    }
  }, [expenseBreakdown, monthlyComparison])

  const resetForm = () => {
    setEditingId(null)
    setForm(defaultForm)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const amount = Number(form.amount)
    if (!form.title.trim() || !form.date || !form.category.trim() || Number.isNaN(amount) || amount <= 0) {
      return
    }

    const nextTransaction: Transaction = {
      id: editingId ?? Date.now(),
      title: form.title.trim(),
      date: form.date,
      category: form.category.trim(),
      type: form.type,
      amount,
      note: form.note.trim(),
    }

    setTransactions((current) =>
      editingId
        ? current.map((transaction) => (transaction.id === editingId ? nextTransaction : transaction))
        : [nextTransaction, ...current],
    )

    resetForm()
  }

  const startEditing = (transaction: Transaction) => {
    setEditingId(transaction.id)
    setForm({
      title: transaction.title,
      date: transaction.date,
      category: transaction.category,
      type: transaction.type,
      amount: String(transaction.amount),
      note: transaction.note ?? '',
    })
  }

  const handleDelete = (id: number) => {
    if (!window.confirm('Delete this transaction? This cannot be undone.')) return
    setTransactions((current) => current.filter((transaction) => transaction.id !== id))
    if (editingId === id) resetForm()
  }

  return (
    <main className="app-shell">
      <header className="hero-section">
        <div>
          <p className="eyebrow">Finance Dashboard UI</p>
          <h1>Track spending, monitor cash flow, and surface quick financial insights.</h1>
          <p className="hero-copy">
            A responsive mock dashboard built with static data, client-side state management,
            role-based UI, and lightweight persistence.
          </p>
        </div>

        <div className="toolbar">
          <label className="select-field">
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          </label>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => setTheme((current) => (current === 'light' ? 'dark' : 'light'))}
          >
            {theme === 'light' ? <Moon size={18} /> : <SunMedium size={18} />}
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      </header>

      <section className="summary-grid">
        <article className="summary-card">
          <div className="summary-card__header">
            <span>Total Balance</span>
            <Wallet size={18} />
          </div>
          <strong>{currency.format(financials.balance)}</strong>
          <p>{financials.savingsRate.toFixed(1)}% of income retained after expenses.</p>
        </article>

        <article className="summary-card">
          <div className="summary-card__header">
            <span>Total Income</span>
            <ArrowUpRight size={18} />
          </div>
          <strong>{currency.format(financials.income)}</strong>
          <p>Primary income is driven by salary with occasional side earnings.</p>
        </article>

        <article className="summary-card">
          <div className="summary-card__header">
            <span>Total Expenses</span>
            <ArrowDownRight size={18} />
          </div>
          <strong>{currency.format(financials.expenses)}</strong>
          <p>Housing and food currently make up the largest share of spending.</p>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel panel--chart">
          <div className="panel__heading">
            <div>
              <p className="panel__eyebrow">Time-based visualization</p>
              <h2>Running balance trend</h2>
            </div>
            <TrendingUp size={18} />
          </div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceTrendData}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(value) => currency.format(value)} tickLine={false} axisLine={false} width={100} />
                <Tooltip formatter={(value) => currency.format(Number(value))} />
                <Line type="monotone" dataKey="balance" stroke="#6d5efc" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel panel--chart">
          <div className="panel__heading">
            <div>
              <p className="panel__eyebrow">Categorical visualization</p>
              <h2>Spending breakdown</h2>
            </div>
            <CreditCard size={18} />
          </div>
          <div className="chart-wrap">
            {expenseBreakdown.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expenseBreakdown} dataKey="value" nameKey="name" innerRadius={65} outerRadius={95} paddingAngle={3}>
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => currency.format(Number(value))} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">No expense data available yet.</div>
            )}
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel__heading">
            <div>
              <p className="panel__eyebrow">Insights</p>
              <h2>Quick observations</h2>
            </div>
            <IndianRupee size={18} />
          </div>

          <div className="insights-grid">
            <div className="insight-card">
              <TrendingDown size={18} />
              <strong>{insights.topCategory?.name ?? 'No data yet'}</strong>
              <p>
                Highest spending category
                {insights.topCategory ? ` at ${currency.format(insights.topCategory.value)}.` : '.'}
              </p>
            </div>
            <div className="insight-card">
              <ShieldCheck size={18} />
              <strong>
                {insights.latestMonth && insights.previousMonth
                  ? `${insights.monthDelta > 0 ? '+' : ''}${currency.format(insights.monthDelta)}`
                  : 'Waiting for more data'}
              </strong>
              <p>Month-over-month expense change based on the latest available period.</p>
            </div>
            <div className="insight-card">
              <Wallet size={18} />
              <strong>
                {insights.latestMonth ? currency.format(insights.latestMonth.net) : currency.format(0)}
              </strong>
              <p>Net result for the latest month after income and expenses are combined.</p>
            </div>
          </div>

          <div className="comparison-list">
            {monthlyComparison.map((month) => (
              <div key={month.month} className="comparison-row">
                <span>{month.month}</span>
                <span>Income {currency.format(month.income)}</span>
                <span>Expenses {currency.format(month.expenses)}</span>
                <span>Net {currency.format(month.net)}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel__heading">
            <div>
              <p className="panel__eyebrow">Role-based actions</p>
              <h2>Manage transactions</h2>
            </div>
            <Plus size={18} />
          </div>

          {role === 'admin' ? (
            <form className="transaction-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  <span>Title</span>
                  <input
                    value={form.title}
                    onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                    placeholder="e.g. Internet bill"
                  />
                </label>
                <label>
                  <span>Date</span>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                  />
                </label>
                <label>
                  <span>Category</span>
                  <input
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                </label>
                <label>
                  <span>Amount</span>
                  <input
                    type="number"
                    min="1"
                    value={form.amount}
                    onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                    placeholder="0"
                  />
                </label>
                <label>
                  <span>Type</span>
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, type: event.target.value as TransactionType }))
                    }
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </label>
                <label className="form-grid__wide">
                  <span>Note</span>
                  <input
                    value={form.note}
                    onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                    placeholder="Optional note"
                  />
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="button button--primary">
                  {editingId ? 'Save changes' : 'Add transaction'}
                </button>
                {editingId ? (
                  <button type="button" className="button" onClick={resetForm}>
                    Cancel edit
                  </button>
                ) : null}
              </div>
            </form>
          ) : (
            <div className="viewer-note">
              <ShieldCheck size={18} />
              Viewer mode is read-only. Switch to Admin to add, edit, or delete transactions.
            </div>
          )}
        </article>
      </section>

      <section className="panel">
        <div className="panel__heading">
          <div>
            <p className="panel__eyebrow">Transactions</p>
            <h2>Recent activity</h2>
          </div>
          <Filter size={18} />
        </div>

        <div className="filters">
          <label className="search-field">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, category, or note"
            />
          </label>

          <label className="select-field">
            <span>Type</span>
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'all' | TransactionType)}>
              <option value="all">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </label>

          <label className="select-field">
            <span>Category</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="all">All</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="select-field">
            <span>Sort</span>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}>
              <option value="latest">Latest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest amount</option>
              <option value="lowest">Lowest amount</option>
            </select>
          </label>
        </div>

        {filteredTransactions.length ? (
          <div className="transaction-list">
            {filteredTransactions.map((transaction) => (
              <article key={transaction.id} className="transaction-row">
                <div className="transaction-row__main">
                  <div className="transaction-row__lead">
                    <strong className="transaction-row__title">{transaction.title}</strong>
                    <span className={`badge badge--${transaction.type}`}>{transaction.type}</span>
                  </div>
                  <div className={`amount amount--${transaction.type}`} aria-label="Amount">
                    {formatSignedAmount(transaction.type, transaction.amount)}
                  </div>
                </div>
                <div className="transaction-row__meta">
                  <span>{formatDate(transaction.date)}</span>
                  <span className="transaction-row__dot" aria-hidden>
                    ·
                  </span>
                  <span>{transaction.category}</span>
                </div>
                <p className="transaction-row__note">{transaction.note?.trim() || 'No note'}</p>
                <div className="transaction-actions">
                  {role === 'admin' ? (
                    <>
                      <button type="button" className="button button--compact" onClick={() => startEditing(transaction)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="button button--compact button--danger"
                        onClick={() => handleDelete(transaction.id)}
                        aria-label={`Delete ${transaction.title}`}
                      >
                        <Trash2 size={16} aria-hidden />
                        Delete
                      </button>
                    </>
                  ) : (
                    <span className="muted-label">Read only</span>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            No transactions match the current filters. Clear search or change filters to see results.
          </div>
        )}
      </section>
    </main>
  )
}

export default App
