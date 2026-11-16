export const petVariants = [
  { id: "classic", label: "Classic" },
  { id: "dog", label: "Dog" },
  { id: "tora", label: "Tora" },
  { id: "maia", label: "Maia" },
  { id: "vaporwave", label: "Vaporwave" },
  { id: "sanskar", label: "Sanskar" },
];

// oneko.js: https://github.com/adryd325/oneko.js

export function startOneko() {
  if (document.getElementById("oneko")) return () => {};
  let animationFrame = 0;
  let drag = null;
  let longPressTimer;
  let grabTimer;
  let paused = false;
  let manualSleep = false;
  let autoSleep = false;
  let variant;
  const dockQuery = matchMedia("(max-width: 1024px), (hover: none), (pointer: coarse)");
  let docked = false;
  let dockFrame = 0;
  function readPreference(key) {
    try {
      return JSON.parse(localStorage.getItem("oneko:" + key));
    } catch {
      return null;
    }
  }
  function savePreference(key, value) {
    try {
      localStorage.setItem("oneko:" + key, JSON.stringify(value));
    } catch {}
  }
  // Keep the replacement selected for visitors who chose the previous mascot.
  const preference = readPreference("variant");
  const saved = preference === "ramxcodes" ? "sanskar" : preference;
  if (preference === "ramxcodes") savePreference("variant", saved);
  variant = petVariants.some((p) => p.id === saved)
    ? saved
    : petVariants[Math.floor(Math.random() * petVariants.length)].id;
  function emitState() {
    nekoEl.dataset.variant = variant;
    nekoEl.dataset.sleeping = String(docked || manualSleep || autoSleep);
    window.dispatchEvent(
      new CustomEvent("oneko:state", {
        detail: { variant, sleeping: docked || manualSleep || autoSleep, manualSleep, docked },
      })
    );
  }
  function openPicker() {
    window.dispatchEvent(new CustomEvent("oneko:open-picker"));
  }

  const nekoEl = document.createElement("div");

  let nekoPosX = 32;
  let nekoPosY = 32;

  let mousePosX = 0;
  let mousePosY = 0;

  let frameCount = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;

  const nekoSpeed = 10;
  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };

  function init() {
    nekoEl.id = "oneko";
    nekoEl.setAttribute("data-swarm-ignore", "");
    nekoEl.setAttribute("role", "button");
    nekoEl.setAttribute(
      "aria-label",
      "Pet companion: drag to move, Enter to choose a pet, Space to sleep"
    );
    nekoEl.setAttribute("aria-haspopup", "dialog");
    nekoEl.tabIndex = 0;
    nekoEl.style.cursor = docked ? "pointer" : "grab";
    nekoEl.style.touchAction = "none";
    nekoEl.style.userSelect = "none";
    nekoEl.title = "Drag to move. Right-click to choose a pet. Double-click to sleep.";
    nekoEl.style.width = "32px";
    nekoEl.style.height = "32px";
    nekoEl.style.position = "fixed";
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
    nekoEl.style.zIndex = 30;

    nekoEl.style.backgroundImage = "url(/oneko/oneko-" + variant + ".gif)";

    document.body.appendChild(nekoEl);
    syncDock();
    dockQuery.addEventListener("change", syncDock);

    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerdown", onPointerFocus, true);
    document.addEventListener("keydown", onKeyboardFocus, true);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("resize", constrainPosition);
    nekoEl.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);
    nekoEl.addEventListener("contextmenu", onContextMenu);
    nekoEl.addEventListener("dblclick", toggleSleep);
    nekoEl.addEventListener("keydown", onKeyDown);
    window.addEventListener("blur", cancelDrag);
    window.addEventListener("oneko:set-variant", onVariant);
    window.addEventListener("oneko:random", onRandom);
    window.addEventListener("oneko:toggle-sleep", toggleSleep);
    window.addEventListener("oneko:route-change", onRoute);
    window.addEventListener("oneko:pause", onPause);

    animationFrame = window.requestAnimationFrame(onAnimationFrame);
  }

  let lastFrameTimestamp;

  function onAnimationFrame(timestamp) {
    // Stops execution if the neko element is removed from DOM
    if (!nekoEl.isConnected) {
      return;
    }
    if (!lastFrameTimestamp) {
      lastFrameTimestamp = timestamp;
    }
    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }
    animationFrame = window.requestAnimationFrame(onAnimationFrame);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    nekoEl.style.backgroundPosition = `${sprite[0] * 32}px ${sprite[1] * 32}px`;
  }

  function syncDock() {
    const home = document.querySelector("[data-pet-home]");
    const next = dockQuery.matches;
    if (next && !home) {
      nekoEl.style.visibility = "hidden";
      return;
    }
    if (next === docked && (!next || nekoEl.parentElement === home)) return;
    cancelDrag();
    docked = next;
    dockFrame = 0;
    nekoEl.dataset.docked = String(docked);
    nekoEl.style.transform = "";
    nekoEl.style.visibility = "";
    nekoEl.style.position = docked ? "absolute" : "fixed";
    nekoEl.style.zIndex = docked ? "0" : "30";
    nekoEl.style.cursor = docked ? "pointer" : "grab";
    nekoEl.style.touchAction = docked ? "manipulation" : "none";
    nekoEl.style.transformOrigin = "50% 85%";
    nekoEl.title = docked ? "Sleeping companion. Tap to choose a pet." : "Drag to move. Right-click to choose a pet. Double-click to sleep.";
    nekoEl.setAttribute("aria-label", docked ? "Sleeping pet companion: choose a pet" : "Pet companion: drag to move, Enter to choose a pet, Space to sleep");
    (docked ? home : document.body).appendChild(nekoEl);
    if (docked) {
      nekoEl.style.left = "4px";
      nekoEl.style.top = "8px";
      nekoEl.dataset.dockPhase = "hidden";
    } else {
      delete nekoEl.dataset.dockPhase;
      constrainPosition();
    }
    emitState();
  }

  function dockFrameStep() {
    if (document.querySelector("[data-site-loader]")) return;
    dockFrame += 1;
    const end = nekoEl.parentElement.offsetWidth + 4;
    let left = 4;
    let phase = "hidden";
    if (dockFrame > 4 && dockFrame <= 12) {
      phase = "emerging";
      left = 4 + (end - 12) * Math.min(1, (dockFrame - 4) / 8);
      setSprite("E", dockFrame);
    } else if (dockFrame <= 20 && dockFrame > 12) {
      phase = "shaking";
      left = end - 8;
      setSprite("alert", 0);
      nekoEl.style.transform = `rotate(${dockFrame % 2 ? -8 : 8}deg)`;
    } else if (dockFrame > 20 && dockFrame <= 26) {
      phase = "settling";
      left = end - 8 + 8 * (dockFrame - 20) / 6;
      setSprite("E", dockFrame);
    } else if (dockFrame > 26) {
      phase = "sleeping";
      left = end;
      setSprite("sleeping", Math.floor((dockFrame - 26) / 4));
    }
    if (phase !== "shaking") nekoEl.style.transform = "";
    nekoEl.style.left = `${left}px`;
    nekoEl.dataset.dockPhase = phase;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    // every ~ 20 seconds
    if (idleTime > 10 && Math.floor(Math.random() * 200) == 0 && idleAnimation == null) {
      let avalibleIdleAnimations = ["sleeping", "scratchSelf"];
      if (nekoPosX < 32) {
        avalibleIdleAnimations.push("scratchWallW");
      }
      if (nekoPosY < 32) {
        avalibleIdleAnimations.push("scratchWallN");
      }
      if (nekoPosX > window.innerWidth - 32) {
        avalibleIdleAnimations.push("scratchWallE");
      }
      if (nekoPosY > window.innerHeight - 32) {
        avalibleIdleAnimations.push("scratchWallS");
      }
      idleAnimation =
        avalibleIdleAnimations[Math.floor(Math.random() * avalibleIdleAnimations.length)];
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192 && !manualSleep && !autoSleep) {
          resetIdleAnimation();
        }
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    idleAnimationFrame += 1;
  }

  function frame() {
    if (document.documentElement.hasAttribute("data-swarm-active")) return;
    frameCount += 1;
    if (dockQuery.matches && (!docked || !nekoEl.parentElement?.matches("[data-pet-home]"))) syncDock();
    if (paused || drag) return;
    if (docked) {
      dockFrameStep();
      return;
    }
    // Recheck even while idle/asleep: hovered dock icons can grow toward the pet.
    constrainPosition();
    if (manualSleep || autoSleep) {
      idleAnimation = "sleeping";
      idle();
      return;
    }
    if (!matchMedia("(any-hover: hover) and (any-pointer: fine)").matches) {
      idle();
      return;
    }
    const target = avoidControls(mousePosX, mousePosY);
    const diffX = nekoPosX - target.x;
    const diffY = nekoPosY - target.y;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 48) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite("alert", 0);
      // count down after being alerted before moving
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    let direction;
    direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    const position = avoidControls(nekoPosX, nekoPosY);
    nekoPosX = Math.min(Math.max(16, position.x), window.innerWidth - 16);
    nekoPosY = Math.min(Math.max(16, position.y), window.innerHeight - 16);

    nekoEl.style.left = `${nekoPosX - 16}px`;
    nekoEl.style.top = `${nekoPosY - 16}px`;
  }

  function cancelDrag() {
    clearTimeout(longPressTimer);
    clearTimeout(grabTimer);
    if (drag) {
      try {
        nekoEl.releasePointerCapture(drag.id);
      } catch {}
    }
    drag = null;
    nekoEl.style.cursor = docked ? "pointer" : "grab";
    resetIdleAnimation();
  }
  function onPointerFocus() { nekoEl.dataset.pointerFocus = "true"; }
  function onKeyboardFocus() { delete nekoEl.dataset.pointerFocus; }

  function onPointerDown(event) {
    if (event.button !== 0 || !event.isPrimary || paused) return;
    if (docked) {
      event.preventDefault();
      openPicker();
      return;
    }
    event.preventDefault();
    cancelDrag();
    nekoEl.focus({ preventScroll: true });
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      petX: nekoPosX,
      petY: nekoPosY,
      moved: false,
    };
    nekoEl.setPointerCapture(event.pointerId);
    nekoEl.style.cursor = "grabbing";
    setSprite("alert", 0);
    if (event.pointerType === "touch") {
      longPressTimer = setTimeout(() => {
        cancelDrag();
        openPicker();
      }, 500);
    }
  }
  function onPointerMove(event) {
    if (drag && event.pointerId === drag.id) {
      const dx = event.clientX - drag.x,
        dy = event.clientY - drag.y;
      if (Math.hypot(dx, dy) > 10) {
        drag.moved = true;
        clearTimeout(longPressTimer);
      }
      if (drag.moved) {
        if (Math.abs(dx) > Math.abs(dy))
          setSprite(dx > 0 ? "scratchWallW" : "scratchWallE", frameCount);
        else setSprite(dy > 0 ? "scratchWallN" : "scratchWallS", frameCount);
        clearTimeout(grabTimer);
        grabTimer = setTimeout(() => {
          if (drag) setSprite("alert", 0);
        }, 150);
        nekoPosX = drag.petX + dx;
        nekoPosY = drag.petY + dy;
        constrainPosition();
      }
      return;
    }
    if (docked || event.pointerType === "touch" || paused || manualSleep || autoSleep) return;
    mousePosX = event.clientX;
    mousePosY = event.clientY;
  }
  function onPointerUp(event) {
    if (!drag || drag.id !== event.pointerId) return;
    mousePosX = nekoPosX;
    mousePosY = nekoPosY;
    cancelDrag();
  }
  function onContextMenu(event) {
    event.preventDefault();
    cancelDrag();
    openPicker();
  }
  function onKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      openPicker();
    }
    if (event.key === " ") {
      event.preventDefault();
      toggleSleep();
    }
  }
  function toggleSleep() {
    if (docked) return;
    manualSleep = !(manualSleep || autoSleep);
    autoSleep = false;
    resetIdleAnimation();
    emitState();
  }
  function onVariant(event) {
    if (!petVariants.some((p) => p.id === event.detail)) return;
    variant = event.detail;
    savePreference("variant", variant);
    nekoEl.style.backgroundImage = "url(/oneko/oneko-" + variant + ".gif)";
    emitState();
  }
  function onRandom() {
    savePreference("variant", null);
    variant = petVariants[Math.floor(Math.random() * petVariants.length)].id;
    nekoEl.style.backgroundImage = "url(/oneko/oneko-" + variant + ".gif)";
    emitState();
  }
  function onRoute(event) {
    autoSleep = ["/contact"].some(
      (route) => event.detail === route || event.detail.startsWith(route + "/")
    );
    resetIdleAnimation();
    emitState();
  }
  function onPause(event) {
    paused = Boolean(event.detail);
    if (paused) cancelDrag();
  }

  function avoidControls(x, y) {
    const controls = document.querySelectorAll('[data-oneko-dodge], #oneko-dodge, .article-toc-pill');
    for (const control of controls) {
      const bounds = control.getBoundingClientRect();
      if (!bounds.width || !bounds.height) continue;
      const left = bounds.left - 20, right = bounds.right + 20, top = bounds.top - 20, bottom = bounds.bottom + 20;
      if (x > left && x < right && y > top && y < bottom) {
        const distances = [x - left, right - x, y - top, bottom - y];
        const side = distances.indexOf(Math.min(...distances));
        if (side === 0) x = left;
        if (side === 1) x = right;
        if (side === 2) y = top;
        if (side === 3) y = bottom;
      }
    }
    // The bottom dock is solid all the way to the viewport edge. Include growing
    // icons in its bounds so the full 32px sprite stays outside the visible dock.
    for (const dock of document.querySelectorAll("[data-pet-barrier]")) {
      const bounds = dock.getBoundingClientRect();
      if (!bounds.width || !bounds.height) continue;
      let left = bounds.left, right = bounds.right, top = bounds.top;
      for (const icon of dock.querySelectorAll("a")) {
        const iconBounds = icon.getBoundingClientRect();
        left = Math.min(left, iconBounds.left);
        right = Math.max(right, iconBounds.right);
        top = Math.min(top, iconBounds.top);
      }
      const clearance = 20; // Half the sprite plus a 4px visible gap.
      if (x > left - clearance && x < right + clearance && y > top - clearance) {
        y = top - clearance;
      }
    }
    return { x, y };
  }

  function constrainPosition() {
    if (docked) return;
    const position = avoidControls(nekoPosX, nekoPosY);
    nekoPosX = position.x;
    nekoPosY = position.y;
    nekoPosX = Math.min(Math.max(16, nekoPosX), Math.max(16, window.innerWidth - 16));
    nekoPosY = Math.min(Math.max(16, nekoPosY), Math.max(16, window.innerHeight - 16));
    nekoEl.style.left = nekoPosX - 16 + "px";
    nekoEl.style.top = nekoPosY - 16 + "px";
  }

  function onVisibilityChange() {
    window.cancelAnimationFrame(animationFrame);
    if (document.hidden) cancelDrag();
    lastFrameTimestamp = undefined;
    if (!document.hidden) animationFrame = window.requestAnimationFrame(onAnimationFrame);
  }

  init();
  setSprite("idle", 0);
  emitState();
  return () => {
    window.cancelAnimationFrame(animationFrame);
    dockQuery.removeEventListener("change", syncDock);
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerdown", onPointerFocus, true);
    document.removeEventListener("keydown", onKeyboardFocus, true);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("resize", constrainPosition);
    cancelDrag();
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerUp);
    window.removeEventListener("blur", cancelDrag);
    window.removeEventListener("oneko:set-variant", onVariant);
    window.removeEventListener("oneko:random", onRandom);
    window.removeEventListener("oneko:toggle-sleep", toggleSleep);
    window.removeEventListener("oneko:route-change", onRoute);
    window.removeEventListener("oneko:pause", onPause);
    nekoEl.remove();
  };
}
