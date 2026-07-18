/* ============================================================
   SceneManager
   職責：掛載／卸載 Scene、處理淡入淡出轉場。
   不負責：「下一步該去哪個 Scene」——這是 main.js（未來的 RitualManager）的工作。
   Scene 之間不互相呼叫，一律經過這裡。
   ============================================================ */

window.SceneManager = (function () {
  const appEl = document.getElementById('app');
  const devStateEl = document.getElementById('devState');

  let currentSceneModule = null;
  let currentRootEl = null;

  const TRANSITION_MS = 1200; // 需與 CSS .scene-root transition 時間一致

  function goTo(sceneName, params, onComplete, options) {
    const sceneModule = window.EF && window.EF.scenes && window.EF.scenes[sceneName];
    if (!sceneModule) {
      console.error('[SceneManager] 找不到已註冊的 Scene：' + sceneName);
      return;
    }
    const instant = !!(options && options.instant);

    function mountNew() {
      const rootEl = document.createElement('div');
      rootEl.className = 'scene-root scene-root--' + sceneName;
      appEl.appendChild(rootEl);

      currentRootEl = rootEl;
      currentSceneModule = sceneModule;

      if (instant) {
        // 內容視覺上與前一個 Scene 相符時使用（例如 MainHub → SeedPlanting），
        // 直接顯示，不做淡入，避免銜接處出現不必要的黑畫面。
        rootEl.classList.add('is-active', 'no-transition');
      } else {
        requestAnimationFrame(function () {
          rootEl.classList.add('is-active');
        });
      }

      sceneModule.mount(rootEl, params || {}, function () {
        if (typeof onComplete === 'function') onComplete.apply(null, arguments);
      });

      if (devStateEl) devStateEl.textContent = sceneName;
    }

    if (currentSceneModule && currentRootEl) {
      const oldRoot = currentRootEl;
      const oldModule = currentSceneModule;

      if (instant) {
        if (typeof oldModule.unmount === 'function') oldModule.unmount();
        oldRoot.remove();
        mountNew();
        return;
      }

      oldRoot.classList.remove('is-active');
      setTimeout(function () {
        if (typeof oldModule.unmount === 'function') oldModule.unmount();
        oldRoot.remove();
        mountNew();
      }, TRANSITION_MS);
    } else {
      mountNew();
    }
  }

  return { goTo: goTo };
})();
