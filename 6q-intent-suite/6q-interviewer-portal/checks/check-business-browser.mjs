import assert from "node:assert/strict";

// 使用已启动的本地静态服务与无头 Chrome，检查实际 DOM 与交互状态。
const service = process.env.PORTAL_CHECK_URL || "http://127.0.0.1:8097/6q-intent-suite/6q-interviewer-portal/";
const debug = process.env.PORTAL_CHROME_DEBUG || "http://127.0.0.1:9337";
const targets = await (await fetch(debug + "/json/list")).json();
const target = targets.find((item) => item.type === "page");
assert.ok(target, "需要一个 Chrome 调试页面");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let sequence = 0;
const pending = new Map();
const errors = [];
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails.text);
  if (message.id && pending.has(message.id)) { const entry = pending.get(message.id); pending.delete(message.id); message.error ? entry.reject(new Error(JSON.stringify(message.error))) : entry.resolve(message.result); }
});
function cdp(method, params = {}) { return new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); }); }
async function evaluate(expression) { const result = await cdp("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails)); return result.result.value; }
async function navigate(page) {
  await cdp("Page.navigate", { url: service + page });
  await evaluate('new Promise(resolve => { function ready(){ if(document.readyState === "complete" && document.querySelector("#business-tbody")) resolve(true); else requestAnimationFrame(ready); } ready(); })');
}
try {
  await cdp("Page.enable"); await cdp("Runtime.enable");
  await cdp("Page.addScriptToEvaluateOnNewDocument", { source: 'localStorage.setItem("6q_iv_session", JSON.stringify({userId:"iv_demo",displayName:"张三",roles:["助教"]})); localStorage.setItem("6q_iv_conference", JSON.stringify({id:"browser-check",title:"会务交互核验",periodLabel:"本期",city:"广州",status:"ongoing",startTime:"2026-11-16 09:00",endTime:"2026-11-18 18:00",address:"广州 · 会务中心"}));' });
  const results = [];
  for (const tab of ["students", "qa", "interview", "followup", "survey"]) {
    await navigate(tab === "students" ? "students.html" : "tab-placeholder.html?tab=" + tab);
    const state = await evaluate(`(() => { const root=document.querySelector("#portal-business"), wrap=root.querySelector(".intent-table-wrap"), rect=root.getBoundingClientRect(); return {tab:${JSON.stringify(tab)},headers:[...root.querySelectorAll("thead th")].map(x=>x.textContent),rows:root.querySelectorAll("tbody tr").length,iframes:document.querySelectorAll("iframe").length,notes:!!document.querySelector(".iv-business-notes-button"),overflow:getComputedStyle(wrap).overflowX,width:rect.width,scale:getComputedStyle(root).transform}; })()`);
    assert.equal(state.iframes, 0); assert.ok(state.rows >= 1); assert.equal(state.overflow, "auto"); assert.equal(state.scale, "none"); assert.equal(state.notes, true);
    results.push(state);
    const stable = await evaluate(`(() => {
      const root=document.querySelector("#portal-business"), input=root.querySelector("input[type=search]"), wrap=root.querySelector(".intent-table-wrap"); input.value="保留输入"; wrap.scrollLeft=120;
      const before=JSON.stringify(root.getBoundingClientRect().toJSON()), scroll=wrap.scrollLeft; const button=document.querySelector(".iv-business-notes-button"); button.click();
      const handle=document.querySelector(".iv-business-notes__resize"); handle.dispatchEvent(new KeyboardEvent("keydown",{key:"ArrowLeft",bubbles:true}));
      const expanded=button.getAttribute("aria-expanded"), unchanged=before===JSON.stringify(root.getBoundingClientRect().toJSON());
      document.body.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true})); const outsideEsc=!document.querySelector(".iv-business-notes").hidden;
      handle.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape",bubbles:true}));
      return {unchanged,input:input.value,scroll:wrap.scrollLeft===scroll,expanded,outsideEsc,closed:document.querySelector(".iv-business-notes").hidden,focus:document.activeElement===button};
    })()`);
    assert.deepEqual(stable, { unchanged: true, input: "保留输入", scroll: true, expanded: "true", outsideEsc: true, closed: true, focus: true });
  }
  await navigate("tab-placeholder.html?tab=qa");
  const interactions = await evaluate(`(() => {
    const root=document.querySelector("#portal-business"), input=root.querySelector('[data-field="学员"]'); input.value="张三"; input.dispatchEvent(new Event("input",{bubbles:true})); const filtered=root.querySelectorAll("tbody tr").length===1;
    input.value=""; input.dispatchEvent(new Event("input",{bubbles:true})); root.querySelector('[data-action="edit"]').click();
    const dialog=document.querySelector(".iv-business__dialog"), content=dialog.querySelector("textarea"); content.value="浏览器测试跟进内容"; content.dispatchEvent(new Event("input",{bubbles:true}));
    const custom=dialog.querySelector("#business-custom-tag"); custom.value="测试标签"; dialog.querySelector("[data-add-tag]").click();
    const businessBefore=JSON.stringify(root.getBoundingClientRect().toJSON()), button=document.querySelector(".iv-business-notes-button"); button.click();
    const preserved=dialog.open&&content.value==="浏览器测试跟进内容"&&dialog.querySelector("#business-selected-tags").textContent.includes("测试标签")&&JSON.stringify(root.getBoundingClientRect().toJSON())===businessBefore;
    document.querySelector(".iv-business-notes__close").click(); dialog.querySelector("form").requestSubmit();
    const saved=root.textContent.includes("浏览器测试跟进内容")&&root.textContent.includes("测试标签");
    return {filtered,preserved,saved,closed:!dialog.open};
  })()`);
  assert.deepEqual(interactions, { filtered: true, preserved: true, saved: true, closed: true });
  await cdp("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await navigate("tab-placeholder.html?tab=interview");
  const dragBefore = await evaluate('(() => { document.querySelector(".iv-business-notes-button").click(); const root=document.querySelector("#portal-business"), handle=document.querySelector(".iv-business-notes__resize"), r=handle.getBoundingClientRect(); return {root:JSON.stringify(root.getBoundingClientRect().toJSON()),width:document.querySelector(".iv-business-notes").getBoundingClientRect().width,x:r.x+r.width/2,y:r.y+40}; })()');
  await cdp("Input.dispatchMouseEvent", { type: "mousePressed", x: dragBefore.x, y: dragBefore.y, button: "left", clickCount: 1 });
  await cdp("Input.dispatchMouseEvent", { type: "mouseMoved", x: dragBefore.x - 120, y: dragBefore.y, button: "left", buttons: 1 });
  await cdp("Input.dispatchMouseEvent", { type: "mouseReleased", x: dragBefore.x - 120, y: dragBefore.y, button: "left", clickCount: 1 });
  const dragAfter = await evaluate('({root:JSON.stringify(document.querySelector("#portal-business").getBoundingClientRect().toJSON()),width:document.querySelector(".iv-business-notes").getBoundingClientRect().width})');
  assert.equal(dragAfter.root, dragBefore.root); assert.ok(dragAfter.width > dragBefore.width + 100);
  await cdp("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await navigate("students.html");
  const narrow = await evaluate(`(() => {const root=document.querySelector("#portal-business"), before=JSON.stringify(root.getBoundingClientRect().toJSON()); document.querySelector(".iv-business-notes-button").click(); const panel=document.querySelector(".iv-business-notes").getBoundingClientRect(); return {viewport:innerWidth,document:document.documentElement.scrollWidth,panel:panel.width,stable:before===JSON.stringify(root.getBoundingClientRect().toJSON())};})()`);
  assert.equal(narrow.stable, true); assert.ok(narrow.panel <= narrow.viewport); assert.equal(narrow.document, narrow.viewport);
  const disclosure = [];
  for (const width of [1440, 900, 390]) {
    await cdp("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width === 390 });
    for (const tab of ["students", "qa", "interview", "followup", "survey"]) {
      await navigate(tab === "students" ? "students.html" : "tab-placeholder.html?tab=" + tab);
      const state = await evaluate(`new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>{const form=document.querySelector('.iv-business__filters'), fields=[...form.querySelectorAll('.iv-business__field')], toggle=form.querySelector('.iv-filter-toggle'); const collapsed=fields.filter(x=>x.hidden).length; const input=fields.at(-1).querySelector('input,select'); const expected=input.tagName==='SELECT'?input.options[1]?.value||'':'保留条件'; input.value=expected; if(!toggle.hidden)toggle.click(); const shown=fields.every(x=>!x.hidden); if(!toggle.hidden)toggle.click(); const kept=input.value===expected; const tools=[...form.querySelectorAll('button')].filter(x=>!x.hidden); const accessible=tools.every(x=>{const r=x.getBoundingClientRect();return r.width>0&&r.left>=0&&r.right<=innerWidth}); resolve({tab:${JSON.stringify(tab)},width:innerWidth,collapsed,shown,kept,accessible,toggle:!toggle.hidden,oneRow:new Set(fields.filter(x=>!x.hidden).map(x=>x.offsetTop)).size<=1,overflow:document.documentElement.scrollWidth>innerWidth});})))`);
      assert.equal(state.shown,true); assert.equal(state.kept,true); assert.equal(state.accessible,true); assert.equal(state.oneRow,true); assert.equal(state.overflow,false); assert.equal(state.toggle,state.collapsed>0); disclosure.push(state);
    }
  }
  await navigate('students.html');
  const exported=await evaluate(`(async()=>{const buttons=[...document.querySelectorAll('[data-action="export"]')];let blob,filename;const create=URL.createObjectURL,click=HTMLAnchorElement.prototype.click;URL.createObjectURL=b=>{blob=b;return 'blob:demo-export'};HTMLAnchorElement.prototype.click=function(){filename=this.download};buttons[0].click();URL.createObjectURL=create;HTMLAnchorElement.prototype.click=click;return {count:buttons.length,legacy:!!document.querySelector('[data-action="export-site"]'),filename,csv:await blob.text()};})()`);
  assert.equal(exported.count,1);assert.equal(exported.legacy,false);assert.ok(exported.filename.includes('学员信息'));for(const field of ['学员ID','领袖营资格数','通用资格数','二阶资格数','亲密关系工作坊资格数','会务跟进','答疑跟进','面谈跟进','天使跟进','XE78PV','吴琼'])assert.ok(exported.csv.includes(field),field);
  await evaluate(`document.querySelector('.iv-filter-toggle').click();document.querySelector('[data-field="学员ID"]').value='XE78PV';`);
  await cdp("Emulation.setDeviceMetricsOverride", {width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  const resize=await evaluate(`new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve({value:document.querySelector('[data-field="学员ID"]').value,expanded:document.querySelector('.iv-filter-toggle').getAttribute('aria-expanded'),shown:[...document.querySelectorAll('.iv-business__filters .iv-business__field')].every(x=>!x.hidden)}))))`);
  assert.deepEqual(resize,{value:'XE78PV',expanded:'true',shown:true});
  console.log(JSON.stringify({disclosure,exported:{count:exported.count,filename:exported.filename,allFields:true},resize},null,2));
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ result: "通过", pages: results, interactions, drag: { before: dragBefore.width, after: dragAfter.width, stable: dragBefore.root === dragAfter.root }, narrow, errors }, null, 2));
} finally {
  await cdp("Emulation.clearDeviceMetricsOverride");
  socket.close();
}
