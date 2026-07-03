// ========================================================
// 📚 1. 胖貓蜜柑的失憶回憶碎片庫（每組皆完美優化為 3 段長對白）
// ========================================================
const memoryFragments = [
    [
        "「我想起來了... 魔法師主人以前也總是坐在左邊那張搖椅上。」",
        "「他離開那天什麼都沒帶走，只把大霧、守夜燈，還有這本日記留給了我。」",
        "「最後，他溫柔地揉了揉我的頭，叫我別怕... 我等了他好久喵...」"
    ],
    [
        "「對了喵... 我稍微記起來了。這座森林之所以一直停留在夜晚...」",
        "「開展靜止魔法是為了讓疲憊的人有不被打擾的黑夜。」",
        "「主人曾說過，在寂靜的夜晚好好睡上一覺，明天才能慢慢好起來喵...」"
    ],
    [
        "「看著你今天種下的光芒，我腦海中閃過一幅很美麗的畫面...」",
        "「這盞守夜燈，其實不是用火油點燃的喵。」",
        "「它燃燒的是『被接住的寂寞』。只要外面的你來到這裡感受到安心，這盞燈火就永遠不會熄滅...」"
    ],
    [
        "「喵... 我剛剛恍惚想起了一首旋律。」",
        "「以前花園長滿植物時，魔法師主人會坐在湖邊，用湖畔的蘆葦為我吹起音樂。」",
        "「雖然我還想不起他的臉，但聽到你剛才在日記裡寫下的話... 我心裡好像沒那麼害怕了喵。」"
    ]
];

const entrySteps = [
    "遠方，一盞溫暖的守夜燈在迷霧中搖曳...<br>你順著光芒，找到了熟悉的湖畔木屋。",
    "推開門，空气很安靜。<br>坐在搖椅上的胖貓蜜柑揉了眼睛，轉頭看見了你。",
    "「喵...你回來了。今天，外面的世界也很不容易吧？」<br>蜜柑向你打了個招呼。",
    "你走到木屋旁的空搖椅坐下。<br>桌上的魔法日記本在守夜燈下散發著極淡的光暈，等待著你。"
];

// ========================================================
// ⚙️ 2. 核心狀態控制大腦變數
// ========================================================
let isDiarySubmitted = false; 
let diaryCount = 0;
let currentMemoryArray = []; 
let currentMemoryIndex = 0;  
let typingTimer = null;       
let isReadyToCloseGame = false; 

