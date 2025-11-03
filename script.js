// Modern Blue/Orange clock + alarm with canvas background
(function(){
  const clockEl = document.getElementById('clock');
  const tzEl = document.getElementById('tz');
  const hourSel = document.getElementById('hour');
  const minuteSel = document.getElementById('minute');
  const ampmSel = document.getElementById('ampm');
  const setBtn = document.getElementById('setAlarm');
  const clearBtn = document.getElementById('clearAlarm');
  const testBtn = document.getElementById('testAlarm');
  const stopBtn = document.getElementById('stopAlarm');
  const nextAlarmEl = document.getElementById('nextAlarm');

  // fill selects
  for(let h=1; h<=12; h++){
    const o = document.createElement('option'); o.value = String(h).padStart(2,'0'); o.textContent = String(h).padStart(2,'0');
    hourSel.appendChild(o);
  }
  for(let m=0; m<60; m++){
    const o = document.createElement('option'); o.value = String(m).padStart(2,'0'); o.textContent = String(m).padStart(2,'0');
    minuteSel.appendChild(o);
  }

  let alarmTime = null; // "HH:MM AM"
  let ringing = false;
  let alarmAudio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
  alarmAudio.preload = 'auto';
  alarmAudio.loop = true;

  function updateClock(){
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if(h===0) h=12;
    const hh = String(h).padStart(2,'0');
    const mm = String(m).padStart(2,'0');
    const ss = String(s).padStart(2,'0');
    clockEl.textContent = ${hh}:${mm}:${ss};
    tzEl.textContent = ampm;

    if(alarmTime && !ringing){
      const currentHM = ${hh}:${mm} ${ampm};
      if(currentHM === alarmTime) startRinging();
    }
  }

  function setAlarm(){
    alarmTime = ${hourSel.value}:${minuteSel.value} ${ampmSel.value};
    nextAlarmEl.textContent = alarmTime;
    setBtn.disabled = true;
    clearBtn.disabled = false;
    // persist to localStorage (so reload keeps it)
    try { localStorage.setItem('alarmTime', alarmTime); } catch(e){}
  }

  function clearAlarm(){
    alarmTime = null;
    nextAlarmEl.textContent = 'None';
    setBtn.disabled = false;
    clearBtn.disabled = true;
    try { localStorage.removeItem('alarmTime'); } catch(e){}
  }

  function startRinging(){
    ringing = true;
    stopBtn.disabled = false;
    try { alarmAudio.currentTime = 0; alarmAudio.play().catch(()=>{}); } catch(e){}
    // glow body with orange
    document.body.style.transition = 'background 0.25s ease';
    document.body.style.background = 'linear-gradient(180deg,#2a0b00,#3a0f00)';
  }

  function stopRinging(){
    ringing = false;
    stopBtn.disabled = true;
    try { alarmAudio.pause(); alarmAudio.currentTime = 0; } catch(e){}
    // restore background (canvas animation continues)
    document.body.style.background = '';
    // one-shot alarm -> clear saved alarm
    clearAlarm();
  }

  // test alarm (plays sound briefly)
  function testAlarm(){
    const t = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    t.play().catch(()=>{});
    setTimeout(()=>{ t.pause(); t.currentTime=0; }, 3500);
  }

  // try to restore alarm from localStorage
  try {
    const saved = localStorage.getItem('alarmTime');
    if(saved){ alarmTime = saved; nextAlarmEl.textContent = saved; setBtn.disabled = true; clearBtn.disabled = false; }
  } catch(e){}

  // wire events
  setBtn.addEventListener('click', setAlarm);
  clearBtn.addEventListener('click', clearAlarm);
  stopBtn.addEventListener('click', stopRinging);
  testBtn.addEventListener('click', testAlarm);

  clearBtn.disabled = true;
  stopBtn.disabled = true;
  setInterval(updateClock,1000);
  updateClock();

  /* ----------------------------
     Canvas animated background
     subtle moving orbs — blue & orange
     ----------------------------*/
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, orbs=[];
  function resize(){ W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  window.addEventListener('resize', resize);
  resize();

  function rand(min,max){ return Math.random()*(max-min)+min; }

  // create orbs
  for(let i=0;i<12;i++){
    orbs.push({
      x: rand(-W*0.2,W*1.2),
      y: rand(-H*0.2,H*1.2),
      r: rand(40,120),
      vx: rand(-0.2,0.2),
      vy: rand(-0.05,0.05),
      hue: Math.random()<0.6 ? 'blue' : 'orange',
      alpha: rand(0.06,0.16)
    });
  }

  function draw(){
    ctx.clearRect(0,0,W,H);
    // subtle gradient overlay
    const g = ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'rgba(7,18,40,0.55)'); g.addColorStop(1,'rgba(12,22,40,0.65)');
    ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

    for(const o of orbs){
      // move
      o.x += o.vx; o.y += o.vy;
      if(o.x < -W*0.3) o.x = W*1.1;
      if(o.x > W*1.3) o.x = -W*0.1;
      if(o.y < -H*0.3) o.y = H*1.1;
      if(o.y > H*1.3) o.y = -H*0.1;

      // color
      let col;
      if(o.hue==='blue') col = rgba(8,160,255,${o.alpha});
      else col = rgba(255,122,41,${o.alpha});

      const grd = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      grd.addColorStop(0, col);
      grd.addColorStop(0.4, col.replace(/[\d\.]+\)$/,'0.12)'));
      grd.addColorStop(1, 'rgba(2,6,23,0)');
      ctx.beginPath(); ctx.fillStyle = grd; ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill();
    }

    requestAnimationFrame(draw);
  }
  draw();

})();