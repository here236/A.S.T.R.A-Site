// ─── CURSOR ───
const cur=document.getElementById('cursor'),curR=document.getElementById('cursor-ring');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  cur.style.left=mx-3+'px';cur.style.top=my-3+'px';
});
function animCursor(){
  rx+=(mx-rx)*0.12;ry+=(my-ry)*0.12;
  curR.style.left=rx-16+'px';curR.style.top=ry-16+'px';
  requestAnimationFrame(animCursor);
}
animCursor();

// ─── FUNDO JARVIS ───
const bgC=document.getElementById('bg-canvas');
const bgX=bgC.getContext('2d');
let W,H,pts=[];

function resize(){
  W=bgC.width=window.innerWidth;
  H=bgC.height=window.innerHeight;
}
resize();
window.addEventListener('resize',resize);

for(let i=0;i<120;i++){
  pts.push({
    x:Math.random()*3000,y:Math.random()*3000,
    vx:(Math.random()-0.5)*0.3,vy:(Math.random()-0.5)*0.3,
    r:Math.random()*1.5+0.3,
    a:Math.random()
  });
}

// linhas de grade
const gridLines=[];
for(let i=0;i<8;i++) gridLines.push({x:i/7,horiz:false,phase:Math.random()*Math.PI*2});
for(let i=0;i<5;i++) gridLines.push({y:i/4,horiz:true,phase:Math.random()*Math.PI*2});

let t=0;
function drawBg(){
  bgX.clearRect(0,0,W,H);

  // radial glow
  const cx=W*0.7,cy=H*0.4;
  const g=bgX.createRadialGradient(cx,cy,0,cx,cy,W*0.7);
  g.addColorStop(0,'rgba(80,30,80,0.12)');
  g.addColorStop(0.5,'rgba(40,15,50,0.06)');
  g.addColorStop(1,'rgba(2,11,24,0)');
  bgX.fillStyle=g;bgX.fillRect(0,0,W,H);

  // grade hexagonal sutil
  bgX.strokeStyle='rgba(130,80,150,0.025)';
  bgX.lineWidth=0.5;
  const sz=60;
  for(let xi=-sz;xi<W+sz;xi+=sz){
    for(let yi=-sz;yi<H+sz;yi+=sz){
      bgX.beginPath();
      for(let k=0;k<6;k++){
        const a=k*Math.PI/3;
        k===0?bgX.moveTo(xi+sz*0.5*Math.cos(a),yi+sz*0.5*Math.sin(a)):bgX.lineTo(xi+sz*0.5*Math.cos(a),yi+sz*0.5*Math.sin(a));
      }
      bgX.closePath();bgX.stroke();
    }
  }

  // partículas
  t+=0.005;
  pts.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0)p.x=W;if(p.x>W)p.x=0;
    if(p.y<0)p.y=H;if(p.y>H)p.y=0;
    const alpha=0.2+0.3*Math.abs(Math.sin(t+p.a));
    bgX.beginPath();bgX.arc(p.x,p.y,p.r,0,Math.PI*2);
    bgX.fillStyle=`rgba(220,160,120,${alpha})`;
    bgX.fill();
  });

  // conexões
  bgX.lineWidth=0.4;
  for(let i=0;i<pts.length;i++){
    for(let j=i+1;j<pts.length;j++){
      const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<160){
        bgX.beginPath();
        bgX.moveTo(pts[i].x,pts[i].y);
        bgX.lineTo(pts[j].x,pts[j].y);
        bgX.strokeStyle=`rgba(155,107,181,${(1-d/160)*0.12})`;
        bgX.stroke();
      }
    }
  }

  // scan horizontal
  const scanY=(t*80)%H;
  const sg=bgX.createLinearGradient(0,scanY-30,0,scanY+30);
  sg.addColorStop(0,'rgba(220,160,120,0)');
  sg.addColorStop(0.5,'rgba(220,160,120,0.04)');
  sg.addColorStop(1,'rgba(220,160,120,0)');
  bgX.fillStyle=sg;bgX.fillRect(0,scanY-30,W,60);

  requestAnimationFrame(drawBg);
}
drawBg();

