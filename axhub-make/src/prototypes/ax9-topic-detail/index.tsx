/**
 * @name 话题详情页（v3.0.0）
 */
import './style.css';
import React from 'react';

const Component = function TopicDetail() {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-[#333366] text-white px-6 py-4 flex items-center justify-between">
        <div><div className="text-lg font-bold">6Q超级爸妈</div><div className="text-sm opacity-90">App/小程序</div></div>
        <nav className="flex gap-6 text-sm"><a href="#">修订记录</a><a href="#">项目背景</a><a href="#">系统原型(web)</a></nav>
      </header>
      <main className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="h-32 bg-[#E0E0E0]" />
          <div className="p-4">
            <h1 className="text-xl font-bold text-[#333]">话题名称</h1>
            <p className="text-sm text-gray-600 mt-2">话题简介与描述...</p>
            <div className="mt-4 flex gap-2"><button className="px-4 py-2 bg-[#169BD5] text-white rounded-lg text-sm">加入</button><button className="px-4 py-2 border rounded-lg text-sm">成员</button></div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Component;
