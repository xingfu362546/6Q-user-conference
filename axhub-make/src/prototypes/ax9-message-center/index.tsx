/**
 * @name 消息中心（v3.0.0） new
 *
 * 按 Axure 原型截图 1:1 还原：状态栏、标题「系统通知」、左侧分类（消息/评论/点赞）、
 * 右侧通知卡片列表、FAB 橙色加号、底部导航（首页/消息/我的）
 */
import './style.css';
import React, { useState } from 'react';

const LEFT_NAV = [
  { key: 'msg', label: '消息', unread: true },
  { key: 'comment', label: '评论', unread: true },
  { key: 'like', label: '点赞', unread: false },
];

const NOTIFY_CARDS = [
  { title: '【6Q社区活动】打卡活动正式开始', desc: '小Q邀请您参加调研,参与获取大礼!有机会获取大奖...', sender: '6Q社区小助手', time: '21小时前', unread: true },
  { title: '【6Q社区活动】打卡活动正式开始', desc: '小Q邀请您参加调研,参与获取大礼!有机会获取大奖...', sender: '6Q社区小助手', time: '02-07', unread: false },
  { title: '【6Q社区活动】打卡活动正式开始', desc: '小Q邀请您参加调研,参与获取大礼!有机会获取大奖...', sender: '6Q社区小助手', time: '2025-02-07', unread: false },
  { title: '【6Q社区活动】打卡活动正式开始', desc: '小Q邀请您参加调研,参与获取大礼!有机会获取大奖...', sender: '6Q社区小助手', time: '02-06', unread: false },
];

const Component = function MessageCenter() {
  const [fabExpanded, setFabExpanded] = useState(false);
  return (
    <div className="min-h-screen bg-white flex flex-col max-w-[375px] mx-auto shadow-lg">
      {/* 1. 状态栏 */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[11px] text-[#333]">
        <span>HD</span>
        <span className="flex items-center gap-1">5MB/s</span>
        <span className="flex items-center gap-1">100% 12:00</span>
      </div>

      {/* 2. 顶栏：左侧占位 + 标题「系统通知」+ 右侧三角 */}
      <header className="grid grid-cols-3 items-center px-3 py-3 border-b border-gray-200">
        <div className="w-8 h-8 rounded border border-gray-300 bg-gray-100 shrink-0" />
        <h1 className="text-[17px] font-bold text-[#333] text-center">系统通知</h1>
        <div className="w-6 h-6 border border-gray-300 flex items-center justify-center text-gray-500 shrink-0 justify-self-end">△</div>
      </header>

      {/* 3. 主体：左侧竖栏 + 右侧列表 */}
      <div className="flex flex-1 min-h-0">
        {/* 左侧导航：图标(左) + 消息/评论/点赞 + 橙点(未读) */}
        <aside className="w-[80px] shrink-0 border-r border-gray-200 bg-[#fafafa] py-4 flex flex-col gap-5">
          {LEFT_NAV.map((item) => (
            <div key={item.key} className="flex items-center gap-2 px-2">
              <div className="w-8 h-8 rounded bg-gray-200 shrink-0" />
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-[13px] text-[#333] truncate">{item.label}</span>
                {item.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#F59A23] shrink-0" />}
              </div>
            </div>
          ))}
        </aside>

        {/* 右侧：通知卡片列表（可滚动） */}
        <main className="flex-1 overflow-y-auto relative pb-16">
          <div className="p-3 space-y-3">
            {NOTIFY_CARDS.map((card, i) => (
              <article key={i} className="msg-center-card rounded-lg p-3">
                <div className="text-[14px] font-bold text-[#333] leading-tight">{card.title}</div>
                <p className="msg-desc text-[12px] text-[#666] mt-2 leading-[1.4]">{card.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[11px] text-[#999]">{card.sender}</span>
                  <span className="flex items-center gap-1 text-[11px] text-[#999]">
                    {card.unread && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                    {card.time}
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* FAB：右下角橙色加号，展开后 3 个圆形功能按钮沿加号左上方环绕，参考原型样式 */}
          <div className="fab-wrap">
            {fabExpanded && (
              <div className="fab-orbit">
                <button
                  type="button"
                  className="fab-item"
                  onClick={() => setFabExpanded(false)}
                >
                  <span className="fab-item-icon">📘</span>
                  <span className="fab-item-label">发想法</span>
                </button>
                <button
                  type="button"
                  className="fab-item"
                  onClick={() => setFabExpanded(false)}
                >
                  <span className="fab-item-icon">📘</span>
                  <span className="fab-item-label">提问题</span>
                </button>
                <button
                  type="button"
                  className="fab-item"
                  onClick={() => setFabExpanded(false)}
                >
                  <span className="fab-item-icon">📘</span>
                  <span className="fab-item-label">答问题</span>
                </button>
              </div>
            )}
            <button
              type="button"
              className={`fab-main ${fabExpanded ? 'fab-main-open' : ''}`}
              onClick={() => setFabExpanded((v) => !v)}
              aria-label={fabExpanded ? '收起' : '新建'}
            >
              +
            </button>
          </div>
        </main>
      </div>

      {/* 4. 底部导航：首页 | 消息 | 我的 */}
      <nav className="flex items-center justify-around py-2 px-4 border-t border-gray-200 bg-white">
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-6 h-6 border border-gray-300 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">X</div>
          <span className="text-[11px] text-[#333]">首页</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-6 h-6 border border-gray-300 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">X</div>
          <span className="text-[11px] text-[#333] font-medium">消息</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-6 h-6 border border-gray-300 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">X</div>
          <span className="text-[11px] text-[#333]">我的</span>
        </div>
      </nav>
    </div>
  );
};

export default Component;