// ─── ESFERA 3D ───
const sphC=document.getElementById('sphere-canvas');
const sphX=sphC.getContext('2d');
const SW=sphC.width=460,SH=sphC.height=460;
const cx2=SW/2,cy2=SH/2,R=180;

let rotX=0.3,rotY=0,autoRot=true;
let dragStart=null,lastX=0,lastY=0;

// pontos esfera
const spherePts=[];
const N=800;
for(let i=0;i<N;i++){
  const phi=Math.acos(1-2*(i+0.5)/N);
  const theta=Math.PI*(1+Math.sqrt(5))*i;
  spherePts.push({
    ox:Math.sin(phi)*Math.cos(theta),
    oy:Math.cos(phi),
    oz:Math.sin(phi)*Math.sin(theta),
    hue:Math.random()<0.15
  });
}

// linhas da esfera (meridianos)
const sphereLines=[];
for(let lat=-80;lat<=80;lat+=20){
  const pts2=[];
  for(let lon=0;lon<=360;lon+=6){
    const phi=(90-lat)*Math.PI/180,theta=lon*Math.PI/180;
    pts2.push({x:Math.sin(phi)*Math.cos(theta),y:Math.cos(phi),z:Math.sin(phi)*Math.sin(theta)});
  }
  sphereLines.push({pts:pts2,lat});
}
for(let lon=0;lon<360;lon+=30){
  const pts2=[];
  for(let lat=90;lat>=-90;lat-=6){
    const phi=(90-lat)*Math.PI/180,theta=lon*Math.PI/180;
    pts2.push({x:Math.sin(phi)*Math.cos(theta),y:Math.cos(phi),z:Math.sin(phi)*Math.sin(theta)});
  }
  sphereLines.push({pts:pts2,lon});
}

function project(x,y,z){
  const cosX=Math.cos(rotX),sinX=Math.sin(rotX);
  const cosY=Math.cos(rotY),sinY=Math.sin(rotY);
  const y2=y*cosX-z*sinX,z2=y*sinX+z*cosX;
  const x3=x*cosY+z2*sinY,z3=-x*sinY+z2*cosY;
  return{px:cx2+x3*R,py:cy2+y2*R,pz:z3};
}

