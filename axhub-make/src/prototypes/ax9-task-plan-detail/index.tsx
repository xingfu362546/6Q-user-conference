/**
 * @name 计划详情（打卡计划）admin（v3.1.0）
 */
import './style.css';
import React, { useMemo, useState } from 'react';

type TabKey = 'basic' | 'topics' | 'stats';

const PLAN = {
  id: 'PD000000005',
  name: '十月打卡计划',
  periodStart: '2023.10.01 00:00:00',
  periodEnd: '2023.10.31 23:59:59',
  remark: '配合 6Q 社区十月主题营，供话题打卡配置引用',
  createdAt: '2023.01.01 20:00:00',
  creator: '后台管理员',
  status: '进行中' as const,
};

const LINKED_TOPICS = [
  {
    id: 'TP000000128',
    name: '十月亲子沟通打卡营',
    linkedAt: '2023.09.15 14:30:00',
    status: '已发布',
  },
  {
    id: 'TP000000131',
    name: '好习惯养成 21 天',
    linkedAt: '2023.09.20 09:12:00',
    status: '已发布',
  },
];

type TaskTypeKind = '打卡类型' | '授课类型';

/** 关联话题下的用户打卡/授课提交明细（字段对齐话题「打卡配置」任务表） */
const CHECKIN_RECORDS: {
  id: string;
  topicId: string;
  topicName: string;
  taskTitle: string;
  taskType: TaskTypeKind;
  taskDetail: string;
  taskTimeRange: string;
  checkinSubType: string;
  teachingProduct: string;
  target: string;
  execGroup: string;
  userName: string;
  userId: string;
  submittedAt: string;
  voice: string;
  visibility: string;
  hasAttachment: string;
}[] = [
  {
    id: 'CK20231008001',
    topicId: 'TP000000128',
    topicName: '十月亲子沟通打卡营',
    taskTitle: '打卡任务1',
    taskType: '打卡类型',
    taskDetail: '完成今日亲子共读并上传视频',
    taskTimeRange: '2023.10.01 — 2023.10.15（共 15 天）',
    checkinSubType: '视频打卡',
    teachingProduct: '—',
    target: '15 天',
    execGroup: '默认组',
    userName: '张妈妈',
    userId: 'U100286',
    submittedAt: '2023.10.08 07:32:15',
    voice: '已上传',
    visibility: '全员可见',
    hasAttachment: '有',
  },
  {
    id: 'CK20231008002',
    topicId: 'TP000000128',
    topicName: '十月亲子沟通打卡营',
    taskTitle: '打卡任务2',
    taskType: '授课类型',
    taskDetail: '参加指定产品线下授课并完成签到',
    taskTimeRange: '2023.10.16 — 2023.10.31（共 16 天）',
    checkinSubType: '—',
    teachingProduct: '测试ABC',
    target: '1 次',
    execGroup: '进阶组',
    userName: '刘先生',
    userId: 'U100401',
    submittedAt: '2023.10.08 14:20:00',
    voice: '—',
    visibility: '—',
    hasAttachment: '无',
  },
  {
    id: 'CK20231007003',
    topicId: 'TP000000128',
    topicName: '十月亲子沟通打卡营',
    taskTitle: '打卡任务1',
    taskType: '打卡类型',
    taskDetail: '亲子游戏互动记录',
    taskTimeRange: '2023.10.01 — 2023.10.15（共 15 天）',
    checkinSubType: '图文打卡',
    teachingProduct: '—',
    target: '15 天',
    execGroup: '默认组',
    userName: '王同学',
    userId: 'U100903',
    submittedAt: '2023.10.07 21:15:02',
    voice: '未上传',
    visibility: '组员可见',
    hasAttachment: '无',
  },
  {
    id: 'CK20231007004',
    topicId: 'TP000000131',
    topicName: '好习惯养成 21 天',
    taskTitle: '晨读打卡',
    taskType: '打卡类型',
    taskDetail: '晨读第 8 天朗读打卡',
    taskTimeRange: '2023.10.01 — 2023.10.21（共 21 天）',
    checkinSubType: '每日打卡',
    teachingProduct: '—',
    target: '21 天',
    execGroup: 'A 组',
    userName: '陈女士',
    userId: 'U100118',
    submittedAt: '2023.10.07 07:05:33',
    voice: '—',
    visibility: '仅自己可见',
    hasAttachment: '有',
  },
  {
    id: 'CK20231006005',
    topicId: 'TP000000128',
    topicName: '十月亲子沟通打卡营',
    taskTitle: '打卡任务1',
    taskType: '打卡类型',
    taskDetail: '周末家庭活动打卡',
    taskTimeRange: '2023.10.01 — 2023.10.15（共 15 天）',
    checkinSubType: '视频打卡',
    teachingProduct: '—',
    target: '15 天',
    execGroup: '默认组',
    userName: '赵爸爸',
    userId: 'U100667',
    submittedAt: '2023.10.06 19:42:18',
    voice: '已上传',
    visibility: '全员可见',
    hasAttachment: '无',
  },
];

