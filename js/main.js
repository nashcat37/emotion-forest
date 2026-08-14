/* ============================================================
   main.js — 啟動程式

   目前先把「isFirstEver / diaryCount 判斷」跟「下一步去哪個 Scene」的
   邏輯暫時寫在這裡。這是刻意的暫時做法：

   - isFirstEver、diaryCount 的存讀，之後應搬進 SaveManager
   - 「Scene 完成後該去哪」的流程判斷，之後應搬進 RitualManager
   - 玩家寫的日記文字，目前只是在 console.log 印出來，之後應交給
     DiaryManager / EmotionManager 處理

   等 Ritual 流程變複雜、Manager 數量變多時，再依規則拆成獨立檔案，
   不會讓這個檔案無限長大。
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  // 開發測試面板開關：true時面板會顯示、所有測試按鈕正常運作；
  // 正式上線前把這裡改成false，面板連同所有測試按鈕的事件綁定都會
  // 整個跳過，不用手動刪除任何程式碼或HTML
  const IS_DEV_BUILD = true;

  // ---------------- 防止一般玩家右鍵拷貝／查看原始碼 ----------------
  // 注意：這只能防住普通玩家的右鍵選單跟常見快捷鍵，屬於基本嚇阻，
  // 無法真正阻擋熟悉瀏覽器開發者工具的人（例如直接開 DevTools 面板選單，
  // 或用瀏覽器擴充功能）。不要誤以為這是安全機制。
  // 測試模式（開發面板的「測試用：忽略時間限制」勾選時）開放右鍵跟F12，
  // 方便除錯；正式測試/上線時關掉勾選，就會恢復原本的防拷貝行為。
  document.addEventListener('contextmenu', function (e) {
    if (isDevBypassOn()) return;
    e.preventDefault();
  });
  document.addEventListener('keydown', function (e) {
    if (isDevBypassOn()) return;
    const key = e.key;
    const blockedCombo =
      key === 'F12' ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && (key === 'I' || key === 'J' || key === 'C' || key === 'i' || key === 'j' || key === 'c')) ||
      ((e.ctrlKey || e.metaKey) && (key === 'u' || key === 'U'));
    if (blockedCombo) {
      e.preventDefault();
    }
  });

  const SAVE_KEY = 'ef_hasSeenFirstEntry';
  const DIARY_COUNT_KEY = 'ef_diaryCount';
  const CONSECUTIVE_BLANK_KEY = 'ef_consecutiveBlankDays';
  const LAST_PLAY_DATE_KEY = 'ef_lastPlayDate';
  const DEV_BYPASS_GATE_KEY = 'ef_devBypassTimeGate';
  const PLAY_WINDOW_START_HOUR = 18; // 每天 18:00 開放正式Ritual流程
  const PLAY_WINDOW_END_HOUR = 24;   // 到 24:00（隔天 00:00）為止

  // ---------------- 遊玩回饋（送往Google表單） ----------------
  // 表單本身：「情緒森林回饋」，欄位為「回饋內容」「第幾天」兩題。
  // entry ID是透過表單的「取得預先填入的連結」功能對照出來的，不是猜的；
  // 之後若在Google表單重新增減欄位，這兩個entry ID可能會跟著變動，
  // 屆時要重新用同一個方法（表單右上角⋮ → 取得預先填入的連結）核對。
  const FEEDBACK_FORM_ACTION_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSc3lxDXNeVTt2WKVOPJhVFEE5YIcJpSbK3f2h83EH3tDQ-FJg/formResponse';
  const FEEDBACK_FORM_ENTRY_TEXT = 'entry.557414887';
  const FEEDBACK_FORM_ENTRY_DAY = 'entry.1698567732';
  const FEEDBACK_HISTORY_KEY = 'ef_feedbackHistory';

  const startGate = document.getElementById('startGate');
  const startGateHint = document.getElementById('startGateHint');
  const startBtn = document.getElementById('startBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const endGate = document.getElementById('endGate');
  const endBtn = document.getElementById('endBtn');
  // 兩個入口共用同一份面板：一個在start-gate、一個在end-gate，
  // 不分正式Ritual／瀏覽模式，只要玩家看得到其中一個gate就能開啟
  const feedbackBtnStart = document.getElementById('feedbackBtnStart');
  const feedbackBtnEnd = document.getElementById('feedbackBtnEnd');
  const feedbackOverlay = document.getElementById('feedbackOverlay');
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackInput = document.getElementById('feedbackInput');
  const feedbackSubmitBtn = document.getElementById('feedbackSubmitBtn');
  const feedbackCancelBtn = document.getElementById('feedbackCancelBtn');
  const feedbackAck = document.getElementById('feedbackAck');
  const devResetBtn = document.getElementById('devResetBtn');
  const devExtra = document.getElementById('devExtra');
  const devBypassCheckbox = document.getElementById('devBypassGate');
  const devSnowBtn = document.getElementById('devSnowBtn');
  const devPetalBtn = document.getElementById('devPetalBtn');
  const devMemoryMatchBtn = document.getElementById('devMemoryMatchBtn');
  const devFogBtn = document.getElementById('devFogBtn');
  const devJumpDayInput = document.getElementById('devJumpDayInput');
  const devJumpDayBtn = document.getElementById('devJumpDayBtn');
  const devPanel = document.getElementById('devPanel');
  if (IS_DEV_BUILD && devPanel) {
    devPanel.style.display = '';
  }

  // ---------------- 進場模式判斷（晝夜分明機制） ----------------
  // 不再用「鎖住按鈕」的方式限制進場，森林永遠能進去。差別在於進去之後
  // 走哪一種模式：
  //   已完成今天的日記 → 瀏覽模式（不管幾點，場景固定在「離開時的狀態」）
  //   18:00-24:00內、還沒寫 → 正式Ritual流程
  //   18:00前、還沒寫 → 瀏覽模式（多一層白天濃霧，暗示「還沒到寫日記的時間」）
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function getTodayDateStr() {
    const d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function hasWrittenToday() {
    return localStorage.getItem(LAST_PLAY_DATE_KEY) === getTodayDateStr();
  }
  function markWrittenToday() {
    localStorage.setItem(LAST_PLAY_DATE_KEY, getTodayDateStr());
  }
  function isWithinPlayWindow() {
    const hour = new Date().getHours();
    return hour >= PLAY_WINDOW_START_HOUR && hour < PLAY_WINDOW_END_HOUR;
  }
  function isDevBypassOn() {
    return localStorage.getItem(DEV_BYPASS_GATE_KEY) === 'true';
  }
  // 回傳 'ritual'（正式流程）或 'browse'（瀏覽模式）。
  // 第一次玩的玩家（或isFirstEver重置後）不論幾點都直接放行正式Ritual，
  // 不設「locked」擋住——世界觀本來就永遠是夜晚，18:00-24:00只是額外加上去
  // 的現實時間限制，不該讓一個滿懷期待點進來的新玩家撲空
  function hasEverCompletedRitual() {
    return localStorage.getItem(LAST_PLAY_DATE_KEY) !== null;
  }
  function decideEntryMode() {
    if (isDevBypassOn()) return { mode: 'ritual', showDaytimeFog: false };
    if (hasWrittenToday()) return { mode: 'browse', showDaytimeFog: false };
    if (isWithinPlayWindow()) return { mode: 'ritual', showDaytimeFog: false };
    if (!hasEverCompletedRitual()) return { mode: 'ritual', showDaytimeFog: false };
    return { mode: 'browse', showDaytimeFog: true };
  }

  if (IS_DEV_BUILD && devBypassCheckbox) {
    devBypassCheckbox.checked = isDevBypassOn();
    devBypassCheckbox.addEventListener('change', function () {
      localStorage.setItem(DEV_BYPASS_GATE_KEY, devBypassCheckbox.checked ? 'true' : 'false');
    });
  }

  // ---------------- 全螢幕功能 ----------------
  // 只在「觸控裝置」且「瀏覽器支援 Fullscreen API」時才顯示按鈕。
  // iOS Safari 引擎（含iPhone上的Chrome）不支援此API，document.documentElement
  // 上不會有 requestFullscreen 系列方法，偵測不到就直接不顯示按鈕，
  // 不會出現點了沒反應的死按鈕。桌機也不顯示，全螢幕功能只為手機準備。
  function getFullscreenRequestFn(el) {
    return el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen || null;
  }
  function getExitFullscreenFn() {
    return document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen || null;
  }
  function isCurrentlyFullscreen() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement);
  }
  if (fullscreenBtn) {
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    const requestFn = getFullscreenRequestFn(document.documentElement);
    if (isTouchDevice && requestFn) {
      fullscreenBtn.style.display = '';
      fullscreenBtn.addEventListener('click', function () {
        try {
          if (isCurrentlyFullscreen()) {
            const exitFn = getExitFullscreenFn();
            if (exitFn) exitFn.call(document);
          } else {
            requestFn.call(document.documentElement);
          }
        } catch (err) {
          console.warn('[main] 全螢幕切換失敗：', err);
        }
      });
      const updateFullscreenBtnLabel = function () {
        fullscreenBtn.textContent = isCurrentlyFullscreen() ? '⛶ 離開全螢幕' : '⛶ 全螢幕';
      };
      document.addEventListener('fullscreenchange', updateFullscreenBtnLabel);
      document.addEventListener('webkitfullscreenchange', updateFullscreenBtnLabel);
      document.addEventListener('msfullscreenchange', updateFullscreenBtnLabel);
    }
  }

  // 下雪效果測試按鈕：觸發時機還沒定案前，先手動預覽。只有目前在
  // MainHub場景時才有效（window.EF.mainhubDevControls 只在該場景mount時存在）
  let devSnowOn = false;
  if (IS_DEV_BUILD && devSnowBtn) {
    devSnowBtn.addEventListener('click', function () {
      const controls = window.EF.mainhubDevControls;
      if (!controls) {
        console.warn('[main] 目前不在 MainHub 場景，無法預覽下雪效果');
        return;
      }
      devSnowOn = !devSnowOn;
      if (devSnowOn) {
        controls.showSnow();
        devSnowBtn.textContent = '測試：關閉下雪';
      } else {
        controls.hideSnow();
        devSnowBtn.textContent = '測試：下雪效果';
      }
    });
  }

  // 花瓣雨效果測試按鈕，邏輯跟下雪測試按鈕平行
  let devPetalOn = false;
  if (IS_DEV_BUILD && devPetalBtn) {
    devPetalBtn.addEventListener('click', function () {
      const controls = window.EF.mainhubDevControls;
      if (!controls) {
        console.warn('[main] 目前不在 MainHub 場景，無法預覽花瓣雨效果');
        return;
      }
      devPetalOn = !devPetalOn;
      if (devPetalOn) {
        controls.showPetalRain();
        devPetalBtn.textContent = '測試：關閉花瓣雨';
      } else {
        controls.hidePetalRain();
        devPetalBtn.textContent = '測試：花瓣雨效果';
      }
    });
  }

  // 18:00前濃霧測試按鈕：不用湊「今天沒寫過日記＋不在開放時段＋玩過至少
  // 一次」這三個條件，直接手動開關看效果，邏輯跟下雪/花瓣雨測試按鈕平行
  let devFogOn = false;
  if (IS_DEV_BUILD && devFogBtn) {
    devFogBtn.addEventListener('click', function () {
      const controls = window.EF.mainhubDevControls;
      if (!controls) {
        console.warn('[main] 目前不在 MainHub 場景，無法預覽濃霧效果');
        return;
      }
      devFogOn = !devFogOn;
      if (devFogOn) {
        controls.showDaytimeFog();
        devFogBtn.textContent = '測試：關閉濃霧';
      } else {
        controls.hideDaytimeFog();
        devFogBtn.textContent = '測試：18:00前濃霧';
      }
    });
  }

  // 記憶翻牌小遊戲測試按鈕：直接開局，還沒接上第3天解鎖的正式流程，
  // 先用這個按鈕獨立測試遊戲邏輯跟畫面。遊戲面板本身有「先不玩了」
  // 按鈕負責關閉，這裡不需要像下雪/花瓣雨那樣切換開關狀態
  if (IS_DEV_BUILD && devMemoryMatchBtn) {
    devMemoryMatchBtn.addEventListener('click', function () {
      const controls = window.EF.mainhubDevControls;
      if (!controls) {
        console.warn('[main] 目前不在 MainHub 場景，無法測試記憶翻牌小遊戲');
        return;
      }
      controls.openMemoryMatchGame();
    });
  }

  // ---------------- 環境音管理器（AudioManager）----------------
  // 三軌音樂分工：
  //   soft-wind    → 濃霧場景（第二次以後進入 & 離開時的互動濃霧）
  //   night-ambience → MainHub 的常駐環境底噪（寫日記、道別時的安靜片刻）
  //   background   → 蜜柑開始回憶時的情緒堆疊音樂，回憶結束後切回 night-ambience
  // 三軌互斥使用淡入淡出交叉切換，避免生硬切歌；檔案若尚未提供，瀏覽器
  // 只會靜默載入失敗，不影響其他功能運作。
  const AudioManager = (function () {
    const nightAmbience = new Audio('assets/audio/night-ambience.mp3');
    const softWind = new Audio('assets/audio/soft-wind.mp3');
    const backgroundMusic = new Audio('assets/audio/background.mp3');
    [nightAmbience, softWind, backgroundMusic].forEach(function (a) {
      a.loop = true;
      a.volume = 0;
    });

    const TARGET_VOLUME = {
      nightAmbience: 0.35,
      softWind: 0.4,
      backgroundMusic: 0.4 // 這軌本身聲音就比較大，從0.45調降
    };
    const FADE_MS = 1500;
    const fadeTimers = new WeakMap();

    function fadeTo(audio, targetVolume) {
      const existing = fadeTimers.get(audio);
      if (existing) clearInterval(existing);

      if (targetVolume > 0 && audio.paused) {
        audio.play().catch(function (err) {
          console.warn('[AudioManager] 播放失敗（可能音樂檔尚未提供，或需要使用者互動手勢）：', err);
        });
      }

      const steps = 30;
      const stepTime = FADE_MS / steps;
      const startVolume = audio.volume;
      const delta = (targetVolume - startVolume) / steps;
      let count = 0;

      const timer = setInterval(function () {
        count++;
        audio.volume = Math.min(1, Math.max(0, startVolume + delta * count));
        if (count >= steps) {
          clearInterval(timer);
          fadeTimers.delete(audio);
          audio.volume = targetVolume;
          if (targetVolume === 0) audio.pause();
        }
      }, stepTime);

      fadeTimers.set(audio, timer);
    }

    return {
      playSoftWind: function () { fadeTo(softWind, TARGET_VOLUME.softWind); },
      stopSoftWind: function () { fadeTo(softWind, 0); },

      playNightAmbience: function () { fadeTo(nightAmbience, TARGET_VOLUME.nightAmbience); },
      stopNightAmbience: function () { fadeTo(nightAmbience, 0); },

      // 情緒高點：night-ambience 淡出的同時 background 淡入
      switchToBackgroundMusic: function () {
        fadeTo(nightAmbience, 0);
        fadeTo(backgroundMusic, TARGET_VOLUME.backgroundMusic);
      },
      // 道別前的安靜片刻：background 淡出的同時 night-ambience 淡回來
      // （目前流程已改為回憶期間全程維持background，這個方法保留給
      // 之後若想恢復切換節奏時使用，暫時沒有呼叫點）
      switchToNightAmbience: function () {
        fadeTo(backgroundMusic, 0);
        fadeTo(nightAmbience, TARGET_VOLUME.nightAmbience);
      },
      stopBackgroundMusic: function () { fadeTo(backgroundMusic, 0); },

      stopAll: function () {
        fadeTo(nightAmbience, 0);
        fadeTo(softWind, 0);
        fadeTo(backgroundMusic, 0);
      }
    };
  })();
  window.EF = window.EF || {};
  window.EF.AudioManager = AudioManager;

  function isFirstEver() {
    return localStorage.getItem(SAVE_KEY) !== 'true';
  }
  function markSeen() {
    localStorage.setItem(SAVE_KEY, 'true');
  }
  function getDiaryCount() {
    return parseInt(localStorage.getItem(DIARY_COUNT_KEY) || '0', 10);
  }
  function incrementDiaryCount() {
    const next = getDiaryCount() + 1;
    localStorage.setItem(DIARY_COUNT_KEY, String(next));
    return next;
  }
  // 連續放空天數：真正送出空白日記（種下puffball）才會累加，只要有送出
  // 任何文字（不管是玩家自己打的，還是第2次起自動幫忙填的那句）就歸零。
  // 用來讓MainHubScene判斷「這次要不要自動幫玩家填一句文字」，避免連續
  // 好幾天都是puffball，也順便解決了記憶翻牌小遊戲卡牌重複過多的邊界情況。
  function getConsecutiveBlankDays() {
    return parseInt(localStorage.getItem(CONSECUTIVE_BLANK_KEY) || '0', 10);
  }
  function refreshDevExtra() {
    if (!IS_DEV_BUILD) return;
    if (devExtra) devExtra.textContent = 'isFirstEver: ' + isFirstEver() + ' | diaryCount: ' + getDiaryCount();
  }
  refreshDevExtra();

  // 跳到指定天數測試用：day = diaryCount + 1，所以要跳到第N天，
  // diaryCount要設成N-1；同時清掉「今天已玩」紀錄，確保重整後
  // decideEntryMode()不會誤判成已經寫過今天的日記
  if (IS_DEV_BUILD && devJumpDayBtn) {
    devJumpDayBtn.addEventListener('click', function () {
      const targetDay = parseInt(devJumpDayInput.value, 10);
      if (!targetDay || targetDay < 1) {
        console.warn('[main] 請輸入大於等於1的天數');
        return;
      }
      localStorage.setItem(DIARY_COUNT_KEY, String(targetDay - 1));
      localStorage.removeItem(LAST_PLAY_DATE_KEY);
      location.reload();
    });
  }

  if (IS_DEV_BUILD && devResetBtn) {
    devResetBtn.addEventListener('click', function () {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(DIARY_COUNT_KEY);
    localStorage.removeItem('ef_gardenEntries'); // 一併清掉花園資料，避免殘留舊植株對不上重置後的天數
    localStorage.removeItem('ef_plantBag'); // 一併清掉洗牌袋
    localStorage.removeItem('ef_lastPlantType'); // 洗牌袋的防連續重複追蹤值，一併清掉避免影響重置後第一株
    localStorage.removeItem('ef_diaryEntries'); // 一併清掉日記歷史，否則「回憶心情」會保留重置前的舊紀錄
    localStorage.removeItem(LAST_PLAY_DATE_KEY); // 一併清掉今日已玩紀錄，方便重複測試
    localStorage.removeItem('ef_playerName'); // 一併清掉存起來的玩家名字
    localStorage.removeItem(CONSECUTIVE_BLANK_KEY); // 一併清掉連續放空天數計數器
    localStorage.removeItem('ef_touchDiaryLastDate'); // 一併清掉touch diary的每日播放紀錄
    localStorage.removeItem(FEEDBACK_HISTORY_KEY); // 一併清掉遊玩回饋的本機備份紀錄
    location.reload();
    });
  }

  startBtn.addEventListener('click', function () {
    startGate.classList.add('hidden');
    beginExperience();
  });

  endBtn.addEventListener('click', function () {
    // 網頁基於瀏覽器安全限制，沒辦法強制關閉玩家的分頁（除非是網站自己
    // 用window.open()開的分頁），所以這裡做的是「明確的結束狀態」：
    // 按鈕跟提示文字淡出，同時若玩家先前有開啟全螢幕，一併嘗試離開，
    // 讓畫面回到瀏覽器一般模式，方便玩家自行關閉分頁
    const exitFn = getExitFullscreenFn();
    if (exitFn && isCurrentlyFullscreen()) {
      try { exitFn.call(document); } catch (err) { /* 忽略離開全螢幕失敗，不影響結尾流程 */ }
    }
    endGate.classList.add('is-closed');
  });

  // ---------------- 遊玩回饋面板互動 ----------------
  // 這是給玩家／作者的意見箱，不屬於森林的世界觀，因此邏輯故意跟Ritual
  // 主流程完全獨立，不會影響diaryCount、farewell等任何既有狀態判斷。
  // start-gate跟end-gate各自的按鈕都呼叫同一組開關函式，只維護一份邏輯
  function openFeedbackPanel() {
    feedbackOverlay.classList.add('is-open');
    if (!isTouchDevice_forFeedback()) feedbackInput.focus();
  }
  function isTouchDevice_forFeedback() {
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }
  // 面板本身的opacity transition是0.5秒（見style.css的.feedback-overlay），
  // 這裡的延遲要跟它對齊
  const FEEDBACK_OVERLAY_FADE_MS = 500;
  // 輸入框淡出的opacity transition也是0.5秒（見.feedback-overlay__form），
  // 同樣要對齊，才能等它真的淡出完再讓它脫離flow（見onFeedbackSubmit）
  const FORM_FADE_MS = 500;
  function closeFeedbackPanel() {
    feedbackOverlay.classList.remove('is-open'); // 先開始整體淡出
    // 內容重置（清空輸入框、把感謝文字收回、換回原本表單樣子）刻意延遲到
    // 淡出動畫跑完才做——這幾個切換牽涉到position: absolute/static，
    // 沒辦法做漸層動畫，若跟淡出同時發生，玩家會看到感謝文字瞬間跳成
    // 空白輸入框、面板才接著淡出，效果像「沒有淡出」而不是乾淨的一次性淡出
    setTimeout(function () {
      feedbackInput.value = '';
      feedbackInput.disabled = false;
      feedbackForm.classList.remove('is-hidden');
      feedbackForm.classList.remove('is-fading-out');
      feedbackAck.classList.remove('is-visible');
      feedbackSubmitBtn.disabled = false;
    }, FEEDBACK_OVERLAY_FADE_MS);
  }
  function saveFeedbackLocally(text, day) {
    // localStorage備援：Google表單那次請求無法確認是否真的送達（fetch用
    // no-cors模式，回應內容讀不到），所以不論後續請求成功與否都先備份一份，
    // 避免玩家裝置離線或表單設定異動時，回饋內容憑空消失
    try {
      const raw = localStorage.getItem(FEEDBACK_HISTORY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.push({ day: day, text: text, timestamp: new Date().toISOString() });
      localStorage.setItem(FEEDBACK_HISTORY_KEY, JSON.stringify(list));
    } catch (err) {
      console.warn('[main] 回饋內容本機備份失敗：', err);
    }
  }
  function sendFeedbackToGoogleForm(text, day) {
    const body = new URLSearchParams();
    body.set(FEEDBACK_FORM_ENTRY_TEXT, text);
    body.set(FEEDBACK_FORM_ENTRY_DAY, String(day));
    // mode: 'no-cors' — Google表單不會回傳CORS允許標頭，瀏覽器會擋下讀取
    // 回應內容，但送出本身不受影響；因此這裡刻意不去判斷成功或失敗，
    // 一律視為「已送出」，真正的保底交給上面的localStorage備份
    fetch(FEEDBACK_FORM_ACTION_URL, {
      method: 'POST',
      mode: 'no-cors',
      body: body
    }).catch(function (err) {
      console.warn('[main] 回饋送往Google表單時發生錯誤（本機已備份一份）：', err);
    });
  }
  function onFeedbackSubmit() {
    const text = feedbackInput.value.trim();
    if (!text) return; // 空白不送出，也不需要像日記那樣特別接住「放空」
    feedbackSubmitBtn.disabled = true;
    feedbackInput.disabled = true;
    const day = getDiaryCount();
    saveFeedbackLocally(text, day);
    sendFeedbackToGoogleForm(text, day);
    // 第一階段：輸入框先單純淡出（不脫離flow），讓玩家看到完整的0.5秒
    // 淡出效果，而不是瞬間消失
    feedbackForm.classList.add('is-fading-out');
    setTimeout(function () {
      // 第二階段：輸入框已經完全透明看不見了，這時候才讓它脫離flow、
      // 換感謝文字淡入補上這個位置，玩家不會察覺這個切換
      feedbackForm.classList.add('is-hidden');
      feedbackAck.classList.add('is-visible');
      setTimeout(function () {
        closeFeedbackPanel();
      }, 1500);
    }, FORM_FADE_MS);
  }
  if (feedbackBtnStart) feedbackBtnStart.addEventListener('click', openFeedbackPanel);
  if (feedbackBtnEnd) feedbackBtnEnd.addEventListener('click', openFeedbackPanel);
  if (feedbackCancelBtn) feedbackCancelBtn.addEventListener('click', closeFeedbackPanel);
  if (feedbackSubmitBtn) feedbackSubmitBtn.addEventListener('click', onFeedbackSubmit);

  // 記錄「這次進場是不是正式Ritual流程」跟白天濃霧開關，Fog exit時要
  // 依這個決定要不要顯示結尾畫面（瀏覽模式離場不需要「今天結束了」的
  // 收尾儀式）。只在beginExperience()判斷一次並存起來，避免濃霧進場
  // 的5秒過程中重複呼叫decideEntryMode()，導致跨過18:00那一刻時
  // 前後判斷結果不一致
  let currentEntryIsRitual = false;
  let currentEntryShowDaytimeFog = false;

  function beginExperience() {
    const entry = decideEntryMode();
    currentEntryIsRitual = entry.mode === 'ritual';
    currentEntryShowDaytimeFog = entry.showDaytimeFog;
    goToFog('enter');
  }

  function goToFog(direction) {
    const firstEver = isFirstEver();
    // 瀏覽模式進場永遠用「無動畫的二次進場」風格，且時間縮短為5秒
    // （見fogScene.js的durationMs參數），不會播放首次進入的Cinematic
    const isBrowseEntry = direction === 'enter' && !currentEntryIsRitual;
    const fogParams = {
      direction: direction,
      isFirstEver: firstEver && !isBrowseEntry,
      durationMs: isBrowseEntry ? 5000 : undefined
    };
    SceneManager.goTo('fog', fogParams, function onFogComplete() {
      if (direction === 'enter') {
        if (firstEver && !isBrowseEntry) markSeen();
        refreshDevExtra();
        if (currentEntryIsRitual) {
          // day 傳入「目前已寫日記數+1」，也就是「今天是第幾天」——這個數字
          // 從按下「進入森林」的當下就該成立，不用等到日記送出才知道。
          // 這段期間 diaryCount 本身不會變動，所以跟送出後 post_planting
          // 拿到的天數（incrementDiaryCount的回傳值）自然會保持一致，
          // 不需要另外維護一個變數。
          goToMainHub('greeting', false, getDiaryCount() + 1, getDiaryCount());
        } else {
          // 瀏覽模式：場景固定停留在「離開時的狀態」（蜜柑抱著日記、
          // 桌上沒有日記本），currentEntryShowDaytimeFog決定要不要疊加白天濃霧
          goToMainHub('browse', false, getDiaryCount(), getDiaryCount(), currentEntryShowDaytimeFog);
        }
      } else {
        if (currentEntryIsRitual) {
          // exit 完成 = 一次完整 Ritual Loop 結束（寫完日記、道別、穿越濃霧離開）。
          // 「一天只能玩一次」在這裡才算數，而不是一進入森林就算——
          // 避免玩家中途不小心關掉視窗，卻被誤判成「今天玩過了」。
          markWrittenToday();
          // 濃霧背景維持在畫面上不切走，讓結尾畫面淡入蓋在最上層，
          // 明確告訴玩家今天的 Ritual 已經結束，不會停在一片濃霧不知所措
          endGate.classList.add('is-visible');
        } else {
          // 瀏覽模式離開：不需要「今天結束了」的收尾儀式，直接淡出回到
          // 啟動門檻，玩家隨時可以再按「進入森林」回來
          startGate.classList.remove('hidden');
        }
      }
    });
  }

  function goToMainHub(ritualStep, instant, day, existingDiaryCount, showDaytimeFog) {
    const params = { ritualStep: ritualStep };
    if (day) params.day = day;
    if (typeof existingDiaryCount === 'number') params.hasHistory = existingDiaryCount >= 1;
    params.consecutiveBlankDays = getConsecutiveBlankDays();
    if (ritualStep === 'browse') params.showDaytimeFog = !!showDaytimeFog;
    AudioManager.playNightAmbience(); // 進入 Scene_002_MainHub（含 post_planting 從 SeedPlanting 回來後）即接回環境底噪
    SceneManager.goTo(
      'mainhub',
      params,
      handleMainHubComplete,
      instant ? { instant: true } : undefined
    );
  }

  function handleMainHubComplete(reason, payload) {
    if (reason === 'diary_submitted') {
      const diaryText = payload && payload.diaryText;
      const day = incrementDiaryCount();
      // 完全沒寫任何字，種下專屬的「放空日」植物；有寫字才走原本的隨機9種池。
      // Day10-18例外：不管有沒有寫，固定都是伴情之花（plantRandom內部本來
      // 就是依day決定固定配對，不看diaryText內容，這裡只是不要讓它落入
      // plantBlank分支）
      const isHidingArcDay = day >= 10 && day <= 18;
      const plantType = (diaryText || isHidingArcDay)
        ? window.EF.GardenManager.plantRandom(day)
        : window.EF.GardenManager.plantBlank(day);
      // 這次真正送出空白才累加連續天數；有送出任何文字（不管是玩家自己
      // 打的，或是第2次起自動幫忙填的那句）就歸零，回到「乾淨」狀態
      if (diaryText) {
        localStorage.setItem(CONSECUTIVE_BLANK_KEY, '0');
      } else {
        localStorage.setItem(CONSECUTIVE_BLANK_KEY, String(getConsecutiveBlankDays() + 1));
      }
      window.EF.DiaryManager.saveEntry(day, diaryText, plantType);
      refreshDevExtra();
      goToSeedPlanting(diaryText, day);
    } else if (reason === 'farewell') {
      // 回憶期間音樂全程維持background播放（不再中途切回night-ambience），
      // 所以這裡淡出的對象也要對應改成background，交給即將進場的
      // Fog exit 場景接手播放 soft-wind
      AudioManager.stopBackgroundMusic();
      goToFog('exit');
    }
  }

  function goToSeedPlanting(diaryText, day) {
    AudioManager.stopNightAmbience(); // SeedPlanting 播放時暫停環境底噪，避免跟影片本身的音效互相干擾
    // instant: true — 影片第一格內容與 MainHub 背景幾乎一致，跳過淡出淡入避免黑畫面
    SceneManager.goTo('seedPlanting', { diaryText: diaryText }, function onSeedPlantingComplete() {
      // instant: true — SeedPlanting 內部已經淡出至與 MainHub 相同的靜態背景，
      // 這裡再做一次淡入淡出反而會產生多餘的閃爍
      goToMainHub('post_planting', true, day);
    }, { instant: true });
  }
});