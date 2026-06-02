/**
 * @name 修订历史
 *
 * Axure 原型「修订历史」页还原
 */

import './style.css';
import React from 'react';

const Component = function RevisionHistory() {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-[#333366] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-bold leading-tight">6Q超级爸妈</div>
          <div className="text-sm opacity-90 mt-0.5">App/小程序</div>
        </div>
        <nav className="flex gap-6 text-sm">
          <a href="#" className="border-b border-white/80 pb-0.5">修订记录</a>
          <a href="#" className="hover:opacity-90">项目背景</a>
          <a href="#" className="hover:opacity-90">系统原型(web)</a>
        </nav>
      </header>
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-[#333] mb-4">修订历史</h1>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#F2F2F2] text-[#333]">
              <tr>
                <th className="px-4 py-3 font-medium">版本</th>
                <th className="px-4 py-3 font-medium">日期</th>
                <th className="px-4 py-3 font-medium">说明</th>
              </tr>
            </thead>
            <tbody className="text-[#333]">
              <tr className="border-t border-gray-100"><td className="px-4 py-3">v3.0.0</td><td className="px-4 py-3">—</td><td className="px-4 py-3">—</td></tr>
              <tr className="border-t border-gray-100"><td className="px-4 py-3">v1.0.0</td><td className="px-4 py-3">—</td><td className="px-4 py-3">—</td></tr>
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Component;
