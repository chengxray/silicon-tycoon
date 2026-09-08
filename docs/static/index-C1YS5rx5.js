var K=Object.defineProperty;var X=(x,t,e)=>t in x?K(x,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):x[t]=e;var g=(x,t,e)=>X(x,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function e(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(a){if(a.ep)return;a.ep=!0;const n=e(a);fetch(a.href,n)}})();class L{static getRequiredRankWeight(t){return t<=2?1:t<=4?2:t===5?3:4}static checkTPMConditions(t,e){if(!e)return{isTPMActive:!1,reason:"未指派工程師進駐"};if(e.moduleSpecialty!==t.category)return{isTPMActive:!1,reason:`專長不符！該機台為 ${t.category}，工程師專精為 ${e.moduleSpecialty}`};const s=this.getRequiredRankWeight(t.tier),a=this.RANK_WEIGHT[e.rank];return a<s?{isTPMActive:!1,reason:`職等不足！機台需等級 ${s}，該工程師為 ${e.rank} (等級 ${a})`}:e.fatigue>=50?{isTPMActive:!1,reason:`工程師疲勞度過高 (${e.fatigue} >= 50)，在線預防保養中斷`}:e.shiftMode!=="THREE_SHIFT"?{isTPMActive:!1,reason:"非三班輪調制（超時兩班制疲勞將持續爬升，無法達成 24H 永久零故障保障）"}:{isTPMActive:!0,reason:"🛡️ 滿足專長相符、資歷合規、三班輪調低疲勞，享有 24 小時不停機零故障保障！"}}static checkExplosionRisk(t,e){if(!e)return{hasRisk:!1,rankDiff:0};const s=this.getRequiredRankWeight(t.tier),a=this.RANK_WEIGHT[e.rank],n=s-a;return{hasRisk:n>=2,rankDiff:n}}static updateMachineHealth(t,e,s=1){const{isTPMActive:a}=this.checkTPMConditions(t,e);if(a){const d=Math.min(t.wear,5),p=100-d;return{newWear:d,healthPercent:p,isTPMActive:!0,breakdownOccurred:!1,isExploded:!1}}let i=Math.min(100,t.wear+.005*s);const o=100-i,l=(i/100)**2*.05*(s/60),c=Math.random()<l;let r=!1;if(c&&e){const d=this.getRequiredRankWeight(t.tier),p=this.RANK_WEIGHT[e.rank];d-p>=2&&Math.random()<.25&&(r=!0)}return{newWear:Number(i.toFixed(2)),healthPercent:Number(o.toFixed(2)),isTPMActive:!1,breakdownOccurred:c,isExploded:r}}static calculateOverhaulCost(t){return Math.round(t*.15)}}g(L,"RANK_WEIGHT",{"Young Specialist":1,"Skilled Worker":2,"Senior Engineer":3,Fellow:4});const y={machines:{litho_contact:{path:"./assets/machines/litho_contact.png",label:"Contact Aligner",tier:1},litho_projection:{path:"./assets/machines/litho_projection.png",label:"1x Projection Aligner",tier:1},litho_gline:{path:"./assets/machines/litho_gline.png",label:"G-Line Stepper",tier:2},litho_iline:{path:"./assets/machines/litho_iline.png",label:"I-Line Stepper",tier:3},litho_krf:{path:"./assets/machines/litho_krf.png",label:"KrF DUV Scanner",tier:4},litho_arfdry:{path:"./assets/machines/litho_arfdry.png",label:"ArF Dry Scanner",tier:4},litho_arfi:{path:"./assets/machines/litho_arfi.png",label:"ArFi Immersion TWINSCAN",tier:5},litho_euv:{path:"./assets/machines/litho_euv.png",label:"EUV Scanner (無標誌 2.5D 旗艦)",tier:6},litho_highna:{path:"./assets/machines/litho_highna.png",label:"High-NA EUV Scanner",tier:6},track_manual:{path:"./assets/machines/track_manual.png",label:"手動旋塗熱板台",tier:1},track_single:{path:"./assets/machines/track_clean.png",label:"單軌自動塗膠顯影機",tier:2},track_dual:{path:"./assets/machines/track_dual.png",label:"雙軌連線 Track",tier:3},track_clean:{path:"./assets/machines/track_clean.png",label:"多工位精密 Clean Track",tier:4},track_advanced:{path:"./assets/machines/track_advanced.png",label:"先進極限分子級 Track",tier:6},etch_wet:{path:"./assets/machines/etch_wet.png",label:"濕式酸槽清洗台",tier:1},etch_plasma:{path:"./assets/machines/etch_plasma.png",label:"電漿乾式蝕刻機 (RIE)",tier:3},film_furnace:{path:"./assets/machines/film_furnace.png",label:"高溫熱氧化爐管",tier:1},film_pecvd:{path:"./assets/machines/film_pecvd.png",label:"電漿化學沉積 / ALD 機",tier:4},diff_furnace:{path:"./assets/machines/diff_furnace.png",label:"熱擴散高溫爐管",tier:1},diff_implanter:{path:"./assets/machines/diff_implanter.png",label:"大束流離子佈植機",tier:2},cmp_polisher:{path:"./assets/machines/cmp_polisher.png",label:"化學機械平坦化研磨機",tier:3}},characters:{tech_cleanroom:{path:"./assets/characters/tech_cleanroom.png",label:"Cleanroom Technician"},agv_carrier:{path:"./assets/characters/agv_carrier.png",label:"AGV Wafer Carrier"},oht_shuttle:{path:"./assets/characters/oht_shuttle.png",label:"OHT Sky-Rail Shuttle"},tech_walk:{path:"./assets/characters/tech_walk.svg",frameWidth:128,frameHeight:128,frameCount:4},tech_carry:{path:"./assets/characters/tech_carry.svg",frameWidth:128,frameHeight:128,frameCount:4},tech_pm:{path:"./assets/characters/tech_pm.svg",frameWidth:128,frameHeight:128,frameCount:4},tech_repair:{path:"./assets/characters/tech_repair.svg",frameWidth:128,frameHeight:128,frameCount:4},tech_fatigue:{path:"./assets/characters/tech_fatigue.svg",frameWidth:128,frameHeight:128,frameCount:4},agv_drive:{path:"./assets/characters/agv_drive.svg",frameWidth:128,frameHeight:128,frameCount:4},oht_shuttle_svg:{path:"./assets/characters/oht_shuttle.svg",frameWidth:128,frameHeight:128,frameCount:4}}};class f{static getContext(){if(this.isMuted)return null;if(!this.audioCtx){const t=window.AudioContext||window.webkitAudioContext;t&&(this.audioCtx=new t)}return this.audioCtx&&this.audioCtx.state==="suspended"&&this.audioCtx.resume(),this.audioCtx}static toggleMute(){return this.isMuted=!this.isMuted,this.isMuted}static isAudioMuted(){return this.isMuted}static playClick(){const t=this.getContext();if(!t)return;const e=t.createOscillator(),s=t.createGain(),a=t.currentTime;e.type="sine",e.frequency.setValueAtTime(800,a),e.frequency.exponentialRampToValueAtTime(1200,a+.04),s.gain.setValueAtTime(.15,a),s.gain.exponentialRampToValueAtTime(.001,a+.04),e.connect(s),s.connect(t.destination),e.start(a),e.stop(a+.04)}static playCoin(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.createOscillator(),a=t.createOscillator(),n=t.createGain();s.type="sine",s.frequency.setValueAtTime(987.77,e),s.frequency.setValueAtTime(1318.51,e+.08),a.type="triangle",a.frequency.setValueAtTime(1975.53,e+.08),n.gain.setValueAtTime(.2,e),n.gain.exponentialRampToValueAtTime(.001,e+.28),s.connect(n),a.connect(n),n.connect(t.destination),s.start(e),s.stop(e+.28),a.start(e+.08),a.stop(e+.28)}static playCoinChime(){this.playCoin()}static playSuccess(){const t=this.getContext();if(!t)return;const e=t.currentTime;[523.25,659.25,783.99,1046.5].forEach((a,n)=>{const i=t.createOscillator(),o=t.createGain(),l=e+n*.08;i.type="triangle",i.frequency.setValueAtTime(a,l),o.gain.setValueAtTime(.2,l),o.gain.exponentialRampToValueAtTime(.001,l+.35),i.connect(o),o.connect(t.destination),i.start(l),i.stop(l+.35)})}static playFanfare(){this.playSuccess()}static playWarning(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.createOscillator(),a=t.createGain();s.type="sawtooth",s.frequency.setValueAtTime(440,e),s.frequency.setValueAtTime(554.37,e+.1),a.gain.setValueAtTime(.12,e),a.gain.exponentialRampToValueAtTime(.001,e+.25),s.connect(a),a.connect(t.destination),s.start(e),s.stop(e+.25)}static playCriticalAlarm(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.createOscillator(),a=t.createGain();s.type="sawtooth",s.frequency.setValueAtTime(600,e),s.frequency.linearRampToValueAtTime(950,e+.18),s.frequency.linearRampToValueAtTime(600,e+.36),a.gain.setValueAtTime(.18,e),a.gain.exponentialRampToValueAtTime(.001,e+.4),s.connect(a),a.connect(t.destination),s.start(e),s.stop(e+.4)}static playExplosion(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.sampleRate*.6,a=t.createBuffer(1,s,t.sampleRate),n=a.getChannelData(0);for(let c=0;c<s;c++)n[c]=Math.random()*2-1;const i=t.createBufferSource();i.buffer=a;const o=t.createBiquadFilter();o.type="lowpass",o.frequency.setValueAtTime(800,e),o.frequency.exponentialRampToValueAtTime(40,e+.6);const l=t.createGain();l.gain.setValueAtTime(.4,e),l.gain.exponentialRampToValueAtTime(.001,e+.6),i.connect(o),o.connect(l),l.connect(t.destination),i.start(e),i.stop(e+.6)}static playRework(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.sampleRate*.4,a=t.createBuffer(1,s,t.sampleRate),n=a.getChannelData(0);for(let c=0;c<s;c++)n[c]=Math.random()*2-1;const i=t.createBufferSource();i.buffer=a;const o=t.createBiquadFilter();o.type="bandpass",o.frequency.setValueAtTime(1200,e),o.frequency.exponentialRampToValueAtTime(300,e+.4),o.Q.value=3;const l=t.createGain();l.gain.setValueAtTime(.2,e),l.gain.exponentialRampToValueAtTime(.001,e+.4),i.connect(o),o.connect(l),l.connect(t.destination),i.start(e),i.stop(e+.4)}}g(f,"audioCtx",null),g(f,"isMuted",!1);const j=class j extends Phaser.Scene{constructor(){super({key:j.KEY});g(this,"saveGame");g(this,"tileWidth",140);g(this,"tileHeight",70);g(this,"floorGraphics");g(this,"railGraphics");g(this,"machineMap",new Map);g(this,"technicians",[]);g(this,"ohtShuttles",[]);g(this,"agvCarriers",[]);g(this,"isDragging",!1);g(this,"dragStartX",0);g(this,"dragStartY",0);g(this,"onMachineClickCallback")}init(e){this.saveGame=e.saveGame,this.onMachineClickCallback=e.onMachineClick}preload(){for(const[e,s]of Object.entries(y.machines))this.textures.exists(e)||this.load.image(e,s.path);for(const[e,s]of Object.entries(y.characters))!this.textures.exists(e)&&s.path&&this.load.image(e,s.path)}create(){this.floorGraphics=this.add.graphics(),this.railGraphics=this.add.graphics(),this.renderFloor(),this.renderOHTRails(),this.renderMachines(),this.spawnTechnicians(),this.spawnAGVCarriers(),this.spawnOHTShuttles(),this.cameras.main.centerOn(0,200),this.cameras.main.setZoom(.95),this.setupCameraControls(),this.scale.on("resize",this.onResize,this)}toScreen(e,s){const a=(e-s)*(this.tileWidth/2),n=(e+s)*(this.tileHeight/2);return{x:a,y:n}}renderFloor(){this.floorGraphics.clear();const e=this.saveGame.facility.bayGridSize;for(let n=0;n<e.width;n++)for(let i=0;i<e.height;i++){const{x:o,y:l}=this.toScreen(n,i),c=i<=3&&n>=2&&n<=5,r={x:o,y:l-this.tileHeight/2},d={x:o+this.tileWidth/2,y:l},p={x:o,y:l+this.tileHeight/2},u={x:o-this.tileWidth/2,y:l};c?(this.floorGraphics.fillStyle(2562309,.95),this.floorGraphics.lineStyle(1.5,16096779,.45)):(this.floorGraphics.fillStyle((n+i)%2===0?594210:792109,.95),this.floorGraphics.lineStyle(1,1976635,.5)),this.floorGraphics.beginPath(),this.floorGraphics.moveTo(r.x,r.y),this.floorGraphics.lineTo(d.x,d.y),this.floorGraphics.lineTo(p.x,p.y),this.floorGraphics.lineTo(u.x,u.y),this.floorGraphics.closePath(),this.floorGraphics.fillPath(),this.floorGraphics.strokePath()}const s=this.toScreen(3.5,1.5),a=this.add.text(s.x,s.y-40,"🟡 黃光微影作業專區 (LITHO BAY)",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"12px",color:"#fbbf24",stroke:"#000000",strokeThickness:3});a.setOrigin(.5),a.setDepth(10)}renderOHTRails(){this.railGraphics.clear();const e=this.saveGame.facility.bayGridSize,s=-160;this.railGraphics.lineStyle(2.5,440020,.35);const a=this.toScreen(1,1),n=this.toScreen(e.width-2,1),i=this.toScreen(e.width-2,e.height-2),o=this.toScreen(1,e.height-2);this.railGraphics.beginPath(),this.railGraphics.moveTo(a.x,a.y+s),this.railGraphics.lineTo(n.x,n.y+s),this.railGraphics.lineTo(i.x,i.y+s),this.railGraphics.lineTo(o.x,o.y+s),this.railGraphics.closePath(),this.railGraphics.strokePath()}renderMachines(){const e=new Map(this.saveGame.staff.map(s=>[s.id,s]));for(const s of this.saveGame.machines){const{x:a,y:n}=this.toScreen(s.gridX,s.gridY),i=(s.gridX+s.gridY)*10+50;let o=this.machineMap.get(s.id);if(o){o.ledArc.setFillStyle(this.getLEDColor(s.status));const l=s.assignedEngineerId?e.get(s.assignedEngineerId):null,c=L.checkTPMConditions(s,l);if(c.isTPMActive&&!o.tpmText){const r=this.add.text(0,-110,"🛡️ TPM 零故障",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#10b981",backgroundColor:"rgba(6, 78, 59, 0.9)",padding:{x:5,y:2}});r.setOrigin(.5),o.container.add(r),o.tpmText=r}else!c.isTPMActive&&o.tpmText&&(o.tpmText.destroy(),o.tpmText=void 0)}else{const l=this.add.container(a,n);l.setDepth(i);const c=this.add.ellipse(0,10,this.tileWidth*.7,this.tileHeight*.5,0,.4);l.add(c);let r;if(this.textures.exists(s.modelId)){r=this.add.image(0,-35,s.modelId);const w=Math.max(r.width,r.height),C=this.tileWidth*1.1/Math.max(1,w);r.setScale(C),l.add(r)}else{const w=this.createFallbackMachineGraphic(s);l.add(w)}const d=this.getLEDColor(s.status),p=this.add.circle(0,-90,6,d);l.add(p);const u=this.add.text(0,15,`${s.name}`,{fontFamily:"Noto Sans TC, sans-serif",fontSize:"11px",fontStyle:"bold",color:"#f8fafc",backgroundColor:"rgba(15, 23, 42, 0.85)",padding:{x:6,y:3}});u.setOrigin(.5),l.add(u);const h=s.assignedEngineerId?e.get(s.assignedEngineerId):null,m=L.checkTPMConditions(s,h);let b;m.isTPMActive&&(b=this.add.text(0,-110,"🛡️ TPM 零故障",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#10b981",backgroundColor:"rgba(6, 78, 59, 0.9)",padding:{x:5,y:2}}),b.setOrigin(.5),l.add(b)),l.setSize(this.tileWidth*.8,this.tileHeight*1.8),l.setInteractive({useHandCursor:!0}),l.on("pointerover",()=>{r&&r.setTint(3718648)}),l.on("pointerout",()=>{r&&r.clearTint()}),l.on("pointerdown",()=>{f.playClick(),this.onMachineClickCallback&&this.onMachineClickCallback(s)}),this.machineMap.set(s.id,{container:l,ledArc:p,tpmText:b,sprite:r})}}}createFallbackMachineGraphic(e){const s=this.add.graphics(),a=60;let n=3900150;return e.category==="LITHO"&&(n=16096779),e.category==="TRACK"&&(n=1096065),e.category==="ETCH"&&(n=9133302),e.category==="DIFF"&&(n=15485081),e.category==="CMP"&&(n=440020),s.fillStyle(n,.9),s.beginPath(),s.moveTo(0,-70),s.lineTo(a/2,-60),s.lineTo(0,-50),s.lineTo(-a/2,-60),s.closePath(),s.fillPath(),s.fillStyle(n,.7),s.beginPath(),s.moveTo(-a/2,-60),s.lineTo(0,-50),s.lineTo(0,0),s.lineTo(-a/2,-10),s.closePath(),s.fillPath(),s.fillStyle(n,.5),s.beginPath(),s.moveTo(0,-50),s.lineTo(a/2,-60),s.lineTo(a/2,-10),s.lineTo(0,0),s.closePath(),s.fillPath(),s}getLEDColor(e){switch(e){case"IDLE":return 1096065;case"PROCESSING":return 440020;case"MAINTENANCE":return 16096779;case"EXPLODED":return 15680580}}spawnTechnicians(){const e=Math.min(6,Math.max(2,this.saveGame.staff.length));for(let s=0;s<e;s++){const a=this.add.container(0,0);a.setDepth(200);const n=this.add.ellipse(0,4,18,9,0,.35);if(a.add(n),this.textures.exists("tech_cleanroom")){const o=this.add.image(0,-18,"tech_cleanroom");o.setDisplaySize(48,48),a.add(o)}else{const o=this.add.circle(0,-12,8,16317180),l=this.add.rectangle(0,-12,8,4,3718648),c=this.add.rectangle(0,-4,12,12,14870768);a.add([c,o,l])}const i=this.toScreen(2+s,3);a.setPosition(i.x,i.y),this.technicians.push({container:a,targetX:i.x,targetY:i.y,speed:.6+Math.random()*.4})}}spawnAGVCarriers(){if(this.saveGame.unlockedFeatures.agv)for(let e=0;e<2;e++){const s=this.add.container(0,0);s.setDepth(205);const a=this.add.ellipse(0,4,24,12,0,.4);if(s.add(a),this.textures.exists("agv_carrier")){const i=this.add.image(0,-14,"agv_carrier");i.setDisplaySize(54,40),s.add(i)}else{const i=this.add.rectangle(0,-8,28,16,165063),o=this.add.rectangle(0,-18,16,12,1096065),l=this.add.circle(10,-8,3,15680580);s.add([i,o,l])}const n=this.toScreen(1+e*3,2);s.setPosition(n.x,n.y),this.agvCarriers.push({container:s,targetX:n.x,targetY:n.y,speed:1.1+e*.2})}}spawnOHTShuttles(){const e=this.add.container(0,-160);if(e.setDepth(500),this.textures.exists("oht_shuttle")){const a=this.add.image(0,16,"oht_shuttle");a.setDisplaySize(56,42),e.add(a)}else{const a=this.add.rectangle(0,0,8,12,4674921),n=this.add.rectangle(0,10,32,18,959977),i=this.add.rectangle(0,22,20,16,1096065),o=this.add.circle(12,10,3,2278750);e.add([a,n,i,o])}const s=this.toScreen(1,1);e.setPosition(s.x,s.y-160),this.ohtShuttles.push({container:e,progress:0,speed:.002})}update(e,s){const a=this.saveGame.facility.bayGridSize,n=[this.toScreen(1,1),this.toScreen(a.width-2,1),this.toScreen(a.width-2,a.height-2),this.toScreen(1,a.height-2)];for(const i of this.ohtShuttles){i.progress=(i.progress+i.speed*(s/16))%1;const o=n.length,l=Math.floor(i.progress*o),c=(l+1)%o,r=i.progress*o%1,d=n[l],p=n[c],u=d.x+(p.x-d.x)*r,h=d.y+(p.y-d.y)*r-160;i.container.setPosition(u,h)}for(const i of this.technicians){const o=i.targetX-i.container.x,l=i.targetY-i.container.y,c=Math.sqrt(o*o+l*l);if(c<4){const r=Math.floor(Math.random()*(a.width-2))+1,d=Math.floor(Math.random()*(a.height-2))+1,p=this.toScreen(r,d);i.targetX=p.x,i.targetY=p.y}else i.container.x+=o/c*i.speed*(s/16),i.container.y+=l/c*i.speed*(s/16)}for(const i of this.agvCarriers){const o=i.targetX-i.container.x,l=i.targetY-i.container.y,c=Math.sqrt(o*o+l*l);if(c<4){const r=Math.floor(Math.random()*(a.width-2))+1,d=Math.floor(Math.random()*(a.height-2))+1,p=this.toScreen(r,d);i.targetX=p.x,i.targetY=p.y}else i.container.x+=o/c*i.speed*(s/16),i.container.y+=l/c*i.speed*(s/16)}}setupCameraControls(){this.input.on("pointerdown",e=>{e.button===0&&(this.isDragging=!0,this.dragStartX=e.x,this.dragStartY=e.y)}),this.input.on("pointermove",e=>{if(this.isDragging){const s=e.x-this.dragStartX,a=e.y-this.dragStartY;this.cameras.main.scrollX-=s/this.cameras.main.zoom,this.cameras.main.scrollY-=a/this.cameras.main.zoom,this.dragStartX=e.x,this.dragStartY=e.y}}),this.input.on("pointerup",()=>{this.isDragging=!1}),this.input.on("wheel",(e,s,a,n)=>{const i=Phaser.Math.Clamp(this.cameras.main.zoom-n*.001,.5,2.2);this.cameras.main.setZoom(i)})}onResize(e){this.cameras.main.setSize(e.width,e.height)}updateState(e){this.saveGame=e,this.renderMachines(),this.saveGame.unlockedFeatures.agv&&this.agvCarriers.length===0&&this.spawnAGVCarriers()}};g(j,"KEY","CleanroomScene");let R=j;class S{static getInitialAchievements(){return JSON.parse(JSON.stringify(this.INITIAL_ACHIEVEMENTS))}static checkAchievements(t){const e=[],s=new Map;for(const c of t.achievements)s.set(c.id,c);const a=c=>{const r=s.get(c);r&&!r.unlocked&&(r.unlocked=!0,e.push(r))};t.rollingYieldHistory.length>=1&&a("first_silicon"),(t.activeLots.some(c=>c.currentStation==="LIT"||c.currentStation==="ETCH"||c.currentStation==="DIFF")||t.rollingYieldHistory.length>=1)&&a("step_into_yellow");const i=t.activeOrders.filter(c=>c.status==="FULFILLED");i.length>=1&&a("first_cash"),t.unlockedFeatures.mesAutoDispatch&&a("mes_mastery"),i.some(c=>c.nodeNm<=350)&&a("submicron_explorer"),t.unlockedFeatures.cmp&&t.machines.some(c=>c.category==="CMP")&&a("copper_cmp_era"),t.machines.some(c=>c.modelId==="litho_arfi")&&a("immersion_wave"),t.machines.some(c=>c.modelId==="litho_euv"||c.modelId==="litho_highna")&&a("euv_domination");const o=new Map(t.staff.map(c=>[c.id,c]));let l=0;for(const c of t.machines){const r=c.assignedEngineerId?o.get(c.assignedEngineerId):null;L.checkTPMConditions(c,r).isTPMActive&&l++}if(l>=3&&a("tpm_zero_defect"),t.machines.some(c=>{var r;return c.category==="LITHO"&&(((r=c.pairedTrackIds)==null?void 0:r.length)??0)>=2})&&a("inline_cluster_master"),t.facility.cleanroomPhase>=4&&a("gigafab_expansion"),t.unlockedFeatures.agv&&t.unlockedFeatures.oht&&a("automation_highway"),t.rollingYieldHistory.some(c=>c>=.99)&&a("flawless_wafer"),t.rollingYieldHistory.length>=5){const c=t.rollingYieldHistory.slice(-5);c.reduce((d,p)=>d+p,0)/c.length>=.95&&a("five_star_foundry")}return t.player.cash>=1e8&&a("trillion_chip_dynasty"),{newlyUnlocked:e}}static triggerManualUnlock(t,e){const s=t.find(a=>a.id===e);return s&&!s.unlocked?(s.unlocked=!0,!0):!1}static claimReward(t,e){const s=t.find(a=>a.id===e);return s?s.unlocked?s.claimed?{success:!1,cash:0,message:"該成就獎勵已領取"}:(s.claimed=!0,{success:!0,cash:s.rewardCash,message:`🏆 成功領取成就【${s.title}】獎勵！獲得獎勵金 NT$ ${s.rewardCash.toLocaleString()}！`}):{success:!1,cash:0,message:"尚未達成該成就解鎖條件"}:{success:!1,cash:0,message:"找不到該成就"}}}g(S,"INITIAL_ACHIEVEMENTS",[{id:"first_silicon",category:"onboarding",title:"矽島啟航 (First Silicon)",description:"成功在廠房內完成並產出第一批晶圓。",rewardCash:5e4,unlocked:!1,claimed:!1},{id:"step_into_yellow",category:"onboarding",title:"邁入黃光密室 (Yellow Room Entry)",description:"首次完成微影站塗膠、曝光與顯影連線作業。",rewardCash:8e4,unlocked:!1,claimed:!1},{id:"first_cash",category:"onboarding",title:"首桶金進帳 (First Cash Delivery)",description:"成功履約第一張客戶製造合約並取得全額尾款。",rewardCash:1e5,unlocked:!1,claimed:!1},{id:"mes_mastery",category:"onboarding",title:"智慧製造大師 (MES Mastery)",description:"完成新手教學，解鎖並啟用 MES 智慧自動派工系統。",rewardCash:15e4,unlocked:!1,claimed:!1},{id:"submicron_explorer",category:"process",title:"突破次微米壁壘 (Sub-micron Explorer)",description:"成功承接並交付線寬 <= 350nm 之高階次微米訂單。",rewardCash:5e5,unlocked:!1,claimed:!1},{id:"copper_cmp_era",category:"process",title:"銅導線與平坦化時代 (CMP Era)",description:"解鎖並在廠房內運作 CMP 化學機械平坦化拋光設備。",rewardCash:1e6,unlocked:!1,claimed:!1},{id:"immersion_wave",category:"process",title:"水中折射奇蹟 (Immersion Wave)",description:"購買並安裝 Tier 5 ArFi 浸潤微影雙工件台設備 (TWINSCAN)。",rewardCash:5e6,unlocked:!1,claimed:!1},{id:"euv_domination",category:"process",title:"極紫外神之光 (EUV Domination)",description:"購買並啟用極紫外光微影巨獸 (EUV Scanner)。",rewardCash:2e7,unlocked:!1,claimed:!1},{id:"tpm_zero_defect",category:"operation",title:"零非計畫停機殿堂 (TPM Zero-Defect)",description:"同時維持 3 台以上機台處於 🛡️ TPM 24H 零故障在線維護保障狀態。",rewardCash:2e6,unlocked:!1,claimed:!1},{id:"inline_cluster_master",category:"operation",title:"雙軌並聯突破極限 (Inline Cluster Master)",description:"為微影機台並聯配套綁定 2 台以上 Track 塗膠顯影設備，消除產能瓶頸。",rewardCash:15e5,unlocked:!1,claimed:!1},{id:"gigafab_expansion",category:"operation",title:"GigaFab 超級晶圓廠 (GigaFab Expansion)",description:"將潔淨室無塵廠房拓建至 Phase 4 (24x24 巨型潔淨室)。",rewardCash:1e7,unlocked:!1,claimed:!1},{id:"automation_highway",category:"operation",title:"自動化天軌物流 (Automation Highway)",description:"同時解鎖地面 AGV 自走車與天花板 OHT 懸吊天軌系統。",rewardCash:3e6,unlocked:!1,claimed:!1},{id:"flawless_wafer",category:"yield",title:"神級黃金良率 (Flawless Wafer 99%+)",description:"成功生產交付一批最終良率達 99% 以上的頂級晶圓。",rewardCash:1e6,unlocked:!1,claimed:!1},{id:"rework_savior",category:"yield",title:"點石成金光阻重洗 (Rework Savior)",description:"成功對 Q-Time 逾期晶圓執行光阻重洗 (Rework)，拯救昂貴晶片免於報廢。",rewardCash:5e5,unlocked:!1,claimed:!1},{id:"five_star_foundry",category:"yield",title:"五星品質金字招牌 (Five-Star Foundry)",description:"累積至少 5 批出貨紀錄，且 RollingYieldIndex 滾動良率指數突破 95%！",rewardCash:8e6,unlocked:!1,claimed:!1},{id:"trillion_chip_dynasty",category:"yield",title:"稱霸全球矽島霸權 (Silicon Hegemony)",description:"總現金累積突破 NT$ 100,000,000，建立無可撼動的半導體傳奇帝國。",rewardCash:5e7,unlocked:!1,claimed:!1}]);class ${static createDefaultSave(t="矽島先進半導體",e="張創辦人",s="avatar_1"){const a=Date.now();return{schemaVersion:2,savedAt:a,lastOnlineTimestamp:a,player:{companyName:t,ceoName:e,avatarId:s,cash:5e7,foundryTier:1,popularity:100,unlockedK1:"BASE",unlockedCleanroomClass:"Class 10000"},unlockedFeatures:{cmp:!1,agv:!1,oht:!1,mesAutoDispatch:!1,mixAndMatchLitho:!1},facility:{cleanroomPhase:1,bayGridSize:{width:8,height:8}},machines:[{id:"mach_film_1",modelId:"film_furnace",name:"熱氧化爐 (Thermal Oxidation)",category:"FILM",tier:1,gridX:2,gridY:2,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_track_1",modelId:"track_clean",name:"手動旋塗熱板台 (Manual Track)",category:"TRACK",tier:1,gridX:3,gridY:2,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_litho_1",modelId:"litho_contact",name:"接觸式微影機 (Contact Aligner)",category:"LITHO",tier:1,gridX:4,gridY:2,wear:0,status:"IDLE",assignedEngineerId:"staff_1",pairedTrackIds:["mach_track_1"]},{id:"mach_etch_1",modelId:"etch_plasma",name:"電漿乾式蝕刻機 (Dry Plasma Etcher)",category:"ETCH",tier:1,gridX:3,gridY:4,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_diff_1",modelId:"diff_furnace",name:"擴散退火爐 (Diffusion Furnace)",category:"DIFF",tier:1,gridX:2,gridY:4,wear:0,status:"IDLE",assignedEngineerId:null}],staff:[{id:"staff_1",name:"林資深",rank:"Skilled Worker",moduleSpecialty:"LITHO",fatigue:10,shiftMode:"THREE_SHIFT",assignedMachineId:"mach_litho_1",salary:6e4}],activeOrders:[],activeLots:[],rollingYieldHistory:[],clawbackDebt:0,questState:{lastDateStr:new Date().toISOString().split("T")[0],dailyQuests:[],allDailyClaimed:!1,weeklyCompletedCount:0,weeklyTarget:15,weeklyClaimed:!1},achievements:S.getInitialAchievements(),gameTime:0}}static saveToLocalStorage(t){try{t.savedAt=Date.now(),t.lastOnlineTimestamp=Date.now();const e=JSON.stringify(t);return localStorage.setItem(this.STORAGE_KEY_V2,e),!0}catch(e){return console.error("LocalStorage 存檔失敗:",e),!1}}static loadFromLocalStorage(){try{const t=localStorage.getItem(this.STORAGE_KEY_V2);if(t){const s=JSON.parse(t);if(s.schemaVersion===2)return s}const e=localStorage.getItem(this.STORAGE_KEY_V1);if(e){const s=JSON.parse(e);if(s.schemaVersion===1){console.warn("偵測到舊版 SaveGameV1 存檔，執行自動升級至 SaveGameV2...");const a=this.migrateSaveV1toV2(s);return this.saveToLocalStorage(a),a}}return null}catch(t){return console.error("LocalStorage 讀檔失敗:",t),null}}static migrateSaveV1toV2(t){const e=new Date().toISOString().split("T")[0],s=t.machines.map(n=>({...n,pairedTrackIds:n.category==="LITHO"?[]:void 0})),a=t.activeOrders.map(n=>({...n,urgencyMultiplier:n.urgencyMultiplier??1,layerAllocations:[]}));return{schemaVersion:2,savedAt:t.savedAt??Date.now(),lastOnlineTimestamp:t.lastOnlineTimestamp??Date.now(),player:{...t.player},unlockedFeatures:{cmp:t.unlockedFeatures.cmp??!1,agv:t.unlockedFeatures.agv??!1,oht:t.unlockedFeatures.oht??!1,mesAutoDispatch:t.unlockedFeatures.mesAutoDispatch??!1,mixAndMatchLitho:!1},facility:{cleanroomPhase:t.facility.cleanroomPhase??1,bayGridSize:t.facility.bayGridSize??{width:8,height:8}},machines:s,staff:t.staff??[],activeOrders:a,activeLots:t.activeLots??[],rollingYieldHistory:t.rollingYieldHistory??[],clawbackDebt:t.clawbackDebt??0,questState:{lastDateStr:e,dailyQuests:[],allDailyClaimed:!1,weeklyCompletedCount:0,weeklyTarget:15,weeklyClaimed:!1},achievements:S.getInitialAchievements(),gameTime:t.gameTime??0}}static exportSaveToJson(t){return JSON.stringify(t,null,2)}static importSaveFromJson(t){try{const e=JSON.parse(t);return e.schemaVersion===2?{success:!0,state:e}:e.schemaVersion===1?{success:!0,state:this.migrateSaveV1toV2(e)}:{success:!1,error:"不相容的存檔格式版本！"}}catch(e){return{success:!1,error:`JSON 解析失敗: ${e.message}`}}}static calculateOfflineProgress(t,e){const s=Math.max(0,Math.floor((e-t.lastOnlineTimestamp)/1e3)),a=Math.min(14400,s),n={offlineDurationSeconds:a,lotsProcessed:0,wafersDelivered:0,revenueEarned:0,salaryPaid:0,utilityPaid:0,maintenanceExpense:0,debtRepaid:0,breakdownCount:0,explosionCount:0,tpmProtectedCount:0,netProfit:0};if(a<60)return n;const i=Math.floor(a/300),o=new Map(t.staff.map(m=>[m.id,m]));let l=0;for(const m of t.machines){const b=m.assignedEngineerId?o.get(m.assignedEngineerId):null;if(L.checkTPMConditions(m,b).isTPMActive)l++,m.wear=Math.min(5,m.wear),m.status="IDLE";else{const C=i*.4;m.wear=Math.min(100,m.wear+C),m.wear>=60&&Math.random()<.3&&(n.breakdownCount++,L.checkExplosionRisk(m,b).hasRisk&&Math.random()<.25?(n.explosionCount++,n.maintenanceExpense+=2e5*m.tier,m.status="EXPLODED"):(n.maintenanceExpense+=5e4*m.tier,m.status="MAINTENANCE"))}}n.tpmProtectedCount=l;const c=a/3600,r=t.staff.reduce((m,b)=>m+b.salary,0)/720,d=t.machines.length*15e3/720;if(n.salaryPaid=Math.round(r*c),n.utilityPaid=Math.round(d*c),t.unlockedFeatures.mesAutoDispatch&&t.activeOrders.length>0){const m=t.activeOrders.find(b=>b.status==="ACTIVE");if(m&&n.explosionCount===0){const b=Math.min(Math.floor(a/180),10);if(b>0){n.lotsProcessed=b;const w=b*5;n.wafersDelivered=w;const C=Math.round(w*100*m.unitPrice);n.revenueEarned=C;for(let I=0;I<b;I++)t.rollingYieldHistory.push(.92)}}}const p=n.revenueEarned,u=n.salaryPaid+n.utilityPaid+n.maintenanceExpense,h=p-u;if(h>0&&t.clawbackDebt>0){const m=Math.min(t.clawbackDebt,Math.round(h*.25));n.debtRepaid=m,t.clawbackDebt-=m}return n.netProfit=p-u-n.debtRepaid,t.player.cash=Math.max(0,t.player.cash+n.netProfit),t.gameTime+=a,t.lastOnlineTimestamp=e,t.savedAt=e,n}}g($,"STORAGE_KEY_V2","SILICON_TYCOON_SAVE_V2"),g($,"STORAGE_KEY_V1","SILICON_TYCOON_SAVE_V1");class P{static calculateEffectiveK1(t,e,s){let a=.8;switch(t){case"BASE":a=.8;break;case"CAR":a=.65;break;case"OPC":a=.5;break;case"PSM":a=.38;break;case"SAQP":a=.28;break}const i=Math.max(0,Math.min(100,e))/100*.05;let o=0,l=0;if(s&&s.moduleSpecialty==="LITHO")if(s.fatigue>=80)o=0,l=.03;else switch(s.rank){case"Young Specialist":o=.01;break;case"Skilled Worker":o=.02;break;case"Senior Engineer":o=.04;break;case"Fellow":o=.06;break}let c=a+i-o+l;return c=Math.max(t==="SAQP"?.15:.25,Math.min(.95,c)),{effectiveK1:Number(c.toFixed(3)),k1Tech:a,deltaWear:Number(i.toFixed(3)),deltaEngineer:Number(o.toFixed(3)),deltaFatigue:Number(l.toFixed(3))}}static calculateEffectiveCD(t,e,s,a){const n=this.OPTICAL_CATALOG[t];if(!n)return 999999;const{effectiveK1:i}=this.calculateEffectiveK1(e,s,a),o=i*(n.wavelengthNm/n.numericalAperture);return Math.round(o)}static validateResolution(t,e,s,a,n){if(!this.OPTICAL_CATALOG[t])return{canResolve:!1,effectiveCD:999999,effectiveK1:.8,reason:"未知的微影機台型號"};const{effectiveK1:o}=this.calculateEffectiveK1(s,a,n),l=this.calculateEffectiveCD(t,s,a,n);return l>e?{canResolve:!1,effectiveCD:l,effectiveK1:o,reason:`光學解析度不足！當前極限 CD 為 ${l}nm，無法解析目標 ${e}nm 製程（磨損或人員疲勞導致 k1 劣化至 ${o}）。`}:{canResolve:!0,effectiveCD:l,effectiveK1:o}}static getProcessWindowPenalty(t){if(t>=.38)return 0;const e=(.38-t)*.5;return Math.max(0,Math.min(.25,e))}}g(P,"OPTICAL_CATALOG",{litho_contact:{modelId:"litho_contact",name:"Contact Aligner (接觸式微影機)",wavelengthNm:436,numericalAperture:.116,baseRayleighLimitNm:3007,unlockTier:1,baseCost:25e5,baseMttrSec:10},litho_projection:{modelId:"litho_projection",name:"1x Projection Aligner (1:1 投影微影機)",wavelengthNm:436,numericalAperture:.194,baseRayleighLimitNm:1798,unlockTier:1,baseCost:6e6,baseMttrSec:15},litho_gline:{modelId:"litho_gline",name:"G-Line Stepper (步進縮小曝光機)",wavelengthNm:436,numericalAperture:.35,baseRayleighLimitNm:997,unlockTier:2,baseCost:18e6,baseMttrSec:20},litho_iline:{modelId:"litho_iline",name:"I-Line Stepper (高壓汞燈微影機)",wavelengthNm:365,numericalAperture:.5,baseRayleighLimitNm:584,unlockTier:3,baseCost:35e6,baseMttrSec:30},litho_krf:{modelId:"litho_krf",name:"KrF DUV Scanner (準分子雷射掃描機)",wavelengthNm:248,numericalAperture:.7,baseRayleighLimitNm:283,unlockTier:4,baseCost:85e6,baseMttrSec:40},litho_arfdry:{modelId:"litho_arfdry",name:"ArF Dry Scanner (氟化氬乾式微影機)",wavelengthNm:193,numericalAperture:.85,baseRayleighLimitNm:182,unlockTier:4,baseCost:18e7,baseMttrSec:50},litho_arfi:{modelId:"litho_arfi",name:"ArFi Immersion TWINSCAN (雙工件台浸潤微影機)",wavelengthNm:193,numericalAperture:1.35,baseRayleighLimitNm:114,unlockTier:5,baseCost:45e7,baseMttrSec:60},litho_euv:{modelId:"litho_euv",name:"EUV Scanner (極紫外真空微影機)",wavelengthNm:13.5,numericalAperture:.33,baseRayleighLimitNm:33,unlockTier:6,baseCost:25e8,baseMttrSec:90},litho_highna:{modelId:"litho_highna",name:"High-NA EUV Scanner (變形高數值孔徑微影機)",wavelengthNm:13.5,numericalAperture:.55,baseRayleighLimitNm:20,unlockTier:6,baseCost:6e9,baseMttrSec:120}});class E{static getStationSequence(t){return t?["FILM","LIT","ETCH","DIFF","CMP"]:["FILM","LIT","ETCH","DIFF"]}static calculateEffectiveQTimeSec(t,e,s,a){let n=30;t==="LIT"&&e==="ETCH"?n=30:t==="ETCH"&&e==="DIFF"?n=45:t==="CMP"&&(n=35);let i=1;a.includes("1000")&&!a.includes("10000")?i=1.15:a.includes("100")&&!a.includes("1000")?i=1.3:a.includes("1")&&!a.includes("10")&&(i=1.5);let o=1;return s>=1e3?o=1.5:s<=28&&(o=.8),Math.round(n*i*o)}static checkQTimeStatus(t,e,s){if(!t.qTimeDeadline)return{isOverdue:!1,overdueSeconds:0,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:1,urgencyLevel:"SAFE",remainingSeconds:999};const a=t.qTimeDeadline-s;if(a>=0){let l="SAFE";return a<=5?l="CRITICAL":a<=15&&(l="WARNING"),{isOverdue:!1,overdueSeconds:0,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:1,urgencyLevel:l,remainingSeconds:a}}const n=Math.abs(a),i=t.currentStation==="ETCH"||t.currentStation==="LIT"&&t.litSubStep==="DEVELOP",o=Math.round(e.unitPrice*(e.totalDies/Math.max(1,e.layerCount))*.05*(t.waferCount/25));return n<=15?{isOverdue:!0,overdueSeconds:n,isFatal:!1,canRework:i,reworkCost:o,penaltyYieldRatio:.65,urgencyLevel:"EXPIRED",remainingSeconds:0}:i?{isOverdue:!0,overdueSeconds:n,isFatal:!0,canRework:!0,reworkCost:o,penaltyYieldRatio:0,urgencyLevel:"EXPIRED",remainingSeconds:0}:{isOverdue:!0,overdueSeconds:n,isFatal:!0,canRework:!1,reworkCost:0,penaltyYieldRatio:0,urgencyLevel:"EXPIRED",remainingSeconds:0}}static executeReworkLot(t,e){return t.currentStation="LIT",t.litSubStep="COAT",t.qTimeDeadline=null,t.status="PROCESSING",t.yieldMultiplier=Math.max(.85,t.yieldMultiplier*.95),{success:!0,message:`成功救回批次 ${t.lotId}！耗費溶劑費 NT$ ${e.toLocaleString()}，已退回黃光塗膠站重新加工。`}}static advanceLotStation(t,e,s,a,n){const i=this.getStationSequence(e);if(t.currentStation==="LIT"){if(!t.litSubStep||t.litSubStep==="COAT")return t.litSubStep="EXPOSE",t.qTimeDeadline=null,{nextStation:"LIT",nextSubStep:"EXPOSE",isLayerCompleted:!1,isLotCompleted:!1};if(t.litSubStep==="EXPOSE")return t.litSubStep="DEVELOP",t.qTimeDeadline=null,{nextStation:"LIT",nextSubStep:"DEVELOP",isLayerCompleted:!1,isLotCompleted:!1};if(t.litSubStep==="DEVELOP"){t.currentStation="ETCH",t.litSubStep=void 0;const l=this.calculateEffectiveQTimeSec("LIT","ETCH",s,a);return t.qTimeDeadline=n+l,{nextStation:"ETCH",isLayerCompleted:!1,isLotCompleted:!1}}}const o=i.indexOf(t.currentStation);if(o>=0&&o<i.length-1){const l=i[o+1];if(t.currentStation=l,l==="LIT"&&(t.litSubStep="COAT"),t.currentStation==="DIFF"){const c=this.calculateEffectiveQTimeSec("ETCH","DIFF",s,a);t.qTimeDeadline=n+c}else t.qTimeDeadline=null;return{nextStation:l,isLayerCompleted:!1,isLotCompleted:!1}}return t.currentLayer<t.totalLayers?(t.currentLayer+=1,t.currentStation="FILM",t.litSubStep=void 0,t.qTimeDeadline=null,{nextStation:"FILM",isLayerCompleted:!0,isLotCompleted:!1}):(t.status="COMPLETED",t.qTimeDeadline=null,{nextStation:t.currentStation,isLayerCompleted:!0,isLotCompleted:!0})}static calculateStationThroughputs(t,e,s){var c;const a=["FILM","TRACK","LIT","ETCH","DIFF","CMP"],n={FILM:{station:"FILM",totalCapacity:0,machineCount:0,isChokePoint:!1},TRACK:{station:"TRACK",totalCapacity:0,machineCount:0,isChokePoint:!1},LIT:{station:"LIT",totalCapacity:0,machineCount:0,isChokePoint:!1},ETCH:{station:"ETCH",totalCapacity:0,machineCount:0,isChokePoint:!1},DIFF:{station:"DIFF",totalCapacity:0,machineCount:0,isChokePoint:!1},CMP:{station:"CMP",totalCapacity:0,machineCount:0,isChokePoint:!1}},i=new Map;for(const r of e)i.set(r.id,r);for(const r of t){if(r.status==="EXPLODED")continue;let d=r.category;r.category==="LITHO"&&(d="LIT");const p=((c=this.BASE_THROUGHPUT_BY_TIER[d])==null?void 0:c[r.tier])??10,u=1-r.wear/100*.3;let h=1;if(r.assignedEngineerId&&i.has(r.assignedEngineerId)){const b=i.get(r.assignedEngineerId);b.moduleSpecialty===r.category&&b.fatigue<80&&(h=1.2)}d==="LIT"&&r.pairedTrackIds&&r.pairedTrackIds.length>=2&&(h+=.05);const m=p*u*h;n[d].totalCapacity+=m,n[d].machineCount+=1}let o=1/0,l="TRACK";for(const r of a)r==="CMP"&&!s||n[r].totalCapacity<o&&(o=n[r].totalCapacity,l=r);return o<1/0&&l&&(n[l].isChokePoint=!0),n}static calculateLogisticsFactor(t,e,s){let a=.5;t.oht?a=1.2:t.agv&&(a=.85);let n=5;if(e.length>=2){let l=0,c=0;for(let r=0;r<e.length-1;r++){const d=Math.abs(e[r].gridX-e[r+1].gridX)+Math.abs(e[r].gridY-e[r+1].gridY);l+=d,c++}n=c>0?l/c:5}const i=Math.max(.6,Math.min(1.1,6/Math.max(2,n))),o=Math.min(.2,s*.02);return Number((a*i*(1-o)).toFixed(2))}static calculateFactoryWorkload(t,e,s,a,n){const i=this.calculateStationThroughputs(t,e,n),o=this.calculateLogisticsFactor(a,t,s.length),l=["FILM","TRACK","LIT","ETCH","DIFF"];n&&l.push("CMP");let c=1/0;for(const h of l){const m=i[h].totalCapacity;m<c&&(c=m)}const r=Math.max(1,c*o);let d=0;for(const h of s)(h.status==="PROCESSING"||h.status==="WAITING_QTIME"||h.status==="TRANSPORTING")&&(d+=h.waferCount);const p=Math.min(150,Math.round(d/r*100));let u="SMOOTH";return p>85?u="OVERLOADED":p>=70&&(u="HEAVY"),{workloadPercent:p,maxCapacityWafersPerMin:Math.round(r),totalDemandWafers:d,statusLevel:u,throughputs:i}}static diagnoseBottleneck(t,e,s,a,n){var h;const{workloadPercent:i,throughputs:o}=this.calculateFactoryWorkload(t,e,s,a,n),l=t.find(m=>m.wear>=70);if(l){const m=l.category==="LITHO"?"LIT":l.category;return{category:"MAINTENANCE",title:"機台嚴重老化致效能衰退",stationName:l.category,description:`【${l.name}】磨損度高達 ${l.wear}%，抽真空與加工速率嚴重衰退超過 20%！`,recommendation:"請立即指派工程師對該機台執行「就地大修（Overhaul）」或保養，恢復 100% 原始效能。",workloadPercent:i,chokePointThroughput:Math.round(((h=o[m])==null?void 0:h.totalCapacity)??10)}}const c=o.TRACK.totalCapacity,r=o.LIT.totalCapacity;if(c<r&&c<40)return{category:"CAPACITY",title:"塗膠顯影 (Track) 先天物理產能瓶頸",stationName:"TRACK",description:`LITHO 曝光機正在空轉等待！【Track 塗膠顯影站】產能僅 ${Math.round(c)} 片/分，是產線最大卡點！`,recommendation:"光阻旋塗與烘烤受熱擴散物理限制，建議增購第 2 台 Track 機台或將其並聯綁定至微影機以分流消化產能！",workloadPercent:i,chokePointThroughput:Math.round(c)};let d="FILM",p=1/0;const u=["FILM","TRACK","LIT","ETCH","DIFF"];n&&u.push("CMP");for(const m of u)o[m].totalCapacity<p&&(p=o[m].totalCapacity,d=m);return p<=15?{category:"CAPACITY",title:"關鍵製程站點設備數量不足",stationName:d,description:`【${d} 站】產能僅 ${Math.round(p)} 片/分，遠低於其他站點，晶圓在門口嚴重堆積！`,recommendation:`建議前往商城增購第 2 台 ${d} 設備進行分流，或將現有機台升級為更高階型號。`,workloadPercent:i,chokePointThroughput:Math.round(p)}:!a.agv&&!a.oht&&s.length>=2?{category:"LOGISTICS",title:"人工手持搬運效率偏低",stationName:"AMHS 物流",description:"當前仍為「技術員手持晶圓盒步行搬運」，走動搬運耗時佔據了整個製程週期的 40% 以上！",recommendation:"投片量已超越人工負荷極限！強烈建議研發解鎖「地面 AGV 自走車」或「天花板 OHT 天軌」。",workloadPercent:i,chokePointThroughput:Math.round(p)}:{category:"LAYOUT",title:"機台動線規劃待最佳化",stationName:"廠房佈局",description:"前後站點相隔較遠，搬運載具在走道往返耗時過多，拉長了晶圓整體的傳送等待時間。",recommendation:"建議在廠房編輯模式中將相鄰製程機台（如 Track 與 Litho、Etch 與 Diff）就近排列，縮短傳送時間。",workloadPercent:i,chokePointThroughput:Math.round(p)}}static autoFillBestEconomyAllocation(t,e){const s=e.filter(l=>l.category==="LITHO");if(s.length===0)return[];const a=[...s].sort((l,c)=>{var p,u;const r=((p=P.OPTICAL_CATALOG[l.modelId])==null?void 0:p.baseRayleighLimitNm)??9999,d=((u=P.OPTICAL_CATALOG[c.modelId])==null?void 0:u.baseRayleighLimitNm)??9999;return r-d}),n=a[0],i=a[a.length-1],o=[];for(let l=1;l<=t.layerCount;l++){let c=l<=3,r=c?t.nodeNm:Math.max(t.nodeNm*2.5,350),d=c?n.modelId:i.modelId;o.push({layerIndex:l,layerType:c?"關鍵層 (Critical Layer)":"繞線層 (Metal Interconnect)",targetCD:Math.round(r),assignedMachineModelId:d})}return o}}g(E,"BASE_STATION_DURATION_SEC",{FILM:4,LIT:6,ETCH:4,DIFF:5,CMP:5}),g(E,"LIT_SUBSTEP_DURATION_SEC",{COAT:2,EXPOSE:2,DEVELOP:2}),g(E,"BASE_THROUGHPUT_BY_TIER",{LIT:{1:10,2:25,3:55,4:120,5:260,6:180},TRACK:{1:6,2:16,3:35,4:75,5:140,6:160},FILM:{1:12,2:24,3:50,4:110,5:220,6:200},ETCH:{1:12,2:24,3:50,4:110,5:220,6:200},DIFF:{1:10,2:20,3:45,4:100,5:200,6:180},CMP:{1:0,2:0,3:40,4:90,5:180,6:160}});class _{static getNodeSpec(t){return this.PRICING_TABLE.slice().reverse().find(s=>t<=s.nodeNm)||this.PRICING_TABLE[0]}static calculateUpfrontNRE(t,e,s=1){const a=this.getNodeSpec(t);return Math.round(a.baseNRE*e*s)}static calculateTrustMultiplier(t){if(t===null||isNaN(t))return 1;const e=.7+t*.5;return Math.max(.75,Math.min(1.25,Number(e.toFixed(3))))}static calculateUnitPrice(t,e,s,a){const n=this.getNodeSpec(t),i=1+(e-1)*.08,o=n.basePrice*i*s*a;return Number(o.toFixed(2))}static settleOrderPayout(t,e,s,a,n=0,i=0){const o=Math.max(0,Math.round(e*t.unitPrice-n));let l=0,c=i;if(c>0&&o>0){const p=a.reduce((h,m)=>h+m.salary,0)*1.5,u=s.cash+o;if(u>p){const h=u-p,m=Math.min(h*.25,o*.25);l=Math.min(c,Math.round(m)),c-=l}}const r=o-l;return{grossPayout:o,netPayout:r,debtDeducted:l,remainingDebt:c}}static calculateOverdueClawback(t,e,s=!1){const a=e-t.deadlineGameTime;return a<=0?{clawbackRatio:0,clawbackAmount:0,isCancelled:!1}:s&&a<=86400?{clawbackRatio:.1,clawbackAmount:Math.round(t.nrePaid*.1),isCancelled:!1}:a<=28800?{clawbackRatio:.3,clawbackAmount:Math.round(t.nrePaid*.3),isCancelled:!1}:a<=86400?{clawbackRatio:.7,clawbackAmount:Math.round(t.nrePaid*.7),isCancelled:!1}:{clawbackRatio:1,clawbackAmount:t.nrePaid,isCancelled:!0}}static generateContractBoard(t,e,s){const a=[],n=["聯發通訊","蘋果核心","輝達智能","高通晶創","超微運算","台積晶心","瑞昱音訊","博通網通"],i=this.PRICING_TABLE.filter(l=>l.minTier<=t),o=this.calculateTrustMultiplier(e);for(let l=0;l<6;l++){const c=i[Math.floor(Math.random()*i.length)],r=n[(l+Math.floor(Math.random()*5))%n.length],d=c.minTier<=2?3:5,p=c.minTier<=2?5:c.minTier<=4?12:24,u=Math.floor(Math.random()*(p-d+1))+d,h=[3,5,10,25][Math.floor(Math.random()*4)],m=c.nodeNm>=1e3?500:2e3,b=h*m,w=[1,1,1,1.2,1.5],C=w[Math.floor(Math.random()*w.length)],I=this.calculateUpfrontNRE(c.nodeNm,u,C),T=this.calculateUnitPrice(c.nodeNm,u,C,o),v=Math.round(u*30*h*.8/C+180),k=s+v;a.push({id:`ORD-${Date.now().toString(36).toUpperCase()}-${l}`,clientName:r,nodeNm:c.nodeNm,layerCount:u,totalDies:b,goodDiesDelivered:0,nrePaid:I,unitPrice:T,urgencyMultiplier:C,deadlineGameTime:k,status:"ACTIVE"})}return a}}g(_,"PRICING_TABLE",[{nodeNm:1e4,basePrice:2,baseNRE:8e4,minTier:1},{nodeNm:3e3,basePrice:4,baseNRE:18e4,minTier:1},{nodeNm:1e3,basePrice:6,baseNRE:4e5,minTier:2},{nodeNm:350,basePrice:10,baseNRE:9e5,minTier:3},{nodeNm:180,basePrice:18,baseNRE:2e6,minTier:3},{nodeNm:90,basePrice:40,baseNRE:55e5,minTier:4},{nodeNm:45,basePrice:80,baseNRE:15e6,minTier:4},{nodeNm:28,basePrice:200,baseNRE:45e6,minTier:5},{nodeNm:7,basePrice:600,baseNRE:16e7,minTier:6},{nodeNm:2,basePrice:1500,baseNRE:45e7,minTier:6}]);class z{constructor(t,e){g(this,"container");g(this,"callbacks");const s=document.getElementById(t);if(!s)throw new Error(`找不到 HUD 容器: #${t}`);this.container=s,this.callbacks=e}render(t){var c,r,d,p,u,h,m,b,w,C,I;const e=t.player,s=t.unlockedFeatures.cmp,a=t.rollingYieldHistory.length>0?t.rollingYieldHistory.slice(-5).reduce((T,M)=>T+M,0)/Math.min(5,t.rollingYieldHistory.length):null,n=_.calculateTrustMultiplier(a),i=E.calculateFactoryWorkload(t.machines,t.staff,t.activeLots,t.unlockedFeatures,s);let o="#10b981";i.workloadPercent>85?o="#ef4444":i.workloadPercent>=70&&(o="#f59e0b");const l=f.isAudioMuted();this.container.innerHTML=`
      <!-- 左側：創辦人與公司資訊 -->
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full border border-cyan-400/50 bg-slate-800 flex items-center justify-center text-xl shadow-inner">
          👤
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-slate-100 tracking-wide">${e.companyName}</span>
            <span class="text-xs px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-mono">
              Tier ${e.foundryTier}
            </span>
          </div>
          <div class="text-xs text-slate-400 flex items-center gap-2">
            <span>CEO: ${e.ceoName}</span>
            <span class="text-slate-600">|</span>
            <span class="text-emerald-400 font-mono text-[11px]">${e.unlockedCleanroomClass}</span>
          </div>
        </div>
      </div>

      <!-- 中間：核心營運三大 KPI 與工廠負荷進度條 -->
      <div class="flex items-center gap-6">
        <!-- 1. 現金 -->
        <div class="text-center">
          <div class="text-[11px] text-slate-400 font-medium">廠房資金 (Cash)</div>
          <div class="text-sm font-bold text-amber-400 font-mono tracking-tight">
            NT$ ${Math.round(e.cash).toLocaleString()}
          </div>
        </div>

        <!-- 2. 商譽 -->
        <div class="text-center">
          <div class="text-[11px] text-slate-400 font-medium">產業商譽</div>
          <div class="text-sm font-bold text-cyan-400 font-mono">
            ★ ${e.popularity}
          </div>
        </div>

        <!-- 3. 滾動良率指數 (RollingYieldIndex) -->
        <button id="btn-hud-yield" class="text-center relative group cursor-pointer hover:bg-slate-800/80 px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30" title="點擊檢視 25 晶粒蒙地卡羅良率晶圓圖 (Wafer Map)">
          <div class="text-[11px] text-slate-400 font-medium flex items-center gap-1 justify-center">
            <span>品質良率</span>
            <span class="text-[10px] text-cyan-400">🔍</span>
          </div>
          <div class="text-sm font-bold font-mono ${a&&a>=.9?"text-emerald-400":"text-amber-400"}">
            ${a!==null?`${(a*100).toFixed(1)}%`:"N/A"}
            <span class="text-[10px] text-slate-400 font-normal">(${n.toFixed(2)}x)</span>
          </div>
        </button>

        <!-- 4. 工廠負荷量 Workload % 與 🔴 紅色警報驚嘆號 -->
        <div class="flex items-center gap-2.5">
          <div>
            <div class="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
              <span>產線負荷 (Workload)</span>
              <span class="font-mono text-slate-200">${i.workloadPercent}%</span>
            </div>
            <div class="w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
              <div style="width: ${Math.min(100,i.workloadPercent)}%; background-color: ${o};" class="h-full transition-all duration-300"></div>
            </div>
          </div>

          ${i.workloadPercent>85?`<button id="btn-advisory-alert" class="w-8 h-8 rounded-full bg-red-600/90 text-white font-black text-sm flex items-center justify-center border-2 border-red-400 pulse-alert shadow-lg cursor-pointer hover:bg-red-500" title="產線超載嚴重！點擊查看瓶頸診斷">
                  !
                </button>`:""}
        </div>
      </div>

      <!-- 右側：功能導航按鈕群 -->
      <div class="flex items-center gap-2">
        <!-- MES 自動派工開關 -->
        <button id="btn-toggle-mes" class="btn-sci-fi text-xs ${t.unlockedFeatures.mesAutoDispatch?"border-emerald-500/80 text-emerald-300":"opacity-60"}">
          ${t.unlockedFeatures.mesAutoDispatch?"🤖 MES自動":"⏸️ MES關閉"}
        </button>

        <!-- 合約板 -->
        <button id="btn-contracts" class="btn-sci-fi">
          📜 合約
        </button>

        <!-- 商城 -->
        <button id="btn-store" class="btn-sci-fi">
          🏬 商城
        </button>

        <!-- 人資 -->
        <button id="btn-hr" class="btn-sci-fi">
          👥 人資
        </button>

        <!-- 每日任務 -->
        <button id="btn-quests" class="btn-sci-fi relative">
          📋 任務
          ${t.questState.dailyQuests.some(T=>T.completed&&!T.claimed)?'<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400"></span>':""}
        </button>

        <!-- 成就 -->
        <button id="btn-achievements" class="btn-sci-fi relative">
          🏆 成就
          ${t.achievements.some(T=>T.unlocked&&!T.claimed)?'<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400"></span>':""}
        </button>

        <!-- 新手教學引導 -->
        <button id="btn-tutorial" class="btn-sci-fi px-2.5" title="新手入門指引與半導體製程教學">
          ❓
        </button>

        <!-- 靜音開關 -->
        <button id="btn-sound" class="btn-sci-fi px-2.5" title="音效切換">
          ${l?"🔇":"🔊"}
        </button>

        <!-- 存檔 -->
        <button id="btn-save" class="btn-sci-fi px-2.5" title="存檔與匯出">
          💾
        </button>
      </div>
    `,(c=document.getElementById("btn-contracts"))==null||c.addEventListener("click",()=>{f.playClick(),this.callbacks.onOpenContracts()}),(r=document.getElementById("btn-store"))==null||r.addEventListener("click",()=>{f.playClick(),this.callbacks.onOpenStore()}),(d=document.getElementById("btn-hr"))==null||d.addEventListener("click",()=>{f.playClick(),this.callbacks.onOpenHR()}),(p=document.getElementById("btn-quests"))==null||p.addEventListener("click",()=>{f.playClick(),this.callbacks.onOpenQuests()}),(u=document.getElementById("btn-achievements"))==null||u.addEventListener("click",()=>{f.playClick(),this.callbacks.onOpenAchievements()}),(h=document.getElementById("btn-advisory-alert"))==null||h.addEventListener("click",()=>{f.playClick(),this.callbacks.onOpenAdvisory()}),(m=document.getElementById("btn-toggle-mes"))==null||m.addEventListener("click",()=>{f.playClick();const T=!t.unlockedFeatures.mesAutoDispatch;t.unlockedFeatures.mesAutoDispatch=T,this.callbacks.onToggleMES(T),this.render(t)}),(b=document.getElementById("btn-hud-yield"))==null||b.addEventListener("click",()=>{var T,M;f.playClick(),(M=(T=this.callbacks).onOpenWaferMap)==null||M.call(T)}),(w=document.getElementById("btn-tutorial"))==null||w.addEventListener("click",()=>{var T,M;f.playClick(),(M=(T=this.callbacks).onOpenTutorial)==null||M.call(T)}),(C=document.getElementById("btn-sound"))==null||C.addEventListener("click",()=>{f.toggleMute(),f.playClick(),this.render(t)}),(I=document.getElementById("btn-save"))==null||I.addEventListener("click",()=>{f.playClick(),this.callbacks.onOpenSaveModal()})}}class G{static show(t,e){const s=document.getElementById("modal-container");if(!s)return;let a="avatar_1";const n=()=>{var i,o,l;s.innerHTML=`
        <div class="modal-backdrop">
          <div class="modal-content glass-panel glass-panel-glow text-slate-100 max-w-xl">
            <!-- 標題 -->
            <div class="text-center mb-6">
              <div class="inline-block px-3 py-1 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-xs font-mono mb-2">
                FOUNDRY ESTABLISHMENT PROTOCOL
              </div>
              <h2 class="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-400">
                創立你的半導體晶圓帝國
              </h2>
              <p class="text-xs text-slate-400 mt-1">
                制定企業願景與創辦人身份，開啟從微米到埃米的矽島霸權之路！
              </p>
            </div>

            <!-- 表單內容 -->
            <div class="space-y-4 text-sm">
              <!-- 公司名稱 -->
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">
                  晶圓製造公司名稱 (Company Name)
                </label>
                <div class="flex gap-2">
                  <input
                    id="setup-company-name"
                    type="text"
                    value="${t.player.companyName}"
                    class="flex-1 px-3 py-2 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-white focus:outline-none focus:border-cyan-400 text-sm font-medium"
                    placeholder="輸入你的晶圓廠名稱..."
                  />
                  <button id="btn-random-company" class="btn-sci-fi px-3 text-base" title="隨機擲骰企業名">
                    🎲
                  </button>
                </div>
              </div>

              <!-- 創辦人姓名 -->
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">
                  創辦人 / CEO 姓名 (CEO Name)
                </label>
                <div class="flex gap-2">
                  <input
                    id="setup-ceo-name"
                    type="text"
                    value="${t.player.ceoName}"
                    class="flex-1 px-3 py-2 rounded-lg bg-slate-900/90 border border-cyan-500/30 text-white focus:outline-none focus:border-cyan-400 text-sm font-medium"
                    placeholder="輸入創辦人姓名..."
                  />
                  <button id="btn-random-ceo" class="btn-sci-fi px-3 text-base" title="隨機擲骰CEO名">
                    🎲
                  </button>
                </div>
              </div>

              <!-- CEO 頭像選擇 -->
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-2">
                  選擇創辦人領袖形象 (Avatar Selection)
                </label>
                <div class="grid grid-cols-6 gap-2">
                  ${[{id:"avatar_1",icon:"👨‍💼",label:"產業領袖"},{id:"avatar_2",icon:"👩‍💼",label:"營運長"},{id:"avatar_3",icon:"👨‍🔬",label:"黃光院士"},{id:"avatar_4",icon:"👩‍🔬",label:"材料博士"},{id:"avatar_5",icon:"🧑‍💻",label:"製程先鋒"},{id:"avatar_6",icon:"🤖",label:"AI晶片狂"}].map(c=>`
                    <button
                      class="avatar-card p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${a===c.id?"border-cyan-400 bg-cyan-950/60 shadow-lg shadow-cyan-500/30 scale-105":"border-slate-800 bg-slate-900/50 hover:border-slate-600"}"
                      data-avatar-id="${c.id}"
                    >
                      <span class="text-2xl">${c.icon}</span>
                      <span class="text-[10px] text-slate-300">${c.label}</span>
                    </button>
                  `).join("")}
                </div>
              </div>

              <!-- 開局資本與無塵室起點 -->
              <div class="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex justify-between items-center text-xs text-slate-400">
                <div>
                  初始啟動資金：<span class="text-amber-400 font-bold font-mono">NT$ 50,000,000</span>
                </div>
                <div>
                  初始潔淨室：<span class="text-emerald-400 font-bold">Class 10000 (Bay 1)</span>
                </div>
              </div>
            </div>

            <!-- 確認按鈕 -->
            <div class="mt-6 flex justify-end">
              <button id="btn-submit-foundry" class="btn-sci-fi px-6 py-2.5 text-sm w-full justify-center bg-cyan-600 hover:bg-cyan-500 font-bold tracking-wider">
                🚀 成立晶圓廠，締造矽島傳奇！
              </button>
            </div>
          </div>
        </div>
      `,(i=document.getElementById("btn-random-company"))==null||i.addEventListener("click",()=>{f.playClick();const c=this.RANDOM_COMPANIES[Math.floor(Math.random()*this.RANDOM_COMPANIES.length)],r=document.getElementById("setup-company-name");r&&(r.value=c)}),(o=document.getElementById("btn-random-ceo"))==null||o.addEventListener("click",()=>{f.playClick();const c=this.RANDOM_CEOS[Math.floor(Math.random()*this.RANDOM_CEOS.length)],r=document.getElementById("setup-ceo-name");r&&(r.value=c)}),document.querySelectorAll(".avatar-card").forEach(c=>{c.addEventListener("click",r=>{f.playClick();const d=r.currentTarget.getAttribute("data-avatar-id");d&&(a=d,n())})}),(l=document.getElementById("btn-submit-foundry"))==null||l.addEventListener("click",()=>{const c=document.getElementById("setup-company-name"),r=document.getElementById("setup-ceo-name"),d=(c==null?void 0:c.value.trim())||"矽島先進積體電路",p=(r==null?void 0:r.value.trim())||"張創辦人";t.player.companyName=d,t.player.ceoName=p,t.player.avatarId=a,f.playSuccess(),s.innerHTML="",e(t.player)})};n()}}g(G,"RANDOM_COMPANIES",["矽島先進積體電路","台積微系統","聯華微電科技","世界微晶圓","美光矽島半導體","瑞昱微系統","聯詠積體科技","旺宏微晶科技"]),g(G,"RANDOM_CEOS",["張忠謨","劉德音","魏哲家","曹興成","黃仁勳","蘇姿丰","蔡力行","梁孟松"]);class Q{static show(t,e,s){var p,u,h,m;const a=document.getElementById("modal-container");if(!a)return;const n=t.unlockedFeatures.cmp,i=E.diagnoseBottleneck(t.machines,t.staff,t.activeLots,t.unlockedFeatures,n),{workloadPercent:o,throughputs:l}=E.calculateFactoryWorkload(t.machines,t.staff,t.activeLots,t.unlockedFeatures,n);let c="bg-red-950 text-red-400 border-red-500/50",r="⚠️";i.category==="MAINTENANCE"?(c="bg-amber-950 text-amber-400 border-amber-500/50",r="🔧"):i.category==="LOGISTICS"?(c="bg-cyan-950 text-cyan-400 border-cyan-500/50",r="🚛"):i.category==="LAYOUT"&&(c="bg-purple-950 text-purple-400 border-purple-500/50",r="📐"),a.innerHTML=`
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-2xl text-slate-100">
          <!-- 頂部標題與關閉鈕 -->
          <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/60">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${r}</span>
              <div>
                <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2">
                  智能瓶頸診斷與產線優化顧問
                  <span class="text-xs px-2 py-0.5 rounded-full border ${c} font-mono">
                    ${i.category}
                  </span>
                </h3>
                <p class="text-xs text-slate-400">
                  全廠即時在製排隊、機台處理速度與 Q-Time 逾期風險評估
                </p>
              </div>
            </div>
            <button id="btn-close-advisory" class="text-slate-400 hover:text-white text-xl p-1 font-mono">
              ✕
            </button>
          </div>

          <!-- 當前產線負荷健康狀態 -->
          <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 mb-4 flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-400 font-medium">當前產線負荷百分比 (Workload)</div>
              <div class="text-2xl font-black font-mono ${o>85?"text-red-400":"text-amber-400"}">
                ${o}%
                <span class="text-xs font-normal text-slate-400">
                  ${o>85?"(嚴重超載塞車中，排隊即將突破 Q-Time 容許上限！)":"(負載偏高)"}
                </span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-xs text-slate-400">最大有效承載量 (瓶頸站)</div>
              <div class="text-sm font-bold font-mono text-cyan-300">
                ${i.chokePointThroughput} 片晶圓 / 分鐘
              </div>
            </div>
          </div>

          <!-- 核心診斷結果 (大白話分析) -->
          <div class="p-4 rounded-xl bg-red-950/30 border border-red-500/40 mb-4">
            <div class="text-xs font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span>● 診斷出之致命卡點：</span>
              <span>${i.title}</span>
            </div>
            <p class="text-sm text-slate-200 leading-relaxed">
              ${i.description}
            </p>
          </div>

          <!-- 系統改良建議對策 -->
          <div class="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 mb-5">
            <div class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
              💡 系統精確改良對策：
            </div>
            <p class="text-sm text-slate-200 font-medium leading-relaxed">
              ${i.recommendation}
            </p>
          </div>

          <!-- 各站點產能即時分佈對比 -->
          <div class="mb-5">
            <div class="text-xs font-bold text-slate-300 mb-2">全廠六大站點實效產能對比 (晶圓/分)：</div>
            <div class="grid grid-cols-6 gap-2">
              ${Object.values(l).map(b=>`
                <div class="p-2 rounded-lg bg-slate-900/60 border ${b.isChokePoint?"border-red-500/80 bg-red-950/20":"border-slate-800"} text-center">
                  <div class="text-[11px] font-bold ${b.isChokePoint?"text-red-400":"text-slate-300"}">
                    ${b.station} ${b.isChokePoint?"⚠️":""}
                  </div>
                  <div class="text-xs font-mono font-bold text-slate-100 mt-1">
                    ${Math.round(b.totalCapacity)} 片/分
                  </div>
                  <div class="text-[10px] text-slate-400">
                    ${b.machineCount} 台設備
                  </div>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- 底部快捷按鈕 -->
          <div class="flex justify-end gap-3 pt-3 border-t border-slate-700/60">
            ${i.category==="CAPACITY"&&e?`<button id="btn-advisory-store" class="btn-sci-fi bg-cyan-600 hover:bg-cyan-500 font-bold">
                    🛒 前往商城增購設備分流
                  </button>`:""}
            ${i.category==="MAINTENANCE"&&s?`<button id="btn-advisory-hr" class="btn-sci-fi bg-amber-600 hover:bg-amber-500 font-bold">
                    🔧 前往人資指派維修保養
                  </button>`:""}
            <button id="btn-advisory-ok" class="btn-sci-fi px-5">
              我知道了
            </button>
          </div>
        </div>
      </div>
    `;const d=()=>{f.playClick(),a.innerHTML=""};(p=document.getElementById("btn-close-advisory"))==null||p.addEventListener("click",d),(u=document.getElementById("btn-advisory-ok"))==null||u.addEventListener("click",d),(h=document.getElementById("btn-advisory-store"))==null||h.addEventListener("click",()=>{d(),e&&e()}),(m=document.getElementById("btn-advisory-hr"))==null||m.addEventListener("click",()=>{d(),s&&s()})}}class A{static refreshDailyQuests(t,e,s,a){if(t.lastDateStr===a&&t.dailyQuests.length===3)return t;const n=e.foundryTier,i=[0,6e4,18e4,45e4,12e5,35e5,12e6][n]??6e4,o=[],l=n===1?5:n===2?15:n===3?30:n===4?60:100;o.push({id:`quest_produce_${a}`,title:"穩定投片交付產出",description:`完成出貨累計 ${l} 片合格晶圓至客戶端。`,tier:n,currentValue:0,targetValue:l,rewardCash:i,rewardPopularity:3,completed:!1,claimed:!1}),n>=3&&s.cmp?o.push({id:`quest_cmp_operation_${a}`,title:"平坦化製程精進",description:"成功執行 5 次 CMP 化學機械平坦化拋光研磨。",tier:n,currentValue:0,targetValue:5,rewardCash:Math.round(i*1.2),rewardPopularity:4,completed:!1,claimed:!1}):o.push({id:`quest_maintain_fab_${a}`,title:"廠務設備巡檢維護",description:"指派工程師對機台進行保養或維持機台健康度在 90% 以上。",tier:n,currentValue:0,targetValue:2,rewardCash:i,rewardPopularity:3,completed:!1,claimed:!1});const c=n<=2?2:3;return o.push({id:`quest_order_fulfill_${a}`,title:"光罩合約履約達成",description:`順利交貨並履約 ${c} 筆晶圓製造合約，取得全額尾款。`,tier:n,currentValue:0,targetValue:c,rewardCash:Math.round(i*1.5),rewardPopularity:5,completed:!1,claimed:!1}),{lastDateStr:a,dailyQuests:o,allDailyClaimed:!1,weeklyCompletedCount:t.weeklyCompletedCount??0,weeklyTarget:15,weeklyClaimed:t.weeklyClaimed??!1}}static onWaferDelivered(t,e){for(const s of t.dailyQuests)s.id.startsWith("quest_produce")&&!s.completed&&(s.currentValue+=e,s.currentValue>=s.targetValue&&(s.currentValue=s.targetValue,s.completed=!0))}static onOrderFulfilled(t){for(const e of t.dailyQuests)e.id.startsWith("quest_order_fulfill")&&!e.completed&&(e.currentValue+=1,e.currentValue>=e.targetValue&&(e.currentValue=e.targetValue,e.completed=!0))}static onMachineMaintained(t){for(const e of t.dailyQuests)e.id.startsWith("quest_maintain_fab")&&!e.completed&&(e.currentValue+=1,e.currentValue>=e.targetValue&&(e.currentValue=e.targetValue,e.completed=!0))}static onCmpProcessed(t){for(const e of t.dailyQuests)e.id.startsWith("quest_cmp_operation")&&!e.completed&&(e.currentValue+=1,e.currentValue>=e.targetValue&&(e.currentValue=e.targetValue,e.completed=!0))}static isAllDailyCompleted(t){return t.dailyQuests.length!==3?!1:t.dailyQuests.every(e=>e.completed)}static claimSingleQuest(t,e){const s=t.dailyQuests.find(a=>a.id===e);return s?s.completed?s.claimed?{success:!1,cash:0,popularity:0,message:"該任務獎勵已領取"}:(s.claimed=!0,{success:!0,cash:s.rewardCash,popularity:s.rewardPopularity,message:`領取成功！獲得獎勵金 NT$ ${s.rewardCash.toLocaleString()} 與商譽 +${s.rewardPopularity}！`}):{success:!1,cash:0,popularity:0,message:"該任務尚未達成目標"}:{success:!1,cash:0,popularity:0,message:"找不到該任務"}}static claimDailyAllClear(t,e){if(!this.isAllDailyCompleted(t))return{success:!1,cash:0,popularity:0,message:"尚有每日任務未完成，無法領取全勤特獎"};if(t.allDailyClaimed)return{success:!1,cash:0,popularity:0,message:"今日全勤特獎已經領取過囉"};t.allDailyClaimed=!0,t.weeklyCompletedCount=Math.min(21,(t.weeklyCompletedCount??0)+3);const s=[0,15e4,45e4,12e5,3e6,8e6,25e6][e]??15e4,a=10;return{success:!0,cash:s,popularity:a,message:`🎉 達成今日 3/3 全勤！獲得全勤特獎 NT$ ${s.toLocaleString()}、商譽 +${a}，每週任務進度累計 +3！`}}static claimWeeklyBounty(t,e){if(t.weeklyCompletedCount<t.weeklyTarget)return{success:!1,cash:0,popularity:0,message:`每週任務尚未達標！目前進度 ${t.weeklyCompletedCount}/${t.weeklyTarget}`};if(t.weeklyClaimed)return{success:!1,cash:0,popularity:0,message:"本週龍頭週大獎已領取過囉"};t.weeklyClaimed=!0;const s=[0,1e6,3e6,8e6,2e7,6e7,2e8][e]??1e6,a=30;return{success:!0,cash:s,popularity:a,message:`🏆 榮膺半導體龍頭週大獎！領取巨額扶持金 NT$ ${s.toLocaleString()} 與商譽 +${a}！全廠客戶信任度提升！`}}}class U{static show(t,e){const s=document.getElementById("modal-container");if(!s)return;const a=()=>{var o,l,c;const n=t.questState,i=A.isAllDailyCompleted(n);s.innerHTML=`
        <div class="modal-backdrop">
          <div class="modal-content glass-panel glass-panel-glow max-w-2xl text-slate-100">
            <!-- 標題 -->
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/60">
              <div class="flex items-center gap-3">
                <span class="text-2xl">📋</span>
                <div>
                  <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2">
                    每日營運任務與產業龍頭週賞
                    <span class="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-mono">
                      Tier ${t.player.foundryTier} 專屬適配
                    </span>
                  </h3>
                  <p class="text-xs text-slate-400">
                    每日 00:00 自動刷新任務目標，完成全勤特獎與每週 15 任務領取巨額補助金！
                  </p>
                </div>
              </div>
              <button id="btn-close-quests" class="text-slate-400 hover:text-white text-xl p-1 font-mono">
                ✕
              </button>
            </div>

            <!-- 每日 3 任務清單 -->
            <div class="space-y-3 mb-5">
              <div class="text-xs font-bold text-slate-300 uppercase tracking-wider flex justify-between">
                <span>今日指派任務 (3項)：</span>
                <span class="font-mono text-cyan-400">
                  ${n.dailyQuests.filter(r=>r.completed).length}/3 已達成
                </span>
              </div>

              ${n.dailyQuests.map(r=>{const d=Math.min(100,Math.round(r.currentValue/r.targetValue*100));return`
                    <div class="p-3.5 rounded-xl bg-slate-900/70 border ${r.completed?"border-emerald-500/50 bg-emerald-950/20":"border-slate-800"} flex items-center justify-between gap-4">
                      <div class="flex-1">
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-bold text-slate-100">${r.title}</span>
                          ${r.completed?'<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300">已達成</span>':""}
                        </div>
                        <p class="text-xs text-slate-400 mt-0.5">${r.description}</p>
                        
                        <!-- 進度條 -->
                        <div class="flex items-center gap-2 mt-2">
                          <div class="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div style="width: ${d}%" class="h-full bg-cyan-400"></div>
                          </div>
                          <span class="text-[11px] font-mono text-slate-300">${r.currentValue}/${r.targetValue}</span>
                        </div>
                      </div>

                      <!-- 獎勵與按鈕 -->
                      <div class="text-right flex flex-col items-end gap-1.5 min-w-[120px]">
                        <div class="text-xs font-bold font-mono text-amber-400">
                          +NT$ ${r.rewardCash.toLocaleString()}
                        </div>
                        <div class="text-[10px] text-cyan-300">
                          商譽 +${r.rewardPopularity}
                        </div>

                        ${r.claimed?'<span class="text-xs px-3 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">已領取</span>':r.completed?`<button class="btn-claim-quest btn-sci-fi bg-emerald-600 hover:bg-emerald-500 text-xs py-1 px-3" data-id="${r.id}">
                                領取獎勵
                              </button>`:`<button class="btn-sci-fi text-xs py-1 px-3 opacity-50 cursor-not-allowed" disabled>
                                進行中
                              </button>`}
                      </div>
                    </div>
                  `}).join("")}
            </div>

            <!-- 每日全勤特獎 (3/3) -->
            <div class="p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/40 mb-4 flex items-center justify-between">
              <div>
                <div class="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <span>🎉 每日全勤特獎 (3/3)</span>
                  ${n.allDailyClaimed?'<span class="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900 text-cyan-300">今日已領</span>':""}
                </div>
                <p class="text-xs text-slate-300 mt-0.5">
                  今日 3 項任務全部達成時解鎖，獲得高額津貼補助與每週任務次數 +3！
                </p>
              </div>

              ${n.allDailyClaimed?'<span class="text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-400 border border-slate-700">已領取</span>':i?`<button id="btn-claim-all-daily" class="btn-sci-fi bg-cyan-600 hover:bg-cyan-500 text-xs py-1.5 px-4 font-bold shadow-lg shadow-cyan-500/30">
                      領取全勤特獎
                    </button>`:'<span class="text-xs text-slate-500">尚有任務未達標</span>'}
            </div>

            <!-- 每週 15 任務龍頭週大獎 (Weekly Mega Bounty) -->
            <div class="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/40 flex items-center justify-between">
              <div>
                <div class="text-sm font-bold text-purple-300 flex items-center gap-2">
                  <span>🏆 每週 15 任務龍頭週大獎</span>
                  <span class="text-xs font-mono text-purple-400">
                    (${n.weeklyCompletedCount}/${n.weeklyTarget})
                  </span>
                </div>
                <p class="text-xs text-slate-300 mt-0.5">
                  一週內累計完成 15 次營運任務，領取海量現金補助與全廠客戶信任 Buff！
                </p>
              </div>

              ${n.weeklyClaimed?'<span class="text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-400 border border-slate-700">本週已領</span>':n.weeklyCompletedCount>=n.weeklyTarget?`<button id="btn-claim-weekly" class="btn-sci-fi bg-purple-600 hover:bg-purple-500 text-xs py-1.5 px-4 font-bold shadow-lg shadow-purple-500/30">
                      領取龍頭大獎
                    </button>`:`<span class="text-xs text-slate-500 font-mono">還需 ${Math.max(0,n.weeklyTarget-n.weeklyCompletedCount)} 項</span>`}
            </div>
          </div>
        </div>
      `,(o=document.getElementById("btn-close-quests"))==null||o.addEventListener("click",()=>{f.playClick(),s.innerHTML=""}),document.querySelectorAll(".btn-claim-quest").forEach(r=>{r.addEventListener("click",d=>{const p=d.currentTarget.getAttribute("data-id");if(p){const u=A.claimSingleQuest(t.questState,p);u.success&&(t.player.cash+=u.cash,t.player.popularity+=u.popularity,f.playCoin(),a(),e())}})}),(l=document.getElementById("btn-claim-all-daily"))==null||l.addEventListener("click",()=>{const r=A.claimDailyAllClear(t.questState,t.player.foundryTier);r.success&&(t.player.cash+=r.cash,t.player.popularity+=r.popularity,f.playSuccess(),a(),e())}),(c=document.getElementById("btn-claim-weekly"))==null||c.addEventListener("click",()=>{const r=A.claimWeeklyBounty(t.questState,t.player.foundryTier);r.success&&(t.player.cash+=r.cash,t.player.popularity+=r.popularity,f.playSuccess(),a(),e())})};a()}}class q{static show(t,e){const s=document.getElementById("modal-container");if(!s)return;S.checkAchievements(t);const a=()=>{var c;const n=t.achievements,i=n.filter(r=>r.category===this.activeCategory),o=n.filter(r=>r.unlocked).length,l=[{key:"onboarding",label:"新手入門",icon:"🚀"},{key:"process",label:"製程突破",icon:"🔬"},{key:"operation",label:"廠務卓越",icon:"🛡️"},{key:"yield",label:"品質良率",icon:"💎"}];s.innerHTML=`
        <div class="modal-backdrop">
          <div class="modal-content glass-panel glass-panel-glow max-w-3xl text-slate-100">
            <!-- 頂部標題 -->
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-700/60">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🏆</span>
                <div>
                  <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2">
                    半導體傳奇成就榮譽榜
                    <span class="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40 font-mono">
                      ${o}/16 已達成
                    </span>
                  </h3>
                  <p class="text-xs text-slate-400">
                    見證從微米接觸式微影到埃米 High-NA EUV 的矽島稱霸歷史！
                  </p>
                </div>
              </div>
              <button id="btn-close-achievements" class="text-slate-400 hover:text-white text-xl p-1 font-mono">
                ✕
              </button>
            </div>

            <!-- 分類標籤頁 (Tabs) -->
            <div class="flex gap-2 mb-4">
              ${l.map(r=>`
                <button
                  class="btn-tab px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${this.activeCategory===r.key?"bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400":"bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"}"
                  data-cat="${r.key}"
                >
                  <span>${r.icon}</span>
                  <span>${r.label}</span>
                  <span class="text-[10px] font-mono opacity-80">
                    (${n.filter(d=>d.category===r.key&&d.unlocked).length}/${n.filter(d=>d.category===r.key).length})
                  </span>
                </button>
              `).join("")}
            </div>

            <!-- 成就清單 -->
            <div class="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              ${i.map(r=>`
                <div class="p-4 rounded-xl bg-slate-900/70 border ${r.unlocked?"border-cyan-500/50 bg-cyan-950/20 shadow-md shadow-cyan-500/10":"border-slate-800/80 opacity-65"} flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3.5">
                    <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl border ${r.unlocked?"bg-cyan-950/80 border-cyan-400/60 shadow-inner":"bg-slate-800/60 border-slate-700 text-slate-600"}">
                      ${r.unlocked?"🎖️":"🔒"}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="text-sm font-bold ${r.unlocked?"text-slate-100":"text-slate-400"}">
                          ${r.title}
                        </span>
                        ${r.unlocked?'<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">已達成</span>':""}
                      </div>
                      <p class="text-xs text-slate-400 mt-1">${r.description}</p>
                    </div>
                  </div>

                  <!-- 獎勵金與領取按鈕 -->
                  <div class="text-right flex flex-col items-end gap-1.5 min-w-[130px]">
                    <div class="text-xs font-bold font-mono text-amber-400">
                      +NT$ ${r.rewardCash.toLocaleString()}
                    </div>
                    ${r.claimed?'<span class="text-xs px-3 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">獎勵已領</span>':r.unlocked?`<button class="btn-claim-ach btn-sci-fi bg-emerald-600 hover:bg-emerald-500 text-xs py-1 px-3 font-bold" data-id="${r.id}">
                            領取獎勵金
                          </button>`:'<span class="text-xs text-slate-500 font-mono">條件未滿足</span>'}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      `,(c=document.getElementById("btn-close-achievements"))==null||c.addEventListener("click",()=>{f.playClick(),s.innerHTML=""}),document.querySelectorAll(".btn-tab").forEach(r=>{r.addEventListener("click",d=>{f.playClick();const p=d.currentTarget.getAttribute("data-cat");p&&(this.activeCategory=p,a())})}),document.querySelectorAll(".btn-claim-ach").forEach(r=>{r.addEventListener("click",d=>{const p=d.currentTarget.getAttribute("data-id");if(p){const u=S.claimReward(t.achievements,p);u.success&&(t.player.cash+=u.cash,f.playCoin(),a(),e())}})})};a()}}g(q,"activeCategory","onboarding");class Y{static calculateRollingYieldIndex(t){if(!t||t.length===0)return null;const e=t.slice(-5),a=e.reduce((n,i)=>n+i,0)/e.length;return Number(a.toFixed(4))}static calculateLayerYield(t=1,e=0,s=0){let a=.985*t*(1-e)+s;return Math.max(.7,Math.min(.999,a))}static calculateFinalLotYield(t,e=0){if(t.status==="SCRAPPED")return 0;let s=1;for(let a=0;a<t.totalLayers;a++)s*=this.calculateLayerYield(1,e,0);return s*=t.yieldMultiplier||1,Number(Math.max(0,Math.min(1,s)).toFixed(4))}static generateWaferMap(t){const e=[],n=Math.sqrt(8);for(let i=0;i<5;i++)for(let o=0;o<5;o++){const l=i*5+o,c=Math.sqrt((i-2)**2+(o-2)**2),r=c/n,d=1.1-r*.4,p=Math.min(.99,t*d),u=Math.random()<p;e.push({index:l,row:i,col:o,distanceFromCenter:Number(c.toFixed(2)),passed:u,defectType:u?void 0:r>.6?"OPTICAL_DEFOCUS":"PARTICLE"})}for(let i=0;i<e.length;i++)if(!e[i].passed&&Math.random()<.4){const o=e.filter(l=>Math.abs(l.row-e[i].row)<=1&&Math.abs(l.col-e[i].col)<=1&&l.index!==e[i].index);if(o.length>0){const l=o[Math.floor(Math.random()*o.length)];l.passed=!1,l.defectType="CLUSTER"}}return e}}class O{static show(t,e,s){const a=document.getElementById("modal-container");if(!a)return;this.currentLot=e||(t.activeLots.length>0?t.activeLots[0]:null);const n=this.currentLot?this.currentLot.yieldMultiplier:t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((i,o)=>i+o,0)/t.rollingYieldHistory.length:.92;this.dies=Y.generateWaferMap(n),this.selectedDie=this.dies[12]||this.dies[0],this.render(a,t,s)}static render(t,e,s){const a=this.dies.filter(d=>d.passed).length,n=this.dies.length-a,i=(a/this.dies.length*100).toFixed(1),o=this.dies.filter(d=>d.defectType==="CLUSTER").length,l=this.dies.filter(d=>d.defectType==="PARTICLE").length,c=this.dies.filter(d=>d.defectType==="OPTICAL_DEFOCUS").length,r=e.rollingYieldHistory.length>0?(e.rollingYieldHistory.reduce((d,p)=>d+p,0)/e.rollingYieldHistory.length*100).toFixed(1)+"%":"N/A";t.innerHTML=`
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-3xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden animate-fadeIn">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/70">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xl">
                🔬
              </div>
              <div>
                <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <span>蒙地卡羅晶圓良率檢測圖 (Wafer Map Inspector)</span>
                  ${this.currentLot?`
                    <span class="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                      批次: ${this.currentLot.lotId}
                    </span>
                  `:""}
                </h3>
                <p class="text-xs text-slate-400">
                  全晶圓 25 晶粒蒙地卡羅同心圓徑向良率梯度與區域群聚缺陷分析
                </p>
              </div>
            </div>

            <button id="btn-close-wafer-map" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors">
              ✕
            </button>
          </div>

          <!-- Body Grid (Wafer Left, Stats Right) -->
          <div class="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-center text-xs">
            
            <!-- Left: Circular Wafer Silicon Disc -->
            <div class="flex flex-col items-center justify-center space-y-3">
              <div class="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-cyan-950 border-4 border-cyan-500/30 shadow-2xl p-6 flex items-center justify-center group">
                
                <!-- Rainbow Silicon Sheen Reflection -->
                <div class="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400/5 via-fuchsia-400/5 to-amber-400/5 pointer-events-none"></div>

                <!-- Bottom Notch (晶圓定位缺口) -->
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-slate-950 border-t border-cyan-400/50 rounded-t-sm"></div>

                <!-- 5x5 Die Grid -->
                <div class="grid grid-cols-5 gap-2 w-full h-full relative z-10 p-2">
                  ${this.dies.map(d=>{var m;const p=((m=this.selectedDie)==null?void 0:m.index)===d.index;let u="bg-emerald-500 hover:bg-emerald-400 border-emerald-300/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]",h="✓";return d.passed||(d.defectType==="CLUSTER"?(u="bg-red-600 hover:bg-red-500 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.7)]",h="✕"):d.defectType==="OPTICAL_DEFOCUS"?(u="bg-amber-500 hover:bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]",h="⚠"):(u="bg-purple-600 hover:bg-purple-500 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]",h="●")),`
                      <button
                        class="btn-wafer-die rounded-md border text-xs font-bold text-white transition-all transform hover:scale-110 flex items-center justify-center font-mono ${u} ${p?"ring-2 ring-white scale-105":""}"
                        data-index="${d.index}"
                        title="Die [${d.row}, ${d.col}] - ${d.passed?"合格":"失效: "+d.defectType}"
                      >
                        ${h}
                      </button>
                    `}).join("")}
                </div>
              </div>

              <div class="text-[11px] text-slate-400 flex items-center gap-3">
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-emerald-500"></span> 合格晶粒</span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-red-600"></span> 群聚缺陷</span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-amber-500"></span> 邊緣離焦</span>
                <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-purple-600"></span> 潔淨落塵</span>
              </div>
            </div>

            <!-- Right: Die Telemetry & Statistics -->
            <div class="space-y-4">
              
              <!-- Metrics Cards -->
              <div class="grid grid-cols-2 gap-2.5 font-mono">
                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div class="text-[10px] text-slate-400">當前晶圓良率</div>
                  <div class="text-xl font-bold ${Number(i)>=90?"text-emerald-400":"text-amber-400"}">
                    ${i}%
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">
                    合格: ${a} / 失效: ${n}
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div class="text-[10px] text-slate-400">全廠滑動良率指數</div>
                  <div class="text-xl font-bold text-cyan-300">
                    ${r}
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">
                    5 批次滑動窗口
                  </div>
                </div>
              </div>

              <!-- Selected Die Root-Cause Analysis -->
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div class="font-bold text-white flex items-center justify-between">
                  <span class="flex items-center gap-1.5">
                    <span>🔍</span>
                    <span>選取晶粒分析 (Die Telemetry)</span>
                  </span>
                  ${this.selectedDie?`
                    <span class="font-mono text-[10px] px-2 py-0.5 rounded ${this.selectedDie.passed?"bg-emerald-500/20 text-emerald-300":"bg-red-500/20 text-red-300"}">
                      座標: [R${this.selectedDie.row}, C${this.selectedDie.col}]
                    </span>
                  `:""}
                </div>

                ${this.selectedDie?`
                  <div class="space-y-1.5 font-mono text-[11px] p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                    <div class="flex justify-between">
                      <span class="text-slate-400">距離晶圓圓心:</span>
                      <span class="text-slate-200 font-bold">${this.selectedDie.distanceFromCenter} 格</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-slate-400">電性檢測狀態:</span>
                      <span class="${this.selectedDie.passed?"text-emerald-400 font-bold":"text-red-400 font-bold"}">
                        ${this.selectedDie.passed?"✅ PASSED (合格電性通過)":"❌ FAILED (失效瑕疵品)"}
                      </span>
                    </div>
                    ${this.selectedDie.passed?`
                      <div class="text-[10px] text-emerald-300/80 pt-1">
                        晶體結構完整無畸變，金屬接觸電阻正常。
                      </div>
                    `:`
                      <div class="pt-1.5 border-t border-slate-800 text-[10px] text-slate-300">
                        <span class="text-amber-300 font-bold">失效原因分析：</span>
                        ${this.selectedDie.defectType==="CLUSTER"?"【區域群聚缺陷】微影光阻殘留或化學腐蝕液擴散，波及相鄰相連晶粒！":this.selectedDie.defectType==="OPTICAL_DEFOCUS"?"【邊緣聚焦離焦】晶圓邊緣物理翹曲與數值孔徑 NA 聚焦裕度不足導致線寬失真！":"【微影落塵污染】無塵室空氣中微粒穿透光阻，導致金屬互連斷路！"}
                      </div>
                    `}
                  </div>
                `:`
                  <div class="text-slate-500 text-center py-4 italic">點擊左側晶圓晶粒查看詳細光學遙測數據</div>
                `}
              </div>

              <!-- Defect Breakdown -->
              <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-[11px] space-y-1">
                <div class="text-slate-400 text-[10px] font-sans font-bold">瑕疵根因統計：</div>
                <div class="flex justify-between text-red-400">
                  <span>群聚缺陷 (Cluster):</span>
                  <span>${o} 顆</span>
                </div>
                <div class="flex justify-between text-amber-400">
                  <span>邊緣光學離焦 (Defocus):</span>
                  <span>${c} 顆</span>
                </div>
                <div class="flex justify-between text-purple-400">
                  <span>落塵雜質 (Particle):</span>
                  <span>${l} 顆</span>
                </div>
              </div>

              <!-- Re-simulate Button -->
              <button id="btn-resim-wafer" class="btn-sci-fi w-full justify-center py-2 text-xs">
                🔄 重新執行蒙地卡羅良率掃描
              </button>

            </div>

          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s)}static bindEvents(t,e,s){var a,n;(a=document.getElementById("btn-close-wafer-map"))==null||a.addEventListener("click",()=>{f.playClick(),t.innerHTML=""}),t.querySelectorAll(".btn-wafer-die").forEach(i=>{i.addEventListener("click",o=>{f.playClick();const l=parseInt(o.currentTarget.getAttribute("data-index")||"0",10);this.selectedDie=this.dies.find(c=>c.index===l)||null,this.render(t,e,s)})}),(n=document.getElementById("btn-resim-wafer"))==null||n.addEventListener("click",()=>{f.playClick();const i=this.currentLot?this.currentLot.yieldMultiplier:e.rollingYieldHistory.length>0?e.rollingYieldHistory.reduce((o,l)=>o+l,0)/e.rollingYieldHistory.length:.92;this.dies=Y.generateWaferMap(i),this.selectedDie=this.dies[12]||this.dies[0],this.render(t,e,s)})}}g(O,"dies",[]),g(O,"selectedDie",null),g(O,"currentLot",null);class F{static show(t,e,s){const a=document.getElementById("modal-container");a&&(this.currentOrder=e,e.layerAllocations&&e.layerAllocations.length===e.layerCount?this.localAllocations=JSON.parse(JSON.stringify(e.layerAllocations)):this.localAllocations=E.autoFillBestEconomyAllocation(e,t.machines),this.render(a,t,s))}static render(t,e,s){if(!this.currentOrder)return;const a=this.currentOrder,n=e.machines.filter(r=>r.category==="LITHO"),i=new Map(e.staff.map(r=>[r.id,r])),o=new Map;for(const r of n){const d=r.assignedEngineerId?i.get(r.assignedEngineerId):null,p=P.calculateEffectiveCD(r.modelId,e.player.unlockedK1,r.wear,d);o.set(r.modelId,p)}let l=!1;for(const r of this.localAllocations)if((o.get(r.assignedMachineModelId)??99999)>r.targetCD){l=!0;break}const c=a.nodeNm>=1e3?`${a.nodeNm/1e3} µm`:`${a.nodeNm} nm`;t.innerHTML=`
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-4xl text-slate-100 flex flex-col max-h-[90vh]">
          
          <!-- Modal Header -->
          <div class="flex items-center justify-between pb-3 border-b border-slate-700/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-500/50 flex items-center justify-center text-xl shadow-inner">
                🎛️
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-white tracking-wide">
                    混合微影分層配方指派 (Mix-and-Match Litho)
                  </h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/30">
                    先進多層架構
                  </span>
                </div>
                <div class="text-xs text-slate-400 font-mono">
                  客戶: ${a.clientName} | 目標技術節點: ${c} | 總層數: ${a.layerCount} 層
                </div>
              </div>
            </div>

            <button id="btn-close-layer-modal" class="text-slate-400 hover:text-white font-mono text-xl p-1">
              ✕
            </button>
          </div>

          <!-- 半導體科普導讀卡片 -->
          <div class="my-3 p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex items-start gap-3 text-xs">
            <span class="text-xl">💡</span>
            <div class="text-slate-300 leading-relaxed">
              <span class="text-indigo-300 font-bold">半導體產業秘密：</span>
              現代晶片並非所有光罩層都需昂貴的頂級機台！底層關鍵閘極 (FEOL Gate) 線寬極窄需先進光刻；而上層金屬導線與銲墊 (Pad) 線寬寬鬆，指派成熟便宜的光刻機能
              <strong class="text-emerald-400">大幅降低晶圓生產成本與昂貴機台磨損</strong>，釋放黃光產能瓶頸！
            </div>
          </div>

          <!-- 配方分層列表清單 (可滾動) -->
          <div class="flex-1 overflow-y-auto pr-1 space-y-2.5 my-2">
            ${this.localAllocations.map(r=>{const d=o.get(r.assignedMachineModelId)??99999,p=d>r.targetCD,u=r.layerIndex<=3;return`
                <div class="p-3 rounded-xl bg-slate-900/80 border ${p?"border-red-500/60 bg-red-950/20":"border-slate-800 hover:border-slate-700"} flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all">
                  
                  <!-- 左側：層級資訊 -->
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${u?"bg-amber-950/80 border border-amber-500/40 text-amber-300":"bg-slate-800 text-slate-300"}">
                      L${r.layerIndex}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-xs text-white">${r.layerType}</span>
                        ${u?'<span class="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">關鍵層</span>':'<span class="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400">導線層</span>'}
                      </div>
                      <div class="text-[11px] font-mono text-slate-400">
                        目標線寬需求: <span class="text-cyan-300 font-bold">${r.targetCD} nm</span>
                      </div>
                    </div>
                  </div>

                  <!-- 中間：機台指派下拉選單 -->
                  <div class="flex-1 max-w-sm">
                    <select data-layer="${r.layerIndex}" class="sel-layer-machine w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                      ${n.map(h=>{const m=o.get(h.modelId)??9999,b=h.modelId===r.assignedMachineModelId;return`
                          <option value="${h.modelId}" ${b?"selected":""}>
                            ${h.name} (實時CD: ${m}nm | 磨損: ${Math.round(h.wear)}%)
                          </option>
                        `}).join("")}
                    </select>
                  </div>

                  <!-- 右側：Rayleigh 解析度檢核徽章 -->
                  <div class="min-w-[140px] text-right">
                    ${p?`
                      <div class="text-xs font-bold text-red-400 flex items-center md:justify-end gap-1">
                        <span>⚠️</span>
                        <span>解析度不足！</span>
                      </div>
                      <div class="text-[10px] text-red-300/80 font-mono">
                        機台CD ${d}nm > 需求 ${r.targetCD}nm
                      </div>
                    `:`
                      <div class="text-xs font-bold text-emerald-400 flex items-center md:justify-end gap-1">
                        <span>✅</span>
                        <span>光學合規</span>
                      </div>
                      <div class="text-[10px] text-slate-400 font-mono">
                        安全裕度: +${r.targetCD-d} nm
                      </div>
                    `}
                  </div>

                </div>
              `}).join("")}
          </div>

          <!-- 底部控制按鈕列 -->
          <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
            <!-- 一鍵自動最佳化 -->
            <button id="btn-auto-fill-alloc" class="btn-sci-fi text-xs py-2 px-3 bg-indigo-900/60 hover:bg-indigo-800 border-indigo-500/60 text-indigo-200 flex items-center gap-1.5">
              <span>⚡</span>
              <span>一鍵最佳經濟配置 (Auto-Fill)</span>
            </button>

            <!-- 確定保存 -->
            <div class="flex items-center gap-2">
              <button id="btn-cancel-layer-alloc" class="btn-sci-fi text-xs py-2 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300">
                取消
              </button>
              <button id="btn-save-layer-alloc" class="btn-sci-fi text-xs py-2 px-5 ${l?"opacity-50 cursor-not-allowed bg-slate-700":"bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"}" ${l?"disabled":""}>
                💾 確認並套用分層配方
              </button>
            </div>
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s)}static bindEvents(t,e,s){var i,o,l,c;const a=()=>{f.playClick(),t.innerHTML=""};(i=document.getElementById("btn-close-layer-modal"))==null||i.addEventListener("click",a),(o=document.getElementById("btn-cancel-layer-alloc"))==null||o.addEventListener("click",a),t.querySelectorAll(".sel-layer-machine").forEach(r=>{r.addEventListener("change",d=>{const p=d.target,u=Number(p.dataset.layer),h=p.value,m=this.localAllocations.find(b=>b.layerIndex===u);m&&(m.assignedMachineModelId=h,f.playClick(),this.render(t,e,s))})}),(l=document.getElementById("btn-auto-fill-alloc"))==null||l.addEventListener("click",()=>{this.currentOrder&&(f.playCoinChime(),this.localAllocations=E.autoFillBestEconomyAllocation(this.currentOrder,e.machines),this.render(t,e,s))}),(c=document.getElementById("btn-save-layer-alloc"))==null||c.addEventListener("click",()=>{this.currentOrder&&(this.currentOrder.layerAllocations=JSON.parse(JSON.stringify(this.localAllocations)),f.playFanfare(),t.innerHTML="",s())})}}g(F,"currentOrder",null),g(F,"localAllocations",[]);class N{static show(t,e){const s=document.getElementById("modal-container");s&&((this.marketOrders.length===0||t.gameTime-this.lastRefreshTime>60)&&this.refreshMarketOrders(t),this.render(s,t,e))}static refreshMarketOrders(t){const e=t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((s,a)=>s+a,0)/t.rollingYieldHistory.length:null;this.marketOrders=_.generateContractBoard(t.player.foundryTier,e,t.gameTime),this.lastRefreshTime=t.gameTime}static render(t,e,s){const a=e.rollingYieldHistory.length>0?e.rollingYieldHistory.reduce((o,l)=>o+l,0)/e.rollingYieldHistory.length:null,n=_.calculateTrustMultiplier(a),i=this.getBestLithoCD(e);t.innerHTML=`
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-4xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/60">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xl">
                📋
              </div>
              <div>
                <h3 class="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  <span>晶圓代工合約與光罩廠</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
                    Tier ${e.player.foundryTier}
                  </span>
                </h3>
                <p class="text-xs text-slate-400">
                  承接全球客戶晶片訂單，即刻領取 NRE 光罩研發預付款，投入潔淨室量產！
                </p>
              </div>
            </div>

            <!-- Trust Indicator -->
            <div class="flex items-center gap-4">
              <div class="text-right hidden sm:block">
                <div class="text-[10px] text-slate-400 uppercase tracking-wider">客戶信任溢價</div>
                <div class="text-sm font-mono font-bold ${n>=1?"text-emerald-400":"text-amber-400"}">
                  ${n.toFixed(2)}x
                  <span class="text-[10px] text-slate-400">(${a!==null?(a*100).toFixed(1)+"%":"N/A"})</span>
                </div>
              </div>
              <button id="btn-close-contract" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors">
                ✕
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-slate-700/60 bg-slate-900/30 px-6 pt-2">
            <button id="tab-market" class="px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${this.currentTab==="MARKET"?"border-cyan-400 text-cyan-300":"border-transparent text-slate-400 hover:text-slate-200"}">
              <span>🌐 承接市場訂單池</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">${this.marketOrders.length}</span>
            </button>
            <button id="tab-active" class="px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${this.currentTab==="ACTIVE"?"border-cyan-400 text-cyan-300":"border-transparent text-slate-400 hover:text-slate-200"}">
              <span>⚡ 在製訂單與批次</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">${e.activeOrders.length}</span>
            </button>
            <div class="ml-auto py-1.5 flex items-center">
              ${this.currentTab==="MARKET"?`
                <button id="btn-refresh-market" class="btn-sci-fi text-[11px] py-1 px-3">
                  🔄 刷新訂單池
                </button>
              `:""}
            </div>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto flex-1 space-y-4">
            ${this.currentTab==="MARKET"?this.renderMarketOrders(e,i):this.renderActiveOrders(e)}
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s)}static renderMarketOrders(t,e){return this.marketOrders.length===0?`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">📭</div>
          <p class="text-sm">目前市場暫無新合約，請點擊上方按鈕刷新合約板！</p>
        </div>
      `:`
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${this.marketOrders.map((s,a)=>{const n=e<=s.nodeNm,i=s.nodeNm>=1e3?`${s.nodeNm/1e3} µm`:`${s.nodeNm} nm`;let o='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">常規件 (1.0x)</span>';s.urgencyMultiplier===1.2?o='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">🟡 急件 (1.2x)</span>':s.urgencyMultiplier>=1.5&&(o='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">🔴 SHR 超急件 (1.5x)</span>');const l=s.nrePaid+s.totalDies*s.unitPrice;return`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${n?"border-slate-800 hover:border-cyan-500/40":"border-red-900/40 bg-red-950/10"} transition-all flex flex-col justify-between space-y-3">
              <!-- Card Header -->
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">${s.clientName}</span>
                    ${o}
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5 font-mono">
                    合約編號: ${s.id}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold font-mono text-cyan-300">${i}</div>
                  <div class="text-[10px] text-slate-400">${s.layerCount} 道光罩層</div>
                </div>
              </div>

              <!-- Card Specs -->
              <div class="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <div class="text-[10px] text-slate-400">總晶粒需求</div>
                  <div class="font-mono font-semibold text-slate-200">${s.totalDies.toLocaleString()} 顆</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">出貨單價</div>
                  <div class="font-mono font-semibold text-emerald-400">NT$ ${s.unitPrice.toFixed(2)} /顆</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">💰 接單即付 NRE</div>
                  <div class="font-mono font-bold text-amber-300">+NT$ ${s.nrePaid.toLocaleString()}</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">預估合約總值</div>
                  <div class="font-mono font-semibold text-cyan-300">~NT$ ${Math.round(l).toLocaleString()}</div>
                </div>
              </div>

              <!-- Litho CD warning or ready -->
              ${n?`
                <div class="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>⏱️ 交付時限:</span>
                  <span class="font-mono text-slate-300">${Math.max(0,s.deadlineGameTime-t.gameTime)} 遊戲秒</span>
                </div>
              `:`
                <div class="p-2 rounded bg-red-900/20 border border-red-700/30 text-[11px] text-red-300 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>廠內機台極限 CD (${e===999999?"無微影機":e+"nm"}) 無法滿足 ${i} 製程需求！</span>
                </div>
              `}

              <!-- Action Button -->
              <button
                class="btn-accept-order btn-sci-fi w-full justify-center ${n?"":"opacity-50 cursor-not-allowed"}"
                data-index="${a}"
                ${n?"":"disabled"}
              >
                ✍️ 簽約接單 (即刻領取 NT$ ${s.nrePaid.toLocaleString()})
              </button>
            </div>
          `}).join("")}
      </div>
    `}static renderActiveOrders(t){return t.activeOrders.length===0?`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">⚙️</div>
          <p class="text-sm">目前產線無在製訂單，請前往「承接市場訂單池」簽約接單！</p>
        </div>
      `:`
      <div class="space-y-4">
        ${t.activeOrders.map(e=>{var o;const s=Math.max(0,e.deadlineGameTime-t.gameTime),a=s===0,n=t.activeLots.filter(l=>l.orderId===e.id),i=Math.min(100,Math.round(e.goodDiesDelivered/e.totalDies*100));return`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${a?"border-red-600/50":"border-slate-800"} space-y-3">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white">${e.clientName}</span>
                    <span class="text-xs font-mono text-cyan-300">
                      [${e.nodeNm>=1e3?e.nodeNm/1e3+"µm":e.nodeNm+"nm"}]
                    </span>
                    ${a?'<span class="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold animate-pulse">逾期追討中</span>':""}
                  </div>
                  <div class="text-xs text-slate-400 font-mono">訂單編號: ${e.id}</div>
                </div>

                <div class="text-right">
                  <div class="text-xs ${a?"text-red-400 font-bold":"text-slate-400"}">
                    ${a?"⚠️ 已超時":"剩餘時間: "+s+" 秒"}
                  </div>
                  <div class="text-xs font-mono text-emerald-400">
                    單價: NT$ ${e.unitPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="space-y-1">
                <div class="flex justify-between text-xs text-slate-300 font-mono">
                  <span>合格交付量: ${e.goodDiesDelivered} / ${e.totalDies} 顆</span>
                  <span>${i}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div class="h-full bg-cyan-400 transition-all duration-300" style="width: ${i}%;"></div>
                </div>
              </div>

              <!-- In-fab lots status -->
              <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                <div class="text-[11px] font-semibold text-slate-400">無塵室在製晶圓盒 (Lots):</div>
                ${n.length===0?`
                  <div class="text-xs text-slate-500 italic">所有晶圓盒已完工，正等待結算交付...</div>
                `:`
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${n.map(l=>{let c=`<span class="text-cyan-300 font-bold">${l.currentStation}</span>`;l.currentStation==="LIT"&&(c=`<span class="text-amber-300 font-bold">LIT (${l.litSubStep||"COAT"})</span>`);let r="";if(l.qTimeDeadline!==null){const d=Math.max(0,l.qTimeDeadline-t.gameTime);r=`<span class="text-[10px] font-mono ${d<10?"text-red-400 animate-pulse":"text-amber-400"}">⏳ Q-Time: ${d}s</span>`}return`
                        <div class="p-2 rounded bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-2">
                          <div>
                            <div class="font-mono text-slate-300 font-semibold flex items-center gap-1.5">
                              <span>${l.lotId}</span>
                              <button class="btn-inspect-lot text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 hover:bg-cyan-800 text-cyan-300 border border-cyan-700/50 flex items-center gap-0.5 cursor-pointer" data-lot-id="${l.lotId}" title="點擊檢視蒙地卡羅晶圓圖">
                                <span>🔍</span><span>晶圓圖</span>
                              </button>
                            </div>
                            <div class="text-[10px] text-slate-400">
                              層數: ${l.currentLayer}/${l.totalLayers} | 站點: ${c}
                            </div>
                          </div>
                          <div class="text-right">
                            <div class="text-[10px] text-emerald-400 font-mono">良率: ${(l.yieldMultiplier*100).toFixed(0)}%</div>
                            ${r}
                          </div>
                        </div>
                      `}).join("")}
                  </div>
                `}
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between gap-2 pt-1">
                <div>
                  ${e.layerCount>1?`
                    <button class="btn-layer-allocation btn-sci-fi text-xs py-1 px-3 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 flex items-center gap-1.5" data-order-id="${e.id}" title="自訂先進製程多層微影機台分配">
                      <span>🎛️</span>
                      <span>微影分層配方 (${((o=e.layerAllocations)==null?void 0:o.length)||e.layerCount}層)</span>
                    </button>
                  `:""}
                </div>

                <div class="flex items-center gap-2">
                  ${n.length===0||n.every(l=>l.status==="COMPLETED")?`
                    <button class="btn-settle-order btn-sci-fi text-xs py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500" data-order-id="${e.id}">
                      📦 完成出貨結算尾款
                    </button>
                  `:`
                    <div class="text-[11px] text-slate-400 flex items-center gap-1">
                      <span class="animate-spin">⚙️</span>
                      <span>晶圓加工中，完工後自動出貨...</span>
                    </div>
                  `}
                </div>
              </div>

            </div>
          `}).join("")}
      </div>
    `}static bindEvents(t,e,s){var a,n,i,o;(a=document.getElementById("btn-close-contract"))==null||a.addEventListener("click",()=>{f.playClick(),t.innerHTML=""}),(n=document.getElementById("tab-market"))==null||n.addEventListener("click",()=>{f.playClick(),this.currentTab="MARKET",this.render(t,e,s)}),(i=document.getElementById("tab-active"))==null||i.addEventListener("click",()=>{f.playClick(),this.currentTab="ACTIVE",this.render(t,e,s)}),(o=document.getElementById("btn-refresh-market"))==null||o.addEventListener("click",()=>{f.playClick(),this.refreshMarketOrders(e),this.render(t,e,s)}),t.querySelectorAll(".btn-accept-order").forEach(l=>{l.addEventListener("click",c=>{const r=parseInt(c.currentTarget.getAttribute("data-index")||"0",10),d=this.marketOrders[r];if(!d)return;f.playCoinChime(),e.player.cash+=d.nrePaid,e.activeOrders.push(d);const p=Math.max(1,Math.min(3,Math.ceil(d.totalDies/1e3)));for(let u=0;u<p;u++){const h={lotId:`LOT-${Date.now().toString(36).toUpperCase().slice(-4)}-${u+1}`,orderId:d.id,waferCount:Math.ceil(d.totalDies/p/(d.nodeNm>=1e3?500:2e3)),currentStation:"FILM",currentLayer:1,totalLayers:d.layerCount,qTimeDeadline:null,yieldMultiplier:1,status:"PROCESSING"};e.activeLots.push(h)}this.marketOrders.splice(r,1),S.checkAchievements(e),s(),this.currentTab="ACTIVE",this.render(t,e,s)})}),t.querySelectorAll(".btn-settle-order").forEach(l=>{l.addEventListener("click",c=>{const r=c.currentTarget.getAttribute("data-order-id"),d=e.activeOrders.findIndex(m=>m.id===r);if(d===-1)return;const p=e.activeOrders[d],u=p.goodDiesDelivered>0?p.goodDiesDelivered:p.totalDies*.95,h=_.settleOrderPayout(p,u,e.player,e.staff,0,e.clawbackDebt);e.player.cash+=h.netPayout,e.clawbackDebt=h.remainingDebt,e.activeOrders.splice(d,1),e.activeLots=e.activeLots.filter(m=>m.orderId!==p.id),f.playFanfare(),S.checkAchievements(e),s(),this.render(t,e,s)})}),t.querySelectorAll(".btn-inspect-lot").forEach(l=>{l.addEventListener("click",c=>{const r=c.currentTarget.getAttribute("data-lot-id"),d=e.activeLots.find(p=>p.lotId===r);f.playClick(),O.show(e,d,()=>{this.render(t,e,s),s()})})}),t.querySelectorAll(".btn-layer-allocation").forEach(l=>{l.addEventListener("click",c=>{const r=c.currentTarget.getAttribute("data-order-id"),d=e.activeOrders.find(p=>p.id===r);d&&(f.playClick(),F.show(e,d,()=>{this.render(t,e,s),s()}))})})}static getBestLithoCD(t){const e=t.machines.filter(a=>a.category==="LITHO"&&a.status!=="EXPLODED");if(e.length===0)return 999999;let s=999999;for(const a of e){const n=P.OPTICAL_CATALOG[a.modelId];n&&n.baseRayleighLimitNm<s&&(s=n.baseRayleighLimitNm)}return s}}g(N,"marketOrders",[]),g(N,"lastRefreshTime",0),g(N,"currentTab","MARKET");class D{static show(t,e){const s=document.getElementById("modal-container");s&&this.render(s,t,e)}static render(t,e,s){const a=[{key:"LITHO",label:"LITHO 微影機",icon:"🔦"},{key:"TRACK",label:"TRACK 塗膠顯影 (瓶頸)",icon:"🌀"},{key:"FILM",label:"FILM 薄膜成長",icon:"✨"},{key:"ETCH",label:"ETCH 蝕刻製程",icon:"⚡"},{key:"DIFF",label:"DIFF 擴散植入",icon:"🎯"},{key:"CMP",label:"CMP 平坦研磨",icon:"💿"},{key:"FLEET",label:"廠內現役機台 ("+e.machines.length+")",icon:"🏭"}];t.innerHTML=`
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-5xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/60">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
                🏭
              </div>
              <div>
                <h3 class="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  <span>半導體設備採購與廠務商城</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
                    目前資金: NT$ ${Math.round(e.player.cash).toLocaleString()}
                  </span>
                </h3>
                <p class="text-xs text-slate-400">
                  購置先進製程設備，並聯 Track 消除微影瓶頸，持續大修維持在線妥善率！
                </p>
              </div>
            </div>

            <button id="btn-close-store" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors">
              ✕
            </button>
          </div>

          <!-- Category Nav Tabs -->
          <div class="flex border-b border-slate-700/60 bg-slate-900/30 px-6 pt-2 overflow-x-auto gap-1">
            ${a.map(n=>{const i=this.activeCategory===n.key,o=n.key==="CMP"&&!e.unlockedFeatures.cmp;return`
                <button
                  class="btn-store-tab px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${i?"border-amber-400 text-amber-300":"border-transparent text-slate-400 hover:text-slate-200"} ${o?"opacity-50":""}"
                  data-cat="${n.key}"
                >
                  <span>${n.icon}</span>
                  <span>${n.label}</span>
                  ${o?'<span class="text-[10px] text-amber-500 font-mono">(Tier 3解鎖)</span>':""}
                </button>
              `}).join("")}
          </div>

          <!-- Body Content -->
          <div class="p-6 overflow-y-auto flex-1 space-y-4">
            ${this.activeCategory==="FLEET"?this.renderFleetTab(e):this.renderCatalogTab(e)}
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s)}static renderCatalogTab(t){const e=this.STORE_CATALOG.filter(s=>s.category===this.activeCategory);return`
      ${this.activeCategory==="TRACK"?`
        <div class="p-3 rounded-xl bg-amber-950/20 border border-amber-600/30 text-xs text-amber-200 flex items-start gap-2.5">
          <span class="text-base">💡</span>
          <div>
            <span class="font-bold">物理限制理論 (TOC) 戰略提示：</span>
            每片晶圓在微影站必須進出 Track 兩次 (旋塗光阻 + 曝光後顯影)！單台 Track 的負荷是曝光機的 2 倍。
            建議為 1 台先進微影機並聯配套 2~3 台 Track 機台，徹底釋放產能！
          </div>
        </div>
      `:""}

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${e.map((s,a)=>{const n=t.player.foundryTier>=s.tier,i=t.player.cash>=s.price,o=s.category==="CMP"&&!t.unlockedFeatures.cmp;return`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${n?"border-slate-800 hover:border-amber-500/40":"border-slate-800/40 opacity-70"} transition-all flex flex-col justify-between space-y-3">
              
              <div class="flex items-start gap-3">
                <div class="w-16 h-16 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden relative group">
                  <img src="${s.assetPath}" alt="${s.name}" class="w-full h-full object-contain filter drop-shadow" />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <h4 class="font-bold text-white text-sm truncate">${s.name}</h4>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono ${n?"bg-cyan-500/20 text-cyan-300":"bg-slate-800 text-slate-400"}">
                      Tier ${s.tier}
                    </span>
                  </div>

                  <div class="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    ${s.description}
                  </div>
                </div>
              </div>

              <!-- Specs Grid -->
              <div class="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <div class="text-[10px] text-slate-400">標準吞吐量</div>
                  <div class="font-mono font-semibold text-cyan-300">${s.throughputWpm} 晶圓/分</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">${s.rayleighLimitNm?"Rayleigh 極限 CD":"設備分類"}</div>
                  <div class="font-mono font-semibold text-emerald-400">${s.rayleighLimitNm?s.rayleighLimitNm+" nm":s.category}</div>
                </div>
                <div class="col-span-2 flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span class="text-[10px] text-slate-400">採購單價</span>
                  <span class="font-mono font-bold text-amber-300 text-sm">NT$ ${s.price.toLocaleString()}</span>
                </div>
              </div>

              <!-- Science Info & Buy Button -->
              <div class="flex items-center gap-2">
                <button
                  class="btn-sci-info px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                  data-index="${a}"
                  title="查看半導體科普原理解析"
                >
                  <span>ℹ️</span>
                  <span>原理</span>
                </button>

                <button
                  class="btn-buy-equipment flex-1 btn-sci-fi justify-center text-xs py-2 ${!n||!i||o?"opacity-50 cursor-not-allowed":""}"
                  data-model-id="${s.modelId}"
                  ${!n||!i||o?"disabled":""}
                >
                  ${n?o?"🔒 CMP 科技未解鎖":i?"🛒 採購並安裝至廠房":"資金不足":`🔒 需達到 Tier ${s.tier}`}
                </button>
              </div>

            </div>
          `}).join("")}
      </div>
    `}static renderFleetTab(t){return t.machines.length===0?`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">🏭</div>
          <p class="text-sm">廠內目前尚未安裝任何機台，請前往各站點選購！</p>
        </div>
      `:`
      <div class="space-y-3">
        ${t.machines.map(e=>{const s=this.STORE_CATALOG.find(l=>l.modelId===e.modelId),a=Math.round((s?s.price:2e6)*.15),n=Math.round((s?s.price:2e6)*.4),i=Math.round(e.wear);let o='<span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">閒置 (IDLE)</span>';return e.status==="PROCESSING"?o='<span class="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">加工中</span>':e.status==="MAINTENANCE"?o='<span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">🛠️ 維護中</span>':e.status==="EXPLODED"&&(o='<span class="px-2 py-0.5 rounded text-[10px] bg-red-600 text-white font-bold animate-bounce">💥 腔體炸毀</span>'),`
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center p-1">
                  <img src="${s?s.assetPath:y.machines.litho_contact.path}" alt="${e.name}" class="w-full h-full object-contain" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">${e.name}</span>
                    ${o}
                  </div>
                  <div class="text-xs text-slate-400 font-mono mt-0.5">
                    ID: ${e.id} | 座標: (${e.gridX}, ${e.gridY}) | 站點: ${e.category}
                  </div>
                </div>
              </div>

              <!-- Wear & Status -->
              <div class="w-full md:w-48 space-y-1">
                <div class="flex justify-between text-xs font-mono">
                  <span class="text-slate-400">機台磨損度</span>
                  <span class="${i>70?"text-red-400 font-bold":i>40?"text-amber-400":"text-emerald-400"}">${i}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div class="h-full ${i>70?"bg-red-500":i>40?"bg-amber-500":"bg-emerald-500"}" style="width: ${i}%;"></div>
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  class="btn-overhaul btn-sci-fi text-xs py-1.5 px-3 bg-cyan-700/80 hover:bg-cyan-600"
                  data-machine-id="${e.id}"
                  data-cost="${a}"
                  ${t.player.cash<a||e.wear<=5?"disabled":""}
                >
                  🛠️ 就地大修 (NT$ ${a.toLocaleString()})
                </button>

                <button
                  class="btn-decommission px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-800/40 text-red-300 text-xs transition-colors"
                  data-machine-id="${e.id}"
                  data-refund="${n}"
                >
                  ♻️ 報廢變賣 (+NT$ ${n.toLocaleString()})
                </button>
              </div>
            </div>
          `}).join("")}
      </div>
    `}static bindEvents(t,e,s){var a;(a=document.getElementById("btn-close-store"))==null||a.addEventListener("click",()=>{f.playClick(),t.innerHTML=""}),t.querySelectorAll(".btn-store-tab").forEach(n=>{n.addEventListener("click",i=>{f.playClick();const o=i.currentTarget.getAttribute("data-cat");if(o==="CMP"&&!e.unlockedFeatures.cmp){alert("CMP（化學機械研磨）機台需晉升至 Tier 3 世代後方可解鎖！");return}this.activeCategory=o,this.render(t,e,s)})}),t.querySelectorAll(".btn-sci-info").forEach(n=>{n.addEventListener("click",i=>{f.playClick();const o=parseInt(i.currentTarget.getAttribute("data-index")||"0",10),l=this.STORE_CATALOG.filter(c=>c.category===this.activeCategory)[o];l&&alert(`👨‍🏫 半導體晶圓教室：【${l.name}】

${l.scienceNote}`)})}),t.querySelectorAll(".btn-buy-equipment").forEach(n=>{n.addEventListener("click",i=>{const o=i.currentTarget.getAttribute("data-model-id"),l=this.STORE_CATALOG.find(u=>u.modelId===o);if(!l)return;if(e.player.cash<l.price){alert("資金不足，無法完成設備採購！");return}e.player.cash-=l.price,f.playCoinChime();const c=e.machines.length,r=c%4*2,d=Math.floor(c/4)*2,p={id:`MCH-${Date.now().toString(36).toUpperCase().slice(-5)}`,modelId:l.modelId,name:l.name.split(" (")[0],category:l.category,tier:l.tier,gridX:Math.min(7,r),gridY:Math.min(7,d),wear:0,status:"IDLE",assignedEngineerId:null,pairedTrackIds:l.category==="LITHO"?[]:void 0};e.machines.push(p),S.checkAchievements(e),s(),this.activeCategory="FLEET",this.render(t,e,s)})}),t.querySelectorAll(".btn-overhaul").forEach(n=>{n.addEventListener("click",i=>{const o=i.currentTarget.getAttribute("data-machine-id"),l=parseInt(i.currentTarget.getAttribute("data-cost")||"0",10),c=e.machines.find(r=>r.id===o);if(c){if(e.player.cash<l){alert("資金不足，無法支付大修費用！");return}e.player.cash-=l,c.wear=0,c.status="IDLE",f.playClick(),s(),this.render(t,e,s)}})}),t.querySelectorAll(".btn-decommission").forEach(n=>{n.addEventListener("click",i=>{const o=i.currentTarget.getAttribute("data-machine-id"),l=parseInt(i.currentTarget.getAttribute("data-refund")||"0",10),c=e.machines.findIndex(d=>d.id===o);if(c===-1||!confirm(`確定要報廢並變賣此機台嗎？將回收變賣金 NT$ ${l.toLocaleString()}`))return;const r=e.machines[c];if(r.assignedEngineerId){const d=e.staff.find(p=>p.id===r.assignedEngineerId);d&&(d.assignedMachineId=null)}e.player.cash+=l,e.machines.splice(c,1),f.playCoinChime(),s(),this.render(t,e,s)})})}}g(D,"activeCategory","LITHO"),g(D,"STORE_CATALOG",[{modelId:"litho_contact",name:"Contact Aligner (接觸式微影機)",category:"LITHO",tier:1,price:25e5,throughputWpm:10,rayleighLimitNm:3007,description:"半導體萌芽期主力，光罩物理緊貼晶圓表面進行紫外曝光，維修容易。",scienceNote:"利用汞燈紫外混光 (436nm) 貼合曝光。因光罩直接碰觸晶圓表面，容易刮傷光罩與產生落塵，極限線寬約 3µm。",assetPath:y.machines.litho_contact.path},{modelId:"litho_projection",name:"1x Projection Aligner (1:1 投影曝光機)",category:"LITHO",tier:1,price:6e6,throughputWpm:15,rayleighLimitNm:1798,description:"反射鏡等倍投影微影，光罩懸空不接觸晶圓，徹底終結光罩刮傷磨損。",scienceNote:"Perkin-Elmer 經典反射光學系統，以凹面鏡聚焦達成 1:1 無接觸曝光，大幅提升光罩壽命與開局良率。",assetPath:y.machines.litho_projection.path},{modelId:"litho_gline",name:"G-Line Stepper (步進縮小曝光機)",category:"LITHO",tier:2,price:18e6,throughputWpm:25,rayleighLimitNm:997,description:"4:1 縮小投影透鏡，逐區步進曝光（Step-and-Repeat），進入 1µm 時代。",scienceNote:"高壓汞燈 g-line (436nm) 搭配數值孔徑 NA=0.35 之複合縮小透鏡，將光罩圖案縮小 4 倍投射，突破微米大關。",assetPath:y.machines.litho_gline.path},{modelId:"litho_iline",name:"I-Line Stepper (高壓汞燈微影機)",category:"LITHO",tier:3,price:35e6,throughputWpm:55,rayleighLimitNm:584,description:"次微米時代霸主，波長 365nm，支援精密對準與多層金屬互連製程。",scienceNote:"採用更短波長之高強度汞燈 i-line (365nm) 與 NA=0.50 鏡頭，成功壓制繞射效應，可清晰成像至 500nm。",assetPath:y.machines.litho_iline.path},{modelId:"litho_krf",name:"KrF DUV Scanner (準分子雷射微影機)",category:"LITHO",tier:4,price:85e6,throughputWpm:120,rayleighLimitNm:283,description:"深紫外光 (DUV) 準分子雷射，邁入動態連續掃描曝光 (Step-and-Scan)。",scienceNote:"248nm 氟化氪 (KrF) 準分子雷射光源，必須搭配化學增幅光阻 (CAR) 放大光化學反應，支援 0.25µm 製程。",assetPath:y.machines.litho_krf.path},{modelId:"litho_arfdry",name:"ArF Dry Scanner (氟化氬乾式微影機)",category:"LITHO",tier:4,price:18e7,throughputWpm:120,rayleighLimitNm:182,description:"193nm 紫外雷射，將大氣乾式微影發揮至極致，跨越次百奈米門檻。",scienceNote:"利用 193nm 氟化氬雷射與高折射石英透鏡群，是半導體製程縮小至 90nm/65nm 的核心關鍵機台。",assetPath:y.machines.litho_arfdry.path},{modelId:"litho_arfi",name:"ArFi Immersion TWINSCAN (浸潤式微影機)",category:"LITHO",tier:5,price:45e7,throughputWpm:260,rayleighLimitNm:114,description:"鏡頭與晶圓間注入超純水折射光線，雙工件台磁浮掃描，大氣產速最快！",scienceNote:"林本堅博士提出之革命性技術：利用水之折射率 n=1.44 巧妙將等效數值孔徑提升至 NA=1.35，多重曝光下推進至 7nm！",assetPath:y.machines.litho_arfi.path},{modelId:"litho_euv",name:"EUV Scanner (極紫外光微影巨獸)",category:"LITHO",tier:6,price:25e8,throughputWpm:180,rayleighLimitNm:33,description:"13.5nm 極紫外光，全真空反射鏡系統，單次曝光推進 7nm/5nm/3nm！",scienceNote:"以高功率二氧化碳雷射轟擊融熔錫滴激發電漿，產生 13.5nm EUV 光子，全機在超高真空運行，受抽真空限制產能為 180 片/分。",assetPath:y.machines.litho_euv.path},{modelId:"litho_highna",name:"High-NA EUV (高數值孔徑次世代巨獸)",category:"LITHO",tier:6,price:6e9,throughputWpm:180,rayleighLimitNm:20,description:"0.55 NA 變形數值孔徑透鏡，埃米世代霸主，稱霸矽島之終極神兵。",scienceNote:"採用變形鏡頭 (Anamorphic Optics)，X/Y 軸非對稱倍率，單次曝光極限線寬可達 20nm 以下，引領 2nm 埃米時代。",assetPath:y.machines.litho_highna.path},{modelId:"track_manual",name:"手動旋塗熱板台 (Manual Spin & Bake)",category:"TRACK",tier:1,price:8e5,throughputWpm:6,description:"⚠️ 開局先天產能瓶頸！人工滴膠手動離心旋塗與熱板預烤，產能僅 6 片/分。",scienceNote:"利用真空吸盤固定晶圓，手動注射光阻後以 3000 RPM 高速旋轉甩出均勻薄膜，再由人員夾入熱板烘烤。",assetPath:y.machines.track_manual.path},{modelId:"track_single",name:"單軌自動塗膠顯影機 (Single Track)",category:"TRACK",tier:2,price:45e5,throughputWpm:16,description:"初步自動化旋轉塗膠與自動烘烤模組，大幅減少人工操作失誤。",scienceNote:"機械手臂自動傳送晶圓至旋塗杯，自動注膠均勻成膜，並整合冷卻板 (Chill Plate) 精確控制膜厚。",assetPath:y.machines.track_single.path},{modelId:"track_dual",name:"雙軌連線 Track (Dual Track)",category:"TRACK",tier:3,price:12e6,throughputWpm:35,description:"雙獨立機械臂分開處理塗膠與顯影，有效提升次微米連線吞吐量。",scienceNote:"將塗膠旋塗單元 (Coater) 與顯影槽 (Developer) 實體隔離，避免顯影鹼液氣體污染光阻，保障微影良率。",assetPath:y.machines.track_dual.path},{modelId:"track_clean",name:"多工位精密 Clean Track",category:"TRACK",tier:4,price:3e7,throughputWpm:75,description:"多旋塗室並聯，高速熱板陣列，建議為先進微影機配備 2 台以上！",scienceNote:"配置多組 Coater/Developer 模組與快速溫控熱板，支援化學增幅光阻嚴苛的曝光後烘烤 (PEB) 溫度控制。",assetPath:y.machines.track_clean.path},{modelId:"track_advanced",name:"先進極限分子級 Track",category:"TRACK",tier:6,price:25e7,throughputWpm:160,description:"分子級膜厚控制，完美適配 EUV 超薄金屬氧化物光阻 (MOR)。",scienceNote:"具備超微量旋塗技術與化學氣相沉積底膜 (Underlayer)，將光阻粗糙度 (LWR) 降至分子級極限。",assetPath:y.machines.track_advanced.path},{modelId:"film_furnace",name:"高溫熱氧化爐管 (Horizontal Furnace)",category:"FILM",tier:1,price:18e5,throughputWpm:12,description:"利用 1000°C 高溫水汽使矽表面長出堅硬均勻的二氧化矽 (SiO2) 絕緣保護層。",scienceNote:"利用高純度氧氣或水蒸氣在高溫下與矽晶圓反應：Si + O2 -> SiO2，生長厚度均勻的高品質絕緣氧化層。",assetPath:y.machines.film_furnace.path},{modelId:"film_pecvd",name:"電漿增強化學氣相沉積機 (PECVD / ALD)",category:"FILM",tier:4,price:25e6,throughputWpm:110,description:"利用電漿在低溫下快速沉積氮化矽、金屬介電質，並支援原子層沉積 (ALD)。",scienceNote:"以射頻電漿解離前驅氣體，可在較低溫度 (300°C) 下沉積薄膜，避免破壞底層已摻雜之電晶體結構。",assetPath:y.machines.film_pecvd.path},{modelId:"etch_wet",name:"濕式酸槽清洗台 (Wet Chemical Bench)",category:"ETCH",tier:1,price:15e5,throughputWpm:12,description:"利用氫氟酸 (HF) 與化學酸液浸泡溶解未受光阻保護之薄膜，等向性腐蝕。",scienceNote:"化學濕法腐蝕屬於等向性蝕刻 (Isotropic)，容易產生側向掏空 (Undercut)，適合 3µm 以上粗線寬。",assetPath:y.machines.etch_wet.path},{modelId:"etch_plasma",name:"電漿乾式蝕刻機 (RIE / ICP-RIE)",category:"ETCH",tier:3,price:28e6,throughputWpm:50,description:"以高能反應離子轟擊進行垂直非等向性蝕刻，線條邊緣垂直銳利！",scienceNote:"反應性離子蝕刻 (RIE) 結合物理離子轟擊與化學自由基反應，具備極高垂直各向異性 (Anisotropic)，是次微米微影的關鍵搭檔。",assetPath:y.machines.etch_plasma.path},{modelId:"diff_furnace",name:"熱擴散摻雜爐管 (Thermal Diffusion)",category:"DIFF",tier:1,price:2e6,throughputWpm:10,description:"將磷或硼蒸氣高溫擴散滲透進矽晶格中，形成 N 型與 P 型半導體通道。",scienceNote:"利用高溫晶格熱運動使雜質原子由高濃度向低濃度擴散，控溫容易但橫向擴散量大。",assetPath:y.machines.diff_furnace.path},{modelId:"diff_implanter",name:"大束流離子佈植機 (Ion Implanter)",category:"DIFF",tier:2,price:15e6,throughputWpm:20,description:"將雜質原子電離成高能離子束，如子彈般精確轟擊打入矽晶圓特定深度。",scienceNote:"高壓電場加速磷/砷/硼離子束，可獨立精確控制植入劑量與深度，無橫向擴散失真，是現代電晶體的核心技術。",assetPath:y.machines.diff_implanter.path},{modelId:"cmp_polisher",name:"化學機械平坦化研磨機 (CMP Polisher)",category:"CMP",tier:3,price:2e7,throughputWpm:40,description:"化學研磨液搭配高速研磨墊，將晶圓表面磨至分子級平坦，解鎖多層金屬佈線！",scienceNote:"利用研磨液 (Slurry) 的化學腐蝕軟化與奈米磨料的機械研磨，實現全晶圓奈米級全域平坦化 (Global Planarization)。",assetPath:y.machines.cmp_polisher.path}]);class W{static show(t,e){const s=document.getElementById("modal-container");s&&(this.candidates.length===0&&this.generateCandidates(t.player.foundryTier),this.render(s,t,e))}static generateCandidates(t){const e=["林","陳","黃","張","李","王","吳","劉","蔡","楊","許","鄭","謝","洪","郭"],s=["冠宇","家豪","博智","欣宜","雅婷","立群","崇德","柏翰","建良","哲瑋","俊廷","文傑"],a=["LITHO","TRACK","FILM","ETCH","DIFF","CMP"];this.candidates=[];for(let n=0;n<4;n++){const i=e[Math.floor(Math.random()*e.length)],o=s[Math.floor(Math.random()*s.length)],l=a[Math.floor(Math.random()*a.length)];let c="Young Specialist",r=2e4,d=45e3,p="專精基礎機台操作，磨損累積 -10%，微影 k1 -0.01。適合操作 Tier 1~2。";const u=Math.random();t>=5&&u>.6?(c="Fellow",r=5e5,d=35e4,p="頂級半導體物理泰斗，磨損累積 -80%，微影 k1 -0.06，良率 +15%，可抵銷先進製程視窗損失！"):t>=3&&u>.4?(c="Senior Engineer",r=12e4,d=15e4,p="多年產線調機權威，磨損累積 -50%，微影 k1 -0.04，良率 +10%。適合操作 Tier 3~5。"):t>=2&&u>.3&&(c="Skilled Worker",r=5e4,d=75e3,p="熟練製程技師，磨損累積 -25%，微影 k1 -0.02，良率 +5%。適合操作 Tier 1~3。"),this.candidates.push({id:`CAN-${Date.now().toString(36).slice(-4)}-${n}`,name:`${i}${o}`,rank:c,moduleSpecialty:l,signingBonus:r,salary:d,description:p})}}static render(t,e,s){var i;const a=e.staff.reduce((o,l)=>o+l.salary,0),n=((i=e.staff[0])==null?void 0:i.shiftMode)||"THREE_SHIFT";t.innerHTML=`
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-4xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/60">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-xl">
                👥
              </div>
              <div>
                <h3 class="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                  <span>半導體人才與廠務人資中心</span>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono border border-purple-500/30">
                    在職員工: ${e.staff.length} 人
                  </span>
                </h3>
                <p class="text-xs text-slate-400">
                  配置專精工程師進駐機台，三班制維穩解鎖 🛡️ TPM 24H 零故障在線保證！
                </p>
              </div>
            </div>

            <button id="btn-close-hr" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors">
              ✕
            </button>
          </div>

          <!-- Shift & Payroll Banner -->
          <div class="px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2">
              <span class="text-slate-400">廠區輪班機制:</span>
              <button
                id="btn-toggle-shift"
                class="px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${n==="THREE_SHIFT"?"bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50":"bg-amber-600/30 text-amber-300 border border-amber-500/40 hover:bg-amber-600/50"}"
              >
                <span>${n==="THREE_SHIFT"?"🟢 四班三輪 8H (三班制)":"🔴 做二休二 12H (兩班制)"}</span>
                <span class="text-[10px] underline">點擊切換</span>
              </button>
              <span class="text-[10px] text-slate-400">
                ${n==="THREE_SHIFT"?"🛡️ 疲勞穩定 <50，解鎖 TPM 零故障":"⚠️ 薪資省 33%，但過勞有炸機風險"}
              </span>
            </div>

            <div class="text-right">
              <span class="text-slate-400">月薪資總支出: </span>
              <span class="font-mono font-bold text-amber-300 text-sm">NT$ ${a.toLocaleString()}</span>
              <span class="text-[10px] text-emerald-400 ml-1">(優先法律保障)</span>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-slate-700/60 bg-slate-900/30 px-6 pt-2">
            <button id="tab-staff" class="px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${this.activeTab==="STAFF"?"border-purple-400 text-purple-300":"border-transparent text-slate-400 hover:text-slate-200"}">
              <span>🧑‍💼 廠內在職團隊</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-purple-400">${e.staff.length}</span>
            </button>
            <button id="tab-market" class="px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${this.activeTab==="MARKET"?"border-purple-400 text-purple-300":"border-transparent text-slate-400 hover:text-slate-200"}">
              <span>💼 人才招募市場</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">${this.candidates.length}</span>
            </button>
            ${this.activeTab==="MARKET"?`
              <button id="btn-refresh-candidates" class="ml-auto btn-sci-fi text-[11px] py-1 px-3 my-1">
                🔄 刷新履歷池
              </button>
            `:""}
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto flex-1 space-y-4">
            ${this.activeTab==="STAFF"?this.renderStaffTab(e):this.renderMarketTab(e)}
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s)}static renderStaffTab(t){return t.staff.length===0?`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">👥</div>
          <p class="text-sm">廠內目前尚未招募任何工程師，請前往「人才招募市場」進行招聘！</p>
        </div>
      `:`
      <div class="space-y-3">
        ${t.staff.map(e=>{const s=t.machines.find(i=>i.id===e.assignedMachineId);let a=!1,n=!1;return s&&(a=L.checkTPMConditions(s,e).isTPMActive,n=L.checkExplosionRisk(s,e).hasRisk),`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${n?"border-red-600/60 bg-red-950/10":a?"border-amber-500/50 bg-amber-950/10":"border-slate-800"} flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <!-- Info -->
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
                  🧑‍🔬
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white">${e.name}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      ${e.rank}
                    </span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300">
                      專長: ${e.moduleSpecialty}
                    </span>
                  </div>

                  <div class="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>月薪: NT$ ${e.salary.toLocaleString()}</span>
                    <span>|</span>
                    <span>疲勞度: ${Math.round(e.fatigue)}%</span>
                  </div>
                </div>
              </div>

              <!-- Machine Assignment Dropdown -->
              <div class="flex flex-col gap-1 w-full md:w-64">
                <label class="text-[10px] text-slate-400">進駐機台指派:</label>
                <select class="select-machine select-sci-fi text-xs py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200" data-staff-id="${e.id}">
                  <option value="">-- 未指派機台 (待命休假) --</option>
                  ${t.machines.map(i=>`
                    <option value="${i.id}" ${e.assignedMachineId===i.id?"selected":""}>
                      ${i.name} (${i.category} Tier ${i.tier})
                    </option>
                  `).join("")}
                </select>

                <!-- Badges -->
                ${a?`
                  <div class="text-[11px] text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                    <span>🛡️</span>
                    <span>TPM 24H 零故障在線維護保證中！</span>
                  </div>
                `:""}
                ${n?`
                  <div class="text-[11px] text-red-400 font-bold flex items-center gap-1 mt-0.5 animate-pulse">
                    <span>💥</span>
                    <span>越級操作！存在 25% 炸機風險！</span>
                  </div>
                `:""}
              </div>

              <!-- Actions -->
              <div>
                <button
                  class="btn-fire-staff px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-800/40 text-red-300 text-xs transition-colors"
                  data-staff-id="${e.id}"
                >
                  解雇資遣
                </button>
              </div>

            </div>
          `}).join("")}
      </div>
    `}static renderMarketTab(t){return this.candidates.length===0?`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">💼</div>
          <p class="text-sm">目前市場暫無履歷，請點擊右上角「刷新履歷池」！</p>
        </div>
      `:`
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${this.candidates.map((e,s)=>{const a=t.player.cash>=e.signingBonus;return`
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl">
                    🧑‍💻
                  </div>
                  <div>
                    <div class="font-bold text-white text-sm">${e.name}</div>
                    <div class="text-[11px] text-purple-300 font-semibold font-mono">${e.rank}</div>
                  </div>
                </div>

                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  模組: ${e.moduleSpecialty}
                </span>
              </div>

              <div class="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                ${e.description}
              </div>

              <div class="flex items-center justify-between text-xs pt-1">
                <div>
                  <div class="text-[10px] text-slate-400">簽約獎金 (一次性)</div>
                  <div class="font-mono font-bold text-amber-300">NT$ ${e.signingBonus.toLocaleString()}</div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] text-slate-400">核定月薪</div>
                  <div class="font-mono font-semibold text-slate-200">NT$ ${e.salary.toLocaleString()} /月</div>
                </div>
              </div>

              <button
                class="btn-hire-candidate btn-sci-fi w-full justify-center text-xs py-2 ${a?"":"opacity-50 cursor-not-allowed"}"
                data-index="${s}"
                ${a?"":"disabled"}
              >
                ${a?`🤝 簽約聘任 (支付 NT$ ${e.signingBonus.toLocaleString()})`:"資金不足以支付簽約金"}
              </button>
            </div>
          `}).join("")}
      </div>
    `}static bindEvents(t,e,s){var a,n,i,o,l;(a=document.getElementById("btn-close-hr"))==null||a.addEventListener("click",()=>{f.playClick(),t.innerHTML=""}),(n=document.getElementById("tab-staff"))==null||n.addEventListener("click",()=>{f.playClick(),this.activeTab="STAFF",this.render(t,e,s)}),(i=document.getElementById("tab-market"))==null||i.addEventListener("click",()=>{f.playClick(),this.activeTab="MARKET",this.render(t,e,s)}),(o=document.getElementById("btn-refresh-candidates"))==null||o.addEventListener("click",()=>{f.playClick(),this.generateCandidates(e.player.foundryTier),this.render(t,e,s)}),(l=document.getElementById("btn-toggle-shift"))==null||l.addEventListener("click",()=>{var d;f.playClick();const r=(((d=e.staff[0])==null?void 0:d.shiftMode)||"THREE_SHIFT")==="THREE_SHIFT"?"TWO_SHIFT":"THREE_SHIFT";e.staff.forEach(p=>{p.shiftMode=r,r==="TWO_SHIFT"?p.salary=Math.round(p.salary*.67):p.salary=Math.round(p.salary/.67)}),s(),this.render(t,e,s)}),t.querySelectorAll(".btn-hire-candidate").forEach(c=>{c.addEventListener("click",r=>{var m;const d=parseInt(r.currentTarget.getAttribute("data-index")||"0",10),p=this.candidates[d];if(!p)return;if(e.player.cash<p.signingBonus){alert("資金不足，無法支付簽約獎金！");return}e.player.cash-=p.signingBonus,f.playCoinChime();const u=((m=e.staff[0])==null?void 0:m.shiftMode)||"THREE_SHIFT",h={id:`STF-${Date.now().toString(36).toUpperCase().slice(-5)}`,name:p.name,rank:p.rank,moduleSpecialty:p.moduleSpecialty,fatigue:20,shiftMode:u,assignedMachineId:null,salary:p.salary};e.staff.push(h),this.candidates.splice(d,1),S.checkAchievements(e),s(),this.activeTab="STAFF",this.render(t,e,s)})}),t.querySelectorAll(".select-machine").forEach(c=>{c.addEventListener("change",r=>{const d=r.currentTarget.getAttribute("data-staff-id"),p=r.currentTarget.value||null,u=e.staff.find(h=>h.id===d);if(u){if(p){const h=e.staff.find(m=>m.assignedMachineId===p&&m.id!==d);h&&(h.assignedMachineId=null)}u.assignedMachineId=p,e.machines.forEach(h=>{h.id===p?h.assignedEngineerId=u.id:h.assignedEngineerId===u.id&&(h.assignedEngineerId=null)}),f.playClick(),S.checkAchievements(e),s(),this.render(t,e,s)}})}),t.querySelectorAll(".btn-fire-staff").forEach(c=>{c.addEventListener("click",r=>{const d=r.currentTarget.getAttribute("data-staff-id"),p=e.staff.findIndex(h=>h.id===d);if(p===-1)return;const u=e.staff[p];if(confirm(`確定要資遣工程師【${u.name}】嗎？`)){if(u.assignedMachineId){const h=e.machines.find(m=>m.id===u.assignedMachineId);h&&(h.assignedEngineerId=null)}e.staff.splice(p,1),f.playClick(),s(),this.render(t,e,s)}})})}}g(W,"activeTab","STAFF"),g(W,"candidates",[]);class H{static getSpeedMultiplier(){return this.speedMultiplier}static init(t,e,s){const a=new URLSearchParams(window.location.search);(a.get("dev")==="true"||a.get("admin")==="foundry")&&this.toggle(t,e,s),window.addEventListener("keydown",i=>{i.ctrlKey&&i.shiftKey&&i.code==="KeyD"&&(i.preventDefault(),this.toggle(t,e,s))})}static toggle(t,e,s){this.isVisible=!this.isVisible;const a=document.getElementById("dev-console");if(a){if(!this.isVisible){a.innerHTML="";return}f.playClick(),this.render(a,t,e,s)}}static render(t,e,s,a){var n,i,o,l;t.innerHTML=`
      <div class="fixed bottom-4 right-4 z-50 p-4 rounded-xl glass-panel border border-red-500/50 bg-slate-950/95 shadow-2xl text-slate-100 w-80">
        <div class="flex items-center justify-between pb-2 mb-3 border-b border-red-500/30">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span class="text-xs font-bold text-red-400 font-mono tracking-wider">DEV DEBUG CONSOLE</span>
          </div>
          <button id="btn-dev-close" class="text-slate-400 hover:text-white text-sm font-mono">✕</button>
        </div>

        <!-- 時間倍速控制器 -->
        <div class="mb-3">
          <div class="text-[11px] text-slate-400 mb-1 font-mono">SIMULATION SPEED:</div>
          <div class="grid grid-cols-4 gap-1.5">
            ${[1,2,4,8].map(c=>`
              <button
                class="btn-speed btn-sci-fi text-xs py-1 justify-center ${this.speedMultiplier===c?"bg-red-600 border-red-400 text-white font-bold":""}"
                data-speed="${c}"
              >
                ${c}x
              </button>
            `).join("")}
          </div>
        </div>

        <!-- 輔助測試按鈕 -->
        <div class="space-y-1.5 text-xs">
          <button id="btn-add-cash" class="btn-sci-fi w-full justify-center bg-slate-900 border-slate-700 hover:border-amber-400 text-amber-300">
            💰 給予 NT$ 5,000 萬測試金
          </button>
          <button id="btn-trigger-wear" class="btn-sci-fi w-full justify-center bg-slate-900 border-slate-700 hover:border-red-400 text-red-300">
            ⚡ 機台磨損 +50% (觸發故障)
          </button>
          <button id="btn-reset-save" class="btn-sci-fi w-full justify-center btn-danger text-xs">
            🗑️ 清空重置存檔 (Reset Game)
          </button>
        </div>
      </div>
    `,(n=document.getElementById("btn-dev-close"))==null||n.addEventListener("click",()=>{this.isVisible=!1,t.innerHTML=""}),document.querySelectorAll(".btn-speed").forEach(c=>{c.addEventListener("click",r=>{f.playClick();const d=Number(r.currentTarget.getAttribute("data-speed"));this.speedMultiplier=d,s(d),this.render(t,e,s,a)})}),(i=document.getElementById("btn-add-cash"))==null||i.addEventListener("click",()=>{e.player.cash+=5e7,f.playCoin(),a()}),(o=document.getElementById("btn-trigger-wear"))==null||o.addEventListener("click",()=>{for(const c of e.machines)c.wear=Math.min(100,c.wear+50),c.wear>=80&&(c.status="MAINTENANCE");f.playWarning(),a()}),(l=document.getElementById("btn-reset-save"))==null||l.addEventListener("click",()=>{confirm("確定要清空本地存檔並重置遊戲嗎？")&&(localStorage.clear(),window.location.reload())})}}g(H,"isVisible",!1),g(H,"speedMultiplier",1);class B{static show(t,e,s){const a=document.getElementById("modal-container");a&&(s!==void 0&&(this.currentStep=s),this.render(a,t,e))}static isCompleted(){return localStorage.getItem("silicon_tycoon_tutorial_completed")==="true"}static markCompleted(){localStorage.setItem("silicon_tycoon_tutorial_completed","true")}static render(t,e,s){const a=this.currentStep,n=[{stepNum:1,badge:"🚀 歡迎創辦人",title:"歡迎來到《Silicon Tycoon: 矽島霸權》",icon:"🏭",content:`
          <p class="leading-relaxed">
            您已正式就任這座 2.5D 晶圓代工廠的 CEO！半導體晶片是人類精密製造的皇冠，全廠由
            <strong class="text-cyan-400">薄膜 (FILM) → 微影 (LIT) → 蝕刻 (ETCH) → 擴散 (DIFF)</strong>
            等核心製程循環運轉。
          </p>
          <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div class="text-amber-300 font-semibold">💡 創辦人指引：</div>
            <div>• 點擊畫面上任意機台，可進入單機控制面板查看磨損、動態 $k_1$ 光學極限與 Track 並聯綁定。</div>
            <div>• 本教學將一步步引導您承接第一筆訂單、體驗極速跳過生產、檢查晶圓缺陷並自動化出貨！</div>
          </div>
        `,btnPrimaryText:"開始第一步：承接訂單 ➡️",btnPrimaryAction:"next"},{stepNum:2,badge:"📜 簽約接單",title:"合約看板與 NRE 光罩預付款",icon:"📋",content:`
          <p class="leading-relaxed">
            晶圓代工的第一步是接單！客戶會提供產品規格與技術節點。
            最棒的是，簽署合約時您將<strong class="text-emerald-400">立刻獲得全額 NRE 光罩開模研發預付款</strong>，充實您的流動現金！
          </p>
          <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1.5">
            <div class="flex items-center justify-between text-slate-200 font-mono">
              <span>入門首選：</span>
              <span class="text-cyan-300 font-bold">10µm 經典雙極性電晶體</span>
            </div>
            <div>• 需求機台：Contact Aligner (接觸式微影機)</div>
            <div>• 簽約後，晶圓盒 (Lot) 將自動進入潔淨室開始加工！</div>
          </div>
        `,btnPrimaryText:"打開合約看板 📜",btnPrimaryAction:"open_contract"},{stepNum:3,badge:"⚡ 生產加速特權",title:"產線加工與【⏩ 免費跳過等待】",icon:"⏩",content:`
          <p class="leading-relaxed">
            晶圓在無塵室依序經過機台加工。在常規運營下，每道站點需時數秒，並受 Q-Time 嚴格約束（超時會扣良率或需光阻重洗 Rework）。
          </p>
          <div class="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border border-amber-500/50 space-y-2 text-center">
            <div class="text-amber-300 text-xs font-bold flex items-center justify-center gap-1.5">
              <span>✨</span>
              <span>新手教學專屬特權：免等待直通完工</span>
              <span>✨</span>
            </div>
            <p class="text-[11px] text-slate-300">
              點擊下方高亮按鈕，系統將運用量子加速直接將當前在製晶圓推向完工並結算良率！
            </p>
            <button id="btn-tutorial-skip-production" class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs tracking-wider shadow-lg flex items-center justify-center gap-2 transform active:scale-95 transition-all">
              <span>⏩</span>
              <span>立即【免費跳過生產等待】直通完工</span>
            </button>
          </div>
        `,btnPrimaryText:"跳過等待並前進下一步 ➡️",btnPrimaryAction:"next"},{stepNum:4,badge:"🔍 品質把關",title:"蒙地卡羅 25 晶粒良率圖 (Wafer Map)",icon:"💿",content:`
          <p class="leading-relaxed">
            晶圓加工完畢後，每一顆晶粒 (Die) 的良率皆由蒙地卡羅物理模擬生成！
            受同心圓幾何效應影響，<strong class="text-emerald-400">晶圓中心良率最高 (1.1x)</strong>，邊緣較易出現散焦與缺陷。
          </p>
          <div class="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
            <div class="text-cyan-300 font-semibold">晶圓圖三大檢測指標：</div>
            <div>• <strong class="text-red-400">OPTICAL_DEFOCUS</strong>：微影焦平面像差與邊緣散焦</div>
            <div>• <strong class="text-amber-400">PARTICLE</strong>：潔淨室微塵落塵污染（提升 Class 等級可改善）</div>
            <div>• <strong class="text-purple-400">CLUSTER</strong>：化學蝕刻不均引發之群聚缺陷</div>
          </div>
        `,btnPrimaryText:"打開晶圓良率圖 🔍",btnPrimaryAction:"open_wafer_map"},{stepNum:5,badge:"🏆 營運進階",title:"出貨收款與 MES 自動化運營",icon:"🤖",content:`
          <p class="leading-relaxed">
            恭喜您已完整掌握晶圓代工的核心循環！在合約板中結算出貨後，海量尾款將全額入帳，商譽 (Popularity) 亦會同步躍升！
          </p>
          <div class="p-3 rounded-lg bg-slate-900/90 border border-emerald-500/30 text-xs text-slate-300 space-y-2">
            <div class="flex items-center gap-2 text-emerald-300 font-bold">
              <span>🤖</span>
              <span>無人化工廠秘訣：開啟 MES 自動派工</span>
            </div>
            <p>
              點擊頂部導航列的【🤖 MES 自動】開關，日後所有加工完成的晶圓將由製造執行系統自動出貨收款，無需手動點擊結算！
            </p>
          </div>
        `,btnPrimaryText:"🎉 完成新手引導，稱霸矽島！",btnPrimaryAction:"finish"}],i=n[a]||n[0];t.innerHTML=`
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-xl text-slate-100 flex flex-col relative animate-fade-in">
          
          <!-- Close button -->
          <button id="btn-close-tutorial" class="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-lg" title="跳過教學">
            ✕
          </button>

          <!-- Step Badge & Header -->
          <div class="flex items-center gap-3 pb-3 border-b border-slate-700/70">
            <div class="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-inner">
              ${i.icon}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  ${i.badge}
                </span>
                <span class="text-xs text-slate-400 font-mono">
                  步驟 ${i.stepNum} / ${this.totalSteps}
                </span>
              </div>
              <h3 class="text-base font-bold text-white tracking-wide mt-0.5">
                ${i.title}
              </h3>
            </div>
          </div>

          <!-- Step Progress Dots -->
          <div class="flex items-center justify-center gap-2 py-3">
            ${n.map((o,l)=>`
              <div class="h-1.5 rounded-full transition-all duration-300 ${l===a?"w-8 bg-cyan-400":l<a?"w-3 bg-emerald-400":"w-3 bg-slate-700"}"></div>
            `).join("")}
          </div>

          <!-- Step Content Body -->
          <div class="text-xs text-slate-300 space-y-3 pb-4">
            ${i.content}
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button id="btn-skip-tutorial-all" class="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              跳過全部教學
            </button>

            <div class="flex items-center gap-2">
              ${a>0?`
                <button id="btn-tutorial-prev" class="btn-sci-fi text-xs py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300">
                  上一步
                </button>
              `:""}

              <button id="btn-tutorial-action" class="btn-sci-fi text-xs py-1.5 px-5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-lg shadow-cyan-900/40">
                ${i.btnPrimaryText}
              </button>
            </div>
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s,i.btnPrimaryAction)}static bindEvents(t,e,s,a){var i,o,l,c,r;const n=()=>{f.playClick(),t.innerHTML="",this.markCompleted()};(i=document.getElementById("btn-close-tutorial"))==null||i.addEventListener("click",n),(o=document.getElementById("btn-skip-tutorial-all"))==null||o.addEventListener("click",n),(l=document.getElementById("btn-tutorial-prev"))==null||l.addEventListener("click",()=>{f.playClick(),this.currentStep=Math.max(0,this.currentStep-1),this.render(t,e,s)}),(c=document.getElementById("btn-tutorial-skip-production"))==null||c.addEventListener("click",()=>{if(f.playFanfare(),e.activeLots.length>0)for(const d of e.activeLots)d.currentStation="DIFF",d.status="COMPLETED",d.yieldMultiplier=.96;else{const d=e.activeOrders.length>0?e.activeOrders[0].id:"starter_demo";e.activeLots.push({lotId:`LOT-${Date.now().toString().slice(-4)}`,orderId:d,waferCount:25,currentStation:"DIFF",currentLayer:3,totalLayers:3,qTimeDeadline:null,yieldMultiplier:.95,status:"COMPLETED"})}s(),this.currentStep=3,this.render(t,e,s)}),(r=document.getElementById("btn-tutorial-action"))==null||r.addEventListener("click",()=>{f.playClick(),a==="next"?(this.currentStep=Math.min(this.totalSteps-1,this.currentStep+1),this.render(t,e,s)):a==="open_contract"?(t.innerHTML="",N.show(e,()=>s())):a==="open_wafer_map"?(t.innerHTML="",O.show(e,null,()=>s())):a==="finish"&&(this.markCompleted(),f.playFanfare(),t.innerHTML="",s())})}}g(B,"currentStep",0),g(B,"totalSteps",5);class J{constructor(t,e,s){g(this,"topHUD");g(this,"state");g(this,"onStateUpdated");this.state=t,this.onStateUpdated=s,this.topHUD=new z("top-hud",{onOpenContracts:()=>this.openContracts(),onOpenStore:()=>this.openStore(),onOpenHR:()=>this.openHR(),onOpenQuests:()=>this.openQuests(),onOpenAchievements:()=>this.openAchievements(),onOpenAdvisory:()=>this.openAdvisory(),onToggleMES:a=>this.onStateUpdated(),onOpenSaveModal:()=>this.openSaveModal(),onOpenWaferMap:()=>this.openWaferMap(),onOpenTutorial:()=>this.openTutorial()}),H.init(t,e,s),(!t.player.companyName||t.player.companyName==="矽島先進半導體")&&G.show(t,()=>{this.render(),this.onStateUpdated(),B.isCompleted()||this.openTutorial()}),this.render()}render(){this.topHUD.render(this.state)}openContracts(){N.show(this.state,()=>{this.render(),this.onStateUpdated()})}openStore(){D.show(this.state,()=>{this.render(),this.onStateUpdated()})}openHR(){W.show(this.state,()=>{this.render(),this.onStateUpdated()})}openQuests(){U.show(this.state,()=>{this.render(),this.onStateUpdated()})}openAchievements(){q.show(this.state,()=>{this.render(),this.onStateUpdated()})}openAdvisory(){Q.show(this.state,()=>{this.openStore()},()=>{this.openHR()})}openWaferMap(t){O.show(this.state,t,()=>{this.render(),this.onStateUpdated()})}openLayerAllocation(t){F.show(this.state,t,()=>{this.render(),this.onStateUpdated()})}openTutorial(t){B.show(this.state,()=>{this.render(),this.onStateUpdated()},t)}openSaveModal(){var e,s,a,n;const t=document.getElementById("modal-container");t&&(t.innerHTML=`
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-lg text-slate-100">
          <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-700">
            <h3 class="text-base font-bold flex items-center gap-2">
              <span>💾</span>
              <span>存檔備份與 JSON 匯出/匯入</span>
            </h3>
            <button id="btn-close-save-modal" class="text-slate-400 hover:text-white font-mono text-lg">✕</button>
          </div>

          <div class="space-y-3 text-xs text-slate-300">
            <p>
              遊戲預設每 10 秒自動保存至瀏覽器 LocalStorage。您亦可隨時手動匯出備份檔案。
            </p>

            <div class="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
              <button id="btn-export-save" class="btn-sci-fi w-full justify-center">
                📥 匯出存檔為 JSON 檔案
              </button>
              <button id="btn-import-save" class="btn-sci-fi w-full justify-center bg-slate-800">
                📤 匯入存檔 JSON
              </button>
              <input type="file" id="file-import-save" accept=".json" class="hidden" />
            </div>
          </div>
        </div>
      </div>
    `,(e=document.getElementById("btn-close-save-modal"))==null||e.addEventListener("click",()=>{f.playClick(),t.innerHTML=""}),(s=document.getElementById("btn-export-save"))==null||s.addEventListener("click",()=>{f.playClick();const i=$.exportSaveToJson(this.state),o=new Blob([i],{type:"application/json"}),l=URL.createObjectURL(o),c=document.createElement("a");c.href=l,c.download=`silicon_tycoon_save_${Date.now()}.json`,c.click(),URL.revokeObjectURL(l)}),(a=document.getElementById("btn-import-save"))==null||a.addEventListener("click",()=>{var i;(i=document.getElementById("file-import-save"))==null||i.click()}),(n=document.getElementById("file-import-save"))==null||n.addEventListener("change",i=>{var l;const o=(l=i.target.files)==null?void 0:l[0];if(o){const c=new FileReader;c.onload=r=>{var u;const d=(u=r.target)==null?void 0:u.result,p=$.importSaveFromJson(d);p.success&&p.state?($.saveToLocalStorage(p.state),alert("存檔匯入成功！即將重新載入遊戲。"),window.location.reload()):alert(`匯入失敗: ${p.error}`)},c.readAsText(o)}}))}showNotice(t){const e=document.createElement("div");e.className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs font-medium shadow-2xl animate-bounce",e.innerText=t,document.body.appendChild(e),setTimeout(()=>e.remove(),2500)}}class Z{static show(t,e,s){const a=document.getElementById("modal-container");a&&this.render(a,t,e,s)}static render(t,e,s,a){const n=y.machines[e.modelId],i=(n==null?void 0:n.path)||"./assets/machines/litho_contact.png",o=D.STORE_CATALOG.find(v=>v.modelId===e.modelId),l=o?Math.round(o.price*.15):3e5,c=o?Math.round(o.price*.4):8e5,r=Math.round(e.wear),d=s.staff.find(v=>v.id===e.assignedEngineerId);let p=!1,u=!1;d&&(p=L.checkTPMConditions(e,d).isTPMActive,u=L.checkExplosionRisk(e,d).hasRisk);let h=null,m=null;if(e.category==="LITHO"){const v=P.OPTICAL_CATALOG[e.modelId];if(v){const k=P.calculateEffectiveK1(s.player.unlockedK1,e.wear,d||null);h={effectiveK1:k.effectiveK1,formula:`Base(${k.k1Tech.toFixed(2)}) + 磨損(+${k.deltaWear.toFixed(3)}) - 調校(-${k.deltaEngineer.toFixed(2)}) + 疲勞(+${k.deltaFatigue.toFixed(2)})`},m=Math.round(k.effectiveK1*(v.wavelengthNm/v.numericalAperture))}}const b=e.category==="LITHO",w=s.machines.filter(v=>v.category==="TRACK"&&v.status!=="EXPLODED"),C=e.pairedTrackIds||[],I=E.BASE_THROUGHPUT_BY_TIER.LIT[e.tier]||10;let T=0;for(const v of C){const k=s.machines.find(V=>V.id===v);k&&(T+=E.BASE_THROUGHPUT_BY_TIER.TRACK[k.tier]||6)}const M=b&&(C.length===0||T<I);t.innerHTML=`
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-2xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden animate-fadeIn">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/70">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-slate-950 border border-cyan-500/40 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src="${i}" alt="${e.name}" class="w-full h-full object-contain filter drop-shadow" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-white tracking-wide">${e.name}</h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Tier ${e.tier}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono ${e.status==="PROCESSING"?"bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse":e.status==="MAINTENANCE"?"bg-amber-500/20 text-amber-300 border border-amber-500/30":e.status==="EXPLODED"?"bg-red-600 text-white font-bold animate-bounce":"bg-slate-800 text-slate-300"}">
                    ${e.status}
                  </span>
                </div>
                <div class="text-xs text-slate-400 font-mono mt-0.5">
                  ID: ${e.id} | 格線座標: (${e.gridX}, ${e.gridY}) | 站點類別: ${e.category}
                </div>
              </div>
            </div>

            <button id="btn-close-machine-panel" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto flex-1 space-y-4 text-xs">

            <!-- Wear & Health Bar -->
            <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between font-mono">
                <span class="text-slate-400 flex items-center gap-1.5">
                  <span>🛠️</span>
                  <span>機台磨損與在線健康度</span>
                </span>
                <span class="font-bold ${r>70?"text-red-400":r>40?"text-amber-400":"text-emerald-400"}">
                  磨損: ${r}% (健康度 ${100-r}%)
                </span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div class="h-full transition-all duration-300 ${r>70?"bg-red-500":r>40?"bg-amber-500":"bg-emerald-500"}" style="width: ${r}%;"></div>
              </div>

              <!-- Status Alert Badges -->
              ${p?`
                <div class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2">
                  <span class="text-base">🛡️</span>
                  <div>
                    <span class="font-bold">TPM 24H 零故障在線維護中：</span>
                    工程師在線微調，磨損鎖死在 5% 以下，故障率保證為 0%！
                  </div>
                </div>
              `:""}

              ${u?`
                <div class="p-2 rounded-lg bg-red-950/40 border border-red-600/50 text-red-300 flex items-center gap-2 animate-pulse">
                  <span class="text-base">💥</span>
                  <div>
                    <span class="font-bold">越級操作極度危險！</span>
                    工程師職等落後機台 2 級以上，每次投片皆有 25% 炸機破壞風險！
                  </div>
                </div>
              `:""}
            </div>

            <!-- Litho Specific Optical Rayleigh Details -->
            ${b&&h?`
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div class="flex items-center justify-between font-mono">
                  <span class="text-cyan-300 font-bold flex items-center gap-1.5">
                    <span>🔬</span>
                    <span>Rayleigh 微影光學解析度實時調校</span>
                  </span>
                  <span class="text-emerald-400 font-bold">極限 CD: ~${m} nm</span>
                </div>
                <div class="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1 font-mono text-[11px]">
                  <div class="flex justify-between">
                    <span class="text-slate-400">當前實效 k1 因子:</span>
                    <span class="text-cyan-300 font-bold">${h.effectiveK1.toFixed(3)}</span>
                  </div>
                  <div class="text-[10px] text-slate-500">
                    計算分解: ${h.formula}
                  </div>
                  ${h.effectiveK1<.38?`
                    <div class="text-[10px] text-amber-400 pt-1">
                      ⚠️ 逼近物理極限 (k1 < 0.38)，聚焦景深裕度狹窄，產生製程窗良率折損！
                    </div>
                  `:""}
                </div>
              </div>
            `:""}

            <!-- Option B: LITHO Paired Track Selection (Breakthrough Choke Point) -->
            ${b?`
              <div class="p-3.5 rounded-xl bg-slate-900/80 border ${M?"border-amber-500/40":"border-slate-800"} space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-white flex items-center gap-1.5">
                    <span>🌀</span>
                    <span>連線機組 Track 塗膠顯影機配套綁定 (Option B)</span>
                  </span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    微影 ${I} 片/分 vs Track ${T} 片/分
                  </span>
                </div>

                <p class="text-[11px] text-slate-400">
                  半導體黃光區晶圓每層必須進出 Track 兩次 (塗膠 + 顯影)！可勾選並聯多台 Track 機台分流吞吐：
                </p>

                ${w.length===0?`
                  <div class="p-2.5 rounded bg-red-950/20 border border-red-800/30 text-red-300 text-[11px]">
                    ⚠️ 廠內尚未安裝任何 Track 塗膠顯影機！微影機無法單獨運作，請前往商城採購！
                  </div>
                `:`
                  <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    ${w.map(v=>{const k=C.includes(v.id),V=E.BASE_THROUGHPUT_BY_TIER.TRACK[v.tier]||6;return`
                        <label class="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border ${k?"border-cyan-500/40 bg-cyan-950/10":"border-slate-800"} cursor-pointer hover:border-slate-700">
                          <div class="flex items-center gap-2">
                            <input
                              type="checkbox"
                              class="chk-paired-track rounded border-slate-700 text-cyan-500 focus:ring-0"
                              data-track-id="${v.id}"
                              ${k?"checked":""}
                            />
                            <span class="font-semibold text-slate-200 text-xs">${v.name}</span>
                            <span class="text-[10px] text-slate-400 font-mono">(Tier ${v.tier})</span>
                          </div>
                          <span class="font-mono text-[11px] text-cyan-300">+${V} 晶圓/分</span>
                        </label>
                      `}).join("")}
                  </div>
                `}

                ${M?`
                  <div class="p-2 rounded bg-amber-950/30 border border-amber-600/40 text-amber-200 text-[11px] flex items-center gap-2">
                    <span>⚠️</span>
                    <span>Track 吞吐量不足！微影機正在降速等待，請並聯勾選第二台 Track 或至商城增購！</span>
                  </div>
                `:`
                  <div class="p-2 rounded bg-emerald-950/30 border border-emerald-600/40 text-emerald-300 text-[11px] flex items-center gap-2">
                    <span>✨</span>
                    <span>完美並聯！消除微影瓶頸，享有連線機組加成 (內部傳送時間減少 60%)！</span>
                  </div>
                `}
              </div>
            `:""}

            <!-- Station Engineer Assignment -->
            <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white flex items-center gap-1.5">
                  <span>🧑‍🔬</span>
                  <span>駐機製程工程師配置</span>
                </span>
                ${d?`
                  <span class="text-[10px] font-mono text-purple-300">
                    ${d.rank} (${d.moduleSpecialty})
                  </span>
                `:'<span class="text-[10px] text-slate-500">無工程師</span>'}
              </div>

              <select id="select-station-engineer" class="select-sci-fi w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs">
                <option value="">-- 未指派 (無調校加成，磨損正常累積) --</option>
                ${s.staff.map(v=>`
                  <option value="${v.id}" ${e.assignedEngineerId===v.id?"selected":""}>
                    ${v.name} - ${v.rank} [專長: ${v.moduleSpecialty}] (疲勞: ${Math.round(v.fatigue)}%)
                  </option>
                `).join("")}
              </select>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-3 pt-2">
              <button
                id="btn-machine-overhaul"
                class="flex-1 btn-sci-fi justify-center py-2.5 text-xs bg-cyan-700/80 hover:bg-cyan-600 ${s.player.cash<l||e.wear<=5?"opacity-50 cursor-not-allowed":""}"
                ${s.player.cash<l||e.wear<=5?"disabled":""}
              >
                🛠️ 就地大修保養 (NT$ ${l.toLocaleString()})
              </button>

              <button
                id="btn-machine-decommission"
                class="px-4 py-2.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-800/40 text-red-300 text-xs transition-colors"
              >
                ♻️ 報廢變賣 (+NT$ ${c.toLocaleString()})
              </button>
            </div>

          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s,a)}static bindEvents(t,e,s,a){var n,i,o,l;(n=document.getElementById("btn-close-machine-panel"))==null||n.addEventListener("click",()=>{f.playClick(),t.innerHTML=""}),t.querySelectorAll(".chk-paired-track").forEach(c=>{c.addEventListener("change",()=>{f.playClick();const r=[];t.querySelectorAll(".chk-paired-track:checked").forEach(d=>{const p=d.getAttribute("data-track-id");p&&r.push(p)}),e.pairedTrackIds=r,a(),this.render(t,e,s,a)})}),(i=document.getElementById("select-station-engineer"))==null||i.addEventListener("change",c=>{f.playClick();const r=c.target.value||null;if(e.assignedEngineerId){const d=s.staff.find(p=>p.id===e.assignedEngineerId);d&&(d.assignedMachineId=null)}if(e.assignedEngineerId=r,r){const d=s.staff.find(p=>p.id===r);if(d){if(d.assignedMachineId){const p=s.machines.find(u=>u.id===d.assignedMachineId);p&&(p.assignedEngineerId=null)}d.assignedMachineId=e.id}}a(),this.render(t,e,s,a)}),(o=document.getElementById("btn-machine-overhaul"))==null||o.addEventListener("click",()=>{const c=D.STORE_CATALOG.find(d=>d.modelId===e.modelId),r=c?Math.round(c.price*.15):3e5;if(s.player.cash<r){alert("資金不足，無法執行大修！");return}s.player.cash-=r,e.wear=0,e.status="IDLE",f.playClick(),a(),this.render(t,e,s,a)}),(l=document.getElementById("btn-machine-decommission"))==null||l.addEventListener("click",()=>{const c=D.STORE_CATALOG.find(p=>p.modelId===e.modelId),r=c?Math.round(c.price*.4):8e5;if(!confirm(`確定要將設備【${e.name}】除役報廢嗎？回收變賣金額 NT$ ${r.toLocaleString()}`))return;if(e.assignedEngineerId){const p=s.staff.find(u=>u.id===e.assignedEngineerId);p&&(p.assignedMachineId=null)}const d=s.machines.findIndex(p=>p.id===e.id);d!==-1&&s.machines.splice(d,1),s.player.cash+=r,f.playCoinChime(),t.innerHTML="",a()})}}class ee{constructor(){g(this,"state",$.loadFromLocalStorage()||$.createDefaultSave());g(this,"phaserGame");g(this,"cleanroomScene");g(this,"uiManager");g(this,"autoSaveTimer",0);console.log("🚀 正在啟動 Silicon Tycoon: Foundry Master 矽島霸權...");const t=Date.now();if(this.state.lastOnlineTimestamp&&t-this.state.lastOnlineTimestamp>60*1e3){const a=$.calculateOfflineProgress(this.state,t);console.log("離線營運結算戰報:",a)}const e=new Date().toISOString().split("T")[0];this.state.questState=A.refreshDailyQuests(this.state.questState,this.state.player,this.state.unlockedFeatures,e),S.checkAchievements(this.state);const s={type:Phaser.AUTO,parent:"game-container",width:window.innerWidth,height:window.innerHeight,backgroundColor:"#070b14",render:{antialias:!0,pixelArt:!1},scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH}};this.phaserGame=new Phaser.Game(s),this.cleanroomScene=new R,this.phaserGame.scene.add(R.KEY,this.cleanroomScene,!0,{saveGame:this.state,onMachineClick:a=>this.handleMachineClick(a)}),this.uiManager=new J(this.state,a=>{console.log(`開發者調整遊戲速度至: ${a}x`)},()=>{this.onStateChanged()}),setInterval(()=>this.simulationTick(),1e3)}simulationTick(){const t=H.getSpeedMultiplier();for(let s=0;s<t;s++){this.state.gameTime+=1;const a=new Map(this.state.staff.map(i=>[i.id,i]));for(const i of this.state.machines){if(i.status==="EXPLODED")continue;const o=i.assignedEngineerId?a.get(i.assignedEngineerId):null,l=L.updateMachineHealth(i,o,1);i.wear=l.newWear,l.breakdownOccurred&&(i.status=l.isExploded?"EXPLODED":"MAINTENANCE")}const n=[];for(const i of this.state.activeLots)if(i.status==="PROCESSING"){const o=this.state.activeOrders.find(r=>r.id===i.orderId),l=o?o.nodeNm:1e4;if(E.advanceLotStation(i,this.state.unlockedFeatures.cmp,l,this.state.player.unlockedCleanroomClass,this.state.gameTime).isLotCompleted&&(i.status="COMPLETED",o)){const r=this.state.activeLots.filter(u=>u.orderId===o.id),d=Math.round(o.totalDies/Math.max(1,r.length)*i.yieldMultiplier);o.goodDiesDelivered=Math.min(o.totalDies,o.goodDiesDelivered+d),this.state.rollingYieldHistory.push(Number(i.yieldMultiplier.toFixed(3))),this.state.rollingYieldHistory.length>5&&this.state.rollingYieldHistory.shift(),A.onWaferDelivered(this.state.questState,i.waferCount),r.every(u=>u.status==="COMPLETED")&&!n.includes(o)&&n.push(o)}}if(this.state.unlockedFeatures.mesAutoDispatch&&n.length>0)for(const i of n){const o=_.settleOrderPayout(i,i.goodDiesDelivered,this.state.player,this.state.staff,0,this.state.clawbackDebt);this.state.player.cash+=o.netPayout,this.state.clawbackDebt=o.remainingDebt,this.state.player.popularity=Math.min(100,this.state.player.popularity+1),A.onOrderFulfilled(this.state.questState),this.state.activeOrders=this.state.activeOrders.filter(l=>l.id!==i.id),this.state.activeLots=this.state.activeLots.filter(l=>l.orderId!==i.id)}}S.checkAchievements(this.state).newlyUnlocked.length>0&&this.uiManager.render(),this.autoSaveTimer+=1,this.autoSaveTimer>=10&&(this.autoSaveTimer=0,$.saveToLocalStorage(this.state)),this.uiManager.render(),this.cleanroomScene.updateState(this.state)}handleMachineClick(t){Z.show(t,this.state,()=>this.onStateChanged())}onStateChanged(){$.saveToLocalStorage(this.state),this.cleanroomScene.updateState(this.state),this.uiManager.render()}}window.addEventListener("DOMContentLoaded",()=>{new ee});