const EXPORT_HEADERS = [
  '所属话题',
  '任务标题',
  '任务类型',
  '任务详情',
  '任务时间范围',
  '打卡类型',
  '授课产品',
  '目标打卡天数/次数',
  '执行群体',
  '用户',
  '用户ID',
  '提交时间',
  '语音',
  '打卡内容可见',
  '附件',
] as const;

function exportRecordsCsv(rows: typeof CHECKIN_RECORDS) {
  if (!rows.length) {
    window.alert('当前筛选条件下没有可导出的数据');
    return;
  }
  const esc = (text: string) => {
    const s = (text || '').replace(/"/g, '""');
    return /[",\n\r]/.test(s) ? `"${s}"` : s;
  };
  const lines = [
    EXPORT_HEADERS.join(','),
    ...rows.map((r) =>
      [
        r.topicName,
        r.taskTitle,
        r.taskType,
        r.taskDetail,
        r.taskTimeRange,
        r.checkinSubType,
        r.teachingProduct,
        r.target,
        r.execGroup,
        r.userName,
        r.userId,
        r.submittedAt,
        r.voice,
        r.visibility,
        r.hasAttachment,
      ]
        .map(esc)
        .join(','),
    ),
  ];
  const blob = new Blob(['\ufeff' + lines.join('\r\n')], {
    type: 'text/csv;charset=utf-8',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `打卡明细_${PLAN.id}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'basic', label: '基础信息' },
  { key: 'topics', label: '关联话题' },
  { key: 'stats', label: '打卡统计' },
];

function StatusTag({ status }: { status: string }) {
  const cls =
    status === '进行中' || status === '已发布' || status === '已通过'
      ? 'plan-detail__tag plan-detail__tag--processing'
      : status === '待审核'
        ? 'plan-detail__tag plan-detail__tag--warning'
        : status === '已驳回'
          ? 'plan-detail__tag plan-detail__tag--danger'
          : 'plan-detail__tag plan-detail__tag--default';
  return <span className={cls}>{status}</span>;
}

function BasicPanel() {
  return (
    <dl className="plan-detail__desc">
      <dt>计划编号</dt>
      <dd>{PLAN.id}</dd>
      <dt>计划名称</dt>
      <dd>{PLAN.name}</dd>
      <dt>周期计划</dt>
      <dd>
        {PLAN.periodStart} → {PLAN.periodEnd}
      </dd>
      <dt>备注</dt>
      <dd>{PLAN.remark || '—'}</dd>
      <dt>创建时间</dt>
      <dd>{PLAN.createdAt}</dd>
      <dt>创建人</dt>
      <dd>{PLAN.creator}</dd>
      <dt>计划状态</dt>
      <dd>
        <StatusTag status={PLAN.status} />
      </dd>
    </dl>
  );
}

function TopicsPanel() {
  return (
    <>
      <p className="plan-detail__muted plan-detail__note">
        展示在「话题编辑 → 打卡配置」中选择了本计划的话题。本页不支持解除关联，请前往对应话题编辑页修改打卡计划。
      </p>
      <div className="plan-detail__table-wrap">
        <table className="plan-detail__table">
          <thead>
            <tr>
              <th>话题编号</th>
              <th>话题名称</th>
              <th>关联时间</th>
              <th>话题状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {LINKED_TOPICS.map((row) => (
              <tr key={row.id}>
                <td>{row.id}</td>
                <td>{row.name}</td>
                <td>{row.linkedAt}</td>
                <td>
                  <StatusTag status={row.status} />
                </td>
                <td>
                  <button type="button" className="plan-detail__link">
                    查看话题
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function StatsPanel() {
  const [topicFilter, setTopicFilter] = useState('all');
  const [taskTypeFilter, setTaskTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    return CHECKIN_RECORDS.filter((row) => {
      if (topicFilter !== 'all' && row.topicId !== topicFilter) return false;
      if (taskTypeFilter !== 'all' && row.taskType !== taskTypeFilter) return false;
      return true;
    });
  }, [topicFilter, taskTypeFilter]);

  return (
    <>
      <p className="plan-detail__muted plan-detail__note">
        汇总关联话题下的提交明细，列字段与话题「打卡配置」任务表对齐。任务类型仅分「打卡类型」「授课类型」；授课类型无打卡子类型/周几/次数限制/语音/可见设置（显示 —）。
      </p>

      <div className="plan-detail__filter">
        <label htmlFor="topic-filter">所属话题</label>
        <select
          id="topic-filter"
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
        >
          <option value="all">全部话题</option>
          {LINKED_TOPICS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>

        <label htmlFor="task-type-filter">任务类型</label>
        <select
          id="task-type-filter"
          value={taskTypeFilter}
          onChange={(e) => setTaskTypeFilter(e.target.value)}
        >
          <option value="all">全部</option>
          <option value="打卡类型">打卡类型</option>
          <option value="授课类型">授课类型</option>
        </select>

        <span className="plan-detail__muted">共 {filtered.length} 条明细</span>
        <button
          type="button"
          className="plan-detail__btn-export"
          onClick={() => exportRecordsCsv(filtered)}
        >
          导出
        </button>
      </div>

      <div className="plan-detail__table-wrap">
        <table className="plan-detail__table">
          <thead>
            <tr>
              <th>所属话题</th>
              <th>任务标题</th>
              <th>任务类型</th>
              <th>任务详情</th>
              <th>任务时间范围</th>
              <th>打卡类型</th>
              <th>授课产品</th>
              <th>目标打卡天数/次数</th>
              <th>执行群体</th>
              <th>用户</th>
              <th>用户ID</th>
              <th>提交时间</th>
              <th>语音</th>
              <th>打卡内容可见</th>
              <th>附件</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={15} className="plan-detail__empty-cell">
                  暂无打卡明细
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id}>
                  <td>{row.topicName}</td>
                  <td>{row.taskTitle}</td>
                  <td>{row.taskType}</td>
                  <td className="plan-detail__cell-wrap">{row.taskDetail}</td>
                  <td>{row.taskTimeRange}</td>
                  <td>{row.checkinSubType}</td>
                  <td>{row.teachingProduct}</td>
                  <td>{row.target}</td>
                  <td>{row.execGroup}</td>
                  <td>{row.userName}</td>
                  <td>{row.userId}</td>
                  <td>{row.submittedAt}</td>
                  <td>{row.voice}</td>
                  <td>{row.visibility}</td>
                  <td>{row.hasAttachment}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

const Component = function TaskPlanDetail() {
  const [tab, setTab] = useState<TabKey>('basic');

  return (
    <div className="plan-detail">
      <h1 className="plan-detail__title">计划详情</h1>

      <div className="plan-detail__tabs" role="tablist" aria-label="计划详情">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className={
              tab === t.key
                ? 'plan-detail__tab plan-detail__tab--active'
                : 'plan-detail__tab'
            }
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="plan-detail__body">
        <div className="plan-detail__panel" role="tabpanel">
          {tab === 'basic' && <BasicPanel />}
          {tab === 'topics' && <TopicsPanel />}
          {tab === 'stats' && <StatsPanel />}
        </div>
      </div>
    </div>
  );
};

export default Component;
