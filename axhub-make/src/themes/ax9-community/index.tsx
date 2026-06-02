/**
 * @name Ax9 Community 主题
 *
 * 基于 Axure 原型 axhub.im/ax9/5f9ba66c12c9c6b4 提取的社区 APP 设计 token 演示
 */

import './globals.css';
import React from 'react';

const containerStyle: React.CSSProperties = {
  maxWidth: 720,
  margin: '0 auto',
  padding: '24px 20px',
};

const sectionStyle: React.CSSProperties = {
  padding: '32px 0',
  borderBottom: '1px solid var(--border-subtle)',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: 'var(--foreground)',
  marginBottom: '16px',
};

function ColorSwatch({ name, value, hex }: { name: string; value: string; hex: string }) {
  return (
    <div style={{ textAlign: 'left' }}>
      <div
        style={{
          width: '80px',
          height: '56px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: value,
          border: '1px solid var(--border-subtle)',
          marginBottom: '8px',
        }}
      />
      <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--foreground)' }}>{name}</div>
      <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{hex}</div>
    </div>
  );
}

const Component: React.FC = () => {
  const colors = [
    { name: '主色', value: 'var(--primary)', hex: '#169BD5' },
    { name: '背景', value: 'var(--background)', hex: '#F0F2F5' },
    { name: '前景', value: 'var(--foreground)', hex: '#333333' },
    { name: '强调', value: 'var(--accent)', hex: '#F59A23' },
    { name: '辅助', value: 'var(--accent-secondary)', hex: '#5F51FB' },
  ];

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'var(--background)',
        color: 'var(--foreground)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      <header style={{ borderBottom: '1px solid var(--border-subtle)', padding: '20px 0' }}>
        <div style={containerStyle}>
          <div style={{ fontSize: '16px', fontWeight: 700 }}>Ax9 Community</div>
          <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>
            设计 Token 演示 · 源自 Axure 原型
          </div>
        </div>
      </header>

      <div style={containerStyle}>
        <section style={sectionStyle}>
          <div style={sectionTitleStyle}>色彩</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {colors.map((c) => (
              <ColorSwatch key={c.name} name={c.name} value={c.value} hex={c.hex} />
            ))}
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionTitleStyle}>排版</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700 }}>标题 18px / 700</div>
            <div style={{ fontSize: '16px', fontWeight: 700 }}>小标题 16px / 700</div>
            <div style={{ fontSize: '14px', fontWeight: 400 }}>正文 14px / 400</div>
            <div style={{ fontSize: '13px', fontWeight: 400 }}>正文 13px / 400</div>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>辅助 12px</div>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionTitleStyle}>圆角与按钮</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <button
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary)',
                color: 'var(--primary-foreground)',
                border: 'none',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              主按钮
            </button>
            <button
              style={{
                padding: '10px 20px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--accent)',
                color: 'var(--foreground)',
                border: 'none',
                fontSize: '14px',
              }}
            >
              圆角按钮
            </button>
            <div
              style={{
                padding: '16px 24px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--card)',
                boxShadow: 'var(--shadow-sm)',
                fontSize: '13px',
              }}
            >
              卡片 10px 圆角
            </div>
          </div>
        </section>

        <section style={{ padding: '32px 0' }}>
          <div style={sectionTitleStyle}>间距尺度</div>
          <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>
            2px · 8px · 10px · 20px · 35px
          </div>
        </section>
      </div>
    </main>
  );
};

export default Component;
