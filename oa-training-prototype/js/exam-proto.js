/**
 * 原型演示：考试「满足」= 卷面总分达标且未被否决，或管理员「通过」覆盖。
 * localStorage 键 oa_train_exam_override：{ [slot]: "none" | "must_fail" | "must_pass" }
 */
(function (w) {
  var LS = "oa_train_exam_override";

  function read() {
    try {
      var s = localStorage.getItem(LS);
      if (!s) return {};
      var o = JSON.parse(s);
      return o && typeof o === "object" ? o : {};
    } catch (e) {
      return {};
    }
  }

  function write(obj) {
    localStorage.setItem(LS, JSON.stringify(obj || {}));
    try {
      w.dispatchEvent(new CustomEvent("oa-exam-override-changed"));
    } catch (e2) {}
  }

  function get(slot) {
    var v = read()[slot];
    return v === "must_fail" || v === "must_pass" ? v : "none";
  }

  function set(slot, mode) {
    var o = read();
    if (mode === "none") delete o[slot];
    else o[slot] = mode;
    write(o);
  }

  /** @param {{ total:number, max:number, pass:number, complete:boolean }} meta */
  function satisfied(slot, meta) {
    var o = get(slot);
    if (o === "must_fail") return false;
    if (o === "must_pass") return true;
    return !!(meta.complete && meta.total >= meta.pass);
  }

  w.OaExamProto = {
    LS: LS,
    read: read,
    write: write,
    get: get,
    set: set,
    satisfied: satisfied
  };
})(window);
