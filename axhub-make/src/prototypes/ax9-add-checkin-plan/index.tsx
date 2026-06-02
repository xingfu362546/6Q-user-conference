/**
 * @name 新增打卡计划（v3.1.0）
 */
import './style.css';
import React from 'react';

const Component = function AddCheckinPlan() {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-[#333366] text-white px-6 py-4 flex items-center justify-between">
        <div><div className="text-lg font-bold">6Q超级爸妈</div><div className="text-sm opacity-90">App/小程序</div></div>
        <nav className="flex gap-6 text-sm"><a href="#">修订记录</a><a href="#">项目背景</a><a href="#">系统原型(web)</a></nav>
      </header>
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-[#333] mb-4">新增打卡计划</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div><label className="text-sm text-gray-600">计划名称</label><input type="text" className="mt-1 w-full border rounded px-3 py-2 text-sm" placeholder="—" /></div>
          <div><label className="text-sm text-gray-600">时间</label><input type="text" className="mt-1 w-full border rounded px-3 py-2 text-sm" placeholder="—" /></div>
          <button className="w-full py-2 bg-[#169BD5] text-white rounded-lg text-sm">创建</button>
        </div>
      </main>
    </div>
  );
};
export default Component;
