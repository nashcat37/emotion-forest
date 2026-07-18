/* ============================================================
   Cinematic_SeedPlanting

   與 Scene_001_Fog 的 Cinematic 不同：這裡「每天都會播放」，
   不做 isFirstEver 判斷。原始素材已經過裁切處理：
     - 移除左右黑邊（原始 1280x720 → 裁切為 948x720）
     - 黑邊移除的同時，也一併去除了 Veo 浮水印
   影片第一格畫面內容與 scene002_mainhub_bg.png 幾乎一致，
   因此本 Scene 建議搭配 SceneManager 的 instant 轉場模式呼叫，
   避免銜接處出現不必要的黑畫面（見 main.js）。
   ============================================================ */

window.EF = window.EF || {};
window.EF.scenes = window.EF.scenes || {};

window.EF.scenes.seedPlanting = (function () {

  const PRE_PLAY_HOLD_MS = 500;    // 播放前先停留，呼應「慢」的核心節奏
  const POST_END_HOLD_MS = 1000;   // 播完後凍結最後一格，讓玩家看清楚光球落下的樣子
  const FADEOUT_MS = 1000;         // 凍結畫面淡出至靜態背景的時間

  let cleanupFns = [];

  function mount(container, params, onComplete) {
    cleanupFns = [];

    const layer = document.createElement('div');
    layer.className = 'cinematic-layer cinematic-layer--seed-planting';

    // 靜態背景墊在影片下方：播放前的停留、播完後的淡出，都是「淡出影片、露出這張圖」，
    // 因為影片第一格／最後一格內容與這張背景幾乎一致，銜接不會有跳動感。
    const staticBg = document.createElement('div');
    staticBg.className = 'seed-planting__static-bg';
    layer.appendChild(staticBg);

    const video = document.createElement('video');
    video.className = 'seed-planting__video';
    video.src = 'assets/videos/cine_seed_planting.mp4';
    video.playsInline = true;
    layer.appendChild(video);

    container.appendChild(layer);

    const playTimer = setTimeout(function () {
      video.play().catch(function (err) {
        console.warn('[SeedPlantingScene] 播放失敗，可能需要使用者互動手勢：', err);
      });
    }, PRE_PLAY_HOLD_MS);
    cleanupFns.push(function () { clearTimeout(playTimer); });

    function handleEnded() {
      const holdTimer = setTimeout(function () {
        video.classList.add('is-fading-out');
        const fadeTimer = setTimeout(function () {
          onComplete();
        }, FADEOUT_MS);
        cleanupFns.push(function () { clearTimeout(fadeTimer); });
      }, POST_END_HOLD_MS);
      cleanupFns.push(function () { clearTimeout(holdTimer); });
    }
    video.addEventListener('ended', handleEnded, { once: true });
    cleanupFns.push(function () {
      video.removeEventListener('ended', handleEnded);
      video.pause();
    });

    // 已知缺口：淡出後露出的靜態背景尚未有種子/幼苗圖層（等 GardenManager 完成），
    // 花圃裡的光球淡出後就是空的土壤。這支影片已經讓「消失」的過程變得緩慢、
    // 不是瞬間切換，但「消失」這件事本身還是暫時的預期落差，不是錯誤。
  }

  function unmount() {
    cleanupFns.forEach(function (fn) { fn(); });
    cleanupFns = [];
  }

  return { mount: mount, unmount: unmount };
})();
