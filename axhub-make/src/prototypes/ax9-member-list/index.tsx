/**
 * @name 成员列表管理（v3.1.0）
 */
import './style.css';
import React from 'react';

const Component = function MemberList() {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-[#333366] text-white px-6 py-4 flex items-center justify-between">
        <div><div className="text-lg font-bold">6Q超级爸妈</div><div className="text-sm opacity-90">App/小程序</div></div>
        <nav className="flex gap-6 text-sm"><a href="#">修订记录</a><a href="#">项目背景</a><a href="#">系统原型(web)</a></nav>
      </header>
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-[#333] mb-4">成员列表管理</h1>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[1,2,3].map(i => (
            <div key={i} className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E0E0E0]" />
              <div className="flex-1"><div className="font-medium text-[#333]">成员</div><div className="text-sm text-gray-500">—</div></div>
              <button className="text-sm text-[#169BD5]">管理</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
export default Component;
