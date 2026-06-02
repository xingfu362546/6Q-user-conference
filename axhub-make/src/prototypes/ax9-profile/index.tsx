/**
 * @name 个人中心页（v3.0.0）
 */
import './style.css';
import React from 'react';

const Component = function Profile() {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-[#333366] text-white px-6 py-4 flex items-center justify-between">
        <div><div className="text-lg font-bold">6Q超级爸妈</div><div className="text-sm opacity-90">App/小程序</div></div>
        <nav className="flex gap-6 text-sm"><a href="#">修订记录</a><a href="#">项目背景</a><a href="#">系统原型(web)</a></nav>
      </header>
      <main className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-[#E0E0E0] mb-4" />
          <h2 className="text-lg font-bold text-[#333]">用户昵称</h2>
          <p className="text-sm text-gray-500 mt-1">—</p>
          <div className="mt-6 w-full space-y-2">
            <a href="#" className="block p-3 border rounded-lg text-sm text-[#333]">个人信息编辑</a>
            <a href="#" className="block p-3 border rounded-lg text-sm text-[#333]">专属话题订单</a>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Component;
