/** 仅保留 v3.3.1 版本页面：页面名含 v3.3.1，或位于 v3.3.1 模块下且无其它版本号子页 */
export function isV331Page(p) {
  const name = p.pageName || '';
  const trail = p.trail || '';
  if (/v3\.3\.1|v3_3_1/i.test(name)) return true;
  if (/v3\.3\.1|v3_3_1/i.test(trail)) {
    if (/v\d+\.\d+/i.test(name) || /v\d+_\d+/i.test(name)) {
      return /v3\.3\.1|v3_3_1/i.test(name);
    }
    return true;
  }
  return false;
}

export function filterPages(pages) {
  return pages.filter(isV331Page);
}
