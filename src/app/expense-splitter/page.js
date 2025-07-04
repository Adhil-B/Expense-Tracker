import React from 'react';

export default function ExpenseSplitterPage() {
  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-2 sm:px-6 flex flex-col gap-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Expense Splitter</h1>
        <button className="bg-primary text-white rounded-pill px-4 py-2 shadow-soft hover:bg-primary-dark transition">+ New Group</button>
      </div>
      <div className="bg-card dark:bg-card-dark rounded-2xl shadow-soft p-6 min-h-[180px]">
        <span className="text-gray-400">[Groups & Split Logic Coming Soon]</span>
      </div>
    </div>
  );
} 