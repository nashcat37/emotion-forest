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
    puffball: { nameZh: '放空的小棉球', nameEn: 'Not alone Puffball', language: '讓我陪你放空，仰望天空' },
    // Day10-18限定：兩種既有植物結合成一張圖的突變植物，呼應Emotion Plants
    // 設定裡「不同情緒與魔法元素組合可產生特殊突變植物」，花語對應那天
    // 回憶的情緒基調（見gardenManager.js的HIDING_ARC_PLANT_TYPES註解）
    mimosa_dandelion: { nameZh: '含羞草＋蒲公英', nameEn: 'Mimosa + Dandelion', language: '怕被觸碰，卻悄悄乘風前行' },
    rose_camellia: { nameZh: '玫瑰＋山茶花', nameEn: 'Rose + Camellia', language: '帶刺的靠近，藏起來的深情' },
    lavender_grape: { nameZh: '薰衣草＋葡萄', nameEn: 'Lavender + Grape', language: '靜止的夜，需要時間釀成的勇氣' },
    sunflower_orchid: { nameZh: '太陽花＋蘭花', nameEn: 'Sunflower + Orchid', language: '朝著光，也安靜地守候' },
    mimosa_rose: { nameZh: '含羞草＋玫瑰', nameEn: 'Mimosa + Rose', language: '一碰就縮起，卻仍是美麗的荊棘' },
    dandelion_lavender: { nameZh: '蒲公英＋薰衣草', nameEn: 'Dandelion + Lavender', language: '隨風而去的願望，換來片刻安寧' },
    camellia_peony: { nameZh: '山茶花＋牡丹', nameEn: 'Camellia + Peony', language: '凋落也完整，燦爛卻短暫' },
    orchid_grape: { nameZh: '蘭花＋葡萄', nameEn: 'Orchid + Grape', language: '耐心等待，彼此牽絆不離' },
    peony_sunflower: { nameZh: '牡丹＋太陽花', nameEn: 'Peony + Sunflower', language: '重新盛開，朝陽而生的勇氣' }
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
    // 蜜柑生活足跡：Day 2/5/8→花園、3/6/9→湖邊、4/7/10→門口（之後3天一輪循環），
    // 玩家進場時蜜柑不在搖椅上，這三組對話取代原本的問候文案，
    // 直到玩家「交給蜜柑」後蜜柑才回到搖椅、接續原本 Ritual
    greetingActivityGardening: [
      '你來拉~我正在觀察你喚醒的情緒植物',
      '不知道今天是哪顆植物, 會被你的故事喚醒~喵~'
    ],
    greetingActivityFishing: [
      '存糧不太夠, 所以我正在釣魚唷~',
      '肚子餓是沒法好好理解你的情緒~喵~'
    ],
    greetingActivitySweeping: [
      '我可是很愛乾淨的唷~',
      '你也是嗎? 喵~'
    ],
    diaryPlaceholder: '今天過得如何？',
    // 靈感按鈕問題庫：用具體、帶好奇心的小問題取代空泛的「你今天過得如何」，
    // 降低表達門檻，像跟老朋友聊天而不是寫作業。故意避免整體偏向「正面
    // 情緒」的引導，混入一些能承接低落、平淡心情的問題，維持中性好奇。
    diaryInspirationQuestions: [
      '今天有哪一秒鐘，你特別想吸貓？',
      '如果把今天的心情比喻成一種天氣，你會怎麼形容它？',
      '今天吃到了什麼好吃的東西嗎？我想聽你形容它的美味～喵。',
      '如果今天可以偷偷帶一樣東西進森林，你會想帶什麼？',
      '今天有沒有哪個瞬間，你很想按下暫停鍵，多留一會兒？',
      '如果今天發生的事變成一首歌，會是什麼節奏的？',
      '今天有沒有誰的一句話，一直留在你腦海裡？',
      '如果今天可以打一通電話給一個人，你會想打給誰？',
      '今天有沒有什麼小小的東西，讓你嘴角偷偷上揚了一下？',
      '如果今天是一種顏色，你覺得是什麼顏色？',
      '今天有沒有哪個時刻，你希望有人在旁邊陪你？',
      '如果可以把今天的自己形容成一種動物，會是什麼？',
      '今天有沒有一個畫面，如果拍下來，你會想珍藏？',
      '如果今天心裡有一句沒說出口的話，會是什麼？',
      '今天有沒有哪一刻，你覺得自己做得還不錯？'
    ],
    diaryIntroFirstTime: [
      '我的主人曾跟我說，把每天發生的事情、心情寫下來，就像我在梳理我的毛',
      '它可以撫平我心中的毛躁、不安',
      '什麼都不寫也沒關係，我只要記得....',
      '每段情緒、心情，都有它存在的意義',
      '它們都是一種陪伴唷，喵~'
    ],
    // Day2以後（hasHistory為true時）依單雙數天交替，避免每天都看到同一句話。
    // 這個分支跟Day1的diaryIntroFirstTime是完全獨立的邏輯（依hasHistory切換），
    // Day1不會用到這裡，所以奇偶分組不用擔心跟Day1的內容衝突
    diaryIntroReturningOdd: [
      '有你及你的文字的陪伴真好，抱著日記的我，昨晚睡得更香甜了，喵～'
    ],
    diaryIntroReturningEven: [
      '你說抱著日記會不會不好睡? 不會唷~因為你的文字讓它更溫暖了～喵～'
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
    // 玩家連續第2次(以上)什麼都沒寫時，日記框內會自動幫忙填上這句話——
    // 鎖住無法編輯，玩家送出時等於送出這句文字，讓現有邏輯自然判定成
    // 「有寫」，避免連續好幾天都產生同一種「放空」植物
    blankAutoFillText: '我還是想不到寫什麼',
    // 貓掌互動依單雙數天交替，避免每天都看到同一組話
    chairPawLinesOdd: [
      '坐起來很舒服吧～其實這搖椅有魔法喔～',
      '它能幫助我理解你文字中的情緒，產生共鳴'
    ],
    chairPawLinesEven: [
      '如果坐著坐著不小心睡著了～也沒關係唷～',
      '共鳴魔法還是會啟動，也許我們會在夢裡相遇，喵～'
    ],
    doorLines: [
      '喵~ 隨便進入主人跟我的小屋不太禮貌喔~',
      '等我們熟一點，我再考慮帶你參觀~'
    ],
    stayLinesFirstTime: [
      '喵~我想好好記下你今天的分享，以及你讓我想起的回憶',
      '因為它們同樣珍貴且值得珍藏',
      '你可以多待一會兒，靜靜感受與欣賞'
    ],
    // Day2以後依單雙數天交替，避免每天都看到同一句話
    stayLinesEven: [
      '你的分享，還有我的回憶',
      '全～～～部～都是我最珍貴的寶物喵~',
      '它們都會在這本日記裡，好好保管著～'
    ],
    stayLinesOdd: [
      '偷偷跟你說...',
      '我自己也有寫日記的習慣唷～',
      '只是...我不小心把它搞丟了~喵哈哈～'
    ],
    farewellPrompt: '謝謝你今天願意陪著我。你準備好要回去了嗎？',
    farewell: '喵～我隨時都在，願你睡得香甜。',
    // Day1限定：蜜柑施了魔法，之後才能用瀏覽模式；不重複「謝謝你今天的
    // 陪伴」（farewellPrompt已經講過），直接從「對了」接下去
    farewellDay1: [
      '對了，我偷偷在你身上，施了一點小魔法',
      '往後想放鬆的時候，穿過濃霧就能回來找我',
      '只是我的魔力還太小，魔法日記一天只能施展一次',
      '那就，期待下次見面了～喵～'
    ],
    // Day9限定：找回記憶的揭露時刻，畫面全黑只留聚光燈在蜜柑身上，
    // 這兩句話中間隔著長長的停頓，不是一般的點擊播放對話
    day9RevealSilence: '．．．．．．．．．',
    day9RevealLine: '喵…我想起來了…',
    // Day10限定：點日記本後看到的紙條內容，改用一般對話框呈現（跟greeting
    // 同一個位置），不是疊在圖片上的文字
    day10NoteLines: [
      '打開日記本後，發現蜜柑用有點歪斜的字體寫著…',
      '「我們暫時先不要見面好了...對不起...」',
      '「你還是可以寫日記...喵」'
    ],
    // Day10-18限定：交給蜜柑後，光球飛向小屋大門，蜜柑隔著門回應的OS對話。
    // 每3天一輪循環(Day10/13/16用A、11/14/17用B、12/15/18用C)，三組是
    // 同一種情緒基調的不同講法，刻意不做成線性遞進——不然Day13從C回到A
    // 會顯得像倒退
    hidingArcMikanOS: [
      [ // A
        '你的心意我收到了',
        '沒想到你還願意回來...喵~',
        '但我現在還沒有勇氣見你，對不起...'
      ],
      [ // B
        '喵...今天的心情，我也接住了',
        '你又來了呢，真的很謝謝你',
        '我還是只能，躲在這扇門後面...'
      ],
      [ // C
        '你寫的字，變成一點點光飄過來了',
        '每次看到那道光，我就覺得沒那麼孤單',
        '對不起，我還沒準備好...再等等我'
      ]
    ],
    // Day10-18限定：離開熱區的提示文字，取代平常farewellPrompt那句
    // 「謝謝你今天願意陪著我」——蜜柑整個人躲在小屋裡，這句不適用
    hidingArcKnockPrompt: '輕輕敲了小木屋的門...準備跟蜜柑說晚安？',
    // Day10-18限定：seedPlanting動畫播完、回到post_planting時的蜜柑OS，
    // 位置沿用跟hidingArcMikanOS一樣的「窗戶上方往右延伸到湖泊」，
    // 一樣每3天一輪循環，跟hidingArcMikanOS用同一套規則對應同一輪
    hidingArcPlantOS: [
      [ // A
        '沒想到你的日記結合了我的情緒，會喚醒伴情之花',
        '謝謝你給我的勇氣跟溫暖',
        '我會再試著去面對，喵~'
      ],
      [ // B
        '喵...又開出一朵新的伴情之花了',
        '每一朵，都是你陪我撐過的一天',
        '謝謝你，一直都在'
      ],
      [ // C
        '這株花，好像比昨天的更亮一點呢',
        '是不是，我也在一點一點好起來了',
        '喵...謝謝你沒有放棄我'
      ]
    ],
    // Day10-18限定：貓掌搖椅座位上偶爾出現的微光小物，每2天刷新一次
    // (Day10/12/14/16/18)，用洗牌袋隨機挑一個。每個小物一句敘述+一句
    // 引號內的話，跟Day10紙條一樣用「插圖淡入當背景、對話框疊上去」的
    // overlay呈現，不是蜜柑親口說的話，是她留下的小東西
    chairItems: [
      {
        key: 'pinecone',
        image: 'assets/images/hiding_items/item_pinecone.png',
        lines: [
          '你坐的搖椅上，擺著一顆圓整的小松果',
          '「下午在後山撿到的，樣子長得很圓整，就順手放在這了。」'
        ]
      },
      {
        key: 'paw_doodle',
        image: 'assets/images/hiding_items/item_paw_doodle.png',
        lines: [
          '你坐的搖椅上，有一張歪歪斜斜的草稿紙',
          '「畫的是你前幾天種下的那朵花……雖然畫得不太像。」'
        ]
      },
      {
        key: 'dew_petal',
        image: 'assets/images/hiding_items/item_dew_petal.png',
        lines: [
          '你坐的搖椅上，一片發著淡淡螢光的雨天花瓣',
          '「剛才風吹進來的，留著當書籤好像蠻好的。」'
        ]
      },
      {
        key: 'warm_stone',
        image: 'assets/images/hiding_items/item_warm_stone.png',
        lines: [
          '你坐的搖椅上，一顆發出微弱暖黃光芒的湖石',
          '「在湖邊撿到的，握在手裡暖暖的，今晚借你握著吧。」'
        ]
      }
    ],
    // Day10-18限定：翻牌小遊戲改成玩家獨自進行，不再是輪流合作——
    // 之前是蜜柑陪玩家，現在換玩家陪蜜柑，即使她還沒有勇氣一起翻牌也沒關係
    mmIntroHiding: [
      '蜜柑還沒有勇氣一起翻牌，但你還是想陪著她。',
      '這次換你，替她把記憶一片片找回來～'
    ],
    mmMismatchHiding: '沒對上呢，再試一次看看～',
    mmCompleteHiding: '這次換你陪著蜜柑，把記憶都找回來了。',
    // 瀏覽模式離開時的簡短道別，不像正式流程有完整的留白對話，
    // 因為瀏覽模式沒有經歷「寫日記→回憶」這段旅程，不需要那麼隆重
    browseFarewell: '想放鬆的時候，隨時歡迎回來情緒森林找我～',
    // Day10-18限定：瀏覽模式離開時用的旁白句，蜜柑不會出現、不需要她
    // 親口說話，維持跟一般瀏覽模式一樣的「單句離開」節奏
    browseFarewellHiding: '輕輕帶上門，讓她再靜一靜',
    // 瀏覽模式點蜜柑時的開場對話：18:00前（還在濃霧裡）跟已經寫完今天
    // 日記兩種情境各用不同的第一句，第二句共用，講完才進回憶模式
    browseDiaryLineDaytime: '森林都還在濃霧裡打盹呢...等守夜燈完全亮起、濃霧散去，我們再來寫下今天的悲傷與快樂好嗎？',
    browseDiaryLineWritten: '今天的心情，我已經好好收下了喵～',
    browseDiaryLineShared: '先讓你回顧，我好好保存的日記',
    lampUnlockLine: '守夜燈好像想說什麼...喵?',
    mikanIdleReactions: [
      '「喵嗚...（蜜柑輕輕蹭了蹭你的手）」',
      '「呼嚕呼嚕...」',
      '「喵？」'
    ]
  };

  // 蜜柑生活足跡：依「今天是第幾天」決定蜜柑進場時在做什麼、在哪裡。
  // Day1固定維持現況（搖椅，不算活動日）；Day2起每3天一輪循環：
  // 花園→湖邊→門口→花園→湖邊→門口...
  function getMikanActivityPose(day) {
    if (day < 2) return null;
    const r = day % 3;
    if (r === 2) return 'gardening'; // Day 2, 5, 8, 11...
    if (r === 0) return 'fishing';   // Day 3, 6, 9, 12...
    return 'sweeping';               // Day 4, 7, 10, 13...（r === 1）
  }

  // Day10-18限定：hidingArcMikanOS/hidingArcPlantOS這兩組OS對話，每3天
  // 一輪循環，回傳0/1/2對應A/B/C三個變化版本
  function getHidingArcDialogueVariant(day) {
    return (day - 10) % 3; // Day10→0, 11→1, 12→2, 13→0...
  }

  // Day10-18限定：貓掌搖椅上的微光小物，每2天刷新一次
  // (Day10/12/14/16/18)，用洗牌袋隨機挑，同一天不管重整幾次頁面、
  // 切換幾次瀏覽模式都是同一個，不會重抽
  const CHAIR_ITEM_HISTORY_KEY = 'ef_chairItemHistory'; // {day: itemKey}
  const CHAIR_ITEM_BAG_KEY = 'ef_chairItemBag';
  const CHAIR_ITEM_LAST_KEY = 'ef_chairItemLast';

  function isChairItemRefreshDay(day) {
    return day >= 10 && day <= 18 && day % 2 === 0;
  }

  function drawChairItemKey() {
    const allKeys = COPY.chairItems.map(function (it) { return it.key; });
    let bag = [];
    try { bag = JSON.parse(localStorage.getItem(CHAIR_ITEM_BAG_KEY) || '[]'); } catch (e) { bag = []; }
    if (!bag.length) {
      bag = allKeys.slice();
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = bag[i]; bag[i] = bag[j]; bag[j] = tmp;
      }
      const last = localStorage.getItem(CHAIR_ITEM_LAST_KEY);
      if (bag.length > 1 && bag[0] === last) {
        const tmp = bag[0]; bag[0] = bag[1]; bag[1] = tmp;
      }
    }
    const picked = bag.shift();
    localStorage.setItem(CHAIR_ITEM_BAG_KEY, JSON.stringify(bag));
    localStorage.setItem(CHAIR_ITEM_LAST_KEY, picked);
    return picked;
  }

  function getChairItemKeyForDay(day) {
    let history = {};
    try { history = JSON.parse(localStorage.getItem(CHAIR_ITEM_HISTORY_KEY) || '{}'); } catch (e) { history = {}; }
    if (history[day]) return history[day];
    const picked = drawChairItemKey();
    history[day] = picked;
    localStorage.setItem(CHAIR_ITEM_HISTORY_KEY, JSON.stringify(history));
    return picked;
  }

  function hasChairItemBeenSeenToday(day) {
    return localStorage.getItem('ef_chairItemSeenDay' + day) === 'true';
  }
  function markChairItemSeenToday(day) {
    localStorage.setItem('ef_chairItemSeenDay' + day, 'true');
  }

  let cleanupFns = [];
  let cancelTypewriter = null;
  let isTyping = false;
  // 供completeTypewriterNow()（點擊跳過打字用）讀取，見showDialogue()內的說明
  let currentDialogueText = '';
  let currentOnComplete2 = null;

  function mount(container, params, onComplete) {
    cleanupFns = [];
    isTyping = false;
    const ritualStep = params.ritualStep || 'greeting';
    const day = params.day || 1;
    // 只有greeting階段（玩家剛進場、還沒交出日記）才會是活動pose；
    // post_planting／browse一律視為null，蜜柑固定在搖椅、idle
    const activityPose = (ritualStep === 'greeting') ? getMikanActivityPose(day) : null;
    // Day10-18限定：蜜柑找回記憶後太自責、太害怕，躲在小屋裡不出來，
    // 這段期間完全看不到她（連活動足跡pose都不會有），整套進場/日記/回憶/
    // 種植/道別流程都是特殊版本，跟平常的greeting/post_planting分開處理
    const isHidingArc = (day >= 10 && day <= 18);
    // 活動日一開始蜜柑不在椅子上；Day10-18蜜柑整個人躲起來，兩種情況都要
    // 擋掉「摸摸蜜柑」彩蛋在她人不在時被觸發（後者不會有「回到椅子」那一刻，
    // 這個mount的生命週期內會一直是true）
    let mikanIsAway = !!activityPose || isHidingArc;
    const PLAYER_NAME_KEY = 'ef_playerName';
    const TOUCH_DIARY_LAST_DATE_KEY = 'ef_touchDiaryLastDate';
    function pad2(n) { return n < 10 ? '0' + n : String(n); }
    function getTodayDateStr() {
      const d = new Date();
      return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }
    // touch diary過場動畫「每天限播一次」，這裡用日期字串持久化到localStorage，
    // 不是只存在這次mount裡的暫時記憶——因為瀏覽模式（晝夜分明機制）允許
    // 玩家同一天內重複進出森林好幾次，每次都是全新的mount，如果只存在
    // 暫時記憶裡，玩家換一次mount（例如寫完日記後又用瀏覽模式重新進來）
    // 就會誤判成「今天還沒播過」，動畫又重播一次
    function hasTouchDiaryPlayedToday() {
      return localStorage.getItem(TOUCH_DIARY_LAST_DATE_KEY) === getTodayDateStr();
    }
    function markTouchDiaryPlayedToday() {
      localStorage.setItem(TOUCH_DIARY_LAST_DATE_KEY, getTodayDateStr());
    }
    // 每天(每次mount)第一次點擊日記本熱區時，蜜柑先說一段開場白才打開日記面板，
    // 同一天內重複點擊（例如按「先不寫」取消後又點一次）直接開面板，不會重播
    let diaryIntroPlayedToday = false;
    // 記憶翻牌小遊戲：第3天當次道別後，透過守夜燈的解鎖劇本自動觸發一次
    // （不是靠點擊守夜燈），第4天起才變成「點擊守夜燈」直接觸發，一天限玩一次。
    // farewellPhaseReached跟現有farewellHotspot的is-available同一個時間點成立
    // （道別三句話講完後），確保小遊戲一定排在寫日記/回憶蜜柑之後才會出現。
    let memoryMatchPlayedToday = false;
    let farewellPhaseReached = false;
    // 只有第3天當次道別觸發的那一局，結束後才需要接續原本的「離開濃霧」流程；
    // 第4天起玩家自己點守夜燈玩的，純粹是額外的小活動，玩完關掉就回到原本畫面
    let memoryMatchReturnsToFarewell = false;
    // 觸控裝置（手機/平板）打開日記面板時不自動focus輸入框，因為自動focus
    // 會立刻跳出虛擬鍵盤佔掉近半螢幕；桌機保留自動focus，方便直接打字
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    container.classList.add('mainhub-scene');
    container.innerHTML =
      '<div class="mainhub-scene__bg"></div>' +
      '<div class="mainhub-scene__daytime-fog-group">' +
      '  <div class="mainhub-scene__daytime-fog mainhub-scene__daytime-fog--far"></div>' +
      '  <div class="mainhub-scene__daytime-fog mainhub-scene__daytime-fog--near"></div>' +
      '</div>' +
      '<div class="mainhub-scene__note-overlay">' +
      '  <img class="mainhub-scene__note-img" alt="" />' +
      '</div>' +
      '<div class="mainhub-scene__chair-item-hotspot">' +
      '  <div class="mainhub-scene__chair-item-firefly"></div>' +
      '</div>' +
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
      '<div class="mainhub-scene__dialogue"><div class="mainhub-scene__dialogue-inner"><span class="mainhub-scene__dialogue-text"></span><span class="mainhub-scene__dialogue-next">▼</span></div><div class="mainhub-scene__dialogue-scroll-hint">⌄</div></div>' +
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
      '    <div class="diary-overlay__input-wrap">' +
      '      <textarea class="diary-overlay__input" placeholder="' + COPY.diaryPlaceholder + '"></textarea>' +
      '      <button class="diary-overlay__inspiration-btn" title="給我一個靈感">💡</button>' +
      '    </div>' +
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
      '<div class="memory-match-overlay">' +
      '  <div class="memory-match-overlay__dimmer"></div>' +
      '  <div class="memory-match-overlay__panel">' +
      '    <div class="memory-match-overlay__intro">' +
      '      <p class="memory-match-overlay__intro-text">玩家與蜜柑輪流翻牌，配對成功者可繼續翻牌，全部配對完成即完成遊戲～</p>' +
      '      <p class="memory-match-overlay__intro-text">讓我們一起幫蜜柑，練習記憶，找回記憶～</p>' +
      '      <button class="memory-match-overlay__start">開始</button>' +
      '      <button class="memory-match-overlay__intro-close">先不玩了</button>' +
      '    </div>' +
      '    <div class="memory-match-overlay__status"></div>' +
      '    <div class="memory-match-overlay__grid"></div>' +
      '    <div class="memory-match-overlay__feedback"></div>' +
      '    <button class="memory-match-overlay__close">先不玩了</button>' +
      '  </div>' +
      '  <div class="memory-match-overlay__celebration">' +
      '    <div class="memory-match-overlay__celebration-flash"></div>' +
      '    <div class="memory-match-overlay__celebration-sparks"></div>' +
      '  </div>' +
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
    const noteOverlay = container.querySelector('.mainhub-scene__note-overlay');
    const noteImg = container.querySelector('.mainhub-scene__note-img');
    const chairItemHotspot = container.querySelector('.mainhub-scene__chair-item-hotspot');
    const daytimeFogEl = container.querySelector('.mainhub-scene__daytime-fog-group');
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
    const dialogueInnerEl = container.querySelector('.mainhub-scene__dialogue-inner');
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
    const diaryInspirationBtn = container.querySelector('.diary-overlay__inspiration-btn');
    const diarySubmitBtn = container.querySelector('.diary-overlay__submit');
    const diaryCancelBtn = container.querySelector('.diary-overlay__cancel');
    const diaryActions = container.querySelector('.diary-overlay__actions');
    const blankConfirm = container.querySelector('.diary-overlay__blank-confirm');
    const blankConfirmYesBtn = container.querySelector('.diary-overlay__blank-confirm-yes');
    const blankConfirmNoBtn = container.querySelector('.diary-overlay__blank-confirm-no');
    const diaryRecallBtn = container.querySelector('.diary-overlay__recall');
    const touchDiaryOverlay = container.querySelector('.mainhub-scene__touch-diary-overlay');
    const touchDiaryVideo = container.querySelector('.mainhub-scene__touch-diary-video');

    const memoryMatchOverlay = container.querySelector('.memory-match-overlay');
    const memoryMatchIntro = container.querySelector('.memory-match-overlay__intro');
    const memoryMatchStartBtn = container.querySelector('.memory-match-overlay__start');
    const memoryMatchIntroCloseBtn = container.querySelector('.memory-match-overlay__intro-close');
    const memoryMatchStatus = container.querySelector('.memory-match-overlay__status');
    const memoryMatchGrid = container.querySelector('.memory-match-overlay__grid');
    const memoryMatchFeedback = container.querySelector('.memory-match-overlay__feedback');
    const memoryMatchCloseBtn = container.querySelector('.memory-match-overlay__close');
    const memoryMatchCelebration = container.querySelector('.memory-match-overlay__celebration');
    const memoryMatchCelebrationSparks = container.querySelector('.memory-match-overlay__celebration-sparks');

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

    // Day10-18限定：貓掌搖椅上的微光小物。只在runHidingEntry()(正式進場)
    // 跟runHidingBrowse()(瀏覽模式)呼叫，post_planting不會出現——那時候
    // 玩家注意力該在剛長出來的伴情之花上，不適合同時冒出新小物分散注意力
    function setupChairItemHotspot() {
      if (!isChairItemRefreshDay(day)) return;
      if (hasChairItemBeenSeenToday(day)) return;
      const itemKey = getChairItemKeyForDay(day);
      const items = COPY.chairItems.filter(function (it) { return it.key === itemKey; });
      const item = items[0];
      if (!item) return;

      chairItemHotspot.classList.add('is-visible');
      function onChairItemClick() {
        chairItemHotspot.classList.remove('is-visible');
        chairItemHotspot.removeEventListener('click', onChairItemClick);
        playChairItemNote(item);
      }
      chairItemHotspot.addEventListener('click', onChairItemClick);
      cleanupFns.push(function () { chairItemHotspot.removeEventListener('click', onChairItemClick); });
    }

    function playChairItemNote(item) {
      // 沿用Day10紙條同一套做法：插圖先淡入當背景，對話框疊在上面播兩句，
      // 播完兩者一起淡出——跟playDay10Note()是同一個模式
      noteImg.src = item.image;
      noteOverlay.classList.add('is-visible');
      const lines = item.lines;
      let idx = 0;
      function onLineClick() {
        if (isTyping) { completeTypewriterNow(); return; }
        if (idx < lines.length - 1) {
          idx++;
          playLine(idx);
        }
      }
      function playLine(i) {
        const isLast = i === lines.length - 1;
        if (isLast) dialogueEl.removeEventListener('click', onLineClick);
        showDialogue(lines[i], function () {
          if (isLast) {
            const tHold = setTimeout(function () {
              hideDialogue();
              noteOverlay.classList.remove('is-visible');
              markChairItemSeenToday(day);
            }, 1500);
            cleanupFns.push(function () { clearTimeout(tHold); });
          } else {
            dialogueNextEl.classList.add('is-visible');
          }
        });
      }
      const tImgIn = setTimeout(function () {
        dialogueEl.addEventListener('click', onLineClick);
        cleanupFns.push(function () { dialogueEl.removeEventListener('click', onLineClick); });
        playLine(0);
      }, 900);
      cleanupFns.push(function () { clearTimeout(tImgIn); });
    }


    // ---------------- 對話文字（打字機效果） ----------------
    // 捲動提示只要在「回憶影片正在播放」這個當下才出現，用memoryFrame自己
    // 的is-visible class來判斷最精準——is-post-planting這個class雖然也
    // 掛在dialogueEl上，但它是mount()一開始判斷「今天不是從打招呼開始
    // 恢復」就會加上去、之後整個session都不會拿掉，不是只在播影片時才有，
    // 拿來當開關會太寬鬆，導致提示在不相關的對話框也跑出來
    const SCROLL_HINT_SEEN_KEY = 'ef_seenDialogueScrollHint';
    function checkDialogueOverflow() {
      if (!memoryFrame.classList.contains('is-visible')) return;
      // +1避免子像素捲動高度計算的浮點誤差誤判成有溢出
      const isOverflowing = dialogueInnerEl.scrollHeight > dialogueInnerEl.clientHeight + 1;
      dialogueInnerEl.classList.toggle('has-overflow', isOverflowing);
      if (isOverflowing && !localStorage.getItem(SCROLL_HINT_SEEN_KEY)) {
        localStorage.setItem(SCROLL_HINT_SEEN_KEY, '1');
        // 這輩子第一次真的遇到需要捲動才看得完的長句，輕輕往下推一點再
        // 彈回去，暗示「這裡可以滑」，之後不會再重複這個動作
        dialogueInnerEl.scrollTo({ top: 24, behavior: 'smooth' });
        const tNudgeBack = setTimeout(function () {
          dialogueInnerEl.scrollTo({ top: 0, behavior: 'smooth' });
        }, 550);
        cleanupFns.push(function () { clearTimeout(tNudgeBack); });
      }
    }
    function showDialogue(text, onComplete2, speedOverride) {
      if (cancelTypewriter) cancelTypewriter();
      dialogueEl.classList.add('is-visible');
      dialogueNextEl.classList.remove('is-visible');
      // 每次開始講新的一句話，都先歸零捲動位置、清掉上一句殘留的溢出狀態，
      // 避免新的一句話（就算很短）一開場就因為承接上一句的捲動位置而被擋住
      dialogueInnerEl.scrollTop = 0;
      dialogueInnerEl.classList.remove('has-overflow');
      isTyping = true;
      // 供completeTypewriterNow()在玩家點擊跳過打字時使用：typewriter.js
      // 的cancel()只會停掉計時器，不會補完文字也不會觸發onComplete，
      // 這兩個要留著給跳過路徑自己手動處理
      currentDialogueText = text;
      currentOnComplete2 = onComplete2;
      cancelTypewriter = window.EF.typewriter(text, dialogueTextEl, {
        speed: speedOverride || 110,
        onComplete: function () {
          isTyping = false;
          cancelTypewriter = null;
          checkDialogueOverflow();
          if (onComplete2) onComplete2();
        }
      });
    }

    // 玩家在打字動畫還沒跑完時點擊，讓這句話瞬間顯示完整，而不是像原本
    // 一樣完全沒反應。只把「這次點擊」吃掉當作「跳過打字」，不會連著
    // 觸發「推進到下一句／後續動作」——呼叫端(12處各自的點擊監聽器)在
    // isTyping為true時呼叫完這個函式後仍會接著return，確保「跳過」跟
    // 「推進」不會發生在同一次點擊裡，這對綁在對話點擊上的音樂/影片
    // 觸發時機（Day1-9植物揭曉、Day10-18窗邊對話最後一句）很重要，
    // 不會被提前或重複觸發。
    // 把原本typewriter「自然打完」時會做的三件事（補滿文字、檢查捲動
    // 提示、觸發後續callback）在這裡完整重做一次，確保「玩家看完整個
    // 打字動畫」跟「玩家點擊跳過」兩種情況，最終畫面結果完全一樣
    function completeTypewriterNow() {
      if (!isTyping) return;
      if (cancelTypewriter) {
        cancelTypewriter();
        cancelTypewriter = null;
      }
      dialogueTextEl.innerText = currentDialogueText;
      isTyping = false;
      checkDialogueOverflow();
      if (currentOnComplete2) currentOnComplete2();
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
      // 活動日蜜柑還沒回到椅子上，這個熱區先讓游標維持一般狀態（不顯示手掌），
      // 避免玩家覺得空椅子那裡「看起來可以點」；回到椅子上後會拿掉這個class
      if (mikanIsAway) {
        mikanEgg.classList.add('is-inactive');
      }

      function onLampClick() {
        const unlockDay = window.EF.MemoryMatchManager.UNLOCK_DAY; // 3
        if (day > unlockDay && farewellPhaseReached && !memoryMatchPlayedToday) {
          // 第4天起：道別三句話講完後，點擊守夜燈直接開啟小遊戲，一天限玩一次。
          // 這裡刻意不在「點擊」的當下就標記memoryMatchPlayedToday，而是要等
          // 玩家真正「完成」整局才算數（見resolvePair裡的isGameComplete分支）。
          // 這樣即使玩家按「先不玩了」中途離開，也不會消耗掉今天唯一的機會，
          // 還能再點守夜燈重新進入，避免不小心誤觸就再也玩不到。
          memoryMatchReturnsToFarewell = false; // 這是玩家自己額外點的，玩完關掉不用接續離開流程
          openMemoryMatchGame();
          return;
        }
        // 第1、2、3天的一般點擊，或第4天起但還沒到道別階段/今天已經玩過：
        // 維持原本的光暈脈動彩蛋
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
        if (isTyping) { completeTypewriterNow(); return; }
        if (gifPlaying) return; // 播放中不重複觸發，避免疊加計時器造成提前或延後恢復
        if (mikanIsAway) return; // 蜜柑還在花園/湖邊/門口，人不在椅子這裡不該有反應
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
      // 瀏覽模式下這個熱區改由runBrowse()接管（點蜜柑觸發回憶日記），
      // 不綁定這個彩蛋監聽器，避免同一個區域同時觸發兩種不同反應。
      // 活動日一樣綁定，只是onMikanPat內部會擋掉（mikanIsAway），
      // 等蜜柑淡入回到椅子上（點日記本熱區後）就會自動恢復
      if (ritualStep !== 'browse') {
        mikanEgg.addEventListener('click', onMikanPat);
        cleanupFns.push(function () { mikanEgg.removeEventListener('click', onMikanPat); });
      }

      // 木門彩蛋：目前小屋內部還沒有場景，這裡先做蜜柑婉拒帶路的兩句對話，
      // 為未來新增「小屋內場景」預留伏筆。跟蜜柑彩蛋一樣不打斷正式Ritual對話，
      // 播完後恢復原本畫面上顯示的對話內容（如果原本有的話）
      let doorPlaying = false;
      function onDoorClick() {
        if (isTyping) { completeTypewriterNow(); return; }
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
      // Day10-18暫時關閉這個熱區——蜜柑基本上不會有反應（只透過日記本
      // 回應），保留onDoorClick跟播放邏輯本身，未來要做「進小屋」的
      // 正式功能時還能直接沿用，這裡先不綁定就好
      if (!isHidingArc) {
        doorEgg.addEventListener('click', onDoorClick);
        cleanupFns.push(function () { doorEgg.removeEventListener('click', onDoorClick); });
      }
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
    // dev panel強制測試用：不用湊「今天沒寫過日記＋不在開放時段＋玩過至少
    // 一次」這三個條件，直接手動開關濃霧效果看畫面
    function showDaytimeFog() {
      daytimeFogEl.classList.add('is-visible');
    }
    function hideDaytimeFog() {
      daytimeFogEl.classList.remove('is-visible');
    }

    // ---------------- 記憶翻牌小遊戲（合作模式：幫蜜柑找回記憶） ----------------
    // 目前先做成獨立可測試的版本，還沒接上「第3天解鎖」跟守夜燈熱區的
    // 正式觸發流程（下一階段才會做），這裡先透過dev panel按鈕直接開局測試。
    // 遊戲邏輯（洗牌/配對判斷/蜜柑AI）完全交給MemoryMatchManager，這裡
    // 只負責畫面渲染跟流程串接。
    // 這組「找回記憶」的敘事句子只在全部16張牌配對完成時才出現，
    // 單次配對成功用的是下面的連續稱讚字詞（Nice/Bravo/Wonderful）
    const MM_COMPLETE_LINES = [
      '你今天很快就找到蜜柑最珍藏的那組記憶～',
      '喵！這段記憶......好像有點懷念的感覺。',
      '謝謝你，這段記憶又找回來了一點點。',
      '蜜柑覺得，這段記憶跟你有點像呢，喵～'
    ];
    // 單次配對成功的即時稱讚，依「連續配對成功次數」決定用哪個字，
    // 不分玩家還是蜜柑翻中的，只要連續成功就會往上疊；配對失敗歸零
    const MM_STREAK_WORDS = ['Nice', 'Bravo', 'Wonderful'];
    let mmDeck = [];
    let mmFlippedIds = [];
    let mmRevealedMemory = {}; // {cardId: image} 這局遊戲裡曾經翻開過、還沒配對成功的牌
    let mmMatchedCount = 0;
    let mmStreak = 0;
    let mmLocked = false;

    function renderMemoryMatchGrid() {
      memoryMatchGrid.innerHTML = '';
      mmDeck.forEach(function (card) {
        const cell = document.createElement('div');
        cell.className = 'memory-match-overlay__card';
        cell.dataset.cardId = card.id;
        cell.innerHTML =
          '<div class="memory-match-overlay__card-inner">' +
          '  <div class="memory-match-overlay__card-back"><img src="assets/images/minigame/card_back.jpg" alt="" /></div>' +
          '  <div class="memory-match-overlay__card-front"><img src="' + card.image + '" alt="" /></div>' +
          '</div>';
        memoryMatchGrid.appendChild(cell);
      });
    }

    function updateMemoryMatchStatus(turnText) {
      memoryMatchStatus.textContent = turnText;
    }

    function getCardEl(cardId) {
      return memoryMatchGrid.querySelector('[data-card-id="' + cardId + '"]');
    }

    function showMemoryMatchFeedback(text) {
      memoryMatchFeedback.textContent = text;
      memoryMatchFeedback.classList.add('is-visible');
      const t = setTimeout(function () {
        memoryMatchFeedback.classList.remove('is-visible');
      }, 2200);
      cleanupFns.push(function () { clearTimeout(t); });
    }

    function openMemoryMatchGame() {
      // 先顯示規則說明，按下「開始」才真正洗牌開局
      // Day10-18限定：蜜柑還沒勇氣一起玩，改用單人版的說明文字
      const introParagraphs = memoryMatchIntro.querySelectorAll('.memory-match-overlay__intro-text');
      if (isHidingArc) {
        introParagraphs[0].textContent = COPY.mmIntroHiding[0];
        introParagraphs[1].textContent = COPY.mmIntroHiding[1];
      } else {
        introParagraphs[0].textContent = '玩家與蜜柑輪流翻牌，配對成功者可繼續翻牌，全部配對完成即完成遊戲～';
        introParagraphs[1].textContent = '讓我們一起幫蜜柑，練習記憶，找回記憶～';
      }
      memoryMatchIntro.classList.add('is-visible');
      memoryMatchGrid.style.display = 'none';
      memoryMatchCloseBtn.style.display = 'none'; // 遊戲中途離開用的按鈕，規則畫面先不顯示
      memoryMatchStatus.textContent = '';
      memoryMatchFeedback.classList.remove('is-visible');
      memoryMatchCelebration.classList.remove('is-active');
      memoryMatchOverlay.classList.add('is-open');
    }

    function startMemoryMatchRound() {
      memoryMatchIntro.classList.remove('is-visible');
      memoryMatchGrid.style.display = '';
      memoryMatchCloseBtn.style.display = '';
      memoryMatchCloseBtn.textContent = '先不玩了';
      mmDeck = window.EF.MemoryMatchManager.createDeck(day);
      mmFlippedIds = [];
      mmRevealedMemory = {};
      mmMatchedCount = 0;
      mmStreak = 0;
      mmLocked = false;
      renderMemoryMatchGrid();
      updateMemoryMatchStatus('輪到你囉，翻開兩張牌看看～');
    }
    memoryMatchStartBtn.addEventListener('click', startMemoryMatchRound);
    cleanupFns.push(function () { memoryMatchStartBtn.removeEventListener('click', startMemoryMatchRound); });

    function playMemoryMatchCelebration() {
      memoryMatchCelebrationSparks.innerHTML = '';
      const count = 26;
      for (let i = 0; i < count; i++) {
        const spark = document.createElement('div');
        spark.className = 'memory-match-overlay__spark';
        const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.3 - 0.15);
        const distance = 30 + Math.random() * 20; // vmin
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        spark.style.setProperty('--spark-tx', tx + 'vmin');
        spark.style.setProperty('--spark-ty', ty + 'vmin');
        spark.style.animationDelay = (Math.random() * 0.2) + 's';
        memoryMatchCelebrationSparks.appendChild(spark);
      }
      memoryMatchCelebration.classList.add('is-active');
      const t = setTimeout(function () {
        memoryMatchCelebration.classList.remove('is-active');
      }, 2400);
      cleanupFns.push(function () { clearTimeout(t); });
    }

    function closeMemoryMatchGame() {
      memoryMatchOverlay.classList.remove('is-open');
      memoryMatchCelebration.classList.remove('is-active');
      if (memoryMatchReturnsToFarewell) {
        memoryMatchReturnsToFarewell = false;
        onComplete('farewell');
      }
    }

    function flipCardVisual(cardId, faceUp) {
      const el = getCardEl(cardId);
      if (el) el.classList.toggle('is-flipped', faceUp);
    }

    function markMatchedVisual(idA, idB) {
      [idA, idB].forEach(function (id) {
        const el = getCardEl(id);
        if (el) el.classList.add('is-matched');
      });
    }

    // 兩張牌翻開後的共用判斷邏輯，玩家/蜜柑都走這條路
    function resolvePair(idA, idB, actor) {
      mmLocked = true;
      const matched = window.EF.MemoryMatchManager.isMatch(mmDeck, idA, idB);
      const holdMs = matched ? 700 : 1100;
      const t = setTimeout(function () {
        if (matched) {
          mmDeck[idA].matched = true;
          mmDeck[idB].matched = true;
          delete mmRevealedMemory[idA];
          delete mmRevealedMemory[idB];
          markMatchedVisual(idA, idB);
          mmMatchedCount++;
          mmStreak++;

          if (window.EF.MemoryMatchManager.isGameComplete(mmDeck)) {
            // 真正「完成」整局才算今天玩過（不是一點擊守夜燈就算），
            // 這樣玩家中途按「先不玩了」離開，今天還能再點守夜燈重新進入
            memoryMatchPlayedToday = true;
            // 全部16張都配對完成時，才用「找回記憶」的敘事句子，
            // 取代單次配對的Nice/Bravo/Wonderful即時稱讚
            showMemoryMatchFeedback(MM_COMPLETE_LINES[Math.floor(Math.random() * MM_COMPLETE_LINES.length)]);
            updateMemoryMatchStatus(isHidingArc ? COPY.mmCompleteHiding : '你們一起找回了所有的記憶碎片，喵～');
            mmLocked = true;
            memoryMatchCloseBtn.textContent = '完成了';
            playMemoryMatchCelebration();
            return;
          }

          // 單次配對成功：依連續配對次數疊加稱讚字詞，封頂Wonderful，
          // 不分玩家還是蜜柑翻中的，只要連續成功就會往上疊
          const streakIndex = Math.min(mmStreak, MM_STREAK_WORDS.length) - 1;
          showMemoryMatchFeedback(MM_STREAK_WORDS[streakIndex]);

          mmFlippedIds = [];
          mmLocked = false;
          if (actor === 'player') {
            updateMemoryMatchStatus('配對成功！輪到你繼續翻～');
          } else {
            updateMemoryMatchStatus('蜜柑想起來了！蜜柑繼續翻～');
            triggerMikanTurn();
          }
        } else {
          mmStreak = 0;
          flipCardVisual(idA, false);
          flipCardVisual(idB, false);
          mmFlippedIds = [];
          mmLocked = false;
          if (actor === 'player') {
            if (isHidingArc) {
              // 蜜柑這幾天不會接手翻牌，玩家沒對上就繼續自己翻
              updateMemoryMatchStatus(COPY.mmMismatchHiding);
            } else {
              updateMemoryMatchStatus('沒對上呢，換蜜柑翻翻看～');
              triggerMikanTurn();
            }
          } else {
            updateMemoryMatchStatus('蜜柑也沒想起來，換你翻翻看～');
          }
        }
      }, holdMs);
      cleanupFns.push(function () { clearTimeout(t); });
    }

    function onMemoryMatchCardClick(e) {
      if (mmLocked) return;
      const cell = e.target.closest('.memory-match-overlay__card');
      if (!cell) return;
      const cardId = parseInt(cell.dataset.cardId, 10);
      const card = mmDeck[cardId];
      if (!card || card.matched || mmFlippedIds.indexOf(cardId) !== -1) return;

      flipCardVisual(cardId, true);
      mmRevealedMemory[cardId] = card.image;
      mmFlippedIds.push(cardId);

      if (mmFlippedIds.length === 2) {
        resolvePair(mmFlippedIds[0], mmFlippedIds[1], 'player');
      }
    }
    memoryMatchGrid.addEventListener('click', onMemoryMatchCardClick);
    cleanupFns.push(function () { memoryMatchGrid.removeEventListener('click', onMemoryMatchCardClick); });

    function triggerMikanTurn() {
      mmLocked = true;
      const tThink = setTimeout(function () {
        const move = window.EF.MemoryMatchManager.decideMikanMove(mmDeck, mmRevealedMemory, day);
        const idA = move[0], idB = move[1];
        if (idA === undefined || idB === undefined) return; // 保險：牌不夠了就不動作

        flipCardVisual(idA, true);
        mmRevealedMemory[idA] = mmDeck[idA].image;
        const tSecond = setTimeout(function () {
          flipCardVisual(idB, true);
          mmRevealedMemory[idB] = mmDeck[idB].image;
          mmFlippedIds = [idA, idB];
          resolvePair(idA, idB, 'mikan');
        }, 700);
        cleanupFns.push(function () { clearTimeout(tSecond); });
      }, 900);
      cleanupFns.push(function () { clearTimeout(tThink); });
    }

    memoryMatchCloseBtn.addEventListener('click', closeMemoryMatchGame);
    cleanupFns.push(function () { memoryMatchCloseBtn.removeEventListener('click', closeMemoryMatchGame); });
    memoryMatchIntroCloseBtn.addEventListener('click', closeMemoryMatchGame);
    cleanupFns.push(function () { memoryMatchIntroCloseBtn.removeEventListener('click', closeMemoryMatchGame); });

    // 暫存給 dev panel 的測試按鈕用（手動預覽/強制開關，跟下面的自動觸發並存）
    window.EF.mainhubDevControls = {
      showSnow: showSnow, hideSnow: hideSnow,
      showPetalRain: showPetalRain, hidePetalRain: hidePetalRain,
      showDaytimeFog: showDaytimeFog, hideDaytimeFog: hideDaytimeFog,
      openMemoryMatchGame: openMemoryMatchGame
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

    // Day9道別揭露專用：只留蜜柑+搖椅兩個洞（showChairHole=false時兩個都
    // 收掉變成全黑），frame/lamp/plant/dialogue這幾個洞這裡用不到，固定收掉，
    // 避免沿用layoutMemorySpotlight()殘留上一次mount的舊版位資訊
    // Day9道別揭露專用：只留蜜柑一個洞（showMikanHole=false時連同蜜柑
    // 都收掉變成全黑）。原本回憶模式的「搖椅」洞座標(14,38)其實是貓掌
    // 那張空椅子，跟這次劇情無關，這裡不使用，固定收掉，避免又把不相關
    // 的角落一起打亮
    function layoutFarewellRevealSpotlight(showMikanHole) {
      if (showMikanHole) {
        setSpotlightEllipse(spotlightHoleMikan, 65, 40, 20, 28);
      } else {
        setSpotlightEllipse(spotlightHoleMikan, 0, 0, 0, 0);
      }
      setSpotlightEllipse(spotlightHoleChair, 0, 0, 0, 0);
      setSpotlightEllipse(spotlightHoleFrame, 0, 0, 0, 0);
      setSpotlightEllipse(spotlightHoleLamp, 0, 0, 0, 0);
      setSpotlightRect(spotlightHoleDialogue, 0, 0, 0, 0);
      if (spotlightHolePlant) setSpotlightEllipse(spotlightHolePlant, 0, 0, 0, 0);
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

      // Day10-18限定：回憶心情介面也要顯示重寫版的回憶內容，不能還是
      // 讀一般的getMemoryForDay（那組Day9起會一直循環同一份「異常天氣」，
      // 不是這幾天實際發生的內容）
      const isRecallHiding = recallDay >= 10 && recallDay <= 18;
      const memoryTitle = isRecallHiding
        ? window.EF.MemoryManager.getHidingArcMemoryTitleForDay(recallDay)
        : window.EF.MemoryManager.getMemoryTitleForDay(recallDay);
      const memoryLines = isRecallHiding
        ? window.EF.MemoryManager.getHidingArcMemoryForDay(recallDay)
        : window.EF.MemoryManager.getMemoryForDay(recallDay);
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
      // 這支影片每天只會被觸發播放一次（hasTouchDiaryPlayedToday/
      // markTouchDiaryPlayedToday持久化保證，見上方定義），呼叫這裡時
      // 一定是全新、還沒播放過的狀態，本來就是從片頭開始，不需要額外呼叫
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
        if (hasTouchDiaryPlayedToday()) {
          openRecallOverlay();
        } else {
          markTouchDiaryPlayedToday();
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
        // 只有正式流程（從日記輸入面板點「回憶心情」進來的）才需要回到
        // 日記輸入面板；瀏覽模式是直接從日記本熱區進入回憶模式，沒有
        // 經過日記輸入面板，不該在這裡意外跳出寫日記的畫面
        if (ritualStep !== 'browse') {
          diaryOverlay.classList.add('is-open');
        }
      }
      recallEndBtn.addEventListener('click', onEnd);
      cleanupFns.push(function () { recallEndBtn.removeEventListener('click', onEnd); });
    }
    setupRecallOverlay();

    setupEasterEggs();

    if (ritualStep === 'greeting') {
      runGreeting();
    } else if (ritualStep === 'browse') {
      runBrowse();
    } else {
      runPostPlanting();
    }

    // ---------------- ritualStep: browse（晝夜分明機制的瀏覽模式） ----------------
    // 觸發時機：18:00前還沒寫日記，或當天已經寫完日記後再次進場。兩種
    // 情境共用同一套畫面邏輯（蜜柑抱著日記、桌上沒有日記本），差別只在
    // 要不要疊加一層白天濃霧（params.showDaytimeFog），不需要另外拆兩套。
    function runBrowse() {
      if (isHidingArc) {
        runHidingBrowse();
        return;
      }
      setMikan('hold_diary');
      // 桌上不該有日記本（蜜柑抱著），沿用道別流程已經做好的背景切換機制
      bgEl.classList.add('is-diary-hidden');
      if (params.showDaytimeFog) {
        daytimeFogEl.classList.add('is-visible');
      }

      // 觸發點是蜜柑本身（她抱著日記，點她比點空桌子更符合畫面邏輯），
      // 沿用蜜柑彩蛋熱區的座標，不需要另外量測。setupEasterEggs()裡已經
      // 針對browse模式跳過了「摸摸蜜柑」彩蛋的綁定，這裡接管同一個熱區。
      // 點擊後先播一小段對話，講完才進回憶模式；過場動畫沿用同一套
      // 「每天限播一次」的持久化判斷，跟正式Ritual流程共用同一個標記，
      // 不會因為玩家在瀏覽模式又重看一次
      const browseMikanHotspot = container.querySelector('.mainhub-scene__egg--mikan');
      let browseIntroPlayedThisMount = false;
      function onBrowseMikanClick() {
        // 只有這次mount裡「第一次」點擊才播開場對話；之後點擊（例如玩家
        // 關掉回憶介面又想再點一次）直接跳過對話進回憶介面，不會卡住
        // 沒反應。跟過場動畫的「每天限播一次」判斷是不同層級的東西：
        // 那個管的是touch diary影片，這裡管的是開場那兩句台詞
        if (browseIntroPlayedThisMount) {
          if (hasTouchDiaryPlayedToday()) {
            openRecallOverlay();
          } else {
            markTouchDiaryPlayedToday();
            playTouchDiaryThenOpenRecall();
          }
          return;
        }
        browseIntroPlayedThisMount = true;

        const lines = params.showDaytimeFog
          ? [COPY.browseDiaryLineDaytime, COPY.browseDiaryLineShared]
          : [COPY.browseDiaryLineWritten, COPY.browseDiaryLineShared];

        function playLine(i) {
          const isLast = i === lines.length - 1;
          showDialogue(lines[i], function () {
            const holdMs = isLast ? 1200 : 1800;
            const t = setTimeout(function () {
              if (isLast) {
                hideDialogue();
                if (hasTouchDiaryPlayedToday()) {
                  openRecallOverlay();
                } else {
                  markTouchDiaryPlayedToday();
                  playTouchDiaryThenOpenRecall();
                }
              } else {
                playLine(i + 1);
              }
            }, holdMs);
            cleanupFns.push(function () { clearTimeout(t); });
          });
        }
        playLine(0);
      }
      browseMikanHotspot.addEventListener('click', onBrowseMikanClick);
      cleanupFns.push(function () { browseMikanHotspot.removeEventListener('click', onBrowseMikanClick); });

      // 離開熱區立即可用，不需要像正式流程那樣等留白對話講完才出現
      farewellHotspot.classList.add('is-available');
      function onBrowseLeaveClick() {
        if (!farewellHotspot.classList.contains('is-available')) return;
        farewellHotspot.classList.remove('is-available');
        setMikan('bye');
        showDialogue(COPY.browseFarewell, function () {
          // 打字機真的打完才開始算「讓玩家讀完」的停留時間，
          // 不再用固定秒數猜——文字長度以後如果又改，這裡也不會再被腰斬
          const t = setTimeout(function () {
            onComplete('farewell');
          }, 1800);
          cleanupFns.push(function () { clearTimeout(t); });
        });
      }
      farewellHotspot.addEventListener('click', onBrowseLeaveClick);
      cleanupFns.push(function () { farewellHotspot.removeEventListener('click', onBrowseLeaveClick); });

      // 守夜燈：setupEasterEggs()裡的onLampClick已經處理過了，farewellPhaseReached
      // 在瀏覽模式全程維持false（只有正式流程的留白對話講完才會設true），
      // 所以守夜燈在這裡自然只會是原本的光暈脈動彩蛋，不會提供小遊戲入口，
      // 不需要在這裡額外寫判斷
    }

    // Day10-18限定的瀏覽模式：蜜柑整個人不會出現，跟一般runBrowse()比
    // 有四點不同——背景換成bg_hiding、不呼叫setMikan(她不該出現)、
    // 回憶日記的觸發點從「點蜜柑」改回「點小圓桌上的日記本」、
    // 離開時的道別文字換成不需要她親口說話的旁白句
    function runHidingBrowse() {
      // 這個mount是全新的container.innerHTML，蜜柑預設是完全可見
      // (opacity:1)，這幾天她整個人不會出現，要在這裡明確藏起來
      mikanEl.style.transition = 'none';
      mikanEl.style.opacity = '0';

      bgEl.classList.add('is-hiding');
      // 跟runHidingEntry()/runHidingPostPlanting()一致：這裡是「劇情需要」
      // 的濃霧（蜜柑躲起來了），不是「還沒到18:00」的showDaytimeFog判斷，
      // 不管今天有沒有寫過日記，一律強制顯示，兩者是不同的觸發原因
      daytimeFogEl.classList.add('is-visible');
      setupChairItemHotspot();

      diaryHotspot.classList.add('is-available');
      let browseIntroPlayedThisMount = false;
      function onBrowseDiaryClickHiding() {
        if (browseIntroPlayedThisMount) {
          if (hasTouchDiaryPlayedToday()) {
            openRecallOverlay();
          } else {
            markTouchDiaryPlayedToday();
            playTouchDiaryThenOpenRecall();
          }
          return;
        }
        browseIntroPlayedThisMount = true;

        const lines = params.showDaytimeFog
          ? [COPY.browseDiaryLineDaytime, COPY.browseDiaryLineShared]
          : [COPY.browseDiaryLineWritten, COPY.browseDiaryLineShared];

        function playLine(i) {
          const isLast = i === lines.length - 1;
          showDialogue(lines[i], function () {
            const holdMs = isLast ? 1200 : 1800;
            const t = setTimeout(function () {
              if (isLast) {
                hideDialogue();
                if (hasTouchDiaryPlayedToday()) {
                  openRecallOverlay();
                } else {
                  markTouchDiaryPlayedToday();
                  playTouchDiaryThenOpenRecall();
                }
              } else {
                playLine(i + 1);
              }
            }, holdMs);
            cleanupFns.push(function () { clearTimeout(t); });
          });
        }
        playLine(0);
      }
      diaryHotspot.addEventListener('click', onBrowseDiaryClickHiding);
      cleanupFns.push(function () { diaryHotspot.removeEventListener('click', onBrowseDiaryClickHiding); });

      farewellHotspot.classList.add('is-available');
      function onBrowseLeaveClickHiding() {
        if (!farewellHotspot.classList.contains('is-available')) return;
        farewellHotspot.classList.remove('is-available');
        showDialogue(COPY.browseFarewellHiding, function () {
          const t = setTimeout(function () {
            onComplete('farewell');
          }, 1800);
          cleanupFns.push(function () { clearTimeout(t); });
        });
      }
      farewellHotspot.addEventListener('click', onBrowseLeaveClickHiding);
      cleanupFns.push(function () { farewellHotspot.removeEventListener('click', onBrowseLeaveClickHiding); });
    }

    // ---------------- ritualStep: greeting ----------------
    function runGreeting() {
      // 不管走isHidingArc還是平常流程都要判斷，Day10-18依然是「有歷史」
      // 的狀態（只是蜜柑本人不出現），回憶日記的功能不該被連帶關掉
      if (params.hasHistory) {
        diaryRecallBtn.style.display = '';
      }

      // 只呼叫runHidingEntry()做這幾天專屬的進場設定，不能return——
      // 後面共用的日記面板按鈕綁定（送出/靈感燈泡/取消/二次確認）不管
      // isHidingArc與否都要執行到，之前這裡多寫了一個return，導致
      // Day10-18整個runGreeting()提早結束，那些按鈕從頭到尾沒被綁定
      if (isHidingArc) {
        runHidingEntry();
      }

      // Day10-18限定：蜜柑躲在小屋裡，整個進場沒有問候對話、搖椅維持空的，
      // 只有日記本熱區會發光。背景換成bg_hiding.png（窗戶有若隱若現的身影），
      // 濃霧強制壟罩全場——這裡是「劇情需要」，跟晝夜分明機制的showDaytimeFog
      // 是兩件事，但共用同一套視覺（daytimeFogEl那組far+near兩層）
      function runHidingEntry() {
        bgEl.classList.add('is-hiding');
        daytimeFogEl.classList.add('is-visible');

        // 沿用平常進場的「守夜燈慢慢亮起、黑幕淡出」開場，只是不會有蜜柑淡入
        const tLampHiding = setTimeout(function () {
          lampGlow.classList.add('is-steady');
          revealMask.classList.add('is-hidden');
          setupChairItemHotspot();
        }, 600);
        cleanupFns.push(function () { clearTimeout(tLampHiding); });

        const tDiaryReady = setTimeout(function () {
          diaryHotspot.classList.add('is-available');
        }, 2000);
        cleanupFns.push(function () { clearTimeout(tDiaryReady); });

        // Day10限定：點日記本熱區的第一件事，是先看到蜜柑留下的紙條內容
        // （用一般對話框呈現，跟greeting同一個位置/同一套點擊播放+淡出），
        // 才進日記面板；Day11-18沒有這個步驟，直接開面板。用localStorage
        // 記錄「今天看過了沒」，避免同一天重整頁面又重播一次
        const NOTE_SEEN_KEY = 'ef_day10NoteSeenDate';
        function hasSeenNoteToday() {
          return day === 10 && localStorage.getItem(NOTE_SEEN_KEY) === getTodayDateStr();
        }
        function playDay10Note(onDone) {
          const lines = COPY.day10NoteLines;
          let noteIndex = 0;
          function onNoteLineClick() {
            if (isTyping) { completeTypewriterNow(); return; }
            if (noteIndex < lines.length - 1) {
              noteIndex++;
              playNoteLine(noteIndex);
            }
          }
          function playNoteLine(i) {
            const isLast = i === lines.length - 1;
            if (isLast) {
              dialogueEl.removeEventListener('click', onNoteLineClick);
            }
            showDialogue(lines[i], function () {
              if (isLast) {
                const tHold = setTimeout(function () {
                  hideDialogue();
                  noteOverlay.classList.remove('is-visible'); // 插圖跟對話框一起淡出
                  const tFadeOut = setTimeout(function () {
                    onDone();
                  }, 1200); // 跟其他ritual轉場一樣，等淡出跑完才進下一步
                  cleanupFns.push(function () { clearTimeout(tFadeOut); });
                }, 1500);
                cleanupFns.push(function () { clearTimeout(tHold); });
              } else {
                dialogueNextEl.classList.add('is-visible');
              }
            });
          }
          // 紙條圖先當背景插圖淡入，等淡入跑完（0.8秒）文字才開始播放
          noteImg.src = 'assets/images/scene002_mainhub/note_day10.png';
          noteOverlay.classList.add('is-visible');
          const tImageIn = setTimeout(function () {
            dialogueEl.addEventListener('click', onNoteLineClick);
            cleanupFns.push(function () { dialogueEl.removeEventListener('click', onNoteLineClick); });
            playNoteLine(0);
          }, 900);
          cleanupFns.push(function () { clearTimeout(tImageIn); });
        }

        function onDiaryHotspotClickHiding() {
          if (!diaryHotspot.classList.contains('is-available')) return;
          diaryHotspot.classList.remove('is-available');
          if (day === 10 && !hasSeenNoteToday()) {
            localStorage.setItem(NOTE_SEEN_KEY, getTodayDateStr());
            playDay10Note(function () { openDiaryPanelForReal(); });
          } else {
            openDiaryPanelForReal();
          }
        }
        diaryHotspot.addEventListener('click', onDiaryHotspotClickHiding);
        cleanupFns.push(function () { diaryHotspot.removeEventListener('click', onDiaryHotspotClickHiding); });
      }

      // 開場揭幕：離開濃霧進場的瞬間，畫面幾乎全黑，只有守夜燈位置透出一點光；
      // 隨著守夜燈的光暈慢慢亮起，黑幕跟著淡出，背景才逐漸顯現全貌——呼應
      // 「所有魔法都源自守夜燈」的世界觀，讓玩家先注意到燈，而不是一次看到全部畫面。
      // isHidingArc已經在runHidingEntry()裡處理過自己的進場，這整段（蜜柑淡入、
      // 問候對話）都要跳過，但下面日記面板共用的部分不能跳過，所以這裡改用
      // if包起來，不是return
      if (!isHidingArc) {
        mikanEl.style.opacity = '0';
        mikanEl.style.transition = 'opacity 2s ease';

        const tLamp = setTimeout(function () {
          lampGlow.classList.add('is-steady');
          revealMask.classList.add('is-hidden');
        }, 600);
        cleanupFns.push(function () { clearTimeout(tLamp); });

        const tMikan = setTimeout(function () {
          if (activityPose) {
            // 活動日：淡入時直接出現在花園／湖邊／門口，而不是搖椅
            mikanEl.classList.add('is-activity-' + activityPose);
            setMikan(activityPose);
          } else {
            setMikan('idle');
          }
          mikanEl.style.opacity = '1';
        }, 4800);
        cleanupFns.push(function () { clearTimeout(tMikan); });

        const ACTIVITY_GREETING_COPY = {
          gardening: COPY.greetingActivityGardening,
          fishing: COPY.greetingActivityFishing,
          sweeping: COPY.greetingActivitySweeping
        };
        const storedPlayerName = localStorage.getItem(PLAYER_NAME_KEY);
        const greetingLines = activityPose
          ? ACTIVITY_GREETING_COPY[activityPose]
          : (params.hasHistory
            ? (storedPlayerName
              ? COPY.greetingReturningNamed.map(function (line) { return line.replace('{name}', storedPlayerName); })
              : COPY.greetingReturning)
            : COPY.greetingFirstTime);
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
          if (isTyping) { completeTypewriterNow(); return; }
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
      }

      function openDiaryPanelForReal() {
        diaryOverlay.classList.add('is-open');
        blankConfirm.classList.remove('is-visible');
        diaryActions.style.display = '';
        diaryInput.disabled = false;
        diaryInput.placeholder = COPY.diaryPlaceholder;
        if (!isTouchDevice) diaryInput.focus();
      }

      // 靈感燈泡：只換輸入框的提示文字(placeholder)，不直接把文字塞進
      // 輸入框內容裡——這樣玩家打字時提示文字自然消失，寫出來的完全是
      // 自己的話，不會有「在編輯蜜柑寫好的句子」的感覺。可以連續點好幾次
      // 換不同問題，故意避開連續兩次抽到同一題，避免看起來像卡住了
      let lastInspirationIndex = -1;
      function onDiaryInspirationClick() {
        const questions = COPY.diaryInspirationQuestions;
        let idx;
        do {
          idx = Math.floor(Math.random() * questions.length);
        } while (idx === lastInspirationIndex && questions.length > 1);
        lastInspirationIndex = idx;
        diaryInput.placeholder = questions[idx];
      }
      diaryInspirationBtn.addEventListener('click', onDiaryInspirationClick);
      cleanupFns.push(function () { diaryInspirationBtn.removeEventListener('click', onDiaryInspirationClick); });

      function playDiaryIntro() {
        const returningLines = day % 2 === 0 ? COPY.diaryIntroReturningEven : COPY.diaryIntroReturningOdd;
        const lines = params.hasHistory ? returningLines : COPY.diaryIntroFirstTime;

        // 開場白正式開始播放（蜜柑已經在椅子上、抱著日記姿勢）
        function startIntroLines() {
          // Day2+ 那句提到「抱著日記的我」，蜜柑講這句話時順勢切換成抱日記姿勢，
          // 呼應文字內容；Day1 開場白沒有提到這個動作，維持原本idle姿勢
          if (params.hasHistory) {
            setMikan('hold_diary');
          }

          function onIntroClick() {
            if (isTyping) { completeTypewriterNow(); return; }
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

        if (activityPose) {
          // 活動日：點日記本熱區的這一刻，蜜柑先在原地（花園/湖邊/門口）淡出，
          // 再淡入回到椅子上，接著才開始播放開場白——沿用進場那組opacity
          // transition（2s），時序跟進場揭幕的節奏一致
          mikanEl.style.transition = 'opacity 1s ease';
          mikanEl.style.opacity = '0';
          const tFadeOut = setTimeout(function () {
            mikanEl.classList.remove('is-activity-' + activityPose);
            setMikan('hold_diary');
            mikanEl.style.opacity = '1';
            const tFadeIn = setTimeout(function () {
              mikanIsAway = false; // 人已經回到椅子上了，恢復「摸摸蜜柑」彩蛋
              const mikanEggEl = container.querySelector('.mainhub-scene__egg--mikan');
              if (mikanEggEl) mikanEggEl.classList.remove('is-inactive');
              startIntroLines();
            }, 1000);
            cleanupFns.push(function () { clearTimeout(tFadeIn); });
          }, 1000);
          cleanupFns.push(function () { clearTimeout(tFadeOut); });
        } else {
          startIntroLines();
        }
      }

      // isHidingArc已經在runHidingEntry()裡綁過自己的日記本熱區點擊邏輯
      // （onDiaryHotspotClickHiding），這裡不能再綁一次，不然同一個熱區
      // 會同時觸發兩種反應
      if (!isHidingArc) {
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
      }

      // 空搖椅貓掌：每天第一次點擊時，蜜柑說兩句話，接著飛一顆光球到日記本，
      // 把日記本「點亮」得更明顯。不影響日記本原本就能點擊的邏輯，純粹是
      // 錦上添花的引導效果，就算玩家沒發現這個彩蛋，日記本一樣能正常使用。
      function onChairPawClick() {
        if (!chairPawHotspot.classList.contains('is-available')) return;
        chairPawHotspot.classList.remove('is-available');

        const chairLines = day % 2 === 0 ? COPY.chairPawLinesEven : COPY.chairPawLinesOdd;

        function playChairLine(i) {
          const isLast = i === chairLines.length - 1;
          showDialogue(chairLines[i], function () {
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
        // 一般流程裡，playDiaryIntro()播完就會恢復is-available，取消後
        // 本來就點得開；但isHidingArc是openDiaryPanelForReal()直接開面板，
        // 沒有這個恢復動作，取消後熱區會永遠關著點不開，這裡補上
        diaryHotspot.classList.add('is-available');
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

      // Day10-18限定：交給蜜柑後不是平常的對話+深呼吸，而是光球飛向小屋
      // 大門，蜜柑隔著門回應OS對話，播完才接續原本的回憶/種植流程
      function flyLightOrbToDoor() {
        const doorTarget = container.querySelector('.mainhub-scene__egg--door');
        // FLIP技巧同flyLightOrbToDiary：先無transition瞬間定位到起點，
        // 強制重繪一次，再啟用transition飛到終點
        const startLeft = diaryHotspot.offsetLeft + diaryHotspot.offsetWidth / 2;
        const startTop = diaryHotspot.offsetTop + diaryHotspot.offsetHeight / 2;
        const endLeft = doorTarget.offsetLeft + doorTarget.offsetWidth / 2;
        const endTop = doorTarget.offsetTop + doorTarget.offsetHeight / 2;

        chairLightOrb.style.transition = 'none';
        chairLightOrb.style.left = startLeft + 'px';
        chairLightOrb.style.top = startTop + 'px';
        chairLightOrb.classList.add('is-visible');
        void chairLightOrb.offsetWidth;

        chairLightOrb.style.transition = 'left 1.3s ease-in-out, top 1.3s ease-in-out, opacity 1.3s ease-in-out';
        chairLightOrb.style.left = endLeft + 'px';
        chairLightOrb.style.top = endTop + 'px';

        const tArrive = setTimeout(function () {
          chairLightOrb.classList.remove('is-visible');
        }, 1300);
        cleanupFns.push(function () { clearTimeout(tArrive); });
      }

      function playHidingArcOS(onDone) {
        const lines = COPY.hidingArcMikanOS[getHidingArcDialogueVariant(day)];
        // 位置：窗戶上方往右延伸到湖泊，跟平常置中的對話框不一樣，
        // 用is-hiding-os這個修飾class覆蓋位置
        dialogueEl.classList.add('is-hiding-os');
        let idx = 0;
        function onLineClick() {
          if (isTyping) { completeTypewriterNow(); return; }
          if (idx < lines.length - 1) {
            idx++;
            if (idx === lines.length - 1) {
              // 點擊進入最後一句話的這個瞬間，是這整段對話流程裡最後
              // 一次確定會發生的玩家手勢——原本background.mp3的切換是放在
              // playHidingArcMemory()開頭，但那裡要等這句話停留1.5秒、
              // 淡出1.2秒後才會真正執行到，離手勢已經隔了將近3秒，容易被
              // iOS的自動播放政策擋下。這裡提前到點擊當下觸發，貼近手勢
              if (window.EF.AudioManager) window.EF.AudioManager.switchToBackgroundMusic();
            }
            playLine(idx);
          }
        }
        function playLine(i) {
          const isLast = i === lines.length - 1;
          if (isLast) dialogueEl.removeEventListener('click', onLineClick);
          showDialogue(lines[i], function () {
            if (isLast) {
              const tHold = setTimeout(function () {
                hideDialogue();
                const tFade = setTimeout(function () {
                  dialogueEl.classList.remove('is-hiding-os');
                  onDone();
                }, 1200);
                cleanupFns.push(function () { clearTimeout(tFade); });
              }, 1500);
              cleanupFns.push(function () { clearTimeout(tHold); });
            } else {
              dialogueNextEl.classList.add('is-visible');
            }
          });
        }
        dialogueEl.addEventListener('click', onLineClick);
        cleanupFns.push(function () { dialogueEl.removeEventListener('click', onLineClick); });
        playLine(0);
      }

      function playHidingArcMemory(onDone) {
        // background.mp3的切換已經搬到playHidingArcOS()「點擊進入最後
        // 一句話」的那個瞬間觸發（更貼近玩家手勢，詳見該處註解），這裡
        // 不用再呼叫一次switchToBackgroundMusic()
        // 蜜柑先淡入——只有她本人，不開任何聚光燈的洞，所以搖椅本身不會
        // 被揭露（背後其實是bg_hiding.png的空搖椅，但因為沒開洞，只有
        // 蜜柑的sprite浮在全黑中，符合「不需要搖椅」的要求）。位置沿用
        // 預設搖椅座標（跟平常idle同一個位置），不套用任何活動足跡class
        mikanEl.classList.remove('is-activity-gardening', 'is-activity-fishing', 'is-activity-sweeping');
        // 蜜柑在這之前(runHidingEntry整段)從來沒被明確隱藏過，瀏覽器預設是
        // 完全可見。如果直接套用2秒transition再設opacity:0，會被當成
        // 「從可見淡出到隱藏」的動畫，造成蜜柑先閃現一下才消失。這裡先用
        // transition:none瞬間隱藏，2秒後才套用transition做真正的淡入
        mikanEl.style.transition = 'none';
        mikanEl.style.opacity = '0';
        setMikan('coverface');
        layoutFarewellRevealSpotlight(false); // 全黑，不開洞
        memorySpotlight.classList.add('is-fully-black');
        memorySpotlight.style.transition = 'opacity 1s ease';
        memorySpotlight.classList.add('is-visible');
        // 這幾天的對話框改到跟蜜柑同水平、置中，背景全黑融進畫面
        dialogueEl.classList.add('is-hiding-memory');

        const tMikanIn = setTimeout(function () {
          mikanEl.style.transition = 'opacity 2s ease';
          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              mikanEl.style.opacity = '1';
            });
          });

          const tRegion = setTimeout(function () {
            // 回憶播放區：沿用現有memory-frame跟setMp4WithPngFallback，
            // 素材沿用memory_day01~09（Day10對應01，以此類推）。這幾天
            // 額外套用色調+暗角(is-hiding-tone)，播放速度也調慢，讓同一段
            // 素材呈現出「這次看懂了它的重量」的沉重感
            const imgDay = window.EF.MemoryManager.getHidingArcMemoryImageDay(day);
            const imgDayStr = imgDay < 10 ? '0' + imgDay : String(imgDay);
            setMp4WithPngFallback(memoryVideo, memoryImg, 'assets/images/memories/memory_day' + imgDayStr);
            memoryVideo.playbackRate = 0.65;
            memoryVideo.classList.add('is-hiding-tone');
            memoryFrame.classList.add('is-hiding-tone');
            memoryFrame.classList.add('is-visible');

            const fragments = window.EF.MemoryManager.getHidingArcMemoryForDay(day);
            const MEMORY_TYPEWRITER_SPEED = 147; // 跟一般回憶片段同樣的慢速
            let idx = 0;
            function playLine(i) {
              showDialogue(fragments[i], function () {
                dialogueNextEl.classList.add('is-visible');
              }, MEMORY_TYPEWRITER_SPEED);
            }
            function onLineClick() {
              if (isTyping) { completeTypewriterNow(); return; }
              if (idx < fragments.length - 1) {
                idx++;
                playLine(idx);
              } else {
                dialogueEl.removeEventListener('click', onLineClick);
                const tHold = setTimeout(function () {
                  hideDialogue();
                  memoryFrame.classList.remove('is-visible', 'is-hiding-tone');
                  memoryVideo.classList.remove('is-hiding-tone');
                  memoryVideo.playbackRate = 1;
                  mikanEl.style.opacity = '0';
                  memorySpotlight.classList.remove('is-visible');
                  // is-hiding-memory要等對話框的opacity淡出(1.2秒)真的跑完
                  // 才能拿掉，不然位置(left/top/transform)沒有transition，
                  // 會在對話框都還沒淡出、還看得見的時候瞬間跳回預設位置
                  const tFadeOut = setTimeout(function () {
                    dialogueEl.classList.remove('is-hiding-memory');
                    onDone();
                  }, 1200);
                  cleanupFns.push(function () { clearTimeout(tFadeOut); });
                }, 1800);
                cleanupFns.push(function () { clearTimeout(tHold); });
              }
            }
            dialogueEl.addEventListener('click', onLineClick);
            cleanupFns.push(function () { dialogueEl.removeEventListener('click', onLineClick); });
            playLine(0);
          }, 1500); // 蜜柑先淡入、停留一下，回憶播放區才浮現
          cleanupFns.push(function () { clearTimeout(tRegion); });
        }, 2000); // 等蜜柑淡入的2秒跑完
        cleanupFns.push(function () { clearTimeout(tMikanIn); });
      }

      function proceedWithSubmitHiding(diaryText) {
        // 在離seed planting播放最近的這次真實點擊當下先解鎖影片，
        // 詳見main.js的primeSeedPlantingVideo
        if (window.EF.primeSeedPlantingVideo) window.EF.primeSeedPlantingVideo();
        // 同時也在這個時間點重新解鎖一次background.mp3：它原本只在
        // 整個流程最開頭「進入森林」那次點擊解鎖過，這裡離之後真正切到
        // background.mp3的時間點更近，重新解鎖一次更保險。用專屬的
        // primeBackgroundMusic而不是重跑整組unlockAll，避免影響到這時候
        // 已經在播放中的night-ambience
        if (window.EF.AudioManager && window.EF.AudioManager.primeBackgroundMusic) window.EF.AudioManager.primeBackgroundMusic();
        diaryOverlay.classList.remove('is-open');
        diaryHotspot.classList.remove('is-available');
        flyLightOrbToDoor();
        const tOrbArrive = setTimeout(function () {
          playHidingArcOS(function () {
            playHidingArcMemory(function () {
              onComplete('diary_submitted', { diaryText: diaryText });
            });
          });
        }, 1400); // 等光球真的飛到門口才開始講OS，跟flyLightOrbToDoor的1.3秒飛行時間對齊
        cleanupFns.push(function () { clearTimeout(tOrbArrive); });
      }

      function proceedWithSubmit(diaryText) {
        if (isHidingArc) {
          proceedWithSubmitHiding(diaryText);
          return;
        }
        // 在離seed planting播放最近的這次真實點擊當下先解鎖影片，
        // 詳見main.js的primeSeedPlantingVideo
        if (window.EF.primeSeedPlantingVideo) window.EF.primeSeedPlantingVideo();
        // 同時也在這個時間點重新解鎖一次background.mp3：它原本只在
        // 整個流程最開頭「進入森林」那次點擊解鎖過，這裡離之後真正切到
        // background.mp3的時間點更近，重新解鎖一次更保險。用專屬的
        // primeBackgroundMusic而不是重跑整組unlockAll，避免影響到這時候
        // 已經在播放中的night-ambience
        if (window.EF.AudioManager && window.EF.AudioManager.primeBackgroundMusic) window.EF.AudioManager.primeBackgroundMusic();
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
          // 空檔打字，導致畫面上看起來有內容、但送出的其實還是空白值。
          //
          // 連續第2次(以上)什麼都沒寫：輸入框額外自動填上一句固定文字
          // （仍然鎖住不能編輯），讓玩家真的按下送出時，等於送出這句話，
          // 現有的「有寫/沒寫」判斷邏輯完全不用改，自然就會產生一般的
          // 隨機植物，而不是連續好幾天都是「放空」植物
          diaryActions.style.display = 'none';
          diaryInspirationBtn.style.display = 'none';
          blankConfirm.classList.add('is-visible');
          diaryInput.disabled = true;
          if (params.consecutiveBlankDays >= 1) {
            diaryInput.value = COPY.blankAutoFillText;
            diaryInput.placeholder = '';
          } else {
            diaryInput.placeholder = '';
          }
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
        // 讀取輸入框目前實際的內容送出：第1次放空這裡會是空字串，
        // 連續第2次以上則會是剛剛自動填入的那句話，讓後續判斷自然分流
        proceedWithSubmit(diaryInput.value.trim());
      }
      blankConfirmYesBtn.addEventListener('click', onBlankConfirmYes);
      cleanupFns.push(function () { blankConfirmYesBtn.removeEventListener('click', onBlankConfirmYes); });

      function onBlankConfirmNo() {
        blankConfirm.classList.remove('is-visible');
        diaryActions.style.display = '';
        diaryInspirationBtn.style.display = '';
        diaryInput.disabled = false;
        diaryInput.value = ''; // 清掉可能自動填入的文字，讓玩家可以真正自己重新打字
        diaryInput.placeholder = COPY.diaryPlaceholder;
        if (!isTouchDevice) diaryInput.focus();
      }
      blankConfirmNoBtn.addEventListener('click', onBlankConfirmNo);
      cleanupFns.push(function () { blankConfirmNoBtn.removeEventListener('click', onBlankConfirmNo); });
    }

    // ---------------- ritualStep: post_planting ----------------
    // ---------------- ritualStep: post_planting (Day10-18專用簡化版) ----------------
    // 回憶已經在greeting階段的playHidingArcMemory()裡播過了，這裡不能再跑
    // 一次一般的回憶流程——直接回到場景、開啟離開熱區，讓玩家決定要停留
    // 還是道別，蜜柑全程不會出現
    function runHidingPostPlanting() {
      // 這個mount是全新的container.innerHTML，蜜柑預設是完全可見
      // (opacity:1)，這幾天她整個人不會出現，要在這裡明確藏起來
      mikanEl.style.transition = 'none';
      mikanEl.style.opacity = '0';

      diaryHotspot.classList.remove('is-available');
      bgEl.classList.add('is-hiding');
      daytimeFogEl.classList.add('is-visible');
      // main.js的goToMainHub()在掛載這個mount之前，一定會先呼叫
      // playNightAmbience()，這裡要蓋回去，確保background.mp3從回憶模式
      // 開始，一路播到玩家真正按下道別為止，不會被切回night-ambience
      if (window.EF.AudioManager) window.EF.AudioManager.switchToBackgroundMusic();

      // seedPlanting動畫播完、回到這裡的第一件事：蜜柑先隔著窗說幾句話，
      // 講完才開放離開熱區跟守夜燈——沿用跟hidingArcMikanOS一樣的位置
      // 跟點擊播放下一句寫法
      function playHidingArcPlantOS(onDone) {
        const lines = COPY.hidingArcPlantOS[getHidingArcDialogueVariant(day)];
        dialogueEl.classList.add('is-hiding-os');
        let idx = 0;
        function onLineClick() {
          if (isTyping) { completeTypewriterNow(); return; }
          if (idx < lines.length - 1) {
            idx++;
            playLine(idx);
          }
        }
        function playLine(i) {
          const isLast = i === lines.length - 1;
          if (isLast) dialogueEl.removeEventListener('click', onLineClick);
          showDialogue(lines[i], function () {
            if (isLast) {
              const tHold = setTimeout(function () {
                hideDialogue();
                // is-hiding-os要等對話框opacity淡出(1.2秒)真的跑完才能拿掉，
                // 不然位置(left/top/transform)沒有transition，會在對話框
                // 都還沒淡出、還看得見的時候瞬間跳回預設位置
                const tFadeOut = setTimeout(function () {
                  dialogueEl.classList.remove('is-hiding-os');
                  onDone();
                }, 1200);
                cleanupFns.push(function () { clearTimeout(tFadeOut); });
              }, 1500);
              cleanupFns.push(function () { clearTimeout(tHold); });
            } else {
              dialogueNextEl.classList.add('is-visible');
            }
          });
        }
        dialogueEl.addEventListener('click', onLineClick);
        cleanupFns.push(function () { dialogueEl.removeEventListener('click', onLineClick); });
        playLine(0);
      }

      const tPlantOS = setTimeout(function () {
        playHidingArcPlantOS(function () {
          farewellHotspot.classList.add('is-available');
          farewellPhaseReached = true;
          const unlockDay = window.EF.MemoryMatchManager.UNLOCK_DAY;
          if (day > unlockDay && !memoryMatchPlayedToday) {
            lampGlow.classList.add('is-blinking');
            const tLampBlink = setTimeout(function () {
              lampGlow.classList.remove('is-blinking');
            }, 1500);
            cleanupFns.push(function () { clearTimeout(tLampBlink); });
          }
        });
      }, 1000); // 進場稍微停留一下再開口，不要一秒到就講話
      cleanupFns.push(function () { clearTimeout(tPlantOS); });

      function onFarewellClickHiding() {
        if (!farewellHotspot.classList.contains('is-available')) return;
        farewellHotspot.classList.remove('is-available');
        // 取代平常的farewellPrompt（「謝謝你今天願意陪著我」不適用，
        // 蜜柑人不在場），改用敲門的提示
        showDialogue(COPY.hidingArcKnockPrompt, function () {
          farewellChoice.classList.add('is-visible');
        });
      }
      farewellHotspot.addEventListener('click', onFarewellClickHiding);
      cleanupFns.push(function () { farewellHotspot.removeEventListener('click', onFarewellClickHiding); });

      function onChooseLeaveHiding() {
        farewellChoice.classList.remove('is-visible');
        hideDialogue();
        // 沿用聚光燈全黑機制，把整個場景淡出1.5秒，才接fog exit，
        // 不會有畫面突然跳轉的感覺
        layoutFarewellRevealSpotlight(false);
        memorySpotlight.classList.add('is-fully-black');
        memorySpotlight.style.transition = 'opacity 1.5s ease';
        memorySpotlight.classList.add('is-visible');
        const tFadeOut = setTimeout(function () {
          onComplete('farewell');
        }, 1500);
        cleanupFns.push(function () { clearTimeout(tFadeOut); });
      }
      farewellLeaveBtn.addEventListener('click', onChooseLeaveHiding);
      cleanupFns.push(function () { farewellLeaveBtn.removeEventListener('click', onChooseLeaveHiding); });

      // 「再待一會」跟平常流程完全一樣：收起選項，讓離開熱區恢復可點擊，
      // 沒有次數限制
      function onChooseStayHiding() {
        farewellChoice.classList.remove('is-visible');
        hideDialogue();
        const tBack = setTimeout(function () {
          farewellHotspot.classList.add('is-available');
        }, 600);
        cleanupFns.push(function () { clearTimeout(tBack); });
      }
      farewellStayBtn.addEventListener('click', onChooseStayHiding);
      cleanupFns.push(function () { farewellStayBtn.removeEventListener('click', onChooseStayHiding); });
    }

    function runPostPlanting() {
      if (isHidingArc) {
        runHidingPostPlanting();
        return;
      }

      setMikan('listening');
      // 明確關閉日記本熱區：post_planting 階段今天的日記已經寫過了，
      // 不應該再被點開（回憶心情功能仍保留，但那是綁在日記輸入面板裡，
      // 只有 greeting 階段打開日記本時才看得到，不受這裡影響）
      diaryHotspot.classList.remove('is-available');

      const fragments = window.EF.MemoryManager.getMemoryForDay(day);
      const imgDay = window.EF.MemoryManager.getMemoryImageDay(day);
      const imgDayStr = imgDay < 10 ? '0' + imgDay : String(imgDay);
      let index = 0;

      // 抓「今天種出的植物」名稱，用在下面的揭曉對話裡。花園清單裡每筆
      // 都有day欄位，跟todaysPlantSlot判斷「今天的植物」用的是同一個
      // 比對方式（entry.day === day），這裡直接沿用
      const gardenLayoutForReveal = window.EF.GardenManager.getGardenLayout();
      const todaysGardenEntry = gardenLayoutForReveal.find(function (e) { return e.day === day; });
      const todaysPlantNameZh = todaysGardenEntry ? (PLANT_INFO[todaysGardenEntry.plantType] || {}).nameZh : '';
      const plantRevealText = todaysPlantNameZh
        ? '喵~情緒植物「' + todaysPlantNameZh + '」被你喚醒囉~'
        : '喵~又有一株新的情緒植物冒出來了~'; // 抓不到名稱時的保底文案，理論上不會用到

      // 這句「植物揭曉」對話，除了本身是有意義的敘事內容（讓玩家知道今天
      // 種出了什麼），也順便解決了iOS自動播放政策的問題：background.mp3
      // 的切換原本是1.5秒後自動觸發，全程沒有任何點擊，離「送出日記」那次
      // 手勢太遠，容易被iOS擋下。現在改成玩家點擊這句話之後才觸發，
      // 是一個新鮮的手勢，不需要額外加突兀的「請點擊繼續」按鈕
      const tReveal = setTimeout(function () {
        showDialogue(plantRevealText, function () {
          dialogueNextEl.classList.add('is-visible');
        });
      }, 1500);
      cleanupFns.push(function () { clearTimeout(tReveal); });

      function enterMemoryGlow() {
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
        dialogueEl.addEventListener('click', onDialogueClick);
        cleanupFns.push(function () { dialogueEl.removeEventListener('click', onDialogueClick); });
        playFragment(index);
      }

      function onRevealClick() {
        if (isTyping) { completeTypewriterNow(); return; } // 逐字輸出中不回應點擊，避免搶話
        dialogueEl.removeEventListener('click', onRevealClick);
        hideDialogue();
        const tRevealFade = setTimeout(function () {
          enterMemoryGlow();
        }, 600); // 等對話框淡出動畫跑完，再切進回憶模式，畫面銜接不會太突兀
        cleanupFns.push(function () { clearTimeout(tRevealFade); });
      }
      dialogueEl.addEventListener('click', onRevealClick);
      cleanupFns.push(function () { dialogueEl.removeEventListener('click', onRevealClick); });

      // 回憶對話的逐字速度比一般對話慢約1/3（110→147），讓回憶片段讀起來
      // 更有分量、更慢，跟其他情境（開場白、深呼吸引導等）的節奏做出區隔
      const MEMORY_TYPEWRITER_SPEED = 147;
      function playFragment(i) {
        showDialogue(fragments[i], function () {
          dialogueNextEl.classList.add('is-visible');
        }, MEMORY_TYPEWRITER_SPEED);
      }

      function onDialogueClick() {
        if (isTyping) { completeTypewriterNow(); return; } // 逐字輸出中不回應點擊，避免搶話
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

      const stayLines = day === 1 ? COPY.stayLinesFirstTime : (day % 2 === 0 ? COPY.stayLinesEven : COPY.stayLinesOdd);
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
                farewellPhaseReached = true;
                // Day4起：道別三句話講完的同一刻，如果今天還沒玩過記憶
                // 翻牌，守夜燈就自動閃爍提示玩家「這裡可以點」，不用等
                // 玩家自己發現。Day3維持原本邏輯，閃爍綁在按下「道別」
                // 按鈕之後才觸發（見onChooseLeave裡的解鎖劇本）
                const unlockDay = window.EF.MemoryMatchManager.UNLOCK_DAY;
                if (day > unlockDay && !memoryMatchPlayedToday) {
                  lampGlow.classList.add('is-blinking');
                  const tLampBlink = setTimeout(function () {
                    lampGlow.classList.remove('is-blinking');
                  }, 1500);
                  cleanupFns.push(function () { clearTimeout(tLampBlink); });
                }
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
        if (isTyping) { completeTypewriterNow(); return; }
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

      function playFarewellDay1() {
        // Day1限定的多句道別，寫法沿用playStayLine同一套點擊播放模式，
        // 保持風格一致；播完直接進onComplete，Day1不會撞到day===3的
        // 守夜燈解鎖分支，不用另外處理
        const lines = COPY.farewellDay1;
        let idx = 0;
        function onLineClick() {
          if (isTyping) { completeTypewriterNow(); return; }
          if (idx < lines.length - 1) {
            idx++;
            playLine(idx);
          }
        }
        function playLine(i) {
          const isLast = i === lines.length - 1;
          if (isLast) {
            dialogueEl.removeEventListener('click', onLineClick);
          }
          showDialogue(lines[i], function () {
            if (isLast) {
              const tRead = setTimeout(function () {
                onComplete('farewell');
              }, 2000);
              cleanupFns.push(function () { clearTimeout(tRead); });
            } else {
              dialogueNextEl.classList.add('is-visible');
            }
          });
        }
        dialogueEl.addEventListener('click', onLineClick);
        cleanupFns.push(function () { dialogueEl.removeEventListener('click', onLineClick); });
        playLine(0);
      }

      function playDay9Reveal() {
        // Day9限定：找回記憶的揭露時刻。畫面全黑只留聚光燈在蜜柑身上，
        // 節奏是寫死的時間軸（不是點擊播放），刻意做得比一般對話更慢、
        // 更多留白，呼應「這是一次性的情緒轉折」而不是日常對話
        farewellHotspot.classList.remove('is-available');
        // 防呆：如果玩家在正式流程中沒點過貓掌搖椅（或用跳天數測試跳過了
        // 正常流程），這兩個熱區的pulse光暈會一直殘留is-available，
        // z-index比黑幕高，不管遮罩怎麼挖洞都會直接穿幫。這裡直接用inline
        // style強制關閉，不只是拿掉class，避免任何CSS連鎖反應沒生效的疑慮
        chairPawHotspot.classList.remove('is-available');
        chairPawHotspot.style.transition = 'none';
        chairPawHotspot.style.opacity = '0';
        diaryHotspot.classList.remove('is-available');
        diaryHotspot.style.transition = 'none';
        diaryHotspot.style.opacity = '0';

        // 蜜柑在DOM順序上排在遮罩「之後」、z-index又跟遮罩同層，不管遮罩
        // 挖不挖洞，她都會直接蓋在黑幕之上——所以這裡要先讓她本人瞬間隱形，
        // 而不是等黑幕淡入完才處理；舊的道別對話框也要立刻收掉，不然會
        // 一起穿幫、停留在黑幕上
        hideDialogue();
        mikanEl.style.transition = 'none';
        mikanEl.style.opacity = '0';

        layoutFarewellRevealSpotlight(false); // 全黑，蜜柑的洞也收起來
        // 黑幕淡入速度這裡覆蓋成1秒，不影響其他地方沿用的預設2.2秒；
        // is-fully-black讓填色從回憶模式的0.82不透明改成真正的全黑
        memorySpotlight.classList.add('is-fully-black');
        memorySpotlight.style.transition = 'opacity 1s ease';
        memorySpotlight.classList.add('is-visible');

        const DAY9_TYPE_SPEED = 200; // 比一般對話(110ms/字)慢，呼應回憶片段的沉重感

        const t1 = setTimeout(function () {
          showDialogue(COPY.day9RevealSilence, function () {
            const t2 = setTimeout(function () {
              hideDialogue();
              const t3 = setTimeout(function () {
                // 「．．．」停頓感，讓它出現兩次
                showDialogue(COPY.day9RevealSilence, function () {
                  const t3b = setTimeout(function () {
                    hideDialogue();
                    const t3c = setTimeout(function () {
                      // 這裡才打開蜜柑的洞——洞本身是瞬間出現的，「慢慢浮現」
                      // 的感覺交給蜜柑圖片自己的opacity淡入負責
                      layoutFarewellRevealSpotlight(true);
                      mikanEl.classList.remove('is-activity-gardening', 'is-activity-fishing', 'is-activity-sweeping');
                      mikanEl.style.transition = 'opacity 2s ease';
                      setMikan('coverface');
                      // 下一個影格再淡入，確保opacity:0有先套用，不會因為
                      // 同一輪事件迴圈內連續設定被瀏覽器合併成看不到淡入過程
                      requestAnimationFrame(function () {
                        requestAnimationFrame(function () {
                          mikanEl.style.opacity = '1';
                        });
                      });
                      const t4 = setTimeout(function () {
                        showDialogue(COPY.day9RevealLine, function () {
                          const t5 = setTimeout(function () {
                            hideDialogue();
                            const t6 = setTimeout(function () {
                              onComplete('farewell');
                            }, 1500);
                            cleanupFns.push(function () { clearTimeout(t6); });
                          }, 2500);
                          cleanupFns.push(function () { clearTimeout(t5); });
                        }, DAY9_TYPE_SPEED);
                      }, 2000); // 蜜柑淡入的2秒跑完，才開口說話
                      cleanupFns.push(function () { clearTimeout(t4); });
                    }, 2500);
                    cleanupFns.push(function () { clearTimeout(t3c); });
                  }, 1500);
                  cleanupFns.push(function () { clearTimeout(t3b); });
                }, DAY9_TYPE_SPEED);
              }, 1500);
              cleanupFns.push(function () { clearTimeout(t3); });
            }, 1500); // 打完字後停留1.5秒再淡出，不是用固定秒數猜整句話的長度
            cleanupFns.push(function () { clearTimeout(t2); });
          }, DAY9_TYPE_SPEED);
        }, 2500);
        cleanupFns.push(function () { clearTimeout(t1); });
      }

      function onChooseLeave() {
        farewellChoice.classList.remove('is-visible');
        setMikan('bye');

        if (day === 1) {
          playFarewellDay1();
          return;
        }
        if (day === 9) {
          playDay9Reveal();
          return;
        }

        showDialogue(COPY.farewell, function () {
          const unlockDay = window.EF.MemoryMatchManager.UNLOCK_DAY; // 3
          if (day === unlockDay) {
            // 第3天當次道別後，插入守夜燈解鎖劇本：先規律閃爍1.5秒，
            // 蜜柑說一句話，再直接進入第一局小遊戲。玩完（不管完成或
            // 中途按「先不玩了」）才接續原本的離開濃霧流程
            const t3 = setTimeout(function () {
              hideDialogue();
              lampGlow.classList.add('is-blinking');
              const tBlink = setTimeout(function () {
                lampGlow.classList.remove('is-blinking');
                showDialogue(COPY.lampUnlockLine, function () {
                  const tGame = setTimeout(function () {
                    hideDialogue();
                    memoryMatchPlayedToday = true;
                    memoryMatchReturnsToFarewell = true;
                    openMemoryMatchGame();
                  }, 1200);
                  cleanupFns.push(function () { clearTimeout(tGame); });
                });
              }, 1500);
              cleanupFns.push(function () { clearTimeout(tBlink); });
            }, 1500); // 打完字後的停留時間，不是猜整句話打完要多久
            cleanupFns.push(function () { clearTimeout(t3); });
          } else {
            const t3 = setTimeout(function () {
              onComplete('farewell');
            }, 1500); // 打完字後的停留時間，不是猜整句話打完要多久
            cleanupFns.push(function () { clearTimeout(t3); });
          }
        });
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