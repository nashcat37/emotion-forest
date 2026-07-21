/* ============================================================
   Scene_002_MainHub v2
   對應規格：41_Component_Spec_Scene002_MainHub.md
   本版新增：
     - 所有對話文字改用共用 typewriter 效果
     - post_planting 改為多段回憶碎片，玩家點擊推進（取代單行自動淡出）
     - 4 個隱藏版 CSS 互動彩蛋（守夜燈／茶壺／湖水／蜜柑）
   ============================================================ */

window.EF = window.EF || {};
window.EF.scenes = window.EF.scenes || {};

window.EF.scenes.mainhub = (function () {

  // 日記回憶雙框的植物名稱＋花語資料。key對應PLANT_TYPES/BLANK_PLANT_TYPE，
  // nameZh/nameEn/language 目前都是空字串佔位，Nash之後會提供實際內容，
  // 到時候只要把對應植物的三個欄位填字就好，不用動版面的程式碼。
  const PLANT_INFO = {
    grape: { nameZh: '葡萄', nameEn: 'Grape', language: '豐盛、富足、恩典與生命的連結' },
    mimosa: { nameZh: '含羞草', nameEn: 'Mimosa', language: '感受性、體貼、感謝' },
    sunflower: { nameZh: '太陽花', nameEn: 'Sunflower', language: '溫暖的陪伴' },
    lavender: { nameZh: '薰衣草', nameEn: 'Lavender', language: '幸福即將到來' },
    dandelion: { nameZh: '蒲公英', nameEn: 'Dandelion', language: '我在遠處為你的幸福而祈禱' },
    rose: { nameZh: '玫瑰', nameEn: 'Rose', language: '一生不變的熱情' },
    orchid: { nameZh: '蘭花', nameEn: 'Orchid', language: '仕途順利' },
    peony: { nameZh: '牡丹', nameEn: 'Peony', language: '浪漫的相遇' },
    camellia: { nameZh: '山茶花', nameEn: 'Camellia', language: '謙遜之美德' },
    puffball: { nameZh: '放空的小棉球', nameEn: 'Not alone Puffball', language: '讓我陪你放空，仰望天空' }
  };

  const COPY = {
    greetingFirstTime: [
      '喵...晚安～ 我是蜜柑～ 你是..?',
      '這裡已經很久沒有旅人出現了...',
      '呼嚕..我還有點想睡，你可以四處看看～',
      '也可以坐在我對面的空搖椅，聽蟲鳴，靜一靜～'
    ],
    greetingReturning: [
      '喵...你回來了。',
      '今天，外面的世界也很不容易吧？'
    ],
    greetingReturningNamed: [
      '喵...{name}～ 你回來了。',
      '今天，外面的世界也很不容易吧？'
    ],
    diaryPlaceholder: '今天過得如何？',
    diaryIntroFirstTime: [
      '我的主人曾跟我說，把每天發生的事情、心情寫下來，就像我在梳理我的毛',
      '它可以撫平我心中的毛躁、不安',
      '什麼都不寫也沒關係，我只要記得....',
      '每段情緒、心情，都有它存在的意義',
      '它們都是一種陪伴唷，喵~'
    ],
    diaryIntroReturning: [
      '有你及你的文字的陪伴真好，抱著日記的我，昨晚睡得更香甜了，喵~'
    ],
    diarySubmitAck: '謝謝你告訴我。',
    diarySubmitAckNamed: '很開心認識你 {name}～ 喵～',
    diarySubmitAckNamedGeneric: '很開心認識你～ 喵～',
    diarySubmitAckBlank: [
      '看來今天很適合放空～',
      '我們一起放空吧～喵～'
    ],
    breathingLines: [
      '看來想在外面的世界生存，果然很不容易...',
      '讓我為你施展個小魔法，我們一起深呼吸三次，把心靜下來。',
      '吸氣～　吐氣～',
      '隨著每次深呼吸，你會感覺心越來越靜',
      '漸漸...你會發現...靜得只聽得到蟲鳴'
    ],
    breathingHolds: [1800, 2200, 2800, 2200, 1800],
    // Day2以後不再每次都接完整深呼吸引導，改用兩組短句依單雙數天交替，
    // 避免每天流程都一樣長。Day2/4/6/8...用even，Day3/5/7/9...用odd
    diarySubmitAckEven: [
      '謝謝你跟我分享',
      '這裡有我，還有你種的情緒植物，我們都是陪伴彼此的好朋友，喵~'
    ],
    diarySubmitAckOdd: [
      '謝謝你讓我知道',
      '寫完之後，心還是有點亂，可再試試之前的小魔法-深呼吸唷~喵~'
    ],
    blankConfirmPrompt: '喵？要現在就送出嗎～ 還是想再想想？',
    chairPawLines: [
      '坐起來很舒服吧～其實這搖椅有魔法喔～',
      '它能幫助我理解你文字中的情緒，產生共鳴'
    ],
    doorLines: [
      '喵~ 隨便進入主人跟我的小屋不太禮貌喔~',
      '等我們熟一點，我再考慮帶你參觀~'
    ],
    stayLines: [
      '喵~我想好好記下你今天的分享，以及你讓我想起的回憶',
      '因為它們同樣珍貴且值得珍藏',
      '你可以多待一會兒，靜靜感受與欣賞'
    ],
    farewellPrompt: '謝謝你今天願意陪著我。你準備好要回去了嗎？',
    farewell: '明天，我還在這裡。',
    mikanIdleReactions: [
      '「喵嗚...（蜜柑輕輕蹭了蹭你的手）」',
      '「呼嚕呼嚕...」',
      '「喵？」'
    ]
  };

  let cleanupFns = [];
  let cancelTypewriter = null;
  let isTyping = false;

  function mount(container, params, onComplete) {
    cleanupFns = [];
    isTyping = false;
    const ritualStep = params.ritualStep || 'greeting';
    const day = params.day || 1;
    const PLAYER_NAME_KEY = 'ef_playerName';
    // 每天(每次mount)只播一次mikan touch diary過場動畫，同一天內重複點擊「回憶心情」不會再重播
    let touchDiaryPlayedToday = false;
    // 每天(每次mount)第一次點擊日記本熱區時，蜜柑先說一段開場白才打開日記面板，
    // 同一天內重複點擊（例如按「先不寫」取消後又點一次）直接開面板，不會重播
    let diaryIntroPlayedToday = false;

    container.classList.add('mainhub-scene');
    container.innerHTML =
      '<div class="mainhub-scene__bg"></div>' +
      '<div class="mainhub-scene__reveal-mask"></div>' +
      '<div class="mainhub-scene__garden"></div>' +
      '<div class="mainhub-scene__snow"></div>' +
      '<div class="mainhub-scene__petal-rain"></div>' +
      '<svg class="mainhub-scene__memory-spotlight" viewBox="0 0 1448 1086" preserveAspectRatio="none">' +
      '  <defs>' +
      '    <filter id="memorySpotlightBlur-' + day + '" x="-50%" y="-50%" width="200%" height="200%">' +
      '      <feGaussianBlur stdDeviation="26"/>' +
      '    </filter>' +
      '    <mask id="memorySpotlightMask-' + day + '" maskUnits="userSpaceOnUse" x="0" y="0" width="1448" height="1086">' +
      '      <rect x="0" y="0" width="1448" height="1086" fill="white"/>' +
      '      <g filter="url(#memorySpotlightBlur-' + day + ')" fill="black">' +
      '        <ellipse class="mainhub-scene__spotlight-hole--mikan"></ellipse>' +
      '        <ellipse class="mainhub-scene__spotlight-hole--chair"></ellipse>' +
      '        <ellipse class="mainhub-scene__spotlight-hole--frame"></ellipse>' +
      '        <ellipse class="mainhub-scene__spotlight-hole--lamp"></ellipse>' +
      '        <rect class="mainhub-scene__spotlight-hole--dialogue"></rect>' +
      '        <ellipse class="mainhub-scene__spotlight-hole--plant"></ellipse>' +
      '      </g>' +
      '    </mask>' +
      '  </defs>' +
      '  <rect class="mainhub-scene__memory-spotlight-fill" x="0" y="0" width="1448" height="1086" mask="url(#memorySpotlightMask-' + day + ')"></rect>' +
      '</svg>' +
      '<img class="mainhub-scene__mikan" alt="" />' +
      '<div class="mainhub-scene__dialogue"><div class="mainhub-scene__dialogue-inner"><span class="mainhub-scene__dialogue-text"></span><span class="mainhub-scene__dialogue-next">▼</span></div></div>' +
      '<div class="mainhub-scene__farewell-choice">' +
      '  <button class="mainhub-scene__farewell-choice-btn mainhub-scene__farewell-choice-btn--leave">道別</button>' +
      '  <button class="mainhub-scene__farewell-choice-btn mainhub-scene__farewell-choice-btn--stay">再待一會</button>' +
      '</div>' +
      '<div class="mainhub-scene__memory-frame">' +
      '  <video class="mainhub-scene__memory-video" autoplay loop muted playsinline></video>' +
      '  <img class="mainhub-scene__memory-img" alt="" style="display:none;" />' +
      '</div>' +
      '<div class="mainhub-scene__hotspot mainhub-scene__hotspot--diary"></div>' +
      '<div class="mainhub-scene__hotspot mainhub-scene__hotspot--farewell"></div>' +
      '<div class="mainhub-scene__hotspot mainhub-scene__hotspot--chair-paw"></div>' +
      '<div class="mainhub-scene__chair-light-orb"></div>' +
      '<div class="mainhub-scene__egg mainhub-scene__egg--lamp"></div>' +
      '<div class="mainhub-scene__egg mainhub-scene__egg--teapot"></div>' +
      '<div class="mainhub-scene__egg mainhub-scene__egg--lake"></div>' +
      '<div class="mainhub-scene__egg mainhub-scene__egg--mikan"></div>' +
      '<div class="mainhub-scene__egg mainhub-scene__egg--door"></div>' +
      '<div class="mainhub-scene__lamp-glow"></div>' +
      '<div class="mainhub-scene__steam"></div>' +
      '<div class="diary-overlay">' +
      '  <div class="diary-overlay__dimmer"></div>' +
      '  <div class="diary-overlay__panel">' +
      '    <textarea class="diary-overlay__input" placeholder="' + COPY.diaryPlaceholder + '"></textarea>' +
      '    <div class="diary-overlay__actions">' +
      '      <button class="diary-overlay__submit">交給蜜柑</button>' +
      '      <button class="diary-overlay__cancel">先不寫</button>' +
      '      <button class="diary-overlay__recall" style="display:none;">回憶心情</button>' +
      '    </div>' +
      '    <div class="diary-overlay__blank-confirm">' +
      '      <p class="diary-overlay__blank-confirm-text">' + COPY.blankConfirmPrompt + '</p>' +
      '      <div class="diary-overlay__blank-confirm-actions">' +
      '        <button class="diary-overlay__blank-confirm-yes">送出</button>' +
      '        <button class="diary-overlay__blank-confirm-no">再想想</button>' +
      '      </div>' +
      '    </div>' +
      '    <div class="diary-overlay__copyright">copyright© 2026 nashcat網站．版權所有</div>' +
      '  </div>' +
      '</div>' +
      '<div class="mainhub-scene__touch-diary-overlay">' +
      '  <div class="mainhub-scene__touch-diary-dimmer"></div>' +
      '  <video class="mainhub-scene__touch-diary-video" src="assets/videos/cine_mikan_touch_diary.mp4" playsinline></video>' +
      '</div>' +
      '<div class="memory-recall-overlay">' +
      '  <div class="memory-recall-overlay__dimmer"></div>' +
      '  <div class="memory-recall-overlay__frames">' +
      '    <div class="memory-recall-overlay__diary-frame">' +
      '      <div class="memory-recall-overlay__diary-half">' +
      '        <div class="memory-recall-overlay__half-header memory-recall-overlay__diary-header"></div>' +
      '        <div class="memory-recall-overlay__diary-text"></div>' +
      '      </div>' +
      '      <div class="memory-recall-overlay__diary-divider"></div>' +
      '      <div class="memory-recall-overlay__diary-half">' +
      '        <div class="memory-recall-overlay__half-header memory-recall-overlay__memory-header"></div>' +
      '        <div class="memory-recall-overlay__memory-text"></div>' +
      '      </div>' +
      '    </div>' +
      '    <div class="memory-recall-overlay__plant-frame">' +
      '      <div class="memory-recall-overlay__plant-name">' +
      '        <div class="memory-recall-overlay__plant-name-zh"></div>' +
      '        <div class="memory-recall-overlay__plant-name-en"></div>' +
      '      </div>' +
      '      <div class="memory-recall-overlay__plant-visual">' +
      '        <video class="memory-recall-overlay__plant-video" autoplay loop muted playsinline></video>' +
      '        <img class="memory-recall-overlay__plant-img" alt="" style="display:none;" />' +
      '      </div>' +
      '      <div class="memory-recall-overlay__plant-language"></div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="memory-recall-overlay__controls">' +
      '    <select class="memory-recall-overlay__date-select"></select>' +
      '    <button class="memory-recall-overlay__start">開始回憶</button>' +
      '    <button class="memory-recall-overlay__end">結束回憶</button>' +
      '  </div>' +
      '</div>';

    const mikanEl = container.querySelector('.mainhub-scene__mikan');
    const bgEl = container.querySelector('.mainhub-scene__bg');
    const snowEl = container.querySelector('.mainhub-scene__snow');
    const petalRainEl = container.querySelector('.mainhub-scene__petal-rain');
    const gardenEl = container.querySelector('.mainhub-scene__garden');
    const revealMask = container.querySelector('.mainhub-scene__reveal-mask');
    // 揭幕黑幕只在 greeting 階段的進場那一刻用一次，post_planting 是同一顆蜜柑
    // 場景的延續模組(重新mount)，不需要也不應該重演揭幕效果，直接隱藏掉
    if (ritualStep !== 'greeting') {
      revealMask.style.display = 'none';
    }
    const dialogueEl = container.querySelector('.mainhub-scene__dialogue');
    dialogueEl.classList.add(ritualStep === 'greeting' ? 'is-greeting' : 'is-post-planting');
    const dialogueTextEl = container.querySelector('.mainhub-scene__dialogue-text');
    const dialogueNextEl = container.querySelector('.mainhub-scene__dialogue-next');
    const farewellChoice = container.querySelector('.mainhub-scene__farewell-choice');
    const farewellLeaveBtn = container.querySelector('.mainhub-scene__farewell-choice-btn--leave');
    const farewellStayBtn = container.querySelector('.mainhub-scene__farewell-choice-btn--stay');
    const memoryFrame = container.querySelector('.mainhub-scene__memory-frame');
    const memoryVideo = container.querySelector('.mainhub-scene__memory-video');
    const memoryImg = container.querySelector('.mainhub-scene__memory-img');
    const lampGlow = container.querySelector('.mainhub-scene__lamp-glow');
    const memorySpotlight = container.querySelector('.mainhub-scene__memory-spotlight');
    const spotlightHoleMikan = container.querySelector('.mainhub-scene__spotlight-hole--mikan');
    const spotlightHoleChair = container.querySelector('.mainhub-scene__spotlight-hole--chair');
    const spotlightHoleFrame = container.querySelector('.mainhub-scene__spotlight-hole--frame');
    const spotlightHoleLamp = container.querySelector('.mainhub-scene__spotlight-hole--lamp');
    const spotlightHoleDialogue = container.querySelector('.mainhub-scene__spotlight-hole--dialogue');
    const spotlightHolePlant = container.querySelector('.mainhub-scene__spotlight-hole--plant');
    const diaryHotspot = container.querySelector('.mainhub-scene__hotspot--diary');
    const farewellHotspot = container.querySelector('.mainhub-scene__hotspot--farewell');
    const chairPawHotspot = container.querySelector('.mainhub-scene__hotspot--chair-paw');
    const chairLightOrb = container.querySelector('.mainhub-scene__chair-light-orb');
    const diaryOverlay = container.querySelector('.diary-overlay');
    const diaryInput = container.querySelector('.diary-overlay__input');
    const diarySubmitBtn = container.querySelector('.diary-overlay__submit');
    const diaryCancelBtn = container.querySelector('.diary-overlay__cancel');
    const diaryActions = container.querySelector('.diary-overlay__actions');
    const blankConfirm = container.querySelector('.diary-overlay__blank-confirm');
    const blankConfirmYesBtn = container.querySelector('.diary-overlay__blank-confirm-yes');
    const blankConfirmNoBtn = container.querySelector('.diary-overlay__blank-confirm-no');
    const diaryRecallBtn = container.querySelector('.diary-overlay__recall');
    const touchDiaryOverlay = container.querySelector('.mainhub-scene__touch-diary-overlay');
    const touchDiaryVideo = container.querySelector('.mainhub-scene__touch-diary-video');

    const recallOverlay = container.querySelector('.memory-recall-overlay');
    const recallDiaryHeader = container.querySelector('.memory-recall-overlay__diary-header');
    const recallDiaryText = container.querySelector('.memory-recall-overlay__diary-text');
    const recallMemoryHeader = container.querySelector('.memory-recall-overlay__memory-header');
    const recallMemoryText = container.querySelector('.memory-recall-overlay__memory-text');
    const recallPlantVideo = container.querySelector('.memory-recall-overlay__plant-video');
    const recallPlantImg = container.querySelector('.memory-recall-overlay__plant-img');
    const recallPlantNameZh = container.querySelector('.memory-recall-overlay__plant-name-zh');
    const recallPlantNameEn = container.querySelector('.memory-recall-overlay__plant-name-en');
    const recallPlantLanguage = container.querySelector('.memory-recall-overlay__plant-language');
    const recallDateSelect = container.querySelector('.memory-recall-overlay__date-select');
    const recallStartBtn = container.querySelector('.memory-recall-overlay__start');
    const recallEndBtn = container.querySelector('.memory-recall-overlay__end');

    // mp4優先、載入失敗（例如素材還沒做好mp4版本）自動fallback回PNG的共用邏輯。
    // GIF已經淘汰，靜態素材固定用PNG當保底，不會再有破圖。
    function setMp4WithPngFallback(videoEl, imgEl, baseSrcWithoutExt) {
      imgEl.style.display = 'none';
      videoEl.style.display = '';
      videoEl.onerror = function () {
        videoEl.onerror = null;
        videoEl.style.display = 'none';
        imgEl.style.display = '';
        imgEl.src = baseSrcWithoutExt + '.png';
      };
      videoEl.src = baseSrcWithoutExt + '.mp4';
      videoEl.load();
      videoEl.play().catch(function () {
        // 極少見：mp4存在但play()被瀏覽器擋下，保守起見一樣fallback回PNG，
        // 避免玩家看到一個完全靜止、對不上進度的黑框
        videoEl.style.display = 'none';
        imgEl.style.display = '';
        imgEl.src = baseSrcWithoutExt + '.png';
      });
    }



    let currentPose = 'idle';
    function setMikan(pose) {
      currentPose = pose;
      mikanEl.src = 'assets/images/characters/char_mikan_' + pose + '.png';
    }

    // ---------------- 對話文字（打字機效果） ----------------
    function showDialogue(text, onComplete2) {
      if (cancelTypewriter) cancelTypewriter();
      dialogueEl.classList.add('is-visible');
      dialogueNextEl.classList.remove('is-visible');
      isTyping = true;
      cancelTypewriter = window.EF.typewriter(text, dialogueTextEl, {
        speed: 110,
        onComplete: function () {
          isTyping = false;
          cancelTypewriter = null;
          if (onComplete2) onComplete2();
        }
      });
    }

    function hideDialogue() {
      dialogueEl.classList.remove('is-visible');
      dialogueNextEl.classList.remove('is-visible');
    }

    // ---------------- 隱藏版互動彩蛋（4 個） ----------------
    function setupEasterEggs() {
      const lampEgg = container.querySelector('.mainhub-scene__egg--lamp');
      const teapotEgg = container.querySelector('.mainhub-scene__egg--teapot');
      const lakeEgg = container.querySelector('.mainhub-scene__egg--lake');
      const mikanEgg = container.querySelector('.mainhub-scene__egg--mikan');
      const doorEgg = container.querySelector('.mainhub-scene__egg--door');
      const steam = container.querySelector('.mainhub-scene__steam');

      function onLampClick() {
        lampGlow.classList.add('is-pulsing');
        const t = setTimeout(function () { lampGlow.classList.remove('is-pulsing'); }, 1500);
        cleanupFns.push(function () { clearTimeout(t); });
      }
      lampEgg.addEventListener('click', onLampClick);
      cleanupFns.push(function () { lampEgg.removeEventListener('click', onLampClick); });

      function onTeapotClick() {
        steam.classList.add('is-active');
        const t = setTimeout(function () { steam.classList.remove('is-active'); }, 3000);
        cleanupFns.push(function () { clearTimeout(t); });
      }
      teapotEgg.addEventListener('click', onTeapotClick);
      cleanupFns.push(function () { teapotEgg.removeEventListener('click', onTeapotClick); });

      function onLakeClick(e) {
        const rect = container.getBoundingClientRect();
        const ripple = document.createElement('div');
        ripple.className = 'mainhub-scene__ripple';
        ripple.style.left = (e.clientX - rect.left) + 'px';
        ripple.style.top = (e.clientY - rect.top) + 'px';
        container.appendChild(ripple);
        ripple.addEventListener('animationend', function () { ripple.remove(); });
      }
      lakeEgg.addEventListener('click', onLakeClick);
      cleanupFns.push(function () { lakeEgg.removeEventListener('click', onLakeClick); });

      // GIF 只有 5 幀、總長 11000ms，且原始檔案是無限循環（loop=0），
      // 瀏覽器沒辦法只播一輪就自動停，這裡用計時器手動控制「播一輪後切回靜態圖」
      const MIKAN_GIF_DURATION_MS = 11000;
      let gifPlaying = false;

      function onMikanPat() {
        if (isTyping) return;
        if (gifPlaying) return; // 播放中不重複觸發，避免疊加計時器造成提前或延後恢復
        // 不打斷正式 Ritual 對話，只在蜜柑「安靜待著」時才有反應
        const line = COPY.mikanIdleReactions[Math.floor(Math.random() * COPY.mikanIdleReactions.length)];
        const original = dialogueTextEl.innerText;
        const wasVisible = dialogueEl.classList.contains('is-visible');

        gifPlaying = true;
        const poseBeforeGif = currentPose;
        mikanEl.src = 'assets/images/characters/char_mikan_idle.gif';
        const gifTimer = setTimeout(function () {
          gifPlaying = false;
          setMikan(poseBeforeGif);
        }, MIKAN_GIF_DURATION_MS);
        cleanupFns.push(function () { clearTimeout(gifTimer); });

        showDialogue(line, function () {
          const t = setTimeout(function () {
            if (wasVisible) {
              dialogueTextEl.innerText = original;
            } else {
              hideDialogue();
            }
          }, 1800);
          cleanupFns.push(function () { clearTimeout(t); });
        });
      }
      mikanEgg.addEventListener('click', onMikanPat);
      cleanupFns.push(function () { mikanEgg.removeEventListener('click', onMikanPat); });

      // 木門彩蛋：目前小屋內部還沒有場景，這裡先做蜜柑婉拒帶路的兩句對話，
      // 為未來新增「小屋內場景」預留伏筆。跟蜜柑彩蛋一樣不打斷正式Ritual對話，
      // 播完後恢復原本畫面上顯示的對話內容（如果原本有的話）
      let doorPlaying = false;
      function onDoorClick() {
        if (isTyping) return;
        if (doorPlaying) return;
        const original = dialogueTextEl.innerText;
        const wasVisible = dialogueEl.classList.contains('is-visible');
        doorPlaying = true;

        function playDoorLine(i) {
          const isLast = i === COPY.doorLines.length - 1;
          showDialogue(COPY.doorLines[i], function () {
            const holdMs = isLast ? 1800 : 1600;
            const tHold = setTimeout(function () {
              if (isLast) {
                doorPlaying = false;
                if (wasVisible) {
                  dialogueTextEl.innerText = original;
                } else {
                  hideDialogue();
                }
              } else {
                playDoorLine(i + 1);
              }
            }, holdMs);
            cleanupFns.push(function () { clearTimeout(tHold); });
          });
        }
        playDoorLine(0);
      }
      doorEgg.addEventListener('click', onDoorClick);
      cleanupFns.push(function () { doorEgg.removeEventListener('click', onDoorClick); });
    }
    // ---------------- 花園渲染 ----------------
    // 每次 mount（greeting 或 post_planting）都重新畫一次，確保花圃狀態永遠是最新的。
    // GardenManager 只負責邏輯，畫面全部由這裡處理。
    let todaysPlantSlot = null; // {left, top} 百分比，供回憶聚光燈鎖定「今天產生的diaryplant」

    function renderGarden() {
      gardenEl.innerHTML = '';
      const layout = window.EF.GardenManager.getGardenLayout();
      layout.forEach(function (entry) {
        const img = document.createElement('img');
        img.className = 'mainhub-scene__garden-plant mainhub-scene__garden-plant--' + entry.plantType;
        // 優先嘗試 GIF（若該植物有做動態版本），載入失敗自動 fallback 回 PNG
        img.onerror = function () {
          img.onerror = null;
          img.src = 'assets/images/plants/plant_' + entry.plantType + '.png';
        };
        img.src = 'assets/images/plants/plant_' + entry.plantType + '.gif';
        img.style.left = entry.slot.left + '%';
        img.style.top = entry.slot.top + '%';
        gardenEl.appendChild(img);
        if (entry.day === day) {
          todaysPlantSlot = entry.slot;
        }
      });
    }
    renderGarden();

    // ---------------- 異常天氣：下雪／花瓣雨 ----------------
    // 刻意走克制路線：粒子少、飄得慢、透明度低，若有似無，不是滿版狂下的
    // 天氣系統。雪用純CSS圓點，花瓣雨用Nash提供的petal.png/petal-1.png
    // 兩張圖片交替使用，兩者共用同一套飄落動畫邏輯(weatherFall)，只是
    // 渲染出來的粒子外觀不同。
    function createWeatherParticles(container, count, particleClass, useImages) {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const particle = document.createElement(useImages ? 'img' : 'div');
        particle.className = particleClass;
        if (useImages) {
          // 兩張花瓣圖交替使用，增加一點自然的隨機感，不會每片花瓣長得一模一樣
          particle.src = 'assets/images/weather/' + (i % 2 === 0 ? 'petal.png' : 'petal-1.png');
        }
        const size = useImages ? (14 + Math.random() * 10) : (3 + Math.random() * 4); // 花瓣14~24px，雪花3~7px
        const left = Math.random() * 100;
        const duration = 9 + Math.random() * 8; // 9~17秒，飄得慢
        const delay = Math.random() * duration;
        // 花瓣雨的透明度範圍獨立調高（整體降低透明感約20%），讓花瓣比雪花更明顯；
        // 雪花維持原本偏淡的設定不變
        const opacity = useImages ? (0.55 + Math.random() * 0.35) : (0.35 + Math.random() * 0.35);
        const rotateSpeed = 4 + Math.random() * 6; // 花瓣旋轉週期4~10秒
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = left + '%';
        // 負值delay：讓一開場粒子就已經散布在畫面各處飄落中，
        // 不會全部從頂端同時掉落顯得不自然
        particle.style.animationDelay = '-' + delay + 's';
        particle.style.setProperty('--flake-opacity', opacity);
        if (useImages) {
          // 花瓣用CSS變數分別控制飄落跟旋轉的速度（CSS裡animation-duration
          // 用逗號分隔對應petalFall/petalRotate兩個動畫），不能直接用
          // style.animationDuration覆蓋，那樣會把雙數值設定蓋成單一數值
          particle.style.setProperty('--fall-duration', duration + 's');
          particle.style.setProperty('--rotate-duration', rotateSpeed + 's');
        } else {
          particle.style.animationDuration = duration + 's';
        }
        frag.appendChild(particle);
      }
      container.appendChild(frag);
    }
    function showSnow() {
      if (!snowEl.hasChildNodes()) {
        createWeatherParticles(snowEl, 25, 'mainhub-scene__snowflake', false);
      }
      snowEl.classList.add('is-active');
    }
    function hideSnow() {
      snowEl.classList.remove('is-active');
    }
    function showPetalRain() {
      if (!petalRainEl.hasChildNodes()) {
        createWeatherParticles(petalRainEl, 20, 'mainhub-scene__petal', true);
      }
      petalRainEl.classList.add('is-active');
    }
    function hidePetalRain() {
      petalRainEl.classList.remove('is-active');
    }
    // 暫存給 dev panel 的測試按鈕用（手動預覽/強制開關，跟下面的自動觸發並存）
    window.EF.mainhubDevControls = {
      showSnow: showSnow, hideSnow: hideSnow,
      showPetalRain: showPetalRain, hidePetalRain: hidePetalRain
    };
    cleanupFns.push(function () { window.EF.mainhubDevControls = null; });

    // 異常天氣：每3天出現一次（day是3的倍數），雪跟花瓣雨輪流交替
    // （day除以3是奇數次輪替出現雪、偶數次出現花瓣雨），兩者互斥不會同時出現。
    // greeting跟post_planting都會用到同一個day，所以同一天的整段時間
    // 天氣狀態會保持一致，不會兩階段對不上
    if (day % 3 === 0) {
      const cycleIndex = day / 3; // 第1次、第2次、第3次...輪到異常天氣
      if (cycleIndex % 2 === 1) {
        showSnow();
      } else {
        showPetalRain();
      }
    }

    // 從日記文字裡抓玩家自稱的名字（「我是xxx」「我叫xxx」「我(的)名字是xxx」），
    // 純粹是簡單的關鍵字規則比對，不是真正理解語意，抓不準或抓錯都是預期內的
    // 小彩蛋等級功能，不影響任何遊戲邏輯，只影響蜜柑Day1那一句要不要帶名字
    function extractPlayerName(text) {
      if (!text) return null;
      const patterns = [
        /我(?:的)?名字(?:是|叫)([^\s，,。.！!～~\n]{1,6})/,
        /我叫([^\s，,。.！!～~\n]{1,6})/,
        /我是([^\s，,。.！!～~\n]{1,6})/
      ];
      for (let i = 0; i < patterns.length; i++) {
        const m = text.match(patterns[i]);
        if (m && m[1]) {
          const name = m[1].trim();
          if (name) return name;
        }
      }
      return null;
    }

    // ---------------- 回憶場景聚光燈效果 ----------------
    // 把百分比座標(left/top/width/height，對應1448x1086的固定畫布)轉成SVG的
    // cx/cy/rx/ry(橢圓)或x/y/width/height(矩形)，設定到聚光燈遮罩的挖洞形狀上
    function setSpotlightEllipse(el, leftPct, topPct, widthPct, heightPct) {
      const cx = (leftPct + widthPct / 2) / 100 * 1448;
      const cy = (topPct + heightPct / 2) / 100 * 1086;
      el.setAttribute('cx', cx);
      el.setAttribute('cy', cy);
      el.setAttribute('rx', widthPct / 100 * 1448 / 2);
      el.setAttribute('ry', heightPct / 100 * 1086 / 2);
    }
    function setSpotlightRect(el, leftPct, topPct, widthPct, heightPct) {
      el.setAttribute('x', leftPct / 100 * 1448);
      el.setAttribute('y', topPct / 100 * 1086);
      el.setAttribute('width', widthPct / 100 * 1448);
      el.setAttribute('height', heightPct / 100 * 1086);
      el.setAttribute('rx', 30);
    }

    function layoutMemorySpotlight() {
      // 蜜柑：座標是從Nash標記的實際截圖用像素分析算出來的（換算回1448x1086
      // 畫布後約 left:67.5% top:41.75% width:15.38% height:23.75%），這裡
      // 稍微放大一點當作柔邊挖洞的範圍，讓模糊邊緣不會太貼著蜜柑的輪廓
      setSpotlightEllipse(spotlightHoleMikan, 65, 40, 20, 28);
      // 空搖椅：範圍比貓掌熱區大很多(貓掌只是椅背上的一個小圖案)，這裡是
      // 用你之前傳的標記截圖目測整張搖椅大概的範圍，還沒精確測過，一樣
      // 需要之後用標記截圖幫忙校正
      setSpotlightEllipse(spotlightHoleChair, 14, 38, 28, 36);
      // 回憶插圖框：沿用.mainhub-scene__memory-frame既有精確座標
      setSpotlightEllipse(spotlightHoleFrame, 53.5, 12, 14, 30);
      // 守夜燈：沿用.mainhub-scene__lamp-glow既有精確座標
      setSpotlightEllipse(spotlightHoleLamp, 34, 23, 11, 18);
      // 對話框：沿用post_planting對話框的固定區域(top:45% bottom:35%，
      // 即45%~65%這個帶狀範圍)，用矩形整段覆蓋，不用逐字精算文字實際大小
      setSpotlightRect(spotlightHoleDialogue, 13, 45, 74, 20);
      // 今天產生的diaryplant：位置是動態的(依當天版位決定)，錨點是植物圖片的
      // 「底部中心」，所以中心點要往上抬半個估計高度，才會對準花朵本體而不是根部
      if (todaysPlantSlot) {
        setSpotlightEllipse(spotlightHolePlant, todaysPlantSlot.left - 4, todaysPlantSlot.top - 16, 8, 16);
      }
    }

    function showMemorySpotlight() {
      layoutMemorySpotlight();
      memorySpotlight.classList.add('is-visible');
    }
    function hideMemorySpotlight() {
      memorySpotlight.classList.remove('is-visible');
    }

    // ---------------- 回憶心情介面 ----------------
    function formatTimestamp(ts) {
      const d = new Date(ts);
      const pad = function (n) { return n < 10 ? '0' + n : String(n); };
      return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + '  ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
    }

    function renderRecallDay(recallDay) {
      const entry = window.EF.DiaryManager.getEntry(recallDay);
      if (!entry) return;
      const dayStr = recallDay < 10 ? '0' + recallDay : String(recallDay);

      recallDiaryHeader.textContent = '#Day ' + dayStr + '   ' + formatTimestamp(entry.timestamp);
      recallDiaryText.textContent = entry.text || '（這天沒有留下文字）';

      const memoryTitle = window.EF.MemoryManager.getMemoryTitleForDay(recallDay);
      const memoryLines = window.EF.MemoryManager.getMemoryForDay(recallDay);
      recallMemoryHeader.textContent = '#Day ' + dayStr + '   ' + memoryTitle;
      recallMemoryText.textContent = memoryLines.join('\n\n');

      setMp4WithPngFallback(recallPlantVideo, recallPlantImg, 'assets/images/diaryplants/diaryplant_' + entry.plantType);

      const info = PLANT_INFO[entry.plantType] || { nameZh: '', nameEn: '', language: '' };
      recallPlantNameZh.textContent = info.nameZh;
      recallPlantNameEn.textContent = info.nameEn;
      recallPlantLanguage.textContent = info.language ? '～' + info.language + '～' : '';
    }

    function openRecallOverlay() {
      const days = window.EF.DiaryManager.getAvailableDays();
      if (days.length === 0) return;
      // 先讓 overlay 可見再填入下拉選單內容：overlay 開啟前是 opacity:0，
      // 部分瀏覽器在元素尚未真正可見時填入 <select> 的 option，會導致選單文字
      // 要等使用者游標移入或用鍵盤切換過一次才會顯示，這裡調整順序修正這個問題。
      recallOverlay.classList.add('is-open');
      recallDateSelect.innerHTML = days.map(function (d) {
        return '<option value="' + d + '">第 ' + d + ' 天</option>';
      }).join('');
      const mostRecent = window.EF.DiaryManager.getMostRecentDay();
      recallDateSelect.value = String(mostRecent);
      renderRecallDay(mostRecent);
    }

    function playTouchDiaryThenOpenRecall() {
      touchDiaryOverlay.classList.add('is-open');
      // 這支影片每次mount只會被觸發播放一次（touchDiaryPlayedToday旗標保證），
      // 永遠是全新、還沒播放過的狀態，本來就是從片頭開始，不需要額外呼叫
      // load() 重置。刻意拿掉這個動作，是因為它會讓 play() 呼叫的時機點
      // 離玩家點擊「回憶心情」的當下更遠——這支影片跟seed planting一樣
      // 帶音軌，在iOS Safari嚴格的自動播放政策下，只要不是緊貼著使用者
      // 手勢同步呼叫，就容易被判定成不合規而擋下播放。拿掉load()讓
      // play() 更貼近點擊當下，降低被擋的機率
      touchDiaryVideo.play().catch(function (err) {
        console.warn('[MainHub] touch diary 動畫播放失敗（可能是iOS嚴格自動播放政策擋下），略過動畫直接進入回憶介面：', err);
        finishTouchDiary();
      });
    }

    function finishTouchDiary() {
      touchDiaryOverlay.classList.remove('is-open');
      touchDiaryVideo.pause();
      openRecallOverlay();
    }

    function onTouchDiaryEnded() {
      finishTouchDiary();
    }
    touchDiaryVideo.addEventListener('ended', onTouchDiaryEnded);
    cleanupFns.push(function () { touchDiaryVideo.removeEventListener('ended', onTouchDiaryEnded); });

    function setupRecallOverlay() {
      function onRecallOpen() {
        diaryOverlay.classList.remove('is-open');
        // 只有「回憶心情」需要蜜柑先碰觸日記本，才會有雙方的回憶＋會動的日記植物；
        // 平常寫今天的日記不需要這個動作，玩家碰觸日記本就能直接寫。
        // 這個過場動畫每天只播一次，同一天內重複點擊「回憶心情」直接開回憶介面。
        if (touchDiaryPlayedToday) {
          openRecallOverlay();
        } else {
          touchDiaryPlayedToday = true;
          playTouchDiaryThenOpenRecall();
        }
      }
      diaryRecallBtn.addEventListener('click', onRecallOpen);
      cleanupFns.push(function () { diaryRecallBtn.removeEventListener('click', onRecallOpen); });

      function onStart() {
        const selectedDay = parseInt(recallDateSelect.value, 10);
        renderRecallDay(selectedDay);
      }
      recallStartBtn.addEventListener('click', onStart);
      cleanupFns.push(function () { recallStartBtn.removeEventListener('click', onStart); });

      function onEnd() {
        recallOverlay.classList.remove('is-open');
        diaryOverlay.classList.add('is-open');
      }
      recallEndBtn.addEventListener('click', onEnd);
      cleanupFns.push(function () { recallEndBtn.removeEventListener('click', onEnd); });
    }
    setupRecallOverlay();

    setupEasterEggs();

    if (ritualStep === 'greeting') {
      runGreeting();
    } else {
      runPostPlanting();
    }

    // ---------------- ritualStep: greeting ----------------
    function runGreeting() {
      if (params.hasHistory) {
        diaryRecallBtn.style.display = '';
      }

      // 開場揭幕：離開濃霧進場的瞬間，畫面幾乎全黑，只有守夜燈位置透出一點光；
      // 隨著守夜燈的光暈慢慢亮起，黑幕跟著淡出，背景才逐漸顯現全貌——呼應
      // 「所有魔法都源自守夜燈」的世界觀，讓玩家先注意到燈，而不是一次看到全部畫面
      mikanEl.style.opacity = '0';
      mikanEl.style.transition = 'opacity 2s ease';

      const tLamp = setTimeout(function () {
        lampGlow.classList.add('is-steady');
        revealMask.classList.add('is-hidden');
      }, 600);
      cleanupFns.push(function () { clearTimeout(tLamp); });

      const tMikan = setTimeout(function () {
        setMikan('idle');
        mikanEl.style.opacity = '1';
      }, 4800);
      cleanupFns.push(function () { clearTimeout(tMikan); });

      const storedPlayerName = localStorage.getItem(PLAYER_NAME_KEY);
      const greetingLines = params.hasHistory
        ? (storedPlayerName
          ? COPY.greetingReturningNamed.map(function (line) { return line.replace('{name}', storedPlayerName); })
          : COPY.greetingReturning)
        : COPY.greetingFirstTime;
      let greetIndex = 0;

      function playGreetingLine(i) {
        const isLast = i === greetingLines.length - 1;
        if (isLast) {
          // 最後一句不需要玩家再點一次才會結束，取消點擊監聽
          dialogueEl.removeEventListener('click', onGreetingDialogueClick);
        }
        showDialogue(greetingLines[i], function () {
          if (isLast) {
            // 最後一句文字打完，直接進入下一步：日記本熱區亮起，
            // 停留1秒後對話框自動淡出，不用再等玩家多點一次
            diaryHotspot.classList.add('is-available');
            chairPawHotspot.classList.add('is-available');
            const tFade = setTimeout(function () {
              hideDialogue();
            }, 1000);
            cleanupFns.push(function () { clearTimeout(tFade); });
          } else {
            dialogueNextEl.classList.add('is-visible');
          }
        });
      }

      function onGreetingDialogueClick() {
        if (isTyping) return;
        if (greetIndex < greetingLines.length - 1) {
          greetIndex++;
          playGreetingLine(greetIndex);
        }
      }
      dialogueEl.addEventListener('click', onGreetingDialogueClick);
      cleanupFns.push(function () { dialogueEl.removeEventListener('click', onGreetingDialogueClick); });

      const t1 = setTimeout(function () {
        playGreetingLine(0);
      }, 5800);
      cleanupFns.push(function () { clearTimeout(t1); });

      function openDiaryPanelForReal() {
        diaryOverlay.classList.add('is-open');
        blankConfirm.classList.remove('is-visible');
        diaryActions.style.display = '';
        diaryInput.disabled = false;
        diaryInput.placeholder = COPY.diaryPlaceholder;
        diaryInput.focus();
      }

      function playDiaryIntro() {
        const lines = params.hasHistory ? COPY.diaryIntroReturning : COPY.diaryIntroFirstTime;
        // Day2+ 那句提到「抱著日記的我」，蜜柑講這句話時順勢切換成抱日記姿勢，
        // 呼應文字內容；Day1 開場白沒有提到這個動作，維持原本idle姿勢
        if (params.hasHistory) {
          setMikan('hold_diary');
        }

        function onIntroClick() {
          if (isTyping) return;
          if (introIndex < lines.length - 1) {
            introIndex++;
            playIntroLine(introIndex);
          }
        }
        let introIndex = 0;

        function playIntroLine(i) {
          const isLast = i === lines.length - 1;
          if (isLast) {
            dialogueEl.removeEventListener('click', onIntroClick);
          }
          showDialogue(lines[i], function () {
            if (isLast) {
              const tDone = setTimeout(function () {
                hideDialogue();
                setMikan('listening'); // 開場白說完，準備聽玩家寫的內容
                diaryHotspot.classList.add('is-available'); // 恢復可點擊，避免之後取消日記(先不寫)後點不開日記本
                openDiaryPanelForReal();
              }, 1400);
              cleanupFns.push(function () { clearTimeout(tDone); });
            } else {
              dialogueNextEl.classList.add('is-visible');
            }
          });
        }
        dialogueEl.addEventListener('click', onIntroClick);
        cleanupFns.push(function () { dialogueEl.removeEventListener('click', onIntroClick); });
        playIntroLine(0);
      }

      function onDiaryHotspotClick() {
        if (!diaryHotspot.classList.contains('is-available')) return;
        if (!diaryIntroPlayedToday) {
          diaryIntroPlayedToday = true;
          diaryHotspot.classList.remove('is-available'); // 開場白播放期間先不給點，播完openDiaryPanelForReal會直接開面板，不依賴這個class
          playDiaryIntro();
        } else {
          openDiaryPanelForReal();
        }
      }
      diaryHotspot.addEventListener('click', onDiaryHotspotClick);
      cleanupFns.push(function () { diaryHotspot.removeEventListener('click', onDiaryHotspotClick); });

      // 空搖椅貓掌：每天第一次點擊時，蜜柑說兩句話，接著飛一顆光球到日記本，
      // 把日記本「點亮」得更明顯。不影響日記本原本就能點擊的邏輯，純粹是
      // 錦上添花的引導效果，就算玩家沒發現這個彩蛋，日記本一樣能正常使用。
      function onChairPawClick() {
        if (!chairPawHotspot.classList.contains('is-available')) return;
        chairPawHotspot.classList.remove('is-available');

        function playChairLine(i) {
          const isLast = i === COPY.chairPawLines.length - 1;
          showDialogue(COPY.chairPawLines[i], function () {
            const holdMs = isLast ? 500 : 1600;
            const tHold = setTimeout(function () {
              if (isLast) {
                hideDialogue();
                flyLightOrbToDiary();
              } else {
                playChairLine(i + 1);
              }
            }, holdMs);
            cleanupFns.push(function () { clearTimeout(tHold); });
          });
        }
        playChairLine(0);
      }
      chairPawHotspot.addEventListener('click', onChairPawClick);
      cleanupFns.push(function () { chairPawHotspot.removeEventListener('click', onChairPawClick); });

      function flyLightOrbToDiary() {
        // FLIP技巧：先瞬間(無transition)定位到貓掌位置，強制重繪一次，
        // 再啟用transition位移到日記本位置，這樣才會有真正的飛行動畫，
        // 不然直接改座標配合transition，瀏覽器可能會把兩次改動合併成一次
        const startLeft = chairPawHotspot.offsetLeft + chairPawHotspot.offsetWidth / 2;
        const startTop = chairPawHotspot.offsetTop + chairPawHotspot.offsetHeight / 2;
        const endLeft = diaryHotspot.offsetLeft + diaryHotspot.offsetWidth / 2;
        const endTop = diaryHotspot.offsetTop + diaryHotspot.offsetHeight / 2;

        chairLightOrb.style.transition = 'none';
        chairLightOrb.style.left = startLeft + 'px';
        chairLightOrb.style.top = startTop + 'px';
        chairLightOrb.classList.add('is-visible');
        void chairLightOrb.offsetWidth; // 強制重繪，確保起點先定位好

        chairLightOrb.style.transition = 'left 1.3s ease-in-out, top 1.3s ease-in-out, opacity 1.3s ease-in-out';
        chairLightOrb.style.left = endLeft + 'px';
        chairLightOrb.style.top = endTop + 'px';

        const tArrive = setTimeout(function () {
          chairLightOrb.classList.remove('is-visible');
          diaryHotspot.classList.add('is-chair-lit');
        }, 1400);
        cleanupFns.push(function () { clearTimeout(tArrive); });
      }

      function onCancel() {
        diaryOverlay.classList.remove('is-open');
        diaryInput.value = '';
      }
      diaryCancelBtn.addEventListener('click', onCancel);
      cleanupFns.push(function () { diaryCancelBtn.removeEventListener('click', onCancel); });

      function playAckSequence(lines, diaryTextValue, holds) {
        function playAckLine(i) {
          const isLast = i === lines.length - 1;
          showDialogue(lines[i], function () {
            const defaultHold = isLast ? 1400 : 1500;
            const holdMs = (holds && holds[i] !== undefined) ? holds[i] : defaultHold;
            const tHold = setTimeout(function () {
              if (isLast) {
                onComplete('diary_submitted', { diaryText: diaryTextValue });
              } else {
                playAckLine(i + 1);
              }
            }, holdMs);
            cleanupFns.push(function () { clearTimeout(tHold); });
          });
        }
        playAckLine(0);
      }

      function proceedWithSubmit(diaryText) {
        diaryOverlay.classList.remove('is-open');
        diaryHotspot.classList.remove('is-available');
        setMikan('listening');

        if (diaryText === '') {
          // 什麼都沒寫也送出：今天很適合放空，兩句對話，不需要深呼吸這段
          // （放空本身已經是靜下來的狀態，接深呼吸反而多餘）
          playAckSequence(COPY.diarySubmitAckBlank, diaryText);
        } else if (!params.hasHistory) {
          // Day1 第一次寫日記：先回應名字，再接「謝謝你告訴我」，
          // 最後接上深呼吸延伸對話，幫玩家把剛剛寫日記的情緒波動慢慢沉澱下來
          const name = extractPlayerName(diaryText);
          if (name) {
            localStorage.setItem(PLAYER_NAME_KEY, name); // 存起來給Day2+的問候語用
          }
          const nameLine = name ? COPY.diarySubmitAckNamed.replace('{name}', name) : COPY.diarySubmitAckNamedGeneric;
          const lines = [nameLine, COPY.diarySubmitAck].concat(COPY.breathingLines);
          const holds = [undefined, undefined].concat(COPY.breathingHolds);
          playAckSequence(lines, diaryText, holds);
        } else {
          // Day2以後：依單雙數天交替兩組短句，取代原本固定接完整深呼吸引導，
          // 避免每天流程都一樣長。day是偶數(2/4/6/8...)用Even，
          // 奇數(3/5/7/9...)用Odd，播完直接接seed planting動畫
          const lines = day % 2 === 0 ? COPY.diarySubmitAckEven : COPY.diarySubmitAckOdd;
          playAckSequence(lines, diaryText);
        }
      }

      function onSubmit() {
        const diaryText = diaryInput.value.trim();
        if (diaryText === '') {
          // 完全空白時不直接送出，先讓蜜柑輕輕確認一次，避免手滑誤觸就
          // 觸發「放空日」——按鈕本身完全不鎖，玩家還是可以什麼都不寫，
          // 只是多一步確認，降低純粹手滑的風險。
          // 二次確認顯示期間把輸入框鎖住、清空提示文字，避免玩家趁這個
          // 空檔打字，導致畫面上看起來有內容、但送出的其實還是空白值
          diaryActions.style.display = 'none';
          blankConfirm.classList.add('is-visible');
          diaryInput.disabled = true;
          diaryInput.placeholder = '';
          return;
        }
        proceedWithSubmit(diaryText);
      }
      diarySubmitBtn.addEventListener('click', onSubmit);
      cleanupFns.push(function () { diarySubmitBtn.removeEventListener('click', onSubmit); });

      function onBlankConfirmYes() {
        blankConfirm.classList.remove('is-visible');
        diaryInput.disabled = false;
        diaryInput.placeholder = COPY.diaryPlaceholder;
        proceedWithSubmit('');
      }
      blankConfirmYesBtn.addEventListener('click', onBlankConfirmYes);
      cleanupFns.push(function () { blankConfirmYesBtn.removeEventListener('click', onBlankConfirmYes); });

      function onBlankConfirmNo() {
        blankConfirm.classList.remove('is-visible');
        diaryActions.style.display = '';
        diaryInput.disabled = false;
        diaryInput.placeholder = COPY.diaryPlaceholder;
        diaryInput.focus();
      }
      blankConfirmNoBtn.addEventListener('click', onBlankConfirmNo);
      cleanupFns.push(function () { blankConfirmNoBtn.removeEventListener('click', onBlankConfirmNo); });
    }

    // ---------------- ritualStep: post_planting ----------------
    function runPostPlanting() {
      setMikan('listening');
      // 明確關閉日記本熱區：post_planting 階段今天的日記已經寫過了，
      // 不應該再被點開（回憶心情功能仍保留，但那是綁在日記輸入面板裡，
      // 只有 greeting 階段打開日記本時才看得到，不受這裡影響）
      diaryHotspot.classList.remove('is-available');

      const fragments = window.EF.MemoryManager.getMemoryForDay(day);
      const imgDay = window.EF.MemoryManager.getMemoryImageDay(day);
      const imgDayStr = imgDay < 10 ? '0' + imgDay : String(imgDay);
      let index = 0;

      const t1 = setTimeout(function () {
        setMikan('memory');
        // 魔法的高點：情緒變成植物、蜜柑想起回憶的魔幻時刻，切到拉高情緒的陪伴音樂
        if (window.EF.AudioManager) window.EF.AudioManager.switchToBackgroundMusic();
        // 聚光燈效果：把注意力集中到蜜柑、搖椅、回憶框、守夜燈、對話框、
        // 今天的植物，其餘背景暗下去；同時讓蜜柑跟回憶框帶一層柔光
        showMemorySpotlight();
        mikanEl.classList.add('is-memory-glow');
        memoryFrame.classList.add('is-memory-glow');
        dialogueEl.classList.add('is-memory-glow');
        // 優先嘗試 mp4（若該天有做動態版本），載入失敗自動 fallback 回 PNG，
        // 這樣你可以陸續把部分天數換成 mp4，不用一次全部轉換，也不用改程式碼
        setMp4WithPngFallback(memoryVideo, memoryImg, 'assets/images/memories/memory_day' + imgDayStr);
        memoryFrame.classList.add('is-visible');
        playFragment(index);
      }, 1500);
      cleanupFns.push(function () { clearTimeout(t1); });

      function playFragment(i) {
        showDialogue(fragments[i], function () {
          dialogueNextEl.classList.add('is-visible');
        });
      }

      function onDialogueClick() {
        if (isTyping) return; // 逐字輸出中不回應點擊，避免搶話
        if (index < fragments.length - 1) {
          index++;
          playFragment(index);
        } else {
          // 回憶片段播完，蜜柑從「回憶中」切回「當下」，插圖框跟對話框
          // 一起淡出（讓玩家清楚感受到「這裡有停頓」），留白2.5秒讓玩家
          // 消化剛剛的回憶，才讓蜜柑開口說三句留白的話，音樂維持
          // background 不受影響，說完對話框淡出，才出現「離開」熱區。
          // 這2.5秒的留白同時拿來淡出聚光燈跟發光效果，蜜柑改成抱著
          // 日記本的姿勢（hold_diary），這個姿勢會一路用到道別三句話
          dialogueEl.removeEventListener('click', onDialogueClick);
          setMikan('hold_diary');
          // 蜜柑抱著日記本了，桌上不該再有一本日記本，切換成沒有日記本
          // 的背景圖版本（需要 assets/images/scene002_mainhub/scene002_mainhub_bg1.png，
          // 目前還沒有這個檔案，在補上之前這行不會有視覺變化，CSS規則已經先寫好等圖）
          bgEl.classList.add('is-diary-hidden');
          memoryFrame.classList.remove('is-visible');
          memoryFrame.classList.remove('is-memory-glow');
          mikanEl.classList.remove('is-memory-glow');
          dialogueEl.classList.remove('is-memory-glow');
          hideMemorySpotlight();
          hideDialogue();
          dialogueEl.addEventListener('click', onStayLineClick);
          cleanupFns.push(function () { dialogueEl.removeEventListener('click', onStayLineClick); });
          const tStayPause = setTimeout(function () {
            playStayLine(0);
          }, 2500);
          cleanupFns.push(function () { clearTimeout(tStayPause); });
        }
      }
      dialogueEl.addEventListener('click', onDialogueClick);
      cleanupFns.push(function () { dialogueEl.removeEventListener('click', onDialogueClick); });

      const stayLines = COPY.stayLines;
      let stayIndex = 0;

      function playStayLine(i) {
        const isLast = i === stayLines.length - 1;
        if (isLast) {
          // 最後一句不需要玩家再點一次才淡出，讀完自動接續，取消點擊監聽
          dialogueEl.removeEventListener('click', onStayLineClick);
        }
        showDialogue(stayLines[i], function () {
          if (isLast) {
            const tRead = setTimeout(function () {
              hideDialogue();
              // 音樂維持 background 播放，不在這裡切回 night-ambience：
              // 從這裡到玩家按下道別確認鍵，時間通常很短，且玩家沒有其他
              // 明確的事可做，就算選「再待一會」多留一陣子，也是繼續聽
              // background 比中途切歌更好，切歌的時機挪到真正選擇「道別」
              // 的那一刻（onChooseLeave）才做
              const tHotspot = setTimeout(function () {
                farewellHotspot.classList.add('is-available');
              }, 1200);
              cleanupFns.push(function () { clearTimeout(tHotspot); });
            }, 2000); // 讓玩家讀完最後一句再自動淡出
            cleanupFns.push(function () { clearTimeout(tRead); });
          } else {
            dialogueNextEl.classList.add('is-visible');
          }
        });
      }

      function onStayLineClick() {
        if (isTyping) return;
        if (stayIndex < stayLines.length - 1) {
          stayIndex++;
          playStayLine(stayIndex);
        }
      }

      function onFarewellClick() {
        if (!farewellHotspot.classList.contains('is-available')) return;
        farewellHotspot.classList.remove('is-available');
        // 點擊「離開」熱區後先問一句，讓玩家自己選擇要道別還是再留一會兒，
        // 而不是點了就直接進入離開流程
        showDialogue(COPY.farewellPrompt, function () {
          farewellChoice.classList.add('is-visible');
        });
      }
      farewellHotspot.addEventListener('click', onFarewellClick);
      cleanupFns.push(function () { farewellHotspot.removeEventListener('click', onFarewellClick); });

      function onChooseLeave() {
        farewellChoice.classList.remove('is-visible');
        setMikan('bye');
        showDialogue(COPY.farewell);

        const t3 = setTimeout(function () {
          onComplete('farewell');
        }, 2600);
        cleanupFns.push(function () { clearTimeout(t3); });
      }
      farewellLeaveBtn.addEventListener('click', onChooseLeave);
      cleanupFns.push(function () { farewellLeaveBtn.removeEventListener('click', onChooseLeave); });

      function onChooseStay() {
        // 玩家選擇再留一會兒：收起選項跟對話框，讓「離開」熱區重新可點擊，
        // 沒有次數或時間限制，玩家可以反覆選「再待一會」
        farewellChoice.classList.remove('is-visible');
        hideDialogue();
        const tBack = setTimeout(function () {
          farewellHotspot.classList.add('is-available');
        }, 600);
        cleanupFns.push(function () { clearTimeout(tBack); });
      }
      farewellStayBtn.addEventListener('click', onChooseStay);
      cleanupFns.push(function () { farewellStayBtn.removeEventListener('click', onChooseStay); });
    }
  }

  function unmount() {
    if (cancelTypewriter) cancelTypewriter();
    cancelTypewriter = null;
    cleanupFns.forEach(function (fn) { fn(); });
    cleanupFns = [];
  }

  return { mount: mount, unmount: unmount };
})();
