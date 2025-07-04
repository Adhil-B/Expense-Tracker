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

function calculateSettlements(expenses, participants) {
  // Calculate net balance for each participant
  const net = {};
  participants.forEach(p => (net[p] = 0));
  expenses.forEach(exp => {
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

function PieChart({ data }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  const colors = [
    '#6366F1', // primary
    '#F59E42', // accent orange
    '#10B981', // accent teal
    '#A78BFA', // accent purple
    '#22D3EE', // accent green
    '#3B82F6', // accent blue
    '#FBBF24', // accent yellow
    '#F472B6', // accent pink
    '#F43F5E', // vibrant red
    '#F87171', // soft red
  ];
  let acc = 0;
  const keys = Object.keys(data);
  return (
    <svg width="180" height="180" viewBox="0 0 36 36" className="mx-auto">
      {keys.map((cat, i) => {
        const val = data[cat];
        const pct = val / total;
        const start = acc;
        const end = acc + pct;
        acc = end;
        const large = pct > 0.5 ? 1 : 0;
        const a = 2 * Math.PI * start;
        const b = 2 * Math.PI * end;
        const x1 = 18 + 16 * Math.sin(a);
        const y1 = 18 - 16 * Math.cos(a);
        const x2 = 18 + 16 * Math.sin(b);
        const y2 = 18 - 16 * Math.cos(b);
        return (
          <path
            key={cat}
            d={`M18,18 L${x1},${y1} A16,16 0 ${large} 1 ${x2},${y2} Z`}
            fill={colors[i % colors.length]}
            stroke="#fff"
            strokeWidth="0.5"
          />
        );
      })}
    </svg>
  );
}

function getMonthlyOverview(expenses) {
  const months = {};
  expenses.forEach(e => {
    const m = e.date?.slice(0, 7) || 'Unknown';
    if (!months[m]) months[m] = 0;
    months[m] += Number(e.amount);
  });
  return months;
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

  const [activity, setActivity] = useState([]);

  // Persist expenses and groups in localStorage
  useEffect(() => {
    const savedExpenses = localStorage.getItem('expenses');
    const savedGroups = localStorage.getItem('groups');
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    if (savedGroups) setGroups(JSON.parse(savedGroups));
  }, []);
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem('groups', JSON.stringify(groups));
  }, [groups]);

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
          id: Date.now(),
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
      setGroups(groups.map(g => g.id === editGroupId ? { ...groupForm, id: editGroupId, expenses: g.expenses || [] } : g));
    } else {
      setGroups([
        { ...groupForm, id: Date.now(), expenses: [] },
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
        ? { ...g, expenses: [{ id: Date.now(), amount: Number(amount), payer, involved, description }, ...(g.expenses || [])] }
        : g
    ));
    setShowGroupExpenseModal(false);
    setGroupExpenseForm({ groupId: null, amount: '', payer: '', involved: [], description: '' });
    setEditGroupExpense(null);
    setActivity([...activity, { type: 'expense', desc: `Added shared expense: ${amount} for ${payer} with involved participants: ${involved.join(', ')}`, date: new Date().toISOString() }]);
  }

  // UI
  return (
    <div className="w-full max-w-5xl mx-auto py-8 px-2 sm:px-6 flex flex-col gap-8 animate-fadeIn">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex flex-col items-center">
          <span className="text-sm text-gray-500">Total Balance</span>
          <span className="text-2xl font-bold mt-2">${expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0).toFixed(2)}</span>
        </Card>
        <Card className="flex flex-col items-center">
          <span className="text-sm text-gray-500">Total Expenses</span>
          <span className="text-2xl font-bold mt-2 text-red-500">${expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0).toFixed(2)}</span>
        </Card>
        <Card className="flex flex-col items-center">
          <span className="text-sm text-gray-500">Total Income</span>
          <span className="text-2xl font-bold mt-2 text-green-500">$0.00</span>
        </Card>
      </div>
      {/* Chart Placeholder */}
      <Card className="min-h-[220px] flex flex-col items-center justify-center">
        {expenses.length === 0 ? (
          <span className="text-gray-400">[Expense Category Chart Coming Soon]</span>
        ) : (
          <>
            <PieChart data={getCategoryData(expenses)} />
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {Object.entries(getCategoryData(expenses)).map(([cat, val], i) => (
                <div key={cat} className="flex items-center gap-2 text-xs">
                  <span className="inline-block w-3 h-3 rounded-full" style={{ background: colors[i % colors.length] }} />
                  <span>{cat} (${val.toFixed(2)})</span>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
      {/* Monthly Overview */}
      <Card className="flex flex-col gap-4">
        <div className="font-semibold mb-2">Monthly Overview</div>
        <div className="flex flex-wrap gap-4">
          {Object.entries(getMonthlyOverview(expenses)).map(([month, val]) => (
            <div key={month} className="flex flex-col items-center">
              <span className="text-sm font-medium">{month}</span>
              <span className="text-lg font-bold">${val.toFixed(2)}</span>
            </div>
          ))}
        </div>
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
        </SectionHeader>
        <div className="min-h-[80px]">
          {expenses.length === 0 ? (
            <div className="flex items-center justify-center h-20 text-gray-400">No expenses yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {expenses.slice(0, 5).map((exp) => (
                <li key={exp.id} className="flex items-center justify-between py-3 gap-2">
                  <div>
                    <div className="font-semibold text-base">${Number(exp.amount).toFixed(2)}</div>
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
              {groups.slice(0, 5).map((group) => (
                <li key={group.id} className="flex flex-col gap-2 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="font-semibold text-base">{group.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">Participants: {group.participants.join(', ')}</div>
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
                        {group.expenses.slice(0, 3).map(exp => (
                          <li key={exp.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
                            <div>
                              <span className="font-medium">${exp.amount.toFixed(2)}</span> by <span className="font-medium">{exp.payer}</span>
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
                      <ul className="text-xs text-gray-700 dark:text-gray-300">
                        {calculateSettlements(group.expenses, group.participants).length === 0 ? (
                          <li>All settled up!</li>
                        ) : (
                          calculateSettlements(group.expenses, group.participants).map((s, idx) => (
                            <li key={idx}>{s.from} owes {s.to} <span className="font-semibold">${s.amount.toFixed(2)}</span></li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </li>
              ))}
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
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2"
              placeholder="$0.00"
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
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2"
              required
            >
              <option value="">Select category</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat}>{cat}</option>
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
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2"
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
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2"
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
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2"
              placeholder="e.g. Trip to Goa"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Participants</label>
            <div className="flex flex-col gap-2">
              {groupForm.participants.map((p, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    name={`participant-${idx}`}
                    value={p}
                    onChange={e => handleGroupFormChange({ target: { name: 'participant', value: e.target.value } }, idx)}
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2"
                    placeholder={`Participant ${idx + 1}`}
                    required
                  />
                  {groupForm.participants.length > 1 && (
                    <Button variant="secondary" type="button" onClick={() => handleRemoveParticipant(idx)}>
                      Remove
                    </Button>
                  )}
                </div>
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
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2"
              placeholder="$0.00"
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
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2"
              required
            >
              <option value="">Select payer</option>
              {groups.find(g => g.id === groupExpenseForm.groupId)?.participants.map(p => (
                <option key={p}>{p}</option>
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
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2"
              placeholder="Description"
            />
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <Button variant="secondary" onClick={() => setShowGroupExpenseModal(false)} type="button">Cancel</Button>
            <Button variant="primary" type="submit">Add</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
} 