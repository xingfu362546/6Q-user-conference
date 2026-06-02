/**
 * @name 编辑中途退出（v3.0.0）
 */
import './style.css';
import React from 'react';

const Component = function EditExit() {
  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-sm w-full shadow-lg">
        <h2 className="text-lg font-bold text-[#333] mb-2">确认退出</h2>
        <p className="text-sm text-gray-600 mb-6">当前内容未保存，确定要退出吗？</p>
        <div className="flex gap-3">
          <button className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-[#333]">取消</button>
          <button className="flex-1 py-2 bg-[#169BD5] text-white rounded-lg text-sm">确定退出</button>
        </div>
      </div>
    </div>
  );
};
export default Component;
