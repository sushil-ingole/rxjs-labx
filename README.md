# RxJS Labx

<p align="center">
  <strong>Master RxJS by seeing it run.</strong><br>
  An interactive playground for exploring RxJS operators with live timelines, adjustable inputs, and side-by-side comparisons.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/RxJS-Interactive%20Playground-purple?style=for-the-badge&logo=reactivex" />
  <img src="https://img.shields.io/badge/Built%20With-Angular-red?style=for-the-badge&logo=angular" />
  <img src="https://img.shields.io/badge/Open%20Source-100%25-green?style=for-the-badge" />
</p>

---

## What is RxJS Labx?

**RxJS Labx** is an open-source learning tool where you don't just read about RxJS operators — you watch them run in real time.

Pick any operator. Tweak the inputs. Hit run. See every emitted value timestamped on a live timeline. Build genuine intuition instead of memorizing syntax.

---

## Features

- **115+ operators** across 9 categories — each with its own interactive playground
- **23 comparison guides** — run similar operators (e.g. `switchMap` vs `mergeMap`) side by side with the same input
- **20+ deprecated operators** — fully functional playgrounds with clear migration guidance
- **Adjustable parameters** — modify source values, intervals, and operator arguments on the fly
- **Live output timelines** — see values, completions, and errors as they happen
- **Resizable panels** — drag to resize description, syntax, and playground sections
- **Composite mode** — compare multiple operators processing the same input simultaneously

---

## Why this exists

RxJS is powerful but hard to learn. Docs describe behavior in words. Marble diagrams are static. Stack Overflow answers assume you already understand timing.

None of them let you **experiment**.

RxJS Labx fixes that by letting you see operators run with real streams, real timing, and real values.

---

## Tech Stack

- **Angular** (standalone components, OnPush change detection)
- **RxJS**
- **SCSS** with centralized theming

---

## Getting Started

```bash
git clone https://github.com/sushil-ingole/rxjs-labx.git
cd rxjs-labx
npm install
ng serve
```

Open `http://localhost:4200` in your browser.

---

## Live Demo

**[rxjs-labx.vercel.app](https://rxjs-labx.vercel.app/)**

---

## Contributing

Ideas, improvements, or feedback are always welcome. Feel free to open an issue or submit a PR.

---

## Support

If this helps you understand RxJS better, consider giving it a star on GitHub.

---
