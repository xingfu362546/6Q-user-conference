/**
 * @name 发布页（v1.0.0）
 */
import './style.css';
import React from 'react';

const Component = function PublishV1() {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-[#333366] text-white px-6 py-4 flex items-center justify-between">
        <div><div className="text-lg font-bold">6Q超级爸妈</div><div className="text-sm opacity-90">App/小程序</div></div>
        <nav className="flex gap-6 text-sm"><a href="#">修订记录</a><a href="#">项目背景</a><a href="#">系统原型(web)</a></nav>
      </header>
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-bold text-[#333] mb-4">发布</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <textarea className="w-full min-h-[120px] p-3 border border-gray-200 rounded-lg text-sm text-[#333] placeholder-gray-400" placeholder="输入内容..." />
          <div className="mt-4 flex justify-end"><button className="px-4 py-2 bg-[#169BD5] text-white rounded-lg text-sm">发布</button></div>
        </div>
      </main>
    </div>
  );
};
export default Component;
