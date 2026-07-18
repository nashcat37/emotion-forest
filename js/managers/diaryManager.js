/* ============================================================
   DiaryManager

   職責：把玩家每天寫的日記文字、時間戳記、當天種下的植物類型，
   打包成一筆紀錄存進 localStorage，供「回憶心情」介面讀取。

   不負責：畫面呈現（MainHubScene 的工作）、情緒分析（刻意不做）。

   資料結構：
   {
     "1": { day:1, text:"...", timestamp:169..., plantType:"sunflower" },
     "2": { day:2, text:"...", timestamp:169..., plantType:"rose" },
     ...
   }
   用「天數」當 key，方便依日期查找，也自然避免同一天重複寫入時累積垃圾資料。
   ============================================================ */

window.EF = window.EF || {};

window.EF.DiaryManager = (function () {

  const STORAGE_KEY = 'ef_diaryEntries';

  function getAllEntries() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveEntry(day, text, plantType) {
    const entries = getAllEntries();
    entries[String(day)] = {
      day: day,
      text: text,
      timestamp: Date.now(),
      plantType: plantType
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  function getEntry(day) {
    const entries = getAllEntries();
    return entries[String(day)] || null;
  }

  // 回傳所有已寫過日記的天數，由小到大排序，供下拉選單使用
  function getAvailableDays() {
    const entries = getAllEntries();
    return Object.keys(entries).map(Number).sort(function (a, b) { return a - b; });
  }

  function getMostRecentDay() {
    const days = getAvailableDays();
    return days.length ? days[days.length - 1] : null;
  }

  return {
    saveEntry: saveEntry,
    getEntry: getEntry,
    getAvailableDays: getAvailableDays,
    getMostRecentDay: getMostRecentDay
  };
})();
