/**
 * @name 6Q超级爸妈 - 项目首页
 *
 * Axure 原型 index 页还原：顶部导航 + 内容区
 */

import './style.css';
import React from 'react';

const Component = function Ax9Index() {
  return (
    <div className="min-h-screen bg-[#F0F2F5]">
      <header className="bg-[#333366] text-white px-6 py-4 flex items-center justify-between">
        <div>
          <div className="text-lg font-bold leading-tight">6Q超级爸妈</div>
          <div className="text-sm opacity-90 mt-0.5">App/小程序</div>
        </div>
        <nav className="flex gap-6 text-sm">
          <a href="#" className="border-b border-white/80 pb-0.5">修订记录</a>
          <a href="#" className="hover:opacity-90">项目背景</a>
          <a href="#" className="hover:opacity-90">系统原型(web)</a>
        </nav>
      </header>
      <main className="flex-1 min-h-[calc(100vh-80px)] bg-[#F0F2F5]" />
    </div>
  );
};

export default Component;
