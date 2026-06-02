/**
 * @name 话题广场页-我参与的（v3.0.0）
 */
import './style.css';
import React from 'react';

const Component = function TopicSquareMine() {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-[#333366] text-white px-6 py-4 flex items-center justify-between">
        <div><div className="text-lg font-bold">6Q超级爸妈</div><div className="text-sm opacity-90">App/小程序</div></div>
        <nav className="flex gap-6 text-sm"><a href="#">修订记录</a><a href="#">项目背景</a><a href="#">系统原型(web)</a></nav>
      </header>
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-[#333] mb-4">话题广场 · 我参与的</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1,2].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="font-medium text-[#333]">我参与的话题</div>
              <div className="text-sm text-gray-500 mt-1">—</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
export default Component;