// ========================================================
// 🚀 3. 網頁元件完全加載後的安全起跑線
// ========================================================
window.addEventListener('DOMContentLoaded', () => {
    // 讀取進度天數，防止出錯
    try { diaryCount = parseInt(localStorage.getItem('emotionForest_diaryCount')) || 0; } catch (e) { diaryCount = 0; }

    // 抓取網頁所有 UI 元件
    const ritualLayer = document.getElementById('ritualLayer');
    const ritualText = document.getElementById('ritualText');
    const diaryBox = document.getElementById('diaryBox');
    const catBox = document.getElementById('catBox');
    const catTalk = document.getElementById('catTalk');
    const submitBtn = document.getElementById('submitBtn');
    const catNextBtn = document.getElementById('catNextBtn');
    const exploreBtn = document.getElementById('exploreBtn');
    const leaveBtn = document.getElementById('leaveBtn');
    const clickPrompt = document.getElementById('clickPrompt');
    const bgmAudio = document.getElementById('bgmAudio');

    // 初始化星空（根據歷史天數點亮背景星星）
    generateStars(diaryCount * 5);

    // 一進來直接全面點亮、復甦下方的 7 種植物（放棄每天出現一朵花的限制）
    document.querySelectorAll('.plant-glow-effect').forEach(plant => {
        plant.classList.remove('sleeping');
        plant.classList.add('active');
    });

    // ✍️ 核心打字機函數（一個字一個字蹦出來，播放流暢）
    function typeWriter(text, element, speed = 90, onComplete = null) {
        clearInterval(typingTimer);
        element.innerText = "";
        let i = 0;
        typingTimer = setInterval(() => {
            if (i < text.length) {
                element.innerText += text.charAt(i);
                i++;
            } else {
                clearInterval(typingTimer);
                if (onComplete) onComplete();
            }
        }, speed);
    }

    // 🌲 濃霧邊界層點擊監聽 (負責安全關閉世界功能)
    if (ritualLayer) {
        ritualLayer.addEventListener('click', () => {
            if (isReadyToCloseGame) {
                window.close();
                setTimeout(() => { window.location.href = "about:blank"; }, 100);
                return;
            }
        });
    }

    // ========================================================
    // 📝 4. 日記本送出事件大腦（修復卡死元凶，移除斷線函數）
    // ========================================================
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const diaryInput = document.getElementById('diaryInput');
            if (!diaryInput || diaryInput.value.trim() === "") return;

            // 播放魔法特效音
            const magicSfx = document.getElementById('magicSfx');
            if (magicSfx) { magicSfx.currentTime = 0; magicSfx.play().catch(()=>{}); }

            isDiarySubmitted = true;
            if (diaryBox) diaryBox.classList.add('hidden'); // 隱藏日記本

            // 儲存並推進永久進度
            diaryCount++;
            try { localStorage.setItem('emotionForest_diaryCount', diaryCount); } catch(err){}
            generateStars(5, true); // 天空誕生 5 顆新星星

            // 隨機抽取回憶
            currentMemoryArray = memoryFragments[Math.floor(Math.random() * memoryFragments.length)];
            currentMemoryIndex = 0;

            // 確保對話框處於完美的顯現狀態
            if (catBox) {
                catBox.classList.remove('hidden');
                catBox.style.opacity = "1";
                catBox.style.transform = "translateY(0px)";
            }

            // 開始播放第一段回憶
            if (catTalk) {
                typeWriter(`（蜜柑靜靜感受著日記化作生命的微光...）\n\n${currentMemoryArray[currentMemoryIndex]}`, catTalk, 90, () => {
                    if (catNextBtn) {
                        catNextBtn.innerText = "靜靜聆聽 ▼";
                        catNextBtn.classList.remove('hidden');
                    }
                });
            }
        });
    }

    // ========================================================
    // 🐱 5. 故事前進與「選擇離開 / 探索周圍」雙分支選項
    // ========================================================
    if (catNextBtn) {
        catNextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const clickSfx = document.getElementById('clickSfx');
            if (clickSfx) { clickSfx.currentTime = 0; clickSfx.play().catch(()=>{}); }
            
            catNextBtn.classList.add('hidden'); // 字打完前先藏起按鈕

            // A 階段：長篇回憶尚未訴說完畢，繼續打印下一句
            if (currentMemoryIndex < currentMemoryArray.length - 1) {
                currentMemoryIndex++;
                if (catTalk) {
                    typeWriter(`${currentMemoryArray[currentMemoryIndex]}`, catTalk, 90, () => {
                        if (catNextBtn) {
                            catNextBtn.classList.remove('hidden');
                            if (currentMemoryIndex === currentMemoryArray.length - 1) {
                                catNextBtn.innerText = "輕輕摸摸蜜柑 ▼";
                            }
                        }
                    });
                }
            } 
            // B 階段：回憶大功告成，跳出最終雙分支
            else {
                if (catTalk) {
                    typeWriter("「謝謝你今天願意陪著我，也謝謝你幫這座森林找回溫度。你要回去了嗎，還是想在這裡多待一下喵？」", catTalk, 90, () => {
                        if (leaveBtn) { leaveBtn.innerText = "選擇離開"; leaveBtn.classList.remove('hidden'); }
                        if (exploreBtn) { exploreBtn.innerText = "探索周圍"; exploreBtn.classList.remove('hidden'); }
                    });
                }
            }
        });
    }

    // 👑 分支 A：探索周圍 ➔ 講完話對話框在 2.5 秒後，絲滑霧化隱形消失
    if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const clickSfx = document.getElementById('clickSfx');
            if (clickSfx) { clickSfx.currentTime = 0; clickSfx.play().catch(()=>{}); }

            exploreBtn.classList.add('hidden');
            if (leaveBtn) leaveBtn.classList.add('hidden');
            
            typeWriter("（蜜柑在搖椅上舒服地打了個哈欠，蜷縮在守夜燈的光芒下）\n\n「好喵... 那你就先在花園裡走走，想待多久就待多久，準備離開時再來點我喵。」", catTalk, 90, () => {
                // 文字打印完畢後，等待 1.5 秒讓玩家讀完，隨後啟動 0.5 秒的絲滑隱形消失
                setTimeout(() => {
                    if (catBox) {
                        catBox.style.opacity = "0";
                        catBox.style.transform = "translateY(-10px)";
                        setTimeout(() => {
                            catBox.classList.add('hidden');
                        }, 500);
                    }
                }, 1500);
            });
        });
    }

    // 👑 分支 B：選擇離開 ➔ 拉起濃霧，啟動關閉閘門
    if (leaveBtn) {
        leaveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (ritualLayer) {
                ritualLayer.style.display = 'flex';
                setTimeout(() => {
                    ritualLayer.classList.remove('fade-out');
                    if (ritualText) { ritualText.innerHTML = `守夜燈在身後的迷霧中，散發著微弱而恆久的光芒...<br>你再次步入了濃霧，回到了現實。<br><br>這座平靜的湖畔森林，隨時歡迎你「回家」。`; }
                    if (clickPrompt) { clickPrompt.innerText = "【期待明天再見 (點擊此處關閉世界)】"; }
                    if (exploreBtn) exploreBtn.classList.add('hidden');
                    if (leaveBtn) leaveBtn.classList.add('hidden');
                    isReadyToCloseGame = true; // 允許下次點擊關閉分頁
                }, 100);
            }
        });
    }

    // ========================================================
    // 🎯 6. 雙擊爆發 2 秒黃金星光粒子
    // ========================================================
    function spawnMagicStars(e) {
        const gameMainZone = document.getElementById('gameMainZone');
        if (!gameMainZone) return;
        const rect = gameMainZone.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        for (let i = 0; i < 5; i++) {
            const star = document.createElement('div');
            star.classList.add('magic-star', 'star-birth');
            const offsetX = (Math.random() * 80 - 40);
            const offsetY = (Math.random() * 80 - 40);
            const randomSize = Math.floor(Math.random() * 4) + 4; 
            
            star.style.left = (clickX + offsetX) + 'px';
            star.style.top = (clickY + offsetY) + 'px';
            star.style.width = randomSize + 'px';
            star.style.height = randomSize + 'px';
            star.style.zIndex = '60';
            star.style.boxShadow = '0 0 12px #FFFDD6, 0 0 20px #E6BF83';
            star.style.background = '#FFFDD6';

            const starfield = document.getElementById('starfield');
            if (starfield) {
                starfield.appendChild(star);
                setTimeout(() => {
                    star.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    star.style.opacity = '0';
                    star.style.transform = 'scale(0)';
                    setTimeout(() => star.remove(), 500);
                }, 2000);
            }
        }
    }

    // ========================================================
    // 🎯 7. 各大熱區單擊特效與雙擊星光監聽器
    // ========================================================
    
    // 守夜燈
    const hotspotLamp = document.getElementById('hotspot-lamp');
    if (hotspotLamp) {
        hotspotLamp.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            const glow = document.querySelector('.ambient-glow'); 
            if (glow) { 
                glow.style.transform = 'scale(1.5)'; 
                setTimeout(() => glow.style.transform = 'scale(1)', 1500); 
            } 
        });
        hotspotLamp.addEventListener('dblclick', (e) => { e.stopPropagation(); spawnMagicStars(e); });
    }

    // 茶壺
    const hotspotPot = document.getElementById('hotspot-pot');
    if (hotspotPot) {
        hotspotPot.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            const steam = document.querySelector('.steam-effect'); 
            if (steam) { 
                steam.classList.add('active'); 
                setTimeout(() => steam.classList.remove('active'), 3000); 
            } 
        });
        hotspotPot.addEventListener('dblclick', (e) => { e.stopPropagation(); spawnMagicStars(e); });
    }

    // 湖面
    const hotspotLake = document.getElementById('hotspot-lake');
    if (hotspotLake) {
        hotspotLake.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            const ripple = document.querySelector('.ripple-effect'); 
            if (ripple) { 
                ripple.style.left = e.clientX + 'px'; 
                ripple.style.top = e.clientY + 'px'; 
                ripple.classList.add('active'); 
                setTimeout(() => ripple.classList.remove('active'), 2000); 
            } 
        });
        hotspotLake.addEventListener('dblclick', (e) => { e.stopPropagation(); spawnMagicStars(e); });
    }

    // 胖貓咪（👑 修正 3 續：再次點擊隱形的貓咪時，對話框重新滑動喚醒）
    const hotspotCat = document.getElementById('hotspot-cat');
    if (hotspotCat) {
        hotspotCat.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // 情況 A：如果還沒寫日記，維持基本的溫暖蹭手撒嬌
            if (!isDiarySubmitted) {
                typeWriter("「喵嗚...（蜜柑微微抬起頭蹭了蹭你的手掌）我有在這裡乖乖等你喔。」", catTalk);
            } 
            // 情況 B：點選了探索周圍導致對話框隱形了，再次單擊貓咪會重新滑動喚醒對話框與雙按鈕！
            else {
                if (catBox) {
                    catBox.classList.remove('hidden');
                    setTimeout(() => {
                        catBox.style.opacity = "1";
                        catBox.style.transform = "translateY(0px)";
                    }, 50);
                }
                typeWriter("「喵？你還想多留在這裡陪我聊天，還是你準備要穿過大霧回去了呢？」", catTalk, 80, () => {
                    if (exploreBtn) exploreBtn.classList.remove('hidden');
                    if (leaveBtn) leaveBtn.classList.remove('hidden');
                });
            }
        });
        hotspotCat.addEventListener('dblclick', (e) => { e.stopPropagation(); spawnMagicStars(e); });
    }

    // 下方花園 7 種植物的單擊打亮與雙擊星光
    document.querySelectorAll('.plant-glow-effect').forEach(plant => {
        plant.addEventListener('click', (e) => {
            e.stopPropagation();
            plant.style.filter = 'brightness(2) drop-shadow(0 0 30px rgba(230, 191, 131, 0.9))';
            setTimeout(() => plant.style.filter = 'none', 1000);
        });
        plant.addEventListener('dblclick', (e) => { e.stopPropagation(); spawnMagicStars(e); });
    });
});

// ========================================================
// 🌌 8. 輔助函數：背景小星星生成
// ========================================================
function generateStars(count, isNew = false) {
    const starfield = document.getElementById('starfield'); 
    if (!starfield) return;
    
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div'); 
        star.classList.add('magic-star');
        const randomTop = Math.floor(Math.random() * 45) + 10; 
        const randomLeft = Math.floor(Math.random() * 90) + 5;
        const randomSize = Math.floor(Math.random() * 3) + 1; 
        const randomDelay = (Math.random() * 3).toFixed(1);
        
        star.style.top = randomTop + '%'; 
        star.style.left = randomLeft + '%'; 
        star.style.width = randomSize + 'px'; 
        star.style.height = randomSize + 'px'; 
        star.style.animationDelay = randomDelay + 's';
        
        if (isNew) star.classList.add('star-birth'); 
        starfield.appendChild(star);
    }
}

