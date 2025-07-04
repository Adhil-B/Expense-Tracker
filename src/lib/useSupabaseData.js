import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useSession } from 'next-auth/react';

export function useSupabaseData() {
  const { data: session } = useSession();
  const user = session?.user;
  const [expenses, setExpenses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [groupExpenses, setGroupExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all data for the user
  const fetchAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data: exp, error: expErr } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      const { data: grps, error: grpErr } = await supabase
        .from('groups')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      const { data: gexps, error: gexpErr } = await supabase
        .from('group_expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (expErr || grpErr || gexpErr) throw expErr || grpErr || gexpErr;
      setExpenses(exp || []);
      setGroups(grps || []);
      setGroupExpenses(gexps || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchAll();
  }, [user, fetchAll]);

  // CRUD for expenses
  const addExpense = async (expense) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('expenses')
      .insert([{ ...expense, user_id: user.id }]);
    if (!error) fetchAll();
    return { data, error };
  };
  const updateExpense = async (id, updates) => {
    const { data, error } = await supabase
      .from('expenses')
      .update(updates)
      .eq('id', id);
    if (!error) fetchAll();
    return { data, error };
  };
  const deleteExpense = async (id) => {
    const { data, error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    if (!error) fetchAll();
    return { data, error };
  };

  // CRUD for groups
  const addGroup = async (group) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('groups')
      .insert([{ ...group, user_id: user.id }]);
    if (!error) fetchAll();
    return { data, error };
  };
  const updateGroup = async (id, updates) => {
    const { data, error } = await supabase
      .from('groups')
      .update(updates)
      .eq('id', id);
    if (!error) fetchAll();
    return { data, error };
  };
  const deleteGroup = async (id) => {
    const { data, error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);
    if (!error) fetchAll();
    return { data, error };
  };

  // CRUD for group_expenses
  const addGroupExpense = async (groupExpense) => {
    if (!user) return;
    const { data, error } = await supabase
      .from('group_expenses')
      .insert([{ ...groupExpense, user_id: user.id }]);
    if (!error) fetchAll();
    return { data, error };
  };

  // Add sample/demo data for onboarding/demo account
  const addDemoData = async () => {
    if (!user) return;
    try {
      // Sample expenses
      await supabase.from('expenses').insert([
        { user_id: user.id, amount: 1200, category: 'Travel', date: '2024-06-01', description: 'Trip to Goa' },
        { user_id: user.id, amount: 200, category: 'Food', date: '2024-06-02', description: 'Lunch with friends' },
        { user_id: user.id, amount: 500, category: 'Shopping', date: '2024-06-03', description: 'New shoes' },
      ]);
      // Sample group
      const { data: group, error } = await supabase.from('groups').insert([
        { user_id: user.id, name: 'Goa Trip', participants: ['Alice', 'Bob', 'Charlie'] }
      ]).select().single();
      if (group) {
        // Sample group expenses
        await supabase.from('group_expenses').insert([
          { group_id: group.id, user_id: user.id, amount: 1500, payer: 'Alice', involved: ['Alice', 'Bob', 'Charlie'], description: 'Hotel' },
          { group_id: group.id, user_id: user.id, amount: 600, payer: 'Bob', involved: ['Alice', 'Bob'], description: 'Scooter rental' },
        ]);
      }
      await fetchAll();
      if (typeof window !== 'undefined') {
        localStorage.setItem('demo_sample_added', 'true');
      }
    } catch (err) {
      console.error('Demo data insert error:', err);
    }
  };

  return {
    expenses, groups, groupExpenses, loading, error,
    addExpense, updateExpense, deleteExpense,
    addGroup, updateGroup, deleteGroup,
    addGroupExpense,
    fetchAll,
    addDemoData,
  };
} 