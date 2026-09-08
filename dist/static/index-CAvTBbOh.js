var z=Object.defineProperty;var Q=(T,t,e)=>t in T?z(T,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):T[t]=e;var y=(T,t,e)=>Q(T,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function e(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(a){if(a.ep)return;a.ep=!0;const n=e(a);fetch(a.href,n)}})();class M{static getRequiredRankWeight(t){return t<=2?1:t<=4?2:t===5?3:4}static checkTPMConditions(t,e){if(!e)return{isTPMActive:!1,reason:"未指派工程師進駐"};if(e.moduleSpecialty!==t.category)return{isTPMActive:!1,reason:`專長不符！該機台為 ${t.category}，工程師專精為 ${e.moduleSpecialty}`};const s=this.getRequiredRankWeight(t.tier),a=this.RANK_WEIGHT[e.rank];return a<s?{isTPMActive:!1,reason:`職等不足！機台需等級 ${s}，該工程師為 ${e.rank} (等級 ${a})`}:e.fatigue>=50?{isTPMActive:!1,reason:`工程師疲勞度過高 (${e.fatigue} >= 50)，在線預防保養中斷`}:e.shiftMode!=="THREE_SHIFT"?{isTPMActive:!1,reason:"非三班輪調制（超時兩班制疲勞將持續爬升，無法達成 24H 永久零故障保障）"}:{isTPMActive:!0,reason:"🛡️ 滿足專長相符、資歷合規、三班輪調低疲勞，享有 24 小時不停機零故障保障！"}}static checkExplosionRisk(t,e){if(!e)return{hasRisk:!1,rankDiff:0};const s=this.getRequiredRankWeight(t.tier),a=this.RANK_WEIGHT[e.rank],n=s-a;return{hasRisk:n>=2,rankDiff:n}}static updateMachineHealth(t,e,s=1){const{isTPMActive:a}=this.checkTPMConditions(t,e);if(a){const p=Math.min(t.wear,5),u=100-p;return{newWear:p,healthPercent:u,isTPMActive:!0,breakdownOccurred:!1,isExploded:!1}}let r=Math.min(100,t.wear+.005*s);const i=100-r,o=(r/100)**2*.05*(s/60),l=Math.random()<o;let c=!1;if(l&&e){const p=this.getRequiredRankWeight(t.tier),u=this.RANK_WEIGHT[e.rank];p-u>=2&&Math.random()<.25&&(c=!0)}return{newWear:Number(r.toFixed(2)),healthPercent:Number(i.toFixed(2)),isTPMActive:!1,breakdownOccurred:l,isExploded:c}}static calculateOverhaulCost(t){return Math.round(t*.15)}}y(M,"RANK_WEIGHT",{"Young Specialist":1,"Skilled Worker":2,"Senior Engineer":3,Fellow:4});const k={machines:{litho_contact:{path:"./assets/machines/litho_contact.png",label:"Contact Aligner",tier:1},litho_projection:{path:"./assets/machines/litho_projection.png",label:"1x Projection Aligner",tier:1},litho_gline:{path:"./assets/machines/litho_gline.png",label:"G-Line Stepper",tier:2},litho_iline:{path:"./assets/machines/litho_iline.png",label:"I-Line Stepper",tier:3},litho_krf:{path:"./assets/machines/litho_krf.png",label:"KrF DUV Scanner",tier:4},litho_arfdry:{path:"./assets/machines/litho_arfdry.png",label:"ArF Dry Scanner",tier:4},litho_arfi:{path:"./assets/machines/litho_arfi.png",label:"ArFi Immersion TWINSCAN",tier:5},litho_euv:{path:"./assets/machines/litho_euv.png",label:"EUV Scanner (無標誌 2.5D 旗艦)",tier:6},litho_highna:{path:"./assets/machines/litho_highna.png",label:"High-NA EUV Scanner",tier:6},track_manual:{path:"./assets/machines/track_manual.png",label:"手動旋塗熱板台",tier:1},track_single:{path:"./assets/machines/track_clean.png",label:"單軌自動塗膠顯影機",tier:2},track_dual:{path:"./assets/machines/track_dual.png",label:"雙軌連線 Track",tier:3},track_clean:{path:"./assets/machines/track_clean.png",label:"多工位精密 Clean Track",tier:4},track_advanced:{path:"./assets/machines/track_advanced.png",label:"先進極限分子級 Track",tier:6},etch_wet:{path:"./assets/machines/etch_wet.png",label:"濕式酸槽清洗台",tier:1},etch_plasma:{path:"./assets/machines/etch_plasma.png",label:"電漿乾式蝕刻機 (RIE)",tier:3},film_furnace:{path:"./assets/machines/film_furnace.png",label:"高溫熱氧化爐管",tier:1},film_pecvd:{path:"./assets/machines/film_pecvd.png",label:"電漿化學沉積 / ALD 機",tier:4},diff_furnace:{path:"./assets/machines/diff_furnace.png",label:"熱擴散高溫爐管",tier:1},diff_implanter:{path:"./assets/machines/diff_implanter.png",label:"大束流離子佈植機",tier:2},cmp_polisher:{path:"./assets/machines/cmp_polisher.png",label:"化學機械平坦化研磨機",tier:3}},characters:{tech_cleanroom:{path:"./assets/characters/tech_cleanroom.png",label:"Cleanroom Technician"},agv_carrier:{path:"./assets/characters/agv_carrier.png",label:"AGV Wafer Carrier"},oht_shuttle:{path:"./assets/characters/oht_shuttle.png",label:"OHT Sky-Rail Shuttle"},tech_walk:{path:"./assets/characters/tech_walk.svg",frameWidth:128,frameHeight:128,frameCount:4},tech_carry:{path:"./assets/characters/tech_carry.svg",frameWidth:128,frameHeight:128,frameCount:4},tech_pm:{path:"./assets/characters/tech_pm.svg",frameWidth:128,frameHeight:128,frameCount:4},tech_repair:{path:"./assets/characters/tech_repair.svg",frameWidth:128,frameHeight:128,frameCount:4},tech_fatigue:{path:"./assets/characters/tech_fatigue.svg",frameWidth:128,frameHeight:128,frameCount:4},agv_drive:{path:"./assets/characters/agv_drive.svg",frameWidth:128,frameHeight:128,frameCount:4},oht_shuttle_svg:{path:"./assets/characters/oht_shuttle.svg",frameWidth:128,frameHeight:128,frameCount:4}}};class b{static getContext(){if(this.isMuted)return null;if(!this.audioCtx){const t=window.AudioContext||window.webkitAudioContext;t&&(this.audioCtx=new t)}return this.audioCtx&&this.audioCtx.state==="suspended"&&this.audioCtx.resume(),this.audioCtx}static toggleMute(){return this.isMuted=!this.isMuted,this.isMuted}static isAudioMuted(){return this.isMuted}static playClick(){const t=this.getContext();if(!t)return;const e=t.createOscillator(),s=t.createGain(),a=t.currentTime;e.type="sine",e.frequency.setValueAtTime(800,a),e.frequency.exponentialRampToValueAtTime(1200,a+.04),s.gain.setValueAtTime(.15,a),s.gain.exponentialRampToValueAtTime(.001,a+.04),e.connect(s),s.connect(t.destination),e.start(a),e.stop(a+.04)}static playCoin(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.createOscillator(),a=t.createOscillator(),n=t.createGain();s.type="sine",s.frequency.setValueAtTime(987.77,e),s.frequency.setValueAtTime(1318.51,e+.08),a.type="triangle",a.frequency.setValueAtTime(1975.53,e+.08),n.gain.setValueAtTime(.2,e),n.gain.exponentialRampToValueAtTime(.001,e+.28),s.connect(n),a.connect(n),n.connect(t.destination),s.start(e),s.stop(e+.28),a.start(e+.08),a.stop(e+.28)}static playCoinChime(){this.playCoin()}static playSuccess(){const t=this.getContext();if(!t)return;const e=t.currentTime;[523.25,659.25,783.99,1046.5].forEach((a,n)=>{const r=t.createOscillator(),i=t.createGain(),o=e+n*.08;r.type="triangle",r.frequency.setValueAtTime(a,o),i.gain.setValueAtTime(.2,o),i.gain.exponentialRampToValueAtTime(.001,o+.35),r.connect(i),i.connect(t.destination),r.start(o),r.stop(o+.35)})}static playFanfare(){this.playSuccess()}static playWarning(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.createOscillator(),a=t.createGain();s.type="sawtooth",s.frequency.setValueAtTime(440,e),s.frequency.setValueAtTime(554.37,e+.1),a.gain.setValueAtTime(.12,e),a.gain.exponentialRampToValueAtTime(.001,e+.25),s.connect(a),a.connect(t.destination),s.start(e),s.stop(e+.25)}static playCriticalAlarm(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.createOscillator(),a=t.createGain();s.type="sawtooth",s.frequency.setValueAtTime(600,e),s.frequency.linearRampToValueAtTime(950,e+.18),s.frequency.linearRampToValueAtTime(600,e+.36),a.gain.setValueAtTime(.18,e),a.gain.exponentialRampToValueAtTime(.001,e+.4),s.connect(a),a.connect(t.destination),s.start(e),s.stop(e+.4)}static playExplosion(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.sampleRate*.6,a=t.createBuffer(1,s,t.sampleRate),n=a.getChannelData(0);for(let l=0;l<s;l++)n[l]=Math.random()*2-1;const r=t.createBufferSource();r.buffer=a;const i=t.createBiquadFilter();i.type="lowpass",i.frequency.setValueAtTime(800,e),i.frequency.exponentialRampToValueAtTime(40,e+.6);const o=t.createGain();o.gain.setValueAtTime(.4,e),o.gain.exponentialRampToValueAtTime(.001,e+.6),r.connect(i),i.connect(o),o.connect(t.destination),r.start(e),r.stop(e+.6)}static playRework(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.sampleRate*.4,a=t.createBuffer(1,s,t.sampleRate),n=a.getChannelData(0);for(let l=0;l<s;l++)n[l]=Math.random()*2-1;const r=t.createBufferSource();r.buffer=a;const i=t.createBiquadFilter();i.type="bandpass",i.frequency.setValueAtTime(1200,e),i.frequency.exponentialRampToValueAtTime(300,e+.4),i.Q.value=3;const o=t.createGain();o.gain.setValueAtTime(.2,e),o.gain.exponentialRampToValueAtTime(.001,e+.4),r.connect(i),i.connect(o),o.connect(t.destination),r.start(e),r.stop(e+.4)}}y(b,"audioCtx",null),y(b,"isMuted",!1);const G=class G extends Phaser.Scene{constructor(){super({key:G.KEY});y(this,"saveGame");y(this,"tileWidth",140);y(this,"tileHeight",70);y(this,"floorGraphics");y(this,"railGraphics");y(this,"machineMap",new Map);y(this,"technicians",[]);y(this,"ohtShuttles",[]);y(this,"agvCarriers",[]);y(this,"isDragging",!1);y(this,"dragStartX",0);y(this,"dragStartY",0);y(this,"onMachineClickCallback")}init(e){this.saveGame=e.saveGame,this.onMachineClickCallback=e.onMachineClick}preload(){for(const[e,s]of Object.entries(k.machines))this.textures.exists(e)||this.load.image(e,s.path);for(const[e,s]of Object.entries(k.characters))!this.textures.exists(e)&&s.path&&this.load.image(e,s.path)}create(){this.floorGraphics=this.add.graphics(),this.railGraphics=this.add.graphics(),this.renderFloor(),this.renderOHTRails(),this.renderMachines(),this.spawnTechnicians(),this.spawnAGVCarriers(),this.spawnOHTShuttles(),this.cameras.main.centerOn(0,200),this.cameras.main.setZoom(.95),this.setupCameraControls(),this.scale.on("resize",this.onResize,this)}toScreen(e,s){const a=(e-s)*(this.tileWidth/2),n=(e+s)*(this.tileHeight/2);return{x:a,y:n}}renderFloor(){this.floorGraphics.clear();const e=this.saveGame.facility.bayGridSize;for(let n=0;n<e.width;n++)for(let r=0;r<e.height;r++){const{x:i,y:o}=this.toScreen(n,r),l=r<=3&&n>=2&&n<=5,c={x:i,y:o-this.tileHeight/2},p={x:i+this.tileWidth/2,y:o},u={x:i,y:o+this.tileHeight/2},h={x:i-this.tileWidth/2,y:o};l?(this.floorGraphics.fillStyle(2562309,.95),this.floorGraphics.lineStyle(1.5,16096779,.45)):(this.floorGraphics.fillStyle((n+r)%2===0?594210:792109,.95),this.floorGraphics.lineStyle(1,1976635,.5)),this.floorGraphics.beginPath(),this.floorGraphics.moveTo(c.x,c.y),this.floorGraphics.lineTo(p.x,p.y),this.floorGraphics.lineTo(u.x,u.y),this.floorGraphics.lineTo(h.x,h.y),this.floorGraphics.closePath(),this.floorGraphics.fillPath(),this.floorGraphics.strokePath()}const s=this.toScreen(3.5,1.5),a=this.add.text(s.x,s.y-40,"🟡 黃光微影作業專區 (LITHO BAY)",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"12px",color:"#fbbf24",stroke:"#000000",strokeThickness:3});a.setOrigin(.5),a.setDepth(10)}renderOHTRails(){this.railGraphics.clear();const e=this.saveGame.facility.bayGridSize,s=-160;this.railGraphics.lineStyle(2.5,440020,.35);const a=this.toScreen(1,1),n=this.toScreen(e.width-2,1),r=this.toScreen(e.width-2,e.height-2),i=this.toScreen(1,e.height-2);this.railGraphics.beginPath(),this.railGraphics.moveTo(a.x,a.y+s),this.railGraphics.lineTo(n.x,n.y+s),this.railGraphics.lineTo(r.x,r.y+s),this.railGraphics.lineTo(i.x,i.y+s),this.railGraphics.closePath(),this.railGraphics.strokePath()}renderMachines(){const e=new Map(this.saveGame.staff.map(s=>[s.id,s]));for(const s of this.saveGame.machines){const{x:a,y:n}=this.toScreen(s.gridX,s.gridY),r=(s.gridX+s.gridY)*10+50;let i=this.machineMap.get(s.id);if(i){if(i.ledArc.setFillStyle(this.getLEDColor(s.status)),i.label.setText(`${s.name} (${Math.round(s.wear)}%)`),s.status==="PROCESSING"){if(!i.processingText){const c=this.add.text(0,-110,"⚡ 加工中",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#38bdf8",backgroundColor:"rgba(8, 47, 73, 0.95)",padding:{x:5,y:2}});c.setOrigin(.5),i.container.add(c),i.processingText=c}}else i.processingText&&(i.processingText.destroy(),i.processingText=void 0);const o=s.assignedEngineerId?e.get(s.assignedEngineerId):null,l=M.checkTPMConditions(s,o);if(l.isTPMActive&&!i.tpmText){const c=this.add.text(0,-125,"🛡️ TPM 零故障",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#10b981",backgroundColor:"rgba(6, 78, 59, 0.9)",padding:{x:5,y:2}});c.setOrigin(.5),i.container.add(c),i.tpmText=c}else!l.isTPMActive&&i.tpmText&&(i.tpmText.destroy(),i.tpmText=void 0)}else{const o=this.add.container(a,n);o.setDepth(r);const l=this.add.ellipse(0,10,this.tileWidth*.7,this.tileHeight*.5,0,.4);o.add(l);let c;if(this.textures.exists(s.modelId)){c=this.add.image(0,-35,s.modelId);const x=Math.max(c.width,c.height),w=this.tileWidth*1.1/Math.max(1,x);c.setScale(w),o.add(c)}else{const x=this.createFallbackMachineGraphic(s);o.add(x)}const p=this.getLEDColor(s.status),u=this.add.circle(0,-90,6,p);o.add(u);const h=this.add.text(0,15,`${s.name} (${Math.round(s.wear)}%)`,{fontFamily:"Noto Sans TC, sans-serif",fontSize:"11px",fontStyle:"bold",color:"#f8fafc",backgroundColor:"rgba(15, 23, 42, 0.85)",padding:{x:6,y:3}});h.setOrigin(.5),o.add(h);const d=s.assignedEngineerId?e.get(s.assignedEngineerId):null,m=M.checkTPMConditions(s,d);let f;m.isTPMActive&&(f=this.add.text(0,-110,"🛡️ TPM 零故障",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#10b981",backgroundColor:"rgba(6, 78, 59, 0.9)",padding:{x:5,y:2}}),f.setOrigin(.5),o.add(f));let g;s.status==="PROCESSING"&&(g=this.add.text(0,-110,"⚡ 加工中",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#38bdf8",backgroundColor:"rgba(8, 47, 73, 0.95)",padding:{x:5,y:2}}),g.setOrigin(.5),o.add(g)),o.setSize(this.tileWidth*.8,this.tileHeight*1.8),o.setInteractive({useHandCursor:!0}),o.on("pointerover",()=>{c&&c.setTint(3718648)}),o.on("pointerout",()=>{c&&c.clearTint()}),o.on("pointerdown",()=>{b.playClick(),this.onMachineClickCallback&&this.onMachineClickCallback(s)}),this.machineMap.set(s.id,{container:o,ledArc:u,label:h,tpmText:f,processingText:g,sprite:c})}}}createFallbackMachineGraphic(e){const s=this.add.graphics(),a=60;let n=3900150;return e.category==="LITHO"&&(n=16096779),e.category==="TRACK"&&(n=1096065),e.category==="ETCH"&&(n=9133302),e.category==="DIFF"&&(n=15485081),e.category==="CMP"&&(n=440020),s.fillStyle(n,.9),s.beginPath(),s.moveTo(0,-70),s.lineTo(a/2,-60),s.lineTo(0,-50),s.lineTo(-a/2,-60),s.closePath(),s.fillPath(),s.fillStyle(n,.7),s.beginPath(),s.moveTo(-a/2,-60),s.lineTo(0,-50),s.lineTo(0,0),s.lineTo(-a/2,-10),s.closePath(),s.fillPath(),s.fillStyle(n,.5),s.beginPath(),s.moveTo(0,-50),s.lineTo(a/2,-60),s.lineTo(a/2,-10),s.lineTo(0,0),s.closePath(),s.fillPath(),s}getLEDColor(e){switch(e){case"IDLE":return 1096065;case"PROCESSING":return 440020;case"MAINTENANCE":return 16096779;case"EXPLODED":return 15680580}}spawnTechnicians(){const e=Math.min(6,Math.max(2,this.saveGame.staff.length));for(let s=0;s<e;s++){const a=this.add.container(0,0);a.setDepth(200);const n=this.add.ellipse(0,4,18,9,0,.35);if(a.add(n),this.textures.exists("tech_cleanroom")){const i=this.add.image(0,-18,"tech_cleanroom");i.setDisplaySize(48,48),a.add(i)}else{const i=this.add.circle(0,-12,8,16317180),o=this.add.rectangle(0,-12,8,4,3718648),l=this.add.rectangle(0,-4,12,12,14870768);a.add([l,i,o])}const r=this.toScreen(2+s,3);a.setPosition(r.x,r.y),this.technicians.push({container:a,targetX:r.x,targetY:r.y,speed:.6+Math.random()*.4})}}spawnAGVCarriers(){if(this.saveGame.unlockedFeatures.agv)for(let e=0;e<2;e++){const s=this.add.container(0,0);s.setDepth(205);const a=this.add.ellipse(0,4,24,12,0,.4);if(s.add(a),this.textures.exists("agv_carrier")){const r=this.add.image(0,-14,"agv_carrier");r.setDisplaySize(54,40),s.add(r)}else{const r=this.add.rectangle(0,-8,28,16,165063),i=this.add.rectangle(0,-18,16,12,1096065),o=this.add.circle(10,-8,3,15680580);s.add([r,i,o])}const n=this.toScreen(1+e*3,2);s.setPosition(n.x,n.y),this.agvCarriers.push({container:s,targetX:n.x,targetY:n.y,speed:1.1+e*.2})}}spawnOHTShuttles(){const e=this.add.container(0,-160);if(e.setDepth(500),this.textures.exists("oht_shuttle")){const a=this.add.image(0,16,"oht_shuttle");a.setDisplaySize(56,42),e.add(a)}else{const a=this.add.rectangle(0,0,8,12,4674921),n=this.add.rectangle(0,10,32,18,959977),r=this.add.rectangle(0,22,20,16,1096065),i=this.add.circle(12,10,3,2278750);e.add([a,n,r,i])}const s=this.toScreen(1,1);e.setPosition(s.x,s.y-160),this.ohtShuttles.push({container:e,progress:0,speed:.002})}update(e,s){const a=this.saveGame.facility.bayGridSize,n=[this.toScreen(1,1),this.toScreen(a.width-2,1),this.toScreen(a.width-2,a.height-2),this.toScreen(1,a.height-2)];for(const r of this.ohtShuttles){r.progress=(r.progress+r.speed*(s/16))%1;const i=n.length,o=Math.floor(r.progress*i),l=(o+1)%i,c=r.progress*i%1,p=n[o],u=n[l],h=p.x+(u.x-p.x)*c,d=p.y+(u.y-p.y)*c-160;r.container.setPosition(h,d)}for(const r of this.technicians){const i=r.targetX-r.container.x,o=r.targetY-r.container.y,l=Math.sqrt(i*i+o*o);if(l<4){const c=Math.floor(Math.random()*(a.width-2))+1,p=Math.floor(Math.random()*(a.height-2))+1,u=this.toScreen(c,p);r.targetX=u.x,r.targetY=u.y}else r.container.x+=i/l*r.speed*(s/16),r.container.y+=o/l*r.speed*(s/16)}for(const r of this.agvCarriers){const i=r.targetX-r.container.x,o=r.targetY-r.container.y,l=Math.sqrt(i*i+o*o);if(l<4){const c=Math.floor(Math.random()*(a.width-2))+1,p=Math.floor(Math.random()*(a.height-2))+1,u=this.toScreen(c,p);r.targetX=u.x,r.targetY=u.y}else r.container.x+=i/l*r.speed*(s/16),r.container.y+=o/l*r.speed*(s/16)}}setupCameraControls(){this.input.on("pointerdown",e=>{e.button===0&&(this.isDragging=!0,this.dragStartX=e.x,this.dragStartY=e.y)}),this.input.on("pointermove",e=>{if(this.isDragging){const s=e.x-this.dragStartX,a=e.y-this.dragStartY;this.cameras.main.scrollX-=s/this.cameras.main.zoom,this.cameras.main.scrollY-=a/this.cameras.main.zoom,this.dragStartX=e.x,this.dragStartY=e.y}}),this.input.on("pointerup",()=>{this.isDragging=!1}),this.input.on("wheel",(e,s,a,n)=>{const r=Phaser.Math.Clamp(this.cameras.main.zoom-n*.001,.5,2.2);this.cameras.main.setZoom(r)})}onResize(e){this.cameras.main.setSize(e.width,e.height)}updateState(e){this.saveGame=e,this.renderMachines(),this.saveGame.unlockedFeatures.agv&&this.agvCarriers.length===0&&this.spawnAGVCarriers()}};y(G,"KEY","CleanroomScene");let H=G;class I{static getInitialAchievements(){return JSON.parse(JSON.stringify(this.INITIAL_ACHIEVEMENTS))}static checkAchievements(t){const e=[],s=new Map;for(const l of t.achievements)s.set(l.id,l);const a=l=>{const c=s.get(l);c&&!c.unlocked&&(c.unlocked=!0,e.push(c))};t.rollingYieldHistory.length>=1&&a("first_silicon"),(t.activeLots.some(l=>l.currentStation==="LIT"||l.currentStation==="ETCH"||l.currentStation==="DIFF")||t.rollingYieldHistory.length>=1)&&a("step_into_yellow");const r=t.activeOrders.filter(l=>l.status==="FULFILLED");r.length>=1&&a("first_cash"),t.unlockedFeatures.mesAutoDispatch&&a("mes_mastery"),r.some(l=>l.nodeNm<=350)&&a("submicron_explorer"),t.unlockedFeatures.cmp&&t.machines.some(l=>l.category==="CMP")&&a("copper_cmp_era"),t.machines.some(l=>l.modelId==="litho_arfi")&&a("immersion_wave"),t.machines.some(l=>l.modelId==="litho_euv"||l.modelId==="litho_highna")&&a("euv_domination");const i=new Map(t.staff.map(l=>[l.id,l]));let o=0;for(const l of t.machines){const c=l.assignedEngineerId?i.get(l.assignedEngineerId):null;M.checkTPMConditions(l,c).isTPMActive&&o++}if(o>=3&&a("tpm_zero_defect"),t.machines.some(l=>{var c;return l.category==="LITHO"&&(((c=l.pairedTrackIds)==null?void 0:c.length)??0)>=2})&&a("inline_cluster_master"),t.facility.cleanroomPhase>=4&&a("gigafab_expansion"),t.unlockedFeatures.agv&&t.unlockedFeatures.oht&&a("automation_highway"),t.rollingYieldHistory.some(l=>l>=.99)&&a("flawless_wafer"),t.rollingYieldHistory.length>=5){const l=t.rollingYieldHistory.slice(-5);l.reduce((p,u)=>p+u,0)/l.length>=.95&&a("five_star_foundry")}return t.player.cash>=1e8&&a("trillion_chip_dynasty"),{newlyUnlocked:e}}static triggerManualUnlock(t,e){const s=t.find(a=>a.id===e);return s&&!s.unlocked?(s.unlocked=!0,!0):!1}static claimReward(t,e){const s=t.find(a=>a.id===e);return s?s.unlocked?s.claimed?{success:!1,cash:0,message:"該成就獎勵已領取"}:(s.claimed=!0,{success:!0,cash:s.rewardCash,message:`🏆 成功領取成就【${s.title}】獎勵！獲得獎勵金 NT$ ${s.rewardCash.toLocaleString()}！`}):{success:!1,cash:0,message:"尚未達成該成就解鎖條件"}:{success:!1,cash:0,message:"找不到該成就"}}}y(I,"INITIAL_ACHIEVEMENTS",[{id:"first_silicon",category:"onboarding",title:"矽島啟航 (First Silicon)",description:"成功在廠房內完成並產出第一批晶圓。",rewardCash:5e4,unlocked:!1,claimed:!1},{id:"step_into_yellow",category:"onboarding",title:"邁入黃光密室 (Yellow Room Entry)",description:"首次完成微影站塗膠、曝光與顯影連線作業。",rewardCash:8e4,unlocked:!1,claimed:!1},{id:"first_cash",category:"onboarding",title:"首桶金進帳 (First Cash Delivery)",description:"成功履約第一張客戶製造合約並取得全額尾款。",rewardCash:1e5,unlocked:!1,claimed:!1},{id:"mes_mastery",category:"onboarding",title:"智慧製造大師 (MES Mastery)",description:"完成新手教學，解鎖並啟用 MES 智慧自動派工系統。",rewardCash:15e4,unlocked:!1,claimed:!1},{id:"submicron_explorer",category:"process",title:"突破次微米壁壘 (Sub-micron Explorer)",description:"成功承接並交付線寬 <= 350nm 之高階次微米訂單。",rewardCash:5e5,unlocked:!1,claimed:!1},{id:"copper_cmp_era",category:"process",title:"銅導線與平坦化時代 (CMP Era)",description:"解鎖並在廠房內運作 CMP 化學機械平坦化拋光設備。",rewardCash:1e6,unlocked:!1,claimed:!1},{id:"immersion_wave",category:"process",title:"水中折射奇蹟 (Immersion Wave)",description:"購買並安裝 Tier 5 ArFi 浸潤微影雙工件台設備 (TWINSCAN)。",rewardCash:5e6,unlocked:!1,claimed:!1},{id:"euv_domination",category:"process",title:"極紫外神之光 (EUV Domination)",description:"購買並啟用極紫外光微影巨獸 (EUV Scanner)。",rewardCash:2e7,unlocked:!1,claimed:!1},{id:"tpm_zero_defect",category:"operation",title:"零非計畫停機殿堂 (TPM Zero-Defect)",description:"同時維持 3 台以上機台處於 🛡️ TPM 24H 零故障在線維護保障狀態。",rewardCash:2e6,unlocked:!1,claimed:!1},{id:"inline_cluster_master",category:"operation",title:"雙軌並聯突破極限 (Inline Cluster Master)",description:"為微影機台並聯配套綁定 2 台以上 Track 塗膠顯影設備，消除產能瓶頸。",rewardCash:15e5,unlocked:!1,claimed:!1},{id:"gigafab_expansion",category:"operation",title:"GigaFab 超級晶圓廠 (GigaFab Expansion)",description:"將潔淨室無塵廠房拓建至 Phase 4 (24x24 巨型潔淨室)。",rewardCash:1e7,unlocked:!1,claimed:!1},{id:"automation_highway",category:"operation",title:"自動化天軌物流 (Automation Highway)",description:"同時解鎖地面 AGV 自走車與天花板 OHT 懸吊天軌系統。",rewardCash:3e6,unlocked:!1,claimed:!1},{id:"flawless_wafer",category:"yield",title:"神級黃金良率 (Flawless Wafer 99%+)",description:"成功生產交付一批最終良率達 99% 以上的頂級晶圓。",rewardCash:1e6,unlocked:!1,claimed:!1},{id:"rework_savior",category:"yield",title:"點石成金光阻重洗 (Rework Savior)",description:"成功對 Q-Time 逾期晶圓執行光阻重洗 (Rework)，拯救昂貴晶片免於報廢。",rewardCash:5e5,unlocked:!1,claimed:!1},{id:"five_star_foundry",category:"yield",title:"五星品質金字招牌 (Five-Star Foundry)",description:"累積至少 5 批出貨紀錄，且 RollingYieldIndex 滾動良率指數突破 95%！",rewardCash:8e6,unlocked:!1,claimed:!1},{id:"trillion_chip_dynasty",category:"yield",title:"稱霸全球矽島霸權 (Silicon Hegemony)",description:"總現金累積突破 NT$ 100,000,000，建立無可撼動的半導體傳奇帝國。",rewardCash:5e7,unlocked:!1,claimed:!1}]);class ${static createDefaultSave(t="矽島先進半導體",e="張創辦人",s="avatar_1"){const a=Date.now();return{schemaVersion:2,savedAt:a,lastOnlineTimestamp:a,player:{companyName:t,ceoName:e,avatarId:s,cash:5e7,foundryTier:1,popularity:100,unlockedK1:"BASE",unlockedCleanroomClass:"Class 10000"},unlockedFeatures:{cmp:!1,agv:!1,oht:!1,mesAutoDispatch:!1,mixAndMatchLitho:!1},facility:{cleanroomPhase:1,bayGridSize:{width:8,height:8}},machines:[{id:"mach_film_1",modelId:"film_furnace",name:"熱氧化爐 (Thermal Oxidation)",category:"FILM",tier:1,gridX:2,gridY:2,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_track_1",modelId:"track_clean",name:"手動旋塗熱板台 (Manual Track)",category:"TRACK",tier:1,gridX:3,gridY:2,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_litho_1",modelId:"litho_contact",name:"接觸式微影機 (Contact Aligner)",category:"LITHO",tier:1,gridX:4,gridY:2,wear:0,status:"IDLE",assignedEngineerId:"staff_1",pairedTrackIds:["mach_track_1"]},{id:"mach_etch_1",modelId:"etch_plasma",name:"電漿乾式蝕刻機 (Dry Plasma Etcher)",category:"ETCH",tier:1,gridX:3,gridY:4,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_diff_1",modelId:"diff_furnace",name:"擴散退火爐 (Diffusion Furnace)",category:"DIFF",tier:1,gridX:2,gridY:4,wear:0,status:"IDLE",assignedEngineerId:null}],staff:[{id:"staff_1",name:"林資深",rank:"Skilled Worker",moduleSpecialty:"LITHO",fatigue:10,shiftMode:"THREE_SHIFT",assignedMachineId:"mach_litho_1",salary:6e4}],activeOrders:[],activeLots:[],rollingYieldHistory:[],clawbackDebt:0,questState:{lastDateStr:new Date().toISOString().split("T")[0],dailyQuests:[],allDailyClaimed:!1,weeklyCompletedCount:0,weeklyTarget:15,weeklyClaimed:!1},achievements:I.getInitialAchievements(),gameTime:0}}static saveToLocalStorage(t){try{t.savedAt=Date.now(),t.lastOnlineTimestamp=Date.now();const e=JSON.stringify(t);return localStorage.setItem(this.STORAGE_KEY_V2,e),!0}catch(e){return console.error("LocalStorage 存檔失敗:",e),!1}}static loadFromLocalStorage(){try{const t=localStorage.getItem(this.STORAGE_KEY_V2);if(t){const s=JSON.parse(t);if(s.schemaVersion===2)return s}const e=localStorage.getItem(this.STORAGE_KEY_V1);if(e){const s=JSON.parse(e);if(s.schemaVersion===1){console.warn("偵測到舊版 SaveGameV1 存檔，執行自動升級至 SaveGameV2...");const a=this.migrateSaveV1toV2(s);return this.saveToLocalStorage(a),a}}return null}catch(t){return console.error("LocalStorage 讀檔失敗:",t),null}}static migrateSaveV1toV2(t){const e=new Date().toISOString().split("T")[0],s=t.machines.map(n=>({...n,pairedTrackIds:n.category==="LITHO"?[]:void 0})),a=t.activeOrders.map(n=>({...n,urgencyMultiplier:n.urgencyMultiplier??1,layerAllocations:[]}));return{schemaVersion:2,savedAt:t.savedAt??Date.now(),lastOnlineTimestamp:t.lastOnlineTimestamp??Date.now(),player:{...t.player},unlockedFeatures:{cmp:t.unlockedFeatures.cmp??!1,agv:t.unlockedFeatures.agv??!1,oht:t.unlockedFeatures.oht??!1,mesAutoDispatch:t.unlockedFeatures.mesAutoDispatch??!1,mixAndMatchLitho:!1},facility:{cleanroomPhase:t.facility.cleanroomPhase??1,bayGridSize:t.facility.bayGridSize??{width:8,height:8}},machines:s,staff:t.staff??[],activeOrders:a,activeLots:t.activeLots??[],rollingYieldHistory:t.rollingYieldHistory??[],clawbackDebt:t.clawbackDebt??0,questState:{lastDateStr:e,dailyQuests:[],allDailyClaimed:!1,weeklyCompletedCount:0,weeklyTarget:15,weeklyClaimed:!1},achievements:I.getInitialAchievements(),gameTime:t.gameTime??0}}static exportSaveToJson(t){return JSON.stringify(t,null,2)}static importSaveFromJson(t){try{const e=JSON.parse(t);return e.schemaVersion===2?{success:!0,state:e}:e.schemaVersion===1?{success:!0,state:this.migrateSaveV1toV2(e)}:{success:!1,error:"不相容的存檔格式版本！"}}catch(e){return{success:!1,error:`JSON 解析失敗: ${e.message}`}}}static calculateOfflineProgress(t,e){const s=Math.max(0,Math.floor((e-t.lastOnlineTimestamp)/1e3)),a=Math.min(14400,s),n={offlineDurationSeconds:a,lotsProcessed:0,wafersDelivered:0,revenueEarned:0,salaryPaid:0,utilityPaid:0,maintenanceExpense:0,debtRepaid:0,breakdownCount:0,explosionCount:0,tpmProtectedCount:0,netProfit:0};if(a<60)return n;const r=Math.floor(a/300),i=new Map(t.staff.map(m=>[m.id,m]));let o=0;for(const m of t.machines){const f=m.assignedEngineerId?i.get(m.assignedEngineerId):null;if(M.checkTPMConditions(m,f).isTPMActive)o++,m.wear=Math.min(5,m.wear),m.status="IDLE";else{const x=r*.4;m.wear=Math.min(100,m.wear+x),m.wear>=60&&Math.random()<.3&&(n.breakdownCount++,M.checkExplosionRisk(m,f).hasRisk&&Math.random()<.25?(n.explosionCount++,n.maintenanceExpense+=2e5*m.tier,m.status="EXPLODED"):(n.maintenanceExpense+=5e4*m.tier,m.status="MAINTENANCE"))}}n.tpmProtectedCount=o;const l=a/3600,c=t.staff.reduce((m,f)=>m+f.salary,0)/720,p=t.machines.length*15e3/720;if(n.salaryPaid=Math.round(c*l),n.utilityPaid=Math.round(p*l),t.unlockedFeatures.mesAutoDispatch&&t.activeOrders.length>0){const m=t.activeOrders.find(f=>f.status==="ACTIVE");if(m&&n.explosionCount===0){const f=Math.min(Math.floor(a/180),10);if(f>0){n.lotsProcessed=f;const g=f*5;n.wafersDelivered=g;const x=Math.round(g*100*m.unitPrice);n.revenueEarned=x;for(let w=0;w<f;w++)t.rollingYieldHistory.push(.92)}}}const u=n.revenueEarned,h=n.salaryPaid+n.utilityPaid+n.maintenanceExpense,d=u-h;if(d>0&&t.clawbackDebt>0){const m=Math.min(t.clawbackDebt,Math.round(d*.25));n.debtRepaid=m,t.clawbackDebt-=m}return n.netProfit=u-h-n.debtRepaid,t.player.cash=Math.max(0,t.player.cash+n.netProfit),t.gameTime+=a,t.lastOnlineTimestamp=e,t.savedAt=e,n}}y($,"STORAGE_KEY_V2","SILICON_TYCOON_SAVE_V2"),y($,"STORAGE_KEY_V1","SILICON_TYCOON_SAVE_V1");class O{static calculateEffectiveK1(t,e,s){let a=.8;switch(t){case"BASE":a=.8;break;case"CAR":a=.65;break;case"OPC":a=.5;break;case"PSM":a=.38;break;case"SAQP":a=.28;break}const r=Math.max(0,Math.min(100,e))/100*.05;let i=0,o=0;if(s&&s.moduleSpecialty==="LITHO")if(s.fatigue>=80)i=0,o=.03;else switch(s.rank){case"Young Specialist":i=.01;break;case"Skilled Worker":i=.02;break;case"Senior Engineer":i=.04;break;case"Fellow":i=.06;break}let l=a+r-i+o;return l=Math.max(t==="SAQP"?.15:.25,Math.min(.95,l)),{effectiveK1:Number(l.toFixed(3)),k1Tech:a,deltaWear:Number(r.toFixed(3)),deltaEngineer:Number(i.toFixed(3)),deltaFatigue:Number(o.toFixed(3))}}static calculateEffectiveCD(t,e,s,a){const n=this.OPTICAL_CATALOG[t];if(!n)return 999999;const{effectiveK1:r}=this.calculateEffectiveK1(e,s,a),i=r*(n.wavelengthNm/n.numericalAperture);return Math.round(i)}static validateResolution(t,e,s,a,n){if(!this.OPTICAL_CATALOG[t])return{canResolve:!1,effectiveCD:999999,effectiveK1:.8,reason:"未知的微影機台型號"};const{effectiveK1:i}=this.calculateEffectiveK1(s,a,n),o=this.calculateEffectiveCD(t,s,a,n);return o>e?{canResolve:!1,effectiveCD:o,effectiveK1:i,reason:`光學解析度不足！當前極限 CD 為 ${o}nm，無法解析目標 ${e}nm 製程（磨損或人員疲勞導致 k1 劣化至 ${i}）。`}:{canResolve:!0,effectiveCD:o,effectiveK1:i}}static getProcessWindowPenalty(t){if(t>=.38)return 0;const e=(.38-t)*.5;return Math.max(0,Math.min(.25,e))}}y(O,"OPTICAL_CATALOG",{litho_contact:{modelId:"litho_contact",name:"Contact Aligner (接觸式微影機)",wavelengthNm:436,numericalAperture:.116,baseRayleighLimitNm:3007,unlockTier:1,baseCost:25e5,baseMttrSec:10},litho_projection:{modelId:"litho_projection",name:"1x Projection Aligner (1:1 投影微影機)",wavelengthNm:436,numericalAperture:.194,baseRayleighLimitNm:1798,unlockTier:1,baseCost:6e6,baseMttrSec:15},litho_gline:{modelId:"litho_gline",name:"G-Line Stepper (步進縮小曝光機)",wavelengthNm:436,numericalAperture:.35,baseRayleighLimitNm:997,unlockTier:2,baseCost:18e6,baseMttrSec:20},litho_iline:{modelId:"litho_iline",name:"I-Line Stepper (高壓汞燈微影機)",wavelengthNm:365,numericalAperture:.5,baseRayleighLimitNm:584,unlockTier:3,baseCost:35e6,baseMttrSec:30},litho_krf:{modelId:"litho_krf",name:"KrF DUV Scanner (準分子雷射掃描機)",wavelengthNm:248,numericalAperture:.7,baseRayleighLimitNm:283,unlockTier:4,baseCost:85e6,baseMttrSec:40},litho_arfdry:{modelId:"litho_arfdry",name:"ArF Dry Scanner (氟化氬乾式微影機)",wavelengthNm:193,numericalAperture:.85,baseRayleighLimitNm:182,unlockTier:4,baseCost:18e7,baseMttrSec:50},litho_arfi:{modelId:"litho_arfi",name:"ArFi Immersion TWINSCAN (雙工件台浸潤微影機)",wavelengthNm:193,numericalAperture:1.35,baseRayleighLimitNm:114,unlockTier:5,baseCost:45e7,baseMttrSec:60},litho_euv:{modelId:"litho_euv",name:"EUV Scanner (極紫外真空微影機)",wavelengthNm:13.5,numericalAperture:.33,baseRayleighLimitNm:33,unlockTier:6,baseCost:25e8,baseMttrSec:90},litho_highna:{modelId:"litho_highna",name:"High-NA EUV Scanner (變形高數值孔徑微影機)",wavelengthNm:13.5,numericalAperture:.55,baseRayleighLimitNm:20,unlockTier:6,baseCost:6e9,baseMttrSec:120}});class S{static getStationSequence(t){return t?["FILM","LIT","ETCH","DIFF","CMP"]:["FILM","LIT","ETCH","DIFF"]}static calculateEffectiveQTimeSec(t,e,s,a){let n=30;t==="LIT"&&e==="ETCH"?n=30:t==="ETCH"&&e==="DIFF"?n=45:t==="CMP"&&(n=35);let r=1;a.includes("1000")&&!a.includes("10000")?r=1.15:a.includes("100")&&!a.includes("1000")?r=1.3:a.includes("1")&&!a.includes("10")&&(r=1.5);let i=1;return s>=1e3?i=1.5:s<=28&&(i=.8),Math.round(n*r*i)}static checkQTimeStatus(t,e,s){if(!t.qTimeDeadline)return{isOverdue:!1,overdueSeconds:0,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:1,urgencyLevel:"SAFE",remainingSeconds:999};const a=t.qTimeDeadline-s;if(a>=0){let o="SAFE";return a<=5?o="CRITICAL":a<=15&&(o="WARNING"),{isOverdue:!1,overdueSeconds:0,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:1,urgencyLevel:o,remainingSeconds:a}}const n=Math.abs(a),r=t.currentStation==="ETCH"||t.currentStation==="LIT"&&t.litSubStep==="DEVELOP",i=Math.round(e.unitPrice*(e.totalDies/Math.max(1,e.layerCount))*.05*(t.waferCount/25));return n<=15?{isOverdue:!0,overdueSeconds:n,isFatal:!1,canRework:r,reworkCost:i,penaltyYieldRatio:.65,urgencyLevel:"EXPIRED",remainingSeconds:0}:r?{isOverdue:!0,overdueSeconds:n,isFatal:!0,canRework:!0,reworkCost:i,penaltyYieldRatio:0,urgencyLevel:"EXPIRED",remainingSeconds:0}:{isOverdue:!0,overdueSeconds:n,isFatal:!0,canRework:!1,reworkCost:0,penaltyYieldRatio:0,urgencyLevel:"EXPIRED",remainingSeconds:0}}static executeReworkLot(t,e){return t.currentStation="LIT",t.litSubStep="COAT",t.qTimeDeadline=null,t.status="PROCESSING",t.yieldMultiplier=Math.max(.85,t.yieldMultiplier*.95),{success:!0,message:`成功救回批次 ${t.lotId}！耗費溶劑費 NT$ ${e.toLocaleString()}，已退回黃光塗膠站重新加工。`}}static advanceLotStation(t,e,s,a,n){const r=this.getStationSequence(e);if(t.currentStation==="LIT"){if(!t.litSubStep||t.litSubStep==="COAT")return t.litSubStep="EXPOSE",t.qTimeDeadline=null,{nextStation:"LIT",nextSubStep:"EXPOSE",isLayerCompleted:!1,isLotCompleted:!1};if(t.litSubStep==="EXPOSE")return t.litSubStep="DEVELOP",t.qTimeDeadline=null,{nextStation:"LIT",nextSubStep:"DEVELOP",isLayerCompleted:!1,isLotCompleted:!1};if(t.litSubStep==="DEVELOP"){t.currentStation="ETCH",t.litSubStep=void 0;const o=this.calculateEffectiveQTimeSec("LIT","ETCH",s,a);return t.qTimeDeadline=n+o,{nextStation:"ETCH",isLayerCompleted:!1,isLotCompleted:!1}}}const i=r.indexOf(t.currentStation);if(i>=0&&i<r.length-1){const o=r[i+1];if(t.currentStation=o,o==="LIT"&&(t.litSubStep="COAT"),t.currentStation==="DIFF"){const l=this.calculateEffectiveQTimeSec("ETCH","DIFF",s,a);t.qTimeDeadline=n+l}else t.qTimeDeadline=null;return{nextStation:o,isLayerCompleted:!1,isLotCompleted:!1}}return t.currentLayer<t.totalLayers?(t.currentLayer+=1,t.currentStation="FILM",t.litSubStep=void 0,t.qTimeDeadline=null,{nextStation:"FILM",isLayerCompleted:!0,isLotCompleted:!1}):(t.status="COMPLETED",t.qTimeDeadline=null,{nextStation:t.currentStation,isLayerCompleted:!0,isLotCompleted:!0})}static calculateStationThroughputs(t,e,s){var l;const a=["FILM","TRACK","LIT","ETCH","DIFF","CMP"],n={FILM:{station:"FILM",totalCapacity:0,machineCount:0,isChokePoint:!1},TRACK:{station:"TRACK",totalCapacity:0,machineCount:0,isChokePoint:!1},LIT:{station:"LIT",totalCapacity:0,machineCount:0,isChokePoint:!1},ETCH:{station:"ETCH",totalCapacity:0,machineCount:0,isChokePoint:!1},DIFF:{station:"DIFF",totalCapacity:0,machineCount:0,isChokePoint:!1},CMP:{station:"CMP",totalCapacity:0,machineCount:0,isChokePoint:!1}},r=new Map;for(const c of e)r.set(c.id,c);for(const c of t){if(c.status==="EXPLODED")continue;let p=c.category;c.category==="LITHO"&&(p="LIT");const u=((l=this.BASE_THROUGHPUT_BY_TIER[p])==null?void 0:l[c.tier])??10,h=1-c.wear/100*.3;let d=1;if(c.assignedEngineerId&&r.has(c.assignedEngineerId)){const f=r.get(c.assignedEngineerId);f.moduleSpecialty===c.category&&f.fatigue<80&&(d=1.2)}p==="LIT"&&c.pairedTrackIds&&c.pairedTrackIds.length>=2&&(d+=.05);const m=u*h*d;n[p].totalCapacity+=m,n[p].machineCount+=1}let i=1/0,o="TRACK";for(const c of a)c==="CMP"&&!s||n[c].totalCapacity<i&&(i=n[c].totalCapacity,o=c);return i<1/0&&o&&(n[o].isChokePoint=!0),n}static calculateLogisticsFactor(t,e,s){let a=.5;t.oht?a=1.2:t.agv&&(a=.85);let n=5;if(e.length>=2){let o=0,l=0;for(let c=0;c<e.length-1;c++){const p=Math.abs(e[c].gridX-e[c+1].gridX)+Math.abs(e[c].gridY-e[c+1].gridY);o+=p,l++}n=l>0?o/l:5}const r=Math.max(.6,Math.min(1.1,6/Math.max(2,n))),i=Math.min(.2,s*.02);return Number((a*r*(1-i)).toFixed(2))}static calculateFactoryWorkload(t,e,s,a,n){const r=this.calculateStationThroughputs(t,e,n),i=this.calculateLogisticsFactor(a,t,s.length),o=["FILM","TRACK","LIT","ETCH","DIFF"];n&&o.push("CMP");let l=1/0;for(const d of o){const m=r[d].totalCapacity;m<l&&(l=m)}const c=Math.max(1,l*i);let p=0;for(const d of s)(d.status==="PROCESSING"||d.status==="WAITING_QTIME"||d.status==="TRANSPORTING")&&(p+=d.waferCount);const u=Math.min(150,Math.round(p/c*100));let h="SMOOTH";return u>85?h="OVERLOADED":u>=70&&(h="HEAVY"),{workloadPercent:u,maxCapacityWafersPerMin:Math.round(c),totalDemandWafers:p,statusLevel:h,throughputs:r}}static diagnoseBottleneck(t,e,s,a,n){var d;const{workloadPercent:r,throughputs:i}=this.calculateFactoryWorkload(t,e,s,a,n),o=t.find(m=>m.wear>=70);if(o){const m=o.category==="LITHO"?"LIT":o.category;return{category:"MAINTENANCE",title:"機台嚴重老化致效能衰退",stationName:o.category,description:`【${o.name}】磨損度高達 ${o.wear}%，抽真空與加工速率嚴重衰退超過 20%！`,recommendation:"請立即指派工程師對該機台執行「就地大修（Overhaul）」或保養，恢復 100% 原始效能。",workloadPercent:r,chokePointThroughput:Math.round(((d=i[m])==null?void 0:d.totalCapacity)??10)}}const l=i.TRACK.totalCapacity,c=i.LIT.totalCapacity;if(l<c&&l<40)return{category:"CAPACITY",title:"塗膠顯影 (Track) 先天物理產能瓶頸",stationName:"TRACK",description:`LITHO 曝光機正在空轉等待！【Track 塗膠顯影站】產能僅 ${Math.round(l)} 片/分，是產線最大卡點！`,recommendation:"光阻旋塗與烘烤受熱擴散物理限制，建議增購第 2 台 Track 機台或將其並聯綁定至微影機以分流消化產能！",workloadPercent:r,chokePointThroughput:Math.round(l)};let p="FILM",u=1/0;const h=["FILM","TRACK","LIT","ETCH","DIFF"];n&&h.push("CMP");for(const m of h)i[m].totalCapacity<u&&(u=i[m].totalCapacity,p=m);return u<=15?{category:"CAPACITY",title:"關鍵製程站點設備數量不足",stationName:p,description:`【${p} 站】產能僅 ${Math.round(u)} 片/分，遠低於其他站點，晶圓在門口嚴重堆積！`,recommendation:`建議前往商城增購第 2 台 ${p} 設備進行分流，或將現有機台升級為更高階型號。`,workloadPercent:r,chokePointThroughput:Math.round(u)}:!a.agv&&!a.oht&&s.length>=2?{category:"LOGISTICS",title:"人工手持搬運效率偏低",stationName:"AMHS 物流",description:"當前仍為「技術員手持晶圓盒步行搬運」，走動搬運耗時佔據了整個製程週期的 40% 以上！",recommendation:"投片量已超越人工負荷極限！強烈建議研發解鎖「地面 AGV 自走車」或「天花板 OHT 天軌」。",workloadPercent:r,chokePointThroughput:Math.round(u)}:{category:"LAYOUT",title:"機台動線規劃待最佳化",stationName:"廠房佈局",description:"前後站點相隔較遠，搬運載具在走道往返耗時過多，拉長了晶圓整體的傳送等待時間。",recommendation:"建議在廠房編輯模式中將相鄰製程機台（如 Track 與 Litho、Etch 與 Diff）就近排列，縮短傳送時間。",workloadPercent:r,chokePointThroughput:Math.round(u)}}static autoFillBestEconomyAllocation(t,e){const s=e.filter(o=>o.category==="LITHO");if(s.length===0)return[];const a=[...s].sort((o,l)=>{var u,h;const c=((u=O.OPTICAL_CATALOG[o.modelId])==null?void 0:u.baseRayleighLimitNm)??9999,p=((h=O.OPTICAL_CATALOG[l.modelId])==null?void 0:h.baseRayleighLimitNm)??9999;return c-p}),n=a[0],r=a[a.length-1],i=[];for(let o=1;o<=t.layerCount;o++){let l=o<=3,c=l?t.nodeNm:Math.max(t.nodeNm*2.5,350),p=l?n.modelId:r.modelId;i.push({layerIndex:o,layerType:l?"關鍵層 (Critical Layer)":"繞線層 (Metal Interconnect)",targetCD:Math.round(c),assignedMachineModelId:p})}return i}}y(S,"BASE_STATION_DURATION_SEC",{FILM:4,LIT:6,ETCH:4,DIFF:5,CMP:5}),y(S,"LIT_SUBSTEP_DURATION_SEC",{COAT:2,EXPOSE:2,DEVELOP:2}),y(S,"BASE_THROUGHPUT_BY_TIER",{LIT:{1:10,2:25,3:55,4:120,5:260,6:180},TRACK:{1:6,2:16,3:35,4:75,5:140,6:160},FILM:{1:12,2:24,3:50,4:110,5:220,6:200},ETCH:{1:12,2:24,3:50,4:110,5:220,6:200},DIFF:{1:10,2:20,3:45,4:100,5:200,6:180},CMP:{1:0,2:0,3:40,4:90,5:180,6:160}});class _{static getNodeSpec(t){return this.PRICING_TABLE.slice().reverse().find(s=>t<=s.nodeNm)||this.PRICING_TABLE[0]}static calculateUpfrontNRE(t,e,s=1){const a=this.getNodeSpec(t);return Math.round(a.baseNRE*e*s)}static calculateTrustMultiplier(t){if(t===null||isNaN(t))return 1;const e=.7+t*.5;return Math.max(.75,Math.min(1.25,Number(e.toFixed(3))))}static calculateUnitPrice(t,e,s,a){const n=this.getNodeSpec(t),r=1+(e-1)*.08,i=n.basePrice*r*s*a;return Number(i.toFixed(2))}static settleOrderPayout(t,e,s,a,n=0,r=0){const i=Math.max(0,Math.round(e*t.unitPrice-n));let o=0,l=r;if(l>0&&i>0){const u=a.reduce((d,m)=>d+m.salary,0)*1.5,h=s.cash+i;if(h>u){const d=h-u,m=Math.min(d*.25,i*.25);o=Math.min(l,Math.round(m)),l-=o}}const c=i-o;return{grossPayout:i,netPayout:c,debtDeducted:o,remainingDebt:l}}static calculateOverdueClawback(t,e,s=!1){const a=e-t.deadlineGameTime;return a<=0?{clawbackRatio:0,clawbackAmount:0,isCancelled:!1}:s&&a<=86400?{clawbackRatio:.1,clawbackAmount:Math.round(t.nrePaid*.1),isCancelled:!1}:a<=28800?{clawbackRatio:.3,clawbackAmount:Math.round(t.nrePaid*.3),isCancelled:!1}:a<=86400?{clawbackRatio:.7,clawbackAmount:Math.round(t.nrePaid*.7),isCancelled:!1}:{clawbackRatio:1,clawbackAmount:t.nrePaid,isCancelled:!0}}static generateContractBoard(t,e,s){const a=[],n=["聯發通訊","蘋果核心","輝達智能","高通晶創","超微運算","台積晶心","瑞昱音訊","博通網通"],r=this.PRICING_TABLE.filter(o=>o.minTier<=t),i=this.calculateTrustMultiplier(e);for(let o=0;o<6;o++){const l=r[Math.floor(Math.random()*r.length)],c=n[(o+Math.floor(Math.random()*5))%n.length],p=l.minTier<=2?3:5,u=l.minTier<=2?5:l.minTier<=4?12:24,h=Math.floor(Math.random()*(u-p+1))+p,d=[3,5,10,25][Math.floor(Math.random()*4)],m=l.nodeNm>=1e3?500:2e3,f=d*m,g=[1,1,1,1.2,1.5],x=g[Math.floor(Math.random()*g.length)],w=this.calculateUpfrontNRE(l.nodeNm,h,x),E=this.calculateUnitPrice(l.nodeNm,h,x,i),F=Math.round(h*30*d*.8/x+180),A=s+F;a.push({id:`ORD-${Date.now().toString(36).toUpperCase()}-${o}`,clientName:c,nodeNm:l.nodeNm,layerCount:h,totalDies:f,goodDiesDelivered:0,nrePaid:w,unitPrice:E,urgencyMultiplier:x,deadlineGameTime:A,status:"ACTIVE"})}return a}}y(_,"PRICING_TABLE",[{nodeNm:1e4,basePrice:2,baseNRE:8e4,minTier:1},{nodeNm:3e3,basePrice:4,baseNRE:18e4,minTier:1},{nodeNm:1e3,basePrice:6,baseNRE:4e5,minTier:2},{nodeNm:350,basePrice:10,baseNRE:9e5,minTier:3},{nodeNm:180,basePrice:18,baseNRE:2e6,minTier:3},{nodeNm:90,basePrice:40,baseNRE:55e5,minTier:4},{nodeNm:45,basePrice:80,baseNRE:15e6,minTier:4},{nodeNm:28,basePrice:200,baseNRE:45e6,minTier:5},{nodeNm:7,basePrice:600,baseNRE:16e7,minTier:6},{nodeNm:2,basePrice:1500,baseNRE:45e7,minTier:6}]);class U{constructor(t,e){y(this,"container");y(this,"callbacks");const s=document.getElementById(t);if(!s)throw new Error(`找不到 HUD 容器: #${t}`);this.container=s,this.callbacks=e}render(t){var l,c,p,u,h,d,m,f,g,x,w;const e=t.player,s=t.unlockedFeatures.cmp,a=t.rollingYieldHistory.length>0?t.rollingYieldHistory.slice(-5).reduce((E,L)=>E+L,0)/Math.min(5,t.rollingYieldHistory.length):null,n=_.calculateTrustMultiplier(a),r=S.calculateFactoryWorkload(t.machines,t.staff,t.activeLots,t.unlockedFeatures,s);let i="#10b981";r.workloadPercent>85?i="#ef4444":r.workloadPercent>=70&&(i="#f59e0b");const o=b.isAudioMuted();this.container.innerHTML=`
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
              <span class="font-mono text-slate-200">${r.workloadPercent}%</span>
            </div>
            <div class="w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
              <div style="width: ${Math.min(100,r.workloadPercent)}%; background-color: ${i};" class="h-full transition-all duration-300"></div>
            </div>
          </div>

          ${r.workloadPercent>85?`<button id="btn-advisory-alert" class="w-8 h-8 rounded-full bg-red-600/90 text-white font-black text-sm flex items-center justify-center border-2 border-red-400 pulse-alert shadow-lg cursor-pointer hover:bg-red-500" title="產線超載嚴重！點擊查看瓶頸診斷">
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
          ${t.questState.dailyQuests.some(E=>E.completed&&!E.claimed)?'<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400"></span>':""}
        </button>

        <!-- 成就 -->
        <button id="btn-achievements" class="btn-sci-fi relative">
          🏆 成就
          ${t.achievements.some(E=>E.unlocked&&!E.claimed)?'<span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400"></span>':""}
        </button>

        <!-- 新手教學引導 -->
        <button id="btn-tutorial" class="btn-sci-fi px-2.5" title="新手入門指引與半導體製程教學">
          ❓
        </button>

        <!-- 靜音開關 -->
        <button id="btn-sound" class="btn-sci-fi px-2.5" title="音效切換">
          ${o?"🔇":"🔊"}
        </button>

        <!-- 存檔 -->
        <button id="btn-save" class="btn-sci-fi px-2.5" title="存檔與匯出">
          💾
        </button>
      </div>
    `,(l=document.getElementById("btn-contracts"))==null||l.addEventListener("click",()=>{b.playClick(),this.callbacks.onOpenContracts()}),(c=document.getElementById("btn-store"))==null||c.addEventListener("click",()=>{b.playClick(),this.callbacks.onOpenStore()}),(p=document.getElementById("btn-hr"))==null||p.addEventListener("click",()=>{b.playClick(),this.callbacks.onOpenHR()}),(u=document.getElementById("btn-quests"))==null||u.addEventListener("click",()=>{b.playClick(),this.callbacks.onOpenQuests()}),(h=document.getElementById("btn-achievements"))==null||h.addEventListener("click",()=>{b.playClick(),this.callbacks.onOpenAchievements()}),(d=document.getElementById("btn-advisory-alert"))==null||d.addEventListener("click",()=>{b.playClick(),this.callbacks.onOpenAdvisory()}),(m=document.getElementById("btn-toggle-mes"))==null||m.addEventListener("click",()=>{b.playClick();const E=!t.unlockedFeatures.mesAutoDispatch;t.unlockedFeatures.mesAutoDispatch=E,this.callbacks.onToggleMES(E),this.render(t)}),(f=document.getElementById("btn-hud-yield"))==null||f.addEventListener("click",()=>{var E,L;b.playClick(),(L=(E=this.callbacks).onOpenWaferMap)==null||L.call(E)}),(g=document.getElementById("btn-tutorial"))==null||g.addEventListener("click",()=>{var E,L;b.playClick(),(L=(E=this.callbacks).onOpenTutorial)==null||L.call(E)}),(x=document.getElementById("btn-sound"))==null||x.addEventListener("click",()=>{b.toggleMute(),b.playClick(),this.render(t)}),(w=document.getElementById("btn-save"))==null||w.addEventListener("click",()=>{b.playClick(),this.callbacks.onOpenSaveModal()})}}class Y{static show(t,e){const s=document.getElementById("modal-container");if(!s)return;let a="avatar_1";const n=()=>{var r,i,o;s.innerHTML=`
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
                  ${[{id:"avatar_1",icon:"👨‍💼",label:"產業領袖"},{id:"avatar_2",icon:"👩‍💼",label:"營運長"},{id:"avatar_3",icon:"👨‍🔬",label:"黃光院士"},{id:"avatar_4",icon:"👩‍🔬",label:"材料博士"},{id:"avatar_5",icon:"🧑‍💻",label:"製程先鋒"},{id:"avatar_6",icon:"🤖",label:"AI晶片狂"}].map(l=>`
                    <button
                      class="avatar-card p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${a===l.id?"border-cyan-400 bg-cyan-950/60 shadow-lg shadow-cyan-500/30 scale-105":"border-slate-800 bg-slate-900/50 hover:border-slate-600"}"
                      data-avatar-id="${l.id}"
                    >
                      <span class="text-2xl">${l.icon}</span>
                      <span class="text-[10px] text-slate-300">${l.label}</span>
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
      `,(r=document.getElementById("btn-random-company"))==null||r.addEventListener("click",()=>{b.playClick();const l=this.RANDOM_COMPANIES[Math.floor(Math.random()*this.RANDOM_COMPANIES.length)],c=document.getElementById("setup-company-name");c&&(c.value=l)}),(i=document.getElementById("btn-random-ceo"))==null||i.addEventListener("click",()=>{b.playClick();const l=this.RANDOM_CEOS[Math.floor(Math.random()*this.RANDOM_CEOS.length)],c=document.getElementById("setup-ceo-name");c&&(c.value=l)}),document.querySelectorAll(".avatar-card").forEach(l=>{l.addEventListener("click",c=>{b.playClick();const p=c.currentTarget.getAttribute("data-avatar-id");p&&(a=p,n())})}),(o=document.getElementById("btn-submit-foundry"))==null||o.addEventListener("click",()=>{const l=document.getElementById("setup-company-name"),c=document.getElementById("setup-ceo-name"),p=(l==null?void 0:l.value.trim())||"矽島先進積體電路",u=(c==null?void 0:c.value.trim())||"張創辦人";t.player.companyName=p,t.player.ceoName=u,t.player.avatarId=a,b.playSuccess(),s.innerHTML="",e(t.player)})};n()}}y(Y,"RANDOM_COMPANIES",["矽島先進積體電路","台積微系統","聯華微電科技","世界微晶圓","美光矽島半導體","瑞昱微系統","聯詠積體科技","旺宏微晶科技"]),y(Y,"RANDOM_CEOS",["張忠謨","劉德音","魏哲家","曹興成","黃仁勳","蘇姿丰","蔡力行","梁孟松"]);class J{static show(t,e,s){var h,d,m,f,g;const a=document.getElementById("modal-container");if(!a)return;const n=t.unlockedFeatures.cmp,r=S.diagnoseBottleneck(t.machines,t.staff,t.activeLots,t.unlockedFeatures,n),{workloadPercent:i,throughputs:o}=S.calculateFactoryWorkload(t.machines,t.staff,t.activeLots,t.unlockedFeatures,n);let l="bg-red-950 text-red-400 border-red-500/50",c="⚠️";r.category==="MAINTENANCE"?(l="bg-amber-950 text-amber-400 border-amber-500/50",c="🔧"):r.category==="LOGISTICS"?(l="bg-cyan-950 text-cyan-400 border-cyan-500/50",c="🚛"):r.category==="LAYOUT"&&(l="bg-purple-950 text-purple-400 border-purple-500/50",c="📐");const p=x=>{x.key==="Escape"&&(a.innerHTML="",window.removeEventListener("keydown",p))};window.addEventListener("keydown",p);const u=()=>{b.playClick(),a.innerHTML="",window.removeEventListener("keydown",p)};a.innerHTML=`
      <div id="modal-backdrop-advisory" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-2xl text-slate-100 flex flex-col max-h-[88vh]">
          <!-- 頂部標題與關閉鈕 -->
          <div class="modal-header flex items-center justify-between pb-3 border-b border-slate-700/60 flex-shrink-0">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${c}</span>
              <div>
                <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2">
                  智能瓶頸診斷與產線優化顧問
                  <span class="text-xs px-2 py-0.5 rounded-full border ${l} font-mono">
                    ${r.category}
                  </span>
                </h3>
                <p class="text-xs text-slate-400">
                  全廠即時在製排隊、機台處理速度與 Q-Time 逾期風險評估
                </p>
              </div>
            </div>
            <button id="btn-close-advisory" class="text-slate-400 hover:text-white text-xl p-1 font-mono transition-colors">
              ✕
            </button>
          </div>

          <!-- 可滾動主體 -->
          <div class="modal-body overflow-y-auto flex-1 py-4 pr-1 space-y-4">
            <!-- 當前產線負荷健康狀態 -->
            <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
              <div>
                <div class="text-xs text-slate-400 font-medium">當前產線負荷百分比 (Workload)</div>
                <div class="text-2xl font-black font-mono ${i>85?"text-red-400":"text-amber-400"}">
                  ${i}%
                  <span class="text-xs font-normal text-slate-400">
                    ${i>85?"(嚴重超載塞車中，排隊即將突破 Q-Time 容許上限！)":"(負載偏高)"}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs text-slate-400">最大有效承載量 (瓶頸站)</div>
                <div class="text-sm font-bold font-mono text-cyan-300">
                  ${r.chokePointThroughput} 片晶圓 / 分鐘
                </div>
              </div>
            </div>

            <!-- 核心診斷結果 (大白話分析) -->
            <div class="p-4 rounded-xl bg-red-950/30 border border-red-500/40">
              <div class="text-xs font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>● 診斷出之致命卡點：</span>
                <span>${r.title}</span>
              </div>
              <p class="text-sm text-slate-200 leading-relaxed">
                ${r.description}
              </p>
            </div>

            <!-- 系統改良建議對策 -->
            <div class="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40">
              <div class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                💡 系統精確改良對策：
              </div>
              <p class="text-sm text-slate-200 font-medium leading-relaxed">
                ${r.recommendation}
              </p>
            </div>

            <!-- 各站點產能即時分佈對比 -->
            <div>
              <div class="text-xs font-bold text-slate-300 mb-2">全廠六大站點實效產能對比 (晶圓/分)：</div>
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                ${Object.values(o).map(x=>`
                  <div class="p-2 rounded-lg bg-slate-900/60 border ${x.isChokePoint?"border-red-500/80 bg-red-950/20":"border-slate-800"} text-center">
                    <div class="text-[11px] font-bold ${x.isChokePoint?"text-red-400":"text-slate-300"}">
                      ${x.station} ${x.isChokePoint?"⚠️":""}
                    </div>
                    <div class="text-xs font-mono font-bold text-slate-100 mt-1">
                      ${Math.round(x.totalCapacity)} 片/分
                    </div>
                    <div class="text-[10px] text-slate-400">
                      ${x.machineCount} 台設備
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>

          <!-- 底部固定操作欄 -->
          <div class="modal-footer flex items-center justify-between pt-3 border-t border-slate-700/60 flex-shrink-0">
            <span class="text-xs text-slate-400 font-mono">按 ESC 或點擊外部背景亦可返回</span>
            <div class="flex items-center gap-2">
              ${r.category==="CAPACITY"&&e?`<button id="btn-advisory-store" class="btn-sci-fi bg-cyan-600 hover:bg-cyan-500 font-bold px-3 py-1.5 text-xs">
                      🛒 前往商城增購設備分流
                    </button>`:""}
              ${r.category==="MAINTENANCE"&&s?`<button id="btn-advisory-hr" class="btn-sci-fi bg-amber-600 hover:bg-amber-500 font-bold px-3 py-1.5 text-xs">
                      🔧 前往人資指派維修保養
                    </button>`:""}
              <button id="btn-advisory-ok" class="btn-sci-fi px-4 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700">
                ◀ 返回無塵室
              </button>
            </div>
          </div>
        </div>
      </div>
    `,(h=document.getElementById("btn-close-advisory"))==null||h.addEventListener("click",u),(d=document.getElementById("btn-advisory-ok"))==null||d.addEventListener("click",u),(m=document.getElementById("modal-backdrop-advisory"))==null||m.addEventListener("click",x=>{x.target===x.currentTarget&&u()}),(f=document.getElementById("btn-advisory-store"))==null||f.addEventListener("click",()=>{u(),e&&e()}),(g=document.getElementById("btn-advisory-hr"))==null||g.addEventListener("click",()=>{u(),s&&s()})}}class P{static refreshDailyQuests(t,e,s,a){if(t.lastDateStr===a&&t.dailyQuests.length===3)return t;const n=e.foundryTier,r=[0,6e4,18e4,45e4,12e5,35e5,12e6][n]??6e4,i=[],o=n===1?5:n===2?15:n===3?30:n===4?60:100;i.push({id:`quest_produce_${a}`,title:"穩定投片交付產出",description:`完成出貨累計 ${o} 片合格晶圓至客戶端。`,tier:n,currentValue:0,targetValue:o,rewardCash:r,rewardPopularity:3,completed:!1,claimed:!1}),n>=3&&s.cmp?i.push({id:`quest_cmp_operation_${a}`,title:"平坦化製程精進",description:"成功執行 5 次 CMP 化學機械平坦化拋光研磨。",tier:n,currentValue:0,targetValue:5,rewardCash:Math.round(r*1.2),rewardPopularity:4,completed:!1,claimed:!1}):i.push({id:`quest_maintain_fab_${a}`,title:"廠務設備巡檢維護",description:"指派工程師對機台進行保養或維持機台健康度在 90% 以上。",tier:n,currentValue:0,targetValue:2,rewardCash:r,rewardPopularity:3,completed:!1,claimed:!1});const l=n<=2?2:3;return i.push({id:`quest_order_fulfill_${a}`,title:"光罩合約履約達成",description:`順利交貨並履約 ${l} 筆晶圓製造合約，取得全額尾款。`,tier:n,currentValue:0,targetValue:l,rewardCash:Math.round(r*1.5),rewardPopularity:5,completed:!1,claimed:!1}),{lastDateStr:a,dailyQuests:i,allDailyClaimed:!1,weeklyCompletedCount:t.weeklyCompletedCount??0,weeklyTarget:15,weeklyClaimed:t.weeklyClaimed??!1}}static onWaferDelivered(t,e){for(const s of t.dailyQuests)s.id.startsWith("quest_produce")&&!s.completed&&(s.currentValue+=e,s.currentValue>=s.targetValue&&(s.currentValue=s.targetValue,s.completed=!0))}static onOrderFulfilled(t){for(const e of t.dailyQuests)e.id.startsWith("quest_order_fulfill")&&!e.completed&&(e.currentValue+=1,e.currentValue>=e.targetValue&&(e.currentValue=e.targetValue,e.completed=!0))}static onMachineMaintained(t){for(const e of t.dailyQuests)e.id.startsWith("quest_maintain_fab")&&!e.completed&&(e.currentValue+=1,e.currentValue>=e.targetValue&&(e.currentValue=e.targetValue,e.completed=!0))}static onCmpProcessed(t){for(const e of t.dailyQuests)e.id.startsWith("quest_cmp_operation")&&!e.completed&&(e.currentValue+=1,e.currentValue>=e.targetValue&&(e.currentValue=e.targetValue,e.completed=!0))}static isAllDailyCompleted(t){return t.dailyQuests.length!==3?!1:t.dailyQuests.every(e=>e.completed)}static claimSingleQuest(t,e){const s=t.dailyQuests.find(a=>a.id===e);return s?s.completed?s.claimed?{success:!1,cash:0,popularity:0,message:"該任務獎勵已領取"}:(s.claimed=!0,{success:!0,cash:s.rewardCash,popularity:s.rewardPopularity,message:`領取成功！獲得獎勵金 NT$ ${s.rewardCash.toLocaleString()} 與商譽 +${s.rewardPopularity}！`}):{success:!1,cash:0,popularity:0,message:"該任務尚未達成目標"}:{success:!1,cash:0,popularity:0,message:"找不到該任務"}}static claimDailyAllClear(t,e){if(!this.isAllDailyCompleted(t))return{success:!1,cash:0,popularity:0,message:"尚有每日任務未完成，無法領取全勤特獎"};if(t.allDailyClaimed)return{success:!1,cash:0,popularity:0,message:"今日全勤特獎已經領取過囉"};t.allDailyClaimed=!0,t.weeklyCompletedCount=Math.min(21,(t.weeklyCompletedCount??0)+3);const s=[0,15e4,45e4,12e5,3e6,8e6,25e6][e]??15e4,a=10;return{success:!0,cash:s,popularity:a,message:`🎉 達成今日 3/3 全勤！獲得全勤特獎 NT$ ${s.toLocaleString()}、商譽 +${a}，每週任務進度累計 +3！`}}static claimWeeklyBounty(t,e){if(t.weeklyCompletedCount<t.weeklyTarget)return{success:!1,cash:0,popularity:0,message:`每週任務尚未達標！目前進度 ${t.weeklyCompletedCount}/${t.weeklyTarget}`};if(t.weeklyClaimed)return{success:!1,cash:0,popularity:0,message:"本週龍頭週大獎已領取過囉"};t.weeklyClaimed=!0;const s=[0,1e6,3e6,8e6,2e7,6e7,2e8][e]??1e6,a=30;return{success:!0,cash:s,popularity:a,message:`🏆 榮膺半導體龍頭週大獎！領取巨額扶持金 NT$ ${s.toLocaleString()} 與商譽 +${a}！全廠客戶信任度提升！`}}}class Z{static show(t,e){const s=document.getElementById("modal-container");if(!s)return;const a=()=>{var l,c,p,u,h;const n=t.questState,r=P.isAllDailyCompleted(n);s.innerHTML=`
        <div id="modal-backdrop-quest" class="modal-backdrop">
          <div class="modal-content glass-panel glass-panel-glow max-w-2xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden">
            
            <!-- 標題 -->
            <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80">
              <div class="flex items-center gap-3">
                <span class="text-2xl">📋</span>
                <div>
                  <h3 class="text-base font-bold text-slate-100 flex items-center gap-2">
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
              <button id="btn-close-quests" class="text-slate-400 hover:text-white text-xl p-1 font-mono" title="關閉">
                ✕
              </button>
            </div>

            <!-- Modal Body -->
            <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4">
              <!-- 每日 3 任務清單 -->
              <div class="space-y-3">
                <div class="text-xs font-bold text-slate-300 uppercase tracking-wider flex justify-between">
                  <span>今日指派任務 (3項)：</span>
                  <span class="font-mono text-cyan-400">
                    ${n.dailyQuests.filter(d=>d.completed).length}/3 已達成
                  </span>
                </div>

                ${n.dailyQuests.map(d=>{const m=Math.min(100,Math.round(d.currentValue/d.targetValue*100));return`
                      <div class="p-3.5 rounded-xl bg-slate-900/70 border ${d.completed?"border-emerald-500/50 bg-emerald-950/20":"border-slate-800"} flex items-center justify-between gap-4">
                        <div class="flex-1">
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-bold text-slate-100">${d.title}</span>
                            ${d.completed?'<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300">已達成</span>':""}
                          </div>
                          <p class="text-xs text-slate-400 mt-0.5">${d.description}</p>
                          
                          <!-- 進度條 -->
                          <div class="flex items-center gap-2 mt-2">
                            <div class="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div style="width: ${m}%" class="h-full bg-cyan-400"></div>
                            </div>
                            <span class="text-[11px] font-mono text-slate-300">${d.currentValue}/${d.targetValue}</span>
                          </div>
                        </div>

                        <!-- 獎勵與按鈕 -->
                        <div class="text-right flex flex-col items-end gap-1.5 min-w-[120px]">
                          <div class="text-xs font-bold font-mono text-amber-400">
                            +NT$ ${d.rewardCash.toLocaleString()}
                          </div>
                          <div class="text-[10px] text-cyan-300">
                            商譽 +${d.rewardPopularity}
                          </div>

                          ${d.claimed?'<span class="text-xs px-3 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">已領取</span>':d.completed?`<button class="btn-claim-quest btn-sci-fi bg-emerald-600 hover:bg-emerald-500 text-xs py-1 px-3" data-id="${d.id}">
                                  領取獎勵
                                </button>`:`<button class="btn-sci-fi text-xs py-1 px-3 opacity-50 cursor-not-allowed" disabled>
                                  進行中
                                </button>`}
                        </div>
                      </div>
                    `}).join("")}
              </div>

              <!-- 全勤特獎領取 -->
              <div class="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-yellow-950/40 border border-amber-500/40 flex items-center justify-between">
                <div>
                  <div class="text-sm font-bold text-amber-300 flex items-center gap-2">
                    <span>🌟 今日 3/3 全勤特賞</span>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      巨額獎勵
                    </span>
                  </div>
                  <p class="text-xs text-slate-300 mt-0.5">
                    完成今日全部 3 項任務，領取高額營運特別補助款！
                  </p>
                </div>

                ${n.allDailyClaimed?'<span class="text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-400 border border-slate-700">今日已領</span>':r?`<button id="btn-claim-all-daily" class="btn-sci-fi bg-amber-600 hover:bg-amber-500 text-xs py-1.5 px-4 font-bold shadow-lg shadow-amber-500/30">
                        領取全勤獎
                      </button>`:'<span class="text-xs text-slate-500 font-mono">需完成 3/3</span>'}
              </div>

              <!-- 每週 15 任務大獎 -->
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

            <!-- Footer with Return Button -->
            <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
              <button id="btn-back-quests" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
                ◀ 返回無塵室 (Back to Cleanroom)
              </button>
            </div>

          </div>
        </div>
      `;const i=()=>{b.playClick(),s.innerHTML="",window.removeEventListener("keydown",o)},o=d=>{d.key==="Escape"&&i()};window.addEventListener("keydown",o),(l=document.getElementById("btn-close-quests"))==null||l.addEventListener("click",i),(c=document.getElementById("btn-back-quests"))==null||c.addEventListener("click",i),(p=document.getElementById("modal-backdrop-quest"))==null||p.addEventListener("click",d=>{d.target===document.getElementById("modal-backdrop-quest")&&i()}),document.querySelectorAll(".btn-claim-quest").forEach(d=>{d.addEventListener("click",m=>{const f=m.currentTarget.getAttribute("data-id");if(f){const g=P.claimSingleQuest(t.questState,f);g.success&&(t.player.cash+=g.cash,t.player.popularity+=g.popularity,b.playCoin(),a(),e())}})}),(u=document.getElementById("btn-claim-all-daily"))==null||u.addEventListener("click",()=>{const d=P.claimDailyAllClear(t.questState,t.player.foundryTier);d.success&&(t.player.cash+=d.cash,t.player.popularity+=d.popularity,b.playSuccess(),a(),e())}),(h=document.getElementById("btn-claim-weekly"))==null||h.addEventListener("click",()=>{const d=P.claimWeeklyBounty(t.questState,t.player.foundryTier);d.success&&(t.player.cash+=d.cash,t.player.popularity+=d.popularity,b.playSuccess(),a(),e())})};a()}}class X{static show(t,e){const s=document.getElementById("modal-container");if(!s)return;I.checkAchievements(t);const a=i=>{i.key==="Escape"&&(s.innerHTML="",window.removeEventListener("keydown",a))};window.addEventListener("keydown",a);const n=()=>{b.playClick(),s.innerHTML="",window.removeEventListener("keydown",a)},r=()=>{var p,u,h;const i=t.achievements,o=i.filter(d=>d.category===this.activeCategory),l=i.filter(d=>d.unlocked).length,c=[{key:"onboarding",label:"新手入門",icon:"🚀"},{key:"process",label:"製程突破",icon:"🔬"},{key:"operation",label:"廠務卓越",icon:"🛡️"},{key:"yield",label:"品質良率",icon:"💎"}];s.innerHTML=`
        <div id="modal-backdrop-achievements" class="modal-backdrop">
          <div class="modal-content glass-panel glass-panel-glow max-w-3xl text-slate-100 flex flex-col max-h-[88vh]">
            <!-- 頂部標題 -->
            <div class="modal-header flex items-center justify-between pb-3 border-b border-slate-700/60 flex-shrink-0">
              <div class="flex items-center gap-3">
                <span class="text-2xl">🏆</span>
                <div>
                  <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2">
                    半導體傳奇成就榮譽榜
                    <span class="text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-500/40 font-mono">
                      ${l}/16 已達成
                    </span>
                  </h3>
                  <p class="text-xs text-slate-400">
                    見證從微米接觸式微影到埃米 High-NA EUV 的矽島稱霸歷史！
                  </p>
                </div>
              </div>
              <button id="btn-close-achievements" class="text-slate-400 hover:text-white text-xl p-1 font-mono transition-colors">
                ✕
              </button>
            </div>

            <!-- Modal 可滾動主體 -->
            <div class="modal-body overflow-y-auto flex-1 py-4 pr-1 space-y-4">
              <!-- 分類標籤頁 (Tabs) -->
              <div class="flex gap-2">
                ${c.map(d=>`
                  <button
                    class="btn-tab px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${this.activeCategory===d.key?"bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400":"bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"}"
                    data-cat="${d.key}"
                  >
                    <span>${d.icon}</span>
                    <span>${d.label}</span>
                    <span class="text-[10px] font-mono opacity-80">
                      (${i.filter(m=>m.category===d.key&&m.unlocked).length}/${i.filter(m=>m.category===d.key).length})
                    </span>
                  </button>
                `).join("")}
              </div>

              <!-- 成就清單 -->
              <div class="space-y-3">
                ${o.map(d=>`
                  <div class="p-4 rounded-xl bg-slate-900/70 border ${d.unlocked?"border-cyan-500/50 bg-cyan-950/20 shadow-md shadow-cyan-500/10":"border-slate-800/80 opacity-65"} flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3.5">
                      <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl border ${d.unlocked?"bg-cyan-950/80 border-cyan-400/60 shadow-inner":"bg-slate-800/60 border-slate-700 text-slate-600"}">
                        ${d.unlocked?"🎖️":"🔒"}
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-bold ${d.unlocked?"text-slate-100":"text-slate-400"}">
                            ${d.title}
                          </span>
                          ${d.unlocked?'<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">已達成</span>':""}
                        </div>
                        <p class="text-xs text-slate-400 mt-1">${d.description}</p>
                      </div>
                    </div>

                    <!-- 獎勵金與領取按鈕 -->
                    <div class="text-right flex flex-col items-end gap-1.5 min-w-[130px]">
                      <div class="text-xs font-bold font-mono text-amber-400">
                        +NT$ ${d.rewardCash.toLocaleString()}
                      </div>
                      ${d.claimed?'<span class="text-xs px-3 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">獎勵已領</span>':d.unlocked?`<button class="btn-claim-ach btn-sci-fi bg-emerald-600 hover:bg-emerald-500 text-xs py-1 px-3 font-bold" data-id="${d.id}">
                              領取獎勵金
                            </button>`:'<span class="text-xs text-slate-500 font-mono">條件未滿足</span>'}
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>

            <!-- 底部固定操作欄 -->
            <div class="modal-footer flex items-center justify-between pt-3 border-t border-slate-700/60 flex-shrink-0">
              <span class="text-xs text-slate-400 font-mono">按 ESC 或點擊外部背景亦可返回</span>
              <button id="btn-return-achievements" class="btn-sci-fi px-4 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700">
                ◀ 返回無塵室
              </button>
            </div>
          </div>
        </div>
      `,(p=document.getElementById("btn-close-achievements"))==null||p.addEventListener("click",n),(u=document.getElementById("btn-return-achievements"))==null||u.addEventListener("click",n),(h=document.getElementById("modal-backdrop-achievements"))==null||h.addEventListener("click",d=>{d.target===d.currentTarget&&n()}),document.querySelectorAll(".btn-tab").forEach(d=>{d.addEventListener("click",m=>{b.playClick();const f=m.currentTarget.getAttribute("data-cat");f&&(this.activeCategory=f,r())})}),document.querySelectorAll(".btn-claim-ach").forEach(d=>{d.addEventListener("click",m=>{const f=m.currentTarget.getAttribute("data-id");if(f){const g=I.claimReward(t.achievements,f);g.success&&(t.player.cash+=g.cash,b.playCoin(),r(),e())}})})};r()}}y(X,"activeCategory","onboarding");class K{static calculateRollingYieldIndex(t){if(!t||t.length===0)return null;const e=t.slice(-5),a=e.reduce((n,r)=>n+r,0)/e.length;return Number(a.toFixed(4))}static calculateLayerYield(t=1,e=0,s=0){let a=.985*t*(1-e)+s;return Math.max(.7,Math.min(.999,a))}static calculateFinalLotYield(t,e=0){if(t.status==="SCRAPPED")return 0;let s=1;for(let a=0;a<t.totalLayers;a++)s*=this.calculateLayerYield(1,e,0);return s*=t.yieldMultiplier||1,Number(Math.max(0,Math.min(1,s)).toFixed(4))}static generateWaferMap(t){const e=[],n=Math.sqrt(8);for(let r=0;r<5;r++)for(let i=0;i<5;i++){const o=r*5+i,l=Math.sqrt((r-2)**2+(i-2)**2),c=l/n,p=1.1-c*.4,u=Math.min(.99,t*p),h=Math.random()<u;e.push({index:o,row:r,col:i,distanceFromCenter:Number(l.toFixed(2)),passed:h,defectType:h?void 0:c>.6?"OPTICAL_DEFOCUS":"PARTICLE"})}for(let r=0;r<e.length;r++)if(!e[r].passed&&Math.random()<.4){const i=e.filter(o=>Math.abs(o.row-e[r].row)<=1&&Math.abs(o.col-e[r].col)<=1&&o.index!==e[r].index);if(i.length>0){const o=i[Math.floor(Math.random()*i.length)];o.passed=!1,o.defectType="CLUSTER"}}return e}}class D{static show(t,e,s){const a=document.getElementById("modal-container");if(!a)return;this.currentLot=e||(t.activeLots.length>0?t.activeLots[0]:null);const n=this.currentLot?this.currentLot.yieldMultiplier:t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((r,i)=>r+i,0)/t.rollingYieldHistory.length:.92;this.dies=K.generateWaferMap(n),this.selectedDie=this.dies[12]||this.dies[0],this.render(a,t,s)}static render(t,e,s){const a=this.dies.filter(p=>p.passed).length,n=this.dies.length-a,r=(a/this.dies.length*100).toFixed(1),i=this.dies.filter(p=>p.defectType==="CLUSTER").length,o=this.dies.filter(p=>p.defectType==="PARTICLE").length,l=this.dies.filter(p=>p.defectType==="OPTICAL_DEFOCUS").length,c=e.rollingYieldHistory.length>0?(e.rollingYieldHistory.reduce((p,u)=>p+u,0)/e.rollingYieldHistory.length*100).toFixed(1)+"%":"N/A";t.innerHTML=`
      <div id="modal-backdrop-wafer" class="modal-backdrop">
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
                  ${this.dies.map(p=>{var m;const u=((m=this.selectedDie)==null?void 0:m.index)===p.index;let h="bg-emerald-500 hover:bg-emerald-400 border-emerald-300/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]",d="✓";return p.passed||(p.defectType==="CLUSTER"?(h="bg-red-600 hover:bg-red-500 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.7)]",d="✕"):p.defectType==="OPTICAL_DEFOCUS"?(h="bg-amber-500 hover:bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]",d="⚠"):(h="bg-purple-600 hover:bg-purple-500 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]",d="●")),`
                      <button
                        class="btn-wafer-die rounded-md border text-xs font-bold text-white transition-all transform hover:scale-110 flex items-center justify-center font-mono ${h} ${u?"ring-2 ring-white scale-105":""}"
                        data-index="${p.index}"
                        title="Die [${p.row}, ${p.col}] - ${p.passed?"合格":"失效: "+p.defectType}"
                      >
                        ${d}
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
                  <div class="text-xl font-bold ${Number(r)>=90?"text-emerald-400":"text-amber-400"}">
                    ${r}%
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">
                    合格: ${a} / 失效: ${n}
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div class="text-[10px] text-slate-400">全廠滑動良率指數</div>
                  <div class="text-xl font-bold text-cyan-300">
                    ${c}
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
                  <span>${i} 顆</span>
                </div>
                <div class="flex justify-between text-amber-400">
                  <span>邊緣光學離焦 (Defocus):</span>
                  <span>${l} 顆</span>
                </div>
                <div class="flex justify-between text-purple-400">
                  <span>落塵雜質 (Particle):</span>
                  <span>${o} 顆</span>
                </div>
              </div>

              <!-- Re-simulate Button -->
              <button id="btn-resim-wafer" class="btn-sci-fi w-full justify-center py-2 text-xs">
                🔄 重新執行蒙地卡羅良率掃描
              </button>

            </div>

          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
            <button id="btn-back-wafer" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s)}static bindEvents(t,e,s){var r,i,o,l;const a=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",n)},n=c=>{c.key==="Escape"&&a()};window.addEventListener("keydown",n),(r=document.getElementById("btn-close-wafer-map"))==null||r.addEventListener("click",a),(i=document.getElementById("btn-back-wafer"))==null||i.addEventListener("click",a),(o=document.getElementById("modal-backdrop-wafer"))==null||o.addEventListener("click",c=>{c.target===document.getElementById("modal-backdrop-wafer")&&a()}),t.querySelectorAll(".btn-wafer-die").forEach(c=>{c.addEventListener("click",p=>{b.playClick();const u=parseInt(p.currentTarget.getAttribute("data-index")||"0",10);this.selectedDie=this.dies.find(h=>h.index===u)||null,this.render(t,e,s)})}),(l=document.getElementById("btn-resim-wafer"))==null||l.addEventListener("click",()=>{b.playClick();const c=this.currentLot?this.currentLot.yieldMultiplier:e.rollingYieldHistory.length>0?e.rollingYieldHistory.reduce((p,u)=>p+u,0)/e.rollingYieldHistory.length:.92;this.dies=K.generateWaferMap(c),this.selectedDie=this.dies[12]||this.dies[0],this.render(t,e,s)})}}y(D,"dies",[]),y(D,"selectedDie",null),y(D,"currentLot",null);class B{static show(t,e,s){const a=document.getElementById("modal-container");a&&(this.currentOrder=e,e.layerAllocations&&e.layerAllocations.length===e.layerCount?this.localAllocations=JSON.parse(JSON.stringify(e.layerAllocations)):this.localAllocations=S.autoFillBestEconomyAllocation(e,t.machines),this.render(a,t,s))}static render(t,e,s){if(!this.currentOrder)return;const a=this.currentOrder,n=e.machines.filter(c=>c.category==="LITHO"),r=new Map(e.staff.map(c=>[c.id,c])),i=new Map;for(const c of n){const p=c.assignedEngineerId?r.get(c.assignedEngineerId):null,u=O.calculateEffectiveCD(c.modelId,e.player.unlockedK1,c.wear,p);i.set(c.modelId,u)}let o=!1;for(const c of this.localAllocations)if((i.get(c.assignedMachineModelId)??99999)>c.targetCD){o=!0;break}const l=a.nodeNm>=1e3?`${a.nodeNm/1e3} µm`:`${a.nodeNm} nm`;t.innerHTML=`
      <div id="modal-backdrop-layer" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-4xl text-slate-100 flex flex-col max-h-[90vh]">
          
          <!-- Modal Header -->
          <div class="modal-header flex items-center justify-between pb-3 border-b border-slate-700/80">
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
                  客戶: ${a.clientName} | 目標技術節點: ${l} | 總層數: ${a.layerCount} 層
                </div>
              </div>
            </div>

            <button id="btn-close-layer-modal" class="text-slate-400 hover:text-white font-mono text-xl p-1" title="關閉">
              ✕
            </button>
          </div>

          <!-- 半導體科普導讀卡片 -->
          <div class="my-3 p-3 rounded-xl bg-slate-900/90 border border-indigo-500/30 flex items-start gap-3 text-xs flex-shrink-0">
            <span class="text-xl">💡</span>
            <div class="text-slate-300 leading-relaxed">
              <span class="text-indigo-300 font-bold">半導體產業秘密：</span>
              現代晶片並非所有光罩層都需昂貴的頂級機台！底層關鍵閘極 (FEOL Gate) 線寬極窄需先進光刻；而上層金屬導線與銲墊 (Pad) 線寬寬鬆，指派成熟便宜的光刻機能
              <strong class="text-emerald-400">大幅降低晶圓生產成本與昂貴機台磨損</strong>，釋放黃光產能瓶頸！
            </div>
          </div>

          <!-- 配方分層列表清單 (可滾動) -->
          <div class="modal-body flex-1 overflow-y-auto pr-1 space-y-2.5 my-2">
            ${this.localAllocations.map(c=>{const p=i.get(c.assignedMachineModelId)??99999,u=p>c.targetCD,h=c.layerIndex<=3;return`
                <div class="p-3 rounded-xl bg-slate-900/80 border ${u?"border-red-500/60 bg-red-950/20":"border-slate-800 hover:border-slate-700"} flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all">
                  
                  <!-- 左側：層級資訊 -->
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${h?"bg-amber-950/80 border border-amber-500/40 text-amber-300":"bg-slate-800 text-slate-300"}">
                      L${c.layerIndex}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-xs text-white">${c.layerType}</span>
                        ${h?'<span class="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">關鍵層</span>':'<span class="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400">導線層</span>'}
                      </div>
                      <div class="text-[11px] font-mono text-slate-400">
                        目標線寬需求: <span class="text-cyan-300 font-bold">${c.targetCD} nm</span>
                      </div>
                    </div>
                  </div>

                  <!-- 中間：機台指派下拉選單 -->
                  <div class="flex-1 max-w-sm">
                    <select data-layer="${c.layerIndex}" class="sel-layer-machine w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                      ${n.map(d=>{const m=i.get(d.modelId)??9999,f=d.modelId===c.assignedMachineModelId;return`
                          <option value="${d.modelId}" ${f?"selected":""}>
                            ${d.name} (實時CD: ${m}nm | 磨損: ${Math.round(d.wear)}%)
                          </option>
                        `}).join("")}
                    </select>
                  </div>

                  <!-- 右側：Rayleigh 解析度檢核徽章 -->
                  <div class="min-w-[140px] text-right">
                    ${u?`
                      <div class="text-xs font-bold text-red-400 flex items-center md:justify-end gap-1">
                        <span>⚠️</span>
                        <span>解析度不足！</span>
                      </div>
                      <div class="text-[10px] text-red-300/80 font-mono">
                        機台CD ${p}nm > 需求 ${c.targetCD}nm
                      </div>
                    `:`
                      <div class="text-xs font-bold text-emerald-400 flex items-center md:justify-end gap-1">
                        <span>✅</span>
                        <span>光學合規</span>
                      </div>
                      <div class="text-[10px] text-slate-400 font-mono">
                        安全裕度: +${c.targetCD-p} nm
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
              <button id="btn-save-layer-alloc" class="btn-sci-fi text-xs py-2 px-5 ${o?"opacity-50 cursor-not-allowed bg-slate-700":"bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"}" ${o?"disabled":""}>
                💾 確認並套用分層配方
              </button>
            </div>
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s)}static bindEvents(t,e,s){var i,o,l,c,p;const a=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",n)},n=u=>{u.key==="Escape"&&a()};window.addEventListener("keydown",n),(i=document.getElementById("btn-close-layer-modal"))==null||i.addEventListener("click",a),(o=document.getElementById("btn-cancel-layer-alloc"))==null||o.addEventListener("click",a),(l=document.getElementById("modal-backdrop-layer"))==null||l.addEventListener("click",u=>{u.target===document.getElementById("modal-backdrop-layer")&&a()}),t.querySelectorAll(".sel-layer-machine").forEach(u=>{u.addEventListener("change",h=>{const d=h.target,m=Number(d.dataset.layer),f=d.value,g=this.localAllocations.find(x=>x.layerIndex===m);g&&(g.assignedMachineModelId=f,b.playClick(),this.render(t,e,s))})}),(c=document.getElementById("btn-auto-fill-alloc"))==null||c.addEventListener("click",()=>{this.currentOrder&&(b.playCoinChime(),this.localAllocations=S.autoFillBestEconomyAllocation(this.currentOrder,e.machines),this.render(t,e,s))}),(p=document.getElementById("btn-save-layer-alloc"))==null||p.addEventListener("click",()=>{this.currentOrder&&(this.currentOrder.layerAllocations=JSON.parse(JSON.stringify(this.localAllocations)),b.playFanfare(),t.innerHTML="",s())})}}y(B,"currentOrder",null),y(B,"localAllocations",[]);class R{static show(t,e){const s=document.getElementById("modal-container");s&&((this.marketOrders.length===0||t.gameTime-this.lastRefreshTime>60)&&this.refreshMarketOrders(t),this.render(s,t,e))}static refreshMarketOrders(t){const e=t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((s,a)=>s+a,0)/t.rollingYieldHistory.length:null;this.marketOrders=_.generateContractBoard(t.player.foundryTier,e,t.gameTime),this.lastRefreshTime=t.gameTime}static render(t,e,s){const a=e.rollingYieldHistory.length>0?e.rollingYieldHistory.reduce((i,o)=>i+o,0)/e.rollingYieldHistory.length:null,n=_.calculateTrustMultiplier(a),r=this.getBestLithoCD(e);t.innerHTML=`
      <div id="modal-backdrop-contract" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-4xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden">
          
          <!-- Header -->
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-xl flex-shrink-0">
                📋
              </div>
              <div>
                <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
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
              <button id="btn-close-contract" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉合約板">
                ✕
              </button>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex border-b border-slate-700/60 bg-slate-900/40 px-6 pt-2 flex-shrink-0">
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
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4">
            ${this.currentTab==="MARKET"?this.renderMarketOrders(e,r):this.renderActiveOrders(e)}
          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
            <button id="btn-back-contract" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
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
        ${this.marketOrders.map((s,a)=>{const n=e<=s.nodeNm,r=s.nodeNm>=1e3?`${s.nodeNm/1e3} µm`:`${s.nodeNm} nm`;let i='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">常規件 (1.0x)</span>';s.urgencyMultiplier===1.2?i='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">🟡 急件 (1.2x)</span>':s.urgencyMultiplier>=1.5&&(i='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">🔴 SHR 超急件 (1.5x)</span>');const o=s.nrePaid+s.totalDies*s.unitPrice;return`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${n?"border-slate-800 hover:border-cyan-500/40":"border-red-900/40 bg-red-950/10"} transition-all flex flex-col justify-between space-y-3">
              <!-- Card Header -->
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">${s.clientName}</span>
                    ${i}
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5 font-mono">
                    合約編號: ${s.id}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold font-mono text-cyan-300">${r}</div>
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
                  <div class="font-mono font-semibold text-cyan-300">~NT$ ${Math.round(o).toLocaleString()}</div>
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
                  <span>廠內機台極限 CD (${e===999999?"無微影機":e+"nm"}) 無法滿足 ${r} 製程需求！</span>
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
        ${t.activeOrders.map(e=>{var i;const s=Math.max(0,e.deadlineGameTime-t.gameTime),a=s===0,n=t.activeLots.filter(o=>o.orderId===e.id),r=Math.min(100,Math.round(e.goodDiesDelivered/e.totalDies*100));return`
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
                  <span>${r}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div class="h-full bg-cyan-400 transition-all duration-300" style="width: ${r}%;"></div>
                </div>
              </div>

              <!-- In-fab lots status -->
              <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                <div class="text-[11px] font-semibold text-slate-400">無塵室在製晶圓盒 (Lots):</div>
                ${n.length===0?`
                  <div class="text-xs text-slate-500 italic">所有晶圓盒已完工，正等待結算交付...</div>
                `:`
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${n.map(o=>{let l=`<span class="text-cyan-300 font-bold">${o.currentStation}</span>`;o.currentStation==="LIT"&&(l=`<span class="text-amber-300 font-bold">LIT (${o.litSubStep||"COAT"})</span>`);const c=t.machines.find(h=>o.currentStation==="LIT"?o.litSubStep==="COAT"||o.litSubStep==="DEVELOP"?h.category==="TRACK":h.category==="LITHO":h.category===o.currentStation),p=c?c.name:"自動分配中";let u="";if(o.qTimeDeadline!==null){const h=Math.max(0,o.qTimeDeadline-t.gameTime);u=`<span class="text-[10px] font-mono ${h<10?"text-red-400 animate-pulse":"text-amber-400"}">⏳ Q-Time: ${h}s</span>`}return`
                        <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-2">
                          <div>
                            <div class="font-mono text-slate-200 font-semibold flex items-center gap-1.5">
                              <span>${o.lotId}</span>
                              <button class="btn-inspect-lot text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 hover:bg-cyan-800 text-cyan-300 border border-cyan-700/50 flex items-center gap-0.5 cursor-pointer" data-lot-id="${o.lotId}" title="點擊檢視蒙地卡羅晶圓圖">
                                <span>🔍</span><span>晶圓圖</span>
                              </button>
                            </div>
                            <div class="text-[10px] text-slate-400 mt-0.5">
                              層數: ${o.currentLayer}/${o.totalLayers} | 站點: ${l}
                            </div>
                            <div class="text-[10px] text-cyan-300/90 font-mono mt-0.5 flex items-center gap-1">
                              <span>🏭 機台:</span>
                              <span class="font-bold truncate max-w-[140px]">${p}</span>
                            </div>
                          </div>
                          <div class="text-right flex-shrink-0">
                            <div class="text-[10px] text-emerald-400 font-mono font-bold">良率: ${(o.yieldMultiplier*100).toFixed(0)}%</div>
                            ${u}
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
                      <span>微影分層配方 (${((i=e.layerAllocations)==null?void 0:i.length)||e.layerCount}層)</span>
                    </button>
                  `:""}
                </div>

                <div class="flex items-center gap-2">
                  ${n.length===0||n.every(o=>o.status==="COMPLETED")?`
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
    `}static bindEvents(t,e,s){var r,i,o,l,c,p;const a=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",n)},n=u=>{u.key==="Escape"&&a()};window.addEventListener("keydown",n),(r=document.getElementById("btn-close-contract"))==null||r.addEventListener("click",a),(i=document.getElementById("btn-back-contract"))==null||i.addEventListener("click",a),(o=document.getElementById("modal-backdrop-contract"))==null||o.addEventListener("click",u=>{u.target===document.getElementById("modal-backdrop-contract")&&a()}),(l=document.getElementById("tab-market"))==null||l.addEventListener("click",()=>{b.playClick(),this.currentTab="MARKET",this.render(t,e,s)}),(c=document.getElementById("tab-active"))==null||c.addEventListener("click",()=>{b.playClick(),this.currentTab="ACTIVE",this.render(t,e,s)}),(p=document.getElementById("btn-refresh-market"))==null||p.addEventListener("click",()=>{b.playClick(),this.refreshMarketOrders(e),this.render(t,e,s)}),t.querySelectorAll(".btn-accept-order").forEach(u=>{u.addEventListener("click",h=>{const d=parseInt(h.currentTarget.getAttribute("data-index")||"0",10),m=this.marketOrders[d];if(!m)return;b.playCoinChime(),e.player.cash+=m.nrePaid,e.activeOrders.push(m);const f=Math.max(1,Math.min(3,Math.ceil(m.totalDies/1e3)));for(let g=0;g<f;g++){const x={lotId:`LOT-${Date.now().toString(36).toUpperCase().slice(-4)}-${g+1}`,orderId:m.id,waferCount:Math.ceil(m.totalDies/f/(m.nodeNm>=1e3?500:2e3)),currentStation:"FILM",currentLayer:1,totalLayers:m.layerCount,qTimeDeadline:null,yieldMultiplier:1,status:"PROCESSING"};e.activeLots.push(x)}this.marketOrders.splice(d,1),I.checkAchievements(e),s(),this.currentTab="ACTIVE",this.render(t,e,s)})}),t.querySelectorAll(".btn-settle-order").forEach(u=>{u.addEventListener("click",h=>{const d=h.currentTarget.getAttribute("data-order-id"),m=e.activeOrders.findIndex(w=>w.id===d);if(m===-1)return;const f=e.activeOrders[m],g=f.goodDiesDelivered>0?f.goodDiesDelivered:f.totalDies*.95,x=_.settleOrderPayout(f,g,e.player,e.staff,0,e.clawbackDebt);e.player.cash+=x.netPayout,e.clawbackDebt=x.remainingDebt,e.activeOrders.splice(m,1),e.activeLots=e.activeLots.filter(w=>w.orderId!==f.id),b.playFanfare(),I.checkAchievements(e),s(),this.render(t,e,s)})}),t.querySelectorAll(".btn-inspect-lot").forEach(u=>{u.addEventListener("click",h=>{const d=h.currentTarget.getAttribute("data-lot-id"),m=e.activeLots.find(f=>f.lotId===d);b.playClick(),D.show(e,m,()=>{this.render(t,e,s),s()})})}),t.querySelectorAll(".btn-layer-allocation").forEach(u=>{u.addEventListener("click",h=>{const d=h.currentTarget.getAttribute("data-order-id"),m=e.activeOrders.find(f=>f.id===d);m&&(b.playClick(),B.show(e,m,()=>{this.render(t,e,s),s()}))})})}static getBestLithoCD(t){const e=t.machines.filter(a=>a.category==="LITHO"&&a.status!=="EXPLODED");if(e.length===0)return 999999;let s=999999;for(const a of e){const n=O.OPTICAL_CATALOG[a.modelId];n&&n.baseRayleighLimitNm<s&&(s=n.baseRayleighLimitNm)}return s}}y(R,"marketOrders",[]),y(R,"lastRefreshTime",0),y(R,"currentTab","MARKET");class N{static show(t,e){const s=document.getElementById("modal-container");s&&this.render(s,t,e)}static render(t,e,s){const a=[{key:"LITHO",label:"LITHO 微影機",icon:"🔦"},{key:"TRACK",label:"TRACK 塗膠顯影 (瓶頸)",icon:"🌀"},{key:"FILM",label:"FILM 薄膜成長",icon:"✨"},{key:"ETCH",label:"ETCH 蝕刻製程",icon:"⚡"},{key:"DIFF",label:"DIFF 擴散植入",icon:"🎯"},{key:"CMP",label:"CMP 平坦研磨",icon:"💿"},{key:"FLEET",label:"廠內現役機台 ("+e.machines.length+")",icon:"🏭"}];t.innerHTML=`
      <div id="modal-backdrop-store" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-5xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden">
          
          <!-- Header -->
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl flex-shrink-0">
                🏭
              </div>
              <div>
                <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
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

            <button id="btn-close-store" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉商城">
              ✕
            </button>
          </div>

          <!-- Category Nav Tabs -->
          <div class="flex border-b border-slate-700/60 bg-slate-900/40 px-6 pt-2 overflow-x-auto gap-1 flex-shrink-0">
            ${a.map(n=>{const r=this.activeCategory===n.key,i=n.key==="CMP"&&!e.unlockedFeatures.cmp;return`
                <button
                  class="btn-store-tab px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${r?"border-amber-400 text-amber-300":"border-transparent text-slate-400 hover:text-slate-200"} ${i?"opacity-50":""}"
                  data-cat="${n.key}"
                >
                  <span>${n.icon}</span>
                  <span>${n.label}</span>
                  ${i?'<span class="text-[10px] text-amber-500 font-mono">(Tier 3解鎖)</span>':""}
                </button>
              `}).join("")}
          </div>

          <!-- Body Content -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4">
            ${this.activeCategory==="FLEET"?this.renderFleetTab(e):this.renderCatalogTab(e)}
          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
            <button id="btn-back-store" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
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
        ${e.map((s,a)=>{const n=t.player.foundryTier>=s.tier,r=t.player.cash>=s.price,i=s.category==="CMP"&&!t.unlockedFeatures.cmp;return`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${n?"border-slate-800 hover:border-amber-500/40":"border-slate-800/40 opacity-70"} transition-all flex flex-col justify-between space-y-3">
              
              <div class="flex items-start gap-3">
                <div class="store-thumb-box machine-card-thumb w-16 h-16 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden relative group">
                  <img src="${s.assetPath}" alt="${s.name}" class="w-full h-full object-contain filter drop-shadow" style="max-width: 56px; max-height: 56px;" />
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
                  class="btn-buy-equipment flex-1 btn-sci-fi justify-center text-xs py-2 ${!n||!r||i?"opacity-50 cursor-not-allowed":""}"
                  data-model-id="${s.modelId}"
                  ${!n||!r||i?"disabled":""}
                >
                  ${n?i?"🔒 CMP 科技未解鎖":r?"🛒 採購並安裝至廠房":"資金不足":`🔒 需達到 Tier ${s.tier}`}
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
        ${t.machines.map(e=>{const s=this.STORE_CATALOG.find(o=>o.modelId===e.modelId),a=Math.round((s?s.price:2e6)*.15),n=Math.round((s?s.price:2e6)*.4),r=Math.round(e.wear);let i='<span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">閒置 (IDLE)</span>';return e.status==="PROCESSING"?i='<span class="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">加工中</span>':e.status==="MAINTENANCE"?i='<span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">🛠️ 維護中</span>':e.status==="EXPLODED"&&(i='<span class="px-2 py-0.5 rounded text-[10px] bg-red-600 text-white font-bold animate-bounce">💥 腔體炸毀</span>'),`
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="store-thumb-box machine-card-thumb w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden">
                  <img src="${s?s.assetPath:k.machines.litho_contact.path}" alt="${e.name}" class="w-full h-full object-contain" style="max-width: 44px; max-height: 44px;" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">${e.name}</span>
                    ${i}
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
                  <span class="${r>70?"text-red-400 font-bold":r>40?"text-amber-400":"text-emerald-400"}">${r}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div class="h-full ${r>70?"bg-red-500":r>40?"bg-amber-500":"bg-emerald-500"}" style="width: ${r}%;"></div>
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
    `}static bindEvents(t,e,s){var r,i,o;const a=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",n)},n=l=>{l.key==="Escape"&&a()};window.addEventListener("keydown",n),(r=document.getElementById("btn-close-store"))==null||r.addEventListener("click",a),(i=document.getElementById("btn-back-store"))==null||i.addEventListener("click",a),(o=document.getElementById("modal-backdrop-store"))==null||o.addEventListener("click",l=>{l.target===document.getElementById("modal-backdrop-store")&&a()}),t.querySelectorAll(".btn-store-tab").forEach(l=>{l.addEventListener("click",c=>{b.playClick();const p=c.currentTarget.getAttribute("data-cat");if(p==="CMP"&&!e.unlockedFeatures.cmp){alert("CMP（化學機械研磨）機台需晉升至 Tier 3 世代後方可解鎖！");return}this.activeCategory=p,this.render(t,e,s)})}),t.querySelectorAll(".btn-sci-info").forEach(l=>{l.addEventListener("click",c=>{b.playClick();const p=parseInt(c.currentTarget.getAttribute("data-index")||"0",10),u=this.STORE_CATALOG.filter(h=>h.category===this.activeCategory)[p];u&&alert(`👨‍🏫 半導體晶圓教室：【${u.name}】

${u.scienceNote}`)})}),t.querySelectorAll(".btn-buy-equipment").forEach(l=>{l.addEventListener("click",c=>{const p=c.currentTarget.getAttribute("data-model-id"),u=this.STORE_CATALOG.find(g=>g.modelId===p);if(!u)return;if(e.player.cash<u.price){alert("資金不足，無法完成設備採購！");return}e.player.cash-=u.price,b.playCoinChime();const h=e.machines.length,d=h%4*2,m=Math.floor(h/4)*2,f={id:`MCH-${Date.now().toString(36).toUpperCase().slice(-5)}`,modelId:u.modelId,name:u.name.split(" (")[0],category:u.category,tier:u.tier,gridX:Math.min(7,d),gridY:Math.min(7,m),wear:0,status:"IDLE",assignedEngineerId:null,pairedTrackIds:u.category==="LITHO"?[]:void 0};e.machines.push(f),I.checkAchievements(e),s(),this.activeCategory="FLEET",this.render(t,e,s)})}),t.querySelectorAll(".btn-overhaul").forEach(l=>{l.addEventListener("click",c=>{const p=c.currentTarget.getAttribute("data-machine-id"),u=parseInt(c.currentTarget.getAttribute("data-cost")||"0",10),h=e.machines.find(d=>d.id===p);if(h){if(e.player.cash<u){alert("資金不足，無法支付大修費用！");return}e.player.cash-=u,h.wear=0,h.status="IDLE",b.playClick(),s(),this.render(t,e,s)}})}),t.querySelectorAll(".btn-decommission").forEach(l=>{l.addEventListener("click",c=>{const p=c.currentTarget.getAttribute("data-machine-id"),u=parseInt(c.currentTarget.getAttribute("data-refund")||"0",10),h=e.machines.findIndex(m=>m.id===p);if(h===-1||!confirm(`確定要報廢並變賣此機台嗎？將回收變賣金 NT$ ${u.toLocaleString()}`))return;const d=e.machines[h];if(d.assignedEngineerId){const m=e.staff.find(f=>f.id===d.assignedEngineerId);m&&(m.assignedMachineId=null)}e.player.cash+=u,e.machines.splice(h,1),b.playCoinChime(),s(),this.render(t,e,s)})})}}y(N,"activeCategory","LITHO"),y(N,"STORE_CATALOG",[{modelId:"litho_contact",name:"Contact Aligner (接觸式微影機)",category:"LITHO",tier:1,price:25e5,throughputWpm:10,rayleighLimitNm:3007,description:"半導體萌芽期主力，光罩物理緊貼晶圓表面進行紫外曝光，維修容易。",scienceNote:"利用汞燈紫外混光 (436nm) 貼合曝光。因光罩直接碰觸晶圓表面，容易刮傷光罩與產生落塵，極限線寬約 3µm。",assetPath:k.machines.litho_contact.path},{modelId:"litho_projection",name:"1x Projection Aligner (1:1 投影曝光機)",category:"LITHO",tier:1,price:6e6,throughputWpm:15,rayleighLimitNm:1798,description:"反射鏡等倍投影微影，光罩懸空不接觸晶圓，徹底終結光罩刮傷磨損。",scienceNote:"Perkin-Elmer 經典反射光學系統，以凹面鏡聚焦達成 1:1 無接觸曝光，大幅提升光罩壽命與開局良率。",assetPath:k.machines.litho_projection.path},{modelId:"litho_gline",name:"G-Line Stepper (步進縮小曝光機)",category:"LITHO",tier:2,price:18e6,throughputWpm:25,rayleighLimitNm:997,description:"4:1 縮小投影透鏡，逐區步進曝光（Step-and-Repeat），進入 1µm 時代。",scienceNote:"高壓汞燈 g-line (436nm) 搭配數值孔徑 NA=0.35 之複合縮小透鏡，將光罩圖案縮小 4 倍投射，突破微米大關。",assetPath:k.machines.litho_gline.path},{modelId:"litho_iline",name:"I-Line Stepper (高壓汞燈微影機)",category:"LITHO",tier:3,price:35e6,throughputWpm:55,rayleighLimitNm:584,description:"次微米時代霸主，波長 365nm，支援精密對準與多層金屬互連製程。",scienceNote:"採用更短波長之高強度汞燈 i-line (365nm) 與 NA=0.50 鏡頭，成功壓制繞射效應，可清晰成像至 500nm。",assetPath:k.machines.litho_iline.path},{modelId:"litho_krf",name:"KrF DUV Scanner (準分子雷射微影機)",category:"LITHO",tier:4,price:85e6,throughputWpm:120,rayleighLimitNm:283,description:"深紫外光 (DUV) 準分子雷射，邁入動態連續掃描曝光 (Step-and-Scan)。",scienceNote:"248nm 氟化氪 (KrF) 準分子雷射光源，必須搭配化學增幅光阻 (CAR) 放大光化學反應，支援 0.25µm 製程。",assetPath:k.machines.litho_krf.path},{modelId:"litho_arfdry",name:"ArF Dry Scanner (氟化氬乾式微影機)",category:"LITHO",tier:4,price:18e7,throughputWpm:120,rayleighLimitNm:182,description:"193nm 紫外雷射，將大氣乾式微影發揮至極致，跨越次百奈米門檻。",scienceNote:"利用 193nm 氟化氬雷射與高折射石英透鏡群，是半導體製程縮小至 90nm/65nm 的核心關鍵機台。",assetPath:k.machines.litho_arfdry.path},{modelId:"litho_arfi",name:"ArFi Immersion TWINSCAN (浸潤式微影機)",category:"LITHO",tier:5,price:45e7,throughputWpm:260,rayleighLimitNm:114,description:"鏡頭與晶圓間注入超純水折射光線，雙工件台磁浮掃描，大氣產速最快！",scienceNote:"林本堅博士提出之革命性技術：利用水之折射率 n=1.44 巧妙將等效數值孔徑提升至 NA=1.35，多重曝光下推進至 7nm！",assetPath:k.machines.litho_arfi.path},{modelId:"litho_euv",name:"EUV Scanner (極紫外光微影巨獸)",category:"LITHO",tier:6,price:25e8,throughputWpm:180,rayleighLimitNm:33,description:"13.5nm 極紫外光，全真空反射鏡系統，單次曝光推進 7nm/5nm/3nm！",scienceNote:"以高功率二氧化碳雷射轟擊融熔錫滴激發電漿，產生 13.5nm EUV 光子，全機在超高真空運行，受抽真空限制產能為 180 片/分。",assetPath:k.machines.litho_euv.path},{modelId:"litho_highna",name:"High-NA EUV (高數值孔徑次世代巨獸)",category:"LITHO",tier:6,price:6e9,throughputWpm:180,rayleighLimitNm:20,description:"0.55 NA 變形數值孔徑透鏡，埃米世代霸主，稱霸矽島之終極神兵。",scienceNote:"採用變形鏡頭 (Anamorphic Optics)，X/Y 軸非對稱倍率，單次曝光極限線寬可達 20nm 以下，引領 2nm 埃米時代。",assetPath:k.machines.litho_highna.path},{modelId:"track_manual",name:"手動旋塗熱板台 (Manual Spin & Bake)",category:"TRACK",tier:1,price:8e5,throughputWpm:6,description:"⚠️ 開局先天產能瓶頸！人工滴膠手動離心旋塗與熱板預烤，產能僅 6 片/分。",scienceNote:"利用真空吸盤固定晶圓，手動注射光阻後以 3000 RPM 高速旋轉甩出均勻薄膜，再由人員夾入熱板烘烤。",assetPath:k.machines.track_manual.path},{modelId:"track_single",name:"單軌自動塗膠顯影機 (Single Track)",category:"TRACK",tier:2,price:45e5,throughputWpm:16,description:"初步自動化旋轉塗膠與自動烘烤模組，大幅減少人工操作失誤。",scienceNote:"機械手臂自動傳送晶圓至旋塗杯，自動注膠均勻成膜，並整合冷卻板 (Chill Plate) 精確控制膜厚。",assetPath:k.machines.track_single.path},{modelId:"track_dual",name:"雙軌連線 Track (Dual Track)",category:"TRACK",tier:3,price:12e6,throughputWpm:35,description:"雙獨立機械臂分開處理塗膠與顯影，有效提升次微米連線吞吐量。",scienceNote:"將塗膠旋塗單元 (Coater) 與顯影槽 (Developer) 實體隔離，避免顯影鹼液氣體污染光阻，保障微影良率。",assetPath:k.machines.track_dual.path},{modelId:"track_clean",name:"多工位精密 Clean Track",category:"TRACK",tier:4,price:3e7,throughputWpm:75,description:"多旋塗室並聯，高速熱板陣列，建議為先進微影機配備 2 台以上！",scienceNote:"配置多組 Coater/Developer 模組與快速溫控熱板，支援化學增幅光阻嚴苛的曝光後烘烤 (PEB) 溫度控制。",assetPath:k.machines.track_clean.path},{modelId:"track_advanced",name:"先進極限分子級 Track",category:"TRACK",tier:6,price:25e7,throughputWpm:160,description:"分子級膜厚控制，完美適配 EUV 超薄金屬氧化物光阻 (MOR)。",scienceNote:"具備超微量旋塗技術與化學氣相沉積底膜 (Underlayer)，將光阻粗糙度 (LWR) 降至分子級極限。",assetPath:k.machines.track_advanced.path},{modelId:"film_furnace",name:"高溫熱氧化爐管 (Horizontal Furnace)",category:"FILM",tier:1,price:18e5,throughputWpm:12,description:"利用 1000°C 高溫水汽使矽表面長出堅硬均勻的二氧化矽 (SiO2) 絕緣保護層。",scienceNote:"利用高純度氧氣或水蒸氣在高溫下與矽晶圓反應：Si + O2 -> SiO2，生長厚度均勻的高品質絕緣氧化層。",assetPath:k.machines.film_furnace.path},{modelId:"film_pecvd",name:"電漿增強化學氣相沉積機 (PECVD / ALD)",category:"FILM",tier:4,price:25e6,throughputWpm:110,description:"利用電漿在低溫下快速沉積氮化矽、金屬介電質，並支援原子層沉積 (ALD)。",scienceNote:"以射頻電漿解離前驅氣體，可在較低溫度 (300°C) 下沉積薄膜，避免破壞底層已摻雜之電晶體結構。",assetPath:k.machines.film_pecvd.path},{modelId:"etch_wet",name:"濕式酸槽清洗台 (Wet Chemical Bench)",category:"ETCH",tier:1,price:15e5,throughputWpm:12,description:"利用氫氟酸 (HF) 與化學酸液浸泡溶解未受光阻保護之薄膜，等向性腐蝕。",scienceNote:"化學濕法腐蝕屬於等向性蝕刻 (Isotropic)，容易產生側向掏空 (Undercut)，適合 3µm 以上粗線寬。",assetPath:k.machines.etch_wet.path},{modelId:"etch_plasma",name:"電漿乾式蝕刻機 (RIE / ICP-RIE)",category:"ETCH",tier:3,price:28e6,throughputWpm:50,description:"以高能反應離子轟擊進行垂直非等向性蝕刻，線條邊緣垂直銳利！",scienceNote:"反應性離子蝕刻 (RIE) 結合物理離子轟擊與化學自由基反應，具備極高垂直各向異性 (Anisotropic)，是次微米微影的關鍵搭檔。",assetPath:k.machines.etch_plasma.path},{modelId:"diff_furnace",name:"熱擴散摻雜爐管 (Thermal Diffusion)",category:"DIFF",tier:1,price:2e6,throughputWpm:10,description:"將磷或硼蒸氣高溫擴散滲透進矽晶格中，形成 N 型與 P 型半導體通道。",scienceNote:"利用高溫晶格熱運動使雜質原子由高濃度向低濃度擴散，控溫容易但橫向擴散量大。",assetPath:k.machines.diff_furnace.path},{modelId:"diff_implanter",name:"大束流離子佈植機 (Ion Implanter)",category:"DIFF",tier:2,price:15e6,throughputWpm:20,description:"將雜質原子電離成高能離子束，如子彈般精確轟擊打入矽晶圓特定深度。",scienceNote:"高壓電場加速磷/砷/硼離子束，可獨立精確控制植入劑量與深度，無橫向擴散失真，是現代電晶體的核心技術。",assetPath:k.machines.diff_implanter.path},{modelId:"cmp_polisher",name:"化學機械平坦化研磨機 (CMP Polisher)",category:"CMP",tier:3,price:2e7,throughputWpm:40,description:"化學研磨液搭配高速研磨墊，將晶圓表面磨至分子級平坦，解鎖多層金屬佈線！",scienceNote:"利用研磨液 (Slurry) 的化學腐蝕軟化與奈米磨料的機械研磨，實現全晶圓奈米級全域平坦化 (Global Planarization)。",assetPath:k.machines.cmp_polisher.path}]);class q{static show(t,e){const s=document.getElementById("modal-container");s&&(this.candidates.length===0&&this.generateCandidates(t.player.foundryTier),this.render(s,t,e))}static generateCandidates(t){const e=["林","陳","黃","張","李","王","吳","劉","蔡","楊","許","鄭","謝","洪","郭"],s=["冠宇","家豪","博智","欣宜","雅婷","立群","崇德","柏翰","建良","哲瑋","俊廷","文傑"],a=["LITHO","TRACK","FILM","ETCH","DIFF","CMP"];this.candidates=[];for(let n=0;n<4;n++){const r=e[Math.floor(Math.random()*e.length)],i=s[Math.floor(Math.random()*s.length)],o=a[Math.floor(Math.random()*a.length)];let l="Young Specialist",c=2e4,p=45e3,u="專精基礎機台操作，磨損累積 -10%，微影 k1 -0.01。適合操作 Tier 1~2。";const h=Math.random();t>=5&&h>.6?(l="Fellow",c=5e5,p=35e4,u="頂級半導體物理泰斗，磨損累積 -80%，微影 k1 -0.06，良率 +15%，可抵銷先進製程視窗損失！"):t>=3&&h>.4?(l="Senior Engineer",c=12e4,p=15e4,u="多年產線調機權威，磨損累積 -50%，微影 k1 -0.04，良率 +10%。適合操作 Tier 3~5。"):t>=2&&h>.3&&(l="Skilled Worker",c=5e4,p=75e3,u="熟練製程技師，磨損累積 -25%，微影 k1 -0.02，良率 +5%。適合操作 Tier 1~3。"),this.candidates.push({id:`CAN-${Date.now().toString(36).slice(-4)}-${n}`,name:`${r}${i}`,rank:l,moduleSpecialty:o,signingBonus:c,salary:p,description:u})}}static render(t,e,s){var r;const a=e.staff.reduce((i,o)=>i+o.salary,0),n=((r=e.staff[0])==null?void 0:r.shiftMode)||"THREE_SHIFT";t.innerHTML=`
      <div id="modal-backdrop-hr" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-4xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden">
          
          <!-- Header -->
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-xl flex-shrink-0">
                👥
              </div>
              <div>
                <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
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

            <button id="btn-close-hr" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉人資中心">
              ✕
            </button>
          </div>

          <!-- Shift & Payroll Banner -->
          <div class="px-6 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs flex-shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-slate-400">廠區輪班機制:</span>
              <button
                id="btn-toggle-shift"
                class="px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${n==="THREE_SHIFT"?"bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30":"bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"}"
                title="點擊切換兩班制/三班制"
              >
                <span>${n==="THREE_SHIFT"?"🛡️ 三班制 (24H 在線 TPM 零故障)":"⚡ 兩班制 (節省 33% 薪水，疲勞累積快)"}</span>
                <span class="text-[10px] underline">點擊切換</span>
              </button>
            </div>

            <div class="flex items-center gap-4">
              <div>
                <span class="text-slate-400">每月薪資總額: </span>
                <span class="font-mono font-bold text-amber-300">NT$ ${a.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="flex border-b border-slate-700/60 bg-slate-900/40 px-6 pt-2 flex-shrink-0">
            <button
              id="tab-staff"
              class="px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${this.activeTab==="STAFF"?"border-purple-400 text-purple-300":"border-transparent text-slate-400 hover:text-slate-200"}"
            >
              <span>🧑‍🔬 現役廠務工程師</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">${e.staff.length}</span>
            </button>
            <button
              id="tab-market"
              class="px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${this.activeTab==="MARKET"?"border-purple-400 text-purple-300":"border-transparent text-slate-400 hover:text-slate-200"}"
            >
              <span>🤝 人才招募市場</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-purple-400">${this.candidates.length}</span>
            </button>

            ${this.activeTab==="MARKET"?`
              <button id="btn-refresh-candidates" class="ml-auto btn-sci-fi text-[11px] py-1 px-3 my-1">
                🔄 刷新履歷池
              </button>
            `:""}
          </div>

          <!-- Body -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4">
            ${this.activeTab==="STAFF"?this.renderStaffTab(e):this.renderMarketTab(e)}
          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
            <button id="btn-back-hr" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
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
        ${t.staff.map(e=>{const s=t.machines.find(r=>r.id===e.assignedMachineId);let a=!1,n=!1;return s&&(a=M.checkTPMConditions(s,e).isTPMActive,n=M.checkExplosionRisk(s,e).hasRisk),`
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
                  ${t.machines.map(r=>`
                    <option value="${r.id}" ${e.assignedMachineId===r.id?"selected":""}>
                      ${r.name} (${r.category} Tier ${r.tier})
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
    `}static bindEvents(t,e,s){var r,i,o,l,c,p,u;const a=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",n)},n=h=>{h.key==="Escape"&&a()};window.addEventListener("keydown",n),(r=document.getElementById("btn-close-hr"))==null||r.addEventListener("click",a),(i=document.getElementById("btn-back-hr"))==null||i.addEventListener("click",a),(o=document.getElementById("modal-backdrop-hr"))==null||o.addEventListener("click",h=>{h.target===document.getElementById("modal-backdrop-hr")&&a()}),(l=document.getElementById("tab-staff"))==null||l.addEventListener("click",()=>{b.playClick(),this.activeTab="STAFF",this.render(t,e,s)}),(c=document.getElementById("tab-market"))==null||c.addEventListener("click",()=>{b.playClick(),this.activeTab="MARKET",this.render(t,e,s)}),(p=document.getElementById("btn-refresh-candidates"))==null||p.addEventListener("click",()=>{b.playClick(),this.generateCandidates(e.player.foundryTier),this.render(t,e,s)}),(u=document.getElementById("btn-toggle-shift"))==null||u.addEventListener("click",()=>{var m;b.playClick();const d=(((m=e.staff[0])==null?void 0:m.shiftMode)||"THREE_SHIFT")==="THREE_SHIFT"?"TWO_SHIFT":"THREE_SHIFT";e.staff.forEach(f=>{f.shiftMode=d,d==="TWO_SHIFT"?f.salary=Math.round(f.salary*.67):f.salary=Math.round(f.salary/.67)}),s(),this.render(t,e,s)}),t.querySelectorAll(".btn-hire-candidate").forEach(h=>{h.addEventListener("click",d=>{var w;const m=parseInt(d.currentTarget.getAttribute("data-index")||"0",10),f=this.candidates[m];if(!f)return;if(e.player.cash<f.signingBonus){alert("資金不足，無法支付簽約獎金！");return}e.player.cash-=f.signingBonus,b.playCoinChime();const g=((w=e.staff[0])==null?void 0:w.shiftMode)||"THREE_SHIFT",x={id:`STF-${Date.now().toString(36).toUpperCase().slice(-5)}`,name:f.name,rank:f.rank,moduleSpecialty:f.moduleSpecialty,fatigue:20,shiftMode:g,assignedMachineId:null,salary:f.salary};e.staff.push(x),this.candidates.splice(m,1),I.checkAchievements(e),s(),this.activeTab="STAFF",this.render(t,e,s)})}),t.querySelectorAll(".select-machine").forEach(h=>{h.addEventListener("change",d=>{const m=d.currentTarget.getAttribute("data-staff-id"),f=d.currentTarget.value||null,g=e.staff.find(x=>x.id===m);if(g){if(f){const x=e.staff.find(w=>w.assignedMachineId===f&&w.id!==m);x&&(x.assignedMachineId=null)}g.assignedMachineId=f,e.machines.forEach(x=>{x.id===f?x.assignedEngineerId=g.id:x.assignedEngineerId===g.id&&(x.assignedEngineerId=null)}),b.playClick(),I.checkAchievements(e),s(),this.render(t,e,s)}})}),t.querySelectorAll(".btn-fire-staff").forEach(h=>{h.addEventListener("click",d=>{const m=d.currentTarget.getAttribute("data-staff-id"),f=e.staff.findIndex(x=>x.id===m);if(f===-1)return;const g=e.staff[f];if(confirm(`確定要資遣工程師【${g.name}】嗎？`)){if(g.assignedMachineId){const x=e.machines.find(w=>w.id===g.assignedMachineId);x&&(x.assignedEngineerId=null)}e.staff.splice(f,1),b.playClick(),s(),this.render(t,e,s)}})})}}y(q,"activeTab","STAFF"),y(q,"candidates",[]);class j{static getSpeedMultiplier(){return this.speedMultiplier}static init(t,e,s){const a=new URLSearchParams(window.location.search);(a.get("dev")==="true"||a.get("admin")==="foundry")&&this.toggle(t,e,s),window.addEventListener("keydown",r=>{r.ctrlKey&&r.shiftKey&&r.code==="KeyD"&&(r.preventDefault(),this.toggle(t,e,s))})}static toggle(t,e,s){this.isVisible=!this.isVisible;const a=document.getElementById("dev-console");if(a){if(!this.isVisible){a.innerHTML="";return}b.playClick(),this.render(a,t,e,s)}}static render(t,e,s,a){var n,r,i,o;t.innerHTML=`
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
            ${[1,2,4,8].map(l=>`
              <button
                class="btn-speed btn-sci-fi text-xs py-1 justify-center ${this.speedMultiplier===l?"bg-red-600 border-red-400 text-white font-bold":""}"
                data-speed="${l}"
              >
                ${l}x
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
    `,(n=document.getElementById("btn-dev-close"))==null||n.addEventListener("click",()=>{this.isVisible=!1,t.innerHTML=""}),document.querySelectorAll(".btn-speed").forEach(l=>{l.addEventListener("click",c=>{b.playClick();const p=Number(c.currentTarget.getAttribute("data-speed"));this.speedMultiplier=p,s(p),this.render(t,e,s,a)})}),(r=document.getElementById("btn-add-cash"))==null||r.addEventListener("click",()=>{e.player.cash+=5e7,b.playCoin(),a()}),(i=document.getElementById("btn-trigger-wear"))==null||i.addEventListener("click",()=>{for(const l of e.machines)l.wear=Math.min(100,l.wear+50),l.wear>=80&&(l.status="MAINTENANCE");b.playWarning(),a()}),(o=document.getElementById("btn-reset-save"))==null||o.addEventListener("click",()=>{confirm("確定要清空本地存檔並重置遊戲嗎？")&&(localStorage.clear(),window.location.reload())})}}y(j,"isVisible",!1),y(j,"speedMultiplier",1);class V{static show(t,e,s){const a=document.getElementById("modal-container");a&&(s!==void 0&&(this.currentStep=s),this.render(a,t,e))}static isCompleted(){return localStorage.getItem("silicon_tycoon_tutorial_completed")==="true"}static markCompleted(){localStorage.setItem("silicon_tycoon_tutorial_completed","true")}static render(t,e,s){const a=this.currentStep,n=[{stepNum:1,badge:"🚀 歡迎創辦人",title:"歡迎來到《Silicon Tycoon: 矽島霸權》",icon:"🏭",content:`
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
        `,btnPrimaryText:"🎉 完成新手引導，稱霸矽島！",btnPrimaryAction:"finish"}],r=n[a]||n[0];t.innerHTML=`
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-xl text-slate-100 flex flex-col relative animate-fade-in">
          
          <!-- Close button -->
          <button id="btn-close-tutorial" class="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-lg" title="跳過教學">
            ✕
          </button>

          <!-- Step Badge & Header -->
          <div class="flex items-center gap-3 pb-3 border-b border-slate-700/70">
            <div class="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-inner">
              ${r.icon}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  ${r.badge}
                </span>
                <span class="text-xs text-slate-400 font-mono">
                  步驟 ${r.stepNum} / ${this.totalSteps}
                </span>
              </div>
              <h3 class="text-base font-bold text-white tracking-wide mt-0.5">
                ${r.title}
              </h3>
            </div>
          </div>

          <!-- Step Progress Dots -->
          <div class="flex items-center justify-center gap-2 py-3">
            ${n.map((i,o)=>`
              <div class="h-1.5 rounded-full transition-all duration-300 ${o===a?"w-8 bg-cyan-400":o<a?"w-3 bg-emerald-400":"w-3 bg-slate-700"}"></div>
            `).join("")}
          </div>

          <!-- Step Content Body -->
          <div class="modal-body text-xs text-slate-300 space-y-3 pb-4 max-h-[60vh] overflow-y-auto pr-1">
            ${r.content}
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-3 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
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
                ${r.btnPrimaryText}
              </button>
            </div>
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s,r.btnPrimaryAction)}static bindEvents(t,e,s,a){var i,o,l,c,p;const n=()=>{b.playClick(),t.innerHTML="",this.markCompleted()};(i=document.getElementById("btn-close-tutorial"))==null||i.addEventListener("click",n),(o=document.getElementById("btn-skip-tutorial-all"))==null||o.addEventListener("click",n);const r=t.querySelector(".modal-backdrop");r==null||r.addEventListener("click",u=>{u.target===r&&n()}),(l=document.getElementById("btn-tutorial-prev"))==null||l.addEventListener("click",()=>{b.playClick(),this.currentStep=Math.max(0,this.currentStep-1),this.render(t,e,s)}),(c=document.getElementById("btn-tutorial-skip-production"))==null||c.addEventListener("click",()=>{if(b.playFanfare(),e.activeLots.length>0)for(const u of e.activeLots)u.currentStation="DIFF",u.status="COMPLETED",u.yieldMultiplier=.96;else{const u=e.activeOrders.length>0?e.activeOrders[0].id:"starter_demo";e.activeLots.push({lotId:`LOT-${Date.now().toString().slice(-4)}`,orderId:u,waferCount:25,currentStation:"DIFF",currentLayer:3,totalLayers:3,qTimeDeadline:null,yieldMultiplier:.95,status:"COMPLETED"})}s(),this.currentStep=3,this.render(t,e,s)}),(p=document.getElementById("btn-tutorial-action"))==null||p.addEventListener("click",()=>{b.playClick(),a==="next"?(this.currentStep=Math.min(this.totalSteps-1,this.currentStep+1),this.render(t,e,s)):a==="open_contract"?(t.innerHTML="",R.show(e,()=>s())):a==="open_wafer_map"?(t.innerHTML="",D.show(e,null,()=>s())):a==="finish"&&(this.markCompleted(),b.playFanfare(),t.innerHTML="",s())})}}y(V,"currentStep",0),y(V,"totalSteps",5);class ee{constructor(t,e,s){y(this,"topHUD");y(this,"state");y(this,"onStateUpdated");this.state=t,this.onStateUpdated=s,this.topHUD=new U("top-hud",{onOpenContracts:()=>this.openContracts(),onOpenStore:()=>this.openStore(),onOpenHR:()=>this.openHR(),onOpenQuests:()=>this.openQuests(),onOpenAchievements:()=>this.openAchievements(),onOpenAdvisory:()=>this.openAdvisory(),onToggleMES:a=>this.onStateUpdated(),onOpenSaveModal:()=>this.openSaveModal(),onOpenWaferMap:()=>this.openWaferMap(),onOpenTutorial:()=>this.openTutorial()}),j.init(t,e,s),(!t.player.companyName||t.player.companyName==="矽島先進半導體")&&Y.show(t,()=>{this.render(),this.onStateUpdated(),V.isCompleted()||this.openTutorial()}),this.render()}render(){this.topHUD.render(this.state),this.renderProductionTicker()}renderProductionTicker(){var s;const t=document.getElementById("hud-widgets");if(!t)return;const e=this.state.activeLots.filter(a=>a.status==="PROCESSING");if(e.length===0)this.state.activeOrders.length===0?t.innerHTML=`
          <div id="hud-production-ticker" title="目前無在製訂單，點擊前往合約板承接新訂單">
            <span class="text-amber-400">📋</span>
            <span class="text-slate-300 font-medium">產線待命中 — 點擊合約板承接新訂單</span>
          </div>
        `:t.innerHTML=`
          <div id="hud-production-ticker" class="border-emerald-500/60" title="所有批次已加工完畢，點擊進行出貨結算">
            <span class="text-emerald-400 animate-bounce">📦</span>
            <span class="text-emerald-300 font-bold">晶圓已完工！點此進行出貨結算尾款</span>
          </div>
        `;else{const a={};for(const r of e){const i=r.currentStation==="LIT"?`LIT(${r.litSubStep||"COAT"})`:r.currentStation;a[i]=(a[i]||0)+1}const n=Object.entries(a).map(([r,i])=>`${r}: ${i}批`).join(" | ");t.innerHTML=`
        <div id="hud-production-ticker" title="點擊檢視在製訂單與批次進度">
          <span class="animate-spin text-cyan-400">⚙️</span>
          <span class="font-bold text-white">生產進行中:</span>
          <span class="text-cyan-300 font-mono font-bold">${e.length} 批在製</span>
          <span class="text-slate-500">|</span>
          <span class="text-amber-300 font-mono text-[11px]">${n}</span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-200 border border-cyan-500/30">查看訂單</span>
        </div>
      `}(s=document.getElementById("hud-production-ticker"))==null||s.addEventListener("click",()=>{b.playClick(),this.openContracts()})}openContracts(){R.show(this.state,()=>{this.render(),this.onStateUpdated()})}openStore(){N.show(this.state,()=>{this.render(),this.onStateUpdated()})}openHR(){q.show(this.state,()=>{this.render(),this.onStateUpdated()})}openQuests(){Z.show(this.state,()=>{this.render(),this.onStateUpdated()})}openAchievements(){X.show(this.state,()=>{this.render(),this.onStateUpdated()})}openAdvisory(){J.show(this.state,()=>{this.openStore()},()=>{this.openHR()})}openWaferMap(t){D.show(this.state,t,()=>{this.render(),this.onStateUpdated()})}openLayerAllocation(t){B.show(this.state,t,()=>{this.render(),this.onStateUpdated()})}openTutorial(t){V.show(this.state,()=>{this.render(),this.onStateUpdated()},t)}openSaveModal(){var a,n,r,i,o,l;const t=document.getElementById("modal-container");if(!t)return;const e=c=>{c.key==="Escape"&&(t.innerHTML="",window.removeEventListener("keydown",e))};window.addEventListener("keydown",e);const s=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",e)};t.innerHTML=`
      <div id="modal-backdrop-save" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-lg text-slate-100 flex flex-col max-h-[88vh]">
          <div class="modal-header flex items-center justify-between pb-3 border-b border-slate-700 flex-shrink-0">
            <h3 class="text-base font-bold flex items-center gap-2">
              <span>💾</span>
              <span>存檔備份與 JSON 匯出/匯入</span>
            </h3>
            <button id="btn-close-save-modal" class="text-slate-400 hover:text-white font-mono text-lg transition-colors">✕</button>
          </div>

          <div class="modal-body overflow-y-auto flex-1 py-4 space-y-3 text-xs text-slate-300">
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

          <div class="modal-footer flex items-center justify-between pt-3 border-t border-slate-700 flex-shrink-0">
            <span class="text-xs text-slate-400 font-mono">按 ESC 或點擊外部背景亦可返回</span>
            <button id="btn-return-save" class="btn-sci-fi px-4 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700">
              ◀ 返回無塵室
            </button>
          </div>
        </div>
      </div>
    `,(a=document.getElementById("btn-close-save-modal"))==null||a.addEventListener("click",s),(n=document.getElementById("btn-return-save"))==null||n.addEventListener("click",s),(r=document.getElementById("modal-backdrop-save"))==null||r.addEventListener("click",c=>{c.target===c.currentTarget&&s()}),(i=document.getElementById("btn-export-save"))==null||i.addEventListener("click",()=>{b.playClick();const c=$.exportSaveToJson(this.state),p=new Blob([c],{type:"application/json"}),u=URL.createObjectURL(p),h=document.createElement("a");h.href=u,h.download=`silicon_tycoon_save_${Date.now()}.json`,h.click(),URL.revokeObjectURL(u)}),(o=document.getElementById("btn-import-save"))==null||o.addEventListener("click",()=>{var c;(c=document.getElementById("file-import-save"))==null||c.click()}),(l=document.getElementById("file-import-save"))==null||l.addEventListener("change",c=>{var u;const p=(u=c.target.files)==null?void 0:u[0];if(p){const h=new FileReader;h.onload=d=>{var g;const m=(g=d.target)==null?void 0:g.result,f=$.importSaveFromJson(m);f.success&&f.state?($.saveToLocalStorage(f.state),alert("存檔匯入成功！即將重新載入遊戲。"),window.location.reload()):alert(`匯入失敗: ${f.error}`)},h.readAsText(p)}})}showNotice(t){const e=document.createElement("div");e.className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs font-medium shadow-2xl animate-bounce",e.innerText=t,document.body.appendChild(e),setTimeout(()=>e.remove(),2500)}}class te{static show(t,e,s){const a=document.getElementById("modal-container");a&&this.render(a,t,e,s)}static render(t,e,s,a){const n=k.machines[e.modelId],r=(n==null?void 0:n.path)||"./assets/machines/litho_contact.png",i=N.STORE_CATALOG.find(v=>v.modelId===e.modelId),o=i?Math.round(i.price*.15):3e5,l=i?Math.round(i.price*.4):8e5,c=Math.round(e.wear),p=s.staff.find(v=>v.id===e.assignedEngineerId);let u=!1,h=!1;p&&(u=M.checkTPMConditions(e,p).isTPMActive,h=M.checkExplosionRisk(e,p).hasRisk);let d=null,m=null;if(e.category==="LITHO"){const v=O.OPTICAL_CATALOG[e.modelId];if(v){const C=O.calculateEffectiveK1(s.player.unlockedK1,e.wear,p||null);d={effectiveK1:C.effectiveK1,formula:`Base(${C.k1Tech.toFixed(2)}) + 磨損(+${C.deltaWear.toFixed(3)}) - 調校(-${C.deltaEngineer.toFixed(2)}) + 疲勞(+${C.deltaFatigue.toFixed(2)})`},m=Math.round(C.effectiveK1*(v.wavelengthNm/v.numericalAperture))}}const f=e.category==="LITHO",g=s.machines.filter(v=>v.category==="TRACK"&&v.status!=="EXPLODED"),x=e.pairedTrackIds||[],w=S.BASE_THROUGHPUT_BY_TIER.LIT[e.tier]||10;let E=0;for(const v of x){const C=s.machines.find(W=>W.id===v);C&&(E+=S.BASE_THROUGHPUT_BY_TIER.TRACK[C.tier]||6)}const L=f&&(x.length===0||E<w),F=s.activeLots.filter(v=>v.status!=="PROCESSING"?!1:e.category==="TRACK"?v.currentStation==="LIT"&&(v.litSubStep==="COAT"||v.litSubStep==="DEVELOP"):e.category==="LITHO"?v.currentStation==="LIT"&&v.litSubStep==="EXPOSE":v.currentStation===e.category),A=F.length>0;t.innerHTML=`
      <div id="modal-backdrop-machine" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-2xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden animate-fadeIn">
          
          <!-- Header -->
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80">
            <div class="flex items-center gap-3">
              <div class="machine-panel-thumb w-14 h-14 rounded-xl bg-slate-950 border border-cyan-500/50 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src="${r}" alt="${e.name}" class="w-full h-full object-contain filter drop-shadow" style="max-width: 52px; max-height: 52px;" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-white tracking-wide">${e.name}</h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Tier ${e.tier}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono ${A||e.status==="PROCESSING"?"bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse":e.status==="MAINTENANCE"?"bg-amber-500/20 text-amber-300 border border-amber-500/30":e.status==="EXPLODED"?"bg-red-600 text-white font-bold animate-bounce":"bg-slate-800 text-slate-300"}">
                    ${A?"⚡ 加工中 (PROCESSING)":e.status}
                  </span>
                </div>
                <div class="text-xs text-slate-400 font-mono mt-0.5">
                  ID: ${e.id} | 格線座標: (${e.gridX}, ${e.gridY}) | 站點類別: ${e.category}
                </div>
              </div>
            </div>

            <button id="btn-close-machine-panel" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉面板">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4 text-xs">

            <!-- 1. Equipment Description & Science Principles (半導體科普與機台說明) -->
            <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div class="text-xs text-slate-200 font-medium leading-relaxed">
                ${(i==null?void 0:i.description)||"廠內現役半導體晶圓製造專用設備。"}
              </div>
              ${i!=null&&i.scienceNote?`
                <div class="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200/90 leading-relaxed">
                  <span class="font-bold text-cyan-300">ℹ️ 半導體物理原理：</span>
                  ${i.scienceNote}
                </div>
              `:""}
              <div class="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div class="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span class="text-slate-400">標準吞吐產能:</span>
                  <span class="text-cyan-300 font-bold">${(i==null?void 0:i.throughputWpm)||10} 晶圓/分</span>
                </div>
                <div class="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span class="text-slate-400">${e.category==="LITHO"?"Rayleigh 極限 CD:":"製程站點:"}</span>
                  <span class="text-emerald-400 font-bold">${i!=null&&i.rayleighLimitNm?i.rayleighLimitNm+" nm":e.category}</span>
                </div>
              </div>
            </div>

            <!-- 2. Live Production Job Status (即時生產在製狀態) -->
            <div class="p-3.5 rounded-xl bg-slate-900/80 border ${A?"border-cyan-500/40 bg-cyan-950/20":"border-slate-800"} space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white flex items-center gap-1.5">
                  <span>⚙️</span>
                  <span>生產加工狀態 (Production Status)</span>
                </span>
                <span class="font-mono text-xs ${A?"text-cyan-300 font-bold animate-pulse":"text-slate-400"}">
                  ${A?"⚡ 正在加工批次":"待命中 (Ready / IDLE)"}
                </span>
              </div>
              ${A?`
                <div class="space-y-1.5 pt-1 font-mono text-xs">
                  ${F.map(v=>`
                    <div class="p-2.5 rounded-lg bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between">
                      <div>
                        <span class="text-cyan-300 font-bold">${v.lotId}</span>
                        <span class="text-[11px] text-slate-400 ml-2">第 ${v.currentLayer}/${v.totalLayers} 層 [${v.currentStation}${v.litSubStep?" - "+v.litSubStep:""}]</span>
                      </div>
                      <div class="text-emerald-400 font-bold">
                        良率 ${(v.yieldMultiplier*100).toFixed(0)}%
                      </div>
                    </div>
                  `).join("")}
                </div>
              `:`
                <div class="text-[11px] text-slate-400 py-1">
                  目前無正在加工的晶圓批次，機台妥善待命中。請至「合約」承接訂單投片！
                </div>
              `}
            </div>

            <!-- 3. Wear & Health Bar -->
            <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between font-mono">
                <span class="text-slate-400 flex items-center gap-1.5">
                  <span>🛠️</span>
                  <span>機台磨損與在線健康度</span>
                </span>
                <span class="font-bold ${c>70?"text-red-400":c>40?"text-amber-400":"text-emerald-400"}">
                  磨損: ${c}% (健康度 ${100-c}%)
                </span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div class="h-full transition-all duration-300 ${c>70?"bg-red-500":c>40?"bg-amber-500":"bg-emerald-500"}" style="width: ${c}%;"></div>
              </div>

              <!-- Status Alert Badges -->
              ${u?`
                <div class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2">
                  <span class="text-base">🛡️</span>
                  <div>
                    <span class="font-bold">TPM 24H 零故障在線維護中：</span>
                    工程師在線微調，磨損鎖死在 5% 以下，故障率保證為 0%！
                  </div>
                </div>
              `:""}

              ${h?`
                <div class="p-2 rounded-lg bg-red-950/40 border border-red-600/50 text-red-300 flex items-center gap-2 animate-pulse">
                  <span class="text-base">💥</span>
                  <div>
                    <span class="font-bold">越級操作極度危險！</span>
                    工程師職等落後機台 2 級以上，每次投片皆有 25% 炸機破壞風險！
                  </div>
                </div>
              `:""}
            </div>

            <!-- 4. Litho Specific Optical Rayleigh Details -->
            ${f&&d?`
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
                    <span class="text-cyan-300 font-bold">${d.effectiveK1.toFixed(3)}</span>
                  </div>
                  <div class="text-[10px] text-slate-500">
                    計算分解: ${d.formula}
                  </div>
                  ${d.effectiveK1<.38?`
                    <div class="text-[10px] text-amber-400 pt-1">
                      ⚠️ 逼近物理極限 (k1 < 0.38)，聚焦景深裕度狹窄，產生製程窗良率折損！
                    </div>
                  `:""}
                </div>
              </div>
            `:""}

            <!-- 5. Option B: Paired Track Selection -->
            ${f?`
              <div class="p-3.5 rounded-xl bg-slate-900/80 border ${L?"border-amber-500/40":"border-slate-800"} space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-white flex items-center gap-1.5">
                    <span>🌀</span>
                    <span>連線機組 Track 塗膠顯影機配套綁定 (Option B)</span>
                  </span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    微影 ${w} 片/分 vs Track ${E} 片/分
                  </span>
                </div>

                <p class="text-[11px] text-slate-400">
                  半導體黃光區晶圓每層必須進出 Track 兩次 (塗膠 + 顯影)！可勾選並聯多台 Track 機台分流吞吐：
                </p>

                ${g.length===0?`
                  <div class="p-2.5 rounded bg-red-950/20 border border-red-800/30 text-red-300 text-[11px]">
                    ⚠️ 廠內尚未安裝任何 Track 塗膠顯影機！微影機無法單獨運作，請前往商城採購！
                  </div>
                `:`
                  <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    ${g.map(v=>{const C=x.includes(v.id),W=S.BASE_THROUGHPUT_BY_TIER.TRACK[v.tier]||6;return`
                        <label class="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border ${C?"border-cyan-500/40 bg-cyan-950/10":"border-slate-800"} cursor-pointer hover:border-slate-700">
                          <div class="flex items-center gap-2">
                            <input
                              type="checkbox"
                              class="chk-paired-track rounded border-slate-700 text-cyan-500 focus:ring-0"
                              data-track-id="${v.id}"
                              ${C?"checked":""}
                            />
                            <span class="font-semibold text-slate-200 text-xs">${v.name}</span>
                            <span class="text-[10px] text-slate-400 font-mono">(Tier ${v.tier})</span>
                          </div>
                          <span class="font-mono text-[11px] text-cyan-300">+${W} 晶圓/分</span>
                        </label>
                      `}).join("")}
                  </div>
                `}

                ${L?`
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

            <!-- 6. Station Engineer Assignment -->
            <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white flex items-center gap-1.5">
                  <span>🧑‍🔬</span>
                  <span>駐機製程工程師配置</span>
                </span>
                ${p?`
                  <span class="text-[10px] font-mono text-purple-300">
                    ${p.rank} (${p.moduleSpecialty})
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

            <!-- 7. Machine Maintenance Actions -->
            <div class="flex items-center gap-3 pt-2">
              <button
                id="btn-machine-overhaul"
                class="flex-1 btn-sci-fi justify-center py-2.5 text-xs bg-cyan-700/80 hover:bg-cyan-600 ${s.player.cash<o||e.wear<=5?"opacity-50 cursor-not-allowed":""}"
                ${s.player.cash<o||e.wear<=5?"disabled":""}
              >
                🛠️ 就地大修保養 (NT$ ${o.toLocaleString()})
              </button>

              <button
                id="btn-machine-decommission"
                class="px-4 py-2.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-800/40 text-red-300 text-xs transition-colors"
              >
                ♻️ 報廢變賣 (+NT$ ${l.toLocaleString()})
              </button>
            </div>

          </div>

          <!-- Footer: Clear Return / Back Button -->
          <div class="modal-footer p-4 border-t border-slate-700/80 bg-slate-900/90 flex items-center gap-3">
            <button id="btn-back-machine" class="btn-sci-fi w-full justify-center py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-lg">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s,a)}static bindEvents(t,e,s,a){var i,o,l,c,p,u;const n=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",r)},r=h=>{h.key==="Escape"&&n()};window.addEventListener("keydown",r),(i=document.getElementById("btn-close-machine-panel"))==null||i.addEventListener("click",n),(o=document.getElementById("btn-back-machine"))==null||o.addEventListener("click",n),(l=document.getElementById("modal-backdrop-machine"))==null||l.addEventListener("click",h=>{h.target===document.getElementById("modal-backdrop-machine")&&n()}),t.querySelectorAll(".chk-paired-track").forEach(h=>{h.addEventListener("change",()=>{b.playClick();const d=[];t.querySelectorAll(".chk-paired-track:checked").forEach(m=>{const f=m.getAttribute("data-track-id");f&&d.push(f)}),e.pairedTrackIds=d,a(),this.render(t,e,s,a)})}),(c=document.getElementById("select-station-engineer"))==null||c.addEventListener("change",h=>{b.playClick();const d=h.target.value||null;if(e.assignedEngineerId){const m=s.staff.find(f=>f.id===e.assignedEngineerId);m&&(m.assignedMachineId=null)}if(e.assignedEngineerId=d,d){const m=s.staff.find(f=>f.id===d);if(m){if(m.assignedMachineId){const f=s.machines.find(g=>g.id===m.assignedMachineId);f&&(f.assignedEngineerId=null)}m.assignedMachineId=e.id}}a(),this.render(t,e,s,a)}),(p=document.getElementById("btn-machine-overhaul"))==null||p.addEventListener("click",()=>{const h=N.STORE_CATALOG.find(m=>m.modelId===e.modelId),d=h?Math.round(h.price*.15):3e5;if(s.player.cash<d){alert("資金不足，無法執行大修！");return}s.player.cash-=d,e.wear=0,e.status="IDLE",b.playClick(),a(),this.render(t,e,s,a)}),(u=document.getElementById("btn-machine-decommission"))==null||u.addEventListener("click",()=>{const h=N.STORE_CATALOG.find(f=>f.modelId===e.modelId),d=h?Math.round(h.price*.4):8e5;if(!confirm(`確定要將設備【${e.name}】除役報廢嗎？回收變賣金額 NT$ ${d.toLocaleString()}`))return;if(e.assignedEngineerId){const f=s.staff.find(g=>g.id===e.assignedEngineerId);f&&(f.assignedMachineId=null)}const m=s.machines.findIndex(f=>f.id===e.id);m!==-1&&s.machines.splice(m,1),s.player.cash+=d,b.playCoinChime(),t.innerHTML="",a()})}}class se{constructor(){y(this,"state",$.loadFromLocalStorage()||$.createDefaultSave());y(this,"phaserGame");y(this,"cleanroomScene");y(this,"uiManager");y(this,"autoSaveTimer",0);console.log("🚀 正在啟動 Silicon Tycoon: Foundry Master 矽島霸權...");const t=Date.now();if(this.state.lastOnlineTimestamp&&t-this.state.lastOnlineTimestamp>60*1e3){const a=$.calculateOfflineProgress(this.state,t);console.log("離線營運結算戰報:",a)}const e=new Date().toISOString().split("T")[0];this.state.questState=P.refreshDailyQuests(this.state.questState,this.state.player,this.state.unlockedFeatures,e),I.checkAchievements(this.state);const s={type:Phaser.AUTO,parent:"game-container",width:window.innerWidth,height:window.innerHeight,backgroundColor:"#070b14",render:{antialias:!0,pixelArt:!1},scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH}};this.phaserGame=new Phaser.Game(s),this.cleanroomScene=new H,this.phaserGame.scene.add(H.KEY,this.cleanroomScene,!0,{saveGame:this.state,onMachineClick:a=>this.handleMachineClick(a)}),this.uiManager=new ee(this.state,a=>{console.log(`開發者調整遊戲速度至: ${a}x`)},()=>{this.onStateChanged()}),setInterval(()=>this.simulationTick(),1e3)}simulationTick(){const t=j.getSpeedMultiplier();for(let s=0;s<t;s++){this.state.gameTime+=1;const a=new Map(this.state.staff.map(i=>[i.id,i]));for(const i of this.state.machines){if(i.status==="EXPLODED")continue;const o=i.assignedEngineerId?a.get(i.assignedEngineerId):null,l=M.updateMachineHealth(i,o,1);i.wear=l.newWear,l.breakdownOccurred&&(i.status=l.isExploded?"EXPLODED":"MAINTENANCE")}const n=new Set;for(const i of this.state.activeLots)i.status==="PROCESSING"&&(i.currentStation==="LIT"?i.litSubStep==="COAT"||i.litSubStep==="DEVELOP"?n.add("TRACK"):n.add("LITHO"):n.add(i.currentStation));for(const i of this.state.machines)i.status==="EXPLODED"||i.status==="MAINTENANCE"||(n.has(i.category)?i.status="PROCESSING":i.status="IDLE");const r=[];for(const i of this.state.activeLots)if(i.status==="PROCESSING"){const o=this.state.activeOrders.find(p=>p.id===i.orderId),l=o?o.nodeNm:1e4;if(S.advanceLotStation(i,this.state.unlockedFeatures.cmp,l,this.state.player.unlockedCleanroomClass,this.state.gameTime).isLotCompleted&&(i.status="COMPLETED",o)){const p=this.state.activeLots.filter(d=>d.orderId===o.id),u=Math.round(o.totalDies/Math.max(1,p.length)*i.yieldMultiplier);o.goodDiesDelivered=Math.min(o.totalDies,o.goodDiesDelivered+u),this.state.rollingYieldHistory.push(Number(i.yieldMultiplier.toFixed(3))),this.state.rollingYieldHistory.length>5&&this.state.rollingYieldHistory.shift(),P.onWaferDelivered(this.state.questState,i.waferCount),p.every(d=>d.status==="COMPLETED")&&!r.includes(o)&&r.push(o)}}if(this.state.unlockedFeatures.mesAutoDispatch&&r.length>0)for(const i of r){const o=_.settleOrderPayout(i,i.goodDiesDelivered,this.state.player,this.state.staff,0,this.state.clawbackDebt);this.state.player.cash+=o.netPayout,this.state.clawbackDebt=o.remainingDebt,this.state.player.popularity=Math.min(100,this.state.player.popularity+1),P.onOrderFulfilled(this.state.questState),this.state.activeOrders=this.state.activeOrders.filter(l=>l.id!==i.id),this.state.activeLots=this.state.activeLots.filter(l=>l.orderId!==i.id)}}I.checkAchievements(this.state).newlyUnlocked.length>0&&this.uiManager.render(),this.autoSaveTimer+=1,this.autoSaveTimer>=10&&(this.autoSaveTimer=0,$.saveToLocalStorage(this.state)),this.uiManager.render(),this.cleanroomScene.updateState(this.state)}handleMachineClick(t){te.show(t,this.state,()=>this.onStateChanged())}onStateChanged(){$.saveToLocalStorage(this.state),this.cleanroomScene.updateState(this.state),this.uiManager.render()}}window.addEventListener("DOMContentLoaded",()=>{new se});
