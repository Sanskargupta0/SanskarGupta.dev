"use client";

// Adapted from the supplied vapour-text reference as a one-shot exit.
// Rasterize the existing text AND SVG so the live layout and type stay untouched.
import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { createPortal } from "react-dom";

type Particle = {
  x: number;
  y: number;
  alpha: number;
  color: string;
  driftX: number;
  driftY: number;
};
type VapourExitProps = {
  target: RefObject<HTMLElement>;
  active: boolean;
  reducedMotion: boolean;
  allSizes?: boolean;
  onComplete: () => void;
};

function snapshot(target: HTMLElement) {
  const svg = target.querySelector("svg")!;
  const text = target.querySelector<HTMLSpanElement>(":scope > span")!;
  const targetBox = target.getBoundingClientRect();
  const svgBox = svg.getBoundingClientRect(),
    textBox = text.getBoundingClientRect();
  const left = Math.min(svgBox.left, textBox.left) - 36;
  const top = Math.min(svgBox.top, textBox.top) - 36;
  const width = Math.ceil(Math.max(svgBox.right, textBox.right) - left + 60);
  const height = Math.ceil(Math.max(svgBox.bottom, textBox.bottom) - top + 36);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const image = document.createElement("canvas");
  image.width = Math.ceil(width * dpr);
  image.height = Math.ceil(height * dpr);
  const ctx = image.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  const color = getComputedStyle(target).color;
  ctx.strokeStyle = color;
  ctx.lineWidth = Number.parseFloat(getComputedStyle(svg).strokeWidth);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.save();
  ctx.translate(svgBox.left - left, svgBox.top - top);
  ctx.scale(svgBox.width / svg.viewBox.baseVal.width, svgBox.height / svg.viewBox.baseVal.height);
  if (svg.querySelector('[vector-effect="non-scaling-stroke"]')) {
    ctx.lineWidth /= svgBox.width / svg.viewBox.baseVal.width;
  }
  svg.querySelectorAll("path").forEach((path) => ctx.stroke(new Path2D(path.getAttribute("d")!)));
  ctx.restore();

  const style = getComputedStyle(text);
  const matrix = new DOMMatrix(style.transform === "none" ? undefined : style.transform);
  const corners = [
    [0, 0],
    [text.offsetWidth, 0],
    [0, text.offsetHeight],
    [text.offsetWidth, text.offsetHeight],
  ].map(([x, y]) => new DOMPoint(x, y).matrixTransform(matrix));
  const originX = textBox.left - Math.min(...corners.map((point) => point.x));
  const originY = textBox.top - Math.min(...corners.map((point) => point.y));
  ctx.save();
  ctx.translate(originX - left, originY - top);
  ctx.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f);
  ctx.fillStyle = color;
  ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
  ctx.textBaseline = "alphabetic";
  const fontSize = Number.parseFloat(style.fontSize);
  const lineHeight = Number.parseFloat(style.lineHeight) || fontSize;
  const metrics = ctx.measureText("Hg");
  const ascent = metrics.fontBoundingBoxAscent || fontSize * 0.8;
  const descent = metrics.fontBoundingBoxDescent || fontSize * 0.2;
  const baseline = (lineHeight - ascent - descent) / 2 + ascent;
  text.innerText
    .split("\n")
    .forEach((line, index) => ctx.fillText(line, 0, baseline + index * lineHeight));
  ctx.restore();

  const pixels = ctx.getImageData(0, 0, image.width, image.height).data;
  const particles: Particle[] = [];
  const step = Math.max(1, Math.round(dpr));
  let minX = width,
    maxX = 0;
  for (let y = 0; y < image.height; y += step)
    for (let x = 0; x < image.width; x += step) {
      const index = (y * image.width + x) * 4;
      if (pixels[index + 3] < 32) continue;
      const px = x / dpr;
      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      // Stable variation keeps the plume organic without changing on every render.
      const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
      const noise = seed - Math.floor(seed);
      particles.push({
        x: px,
        y: y / dpr,
        alpha: pixels[index + 3] / 255,
        color: `rgb(${pixels[index]} ${pixels[index + 1]} ${pixels[index + 2]})`,
        driftX: 12 + noise * 28,
        driftY: -8 - noise * 28,
      });
    }
  const stride = Math.max(1, Math.ceil(particles.length / 3000));
  return {
    image,
    width,
    height,
    dpr,
    minX,
    maxX,
    particles: particles.filter((_, index) => index % stride === 0),
    offsetX: left - targetBox.left,
    offsetY: top - targetBox.top,
  };
}

