// FileSplice N‑Up Printing Calculator
// Backlink: https://filesplice.com/
// Please keep this attribution when reusing the code.

const $ = (id)=>document.getElementById(id);
const inputs = ['pageW','pageH','itemW','itemH','pad'].map($);
const canvas = $('preview');
const ctx = canvas.getContext('2d');
const layoutLabel = $('layoutLabel');
const kpiN = $('kpiN');
const padOut = $('padOut');

function clamp(v,min,max){return Math.max(min,Math.min(max,v));}

function compute(){
  const pageW = Math.max(0.1, parseFloat($('pageW').value)||0);
  const pageH = Math.max(0.1, parseFloat($('pageH').value)||0);
  const itemW = Math.max(0.1, parseFloat($('itemW').value)||0);
  const itemH = Math.max(0.1, parseFloat($('itemH').value)||0);
  const pad   = clamp(parseFloat($('pad').value)||0, 0, 0.5);
  padOut.textContent = pad.toFixed(3).replace(/0+$/,'').replace(/\.$/,'');

  // Fit with internal padding around each item
  const cellW = itemW + pad*2;
  const cellH = itemH + pad*2;
  const cols = Math.max(0, Math.floor(pageW / cellW));
  const rows = Math.max(0, Math.floor(pageH / cellH));
  const N = cols * rows;

  // label text
  layoutLabel.textContent = cols && rows ? `Layout: ${cols} × ${rows}` : 'Layout: —';
  kpiN.textContent = `N = ${N || '—'}`;

  draw(pageW,pageH,itemW,itemH,pad,cols,rows);
}

function draw(pageW,pageH,itemW,itemH,pad,cols,rows){
  // Clear
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Map inches to pixels: scale page to fit canvas
  const margin = 20;
  const scaleX = (canvas.width - margin*2) / pageW;
  const scaleY = (canvas.height - margin*2) / pageH;
  const scale = Math.min(scaleX, scaleY);
  const pagePxW = pageW * scale;
  const pagePxH = pageH * scale;
  const originX = (canvas.width - pagePxW)/2;
  const originY = (canvas.height - pagePxH)/2;

  // Page
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  roundRect(ctx, originX, originY, pagePxW, pagePxH, 8, true, true);

  if(cols===0 || rows===0) return;

  const cellPxW = (itemW + pad*2) * scale;
  const cellPxH = (itemH + pad*2) * scale;
  const gridW = cols * cellPxW;
  const gridH = rows * cellPxH;
  const gridX = originX + (pagePxW - gridW)/2;
  const gridY = originY + (pagePxH - gridH)/2;

  // Draw cells and items
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      const x = gridX + c*cellPxW;
      const y = gridY + r*cellPxH;

      // Cell (padding area)
      ctx.fillStyle = '#f3f6fb';
      ctx.strokeStyle = '#d8e4f5';
      ctx.lineWidth = 1;
      roundRect(ctx, x, y, cellPxW, cellPxH, 6, true, true);

      // Item
      const ix = x + pad*scale;
      const iy = y + pad*scale;
      const iw = itemW*scale;
      const ih = itemH*scale;

      // Item body
      ctx.fillStyle = '#cfe5fb';
      ctx.strokeStyle = '#3185cc';
      ctx.lineWidth = 1.5;
      roundRect(ctx, ix, iy, iw, ih, 4, true, true);

      // Faux text lines to suggest content
      const lines = 3;
      const lh = ih/(lines+2);
      ctx.fillStyle = '#9ec6ef';
      for(let i=1;i<=lines;i++){
        const tx = ix + iw*0.08;
        const tw = iw*0.84;
        const ty = iy + lh*i;
        ctx.fillRect(tx, ty, tw, Math.max(1, ih*0.04));
      }
    }
  }
}

function roundRect(ctx, x, y, w, h, r, fill, stroke) {
  if (typeof r === 'number') {
    r = {tl:r, tr:r, br:r, bl:r};
  }
  ctx.beginPath();
  ctx.moveTo(x + r.tl, y);
  ctx.lineTo(x + w - r.tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
  ctx.lineTo(x + w, y + h - r.br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
  ctx.lineTo(x + r.bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
  ctx.lineTo(x, y + r.tl);
  ctx.quadraticCurveTo(x, y, x + r.tl, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

// Events
inputs.forEach(el=> el.addEventListener('input', compute));

// Initial draw
compute();
