/**
 * @name 功能清单(v3.0.0)
 */
import './style.css';
import React from 'react';

const Component = function FeatureList() {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-[#333366] text-white px-6 py-4 flex items-center justify-between">
        <div><div className="text-lg font-bold">6Q超级爸妈</div><div className="text-sm opacity-90">App/小程序</div></div>
        <nav className="flex gap-6 text-sm">
          <a href="#">修订记录</a><a href="#">项目背景</a><a href="#" className="border-b border-white/80">系统原型(web)</a>
        </nav>
      </header>
      <main className="p-6 max-w-4xl mx-auto">
        <h1 className="text-xl font-bold text-[#333] mb-4">功能清单 (v3.0.0)</h1>
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-2 text-sm text-[#333]">
          <p>· 消息中心 · 发布 · 话题 · 个人中心 · 打卡任务 · 专属话题</p>
        </div>
      </main>
    </div>
  );
};
export default Component;
