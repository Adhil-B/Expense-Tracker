'use client';
import React, { useState, useEffect } from 'react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import SectionHeader from '../../components/SectionHeader';
import Modal from '../../components/Modal';

const CATEGORY_OPTIONS = [
  'Food',
  'Travel',
  'Rent',
  'Shopping',
  'Utilities',
  'Other',
];

const CURRENCY_OPTIONS = [
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  // Add more as needed
];

function calculateSettlements(expenses, participants) {
  // Calculate net balance for each participant
  const net = {};
  participants.forEach(p => (net[p] = 0));
  expenses.forEach(exp => {
    if (!Array.isArray(exp.involved) || exp.involved.length === 0) return;
    const share = exp.amount / exp.involved.length;
    exp.involved.forEach(person => {
      net[person] -= share;
    });
    net[exp.payer] += exp.amount;
  });
  // Calculate who owes whom
  const owes = [];
  const creditors = Object.entries(net).filter(([_, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const debtors = Object.entries(net).filter(([_, v]) => v < 0).sort((a, b) => a[1] - b[1]);
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor[1], creditor[1]);
    if (amount > 0.01) {
      owes.push({ from: debtor[0], to: creditor[0], amount: amount });
      net[debtor[0]] += amount;
      net[creditor[0]] -= amount;
    }
    if (Math.abs(net[debtor[0]]) < 0.01) i++;
    if (Math.abs(net[creditor[0]]) < 0.01) j++;
  }
  return owes;
}

function getCategoryData(expenses) {
  const data = {};
  expenses.forEach(e => {
    if (!data[e.category]) data[e.category] = 0;
    data[e.category] += Number(e.amount);
  });
  return data;
}

function getDefaultCurrency() {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('currency');
    if (saved) return saved;
    // Try to detect India
    if (navigator.language.startsWith('en-IN') || navigator.language.startsWith('hi-IN')) return 'INR';
  }
  return 'USD';
}

// --- Premium Color Palette for Chart and Legend ---
const PIE_COLORS = [
  '#6366F1', // primary
  '#F59E42', // accent orange
  '#10B981', // accent teal
  '#A78BFA', // accent purple
  '#22D3EE', // accent green
  '#3B82F6', // accent blue
  '#FBBF24', // accent yellow
  '#F472B6', // accent pink
  '#F43F5E', // rose
  '#F87171', // red
];

// --- PieChart: Premium, Responsive, Correct Logic ---
function PieChart({ data, currency = '$' }) {
  // Only show categories with value > 0
  const entries = Object.entries(data).filter(([_, v]) => v > 0);
  if (entries.length === 0) return (
    <div className="relative w-[220px] h-[220px] mx-auto flex items-center justify-center">
      <span className="text-gray-400">No expenses to show</span>
    </div>
  );
  // Sort by value descending for consistent color mapping
  entries.sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((a, b) => a + b[1], 0);
  let acc = 0;
  // Pie chart SVG (no text inside)
  return (
    <div className="relative w-[220px] h-[220px] mx-auto">
      <svg width="220" height="220" viewBox="0 0 44 44" className="mx-auto drop-shadow-xl">
        {entries.map(([cat, val], i) => {
          const pct = val / total;
          const start = acc;
          const end = acc + pct;
          acc = end;
          const large = pct > 0.5 ? 1 : 0;
          const a = 2 * Math.PI * start;
          const b = 2 * Math.PI * end;
          const x1 = 22 + 20 * Math.sin(a);
          const y1 = 22 - 20 * Math.cos(a);
          const x2 = 22 + 20 * Math.sin(b);
          const y2 = 22 - 20 * Math.cos(b);
          return (
            <g key={cat}>
              <path
                d={`M22,22 L${x1},${y1} A20,20 0 ${large} 1 ${x2},${y2} Z`}
                fill={PIE_COLORS[i % PIE_COLORS.length]}
                stroke="#fff"
                strokeWidth="0.7"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(80,80,180,0.10))' }}
              />
            </g>
          );
        })}
      </svg>
      {/* No center or overlay text */}
    </div>
  );
}

