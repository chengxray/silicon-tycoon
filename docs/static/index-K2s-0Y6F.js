var he=Object.defineProperty;var fe=(C,e,t)=>e in C?he(C,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):C[e]=t;var w=(C,e,t)=>fe(C,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const n of a)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function t(a){const n={};return a.integrity&&(n.integrity=a.integrity),a.referrerPolicy&&(n.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?n.credentials="include":a.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(a){if(a.ep)return;a.ep=!0;const n=t(a);fetch(a.href,n)}})();class H{static getRequiredRankWeight(e){return e<=2?1:e<=4?2:e===5?3:4}static checkTPMConditions(e,t){if(!t)return{isTPMActive:!1,reason:"未指派工程師進駐"};if(t.moduleSpecialty!==e.category)return{isTPMActive:!1,reason:`專長不符！該機台為 ${e.category}，工程師專精為 ${t.moduleSpecialty}`};const s=this.getRequiredRankWeight(e.tier),a=this.RANK_WEIGHT[t.rank];return a<s?{isTPMActive:!1,reason:`職等不足！機台需等級 ${s}，該工程師為 ${t.rank} (等級 ${a})`}:t.workShift==="OFF"?{isTPMActive:!1,reason:"該工程師目前處於排休狀態 (OFF)，機台暫無在線工程師值班"}:t.fatigue>=50?{isTPMActive:!1,reason:`工程師疲勞度過高 (${t.fatigue} >= 50)，在線預防保養中斷`}:t.shiftMode!=="THREE_SHIFT"?{isTPMActive:!1,reason:"非三班輪調制（超時兩班制疲勞將持續爬升，無法達成 24H 永久零故障保障）"}:{isTPMActive:!0,reason:"🛡️ 滿足專長相符、資歷合規、在線值勤且低疲勞，享有 24 小時不停機零故障保障！"}}static checkExplosionRisk(e,t){if(!t)return{hasRisk:!1,rankDiff:0};const s=this.getRequiredRankWeight(e.tier),a=this.RANK_WEIGHT[t.rank],n=s-a;return{hasRisk:n>=2,rankDiff:n}}static updateMachineHealth(e,t,s=1){const{isTPMActive:a}=this.checkTPMConditions(e,t);if(a){const p=Math.min(e.wear,5),c=100-p;return{newWear:p,healthPercent:c,isTPMActive:!0,breakdownOccurred:!1,isExploded:!1}}let r=Math.min(100,e.wear+.005*s);const i=100-r,o=(r/100)**2*.05*(s/60),l=Math.random()<o;let d=!1;if(l&&t){const p=this.getRequiredRankWeight(e.tier),c=this.RANK_WEIGHT[t.rank];p-c>=2&&Math.random()<.25&&(d=!0)}return{newWear:Number(r.toFixed(2)),healthPercent:Number(i.toFixed(2)),isTPMActive:!1,breakdownOccurred:l,isExploded:d}}static calculateOverhaulCost(e){return Math.round(e*.15)}}w(H,"RANK_WEIGHT",{"Young Specialist":1,"Skilled Worker":2,"Senior Engineer":3,Fellow:4});class B{static calculateEffectiveK1(e,t,s){let a=.8;switch(e){case"BASE":a=.8;break;case"CAR":a=.65;break;case"OPC":a=.5;break;case"PSM":a=.38;break;case"SAQP":a=.28;break}const r=Math.max(0,Math.min(100,t))/100*.05;let i=0,o=0;if(s&&s.moduleSpecialty==="LITHO")if(s.fatigue>=80)i=0,o=.03;else switch(s.rank){case"Young Specialist":i=.01;break;case"Skilled Worker":i=.02;break;case"Senior Engineer":i=.04;break;case"Fellow":i=.06;break}let l=a+r-i+o;return l=Math.max(e==="SAQP"?.15:.25,Math.min(.95,l)),{effectiveK1:Number(l.toFixed(3)),k1Tech:a,deltaWear:Number(r.toFixed(3)),deltaEngineer:Number(i.toFixed(3)),deltaFatigue:Number(o.toFixed(3))}}static calculateEffectiveCD(e,t,s,a){const n=this.OPTICAL_CATALOG[e];if(!n)return 999999;const{effectiveK1:r}=this.calculateEffectiveK1(t,s,a),i=r*(n.wavelengthNm/n.numericalAperture);return Math.round(i)}static validateResolution(e,t,s,a,n){if(!this.OPTICAL_CATALOG[e])return{canResolve:!1,effectiveCD:999999,effectiveK1:.8,reason:"未知的微影機台型號"};const{effectiveK1:i}=this.calculateEffectiveK1(s,a,n),o=this.calculateEffectiveCD(e,s,a,n);return o>t?{canResolve:!1,effectiveCD:o,effectiveK1:i,reason:`光學解析度不足！當前極限 CD 為 ${o}nm，無法解析目標 ${t}nm 製程（磨損或人員疲勞導致 k1 劣化至 ${i}）。`}:{canResolve:!0,effectiveCD:o,effectiveK1:i}}static getProcessWindowPenalty(e){if(e>=.38)return 0;const t=(.38-e)*.5;return Math.max(0,Math.min(.25,t))}}w(B,"OPTICAL_CATALOG",{litho_contact:{modelId:"litho_contact",name:"Contact Aligner (接觸式微影機)",wavelengthNm:436,numericalAperture:.116,baseRayleighLimitNm:3007,unlockTier:1,baseCost:25e5,baseMttrSec:10},litho_projection:{modelId:"litho_projection",name:"1x Projection Aligner (1:1 投影微影機)",wavelengthNm:436,numericalAperture:.194,baseRayleighLimitNm:1798,unlockTier:1,baseCost:6e6,baseMttrSec:15},litho_gline:{modelId:"litho_gline",name:"G-Line Stepper (步進縮小曝光機)",wavelengthNm:436,numericalAperture:.35,baseRayleighLimitNm:997,unlockTier:2,baseCost:18e6,baseMttrSec:20},litho_iline:{modelId:"litho_iline",name:"I-Line Stepper (高壓汞燈微影機)",wavelengthNm:365,numericalAperture:.5,baseRayleighLimitNm:584,unlockTier:3,baseCost:35e6,baseMttrSec:30},litho_krf:{modelId:"litho_krf",name:"KrF DUV Scanner (準分子雷射掃描機)",wavelengthNm:248,numericalAperture:.7,baseRayleighLimitNm:283,unlockTier:4,baseCost:85e6,baseMttrSec:40},litho_arfdry:{modelId:"litho_arfdry",name:"ArF Dry Scanner (氟化氬乾式微影機)",wavelengthNm:193,numericalAperture:.85,baseRayleighLimitNm:182,unlockTier:4,baseCost:18e7,baseMttrSec:50},litho_arfi:{modelId:"litho_arfi",name:"ArFi Immersion TWINSCAN (雙工件台浸潤微影機)",wavelengthNm:193,numericalAperture:1.35,baseRayleighLimitNm:114,unlockTier:5,baseCost:45e7,baseMttrSec:60},litho_euv:{modelId:"litho_euv",name:"EUV Scanner (極紫外真空微影機)",wavelengthNm:13.5,numericalAperture:.33,baseRayleighLimitNm:33,unlockTier:6,baseCost:25e8,baseMttrSec:90},litho_highna:{modelId:"litho_highna",name:"High-NA EUV Scanner (變形高數值孔徑微影機)",wavelengthNm:13.5,numericalAperture:.55,baseRayleighLimitNm:20,unlockTier:6,baseCost:6e9,baseMttrSec:120}});class P{static isTileInYellowRoom(e,t,s){return s&&s.length>0?s.some(a=>a.x===e&&a.y===t):t<=3&&e>=3&&e<=7}static isMachineInYellowRoom(e,t){return this.isTileInYellowRoom(e.gridX,e.gridY,t)}static getStationRequiredSeconds(e,t,s,a){let n=this.BASE_STATION_DURATION_SEC[e]||10;return e==="LIT"&&t&&(n=this.LIT_SUBSTEP_DURATION_SEC[t]||10),s&&(n-=Math.min(2,(s.tier-1)*.5),s.wear>50&&(n+=Math.round((s.wear-50)/50*3))),a&&s&&a.moduleSpecialty===s.category&&a.fatigue<80&&(n=Math.max(4,Math.round(n*.85))),Math.max(4,Math.round(n))}static getStationSequence(e){return e?["FILM","LIT","ETCH","DIFF","CMP"]:["FILM","LIT","ETCH","DIFF"]}static calculateEffectiveQTimeSec(e,t,s,a){let n=45;e==="LIT"&&t==="ETCH"?n=45:e==="ETCH"&&t==="DIFF"?n=60:e==="CMP"&&(n=45);let r=1;a.includes("1000")&&!a.includes("10000")?r=1.15:a.includes("100")&&!a.includes("1000")?r=1.3:a.includes("1")&&!a.includes("10")&&(r=1.5);let i=1;return s>=1e3?i=1.5:s<=28&&(i=.8),Math.round(n*r*i)}static checkQTimeStatus(e,t,s=5e4){if(!e.qTimeDeadline)return{isOverdue:!1,overdueSeconds:0,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:1,urgencyLevel:"SAFE",remainingSeconds:999};const a=e.qTimeDeadline-t,n=e.currentStation==="ETCH";if(a>15)return{isOverdue:!1,overdueSeconds:0,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:1,urgencyLevel:"SAFE",remainingSeconds:a};if(a>0)return{isOverdue:!1,overdueSeconds:0,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:1,urgencyLevel:"WARNING",remainingSeconds:a};const r=Math.abs(a);return r<=15?{isOverdue:!0,overdueSeconds:r,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:.65,urgencyLevel:"CRITICAL",remainingSeconds:0}:n?{isOverdue:!0,overdueSeconds:r,isFatal:!0,canRework:!0,reworkCost:s,penaltyYieldRatio:0,urgencyLevel:"EXPIRED",remainingSeconds:0}:{isOverdue:!0,overdueSeconds:r,isFatal:!0,canRework:!1,reworkCost:0,penaltyYieldRatio:0,urgencyLevel:"EXPIRED",remainingSeconds:0}}static executeReworkLot(e,t){return e.currentStation="LIT",e.litSubStep="COAT",e.qTimeDeadline=null,e.status="PROCESSING",e.yieldMultiplier=Math.max(.85,e.yieldMultiplier*.95),{success:!0,message:`成功救回批次 ${e.lotId}！耗費溶劑費 NT$ ${t.toLocaleString()}，已退回黃光塗膠站重新加工。`}}static advanceLotStation(e,t,s,a,n,r,i){const o=this.getStationSequence(t);if(r&&i&&e.currentStation==="LIT"){const d=r.find(c=>c.category==="LITHO"),p=r.find(c=>c.category==="TRACK");(e.litSubStep==="EXPOSE"&&d&&!this.isMachineInYellowRoom(d,i)||(e.litSubStep==="COAT"||e.litSubStep==="DEVELOP")&&p&&!this.isMachineInYellowRoom(p,i))&&(e.yieldMultiplier=0,e.hasYellowRoomViolation=!0)}if(e.currentStation==="LIT"){if(!e.litSubStep||e.litSubStep==="COAT")return e.litSubStep="EXPOSE",e.qTimeDeadline=null,{nextStation:"LIT",nextSubStep:"EXPOSE",isLayerCompleted:!1,isLotCompleted:!1};if(e.litSubStep==="EXPOSE")return e.litSubStep="DEVELOP",e.qTimeDeadline=null,{nextStation:"LIT",nextSubStep:"DEVELOP",isLayerCompleted:!1,isLotCompleted:!1};if(e.litSubStep==="DEVELOP"){e.currentStation="ETCH",e.litSubStep=void 0;const d=this.calculateEffectiveQTimeSec("LIT","ETCH",s,a);return e.qTimeDeadline=n+d,{nextStation:"ETCH",isLayerCompleted:!1,isLotCompleted:!1}}}const l=o.indexOf(e.currentStation);if(l>=0&&l<o.length-1){const d=o[l+1];if(e.currentStation=d,d==="LIT"&&(e.litSubStep="COAT"),e.currentStation==="DIFF"){const p=this.calculateEffectiveQTimeSec("ETCH","DIFF",s,a);e.qTimeDeadline=n+p}else e.qTimeDeadline=null;return{nextStation:d,isLayerCompleted:!1,isLotCompleted:!1}}return e.currentLayer<e.totalLayers?(e.currentLayer+=1,e.currentStation="FILM",e.litSubStep=void 0,e.qTimeDeadline=null,{nextStation:"FILM",isLayerCompleted:!0,isLotCompleted:!1}):(e.status="COMPLETED",e.qTimeDeadline=null,{nextStation:e.currentStation,isLayerCompleted:!0,isLotCompleted:!0})}static calculateStationThroughputs(e,t,s){var l;const a=["FILM","TRACK","LIT","ETCH","DIFF","CMP"],n={FILM:{station:"FILM",totalCapacity:0,machineCount:0,isChokePoint:!1},TRACK:{station:"TRACK",totalCapacity:0,machineCount:0,isChokePoint:!1},LIT:{station:"LIT",totalCapacity:0,machineCount:0,isChokePoint:!1},ETCH:{station:"ETCH",totalCapacity:0,machineCount:0,isChokePoint:!1},DIFF:{station:"DIFF",totalCapacity:0,machineCount:0,isChokePoint:!1},CMP:{station:"CMP",totalCapacity:0,machineCount:0,isChokePoint:!1}},r=new Map;for(const d of t)r.set(d.id,d);for(const d of e){if(d.status==="EXPLODED")continue;let p=d.category;d.category==="LITHO"&&(p="LIT");const c=((l=this.BASE_THROUGHPUT_BY_TIER[p])==null?void 0:l[d.tier])??10,m=1-d.wear/100*.3;let u=1;if(d.assignedEngineerId&&r.has(d.assignedEngineerId)){const f=r.get(d.assignedEngineerId);f.moduleSpecialty===d.category&&f.fatigue<80&&(u=1.2)}p==="LIT"&&d.pairedTrackIds&&d.pairedTrackIds.length>=2&&(u+=.05);const h=c*m*u;n[p].totalCapacity+=h,n[p].machineCount+=1}let i=1/0,o="TRACK";for(const d of a)d==="CMP"&&!s||n[d].totalCapacity<i&&(i=n[d].totalCapacity,o=d);return i<1/0&&o&&(n[o].isChokePoint=!0),n}static calculateLogisticsFactor(e,t,s){let a=.5;e.oht?a=1.2:e.agv&&(a=.85);let n=5;if(t.length>=2){let o=0,l=0;for(let d=0;d<t.length-1;d++){const p=Math.abs(t[d].gridX-t[d+1].gridX)+Math.abs(t[d].gridY-t[d+1].gridY);o+=p,l++}n=l>0?o/l:5}const r=Math.max(.6,Math.min(1.1,6/Math.max(2,n))),i=Math.min(.2,s*.02);return Number((a*r*(1-i)).toFixed(2))}static calculateFactoryWorkload(e,t,s,a,n){const r=this.calculateStationThroughputs(e,t,n),i=this.calculateLogisticsFactor(a,e,s.length),o=["FILM","TRACK","LIT","ETCH","DIFF"];n&&o.push("CMP");let l=1/0;for(const u of o){const h=r[u].totalCapacity;h<l&&(l=h)}const d=Math.max(1,l*i);let p=0;for(const u of s)(u.status==="PROCESSING"||u.status==="WAITING_QTIME"||u.status==="TRANSPORTING")&&(p+=u.waferCount);const c=Math.min(150,Math.round(p/d*100));let m="SMOOTH";return c>85?m="OVERLOADED":c>=70&&(m="HEAVY"),{workloadPercent:c,maxCapacityWafersPerMin:Math.round(d),totalDemandWafers:p,statusLevel:m,throughputs:r}}static diagnoseBottleneck(e,t,s,a,n){var u;const{workloadPercent:r,throughputs:i}=this.calculateFactoryWorkload(e,t,s,a,n),o=e.find(h=>h.wear>=70);if(o){const h=o.category==="LITHO"?"LIT":o.category;return{category:"MAINTENANCE",title:"機台嚴重老化致效能衰退",stationName:o.category,description:`【${o.name}】磨損度高達 ${o.wear}%，抽真空與加工速率嚴重衰退超過 20%！`,recommendation:"請立即指派工程師對該機台執行「就地大修（Overhaul）」或保養，恢復 100% 原始效能。",workloadPercent:r,chokePointThroughput:Math.round(((u=i[h])==null?void 0:u.totalCapacity)??10)}}const l=i.TRACK.totalCapacity,d=i.LIT.totalCapacity;if(l<d&&l<40)return{category:"CAPACITY",title:"塗膠顯影 (Track) 先天物理產能瓶頸",stationName:"TRACK",description:`LITHO 曝光機正在空轉等待！【Track 塗膠顯影站】產能僅 ${Math.round(l)} 片/分，是產線最大卡點！`,recommendation:"光阻旋塗與烘烤受熱擴散物理限制，建議增購第 2 台 Track 機台或將其並聯綁定至微影機以分流消化產能！",workloadPercent:r,chokePointThroughput:Math.round(l)};let p="FILM",c=1/0;const m=["FILM","TRACK","LIT","ETCH","DIFF"];n&&m.push("CMP");for(const h of m)i[h].totalCapacity<c&&(c=i[h].totalCapacity,p=h);return c<=15?{category:"CAPACITY",title:"關鍵製程站點設備數量不足",stationName:p,description:`【${p} 站】產能僅 ${Math.round(c)} 片/分，遠低於其他站點，晶圓在門口嚴重堆積！`,recommendation:`建議前往商城增購第 2 台 ${p} 設備進行分流，或將現有機台升級為更高階型號。`,workloadPercent:r,chokePointThroughput:Math.round(c)}:!a.agv&&!a.oht&&s.length>=2?{category:"LOGISTICS",title:"人工手持搬運效率偏低",stationName:"AMHS 物流",description:"當前仍為「技術員手持晶圓盒步行搬運」，走動搬運耗時佔據了整個製程週期的 40% 以上！",recommendation:"投片量已超越人工負荷極限！強烈建議研發解鎖「地面 AGV 自走車」或「天花板 OHT 天軌」。",workloadPercent:r,chokePointThroughput:Math.round(c)}:{category:"LAYOUT",title:"機台動線規劃待最佳化",stationName:"廠房佈局",description:"前後站點相隔較遠，搬運載具在走道往返耗時過多，拉長了晶圓整體的傳送等待時間。",recommendation:"建議在廠房編輯模式中將相鄰製程機台（如 Track 與 Litho、Etch 與 Diff）就近排列，縮短傳送時間。",workloadPercent:r,chokePointThroughput:Math.round(c)}}static autoFillBestEconomyAllocation(e,t){const s=t.filter(o=>o.category==="LITHO");if(s.length===0)return[];const a=[...s].sort((o,l)=>{var c,m;const d=((c=B.OPTICAL_CATALOG[o.modelId])==null?void 0:c.baseRayleighLimitNm)??9999,p=((m=B.OPTICAL_CATALOG[l.modelId])==null?void 0:m.baseRayleighLimitNm)??9999;return d-p}),n=a[0],r=a[a.length-1],i=[];for(let o=1;o<=e.layerCount;o++){let l=o<=3,d=l?e.nodeNm:Math.max(e.nodeNm*2.5,350),p=l?n.modelId:r.modelId;i.push({layerIndex:o,layerType:l?"關鍵層 (Critical Layer)":"繞線層 (Metal Interconnect)",targetCD:Math.round(d),assignedMachineModelId:p})}return i}static updateMachineNames(e){if(!e||e.length===0)return;const t=new Map;for(const s of e)t.has(s.modelId)||t.set(s.modelId,[]),t.get(s.modelId).push(s);for(const[s,a]of t.entries())if(a.length<=1)for(const n of a)n.name=n.name.replace(/\s*#\d+$/,"").trim();else a.forEach((n,r)=>{const i=n.name.replace(/\s*#\d+$/,"").trim();n.name=`${i} #${r+1}`})}}w(P,"BASE_STATION_DURATION_SEC",{FILM:10,LIT:27,ETCH:12,DIFF:16,CMP:10}),w(P,"LIT_SUBSTEP_DURATION_SEC",{COAT:7,EXPOSE:12,DEVELOP:8}),w(P,"BASE_THROUGHPUT_BY_TIER",{LIT:{1:10,2:25,3:55,4:120,5:260,6:180},TRACK:{1:6,2:16,3:35,4:75,5:140,6:160},FILM:{1:12,2:24,3:50,4:110,5:220,6:200},ETCH:{1:12,2:24,3:50,4:110,5:220,6:200},DIFF:{1:10,2:20,3:45,4:100,5:200,6:180},CMP:{1:0,2:0,3:40,4:90,5:180,6:160}});const I={machines:{litho_contact:{path:"./assets/machines/litho_contact.png",label:"Contact Aligner",tier:1},litho_projection:{path:"./assets/machines/litho_projection.png",label:"1x Projection Aligner",tier:1},litho_gline:{path:"./assets/machines/litho_gline.png",label:"G-Line Stepper",tier:2},litho_iline:{path:"./assets/machines/litho_iline.png",label:"I-Line Stepper",tier:3},litho_krf:{path:"./assets/machines/litho_krf.png",label:"KrF DUV Scanner",tier:4},litho_arfdry:{path:"./assets/machines/litho_arfdry.png",label:"ArF Dry Scanner",tier:4},litho_arfi:{path:"./assets/machines/litho_arfi.png",label:"ArFi Immersion TWINSCAN",tier:5},litho_euv:{path:"./assets/machines/litho_euv.png",label:"EUV Scanner (無標誌 2.5D 旗艦)",tier:6},litho_highna:{path:"./assets/machines/litho_highna.png",label:"High-NA EUV Scanner",tier:6},track_manual:{path:"./assets/machines/track_manual.png",label:"手動旋塗熱板台",tier:1},track_single:{path:"./assets/machines/track_clean.png",label:"單軌自動塗膠顯影機",tier:2},track_dual:{path:"./assets/machines/track_dual.png",label:"雙軌連線 Track",tier:3},track_clean:{path:"./assets/machines/track_clean.png",label:"多工位精密 Clean Track",tier:4},track_advanced:{path:"./assets/machines/track_advanced.png",label:"先進極限分子級 Track",tier:6},etch_wet:{path:"./assets/machines/etch_wet.png",label:"濕式酸槽清洗台",tier:1},etch_plasma:{path:"./assets/machines/etch_plasma.png",label:"電漿乾式蝕刻機 (RIE)",tier:3},film_furnace:{path:"./assets/machines/film_furnace.png",label:"高溫熱氧化爐管",tier:1},film_pecvd:{path:"./assets/machines/film_pecvd.png",label:"電漿化學沉積 / ALD 機",tier:4},diff_furnace:{path:"./assets/machines/diff_furnace.png",label:"熱擴散高溫爐管",tier:1},diff_implanter:{path:"./assets/machines/diff_implanter.png",label:"大束流離子佈植機",tier:2},cmp_polisher:{path:"./assets/machines/cmp_polisher.png",label:"化學機械平坦化研磨機",tier:3}},characters:{tech_cleanroom:{path:"./assets/characters/tech_cleanroom.png",label:"Cleanroom Technician"},agv_carrier:{path:"./assets/characters/agv_carrier.png",label:"AGV Wafer Carrier"},oht_shuttle:{path:"./assets/characters/oht_shuttle.png",label:"OHT Sky-Rail Shuttle"}}};class x{static getContext(){if(this.isMuted)return null;if(!this.audioCtx){const e=window.AudioContext||window.webkitAudioContext;e&&(this.audioCtx=new e)}return this.audioCtx&&this.audioCtx.state==="suspended"&&this.audioCtx.resume(),this.audioCtx}static toggleMute(){return this.isMuted=!this.isMuted,this.isMuted}static isAudioMuted(){return this.isMuted}static playClick(){const e=this.getContext();if(!e)return;const t=e.createOscillator(),s=e.createGain(),a=e.currentTime;t.type="sine",t.frequency.setValueAtTime(800,a),t.frequency.exponentialRampToValueAtTime(1200,a+.04),s.gain.setValueAtTime(.15,a),s.gain.exponentialRampToValueAtTime(.001,a+.04),t.connect(s),s.connect(e.destination),t.start(a),t.stop(a+.04)}static playCoin(){const e=this.getContext();if(!e)return;const t=e.currentTime,s=e.createOscillator(),a=e.createOscillator(),n=e.createGain();s.type="sine",s.frequency.setValueAtTime(987.77,t),s.frequency.setValueAtTime(1318.51,t+.08),a.type="triangle",a.frequency.setValueAtTime(1975.53,t+.08),n.gain.setValueAtTime(.2,t),n.gain.exponentialRampToValueAtTime(.001,t+.28),s.connect(n),a.connect(n),n.connect(e.destination),s.start(t),s.stop(t+.28),a.start(t+.08),a.stop(t+.28)}static playCoinChime(){this.playCoin()}static playSuccess(){const e=this.getContext();if(!e)return;const t=e.currentTime;[523.25,659.25,783.99,1046.5].forEach((a,n)=>{const r=e.createOscillator(),i=e.createGain(),o=t+n*.08;r.type="triangle",r.frequency.setValueAtTime(a,o),i.gain.setValueAtTime(.2,o),i.gain.exponentialRampToValueAtTime(.001,o+.35),r.connect(i),i.connect(e.destination),r.start(o),r.stop(o+.35)})}static playFanfare(){this.playSuccess()}static playWarning(){const e=this.getContext();if(!e)return;const t=e.currentTime,s=e.createOscillator(),a=e.createGain();s.type="sawtooth",s.frequency.setValueAtTime(440,t),s.frequency.setValueAtTime(554.37,t+.1),a.gain.setValueAtTime(.12,t),a.gain.exponentialRampToValueAtTime(.001,t+.25),s.connect(a),a.connect(e.destination),s.start(t),s.stop(t+.25)}static playCriticalAlarm(){const e=this.getContext();if(!e)return;const t=e.currentTime,s=e.createOscillator(),a=e.createGain();s.type="sawtooth",s.frequency.setValueAtTime(600,t),s.frequency.linearRampToValueAtTime(950,t+.18),s.frequency.linearRampToValueAtTime(600,t+.36),a.gain.setValueAtTime(.18,t),a.gain.exponentialRampToValueAtTime(.001,t+.4),s.connect(a),a.connect(e.destination),s.start(t),s.stop(t+.4)}static playExplosion(){const e=this.getContext();if(!e)return;const t=e.currentTime,s=e.sampleRate*.6,a=e.createBuffer(1,s,e.sampleRate),n=a.getChannelData(0);for(let l=0;l<s;l++)n[l]=Math.random()*2-1;const r=e.createBufferSource();r.buffer=a;const i=e.createBiquadFilter();i.type="lowpass",i.frequency.setValueAtTime(800,t),i.frequency.exponentialRampToValueAtTime(40,t+.6);const o=e.createGain();o.gain.setValueAtTime(.4,t),o.gain.exponentialRampToValueAtTime(.001,t+.6),r.connect(i),i.connect(o),o.connect(e.destination),r.start(t),r.stop(t+.6)}static playRework(){const e=this.getContext();if(!e)return;const t=e.currentTime,s=e.sampleRate*.4,a=e.createBuffer(1,s,e.sampleRate),n=a.getChannelData(0);for(let l=0;l<s;l++)n[l]=Math.random()*2-1;const r=e.createBufferSource();r.buffer=a;const i=e.createBiquadFilter();i.type="bandpass",i.frequency.setValueAtTime(1200,t),i.frequency.exponentialRampToValueAtTime(300,t+.4),i.Q.value=3;const o=e.createGain();o.gain.setValueAtTime(.2,t),o.gain.exponentialRampToValueAtTime(.001,t+.4),r.connect(i),i.connect(o),o.connect(e.destination),r.start(t),r.stop(t+.4)}static playAlarm(){this.playWarning()}static playDing(){this.playCoin()}}w(x,"audioCtx",null),w(x,"isMuted",!1);const se=class se extends Phaser.Scene{constructor(){super({key:se.KEY});w(this,"saveGame");w(this,"tileWidth",200);w(this,"tileHeight",100);w(this,"isPlannerMode",!1);w(this,"plannerTool","NONE");w(this,"movingMachineId",null);w(this,"pointerDownMachineId",null);w(this,"plannerIndicatorGraphics");w(this,"selectionRingGraphics");w(this,"onStateUpdateCallback");w(this,"floorGraphics");w(this,"railGraphics");w(this,"machineMap",new Map);w(this,"technicians",[]);w(this,"ohtShuttles",[]);w(this,"agvCarriers",[]);w(this,"isDragging",!1);w(this,"dragStartX",0);w(this,"dragStartY",0);w(this,"totalDragDistance",0);w(this,"dragThreshold",6);w(this,"justSelectedMachineOnPointerUp",!1);w(this,"onMachineClickCallback")}init(t){this.saveGame=t.saveGame,this.onMachineClickCallback=t.onMachineClick,this.onStateUpdateCallback=t.onStateUpdate}preload(){this.load.on("complete",()=>{this.refreshMachineSprites()}),this.load.on("loaderror",t=>{console.warn("⚠️ 貼圖載入失敗:",t==null?void 0:t.key,t==null?void 0:t.url)});for(const[t,s]of Object.entries(I.machines))this.textures.exists(t)||this.load.image(t,s.path);for(const[t,s]of Object.entries(I.characters))!this.textures.exists(t)&&s.path&&this.load.image(t,s.path)}refreshMachineSprites(){for(const t of this.saveGame.machines){const s=this.machineMap.get(t.id);if(s&&!s.sprite&&this.textures.exists(t.modelId)){s.fallback&&(s.fallback.destroy(),s.fallback=void 0);const a=this.add.image(0,-35,t.modelId),n=this.tileWidth*.95;a.setDisplaySize(n,n),s.container.addAt(a,1),s.sprite=a}}}create(){this.floorGraphics=this.add.graphics(),this.selectionRingGraphics=this.add.graphics(),this.selectionRingGraphics.setDepth(45),this.plannerIndicatorGraphics=this.add.graphics(),this.plannerIndicatorGraphics.setDepth(48),this.railGraphics=this.add.graphics(),this.renderFloor(),this.renderOHTRails(),this.renderMachines(),this.spawnTechnicians(),this.spawnAGVCarriers(),this.spawnOHTShuttles(),this.cameras.main.centerOn(0,300),this.cameras.main.setZoom(.85),this.setupCameraControls(),this.scale.on("resize",this.onResize,this)}toScreen(t,s){const a=(t-s)*(this.tileWidth/2),n=(t+s)*(this.tileHeight/2);return{x:a,y:n}}toGrid(t,s){const a=Math.round(t/this.tileWidth+s/this.tileHeight),n=Math.round(s/this.tileHeight-t/this.tileWidth);return{gridX:a,gridY:n}}renderFloor(){this.floorGraphics.clear();const t=this.saveGame.facility.bayGridSize,s=this.saveGame.facility.yellowRoomTiles||[];for(let a=0;a<t.width;a++)for(let n=0;n<t.height;n++){const{x:r,y:i}=this.toScreen(a,n),o=s.length>0?s.some(m=>m.x===a&&m.y===n):n<=3&&a>=3&&a<=7,l={x:r,y:i-this.tileHeight/2},d={x:r+this.tileWidth/2,y:i},p={x:r,y:i+this.tileHeight/2},c={x:r-this.tileWidth/2,y:i};o?(this.floorGraphics.fillStyle(3153414,.96),this.floorGraphics.lineStyle(1.8,16096779,.55)):(this.floorGraphics.fillStyle((a+n)%2===0?594210:792109,.95),this.floorGraphics.lineStyle(1,1976635,.55)),this.floorGraphics.beginPath(),this.floorGraphics.moveTo(l.x,l.y),this.floorGraphics.lineTo(d.x,d.y),this.floorGraphics.lineTo(p.x,p.y),this.floorGraphics.lineTo(c.x,c.y),this.floorGraphics.closePath(),this.floorGraphics.fillPath(),this.floorGraphics.strokePath()}}renderOHTRails(){this.railGraphics.clear();const t=this.saveGame.facility.bayGridSize,s=-160;this.railGraphics.lineStyle(2.5,440020,.35);const a=this.toScreen(1,1),n=this.toScreen(t.width-2,1),r=this.toScreen(t.width-2,t.height-2),i=this.toScreen(1,t.height-2);this.railGraphics.beginPath(),this.railGraphics.moveTo(a.x,a.y+s),this.railGraphics.lineTo(n.x,n.y+s),this.railGraphics.lineTo(r.x,r.y+s),this.railGraphics.lineTo(i.x,i.y+s),this.railGraphics.closePath(),this.railGraphics.strokePath()}renderMachines(){P.updateMachineNames(this.saveGame.machines);const t=new Set(this.saveGame.machines.map(a=>a.id));for(const[a,n]of this.machineMap)t.has(a)||(n.container.destroy(),this.machineMap.delete(a));const s=new Map(this.saveGame.staff.map(a=>[a.id,a]));for(const a of this.saveGame.machines){const{x:n,y:r}=this.toScreen(a.gridX,a.gridY),i=(a.gridX+a.gridY)*10+50;let o=this.machineMap.get(a.id);if(o){if(o.container.setPosition(n,r),o.container.setDepth(i),!o.sprite&&this.textures.exists(a.modelId)){o.fallback&&(o.fallback.destroy(),o.fallback=void 0);const m=this.add.image(0,-25,a.modelId),u=118;m.setDisplaySize(u,u),o.container.addAt(m,1),o.sprite=m}if(o.ledArc.setFillStyle(this.getLEDColor(a.status)),o.label.setText(`${a.name} (${Math.round(a.wear)}%)`),a.status==="PROCESSING"){if(!o.processingText){const m=this.add.text(0,-104,"⚡ 加工中",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#38bdf8",backgroundColor:"rgba(8, 47, 73, 0.95)",padding:{x:5,y:2}});m.setOrigin(.5),o.container.add(m),o.processingText=m}}else o.processingText&&(o.processingText.destroy(),o.processingText=void 0);const l=P.isMachineInYellowRoom(a,this.saveGame.facility.yellowRoomTiles);if((a.category==="LITHO"||a.category==="TRACK")&&!l){if(!o.yellowAlertText){const m=this.add.text(0,-125,"🚨 缺乏黃光防護 (良率 0%)",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#ffffff",backgroundColor:"rgba(220, 38, 38, 0.95)",padding:{x:6,y:3}});m.setOrigin(.5),o.container.add(m),o.yellowAlertText=m}}else o.yellowAlertText&&(o.yellowAlertText.destroy(),o.yellowAlertText=void 0);const p=a.assignedEngineerId?s.get(a.assignedEngineerId):null,c=H.checkTPMConditions(a,p);if(c.isTPMActive&&!o.tpmText){const m=this.add.text(0,-104,"🛡️ TPM 零故障",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#10b981",backgroundColor:"rgba(6, 78, 59, 0.92)",padding:{x:5,y:2}});m.setOrigin(.5),o.container.add(m),o.tpmText=m}else!c.isTPMActive&&o.tpmText&&(o.tpmText.destroy(),o.tpmText=void 0)}else{const l=this.add.container(n,r);l.setDepth(i);const d=this.add.ellipse(0,10,88,38,0,.4);l.add(d);let p,c;const m=118;this.textures.exists(a.modelId)?(p=this.add.image(0,-25,a.modelId),p.setDisplaySize(m,m),l.add(p)):(c=this.createFallbackMachineGraphic(a),l.add(c));const u=this.getLEDColor(a.status),h=this.add.circle(0,-82,6,u);l.add(h);const f=this.add.text(0,18,`${a.name} (${Math.round(a.wear)}%)`,{fontFamily:"Noto Sans TC, sans-serif",fontSize:"11px",fontStyle:"bold",color:"#f8fafc",backgroundColor:"rgba(15, 23, 42, 0.88)",padding:{x:6,y:3}});f.setOrigin(.5),l.add(f);const g=a.assignedEngineerId?s.get(a.assignedEngineerId):null,y=H.checkTPMConditions(a,g);let T;y.isTPMActive&&(T=this.add.text(0,-104,"🛡️ TPM 零故障",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#10b981",backgroundColor:"rgba(6, 78, 59, 0.92)",padding:{x:5,y:2}}),T.setOrigin(.5),l.add(T));let E;a.status==="PROCESSING"&&(E=this.add.text(0,-104,"⚡ 加工中",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#38bdf8",backgroundColor:"rgba(8, 47, 73, 0.95)",padding:{x:5,y:2}}),E.setOrigin(.5),l.add(E));const v=P.isMachineInYellowRoom(a,this.saveGame.facility.yellowRoomTiles),b=a.category==="LITHO"||a.category==="TRACK";let k;b&&!v&&(k=this.add.text(0,-125,"🚨 缺乏黃光防護 (良率 0%)",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#ffffff",backgroundColor:"rgba(220, 38, 38, 0.95)",padding:{x:6,y:3}}),k.setOrigin(.5),l.add(k));const D=96,O=96;l.setInteractive(new Phaser.Geom.Rectangle(-D/2,-O+15,D,O),Phaser.Geom.Rectangle.Contains),l.on("pointerdown",S=>{var L;document.querySelector(".modal-backdrop")||(((L=document.getElementById("modal-container"))==null?void 0:L.children.length)??0)>0||(this.pointerDownMachineId=a.id,S.event&&S.event.stopPropagation())}),l.on("pointerover",()=>{var L;if(document.querySelector(".modal-backdrop")||(((L=document.getElementById("modal-container"))==null?void 0:L.children.length)??0)>0)return;const S=this.machineMap.get(a.id);S!=null&&S.sprite&&S.sprite.setTint(3718648)}),l.on("pointerout",()=>{const S=this.machineMap.get(a.id);S!=null&&S.sprite&&S.sprite.clearTint()}),l.on("pointerup",S=>{var L;if(document.querySelector(".modal-backdrop")||(((L=document.getElementById("modal-container"))==null?void 0:L.children.length)??0)>0){this.pointerDownMachineId=null;return}this.pointerDownMachineId===a.id&&this.totalDragDistance<=this.dragThreshold&&(S.event&&S.event.stopPropagation(),x.playClick(),this.isPlannerMode&&this.plannerTool==="MOVE_MACHINE"?(this.justSelectedMachineOnPointerUp=!0,this.selectMachineToMove(a)):this.isPlannerMode||this.onMachineClickCallback&&this.onMachineClickCallback(a)),this.pointerDownMachineId=null}),this.machineMap.set(a.id,{container:l,ledArc:h,label:f,tpmText:T,processingText:E,yellowAlertText:k,sprite:p,fallback:c})}}}createFallbackMachineGraphic(t){const s=this.add.graphics(),a=60;let n=3900150;return t.category==="LITHO"&&(n=16096779),t.category==="TRACK"&&(n=1096065),t.category==="ETCH"&&(n=9133302),t.category==="DIFF"&&(n=15485081),t.category==="CMP"&&(n=440020),s.fillStyle(n,.9),s.beginPath(),s.moveTo(0,-70),s.lineTo(a/2,-60),s.lineTo(0,-50),s.lineTo(-a/2,-60),s.closePath(),s.fillPath(),s.fillStyle(n,.7),s.beginPath(),s.moveTo(-a/2,-60),s.lineTo(0,-50),s.lineTo(0,0),s.lineTo(-a/2,-10),s.closePath(),s.fillPath(),s.fillStyle(n,.5),s.beginPath(),s.moveTo(0,-50),s.lineTo(a/2,-60),s.lineTo(a/2,-10),s.lineTo(0,0),s.closePath(),s.fillPath(),s}getLEDColor(t){switch(t){case"IDLE":return 1096065;case"PROCESSING":return 440020;case"MAINTENANCE":return 16096779;case"EXPLODED":return 15680580}}spawnTechnicians(){const t=Math.min(6,Math.max(2,this.saveGame.staff.length));for(let s=0;s<t;s++){const a=this.add.container(0,0);a.setDepth(200);const n=this.add.ellipse(0,4,18,9,0,.35);if(a.add(n),this.textures.exists("tech_cleanroom")){const i=this.add.image(0,-18,"tech_cleanroom");i.setDisplaySize(48,48),a.add(i)}else{const i=this.add.circle(0,-12,8,16317180),o=this.add.rectangle(0,-12,8,4,3718648),l=this.add.rectangle(0,-4,12,12,14870768);a.add([l,i,o])}const r=this.toScreen(2+s,3);a.setPosition(r.x,r.y),this.technicians.push({container:a,targetX:r.x,targetY:r.y,speed:.6+Math.random()*.4})}}spawnAGVCarriers(){if(this.saveGame.unlockedFeatures.agv)for(let t=0;t<2;t++){const s=this.add.container(0,0);s.setDepth(205);const a=this.add.ellipse(0,4,24,12,0,.4);if(s.add(a),this.textures.exists("agv_carrier")){const r=this.add.image(0,-14,"agv_carrier");r.setDisplaySize(54,40),s.add(r)}else{const r=this.add.rectangle(0,-8,28,16,165063),i=this.add.rectangle(0,-18,16,12,1096065),o=this.add.circle(10,-8,3,15680580);s.add([r,i,o])}const n=this.toScreen(1+t*3,2);s.setPosition(n.x,n.y),this.agvCarriers.push({container:s,targetX:n.x,targetY:n.y,speed:1.1+t*.2})}}spawnOHTShuttles(){if(!this.saveGame.unlockedFeatures.oht)return;const t=!!this.saveGame.unlockedFeatures.shrOht,s=this.add.container(0,-160);if(s.setDepth(500),this.textures.exists("oht_shuttle")){const n=this.add.image(0,16,"oht_shuttle");n.setDisplaySize(56,42),t&&n.setTint(3462041),s.add(n)}else{const n=this.add.rectangle(0,0,8,12,4674921),r=this.add.rectangle(0,10,32,18,t?1096065:959977),i=this.add.rectangle(0,22,20,16,1096065),o=this.add.circle(12,10,3,t?1096065:2278750);s.add([n,r,i,o])}const a=this.toScreen(1,1);s.setPosition(a.x,a.y-160),this.ohtShuttles.push({container:s,progress:0,speed:t?.005:.002})}update(t,s){const a=this.saveGame.facility.bayGridSize,n=[this.toScreen(1,1),this.toScreen(a.width-2,1),this.toScreen(a.width-2,a.height-2),this.toScreen(1,a.height-2)];for(const r of this.ohtShuttles){r.progress=(r.progress+r.speed*(s/16))%1;const i=n.length,o=Math.floor(r.progress*i),l=(o+1)%i,d=r.progress*i%1,p=n[o],c=n[l],m=p.x+(c.x-p.x)*d,u=p.y+(c.y-p.y)*d-160;r.container.setPosition(m,u)}for(const r of this.technicians){const i=r.targetX-r.container.x,o=r.targetY-r.container.y,l=Math.sqrt(i*i+o*o);if(l<4){const d=Math.floor(Math.random()*(a.width-2))+1,p=Math.floor(Math.random()*(a.height-2))+1,c=this.toScreen(d,p);r.targetX=c.x,r.targetY=c.y}else r.container.x+=i/l*r.speed*(s/16),r.container.y+=o/l*r.speed*(s/16)}for(const r of this.agvCarriers){const i=r.targetX-r.container.x,o=r.targetY-r.container.y,l=Math.sqrt(i*i+o*o);if(l<4){const d=Math.floor(Math.random()*(a.width-2))+1,p=Math.floor(Math.random()*(a.height-2))+1,c=this.toScreen(d,p);r.targetX=c.x,r.targetY=c.y}else r.container.x+=i/l*r.speed*(s/16),r.container.y+=o/l*r.speed*(s/16)}}setPlannerMode(t,s="NONE"){this.isPlannerMode=t,this.plannerTool=s,this.movingMachineId=null,this.plannerIndicatorGraphics.clear(),this.selectionRingGraphics.clear()}selectMachineToMove(t){if(this.movingMachineId===t.id){this.movingMachineId=null,this.selectionRingGraphics.clear(),this.plannerIndicatorGraphics.clear(),x.playClick();return}this.movingMachineId=t.id,x.playClick(),this.drawSelectionRing(t.gridX,t.gridY)}drawSelectionRing(t,s){this.selectionRingGraphics.clear();const{x:a,y:n}=this.toScreen(t,s);this.selectionRingGraphics.lineStyle(3.5,440020,.95);const r={x:a,y:n-this.tileHeight/2-2},i={x:a+this.tileWidth/2+4,y:n},o={x:a,y:n+this.tileHeight/2+2},l={x:a-this.tileWidth/2-4,y:n};this.selectionRingGraphics.beginPath(),this.selectionRingGraphics.moveTo(r.x,r.y),this.selectionRingGraphics.lineTo(i.x,i.y),this.selectionRingGraphics.lineTo(o.x,o.y),this.selectionRingGraphics.lineTo(l.x,l.y),this.selectionRingGraphics.closePath(),this.selectionRingGraphics.strokePath()}updatePlannerCursorIndicator(t,s){if(!this.isPlannerMode||!this.plannerIndicatorGraphics)return;this.plannerIndicatorGraphics.clear();const{gridX:a,gridY:n}=this.toGrid(t,s),r=this.saveGame.facility.bayGridSize;if(a<0||a>=r.width||n<0||n>=r.height)return;const{x:i,y:o}=this.toScreen(a,n),l={x:i,y:o-this.tileHeight/2},d={x:i+this.tileWidth/2,y:o},p={x:i,y:o+this.tileHeight/2},c={x:i-this.tileWidth/2,y:o};this.plannerTool==="PAINT_YELLOW"?(this.plannerIndicatorGraphics.fillStyle(16096779,.45),this.plannerIndicatorGraphics.lineStyle(2.5,16498468,.95)):this.plannerTool==="PAINT_WHITE"?(this.plannerIndicatorGraphics.fillStyle(165063,.45),this.plannerIndicatorGraphics.lineStyle(2.5,3718648,.95)):this.plannerTool==="MOVE_MACHINE"&&(this.saveGame.machines.some(u=>u.id!==this.movingMachineId&&u.gridX===a&&u.gridY===n)?(this.plannerIndicatorGraphics.fillStyle(15680580,.45),this.plannerIndicatorGraphics.lineStyle(2.5,16281969,.95)):(this.plannerIndicatorGraphics.fillStyle(1096065,.45),this.plannerIndicatorGraphics.lineStyle(2.5,3462041,.95))),this.plannerIndicatorGraphics.beginPath(),this.plannerIndicatorGraphics.moveTo(l.x,l.y),this.plannerIndicatorGraphics.lineTo(d.x,d.y),this.plannerIndicatorGraphics.lineTo(p.x,p.y),this.plannerIndicatorGraphics.lineTo(c.x,c.y),this.plannerIndicatorGraphics.closePath(),this.plannerIndicatorGraphics.fillPath(),this.plannerIndicatorGraphics.strokePath()}handlePlannerTileClick(t,s){var n,r,i;const a=this.saveGame.facility.bayGridSize;if(!(t<0||t>=a.width||s<0||s>=a.height)){if(this.plannerTool==="PAINT_YELLOW")this.saveGame.facility.yellowRoomTiles||(this.saveGame.facility.yellowRoomTiles=[]),this.saveGame.facility.yellowRoomTiles.some(l=>l.x===t&&l.y===s)||(this.saveGame.facility.yellowRoomTiles.push({x:t,y:s}),x.playClick(),this.renderFloor(),this.renderMachines(),(n=this.onStateUpdateCallback)==null||n.call(this));else if(this.plannerTool==="PAINT_WHITE"){if(this.saveGame.facility.yellowRoomTiles){const o=this.saveGame.facility.yellowRoomTiles.findIndex(l=>l.x===t&&l.y===s);o>=0&&(this.saveGame.facility.yellowRoomTiles.splice(o,1),x.playClick(),this.renderFloor(),this.renderMachines(),(r=this.onStateUpdateCallback)==null||r.call(this))}}else if(this.plannerTool==="MOVE_MACHINE"&&this.movingMachineId){const o=this.saveGame.machines.find(d=>d.id===this.movingMachineId);if(!o||o.gridX===t&&o.gridY===s)return;if(this.saveGame.machines.some(d=>d.id!==this.movingMachineId&&d.gridX===t&&d.gridY===s)){x.playAlarm();return}o.gridX=t,o.gridY=s,x.playDing(),this.movingMachineId=null,this.selectionRingGraphics.clear(),this.plannerIndicatorGraphics.clear(),this.renderMachines(),this.renderOHTRails(),(i=this.onStateUpdateCallback)==null||i.call(this)}}}setupCameraControls(){this.input.on("pointerdown",t=>{var s;document.querySelector(".modal-backdrop")||(((s=document.getElementById("modal-container"))==null?void 0:s.children.length)??0)>0||t.leftButtonDown()&&(this.isDragging=!0,this.dragStartX=t.x,this.dragStartY=t.y,this.totalDragDistance=0)}),this.input.on("pointermove",t=>{if(this.isPlannerMode){const s=this.cameras.main.getWorldPoint(t.x,t.y);this.updatePlannerCursorIndicator(s.x,s.y)}if(this.isDragging){if(!t.isDown||!t.leftButtonDown()){this.isDragging=!1;return}const s=t.x-this.dragStartX,a=t.y-this.dragStartY;this.totalDragDistance+=Math.hypot(s,a),this.totalDragDistance>this.dragThreshold&&(this.cameras.main.scrollX-=s*.85/this.cameras.main.zoom,this.cameras.main.scrollY-=a*.85/this.cameras.main.zoom),this.dragStartX=t.x,this.dragStartY=t.y}}),this.input.on("pointerup",t=>{var a;const s=this.totalDragDistance>this.dragThreshold;if(this.isDragging=!1,this.pointerDownMachineId=null,this.justSelectedMachineOnPointerUp){this.justSelectedMachineOnPointerUp=!1;return}if(!(document.querySelector(".modal-backdrop")||(((a=document.getElementById("modal-container"))==null?void 0:a.children.length)??0)>0)&&!s&&this.isPlannerMode){const n=this.cameras.main.getWorldPoint(t.x,t.y),{gridX:r,gridY:i}=this.toGrid(n.x,n.y);this.handlePlannerTileClick(r,i)}}),window.addEventListener("mouseup",()=>{this.isDragging=!1,this.pointerDownMachineId=null}),window.addEventListener("blur",()=>{this.isDragging=!1,this.pointerDownMachineId=null}),this.input.on("wheel",(t,s,a,n)=>{var i;if(document.querySelector(".modal-backdrop")||(((i=document.getElementById("modal-container"))==null?void 0:i.children.length)??0)>0)return;const r=Phaser.Math.Clamp(this.cameras.main.zoom-n*.001,.45,2.2);this.cameras.main.setZoom(r)})}onResize(t){this.cameras.main.setSize(t.width,t.height)}updateState(t){const s=!this.saveGame||t.userId&&this.saveGame.userId!==t.userId;if(this.saveGame=t,s){for(const[a,n]of this.machineMap)n.container.destroy();this.machineMap.clear();for(const a of this.technicians)a.container.destroy();this.technicians=[];for(const a of this.agvCarriers)a.container.destroy();this.agvCarriers=[];for(const a of this.ohtShuttles)a.container.destroy();this.ohtShuttles=[],this.movingMachineId=null,this.selectionRingGraphics.clear(),this.plannerIndicatorGraphics.clear(),this.renderFloor(),this.renderOHTRails(),this.renderMachines(),this.spawnTechnicians(),this.saveGame.unlockedFeatures.agv&&this.spawnAGVCarriers(),this.saveGame.unlockedFeatures.oht&&this.spawnOHTShuttles()}else if(this.renderFloor(),this.renderMachines(),this.saveGame.unlockedFeatures.agv&&this.agvCarriers.length===0&&this.spawnAGVCarriers(),this.saveGame.unlockedFeatures.oht){if(this.ohtShuttles.length===0)this.spawnOHTShuttles();else if(this.saveGame.unlockedFeatures.shrOht)for(const a of this.ohtShuttles){a.speed=.005;const n=a.container.getAt(0);n&&n.setTint&&n.setTint(3462041)}}}};w(se,"KEY","CleanroomScene");let Q=se;class N{static getInitialAchievements(){return JSON.parse(JSON.stringify(this.INITIAL_ACHIEVEMENTS))}static checkAchievements(e){const t=[],s=new Map;for(const l of e.achievements)s.set(l.id,l);const a=l=>{const d=s.get(l);d&&!d.unlocked&&(d.unlocked=!0,t.push(d))};e.rollingYieldHistory.length>=1&&a("first_silicon"),(e.activeLots.some(l=>l.currentStation==="LIT"||l.currentStation==="ETCH"||l.currentStation==="DIFF")||e.rollingYieldHistory.length>=1)&&a("step_into_yellow");const r=e.activeOrders.filter(l=>l.status==="FULFILLED");r.length>=1&&a("first_cash"),e.unlockedFeatures.mesAutoDispatch&&a("mes_mastery"),r.some(l=>l.nodeNm<=350)&&a("submicron_explorer"),e.unlockedFeatures.cmp&&e.machines.some(l=>l.category==="CMP")&&a("copper_cmp_era"),e.machines.some(l=>l.modelId==="litho_arfi")&&a("immersion_wave"),e.machines.some(l=>l.modelId==="litho_euv"||l.modelId==="litho_highna")&&a("euv_domination");const i=new Map(e.staff.map(l=>[l.id,l]));let o=0;for(const l of e.machines){const d=l.assignedEngineerId?i.get(l.assignedEngineerId):null;H.checkTPMConditions(l,d).isTPMActive&&o++}if(o>=3&&a("tpm_zero_defect"),e.machines.some(l=>{var d;return l.category==="LITHO"&&(((d=l.pairedTrackIds)==null?void 0:d.length)??0)>=2})&&a("inline_cluster_master"),e.facility.cleanroomPhase>=4&&a("gigafab_expansion"),e.unlockedFeatures.agv&&e.unlockedFeatures.oht&&a("automation_highway"),e.rollingYieldHistory.some(l=>l>=.99)&&a("flawless_wafer"),e.rollingYieldHistory.length>=5){const l=e.rollingYieldHistory.slice(-5);l.reduce((p,c)=>p+c,0)/l.length>=.95&&a("five_star_foundry")}return e.player.cash>=1e8&&a("trillion_chip_dynasty"),{newlyUnlocked:t}}static triggerManualUnlock(e,t){const s=e.find(a=>a.id===t);return s&&!s.unlocked?(s.unlocked=!0,!0):!1}static claimReward(e,t){const s=e.find(a=>a.id===t);return s?s.unlocked?s.claimed?{success:!1,cash:0,message:"該成就獎勵已領取"}:(s.claimed=!0,{success:!0,cash:s.rewardCash,message:`🏆 成功領取成就【${s.title}】獎勵！獲得獎勵金 NT$ ${s.rewardCash.toLocaleString()}！`}):{success:!1,cash:0,message:"尚未達成該成就解鎖條件"}:{success:!1,cash:0,message:"找不到該成就"}}}w(N,"INITIAL_ACHIEVEMENTS",[{id:"first_silicon",category:"onboarding",title:"矽島啟航 (First Silicon)",description:"成功在廠房內完成並產出第一批晶圓。",rewardCash:5e4,unlocked:!1,claimed:!1},{id:"step_into_yellow",category:"onboarding",title:"邁入黃光密室 (Yellow Room Entry)",description:"首次完成微影站塗膠、曝光與顯影連線作業。",rewardCash:8e4,unlocked:!1,claimed:!1},{id:"first_cash",category:"onboarding",title:"首桶金進帳 (First Cash Delivery)",description:"成功履約第一張客戶製造合約並取得全額尾款。",rewardCash:1e5,unlocked:!1,claimed:!1},{id:"mes_mastery",category:"onboarding",title:"智慧製造大師 (MES Mastery)",description:"完成新手教學，解鎖並啟用 MES 智慧自動派工系統。",rewardCash:15e4,unlocked:!1,claimed:!1},{id:"submicron_explorer",category:"process",title:"突破次微米壁壘 (Sub-micron Explorer)",description:"成功承接並交付線寬 <= 350nm 之高階次微米訂單。",rewardCash:5e5,unlocked:!1,claimed:!1},{id:"copper_cmp_era",category:"process",title:"銅導線與平坦化時代 (CMP Era)",description:"解鎖並在廠房內運作 CMP 化學機械平坦化拋光設備。",rewardCash:1e6,unlocked:!1,claimed:!1},{id:"immersion_wave",category:"process",title:"水中折射奇蹟 (Immersion Wave)",description:"購買並安裝 Tier 5 ArFi 浸潤微影雙工件台設備 (TWINSCAN)。",rewardCash:5e6,unlocked:!1,claimed:!1},{id:"euv_domination",category:"process",title:"極紫外神之光 (EUV Domination)",description:"購買並啟用極紫外光微影巨獸 (EUV Scanner)。",rewardCash:2e7,unlocked:!1,claimed:!1},{id:"tpm_zero_defect",category:"operation",title:"零非計畫停機殿堂 (TPM Zero-Defect)",description:"同時維持 3 台以上機台處於 🛡️ TPM 24H 零故障在線維護保障狀態。",rewardCash:2e6,unlocked:!1,claimed:!1},{id:"inline_cluster_master",category:"operation",title:"雙軌並聯突破極限 (Inline Cluster Master)",description:"為微影機台並聯配套綁定 2 台以上 Track 塗膠顯影設備，消除產能瓶頸。",rewardCash:15e5,unlocked:!1,claimed:!1},{id:"gigafab_expansion",category:"operation",title:"GigaFab 超級晶圓廠 (GigaFab Expansion)",description:"將潔淨室無塵廠房拓建至 Phase 4 (24x24 巨型潔淨室)。",rewardCash:1e7,unlocked:!1,claimed:!1},{id:"automation_highway",category:"operation",title:"自動化天軌物流 (Automation Highway)",description:"同時解鎖地面 AGV 自走車與天花板 OHT 懸吊天軌系統。",rewardCash:3e6,unlocked:!1,claimed:!1},{id:"flawless_wafer",category:"yield",title:"神級黃金良率 (Flawless Wafer 99%+)",description:"成功生產交付一批最終良率達 99% 以上的頂級晶圓。",rewardCash:1e6,unlocked:!1,claimed:!1},{id:"rework_savior",category:"yield",title:"點石成金光阻重洗 (Rework Savior)",description:"成功對 Q-Time 逾期晶圓執行光阻重洗 (Rework)，拯救昂貴晶片免於報廢。",rewardCash:5e5,unlocked:!1,claimed:!1},{id:"five_star_foundry",category:"yield",title:"五星品質金字招牌 (Five-Star Foundry)",description:"累積至少 5 批出貨紀錄，且 RollingYieldIndex 滾動良率指數突破 95%！",rewardCash:8e6,unlocked:!1,claimed:!1},{id:"trillion_chip_dynasty",category:"yield",title:"稱霸全球矽島霸權 (Silicon Hegemony)",description:"總現金累積突破 NT$ 100,000,000，建立無可撼動的半導體傳奇帝國。",rewardCash:5e7,unlocked:!1,claimed:!1}]);class ${static getTodayDateString(e=new Date){const t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0"),a=String(e.getDate()).padStart(2,"0");return`${t}-${s}-${a}`}static getWeekString(e=new Date){const t=new Date(e.valueOf()),s=(e.getDay()+6)%7;t.setDate(t.getDate()-s+3);const a=t.valueOf();t.setMonth(0,1),t.getDay()!==4&&t.setMonth(0,1+(4-t.getDay()+7)%7);const n=1+Math.ceil((a-t.valueOf())/6048e5);return`${t.getFullYear()}-W${String(n).padStart(2,"0")}`}static getMonthString(e=new Date){const t=e.getFullYear(),s=String(e.getMonth()+1).padStart(2,"0");return`${t}-${s}`}static createEmptyRecord(e,t,s,a=5e7,n=7e7){return{periodType:e,periodIndex:t,label:s,timestamp:Date.now(),revenue:{waferSales:0,nreFees:0,subsidies:0,totalRevenue:0},expenses:{depreciation:0,maintenance:0,utilities:0,payroll:0,scraps:0,capex:0,totalExpenses:0},grossProfit:0,grossMarginPct:0,netProfit:0,netMarginPct:0,endingCash:a,endingNetWorth:n}}static initFinancialState(e=5e7,t=7e7){const s=this.getTodayDateString();return{daySeconds:0,currentDay:1,currentWeek:1,currentMonth:1,currentDateStr:s,today:this.createEmptyRecord("DAY",1,`📅 ${s} (今日)`,e,t),thisWeek:this.createEmptyRecord("WEEK",1,`📅 本周 (${this.getWeekString()})`,e,t),thisMonth:this.createEmptyRecord("MONTH",1,`📅 本月 (${this.getMonthString()})`,e,t),dailyHistory:[],weeklyHistory:[],monthlyHistory:[],allTimeRevenue:0,allTimeExpenses:0,allTimeProfit:0}}static calculateCompanyNetWorth(e){const t=e.player.cash,s=e.machines.reduce((r,i)=>{const o=i.tier*15e6,l=Math.max(.2,(100-i.wear)/100);return r+Math.round(o*l)},0),a=e.facility.cleanroomPhase*25e6,n=e.clawbackDebt||0;return Math.max(0,t+s+a-n)}static recordWaferSales(e,t){const s=this.ensureFinancialState(e);s.today.revenue.waferSales+=t,s.thisWeek.revenue.waferSales+=t,s.thisMonth.revenue.waferSales+=t,s.allTimeRevenue+=t,this.updateRecordTotals(s.today,e),this.updateRecordTotals(s.thisWeek,e),this.updateRecordTotals(s.thisMonth,e)}static recordNREFee(e,t){const s=this.ensureFinancialState(e);s.today.revenue.nreFees+=t,s.thisWeek.revenue.nreFees+=t,s.thisMonth.revenue.nreFees+=t,s.allTimeRevenue+=t,this.updateRecordTotals(s.today,e),this.updateRecordTotals(s.thisWeek,e),this.updateRecordTotals(s.thisMonth,e)}static recordSubsidy(e,t){const s=this.ensureFinancialState(e);s.today.revenue.subsidies+=t,s.thisWeek.revenue.subsidies+=t,s.thisMonth.revenue.subsidies+=t,s.allTimeRevenue+=t,this.updateRecordTotals(s.today,e),this.updateRecordTotals(s.thisWeek,e),this.updateRecordTotals(s.thisMonth,e)}static recordMaintenance(e,t){const s=this.ensureFinancialState(e);s.today.expenses.maintenance+=t,s.thisWeek.expenses.maintenance+=t,s.thisMonth.expenses.maintenance+=t,s.allTimeExpenses+=t,this.updateRecordTotals(s.today,e),this.updateRecordTotals(s.thisWeek,e),this.updateRecordTotals(s.thisMonth,e)}static recordCapEx(e,t){const s=this.ensureFinancialState(e);s.today.expenses.capex+=t,s.thisWeek.expenses.capex+=t,s.thisMonth.expenses.capex+=t,s.allTimeExpenses+=t,this.updateRecordTotals(s.today,e),this.updateRecordTotals(s.thisWeek,e),this.updateRecordTotals(s.thisMonth,e)}static recordOpEx(e,t,s){const a=this.ensureFinancialState(e);a.today.expenses.maintenance+=s,a.thisWeek.expenses.maintenance+=s,a.thisMonth.expenses.maintenance+=s,a.allTimeExpenses+=s,this.updateRecordTotals(a.today,e),this.updateRecordTotals(a.thisWeek,e),this.updateRecordTotals(a.thisMonth,e)}static recordSigningBonus(e,t){const s=this.ensureFinancialState(e);s.today.expenses.payroll+=t,s.thisWeek.expenses.payroll+=t,s.thisMonth.expenses.payroll+=t,s.allTimeExpenses+=t,this.updateRecordTotals(s.today,e),this.updateRecordTotals(s.thisWeek,e),this.updateRecordTotals(s.thisMonth,e)}static recordScrapLoss(e,t){const s=this.ensureFinancialState(e);s.today.expenses.scraps+=t,s.thisWeek.expenses.scraps+=t,s.thisMonth.expenses.scraps+=t,s.allTimeExpenses+=t,this.updateRecordTotals(s.today,e),this.updateRecordTotals(s.thisWeek,e),this.updateRecordTotals(s.thisMonth,e)}static tickSimulation(e,t=1){const s=this.ensureFinancialState(e),a=e.machines.reduce((c,m)=>c+m.tier*1200,0)*t;s.today.expenses.depreciation+=Math.round(a),s.thisWeek.expenses.depreciation+=Math.round(a),s.thisMonth.expenses.depreciation+=Math.round(a);const n=e.machines.filter(c=>c.status==="PROCESSING").length,i=(e.facility.cleanroomPhase*800+n*600)*t;s.today.expenses.utilities+=Math.round(i),s.thisWeek.expenses.utilities+=Math.round(i),s.thisMonth.expenses.utilities+=Math.round(i);const d=e.staff.reduce((c,m)=>c+m.salary,0)/300*t;s.today.expenses.payroll+=Math.round(d),s.thisWeek.expenses.payroll+=Math.round(d),s.thisMonth.expenses.payroll+=Math.round(d),this.updateRecordTotals(s.today,e),this.updateRecordTotals(s.thisWeek,e),this.updateRecordTotals(s.thisMonth,e);const p=this.getTodayDateString();if(s.currentDateStr||(s.currentDateStr=p),s.currentDateStr!==p){const c=s.currentDateStr;s.currentDateStr=p,this.closeDay(e,c,p)}}static closeDay(e,t,s){const a=this.ensureFinancialState(e);this.updateRecordTotals(a.today,e),t&&(a.today.label=`📅 ${t} (結算)`),a.dailyHistory.unshift(JSON.parse(JSON.stringify(a.today))),a.dailyHistory.length>14&&a.dailyHistory.pop(),a.daySeconds=0,a.currentDay+=1;const n=s||this.getTodayDateString();a.currentDateStr=n,a.today=this.createEmptyRecord("DAY",a.currentDay,`📅 ${n} (今日)`,e.player.cash,this.calculateCompanyNetWorth(e));const r=t?new Date(t):new Date(Date.now()-864e5),i=new Date(n);this.getWeekString(r)!==this.getWeekString(i)&&this.closeWeek(e),this.getMonthString(r)!==this.getMonthString(i)&&this.closeMonth(e)}static closeWeek(e){const t=this.ensureFinancialState(e);this.updateRecordTotals(t.thisWeek,e),t.weeklyHistory.unshift(JSON.parse(JSON.stringify(t.thisWeek))),t.weeklyHistory.length>8&&t.weeklyHistory.pop(),t.currentWeek+=1;const s=t.currentWeek;t.thisWeek=this.createEmptyRecord("WEEK",s,`📅 本周 (${this.getWeekString()})`,e.player.cash,this.calculateCompanyNetWorth(e))}static closeMonth(e){const t=this.ensureFinancialState(e);this.updateRecordTotals(t.thisMonth,e),t.monthlyHistory.unshift(JSON.parse(JSON.stringify(t.thisMonth))),t.monthlyHistory.length>6&&t.monthlyHistory.pop(),t.currentMonth+=1;const s=t.currentMonth;t.thisMonth=this.createEmptyRecord("MONTH",s,`📅 本月 (${this.getMonthString()})`,e.player.cash,this.calculateCompanyNetWorth(e))}static updateRecordTotals(e,t){e.revenue.totalRevenue=e.revenue.waferSales+e.revenue.nreFees+e.revenue.subsidies,e.expenses.totalExpenses=e.expenses.depreciation+e.expenses.maintenance+e.expenses.utilities+e.expenses.payroll+e.expenses.scraps+e.expenses.capex;const s=e.expenses.depreciation+e.expenses.maintenance+e.expenses.utilities+e.expenses.scraps;e.grossProfit=e.revenue.totalRevenue-s,e.grossMarginPct=e.revenue.totalRevenue>0?Number((e.grossProfit/e.revenue.totalRevenue*100).toFixed(1)):0;const a=s+e.expenses.payroll;e.netProfit=e.revenue.totalRevenue-a,e.netMarginPct=e.revenue.totalRevenue>0?Number((e.netProfit/e.revenue.totalRevenue*100).toFixed(1)):0,e.endingCash=t.player.cash,e.endingNetWorth=this.calculateCompanyNetWorth(t)}static ensureFinancialState(e){return(!e.financialState||!e.financialState.today)&&(e.financialState=this.initFinancialState(e.player.cash,this.calculateCompanyNetWorth(e))),e.financialState.currentDateStr||(e.financialState.currentDateStr=this.getTodayDateString()),e.financialState}static generateCFOAdvisory(e,t){const s=e.revenue.totalRevenue,a=e.grossMarginPct,n=t.player.cash;return s===0?{rating:"WARNING",title:"💤 產線待命中 — 週期營收缺口警示",advice:"本週期尚未認列任何晶圓出貨尾款或 NRE 光罩開發款，但固定水電與工程師薪資持續流出。請立即前往【合約公告板】承接高毛利訂單！",metrics:"毛利率: 0.0% | 產能營收: NT$ 0"}:n<1e7?{rating:"CRITICAL",title:"🚨 流動資金偏低 — 嚴控資本開支",advice:"現金儲備低於安全水位！建議暫緩購買高價新機台，優先全力推進在製晶圓批次出貨，或檢查機台磨損避免意外炸機造成大修支出！",metrics:`流動現金: NT$ ${Math.round(n).toLocaleString()}（建議最低安全門檻: NT$ 20,000,000）`}:a>=53?{rating:"EXCELLENT",title:"🌟 傳奇毛利率 — 達到台積電 53% 卓越標竿！",advice:"恭喜！本週期毛利率高達 "+a+"%，超越全球半導體龍頭 53.0% 標竿！製程良率優異且 NRE 溢價充沛。建議積極將獲利轉入 CapEx 擴大產能，搶佔次世代製程領導地位！",metrics:`當期毛利率: ${a}%（超越全球龍頭標竿 53.0% 達成！）`}:a>=35?{rating:"GOOD",title:"⚖️ 獲利穩健 — 符合晶圓代工常態",advice:"收支結構健康，毛利率維持在良好的 35% ~ 50% 區間。建議透過 🛡️ TPM 在線保養維持零故障，並優化員工排班減少夜班過勞，進一步釋放產能。",metrics:`當期毛利率: ${a}%（符合產業健康標準 35% ~ 45%）`}:{rating:"WARNING",title:"⚠️ 毛利受壓 — 成本與耗損偏高",advice:"本週期毛利率偏低，主要受限於機台維修頻繁、折舊沉重或報廢損失。建議檢查機台配對狀態與工程師職級，減少晶圓報廢，拉升合格晶粒產出比率。",metrics:`當期毛利率: ${a}%（低於產業安全水準 35.0%）`}}}w($,"DAY_SECONDS",86400),w($,"DAYS_PER_WEEK",7),w($,"DAYS_PER_MONTH",30);class A{static getNodeSpec(e){return this.PRICING_TABLE.slice().reverse().find(s=>e<=s.nodeNm)||this.PRICING_TABLE[0]}static calculateUpfrontNRE(e,t,s=1){const a=this.getNodeSpec(e);return Math.round(a.baseNRE*t*s)}static calculateTrustMultiplier(e){if(e===null||isNaN(e))return 1;const t=.7+e*.5;return Math.max(.75,Math.min(1.25,Number(t.toFixed(3))))}static calculateUnitPrice(e,t,s,a){const n=this.getNodeSpec(e),r=1+(t-1)*.08,i=n.basePrice*r*s*a;return Number(i.toFixed(2))}static settleOrderPayout(e,t,s,a,n=0,r=0){const i=Math.max(0,Math.round(t*e.unitPrice-n));let o=0,l=r;if(l>0&&i>0){const c=a.reduce((u,h)=>u+h.salary,0)*1.5,m=s.cash+i;if(m>c){const u=m-c,h=Math.min(u*.25,i*.25);o=Math.min(l,Math.round(h)),l-=o}}const d=i-o;return{grossPayout:i,netPayout:d,debtDeducted:o,remainingDebt:l}}static calculateOverdueClawback(e,t,s=!1){const a=t-e.deadlineGameTime;return a<=0?{clawbackRatio:0,clawbackAmount:0,isCancelled:!1}:s&&a<=86400?{clawbackRatio:.1,clawbackAmount:Math.round(e.nrePaid*.1),isCancelled:!1}:a<=28800?{clawbackRatio:.3,clawbackAmount:Math.round(e.nrePaid*.3),isCancelled:!1}:a<=86400?{clawbackRatio:.7,clawbackAmount:Math.round(e.nrePaid*.7),isCancelled:!1}:{clawbackRatio:1,clawbackAmount:e.nrePaid,isCancelled:!0}}static getMarketRefreshCost(e){return{1:5e4,2:15e4,3:5e5,4:15e5,5:5e6,6:2e7}[e]||5e4}static generateSingleOrder(e,t,s,a=0){const n=["聯發通訊","蘋果核心","輝達智能","高通晶創","超微運算","台積晶心","瑞昱音訊","博通網通"],r=this.PRICING_TABLE.filter(O=>O.minTier<=e),i=this.calculateTrustMultiplier(t),o=r[Math.floor(Math.random()*r.length)],l=n[(a+Math.floor(Math.random()*8))%n.length],d=o.minTier<=2?3:5,p=o.minTier<=2?5:o.minTier<=4?12:24,c=Math.floor(Math.random()*(p-d+1))+d,m=[3,5,10,25][Math.floor(Math.random()*4)],u=o.nodeNm>=1e3?500:2e3,h=m*u,f=[1,1,1,1.2,1.5],g=f[Math.floor(Math.random()*f.length)],y=this.calculateUpfrontNRE(o.nodeNm,c,g),T=this.calculateUnitPrice(o.nodeNm,c,g,i),v=Math.round(c*30*m*.8/g+180),b=s+v,k=g>=1.5?45e3:g>=1.2?7e4:1e5,D=Date.now()+k;return{id:`ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*900+100)}`,clientName:l,nodeNm:o.nodeNm,layerCount:c,totalDies:h,goodDiesDelivered:0,nrePaid:y,unitPrice:T,urgencyMultiplier:g,allowedDurationSec:v,marketExpiresAt:D,deadlineGameTime:b,status:"ACTIVE"}}static getAllowedDurationSec(e){if(e.allowedDurationSec&&e.allowedDurationSec>0)return e.allowedDurationSec;const t=Math.max(1,Math.ceil(e.totalDies/(e.nodeNm>=1e3?500:2e3))),s=30,a=e.urgencyMultiplier||1;return Math.round((e.layerCount||4)*s*t*.8/a+180)}static generateContractBoard(e,t,s,a=this.MAX_MARKET_ORDERS){const n=[];for(let r=0;r<a;r++)n.push(this.generateSingleOrder(e,t,s,r));return n}static ensureMarketOrders(e){if(!e.marketOrders||e.marketOrders.length===0){const t=e.rollingYieldHistory&&e.rollingYieldHistory.length>0?e.rollingYieldHistory.reduce((s,a)=>s+a,0)/e.rollingYieldHistory.length:null;e.marketOrders=this.generateContractBoard(e.player.foundryTier,t,e.gameTime),e.nextOrderRespawnTime=0}}static checkOrderReplenishment(e){if(e.marketOrders||(e.marketOrders=[]),e.marketOrders.length>=this.MAX_MARKET_ORDERS)return e.nextOrderRespawnTime=0,!1;const t=Date.now();if(!e.nextOrderRespawnTime||e.nextOrderRespawnTime===0)return e.nextOrderRespawnTime=t+this.ORDER_RESPAWN_COOLDOWN_MS,!0;if(t>=e.nextOrderRespawnTime){const s=e.rollingYieldHistory&&e.rollingYieldHistory.length>0?e.rollingYieldHistory.reduce((n,r)=>n+r,0)/e.rollingYieldHistory.length:null,a=this.generateSingleOrder(e.player.foundryTier,s,e.gameTime);return e.marketOrders.push(a),e.marketOrders.length<this.MAX_MARKET_ORDERS?e.nextOrderRespawnTime=t+this.ORDER_RESPAWN_COOLDOWN_MS:e.nextOrderRespawnTime=0,!0}return!1}static checkMarketOrdersExpiry(e){if(!e.marketOrders||e.marketOrders.length===0)return!1;const t=Date.now();let s=!1;const a=e.rollingYieldHistory&&e.rollingYieldHistory.length>0?e.rollingYieldHistory.reduce((n,r)=>n+r,0)/e.rollingYieldHistory.length:null;for(let n=0;n<e.marketOrders.length;n++){const r=e.marketOrders[n];if(!r.marketExpiresAt){const i=(r.urgencyMultiplier||1)>=1.5?45e3:(r.urgencyMultiplier||1)>=1.2?7e4:1e5;r.marketExpiresAt=t+i;continue}t>=r.marketExpiresAt&&(e.marketOrders[n]=this.generateSingleOrder(e.player.foundryTier,a,e.gameTime,n),s=!0)}return s}static forceRefreshAllMarketOrders(e){const t=e.rollingYieldHistory&&e.rollingYieldHistory.length>0?e.rollingYieldHistory.reduce((s,a)=>s+a,0)/e.rollingYieldHistory.length:null;e.marketOrders=this.generateContractBoard(e.player.foundryTier,t,e.gameTime),e.nextOrderRespawnTime=0}}w(A,"PRICING_TABLE",[{nodeNm:1e4,basePrice:180,baseNRE:18e3,minTier:1},{nodeNm:3e3,basePrice:320,baseNRE:35e3,minTier:1},{nodeNm:1e3,basePrice:500,baseNRE:8e4,minTier:2},{nodeNm:350,basePrice:850,baseNRE:18e4,minTier:3},{nodeNm:180,basePrice:1400,baseNRE:35e4,minTier:3},{nodeNm:90,basePrice:2400,baseNRE:8e5,minTier:4},{nodeNm:45,basePrice:4200,baseNRE:18e5,minTier:4},{nodeNm:28,basePrice:7500,baseNRE:4e6,minTier:5},{nodeNm:7,basePrice:18e3,baseNRE:12e6,minTier:6},{nodeNm:2,basePrice:45e3,baseNRE:35e6,minTier:6}]),w(A,"MAX_MARKET_ORDERS",5),w(A,"ORDER_RESPAWN_COOLDOWN_MS",6e4);class M{static createDefaultSave(e="矽島先進半導體",t="張創辦人",s="avatar_1"){const a=Date.now(),n={schemaVersion:2,savedAt:a,lastOnlineTimestamp:a,player:{companyName:e,ceoName:t,avatarId:s,cash:5e7,foundryTier:1,popularity:100,unlockedK1:"BASE",unlockedCleanroomClass:"Class 10000",totalOrdersFulfilled:0,totalWafersDelivered:0,rdInvestedCash:0,tutorialCompleted:!1},unlockedFeatures:{cmp:!1,agv:!1,oht:!1,shrOht:!1,mesAutoDispatch:!1,mixAndMatchLitho:!1},facility:{cleanroomPhase:1,bayGridSize:{width:10,height:10},yellowRoomTiles:[{x:3,y:1},{x:4,y:1},{x:5,y:1},{x:6,y:1},{x:7,y:1},{x:3,y:2},{x:4,y:2},{x:5,y:2},{x:6,y:2},{x:7,y:2},{x:3,y:3},{x:4,y:3},{x:5,y:3},{x:6,y:3},{x:7,y:3}]},machines:[{id:"mach_film_1",modelId:"film_furnace",name:"熱氧化爐 (Thermal Oxidation)",category:"FILM",tier:1,gridX:1,gridY:2,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_track_1",modelId:"track_clean",name:"手動旋塗熱板台 (Manual Track)",category:"TRACK",tier:1,gridX:4,gridY:2,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_litho_1",modelId:"litho_contact",name:"接觸式微影機 (Contact Aligner)",category:"LITHO",tier:1,gridX:6,gridY:2,wear:0,status:"IDLE",assignedEngineerId:"staff_1",pairedTrackIds:["mach_track_1"]},{id:"mach_etch_1",modelId:"etch_plasma",name:"電漿乾式蝕刻機 (Dry Plasma Etcher)",category:"ETCH",tier:1,gridX:6,gridY:6,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_diff_1",modelId:"diff_furnace",name:"擴散退火爐 (Diffusion Furnace)",category:"DIFF",tier:1,gridX:2,gridY:6,wear:0,status:"IDLE",assignedEngineerId:null}],staff:[{id:"staff_1",name:"Alex Miller",rank:"Skilled Worker",moduleSpecialty:"LITHO",fatigue:10,shiftMode:"THREE_SHIFT",workShift:"DAY",assignedMachineId:"mach_litho_1",salary:6e4}],activeOrders:[],activeLots:[],rollingYieldHistory:[],clawbackDebt:0,questState:{lastDateStr:new Date().toISOString().split("T")[0],dailyQuests:[],allDailyClaimed:!1,weeklyCompletedCount:0,weeklyTarget:15,weeklyClaimed:!1},achievements:N.getInitialAchievements(),gameTime:0,financialState:$.initFinancialState(5e7,7e7),marketOrders:A.generateContractBoard(1,null,0),nextOrderRespawnTime:0};return P.updateMachineNames(n.machines),n}static getUserProfiles(){try{const e=localStorage.getItem(this.REGISTRY_KEY);if(e){const t=JSON.parse(e);if(Array.isArray(t)&&t.length>0)return t}}catch(e){console.warn("讀取使用者目錄失敗:",e)}return this.initializeDefaultProfile()}static initializeDefaultProfile(){const e=localStorage.getItem(this.STORAGE_KEY_V2);let t="張創辦人",s="矽島先進半導體",a=1,n=5e7,r=Date.now();if(e)try{const l=JSON.parse(e);l.player&&(t=l.player.ceoName||t,s=l.player.companyName||s,a=l.player.foundryTier||a,n=l.player.cash||n,r=l.savedAt||r)}catch{}const i={id:"usr_default",name:t,companyName:s,foundryTier:a,cash:n,createdAt:r,lastPlayedAt:Date.now(),storageKey:this.STORAGE_KEY_V2},o=[i];try{localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(o)),localStorage.setItem(this.ACTIVE_USER_ID_KEY,i.id)}catch{}return o}static getActiveUserProfile(){const e=this.getUserProfiles(),t=localStorage.getItem(this.ACTIVE_USER_ID_KEY),s=e.find(n=>n.id===t);if(s)return s;const a=e[0]||this.initializeDefaultProfile()[0];return localStorage.setItem(this.ACTIVE_USER_ID_KEY,a.id),a}static createUser(e,t){const s=e.trim()||`執行長 ${Math.floor(Math.random()*900+100)}`,a=(t==null?void 0:t.trim())||`${s}半導體`,n=`usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2,6)}`,r=`SILICON_TYCOON_SAVE_${n}`,i={id:n,name:s,companyName:a,foundryTier:1,cash:5e7,createdAt:Date.now(),lastPlayedAt:Date.now(),storageKey:r},o=this.createDefaultSave(a,s);o.userId=n,localStorage.setItem(r,JSON.stringify(o));const l=this.getUserProfiles();return l.push(i),localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(l)),localStorage.setItem(this.ACTIVE_USER_ID_KEY,n),i}static renameUser(e,t){const s=t.trim();if(!s)return!1;const a=this.getUserProfiles(),n=a.find(i=>i.id===e);if(!n)return!1;n.name=s,localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(a));const r=localStorage.getItem(n.storageKey);if(r)try{const i=JSON.parse(r);i.player&&(i.player.ceoName=s,localStorage.setItem(n.storageKey,JSON.stringify(i)))}catch{}return!0}static deleteUser(e){const t=this.getUserProfiles();if(t.length<=1)return{success:!1,message:"至少需要保留一個玩家存檔，無法全部刪除！"};const s=t.findIndex(r=>r.id===e);if(s===-1)return{success:!1,message:"找不到該玩家存檔！"};const a=t[s];return localStorage.removeItem(a.storageKey),t.splice(s,1),localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(t)),localStorage.getItem(this.ACTIVE_USER_ID_KEY)===e&&localStorage.setItem(this.ACTIVE_USER_ID_KEY,t[0].id),{success:!0}}static switchActiveUser(e){return this.getUserProfiles().find(a=>a.id===e)?(localStorage.setItem(this.ACTIVE_USER_ID_KEY,e),this.loadFromLocalStorage()):null}static factoryResetAllData(){try{const e=[];for(let t=0;t<localStorage.length;t++){const s=localStorage.key(t);s&&s.toLowerCase().startsWith("silicon_tycoon")&&e.push(s)}for(const t of e)localStorage.removeItem(t)}catch(e){console.warn("清空存檔時發生例外:",e),localStorage.clear()}}static saveToLocalStorage(e){try{e.savedAt=Date.now(),e.lastOnlineTimestamp=Date.now();const t=this.getActiveUserProfile(),s=e.userId&&e.userId===t.id?t.storageKey:t.storageKey||this.STORAGE_KEY_V2,a=JSON.stringify(e);localStorage.setItem(s,a);const n=this.getUserProfiles(),r=n.find(i=>i.id===t.id);return r&&(r.cash=e.player.cash,r.foundryTier=e.player.foundryTier,r.companyName=e.player.companyName,r.name=e.player.ceoName,r.lastPlayedAt=Date.now(),localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(n))),!0}catch(t){return console.error("LocalStorage 存檔失敗:",t),!1}}static loadFromLocalStorage(){try{const e=this.getActiveUserProfile();let t=localStorage.getItem(e.storageKey);if(!t&&e.id==="usr_default"&&(t=localStorage.getItem(this.STORAGE_KEY_V2)),t){const n=JSON.parse(t);if(n.schemaVersion===2){if(n.staff&&(n.staff=this.normalizeStaffData(n.staff)),n.facility||(n.facility={cleanroomPhase:1,bayGridSize:{width:10,height:10}}),(!n.facility.yellowRoomTiles||n.facility.yellowRoomTiles.length===0)&&(n.facility.yellowRoomTiles=[{x:3,y:1},{x:4,y:1},{x:5,y:1},{x:6,y:1},{x:7,y:1},{x:3,y:2},{x:4,y:2},{x:5,y:2},{x:6,y:2},{x:7,y:2},{x:3,y:3},{x:4,y:3},{x:5,y:3},{x:6,y:3},{x:7,y:3}]),(!n.facility.bayGridSize||n.facility.bayGridSize.width<10)&&(n.facility.bayGridSize={width:10,height:10}),n.userId=e.id,n.financialState=$.ensureFinancialState(n),n.player&&(n.player.totalOrdersFulfilled===void 0&&(n.player.totalOrdersFulfilled=0),n.player.totalWafersDelivered===void 0&&(n.player.totalWafersDelivered=0),n.player.rdInvestedCash===void 0&&(n.player.rdInvestedCash=0)),n.machines&&P.updateMachineNames(n.machines),n.rollingYieldHistory&&n.rollingYieldHistory.length>0&&n.rollingYieldHistory.every(r=>r>=.999)&&(n.rollingYieldHistory=[.918,.935,.902,.927,.921]),n.marketOrders){const r=Date.now();for(const i of n.marketOrders)if(i.allowedDurationSec||(i.allowedDurationSec=A.getAllowedDurationSec(i)),!i.marketExpiresAt||i.marketExpiresAt<=r){const o=(i.urgencyMultiplier||1)>=1.5?45e3:(i.urgencyMultiplier||1)>=1.2?7e4:1e5;i.marketExpiresAt=r+o}}if(n.activeOrders)for(const r of n.activeOrders)r.allowedDurationSec||(r.allowedDurationSec=A.getAllowedDurationSec(r)),r.deadlineGameTime<=(n.gameTime||0)&&r.goodDiesDelivered<r.totalDies&&(r.deadlineGameTime=(n.gameTime||0)+r.allowedDurationSec);return A.ensureMarketOrders(n),n}}const s=localStorage.getItem(this.STORAGE_KEY_V1);if(s){const n=JSON.parse(s);if(n.schemaVersion===1){console.warn("偵測到舊版 SaveGameV1 存檔，執行自動升級至 SaveGameV2...");const r=this.migrateSaveV1toV2(n);return r.userId=e.id,r.financialState=$.ensureFinancialState(r),this.saveToLocalStorage(r),r}}const a=this.createDefaultSave(e.companyName,e.name);return a.userId=e.id,this.saveToLocalStorage(a),a}catch(e){return console.error("LocalStorage 讀檔失敗:",e),null}}static normalizeStaffData(e){return e.map((t,s)=>{const a=/[\u4e00-\u9fa5]/.test(t.name);let n=t.name;if(a||!n){const r=this.ENGLISH_FIRST_NAMES[s%this.ENGLISH_FIRST_NAMES.length],i=this.ENGLISH_LAST_NAMES[s%this.ENGLISH_LAST_NAMES.length];n=`${r} ${i}`}return{...t,name:n,workShift:t.workShift||(s%3===0?"DAY":s%3===1?"SWING":"NIGHT")}})}static migrateSaveV1toV2(e){var n;const t=new Date().toISOString().split("T")[0],s=e.machines.map(r=>({...r,pairedTrackIds:r.category==="LITHO"?[]:void 0})),a=e.activeOrders.map(r=>({...r,urgencyMultiplier:r.urgencyMultiplier??1,layerAllocations:[]}));return{schemaVersion:2,savedAt:e.savedAt??Date.now(),lastOnlineTimestamp:e.lastOnlineTimestamp??Date.now(),player:{...e.player},unlockedFeatures:{cmp:e.unlockedFeatures.cmp??!1,agv:e.unlockedFeatures.agv??!1,oht:e.unlockedFeatures.oht??!1,mesAutoDispatch:e.unlockedFeatures.mesAutoDispatch??!1,mixAndMatchLitho:!1},facility:{cleanroomPhase:((n=e.facility)==null?void 0:n.cleanroomPhase)??1,bayGridSize:{width:10,height:10},yellowRoomTiles:[{x:3,y:1},{x:4,y:1},{x:5,y:1},{x:6,y:1},{x:7,y:1},{x:3,y:2},{x:4,y:2},{x:5,y:2},{x:6,y:2},{x:7,y:2},{x:3,y:3},{x:4,y:3},{x:5,y:3},{x:6,y:3},{x:7,y:3}]},machines:s,staff:this.normalizeStaffData(e.staff??[]),activeOrders:a,activeLots:e.activeLots??[],rollingYieldHistory:e.rollingYieldHistory??[],clawbackDebt:e.clawbackDebt??0,questState:{lastDateStr:t,dailyQuests:[],allDailyClaimed:!1,weeklyCompletedCount:0,weeklyTarget:15,weeklyClaimed:!1},achievements:N.getInitialAchievements(),gameTime:e.gameTime??0}}static exportSaveToJson(e){return JSON.stringify(e,null,2)}static importSaveFromJson(e){try{const t=JSON.parse(e);return t.schemaVersion===2?{success:!0,state:t}:t.schemaVersion===1?{success:!0,state:this.migrateSaveV1toV2(t)}:{success:!1,error:"不相容的存檔格式版本！"}}catch(t){return{success:!1,error:`JSON 解析失敗: ${t.message}`}}}static calculateOfflineProgress(e,t){const s=Math.max(0,Math.floor((t-e.lastOnlineTimestamp)/1e3)),a=Math.min(14400,s),n={offlineDurationSeconds:a,lotsProcessed:0,wafersDelivered:0,revenueEarned:0,salaryPaid:0,utilityPaid:0,maintenanceExpense:0,debtRepaid:0,breakdownCount:0,explosionCount:0,tpmProtectedCount:0,netProfit:0};if(a<60)return n;const r=Math.floor(a/300),i=new Map(e.staff.map(h=>[h.id,h]));let o=0;for(const h of e.machines){const f=h.assignedEngineerId?i.get(h.assignedEngineerId):null;if(H.checkTPMConditions(h,f).isTPMActive)o++,h.wear=Math.min(5,h.wear),h.status="IDLE";else{const y=r*.4;h.wear=Math.min(100,h.wear+y),h.wear>=60&&Math.random()<.3&&(n.breakdownCount++,H.checkExplosionRisk(h,f).hasRisk&&Math.random()<.25?(n.explosionCount++,n.maintenanceExpense+=2e5*h.tier,h.status="EXPLODED"):(n.maintenanceExpense+=5e4*h.tier,h.status="MAINTENANCE"))}}n.tpmProtectedCount=o;const l=a/3600,d=e.staff.reduce((h,f)=>h+f.salary,0)/720,p=e.machines.length*15e3/720;if(n.salaryPaid=Math.round(d*l),n.utilityPaid=Math.round(p*l),e.unlockedFeatures.mesAutoDispatch&&e.activeOrders.length>0){const h=e.activeOrders.find(f=>f.status==="ACTIVE");if(h&&n.explosionCount===0){const f=Math.min(Math.floor(a/180),10);if(f>0){n.lotsProcessed=f;const g=f*5;n.wafersDelivered=g;const y=Math.round(g*100*h.unitPrice);n.revenueEarned=y;for(let T=0;T<f;T++)e.rollingYieldHistory.push(.92)}}}const c=n.revenueEarned,m=n.salaryPaid+n.utilityPaid+n.maintenanceExpense,u=c-m;if(u>0&&e.clawbackDebt>0){const h=Math.min(e.clawbackDebt,Math.round(u*.25));n.debtRepaid=h,e.clawbackDebt-=h}return n.netProfit=c-m-n.debtRepaid,e.player.cash=Math.max(0,e.player.cash+n.netProfit),e.gameTime+=a,e.lastOnlineTimestamp=t,e.savedAt=t,n}}w(M,"STORAGE_KEY_V2","SILICON_TYCOON_SAVE_V2"),w(M,"STORAGE_KEY_V1","SILICON_TYCOON_SAVE_V1"),w(M,"REGISTRY_KEY","SILICON_TYCOON_USERS_REGISTRY"),w(M,"ACTIVE_USER_ID_KEY","SILICON_TYCOON_ACTIVE_USER_ID"),w(M,"ENGLISH_FIRST_NAMES",["Alex","David","Sarah","Kevin","Emily","Michael","Jessica","James","Daniel","Rachel","Robert","Brian","Olivia","William","Sophia","Thomas"]),w(M,"ENGLISH_LAST_NAMES",["Miller","Chen","Smith","Williams","Johnson","Taylor","Davis","Wilson","Anderson","White","Harris","Martin","Clark","Lewis","Walker","Hall"]);class R{static getTierConfig(e){return this.TIER_CONFIGS[e]||this.TIER_CONFIGS[1]}static getProgressionStatus(e){const t=e.player.foundryTier||1,s=t>=this.MAX_TIER,a=t+1,n=s?null:this.getTierConfig(a),r=e.player.totalOrdersFulfilled||0,i=e.player.totalWafersDelivered||0,o=e.player.rdInvestedCash||0;if(s||!n)return{currentTier:t,maxTier:this.MAX_TIER,isMaxTier:!0,nextTierConfig:null,ordersCompleted:r,ordersTarget:r,ordersMet:!0,ordersPct:100,wafersDelivered:i,wafersTarget:i,wafersMet:!0,wafersPct:100,fundsInvested:o,fundsTarget:o,fundsMet:!0,fundsPct:100,canAdvance:!1,overallPct:100};const l=n.reqOrders,d=n.reqWafers,p=n.reqResearchFunds,c=r>=l,m=i>=d,u=o>=p,h=Math.min(100,Math.round(r/Math.max(1,l)*100)),f=Math.min(100,Math.round(i/Math.max(1,d)*100)),g=Math.min(100,Math.round(o/Math.max(1,p)*100)),y=Math.round((h+f+g)/3),T=c&&m&&u;return{currentTier:t,maxTier:this.MAX_TIER,isMaxTier:!1,nextTierConfig:n,ordersCompleted:r,ordersTarget:l,ordersMet:c,ordersPct:h,wafersDelivered:i,wafersTarget:d,wafersMet:m,wafersPct:f,fundsInvested:o,fundsTarget:p,fundsMet:u,fundsPct:g,canAdvance:T,overallPct:y}}static investRDCapital(e,t){const s=this.getProgressionStatus(e);if(s.isMaxTier||!s.nextTierConfig)return{success:!1,invested:0,message:"晶圓廠已達最高科技世代，無需再注資！"};const a=s.fundsTarget-s.fundsInvested;if(a<=0)return{success:!1,invested:0,message:"本世代研發資金已全數募足，請達成代工訂單與晶圓量產目標以晉升！"};const n=Math.max(0,Math.min(t,a,e.player.cash));return n<=0?{success:!1,invested:0,message:"廠房資金不足，無法撥款注資！"}:(e.player.cash-=n,e.player.rdInvestedCash=(e.player.rdInvestedCash||0)+n,$.recordCapEx(e,n),{success:!0,invested:n,message:`成功撥款注資 NT$ ${n.toLocaleString()} 注入次世代製程研發！`})}static advanceFoundryTier(e){const t=this.getProgressionStatus(e);if(t.isMaxTier||!t.nextTierConfig)return{success:!1,newTier:e.player.foundryTier,message:"已達最高科技世代！"};if(!t.canAdvance){const a=[];return t.ordersMet||a.push(`還需交付 ${t.ordersTarget-t.ordersCompleted} 筆訂單`),t.wafersMet||a.push(`還需生產 ${t.wafersTarget-t.wafersDelivered} 片晶圓`),t.fundsMet||a.push(`還需研發注資 NT$ ${(t.fundsTarget-t.fundsInvested).toLocaleString()}`),{success:!1,newTier:e.player.foundryTier,message:`尚未達成晉升條件：${a.join("、")}`}}const s=t.nextTierConfig.tier;if(e.player.foundryTier=s,e.player.rdInvestedCash=0,e.player.popularity=Math.min(100,e.player.popularity+5),t.nextTierConfig.unlockedCleanroomClass&&(e.player.unlockedCleanroomClass=t.nextTierConfig.unlockedCleanroomClass),t.nextTierConfig.unlockedFeatureKeys)for(const a of t.nextTierConfig.unlockedFeatureKeys)e.unlockedFeatures[a]=!0;return N.checkAchievements(e),{success:!0,newTier:s,message:`🎉 狂賀！製程微縮重大突破！晶圓廠成功晉升至【Tier ${s} ${t.nextTierConfig.name}】！已解鎖次世代機台採購與合約！`}}}w(R,"MAX_TIER",6),w(R,"TIER_CONFIGS",{1:{tier:1,name:"微米微影啟蒙時代",subtitle:"5µm ~ 3µm 微米成熟製程",eraCode:"ERA_1_MICRON",minCDNm:3e3,unlockedCleanroomClass:"Class 10,000",description:"半導體萌芽初創期，以接觸式與等倍投影曝光為核心，邁出晶圓製造的第一步。",scienceHistory:"使用汞燈紫外光混光與手工旋塗光阻，光罩物理貼合或反射鏡投影，極限線寬約 3 微米。",reqOrders:0,reqWafers:0,reqResearchFunds:0,unlockedModelIds:["litho_contact","litho_projection","track_manual","film_evap","film_sputter","etch_wet_barrel","diff_box","diff_tube_manual"]},2:{tier:2,name:"亞微米步進縮小時代",subtitle:"1.2µm ~ 800nm (G-Line 436nm)",eraCode:"ERA_2_SUBMICRON",minCDNm:800,unlockedCleanroomClass:"Class 1,000",description:"引入 4:1 縮小透鏡與步進曝光技術，晶圓製造邁入百萬顆電晶體之 1 微米世代。",scienceHistory:"採用高壓汞燈 g-line (436nm) 搭配光學鏡頭群，突破接觸式光罩刮傷瓶頸，全面提升良率。",reqOrders:3,reqWafers:100,reqResearchFunds:15e6,unlockedModelIds:["litho_gline","track_single","film_pecvd","etch_rie","diff_auto_horiz"]},3:{tier:3,name:"次微米紫外深耕時代",subtitle:"500nm ~ 350nm (I-Line & CMP)",eraCode:"ERA_3_DEEPUV_STEP",minCDNm:350,unlockedCleanroomClass:"Class 100",description:"推進至 i-line 紫外光，雙軌 Track 連線作業，並解鎖化學機械研磨 (CMP) 平坦化神技。",scienceHistory:"採用 365nm i-line 高強度紫外光搭配 NA=0.50 鏡頭，CMP 平坦化技術解決多層金屬互連景深問題。",reqOrders:8,reqWafers:350,reqResearchFunds:5e7,unlockedModelIds:["litho_iline","track_dual","film_hdp_cvd","etch_merie","diff_vertical","cmp_manual","cmp_standard"],unlockedFeatureKeys:["cmp"]},4:{tier:4,name:"深紫外 DUV 跨越時代",subtitle:"250nm ~ 90nm (KrF/ArF & MES 自動化)",eraCode:"ERA_4_DUV_EXCIMER",minCDNm:90,unlockedCleanroomClass:"Class 10",description:"準分子雷射掃描曝光與化學增幅型光阻 (CAR)，產線導入 MES 智慧派工無人化管理。",scienceHistory:"248nm KrF 與 193nm ArF 準分子雷射結合動態掃描 (Step-and-Scan)，大幅擴大曝光視場與精準度。",reqOrders:18,reqWafers:1e3,reqResearchFunds:18e7,unlockedModelIds:["litho_krf","litho_arfdry","track_clean","film_ald_thermal","etch_icp_advanced","diff_lpcvd_rapid","cmp_auto"],unlockedFeatureKeys:["mesAutoDispatch"]},5:{tier:5,name:"浸潤式微影顛峰時代",subtitle:"65nm ~ 7nm (ArFi 193nm 水折射)",eraCode:"ERA_5_IMMERSION_PEAK",minCDNm:7,unlockedCleanroomClass:"Class 1",description:"林本堅博士浸潤式水折射微影革命，搭配雙工件台磁浮掃描與多重曝光 (SAQP)，極限微縮至 7nm。",scienceHistory:"鏡頭與晶圓間注入超純水 (n=1.44)，將等效 NA 推升至 1.35，打破物理極限，領先全球晶圓代工市場。",reqOrders:35,reqWafers:3e3,reqResearchFunds:6e8,unlockedModelIds:["litho_arfi","film_ald_plasma","etch_ale_atomic","diff_rtp_laser","cmp_atomic"],unlockedFeatureKeys:["mixAndMatchLitho"]},6:{tier:6,name:"埃米 EUV 矽島霸權時代",subtitle:"5nm ~ 2nm 以下 (High-NA EUV 埃米時代)",eraCode:"ERA_6_HIGH_NA_EUV",minCDNm:2,unlockedCleanroomClass:"Class 1 (ISO 3)",description:"13.5nm 極紫外光與 0.55 NA 變形鏡頭次世代巨獸，單次曝光推進 2nm，傲視全球的半導體科技霸主！",scienceHistory:"以二氧化碳雷射高頻擊打錫滴激發電漿產生 13.5nm 極紫外光，全機超高真空運行，登頂世界半導體工業之巔。",reqOrders:60,reqWafers:8e3,reqResearchFunds:25e8,unlockedModelIds:["litho_euv","litho_highna","track_advanced"]}});class xe{constructor(e,t){w(this,"container");w(this,"callbacks");w(this,"isInitialized",!1);w(this,"isDropdownOpen",!1);w(this,"currentState",null);const s=document.getElementById(e);if(!s)throw new Error(`找不到 HUD 容器: #${e}`);this.container=s,this.callbacks=t,document.addEventListener("click",a=>{if(!this.isDropdownOpen)return;const n=document.getElementById("top-dropdown-menu"),r=document.getElementById("btn-top-more"),i=a.target;n&&!n.contains(i)&&r&&!r.contains(i)&&this.closeDropdown()})}rebuild(){this.isInitialized=!1,this.isDropdownOpen=!1}closeDropdown(){this.isDropdownOpen=!1;const e=document.getElementById("top-dropdown-menu");e&&e.classList.add("hidden")}toggleDropdown(){this.isDropdownOpen=!this.isDropdownOpen;const e=document.getElementById("top-dropdown-menu");e&&(this.isDropdownOpen?e.classList.remove("hidden"):e.classList.add("hidden"))}render(e){this.currentState=e,(!this.isInitialized||!this.container.firstElementChild)&&(this.renderInitialStructure(),this.bindEvents(),this.isInitialized=!0),this.updateValues(e)}renderInitialStructure(){this.container.innerHTML=`
      <!-- 左側：創辦人與公司資訊 (附帶 PvZ 1 經典使用者登入切換與現實日曆同步) -->
      <div class="flex items-center gap-2.5 flex-shrink-0 whitespace-nowrap">
        <div id="btn-hud-profile-avatar" class="w-10 h-10 rounded-full border border-cyan-400/50 bg-slate-800 flex items-center justify-center text-xl shadow-inner cursor-pointer hover:border-amber-400 hover:scale-105 transition-all" title="點擊切換存檔 / 登入使用者">
          👤
        </div>
        <div>
          <div class="flex items-center gap-2">
            <span id="hud-company-name" class="text-sm font-bold text-slate-100 tracking-wide"></span>
            <span id="hud-foundry-tier" class="text-xs px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-mono"></span>
            <span id="hud-date-str" class="text-[10px] text-cyan-400/90 font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-cyan-500/30" title="遊戲日曆與現實世界完全同步"></span>
          </div>
          <div class="text-xs text-slate-400 flex items-center gap-2">
            <span>CEO: <strong id="hud-ceo-name" class="text-amber-300"></strong></span>
            <button id="btn-hud-switch-user" class="text-[10px] text-cyan-400 hover:text-amber-300 underline font-sans cursor-pointer" title="切換玩家或建立新存檔">
              (不是你？點此登入)
            </button>
          </div>
        </div>
      </div>

      <!-- 中間：核心營運三大 KPI 與工廠負荷進度條 -->
      <div class="flex items-center gap-4 flex-shrink-0 whitespace-nowrap">
        <!-- 1. 現金 (點擊開啟日周月財報) -->
        <button id="btn-hud-cash" class="text-center group cursor-pointer hover:bg-slate-800/80 px-2.5 py-1 rounded-lg transition-colors border border-transparent hover:border-amber-500/40" title="點擊檢視日、周、月收支財報與毛利分析">
          <div class="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
            <span>廠房資金</span>
            <span class="text-[10px] text-amber-400">📊</span>
          </div>
          <div id="hud-cash-value" class="text-sm font-bold text-amber-400 font-mono tracking-tight group-hover:text-amber-300">
            NT$ 0
          </div>
        </button>

        <!-- 2. 商譽 -->
        <div class="text-center">
          <div class="text-[11px] text-slate-400 font-medium whitespace-nowrap">產業商譽</div>
          <div id="hud-pop-value" class="text-sm font-bold text-cyan-400 font-mono whitespace-nowrap">
            ★ 0
          </div>
        </div>

        <!-- 3. 滾動良率指數 (RollingYieldIndex) - 未生產時凍結顯示 -->
        <button id="btn-hud-yield" class="text-center relative group cursor-pointer hover:bg-slate-800/80 px-2 py-1 rounded-lg transition-colors border border-transparent hover:border-cyan-500/30" title="點擊檢視 25 晶粒蒙地卡羅良率晶圓圖 (Wafer Map)">
          <div class="text-[11px] text-slate-400 font-medium flex items-center gap-1 justify-center whitespace-nowrap">
            <span>品質良率</span>
            <span class="text-[10px] text-cyan-400">🔍</span>
          </div>
          <div class="flex items-center gap-1 justify-center">
            <span id="hud-yield-value" class="text-sm font-bold font-mono whitespace-nowrap">N/A</span>
            <span id="hud-yield-sub" class="text-[10px] whitespace-nowrap text-amber-400/90 font-medium">(待命暫停)</span>
          </div>
        </button>

        <!-- 4. 工廠負荷量 Workload % 與 🔴 紅色警報驚嘆號 -->
        <div class="flex items-center gap-2">
          <div>
            <div class="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
              <span>產線負荷</span>
              <span id="hud-workload-pct" class="font-mono text-slate-200">0%</span>
            </div>
            <div class="w-20 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
              <div id="hud-workload-bar" style="width: 0%; background-color: #10b981;" class="h-full transition-all duration-300"></div>
            </div>
          </div>

          <button id="btn-advisory-alert" class="hidden w-7 h-7 rounded-full bg-red-600/90 text-white font-black text-xs flex items-center justify-center border-2 border-red-400 pulse-alert shadow-lg cursor-pointer hover:bg-red-500 flex-shrink-0" title="產線超載嚴重！點擊查看瓶頸診斷">
            !
          </button>
        </div>
      </div>

      <!-- 右側：5 大核心按鈕 + ☰ 更多 ▾ 下拉式選單 -->
      <div class="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
        <!-- 1. 合約板 (最常用) -->
        <button id="btn-contracts" class="btn-sci-fi text-xs font-bold py-1.5 px-3 bg-gradient-to-r from-amber-600/30 to-amber-700/30 hover:from-amber-600/50 hover:to-amber-700/50 border-amber-500/50 text-amber-200 hover:text-white shadow-sm" title="開啟晶圓代工合約公告板">
          📜 合約
        </button>

        <!-- 2. 商城 (機台與 AMHS 運送設備) -->
        <button id="btn-store" class="btn-sci-fi text-xs font-bold py-1.5 px-3" title="開啟機台採購與廠務運送 (AMHS) 商城">
          🏬 商城
        </button>

        <!-- 3. 科技樹研發突破 (次世代機台解鎖) -->
        <button id="btn-techtree" class="btn-sci-fi relative text-xs font-bold py-1.5 px-3 bg-cyan-950/50 border-cyan-500/60 text-cyan-300 hover:text-white" title="檢視半導體製程科技樹">
          <span id="hud-tech-label">🔬 研發</span>
          <span id="hud-tech-badge" class="hidden absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-900"></span>
        </button>

        <!-- 4. 廠房規劃 (黃光區劃設與機台搬移) -->
        <button id="btn-planner" class="btn-sci-fi text-xs font-bold py-1.5 px-3 bg-amber-950/40 border-amber-500/50 text-amber-300 hover:text-white" title="規劃機台擺放與劃設黃光微影專區">
          🏗️ 規劃
        </button>

        <!-- 5. 財報 (日周月收支分析) -->
        <button id="btn-finance" class="btn-sci-fi text-xs font-bold py-1.5 px-3 bg-cyan-950/40 border-cyan-500/50 text-cyan-300 hover:text-white" title="開啟日、周、月收支財務分析">
          📊 財報
        </button>

        <!-- 6. ☰ 更多 ▾ 下拉式選單 (加寬至 w-80、加大字體、防止每秒刷新關閉) -->
        <div class="relative inline-block">
          <button id="btn-top-more" class="btn-sci-fi text-xs sm:text-sm font-bold py-1.5 px-3.5 bg-slate-800/90 hover:bg-slate-700 border-slate-600 text-slate-200 hover:text-white flex items-center gap-2 cursor-pointer relative shadow-sm" title="更多系統與管理功能">
            <span>☰ 更多</span>
            <span class="text-xs text-slate-400">▾</span>
            <span id="hud-more-badge" class="hidden absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-slate-900 animate-pulse"></span>
          </button>

          <!-- 下拉浮動面板 (大字體、寬裕排版、消除閃退動畫) -->
          <div id="top-dropdown-menu" class="hidden absolute right-0 mt-2 w-80 rounded-2xl glass-panel bg-slate-950/98 border border-slate-700/90 shadow-2xl py-2 z-50 text-sm text-slate-200 backdrop-blur-2xl">
            <!-- 選單標題 -->
            <div class="px-4 py-2.5 mb-1.5 border-b border-slate-800 flex items-center justify-between">
              <span class="text-xs font-bold text-slate-400 tracking-wider">系統與營運管理</span>
              <span class="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">控制中心</span>
            </div>

            <!-- 人資 -->
            <button id="menu-item-hr" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span class="text-lg">👥</span>
                <span class="text-sm">人資管理 (HR)</span>
              </span>
              <span id="dropdown-staff-count" class="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">0 人</span>
            </button>

            <!-- 每日任務 -->
            <button id="menu-item-quests" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span class="text-lg">📋</span>
                <span class="text-sm">每日任務 (Quests)</span>
              </span>
              <span id="dropdown-quests-badge"></span>
            </button>

            <!-- 成就 -->
            <button id="menu-item-achievements" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span class="text-lg">🏆</span>
                <span class="text-sm">產業成就 (Achievements)</span>
              </span>
              <span id="dropdown-achievements-badge"></span>
            </button>

            <!-- MES 自動派工開關 -->
            <button id="menu-item-toggle-mes" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span class="text-lg">🤖</span>
                <span class="text-sm">MES 自動派工</span>
              </span>
              <span id="dropdown-mes-status" class="text-xs font-bold font-mono px-2 py-0.5 rounded">⚪ 已停用</span>
            </button>

            <div class="h-px bg-slate-800/80 my-1.5 mx-3"></div>

            <!-- 切換玩家存檔 -->
            <button id="menu-item-switch-user" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span class="text-lg">👤</span>
                <span class="text-sm">切換玩家帳號 (Who are you?)</span>
              </span>
              <span class="text-xs text-slate-400 font-mono">存檔</span>
            </button>

            <!-- 存檔與備份 -->
            <button id="menu-item-save" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span class="text-lg">💾</span>
                <span class="text-sm">存檔與備份 (Save & JSON)</span>
              </span>
              <span class="text-xs text-slate-400 font-mono">備份</span>
            </button>

            <!-- 晶圓製程教學導引 -->
            <button id="menu-item-tutorial" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span class="text-lg">❓</span>
                <span class="text-sm">晶圓製程教學導引</span>
              </span>
              <span class="text-xs text-cyan-400/80 font-mono">教學</span>
            </button>

            <!-- 音效開關 -->
            <button id="menu-item-sound" class="w-full px-4 py-2.5 text-left hover:bg-slate-800/90 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold text-slate-200 group-hover:text-white">
                <span id="dropdown-sound-icon" class="text-lg">🔊</span>
                <span class="text-sm">遊戲音效開關</span>
              </span>
              <span id="dropdown-sound-text" class="text-xs text-slate-400 font-mono">開啟</span>
            </button>

            <div class="h-px bg-red-900/40 my-1.5 mx-3"></div>

            <!-- 整機重置 -->
            <button id="menu-item-factory-reset" class="w-full px-4 py-2.5 text-left hover:bg-red-950/70 text-red-400 hover:text-red-300 rounded-xl flex items-center justify-between transition-colors cursor-pointer group mx-auto">
              <span class="flex items-center gap-3 font-semibold">
                <span class="text-lg">💥</span>
                <span class="text-sm">整機資料重置 (Factory Reset)</span>
              </span>
              <span class="text-[11px] font-mono text-red-400/80 bg-red-950/50 px-1.5 py-0.5 rounded border border-red-800/50">危險</span>
            </button>
          </div>
        </div>
      </div>
    `}bindEvents(){var e,t,s,a,n,r,i,o,l,d,p,c,m,u,h,f,g,y,T,E;(e=document.getElementById("btn-contracts"))==null||e.addEventListener("click",v=>{v.stopPropagation(),this.closeDropdown(),x.playClick(),this.callbacks.onOpenContracts()}),(t=document.getElementById("btn-store"))==null||t.addEventListener("click",v=>{v.stopPropagation(),this.closeDropdown(),x.playClick(),this.callbacks.onOpenStore()}),(s=document.getElementById("btn-techtree"))==null||s.addEventListener("click",v=>{var b,k;v.stopPropagation(),this.closeDropdown(),x.playClick(),(k=(b=this.callbacks).onOpenTechTree)==null||k.call(b)}),(a=document.getElementById("btn-planner"))==null||a.addEventListener("click",v=>{var b,k;v.stopPropagation(),this.closeDropdown(),x.playClick(),(k=(b=this.callbacks).onOpenPlanner)==null||k.call(b)}),(n=document.getElementById("btn-finance"))==null||n.addEventListener("click",v=>{var b,k;v.stopPropagation(),this.closeDropdown(),x.playClick(),(k=(b=this.callbacks).onOpenFinance)==null||k.call(b)}),(r=document.getElementById("btn-hud-cash"))==null||r.addEventListener("click",v=>{var b,k;v.stopPropagation(),this.closeDropdown(),x.playClick(),(k=(b=this.callbacks).onOpenFinance)==null||k.call(b)}),(i=document.getElementById("btn-hud-yield"))==null||i.addEventListener("click",v=>{var b,k;v.stopPropagation(),this.closeDropdown(),x.playClick(),(k=(b=this.callbacks).onOpenWaferMap)==null||k.call(b)}),(o=document.getElementById("btn-advisory-alert"))==null||o.addEventListener("click",v=>{v.stopPropagation(),this.closeDropdown(),x.playClick(),this.callbacks.onOpenAdvisory()}),(l=document.getElementById("btn-hud-profile-avatar"))==null||l.addEventListener("click",v=>{var b,k;v.stopPropagation(),this.closeDropdown(),x.playClick(),(k=(b=this.callbacks).onOpenLogin)==null||k.call(b)}),(d=document.getElementById("btn-hud-switch-user"))==null||d.addEventListener("click",v=>{var b,k;v.stopPropagation(),this.closeDropdown(),x.playClick(),(k=(b=this.callbacks).onOpenLogin)==null||k.call(b)}),(p=document.getElementById("btn-top-more"))==null||p.addEventListener("click",v=>{v.stopPropagation(),x.playClick(),this.toggleDropdown()}),(c=document.getElementById("menu-item-hr"))==null||c.addEventListener("click",v=>{v.stopPropagation(),this.closeDropdown(),x.playClick(),this.callbacks.onOpenHR()}),(m=document.getElementById("menu-item-quests"))==null||m.addEventListener("click",v=>{v.stopPropagation(),this.closeDropdown(),x.playClick(),this.callbacks.onOpenQuests()}),(u=document.getElementById("menu-item-achievements"))==null||u.addEventListener("click",v=>{v.stopPropagation(),this.closeDropdown(),x.playClick(),this.callbacks.onOpenAchievements()}),(h=document.getElementById("menu-item-toggle-mes"))==null||h.addEventListener("click",v=>{if(v.stopPropagation(),x.playClick(),!this.currentState)return;const b=!this.currentState.unlockedFeatures.mesAutoDispatch;this.currentState.unlockedFeatures.mesAutoDispatch=b,this.callbacks.onToggleMES(b),this.updateValues(this.currentState)}),(f=document.getElementById("menu-item-switch-user"))==null||f.addEventListener("click",v=>{var b,k;v.stopPropagation(),this.closeDropdown(),x.playClick(),(k=(b=this.callbacks).onOpenLogin)==null||k.call(b)}),(g=document.getElementById("menu-item-save"))==null||g.addEventListener("click",v=>{v.stopPropagation(),this.closeDropdown(),x.playClick(),this.callbacks.onOpenSaveModal()}),(y=document.getElementById("menu-item-tutorial"))==null||y.addEventListener("click",v=>{var b,k;v.stopPropagation(),this.closeDropdown(),x.playClick(),(k=(b=this.callbacks).onOpenTutorial)==null||k.call(b)}),(T=document.getElementById("menu-item-sound"))==null||T.addEventListener("click",v=>{v.stopPropagation(),x.toggleMute(),x.playClick(),this.currentState&&this.updateValues(this.currentState)}),(E=document.getElementById("menu-item-factory-reset"))==null||E.addEventListener("click",v=>{var b,k;v.stopPropagation(),this.closeDropdown(),x.playClick(),(k=(b=this.callbacks).onOpenFactoryReset)==null||k.call(b)})}updateValues(e){var ce;const t=e.player,s=e.unlockedFeatures.cmp,a=document.getElementById("hud-company-name");a&&(a.textContent=t.companyName);const n=document.getElementById("hud-foundry-tier");n&&(n.textContent=`Tier ${t.foundryTier}`);const r=((ce=e.financialState)==null?void 0:ce.currentDateStr)||$.getTodayDateString(),i=["日","一","二","三","四","五","六"][new Date().getDay()],o=document.getElementById("hud-date-str");o&&(o.textContent=`📅 ${r} (週${i})`);const l=document.getElementById("hud-ceo-name");l&&(l.textContent=t.ceoName);const d=document.getElementById("hud-cash-value");d&&(d.textContent=`NT$ ${Math.round(t.cash).toLocaleString()}`);const p=document.getElementById("hud-pop-value");p&&(p.textContent=`★ ${t.popularity}`);const c=e.activeLots.some(F=>F.status==="PROCESSING")||e.machines.some(F=>F.status==="PROCESSING"),m=e.rollingYieldHistory.length>0?e.rollingYieldHistory.slice(-5).reduce((F,me)=>F+me,0)/Math.min(5,e.rollingYieldHistory.length):null,u=A.calculateTrustMultiplier(m),h=document.getElementById("hud-yield-value"),f=document.getElementById("hud-yield-sub");h&&(h.textContent=m!==null?`${(m*100).toFixed(1)}%`:"N/A",h.className=`text-sm font-bold font-mono whitespace-nowrap ${c?m&&m>=.9?"text-emerald-400":"text-amber-400":"text-slate-400"}`),f&&(f.textContent=c?`(${u.toFixed(2)}x)`:"(待命暫停)",f.className=`text-[10px] ${c?"text-slate-400 font-normal":"text-amber-400/90 font-medium"}`);const g=P.calculateFactoryWorkload(e.machines,e.staff,e.activeLots,e.unlockedFeatures,s);let y="#10b981";g.workloadPercent>85?y="#ef4444":g.workloadPercent>=70&&(y="#f59e0b");const T=document.getElementById("hud-workload-pct");T&&(T.textContent=`${g.workloadPercent}%`);const E=document.getElementById("hud-workload-bar");E&&(E.style.width=`${Math.min(100,g.workloadPercent)}%`,E.style.backgroundColor=y);const v=document.getElementById("btn-advisory-alert");v&&(g.workloadPercent>85?v.classList.remove("hidden"):v.classList.add("hidden"));const b=R.getProgressionStatus(e),k=document.getElementById("hud-tech-label");k&&(k.textContent=`🔬 研發 (T${t.foundryTier})`);const D=document.getElementById("btn-techtree"),O=document.getElementById("hud-tech-badge");O&&(b.canAdvance?(O.classList.remove("hidden"),D==null||D.classList.add("border-emerald-400","text-emerald-300","ring-2","ring-emerald-500/40","animate-pulse")):(O.classList.add("hidden"),D==null||D.classList.remove("border-emerald-400","text-emerald-300","ring-2","ring-emerald-500/40","animate-pulse")));const S=e.questState.dailyQuests.some(F=>F.completed&&!F.claimed),L=e.achievements.some(F=>F.unlocked&&!F.claimed),_=S||L,Y=x.isAudioMuted(),G=document.getElementById("hud-more-badge");G&&(_?G.classList.remove("hidden"):G.classList.add("hidden"));const z=document.getElementById("dropdown-staff-count");z&&(z.textContent=`${e.staff.length} 人`);const re=document.getElementById("dropdown-quests-badge");re&&(re.innerHTML=S?'<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs border border-amber-500/30">待領取</span>':"");const oe=document.getElementById("dropdown-achievements-badge");oe&&(oe.innerHTML=L?'<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30">可解鎖</span>':"");const ae=document.getElementById("dropdown-mes-status");ae&&(ae.textContent=e.unlockedFeatures.mesAutoDispatch?"🟢 已開啟":"⚪ 已停用",ae.className=`text-xs font-bold font-mono px-2 py-0.5 rounded ${e.unlockedFeatures.mesAutoDispatch?"bg-emerald-950 text-emerald-300 border border-emerald-500/40":"bg-slate-900 text-slate-400 border border-slate-700"}`);const le=document.getElementById("dropdown-sound-icon");le&&(le.textContent=Y?"🔇":"🔊");const de=document.getElementById("dropdown-sound-text");de&&(de.textContent=Y?"靜音":"開啟")}}class ne{static show(e,t){const s=document.getElementById("modal-container");if(!s)return;let a="avatar_1";const n=()=>{var r,i,o;s.innerHTML=`
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
                    value="${e.player.companyName}"
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
                    value="${e.player.ceoName}"
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
      `,(r=document.getElementById("btn-random-company"))==null||r.addEventListener("click",()=>{x.playClick();const l=this.RANDOM_COMPANIES[Math.floor(Math.random()*this.RANDOM_COMPANIES.length)],d=document.getElementById("setup-company-name");d&&(d.value=l)}),(i=document.getElementById("btn-random-ceo"))==null||i.addEventListener("click",()=>{x.playClick();const l=this.RANDOM_CEOS[Math.floor(Math.random()*this.RANDOM_CEOS.length)],d=document.getElementById("setup-ceo-name");d&&(d.value=l)}),document.querySelectorAll(".avatar-card").forEach(l=>{l.addEventListener("click",d=>{x.playClick();const p=d.currentTarget.getAttribute("data-avatar-id");p&&(a=p,n())})}),(o=document.getElementById("btn-submit-foundry"))==null||o.addEventListener("click",()=>{const l=document.getElementById("setup-company-name"),d=document.getElementById("setup-ceo-name"),p=(l==null?void 0:l.value.trim())||"矽島先進積體電路",c=(d==null?void 0:d.value.trim())||"張創辦人";e.player.companyName=p,e.player.ceoName=c,e.player.avatarId=a,x.playSuccess(),s.innerHTML="",t(e.player)})};n()}}w(ne,"RANDOM_COMPANIES",["矽島先進積體電路","台積微系統","聯華微電科技","世界微晶圓","美光矽島半導體","瑞昱微系統","聯詠積體科技","旺宏微晶科技"]),w(ne,"RANDOM_CEOS",["張忠謨","劉德音","魏哲家","曹興成","黃仁勳","蘇姿丰","蔡力行","梁孟松"]);class be{static show(e,t,s){var m,u,h,f,g;const a=document.getElementById("modal-container");if(!a)return;const n=e.unlockedFeatures.cmp,r=P.diagnoseBottleneck(e.machines,e.staff,e.activeLots,e.unlockedFeatures,n),{workloadPercent:i,throughputs:o}=P.calculateFactoryWorkload(e.machines,e.staff,e.activeLots,e.unlockedFeatures,n);let l="bg-red-950 text-red-400 border-red-500/50",d="⚠️";r.category==="MAINTENANCE"?(l="bg-amber-950 text-amber-400 border-amber-500/50",d="🔧"):r.category==="LOGISTICS"?(l="bg-cyan-950 text-cyan-400 border-cyan-500/50",d="🚛"):r.category==="LAYOUT"&&(l="bg-purple-950 text-purple-400 border-purple-500/50",d="📐");const p=y=>{y.key==="Escape"&&(a.innerHTML="",window.removeEventListener("keydown",p))};window.addEventListener("keydown",p);const c=()=>{x.playClick(),a.innerHTML="",window.removeEventListener("keydown",p)};a.innerHTML=`
      <div id="modal-backdrop-advisory" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-2xl text-slate-100 flex flex-col max-h-[88vh]">
          <!-- 頂部標題與關閉鈕 -->
          <div class="modal-header flex items-center justify-between pb-3 border-b border-slate-700/60 flex-shrink-0">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${d}</span>
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
                ${Object.values(o).map(y=>`
                  <div class="p-2 rounded-lg bg-slate-900/60 border ${y.isChokePoint?"border-red-500/80 bg-red-950/20":"border-slate-800"} text-center">
                    <div class="text-[11px] font-bold ${y.isChokePoint?"text-red-400":"text-slate-300"}">
                      ${y.station} ${y.isChokePoint?"⚠️":""}
                    </div>
                    <div class="text-xs font-mono font-bold text-slate-100 mt-1">
                      ${Math.round(y.totalCapacity)} 片/分
                    </div>
                    <div class="text-[10px] text-slate-400">
                      ${y.machineCount} 台設備
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
              ${r.category==="CAPACITY"&&t?`<button id="btn-advisory-store" class="btn-sci-fi bg-cyan-600 hover:bg-cyan-500 font-bold px-3 py-1.5 text-xs">
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
    `,(m=document.getElementById("btn-close-advisory"))==null||m.addEventListener("click",c),(u=document.getElementById("btn-advisory-ok"))==null||u.addEventListener("click",c),(h=document.getElementById("modal-backdrop-advisory"))==null||h.addEventListener("click",y=>{y.target===y.currentTarget&&c()}),(f=document.getElementById("btn-advisory-store"))==null||f.addEventListener("click",()=>{c(),t&&t()}),(g=document.getElementById("btn-advisory-hr"))==null||g.addEventListener("click",()=>{c(),s&&s()})}}class W{static refreshDailyQuests(e,t,s,a){if(e.lastDateStr===a&&e.dailyQuests.length===3)return e;const n=t.foundryTier,r=[0,6e4,18e4,45e4,12e5,35e5,12e6][n]??6e4,i=[],o=n===1?5:n===2?15:n===3?30:n===4?60:100;i.push({id:`quest_produce_${a}`,title:"穩定投片交付產出",description:`完成出貨累計 ${o} 片合格晶圓至客戶端。`,tier:n,currentValue:0,targetValue:o,rewardCash:r,rewardPopularity:3,completed:!1,claimed:!1}),n>=3&&s.cmp?i.push({id:`quest_cmp_operation_${a}`,title:"平坦化製程精進",description:"成功執行 5 次 CMP 化學機械平坦化拋光研磨。",tier:n,currentValue:0,targetValue:5,rewardCash:Math.round(r*1.2),rewardPopularity:4,completed:!1,claimed:!1}):i.push({id:`quest_maintain_fab_${a}`,title:"廠務設備巡檢維護",description:"指派工程師對機台進行保養或維持機台健康度在 90% 以上。",tier:n,currentValue:0,targetValue:2,rewardCash:r,rewardPopularity:3,completed:!1,claimed:!1});const l=n<=2?2:3;return i.push({id:`quest_order_fulfill_${a}`,title:"光罩合約履約達成",description:`順利交貨並履約 ${l} 筆晶圓製造合約，取得全額尾款。`,tier:n,currentValue:0,targetValue:l,rewardCash:Math.round(r*1.5),rewardPopularity:5,completed:!1,claimed:!1}),{lastDateStr:a,dailyQuests:i,allDailyClaimed:!1,weeklyCompletedCount:e.weeklyCompletedCount??0,weeklyTarget:15,weeklyClaimed:e.weeklyClaimed??!1}}static onWaferDelivered(e,t){for(const s of e.dailyQuests)s.id.startsWith("quest_produce")&&!s.completed&&(s.currentValue+=t,s.currentValue>=s.targetValue&&(s.currentValue=s.targetValue,s.completed=!0))}static onOrderFulfilled(e){for(const t of e.dailyQuests)t.id.startsWith("quest_order_fulfill")&&!t.completed&&(t.currentValue+=1,t.currentValue>=t.targetValue&&(t.currentValue=t.targetValue,t.completed=!0))}static onMachineMaintained(e){for(const t of e.dailyQuests)t.id.startsWith("quest_maintain_fab")&&!t.completed&&(t.currentValue+=1,t.currentValue>=t.targetValue&&(t.currentValue=t.targetValue,t.completed=!0))}static onCmpProcessed(e){for(const t of e.dailyQuests)t.id.startsWith("quest_cmp_operation")&&!t.completed&&(t.currentValue+=1,t.currentValue>=t.targetValue&&(t.currentValue=t.targetValue,t.completed=!0))}static isAllDailyCompleted(e){return e.dailyQuests.length!==3?!1:e.dailyQuests.every(t=>t.completed)}static claimSingleQuest(e,t){const s=e.dailyQuests.find(a=>a.id===t);return s?s.completed?s.claimed?{success:!1,cash:0,popularity:0,message:"該任務獎勵已領取"}:(s.claimed=!0,{success:!0,cash:s.rewardCash,popularity:s.rewardPopularity,message:`領取成功！獲得獎勵金 NT$ ${s.rewardCash.toLocaleString()} 與商譽 +${s.rewardPopularity}！`}):{success:!1,cash:0,popularity:0,message:"該任務尚未達成目標"}:{success:!1,cash:0,popularity:0,message:"找不到該任務"}}static claimDailyAllClear(e,t){if(!this.isAllDailyCompleted(e))return{success:!1,cash:0,popularity:0,message:"尚有每日任務未完成，無法領取全勤特獎"};if(e.allDailyClaimed)return{success:!1,cash:0,popularity:0,message:"今日全勤特獎已經領取過囉"};e.allDailyClaimed=!0,e.weeklyCompletedCount=Math.min(21,(e.weeklyCompletedCount??0)+3);const s=[0,15e4,45e4,12e5,3e6,8e6,25e6][t]??15e4,a=10;return{success:!0,cash:s,popularity:a,message:`🎉 達成今日 3/3 全勤！獲得全勤特獎 NT$ ${s.toLocaleString()}、商譽 +${a}，每週任務進度累計 +3！`}}static claimWeeklyBounty(e,t){if(e.weeklyCompletedCount<e.weeklyTarget)return{success:!1,cash:0,popularity:0,message:`每週任務尚未達標！目前進度 ${e.weeklyCompletedCount}/${e.weeklyTarget}`};if(e.weeklyClaimed)return{success:!1,cash:0,popularity:0,message:"本週龍頭週大獎已領取過囉"};e.weeklyClaimed=!0;const s=[0,1e6,3e6,8e6,2e7,6e7,2e8][t]??1e6,a=30;return{success:!0,cash:s,popularity:a,message:`🏆 榮膺半導體龍頭週大獎！領取巨額扶持金 NT$ ${s.toLocaleString()} 與商譽 +${a}！全廠客戶信任度提升！`}}}class ge{static show(e,t){const s=document.getElementById("modal-container");if(!s)return;const a=()=>{var l,d,p,c,m;const n=e.questState,r=W.isAllDailyCompleted(n);s.innerHTML=`
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
                      Tier ${e.player.foundryTier} 專屬適配
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
                    ${n.dailyQuests.filter(u=>u.completed).length}/3 已達成
                  </span>
                </div>

                ${n.dailyQuests.map(u=>{const h=Math.min(100,Math.round(u.currentValue/u.targetValue*100));return`
                      <div class="p-3.5 rounded-xl bg-slate-900/70 border ${u.completed?"border-emerald-500/50 bg-emerald-950/20":"border-slate-800"} flex items-center justify-between gap-4">
                        <div class="flex-1">
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-bold text-slate-100">${u.title}</span>
                            ${u.completed?'<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300">已達成</span>':""}
                          </div>
                          <p class="text-xs text-slate-400 mt-0.5">${u.description}</p>
                          
                          <!-- 進度條 -->
                          <div class="flex items-center gap-2 mt-2">
                            <div class="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div style="width: ${h}%" class="h-full bg-cyan-400"></div>
                            </div>
                            <span class="text-[11px] font-mono text-slate-300">${u.currentValue}/${u.targetValue}</span>
                          </div>
                        </div>

                        <!-- 獎勵與按鈕 -->
                        <div class="text-right flex flex-col items-end gap-1.5 min-w-[120px]">
                          <div class="text-xs font-bold font-mono text-amber-400">
                            +NT$ ${u.rewardCash.toLocaleString()}
                          </div>
                          <div class="text-[10px] text-cyan-300">
                            商譽 +${u.rewardPopularity}
                          </div>

                          ${u.claimed?'<span class="text-xs px-3 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">已領取</span>':u.completed?`<button class="btn-claim-quest btn-sci-fi bg-emerald-600 hover:bg-emerald-500 text-xs py-1 px-3" data-id="${u.id}">
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
      `;const i=()=>{x.playClick(),s.innerHTML="",window.removeEventListener("keydown",o)},o=u=>{u.key==="Escape"&&i()};window.addEventListener("keydown",o),(l=document.getElementById("btn-close-quests"))==null||l.addEventListener("click",i),(d=document.getElementById("btn-back-quests"))==null||d.addEventListener("click",i),(p=document.getElementById("modal-backdrop-quest"))==null||p.addEventListener("click",u=>{u.target===document.getElementById("modal-backdrop-quest")&&i()}),document.querySelectorAll(".btn-claim-quest").forEach(u=>{u.addEventListener("click",h=>{const f=h.currentTarget.getAttribute("data-id");if(f){const g=W.claimSingleQuest(e.questState,f);g.success&&(e.player.cash+=g.cash,$.recordSubsidy(e,g.cash),e.player.popularity+=g.popularity,x.playCoin(),a(),t())}})}),(c=document.getElementById("btn-claim-all-daily"))==null||c.addEventListener("click",()=>{const u=W.claimDailyAllClear(e.questState,e.player.foundryTier);u.success&&(e.player.cash+=u.cash,$.recordSubsidy(e,u.cash),e.player.popularity+=u.popularity,x.playSuccess(),a(),t())}),(m=document.getElementById("btn-claim-weekly"))==null||m.addEventListener("click",()=>{const u=W.claimWeeklyBounty(e.questState,e.player.foundryTier);u.success&&(e.player.cash+=u.cash,$.recordSubsidy(e,u.cash),e.player.popularity+=u.popularity,x.playSuccess(),a(),t())})};a()}}class pe{static show(e,t){const s=document.getElementById("modal-container");if(!s)return;N.checkAchievements(e);const a=i=>{i.key==="Escape"&&(s.innerHTML="",window.removeEventListener("keydown",a))};window.addEventListener("keydown",a);const n=()=>{x.playClick(),s.innerHTML="",window.removeEventListener("keydown",a)},r=()=>{var p,c,m;const i=e.achievements,o=i.filter(u=>u.category===this.activeCategory),l=i.filter(u=>u.unlocked).length,d=[{key:"onboarding",label:"新手入門",icon:"🚀"},{key:"process",label:"製程突破",icon:"🔬"},{key:"operation",label:"廠務卓越",icon:"🛡️"},{key:"yield",label:"品質良率",icon:"💎"}];s.innerHTML=`
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
                ${d.map(u=>`
                  <button
                    class="btn-tab px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${this.activeCategory===u.key?"bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400":"bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"}"
                    data-cat="${u.key}"
                  >
                    <span>${u.icon}</span>
                    <span>${u.label}</span>
                    <span class="text-[10px] font-mono opacity-80">
                      (${i.filter(h=>h.category===u.key&&h.unlocked).length}/${i.filter(h=>h.category===u.key).length})
                    </span>
                  </button>
                `).join("")}
              </div>

              <!-- 成就清單 -->
              <div class="space-y-3">
                ${o.map(u=>`
                  <div class="p-4 rounded-xl bg-slate-900/70 border ${u.unlocked?"border-cyan-500/50 bg-cyan-950/20 shadow-md shadow-cyan-500/10":"border-slate-800/80 opacity-65"} flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3.5">
                      <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl border ${u.unlocked?"bg-cyan-950/80 border-cyan-400/60 shadow-inner":"bg-slate-800/60 border-slate-700 text-slate-600"}">
                        ${u.unlocked?"🎖️":"🔒"}
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-bold ${u.unlocked?"text-slate-100":"text-slate-400"}">
                            ${u.title}
                          </span>
                          ${u.unlocked?'<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">已達成</span>':""}
                        </div>
                        <p class="text-xs text-slate-400 mt-1">${u.description}</p>
                      </div>
                    </div>

                    <!-- 獎勵金與領取按鈕 -->
                    <div class="text-right flex flex-col items-end gap-1.5 min-w-[130px]">
                      <div class="text-xs font-bold font-mono text-amber-400">
                        +NT$ ${u.rewardCash.toLocaleString()}
                      </div>
                      ${u.claimed?'<span class="text-xs px-3 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">獎勵已領</span>':u.unlocked?`<button class="btn-claim-ach btn-sci-fi bg-emerald-600 hover:bg-emerald-500 text-xs py-1 px-3 font-bold" data-id="${u.id}">
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
      `,(p=document.getElementById("btn-close-achievements"))==null||p.addEventListener("click",n),(c=document.getElementById("btn-return-achievements"))==null||c.addEventListener("click",n),(m=document.getElementById("modal-backdrop-achievements"))==null||m.addEventListener("click",u=>{u.target===u.currentTarget&&n()}),document.querySelectorAll(".btn-tab").forEach(u=>{u.addEventListener("click",h=>{x.playClick();const f=h.currentTarget.getAttribute("data-cat");f&&(this.activeCategory=f,r())})}),document.querySelectorAll(".btn-claim-ach").forEach(u=>{u.addEventListener("click",h=>{const f=h.currentTarget.getAttribute("data-id");if(f){const g=N.claimReward(e.achievements,f);g.success&&(e.player.cash+=g.cash,$.recordSubsidy(e,g.cash),x.playCoin(),r(),t())}})})};r()}}w(pe,"activeCategory","onboarding");class X{static calculateRollingYieldIndex(e){if(!e||e.length===0)return null;const t=e.slice(-5),a=t.reduce((n,r)=>n+r,0)/t.length;return Number(a.toFixed(4))}static calculateLayerYield(e=1,t=0,s=0){let a=.985*e*(1-t)+s;return Math.max(.7,Math.min(.999,a))}static calculateFinalLotYield(e,t=0){if(e.status==="SCRAPPED")return 0;let s=1;for(let a=0;a<e.totalLayers;a++)s*=this.calculateLayerYield(1,t,0);return s*=e.yieldMultiplier||1,Number(Math.max(0,Math.min(1,s)).toFixed(4))}static calculateLotYield(e,t,s){if(e.hasYellowRoomViolation||e.yieldMultiplier===0)return 0;const a=Math.max(1,e.totalLayers||(s?s.layerCount:6));let n=.988;const r=t.player.unlockedCleanroomClass;r==="Class 1000"?n=.992:r==="Class 100"?n=.995:r==="Class 10"?n=.997:r==="Class 1"?n=.9985:r==="ISO 1"&&(n=.9992);const i=t.machines.filter(y=>y.status!=="EXPLODED");let o=0;i.length>0&&(o=i.reduce((y,T)=>y+T.wear,0)/i.length);const l=o/100*.06;let d=0;const p=t.staff.filter(y=>y.workShift!=="OFF");for(const y of p)y.fatigue>=80?d-=.015:y.rank==="Young Specialist"?d+=.005:y.rank==="Skilled Worker"?d+=.01:y.rank==="Senior Engineer"?d+=.018:y.rank==="Fellow"&&(d+=.025);d=Math.max(-.05,Math.min(.06,d));let c=0;const m=t.machines.find(y=>y.category==="LITHO"&&y.status!=="EXPLODED");if(m){const y=m.assignedEngineerId?t.staff.find(E=>E.id===m.assignedEngineerId):null,{effectiveK1:T}=B.calculateEffectiveK1(t.unlockedFeatures.cmp?"CAR":"BASE",m.wear,y);c=B.getProcessWindowPenalty(T)}const u=Math.max(.95,n-l/a);let f=Math.pow(u,Math.min(12,a))+d-c;e.yieldMultiplier<.99&&e.yieldMultiplier>0&&(f*=e.yieldMultiplier);const g=(Math.random()-.5)*.024;return f+=g,Number(Math.max(.65,Math.min(.978,f)).toFixed(3))}static generateWaferMap(e){const t=[],n=Math.sqrt(8);for(let r=0;r<5;r++)for(let i=0;i<5;i++){const o=r*5+i,l=Math.sqrt((r-2)**2+(i-2)**2),d=l/n,p=1.1-d*.4,c=Math.min(.99,e*p),m=Math.random()<c;t.push({index:o,row:r,col:i,distanceFromCenter:Number(l.toFixed(2)),passed:m,defectType:m?void 0:d>.6?"OPTICAL_DEFOCUS":"PARTICLE"})}for(let r=0;r<t.length;r++)if(!t[r].passed&&Math.random()<.4){const i=t.filter(o=>Math.abs(o.row-t[r].row)<=1&&Math.abs(o.col-t[r].col)<=1&&o.index!==t[r].index);if(i.length>0){const o=i[Math.floor(Math.random()*i.length)];o.passed=!1,o.defectType="CLUSTER"}}return t}}class K{static show(e,t,s){var i;const a=document.getElementById("modal-container");if(!a)return;this.currentLot=t||(e.activeLots.length>0?e.activeLots[0]:null);const n=!!((i=this.currentLot)!=null&&i.hasYellowRoomViolation),r=n?0:this.currentLot?this.currentLot.yieldMultiplier:e.rollingYieldHistory.length>0?e.rollingYieldHistory.reduce((o,l)=>o+l,0)/e.rollingYieldHistory.length:.92;if(n||r===0){this.dies=X.generateWaferMap(0);for(const o of this.dies)o.passed=!1,o.defectType="CLUSTER"}else this.dies=X.generateWaferMap(r);this.selectedDie=this.dies[12]||this.dies[0],this.render(a,e,s)}static render(e,t,s){var m,u;const a=this.dies.filter(h=>h.passed).length,n=this.dies.length-a,r=(a/this.dies.length*100).toFixed(1),i=this.dies.filter(h=>h.defectType==="CLUSTER").length,o=this.dies.filter(h=>h.defectType==="PARTICLE").length,l=this.dies.filter(h=>h.defectType==="OPTICAL_DEFOCUS").length,d=t.activeLots.some(h=>h.status==="PROCESSING")||t.machines.some(h=>h.status==="PROCESSING"),p=t.rollingYieldHistory.slice(-5),c=p.length>0?(p.reduce((h,f)=>h+f,0)/p.length*100).toFixed(1)+"%":"N/A";e.innerHTML=`
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
                  ${this.dies.map(h=>{var T;const f=((T=this.selectedDie)==null?void 0:T.index)===h.index;let g="bg-emerald-500 hover:bg-emerald-400 border-emerald-300/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]",y="✓";return h.passed||(h.defectType==="CLUSTER"?(g="bg-red-600 hover:bg-red-500 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.7)]",y="✕"):h.defectType==="OPTICAL_DEFOCUS"?(g="bg-amber-500 hover:bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]",y="⚠"):(g="bg-purple-600 hover:bg-purple-500 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]",y="●")),`
                      <button
                        class="btn-wafer-die rounded-md border text-xs font-bold text-white transition-all transform hover:scale-110 flex items-center justify-center font-mono ${g} ${f?"ring-2 ring-white scale-105":""}"
                        data-index="${h.index}"
                        title="Die [${h.row}, ${h.col}] - ${h.passed?"合格":"失效: "+h.defectType}"
                      >
                        ${y}
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

              <!-- Yellow Room Violation Alert Banner -->
              ${(m=this.currentLot)!=null&&m.hasYellowRoomViolation||Number(r)===0?`
                <div class="p-3.5 rounded-xl bg-red-950/70 border border-red-500/80 text-red-200 flex items-start gap-3 animate-pulse shadow-lg shadow-red-950/50">
                  <span class="text-2xl">🚨</span>
                  <div>
                    <div class="font-bold text-red-300 text-xs flex items-center gap-1.5">
                      <span>致命白光曝光污染！全批報廢 (良率 0%)</span>
                    </div>
                    <div class="text-[10px] text-red-200/90 leading-relaxed mt-0.5">
                      本批晶圓於無黃光防護之微影/塗膠設備加工，受無塵室環境可見光曝曬，感光光阻全面失效，所有晶粒均無法正確圖案化！請使用「🏗️ 廠房規劃」劃設黃光區或搬移機台。
                    </div>
                  </div>
                </div>
              `:""}
              
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
                  <div class="text-xl font-bold ${d?"text-cyan-300":"text-slate-400"}">
                    ${c}
                  </div>
                  <div class="text-[10px] ${d?"text-slate-400":"text-amber-400/90"} mt-0.5 font-sans">
                    ${d?"5 批次滑動窗口":"⏸️ 產線待命中 (良率暫停)"}
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
                        ${(u=this.currentLot)!=null&&u.hasYellowRoomViolation?"【致命白光曝曬污染】微影設備未設置於黃光專區，環境可見光破壞感光光阻化學鍵，全片晶粒完全報廢！":this.selectedDie.defectType==="CLUSTER"?"【區域群聚缺陷】微影光阻殘留或化學腐蝕液擴散，波及相鄰相連晶粒！":this.selectedDie.defectType==="OPTICAL_DEFOCUS"?"【邊緣聚焦離焦】晶圓邊緣物理翹曲與數值孔徑 NA 聚焦裕度不足導致線寬失真！":"【微影落塵污染】無塵室空氣中微粒穿透光阻，導致金屬互連斷路！"}
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
    `,this.bindEvents(e,t,s)}static bindEvents(e,t,s){var r,i,o,l;const a=()=>{x.playClick(),e.innerHTML="",window.removeEventListener("keydown",n)},n=d=>{d.key==="Escape"&&a()};window.addEventListener("keydown",n),(r=document.getElementById("btn-close-wafer-map"))==null||r.addEventListener("click",a),(i=document.getElementById("btn-back-wafer"))==null||i.addEventListener("click",a),(o=document.getElementById("modal-backdrop-wafer"))==null||o.addEventListener("click",d=>{d.target===document.getElementById("modal-backdrop-wafer")&&a()}),e.querySelectorAll(".btn-wafer-die").forEach(d=>{d.addEventListener("click",p=>{x.playClick();const c=parseInt(p.currentTarget.getAttribute("data-index")||"0",10);this.selectedDie=this.dies.find(m=>m.index===c)||null,this.render(e,t,s)})}),(l=document.getElementById("btn-resim-wafer"))==null||l.addEventListener("click",()=>{x.playClick();const d=this.currentLot?this.currentLot.yieldMultiplier:t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((p,c)=>p+c,0)/t.rollingYieldHistory.length:.92;this.dies=X.generateWaferMap(d),this.selectedDie=this.dies[12]||this.dies[0],this.render(e,t,s)})}}w(K,"dies",[]),w(K,"selectedDie",null),w(K,"currentLot",null);class Z{static show(e,t,s){const a=document.getElementById("modal-container");a&&(this.currentOrder=t,t.layerAllocations&&t.layerAllocations.length===t.layerCount?this.localAllocations=JSON.parse(JSON.stringify(t.layerAllocations)):this.localAllocations=P.autoFillBestEconomyAllocation(t,e.machines),this.render(a,e,s))}static render(e,t,s){if(!this.currentOrder)return;const a=this.currentOrder,n=t.machines.filter(d=>d.category==="LITHO"),r=new Map(t.staff.map(d=>[d.id,d])),i=new Map;for(const d of n){const p=d.assignedEngineerId?r.get(d.assignedEngineerId):null,c=B.calculateEffectiveCD(d.modelId,t.player.unlockedK1,d.wear,p);i.set(d.modelId,c)}let o=!1;for(const d of this.localAllocations)if((i.get(d.assignedMachineModelId)??99999)>d.targetCD){o=!0;break}const l=a.nodeNm>=1e3?`${a.nodeNm/1e3} µm`:`${a.nodeNm} nm`;e.innerHTML=`
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
            ${this.localAllocations.map(d=>{const p=i.get(d.assignedMachineModelId)??99999,c=p>d.targetCD,m=d.layerIndex<=3;return`
                <div class="p-3 rounded-xl bg-slate-900/80 border ${c?"border-red-500/60 bg-red-950/20":"border-slate-800 hover:border-slate-700"} flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all">
                  
                  <!-- 左側：層級資訊 -->
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${m?"bg-amber-950/80 border border-amber-500/40 text-amber-300":"bg-slate-800 text-slate-300"}">
                      L${d.layerIndex}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-xs text-white">${d.layerType}</span>
                        ${m?'<span class="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">關鍵層</span>':'<span class="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400">導線層</span>'}
                      </div>
                      <div class="text-[11px] font-mono text-slate-400">
                        目標線寬需求: <span class="text-cyan-300 font-bold">${d.targetCD} nm</span>
                      </div>
                    </div>
                  </div>

                  <!-- 中間：機台指派下拉選單 -->
                  <div class="flex-1 max-w-sm">
                    <select data-layer="${d.layerIndex}" class="sel-layer-machine w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                      ${n.map(u=>{const h=i.get(u.modelId)??9999,f=u.modelId===d.assignedMachineModelId;return`
                          <option value="${u.modelId}" ${f?"selected":""}>
                            ${u.name} (實時CD: ${h}nm | 磨損: ${Math.round(u.wear)}%)
                          </option>
                        `}).join("")}
                    </select>
                  </div>

                  <!-- 右側：Rayleigh 解析度檢核徽章 -->
                  <div class="min-w-[140px] text-right">
                    ${c?`
                      <div class="text-xs font-bold text-red-400 flex items-center md:justify-end gap-1">
                        <span>⚠️</span>
                        <span>解析度不足！</span>
                      </div>
                      <div class="text-[10px] text-red-300/80 font-mono">
                        機台CD ${p}nm > 需求 ${d.targetCD}nm
                      </div>
                    `:`
                      <div class="text-xs font-bold text-emerald-400 flex items-center md:justify-end gap-1">
                        <span>✅</span>
                        <span>光學合規</span>
                      </div>
                      <div class="text-[10px] text-slate-400 font-mono">
                        安全裕度: +${d.targetCD-p} nm
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
    `,this.bindEvents(e,t,s)}static bindEvents(e,t,s){var i,o,l,d,p;const a=()=>{x.playClick(),e.innerHTML="",window.removeEventListener("keydown",n)},n=c=>{c.key==="Escape"&&a()};window.addEventListener("keydown",n),(i=document.getElementById("btn-close-layer-modal"))==null||i.addEventListener("click",a),(o=document.getElementById("btn-cancel-layer-alloc"))==null||o.addEventListener("click",a),(l=document.getElementById("modal-backdrop-layer"))==null||l.addEventListener("click",c=>{c.target===document.getElementById("modal-backdrop-layer")&&a()}),e.querySelectorAll(".sel-layer-machine").forEach(c=>{c.addEventListener("change",m=>{const u=m.target,h=Number(u.dataset.layer),f=u.value,g=this.localAllocations.find(y=>y.layerIndex===h);g&&(g.assignedMachineModelId=f,x.playClick(),this.render(e,t,s))})}),(d=document.getElementById("btn-auto-fill-alloc"))==null||d.addEventListener("click",()=>{this.currentOrder&&(x.playCoinChime(),this.localAllocations=P.autoFillBestEconomyAllocation(this.currentOrder,t.machines),this.render(e,t,s))}),(p=document.getElementById("btn-save-layer-alloc"))==null||p.addEventListener("click",()=>{this.currentOrder&&(this.currentOrder.layerAllocations=JSON.parse(JSON.stringify(this.localAllocations)),x.playFanfare(),e.innerHTML="",s())})}}w(Z,"currentOrder",null),w(Z,"localAllocations",[]);class ee{static show(e,t){const s=document.getElementById("modal-container");s&&(A.ensureMarketOrders(e),this.render(s,e,t))}static render(e,t,s){const a=t.marketOrders||[],n=t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((l,d)=>l+d,0)/t.rollingYieldHistory.length:null,r=A.calculateTrustMultiplier(n),i=this.getBestLithoCD(t),o=A.getMarketRefreshCost(t.player.foundryTier);e.innerHTML=`
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
                    Tier ${t.player.foundryTier}
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
                <div class="text-sm font-mono font-bold ${r>=1?"text-emerald-400":"text-amber-400"}">
                  ${r.toFixed(2)}x
                  <span class="text-[10px] text-slate-400">(${n!==null?(n*100).toFixed(1)+"%":"N/A"})</span>
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
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">${a.length}</span>
            </button>
            <button id="tab-active" class="px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 ${this.currentTab==="ACTIVE"?"border-cyan-400 text-cyan-300":"border-transparent text-slate-400 hover:text-slate-200"}">
              <span>⚡ 在製訂單與批次</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">${t.activeOrders.length}</span>
            </button>
            <div class="ml-auto py-1.5 flex items-center">
              ${this.currentTab==="MARKET"?`
                <button id="btn-refresh-market" class="btn-sci-fi text-xs py-1.5 px-3 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/60 text-amber-300 font-bold flex items-center gap-1.5 shadow-sm cursor-pointer" title="派遣商業獵單顧問重新招攬合約池 (費用: NT$ ${o.toLocaleString()})">
                  <span>🔄 商業獵單刷新</span>
                  <span class="font-mono text-amber-200">(NT$ ${o.toLocaleString()})</span>
                </button>
              `:""}
            </div>
          </div>

          <!-- Body -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4">
            ${this.currentTab==="MARKET"?this.renderMarketOrders(t,i):this.renderActiveOrders(t)}
          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
            <button id="btn-back-contract" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `,this.bindEvents(e,t,s)}static renderMarketOrders(e,t){const s=e.marketOrders||[],a=s.length>=A.MAX_MARKET_ORDERS,n=e.nextOrderRespawnTime?Math.max(0,Math.ceil((e.nextOrderRespawnTime-Date.now())/1e3)):0;let r="";return a||(r=`
        <div id="contract-respawn-banner" class="mb-4 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex items-center justify-between text-xs text-slate-300 shadow-md">
          <div class="flex items-center gap-2.5">
            <span class="text-base animate-spin">⏳</span>
            <div>
              <span class="font-bold text-cyan-300">新客戶合約洽談中</span>
              <span class="text-slate-400 ml-1.5">(合約池: ${s.length}/${A.MAX_MARKET_ORDERS} 筆，每筆訂單冷卻 60 秒陸續送達)</span>
            </div>
          </div>
          <div class="font-mono font-bold text-amber-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
            下一筆合約抵達：<span id="contract-respawn-timer" class="text-amber-300 text-sm font-black">${n}</span> 秒
          </div>
        </div>
      `),s.length===0?`
        ${r}
        <div class="text-center py-12 text-slate-400 space-y-3">
          <div class="text-5xl mb-2 animate-bounce">📭</div>
          <p class="text-base font-bold text-slate-200">目前合約公告板已全數接單完畢！</p>
          <p class="text-xs text-slate-400">
            新客戶合約將在冷卻倒數結束後自動送達，或可點擊右上角【商業獵單刷新】即刻引進 5 筆全新合約。
          </p>
        </div>
      `:`
      ${r}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${s.map((i,o)=>{const l=t<=i.nodeNm,d=i.nodeNm>=1e3?`${i.nodeNm/1e3} µm`:`${i.nodeNm} nm`;let p='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">常規件 (1.0x)</span>';i.urgencyMultiplier===1.2?p='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">🟡 急件 (1.2x)</span>':i.urgencyMultiplier>=1.5&&(p='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">🔴 SHR 超急件 (1.5x)</span>');const c=i.nrePaid+i.totalDies*i.unitPrice;return`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${l?"border-slate-800 hover:border-cyan-500/40":"border-red-900/40 bg-red-950/10"} transition-all flex flex-col justify-between space-y-3">
              <!-- Card Header -->
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">${i.clientName}</span>
                    ${p}
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5 font-mono">
                    合約編號: ${i.id}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold font-mono text-cyan-300">${d}</div>
                  <div class="text-[10px] text-slate-400">${i.layerCount} 道光罩層</div>
                </div>
              </div>

              <!-- Card Specs -->
              <div class="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <div class="text-[10px] text-slate-400">總晶粒需求</div>
                  <div class="font-mono font-semibold text-slate-200">${i.totalDies.toLocaleString()} 顆</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">出貨單價</div>
                  <div class="font-mono font-semibold text-emerald-400">NT$ ${i.unitPrice.toFixed(2)} /顆</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">💰 接單即付 NRE</div>
                  <div class="font-mono font-bold text-amber-300">+NT$ ${i.nrePaid.toLocaleString()}</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">預估合約總值</div>
                  <div class="font-mono font-semibold text-cyan-300">~NT$ ${Math.round(c).toLocaleString()}</div>
                </div>
              </div>

              <!-- Delivery Duration & Market Expiration Countdown -->
              <div class="flex items-center justify-between text-[11px] p-2 rounded bg-slate-950/40 border border-slate-800/60">
                <div class="flex items-center gap-1 text-slate-400" title="簽約接單後承諾之總生產交付時間">
                  <span>⏱️ 交付時限:</span>
                  <span class="font-mono text-cyan-300 font-semibold">${A.getAllowedDurationSec(i)} 遊戲秒</span>
                </div>
                <div class="flex items-center gap-1" title="客戶等待報價有效時間，逾時將轉向其他代工廠並刷新更換">
                  <span class="text-slate-400">⏳ 報價時效:</span>
                  <span class="market-order-timer font-mono font-bold ${Math.max(0,Math.ceil(((i.marketExpiresAt||Date.now()+6e4)-Date.now())/1e3))<=15?"text-red-400 animate-pulse":"text-amber-400"}" data-order-id="${i.id}">
                    ${Math.max(0,Math.ceil(((i.marketExpiresAt||Date.now()+6e4)-Date.now())/1e3))} 秒
                  </span>
                </div>
              </div>

              <!-- Litho CD warning if incapable -->
              ${l?"":`
                <div class="p-2 rounded bg-red-900/20 border border-red-700/30 text-[11px] text-red-300 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>廠內機台極限 CD (${t===999999?"無微影機":t+"nm"}) 無法滿足 ${d} 製程需求！</span>
                </div>
              `}

              <!-- Action Button -->
              <button
                class="btn-accept-order btn-sci-fi w-full justify-center ${l?"":"opacity-50 cursor-not-allowed"}"
                data-index="${o}"
                ${l?"":"disabled"}
              >
                ✍️ 簽約接單 (即刻領取 NT$ ${i.nrePaid.toLocaleString()})
              </button>
            </div>
          `}).join("")}
      </div>
    `}static renderActiveOrders(e){return e.activeOrders.length===0?`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">⚙️</div>
          <p class="text-sm">目前產線無在製訂單，請前往「承接市場訂單池」簽約接單！</p>
        </div>
      `:`
      <div class="space-y-4">
        ${e.activeOrders.map(t=>{var i;const s=Math.max(0,t.deadlineGameTime-e.gameTime),a=s===0,n=e.activeLots.filter(o=>o.orderId===t.id),r=Math.min(100,Math.round(t.goodDiesDelivered/t.totalDies*100));return`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${a?"border-red-600/50":"border-slate-800"} space-y-3">
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white">${t.clientName}</span>
                    <span class="text-xs font-mono text-cyan-300">
                      [${t.nodeNm>=1e3?t.nodeNm/1e3+"µm":t.nodeNm+"nm"}]
                    </span>
                    ${a?'<span class="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold animate-pulse">逾期追討中</span>':""}
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5 font-mono">
                    合約編號: ${t.id} | 光罩層數: ${t.layerCount} 層
                  </div>
                </div>

                <div class="text-right">
                  <div class="text-xs ${a?"text-red-400 font-bold":"text-slate-400"}">
                    ${a?"已過期 (違約罰金累積中)":`剩餘交期: ${s} 秒`}
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">
                    出貨單價: NT$ ${t.unitPrice.toFixed(2)} /顆
                  </div>
                </div>
              </div>

              <!-- Progress Bar -->
              <div>
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-slate-400">出貨進度</span>
                  <span class="font-mono text-cyan-300">${t.goodDiesDelivered.toLocaleString()} / ${t.totalDies.toLocaleString()} 顆 (${r}%)</span>
                </div>
                <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <div class="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300" style="width: ${r}%"></div>
                </div>
              </div>

              <!-- Lots in Production -->
              <div>
                <div class="text-xs text-slate-400 font-semibold mb-2">在製批次 (Wafer Lots) 狀態：</div>
                ${n.length===0?`
                  <div class="text-xs text-slate-400 italic">尚無加工批次投入</div>
                `:`
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${n.map(o=>{let l=`<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">${o.currentStation}</span>`;o.currentStation==="LIT"?l=`<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">微影 (${o.litSubStep||"COAT"})</span>`:o.status==="COMPLETED"&&(l='<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">已完工</span>');const d=e.machines.find(m=>m.status==="EXPLODED"?!1:o.currentStation==="LIT"?o.litSubStep==="COAT"||o.litSubStep==="DEVELOP"?m.category==="TRACK":m.category==="LITHO":m.category===o.currentStation),p=d?d.name:"自動分配中";let c="";if(o.qTimeDeadline!==null){const m=Math.max(0,o.qTimeDeadline-e.gameTime);c=`<span class="text-[10px] font-mono ${m<10?"text-red-400 animate-pulse":"text-amber-400"}">⏳ Q-Time: ${m}s</span>`}return`
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
                            ${c}
                          </div>
                        </div>
                      `}).join("")}
                  </div>
                `}
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between gap-2 pt-1">
                <div>
                  ${t.layerCount>1?`
                    <button class="btn-layer-allocation btn-sci-fi text-xs py-1 px-3 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 flex items-center gap-1.5 cursor-pointer" data-order-id="${t.id}" title="自訂先進製程多層微影機台分配">
                      <span>🎛️</span>
                      <span>微影分層配方 (${((i=t.layerAllocations)==null?void 0:i.length)||t.layerCount}層)</span>
                    </button>
                  `:""}
                </div>

                <div class="flex items-center gap-2">
                  ${n.length===0||n.every(o=>o.status==="COMPLETED")?`
                    <button class="btn-settle-order btn-sci-fi text-xs py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 cursor-pointer" data-order-id="${t.id}">
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
    `}static bindEvents(e,t,s){var r,i,o,l,d,p;const a=()=>{this.countdownIntervalId!==null&&(clearInterval(this.countdownIntervalId),this.countdownIntervalId=null),x.playClick(),e.innerHTML="",window.removeEventListener("keydown",n)},n=c=>{c.key==="Escape"&&a()};window.addEventListener("keydown",n),(r=document.getElementById("btn-close-contract"))==null||r.addEventListener("click",a),(i=document.getElementById("btn-back-contract"))==null||i.addEventListener("click",a),(o=document.getElementById("modal-backdrop-contract"))==null||o.addEventListener("click",c=>{c.target===document.getElementById("modal-backdrop-contract")&&a()}),(l=document.getElementById("tab-market"))==null||l.addEventListener("click",()=>{x.playClick(),this.currentTab="MARKET",this.render(e,t,s)}),(d=document.getElementById("tab-active"))==null||d.addEventListener("click",()=>{x.playClick(),this.currentTab="ACTIVE",this.render(e,t,s)}),(p=document.getElementById("btn-refresh-market"))==null||p.addEventListener("click",()=>{const c=A.getMarketRefreshCost(t.player.foundryTier);if(t.player.cash<c){x.playClick(),alert(`❌ 廠房資金不足！派遣商業獵單顧問需要 NT$ ${c.toLocaleString()}，目前現金僅有 NT$ ${Math.round(t.player.cash).toLocaleString()}`);return}confirm(`【商業獵單刷新確認】

您確定要支付 NT$ ${c.toLocaleString()} 聘請半導體商業獵單顧問，為合約板重新引入 5 筆全新客戶合約嗎？`)&&(t.player.cash-=c,$.recordOpEx(t,"商業獵單顧問費",c),A.forceRefreshAllMarketOrders(t),M.saveToLocalStorage(t),x.playCoin(),this.render(e,t,s),s())}),this.countdownIntervalId!==null&&clearInterval(this.countdownIntervalId),this.countdownIntervalId=window.setInterval(()=>{if(this.currentTab==="MARKET"){const c=(t.marketOrders||[]).length,m=A.checkOrderReplenishment(t),u=A.checkMarketOrdersExpiry(t),h=(t.marketOrders||[]).length;if(m||u||c!==h){M.saveToLocalStorage(t),this.render(e,t,s);return}const f=document.getElementById("contract-respawn-timer");if(f){const g=t.nextOrderRespawnTime?Math.max(0,Math.ceil((t.nextOrderRespawnTime-Date.now())/1e3)):0;f.textContent=`${g}`}e.querySelectorAll(".market-order-timer").forEach(g=>{var E;const y=g.getAttribute("data-order-id"),T=(E=t.marketOrders)==null?void 0:E.find(v=>v.id===y);if(T&&T.marketExpiresAt){const v=Math.max(0,Math.ceil((T.marketExpiresAt-Date.now())/1e3));g.textContent=`${v} 秒`,v<=15?g.className="market-order-timer font-mono font-bold text-red-400 animate-pulse":g.className="market-order-timer font-mono font-bold text-amber-400"}})}},1e3),e.querySelectorAll(".btn-accept-order").forEach(c=>{c.addEventListener("click",m=>{const u=parseInt(m.currentTarget.getAttribute("data-index")||"0",10),h=t.marketOrders||[],f=h[u];if(!f)return;x.playCoinChime(),t.player.cash+=f.nrePaid,$.recordNREFee(t,f.nrePaid);const g=A.getAllowedDurationSec(f);f.allowedDurationSec=g,f.deadlineGameTime=t.gameTime+g,t.activeOrders.push(f);const y=Math.max(1,Math.min(3,Math.ceil(f.totalDies/1e3))),T=X.calculateLotYield({lotId:"",orderId:f.id,waferCount:25,currentStation:"FILM",currentLayer:1,totalLayers:f.layerCount,qTimeDeadline:null,yieldMultiplier:1,status:"PROCESSING"},t,f);for(let E=0;E<y;E++){const v={lotId:`LOT-${Date.now().toString(36).toUpperCase().slice(-4)}-${E+1}`,orderId:f.id,waferCount:Math.ceil(f.totalDies/y/(f.nodeNm>=1e3?500:2e3)),currentStation:"FILM",currentLayer:1,totalLayers:f.layerCount,qTimeDeadline:null,yieldMultiplier:T,status:"PROCESSING",stationProgressSeconds:0,stationRequiredSeconds:P.getStationRequiredSeconds("FILM")};t.activeLots.push(v)}h.splice(u,1),h.length<A.MAX_MARKET_ORDERS&&!t.nextOrderRespawnTime&&(t.nextOrderRespawnTime=Date.now()+A.ORDER_RESPAWN_COOLDOWN_MS),N.checkAchievements(t),M.saveToLocalStorage(t),s(),this.currentTab="ACTIVE",this.render(e,t,s)})}),e.querySelectorAll(".btn-settle-order").forEach(c=>{c.addEventListener("click",m=>{const u=m.currentTarget.getAttribute("data-order-id"),h=t.activeOrders.findIndex(v=>v.id===u);if(h===-1)return;const f=t.activeOrders[h],g=f.goodDiesDelivered>0?f.goodDiesDelivered:f.totalDies*.95,y=A.settleOrderPayout(f,g,t.player,t.staff,0,t.clawbackDebt);t.player.cash+=y.netPayout,$.recordWaferSales(t,y.netPayout),t.clawbackDebt=y.remainingDebt;const E=t.activeLots.filter(v=>v.orderId===f.id).reduce((v,b)=>v+(b.waferCount||25),0)||25;t.player.totalOrdersFulfilled=(t.player.totalOrdersFulfilled||0)+1,t.player.totalWafersDelivered=(t.player.totalWafersDelivered||0)+E,t.activeOrders.splice(h,1),t.activeLots=t.activeLots.filter(v=>v.orderId!==f.id),x.playFanfare(),N.checkAchievements(t),M.saveToLocalStorage(t),s(),this.render(e,t,s)})}),e.querySelectorAll(".btn-inspect-lot").forEach(c=>{c.addEventListener("click",m=>{const u=m.currentTarget.getAttribute("data-lot-id"),h=t.activeLots.find(f=>f.lotId===u);x.playClick(),K.show(t,h,()=>{this.render(e,t,s),s()})})}),e.querySelectorAll(".btn-layer-allocation").forEach(c=>{c.addEventListener("click",m=>{const u=m.currentTarget.getAttribute("data-order-id"),h=t.activeOrders.find(f=>f.id===u);h&&(x.playClick(),Z.show(t,h,()=>{this.render(e,t,s),s()}))})})}static getBestLithoCD(e){const t=e.machines.filter(a=>a.category==="LITHO"&&a.status!=="EXPLODED");if(t.length===0)return 999999;let s=999999;for(const a of t){const n=B.OPTICAL_CATALOG[a.modelId];n&&n.baseRayleighLimitNm<s&&(s=n.baseRayleighLimitNm)}return s}}w(ee,"currentTab","MARKET"),w(ee,"countdownIntervalId",null);class ie{static show(e,t){const s=document.getElementById("modal-container");if(!s)return;const a=e.player.foundryTier||1;this.selectedViewTier=Math.min(R.MAX_TIER,a+1),this.render(s,e,t)}static render(e,t,s){var o,l;const a=R.getProgressionStatus(t),n=R.getTierConfig(a.currentTier),r=this.selectedViewTier||Math.min(R.MAX_TIER,a.currentTier+1),i=R.getTierConfig(r);e.innerHTML=`
      <div id="modal-backdrop-techtree" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-5xl max-h-[92vh] flex flex-col text-slate-100 p-0 overflow-hidden animate-scaleUp">
          
          <!-- 1. Header -->
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex-shrink-0">
            <div class="flex items-center gap-3.5">
              <div class="w-11 h-11 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-inner text-cyan-300">
                🔬
              </div>
              <div>
                <div class="flex items-center gap-2.5">
                  <h3 class="text-base font-bold text-white tracking-wide">
                    半導體製程世代科技樹 (Technology Roadmap)
                  </h3>
                  <span class="px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-xs font-mono border border-cyan-500/40">
                    目前水準: Tier ${a.currentTier}
                  </span>
                </div>
                <p class="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>當前掌握：<strong class="text-amber-300">${n.name}</strong> (${n.subtitle})</span>
                  <span>|</span>
                  <span>廠房可用資金: <strong class="text-emerald-400 font-mono">NT$ ${Math.round(t.player.cash).toLocaleString()}</strong></span>
                </p>
              </div>
            </div>

            <button id="btn-close-techtree" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉科技樹">
              ✕
            </button>
          </div>

          <!-- 2. 六大半導體世代橫向演進路線圖 (Horizontal Roadmap) -->
          <div class="px-6 py-4 border-b border-slate-800/80 bg-slate-950/70 overflow-x-auto flex-shrink-0">
            <div class="flex items-center justify-between min-w-[720px] gap-2 relative">
              
              <!-- 串聯連線 -->
              <div class="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-slate-800 -z-0 rounded-full"></div>
              
              ${Array.from({length:R.MAX_TIER},(d,p)=>p+1).map(d=>{const p=R.getTierConfig(d),c=d<a.currentTier,m=d===a.currentTier,u=d===a.currentTier+1,h=d===r;let f="border-slate-700 bg-slate-900 text-slate-500",g="未解鎖",y="bg-slate-800 text-slate-500 border-slate-700";return c?(f="border-emerald-500/80 bg-emerald-950/60 text-emerald-400 shadow-lg shadow-emerald-950/50",g="已突破",y="bg-emerald-950/80 text-emerald-300 border-emerald-500/40"):m?(f="border-cyan-400 bg-cyan-950/80 text-cyan-300 ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-950/60",g="當前世代",y="bg-cyan-900/80 text-cyan-200 border-cyan-400/50"):u&&(f="border-amber-400/90 bg-amber-950/70 text-amber-300 ring-2 ring-amber-500/30 pulse-alert",g=`研發中 ${a.overallPct}%`,y="bg-amber-950/80 text-amber-300 border-amber-500/40"),`
                  <button
                    class="btn-tier-node z-10 flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer group ${h?"scale-105 bg-slate-800/80 ring-2 ring-cyan-400":"hover:bg-slate-900/50"}"
                    data-tier="${d}"
                    title="點擊檢視 Tier ${d} ${p.name} 詳細製程規格"
                  >
                    <div class="w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-mono font-bold text-sm transition-transform ${f} group-hover:scale-110">
                      ${c?"✓":`T${d}`}
                    </div>
                    <div class="text-center">
                      <div class="text-[11px] font-bold text-slate-200 truncate max-w-[105px]">${p.name.slice(0,7)}</div>
                      <span class="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono border ${y}">
                        ${g}
                      </span>
                    </div>
                  </button>
                `}).join("")}
            </div>
          </div>

          <!-- 3. 主內容區：檢視世代詳情 + 研發進度三大指標與注資 -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-6">

            <!-- 世代總覽標頭卡片 -->
            <div class="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/30 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    Tier ${i.tier} • ${i.eraCode}
                  </span>
                  ${i.tier===a.currentTier?'<span class="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">★ 現役工廠世代</span>':""}
                  ${i.tier===a.currentTier+1?'<span class="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">🎯 次世代微縮目標</span>':""}
                </div>
                <h4 class="text-lg font-bold text-white tracking-wide">
                  ${i.name} <span class="text-sm font-normal text-slate-400 font-sans">(${i.subtitle})</span>
                </h4>
                <p class="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  ${i.description}
                </p>
                <div class="mt-2 text-[11px] text-amber-300/90 flex items-start gap-1.5 bg-amber-950/20 p-2 rounded-lg border border-amber-500/20">
                  <span>💡</span>
                  <span><strong>物理科技史：</strong>${i.scienceHistory}</span>
                </div>
              </div>

              <!-- 關鍵參數摘要 -->
              <div class="flex md:flex-col gap-3 min-w-[180px] bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
                <div>
                  <span class="text-[10px] text-slate-400 block font-sans">極限線寬 (Min CD)</span>
                  <span class="text-sm font-bold text-cyan-400">${i.minCDNm>=1e3?(i.minCDNm/1e3).toFixed(1)+" µm":i.minCDNm+" nm"}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 block font-sans">要求潔淨室標準</span>
                  <span class="text-sm font-bold text-emerald-400">${i.unlockedCleanroomClass}</span>
                </div>
              </div>
            </div>

            <!-- 研發進度三大指標 (若檢視的是次世代目標) -->
            ${!a.isMaxTier&&i.tier===a.currentTier+1?`
              <div class="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/40 shadow-xl space-y-5">
                
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">🎯</span>
                    <h4 class="text-sm font-bold text-white tracking-wide">
                      次世代製程微縮突破條件 (研發完成度：<span class="text-amber-400 font-mono">${a.overallPct}%</span>)
                    </h4>
                  </div>
                  <span class="text-xs text-slate-400">
                    滿足下列三項代工實績與資本指標即可正式晉升！
                  </span>
                </div>

                <!-- 三大進度條 -->
                <div class="space-y-4">
                  <!-- 1. 訂單交付 -->
                  <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div class="flex justify-between items-center text-xs mb-1.5">
                      <span class="text-slate-300 flex items-center gap-1.5 font-medium">
                        <span>📜</span>
                        <span>代工訂單累積交付</span>
                        <span class="font-mono text-slate-400">(${a.ordersCompleted} / ${a.ordersTarget} 筆)</span>
                      </span>
                      <span class="font-mono font-bold ${a.ordersMet?"text-emerald-400":"text-amber-400"}">
                        ${a.ordersMet?"✅ 已達標":`還差 ${a.ordersTarget-a.ordersCompleted} 筆訂單`} (${a.ordersPct}%)
                      </span>
                    </div>
                    <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                      <div class="h-full transition-all duration-500 ${a.ordersMet?"bg-emerald-500":"bg-cyan-500"}" style="width: ${a.ordersPct}%;"></div>
                    </div>
                  </div>

                  <!-- 2. 晶圓產出總量 -->
                  <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div class="flex justify-between items-center text-xs mb-1.5">
                      <span class="text-slate-300 flex items-center gap-1.5 font-medium">
                        <span>💿</span>
                        <span>晶圓良品累積量產</span>
                        <span class="font-mono text-slate-400">(${a.wafersDelivered} / ${a.wafersTarget} 片)</span>
                      </span>
                      <span class="font-mono font-bold ${a.wafersMet?"text-emerald-400":"text-amber-400"}">
                        ${a.wafersMet?"✅ 已達標":`還差 ${a.wafersTarget-a.wafersDelivered} 片晶圓`} (${a.wafersPct}%)
                      </span>
                    </div>
                    <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                      <div class="h-full transition-all duration-500 ${a.wafersMet?"bg-emerald-500":"bg-cyan-500"}" style="width: ${a.wafersPct}%;"></div>
                    </div>
                  </div>

                  <!-- 3. 研發注資進度與操作按鈕 -->
                  <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                    <div class="flex justify-between items-center text-xs">
                      <span class="text-slate-300 flex items-center gap-1.5 font-medium">
                        <span>💰</span>
                        <span>次世代製程研發資金注資</span>
                        <span class="font-mono text-slate-400">(NT$ ${(a.fundsInvested/1e6).toFixed(1)}M / ${(a.fundsTarget/1e6).toFixed(1)}M)</span>
                      </span>
                      <span class="font-mono font-bold ${a.fundsMet?"text-emerald-400":"text-amber-400"}">
                        ${a.fundsMet?"✅ 研發資金已募足":`尚缺 NT$ ${(a.fundsTarget-a.fundsInvested).toLocaleString()}`} (${a.fundsPct}%)
                      </span>
                    </div>

                    <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                      <div class="h-full transition-all duration-500 ${a.fundsMet?"bg-emerald-500":"bg-amber-500"}" style="width: ${a.fundsPct}%;"></div>
                    </div>

                    <!-- 注資操作按鈕群 -->
                    ${a.fundsMet?`
                      <div class="text-xs text-emerald-400 font-medium flex items-center gap-1.5 pt-1">
                        <span>✨</span>
                        <span>該世代所有所需研發資金已 100% 注資到位！</span>
                      </div>
                    `:`
                      <div class="flex flex-wrap items-center gap-2 pt-1">
                        <span class="text-xs text-slate-400 font-medium">撥款注資研發：</span>
                        <button class="btn-invest-funds btn-sci-fi text-xs py-1 px-3 bg-amber-950/40 border-amber-500/40 text-amber-300 hover:text-white" data-amount="5000000" ${t.player.cash<5e6?"disabled":""}>
                          + NT$ 500 萬
                        </button>
                        <button class="btn-invest-funds btn-sci-fi text-xs py-1 px-3 bg-amber-950/40 border-amber-500/40 text-amber-300 hover:text-white" data-amount="20000000" ${t.player.cash<2e7?"disabled":""}>
                          + NT$ 2,000 萬
                        </button>
                        <button class="btn-invest-funds btn-sci-fi text-xs py-1 px-3 bg-amber-950/40 border-amber-500/40 text-amber-300 hover:text-white" data-amount="100000000" ${t.player.cash<1e8?"disabled":""}>
                          + NT$ 1 億
                        </button>
                        <button class="btn-invest-funds btn-sci-fi text-xs py-1 px-3 bg-emerald-950/50 border-emerald-500/50 text-emerald-300 hover:text-white ml-auto" data-amount="999999999999" ${t.player.cash<=0?"disabled":""}>
                          ⚡ 一鍵全額注資 (Max)
                        </button>
                      </div>
                    `}
                  </div>
                </div>

                <!-- 世代晉升大按鈕 -->
                <div class="pt-2">
                  <button
                    id="btn-advance-tier"
                    class="w-full py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl ${a.canAdvance?"bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white cursor-pointer border-2 border-emerald-300 ring-4 ring-emerald-500/30 pulse-alert":"bg-slate-800/80 text-slate-400 border border-slate-700/60 cursor-not-allowed"}"
                    ${a.canAdvance?"":"disabled"}
                  >
                    ${a.canAdvance?`🚀 達成三大研發條件！立即突破晉升【Tier ${(o=a.nextTierConfig)==null?void 0:o.tier} ${(l=a.nextTierConfig)==null?void 0:l.name}】！`:`🔒 尚未達成晉升條件 (完成度 ${a.overallPct}%)`}
                  </button>
                </div>

              </div>
            `:""}

            <!-- 攻頂祝賀卡片 (若已達 Tier 6) -->
            ${a.isMaxTier?`
              <div class="p-6 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-cyan-950/60 border-2 border-amber-400 text-center space-y-2 shadow-2xl">
                <div class="text-3xl">🏆</div>
                <h4 class="text-base font-bold text-amber-300">
                  榮登全球半導體霸權之巔！
                </h4>
                <p class="text-xs text-slate-300 max-w-xl mx-auto">
                  恭喜創辦人！您的晶圓廠已完全掌握 2nm 埃米 High-NA EUV 極致微影神技，傲視全球！請持續維持優良良率與滿載稼動，締造矽島不朽傳奇！
                </p>
              </div>
            `:""}

            <!-- 該世代解鎖機台與特色預覽 -->
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <h4 class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span>🔓</span>
                  <span>Tier ${i.tier} 專屬解鎖先進機台與製程特色</span>
                </h4>
                <span class="text-[11px] text-slate-400 font-mono">共 ${i.unlockedModelIds.length} 台次世代設備</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                ${i.unlockedModelIds.map(d=>{const p=j.STORE_CATALOG.find(c=>c.modelId===d);return p?`
                    <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition-colors">
                      <div class="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1 flex-shrink-0">
                        <img src="${p.assetPath}" alt="${p.name}" class="w-full h-full object-contain" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-bold text-white truncate">${p.name}</div>
                        <div class="text-[10px] text-slate-400 mt-0.5">${p.category} • 產能 ${p.throughputWpm} wpm</div>
                        <div class="text-xs font-mono font-bold text-amber-400 mt-1">NT$ ${p.price.toLocaleString()}</div>
                      </div>
                    </div>
                  `:""}).join("")}
              </div>
            </div>

          </div>

          <!-- 4. Footer -->
          <div class="modal-footer p-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between px-6 flex-shrink-0">
            <span class="text-xs text-slate-400">
              💡 達成訂單與生產目標，注資研發金，解鎖高階機台與高毛利大單！
            </span>
            <button id="btn-back-techtree" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `,this.bindEvents(e,t,s)}static bindEvents(e,t,s){const a=e.querySelector("#modal-backdrop-techtree"),n=e.querySelector("#btn-close-techtree"),r=e.querySelector("#btn-back-techtree"),i=()=>{x.playClick(),e.innerHTML="",s()};a==null||a.addEventListener("click",l=>{l.target===a&&i()}),n==null||n.addEventListener("click",i),r==null||r.addEventListener("click",i),e.querySelectorAll(".btn-tier-node").forEach(l=>{l.addEventListener("click",d=>{const p=Number(d.currentTarget.getAttribute("data-tier"));p>=1&&p<=R.MAX_TIER&&(x.playClick(),this.selectedViewTier=p,this.render(e,t,s))})}),e.querySelectorAll(".btn-invest-funds").forEach(l=>{l.addEventListener("click",d=>{const p=Number(d.currentTarget.getAttribute("data-amount"));R.investRDCapital(t,p).success?x.playDing():x.playAlarm(),s(),this.render(e,t,s)})});const o=e.querySelector("#btn-advance-tier");o==null||o.addEventListener("click",()=>{const l=R.advanceFoundryTier(t);l.success?(x.playFanfare(),this.selectedViewTier=Math.min(R.MAX_TIER,l.newTier+1),s(),this.render(e,t,s)):(x.playAlarm(),alert(l.message))})}}w(ie,"selectedViewTier",null);class j{static show(e,t){const s=document.getElementById("modal-container");s&&this.render(s,e,t)}static render(e,t,s){const a=[{key:"LITHO",label:"LITHO 微影機",icon:"🔦"},{key:"TRACK",label:"TRACK 塗膠顯影 (瓶頸)",icon:"🌀"},{key:"FILM",label:"FILM 薄膜成長",icon:"✨"},{key:"ETCH",label:"ETCH 蝕刻製程",icon:"⚡"},{key:"DIFF",label:"DIFF 擴散植入",icon:"🎯"},{key:"CMP",label:"CMP 平坦研磨",icon:"💿"},{key:"AMHS",label:"AMHS 運送設備",icon:"🚚"},{key:"FLEET",label:"廠內現役機台 ("+t.machines.length+")",icon:"🏭"}];e.innerHTML=`
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
                    目前資金: NT$ ${Math.round(t.player.cash).toLocaleString()}
                  </span>
                </h3>
                <p class="text-xs text-slate-400">
                  購置先進製程設備，並聯 Track 消除微影瓶頸，升級天軌天車與無人自走車 (AMHS)！
                </p>
              </div>
            </div>

            <button id="btn-close-store" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉商城">
              ✕
            </button>
          </div>

          <!-- Category Nav Tabs -->
          <div class="flex border-b border-slate-700/60 bg-slate-900/40 px-6 pt-2 overflow-x-auto gap-1 flex-shrink-0">
            ${a.map(n=>{const r=this.activeCategory===n.key,i=n.key==="CMP"&&!t.unlockedFeatures.cmp;return`
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
            ${this.activeCategory==="FLEET"?this.renderFleetTab(t):this.activeCategory==="AMHS"?this.renderAMHSTab(t):this.renderCatalogTab(t)}
          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
            <button id="btn-back-store" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `,this.bindEvents(e,t,s)}static renderAMHSTab(e){return`
      <div class="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-600/30 text-xs text-cyan-200 flex items-start gap-2.5 mb-4">
        <span class="text-xl">🚚</span>
        <div>
          <span class="font-bold text-white text-sm">AMHS (Automated Material Handling System) 廠務自動化搬運體系</span>
          <p class="text-slate-300 text-[11px] mt-0.5">
            晶圓搬運載具從【人工手動】升級為【地面 AGV 自走車】與【空中 OHT 天軌天車】，能大幅消除無塵室人員落塵、減少震動並大幅提升跨站點交接吞吐速度！
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${[{feature:"manual",name:"人工卡匣徒步搬運 (Manual Handling)",tier:1,price:0,speed:"1.0 格/秒",assetPath:I.characters.tech_cleanroom.path,isPurchased:!0,isUnlocked:!0,canAfford:!0,description:"無塵衣技術員手持晶圓盒穿梭各站手動交接。搬運速度慢，人員走動產生微塵，交接等待時間較長。",scienceNote:"半導體萌芽期仰賴人員手動搬運卡匣，每小時人員走動產生之微塵顆粒達數萬顆，對良率是巨大隱憂。",benefits:["基礎徒步搬運","無設備採購支出"]},{feature:"agv",name:"AGV 磁導激光無人自走車 (Automated Guided Vehicle)",tier:1,price:8e6,speed:"2.5 格/秒",assetPath:I.characters.agv_carrier.path,isPurchased:!!e.unlockedFeatures.agv,isUnlocked:e.player.foundryTier>=1,canAfford:e.player.cash>=8e6,description:"地面自主導航輪式無人載具，依循地面雷射激光自主穿梭於各站機台之間。自動對位上下料，大幅降低人員進出無塵室落塵。",scienceNote:"AGV 採用光學雷達 (LiDAR) 與磁帶導引，實現無塵室地面自動化運輸，有效平滑各站排隊緩衝並消弭交接震動。",benefits:["解鎖地面無人自走車自主巡航","消弭人工搬運落塵提升良率","達成自動化物料搬運 AMHS 里程碑"]},{feature:"oht",name:"OHT 高速天軌懸吊天車 (Overhead Hoist Transport)",tier:2,price:35e6,speed:"5.0 格/秒",assetPath:I.characters.oht_shuttle.path,isPurchased:!!e.unlockedFeatures.oht,isUnlocked:e.player.foundryTier>=2,canAfford:e.player.cash>=35e6,description:"天花板立體閉迴路天軌懸吊天車系統，晶圓 FOUP 完全在空中高速飛行傳送。徹底解耦地面人車交通，是現代晶圓廠的核心骨幹！",scienceNote:"現代 300mm 超級晶圓廠的神經中樞。透過空中立體懸吊軌道直接降下垂直機械爪 (Hoist) 對位 Load Port，站點傳送時間縮短 70%！",benefits:["解鎖天花板空中天軌高速巡航","站間交接時間縮短 70%","徹底消除地面交織塞車瓶頸"]},{feature:"shrOht",name:"SHR 超急件綠波磁浮天車 (Super Hot Run OHT)",tier:4,price:12e7,speed:"8.0 格/秒",assetPath:I.characters.oht_shuttle.path,isPurchased:!!e.unlockedFeatures.shrOht,isUnlocked:e.player.foundryTier>=4,canAfford:e.player.cash>=12e7,description:"旗艦級超急件動態調度系統！改裝超導磁浮提速馬達，天車空中巡航提速 2.5 倍，並在天軌享有超急件綠波路權 (翠綠色科技特效)！",scienceNote:"Super Hot Run (SHR) 為晶圓代工廠為戰略客戶特批之綠波急件協議，所有天軌道岔與機台排程優先強占，極速交件！",benefits:["天車飛行速度大幅激增 2.5 倍","空中天車呈現綠波磁浮特效 (Emerald Glow)","大幅壓制 Q-Time 逾期報廢風險"]}].map(s=>`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${s.isPurchased?"border-emerald-500/50 bg-emerald-950/10":s.isUnlocked?"border-slate-800 hover:border-amber-500/40":"border-slate-800/40 opacity-70"} transition-all flex flex-col justify-between space-y-3">
              <div class="flex items-start gap-3">
                <div class="store-thumb-box machine-card-thumb w-16 h-16 rounded-lg bg-slate-950 border ${s.isPurchased?"border-emerald-500/40 shadow-inner shadow-emerald-500/20":"border-slate-800"} flex-shrink-0 flex items-center justify-center p-1 overflow-hidden relative">
                  <img src="${s.assetPath}" alt="${s.name}" class="w-full h-full object-contain filter drop-shadow" style="max-width: 56px; max-height: 56px; ${s.feature==="shrOht"&&s.isPurchased?"filter: drop-shadow(0 0 8px #10b981);":""}" />
                  ${s.isPurchased?'<span class="absolute top-1 right-1 text-[10px] bg-emerald-500 text-slate-950 font-black rounded px-1">ACTIVE</span>':""}
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <h4 class="font-bold text-white text-sm truncate">${s.name}</h4>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono ${s.isUnlocked?"bg-cyan-500/20 text-cyan-300":"bg-slate-800 text-slate-400"}">
                      Tier ${s.tier}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-400 mt-1 line-clamp-2">
                    ${s.description}
                  </div>
                </div>
              </div>

              <!-- Specs -->
              <div class="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <div class="text-[10px] text-slate-400">搬運速度</div>
                  <div class="font-mono font-bold text-cyan-300">${s.speed}</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">升級費用</div>
                  <div class="font-mono font-bold ${s.price===0?"text-emerald-400":"text-amber-300"}">
                    ${s.price===0?"初始標準配備":`NT$ ${s.price.toLocaleString()}`}
                  </div>
                </div>
                <div class="col-span-2 pt-1 border-t border-slate-800/60 text-[11px] text-slate-300 space-y-0.5">
                  ${s.benefits.map(a=>`<div class="flex items-center gap-1.5"><span class="text-emerald-400 font-bold">✓</span><span>${a}</span></div>`).join("")}
                </div>
              </div>

              <!-- Actions -->
              <div class="flex items-center gap-2">
                <button
                  class="btn-amhs-info px-2.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors"
                  data-title="${s.name}"
                  data-note="${s.scienceNote}"
                  title="查看 AMHS 搬運科普原理"
                >
                  <span>ℹ️</span>
                  <span>原理</span>
                </button>

                ${s.isPurchased?`
                  <button disabled class="flex-1 py-2 px-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center cursor-default">
                    ✔️ 已升級掌握 (現役運作中)
                  </button>
                `:s.isUnlocked?`
                  <button
                    class="btn-buy-amhs flex-1 btn-sci-fi justify-center py-2 text-xs font-bold cursor-pointer ${s.canAfford?"bg-amber-600 hover:bg-amber-500 border-amber-400 text-white shadow-lg shadow-amber-600/20":"opacity-50 cursor-not-allowed bg-slate-800"}"
                    data-feature="${s.feature}"
                    data-price="${s.price}"
                    data-name="${s.name}"
                    ${s.canAfford?"":"disabled"}
                  >
                    <span>🛒</span>
                    <span>立即升級購置 (NT$ ${s.price.toLocaleString()})</span>
                  </button>
                `:`
                  <button class="btn-open-techtree-from-store flex-1 py-2 px-3 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-cyan-300 text-xs text-center cursor-pointer">
                    🔒 需晉升至 Tier ${s.tier} 研發解鎖
                  </button>
                `}
              </div>
            </div>
          `).join("")}
      </div>
    `}static renderCatalogTab(e){const t=this.STORE_CATALOG.filter(s=>s.category===this.activeCategory);return`
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
        ${t.map((s,a)=>{const n=e.player.foundryTier>=s.tier,r=e.player.cash>=s.price,i=s.category==="CMP"&&!e.unlockedFeatures.cmp;return`
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

                ${n?`
                  <button
                    class="btn-buy-equipment flex-1 btn-sci-fi justify-center text-xs py-2 ${!r||i?"opacity-50 cursor-not-allowed":""}"
                    data-model-id="${s.modelId}"
                    ${!r||i?"disabled":""}
                  >
                    ${i?"🔒 CMP 科技未解鎖":r?"🛒 採購並安裝至廠房":"資金不足"}
                  </button>
                `:`
                  <button
                    class="btn-open-techtree-from-store flex-1 btn-sci-fi justify-center text-xs py-2 bg-amber-950/40 border-amber-500/50 text-amber-300 hover:text-white"
                    title="點擊前往科技樹查看研發解鎖條件"
                  >
                    🔒 需達到 Tier ${s.tier} (前往研發)
                  </button>
                `}
              </div>

            </div>
          `}).join("")}
      </div>
    `}static renderFleetTab(e){return e.machines.length===0?`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">🏭</div>
          <p class="text-sm">廠內目前尚未安裝任何機台，請前往各站點選購！</p>
        </div>
      `:`
      <div class="space-y-3">
        ${e.machines.map(t=>{const s=this.STORE_CATALOG.find(o=>o.modelId===t.modelId),a=Math.round((s?s.price:2e6)*.15),n=Math.round((s?s.price:2e6)*.4),r=Math.round(t.wear);let i='<span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">閒置 (IDLE)</span>';return t.status==="PROCESSING"?i='<span class="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">加工中</span>':t.status==="MAINTENANCE"?i='<span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">🛠️ 維護中</span>':t.status==="EXPLODED"&&(i='<span class="px-2 py-0.5 rounded text-[10px] bg-red-600 text-white font-bold animate-bounce">💥 腔體炸毀</span>'),`
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="store-thumb-box machine-card-thumb w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden">
                  <img src="${s?s.assetPath:I.machines.litho_contact.path}" alt="${t.name}" class="w-full h-full object-contain" style="max-width: 44px; max-height: 44px;" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">${t.name}</span>
                    ${i}
                  </div>
                  <div class="text-xs text-slate-400 font-mono mt-0.5">
                    ID: ${t.id} | 座標: (${t.gridX}, ${t.gridY}) | 站點: ${t.category}
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
                  data-machine-id="${t.id}"
                  data-cost="${a}"
                  ${e.player.cash<a||t.wear<=5?"disabled":""}
                >
                  🛠️ 就地大修 (NT$ ${a.toLocaleString()})
                </button>

                <button
                  class="btn-decommission px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-800/40 text-red-300 text-xs transition-colors"
                  data-machine-id="${t.id}"
                  data-refund="${n}"
                >
                  ♻️ 報廢變賣 (+NT$ ${n.toLocaleString()})
                </button>
              </div>
            </div>
          `}).join("")}
      </div>
    `}static bindEvents(e,t,s){var r,i,o;const a=()=>{x.playClick(),e.innerHTML="",window.removeEventListener("keydown",n)},n=l=>{l.key==="Escape"&&a()};window.addEventListener("keydown",n),(r=document.getElementById("btn-close-store"))==null||r.addEventListener("click",a),(i=document.getElementById("btn-back-store"))==null||i.addEventListener("click",a),(o=document.getElementById("modal-backdrop-store"))==null||o.addEventListener("click",l=>{l.target===document.getElementById("modal-backdrop-store")&&a()}),e.querySelectorAll(".btn-store-tab").forEach(l=>{l.addEventListener("click",d=>{x.playClick();const p=d.currentTarget.getAttribute("data-cat");if(p==="CMP"&&!t.unlockedFeatures.cmp){alert("CMP（化學機械研磨）機台需晉升至 Tier 3 世代後方可解鎖！");return}this.activeCategory=p,this.render(e,t,s)})}),e.querySelectorAll(".btn-sci-info").forEach(l=>{l.addEventListener("click",d=>{x.playClick();const p=parseInt(d.currentTarget.getAttribute("data-index")||"0",10),c=this.STORE_CATALOG.filter(m=>m.category===this.activeCategory)[p];c&&alert(`👨‍🏫 半導體晶圓教室：【${c.name}】

${c.scienceNote}`)})}),e.querySelectorAll(".btn-open-techtree-from-store").forEach(l=>{l.addEventListener("click",()=>{x.playClick(),e.innerHTML="",ie.show(t,()=>{s()})})}),e.querySelectorAll(".btn-buy-equipment").forEach(l=>{l.addEventListener("click",d=>{const p=d.currentTarget.getAttribute("data-model-id"),c=this.STORE_CATALOG.find(g=>g.modelId===p);if(!c)return;if(t.player.cash<c.price){alert("資金不足，無法完成設備採購！");return}t.player.cash-=c.price,$.recordCapEx(t,c.price),x.playCoinChime();const m=t.machines.length,u=m%4*2,h=Math.floor(m/4)*2,f={id:`MCH-${Date.now().toString(36).toUpperCase().slice(-5)}`,modelId:c.modelId,name:c.name.split(" (")[0],category:c.category,tier:c.tier,gridX:Math.min(7,u),gridY:Math.min(7,h),wear:0,status:"IDLE",assignedEngineerId:null,pairedTrackIds:c.category==="LITHO"?[]:void 0};t.machines.push(f),P.updateMachineNames(t.machines),N.checkAchievements(t),s(),this.activeCategory="FLEET",this.render(e,t,s)})}),e.querySelectorAll(".btn-overhaul").forEach(l=>{l.addEventListener("click",d=>{const p=d.currentTarget.getAttribute("data-machine-id"),c=parseInt(d.currentTarget.getAttribute("data-cost")||"0",10),m=t.machines.find(u=>u.id===p);if(m){if(t.player.cash<c){alert("資金不足，無法支付大修費用！");return}t.player.cash-=c,$.recordMaintenance(t,c),m.wear=0,m.status="IDLE",x.playClick(),s(),this.render(e,t,s)}})}),e.querySelectorAll(".btn-decommission").forEach(l=>{l.addEventListener("click",d=>{const p=d.currentTarget.getAttribute("data-machine-id"),c=parseInt(d.currentTarget.getAttribute("data-refund")||"0",10),m=t.machines.findIndex(h=>h.id===p);if(m===-1||!confirm(`確定要報廢並變賣此機台嗎？將回收變賣金 NT$ ${c.toLocaleString()}`))return;const u=t.machines[m];if(u.assignedEngineerId){const h=t.staff.find(f=>f.id===u.assignedEngineerId);h&&(h.assignedMachineId=null)}t.player.cash+=c,t.machines.splice(m,1),x.playCoinChime(),s(),this.render(e,t,s)})}),e.querySelectorAll(".btn-amhs-info").forEach(l=>{l.addEventListener("click",d=>{x.playClick();const p=d.currentTarget.getAttribute("data-note")||"",c=d.currentTarget.getAttribute("data-title")||"";alert(`🚚 廠務自動化物料搬運 (AMHS) 原理解析：【${c}】

${p}`)})}),e.querySelectorAll(".btn-buy-amhs").forEach(l=>{l.addEventListener("click",d=>{const p=d.currentTarget.getAttribute("data-feature"),c=parseInt(d.currentTarget.getAttribute("data-price")||"0",10),m=d.currentTarget.getAttribute("data-name")||"";if(t.player.cash<c){alert("流動資金不足，無法採購此運送設備！");return}confirm(`確定要投資 NT$ ${c.toLocaleString()} 採購並升級【${m}】嗎？`)&&(t.player.cash-=c,$.recordCapEx(t,c),p==="agv"?t.unlockedFeatures.agv=!0:p==="oht"?t.unlockedFeatures.oht=!0:p==="shrOht"&&(t.unlockedFeatures.shrOht=!0),M.saveToLocalStorage(t),N.checkAchievements(t),x.playFanfare(),s(),this.render(e,t,s))})})}}w(j,"activeCategory","LITHO"),w(j,"STORE_CATALOG",[{modelId:"litho_contact",name:"Contact Aligner (接觸式微影機)",category:"LITHO",tier:1,price:25e5,throughputWpm:10,rayleighLimitNm:3007,description:"半導體萌芽期主力，光罩物理緊貼晶圓表面進行紫外曝光，維修容易。",scienceNote:"利用汞燈紫外混光 (436nm) 貼合曝光。因光罩直接碰觸晶圓表面，容易刮傷光罩與產生落塵，極限線寬約 3µm。",assetPath:I.machines.litho_contact.path},{modelId:"litho_projection",name:"1x Projection Aligner (1:1 投影曝光機)",category:"LITHO",tier:1,price:6e6,throughputWpm:15,rayleighLimitNm:1798,description:"反射鏡等倍投影微影，光罩懸空不接觸晶圓，徹底終結光罩刮傷磨損。",scienceNote:"Perkin-Elmer 經典反射光學系統，以凹面鏡聚焦達成 1:1 無接觸曝光，大幅提升光罩壽命與開局良率。",assetPath:I.machines.litho_projection.path},{modelId:"litho_gline",name:"G-Line Stepper (步進縮小曝光機)",category:"LITHO",tier:2,price:18e6,throughputWpm:25,rayleighLimitNm:997,description:"4:1 縮小投影透鏡，逐區步進曝光（Step-and-Repeat），進入 1µm 時代。",scienceNote:"高壓汞燈 g-line (436nm) 搭配數值孔徑 NA=0.35 之複合縮小透鏡，將光罩圖案縮小 4 倍投射，突破微米大關。",assetPath:I.machines.litho_gline.path},{modelId:"litho_iline",name:"I-Line Stepper (高壓汞燈微影機)",category:"LITHO",tier:3,price:35e6,throughputWpm:55,rayleighLimitNm:584,description:"次微米時代霸主，波長 365nm，支援精密對準與多層金屬互連製程。",scienceNote:"採用更短波長之高強度汞燈 i-line (365nm) 與 NA=0.50 鏡頭，成功壓制繞射效應，可清晰成像至 500nm。",assetPath:I.machines.litho_iline.path},{modelId:"litho_krf",name:"KrF DUV Scanner (準分子雷射微影機)",category:"LITHO",tier:4,price:85e6,throughputWpm:120,rayleighLimitNm:283,description:"深紫外光 (DUV) 準分子雷射，邁入動態連續掃描曝光 (Step-and-Scan)。",scienceNote:"248nm 氟化氪 (KrF) 準分子雷射光源，必須搭配化學增幅光阻 (CAR) 放大光化學反應，支援 0.25µm 製程。",assetPath:I.machines.litho_krf.path},{modelId:"litho_arfdry",name:"ArF Dry Scanner (氟化氬乾式微影機)",category:"LITHO",tier:4,price:18e7,throughputWpm:120,rayleighLimitNm:182,description:"193nm 紫外雷射，將大氣乾式微影發揮至極致，跨越次百奈米門檻。",scienceNote:"利用 193nm 氟化氬雷射與高折射石英透鏡群，是半導體製程縮小至 90nm/65nm 的核心關鍵機台。",assetPath:I.machines.litho_arfdry.path},{modelId:"litho_arfi",name:"ArFi Immersion TWINSCAN (浸潤式微影機)",category:"LITHO",tier:5,price:45e7,throughputWpm:260,rayleighLimitNm:114,description:"鏡頭與晶圓間注入超純水折射光線，雙工件台磁浮掃描，大氣產速最快！",scienceNote:"林本堅博士提出之革命性技術：利用水之折射率 n=1.44 巧妙將等效數值孔徑提升至 NA=1.35，多重曝光下推進至 7nm！",assetPath:I.machines.litho_arfi.path},{modelId:"litho_euv",name:"EUV Scanner (極紫外光微影巨獸)",category:"LITHO",tier:6,price:25e8,throughputWpm:180,rayleighLimitNm:33,description:"13.5nm 極紫外光，全真空反射鏡系統，單次曝光推進 7nm/5nm/3nm！",scienceNote:"以高功率二氧化碳雷射轟擊融熔錫滴激發電漿，產生 13.5nm EUV 光子，全機在超高真空運行，受抽真空限制產能為 180 片/分。",assetPath:I.machines.litho_euv.path},{modelId:"litho_highna",name:"High-NA EUV (高數值孔徑次世代巨獸)",category:"LITHO",tier:6,price:6e9,throughputWpm:180,rayleighLimitNm:20,description:"0.55 NA 變形數值孔徑透鏡，埃米世代霸主，稱霸矽島之終極神兵。",scienceNote:"採用變形鏡頭 (Anamorphic Optics)，X/Y 軸非對稱倍率，單次曝光極限線寬可達 20nm 以下，引領 2nm 埃米時代。",assetPath:I.machines.litho_highna.path},{modelId:"track_manual",name:"手動旋塗熱板台 (Manual Spin & Bake)",category:"TRACK",tier:1,price:8e5,throughputWpm:6,description:"⚠️ 開局先天產能瓶頸！人工滴膠手動離心旋塗與熱板預烤，產能僅 6 片/分。",scienceNote:"利用真空吸盤固定晶圓，手動注射光阻後以 3000 RPM 高速旋轉甩出均勻薄膜，再由人員夾入熱板烘烤。",assetPath:I.machines.track_manual.path},{modelId:"track_single",name:"單軌自動塗膠顯影機 (Single Track)",category:"TRACK",tier:2,price:45e5,throughputWpm:16,description:"初步自動化旋轉塗膠與自動烘烤模組，大幅減少人工操作失誤。",scienceNote:"機械手臂自動傳送晶圓至旋塗杯，自動注膠均勻成膜，並整合冷卻板 (Chill Plate) 精確控制膜厚。",assetPath:I.machines.track_single.path},{modelId:"track_dual",name:"雙軌連線 Track (Dual Track)",category:"TRACK",tier:3,price:12e6,throughputWpm:35,description:"雙獨立機械臂分開處理塗膠與顯影，有效提升次微米連線吞吐量。",scienceNote:"將塗膠旋塗單元 (Coater) 與顯影槽 (Developer) 實體隔離，避免顯影鹼液氣體污染光阻，保障微影良率。",assetPath:I.machines.track_dual.path},{modelId:"track_clean",name:"多工位精密 Clean Track",category:"TRACK",tier:4,price:3e7,throughputWpm:75,description:"多旋塗室並聯，高速熱板陣列，建議為先進微影機配備 2 台以上！",scienceNote:"配置多組 Coater/Developer 模組與快速溫控熱板，支援化學增幅光阻嚴苛的曝光後烘烤 (PEB) 溫度控制。",assetPath:I.machines.track_clean.path},{modelId:"track_advanced",name:"先進極限分子級 Track",category:"TRACK",tier:6,price:25e7,throughputWpm:160,description:"分子級膜厚控制，完美適配 EUV 超薄金屬氧化物光阻 (MOR)。",scienceNote:"具備超微量旋塗技術與化學氣相沉積底膜 (Underlayer)，將光阻粗糙度 (LWR) 降至分子級極限。",assetPath:I.machines.track_advanced.path},{modelId:"film_furnace",name:"高溫熱氧化爐管 (Horizontal Furnace)",category:"FILM",tier:1,price:18e5,throughputWpm:12,description:"利用 1000°C 高溫水汽使矽表面長出堅硬均勻的二氧化矽 (SiO2) 絕緣保護層。",scienceNote:"利用高純度氧氣或水蒸氣在高溫下與矽晶圓反應：Si + O2 -> SiO2，生長厚度均勻的高品質絕緣氧化層。",assetPath:I.machines.film_furnace.path},{modelId:"film_pecvd",name:"電漿增強化學氣相沉積機 (PECVD / ALD)",category:"FILM",tier:4,price:25e6,throughputWpm:110,description:"利用電漿在低溫下快速沉積氮化矽、金屬介電質，並支援原子層沉積 (ALD)。",scienceNote:"以射頻電漿解離前驅氣體，可在較低溫度 (300°C) 下沉積薄膜，避免破壞底層已摻雜之電晶體結構。",assetPath:I.machines.film_pecvd.path},{modelId:"etch_wet",name:"濕式酸槽清洗台 (Wet Chemical Bench)",category:"ETCH",tier:1,price:15e5,throughputWpm:12,description:"利用氫氟酸 (HF) 與化學酸液浸泡溶解未受光阻保護之薄膜，等向性腐蝕。",scienceNote:"化學濕法腐蝕屬於等向性蝕刻 (Isotropic)，容易產生側向掏空 (Undercut)，適合 3µm 以上粗線寬。",assetPath:I.machines.etch_wet.path},{modelId:"etch_plasma",name:"電漿乾式蝕刻機 (RIE / ICP-RIE)",category:"ETCH",tier:3,price:28e6,throughputWpm:50,description:"以高能反應離子轟擊進行垂直非等向性蝕刻，線條邊緣垂直銳利！",scienceNote:"反應性離子蝕刻 (RIE) 結合物理離子轟擊與化學自由基反應，具備極高垂直各向異性 (Anisotropic)，是次微米微影的關鍵搭檔。",assetPath:I.machines.etch_plasma.path},{modelId:"diff_furnace",name:"熱擴散摻雜爐管 (Thermal Diffusion)",category:"DIFF",tier:1,price:2e6,throughputWpm:10,description:"將磷或硼蒸氣高溫擴散滲透進矽晶格中，形成 N 型與 P 型半導體通道。",scienceNote:"利用高溫晶格熱運動使雜質原子由高濃度向低濃度擴散，控溫容易但橫向擴散量大。",assetPath:I.machines.diff_furnace.path},{modelId:"diff_implanter",name:"大束流離子佈植機 (Ion Implanter)",category:"DIFF",tier:2,price:15e6,throughputWpm:20,description:"將雜質原子電離成高能離子束，如子彈般精確轟擊打入矽晶圓特定深度。",scienceNote:"高壓電場加速磷/砷/硼離子束，可獨立精確控制植入劑量與深度，無橫向擴散失真，是現代電晶體的核心技術。",assetPath:I.machines.diff_implanter.path},{modelId:"cmp_polisher",name:"化學機械平坦化研磨機 (CMP Polisher)",category:"CMP",tier:3,price:2e7,throughputWpm:40,description:"化學研磨液搭配高速研磨墊，將晶圓表面磨至分子級平坦，解鎖多層金屬佈線！",scienceNote:"利用研磨液 (Slurry) 的化學腐蝕軟化與奈米磨料的機械研磨，實現全晶圓奈米級全域平坦化 (Global Planarization)。",assetPath:I.machines.cmp_polisher.path}]);class U{static show(e,t){const s=document.getElementById("modal-container");s&&(this.candidates.length===0&&this.generateCandidates(e.player.foundryTier),this.render(s,e,t))}static generateCandidates(e){const t=["LITHO","TRACK","FILM","ETCH","DIFF","CMP"];this.candidates=[];for(let s=0;s<4;s++){const a=this.FIRST_NAMES[Math.floor(Math.random()*this.FIRST_NAMES.length)],n=this.LAST_NAMES[Math.floor(Math.random()*this.LAST_NAMES.length)],r=t[Math.floor(Math.random()*t.length)];let i="Young Specialist",o=2e4,l=45e3,d="專精基礎機台操作，磨損累積 -10%，微影 k1 -0.01。適合操作 Tier 1~2。";const p=Math.random();e>=5&&p>.6?(i="Fellow",o=5e5,l=35e4,d="頂級半導體物理泰斗，磨損累積 -80%，微影 k1 -0.06，良率 +15%，可抵銷先進製程視窗損失！"):e>=3&&p>.4?(i="Senior Engineer",o=12e4,l=15e4,d="多年產線調機權威，磨損累積 -50%，微影 k1 -0.04，良率 +10%。適合操作 Tier 3~5。"):e>=2&&p>.3&&(i="Skilled Worker",o=5e4,l=75e3,d="熟練製程技師，磨損累積 -25%，微影 k1 -0.02，良率 +5%。適合操作 Tier 1~3。"),this.candidates.push({id:`CAN-${Date.now().toString(36).slice(-4)}-${s}`,name:`${a} ${n}`,rank:i,moduleSpecialty:r,signingBonus:o,salary:l,description:d})}}static render(e,t,s){var r;const a=t.staff.reduce((i,o)=>i+o.salary,0),n=((r=t.staff[0])==null?void 0:r.shiftMode)||"THREE_SHIFT";e.innerHTML=`
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
                    在職員工: ${t.staff.length} 人
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
              class="px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${this.activeTab==="STAFF"?"border-purple-400 text-purple-300":"border-transparent text-slate-400 hover:text-slate-200"}"
            >
              <span>🧑‍🔬 全部員工列表</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">${t.staff.length}</span>
            </button>
            <button
              id="tab-schedule"
              class="px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${this.activeTab==="SCHEDULE"?"border-purple-400 text-purple-300":"border-transparent text-slate-400 hover:text-slate-200"}"
            >
              <span>📅 廠務排班表</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">${t.staff.length}人排班</span>
            </button>
            <button
              id="tab-market"
              class="px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${this.activeTab==="MARKET"?"border-purple-400 text-purple-300":"border-transparent text-slate-400 hover:text-slate-200"}"
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
            ${this.activeTab==="STAFF"?this.renderStaffTab(t):this.activeTab==="SCHEDULE"?this.renderScheduleTab(t):this.renderMarketTab(t)}
          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
            <button id="btn-back-hr" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `,this.bindEvents(e,t,s)}static renderScheduleTab(e){if(e.staff.length===0)return`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">📅</div>
          <p class="text-sm">廠內目前尚未招募任何員工，無法進行排班！請先前往「人才招募市場」進行招聘。</p>
        </div>
      `;const t=e.staff.filter(i=>(i.workShift||"DAY")==="DAY").length,s=e.staff.filter(i=>i.workShift==="SWING").length,a=e.staff.filter(i=>i.workShift==="NIGHT").length,n=e.staff.filter(i=>i.workShift==="OFF").length,r=t>0&&s>0&&a>0;return`
      <div class="space-y-4">
        <!-- 輪班健康度與 24H 覆蓋看板 -->
        <div class="p-4 rounded-xl bg-slate-900/90 border ${r?"border-emerald-500/50 bg-emerald-950/20":"border-amber-500/40 bg-amber-950/10"} flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-base">${r?"🛡️":"⚠️"}</span>
              <span class="text-sm font-bold ${r?"text-emerald-300":"text-amber-300"}">
                ${r?"全廠 24H 輪班完整覆蓋 (達成 TPM 零故障保護條件)":"全廠 24H 輪班存在時段空窗"}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              ${r?"早班、中班與大夜班均有人員駐守，只要機台專長職等符合且疲勞 < 50%，即可維持 0% 故障率！":"注意：若某個班別缺少工程師值班，在該時段機台將無法享受在線預防保養，磨損率將正常累積！"}
            </p>
          </div>

          <!-- 各班人數統計膠囊 -->
          <div class="flex items-center gap-2 text-xs font-mono">
            <span class="px-2.5 py-1 rounded-lg bg-sky-950 text-sky-300 border border-sky-500/30">
              ☀️ 早班: ${t}
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/30">
              🌆 中班: ${s}
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-500/30">
              🌙 夜班: ${a}
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
              🏖️ 排休: ${n}
            </span>
          </div>
        </div>

        <!-- 快捷一鍵排班操作欄 -->
        <div class="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
          <span class="text-slate-400 font-medium">快捷排班輔助工具：</span>
          <div class="flex items-center gap-2">
            <button id="btn-preset-balanced" class="btn-sci-fi text-xs py-1 px-3 bg-cyan-900/50 hover:bg-cyan-800/60 border-cyan-500/40">
              🔄 一鍵均衡三班制
            </button>
            <button id="btn-preset-day-only" class="btn-sci-fi text-xs py-1 px-3 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300">
              ☀️ 一鍵集中早班
            </button>
            <button id="btn-preset-tpm-opt" class="btn-sci-fi text-xs py-1 px-3 bg-emerald-900/50 hover:bg-emerald-800/60 border-emerald-500/40 text-emerald-200 font-bold">
              🛡️ TPM 最佳化排班
            </button>
          </div>
        </div>

        <!-- 全體員工手動班表矩陣 -->
        <div class="space-y-2.5">
          ${e.staff.map(i=>{const o=i.workShift||"DAY",l=e.machines.find(d=>d.id===i.assignedMachineId);return`
              <div class="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                    🧑‍🔬
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-white text-sm">${i.name}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        ${i.rank}
                      </span>
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300">
                        ${i.moduleSpecialty}
                      </span>
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                      <span>進駐: <strong class="text-slate-200">${l?l.name:"待命未指派"}</strong></span>
                      <span>|</span>
                      <span>疲勞: <strong class="${i.fatigue>=50?"text-red-400 font-bold":i.fatigue>=30?"text-amber-400":"text-emerald-400"}">${Math.round(i.fatigue)}%</strong></span>
                    </div>
                  </div>
                </div>

                <!-- 手動班別切換按鈕組 -->
                <div class="flex items-center gap-1.5 w-full md:w-auto justify-end">
                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${o==="DAY"?"bg-sky-600 text-white shadow-md shadow-sky-500/30 border border-sky-400":"bg-slate-950 text-slate-400 hover:text-white border border-slate-800"}"
                    data-staff-id="${i.id}"
                    data-shift="DAY"
                    title="早班: 07:00 ~ 15:00 (常規疲勞速率)"
                  >
                    ☀️ 早班 (07-15)
                  </button>
                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${o==="SWING"?"bg-amber-600 text-white shadow-md shadow-amber-500/30 border border-amber-400":"bg-slate-950 text-slate-400 hover:text-white border border-slate-800"}"
                    data-staff-id="${i.id}"
                    data-shift="SWING"
                    title="中班: 15:00 ~ 23:00 (常規疲勞速率)"
                  >
                    🌆 中班 (15-23)
                  </button>
                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${o==="NIGHT"?"bg-indigo-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-400":"bg-slate-950 text-slate-400 hover:text-white border border-slate-800"}"
                    data-staff-id="${i.id}"
                    data-shift="NIGHT"
                    title="夜班: 23:00 ~ 07:00 (夜班疲勞稍快，需定期輪替)"
                  >
                    🌙 夜班 (23-07)
                  </button>
                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${o==="OFF"?"bg-emerald-600 text-white shadow-md shadow-emerald-500/30 border border-emerald-400":"bg-slate-950 text-slate-400 hover:text-white border border-slate-800"}"
                    data-staff-id="${i.id}"
                    data-shift="OFF"
                    title="排休: 暫停進駐機台，快速恢復體力與降低疲勞度"
                  >
                    🏖️ 排休 (OFF)
                  </button>
                </div>
              </div>
            `}).join("")}
        </div>
      </div>
    `}static renderStaffTab(e){return e.staff.length===0?`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">👥</div>
          <p class="text-sm">廠內目前尚未招募任何工程師，請前往「人才招募市場」進行招聘！</p>
        </div>
      `:`
      <div class="space-y-3">
        ${e.staff.map(t=>{const s=e.machines.find(r=>r.id===t.assignedMachineId);let a=!1,n=!1;return s&&(a=H.checkTPMConditions(s,t).isTPMActive,n=H.checkExplosionRisk(s,t).hasRisk),`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${n?"border-red-600/60 bg-red-950/10":a?"border-amber-500/50 bg-amber-950/10":"border-slate-800"} flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <!-- Info -->
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
                  🧑‍🔬
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white">${t.name}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      ${t.rank}
                    </span>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300">
                      專長: ${t.moduleSpecialty}
                    </span>
                  </div>

                  <div class="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                    <span>月薪: NT$ ${t.salary.toLocaleString()}</span>
                    <span>|</span>
                    <span>疲勞度: ${Math.round(t.fatigue)}%</span>
                  </div>
                </div>
              </div>

              <!-- Machine Assignment Dropdown -->
              <div class="flex flex-col gap-1 w-full md:w-64">
                <label class="text-[10px] text-slate-400">進駐機台指派:</label>
                <select class="select-machine select-sci-fi text-xs py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200" data-staff-id="${t.id}">
                  <option value="">-- 未指派機台 (待命休假) --</option>
                  ${e.machines.map(r=>`
                    <option value="${r.id}" ${t.assignedMachineId===r.id?"selected":""}>
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
                  data-staff-id="${t.id}"
                >
                  解雇資遣
                </button>
              </div>

            </div>
          `}).join("")}
      </div>
    `}static renderMarketTab(e){return this.candidates.length===0?`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">💼</div>
          <p class="text-sm">目前市場暫無履歷，請點擊右上角「刷新履歷池」！</p>
        </div>
      `:`
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${this.candidates.map((t,s)=>{const a=e.player.cash>=t.signingBonus;return`
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl">
                    🧑‍💻
                  </div>
                  <div>
                    <div class="font-bold text-white text-sm">${t.name}</div>
                    <div class="text-[11px] text-purple-300 font-semibold font-mono">${t.rank}</div>
                  </div>
                </div>

                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  模組: ${t.moduleSpecialty}
                </span>
              </div>

              <div class="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                ${t.description}
              </div>

              <div class="flex items-center justify-between text-xs pt-1">
                <div>
                  <div class="text-[10px] text-slate-400">簽約獎金 (一次性)</div>
                  <div class="font-mono font-bold text-amber-300">NT$ ${t.signingBonus.toLocaleString()}</div>
                </div>
                <div class="text-right">
                  <div class="text-[10px] text-slate-400">核定月薪</div>
                  <div class="font-mono font-semibold text-slate-200">NT$ ${t.salary.toLocaleString()} /月</div>
                </div>
              </div>

              <button
                class="btn-hire-candidate btn-sci-fi w-full justify-center text-xs py-2 ${a?"":"opacity-50 cursor-not-allowed"}"
                data-index="${s}"
                ${a?"":"disabled"}
              >
                ${a?`🤝 簽約聘任 (支付 NT$ ${t.signingBonus.toLocaleString()})`:"資金不足以支付簽約金"}
              </button>
            </div>
          `}).join("")}
      </div>
    `}static bindEvents(e,t,s){var r,i,o,l,d,p,c,m,u,h,f;const a=()=>{x.playClick(),e.innerHTML="",window.removeEventListener("keydown",n)},n=g=>{g.key==="Escape"&&a()};window.addEventListener("keydown",n),(r=document.getElementById("btn-close-hr"))==null||r.addEventListener("click",a),(i=document.getElementById("btn-back-hr"))==null||i.addEventListener("click",a),(o=document.getElementById("modal-backdrop-hr"))==null||o.addEventListener("click",g=>{g.target===document.getElementById("modal-backdrop-hr")&&a()}),(l=document.getElementById("tab-staff"))==null||l.addEventListener("click",()=>{x.playClick(),this.activeTab="STAFF",this.render(e,t,s)}),(d=document.getElementById("tab-schedule"))==null||d.addEventListener("click",()=>{x.playClick(),this.activeTab="SCHEDULE",this.render(e,t,s)}),(p=document.getElementById("tab-market"))==null||p.addEventListener("click",()=>{x.playClick(),this.activeTab="MARKET",this.render(e,t,s)}),(c=document.getElementById("btn-preset-balanced"))==null||c.addEventListener("click",()=>{x.playClick();const g=["DAY","SWING","NIGHT"];t.staff.forEach((y,T)=>{y.workShift=g[T%3]}),s(),this.render(e,t,s)}),(m=document.getElementById("btn-preset-day-only"))==null||m.addEventListener("click",()=>{x.playClick(),t.staff.forEach(g=>{g.workShift="DAY"}),s(),this.render(e,t,s)}),(u=document.getElementById("btn-preset-tpm-opt"))==null||u.addEventListener("click",()=>{x.playClick();const g=["DAY","SWING","NIGHT"];let y=0;t.staff.forEach(T=>{T.fatigue>=70?T.workShift="OFF":(T.workShift=g[y%3],y++)}),s(),this.render(e,t,s)}),e.querySelectorAll(".btn-shift-select").forEach(g=>{g.addEventListener("click",y=>{const T=y.currentTarget,E=T.getAttribute("data-staff-id"),v=T.getAttribute("data-shift"),b=t.staff.find(k=>k.id===E);!b||!v||(b.workShift=v,x.playClick(),s(),this.render(e,t,s))})}),(h=document.getElementById("btn-refresh-candidates"))==null||h.addEventListener("click",()=>{x.playClick(),this.generateCandidates(t.player.foundryTier),this.render(e,t,s)}),(f=document.getElementById("btn-toggle-shift"))==null||f.addEventListener("click",()=>{var T;x.playClick();const y=(((T=t.staff[0])==null?void 0:T.shiftMode)||"THREE_SHIFT")==="THREE_SHIFT"?"TWO_SHIFT":"THREE_SHIFT";t.staff.forEach(E=>{E.shiftMode=y,y==="TWO_SHIFT"?E.salary=Math.round(E.salary*.67):E.salary=Math.round(E.salary/.67)}),s(),this.render(e,t,s)}),e.querySelectorAll(".btn-hire-candidate").forEach(g=>{g.addEventListener("click",y=>{var k;const T=parseInt(y.currentTarget.getAttribute("data-index")||"0",10),E=this.candidates[T];if(!E)return;if(t.player.cash<E.signingBonus){alert("資金不足，無法支付簽約獎金！");return}t.player.cash-=E.signingBonus,$.recordSigningBonus(t,E.signingBonus),x.playCoinChime();const v=((k=t.staff[0])==null?void 0:k.shiftMode)||"THREE_SHIFT",b={id:`STF-${Date.now().toString(36).toUpperCase().slice(-5)}`,name:E.name,rank:E.rank,moduleSpecialty:E.moduleSpecialty,fatigue:20,shiftMode:v,workShift:"DAY",assignedMachineId:null,salary:E.salary};t.staff.push(b),this.candidates.splice(T,1),N.checkAchievements(t),s(),this.activeTab="STAFF",this.render(e,t,s)})}),e.querySelectorAll(".select-machine").forEach(g=>{g.addEventListener("change",y=>{const T=y.currentTarget.getAttribute("data-staff-id"),E=y.currentTarget.value||null,v=t.staff.find(b=>b.id===T);if(v){if(E){const b=t.staff.find(k=>k.assignedMachineId===E&&k.id!==T);b&&(b.assignedMachineId=null)}v.assignedMachineId=E,t.machines.forEach(b=>{b.id===E?b.assignedEngineerId=v.id:b.assignedEngineerId===v.id&&(b.assignedEngineerId=null)}),x.playClick(),N.checkAchievements(t),s(),this.render(e,t,s)}})}),e.querySelectorAll(".btn-fire-staff").forEach(g=>{g.addEventListener("click",y=>{const T=y.currentTarget.getAttribute("data-staff-id"),E=t.staff.findIndex(b=>b.id===T);if(E===-1)return;const v=t.staff[E];if(confirm(`確定要資遣工程師【${v.name}】嗎？`)){if(v.assignedMachineId){const b=t.machines.find(k=>k.id===v.assignedMachineId);b&&(b.assignedEngineerId=null)}t.staff.splice(E,1),x.playClick(),s(),this.render(e,t,s)}})})}}w(U,"activeTab","STAFF"),w(U,"candidates",[]),w(U,"FIRST_NAMES",["Alex","David","Sarah","Kevin","Emily","Michael","Jessica","James","Daniel","Rachel","Robert","Brian","Olivia","William","Sophia","Thomas","Emma","Chris","Grace","Eric","Lucas","Chloe","Nathan","Hannah"]),w(U,"LAST_NAMES",["Miller","Chen","Smith","Williams","Johnson","Taylor","Davis","Wilson","Anderson","White","Harris","Martin","Clark","Lewis","Walker","Hall","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill"]);class te{static getSpeedMultiplier(){return this.speedMultiplier}static init(e,t,s){const a=new URLSearchParams(window.location.search);(a.get("dev")==="true"||a.get("admin")==="foundry")&&this.toggle(e,t,s),window.addEventListener("keydown",r=>{r.ctrlKey&&r.shiftKey&&r.code==="KeyD"&&(r.preventDefault(),this.toggle(e,t,s))})}static toggle(e,t,s){this.isVisible=!this.isVisible;const a=document.getElementById("dev-console");if(a){if(!this.isVisible){a.innerHTML="";return}x.playClick(),this.render(a,e,t,s)}}static render(e,t,s,a){var n,r,i,o;e.innerHTML=`
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
    `,(n=document.getElementById("btn-dev-close"))==null||n.addEventListener("click",()=>{this.isVisible=!1,e.innerHTML=""}),document.querySelectorAll(".btn-speed").forEach(l=>{l.addEventListener("click",d=>{x.playClick();const p=Number(d.currentTarget.getAttribute("data-speed"));this.speedMultiplier=p,s(p),this.render(e,t,s,a)})}),(r=document.getElementById("btn-add-cash"))==null||r.addEventListener("click",()=>{t.player.cash+=5e7,x.playCoin(),a()}),(i=document.getElementById("btn-trigger-wear"))==null||i.addEventListener("click",()=>{for(const l of t.machines)l.wear=Math.min(100,l.wear+50),l.wear>=80&&(l.status="MAINTENANCE");x.playWarning(),a()}),(o=document.getElementById("btn-reset-save"))==null||o.addEventListener("click",()=>{confirm("確定要清空本地存檔並重置遊戲嗎？")&&(localStorage.clear(),window.location.reload())})}}w(te,"isVisible",!1),w(te,"speedMultiplier",1);const q=class q{static show(e,t,s){const a=document.getElementById("modal-container");a&&(s!==void 0&&(this.currentStep=s),this.render(a,e,t))}static isCompleted(e){var t;return((t=e==null?void 0:e.player)==null?void 0:t.tutorialCompleted)!==void 0?e.player.tutorialCompleted:e!=null&&e.userId?localStorage.getItem(`silicon_tycoon_tutorial_completed_${e.userId}`)==="true":!1}static markCompleted(e){e!=null&&e.player&&(e.player.tutorialCompleted=!0),e!=null&&e.userId&&localStorage.setItem(`silicon_tycoon_tutorial_completed_${e.userId}`,"true"),localStorage.setItem("silicon_tycoon_tutorial_completed","true")}static render(e,t,s){const a=this.currentStep,n=[{stepNum:1,badge:"🚀 歡迎創辦人",title:"歡迎來到《Silicon Tycoon: 矽島霸權》",icon:"🏭",content:`
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
        `,btnPrimaryText:"🎉 完成新手引導，稱霸矽島！",btnPrimaryAction:"finish"}],r=n[a]||n[0];e.innerHTML=`
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
    `,this.bindEvents(e,t,s,r.btnPrimaryAction)}static bindEvents(e,t,s,a){var i,o,l,d,p;const n=()=>{x.playClick(),e.innerHTML="",q.markCompleted(t),s()};(i=document.getElementById("btn-close-tutorial"))==null||i.addEventListener("click",n),(o=document.getElementById("btn-skip-tutorial-all"))==null||o.addEventListener("click",n);const r=e.querySelector(".modal-backdrop");r==null||r.addEventListener("click",c=>{c.target===r&&n()}),(l=document.getElementById("btn-tutorial-prev"))==null||l.addEventListener("click",()=>{x.playClick(),this.currentStep=Math.max(0,this.currentStep-1),this.render(e,t,s)}),(d=document.getElementById("btn-tutorial-skip-production"))==null||d.addEventListener("click",()=>{if(x.playFanfare(),t.activeLots.length>0)for(const c of t.activeLots)c.currentStation="DIFF",c.status="COMPLETED",c.yieldMultiplier=.96;else{const c=t.activeOrders.length>0?t.activeOrders[0].id:"starter_demo";t.activeLots.push({lotId:`LOT-${Date.now().toString().slice(-4)}`,orderId:c,waferCount:25,currentStation:"DIFF",currentLayer:3,totalLayers:3,qTimeDeadline:null,yieldMultiplier:.95,status:"COMPLETED"})}s(),this.currentStep=3,this.render(e,t,s)}),(p=document.getElementById("btn-tutorial-action"))==null||p.addEventListener("click",()=>{x.playClick(),a==="next"?(this.currentStep=Math.min(this.totalSteps-1,this.currentStep+1),this.render(e,t,s)):a==="open_contract"?(e.innerHTML="",ee.show(t,()=>s())):a==="open_wafer_map"?(e.innerHTML="",K.show(t,null,()=>s())):a==="finish"&&(q.markCompleted(t),x.playFanfare(),e.innerHTML="",s())})}};w(q,"currentStep",0),w(q,"totalSteps",5);let V=q;class ue{static show(e,t){const s=document.getElementById("modal-container");s&&($.ensureFinancialState(e),this.render(s,e,t))}static render(e,t,s){const a=$.ensureFinancialState(t);let n=a.today,r=a.dailyHistory,i="日收支分析",l=`現實同步: 📅 ${a.currentDateStr||$.getTodayDateString()} (今日進行中)`;this.activeTab==="WEEK"?(n=a.thisWeek,r=a.weeklyHistory,i="周收支分析",l=`現實同步: 📅 本周累計 (${$.getWeekString()})`):this.activeTab==="MONTH"&&(n=a.thisMonth,r=a.monthlyHistory,i="月收支分析",l=`現實同步: 📅 本月累計 (${$.getMonthString()})`);const d=$.generateCFOAdvisory(n,t),p=$.calculateCompanyNetWorth(t);e.innerHTML=`
      <div id="modal-backdrop-finance" class="modal-backdrop">
        <div class="modal-content max-w-4xl border border-cyan-500/40 bg-slate-950/95 shadow-2xl shadow-cyan-950/50 rounded-2xl flex flex-col max-h-[88vh] overflow-hidden animate-scaleUp">
          
          <!-- Header -->
          <div class="modal-header p-5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-inner text-cyan-300">
                📊
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-base font-bold text-white tracking-wide">
                    半導體財務報表中心 — ${i}
                  </h2>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    P&L / Cash Flow
                  </span>
                </div>
                <div class="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                  <span>廠曆進度: <strong class="text-amber-300">${l}</strong></span>
                  <span>|</span>
                  <span>公司總淨值: <strong class="text-emerald-400">NT$ ${Math.round(p).toLocaleString()}</strong></span>
                </div>
              </div>
            </div>

            <button id="btn-close-finance" class="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold border border-slate-700">
              ✕
            </button>
          </div>

          <!-- Tabs (日、周、月) -->
          <div class="flex border-b border-slate-800 bg-slate-900/50 px-6 pt-2 flex-shrink-0">
            <button
              id="tab-finance-day"
              class="px-5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${this.activeTab==="DAY"?"border-cyan-400 text-cyan-300 bg-cyan-950/20":"border-transparent text-slate-400 hover:text-slate-200"}"
            >
              <span>📅 日收支分析 (Daily)</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">Day ${a.currentDay}</span>
            </button>

            <button
              id="tab-finance-week"
              class="px-5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${this.activeTab==="WEEK"?"border-cyan-400 text-cyan-300 bg-cyan-950/20":"border-transparent text-slate-400 hover:text-slate-200"}"
            >
              <span>📊 周收支分析 (Weekly)</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-amber-400">Week ${a.currentWeek}</span>
            </button>

            <button
              id="tab-finance-month"
              class="px-5 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${this.activeTab==="MONTH"?"border-cyan-400 text-cyan-300 bg-cyan-950/20":"border-transparent text-slate-400 hover:text-slate-200"}"
            >
              <span>📈 月收支分析 (Monthly)</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-purple-400">Month ${a.currentMonth}</span>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body p-5 overflow-y-auto flex-1 space-y-4">
            
            <!-- 頂部四大會計核心 KPI 矩陣 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
              <!-- 總營收 -->
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div class="text-[10px] text-slate-400 font-medium">總營業收入 (Total Revenue)</div>
                <div class="text-base font-black font-mono text-cyan-300 mt-1">
                  NT$ ${Math.round(n.revenue.totalRevenue).toLocaleString()}
                </div>
                <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                  出貨: NT$ ${Math.round(n.revenue.waferSales).toLocaleString()}
                </div>
              </div>

              <!-- 總營業支出 -->
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div class="text-[10px] text-slate-400 font-medium">總營業支出 (Total Expenses)</div>
                <div class="text-base font-black font-mono text-amber-300 mt-1">
                  NT$ ${Math.round(n.expenses.totalExpenses).toLocaleString()}
                </div>
                <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                  折舊/水電/薪資/維護/資本
                </div>
              </div>

              <!-- 營業毛利與毛利率 -->
              <div class="p-3.5 rounded-xl bg-slate-900/80 border ${n.grossMarginPct>=53?"border-emerald-500/50 bg-emerald-950/20":"border-slate-800"}">
                <div class="text-[10px] text-slate-400 font-medium flex items-center justify-between">
                  <span>營業毛利率 (Gross Margin)</span>
                  ${n.grossMarginPct>=53?'<span class="text-[9px] text-emerald-400 font-bold">★TSMC標竿</span>':""}
                </div>
                <div class="text-base font-black font-mono ${n.grossMarginPct>=50?"text-emerald-400":n.grossMarginPct>=30?"text-cyan-300":"text-amber-400"} mt-1">
                  ${n.grossMarginPct}%
                </div>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                  毛利: NT$ ${Math.round(n.grossProfit).toLocaleString()}
                </div>
              </div>

              <!-- 淨利與淨利率 -->
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div class="text-[10px] text-slate-400 font-medium">營業淨利潤 (Net Profit)</div>
                <div class="text-base font-black font-mono ${n.netProfit>=0?"text-emerald-400":"text-red-400"} mt-1">
                  ${n.netProfit>=0?"+":""}NT$ ${Math.round(n.netProfit).toLocaleString()}
                </div>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                  淨利率: ${n.netMarginPct}%
                </div>
              </div>
            </div>

            <!-- 收支結構明細表 (Detailed Breakdown Table) -->
            <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <span class="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>📑</span>
                  <span>${n.label} — 收支會計明細科目</span>
                </span>
                <span class="text-[11px] font-mono text-slate-400">
                  期末留存現金: <strong class="text-amber-300">NT$ ${Math.round(n.endingCash).toLocaleString()}</strong>
                </span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <!-- 收入欄 -->
                <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div class="text-[11px] font-bold text-cyan-300 border-b border-slate-800 pb-1 flex justify-between">
                    <span>【一、 營業收入科目 (Revenue)】</span>
                    <span>金額 (NT$)</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>晶圓代工出貨尾款 (Wafer Sales)</span>
                    <span class="font-bold text-slate-100">NT$ ${Math.round(n.revenue.waferSales).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>客戶 NRE 光罩開發款 (Mask Fees)</span>
                    <span class="font-bold text-slate-100">NT$ ${Math.round(n.revenue.nreFees).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>政府研發補助與成就獎勵 (Subsidies)</span>
                    <span class="font-bold text-slate-100">NT$ ${Math.round(n.revenue.subsidies).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-cyan-300 font-bold border-t border-slate-800 pt-1.5">
                    <span>營業收入總計 (Total Gross Revenue)</span>
                    <span>NT$ ${Math.round(n.revenue.totalRevenue).toLocaleString()}</span>
                  </div>
                </div>

                <!-- 支出欄 -->
                <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-2">
                  <div class="text-[11px] font-bold text-amber-300 border-b border-slate-800 pb-1 flex justify-between">
                    <span>【二、 營業成本與費用 (Costs & Expenses)】</span>
                    <span>金額 (NT$)</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>機台運轉折舊攤提 (Depreciation)</span>
                    <span class="text-slate-200">NT$ ${Math.round(n.expenses.depreciation).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>設備日常保養與大修 (Maintenance)</span>
                    <span class="text-slate-200">NT$ ${Math.round(n.expenses.maintenance).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>超純水、特氣與無塵室電費 (Utilities)</span>
                    <span class="text-slate-200">NT$ ${Math.round(n.expenses.utilities).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>員工薪資與招募獎金 (Payroll & HR)</span>
                    <span class="text-slate-200">NT$ ${Math.round(n.expenses.payroll).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>晶圓不良報廢與重洗損失 (Scraps)</span>
                    <span class="text-slate-200">NT$ ${Math.round(n.expenses.scraps).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>機台設備採購支出 (CapEx)</span>
                    <span class="text-slate-200">NT$ ${Math.round(n.expenses.capex).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-amber-300 font-bold border-t border-slate-800 pt-1.5">
                    <span>總營業支出總計 (Total Expenses)</span>
                    <span>NT$ ${Math.round(n.expenses.totalExpenses).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 歷史走勢長條圖 (Historical Bar Chart) -->
            <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>📈</span>
                  <span>歷史${i}獲利趨勢走勢圖 (近 ${r.length+1} 期)</span>
                </span>
                <div class="flex items-center gap-3 text-[10px] font-mono">
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span> 營業收入</span>
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> 營業支出</span>
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> 淨獲利</span>
                </div>
              </div>

              <!-- 長條圖視覺容器 -->
              <div class="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-end justify-between gap-2 h-44 overflow-x-auto pt-4">
                ${this.renderHistoryBars([n,...r].slice(0,10).reverse())}
              </div>
            </div>

            <!-- 財務長 (CFO) 營運診斷評語 (Executive Advisory) -->
            <div class="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border ${d.rating==="EXCELLENT"?"border-emerald-500/60 bg-emerald-950/10":d.rating==="GOOD"?"border-cyan-500/50 bg-cyan-950/10":d.rating==="WARNING"?"border-amber-500/50 bg-amber-950/10":"border-red-500/60 bg-red-950/10"} flex items-start gap-3.5">
              <div class="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl flex-shrink-0 shadow">
                🧑‍💼
              </div>
              <div class="space-y-1 text-xs">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white text-sm">${d.title}</span>
                  <span class="px-2 py-0.2 rounded text-[10px] font-mono ${d.rating==="EXCELLENT"?"bg-emerald-950 text-emerald-300 border border-emerald-500/40":d.rating==="GOOD"?"bg-cyan-950 text-cyan-300 border border-cyan-500/40":d.rating==="WARNING"?"bg-amber-950 text-amber-300 border border-amber-500/40":"bg-red-950 text-red-300 border border-red-500/40"}">
                    ${d.rating}
                  </span>
                </div>
                <p class="text-slate-300 leading-relaxed font-sans">
                  ${d.advice}
                </p>
                <div class="text-[11px] text-cyan-400 font-mono pt-0.5">
                  指標分析: ${d.metrics}
                </div>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="modal-footer p-3.5 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between px-6 flex-shrink-0">
            <div class="text-xs text-slate-400 font-mono">
              全生涯累積營收: <strong class="text-cyan-300 font-bold">NT$ ${Math.round(a.allTimeRevenue).toLocaleString()}</strong>
              <span class="mx-2">|</span>
              全生涯累積淨利: <strong class="${a.allTimeProfit>=0?"text-emerald-400":"text-red-400"} font-bold">NT$ ${Math.round(a.allTimeProfit).toLocaleString()}</strong>
            </div>

            <button id="btn-back-finance" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `,this.bindEvents(e,t,s)}static renderHistoryBars(e){if(e.length===0)return'<div class="text-center w-full py-10 text-slate-500 text-xs font-mono">暫無足夠歷史數據，產線持續運轉中...</div>';const t=Math.max(...e.map(s=>Math.max(s.revenue.totalRevenue,s.expenses.totalExpenses,Math.abs(s.netProfit))),1e5);return e.map((s,a)=>{const n=a===e.length-1,r=Math.min(100,Math.max(4,Math.round(s.revenue.totalRevenue/t*100))),i=Math.min(100,Math.max(4,Math.round(s.expenses.totalExpenses/t*100))),o=Math.min(100,Math.max(4,Math.round(Math.abs(s.netProfit)/t*100)));return`
        <div class="flex-1 flex flex-col items-center justify-end h-full min-w-[50px] group relative">
          <!-- Tooltip on hover -->
          <div class="absolute -top-12 bg-slate-900 border border-slate-700 text-[10px] text-white p-1.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
            <div>${s.label}</div>
            <div class="text-cyan-300">營收: NT$ ${Math.round(s.revenue.totalRevenue).toLocaleString()}</div>
            <div class="text-amber-300">支出: NT$ ${Math.round(s.expenses.totalExpenses).toLocaleString()}</div>
            <div class="${s.netProfit>=0?"text-emerald-400":"text-red-400"}">淨利: NT$ ${Math.round(s.netProfit).toLocaleString()}</div>
          </div>

          <!-- Bar group -->
          <div class="flex items-end gap-1 w-full justify-center h-28 border-b border-slate-700/60 pb-1">
            <!-- 營收柱 -->
            <div
              class="w-2.5 rounded-t bg-cyan-500 group-hover:bg-cyan-400 transition-all shadow-sm"
              style="height: ${r}%;"
              title="營業收入"
            ></div>
            <!-- 支出柱 -->
            <div
              class="w-2.5 rounded-t bg-amber-500 group-hover:bg-amber-400 transition-all shadow-sm"
              style="height: ${i}%;"
              title="營業支出"
            ></div>
            <!-- 淨利柱 -->
            <div
              class="w-2.5 rounded-t ${s.netProfit>=0?"bg-emerald-500 group-hover:bg-emerald-400":"bg-red-500 group-hover:bg-red-400"} transition-all shadow-sm"
              style="height: ${o}%;"
              title="營業淨利"
            ></div>
          </div>

          <!-- Label -->
          <div class="text-[9px] font-mono mt-1 truncate max-w-full ${n?"text-cyan-400 font-bold":"text-slate-400"}">
            ${s.periodType==="DAY"?`D${s.periodIndex}`:s.periodType==="WEEK"?`W${s.periodIndex}`:`M${s.periodIndex}`}
            ${n?"*":""}
          </div>
        </div>
      `}).join("")}static bindEvents(e,t,s){var r,i,o,l,d,p;const a=()=>{x.playClick(),e.innerHTML="",window.removeEventListener("keydown",n)},n=c=>{c.key==="Escape"&&a()};window.addEventListener("keydown",n),(r=document.getElementById("btn-close-finance"))==null||r.addEventListener("click",a),(i=document.getElementById("btn-back-finance"))==null||i.addEventListener("click",a),(o=document.getElementById("modal-backdrop-finance"))==null||o.addEventListener("click",c=>{c.target===document.getElementById("modal-backdrop-finance")&&a()}),(l=document.getElementById("tab-finance-day"))==null||l.addEventListener("click",()=>{x.playClick(),this.activeTab="DAY",this.render(e,t,s)}),(d=document.getElementById("tab-finance-week"))==null||d.addEventListener("click",()=>{x.playClick(),this.activeTab="WEEK",this.render(e,t,s)}),(p=document.getElementById("tab-finance-month"))==null||p.addEventListener("click",()=>{x.playClick(),this.activeTab="MONTH",this.render(e,t,s)})}}w(ue,"activeTab","DAY");class J{static show(e,t,s=!0){const a=document.getElementById("modal-container");if(!a)return;const n=M.getActiveUserProfile();this.selectedUserId=n.id,this.isEditingName=!1,this.isCreatingUser=!1,this.render(a,e,t,s)}static render(e,t,s,a){const n=M.getUserProfiles();!this.selectedUserId&&n.length>0&&(this.selectedUserId=n[0].id);const r=n.find(i=>i.id===this.selectedUserId)||n[0];e.innerHTML=`
      <div id="modal-backdrop-login" class="modal-backdrop">
        <div class="modal-content pvz-dialog max-w-lg border-2 border-amber-500/70 bg-slate-950/95 shadow-2xl shadow-amber-900/40 rounded-2xl overflow-hidden animate-scaleUp">
          
          <!-- PvZ Style Header -->
          <div class="modal-header bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border-b border-amber-500/40 p-4 text-center relative flex-shrink-0">
            <div class="text-xl font-black text-amber-300 tracking-wider flex items-center justify-center gap-2 drop-shadow">
              <span>👤</span>
              <span>請選擇使用者 (Who are you?)</span>
            </div>
            <p class="text-xs text-amber-200/70 mt-1 font-sans">
              歡迎回到《矽島霸權》！請點選您的執行長存檔，或建立新玩家身分。
            </p>
            ${a?`
              <button id="btn-close-login" class="absolute right-4 top-4 w-7 h-7 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 flex items-center justify-center text-xs font-bold border border-slate-700">
                ✕
              </button>
            `:""}
          </div>

          <!-- Body -->
          <div class="modal-body p-5 space-y-4 overflow-y-auto max-h-[60vh]">
            
            <!-- 使用者存檔列表 (PvZ 捲軸清單) -->
            <div class="space-y-2.5 bg-slate-900/80 p-3 rounded-xl border border-amber-500/30 max-h-56 overflow-y-auto">
              ${n.map(i=>{const o=i.id===this.selectedUserId,l=new Date(i.lastPlayedAt).toLocaleDateString()+" "+new Date(i.lastPlayedAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});return`
                  <div
                    class="user-profile-item p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${o?"bg-amber-950/40 border-amber-400 shadow-md shadow-amber-500/20 text-white":"bg-slate-950/60 border-slate-800/80 hover:border-amber-500/40 text-slate-300"}"
                    data-user-id="${i.id}"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-8 h-8 rounded-full border ${o?"border-amber-400 bg-amber-500/20 text-amber-300":"border-slate-700 bg-slate-900 text-slate-400"} flex items-center justify-center font-bold text-sm flex-shrink-0">
                        ${o?"★":"👤"}
                      </div>
                      <div class="min-w-0">
                        <div class="font-bold text-sm truncate ${o?"text-amber-300":"text-slate-200"}">
                          ${i.name}
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono truncate">
                          ${i.companyName}
                        </div>
                      </div>
                    </div>

                    <div class="text-right flex-shrink-0 font-mono text-xs">
                      <div class="text-cyan-400 font-bold">Tier ${i.foundryTier}</div>
                      <div class="text-amber-300/90 text-[10px]">NT$ ${Math.round(i.cash).toLocaleString()}</div>
                      <div class="text-slate-500 text-[9px]">${l}</div>
                    </div>
                  </div>
                `}).join("")}
            </div>

            <!-- 創建新使用者輸入欄 (點擊「建立新使用者」時展開) -->
            <div id="create-user-section" class="${this.isCreatingUser?"block":"hidden"} p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-2.5 animate-fadeIn">
              <div class="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>➕</span>
                <span>建立新執行長存檔：</span>
              </div>
              <div class="space-y-2">
                <input
                  id="input-new-username"
                  type="text"
                  maxlength="16"
                  placeholder="輸入執行長姓名 (例如: 張忠謀 / Alex)"
                  class="w-full px-3 py-2 text-xs bg-slate-950 border border-amber-500/40 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
                <input
                  id="input-new-company"
                  type="text"
                  maxlength="20"
                  placeholder="公司名稱 (預設: 執行長名 + 半導體)"
                  class="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>
              <div class="flex justify-end gap-2 pt-1">
                <button id="btn-cancel-create" class="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg">
                  取消
                </button>
                <button id="btn-confirm-create" class="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-lg shadow-md">
                  確認建立
                </button>
              </div>
            </div>

            <!-- 重新命名輸入欄 (點擊「重新命名」時展開) -->
            <div id="rename-user-section" class="${this.isEditingName?"block":"hidden"} p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/40 space-y-2.5 animate-fadeIn">
              <div class="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <span>✏️</span>
                <span>修改目前選中存檔姓名：</span>
              </div>
              <input
                id="input-rename-username"
                type="text"
                maxlength="16"
                value="${r?r.name:""}"
                placeholder="輸入新名稱"
                class="w-full px-3 py-2 text-xs bg-slate-950 border border-cyan-500/40 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
              <div class="flex justify-end gap-2 pt-1">
                <button id="btn-cancel-rename" class="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 rounded-lg">
                  取消
                </button>
                <button id="btn-confirm-rename" class="px-3.5 py-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-md">
                  儲存新名稱
                </button>
              </div>
            </div>

            <!-- 操作按鈕列 (建立、重命名、刪除) -->
            <div class="grid grid-cols-3 gap-2 text-xs">
              <button id="btn-create-user-toggle" class="btn-sci-fi justify-center py-2 bg-amber-900/30 hover:bg-amber-800/40 border-amber-500/40 text-amber-200">
                ➕ 建立新玩家
              </button>
              <button id="btn-rename-user-toggle" class="btn-sci-fi justify-center py-2 bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200">
                ✏️ 重新命名
              </button>
              <button id="btn-delete-user" class="btn-sci-fi justify-center py-2 bg-red-950/40 hover:bg-red-900/60 border-red-800/40 text-red-300">
                🗑️ 刪除存檔
              </button>
            </div>

            <!-- 整機重置 (全部刪除) -->
            <div class="pt-2 flex items-center justify-between border-t border-slate-800/80">
              <button id="btn-factory-reset-login" class="text-[11px] text-red-400 hover:text-red-300 hover:underline flex items-center gap-1.5 transition-colors cursor-pointer" title="清除本裝置所有玩家存檔與紀錄，從零開始體驗">
                <span>💥</span>
                <span>整機資料重置 (清除全部資料與教學，重新開始)</span>
              </button>
            </div>

          </div>

          <!-- PvZ Footer: OK (進入遊戲) / Cancel -->
          <div class="modal-footer p-3.5 border-t border-amber-500/30 bg-slate-900/90 flex items-center justify-between px-6 flex-shrink-0">
            <div class="text-xs text-slate-400 font-mono">
              目前選取: <strong class="text-amber-300">${r?r.name:"未選擇"}</strong>
            </div>

            <div class="flex items-center gap-3">
              ${a?`
                <button id="btn-cancel-login" class="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                  取消
                </button>
              `:""}
              <button id="btn-confirm-play" class="btn-sci-fi px-6 py-2 text-xs font-black bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-600/30 border-amber-400">
                ▶️ 進入遊戲 (OK)
              </button>
            </div>
          </div>

        </div>
      </div>
    `,this.bindEvents(e,t,s,a)}static bindEvents(e,t,s,a){var i,o,l,d,p,c,m,u,h,f,g,y;const n=()=>{x.playClick(),e.innerHTML="",window.removeEventListener("keydown",r)},r=T=>{T.key==="Escape"&&a&&n()};window.addEventListener("keydown",r),a&&((i=document.getElementById("btn-close-login"))==null||i.addEventListener("click",n),(o=document.getElementById("btn-cancel-login"))==null||o.addEventListener("click",n),(l=document.getElementById("modal-backdrop-login"))==null||l.addEventListener("click",T=>{T.target===document.getElementById("modal-backdrop-login")&&n()})),e.querySelectorAll(".user-profile-item").forEach(T=>{T.addEventListener("click",E=>{const v=E.currentTarget.getAttribute("data-user-id");v&&(x.playClick(),this.selectedUserId=v,this.isEditingName=!1,this.isCreatingUser=!1,this.render(e,t,s,a))})}),(d=document.getElementById("btn-create-user-toggle"))==null||d.addEventListener("click",()=>{x.playClick(),this.isCreatingUser=!this.isCreatingUser,this.isEditingName=!1,this.render(e,t,s,a)}),(p=document.getElementById("btn-cancel-create"))==null||p.addEventListener("click",()=>{x.playClick(),this.isCreatingUser=!1,this.render(e,t,s,a)}),(c=document.getElementById("btn-confirm-create"))==null||c.addEventListener("click",()=>{const T=document.getElementById("input-new-username"),E=document.getElementById("input-new-company"),v=(T==null?void 0:T.value.trim())||"",b=(E==null?void 0:E.value.trim())||void 0;if(!v){alert("請輸入執行長姓名！");return}x.playCoinChime();const k=M.createUser(v,b);this.selectedUserId=k.id,this.isCreatingUser=!1,this.render(e,t,s,a)}),(m=document.getElementById("btn-rename-user-toggle"))==null||m.addEventListener("click",()=>{this.selectedUserId&&(x.playClick(),this.isEditingName=!this.isEditingName,this.isCreatingUser=!1,this.render(e,t,s,a))}),(u=document.getElementById("btn-cancel-rename"))==null||u.addEventListener("click",()=>{x.playClick(),this.isEditingName=!1,this.render(e,t,s,a)}),(h=document.getElementById("btn-confirm-rename"))==null||h.addEventListener("click",()=>{if(!this.selectedUserId)return;const T=document.getElementById("input-rename-username"),E=T==null?void 0:T.value.trim();if(!E){alert("名稱不能為空！");return}x.playClick(),M.renameUser(this.selectedUserId,E),this.isEditingName=!1,this.render(e,t,s,a)}),(f=document.getElementById("btn-delete-user"))==null||f.addEventListener("click",()=>{if(!this.selectedUserId)return;const T=M.getUserProfiles(),E=T.find(b=>b.id===this.selectedUserId);if(!E)return;if(T.length<=1){alert("這是唯一的玩家存檔，無法刪除！");return}if(!confirm(`確定要徹底刪除玩家【${E.name}】（${E.companyName}）的存檔嗎？此動作不可逆！`))return;x.playClick();const v=M.deleteUser(this.selectedUserId);if(!v.success){alert(v.message||"刪除失敗");return}this.selectedUserId=M.getActiveUserProfile().id,this.render(e,t,s,a)}),(g=document.getElementById("btn-factory-reset-login"))==null||g.addEventListener("click",()=>{x.playClick(),confirm(`⚠️ 警告：整機資料重置將徹底清除本裝置上的所有玩家帳號、廠房進度、財務紀錄與暫存設定，無法復原！

確定要刪除裝置全部資料使玩家能從零開始重新體驗嗎？`)&&(M.factoryResetAllData(),alert("整機資料已全數清除！即將重新啟動遊戲。"),window.location.reload())}),(y=document.getElementById("btn-confirm-play"))==null||y.addEventListener("click",()=>{if(!this.selectedUserId)return;x.playCoinChime();const T=M.switchActiveUser(this.selectedUserId);if(!T){alert("載入該存檔失敗，將進入預設存檔！");return}n(),s(T)})}}w(J,"selectedUserId",null),w(J,"isEditingName",!1),w(J,"isCreatingUser",!1);class ye{constructor(e,t,s,a,n){w(this,"topHUD");w(this,"state");w(this,"onStateUpdated");w(this,"onUserSwitched");w(this,"onTogglePlanner");w(this,"isPlannerActive",!1);w(this,"currentPlannerTool","MOVE_MACHINE");this.state=e,this.onStateUpdated=s,this.onUserSwitched=a,this.onTogglePlanner=n,this.topHUD=new xe("top-hud",{onOpenContracts:()=>this.openContracts(),onOpenStore:()=>this.openStore(),onOpenHR:()=>this.openHR(),onOpenQuests:()=>this.openQuests(),onOpenAchievements:()=>this.openAchievements(),onOpenAdvisory:()=>this.openAdvisory(),onToggleMES:r=>this.onStateUpdated(),onOpenSaveModal:()=>this.openSaveModal(),onOpenWaferMap:()=>this.openWaferMap(),onOpenTutorial:()=>this.openTutorial(),onOpenFinance:()=>this.openFinancialReport(),onOpenLogin:()=>this.openUserLogin(),onOpenPlanner:()=>this.togglePlannerMode(),onOpenTechTree:()=>this.openTechTree(),onOpenFactoryReset:()=>this.openFactoryResetConfirmation()}),te.init(e,t,s),!e.player.companyName||e.player.companyName==="矽島先進半導體"?ne.show(e,()=>{this.render(),this.onStateUpdated(),V.isCompleted(this.state)||this.openTutorial()}):V.isCompleted(this.state)||setTimeout(()=>this.openTutorial(),400),this.render()}render(){this.topHUD.render(this.state),this.renderOrderStatusWidget()}renderOrderStatusWidget(){var T,E,v;const e=document.getElementById("hud-widgets");if(!e)return;if(this.state.activeOrders.length===0){e.innerHTML=`
        <div id="hud-order-status-bar" class="hud-order-bar order-empty cursor-pointer">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl flex-shrink-0">
              📋
            </div>
            <div>
              <div class="text-sm font-bold text-amber-300 flex items-center gap-2">
                <span>【產線待命中】尚未承接晶圓代工訂單</span>
                <span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/30">IDLE</span>
              </div>
              <div class="text-xs text-slate-400 mt-0.5">
                廠內機台全數閒置中，立即點擊開啟【合約公告板】承接新晶圓訂單投產！
              </div>
            </div>
          </div>
          <button id="btn-order-cta" class="btn-sci-fi text-xs font-bold py-2 px-4 bg-gradient-to-r from-amber-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 text-white shadow-lg flex-shrink-0 animate-pulse">
            🚀 立即承接訂單 (Open Contracts)
          </button>
        </div>
      `,(T=document.getElementById("hud-order-status-bar"))==null||T.addEventListener("click",()=>{x.playClick(),this.openContracts()});return}const t=this.state.activeOrders[0],s=this.state.activeLots.filter(b=>b.orderId===t.id),a=s.find(b=>b.status==="PROCESSING")||s[0],n=t.goodDiesDelivered,r=t.totalDies,i=Math.min(100,Math.round(n/Math.max(1,r)*100)),o=a?a.currentLayer:1,l=a?a.totalLayers:t.layerCount||10,d=a?a.currentStation:"FILM",p=a?a.litSubStep:void 0;let c=d;d==="LIT"&&(p==="COAT"||p==="DEVELOP"?c="TRACK":c="LITHO");const m=this.state.machines.find(b=>b.category===c);let u="";if(a&&a.qTimeDeadline){const b=Math.max(0,Math.round(a.qTimeDeadline-this.state.gameTime));u=`
        <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold ${b<=15?"bg-red-950 text-red-300 border border-red-500/50 animate-pulse":"bg-amber-950 text-amber-300 border border-amber-500/30"}">
          ⏱️ Q-Time: ${b}s
        </span>
      `}const h=this.state.unlockedFeatures.cmp,f=[{key:"FILM",name:"薄膜沉積",en:"FILM",icon:"🧪",match:(b,k)=>b==="FILM"},{key:"TRACK_COAT",name:"光阻塗膠",en:"TRACK",icon:"🌀",match:(b,k)=>b==="LIT"&&k==="COAT"},{key:"LITHO",name:"微影曝光",en:"LITHO",icon:"🔬",match:(b,k)=>b==="LIT"&&k==="EXPOSE"},{key:"TRACK_DEV",name:"顯影烘烤",en:"DEVELOP",icon:"♨️",match:(b,k)=>b==="LIT"&&k==="DEVELOP"},{key:"ETCH",name:"電漿蝕刻",en:"ETCH",icon:"⚡",match:(b,k)=>b==="ETCH"},{key:"DIFF",name:"高溫擴散",en:"DIFF",icon:"🔥",match:(b,k)=>b==="DIFF"}];h&&f.push({key:"CMP",name:"平坦化研磨",en:"CMP",icon:"💎",match:b=>b==="CMP"});let g=-1;a&&a.status==="PROCESSING"&&(g=f.findIndex(b=>b.match(a.currentStation,a.litSubStep)));const y=t.goodDiesDelivered>=t.totalDies||s.length>0&&s.every(b=>b.status==="COMPLETED");e.innerHTML=`
      <div id="hud-order-status-bar" class="hud-order-bar cursor-pointer" title="點擊檢視訂單詳情與批次資訊">
        <!-- 上方：訂單資訊、良品產能、機台指派與動作按鈕 -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-lg flex-shrink-0 text-cyan-400">
              ⚙️
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-white text-sm">【${t.clientName}】</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  ${t.nodeNm}nm 工藝
                </span>
                <span class="text-xs text-slate-300 font-mono">
                  第 <strong class="text-cyan-300">${o}</strong> / ${l} 層
                </span>
                ${this.state.activeOrders.length>1?`<span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">共 ${this.state.activeOrders.length} 筆在製</span>`:""}
              </div>
              <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono flex-wrap">
                <span>交付進度: <strong class="text-amber-300">${n} / ${r} 顆</strong> (${i}%)</span>
                <span class="text-slate-600">|</span>
                <span>所在機台: <strong class="${(m==null?void 0:m.status)==="EXPLODED"?"text-red-400 font-bold animate-pulse":"text-cyan-300"}">📍 ${m?m.name:"產線調度中"}</strong></span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-cyan-300">
                  ⏱️ 站點進度: <strong>${a&&a.stationProgressSeconds||0}s</strong> / ${a&&a.stationRequiredSeconds||10}s
                </span>
                ${a!=null&&a.hasYellowRoomViolation?`
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-500/60 animate-pulse">
                    🚨 致命白光污染！微影設備未在黃光區 (良率 0%)
                  </span>
                `:""}
                ${u}
              </div>
            </div>
          </div>

          <!-- 右側狀態與按鈕 -->
          <div class="flex items-center gap-2">
            ${y?`
              <button id="btn-bar-action" class="btn-sci-fi text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold animate-bounce shadow-md shadow-emerald-500/30">
                📦 晶圓已完工！出貨結算
              </button>
            `:`
              <button id="btn-bar-action" class="btn-sci-fi text-xs py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200">
                📋 訂單與工單詳情
              </button>
            `}
          </div>
        </div>

        <!-- 進度條 -->
        <div class="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div class="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300" style="width: ${i}%"></div>
        </div>

        <!-- 下方：全機台流程 Pipeline -->
        <div class="flex items-center gap-1.5 w-full overflow-x-auto pt-1">
          ${f.map((b,k)=>{let D="step-waiting",O="待加工",S="text-slate-500";if(y)D="step-completed",O="✓ 完工",S="text-emerald-400";else if(k<g)D="step-completed",O="✓ 完工",S="text-emerald-400";else if(k===g){const G=(a==null?void 0:a.stationProgressSeconds)||0,z=(a==null?void 0:a.stationRequiredSeconds)||10;D="step-active",O=`⚡ ${G}/${z}s`,S="text-cyan-300 font-bold"}const L=b.key.startsWith("TRACK")?"TRACK":b.key==="LITHO"?"LITHO":b.key,_=this.state.machines.find(G=>G.category===L),Y=(_==null?void 0:_.status)==="EXPLODED";return`
              <div class="pipeline-step ${D} ${Y?"border-red-500/80 bg-red-950/30":""}" title="${b.name} (${b.en})${_?" - "+_.name:""}">
                <div class="flex items-center gap-1 text-xs">
                  <span>${b.icon}</span>
                  <span class="font-bold text-white text-[11px] truncate">${b.name}</span>
                </div>
                <div class="flex items-center justify-between w-full px-1 text-[10px] mt-0.5">
                  <span class="font-mono text-slate-400 text-[9px]">${b.en}</span>
                  <span class="${Y?"text-red-400 font-bold animate-pulse":S}">
                    ${Y?"💥故障":O}
                  </span>
                </div>
              </div>
              ${k<f.length-1?'<span class="text-slate-600 text-xs flex-shrink-0 font-bold">➔</span>':""}
            `}).join("")}
        </div>
      </div>
    `,(E=document.getElementById("hud-order-status-bar"))==null||E.addEventListener("click",b=>{b.stopPropagation(),x.playClick(),this.openContracts()}),(v=document.getElementById("btn-bar-action"))==null||v.addEventListener("click",b=>{b.stopPropagation(),x.playClick(),this.openContracts()})}togglePlannerMode(e){var t;this.isPlannerActive=e!==void 0?e:!this.isPlannerActive,this.isPlannerActive&&this.currentPlannerTool==="NONE"&&(this.currentPlannerTool="MOVE_MACHINE"),(t=this.onTogglePlanner)==null||t.call(this,this.isPlannerActive,this.currentPlannerTool),this.renderPlannerToolbar()}setPlannerTool(e){var t;this.currentPlannerTool=e,(t=this.onTogglePlanner)==null||t.call(this,this.isPlannerActive,e),this.renderPlannerToolbar()}renderPlannerToolbar(){var t,s,a,n;let e=document.getElementById("planner-toolbar");if(!this.isPlannerActive){e&&e.remove();return}e||(e=document.createElement("div"),e.id="planner-toolbar",document.body.appendChild(e)),e.className="fixed top-18 left-1/2 -translate-x-1/2 z-50 glass-panel p-3 border-2 border-amber-500/70 shadow-2xl rounded-2xl flex flex-wrap items-center gap-3 animate-scaleUp pointer-events-auto bg-slate-950/95",e.innerHTML=`
      <div class="flex items-center gap-2 border-r border-slate-700/80 pr-3">
        <span class="text-xl">🏗️</span>
        <div>
          <div class="text-xs font-black text-amber-300 flex items-center gap-1.5">
            <span>廠房機台與黃光區規劃</span>
            <span class="px-1.5 py-0.2 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-500/40">EDIT</span>
          </div>
          <div class="text-[10px] text-slate-400">微影機 (Scanner) 未在黃光區良率將為 0%！</div>
        </div>
      </div>

      <div class="flex items-center gap-1.5">
        <button id="btn-planner-move" class="btn-sci-fi text-xs py-1.5 px-3 ${this.currentPlannerTool==="MOVE_MACHINE"?"bg-emerald-600 text-white font-bold shadow-md shadow-emerald-500/40 border-emerald-400 ring-2 ring-emerald-400/50":"bg-slate-900 border-emerald-500/40 text-emerald-300 hover:bg-slate-800"}">
          🚜 搬移機台
        </button>
        <button id="btn-planner-yellow" class="btn-sci-fi text-xs py-1.5 px-3 ${this.currentPlannerTool==="PAINT_YELLOW"?"bg-amber-600 text-white font-bold shadow-md shadow-amber-500/40 border-amber-400 ring-2 ring-amber-400/50":"bg-slate-900 border-amber-500/40 text-amber-300 hover:bg-slate-800"}">
          🟡 劃設黃光區
        </button>
        <button id="btn-planner-white" class="btn-sci-fi text-xs py-1.5 px-3 ${this.currentPlannerTool==="PAINT_WHITE"?"bg-cyan-600 text-white font-bold shadow-md shadow-cyan-500/40 border-cyan-400 ring-2 ring-cyan-400/50":"bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800"}">
          🏢 還原潔淨室
        </button>
      </div>

      <div class="border-l border-slate-700/80 pl-2">
        <button id="btn-planner-exit" class="btn-sci-fi text-xs py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white border-slate-600">
          💾 完成規劃
        </button>
      </div>
    `,(t=document.getElementById("btn-planner-move"))==null||t.addEventListener("click",r=>{r.stopPropagation(),x.playClick(),this.setPlannerTool("MOVE_MACHINE")}),(s=document.getElementById("btn-planner-yellow"))==null||s.addEventListener("click",r=>{r.stopPropagation(),x.playClick(),this.setPlannerTool("PAINT_YELLOW")}),(a=document.getElementById("btn-planner-white"))==null||a.addEventListener("click",r=>{r.stopPropagation(),x.playClick(),this.setPlannerTool("PAINT_WHITE")}),(n=document.getElementById("btn-planner-exit"))==null||n.addEventListener("click",r=>{r.stopPropagation(),x.playClick(),this.togglePlannerMode(!1),this.onStateUpdated()})}openContracts(){ee.show(this.state,()=>{this.render(),this.onStateUpdated()})}openStore(){j.show(this.state,()=>{this.render(),this.onStateUpdated()})}openHR(){U.show(this.state,()=>{this.render(),this.onStateUpdated()})}openQuests(){ge.show(this.state,()=>{this.render(),this.onStateUpdated()})}openAchievements(){pe.show(this.state,()=>{this.render(),this.onStateUpdated()})}openAdvisory(){be.show(this.state,()=>{this.openStore()},()=>{this.openHR()})}openWaferMap(e){K.show(this.state,e,()=>{this.render(),this.onStateUpdated()})}openLayerAllocation(e){Z.show(this.state,e,()=>{this.render(),this.onStateUpdated()})}updateState(e){this.state=e,this.topHUD.rebuild(),this.render()}openFinancialReport(){ue.show(this.state,()=>{this.render(),this.onStateUpdated()})}openTechTree(){ie.show(this.state,()=>{this.render(),this.onStateUpdated()})}openUserLogin(){J.show(this.state,e=>{var t;this.state=e,(t=this.onUserSwitched)==null||t.call(this,e),this.render(),this.onStateUpdated(),V.isCompleted(e)||setTimeout(()=>this.openTutorial(),400)})}openTutorial(e){V.show(this.state,()=>{this.render(),this.onStateUpdated()},e)}openSaveModal(){var a,n,r,i,o,l;const e=document.getElementById("modal-container");if(!e)return;const t=d=>{d.key==="Escape"&&(e.innerHTML="",window.removeEventListener("keydown",t))};window.addEventListener("keydown",t);const s=()=>{x.playClick(),e.innerHTML="",window.removeEventListener("keydown",t)};e.innerHTML=`
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
    `,(a=document.getElementById("btn-close-save-modal"))==null||a.addEventListener("click",s),(n=document.getElementById("btn-return-save"))==null||n.addEventListener("click",s),(r=document.getElementById("modal-backdrop-save"))==null||r.addEventListener("click",d=>{d.target===d.currentTarget&&s()}),(i=document.getElementById("btn-export-save"))==null||i.addEventListener("click",()=>{x.playClick();const d=M.exportSaveToJson(this.state),p=new Blob([d],{type:"application/json"}),c=URL.createObjectURL(p),m=document.createElement("a");m.href=c,m.download=`silicon_tycoon_save_${Date.now()}.json`,m.click(),URL.revokeObjectURL(c)}),(o=document.getElementById("btn-import-save"))==null||o.addEventListener("click",()=>{var d;(d=document.getElementById("file-import-save"))==null||d.click()}),(l=document.getElementById("file-import-save"))==null||l.addEventListener("change",d=>{var c;const p=(c=d.target.files)==null?void 0:c[0];if(p){const m=new FileReader;m.onload=u=>{var g;const h=(g=u.target)==null?void 0:g.result,f=M.importSaveFromJson(h);f.success&&f.state?(M.saveToLocalStorage(f.state),alert("存檔匯入成功！即將重新載入遊戲。"),window.location.reload()):alert(`匯入失敗: ${f.error}`)},m.readAsText(p)}})}showNotice(e){const t=document.createElement("div");t.className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs font-medium shadow-2xl animate-bounce",t.innerText=e,document.body.appendChild(t),setTimeout(()=>t.remove(),2500)}openFactoryResetConfirmation(){var a,n,r;const e=document.getElementById("modal-container");if(!e)return;x.playClick();const t=()=>{e.innerHTML="",window.removeEventListener("keydown",s)},s=i=>{i.key==="Escape"&&t()};window.addEventListener("keydown",s),e.innerHTML=`
      <div id="modal-backdrop-reset" class="modal-backdrop">
        <div class="modal-content glass-panel max-w-md border-2 border-red-500/80 bg-slate-950 text-slate-100 p-6 rounded-2xl shadow-2xl shadow-red-950/60 animate-scaleUp">
          <div class="flex items-center gap-3 text-red-400 text-base font-black border-b border-red-500/30 pb-3">
            <span class="text-2xl">⚠️</span>
            <span>高風險操作：整機資料重置確認</span>
          </div>

          <div class="py-4 text-xs text-slate-300 space-y-3 leading-relaxed">
            <p class="text-red-300 font-bold">
              您即將徹底清空本裝置（瀏覽器）上的所有《Silicon Tycoon》遊戲存檔與資料！
            </p>
            <div class="p-3 bg-red-950/30 border border-red-500/40 rounded-xl space-y-1.5 text-[11px] text-slate-300">
              <div>• 💥 徹底刪除所有玩家帳號、執行長身分與歷史成就記錄</div>
              <div>• 🏭 清空所有廠房無塵室機台配置、科技研發與累積資金</div>
              <div>• 🔄 重置新手教學標記，使玩家能從零開始重新體驗完整流程</div>
              <div>• 🚫 此動作不可逆，無法復原未匯出之存檔！</div>
            </div>
            <p class="text-slate-400 text-[11px]">
              若您確認要徹底刪除全部資料重新開始，請點擊下方紅色按鈕。
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button id="btn-cancel-factory-reset" class="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer">
              取消返回
            </button>
            <button id="btn-confirm-factory-reset" class="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg shadow-lg shadow-red-900/50 flex items-center gap-1.5 transition-all cursor-pointer">
              <span>💥</span>
              <span>確定清空全部資料並重置</span>
            </button>
          </div>
        </div>
      </div>
    `,(a=document.getElementById("btn-cancel-factory-reset"))==null||a.addEventListener("click",t),(n=document.getElementById("modal-backdrop-reset"))==null||n.addEventListener("click",i=>{i.target===document.getElementById("modal-backdrop-reset")&&t()}),(r=document.getElementById("btn-confirm-factory-reset"))==null||r.addEventListener("click",()=>{x.playClick(),M.factoryResetAllData(),alert("全機資料已全數清空！即將重新整理進入全新遊戲。"),window.location.reload()})}}class ve{static show(e,t,s){const a=document.getElementById("modal-container");a&&this.render(a,e,t,s)}static render(e,t,s,a){const n=I.machines[t.modelId],r=(n==null?void 0:n.path)||"./assets/machines/litho_contact.png",i=j.STORE_CATALOG.find(S=>S.modelId===t.modelId),o=i?Math.round(i.price*.15):3e5,l=i?Math.round(i.price*.4):8e5,d=Math.round(t.wear),p=s.staff.find(S=>S.id===t.assignedEngineerId);let c=!1,m=!1;p&&(c=H.checkTPMConditions(t,p).isTPMActive,m=H.checkExplosionRisk(t,p).hasRisk);let u=null,h=null;if(t.category==="LITHO"){const S=B.OPTICAL_CATALOG[t.modelId];if(S){const L=B.calculateEffectiveK1(s.player.unlockedK1,t.wear,p||null);u={effectiveK1:L.effectiveK1,formula:`Base(${L.k1Tech.toFixed(2)}) + 磨損(+${L.deltaWear.toFixed(3)}) - 調校(-${L.deltaEngineer.toFixed(2)}) + 疲勞(+${L.deltaFatigue.toFixed(2)})`},h=Math.round(L.effectiveK1*(S.wavelengthNm/S.numericalAperture))}}const f=t.category==="LITHO",g=s.machines.filter(S=>S.category==="TRACK"&&S.status!=="EXPLODED"),y=t.pairedTrackIds||[],T=P.BASE_THROUGHPUT_BY_TIER.LIT[t.tier]||10;let E=0;for(const S of y){const L=s.machines.find(_=>_.id===S);L&&(E+=P.BASE_THROUGHPUT_BY_TIER.TRACK[L.tier]||6)}const v=f&&(y.length===0||E<T),b=s.activeLots.filter(S=>S.status!=="PROCESSING"?!1:t.category==="TRACK"?S.currentStation==="LIT"&&(S.litSubStep==="COAT"||S.litSubStep==="DEVELOP"):t.category==="LITHO"?S.currentStation==="LIT"&&S.litSubStep==="EXPOSE":S.currentStation===t.category),k=b.length>0,D=P.isMachineInYellowRoom(t,s.facility.yellowRoomTiles),O=t.category==="LITHO"||t.category==="TRACK";e.innerHTML=`
      <div id="modal-backdrop-machine" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-2xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden animate-fadeIn">
          
          <!-- Header -->
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80">
            <div class="flex items-center gap-3">
              <div class="machine-panel-thumb w-14 h-14 rounded-xl bg-slate-950 border border-cyan-500/50 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src="${r}" alt="${t.name}" class="w-full h-full object-contain filter drop-shadow" style="max-width: 52px; max-height: 52px;" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-white tracking-wide">${t.name}</h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Tier ${t.tier}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono ${k||t.status==="PROCESSING"?"bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse":t.status==="MAINTENANCE"?"bg-amber-500/20 text-amber-300 border border-amber-500/30":t.status==="EXPLODED"?"bg-red-600 text-white font-bold animate-bounce":"bg-slate-800 text-slate-300"}">
                    ${k?"⚡ 加工中 (PROCESSING)":t.status}
                  </span>
                </div>
                <div class="text-xs text-slate-400 font-mono mt-0.5">
                  ID: ${t.id} | 格線座標: (${t.gridX}, ${t.gridY}) | 站點類別: ${t.category}
                </div>
              </div>
            </div>

            <button id="btn-close-machine-panel" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉面板">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4 text-xs">

            <!-- Yellow Room Safety Warning / Status Banner -->
            ${O?D?`
                <div class="p-3 rounded-xl bg-amber-950/30 border border-amber-500/50 text-amber-200 flex items-center justify-between font-mono text-xs">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">🟡</span>
                    <span class="font-bold text-amber-300">黃光專區安全防護中：</span>
                    <span class="text-slate-300">機台受 500nm 以上濾光保護，光阻未受白光污染。</span>
                  </div>
                  <span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                    良率保護正常
                  </span>
                </div>
              `:`
                <div class="p-3.5 rounded-xl bg-red-950/70 border border-red-500/80 text-red-200 flex items-start gap-3 animate-pulse shadow-lg shadow-red-950/50">
                  <span class="text-2xl">🚨</span>
                  <div class="space-y-1">
                    <div class="font-bold text-red-300 text-sm flex items-center gap-2">
                      <span>致命白光污染！設備未置於黃光專區</span>
                      <span class="px-2 py-0.5 rounded bg-red-600 text-white font-mono text-[10px] font-extrabold">良率直接歸零 (0%)</span>
                    </div>
                    <div class="text-[11px] text-red-200/90 leading-relaxed">
                      光阻化學分子對環境可見光 (波長小於 500nm 之藍綠白光) 極度敏化。微影掃描機 (LITHO) 與塗膠顯影機 (TRACK) 必須劃設在黃光室 (Yellow Room) 琥珀色地磚內！請點擊頂部導覽列「🏗️ 廠房規劃」劃設黃光區或移動機台。
                    </div>
                  </div>
                </div>
              `:""}

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
                  <span class="text-slate-400">${t.category==="LITHO"?"Rayleigh 極限 CD:":"製程站點:"}</span>
                  <span class="text-emerald-400 font-bold">${i!=null&&i.rayleighLimitNm?i.rayleighLimitNm+" nm":t.category}</span>
                </div>
              </div>
            </div>

            <!-- 2. Live Production Job Status (即時生產在製狀態) -->
            <div class="p-3.5 rounded-xl bg-slate-900/80 border ${k?"border-cyan-500/40 bg-cyan-950/20":"border-slate-800"} space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white flex items-center gap-1.5">
                  <span>⚙️</span>
                  <span>生產加工狀態 (Production Status)</span>
                </span>
                <span class="font-mono text-xs ${k?"text-cyan-300 font-bold animate-pulse":"text-slate-400"}">
                  ${k?"⚡ 正在加工批次":"待命中 (Ready / IDLE)"}
                </span>
              </div>
              ${k?`
                <div class="space-y-1.5 pt-1 font-mono text-xs">
                  ${b.map(S=>`
                    <div class="p-2.5 rounded-lg bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between">
                      <div>
                        <span class="text-cyan-300 font-bold">${S.lotId}</span>
                        <span class="text-[11px] text-slate-400 ml-2">第 ${S.currentLayer}/${S.totalLayers} 層 [${S.currentStation}${S.litSubStep?" - "+S.litSubStep:""}]</span>
                      </div>
                      <div class="text-emerald-400 font-bold">
                        良率 ${(S.yieldMultiplier*100).toFixed(0)}%
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
                <span class="font-bold ${d>70?"text-red-400":d>40?"text-amber-400":"text-emerald-400"}">
                  磨損: ${d}% (健康度 ${100-d}%)
                </span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div class="h-full transition-all duration-300 ${d>70?"bg-red-500":d>40?"bg-amber-500":"bg-emerald-500"}" style="width: ${d}%;"></div>
              </div>

              <!-- Status Alert Badges -->
              ${c?`
                <div class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2">
                  <span class="text-base">🛡️</span>
                  <div>
                    <span class="font-bold">TPM 24H 零故障在線維護中：</span>
                    工程師在線微調，磨損鎖死在 5% 以下，故障率保證為 0%！
                  </div>
                </div>
              `:""}

              ${m?`
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
            ${f&&u?`
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div class="flex items-center justify-between font-mono">
                  <span class="text-cyan-300 font-bold flex items-center gap-1.5">
                    <span>🔬</span>
                    <span>Rayleigh 微影光學解析度實時調校</span>
                  </span>
                  <span class="text-emerald-400 font-bold">極限 CD: ~${h} nm</span>
                </div>
                <div class="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1 font-mono text-[11px]">
                  <div class="flex justify-between">
                    <span class="text-slate-400">當前實效 k1 因子:</span>
                    <span class="text-cyan-300 font-bold">${u.effectiveK1.toFixed(3)}</span>
                  </div>
                  <div class="text-[10px] text-slate-500">
                    計算分解: ${u.formula}
                  </div>
                  ${u.effectiveK1<.38?`
                    <div class="text-[10px] text-amber-400 pt-1">
                      ⚠️ 逼近物理極限 (k1 < 0.38)，聚焦景深裕度狹窄，產生製程窗良率折損！
                    </div>
                  `:""}
                </div>
              </div>
            `:""}

            <!-- 5. Option B: Paired Track Selection -->
            ${f?`
              <div class="p-3.5 rounded-xl bg-slate-900/80 border ${v?"border-amber-500/40":"border-slate-800"} space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-white flex items-center gap-1.5">
                    <span>🌀</span>
                    <span>連線機組 Track 塗膠顯影機配套綁定 (Option B)</span>
                  </span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    微影 ${T} 片/分 vs Track ${E} 片/分
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
                    ${g.map(S=>{const L=y.includes(S.id),_=P.BASE_THROUGHPUT_BY_TIER.TRACK[S.tier]||6;return`
                        <label class="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border ${L?"border-cyan-500/40 bg-cyan-950/10":"border-slate-800"} cursor-pointer hover:border-slate-700">
                          <div class="flex items-center gap-2">
                            <input
                              type="checkbox"
                              class="chk-paired-track rounded border-slate-700 text-cyan-500 focus:ring-0"
                              data-track-id="${S.id}"
                              ${L?"checked":""}
                            />
                            <span class="font-semibold text-slate-200 text-xs">${S.name}</span>
                            <span class="text-[10px] text-slate-400 font-mono">(Tier ${S.tier})</span>
                          </div>
                          <span class="font-mono text-[11px] text-cyan-300">+${_} 晶圓/分</span>
                        </label>
                      `}).join("")}
                  </div>
                `}

                ${v?`
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
                ${s.staff.map(S=>`
                  <option value="${S.id}" ${t.assignedEngineerId===S.id?"selected":""}>
                    ${S.name} - ${S.rank} [專長: ${S.moduleSpecialty}] (疲勞: ${Math.round(S.fatigue)}%)
                  </option>
                `).join("")}
              </select>
            </div>

            <!-- 7. Machine Maintenance Actions -->
            <div class="flex items-center gap-3 pt-2">
              <button
                id="btn-machine-overhaul"
                class="flex-1 btn-sci-fi justify-center py-2.5 text-xs bg-cyan-700/80 hover:bg-cyan-600 ${s.player.cash<o||t.wear<=5?"opacity-50 cursor-not-allowed":""}"
                ${s.player.cash<o||t.wear<=5?"disabled":""}
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
    `,this.bindEvents(e,t,s,a)}static bindEvents(e,t,s,a){var i,o,l,d,p,c;const n=()=>{x.playClick(),e.innerHTML="",window.removeEventListener("keydown",r)},r=m=>{m.key==="Escape"&&n()};window.addEventListener("keydown",r),(i=document.getElementById("btn-close-machine-panel"))==null||i.addEventListener("click",n),(o=document.getElementById("btn-back-machine"))==null||o.addEventListener("click",n),(l=document.getElementById("modal-backdrop-machine"))==null||l.addEventListener("click",m=>{m.target===document.getElementById("modal-backdrop-machine")&&n()}),e.querySelectorAll(".chk-paired-track").forEach(m=>{m.addEventListener("change",()=>{x.playClick();const u=[];e.querySelectorAll(".chk-paired-track:checked").forEach(h=>{const f=h.getAttribute("data-track-id");f&&u.push(f)}),t.pairedTrackIds=u,a(),this.render(e,t,s,a)})}),(d=document.getElementById("select-station-engineer"))==null||d.addEventListener("change",m=>{x.playClick();const u=m.target.value||null;if(t.assignedEngineerId){const h=s.staff.find(f=>f.id===t.assignedEngineerId);h&&(h.assignedMachineId=null)}if(t.assignedEngineerId=u,u){const h=s.staff.find(f=>f.id===u);if(h){if(h.assignedMachineId){const f=s.machines.find(g=>g.id===h.assignedMachineId);f&&(f.assignedEngineerId=null)}h.assignedMachineId=t.id}}a(),this.render(e,t,s,a)}),(p=document.getElementById("btn-machine-overhaul"))==null||p.addEventListener("click",()=>{const m=j.STORE_CATALOG.find(h=>h.modelId===t.modelId),u=m?Math.round(m.price*.15):3e5;if(s.player.cash<u){alert("資金不足，無法執行大修！");return}s.player.cash-=u,$.recordMaintenance(s,u),t.wear=0,t.status="IDLE",x.playClick(),a(),this.render(e,t,s,a)}),(c=document.getElementById("btn-machine-decommission"))==null||c.addEventListener("click",()=>{const m=j.STORE_CATALOG.find(f=>f.modelId===t.modelId),u=m?Math.round(m.price*.4):8e5;if(!confirm(`確定要將設備【${t.name}】除役報廢嗎？回收變賣金額 NT$ ${u.toLocaleString()}`))return;if(t.assignedEngineerId){const f=s.staff.find(g=>g.id===t.assignedEngineerId);f&&(f.assignedMachineId=null)}const h=s.machines.findIndex(f=>f.id===t.id);h!==-1&&(s.machines.splice(h,1),P.updateMachineNames(s.machines)),s.player.cash+=u,x.playCoinChime(),e.innerHTML="",a()})}}class we{constructor(){w(this,"state",M.loadFromLocalStorage()||M.createDefaultSave());w(this,"phaserGame");w(this,"cleanroomScene");w(this,"uiManager");w(this,"autoSaveTimer",0);console.log("🚀 正在啟動 Silicon Tycoon: Foundry Master 矽島霸權...");const e=Date.now();if(this.state.lastOnlineTimestamp&&e-this.state.lastOnlineTimestamp>60*1e3){const a=M.calculateOfflineProgress(this.state,e);console.log("離線營運結算戰報:",a)}const t=new Date().toISOString().split("T")[0];this.state.questState=W.refreshDailyQuests(this.state.questState,this.state.player,this.state.unlockedFeatures,t),N.checkAchievements(this.state);const s={type:Phaser.AUTO,parent:"game-container",width:window.innerWidth,height:window.innerHeight,backgroundColor:"#070b14",render:{antialias:!0,pixelArt:!1},scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH}};this.phaserGame=new Phaser.Game(s),this.cleanroomScene=new Q,this.phaserGame.scene.add(Q.KEY,this.cleanroomScene,!0,{saveGame:this.state,onMachineClick:a=>this.handleMachineClick(a),onStateUpdate:()=>this.onStateChanged()}),this.uiManager=new ye(this.state,a=>{console.log(`開發者調整遊戲速度至: ${a}x`)},()=>{this.onStateChanged()},a=>{this.state=a,this.cleanroomScene.updateState(this.state),this.uiManager.updateState(this.state),this.onStateChanged()},(a,n)=>{this.cleanroomScene.setPlannerMode(a,n)}),setInterval(()=>this.simulationTick(),1e3)}simulationTick(){const e=te.getSpeedMultiplier();for(let s=0;s<e;s++){this.state.gameTime+=1,$.tickSimulation(this.state,1),A.checkOrderReplenishment(this.state),A.checkMarketOrdersExpiry(this.state);const a=new Map(this.state.staff.map(i=>[i.id,i]));for(const i of this.state.machines){if(i.status==="EXPLODED")continue;const o=i.assignedEngineerId?a.get(i.assignedEngineerId):null,l=H.updateMachineHealth(i,o,1);i.wear=l.newWear,l.breakdownOccurred&&(i.status=l.isExploded?"EXPLODED":"MAINTENANCE")}for(const i of this.state.staff)if(i.workShift==="OFF")i.fatigue=Math.max(0,i.fatigue-.25);else{const o=i.shiftMode==="TWO_SHIFT"?.05:.02,l=i.workShift==="NIGHT"?1.5:1;i.fatigue=Math.min(100,i.fatigue+o*l)}const n=new Set;for(const i of this.state.activeLots)i.status==="PROCESSING"&&(i.currentStation==="LIT"?i.litSubStep==="COAT"||i.litSubStep==="DEVELOP"?n.add("TRACK"):n.add("LITHO"):n.add(i.currentStation));for(const i of this.state.machines)i.status==="EXPLODED"||i.status==="MAINTENANCE"||(n.has(i.category)?i.status="PROCESSING":i.status="IDLE");const r=[];for(const i of this.state.activeLots)if(i.status==="PROCESSING"&&(i.stationProgressSeconds===void 0&&(i.stationProgressSeconds=0),i.stationRequiredSeconds||(i.stationRequiredSeconds=P.getStationRequiredSeconds(i.currentStation,i.litSubStep)),i.stationProgressSeconds+=1,i.stationProgressSeconds>=i.stationRequiredSeconds)){i.stationProgressSeconds=0;const o=this.state.activeOrders.find(p=>p.id===i.orderId),l=o?o.nodeNm:1e4,d=P.advanceLotStation(i,this.state.unlockedFeatures.cmp,l,this.state.player.unlockedCleanroomClass,this.state.gameTime,this.state.machines,this.state.facility.yellowRoomTiles);if(i.stationRequiredSeconds=P.getStationRequiredSeconds(i.currentStation,i.litSubStep),d.isLotCompleted&&(i.status="COMPLETED",o)){const p=this.state.activeLots.filter(u=>u.orderId===o.id);!i.hasYellowRoomViolation&&i.yieldMultiplier!==0&&(i.yieldMultiplier=X.calculateLotYield(i,this.state,o));const c=Math.round(o.totalDies/Math.max(1,p.length)*i.yieldMultiplier);o.goodDiesDelivered=Math.min(o.totalDies,o.goodDiesDelivered+c),this.state.rollingYieldHistory.push(Number(i.yieldMultiplier.toFixed(3))),this.state.rollingYieldHistory.length>5&&this.state.rollingYieldHistory.shift(),W.onWaferDelivered(this.state.questState,c>0?i.waferCount:0),p.every(u=>u.status==="COMPLETED")&&!r.includes(o)&&r.push(o)}}if(this.state.unlockedFeatures.mesAutoDispatch&&r.length>0)for(const i of r){const o=A.settleOrderPayout(i,i.goodDiesDelivered,this.state.player,this.state.staff,0,this.state.clawbackDebt);this.state.player.cash+=o.netPayout,$.recordWaferSales(this.state,o.netPayout),this.state.clawbackDebt=o.remainingDebt,this.state.player.popularity=Math.min(100,this.state.player.popularity+1);const d=this.state.activeLots.filter(p=>p.orderId===i.id).reduce((p,c)=>p+(c.waferCount||25),0)||25;this.state.player.totalOrdersFulfilled=(this.state.player.totalOrdersFulfilled||0)+1,this.state.player.totalWafersDelivered=(this.state.player.totalWafersDelivered||0)+d,W.onOrderFulfilled(this.state.questState),this.state.activeOrders=this.state.activeOrders.filter(p=>p.id!==i.id),this.state.activeLots=this.state.activeLots.filter(p=>p.orderId!==i.id)}}N.checkAchievements(this.state).newlyUnlocked.length>0&&this.uiManager.render(),this.autoSaveTimer+=1,this.autoSaveTimer>=10&&(this.autoSaveTimer=0,M.saveToLocalStorage(this.state)),this.uiManager.render(),this.cleanroomScene.updateState(this.state)}handleMachineClick(e){ve.show(e,this.state,()=>this.onStateChanged())}onStateChanged(){M.saveToLocalStorage(this.state),this.cleanroomScene.updateState(this.state),this.uiManager.render()}}window.addEventListener("DOMContentLoaded",()=>{new we});
