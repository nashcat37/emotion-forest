/* ============================================================
   GardenManager

   職責：
     - 每次「種植」時隨機挑一種植物類型（不做情緒分析／不做關鍵字判斷，
       呼應「任何情緒都值得存在」的設計決定）
     - 管理花圃固定版位的配置邏輯（8 個手動設計的版位，依天數循環使用）

   不負責：
     - 畫面渲染（由 MainHubScene 讀取 getGardenLayout() 後自行畫出）
     - 情緒判斷（本來就不需要）
     - 成長動畫（MVP 決定跳過，直接是成熟植株）

   資料存取：暫時用 localStorage，之後應搬進 SaveManager。
   ============================================================ */

window.EF = window.EF || {};

window.EF.GardenManager = (function () {

  const STORAGE_KEY = 'ef_gardenEntries';

  const PLANT_TYPES = ['grape', 'mimosa', 'sunflower', 'lavender', 'dandelion',  'rose', 'orchid', 'peony', 'camellia'];

  // 「放空日」專屬植物：日記完全沒寫任何字、直接送出時種下的固定植物，
  // 不放進上面的隨機池，也不佔用洗牌袋——這不是情緒分析，只是單純的
  // 「有沒有輸入」判斷，跟其他9種一樣不去讀日記內容本身。
  const BLANK_PLANT_TYPE = 'puffball';

  // 花圃版位規則。原本嘗試用「中心→順時針30度→半徑」的數學公式排列，
  // 但花圃實際進深只有約 12%，8 個版位排在這麼淺的橢圓弧線上，
  // 靠近頂部的版位會擠壓到只剩 2-4% 間距，小於植株圖片本身的寬度(10.8%)，
  // 必然重疊。因此改為手動設計版位，放棄嚴格角度規則，只保證彼此不重疊。
  // 手動設計的 8 個版位（放棄嚴格的圓弧角度規則）。
  // 花圃實際進深只有約 12%，但寬度有約 50%，用「前後兩排交錯」的方式
  // 盡量利用寬度，確保版位間距 ≥ 植株圖片寬度(10.8%)，避免重疊。
  // 版位 0 是花圃正中心（呼應第 1 天种下的第一株，視覺上最顯眼）。
  const POSITIONS = [
    { left: 70.4, top: 87.4 }, // 0：正中心
    { left: 51,   top: 83.5 }, // 1：後排左
    { left: 62,   top: 82.5 }, // 2：後排中左
    { left: 79,   top: 82.5 }, // 3：後排中右
    { left: 90,   top: 84   }, // 4：後排右
    { left: 56,   top: 92   }, // 5：前排左
    { left: 73,   top: 93   }, // 6：前排中
    { left: 86,   top: 91   }  // 7：前排右
  ];

  function getEntries() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function saveEntries(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  const CYCLE_LENGTH = POSITIONS.length; // 8 個版位一輪
  const BAG_KEY = 'ef_plantBag';
  const LAST_TYPE_KEY = 'ef_lastPlantType';

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function drawPlantType() {
    let bag = [];
    try {
      bag = JSON.parse(localStorage.getItem(BAG_KEY) || '[]');
    } catch (e) {
      bag = [];
    }
    if (bag.length === 0) {
      bag = shuffle(PLANT_TYPES);
      // 避免洗牌袋邊界連續重複：如果重新洗牌後第一個要抽到的（陣列最後一個，
      // 因為 pop() 從尾端取）剛好跟前一天種的植物一樣，就跟袋內其他位置交換
      const lastType = localStorage.getItem(LAST_TYPE_KEY);
      if (bag.length > 1 && bag[bag.length - 1] === lastType) {
        const swapIndex = Math.floor(Math.random() * (bag.length - 1));
        const tmp = bag[bag.length - 1];
        bag[bag.length - 1] = bag[swapIndex];
        bag[swapIndex] = tmp;
      }
    }
    const plantType = bag.pop();
    localStorage.setItem(BAG_KEY, JSON.stringify(bag));
    localStorage.setItem(LAST_TYPE_KEY, plantType);
    return plantType;
  }

  // 種下一株新植物。從「尚未出現過的植物」中隨機挑選（洗牌袋機制），
  // 確保連續幾天不會種到重複的植物，5 種都出現過一輪後才重新洗牌，
  // 依然跟日記內容無關，純粹隨機。
  function plantRandom(day) {
    const plantType = drawPlantType();
    const entries = getEntries();
    entries.push({ day: day, plantType: plantType });
    // 版位會循環覆蓋，儲存的紀錄只需保留最近一輪（CYCLE_LENGTH 天）即可，
    // 更早的資料留著也不會被畫出來，直接清掉節省空間。
    while (entries.length > CYCLE_LENGTH) {
      entries.shift();
    }
    saveEntries(entries);
    return plantType;
  }

  // 種下「放空日」的專屬植物：完全略過洗牌袋機制，固定就是棉絮球草，
  // 也不更新 ef_lastPlantType，避免干擾隨機9種植物原本的連續防重複判斷。
  function plantBlank(day) {
    const entries = getEntries();
    entries.push({ day: day, plantType: BLANK_PLANT_TYPE });
    while (entries.length > CYCLE_LENGTH) {
      entries.shift();
    }
    saveEntries(entries);
    return BLANK_PLANT_TYPE;
  }

  // 回傳目前花圃該畫出的所有植株（含版位座標），供 MainHubScene 渲染。
  // 版位由「(day - 1) % CYCLE_LENGTH」決定，同一版位若被多天共用，
  // 只顯示最後一次種在該版位的植株（新的蓋掉舊的）。
  function getGardenLayout() {
    const entries = getEntries();
    const bySlot = {};
    entries.forEach(function (entry) {
      const slotIndex = (entry.day - 1) % CYCLE_LENGTH;
      bySlot[slotIndex] = entry; // 同版位新資料自然覆蓋舊資料
    });

    const layout = [];
    Object.keys(bySlot).forEach(function (slotIndex) {
      const entry = bySlot[slotIndex];
      layout.push({
        plantType: entry.plantType,
        day: entry.day,
        slot: POSITIONS[slotIndex]
      });
    });
    return layout;
  }

  return {
    plantRandom: plantRandom,
    plantBlank: plantBlank,
    getGardenLayout: getGardenLayout,
    PLANT_TYPES: PLANT_TYPES,
    BLANK_PLANT_TYPE: BLANK_PLANT_TYPE
  };
})();
