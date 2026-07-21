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
  const LAST_PLAY_DATE_KEY = 'ef_lastPlayDate';
  const DEV_BYPASS_GATE_KEY = 'ef_devBypassTimeGate';
  const PLAY_WINDOW_START_HOUR = 18; // 每天 18:00 開放
  const PLAY_WINDOW_END_HOUR = 24;   // 到 24:00（隔天 00:00）為止
  const TIME_GATE_HINT_TEXT = '情緒森林 濃霧散開時間 每天1800~2400';
  const ALREADY_PLAYED_HINT_TEXT = '今天已經來過森林了，明天再回來吧';

  const startGate = document.getElementById('startGate');
  const startGateHint = document.getElementById('startGateHint');
  const startBtn = document.getElementById('startBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const endGate = document.getElementById('endGate');
  const endBtn = document.getElementById('endBtn');
  const devResetBtn = document.getElementById('devResetBtn');
  const devExtra = document.getElementById('devExtra');
  const devBypassCheckbox = document.getElementById('devBypassGate');
  const devSnowBtn = document.getElementById('devSnowBtn');
  const devPetalBtn = document.getElementById('devPetalBtn');

  // ---------------- 遊戲時間限制 ----------------
  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function getTodayDateStr() {
    const d = new Date();
    return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
  }
  function hasPlayedToday() {
    return localStorage.getItem(LAST_PLAY_DATE_KEY) === getTodayDateStr();
  }
  function markPlayedToday() {
    localStorage.setItem(LAST_PLAY_DATE_KEY, getTodayDateStr());
  }
  function isWithinPlayWindow() {
    const hour = new Date().getHours();
    return hour >= PLAY_WINDOW_START_HOUR && hour < PLAY_WINDOW_END_HOUR;
  }
  function isDevBypassOn() {
    return localStorage.getItem(DEV_BYPASS_GATE_KEY) === 'true';
  }

  // 依序檢查：測試開關 → 時間 → 今天是否玩過，更新按鈕可否點擊跟上方提示文字
  function refreshStartGate() {
    if (isDevBypassOn()) {
      startBtn.disabled = false;
      startGateHint.textContent = '';
      return;
    }
    if (!isWithinPlayWindow()) {
      startBtn.disabled = true;
      startGateHint.textContent = TIME_GATE_HINT_TEXT;
      return;
    }
    if (hasPlayedToday()) {
      startBtn.disabled = true;
      startGateHint.textContent = ALREADY_PLAYED_HINT_TEXT;
      return;
    }
    startBtn.disabled = false;
    startGateHint.textContent = '';
  }
  refreshStartGate();
  // 玩家可能提早打開頁面等待時間到，每30秒重新檢查一次，避免要手動重新整理才會解鎖
  setInterval(refreshStartGate, 30000);

  if (devBypassCheckbox) {
    devBypassCheckbox.checked = isDevBypassOn();
    devBypassCheckbox.addEventListener('change', function () {
      localStorage.setItem(DEV_BYPASS_GATE_KEY, devBypassCheckbox.checked ? 'true' : 'false');
      refreshStartGate();
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
  if (devSnowBtn) {
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
  if (devPetalBtn) {
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
  function refreshDevExtra() {
    if (devExtra) devExtra.textContent = 'isFirstEver: ' + isFirstEver() + ' | diaryCount: ' + getDiaryCount();
  }
  refreshDevExtra();

  if (devResetBtn) {
    devResetBtn.addEventListener('click', function () {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(DIARY_COUNT_KEY);
    localStorage.removeItem('ef_gardenEntries'); // 一併清掉花園資料，避免殘留舊植株對不上重置後的天數
    localStorage.removeItem('ef_plantBag'); // 一併清掉洗牌袋
    localStorage.removeItem('ef_lastPlantType'); // 洗牌袋的防連續重複追蹤值，一併清掉避免影響重置後第一株
    localStorage.removeItem('ef_diaryEntries'); // 一併清掉日記歷史，否則「回憶心情」會保留重置前的舊紀錄
    localStorage.removeItem(LAST_PLAY_DATE_KEY); // 一併清掉今日已玩紀錄，方便重複測試
    localStorage.removeItem('ef_playerName'); // 一併清掉存起來的玩家名字
    location.reload();
    });
  }

  startBtn.addEventListener('click', function () {
    if (startBtn.disabled) return; // 時間限制或今天已玩過時，按鈕本身也是disabled，這裡多一層防呆
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

  function beginExperience() {
    goToFog('enter');
  }

  function goToFog(direction) {
    const firstEver = isFirstEver();
    SceneManager.goTo('fog', { direction: direction, isFirstEver: firstEver }, function onFogComplete() {
      if (direction === 'enter') {
        if (firstEver) markSeen();
        refreshDevExtra();
        goToMainHub('greeting', false, null, getDiaryCount());
      } else {
        // exit 完成 = 一次完整 Ritual Loop 結束（寫完日記、道別、穿越濃霧離開）。
        // 「一天只能玩一次」在這裡才算數，而不是一進入森林就算——
        // 避免玩家中途不小心關掉視窗，卻被誤判成「今天玩過了」。
        markPlayedToday();
        // 濃霧背景維持在畫面上不切走，讓結尾畫面淡入蓋在最上層，
        // 明確告訴玩家今天的 Ritual 已經結束，不會停在一片濃霧不知所措
        endGate.classList.add('is-visible');
      }
    });
  }

  function goToMainHub(ritualStep, instant, day, existingDiaryCount) {
    const params = { ritualStep: ritualStep };
    if (day) params.day = day;
    if (typeof existingDiaryCount === 'number') params.hasHistory = existingDiaryCount >= 1;
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
      // 完全沒寫任何字，種下專屬的「放空日」植物；有寫字才走原本的隨機9種池
      const plantType = diaryText
        ? window.EF.GardenManager.plantRandom(day)
        : window.EF.GardenManager.plantBlank(day);
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