let sphT=0;
function drawSphere(){
  sphX.clearRect(0,0,SW,SH);
  sphT+=0.004;
  if(autoRot) rotY+=0.006;

  // halo externo roxo-rose
  const halo=sphX.createRadialGradient(cx2,cy2,R*0.5,cx2,cy2,R*1.5);
  halo.addColorStop(0,'rgba(160,80,200,0.18)');
  halo.addColorStop(0.4,'rgba(201,123,138,0.12)');
  halo.addColorStop(0.7,'rgba(155,80,190,0.06)');
  halo.addColorStop(1,'rgba(0,0,0,0)');
  sphX.fillStyle=halo;sphX.beginPath();sphX.arc(cx2,cy2,R*1.5,0,Math.PI*2);sphX.fill();

  // preenchimento da esfera com degradê roxo profundo
  const sphereFill=sphX.createRadialGradient(cx2-50,cy2-50,10,cx2,cy2,R);
  sphereFill.addColorStop(0,'rgba(200,140,230,0.25)');
  sphereFill.addColorStop(0.35,'rgba(140,70,200,0.18)');
  sphereFill.addColorStop(0.7,'rgba(90,30,150,0.14)');
  sphereFill.addColorStop(1,'rgba(50,10,90,0.08)');
  sphX.fillStyle=sphereFill;sphX.beginPath();sphX.arc(cx2,cy2,R,0,Math.PI*2);sphX.fill();

  // linhas da grade — cor varia por latitude: roxo no topo, rose no meio, dourado na base
  sphereLines.forEach((line,li)=>{
    sphX.beginPath();
    let first=true;
    line.pts.forEach(p=>{
      const {px,py,pz}=project(p.x,p.y,p.z);
      if(pz>-0.2){
        if(first){sphX.moveTo(px,py);first=false}
        else sphX.lineTo(px,py);
      } else{first=true}
    });
    const t2=(li/sphereLines.length);
    let lineColor;
    if(t2<0.33) lineColor=`rgba(180,100,230,0.18)`;
    else if(t2<0.66) lineColor=`rgba(210,130,160,0.15)`;
    else lineColor=`rgba(232,184,109,0.12)`;
    sphX.strokeStyle=lineColor;
    sphX.lineWidth=0.5;sphX.stroke();
  });

  // pontos — degradê roxo→rose→dourado baseado em posição Y
  spherePts.forEach((p,i)=>{
    const {px,py,pz}=project(p.ox,p.oy,p.oz);
    if(pz<0) return;
    const brightness=0.3+0.7*pz;
    // mapear Y normalizado (0=topo, 1=base) para cor
    const yNorm=(py-cy2+R)/(2*R);
    const pulse=p.hue?0.5+0.5*Math.sin(sphT*3+i*0.1):0;
    if(p.hue&&pulse>0.3){
      // ponto destaque: dourado com halo roxo
      sphX.beginPath();sphX.arc(px,py,3,0,Math.PI*2);
      sphX.fillStyle=`rgba(240,190,100,${brightness*pulse})`;sphX.fill();
      sphX.beginPath();sphX.arc(px,py,7,0,Math.PI*2);
      sphX.fillStyle=`rgba(180,80,220,${brightness*pulse*0.35})`;sphX.fill();
    } else{
      // pontos comuns: roxo no topo, rose no centro, dourado na base
      let r,g,b;
      if(yNorm<0.4){r=160;g=80;b=220}
      else if(yNorm<0.7){r=210;g=120;b=160}
      else{r=232;g=180;b=100}
      sphX.beginPath();sphX.arc(px,py,1.4,0,Math.PI*2);
      sphX.fillStyle=`rgba(${r},${g},${b},${brightness*0.6})`;sphX.fill();
    }
  });

  // camada de brilho lateral rose
  const cl=sphX.createRadialGradient(cx2-55,cy2-55,0,cx2,cy2,R);
  cl.addColorStop(0,'rgba(230,160,200,0.2)');
  cl.addColorStop(0.3,'rgba(180,80,220,0.08)');
  cl.addColorStop(0.7,'rgba(232,184,109,0.05)');
  cl.addColorStop(1,'rgba(0,0,0,0)');
  sphX.fillStyle=cl;sphX.beginPath();sphX.arc(cx2,cy2,R,0,Math.PI*2);sphX.fill();

  requestAnimationFrame(drawSphere);
}
drawSphere();

// drag na esfera
sphC.addEventListener('mousedown',e=>{autoRot=false;dragStart={x:e.clientX,y:e.clientY};lastX=rotY;lastY=rotX});
document.addEventListener('mousemove',e=>{
  if(!dragStart) return;
  rotY=lastX+(e.clientX-dragStart.x)*0.008;
  rotX=lastY+(e.clientY-dragStart.y)*0.008;
});
document.addEventListener('mouseup',()=>{dragStart=null;setTimeout(()=>autoRot=true,3000)});

// ─── VIS 1 — rede neural ───
function drawVis1(){
  const c=document.getElementById('vis1');if(!c)return;
  const x=c.getContext('2d');
  const W=c.width,H=c.height;
  x.clearRect(0,0,W,H);
  const nodes=[];
  const layers=[3,5,4,2];
  const lw=W/(layers.length+1);
  layers.forEach((n,li)=>{
    const nh=H/(n+1);
    for(let ni=0;ni<n;ni++){
      nodes.push({x:lw*(li+1),y:nh*(ni+1),l:li,i:ni,v:Math.random()});
    }
  });
  // conexões
  for(let i=0;i<nodes.length;i++){
    for(let j=0;j<nodes.length;j++){
      if(nodes[j].l!==nodes[i].l+1) continue;
      const a=0.04+0.06*nodes[i].v;
      x.beginPath();x.moveTo(nodes[i].x,nodes[i].y);x.lineTo(nodes[j].x,nodes[j].y);
      x.strokeStyle=`rgba(220,160,120,${a})`;x.lineWidth=0.5;x.stroke();
    }
  }
  // nós
  nodes.forEach(n=>{
    x.beginPath();x.arc(n.x,n.y,4,0,Math.PI*2);
    const nr=155+Math.floor(n.v*80),ng=80+Math.floor(n.v*60),nb=180+Math.floor(n.v*50);x.fillStyle=`rgba(${nr},${ng},${nb},0.8)`;x.fill();
    x.beginPath();x.arc(n.x,n.y,8,0,Math.PI*2);
    x.fillStyle=`rgba(155,107,181,0.1)`;x.fill();
  });
}