function getMonthlyOverview(expenses) {
  // Only sum expenses, not income
  const months = {};
  expenses.filter(e => e.type !== 'income').forEach(e => {
    const m = e.date?.slice(0, 7) || 'Unknown';
    if (!months[m]) months[m] = 0;
    months[m] += Number(e.amount);
  });
  return months;
}

function getMonthlyIncomeExpense(expenses) {
  const months = {};
  expenses.forEach(e => {
    const m = e.date?.slice(0, 7) || 'Unknown';
    if (!months[m]) months[m] = { income: 0, expense: 0 };
    if (e.type === 'income') {
      months[m].income += Number(e.amount);
    } else {
      months[m].expense += Number(e.amount);
    }
  });
  return months;
}

function getUniqueId() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.floor(Math.random() * 1e16).toString();
}

export default function DashboardPage() {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    amount: '',
    category: '',
    date: '',
    description: '',
  });
  const [editId, setEditId] = useState(null);

  // Group state
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groups, setGroups] = useState([]);
  const [groupForm, setGroupForm] = useState({ name: '', participants: [''] });
  const [editGroupId, setEditGroupId] = useState(null);

  // Group expense state
  const [showGroupExpenseModal, setShowGroupExpenseModal] = useState(false);
  const [groupExpenseForm, setGroupExpenseForm] = useState({
    groupId: null,
    amount: '',
    payer: '',
    involved: [],
    description: '',
  });
  const [editGroupExpense, setEditGroupExpense] = useState(null);

  const [activity, setActivity] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('activity');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activity', JSON.stringify(activity));
    }
  }, [activity]);

  const [currency, setCurrency] = useState('USD');
  useEffect(() => {
    let detected = 'USD';
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('currency');
      if (saved) detected = saved;
      else if (navigator.language.startsWith('en-IN') || navigator.language.startsWith('hi-IN')) detected = 'INR';
    }
    setCurrency(detected);
  }, []);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', currency);
    }
  }, [currency]);
  const currencyObj = CURRENCY_OPTIONS.find(c => c.code === currency) || CURRENCY_OPTIONS[0];

  // Add at the top of DashboardPage
  const [settledDebts, setSettledDebts] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('settledDebts');
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  // Persist settledDebts for guests
  useEffect(() => {
    if (localStorage.getItem('guestMode') === 'true') localStorage.setItem('settledDebts', JSON.stringify(settledDebts));
  }, [settledDebts]);

  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedGroups = localStorage.getItem('groups');
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedGroups) setGroups(JSON.parse(savedGroups));
    setLoaded(true);
  }, []);

  // Only save after initial load
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('expenses', JSON.stringify(expenses));
    }
  }, [expenses, loaded]);
  useEffect(() => {
    if (loaded) {
      localStorage.setItem('groups', JSON.stringify(groups));
    }
  }, [groups, loaded]);

  // Add at the top of DashboardPage, after useState declarations:
  const [username, setUsername] = useState('You');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('username');
      if (stored) setUsername(stored);
    }
  }, []);

  // Add state for income modal
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [incomeForm, setIncomeForm] = useState({ amount: '', date: '', description: '' });

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAddExpense(e) {
    e.preventDefault();
    if (!form.amount || !form.category || !form.date) return;
    if (editId) {
      setExpenses(expenses.map(exp => exp.id === editId ? { ...form, id: editId } : exp));
    } else {
      setExpenses([
        {
          ...form,
          id: getUniqueId(),
        },
        ...expenses,
      ]);
    }
    setForm({ amount: '', category: '', date: '', description: '' });
    setEditId(null);
    setShowExpenseModal(false);
    setActivity([...activity, { type: 'expense', desc: `Added expense: ${form.amount} for ${form.category} on ${form.date}`, date: new Date().toISOString() }]);
  }

  function handleEditExpense(exp) {
    setForm({
      amount: exp.amount,
      category: exp.category,
      date: exp.date,
      description: exp.description || '',
    });
    setEditId(exp.id);
    setShowExpenseModal(true);
    setActivity([...activity, { type: 'expense', desc: `Edited expense: ${exp.amount} for ${exp.category} on ${exp.date}`, date: new Date().toISOString() }]);
  }

  function handleDeleteExpense(id) {
    setExpenses(expenses.filter(exp => exp.id !== id));
    setActivity([...activity, { type: 'expense', desc: `Deleted expense with id: ${id}`, date: new Date().toISOString() }]);
  }

  function handleModalClose() {
    setShowExpenseModal(false);
    setForm({ amount: '', category: '', date: '', description: '' });
    setEditId(null);
  }

  // Group logic
  function handleGroupFormChange(e, idx) {
    if (e.target.name === 'name') {
      setGroupForm({ ...groupForm, name: e.target.value });
    } else {
      // participant name
      const updated = [...groupForm.participants];
      updated[idx] = e.target.value;
      setGroupForm({ ...groupForm, participants: updated });
    }
  }

  function handleAddParticipant() {
    setGroupForm({ ...groupForm, participants: [...groupForm.participants, ''] });
  }

  function handleRemoveParticipant(idx) {
    const updated = groupForm.participants.filter((_, i) => i !== idx);
    setGroupForm({ ...groupForm, participants: updated });
  }

  function handleAddGroup(e) {
    e.preventDefault();
    if (!groupForm.name || groupForm.participants.some(p => !p.trim())) return;
    if (editGroupId) {
      setGroups(groups.map(g => g.id === editGroupId ? { ...groupForm, id: editGroupId, expenses: groupForm.expenses || [] } : g));
    } else {
      setGroups([
        { ...groupForm, id: getUniqueId(), expenses: [] },
        ...groups,
      ]);
    }
    setGroupForm({ name: '', participants: [''] });
    setEditGroupId(null);
    setShowGroupModal(false);
    setActivity([...activity, { type: 'group', desc: `Added group: ${groupForm.name} with participants: ${groupForm.participants.join(', ')}`, date: new Date().toISOString() }]);
  }

  function handleEditGroup(group) {
    setGroupForm({ name: group.name, participants: [...group.participants] });
    setEditGroupId(group.id);
    setShowGroupModal(true);
    setActivity([...activity, { type: 'group', desc: `Edited group: ${group.name} with participants: ${group.participants.join(', ')}`, date: new Date().toISOString() }]);
  }

  function handleDeleteGroup(id) {
    setGroups(groups.filter(g => g.id !== id));
    setActivity([...activity, { type: 'group', desc: `Deleted group with id: ${id}`, date: new Date().toISOString() }]);
  }

  function handleGroupModalClose() {
    setShowGroupModal(false);
    setGroupForm({ name: '', participants: [''] });
    setEditGroupId(null);
  }

  // Group expense logic
  function openGroupExpenseModal(groupId) {
    setGroupExpenseForm({
      groupId,
      amount: '',
      payer: '',
      involved: [],
      description: '',
    });
    setEditGroupExpense(null);
    setShowGroupExpenseModal(true);
  }

  function handleGroupExpenseFormChange(e) {
    const { name, value, type, checked } = e.target;
    if (name === 'involved') {
      let updated = [...groupExpenseForm.involved];
      if (checked) {
        updated.push(value);
      } else {
        updated = updated.filter(p => p !== value);
      }
      setGroupExpenseForm({ ...groupExpenseForm, involved: updated });
    } else {
      setGroupExpenseForm({ ...groupExpenseForm, [name]: value });
    }
  }

  function handleAddGroupExpense(e) {
    e.preventDefault();
    const { groupId, amount, payer, involved, description } = groupExpenseForm;
    if (!amount || !payer || involved.length === 0) return;
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, expenses: [{ id: getUniqueId(), amount: Number(amount), payer, involved, description }, ...(g.expenses || [])] }
        : g
    ));
    setShowGroupExpenseModal(false);
    setGroupExpenseForm({ groupId: null, amount: '', payer: '', involved: [], description: '' });
    setEditGroupExpense(null);
    setActivity([...activity, { type: 'expense', desc: `Added shared expense: ${amount} for ${payer} with involved participants: ${involved.join(', ')}`, date: new Date().toISOString() }]);
  }

  function markDebtAsPaid(groupId, debt) {
    setSettledDebts(prev => {
      const groupSettled = prev[groupId] || [];
      // Use a string key for uniqueness: from|to|amount
      const debtKey = `${debt.from}|${debt.to}|${debt.amount}`;
      if (!groupSettled.includes(debtKey)) {
        return { ...prev, [groupId]: [...groupSettled, debtKey] };
      }
      return prev;
    });
  }

  // Sidebar: Debts/Credits logic
  let oweDetails = [];
  let owedToYouDetails = [];
  let totalOwe = 0;
  let totalOwedToYou = 0;
  groups.forEach(group => {
    if (group.expenses && group.participants) {
      const settlements = calculateSettlements(group.expenses, group.participants);
      settlements.forEach(s => {
        if (s.from === username) {
          oweDetails.push({ ...s, group: group.name });
          totalOwe += s.amount;
        }
        if (s.to === username) {
          owedToYouDetails.push({ ...s, group: group.name });
          totalOwedToYou += s.amount;
        }
      });
    }
  });

  // Filter expenses and income
  const expenseEntries = expenses.filter(e => e.type !== 'income');
  const incomeEntries = expenses.filter(e => e.type === 'income');

  // Update summary calculations
  const personalTotal = expenseEntries.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  const personalIncome = incomeEntries.reduce((acc, e) => acc + Number(e.amount || 0), 0);
  // Calculate group shares and paid
  let groupShare = 0;
  let groupPaid = 0;
  groups.forEach(group => {
    (group.expenses || []).forEach(exp => {
      if (exp.payer === username) groupPaid += Number(exp.amount);
      if (exp.involved && exp.involved.includes(username)) groupShare += Number(exp.amount) / exp.involved.length;
    });
  });
  // Total expenses: personal + your share in groups
  const totalExpenses = personalTotal + groupShare;
  // Total income: what others owe you in groups (amount you paid minus your share)
  const totalIncome = personalIncome + (groupPaid - groupShare);
  // Total balance: net position
  const totalBalance = totalIncome - totalExpenses;

  // Add handler for income form
  function handleIncomeFormChange(e) {
    setIncomeForm({ ...incomeForm, [e.target.name]: e.target.value });
  }
  function handleAddIncome(e) {
    e.preventDefault();
    if (!incomeForm.amount || !incomeForm.date) return;
    setExpenses([
      {
        ...incomeForm,
        id: getUniqueId(),
        type: 'income',
      },
      ...expenses,
    ]);
    setIncomeForm({ amount: '', date: '', description: '' });
    setShowIncomeModal(false);
    setActivity([...activity, { type: 'income', desc: `Added income: ${incomeForm.amount} on ${incomeForm.date}`, date: new Date().toISOString() }]);
  }

  // UI
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-2 sm:px-6 flex flex-col lg:flex-row gap-8 animate-fadeIn">
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="flex flex-col items-center">
            <span className="text-sm text-gray-500">Total Balance</span>
            <span className="text-2xl font-bold mt-2">{currencyObj.symbol}{totalBalance.toFixed(2)}</span>
          </Card>
          <Card className="flex flex-col items-center">
            <span className="text-sm text-gray-500">Total Expenses</span>
            <span className="text-2xl font-bold mt-2 text-red-500">{currencyObj.symbol}{totalExpenses.toFixed(2)}</span>
          </Card>
          <Card className="flex flex-col items-center">
            <span className="text-sm text-gray-500">Total Income</span>
            <span className="text-2xl font-bold mt-2 text-green-500">{currencyObj.symbol}{totalIncome.toFixed(2)}</span>
          </Card>
        </div>
        {/* Chart Placeholder */}
        <Card className="min-h-[300px] flex flex-col items-center justify-center py-8">
          {expenseEntries.length === 0 ? (
            <span className="text-gray-400">No expenses yet.</span>
          ) : (
            <>
              {/* Only pass expense data to PieChart */}
              <PieChart data={getCategoryData(expenseEntries)} currency={currencyObj.symbol} />
              {/* Premium Legend with percent */}
              <div className="flex flex-wrap justify-center gap-4 mt-8">
                {(() => {
                  // Legend uses same sorted/filter logic as PieChart
                  const legendEntries = Object.entries(getCategoryData(expenseEntries)).filter(([_, v]) => v > 0);
                  legendEntries.sort((a, b) => b[1] - a[1]);
                  const total = legendEntries.reduce((a, b) => a + b[1], 0);
                  return legendEntries.map(([cat, val], i) => {
                    const percent = total > 0 ? Math.round((val / total) * 100) : 0;
                    return (
                      <div key={cat} className="flex items-center gap-2 text-sm font-medium bg-white/70 dark:bg-[#23263A]/70 rounded-pill px-3 py-1 shadow border border-gray-100 dark:border-gray-800">
                        <span className="inline-block w-4 h-4 rounded-full border-2 border-white shadow" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span>{cat}</span>
                        <span className="ml-1 text-xs text-gray-500">({currencyObj.symbol}{val.toFixed(2)})</span>
                        <span className="ml-1 text-xs text-indigo-500 font-bold">{percent}%</span>
                      </div>
                    );
                  });
                })()}
              </div>
            </>
          )}
        </Card>
        {/* Activity Timeline */}
        <Card className="flex flex-col gap-4">
          <div className="font-semibold mb-2">Activity Timeline</div>
          <ul className="text-xs text-gray-700 dark:text-gray-300">
            {activity.length === 0 ? (
              <li>No activity yet.</li>
            ) : (
              activity.slice(-10).reverse().map((a, i) => (
                <li key={i} className="mb-1">{new Date(a.date).toLocaleString()}: {a.desc}</li>
              ))
            )}
          </ul>
        </Card>
        {/* Expense Tracker Section */}
        <Card>
          <SectionHeader title="Recent Expenses">
            <Button variant="pill" onClick={() => setShowExpenseModal(true)}>
              + Add Expense
            </Button>
            <Button variant="pill" onClick={() => setShowIncomeModal(true)}>
              + Add Income
            </Button>
          </SectionHeader>
          <div className="min-h-[80px]">
            {expenseEntries.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-gray-400">No expenses yet.</div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {expenseEntries.slice(0, 5).map((exp) => (
                  <li key={exp.id} className="flex items-center justify-between py-3 gap-2">
                    <div>
                      <div className="font-semibold text-base">{currencyObj.symbol}{Number(exp.amount).toFixed(2)}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{exp.category} • {exp.date}</div>
                      {exp.description && <div className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{exp.description}</div>}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => handleEditExpense(exp)}>
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleDeleteExpense(exp.id)}>
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
        {/* Expense Splitter Section */}
        <Card>
          <SectionHeader title="Groups & Expense Splitting">
            <Button variant="pill" onClick={() => setShowGroupModal(true)}>+ New Group</Button>
          </SectionHeader>
          <div className="min-h-[80px]">
            {groups.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-gray-400">No groups yet.</div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {groups.map((group) => {
                  // Calculate paid and share
                  let youPaid = 0;
                  let yourShare = 0;
                  (group.expenses || []).forEach(exp => {
                    if (exp.payer === username) youPaid += Number(exp.amount);
                    if (exp.involved && exp.involved.includes(username)) yourShare += Number(exp.amount) / exp.involved.length;
                  });
                  const netBalance = youPaid - yourShare;
                  return (
                    <li key={group.id} className="flex flex-col gap-2 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold text-base">{group.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">Participants: {group.participants.join(', ')}</div>
                          {/* Per-group summary for current user */}
                          <div className="text-xs mt-1">
                            <span className="mr-2">You paid: <span className="font-semibold">{currencyObj.symbol}{youPaid.toFixed(2)}</span></span>
                            <span className="mr-2">Your share: <span className="font-semibold">{currencyObj.symbol}{yourShare.toFixed(2)}</span></span>
                            <span>Net: <span className={`font-semibold ${netBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>{currencyObj.symbol}{netBalance.toFixed(2)}</span></span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => handleEditGroup(group)}>
                            Edit
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => handleDeleteGroup(group.id)}>
                            Delete
                          </Button>
                          <Button variant="primary" size="sm" onClick={() => openGroupExpenseModal(group.id)}>
                            + Add Expense
                          </Button>
                        </div>
                      </div>
                      {/* Group Expenses */}
                      {group.expenses && group.expenses.length > 0 && (
                        <div className="mt-2">
                          <div className="font-semibold text-sm mb-1">Shared Expenses</div>
                          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                            {(group.expenses || []).map(exp => (
                              <li key={exp.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
                                <div>
                                  <span className="font-medium">{currencyObj.symbol}{exp.amount.toFixed(2)}</span> by <span className="font-medium">{exp.payer}</span>
                                  <span className="text-xs text-gray-500 ml-2">for [{exp.involved.join(', ')}]</span>
                                  {exp.description && <span className="block text-xs text-gray-400 mt-0.5">{exp.description}</span>}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* Settlement Summary */}
                      {group.expenses && group.expenses.length > 0 && (
                        <div className="mt-2">
                          <div className="font-semibold text-sm mb-1">Settlement</div>
                          <ul className="text-xs text-gray-700 dark:text-gray-300 flex flex-col gap-2">
                            {(() => {
                              const settlements = calculateSettlements(group.expenses, group.participants);
                              if (settlements.length === 0) return <li>All settled up!</li>;
                              // Only show unpaid settlements
                              const groupSettled = settledDebts[group.id] || [];
                              const unpaid = settlements.filter(s => !groupSettled.includes(`${s.from}|${s.to}|${s.amount}`));
                              if (unpaid.length === 0) return <li>All settled up!</li>;
                              return unpaid.map((s, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  {s.from} owes {s.to} <span className="font-semibold">{currencyObj.symbol}{s.amount.toFixed(2)}</span>
                                  <Button variant="secondary" size="xs" onClick={() => markDebtAsPaid(group.id, s)}>Mark as Paid</Button>
                                </li>
                              ));
                            })()}
                          </ul>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>
        {/* Add/Edit Expense Modal */}
        <Modal isOpen={showExpenseModal} onClose={handleModalClose} title={editId ? "Edit Expense" : "Add Expense"}>
          <form className="flex flex-col gap-4" onSubmit={handleAddExpense}>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23263A] text-black dark:text-white px-3 py-2"
                placeholder={`${currencyObj.symbol}0.00`}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23263A] text-black dark:text-white px-3 py-2"
                required
              >
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} className="bg-white dark:bg-[#23263A] text-black dark:text-white">{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23263A] text-black dark:text-white px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleFormChange}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23263A] text-black dark:text-white px-3 py-2"
                placeholder="Description"
              />
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <Button variant="secondary" onClick={handleModalClose} type="button">Cancel</Button>
              <Button variant="primary" type="submit">{editId ? "Save" : "Add"}</Button>
            </div>
          </form>
        </Modal>
        {/* Add/Edit Group Modal */}
        <Modal isOpen={showGroupModal} onClose={handleGroupModalClose} title={editGroupId ? "Edit Group" : "New Group"}>
          <form className="flex flex-col gap-4" onSubmit={handleAddGroup}>
            <div>
              <label className="block text-sm font-medium mb-1">Group Name</label>
              <input
                type="text"
                name="name"
                value={groupForm.name}
                onChange={handleGroupFormChange}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23263A] text-black dark:text-white px-3 py-2"
                placeholder="e.g. Trip to Goa"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Participants</label>
              {/* Add yourself checkbox */}
              <div className="mb-2">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={groupForm.participants.includes(username)}
                    onChange={e => {
                      if (e.target.checked) {
                        if (!groupForm.participants.includes(username)) {
                          setGroupForm({ ...groupForm, participants: [username, ...groupForm.participants.filter(p => p && p !== username)] });
                        }
                      } else {
                        setGroupForm({ ...groupForm, participants: groupForm.participants.filter(p => p && p !== username) });
                      }
                    }}
                  />
                  Add yourself ({username})
                </label>
              </div>
              <div className="flex flex-col gap-2">
                {groupForm.participants.map((p, idx) => (
                  p === username ? null : (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      type="text"
                      name={`participant-${idx}`}
                      value={p}
                      onChange={e => handleGroupFormChange({ target: { name: 'participant', value: e.target.value } }, idx)}
                      className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23263A] text-black dark:text-white px-3 py-2"
                      placeholder={`Participant ${idx + 1}`}
                      required
                    />
                    {groupForm.participants.length > 1 && (
                      <Button variant="secondary" type="button" onClick={() => handleRemoveParticipant(idx)}>
                        Remove
                      </Button>
                    )}
                  </div>
                  )
                ))}
                <Button variant="secondary" type="button" onClick={handleAddParticipant} className="mt-2">+ Add Participant</Button>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <Button variant="secondary" onClick={handleGroupModalClose} type="button">Cancel</Button>
              <Button variant="primary" type="submit">{editGroupId ? "Save" : "Create"}</Button>
            </div>
          </form>
        </Modal>
        {/* Add/Edit Group Expense Modal */}
        <Modal isOpen={showGroupExpenseModal} onClose={() => setShowGroupExpenseModal(false)} title="Add Shared Expense">
          <form className="flex flex-col gap-4" onSubmit={handleAddGroupExpense}>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                value={groupExpenseForm.amount}
                onChange={handleGroupExpenseFormChange}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23263A] text-black dark:text-white px-3 py-2"
                placeholder={`${currencyObj.symbol}0.00`}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Payer</label>
              <select
                name="payer"
                value={groupExpenseForm.payer}
                onChange={handleGroupExpenseFormChange}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23263A] text-black dark:text-white px-3 py-2"
                required
              >
                <option value="">Select payer</option>
                {groups.find(g => g.id === groupExpenseForm.groupId)?.participants.map(p => (
                  <option key={p} className="bg-white dark:bg-[#23263A] text-black dark:text-white">{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Involved Participants</label>
              <div className="flex flex-col gap-1">
                {groups.find(g => g.id === groupExpenseForm.groupId)?.participants.map(p => (
                  <label key={p} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="involved"
                      value={p}
                      checked={groupExpenseForm.involved.includes(p)}
                      onChange={handleGroupExpenseFormChange}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                name="description"
                value={groupExpenseForm.description}
                onChange={handleGroupExpenseFormChange}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23263A] text-black dark:text-white px-3 py-2"
                placeholder="Description"
              />
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <Button variant="secondary" onClick={() => setShowGroupExpenseModal(false)} type="button">Cancel</Button>
              <Button variant="primary" type="submit">Add</Button>
            </div>
          </form>
        </Modal>
        {/* Add/Edit Income Modal */}
        <Modal isOpen={showIncomeModal} onClose={() => setShowIncomeModal(false)} title="Add Income">
          <form className="flex flex-col gap-4" onSubmit={handleAddIncome}>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                name="amount"
                value={incomeForm.amount}
                onChange={handleIncomeFormChange}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23263A] text-black dark:text-white px-3 py-2"
                placeholder={`${currencyObj.symbol}0.00`}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={incomeForm.date}
                onChange={handleIncomeFormChange}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23263A] text-black dark:text-white px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                name="description"
                value={incomeForm.description}
                onChange={handleIncomeFormChange}
                className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#23263A] text-black dark:text-white px-3 py-2"
                placeholder="Description"
              />
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <Button variant="secondary" onClick={() => setShowIncomeModal(false)} type="button">Cancel</Button>
              <Button variant="primary" type="submit">Add</Button>
            </div>
          </form>
        </Modal>
      </div>
      {/* Sidebar: Debts/Credits */}
      <div className="lg:w-80 w-full flex-shrink-0">
        <Card className="sticky top-24 flex flex-col gap-6 p-6 shadow-xl border-0 bg-gradient-to-br from-white/80 to-indigo-50 dark:from-[#181B2A]/80 dark:to-[#23263A]">
          <div>
            <div className="text-lg font-bold mb-1 text-gray-900 dark:text-white">You Owe</div>
            <div className="text-2xl font-extrabold text-red-500 mb-2">{currencyObj.symbol}{totalOwe.toFixed(2)}</div>
            {oweDetails.length === 0 ? (
              <div className="text-xs text-gray-400">You are all settled up!</div>
            ) : (
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                {oweDetails.map((d, i) => (
                  <li key={i} className="flex flex-col">
                    <span>You owe <span className="font-semibold">{d.to}</span> <span className="font-semibold text-red-500">{currencyObj.symbol}{d.amount.toFixed(2)}</span></span>
                    <span className="text-[11px] text-gray-400">in <span className="font-semibold">{d.group}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <div className="text-lg font-bold mb-1 text-gray-900 dark:text-white">Owed to You</div>
            <div className="text-2xl font-extrabold text-green-500 mb-2">{currencyObj.symbol}{totalOwedToYou.toFixed(2)}</div>
            {owedToYouDetails.length === 0 ? (
              <div className="text-xs text-gray-400">No one owes you right now.</div>
            ) : (
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                {owedToYouDetails.map((d, i) => (
                  <li key={i} className="flex flex-col">
                    <span><span className="font-semibold">{d.from}</span> owes you <span className="font-semibold text-green-500">{currencyObj.symbol}{d.amount.toFixed(2)}</span></span>
                    <span className="text-[11px] text-gray-400">in <span className="font-semibold">{d.group}</span></span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
        {/* Monthly Overview in Sidebar */}
        <Card className="sticky top-[420px] flex flex-col gap-4 mt-6 p-6 shadow-xl border-0 bg-gradient-to-br from-white/80 to-indigo-50 dark:from-[#181B2A]/80 dark:to-[#23263A]">
          <div className="font-semibold mb-2">Monthly Overview</div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(getMonthlyIncomeExpense(expenses)).map(([month, val]) => (
              <div
                key={month}
                className="flex flex-col items-center min-w-[120px] bg-white/70 dark:bg-[#23263A]/70 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md px-4 py-3"
              >
                <span className="text-base font-bold mb-2 text-gray-900 dark:text-white tracking-wide">{month}</span>
                <div className="flex flex-row items-center gap-3">
                  <span className="flex items-center gap-1 text-green-500 font-semibold text-sm">
                    <span className="text-lg">▲</span>+{currencyObj.symbol}{val.income.toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1 text-red-500 font-semibold text-sm">
                    <span className="text-lg">▼</span>-{currencyObj.symbol}{val.expense.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
} 