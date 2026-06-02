/**
 * @name OA外勤考勤（钉钉风格）
 */
import './style.css';
import React, { useMemo, useState } from 'react';

type PageKey =
  | 'employee-punch'
  | 'employee-month'
  | 'employee-abnormal'
  | 'hr-list'
  | 'hr-shift'
  | 'hr-export'
  | 'link-leave';

const tabs: Array<{ key: PageKey; label: string }> = [
  { key: 'employee-punch', label: '员工-打卡' },
  { key: 'employee-month', label: '员工-月考勤' },
  { key: 'employee-abnormal', label: '员工-异常详情' },
  { key: 'hr-list', label: 'HR-异常列表' },
  { key: 'hr-shift', label: 'HR-班次管理' },
  { key: 'hr-export', label: 'HR-月报导出' },
  { key: 'link-leave', label: '审批联动' },
];

const days = Array.from({ length: 30 }, (_, i) => i + 1);

const getInitialPage = (): PageKey => {
  if (typeof window === 'undefined') return 'employee-punch';
  const value = new URLSearchParams(window.location.search).get('page');
  const valid = tabs.some((tab) => tab.key === value);
  return (valid ? value : 'employee-punch') as PageKey;
};

const Component = function OADingdingAttendance() {
  const [page, setPage] = useState<PageKey>(getInitialPage);
  const [checkedOut, setCheckedOut] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [fixStatus, setFixStatus] = useState('');
  const [fixReason, setFixReason] = useState('');

  const monthlyStats = useMemo(
    () => ({ normal: 22, abnormal: 3, leave: 2, missing: 1 }),
    [],
  );

  return (
    <div className="dd-shell">
      <aside className="dd-sidebar">
        <div className="dd-logo">DING OA</div>
        <div className="dd-sub">外勤考勤管理原型</div>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`dd-nav ${page === tab.key ? 'active' : ''}`}
            onClick={() => setPage(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </aside>

      <main className="dd-main">
        <header className="dd-header">
          <div>
            <h1>OA考勤管理（钉钉风格）</h1>
            <p>优先目标：打卡 + 异常查看，HR直接修正，请假审批联动</p>
          </div>
          <span className="dd-badge">Axhub Make Prototype</span>
        </header>

        {page === 'employee-punch' && (
          <section className="dd-page">
            <div className="dd-grid2">
              <article className="dd-card">
                <h3>外勤打卡</h3>
                <div className="dd-row">
                  <span>班次</span>
                  <strong>外勤日班 09:00 - 18:00</strong>
                </div>
                <div className="dd-row">
                  <span>打卡点</span>
                  <span className="text-ok">上海市浦东新区张江路 188 号</span>
                </div>
                <div className="dd-actions">
                  <button className="btn-primary">签到 09:06</button>
                  <button className="btn-success" onClick={() => setCheckedOut(true)}>
                    {checkedOut ? '已签退 18:12' : '签退'}
                  </button>
                </div>
                <p className="dd-tip">仅记录打卡点，不记录轨迹，符合本期约束。</p>
              </article>
              <article className="dd-card">
                <h3>今日记录</h3>
                <table className="dd-table">
                  <thead>
                    <tr>
                      <th>类型</th>
                      <th>时间</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>签到</td>
                      <td>09:06</td>
                      <td>
                        <span className="chip ok">正常</span>
                      </td>
                    </tr>
                    <tr>
                      <td>签退</td>
                      <td>{checkedOut ? '18:12' : '--'}</td>
                      <td>
                        <span className={`chip ${checkedOut ? 'ok' : 'warn'}`}>
                          {checkedOut ? '正常' : '待完成'}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </article>
            </div>
          </section>
        )}

        {page === 'employee-month' && (
          <section className="dd-page">
            <article className="dd-card">
              <div className="dd-toolbar">
                <select><option>2026-04</option></select>
                <select><option>全部状态</option><option>异常</option></select>
                <button className="btn-ghost">筛选</button>
                <button className="btn-primary">导出Excel</button>
              </div>
              <div className="dd-stat-row">
                <span>正常 {monthlyStats.normal}</span>
                <span>异常 {monthlyStats.abnormal}</span>
                <span>请假 {monthlyStats.leave}</span>
                <span>缺卡 {monthlyStats.missing}</span>
              </div>
              <div className="dd-calendar">
                {days.map((day) => {
                  const status = day === 3 ? 'err' : day === 9 ? 'warn' : 'ok';
                  return (
                    <div className="day-box" key={day}>
                      <div>{day}</div>
                      <i className={`dot ${status}`} />
                    </div>
                  );
                })}
              </div>
            </article>
          </section>
        )}

        {page === 'employee-abnormal' && (
          <section className="dd-page">
            <article className="dd-card">
              <h3>异常详情</h3>
              <div className="dd-row"><span>异常类型</span><span className="chip err">缺卡</span></div>
              <div className="dd-row"><span>日期</span><span>2026-04-03</span></div>
              <div className="dd-row"><span>打卡点</span><span>上海市浦东新区张江路 188 号</span></div>
              <div className="dd-row"><span>处理状态</span><span className="chip warn">待HR处理</span></div>
              <textarea className="dd-textarea" placeholder="补充说明（可选）" />
              <button className="btn-primary">提交说明</button>
            </article>
          </section>
        )}

        {page === 'hr-list' && (
          <section className="dd-page">
            <article className="dd-card">
              <div className="dd-toolbar">
                <input placeholder="员工/部门" />
                <select><option>全部类型</option><option>缺卡</option></select>
                <select><option>全部状态</option><option>待处理</option></select>
                <button className="btn-ghost">筛选</button>
                <button className="btn-primary">批量导出</button>
              </div>
              <table className="dd-table">
                <thead>
                  <tr>
                    <th>员工</th><th>日期</th><th>异常</th><th>打卡点</th><th>状态</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>张三</td><td>2026-04-03</td><td>缺卡</td><td>张江路 188 号</td>
                    <td><span className="chip warn">待处理</span></td>
                    <td><button className="btn-warn" onClick={() => setModalOpen(true)}>直接修正</button></td>
                  </tr>
                </tbody>
              </table>
            </article>
          </section>
        )}

        {page === 'hr-shift' && (
          <section className="dd-page">
            <article className="dd-card">
              <div className="dd-toolbar">
                <button className="btn-primary">新增班次</button>
                <button className="btn-ghost">批量启停</button>
              </div>
              <table className="dd-table">
                <thead><tr><th>班次名</th><th>时间</th><th>容忍</th><th>状态</th><th>操作</th></tr></thead>
                <tbody>
                  <tr><td>外勤日班</td><td>09:00 - 18:00</td><td>15分钟</td><td>启用</td><td><button className="btn-ghost">编辑</button></td></tr>
                </tbody>
              </table>
            </article>
          </section>
        )}

        {page === 'hr-export' && (
          <section className="dd-page">
            <div className="dd-grid2">
              <article className="dd-card">
                <h3>月报导出</h3>
                <input placeholder="月份：2026-04" />
                <input placeholder="部门：华东大区" />
                <select><option>汇总</option><option>明细</option></select>
                <button className="btn-primary">生成Excel</button>
              </article>
              <article className="dd-card">
                <h3>导出任务</h3>
                <table className="dd-table">
                  <thead><tr><th>文件</th><th>状态</th><th>操作</th></tr></thead>
                  <tbody>
                    <tr><td>考勤月报_2026-04.xlsx</td><td>已完成</td><td><button className="btn-ghost">下载</button></td></tr>
                  </tbody>
                </table>
              </article>
            </div>
          </section>
        )}

        {page === 'link-leave' && (
          <section className="dd-page">
            <article className="dd-card">
              <h3>请假审批联动规则</h3>
              <table className="dd-table">
                <thead><tr><th>审批结果</th><th>考勤联动</th><th>说明</th></tr></thead>
                <tbody>
                  <tr><td>通过</td><td>标记请假</td><td>覆盖对应日期或时段</td></tr>
                  <tr><td>驳回</td><td>保留异常</td><td>进入异常池待HR处理</td></tr>
                  <tr><td>超时</td><td>重试队列</td><td>通知HR人工关注</td></tr>
                </tbody>
              </table>
            </article>
          </section>
        )}
      </main>

      {modalOpen && (
        <div className="dd-modal">
          <div className="dd-modal-box">
            <h3>HR直接修正</h3>
            <select value={fixStatus} onChange={(e) => setFixStatus(e.target.value)}>
              <option value="">请选择修正后状态</option>
              <option value="normal">正常</option>
              <option value="leave">请假</option>
              <option value="valid">外勤有效</option>
            </select>
            <textarea
              className="dd-textarea"
              placeholder="请输入修正原因（至少5字）"
              value={fixReason}
              onChange={(e) => setFixReason(e.target.value)}
            />
            <div className="dd-actions">
              <button className="btn-ghost" onClick={() => setModalOpen(false)}>取消</button>
              <button
                className="btn-primary"
                onClick={() => {
                  if (!fixStatus) return window.alert('请选择修正状态');
                  if (fixReason.trim().length < 5) return window.alert('修正原因至少5个字');
                  window.alert('修正成功，已同步员工端并记录审计日志');
                  setModalOpen(false);
                }}
              >
                提交修正
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Component;