function drawVis2(){
  const c=document.getElementById('vis2');if(!c)return;
  const x=c.getContext('2d');
  const W=c.width,H=c.height;
  x.clearRect(0,0,W,H);
  const bars=12;
  for(let i=0;i<bars;i++){
    const bh=20+Math.random()*160;
    const bx=20+i*(W-40)/bars;
    const by=H-20-bh;
    const g=x.createLinearGradient(0,by,0,H-20);
    g.addColorStop(0,'rgba(232,184,109,0.8)');
    g.addColorStop(1,'rgba(100,50,120,0.2)');
    x.fillStyle=g;
    x.fillRect(bx,by,(W-40)/bars-4,bh);
    x.fillStyle='rgba(240,190,110,0.6)';
    x.fillRect(bx,by,(W-40)/bars-4,2);
  }
  // linha
  x.beginPath();
  for(let i=0;i<=W;i+=4){
    const y2=H/2+Math.sin(i*0.05)*30+Math.sin(i*0.02)*15;
    i===0?x.moveTo(i,y2):x.lineTo(i,y2);
  }
  x.strokeStyle='rgba(220,180,100,0.3)';x.lineWidth=1;x.stroke();
}

function drawVis3(){
  const c=document.getElementById('vis3');if(!c)return;
  const x=c.getContext('2d');
  const W=c.width,H=c.height;
  x.clearRect(0,0,W,H);
  const rings=5;
  for(let i=rings;i>0;i--){
    const r=i*(Math.min(W,H)/2-10)/rings;
    x.beginPath();x.arc(W/2,H/2,r,0,Math.PI*2);
    x.strokeStyle=`rgba(220,160,120,${0.05+0.05*(rings-i)})`;
    x.lineWidth=0.5;x.stroke();
  }
  // ícone cadeado estilizado
  x.beginPath();x.arc(W/2,H/2,30,0,Math.PI*2);
  x.fillStyle='rgba(130,80,150,0.1)';x.fill();
  x.strokeStyle='rgba(232,184,109,0.4)';x.lineWidth=1;x.stroke();
  x.fillStyle='rgba(232,184,109,0.6)';
  x.font='24px monospace';x.textAlign='center';x.textBaseline='middle';
  x.fillText('🔒',W/2,H/2);
  // conexões ao redor
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    const px=W/2+70*Math.cos(a),py=H/2+70*Math.sin(a);
    x.beginPath();x.moveTo(W/2+35*Math.cos(a),H/2+35*Math.sin(a));x.lineTo(px,py);
    x.strokeStyle='rgba(155,107,181,0.2)';x.lineWidth=0.5;x.stroke();
    x.beginPath();x.arc(px,py,4,0,Math.PI*2);
    x.fillStyle='rgba(220,160,120,0.4)';x.fill();
  }
}

