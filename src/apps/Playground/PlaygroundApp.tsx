import React, { useState, useEffect, useMemo } from 'react'
import type { AppInstanceProps } from '@/core/appRegistry/types'
import { Play, RotateCcw, Code2, Monitor, Sparkles, Terminal } from 'lucide-react'
import { soundService } from '@/core/audio/soundService'

const TEMPLATES = {
  counter: {
    html: `<div class="card">
  <h1>NOVA Playground</h1>
  <p>Real-time client sandbox</p>
  <div class="display" id="count">0</div>
  <div class="buttons">
    <button id="dec">-</button>
    <button id="inc">+</button>
  </div>
</div>`,
    css: `body {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #09090b;
  font-family: system-ui, sans-serif;
  color: #fff;
}
.card {
  background: #18181b;
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid #27272a;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}
h1 { margin: 0; font-size: 1.5rem; color: #60a5fa; }
p { color: #a1a1aa; font-size: 0.85rem; margin-bottom: 1.5rem; }
.display { font-size: 3.5rem; font-weight: bold; margin: 1rem 0; font-family: monospace; }
.buttons button {
  background: #2563eb;
  color: white;
  border: none;
  font-size: 1.25rem;
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  margin: 0 0.5rem;
  cursor: pointer;
  transition: transform 0.1s;
}
.buttons button:active { transform: scale(0.95); }`,
    js: `let count = 0;
const countEl = document.getElementById('count');
document.getElementById('inc').onclick = () => {
  count++;
  countEl.innerText = count;
};
document.getElementById('dec').onclick = () => {
  count--;
  countEl.innerText = count;
};`
  },
  particles: {
    html: `<canvas id="canvas"></canvas>`,
    css: `body, html { margin: 0; overflow: hidden; background: #000; }
canvas { display: block; width: 100vw; height: 100vh; }`,
    js: `const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = Array.from({ length: 60 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  vx: (Math.random() - 0.5) * 2,
  vy: (Math.random() - 0.5) * 2,
  size: Math.random() * 3 + 1,
  color: 'hsl(' + Math.floor(Math.random() * 360) + ', 80%, 60%)'
}));

function animate() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
  });

  requestAnimationFrame(animate);
}
animate();`
  }
}

export const PlaygroundApp: React.FC<AppInstanceProps> = () => {
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js'>('html')
  const [htmlCode, setHtmlCode] = useState(TEMPLATES.counter.html)
  const [cssCode, setCssCode] = useState(TEMPLATES.counter.css)
  const [jsCode, setJsCode] = useState(TEMPLATES.counter.js)
  const [key, setKey] = useState(0)

  const loadTemplate = (name: 'counter' | 'particles') => {
    soundService.playClick()
    setHtmlCode(TEMPLATES[name].html)
    setCssCode(TEMPLATES[name].css)
    setJsCode(TEMPLATES[name].js)
    setKey(k => k + 1)
  }

  const combinedSrcDoc = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>${cssCode}</style>
</head>
<body>
  ${htmlCode}
  <script>
    try {
      ${jsCode}
    } catch(err) {
      console.error(err);
    }
  </script>
</body>
</html>`
  }, [htmlCode, cssCode, jsCode, key])

  return (
    <div className="flex flex-col h-full bg-neutral-900 text-neutral-100 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between p-2.5 bg-neutral-800/90 border-b border-white/10 text-xs">
        <div className="flex items-center space-x-2">
          <Code2 className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-white">Code Playground</span>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-neutral-950 rounded-lg p-0.5 border border-white/10 font-mono">
          {(['html', 'css', 'js'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                soundService.playClick()
                setActiveTab(tab)
              }}
              className={`px-3 py-1 rounded text-xs uppercase font-bold transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Templates & Run */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => loadTemplate('particles')}
            className="flex items-center space-x-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 rounded text-neutral-300 text-xs"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Particles Demo</span>
          </button>
          <button
            onClick={() => {
              soundService.playClick()
              setKey(k => k + 1)
            }}
            className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white font-medium text-xs shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Run</span>
          </button>
        </div>
      </div>

      {/* Split Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor Pane */}
        <div className="flex-1 h-1/2 md:h-full bg-neutral-950 p-3 flex flex-col border-b md:border-b-0 md:border-r border-white/10">
          <div className="text-[10px] text-neutral-500 font-mono mb-1 uppercase tracking-wider flex justify-between">
            <span>Editor: {activeTab.toUpperCase()}</span>
            <span>UTF-8</span>
          </div>
          <textarea
            value={activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode}
            onChange={(e) => {
              const val = e.target.value
              if (activeTab === 'html') setHtmlCode(val)
              else if (activeTab === 'css') setCssCode(val)
              else setJsCode(val)
            }}
            spellCheck={false}
            className="flex-1 w-full bg-transparent text-neutral-200 text-xs font-mono leading-relaxed resize-none focus:outline-none"
          />
        </div>

        {/* Live Preview Pane */}
        <div className="flex-1 h-1/2 md:h-full bg-neutral-900 flex flex-col">
          <div className="bg-neutral-800/60 px-3 py-1.5 border-b border-white/5 text-[10px] text-neutral-400 flex items-center space-x-1.5">
            <Monitor className="w-3.5 h-3.5 text-blue-400" />
            <span>Sandboxed IFrame Output</span>
          </div>
          <iframe
            key={key}
            title="Preview"
            sandbox="allow-scripts allow-modals"
            srcDoc={combinedSrcDoc}
            className="flex-1 w-full h-full border-none bg-black"
          />
        </div>
      </div>
    </div>
  )
}