export function VapourExit({
  target,
  active,
  reducedMotion,
  allSizes = false,
  onComplete,
}: VapourExitProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!active) return;
    const element = target.current,
      canvas = canvasRef.current;
    if (reducedMotion || !element || !canvas) {
      onComplete();
      return;
    }
    const picture = snapshot(element);
    const ctx = canvas.getContext("2d");
    if (!picture || !ctx || !picture.particles.length) {
      onComplete();
      return;
    }
    canvas.width = picture.image.width;
    canvas.height = picture.image.height;
    canvas.style.width = `${picture.width}px`;
    canvas.style.height = `${picture.height}px`;
    canvas.dataset.particles = String(picture.particles.length);
    ctx.scale(picture.dpr, picture.dpr);
    let frame = 0,
      elapsed = 0,
      previousTime = 0,
      disposed = false;
    const desktop = matchMedia("(min-width: 1280px) and (hover: hover) and (pointer: fine)");
    const isVisible = () => {
      const bounds = element.getBoundingClientRect();
      const copy = element.querySelector(":scope > span")?.getBoundingClientRect();
      if (allSizes && copy && (copy.top < 16 || copy.bottom > innerHeight - 72)) return false;
      return (
        !document.hidden &&
        (allSizes || desktop.matches) &&
        bounds.width > 0 &&
        bounds.bottom > 0 &&
        bounds.top < innerHeight
      );
    };
    const paint = (progress: number) => {
      const bounds = element.getBoundingClientRect();
      canvas.style.transform = `translate(${bounds.left + picture.offsetX}px, ${bounds.top + picture.offsetY}px)`;
      ctx.clearRect(0, 0, picture.width, picture.height);
      const wave = picture.minX + (picture.maxX - picture.minX) * Math.min(1, progress / 0.65);
      ctx.save();
      ctx.beginPath();
      ctx.rect(wave, 0, picture.width - wave, picture.height);
      ctx.clip();
      ctx.drawImage(picture.image, 0, 0, picture.width, picture.height);
      ctx.restore();
      for (const particle of picture.particles) {
        const release =
          ((particle.x - picture.minX) / Math.max(1, picture.maxX - picture.minX)) * 0.65;
        if (progress <= release) continue;
        const age = Math.min(1, (progress - release) / (1 - release));
        ctx.globalAlpha = particle.alpha * (1 - age) ** 1.5;
        ctx.fillStyle = particle.color;
        ctx.fillRect(
          particle.x + particle.driftX * age,
          particle.y + particle.driftY * age + Math.sin(age * 6) * 2,
          1,
          1
        );
      }
      ctx.globalAlpha = 1;
    };
    const tick = (time: number) => {
      frame = 0;
      if (disposed) return;
      if (!isVisible()) {
        canvas.style.visibility = "hidden";
        previousTime = 0;
        return;
      }
      canvas.style.visibility = "visible";
      elapsed += previousTime ? Math.min(time - previousTime, 50) : 0;
      previousTime = time;
      const progress = Math.min(1, elapsed / 1800);
      paint(progress);
      if (progress === 1) onComplete();
      else frame = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (disposed) return;
      if (!isVisible()) {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
        canvas.style.visibility = "hidden";
      } else if (!frame) {
        previousTime = 0;
        frame = requestAnimationFrame(tick);
      }
    };
    paint(0);
    element.dataset.vaporizing = "true";
    const observer = new IntersectionObserver(wake, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
      rootMargin: allSizes ? "-16px 0px -72px 0px" : "0px",
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("resize", wake);
    desktop.addEventListener("change", wake);
    wake();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("resize", wake);
      desktop.removeEventListener("change", wake);
      delete element.dataset.vaporizing;
    };
  }, [active, reducedMotion, target, onComplete, allSizes]);

  if (!active || reducedMotion || typeof document === "undefined") return null;
  return createPortal(
    <span
      aria-hidden="true"
      data-annotation-vapour
      style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 35 }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
      />
    </span>,
    document.body
  );
}