function drawVis4(){
  const c=document.getElementById('vis4');if(!c)return;
  const x=c.getContext('2d');
  const W=c.width,H=c.height;
  x.clearRect(0,0,W,H);
  const items=['API','NOTION','VS CODE','VOICE','BROWSER','CALENDAR'];
  const cx3=W/2,cy3=H/2;
  const orbitR=145; // raio orbital maior
  const centerR=52; // círculo central maior
  const nodeR=36;   // círculos satélite maiores

  // anel orbital sutil
  x.beginPath();x.arc(cx3,cy3,orbitR,0,Math.PI*2);
  x.strokeStyle='rgba(155,107,181,0.08)';x.lineWidth=1;x.stroke();

  // linhas de conexão com gradiente
  items.forEach((item,i)=>{
    const a=i*Math.PI*2/items.length-Math.PI/2;
    const px=cx3+orbitR*Math.cos(a),py=cy3+orbitR*Math.sin(a);
    const grd=x.createLinearGradient(cx3,cy3,px,py);
    grd.addColorStop(0,'rgba(232,184,109,0.35)');
    grd.addColorStop(1,'rgba(155,107,181,0.15)');
    x.beginPath();
    x.moveTo(cx3+(centerR+2)*Math.cos(a),cy3+(centerR+2)*Math.sin(a));
    x.lineTo(px-(nodeR+2)*Math.cos(a),py-(nodeR+2)*Math.sin(a));
    x.strokeStyle=grd;x.lineWidth=1;x.stroke();
  });

  // nós satélite
  items.forEach((item,i)=>{
    const a=i*Math.PI*2/items.length-Math.PI/2;
    const px=cx3+orbitR*Math.cos(a),py=cy3+orbitR*Math.sin(a);

    // halo externo
    x.beginPath();x.arc(px,py,nodeR+8,0,Math.PI*2);
    x.fillStyle='rgba(155,107,181,0.06)';x.fill();

    // círculo principal
    x.beginPath();x.arc(px,py,nodeR,0,Math.PI*2);
    const bg=x.createRadialGradient(px-4,py-4,2,px,py,nodeR);
    bg.addColorStop(0,'rgba(80,30,100,0.95)');
    bg.addColorStop(1,'rgba(20,8,35,0.95)');
    x.fillStyle=bg;x.fill();
    x.strokeStyle='rgba(201,123,138,0.45)';x.lineWidth=1;x.stroke();

    // texto item
    x.fillStyle='rgba(232,184,109,0.92)';
    x.font='600 11px monospace';x.textAlign='center';x.textBaseline='middle';
    x.fillText(item,px,py);
  });

  // círculo central
  x.beginPath();x.arc(cx3,cy3,centerR,0,Math.PI*2);
  const cg=x.createRadialGradient(cx3-12,cy3-12,4,cx3,cy3,centerR);
  cg.addColorStop(0,'rgba(160,80,200,0.5)');
  cg.addColorStop(0.5,'rgba(100,40,160,0.4)');
  cg.addColorStop(1,'rgba(40,10,80,0.5)');
  x.fillStyle=cg;x.fill();
  x.strokeStyle='rgba(232,184,109,0.7)';x.lineWidth=1.5;x.stroke();

  // anel interno decorativo
  x.beginPath();x.arc(cx3,cy3,centerR-8,0,Math.PI*2);
  x.strokeStyle='rgba(201,123,138,0.2)';x.lineWidth=0.5;x.stroke();

  // texto central
  x.fillStyle='rgba(232,184,109,1)';
  x.font='bold 14px monospace';x.textAlign='center';x.textBaseline='middle';
  x.fillText('ASTRA',cx3,cy3);
}

drawVis1();drawVis2();drawVis3();drawVis4();

// ─── INTERSECTION OBSERVER ───
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('visible');
      if(e.target.classList.contains('metric-item')){
        animateMetric(e.target);
      }
    }
  });
},{threshold:0.2});

document.querySelectorAll('.feature-row,.metric-item').forEach(el=>obs.observe(el));

// ─── ANIMAR MÉTRICAS ───
function animateMetric(el){
  const valEl=el.querySelector('.metric-val');
  const target=parseFloat(valEl.dataset.target);
  const suffix=valEl.dataset.suffix||'';
  let curr=0,dur=1500,start=null;
  function step(ts){
    if(!start)start=ts;
    const p=Math.min((ts-start)/dur,1);
    const ease=1-Math.pow(1-p,3);
    curr=target*ease;
    const disp=target%1===0?Math.round(curr):curr.toFixed(1);
    valEl.textContent=disp+suffix;
    if(p<1)requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ─── ANIMAR STAT ───
function flickerStat(){
  const vals=['98.7%','99.1%','97.8%','98.3%'];
  let i=0;
  setInterval(()=>{
    document.getElementById('stat-proc').textContent=vals[i%vals.length];
    i++;
  },2800);
  const rs=['0.3s','0.28s','0.31s','0.29s'];
  let j=0;
  setInterval(()=>{
    document.getElementById('stat-resp').textContent=rs[j%rs.length];
    j++;
  },3200);
}
flickerStat();
