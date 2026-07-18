/* ============================================================
   typewriter.js — 共用工具（非 Scene、非 Manager）

   逐字輸出文字，依標點符號給予不同停頓時間：
     句尾標點（。！？…）停頓最長
     逗號頓號分號冒號停頓中等
     換行停頓最久
     空白稍快帶過

   回傳一個「取消函式」，Scene unmount 時務必呼叫，避免計時器外洩。
   ============================================================ */

window.EF = window.EF || {};

window.EF.typewriter = function (text, element, options) {
  options = options || {};
  const speed = options.speed || 110;
  const onComplete = options.onComplete || null;

  let i = 0;
  let timer = null;
  element.innerText = '';

  function charDelay(ch) {
    if (ch === '\n') return speed * 5;
    if ('。！？…'.includes(ch)) return speed * 4;
    if ('，、；：'.includes(ch)) return speed * 2;
    if (ch === ' ') return speed * 0.5;
    return speed;
  }

  function tick() {
    if (i >= text.length) {
      timer = null;
      if (onComplete) onComplete();
      return;
    }
    const ch = text.charAt(i);
    element.innerText += ch;
    i++;
    timer = setTimeout(tick, charDelay(ch));
  }

  timer = setTimeout(tick, speed);

  // 取消函式：立即停止逐字輸出（不會補完文字，呼叫端如需要「跳過」而非「取消」，
  // 應自行判斷後手動設定 element.innerText = text）
  return function cancel() {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };
};
