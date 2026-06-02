/**
 * @name 专属话题订单（v3.1.0）new
 */
import './style.css';
import React from 'react';

const Component = function ExclusiveOrders() {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-[#333366] text-white px-6 py-4 flex items-center justify-between">
        <div><div className="text-lg font-bold">6Q超级爸妈</div><div className="text-sm opacity-90">App/小程序</div></div>
        <nav className="flex gap-6 text-sm"><a href="#">修订记录</a><a href="#">项目背景</a><a href="#">系统原型(web)</a></nav>
      </header>
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-[#333] mb-4">专属话题订单</h1>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[1,2].map(i => (
            <div key={i} className="p-4 flex justify-between items-center">
              <div><div className="font-medium text-[#333]">订单</div><div className="text-sm text-gray-500">—</div></div>
              <span className="text-sm text-[#169BD5]">详情</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
export default Component;
