/* ============================================================
   memoryMatchManager.js — 「幫蜜柑找回記憶」翻牌小遊戲（純邏輯）

   合作模式：玩家跟蜜柑輪流翻牌，配對成功就繼續翻、失敗換對方，
   不分輸贏，最終目標是「兩人一起」把8組配對全部找齊。

   跟 gardenManager / diaryManager / memoryManager 一樣的分工原則：
   這裡只管遊戲邏輯（洗牌、配對判斷、蜜柑AI），完全不碰DOM／畫面，
   畫面全部交給 mainHubScene.js 處理。

   目前規劃：第3天道別完解鎖，第4天起常駐（守夜燈熱區觸發），
   一天限玩一次。這些「什麼時候可以玩」的判斷由 mainHubScene.js /
   main.js 負責，這裡只單純提供「一局遊戲要怎麼跑」的邏輯。
   ============================================================ */

window.EF = window.EF || {};

window.EF.MemoryMatchManager = (function () {

  const UNLOCK_DAY = 3;

  // 蜜柑姿勢，陣列順序＝「被替換掉的順序」：day每增加一天，就從陣列開頭
  // 拿掉一個，idle放在最後面，代表最後才會被取代掉。
  const MIKAN_POSES = [
    'assets/images/characters/char_mikan_bye.png',
    'assets/images/characters/char_mikan_hold_diary.png',
    'assets/images/characters/char_mikan_listening.png',
    'assets/images/characters/char_mikan_memory.png',
    'assets/images/characters/char_mikan_idle.png'
  ];

  // 4x4 = 16張牌 = 8組配對，依「今天是第幾天」動態決定組合：
  // Day3解鎖當天是5個蜜柑姿勢+3種植物（玩家Day1~3種的），之後每多一天，
  // 少一個蜜柑姿勢、多一種植物，到Day8起蜜柑姿勢全部退場，變成8種植物，
  // 且改抓「最近8天」種的植物（不是永遠固定Day1~8），象徵蜜柑最近的
  // 回憶也慢慢加入了玩家的情緒植物。
  function getCardImagesForDay(day) {
    const safeDay = Math.max(day || UNLOCK_DAY, UNLOCK_DAY);
    const plantCount = Math.min(safeDay, 8);
    const poseCount = 8 - plantCount;
    // 保留陣列「尾端」的poseCount個，idle排在最後面，會是最晚被拿掉的
    const poses = MIKAN_POSES.slice(MIKAN_POSES.length - poseCount);

    // 動態抓「最近plantCount天」種的植物：例如第15天玩、plantCount=8，
    // 就抓第8~15天種的植物；第3天玩、plantCount=3，就抓第1~3天。
    // 同一種植物類型只會被選一次（對應到卡牌上就是自然的一對兩張）——
    // 情緒植物裡的「放空的小棉球」(puffball)可能連續好幾天重複出現，
    // 如果不去重，卡牌組合裡就會混進4張甚至更多張一樣的圖，配對規則
    // 會亂掉，所以這裡明確限制「每種植物只算一次」，短缺的部分交給
    // 下面的蜜柑姿勢遞補機制補齊。
    const plants = [];
    const seenPlantTypes = {};
    const startDay = Math.max(1, safeDay - plantCount + 1);
    if (window.EF.DiaryManager) {
      for (let d = startDay; d <= safeDay; d++) {
        if (plants.length >= plantCount) break;
        const entry = window.EF.DiaryManager.getEntry(d);
        if (entry && entry.plantType && !seenPlantTypes[entry.plantType]) {
          seenPlantTypes[entry.plantType] = true;
          plants.push('assets/images/plants/plant_' + entry.plantType + '.png');
        }
      }
    }
    // 防禦：萬一植物數量不夠湊滿（可能是同種植物重複被跳過、或日記
    // 資料有缺），短缺的部分用蜜柑姿勢遞補，確保永遠湊滿8張，
    // 不會讓遊戲因為資料不齊而壞掉
    const combined = poses.concat(plants);
    if (combined.length < 8) {
      const fallbackPoses = MIKAN_POSES.slice(0, MIKAN_POSES.length - poseCount);
      for (let i = 0; combined.length < 8 && i < fallbackPoses.length; i++) {
        combined.push(fallbackPoses[i]);
      }
    }
    // 最終保險：極端情況下（例如最近幾天種出的情緒植物種類剛好都很少）
    // 就算用完所有蜜柑姿勢也還湊不滿8張，這裡直接循環蜜柑姿勢陣列補滿，
    // 確保這個函式無論如何都一定回傳剛好8張圖，遊戲不會因此壞掉
    let cycleIndex = 0;
    while (combined.length < 8) {
      combined.push(MIKAN_POSES[cycleIndex % MIKAN_POSES.length]);
      cycleIndex++;
    }
    return combined.slice(0, 8);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  // 產生一副洗好的牌組：16張，每張有唯一id跟對應圖片，matched預設false。
  // day用來決定這局要用哪個蜜柑姿勢/植物的組合（見getCardImagesForDay）
  function createDeck(day) {
    const cardImages = getCardImagesForDay(day);
    const doubled = cardImages.concat(cardImages);
    const shuffled = shuffle(doubled);
    return shuffled.map(function (image, index) {
      return { id: index, image: image, matched: false };
    });
  }

  // 蜜柑「記得」某張牌的機率，隨著解鎖後的天數增加而提高，象徵記憶力
  // 慢慢恢復；封頂0.85，不要做到「蜜柑永遠不會猜錯」，保留一點自然感
  function getMikanRecallChance(day) {
    const daysSinceUnlock = Math.max(0, (day || UNLOCK_DAY) - UNLOCK_DAY);
    const chance = 0.3 + daysSinceUnlock * 0.05;
    return Math.min(chance, 0.85);
  }

  // 決定蜜柑這回合要翻哪兩張牌。
  // revealedMemory: { cardId: image } 這局遊戲裡「曾經被翻開過、但還沒
  // 配對成功」的牌，不分是玩家翻的還是蜜柑翻的，都算蜜柑「看過」。
  // 回傳一組 [idA, idB]。
  function decideMikanMove(deck, revealedMemory, day) {
    const availableIds = deck
      .filter(function (c) { return !c.matched; })
      .map(function (c) { return c.id; });

    const recallChance = getMikanRecallChance(day);

    // 先試著從「記得的牌」裡找一組真正配對成功的組合
    if (Math.random() < recallChance) {
      const byImage = {};
      Object.keys(revealedMemory).forEach(function (idStr) {
        const id = parseInt(idStr, 10);
        const card = deck[id];
        if (card && !card.matched) {
          const img = revealedMemory[idStr];
          if (!byImage[img]) byImage[img] = [];
          byImage[img].push(id);
        }
      });
      for (const img in byImage) {
        if (byImage[img].length >= 2) {
          return [byImage[img][0], byImage[img][1]];
        }
      }
    }

    // 沒有記得的配對，或機率沒中：隨機挑兩張還沒配對的牌
    const shuffledAvail = shuffle(availableIds);
    return [shuffledAvail[0], shuffledAvail[1]];
  }

  function isMatch(deck, idA, idB) {
    return !!deck[idA] && !!deck[idB] && deck[idA].image === deck[idB].image;
  }

  function isGameComplete(deck) {
    return deck.every(function (c) { return c.matched; });
  }

  return {
    UNLOCK_DAY: UNLOCK_DAY,
    MIKAN_POSES: MIKAN_POSES,
    getCardImagesForDay: getCardImagesForDay,
    createDeck: createDeck,
    getMikanRecallChance: getMikanRecallChance,
    decideMikanMove: decideMikanMove,
    isMatch: isMatch,
    isGameComplete: isGameComplete
  };
})();
