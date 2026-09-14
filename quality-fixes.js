/* Small compatibility layer for minigame visual and state feedback. */
const FULL_BODY = 'assets/character.png';
function installFullBodyCanvasFallback() {
  const proto = globalThis.CanvasRenderingContext2D?.prototype;
  if (!proto || proto.__fullBodyFallback) return;
  const original = proto.drawImage;
  proto.drawImage = function (image, ...args) {
    try {
      const src = String(image?.currentSrc || image?.src || '');
      if (/character-poses\/classic-00\.webp(?:\?|$)/.test(src) && args.length >= 8) {
        const replacement = this.__fullBodyImage || new Image();
        if (!replacement.src) replacement.src = FULL_BODY;
        this.__fullBodyImage = replacement;
        if (replacement.complete && replacement.naturalWidth) {
          image = replacement;
          args = [0, 0, replacement.naturalWidth, replacement.naturalHeight, ...args.slice(4)];
        }
      }
    } catch {}
    return original.call(this, image, ...args);
  };
  proto.__fullBodyFallback = true;
}
function installHeartDeathGuard() {
  const observer = new MutationObserver(() => {
    const status = document.querySelector('#mini-status');
    const title = document.querySelector('#modal-title')?.textContent || '';
    if (!status || title !== '털의 점프 챌린지' || !/하트 없음/.test(status.textContent || '')) return;
    const feedback = document.querySelector('#feedback');
    if (feedback) feedback.textContent = 'GAME OVER · 하트를 모두 사용했어요.';
    const abandon = document.querySelector('#abandon');
    if (abandon && !abandon.dataset.deathHandled) {
      abandon.dataset.deathHandled = 'yes';
      setTimeout(() => abandon.isConnected && abandon.click(), 650);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}
installFullBodyCanvasFallback();
// Do not auto-close the jump challenge when hearts reach zero. The game is
// intentionally playable to the end so the player can still finish practice.
