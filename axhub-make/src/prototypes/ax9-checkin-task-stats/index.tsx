/**
 * @name 打卡任务统计（v3.0.0）
 */
import './style.css';
import React from 'react';

const Component = function CheckinTaskStats() {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-[#333366] text-white px-6 py-4 flex items-center justify-between">
        <div><div className="text-lg font-bold">6Q超级爸妈</div><div className="text-sm opacity-90">App/小程序</div></div>
        <nav className="flex gap-6 text-sm"><a href="#">修订记录</a><a href="#">项目背景</a><a href="#">系统原型(web)</a></nav>
      </header>
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-[#333] mb-4">打卡任务统计</h1>
        <div className="grid grid-cols-2 gap-4">
          {['完成数','参与人数'].map((label,i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-[#169BD5]">—</div>
              <div className="text-sm text-gray-600 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
export default Component;
