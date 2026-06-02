/**
 * @name 设置分组和权限（v3.1.0）
 */
import './style.css';
import React from 'react';

const Component = function TopicSettings() {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-[#333366] text-white px-6 py-4 flex items-center justify-between">
        <div><div className="text-lg font-bold">6Q超级爸妈</div><div className="text-sm opacity-90">App/小程序</div></div>
        <nav className="flex gap-6 text-sm"><a href="#">修订记录</a><a href="#">项目背景</a><a href="#">系统原型(web)</a></nav>
      </header>
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-[#333] mb-4">设置分组和权限</h1>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          <div className="p-4 flex justify-between items-center"><span className="text-sm text-[#333]">分组名称</span><input type="text" className="border rounded px-2 py-1 text-sm w-40" placeholder="—" /></div>
          <div className="p-4 flex justify-between items-center"><span className="text-sm text-[#333]">权限</span><select className="border rounded px-2 py-1 text-sm"><option>仅成员</option></select></div>
        </div>
      </main>
    </div>
  );
};
export default Component;
