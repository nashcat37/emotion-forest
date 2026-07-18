/* ============================================================
   Scene_001_Fog
   對應規格：41_Component_Spec_Scene001_Fog.md

   重要：本版修正了先前測試檔（scene001_fog_full.html）為了方便單檔測試
   而把「Cinematic → Interactive」串在一起的做法。正式規格是：

     direction=enter, isFirstEver=true  → 只播 Cinematic，播完直接 onComplete()
     其餘情況（含 direction=exit）       → 只跑 Interactive 濃霧，散霧後 onComplete()

   兩者不會在同一次 mount 中同時發生。
   ============================================================ */

window.EF = window.EF || {};
window.EF.scenes = window.EF.scenes || {};

window.EF.scenes.fog = (function () {

  const EXIT_TOUCH_THRESHOLD = 3;
  const EXIT_TIME_MS = 9000;
  const MAX_CONCURRENT_TOUCH_FX = 3;

  // 每次 mount 都會建立新的內部狀態，避免重複進出這個 Scene 時狀態互相污染
  let cleanupFns = [];

  function mount(container, params, onComplete) {
    cleanupFns = [];
    const direction = params.direction || 'enter';
    const isFirstEver = !!params.isFirstEver;

    if (direction === 'enter' && isFirstEver) {
      mountCinematic(container, onComplete);
    } else {
      mountInteractive(container, onComplete, direction);
    }
  }

  function unmount() {
    cleanupFns.forEach(function (fn) { fn(); });
    cleanupFns = [];
  }

  // ---------------- Cinematic（僅首次進入播放一次）----------------
  function mountCinematic(container, onComplete) {
    const layer = document.createElement('div');
    layer.className = 'cinematic-layer';

    const video = document.createElement('video');
    video.src = 'assets/videos/cine_first_entry.mp4';
    video.playsInline = true;
    layer.appendChild(video);
    container.appendChild(layer);

    function handleEnded() {
      onComplete();
    }
    video.addEventListener('ended', handleEnded, { once: true });
    cleanupFns.push(function () {
      video.removeEventListener('ended', handleEnded);
      video.pause();
    });

    video.play().catch(function (err) {
      // 若瀏覽器政策阻擋播放（例如尚未取得使用者互動），記錄但不讓流程卡死。
      console.warn('[FogScene] Cinematic 播放失敗，可能需要使用者互動手勢：', err);
    });
  }

  // 進入森林(enter)跟離開森林(exit)使用不同的濃霧文字，enter 是玩家準備進入
  // 森林時的引導語，exit 維持原本「霧，一直都在」的收尾語，兩者語感不同不能共用
  const FOG_DIALOGUE = {
    enter: '你正一步步穿過厚重的濃霧，<br>外面的世界逐漸安靜了下來。',
    exit: '霧，一直都在。它不是危險，是邊界。'
  };

  // ---------------- Interactive Fog（每天日常穿越）----------------
  function mountInteractive(container, onComplete, direction) {
    const scene = document.createElement('div');
    scene.className = 'fog-scene';
    const dialogueText = FOG_DIALOGUE[direction] || FOG_DIALOGUE.exit;
    scene.innerHTML =
      '<div class="fog-scene__bg"></div>' +
      '<div class="fog-scene__layer-wrap">' +
      '  <div class="fog-scene__layer fog-scene__layer-a"></div>' +
      '  <div class="fog-scene__layer fog-scene__layer-b"></div>' +
      '</div>' +
      '<div class="fog-scene__dialogue">' + dialogueText + '</div>';
    container.appendChild(scene);

    // soft-wind 只在「第二次以後進入」跟「離開」的互動濃霧播放，
    // 首次進入播的是 Cinematic（mountCinematic），不會走到這裡
    if (window.EF.AudioManager) {
      window.EF.AudioManager.playSoftWind();
    }
    cleanupFns.push(function () {
      if (window.EF.AudioManager) window.EF.AudioManager.stopSoftWind();
    });

    let touchCount = 0;
    let activeTouchFx = 0;
    let completed = false;
    let startTime = performance.now();
    let rafId = null;

    function spawnDissipateEffect(x, y) {
      if (activeTouchFx >= MAX_CONCURRENT_TOUCH_FX) return;
      activeTouchFx++;
      const fx = document.createElement('div');
      fx.className = 'touch-dissipate';
      const size = scene.clientWidth * 0.3;
      fx.style.width = size + 'px';
      fx.style.height = size + 'px';
      fx.style.left = x + 'px';
      fx.style.top = y + 'px';
      scene.appendChild(fx);
      fx.addEventListener('animationend', function () {
        fx.remove();
        activeTouchFx--;
      });
    }

    function handlePointer(e) {
      if (completed) return;
      const rect = scene.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      spawnDissipateEffect(x, y);
      touchCount++;
      if (touchCount >= EXIT_TOUCH_THRESHOLD) triggerDissipate();
    }
    scene.addEventListener('pointerdown', handlePointer);
    cleanupFns.push(function () {
      scene.removeEventListener('pointerdown', handlePointer);
    });

    function triggerDissipate() {
      if (completed) return;
      completed = true;
      scene.classList.add('is-dissipating');
      setTimeout(function () {
        onComplete();
      }, 3200);
    }

    function tick() {
      if (!completed) {
        const elapsed = performance.now() - startTime;
        if (elapsed >= EXIT_TIME_MS) {
          triggerDissipate();
        }
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);
    cleanupFns.push(function () {
      if (rafId) cancelAnimationFrame(rafId);
    });
  }

  return { mount: mount, unmount: unmount };
})();
