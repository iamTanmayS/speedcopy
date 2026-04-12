export const fabricEditorHtml = (cW: number, cH: number) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0,user-scalable=no"/>
<title>Editor</title>
<script src="https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
html,body{width:100%;height:100%;background:#1a1f2e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow:hidden;}
#canvas-area{position:fixed;top:0;left:0;right:0;bottom:175px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#1a1f2e;}
#canvas-wrap{transform-origin:center center;}
canvas{display:block;}
#toolbar{position:fixed;bottom:0;left:0;right:0;background:#0f172a;border-top:1px solid #1e293b;display:flex;flex-direction:column;border-top-left-radius:18px;border-top-right-radius:18px;}
#status-bar{background:#1e293b;color:#94a3b8;font-size:11px;padding:6px 16px;text-align:center;border-radius:20px;margin:10px auto 0;display:inline-block;max-width:90%;}
.status-wrap{width:100%;display:flex;justify-content:center;}
#tab-row{display:flex;border-bottom:1px solid #1e293b;padding:0 4px;}
.tab-btn{flex:1;padding:10px 2px;color:#64748b;font-size:10px;font-weight:600;text-align:center;cursor:pointer;border:none;background:none;display:flex;flex-direction:column;align-items:center;gap:3px;transition:color 0.2s;-webkit-tap-highlight-color:transparent;}
.tab-btn.active{color:#38bdf8;}
.tab-btn svg{width:20px;height:20px;}
.panel{display:none;}
.panel.active-panel{display:flex;}
.panel-row{padding:10px 14px;min-height:78px;display:flex;align-items:center;gap:10px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch;}
.panel-row::-webkit-scrollbar{display:none;}
.tool-btn{display:flex;flex-direction:column;align-items:center;gap:5px;background:#1e293b;border:1.5px solid #334155;border-radius:12px;padding:9px 11px;cursor:pointer;color:#cbd5e1;font-size:10px;font-weight:600;white-space:nowrap;min-width:60px;flex-shrink:0;-webkit-tap-highlight-color:transparent;}
.tool-btn svg{width:20px;height:20px;}
.tmpl-btn{background:#1e293b;border:1.5px solid #334155;border-radius:12px;padding:12px 16px;cursor:pointer;color:#e2e8f0;font-size:11px;font-weight:700;text-align:center;min-width:90px;flex-shrink:0;-webkit-tap-highlight-color:transparent;line-height:1.4;}
.sw{width:34px;height:34px;border-radius:9px;border:2px solid #475569;cursor:pointer;flex-shrink:0;}
.sw.sel{border-color:#38bdf8;border-width:3px;}
.sw-rainbow{background:conic-gradient(red,yellow,lime,aqua,blue,magenta,red);display:flex;align-items:center;justify-content:center;}
.sz-btn{background:#1e293b;border:1.5px solid #334155;border-radius:8px;color:#cbd5e1;font-size:16px;padding:6px 14px;cursor:pointer;flex-shrink:0;-webkit-tap-highlight-color:transparent;}
.sz-disp{background:#0a0f1c;border:1.5px solid #334155;border-radius:8px;color:#f1f5f9;font-size:15px;font-weight:700;padding:5px 14px;min-width:48px;text-align:center;flex-shrink:0;}
.div{width:1px;height:36px;background:#1e293b;flex-shrink:0;margin:0 2px;}
.lbl{color:#64748b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;flex-shrink:0;}
#colorInput{position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;}
</style>
</head>
<body>
<div id="canvas-area"><div id="canvas-wrap"><canvas id="c"></canvas></div></div>
<input type="color" id="colorInput"/>

<div id="toolbar">
  <div class="status-wrap"><div id="status-bar">Tap Add to start designing</div></div>
  <div id="tab-row">
    <button class="tab-btn" onclick="window.SP('tmpl')" id="tb-tmpl">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1" stroke-width="2"/><rect x="13" y="3" width="8" height="8" rx="1" stroke-width="2"/><rect x="3" y="13" width="8" height="8" rx="1" stroke-width="2"/><rect x="13" y="13" width="8" height="8" rx="1" stroke-width="2"/></svg>
      Templates
    </button>
    <button class="tab-btn active" onclick="window.SP('add')" id="tb-add">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
      Add
    </button>
    <button class="tab-btn" onclick="window.SP('txt')" id="tb-txt">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"/></svg>
      Text
    </button>
    <button class="tab-btn" onclick="window.SP('clr')" id="tb-clr">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/></svg>
      Color
    </button>
    <button class="tab-btn" onclick="window.SP('arr')" id="tb-arr">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>
      Arrange
    </button>
    <button class="tab-btn" onclick="window.SP('his')" id="tb-his">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      History
    </button>
  </div>

  <!-- TEMPLATES -->
  <div id="panel-tmpl" class="panel">
    <div class="panel-row">
      <div class="tmpl-btn" onclick="window.LT('flyer')">🎉<br/>Sale Flyer</div>
      <div class="tmpl-btn" onclick="window.LT('card')">💼<br/>Business Card</div>
      <div class="tmpl-btn" onclick="window.LT('social')">📱<br/>Social Post</div>
      <div class="tmpl-btn" onclick="window.LT('cert')">🏆<br/>Certificate</div>
      <div class="tmpl-btn" onclick="window.LT('invite')">✉️<br/>Invitation</div>
      <div class="div"></div>
      <button class="tool-btn" style="color:#f87171;border-color:#3d1515;" onclick="window.CA()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        Clear
      </button>
    </div>
  </div>

  <!-- ADD -->
  <div id="panel-add" class="panel active-panel">
    <div class="panel-row">
      <button class="tool-btn" onclick="window.AT()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
        Text
      </button>
      <button class="tool-btn" style="background:#1a3a5c;border-color:#2563eb;" onclick="window.PI()">
        <svg fill="none" stroke="#38bdf8" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
        <span style="color:#38bdf8">Image</span>
      </button>
      <button class="tool-btn" onclick="window.AR()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" stroke-width="2"/></svg>
        Rect
      </button>
      <button class="tool-btn" onclick="window.AC()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" stroke-width="2"/></svg>
        Circle
      </button>
      <button class="tool-btn" onclick="window.ATR()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3L2 21h20L12 3z"/></svg>
        Triangle
      </button>
      <button class="tool-btn" onclick="window.AL()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12h18"/></svg>
        Line
      </button>
      <button class="tool-btn" onclick="window.AST()">
        <svg fill="#eab308" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        Star
      </button>
      <button class="tool-btn" onclick="window.AAR()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7-7l7 7-7 7"/></svg>
        Arrow
      </button>
      <div class="div"></div>
      <button class="tool-btn" onclick="window.SB()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z"/></svg>
        BG Color
      </button>
      <div class="div"></div>
      <button class="tool-btn" style="color:#f87171;border-color:#3d1515;" onclick="window.DS()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        Delete
      </button>
    </div>
  </div>

  <!-- TEXT -->
  <div id="panel-txt" class="panel">
    <div class="panel-row">
      <span class="lbl">Size</span>
      <button class="sz-btn" onclick="window.CFS(-4)">−</button>
      <div class="sz-disp" id="fs-disp">28</div>
      <button class="sz-btn" onclick="window.CFS(4)">+</button>
      <div class="div"></div>
      <button class="tool-btn" id="btn-bold" onclick="window.TB()">
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/></svg>
        Bold
      </button>
      <button class="tool-btn" id="btn-ital" onclick="window.TI()">
        <svg fill="currentColor" viewBox="0 0 24 24"><path d="M10 4h4l-4 16H6z"/></svg>
        Italic
      </button>
      <button class="tool-btn" id="btn-und" onclick="window.TU()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h10M9 16h6m-8 4h10"/></svg>
        Underline
      </button>
      <div class="div"></div>
      <button class="tool-btn" onclick="window.SA('left')">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8M4 18h11"/></svg>
        Left
      </button>
      <button class="tool-btn" onclick="window.SA('center')">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M8 12h8M6 18h12"/></svg>
        Center
      </button>
      <button class="tool-btn" onclick="window.SA('right')">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M10 12h10M8 18h11"/></svg>
        Right
      </button>
      <div class="div"></div>
      <button class="tool-btn" onclick="window.AT()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
        Add Text
      </button>
    </div>
  </div>

  <!-- COLOR -->
  <div id="panel-clr" class="panel">
    <div class="panel-row">
      <span class="lbl">Fill</span>
      ${['#000000','#ffffff','#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#8b5cf6','#ec4899','#0ea5e9','#14b8a6'].map(c =>
        `<div class="sw" style="background:${c}" onclick="window.AC2('${c}','fill',this)"></div>`
      ).join('')}
      <div class="sw sw-rainbow" onclick="window.OCP('fill')"><svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"/></svg></div>
      <div class="div"></div>
      <span class="lbl">Stroke</span>
      ${['transparent','#000000','#ffffff','#ef4444','#3b82f6','#22c55e'].map(c =>
        `<div class="sw" style="background:${c === 'transparent' ? 'repeating-conic-gradient(#555 0% 25%,#1e293b 0% 50%) 0 0/8px 8px' : c}" onclick="window.AC2('${c}','stroke',this)"></div>`
      ).join('')}
    </div>
  </div>

  <!-- ARRANGE -->
  <div id="panel-arr" class="panel">
    <div class="panel-row">
      <button class="tool-btn" onclick="window.BF()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
        Fwd
      </button>
      <button class="tool-btn" onclick="window.SBK()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
        Back
      </button>
      <button class="tool-btn" onclick="window.BTF()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"/></svg>
        To Front
      </button>
      <button class="tool-btn" onclick="window.STB()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
        To Back
      </button>
      <div class="div"></div>
      <button class="tool-btn" onclick="window.FH()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg>
        Flip H
      </button>
      <button class="tool-btn" onclick="window.FV()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 17H4m0 0l4 4m-4-4l4-4M8 7h12m0 0l-4-4m4 4l-4 4"/></svg>
        Flip V
      </button>
      <div class="div"></div>
      <button class="tool-btn" onclick="window.CH()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18M4 12h16"/></svg>
        Center H
      </button>
      <button class="tool-btn" onclick="window.CV()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v18M4 12h16"/></svg>
        Center V
      </button>
      <div class="div"></div>
      <button class="tool-btn" onclick="window.DUP()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
        Dupe
      </button>
    </div>
  </div>

  <!-- HISTORY -->
  <div id="panel-his" class="panel">
    <div class="panel-row">
      <button class="tool-btn" onclick="window.UD()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/></svg>
        Undo
      </button>
      <button class="tool-btn" onclick="window.RD()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"/></svg>
        Redo
      </button>
      <div class="div"></div>
      <button class="tool-btn" onclick="window.SEL()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        Select All
      </button>
      <div class="div"></div>
      <button class="tool-btn" style="color:#f87171;border-color:#3d1515;" onclick="window.CA()">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
        Clear All
      </button>
    </div>
  </div>
</div>

<script>
(function() {
  // ===== INIT =====
  var W = ${cW}, H = ${cH};
  var fillColor = '#3b82f6', strokeColor = 'transparent', cpTarget = 'fill';
  var hist = [], redos = [], histLock = false;

  var cvs = new fabric.Canvas('c', {
    width: W, height: H, backgroundColor: '#ffffff',
    selection: true, preserveObjectStacking: true,
  });
  cvs.allowTouchScrolling = false;

  // ===== FIT CANVAS TO SCREEN (scale, never crop) =====
  function fitCanvas() {
    var area = document.getElementById('canvas-area');
    var wrap = document.getElementById('canvas-wrap');
    if (!area || !wrap) return;
    var availW = area.offsetWidth - 24;
    var availH = area.offsetHeight - 24;
    var scaleX = availW / W;
    var scaleY = availH / H;
    var sc = Math.min(scaleX, scaleY, 1); // never upscale
    wrap.style.transform = 'scale(' + sc + ')';
    wrap.style.boxShadow = '0 ' + Math.round(20*sc) + 'px ' + Math.round(60*sc) + 'px rgba(0,0,0,0.5)';
  }
  fitCanvas();
  window.addEventListener('resize', fitCanvas);

  // ===== HISTORY =====
  function SH() {
    if (histLock) return;
    redos = [];
    hist.push(JSON.stringify(cvs));
    if (hist.length > 50) hist.shift();
  }
  SH();
  cvs.on('object:modified', SH);
  cvs.on('object:added', SH);
  cvs.on('object:removed', SH);

  // ===== STATUS =====
  cvs.on('selection:created', US);
  cvs.on('selection:updated', US);
  cvs.on('selection:cleared', function() {
    document.getElementById('status-bar').textContent = 'Tap an object or use Add tab';
  });
  function US() {
    var o = cvs.getActiveObject();
    if (!o) return;
    var tp = o.type === 'i-text' ? 'Text' : o.type;
    document.getElementById('status-bar').textContent = tp + ' selected — use tabs to edit';
    if (o.type === 'i-text') document.getElementById('fs-disp').textContent = o.fontSize || 28;
  }

  // ===== TABS =====
  window.SP = function(name) {
    document.querySelectorAll('.panel').forEach(function(p){ p.classList.remove('active-panel'); });
    document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
    var panel = document.getElementById('panel-' + name);
    var tab = document.getElementById('tb-' + name);
    if (panel) panel.classList.add('active-panel');
    if (tab) tab.classList.add('active');
  };

  // ===== ADD ELEMENTS =====
  window.AT = function() {
    var t = new fabric.IText('Tap to edit', {
      left: W/2, top: H/2, fontSize: 32, fill: '#1e293b',
      fontFamily: 'Arial', fontWeight: 'bold', originX: 'center', originY: 'center',
    });
    cvs.add(t); cvs.setActiveObject(t); cvs.renderAll();
  };
  window.AR = function() {
    cvs.add(new fabric.Rect({
      left: W/2, top: H/2, width: 120, height: 120, fill: fillColor,
      stroke: strokeColor === 'transparent' ? '' : strokeColor,
      strokeWidth: strokeColor === 'transparent' ? 0 : 3, rx: 8, ry: 8,
      originX: 'center', originY: 'center',
    })); cvs.renderAll();
  };
  window.AC = function() {
    cvs.add(new fabric.Circle({
      left: W/2, top: H/2, radius: 60, fill: fillColor,
      stroke: strokeColor === 'transparent' ? '' : strokeColor,
      strokeWidth: strokeColor === 'transparent' ? 0 : 3,
      originX: 'center', originY: 'center',
    })); cvs.renderAll();
  };
  window.ATR = function() {
    cvs.add(new fabric.Triangle({
      left: W/2, top: H/2, width: 120, height: 120, fill: fillColor,
      stroke: strokeColor === 'transparent' ? '' : strokeColor,
      strokeWidth: strokeColor === 'transparent' ? 0 : 3,
      originX: 'center', originY: 'center',
    })); cvs.renderAll();
  };
  window.AL = function() {
    cvs.add(new fabric.Line([40, 0, W - 40, 0], {
      left: W/2, top: H/2, stroke: '#1e293b', strokeWidth: 4, originX: 'center', originY: 'center',
    })); cvs.renderAll();
  };
  window.AST = function() {
    cvs.add(new fabric.Polygon([
      {x:50,y:0},{x:61,y:35},{x:98,y:35},{x:68,y:57},{x:79,y:91},
      {x:50,y:70},{x:21,y:91},{x:32,y:57},{x:2,y:35},{x:39,y:35}
    ], { left: W/2, top: H/2, fill: '#eab308', originX: 'center', originY: 'center', scaleX: 1.4, scaleY: 1.4 }));
    cvs.renderAll();
  };
  window.AAR = function() {
    cvs.add(new fabric.Path('M 0 0 L 120 0 M 95 -18 L 120 0 L 95 18', {
      left: W/2, top: H/2, stroke: '#1e293b', strokeWidth: 4, fill: '',
      originX: 'center', originY: 'center',
    })); cvs.renderAll();
  };

  // ===== IMAGE =====
  window.PI = function() {
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'PICK_IMAGE' }));
  };
  window.insertImage = function(dataUrl) {
    fabric.Image.fromURL(dataUrl, function(img) {
      if (!img) return;
      var sc = Math.min(W * 0.7 / img.width, H * 0.7 / img.height);
      img.set({ left: W/2, top: H/2, scaleX: sc, scaleY: sc, originX: 'center', originY: 'center' });
      cvs.add(img); cvs.setActiveObject(img); cvs.renderAll();
    });
  };

  // ===== BG =====
  window.SB = function() { cpTarget = 'bg'; document.getElementById('colorInput').click(); };

  // ===== TEXT =====
  window.CFS = function(d) {
    var o = cvs.getActiveObject();
    if (o && o.type === 'i-text') {
      var s = Math.max(8, (o.fontSize || 28) + d);
      o.set('fontSize', s); document.getElementById('fs-disp').textContent = s; cvs.renderAll();
    }
  };
  window.TB = function() {
    var o = cvs.getActiveObject();
    if (o && o.type === 'i-text') {
      o.set('fontWeight', o.fontWeight === 'bold' ? 'normal' : 'bold');
      document.getElementById('btn-bold').style.borderColor = o.fontWeight === 'bold' ? '#38bdf8' : '#334155';
      cvs.renderAll();
    }
  };
  window.TI = function() {
    var o = cvs.getActiveObject();
    if (o && o.type === 'i-text') {
      o.set('fontStyle', o.fontStyle === 'italic' ? 'normal' : 'italic');
      document.getElementById('btn-ital').style.borderColor = o.fontStyle === 'italic' ? '#38bdf8' : '#334155';
      cvs.renderAll();
    }
  };
  window.TU = function() {
    var o = cvs.getActiveObject();
    if (o && o.type === 'i-text') {
      o.set('underline', !o.underline);
      document.getElementById('btn-und').style.borderColor = o.underline ? '#38bdf8' : '#334155';
      cvs.renderAll();
    }
  };
  window.SA = function(a) {
    var o = cvs.getActiveObject();
    if (o && o.type === 'i-text') { o.set('textAlign', a); cvs.renderAll(); }
  };

  // ===== COLOR =====
  window.AC2 = function(color, target, el) {
    document.querySelectorAll('.sw.sel').forEach(function(e){ e.classList.remove('sel'); });
    if (el) el.classList.add('sel');
    var o = cvs.getActiveObject();
    if (target === 'fill') {
      fillColor = color;
      if (o) o.set('fill', color);
    } else {
      strokeColor = color;
      if (o && o.type !== 'i-text') {
        o.set('stroke', color === 'transparent' ? '' : color);
        o.set('strokeWidth', color === 'transparent' ? 0 : 3);
      }
    }
    if (o) cvs.renderAll();
  };
  window.OCP = function(t) { cpTarget = t; document.getElementById('colorInput').click(); };
  document.getElementById('colorInput').addEventListener('input', function(e) {
    var c = e.target.value;
    if (cpTarget === 'bg') { cvs.setBackgroundColor(c, cvs.renderAll.bind(cvs)); }
    else { window.AC2(c, cpTarget); }
  });

  // ===== ARRANGE =====
  window.BF = function() { var o=cvs.getActiveObject(); if(o){cvs.bringForward(o);cvs.renderAll();} };
  window.SBK = function() { var o=cvs.getActiveObject(); if(o){cvs.sendBackwards(o);cvs.renderAll();} };
  window.BTF = function() { var o=cvs.getActiveObject(); if(o){cvs.bringToFront(o);cvs.renderAll();} };
  window.STB = function() { var o=cvs.getActiveObject(); if(o){cvs.sendToBack(o);cvs.renderAll();} };
  window.FH = function() { var o=cvs.getActiveObject(); if(o){o.toggle('flipX');cvs.renderAll();} };
  window.FV = function() { var o=cvs.getActiveObject(); if(o){o.toggle('flipY');cvs.renderAll();} };
  window.CH = function() { var o=cvs.getActiveObject(); if(o){o.centerH();cvs.renderAll();} };
  window.CV = function() { var o=cvs.getActiveObject(); if(o){o.centerV();cvs.renderAll();} };
  window.DUP = function() {
    var o = cvs.getActiveObject();
    if (!o) return;
    o.clone(function(cl){ cl.set({left:o.left+25,top:o.top+25}); cvs.add(cl); cvs.setActiveObject(cl); cvs.renderAll(); });
  };
  window.DS = function() {
    var os = cvs.getActiveObjects();
    if (os.length) { os.forEach(function(o){cvs.remove(o);}); cvs.discardActiveObject(); cvs.renderAll(); }
  };
  window.SEL = function() { cvs.setActiveObject(new fabric.ActiveSelection(cvs.getObjects(),{canvas:cvs})); cvs.renderAll(); };
  window.CA = function() { cvs.clear(); cvs.setBackgroundColor('#ffffff', cvs.renderAll.bind(cvs)); SH(); };

  // ===== HISTORY =====
  window.UD = function() {
    if (hist.length <= 1) return;
    redos.push(hist.pop());
    histLock = true;
    cvs.loadFromJSON(hist[hist.length-1], function(){ cvs.renderAll(); histLock = false; });
  };
  window.RD = function() {
    if (!redos.length) return;
    var s = redos.pop(); hist.push(s);
    histLock = true;
    cvs.loadFromJSON(s, function(){ cvs.renderAll(); histLock = false; });
  };

  // ===== EXPORT (called by RN) =====
  window.exportImage = function() {
    cvs.discardActiveObject(); cvs.renderAll();
    setTimeout(function() {
      var d = cvs.toDataURL({ format: 'png', multiplier: 2 });
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EXPORT_IMAGE', data: d }));
    }, 150);
  };
  window.setSize = function(w, h) { W=w; H=h; cvs.setWidth(w); cvs.setHeight(h); cvs.renderAll(); fitCanvas(); };

  // ===== TEMPLATES =====
  window.LT = function(type) {
    cvs.clear();
    if (type === 'flyer') {
      cvs.setBackgroundColor('#1e293b', cvs.renderAll.bind(cvs));
      cvs.add(
        new fabric.Rect({left:W/2,top:80,width:W-40,height:100,fill:'#f59e0b',rx:0,originX:'center',originY:'center'}),
        new fabric.IText('BIG SALE!', {left:W/2,top:80,fontSize:56,fill:'#1e293b',fontWeight:'bold',originX:'center',originY:'center'}),
        new fabric.IText('50% OFF EVERYTHING', {left:W/2,top:220,fontSize:26,fill:'#ffffff',originX:'center',originY:'center'}),
        new fabric.Rect({left:W/2,top:320,width:220,height:68,fill:'#ef4444',rx:12,originX:'center',originY:'center'}),
        new fabric.IText('SHOP NOW', {left:W/2,top:320,fontSize:22,fill:'#ffffff',fontWeight:'bold',originX:'center',originY:'center'})
      );
    } else if (type === 'card') {
      cvs.setBackgroundColor('#f8fafc', cvs.renderAll.bind(cvs));
      cvs.add(
        new fabric.Rect({left:0,top:0,width:W,height:H/3,fill:'#0f172a'}),
        new fabric.IText('JOHN DOE', {left:40,top:H/3+40,fontSize:40,fill:'#0f172a',fontWeight:'bold'}),
        new fabric.Line([40,H/3+100,W-40,H/3+100],{stroke:'#3b82f6',strokeWidth:3}),
        new fabric.IText('Creative Director', {left:40,top:H/3+118,fontSize:20,fill:'#64748b'}),
        new fabric.IText('john@example.com', {left:40,top:H/3+180,fontSize:18,fill:'#334155'}),
        new fabric.IText('+1 555 123 4567', {left:40,top:H/3+215,fontSize:18,fill:'#334155'})
      );
    } else if (type === 'social') {
      cvs.setBackgroundColor('#7c3aed', cvs.renderAll.bind(cvs));
      cvs.add(
        new fabric.Circle({left:W/2,top:H/2,radius:Math.min(W,H)*0.38,fill:'rgba(255,255,255,0.15)',originX:'center',originY:'center'}),
        new fabric.IText('NEW', {left:W/2,top:H/2-50,fontSize:60,fill:'#ffffff',fontWeight:'bold',textAlign:'center',originX:'center',originY:'center'}),
        new fabric.IText('ARRIVAL', {left:W/2,top:H/2+40,fontSize:32,fill:'#fbbf24',fontWeight:'bold',textAlign:'center',originX:'center',originY:'center'})
      );
    } else if (type === 'cert') {
      cvs.setBackgroundColor('#fffbeb', cvs.renderAll.bind(cvs));
      cvs.add(
        new fabric.Rect({left:W/2,top:H/2,width:W-60,height:H-60,fill:'transparent',stroke:'#d97706',strokeWidth:6,rx:4,originX:'center',originY:'center'}),
        new fabric.IText('CERTIFICATE', {left:W/2,top:90,fontSize:44,fill:'#92400e',fontWeight:'bold',originX:'center',originY:'center'}),
        new fabric.IText('of Achievement', {left:W/2,top:155,fontSize:22,fill:'#b45309',fontStyle:'italic',originX:'center',originY:'center'}),
        new fabric.Line([W*0.2,H/2-20,W*0.8,H/2-20],{stroke:'#d97706',strokeWidth:2}),
        new fabric.IText('Jane Smith', {left:W/2,top:H/2+30,fontSize:50,fill:'#1e293b',fontWeight:'bold',fontStyle:'italic',originX:'center',originY:'center'})
      );
    } else if (type === 'invite') {
      cvs.setBackgroundColor('#fdf2f8', cvs.renderAll.bind(cvs));
      cvs.add(
        new fabric.Rect({left:W/2,top:H/2,width:W-40,height:H-40,fill:'transparent',stroke:'#ec4899',strokeWidth:4,rx:16,originX:'center',originY:'center'}),
        new fabric.IText("You're Invited!", {left:W/2,top:100,fontSize:42,fill:'#be185d',fontWeight:'bold',fontStyle:'italic',originX:'center',originY:'center'}),
        new fabric.IText('Join us for a special event', {left:W/2,top:185,fontSize:20,fill:'#6b7280',originX:'center',originY:'center'}),
        new fabric.IText('Saturday, May 10th', {left:W/2,top:260,fontSize:28,fill:'#374151',fontWeight:'bold',originX:'center',originY:'center'}),
        new fabric.IText('7:00 PM • Grand Ballroom', {left:W/2,top:310,fontSize:20,fill:'#6b7280',originX:'center',originY:'center'})
      );
    }
    cvs.renderAll(); SH();
    window.SP('add');
    document.getElementById('status-bar').textContent = 'Template loaded! Tap to edit text.';
  };
})();
<\/script>
</body>
</html>`;
