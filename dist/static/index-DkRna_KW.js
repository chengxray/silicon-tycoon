var we=Object.defineProperty;var Te=(L,t,e)=>t in L?we(L,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):L[t]=e;var E=(L,t,e)=>Te(L,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const r of i.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function e(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(a){if(a.ep)return;a.ep=!0;const i=e(a);fetch(a.href,i)}})();class X{static getRequiredRankWeight(t){return t<=2?1:t<=4?2:t===5?3:4}static checkTPMConditions(t,e){if(!e)return{isTPMActive:!1,reason:"未指派工程師進駐"};if(e.moduleSpecialty!==t.category)return{isTPMActive:!1,reason:`專長不符！該機台為 ${t.category}，工程師專精為 ${e.moduleSpecialty}`};const s=this.getRequiredRankWeight(t.tier),a=this.RANK_WEIGHT[e.rank];return a<s?{isTPMActive:!1,reason:`職等不足！機台需等級 ${s}，該工程師為 ${e.rank} (等級 ${a})`}:e.workShift==="OFF"?{isTPMActive:!1,reason:"該工程師目前處於排休狀態 (OFF)，機台暫無在線工程師值班"}:e.fatigue>=50?{isTPMActive:!1,reason:`工程師疲勞度過高 (${e.fatigue} >= 50)，在線預防保養中斷`}:e.shiftMode!=="THREE_SHIFT"?{isTPMActive:!1,reason:"非三班輪調制（超時兩班制疲勞將持續爬升，無法達成 24H 永久零故障保障）"}:{isTPMActive:!0,reason:"🛡️ 滿足專長相符、資歷合規、在線值勤且低疲勞，享有 24 小時不停機零故障保障！"}}static checkExplosionRisk(t,e){if(!e)return{hasRisk:!1,rankDiff:0};const s=this.getRequiredRankWeight(t.tier),a=this.RANK_WEIGHT[e.rank],i=s-a;return{hasRisk:i>=2,rankDiff:i}}static updateMachineHealth(t,e,s=1){const{isTPMActive:a}=this.checkTPMConditions(t,e);if(a){const p=Math.min(t.wear,5),c=100-p;return{newWear:p,healthPercent:c,isTPMActive:!0,breakdownOccurred:!1,isExploded:!1}}let r=Math.min(100,t.wear+.005*s);const n=100-r,d=(r/100)**2*.05*(s/60),l=Math.random()<d;let o=!1;if(l&&e){const p=this.getRequiredRankWeight(t.tier),c=this.RANK_WEIGHT[e.rank];p-c>=2&&Math.random()<.25&&(o=!0)}return{newWear:Number(r.toFixed(2)),healthPercent:Number(n.toFixed(2)),isTPMActive:!1,breakdownOccurred:l,isExploded:o}}static calculateOverhaulCost(t){return Math.round(t*.15)}}E(X,"RANK_WEIGHT",{"Young Specialist":1,"Skilled Worker":2,"Senior Engineer":3,Fellow:4});class J{static calculateEffectiveK1(t,e,s){let a=.8;switch(t){case"BASE":a=.8;break;case"CAR":a=.65;break;case"OPC":a=.5;break;case"PSM":a=.38;break;case"SAQP":a=.28;break}const r=Math.max(0,Math.min(100,e))/100*.05;let n=0,d=0;if(s&&s.moduleSpecialty==="LITHO")if(s.fatigue>=80)n=0,d=.03;else switch(s.rank){case"Young Specialist":n=.01;break;case"Skilled Worker":n=.02;break;case"Senior Engineer":n=.04;break;case"Fellow":n=.06;break}let l=a+r-n+d;return l=Math.max(t==="SAQP"?.15:.25,Math.min(.95,l)),{effectiveK1:Number(l.toFixed(3)),k1Tech:a,deltaWear:Number(r.toFixed(3)),deltaEngineer:Number(n.toFixed(3)),deltaFatigue:Number(d.toFixed(3))}}static calculateEffectiveCD(t,e,s,a){const i=this.OPTICAL_CATALOG[t];if(!i)return 999999;const{effectiveK1:r}=this.calculateEffectiveK1(e,s,a),n=r*(i.wavelengthNm/i.numericalAperture);return Math.round(n)}static validateResolution(t,e,s,a,i){if(!this.OPTICAL_CATALOG[t])return{canResolve:!1,effectiveCD:999999,effectiveK1:.8,reason:"未知的微影機台型號"};const{effectiveK1:n}=this.calculateEffectiveK1(s,a,i),d=this.calculateEffectiveCD(t,s,a,i);return d>e?{canResolve:!1,effectiveCD:d,effectiveK1:n,reason:`光學解析度不足！當前極限 CD 為 ${d}nm，無法解析目標 ${e}nm 製程（磨損或人員疲勞導致 k1 劣化至 ${n}）。`}:{canResolve:!0,effectiveCD:d,effectiveK1:n}}static getProcessWindowPenalty(t){if(t>=.38)return 0;const e=(.38-t)*.5;return Math.max(0,Math.min(.25,e))}}E(J,"OPTICAL_CATALOG",{litho_contact:{modelId:"litho_contact",name:"Contact Aligner (接觸式微影機)",wavelengthNm:436,numericalAperture:.116,baseRayleighLimitNm:3007,unlockTier:1,baseCost:25e5,baseMttrSec:10},litho_projection:{modelId:"litho_projection",name:"1x Projection Aligner (1:1 投影微影機)",wavelengthNm:436,numericalAperture:.194,baseRayleighLimitNm:1798,unlockTier:1,baseCost:6e6,baseMttrSec:15},litho_gline:{modelId:"litho_gline",name:"G-Line Stepper (步進縮小曝光機)",wavelengthNm:436,numericalAperture:.35,baseRayleighLimitNm:997,unlockTier:2,baseCost:18e6,baseMttrSec:20},litho_iline:{modelId:"litho_iline",name:"I-Line Stepper (高壓汞燈微影機)",wavelengthNm:365,numericalAperture:.5,baseRayleighLimitNm:584,unlockTier:3,baseCost:35e6,baseMttrSec:30},litho_krf:{modelId:"litho_krf",name:"KrF DUV Scanner (準分子雷射掃描機)",wavelengthNm:248,numericalAperture:.7,baseRayleighLimitNm:283,unlockTier:4,baseCost:85e6,baseMttrSec:40},litho_arfdry:{modelId:"litho_arfdry",name:"ArF Dry Scanner (氟化氬乾式微影機)",wavelengthNm:193,numericalAperture:.85,baseRayleighLimitNm:182,unlockTier:4,baseCost:18e7,baseMttrSec:50},litho_arfi:{modelId:"litho_arfi",name:"ArFi Immersion TWINSCAN (雙工件台浸潤微影機)",wavelengthNm:193,numericalAperture:1.35,baseRayleighLimitNm:114,unlockTier:5,baseCost:45e7,baseMttrSec:60},litho_euv:{modelId:"litho_euv",name:"EUV Scanner (極紫外真空微影機)",wavelengthNm:13.5,numericalAperture:.33,baseRayleighLimitNm:33,unlockTier:6,baseCost:25e8,baseMttrSec:90},litho_highna:{modelId:"litho_highna",name:"High-NA EUV Scanner (變形高數值孔徑微影機)",wavelengthNm:13.5,numericalAperture:.55,baseRayleighLimitNm:20,unlockTier:6,baseCost:6e9,baseMttrSec:120}});class Z{static getPieBonus(t){if(!t||t.workShift==="OFF")return{speedBonus:0,yieldBonus:0};let e=0,s=0;return t.rank==="Young Specialist"?(e=.08,s=.03):t.rank==="Skilled Worker"?(e=.15,s=.06):t.rank==="Senior Engineer"?(e=.25,s=.1):t.rank==="Fellow"&&(e=.4,s=.16),t.moduleSpecialty==="PIE"&&(s+=.02,e+=.05),t.fatigue>=80&&(e*=.6,s*=.6),{speedBonus:Number(e.toFixed(3)),yieldBonus:Number(s.toFixed(3))}}static calculateRollingYieldIndex(t){if(!t||t.length===0)return null;const e=t.slice(-5),a=e.reduce((i,r)=>i+r,0)/e.length;return Number(a.toFixed(4))}static calculateLayerYield(t=1,e=0,s=0){let a=.985*t*(1-e)+s;return Math.max(.7,Math.min(.999,a))}static calculateFinalLotYield(t,e=0){if(t.status==="SCRAPPED")return 0;let s=1;for(let a=0;a<t.totalLayers;a++)s*=this.calculateLayerYield(1,e,0);return s*=t.yieldMultiplier||1,Number(Math.max(0,Math.min(1,s)).toFixed(4))}static calculateLotYield(t,e,s){if(t.hasYellowRoomViolation||t.yieldMultiplier===0)return 0;const a=Math.max(1,t.totalLayers||(s?s.layerCount:6));let i=.915;const r=(e.player.unlockedCleanroomClass||"").replace(/,/g,"");r.includes("ISO 1")||r==="ISO 1"?i=.9985:r.includes("Class 1")&&!r.includes("10")?i=.995:r.includes("Class 10")&&!r.includes("100")?i=.988:r.includes("Class 100")&&!r.includes("1000")?i=.975:r.includes("Class 1000")&&!r.includes("10000")&&(i=.955);const n=e.machines.filter(w=>w.status!=="EXPLODED");let d=0;n.length>0&&(d=n.reduce((w,T)=>w+T.wear,0)/n.length);const l=d/100*.06;let o=0;const p=e.staff.filter(w=>w.workShift!=="OFF");for(const w of p)w.fatigue>=80?o-=.015:w.rank==="Young Specialist"?o+=.005:w.rank==="Skilled Worker"?o+=.01:w.rank==="Senior Engineer"?o+=.018:w.rank==="Fellow"&&(o+=.025);o=Math.max(-.05,Math.min(.06,o));let c=0;if(s&&s.assignedPieId){const w=e.staff.find(C=>C.id===s.assignedPieId);c=this.getPieBonus(w).yieldBonus}let h=0;const m=e.machines.find(w=>w.category==="LITHO"&&w.status!=="EXPLODED");if(m){const w=m.assignedEngineerId?e.staff.find(C=>C.id===m.assignedEngineerId):null,{effectiveK1:T}=J.calculateEffectiveK1(e.unlockedFeatures.cmp?"CAR":"BASE",m.wear,w);h=J.getProcessWindowPenalty(T)}const u=Math.max(.85,i-l/a);let f=Math.pow(u,Math.min(12,a)),g=0;e.machines.filter(w=>w.hasPmTuneUpBonus).length>0&&(g=.03);let y=f+o+c+g-h;t.yieldMultiplier<.99&&t.yieldMultiplier>0&&(y*=t.yieldMultiplier);const x=(Math.random()-.5)*.024;return y+=x,Number(Math.max(.4,Math.min(.985,y)).toFixed(3))}static generateWaferMap(t){const e=[],i=Math.sqrt(8);for(let r=0;r<5;r++)for(let n=0;n<5;n++){const d=r*5+n,l=Math.sqrt((r-2)**2+(n-2)**2),o=l/i,p=1.1-o*.4,c=Math.min(.99,t*p),h=Math.random()<c;e.push({index:d,row:r,col:n,distanceFromCenter:Number(l.toFixed(2)),passed:h,defectType:h?void 0:o>.6?"OPTICAL_DEFOCUS":"PARTICLE"})}for(let r=0;r<e.length;r++)if(!e[r].passed&&Math.random()<.4){const n=e.filter(d=>Math.abs(d.row-e[r].row)<=1&&Math.abs(d.col-e[r].col)<=1&&d.index!==e[r].index);if(n.length>0){const d=n[Math.floor(Math.random()*n.length)];d.passed=!1,d.defectType="CLUSTER"}}return e}}class A{static getTodayDateString(t=new Date){const e=t.getFullYear(),s=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0");return`${e}-${s}-${a}`}static getWeekString(t=new Date){const e=new Date(t.valueOf()),s=(t.getDay()+6)%7;e.setDate(e.getDate()-s+3);const a=e.valueOf();e.setMonth(0,1),e.getDay()!==4&&e.setMonth(0,1+(4-e.getDay()+7)%7);const i=1+Math.ceil((a-e.valueOf())/6048e5);return`${e.getFullYear()}-W${String(i).padStart(2,"0")}`}static getMonthString(t=new Date){const e=t.getFullYear(),s=String(t.getMonth()+1).padStart(2,"0");return`${e}-${s}`}static createEmptyRecord(t,e,s,a=5e7,i=7e7){return{periodType:t,periodIndex:e,label:s,timestamp:Date.now(),revenue:{waferSales:0,nreFees:0,subsidies:0,totalRevenue:0},expenses:{depreciation:0,maintenance:0,utilities:0,payroll:0,scraps:0,capex:0,totalExpenses:0},grossProfit:0,grossMarginPct:0,netProfit:0,netMarginPct:0,endingCash:a,endingNetWorth:i}}static initFinancialState(t=5e7,e=7e7){const s=this.getTodayDateString();return{daySeconds:0,currentDay:1,currentWeek:1,currentMonth:1,currentDateStr:s,today:this.createEmptyRecord("DAY",1,`📅 ${s} (今日)`,t,e),thisWeek:this.createEmptyRecord("WEEK",1,`📅 本周 (${this.getWeekString()})`,t,e),thisMonth:this.createEmptyRecord("MONTH",1,`📅 本月 (${this.getMonthString()})`,t,e),dailyHistory:[],weeklyHistory:[],monthlyHistory:[],allTimeRevenue:0,allTimeExpenses:0,allTimeProfit:0}}static calculateCompanyNetWorth(t){const e=t.player.cash,s=t.machines.reduce((r,n)=>{const d=n.tier*15e6,l=Math.max(.2,(100-n.wear)/100);return r+Math.round(d*l)},0),a=t.facility.cleanroomPhase*25e6,i=t.clawbackDebt||0;return Math.max(0,e+s+a-i)}static recordWaferSales(t,e){const s=this.ensureFinancialState(t);s.today.revenue.waferSales+=e,s.thisWeek.revenue.waferSales+=e,s.thisMonth.revenue.waferSales+=e,s.allTimeRevenue+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static recordNREFee(t,e){const s=this.ensureFinancialState(t);s.today.revenue.nreFees+=e,s.thisWeek.revenue.nreFees+=e,s.thisMonth.revenue.nreFees+=e,s.allTimeRevenue+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static recordSubsidy(t,e){const s=this.ensureFinancialState(t);s.today.revenue.subsidies+=e,s.thisWeek.revenue.subsidies+=e,s.thisMonth.revenue.subsidies+=e,s.allTimeRevenue+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static recordMaintenance(t,e){const s=this.ensureFinancialState(t);s.today.expenses.maintenance+=e,s.thisWeek.expenses.maintenance+=e,s.thisMonth.expenses.maintenance+=e,s.allTimeExpenses+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static recordCapEx(t,e){const s=this.ensureFinancialState(t);s.today.expenses.capex+=e,s.thisWeek.expenses.capex+=e,s.thisMonth.expenses.capex+=e,s.allTimeExpenses+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static recordOpEx(t,e,s){const a=this.ensureFinancialState(t);a.today.expenses.maintenance+=s,a.thisWeek.expenses.maintenance+=s,a.thisMonth.expenses.maintenance+=s,a.allTimeExpenses+=s,this.updateRecordTotals(a.today,t),this.updateRecordTotals(a.thisWeek,t),this.updateRecordTotals(a.thisMonth,t)}static recordSigningBonus(t,e){const s=this.ensureFinancialState(t);s.today.expenses.payroll+=e,s.thisWeek.expenses.payroll+=e,s.thisMonth.expenses.payroll+=e,s.allTimeExpenses+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static recordLaborCost(t,e){const s=this.ensureFinancialState(t);s.today.expenses.payroll+=e,s.thisWeek.expenses.payroll+=e,s.thisMonth.expenses.payroll+=e,s.allTimeExpenses+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static recordScrapLoss(t,e){const s=this.ensureFinancialState(t);s.today.expenses.scraps+=e,s.thisWeek.expenses.scraps+=e,s.thisMonth.expenses.scraps+=e,s.allTimeExpenses+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static tickSimulation(t,e=1){const s=this.ensureFinancialState(t),a=t.machines.reduce((c,h)=>c+h.tier*1200,0)*e;s.today.expenses.depreciation+=Math.round(a),s.thisWeek.expenses.depreciation+=Math.round(a),s.thisMonth.expenses.depreciation+=Math.round(a);const i=t.machines.filter(c=>c.status==="PROCESSING").length,n=(t.facility.cleanroomPhase*800+i*600)*e;s.today.expenses.utilities+=Math.round(n),s.thisWeek.expenses.utilities+=Math.round(n),s.thisMonth.expenses.utilities+=Math.round(n);const o=t.staff.reduce((c,h)=>c+h.salary,0)/300*e;s.today.expenses.payroll+=Math.round(o),s.thisWeek.expenses.payroll+=Math.round(o),s.thisMonth.expenses.payroll+=Math.round(o),this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t);const p=this.getTodayDateString();if(s.currentDateStr||(s.currentDateStr=p),s.currentDateStr!==p){const c=s.currentDateStr;s.currentDateStr=p,this.closeDay(t,c,p)}}static closeDay(t,e,s){const a=this.ensureFinancialState(t);this.updateRecordTotals(a.today,t),e&&(a.today.label=`📅 ${e} (結算)`),a.dailyHistory.unshift(JSON.parse(JSON.stringify(a.today))),a.dailyHistory.length>14&&a.dailyHistory.pop(),a.daySeconds=0,a.currentDay+=1;const i=s||this.getTodayDateString();a.currentDateStr=i,a.today=this.createEmptyRecord("DAY",a.currentDay,`📅 ${i} (今日)`,t.player.cash,this.calculateCompanyNetWorth(t));const r=e?new Date(e):new Date(Date.now()-864e5),n=new Date(i);this.getWeekString(r)!==this.getWeekString(n)&&this.closeWeek(t),this.getMonthString(r)!==this.getMonthString(n)&&this.closeMonth(t)}static closeWeek(t){const e=this.ensureFinancialState(t);this.updateRecordTotals(e.thisWeek,t),e.weeklyHistory.unshift(JSON.parse(JSON.stringify(e.thisWeek))),e.weeklyHistory.length>8&&e.weeklyHistory.pop(),e.currentWeek+=1;const s=e.currentWeek;e.thisWeek=this.createEmptyRecord("WEEK",s,`📅 本周 (${this.getWeekString()})`,t.player.cash,this.calculateCompanyNetWorth(t))}static closeMonth(t){const e=this.ensureFinancialState(t);this.updateRecordTotals(e.thisMonth,t),e.monthlyHistory.unshift(JSON.parse(JSON.stringify(e.thisMonth))),e.monthlyHistory.length>6&&e.monthlyHistory.pop(),e.currentMonth+=1;const s=e.currentMonth;e.thisMonth=this.createEmptyRecord("MONTH",s,`📅 本月 (${this.getMonthString()})`,t.player.cash,this.calculateCompanyNetWorth(t))}static updateRecordTotals(t,e){t.revenue.totalRevenue=t.revenue.waferSales+t.revenue.nreFees+t.revenue.subsidies,t.expenses.totalExpenses=t.expenses.depreciation+t.expenses.maintenance+t.expenses.utilities+t.expenses.payroll+t.expenses.scraps+t.expenses.capex;const s=t.expenses.depreciation+t.expenses.maintenance+t.expenses.utilities+t.expenses.scraps;t.grossProfit=t.revenue.totalRevenue-s,t.grossMarginPct=t.revenue.totalRevenue>0?Number((t.grossProfit/t.revenue.totalRevenue*100).toFixed(1)):0;const a=s+t.expenses.payroll;t.netProfit=t.revenue.totalRevenue-a,t.netMarginPct=t.revenue.totalRevenue>0?Number((t.netProfit/t.revenue.totalRevenue*100).toFixed(1)):0,t.endingCash=e.player.cash,t.endingNetWorth=this.calculateCompanyNetWorth(e)}static ensureFinancialState(t){return(!t.financialState||!t.financialState.today)&&(t.financialState=this.initFinancialState(t.player.cash,this.calculateCompanyNetWorth(t))),t.financialState.currentDateStr||(t.financialState.currentDateStr=this.getTodayDateString()),t.financialState}static generateCFOAdvisory(t,e){const s=t.revenue.totalRevenue,a=t.grossMarginPct,i=e.player.cash;return s===0?{rating:"WARNING",title:"💤 產線待命中 — 週期營收缺口警示",advice:"本週期尚未認列任何晶圓出貨尾款或 NRE 光罩開發款，但固定水電與工程師薪資持續流出。請立即前往【合約公告板】承接高毛利訂單！",metrics:"毛利率: 0.0% | 產能營收: NT$ 0"}:i<1e7?{rating:"CRITICAL",title:"🚨 流動資金偏低 — 嚴控資本開支",advice:"現金儲備低於安全水位！建議暫緩購買高價新機台，優先全力推進在製晶圓批次出貨，或檢查機台磨損避免意外炸機造成大修支出！",metrics:`流動現金: NT$ ${Math.round(i).toLocaleString()}（建議最低安全門檻: NT$ 20,000,000）`}:a>=53?{rating:"EXCELLENT",title:"🌟 傳奇毛利率 — 達到台積電 53% 卓越標竿！",advice:"恭喜！本週期毛利率高達 "+a+"%，超越全球半導體龍頭 53.0% 標竿！製程良率優異且 NRE 溢價充沛。建議積極將獲利轉入 CapEx 擴大產能，搶佔次世代製程領導地位！",metrics:`當期毛利率: ${a}%（超越全球龍頭標竿 53.0% 達成！）`}:a>=35?{rating:"GOOD",title:"⚖️ 獲利穩健 — 符合晶圓代工常態",advice:"收支結構健康，毛利率維持在良好的 35% ~ 50% 區間。建議透過 🛡️ TPM 在線保養維持零故障，並優化員工排班減少夜班過勞，進一步釋放產能。",metrics:`當期毛利率: ${a}%（符合產業健康標準 35% ~ 45%）`}:{rating:"WARNING",title:"⚠️ 毛利受壓 — 成本與耗損偏高",advice:"本週期毛利率偏低，主要受限於機台維修頻繁、折舊沉重或報廢損失。建議檢查機台配對狀態與工程師職級，減少晶圓報廢，拉升合格晶粒產出比率。",metrics:`當期毛利率: ${a}%（低於產業安全水準 35.0%）`}}}E(A,"DAY_SECONDS",86400),E(A,"DAYS_PER_WEEK",7),E(A,"DAYS_PER_MONTH",30);class D{static getNodeSpec(t){return this.PRICING_TABLE.slice().reverse().find(s=>t<=s.nodeNm)||this.PRICING_TABLE[0]}static calculateUpfrontNRE(t,e,s=1){const a=this.getNodeSpec(t);return Math.round(a.baseNRE*e*s)}static calculateTrustMultiplier(t){if(t===null||isNaN(t))return 1;const e=.7+t*.5;return Math.max(.75,Math.min(1.25,Number(e.toFixed(3))))}static calculateUnitPrice(t,e,s,a){const i=this.getNodeSpec(t),r=1+(e-1)*.08,n=i.basePrice*r*s*a;return Number(n.toFixed(2))}static settleOrderPayout(t,e,s,a,i=0,r=0){const n=Math.max(0,Math.round(e*t.unitPrice-i));let d=0,l=r;if(l>0&&n>0){const c=a.reduce((m,u)=>m+u.salary,0)*1.5,h=s.cash+n;if(h>c){const m=h-c,u=Math.min(m*.25,n*.25);d=Math.min(l,Math.round(u)),l-=d}}const o=n-d;return{grossPayout:n,netPayout:o,debtDeducted:d,remainingDebt:l}}static calculateOverdueClawback(t,e,s=!1){const a=e-t.deadlineGameTime;return a<=0?{clawbackRatio:0,clawbackAmount:0,isCancelled:!1}:s&&a<=86400?{clawbackRatio:.1,clawbackAmount:Math.round(t.nrePaid*.1),isCancelled:!1}:a<=28800?{clawbackRatio:.3,clawbackAmount:Math.round(t.nrePaid*.3),isCancelled:!1}:a<=86400?{clawbackRatio:.7,clawbackAmount:Math.round(t.nrePaid*.7),isCancelled:!1}:{clawbackRatio:1,clawbackAmount:t.nrePaid,isCancelled:!0}}static getMarketRefreshCost(t){return{1:5e4,2:15e4,3:5e5,4:15e5,5:5e6,6:2e7}[t]||5e4}static generateSingleOrder(t,e,s,a=0){const i=["聯發通訊","蘋果核心","輝達智能","高通晶創","超微運算","台積晶心","瑞昱音訊","博通網通"],r=this.PRICING_TABLE.filter(P=>P.minTier<=t),n=this.calculateTrustMultiplier(e),d=r[Math.floor(Math.random()*r.length)],l=i[(a+Math.floor(Math.random()*8))%i.length],o=d.minTier<=2?3:5,p=d.minTier<=2?5:d.minTier<=4?12:24,c=Math.floor(Math.random()*(p-o+1))+o,h=[3,5,10,25][Math.floor(Math.random()*4)],m=d.nodeNm>=1e3?500:2e3,u=h*m,f=[1,1,1,1.2,1.5],g=f[Math.floor(Math.random()*f.length)],v=this.calculateUpfrontNRE(d.nodeNm,c,g),y=this.calculateUnitPrice(d.nodeNm,c,g,n),w=Math.round(c*30*h*.8/g+180),T=s+w,C=g>=1.5?45e3:g>=1.2?7e4:1e5,M=Date.now()+C;return{id:`ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*900+100)}`,clientName:l,nodeNm:d.nodeNm,layerCount:c,totalDies:u,goodDiesDelivered:0,nrePaid:v,unitPrice:y,urgencyMultiplier:g,allowedDurationSec:w,marketExpiresAt:M,deadlineGameTime:T,status:"ACTIVE"}}static getAllowedDurationSec(t){if(t.allowedDurationSec&&t.allowedDurationSec>0)return t.allowedDurationSec;const e=Math.max(1,Math.ceil(t.totalDies/(t.nodeNm>=1e3?500:2e3))),s=30,a=t.urgencyMultiplier||1;return Math.round((t.layerCount||4)*s*e*.8/a+180)}static generateContractBoard(t,e,s,a=this.MAX_MARKET_ORDERS){const i=[];for(let r=0;r<a;r++)i.push(this.generateSingleOrder(t,e,s,r));return i}static ensureMarketOrders(t){if(!t.marketOrders||t.marketOrders.length===0){const e=t.rollingYieldHistory&&t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((s,a)=>s+a,0)/t.rollingYieldHistory.length:null;t.marketOrders=this.generateContractBoard(t.player.foundryTier,e,t.gameTime),t.nextOrderRespawnTime=0}}static checkOrderReplenishment(t){if(t.marketOrders||(t.marketOrders=[]),t.marketOrders.length>=this.MAX_MARKET_ORDERS)return t.nextOrderRespawnTime=0,!1;const e=Date.now();if(!t.nextOrderRespawnTime||t.nextOrderRespawnTime===0)return t.nextOrderRespawnTime=e+this.ORDER_RESPAWN_COOLDOWN_MS,!0;if(e>=t.nextOrderRespawnTime){const s=t.rollingYieldHistory&&t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((i,r)=>i+r,0)/t.rollingYieldHistory.length:null,a=this.generateSingleOrder(t.player.foundryTier,s,t.gameTime);return t.marketOrders.push(a),t.marketOrders.length<this.MAX_MARKET_ORDERS?t.nextOrderRespawnTime=e+this.ORDER_RESPAWN_COOLDOWN_MS:t.nextOrderRespawnTime=0,!0}return!1}static checkMarketOrdersExpiry(t){if(!t.marketOrders||t.marketOrders.length===0)return!1;const e=Date.now();let s=!1;const a=t.rollingYieldHistory&&t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((i,r)=>i+r,0)/t.rollingYieldHistory.length:null;for(let i=0;i<t.marketOrders.length;i++){const r=t.marketOrders[i];if(!r.marketExpiresAt){const n=(r.urgencyMultiplier||1)>=1.5?45e3:(r.urgencyMultiplier||1)>=1.2?7e4:1e5;r.marketExpiresAt=e+n;continue}e>=r.marketExpiresAt&&(t.marketOrders[i]=this.generateSingleOrder(t.player.foundryTier,a,t.gameTime,i),s=!0)}return s}static forceRefreshAllMarketOrders(t){const e=t.rollingYieldHistory&&t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((s,a)=>s+a,0)/t.rollingYieldHistory.length:null;t.marketOrders=this.generateContractBoard(t.player.foundryTier,e,t.gameTime),t.nextOrderRespawnTime=0}}E(D,"PRICING_TABLE",[{nodeNm:1e4,basePrice:180,baseNRE:18e3,minTier:1},{nodeNm:3e3,basePrice:320,baseNRE:35e3,minTier:1},{nodeNm:1e3,basePrice:500,baseNRE:8e4,minTier:2},{nodeNm:350,basePrice:850,baseNRE:18e4,minTier:3},{nodeNm:180,basePrice:1400,baseNRE:35e4,minTier:3},{nodeNm:90,basePrice:2400,baseNRE:8e5,minTier:4},{nodeNm:45,basePrice:4200,baseNRE:18e5,minTier:4},{nodeNm:28,basePrice:7500,baseNRE:4e6,minTier:5},{nodeNm:7,basePrice:18e3,baseNRE:12e6,minTier:6},{nodeNm:2,basePrice:45e3,baseNRE:35e6,minTier:6}]),E(D,"MAX_MARKET_ORDERS",5),E(D,"ORDER_RESPAWN_COOLDOWN_MS",6e4);class q{static refreshDailyQuests(t,e,s,a){if(t.lastDateStr===a&&t.dailyQuests.length===3)return t;const i=e.foundryTier,r=[0,6e4,18e4,45e4,12e5,35e5,12e6][i]??6e4,n=[],d=i===1?5:i===2?15:i===3?30:i===4?60:100;n.push({id:`quest_produce_${a}`,title:"穩定投片交付產出",description:`完成出貨累計 ${d} 片合格晶圓至客戶端。`,tier:i,currentValue:0,targetValue:d,rewardCash:r,rewardPopularity:3,completed:!1,claimed:!1}),i>=3&&s.cmp?n.push({id:`quest_cmp_operation_${a}`,title:"平坦化製程精進",description:"成功執行 5 次 CMP 化學機械平坦化拋光研磨。",tier:i,currentValue:0,targetValue:5,rewardCash:Math.round(r*1.2),rewardPopularity:4,completed:!1,claimed:!1}):n.push({id:`quest_maintain_fab_${a}`,title:"廠務設備巡檢維護",description:"指派工程師對機台進行保養或維持機台健康度在 90% 以上。",tier:i,currentValue:0,targetValue:2,rewardCash:r,rewardPopularity:3,completed:!1,claimed:!1});const l=i<=2?2:3;return n.push({id:`quest_order_fulfill_${a}`,title:"光罩合約履約達成",description:`順利交貨並履約 ${l} 筆晶圓製造合約，取得全額尾款。`,tier:i,currentValue:0,targetValue:l,rewardCash:Math.round(r*1.5),rewardPopularity:5,completed:!1,claimed:!1}),{lastDateStr:a,dailyQuests:n,allDailyClaimed:!1,weeklyCompletedCount:t.weeklyCompletedCount??0,weeklyTarget:15,weeklyClaimed:t.weeklyClaimed??!1}}static onWaferDelivered(t,e){for(const s of t.dailyQuests)s.id.startsWith("quest_produce")&&!s.completed&&(s.currentValue+=e,s.currentValue>=s.targetValue&&(s.currentValue=s.targetValue,s.completed=!0))}static onOrderFulfilled(t){for(const e of t.dailyQuests)e.id.startsWith("quest_order_fulfill")&&!e.completed&&(e.currentValue+=1,e.currentValue>=e.targetValue&&(e.currentValue=e.targetValue,e.completed=!0))}static onMachineMaintained(t){for(const e of t.dailyQuests)e.id.startsWith("quest_maintain_fab")&&!e.completed&&(e.currentValue+=1,e.currentValue>=e.targetValue&&(e.currentValue=e.targetValue,e.completed=!0))}static onCmpProcessed(t){for(const e of t.dailyQuests)e.id.startsWith("quest_cmp_operation")&&!e.completed&&(e.currentValue+=1,e.currentValue>=e.targetValue&&(e.currentValue=e.targetValue,e.completed=!0))}static isAllDailyCompleted(t){return t.dailyQuests.length!==3?!1:t.dailyQuests.every(e=>e.completed)}static claimSingleQuest(t,e){const s=t.dailyQuests.find(a=>a.id===e);return s?s.completed?s.claimed?{success:!1,cash:0,popularity:0,message:"該任務獎勵已領取"}:(s.claimed=!0,{success:!0,cash:s.rewardCash,popularity:s.rewardPopularity,message:`領取成功！獲得獎勵金 NT$ ${s.rewardCash.toLocaleString()} 與商譽 +${s.rewardPopularity}！`}):{success:!1,cash:0,popularity:0,message:"該任務尚未達成目標"}:{success:!1,cash:0,popularity:0,message:"找不到該任務"}}static claimDailyAllClear(t,e){if(!this.isAllDailyCompleted(t))return{success:!1,cash:0,popularity:0,message:"尚有每日任務未完成，無法領取全勤特獎"};if(t.allDailyClaimed)return{success:!1,cash:0,popularity:0,message:"今日全勤特獎已經領取過囉"};t.allDailyClaimed=!0,t.weeklyCompletedCount=Math.min(21,(t.weeklyCompletedCount??0)+3);const s=[0,15e4,45e4,12e5,3e6,8e6,25e6][e]??15e4,a=10;return{success:!0,cash:s,popularity:a,message:`🎉 達成今日 3/3 全勤！獲得全勤特獎 NT$ ${s.toLocaleString()}、商譽 +${a}，每週任務進度累計 +3！`}}static claimWeeklyBounty(t,e){if(t.weeklyCompletedCount<t.weeklyTarget)return{success:!1,cash:0,popularity:0,message:`每週任務尚未達標！目前進度 ${t.weeklyCompletedCount}/${t.weeklyTarget}`};if(t.weeklyClaimed)return{success:!1,cash:0,popularity:0,message:"本週龍頭週大獎已領取過囉"};t.weeklyClaimed=!0;const s=[0,1e6,3e6,8e6,2e7,6e7,2e8][e]??1e6,a=30;return{success:!0,cash:s,popularity:a,message:`🏆 榮膺半導體龍頭週大獎！領取巨額扶持金 NT$ ${s.toLocaleString()} 與商譽 +${a}！全廠客戶信任度提升！`}}}class R{static isTileInYellowRoom(t,e,s){return s&&s.length>0?s.some(a=>a.x===t&&a.y===e):e<=3&&t>=3&&t<=7}static isMachineInYellowRoom(t,e){return this.isTileInYellowRoom(t.gridX,t.gridY,e)}static getStationRequiredSeconds(t,e,s,a,i){let r=this.BASE_STATION_DURATION_SEC[t]||10;if(t==="LIT"&&e&&(r=this.LIT_SUBSTEP_DURATION_SEC[e]||10),s&&(r-=Math.min(2,(s.tier-1)*.5),s.wear>50&&(r+=Math.round((s.wear-50)/50*3))),a&&s&&a.moduleSpecialty===s.category&&a.fatigue<80&&(r=Math.max(4,Math.round(r*.85))),i){const n=Z.getPieBonus(i);n.speedBonus>0&&(r=Math.max(3,Math.round(r/(1+n.speedBonus))))}return Math.max(3,Math.round(r))}static getStationSequence(t){return t?["FILM","LIT","ETCH","DIFF","CMP"]:["FILM","LIT","ETCH","DIFF"]}static calculateEffectiveQTimeSec(t,e,s,a){let i=45;t==="LIT"&&e==="ETCH"?i=45:t==="ETCH"&&e==="DIFF"?i=60:t==="CMP"&&(i=45);let r=1;a.includes("1000")&&!a.includes("10000")?r=1.15:a.includes("100")&&!a.includes("1000")?r=1.3:a.includes("1")&&!a.includes("10")&&(r=1.5);let n=1;return s>=1e3?n=1.5:s<=28&&(n=.8),Math.round(i*r*n)}static checkQTimeStatus(t,e,s=5e4){if(!t.qTimeDeadline)return{isOverdue:!1,overdueSeconds:0,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:1,urgencyLevel:"SAFE",remainingSeconds:999};const a=t.qTimeDeadline-e,i=t.currentStation==="ETCH";if(a>15)return{isOverdue:!1,overdueSeconds:0,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:1,urgencyLevel:"SAFE",remainingSeconds:a};if(a>0)return{isOverdue:!1,overdueSeconds:0,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:1,urgencyLevel:"WARNING",remainingSeconds:a};const r=Math.abs(a);return r<=15?{isOverdue:!0,overdueSeconds:r,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:.65,urgencyLevel:"CRITICAL",remainingSeconds:0}:i?{isOverdue:!0,overdueSeconds:r,isFatal:!0,canRework:!0,reworkCost:s,penaltyYieldRatio:0,urgencyLevel:"EXPIRED",remainingSeconds:0}:{isOverdue:!0,overdueSeconds:r,isFatal:!0,canRework:!1,reworkCost:0,penaltyYieldRatio:0,urgencyLevel:"EXPIRED",remainingSeconds:0}}static executeReworkLot(t,e){return t.currentStation="LIT",t.litSubStep="COAT",t.qTimeDeadline=null,t.status="PROCESSING",t.yieldMultiplier=Math.max(.85,t.yieldMultiplier*.95),{success:!0,message:`成功救回批次 ${t.lotId}！耗費溶劑費 NT$ ${e.toLocaleString()}，已退回黃光塗膠站重新加工。`}}static advanceLotStation(t,e,s,a,i,r,n){const d=this.getStationSequence(e);if(r&&n&&t.currentStation==="LIT"){const o=r.find(c=>c.category==="LITHO"),p=r.find(c=>c.category==="TRACK");(t.litSubStep==="EXPOSE"&&o&&!this.isMachineInYellowRoom(o,n)||(t.litSubStep==="COAT"||t.litSubStep==="DEVELOP")&&p&&!this.isMachineInYellowRoom(p,n))&&(t.yieldMultiplier=0,t.hasYellowRoomViolation=!0)}if(t.currentStation==="LIT"){if(!t.litSubStep||t.litSubStep==="COAT")return t.litSubStep="EXPOSE",t.qTimeDeadline=null,{nextStation:"LIT",nextSubStep:"EXPOSE",isLayerCompleted:!1,isLotCompleted:!1};if(t.litSubStep==="EXPOSE")return t.litSubStep="DEVELOP",t.qTimeDeadline=null,{nextStation:"LIT",nextSubStep:"DEVELOP",isLayerCompleted:!1,isLotCompleted:!1};if(t.litSubStep==="DEVELOP"){t.currentStation="ETCH",t.litSubStep=void 0;const o=this.calculateEffectiveQTimeSec("LIT","ETCH",s,a);return t.qTimeDeadline=i+o,{nextStation:"ETCH",isLayerCompleted:!1,isLotCompleted:!1}}}const l=d.indexOf(t.currentStation);if(l>=0&&l<d.length-1){const o=d[l+1];if(t.currentStation=o,o==="LIT"&&(t.litSubStep="COAT"),t.currentStation==="DIFF"){const p=this.calculateEffectiveQTimeSec("ETCH","DIFF",s,a);t.qTimeDeadline=i+p}else t.qTimeDeadline=null;return{nextStation:o,isLayerCompleted:!1,isLotCompleted:!1}}return t.currentLayer<t.totalLayers?(t.currentLayer+=1,t.currentStation="FILM",t.litSubStep=void 0,t.qTimeDeadline=null,{nextStation:"FILM",isLayerCompleted:!0,isLotCompleted:!1}):(t.status="COMPLETED",t.qTimeDeadline=null,{nextStation:t.currentStation,isLayerCompleted:!0,isLotCompleted:!0})}static calculateStationThroughputs(t,e,s){var l;const a=["FILM","TRACK","LIT","ETCH","DIFF","CMP"],i={FILM:{station:"FILM",totalCapacity:0,machineCount:0,isChokePoint:!1},TRACK:{station:"TRACK",totalCapacity:0,machineCount:0,isChokePoint:!1},LIT:{station:"LIT",totalCapacity:0,machineCount:0,isChokePoint:!1},ETCH:{station:"ETCH",totalCapacity:0,machineCount:0,isChokePoint:!1},DIFF:{station:"DIFF",totalCapacity:0,machineCount:0,isChokePoint:!1},CMP:{station:"CMP",totalCapacity:0,machineCount:0,isChokePoint:!1}},r=new Map;for(const o of e)r.set(o.id,o);for(const o of t){if(o.status==="EXPLODED")continue;let p=o.category;o.category==="LITHO"&&(p="LIT");const c=((l=this.BASE_THROUGHPUT_BY_TIER[p])==null?void 0:l[o.tier])??10,h=1-o.wear/100*.3;let m=1;if(o.assignedEngineerId&&r.has(o.assignedEngineerId)){const f=r.get(o.assignedEngineerId);f.moduleSpecialty===o.category&&f.fatigue<80&&(m=1.2)}p==="LIT"&&o.pairedTrackIds&&o.pairedTrackIds.length>=2&&(m+=.05);const u=c*h*m;i[p].totalCapacity+=u,i[p].machineCount+=1}let n=1/0,d="TRACK";for(const o of a)o==="CMP"&&!s||i[o].totalCapacity<n&&(n=i[o].totalCapacity,d=o);return n<1/0&&d&&(i[d].isChokePoint=!0),i}static calculateLogisticsFactor(t,e,s){let a=.5;t.oht?a=1.2:t.agv&&(a=.85);let i=5;if(e.length>=2){let d=0,l=0;for(let o=0;o<e.length-1;o++){const p=Math.abs(e[o].gridX-e[o+1].gridX)+Math.abs(e[o].gridY-e[o+1].gridY);d+=p,l++}i=l>0?d/l:5}const r=Math.max(.6,Math.min(1.1,6/Math.max(2,i))),n=Math.min(.2,s*.02);return Number((a*r*(1-n)).toFixed(2))}static calculateFactoryWorkload(t,e,s,a,i){const r=this.calculateStationThroughputs(t,e,i),n=this.calculateLogisticsFactor(a,t,s.length),d=["FILM","TRACK","LIT","ETCH","DIFF"];i&&d.push("CMP");let l=1/0;for(const m of d){const u=r[m].totalCapacity;u<l&&(l=u)}const o=Math.max(1,l*n);let p=0;for(const m of s)(m.status==="PROCESSING"||m.status==="WAITING_QTIME"||m.status==="TRANSPORTING")&&(p+=m.waferCount);const c=Math.min(150,Math.round(p/o*100));let h="SMOOTH";return c>85?h="OVERLOADED":c>=70&&(h="HEAVY"),{workloadPercent:c,maxCapacityWafersPerMin:Math.round(o),totalDemandWafers:p,statusLevel:h,throughputs:r}}static diagnoseBottleneck(t,e,s,a,i){var m;const{workloadPercent:r,throughputs:n}=this.calculateFactoryWorkload(t,e,s,a,i),d=t.find(u=>u.wear>=70);if(d){const u=d.category==="LITHO"?"LIT":d.category;return{category:"MAINTENANCE",title:"機台嚴重老化致效能衰退",stationName:d.category,description:`【${d.name}】磨損度高達 ${d.wear}%，抽真空與加工速率嚴重衰退超過 20%！`,recommendation:"請立即指派工程師對該機台執行「就地大修（Overhaul）」或保養，恢復 100% 原始效能。",workloadPercent:r,chokePointThroughput:Math.round(((m=n[u])==null?void 0:m.totalCapacity)??10)}}const l=n.TRACK.totalCapacity,o=n.LIT.totalCapacity;if(l<o&&l<40)return{category:"CAPACITY",title:"塗膠顯影 (Track) 先天物理產能瓶頸",stationName:"TRACK",description:`LITHO 曝光機正在空轉等待！【Track 塗膠顯影站】產能僅 ${Math.round(l)} 片/分，是產線最大卡點！`,recommendation:"光阻旋塗與烘烤受熱擴散物理限制，建議增購第 2 台 Track 機台或將其並聯綁定至微影機以分流消化產能！",workloadPercent:r,chokePointThroughput:Math.round(l)};let p="FILM",c=1/0;const h=["FILM","TRACK","LIT","ETCH","DIFF"];i&&h.push("CMP");for(const u of h)n[u].totalCapacity<c&&(c=n[u].totalCapacity,p=u);return c<=15?{category:"CAPACITY",title:"關鍵製程站點設備數量不足",stationName:p,description:`【${p} 站】產能僅 ${Math.round(c)} 片/分，遠低於其他站點，晶圓在門口嚴重堆積！`,recommendation:`建議前往商城增購第 2 台 ${p} 設備進行分流，或將現有機台升級為更高階型號。`,workloadPercent:r,chokePointThroughput:Math.round(c)}:!a.agv&&!a.oht&&s.length>=2?{category:"LOGISTICS",title:"人工手持搬運效率偏低",stationName:"AMHS 物流",description:"當前仍為「技術員手持晶圓盒步行搬運」，走動搬運耗時佔據了整個製程週期的 40% 以上！",recommendation:"投片量已超越人工負荷極限！強烈建議研發解鎖「地面 AGV 自走車」或「天花板 OHT 天軌」。",workloadPercent:r,chokePointThroughput:Math.round(c)}:{category:"LAYOUT",title:"機台動線規劃待最佳化",stationName:"廠房佈局",description:"前後站點相隔較遠，搬運載具在走道往返耗時過多，拉長了晶圓整體的傳送等待時間。",recommendation:"建議在廠房編輯模式中將相鄰製程機台（如 Track 與 Litho、Etch 與 Diff）就近排列，縮短傳送時間。",workloadPercent:r,chokePointThroughput:Math.round(c)}}static autoFillBestEconomyAllocation(t,e){const s=e.filter(d=>d.category==="LITHO");if(s.length===0)return[];const a=[...s].sort((d,l)=>{var c,h;const o=((c=J.OPTICAL_CATALOG[d.modelId])==null?void 0:c.baseRayleighLimitNm)??9999,p=((h=J.OPTICAL_CATALOG[l.modelId])==null?void 0:h.baseRayleighLimitNm)??9999;return o-p}),i=a[0],r=a[a.length-1],n=[];for(let d=1;d<=t.layerCount;d++){let l=d<=3,o=l?t.nodeNm:Math.max(t.nodeNm*2.5,350),p=l?i.modelId:r.modelId;n.push({layerIndex:d,layerType:l?"關鍵層 (Critical Layer)":"繞線層 (Metal Interconnect)",targetCD:Math.round(o),assignedMachineModelId:p})}return n}static updateMachineNames(t){if(!t||t.length===0)return;const e=new Map;for(const s of t)e.has(s.modelId)||e.set(s.modelId,[]),e.get(s.modelId).push(s);for(const[s,a]of e.entries())if(a.length<=1)for(const i of a)i.name=i.name.replace(/\s*#\d+$/,"").trim();else a.forEach((i,r)=>{const n=i.name.replace(/\s*#\d+$/,"").trim();i.name=`${n} #${r+1}`})}static simulateOfflineCatchUp(t,e){const s=Math.min(14400,Math.max(0,e));if(s<2)return{simulatedSec:0,lotsCompleted:0,wafersDelivered:0,revenueEarned:0};let a=0,i=0,r=0;const n=new Map(t.staff.map(d=>[d.id,d]));for(let d=0;d<s;d++){if(t.gameTime+=1,d%30===0&&A.tickSimulation(t,30),d%10===0)for(const o of t.machines){if(o.status==="EXPLODED")continue;const p=o.assignedEngineerId?n.get(o.assignedEngineerId):null,c=X.updateMachineHealth(o,p,10);o.wear=c.newWear,c.breakdownOccurred&&(o.status=c.isExploded?"EXPLODED":"MAINTENANCE")}if(d%10===0)for(const o of t.staff)if(o.workShift==="OFF")o.fatigue=Math.max(0,o.fatigue-2.5);else{const p=o.shiftMode==="TWO_SHIFT"?.5:.2,c=o.workShift==="NIGHT"?1.5:1;o.fatigue=Math.min(100,o.fatigue+p*c)}const l=[];for(const o of t.activeLots){if(o.status!=="PROCESSING")continue;const p=t.activeOrders.find(h=>h.id===o.orderId),c=p!=null&&p.assignedPieId?t.staff.find(h=>h.id===p.assignedPieId):void 0;if(o.stationProgressSeconds===void 0&&(o.stationProgressSeconds=0),o.stationRequiredSeconds||(o.stationRequiredSeconds=this.getStationRequiredSeconds(o.currentStation,o.litSubStep,void 0,void 0,c)),o.stationProgressSeconds+=1,o.stationProgressSeconds>=o.stationRequiredSeconds){o.stationProgressSeconds=0;const h=p?p.nodeNm:1e4,m=this.advanceLotStation(o,t.unlockedFeatures.cmp,h,t.player.unlockedCleanroomClass,t.gameTime,t.machines,t.facility.yellowRoomTiles);if(o.stationRequiredSeconds=this.getStationRequiredSeconds(o.currentStation,o.litSubStep,void 0,void 0,c),m.isLotCompleted&&(o.status="COMPLETED",a++,p)){const u=t.activeLots.filter(y=>y.orderId===p.id);!o.hasYellowRoomViolation&&o.yieldMultiplier!==0&&(o.yieldMultiplier=Z.calculateLotYield(o,t,p));const f=Math.round(p.totalDies/Math.max(1,u.length)*o.yieldMultiplier);p.goodDiesDelivered=Math.min(p.totalDies,p.goodDiesDelivered+f);const g=f>0?o.waferCount||25:0;i+=g,q.onWaferDelivered(t.questState,g),u.every(y=>y.status==="COMPLETED")&&!l.includes(p)&&(p.status="COMPLETED",p.deliveryYield=Number((p.goodDiesDelivered/p.totalDies).toFixed(3)),t.rollingYieldHistory.push(p.deliveryYield),t.rollingYieldHistory.length>5&&t.rollingYieldHistory.shift(),l.push(p))}}}}return D.checkOrderReplenishment(t),D.checkMarketOrdersExpiry(t),{simulatedSec:s,lotsCompleted:a,wafersDelivered:i,revenueEarned:r}}}E(R,"BASE_STATION_DURATION_SEC",{FILM:10,LIT:27,ETCH:12,DIFF:16,CMP:10}),E(R,"LIT_SUBSTEP_DURATION_SEC",{COAT:7,EXPOSE:12,DEVELOP:8}),E(R,"BASE_THROUGHPUT_BY_TIER",{LIT:{1:10,2:25,3:55,4:120,5:260,6:180},TRACK:{1:6,2:16,3:35,4:75,5:140,6:160},FILM:{1:12,2:24,3:50,4:110,5:220,6:200},ETCH:{1:12,2:24,3:50,4:110,5:220,6:200},DIFF:{1:10,2:20,3:45,4:100,5:200,6:180},CMP:{1:0,2:0,3:40,4:90,5:180,6:160}});const N={machines:{litho_contact:{path:"./assets/machines/litho_contact.png",label:"Contact Aligner",tier:1},litho_projection:{path:"./assets/machines/litho_projection.png",label:"1x Projection Aligner",tier:1},litho_gline:{path:"./assets/machines/litho_gline.png",label:"G-Line Stepper",tier:2},litho_iline:{path:"./assets/machines/litho_iline.png",label:"I-Line Stepper",tier:3},litho_krf:{path:"./assets/machines/litho_krf.png",label:"KrF DUV Scanner",tier:4},litho_arfdry:{path:"./assets/machines/litho_arfdry.png",label:"ArF Dry Scanner",tier:4},litho_arfi:{path:"./assets/machines/litho_arfi.png",label:"ArFi Immersion TWINSCAN",tier:5},litho_euv:{path:"./assets/machines/litho_euv.png",label:"EUV Scanner (無標誌 2.5D 旗艦)",tier:6},litho_highna:{path:"./assets/machines/litho_highna.png",label:"High-NA EUV Scanner",tier:6},track_manual:{path:"./assets/machines/track_manual.png",label:"手動旋塗熱板台",tier:1},track_single:{path:"./assets/machines/track_clean.png",label:"單軌自動塗膠顯影機",tier:2},track_dual:{path:"./assets/machines/track_dual.png",label:"雙軌連線 Track",tier:3},track_clean:{path:"./assets/machines/track_clean.png",label:"多工位精密 Clean Track",tier:4},track_advanced:{path:"./assets/machines/track_advanced.png",label:"先進極限分子級 Track",tier:6},etch_wet:{path:"./assets/machines/etch_wet.png",label:"濕式酸槽清洗台",tier:1},etch_plasma:{path:"./assets/machines/etch_plasma.png",label:"電漿乾式蝕刻機 (RIE)",tier:3},film_furnace:{path:"./assets/machines/film_furnace.png",label:"高溫熱氧化爐管",tier:1},film_pecvd:{path:"./assets/machines/film_pecvd.png",label:"電漿化學沉積 / ALD 機",tier:4},diff_furnace:{path:"./assets/machines/diff_furnace.png",label:"熱擴散高溫爐管",tier:1},diff_implanter:{path:"./assets/machines/diff_implanter.png",label:"大束流離子佈植機",tier:2},cmp_polisher:{path:"./assets/machines/cmp_polisher.png",label:"化學機械平坦化研磨機",tier:3}},characters:{tech_cleanroom:{path:"./assets/characters/tech_cleanroom.png",label:"Cleanroom Technician"},agv_carrier:{path:"./assets/characters/agv_carrier.png",label:"AGV Wafer Carrier"},oht_shuttle:{path:"./assets/characters/oht_shuttle.png",label:"OHT Sky-Rail Shuttle"}}};class b{static getContext(){if(this.isMuted)return null;if(!this.audioCtx){const t=window.AudioContext||window.webkitAudioContext;t&&(this.audioCtx=new t)}return this.audioCtx&&this.audioCtx.state==="suspended"&&this.audioCtx.resume(),this.audioCtx}static toggleMute(){return this.isMuted=!this.isMuted,this.isMuted}static isAudioMuted(){return this.isMuted}static playClick(){const t=this.getContext();if(!t)return;const e=t.createOscillator(),s=t.createGain(),a=t.currentTime;e.type="sine",e.frequency.setValueAtTime(800,a),e.frequency.exponentialRampToValueAtTime(1200,a+.04),s.gain.setValueAtTime(.15,a),s.gain.exponentialRampToValueAtTime(.001,a+.04),e.connect(s),s.connect(t.destination),e.start(a),e.stop(a+.04)}static playCoin(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.createOscillator(),a=t.createOscillator(),i=t.createGain();s.type="sine",s.frequency.setValueAtTime(987.77,e),s.frequency.setValueAtTime(1318.51,e+.08),a.type="triangle",a.frequency.setValueAtTime(1975.53,e+.08),i.gain.setValueAtTime(.2,e),i.gain.exponentialRampToValueAtTime(.001,e+.28),s.connect(i),a.connect(i),i.connect(t.destination),s.start(e),s.stop(e+.28),a.start(e+.08),a.stop(e+.28)}static playCoinChime(){this.playCoin()}static playSuccess(){const t=this.getContext();if(!t)return;const e=t.currentTime;[523.25,659.25,783.99,1046.5].forEach((a,i)=>{const r=t.createOscillator(),n=t.createGain(),d=e+i*.08;r.type="triangle",r.frequency.setValueAtTime(a,d),n.gain.setValueAtTime(.2,d),n.gain.exponentialRampToValueAtTime(.001,d+.35),r.connect(n),n.connect(t.destination),r.start(d),r.stop(d+.35)})}static playFanfare(){this.playSuccess()}static playWarning(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.createOscillator(),a=t.createGain();s.type="sawtooth",s.frequency.setValueAtTime(440,e),s.frequency.setValueAtTime(554.37,e+.1),a.gain.setValueAtTime(.12,e),a.gain.exponentialRampToValueAtTime(.001,e+.25),s.connect(a),a.connect(t.destination),s.start(e),s.stop(e+.25)}static playCriticalAlarm(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.createOscillator(),a=t.createGain();s.type="sawtooth",s.frequency.setValueAtTime(600,e),s.frequency.linearRampToValueAtTime(950,e+.18),s.frequency.linearRampToValueAtTime(600,e+.36),a.gain.setValueAtTime(.18,e),a.gain.exponentialRampToValueAtTime(.001,e+.4),s.connect(a),a.connect(t.destination),s.start(e),s.stop(e+.4)}static playExplosion(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.sampleRate*.6,a=t.createBuffer(1,s,t.sampleRate),i=a.getChannelData(0);for(let l=0;l<s;l++)i[l]=Math.random()*2-1;const r=t.createBufferSource();r.buffer=a;const n=t.createBiquadFilter();n.type="lowpass",n.frequency.setValueAtTime(800,e),n.frequency.exponentialRampToValueAtTime(40,e+.6);const d=t.createGain();d.gain.setValueAtTime(.4,e),d.gain.exponentialRampToValueAtTime(.001,e+.6),r.connect(n),n.connect(d),d.connect(t.destination),r.start(e),r.stop(e+.6)}static playRework(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.sampleRate*.4,a=t.createBuffer(1,s,t.sampleRate),i=a.getChannelData(0);for(let l=0;l<s;l++)i[l]=Math.random()*2-1;const r=t.createBufferSource();r.buffer=a;const n=t.createBiquadFilter();n.type="bandpass",n.frequency.setValueAtTime(1200,e),n.frequency.exponentialRampToValueAtTime(300,e+.4),n.Q.value=3;const d=t.createGain();d.gain.setValueAtTime(.2,e),d.gain.exponentialRampToValueAtTime(.001,e+.4),r.connect(n),n.connect(d),d.connect(t.destination),r.start(e),r.stop(e+.4)}static playAlarm(){this.playWarning()}static playDing(){this.playCoin()}}E(b,"audioCtx",null),E(b,"isMuted",!1);const ce=class ce extends Phaser.Scene{constructor(){super({key:ce.KEY});E(this,"saveGame");E(this,"tileWidth",200);E(this,"tileHeight",100);E(this,"isPlannerMode",!1);E(this,"plannerTool","NONE");E(this,"movingMachineId",null);E(this,"pointerDownMachineId",null);E(this,"plannerIndicatorGraphics");E(this,"selectionRingGraphics");E(this,"onStateUpdateCallback");E(this,"floorGraphics");E(this,"railGraphics");E(this,"machineMap",new Map);E(this,"technicians",[]);E(this,"ohtShuttles",[]);E(this,"agvCarriers",[]);E(this,"isDragging",!1);E(this,"dragStartX",0);E(this,"dragStartY",0);E(this,"totalDragDistance",0);E(this,"dragThreshold",6);E(this,"justSelectedMachineOnPointerUp",!1);E(this,"onMachineClickCallback")}init(e){this.saveGame=e.saveGame,this.onMachineClickCallback=e.onMachineClick,this.onStateUpdateCallback=e.onStateUpdate}preload(){this.load.on("complete",()=>{this.refreshMachineSprites()}),this.load.on("loaderror",e=>{console.warn("⚠️ 貼圖載入失敗:",e==null?void 0:e.key,e==null?void 0:e.url)});for(const[e,s]of Object.entries(N.machines))this.textures.exists(e)||this.load.image(e,s.path);for(const[e,s]of Object.entries(N.characters))!this.textures.exists(e)&&s.path&&this.load.image(e,s.path)}refreshMachineSprites(){for(const e of this.saveGame.machines){const s=this.machineMap.get(e.id);if(s&&!s.sprite&&this.textures.exists(e.modelId)){s.fallback&&(s.fallback.destroy(),s.fallback=void 0);const a=this.add.image(0,-35,e.modelId),i=this.tileWidth*.95;a.setDisplaySize(i,i),s.container.addAt(a,1),s.sprite=a}}}create(){this.floorGraphics=this.add.graphics(),this.selectionRingGraphics=this.add.graphics(),this.selectionRingGraphics.setDepth(45),this.plannerIndicatorGraphics=this.add.graphics(),this.plannerIndicatorGraphics.setDepth(48),this.railGraphics=this.add.graphics(),this.renderFloor(),this.renderOHTRails(),this.renderMachines(),this.spawnTechnicians(),this.spawnAGVCarriers(),this.spawnOHTShuttles(),this.cameras.main.centerOn(0,300),this.cameras.main.setZoom(.85),this.setupCameraControls(),this.scale.on("resize",this.onResize,this)}toScreen(e,s){const a=(e-s)*(this.tileWidth/2),i=(e+s)*(this.tileHeight/2);return{x:a,y:i}}toGrid(e,s){const a=Math.round(e/this.tileWidth+s/this.tileHeight),i=Math.round(s/this.tileHeight-e/this.tileWidth);return{gridX:a,gridY:i}}renderFloor(){this.floorGraphics.clear();const e=this.saveGame.facility.bayGridSize,s=this.saveGame.facility.yellowRoomTiles||[];for(let a=0;a<e.width;a++)for(let i=0;i<e.height;i++){const{x:r,y:n}=this.toScreen(a,i),d=s.length>0?s.some(h=>h.x===a&&h.y===i):i<=3&&a>=3&&a<=7,l={x:r,y:n-this.tileHeight/2},o={x:r+this.tileWidth/2,y:n},p={x:r,y:n+this.tileHeight/2},c={x:r-this.tileWidth/2,y:n};d?(this.floorGraphics.fillStyle(3153414,.96),this.floorGraphics.lineStyle(1.8,16096779,.55)):(this.floorGraphics.fillStyle((a+i)%2===0?594210:792109,.95),this.floorGraphics.lineStyle(1,1976635,.55)),this.floorGraphics.beginPath(),this.floorGraphics.moveTo(l.x,l.y),this.floorGraphics.lineTo(o.x,o.y),this.floorGraphics.lineTo(p.x,p.y),this.floorGraphics.lineTo(c.x,c.y),this.floorGraphics.closePath(),this.floorGraphics.fillPath(),this.floorGraphics.strokePath()}}renderOHTRails(){this.railGraphics.clear();const e=this.saveGame.facility.bayGridSize,s=-160;this.railGraphics.lineStyle(2.5,440020,.35);const a=this.toScreen(1,1),i=this.toScreen(e.width-2,1),r=this.toScreen(e.width-2,e.height-2),n=this.toScreen(1,e.height-2);this.railGraphics.beginPath(),this.railGraphics.moveTo(a.x,a.y+s),this.railGraphics.lineTo(i.x,i.y+s),this.railGraphics.lineTo(r.x,r.y+s),this.railGraphics.lineTo(n.x,n.y+s),this.railGraphics.closePath(),this.railGraphics.strokePath()}renderMachines(){R.updateMachineNames(this.saveGame.machines);const e=new Set(this.saveGame.machines.map(a=>a.id));for(const[a,i]of this.machineMap)e.has(a)||(i.container.destroy(),this.machineMap.delete(a));const s=new Map(this.saveGame.staff.map(a=>[a.id,a]));for(const a of this.saveGame.machines){const{x:i,y:r}=this.toScreen(a.gridX,a.gridY),n=(a.gridX+a.gridY)*10+50;let d=this.machineMap.get(a.id);if(d){if(d.container.setPosition(i,r),d.container.setDepth(n),!d.sprite&&this.textures.exists(a.modelId)){d.fallback&&(d.fallback.destroy(),d.fallback=void 0);const h=this.add.image(0,-25,a.modelId),m=118;h.setDisplaySize(m,m),d.container.addAt(h,1),d.sprite=h}if(d.ledArc.setFillStyle(this.getLEDColor(a.status)),d.label.setText(`${a.name} (${Math.round(a.wear)}%)`),a.status==="PROCESSING"){if(!d.processingText){const h=this.add.text(0,-104,"⚡ 加工中",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#38bdf8",backgroundColor:"rgba(8, 47, 73, 0.95)",padding:{x:5,y:2}});h.setOrigin(.5),d.container.add(h),d.processingText=h}}else d.processingText&&(d.processingText.destroy(),d.processingText=void 0);const l=R.isMachineInYellowRoom(a,this.saveGame.facility.yellowRoomTiles);if((a.category==="LITHO"||a.category==="TRACK")&&!l){if(!d.yellowAlertText){const h=this.add.text(0,-125,"🚨 缺乏黃光防護 (良率 0%)",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#ffffff",backgroundColor:"rgba(220, 38, 38, 0.95)",padding:{x:6,y:3}});h.setOrigin(.5),d.container.add(h),d.yellowAlertText=h}}else d.yellowAlertText&&(d.yellowAlertText.destroy(),d.yellowAlertText=void 0);const p=a.assignedEngineerId?s.get(a.assignedEngineerId):null,c=X.checkTPMConditions(a,p);if(c.isTPMActive&&!d.tpmText){const h=this.add.text(0,-104,"🛡️ TPM 零故障",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#10b981",backgroundColor:"rgba(6, 78, 59, 0.92)",padding:{x:5,y:2}});h.setOrigin(.5),d.container.add(h),d.tpmText=h}else!c.isTPMActive&&d.tpmText&&(d.tpmText.destroy(),d.tpmText=void 0)}else{const l=this.add.container(i,r);l.setDepth(n);const o=this.add.ellipse(0,10,88,38,0,.4);l.add(o);let p,c;const h=118;this.textures.exists(a.modelId)?(p=this.add.image(0,-25,a.modelId),p.setDisplaySize(h,h),l.add(p)):(c=this.createFallbackMachineGraphic(a),l.add(c));const m=this.getLEDColor(a.status),u=this.add.circle(0,-82,6,m);l.add(u);const f=this.add.text(0,18,`${a.name} (${Math.round(a.wear)}%)`,{fontFamily:"Noto Sans TC, sans-serif",fontSize:"11px",fontStyle:"bold",color:"#f8fafc",backgroundColor:"rgba(15, 23, 42, 0.88)",padding:{x:6,y:3}});f.setOrigin(.5),l.add(f);const g=a.assignedEngineerId?s.get(a.assignedEngineerId):null,v=X.checkTPMConditions(a,g);let y;v.isTPMActive&&(y=this.add.text(0,-104,"🛡️ TPM 零故障",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#10b981",backgroundColor:"rgba(6, 78, 59, 0.92)",padding:{x:5,y:2}}),y.setOrigin(.5),l.add(y));let x;a.status==="PROCESSING"&&(x=this.add.text(0,-104,"⚡ 加工中",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#38bdf8",backgroundColor:"rgba(8, 47, 73, 0.95)",padding:{x:5,y:2}}),x.setOrigin(.5),l.add(x));const w=R.isMachineInYellowRoom(a,this.saveGame.facility.yellowRoomTiles),T=a.category==="LITHO"||a.category==="TRACK";let C;T&&!w&&(C=this.add.text(0,-125,"🚨 缺乏黃光防護 (良率 0%)",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#ffffff",backgroundColor:"rgba(220, 38, 38, 0.95)",padding:{x:6,y:3}}),C.setOrigin(.5),l.add(C));const M=96,P=96;l.setInteractive(new Phaser.Geom.Rectangle(-M/2,-P+15,M,P),Phaser.Geom.Rectangle.Contains),l.on("pointerdown",O=>{var I;document.querySelector(".modal-backdrop")||(((I=document.getElementById("modal-container"))==null?void 0:I.children.length)??0)>0||(this.pointerDownMachineId=a.id,O.event&&O.event.stopPropagation())}),l.on("pointerover",()=>{var I;if(document.querySelector(".modal-backdrop")||(((I=document.getElementById("modal-container"))==null?void 0:I.children.length)??0)>0)return;const O=this.machineMap.get(a.id);O!=null&&O.sprite&&O.sprite.setTint(3718648)}),l.on("pointerout",()=>{const O=this.machineMap.get(a.id);O!=null&&O.sprite&&O.sprite.clearTint()}),l.on("pointerup",O=>{var I;if(document.querySelector(".modal-backdrop")||(((I=document.getElementById("modal-container"))==null?void 0:I.children.length)??0)>0){this.pointerDownMachineId=null;return}this.pointerDownMachineId===a.id&&this.totalDragDistance<=this.dragThreshold&&(O.event&&O.event.stopPropagation(),b.playClick(),this.isPlannerMode&&this.plannerTool==="MOVE_MACHINE"?(this.justSelectedMachineOnPointerUp=!0,this.selectMachineToMove(a)):this.isPlannerMode||this.onMachineClickCallback&&this.onMachineClickCallback(a)),this.pointerDownMachineId=null}),this.machineMap.set(a.id,{container:l,ledArc:u,label:f,tpmText:y,processingText:x,yellowAlertText:C,sprite:p,fallback:c})}}}createFallbackMachineGraphic(e){const s=this.add.graphics(),a=60;let i=3900150;return e.category==="LITHO"&&(i=16096779),e.category==="TRACK"&&(i=1096065),e.category==="ETCH"&&(i=9133302),e.category==="DIFF"&&(i=15485081),e.category==="CMP"&&(i=440020),s.fillStyle(i,.9),s.beginPath(),s.moveTo(0,-70),s.lineTo(a/2,-60),s.lineTo(0,-50),s.lineTo(-a/2,-60),s.closePath(),s.fillPath(),s.fillStyle(i,.7),s.beginPath(),s.moveTo(-a/2,-60),s.lineTo(0,-50),s.lineTo(0,0),s.lineTo(-a/2,-10),s.closePath(),s.fillPath(),s.fillStyle(i,.5),s.beginPath(),s.moveTo(0,-50),s.lineTo(a/2,-60),s.lineTo(a/2,-10),s.lineTo(0,0),s.closePath(),s.fillPath(),s}getLEDColor(e){switch(e){case"IDLE":return 1096065;case"PROCESSING":return 440020;case"MAINTENANCE":return 16096779;case"EXPLODED":return 15680580}}spawnTechnicians(){const e=Math.min(6,Math.max(2,this.saveGame.staff.length));for(let s=0;s<e;s++){const a=this.add.container(0,0);a.setDepth(200);const i=this.add.ellipse(0,4,18,9,0,.35);if(a.add(i),this.textures.exists("tech_cleanroom")){const n=this.add.image(0,-18,"tech_cleanroom");n.setDisplaySize(48,48),a.add(n)}else{const n=this.add.circle(0,-12,8,16317180),d=this.add.rectangle(0,-12,8,4,3718648),l=this.add.rectangle(0,-4,12,12,14870768);a.add([l,n,d])}const r=this.toScreen(2+s,3);a.setPosition(r.x,r.y),this.technicians.push({container:a,targetX:r.x,targetY:r.y,speed:.6+Math.random()*.4})}}spawnAGVCarriers(){if(this.saveGame.unlockedFeatures.agv)for(let e=0;e<2;e++){const s=this.add.container(0,0);s.setDepth(205);const a=this.add.ellipse(0,4,24,12,0,.4);if(s.add(a),this.textures.exists("agv_carrier")){const r=this.add.image(0,-14,"agv_carrier");r.setDisplaySize(54,40),s.add(r)}else{const r=this.add.rectangle(0,-8,28,16,165063),n=this.add.rectangle(0,-18,16,12,1096065),d=this.add.circle(10,-8,3,15680580);s.add([r,n,d])}const i=this.toScreen(1+e*3,2);s.setPosition(i.x,i.y),this.agvCarriers.push({container:s,targetX:i.x,targetY:i.y,speed:1.1+e*.2})}}spawnOHTShuttles(){if(!this.saveGame.unlockedFeatures.oht)return;const e=!!this.saveGame.unlockedFeatures.shrOht,s=this.add.container(0,-160);if(s.setDepth(500),this.textures.exists("oht_shuttle")){const i=this.add.image(0,16,"oht_shuttle");i.setDisplaySize(56,42),e&&i.setTint(3462041),s.add(i)}else{const i=this.add.rectangle(0,0,8,12,4674921),r=this.add.rectangle(0,10,32,18,e?1096065:959977),n=this.add.rectangle(0,22,20,16,1096065),d=this.add.circle(12,10,3,e?1096065:2278750);s.add([i,r,n,d])}const a=this.toScreen(1,1);s.setPosition(a.x,a.y-160),this.ohtShuttles.push({container:s,progress:0,speed:e?.005:.002})}update(e,s){const a=this.saveGame.facility.bayGridSize,i=[this.toScreen(1,1),this.toScreen(a.width-2,1),this.toScreen(a.width-2,a.height-2),this.toScreen(1,a.height-2)];for(const r of this.ohtShuttles){r.progress=(r.progress+r.speed*(s/16))%1;const n=i.length,d=Math.floor(r.progress*n),l=(d+1)%n,o=r.progress*n%1,p=i[d],c=i[l],h=p.x+(c.x-p.x)*o,m=p.y+(c.y-p.y)*o-160;r.container.setPosition(h,m)}for(const r of this.technicians){const n=r.targetX-r.container.x,d=r.targetY-r.container.y,l=Math.sqrt(n*n+d*d);if(l<4){const o=Math.floor(Math.random()*(a.width-2))+1,p=Math.floor(Math.random()*(a.height-2))+1,c=this.toScreen(o,p);r.targetX=c.x,r.targetY=c.y}else r.container.x+=n/l*r.speed*(s/16),r.container.y+=d/l*r.speed*(s/16)}for(const r of this.agvCarriers){const n=r.targetX-r.container.x,d=r.targetY-r.container.y,l=Math.sqrt(n*n+d*d);if(l<4){const o=Math.floor(Math.random()*(a.width-2))+1,p=Math.floor(Math.random()*(a.height-2))+1,c=this.toScreen(o,p);r.targetX=c.x,r.targetY=c.y}else r.container.x+=n/l*r.speed*(s/16),r.container.y+=d/l*r.speed*(s/16)}}setPlannerMode(e,s="NONE"){this.isPlannerMode=e,this.plannerTool=s,this.movingMachineId=null,this.plannerIndicatorGraphics.clear(),this.selectionRingGraphics.clear()}selectMachineToMove(e){if(this.movingMachineId===e.id){this.movingMachineId=null,this.selectionRingGraphics.clear(),this.plannerIndicatorGraphics.clear(),b.playClick();return}this.movingMachineId=e.id,b.playClick(),this.drawSelectionRing(e.gridX,e.gridY)}drawSelectionRing(e,s){this.selectionRingGraphics.clear();const{x:a,y:i}=this.toScreen(e,s);this.selectionRingGraphics.lineStyle(3.5,440020,.95);const r={x:a,y:i-this.tileHeight/2-2},n={x:a+this.tileWidth/2+4,y:i},d={x:a,y:i+this.tileHeight/2+2},l={x:a-this.tileWidth/2-4,y:i};this.selectionRingGraphics.beginPath(),this.selectionRingGraphics.moveTo(r.x,r.y),this.selectionRingGraphics.lineTo(n.x,n.y),this.selectionRingGraphics.lineTo(d.x,d.y),this.selectionRingGraphics.lineTo(l.x,l.y),this.selectionRingGraphics.closePath(),this.selectionRingGraphics.strokePath()}updatePlannerCursorIndicator(e,s){if(!this.isPlannerMode||!this.plannerIndicatorGraphics)return;this.plannerIndicatorGraphics.clear();const{gridX:a,gridY:i}=this.toGrid(e,s),r=this.saveGame.facility.bayGridSize;if(a<0||a>=r.width||i<0||i>=r.height)return;const{x:n,y:d}=this.toScreen(a,i),l={x:n,y:d-this.tileHeight/2},o={x:n+this.tileWidth/2,y:d},p={x:n,y:d+this.tileHeight/2},c={x:n-this.tileWidth/2,y:d};this.plannerTool==="PAINT_YELLOW"?(this.plannerIndicatorGraphics.fillStyle(16096779,.45),this.plannerIndicatorGraphics.lineStyle(2.5,16498468,.95)):this.plannerTool==="PAINT_WHITE"?(this.plannerIndicatorGraphics.fillStyle(165063,.45),this.plannerIndicatorGraphics.lineStyle(2.5,3718648,.95)):this.plannerTool==="MOVE_MACHINE"&&(this.saveGame.machines.some(m=>m.id!==this.movingMachineId&&m.gridX===a&&m.gridY===i)?(this.plannerIndicatorGraphics.fillStyle(15680580,.45),this.plannerIndicatorGraphics.lineStyle(2.5,16281969,.95)):(this.plannerIndicatorGraphics.fillStyle(1096065,.45),this.plannerIndicatorGraphics.lineStyle(2.5,3462041,.95))),this.plannerIndicatorGraphics.beginPath(),this.plannerIndicatorGraphics.moveTo(l.x,l.y),this.plannerIndicatorGraphics.lineTo(o.x,o.y),this.plannerIndicatorGraphics.lineTo(p.x,p.y),this.plannerIndicatorGraphics.lineTo(c.x,c.y),this.plannerIndicatorGraphics.closePath(),this.plannerIndicatorGraphics.fillPath(),this.plannerIndicatorGraphics.strokePath()}handlePlannerTileClick(e,s){var i,r,n;const a=this.saveGame.facility.bayGridSize;if(!(e<0||e>=a.width||s<0||s>=a.height)){if(this.plannerTool==="PAINT_YELLOW")this.saveGame.facility.yellowRoomTiles||(this.saveGame.facility.yellowRoomTiles=[]),this.saveGame.facility.yellowRoomTiles.some(l=>l.x===e&&l.y===s)||(this.saveGame.facility.yellowRoomTiles.push({x:e,y:s}),b.playClick(),this.renderFloor(),this.renderMachines(),(i=this.onStateUpdateCallback)==null||i.call(this));else if(this.plannerTool==="PAINT_WHITE"){if(this.saveGame.facility.yellowRoomTiles){const d=this.saveGame.facility.yellowRoomTiles.findIndex(l=>l.x===e&&l.y===s);d>=0&&(this.saveGame.facility.yellowRoomTiles.splice(d,1),b.playClick(),this.renderFloor(),this.renderMachines(),(r=this.onStateUpdateCallback)==null||r.call(this))}}else if(this.plannerTool==="MOVE_MACHINE"&&this.movingMachineId){const d=this.saveGame.machines.find(o=>o.id===this.movingMachineId);if(!d||d.gridX===e&&d.gridY===s)return;if(this.saveGame.machines.some(o=>o.id!==this.movingMachineId&&o.gridX===e&&o.gridY===s)){b.playAlarm();return}d.gridX=e,d.gridY=s,b.playDing(),this.movingMachineId=null,this.selectionRingGraphics.clear(),this.plannerIndicatorGraphics.clear(),this.renderMachines(),this.renderOHTRails(),(n=this.onStateUpdateCallback)==null||n.call(this)}}}setupCameraControls(){this.input.on("pointerdown",e=>{var s;document.querySelector(".modal-backdrop")||(((s=document.getElementById("modal-container"))==null?void 0:s.children.length)??0)>0||e.leftButtonDown()&&(this.isDragging=!0,this.dragStartX=e.x,this.dragStartY=e.y,this.totalDragDistance=0)}),this.input.on("pointermove",e=>{if(this.isPlannerMode){const s=this.cameras.main.getWorldPoint(e.x,e.y);this.updatePlannerCursorIndicator(s.x,s.y)}if(this.isDragging){if(!e.isDown||!e.leftButtonDown()){this.isDragging=!1;return}const s=e.x-this.dragStartX,a=e.y-this.dragStartY;this.totalDragDistance+=Math.hypot(s,a),this.totalDragDistance>this.dragThreshold&&(this.cameras.main.scrollX-=s*.85/this.cameras.main.zoom,this.cameras.main.scrollY-=a*.85/this.cameras.main.zoom),this.dragStartX=e.x,this.dragStartY=e.y}}),this.input.on("pointerup",e=>{var a;const s=this.totalDragDistance>this.dragThreshold;if(this.isDragging=!1,this.pointerDownMachineId=null,this.justSelectedMachineOnPointerUp){this.justSelectedMachineOnPointerUp=!1;return}if(!(document.querySelector(".modal-backdrop")||(((a=document.getElementById("modal-container"))==null?void 0:a.children.length)??0)>0)&&!s&&this.isPlannerMode){const i=this.cameras.main.getWorldPoint(e.x,e.y),{gridX:r,gridY:n}=this.toGrid(i.x,i.y);this.handlePlannerTileClick(r,n)}}),window.addEventListener("mouseup",()=>{this.isDragging=!1,this.pointerDownMachineId=null}),window.addEventListener("blur",()=>{this.isDragging=!1,this.pointerDownMachineId=null}),this.input.on("wheel",(e,s,a,i)=>{var n;if(document.querySelector(".modal-backdrop")||(((n=document.getElementById("modal-container"))==null?void 0:n.children.length)??0)>0)return;const r=Phaser.Math.Clamp(this.cameras.main.zoom-i*.001,.45,2.2);this.cameras.main.setZoom(r)})}onResize(e){this.cameras.main.setSize(e.width,e.height)}updateState(e){const s=!this.saveGame||e.userId&&this.saveGame.userId!==e.userId;if(this.saveGame=e,s){for(const[a,i]of this.machineMap)i.container.destroy();this.machineMap.clear();for(const a of this.technicians)a.container.destroy();this.technicians=[];for(const a of this.agvCarriers)a.container.destroy();this.agvCarriers=[];for(const a of this.ohtShuttles)a.container.destroy();this.ohtShuttles=[],this.movingMachineId=null,this.selectionRingGraphics.clear(),this.plannerIndicatorGraphics.clear(),this.renderFloor(),this.renderOHTRails(),this.renderMachines(),this.spawnTechnicians(),this.saveGame.unlockedFeatures.agv&&this.spawnAGVCarriers(),this.saveGame.unlockedFeatures.oht&&this.spawnOHTShuttles()}else if(this.renderFloor(),this.renderOHTRails(),this.renderMachines(),this.saveGame.unlockedFeatures.agv&&this.agvCarriers.length===0&&this.spawnAGVCarriers(),this.saveGame.unlockedFeatures.oht){if(this.ohtShuttles.length===0)this.spawnOHTShuttles();else if(this.saveGame.unlockedFeatures.shrOht)for(const a of this.ohtShuttles){a.speed=.005;const i=a.container.getAt(0);i&&i.setTint&&i.setTint(3462041)}}}};E(ce,"KEY","CleanroomScene");let re=ce;class F{static getInitialAchievements(){return JSON.parse(JSON.stringify(this.INITIAL_ACHIEVEMENTS))}static checkAchievements(t){const e=[],s=new Map;for(const l of t.achievements)s.set(l.id,l);const a=l=>{const o=s.get(l);o&&!o.unlocked&&(o.unlocked=!0,e.push(o))};t.rollingYieldHistory.length>=1&&a("first_silicon"),(t.activeLots.some(l=>l.currentStation==="LIT"||l.currentStation==="ETCH"||l.currentStation==="DIFF")||t.rollingYieldHistory.length>=1)&&a("step_into_yellow");const r=t.activeOrders.filter(l=>l.status==="FULFILLED");r.length>=1&&a("first_cash"),t.unlockedFeatures.mesAutoDispatch&&a("mes_mastery"),r.some(l=>l.nodeNm<=350)&&a("submicron_explorer"),t.unlockedFeatures.cmp&&t.machines.some(l=>l.category==="CMP")&&a("copper_cmp_era"),t.machines.some(l=>l.modelId==="litho_arfi")&&a("immersion_wave"),t.machines.some(l=>l.modelId==="litho_euv"||l.modelId==="litho_highna")&&a("euv_domination");const n=new Map(t.staff.map(l=>[l.id,l]));let d=0;for(const l of t.machines){const o=l.assignedEngineerId?n.get(l.assignedEngineerId):null;X.checkTPMConditions(l,o).isTPMActive&&d++}if(d>=3&&a("tpm_zero_defect"),t.machines.some(l=>{var o;return l.category==="LITHO"&&(((o=l.pairedTrackIds)==null?void 0:o.length)??0)>=2})&&a("inline_cluster_master"),t.facility.cleanroomPhase>=4&&a("gigafab_expansion"),t.unlockedFeatures.agv&&t.unlockedFeatures.oht&&a("automation_highway"),t.rollingYieldHistory.some(l=>l>=.99)&&a("flawless_wafer"),r.some(l=>!!l.assignedPieId)&&a("pie_guardian"),t.rollingYieldHistory.length>=5){const l=t.rollingYieldHistory.slice(-5);l.reduce((p,c)=>p+c,0)/l.length>=.95&&a("five_star_foundry")}return t.player.cash>=1e8&&a("trillion_chip_dynasty"),{newlyUnlocked:e}}static triggerManualUnlock(t,e){const s=t.find(a=>a.id===e);return s&&!s.unlocked?(s.unlocked=!0,!0):!1}static claimReward(t,e){const s=t.find(a=>a.id===e);return s?s.unlocked?s.claimed?{success:!1,cash:0,message:"該成就獎勵已領取"}:(s.claimed=!0,{success:!0,cash:s.rewardCash,message:`🏆 成功領取成就【${s.title}】獎勵！獲得獎勵金 NT$ ${s.rewardCash.toLocaleString()}！`}):{success:!1,cash:0,message:"尚未達成該成就解鎖條件"}:{success:!1,cash:0,message:"找不到該成就"}}}E(F,"INITIAL_ACHIEVEMENTS",[{id:"first_silicon",category:"onboarding",title:"矽島啟航 (First Silicon)",description:"成功在廠房內完成並產出第一批晶圓。",rewardCash:5e4,unlocked:!1,claimed:!1},{id:"step_into_yellow",category:"onboarding",title:"邁入黃光密室 (Yellow Room Entry)",description:"首次完成微影站塗膠、曝光與顯影連線作業。",rewardCash:8e4,unlocked:!1,claimed:!1},{id:"first_cash",category:"onboarding",title:"首桶金進帳 (First Cash Delivery)",description:"成功履約第一張客戶製造合約並取得全額尾款。",rewardCash:1e5,unlocked:!1,claimed:!1},{id:"mes_mastery",category:"onboarding",title:"智慧製造大師 (MES Mastery)",description:"完成新手教學，解鎖並啟用 MES 智慧自動派工系統。",rewardCash:15e4,unlocked:!1,claimed:!1},{id:"submicron_explorer",category:"process",title:"突破次微米壁壘 (Sub-micron Explorer)",description:"成功承接並交付線寬 <= 350nm 之高階次微米訂單。",rewardCash:5e5,unlocked:!1,claimed:!1},{id:"copper_cmp_era",category:"process",title:"銅導線與平坦化時代 (CMP Era)",description:"解鎖並在廠房內運作 CMP 化學機械平坦化拋光設備。",rewardCash:1e6,unlocked:!1,claimed:!1},{id:"immersion_wave",category:"process",title:"水中折射奇蹟 (Immersion Wave)",description:"購買並安裝 Tier 5 ArFi 浸潤微影雙工件台設備 (TWINSCAN)。",rewardCash:5e6,unlocked:!1,claimed:!1},{id:"euv_domination",category:"process",title:"極紫外神之光 (EUV Domination)",description:"購買並啟用極紫外光微影巨獸 (EUV Scanner)。",rewardCash:2e7,unlocked:!1,claimed:!1},{id:"tpm_zero_defect",category:"operation",title:"零非計畫停機殿堂 (TPM Zero-Defect)",description:"同時維持 3 台以上機台處於 🛡️ TPM 24H 零故障在線維護保障狀態。",rewardCash:2e6,unlocked:!1,claimed:!1},{id:"inline_cluster_master",category:"operation",title:"雙軌並聯突破極限 (Inline Cluster Master)",description:"為微影機台並聯配套綁定 2 台以上 Track 塗膠顯影設備，消除產能瓶頸。",rewardCash:15e5,unlocked:!1,claimed:!1},{id:"gigafab_expansion",category:"operation",title:"GigaFab 超級晶圓廠 (GigaFab Expansion)",description:"將潔淨室無塵廠房拓建至 Phase 4 (24x24 巨型潔淨室)。",rewardCash:1e7,unlocked:!1,claimed:!1},{id:"automation_highway",category:"operation",title:"自動化天軌物流 (Automation Highway)",description:"同時解鎖地面 AGV 自走車與天花板 OHT 懸吊天軌系統。",rewardCash:3e6,unlocked:!1,claimed:!1},{id:"flawless_wafer",category:"yield",title:"神級黃金良率 (Flawless Wafer 99%+)",description:"成功生產交付一批最終良率達 99% 以上的頂級晶圓。",rewardCash:1e6,unlocked:!1,claimed:!1},{id:"pie_guardian",category:"yield",title:"製程整合守護神 (PIE Yield Guardian)",description:"為在製訂單指派專任製程整合工程師 (PIE)，並成功交付出廠一批晶圓。",rewardCash:5e5,unlocked:!1,claimed:!1},{id:"five_star_foundry",category:"yield",title:"五星品質金字招牌 (Five-Star Foundry)",description:"累積至少 5 批出貨紀錄，且 RollingYieldIndex 滾動良率指數突破 95%！",rewardCash:8e6,unlocked:!1,claimed:!1},{id:"trillion_chip_dynasty",category:"yield",title:"稱霸全球矽島霸權 (Silicon Hegemony)",description:"總現金累積突破 NT$ 100,000,000，建立無可撼動的半導體傳奇帝國。",rewardCash:5e7,unlocked:!1,claimed:!1}]);class j{static generateSingleCandidate(t,e=0){const s=["PIE","LITHO","TRACK","FILM","ETCH","DIFF","CMP"],a=this.FIRST_NAMES[Math.floor(Math.random()*this.FIRST_NAMES.length)],i=this.LAST_NAMES[Math.floor(Math.random()*this.LAST_NAMES.length)],r=s[Math.floor(Math.random()*s.length)];let n="Young Specialist",d=2e4,l=45e3,o=180,p=r==="PIE"?"跨站點製程整合專才，指派訂單可加速工步 +8%，保障交貨良率 +3%":"專精基礎機台操作，磨損累積 -10%，微影 k1 -0.01。適合操作 Tier 1~2。";const c=Math.random();return t>=5&&c>.65?(n="Fellow",d=5e5,l=35e4,o=90,p=r==="PIE"?"世界級晶圓製程整合權威泰斗，指派訂單可加速工步 +40%，保障交貨良率 +16%！":"頂級半導體物理泰斗，磨損累積 -80%，微影 k1 -0.06，良率 +15%，可抵銷先進製程視窗損失！"):t>=3&&c>.45?(n="Senior Engineer",d=12e4,l=15e4,o=120,p=r==="PIE"?"多年製程整合資深主管，指派訂單可加速工步 +25%，保障交貨良率 +10%":"多年產線調機權威，磨損累積 -50%，微影 k1 -0.04，良率 +10%。適合操作 Tier 3~5。"):t>=2&&c>.3&&(n="Skilled Worker",d=5e4,l=75e3,o=150,p=r==="PIE"?"專任製程整合工程師，指派訂單可加速工步 +15%，保障交貨良率 +6%":"熟練製程技師，磨損累積 -25%，微影 k1 -0.02，良率 +5%。適合操作 Tier 1~3。"),{id:`CAN-${Date.now().toString(36).slice(-4)}-${e}-${Math.floor(Math.random()*999)}`,name:`${a} ${i}`,rank:n,moduleSpecialty:r,signingBonus:d,salary:l,description:p,marketExpiresAt:Date.now()+o*1e3}}static generateMarketCandidates(t,e=this.MAX_MARKET_CANDIDATES){const s=[];for(let a=0;a<e;a++)s.push(this.generateSingleCandidate(t,a));return s}static checkMarketCandidatesExpiry(t){if(!t.marketCandidates)return t.marketCandidates=this.generateMarketCandidates(t.player.foundryTier),t.nextCandidateRespawnTime=0,!0;const e=Date.now();let s=!1;for(let a=0;a<t.marketCandidates.length;a++){const i=t.marketCandidates[a];if(!i.marketExpiresAt){i.marketExpiresAt=e+12e4;continue}e>=i.marketExpiresAt&&(t.marketCandidates[a]=this.generateSingleCandidate(t.player.foundryTier,a),s=!0)}return t.marketCandidates.length<this.MAX_MARKET_CANDIDATES&&(!t.nextCandidateRespawnTime||t.nextCandidateRespawnTime<=0?(t.nextCandidateRespawnTime=e+this.REPLENISH_COOLDOWN_MS,s=!0):e>=t.nextCandidateRespawnTime&&(t.marketCandidates.push(this.generateSingleCandidate(t.player.foundryTier,t.marketCandidates.length)),t.marketCandidates.length<this.MAX_MARKET_CANDIDATES?t.nextCandidateRespawnTime=e+this.REPLENISH_COOLDOWN_MS:t.nextCandidateRespawnTime=0,s=!0)),s}static forceRefreshAllCandidates(t){t.marketCandidates=this.generateMarketCandidates(t.player.foundryTier,this.MAX_MARKET_CANDIDATES),t.nextCandidateRespawnTime=0}static isWeekend(){const t=new Date().getDay();return t===0||t===6}static applyShiftMode(t,e){for(const s of t.staff)s.shiftMode=e;if(e==="WEEKEND_REST")if(this.isWeekend())for(const s of t.staff)s.workShift="OFF";else{const s=["DAY","SWING","NIGHT"];t.staff.forEach((a,i)=>{a.workShift=s[i%3]})}else if(e==="TWO_ON_TWO_OFF")t.staff.forEach((s,a)=>{s.workShift=a%2===0?"DAY":"OFF"});else if(e==="TWO_SHIFT")t.staff.forEach((s,a)=>{s.workShift=a%2===0?"DAY":"SWING"});else if(e==="THREE_SHIFT"){const s=["DAY","SWING","NIGHT"];t.staff.forEach((a,i)=>{a.workShift=s[i%3]})}}}E(j,"MAX_MARKET_CANDIDATES",6),E(j,"REPLENISH_COOLDOWN_MS",6e4),E(j,"FIRST_NAMES",["Alex","David","Sarah","Kevin","Emily","Michael","Jessica","James","Daniel","Rachel","Robert","Brian","Olivia","William","Sophia","Thomas","Emma","Chris","Grace","Eric","Lucas","Chloe","Nathan","Hannah","Marcus","Elena","Jason","Amber","Tyler","Mia","Austin","Zoe"]),E(j,"LAST_NAMES",["Miller","Chen","Smith","Williams","Johnson","Taylor","Davis","Wilson","Anderson","White","Harris","Martin","Clark","Lewis","Walker","Hall","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Lin","Huang","Chang","Wu","Baker","Nelson","Adams","Campbell"]);class ${static createDefaultSave(t="矽島先進半導體",e="張創辦人",s="avatar_1"){const a=Date.now(),i={schemaVersion:2,savedAt:a,lastOnlineTimestamp:a,player:{companyName:t,ceoName:e,avatarId:s,cash:5e7,foundryTier:1,popularity:100,unlockedK1:"BASE",unlockedCleanroomClass:"Class 10000",totalOrdersFulfilled:0,totalWafersDelivered:0,rdInvestedCash:0,tutorialCompleted:!1},unlockedFeatures:{cmp:!1,agv:!1,oht:!1,shrOht:!1,mesAutoDispatch:!0,mixAndMatchLitho:!1},facility:{cleanroomPhase:1,bayGridSize:{width:10,height:10},yellowRoomTiles:[{x:3,y:1},{x:4,y:1},{x:5,y:1},{x:6,y:1},{x:7,y:1},{x:3,y:2},{x:4,y:2},{x:5,y:2},{x:6,y:2},{x:7,y:2},{x:3,y:3},{x:4,y:3},{x:5,y:3},{x:6,y:3},{x:7,y:3}]},machines:[{id:"mach_film_1",modelId:"film_furnace",name:"熱氧化爐 (Thermal Oxidation)",category:"FILM",tier:1,gridX:1,gridY:2,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_track_1",modelId:"track_clean",name:"手動旋塗熱板台 (Manual Track)",category:"TRACK",tier:1,gridX:4,gridY:2,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_litho_1",modelId:"litho_contact",name:"接觸式微影機 (Contact Aligner)",category:"LITHO",tier:1,gridX:6,gridY:2,wear:0,status:"IDLE",assignedEngineerId:"staff_1",pairedTrackIds:["mach_track_1"]},{id:"mach_etch_1",modelId:"etch_plasma",name:"電漿乾式蝕刻機 (Dry Plasma Etcher)",category:"ETCH",tier:1,gridX:6,gridY:6,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_diff_1",modelId:"diff_furnace",name:"擴散退火爐 (Diffusion Furnace)",category:"DIFF",tier:1,gridX:2,gridY:6,wear:0,status:"IDLE",assignedEngineerId:null}],staff:[{id:"staff_1",name:"Alex Miller",rank:"Skilled Worker",moduleSpecialty:"LITHO",fatigue:10,shiftMode:"WEEKEND_REST",workShift:"DAY",assignedMachineId:"mach_litho_1",salary:6e4},{id:"staff_2",name:"Sarah Chen",rank:"Skilled Worker",moduleSpecialty:"PIE",fatigue:5,shiftMode:"WEEKEND_REST",workShift:"DAY",assignedMachineId:null,salary:75e3}],activeOrders:[],activeLots:[],rollingYieldHistory:[],clawbackDebt:0,questState:{lastDateStr:new Date().toISOString().split("T")[0],dailyQuests:[],allDailyClaimed:!1,weeklyCompletedCount:0,weeklyTarget:15,weeklyClaimed:!1},achievements:F.getInitialAchievements(),gameTime:0,financialState:A.initFinancialState(5e7,7e7),marketOrders:D.generateContractBoard(1,null,0),nextOrderRespawnTime:0,marketCandidates:j.generateMarketCandidates(1,6),nextCandidateRespawnTime:0};return R.updateMachineNames(i.machines),i}static getUserProfiles(){try{const t=localStorage.getItem(this.REGISTRY_KEY);if(t){const e=JSON.parse(t);if(Array.isArray(e)&&e.length>0)return e}}catch(t){console.warn("讀取使用者目錄失敗:",t)}return this.initializeDefaultProfile()}static initializeDefaultProfile(){const t=localStorage.getItem(this.STORAGE_KEY_V2);let e="張創辦人",s="矽島先進半導體",a=1,i=5e7,r=Date.now();if(t)try{const l=JSON.parse(t);l.player&&(e=l.player.ceoName||e,s=l.player.companyName||s,a=l.player.foundryTier||a,i=l.player.cash||i,r=l.savedAt||r)}catch{}const n={id:"usr_default",name:e,companyName:s,foundryTier:a,cash:i,createdAt:r,lastPlayedAt:Date.now(),storageKey:this.STORAGE_KEY_V2},d=[n];try{localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(d)),localStorage.setItem(this.ACTIVE_USER_ID_KEY,n.id)}catch{}return d}static getActiveUserProfile(){const t=this.getUserProfiles(),e=localStorage.getItem(this.ACTIVE_USER_ID_KEY),s=t.find(i=>i.id===e);if(s)return s;const a=t[0]||this.initializeDefaultProfile()[0];return localStorage.setItem(this.ACTIVE_USER_ID_KEY,a.id),a}static createUser(t,e){const s=t.trim()||`執行長 ${Math.floor(Math.random()*900+100)}`,a=(e==null?void 0:e.trim())||`${s}半導體`,i=`usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2,6)}`,r=`SILICON_TYCOON_SAVE_${i}`,n={id:i,name:s,companyName:a,foundryTier:1,cash:5e7,createdAt:Date.now(),lastPlayedAt:Date.now(),storageKey:r},d=this.createDefaultSave(a,s);d.userId=i,localStorage.setItem(r,JSON.stringify(d));const l=this.getUserProfiles();return l.push(n),localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(l)),localStorage.setItem(this.ACTIVE_USER_ID_KEY,i),n}static renameUser(t,e){const s=e.trim();if(!s)return!1;const a=this.getUserProfiles(),i=a.find(n=>n.id===t);if(!i)return!1;i.name=s,localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(a));const r=localStorage.getItem(i.storageKey);if(r)try{const n=JSON.parse(r);n.player&&(n.player.ceoName=s,localStorage.setItem(i.storageKey,JSON.stringify(n)))}catch{}return!0}static deleteUser(t){const e=this.getUserProfiles();if(e.length<=1)return{success:!1,message:"至少需要保留一個玩家存檔，無法全部刪除！"};const s=e.findIndex(r=>r.id===t);if(s===-1)return{success:!1,message:"找不到該玩家存檔！"};const a=e[s];return localStorage.removeItem(a.storageKey),e.splice(s,1),localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(e)),localStorage.getItem(this.ACTIVE_USER_ID_KEY)===t&&localStorage.setItem(this.ACTIVE_USER_ID_KEY,e[0].id),{success:!0}}static switchActiveUser(t){return this.getUserProfiles().find(a=>a.id===t)?(localStorage.setItem(this.ACTIVE_USER_ID_KEY,t),this.loadFromLocalStorage()):null}static factoryResetAllData(){try{const t=[];for(let e=0;e<localStorage.length;e++){const s=localStorage.key(e);s&&s.toLowerCase().startsWith("silicon_tycoon")&&t.push(s)}for(const e of t)localStorage.removeItem(e)}catch(t){console.warn("清空存檔時發生例外:",t),localStorage.clear()}}static saveToLocalStorage(t){try{t.savedAt=Date.now(),t.lastOnlineTimestamp=Date.now();const e=this.getActiveUserProfile(),s=t.userId&&t.userId===e.id?e.storageKey:e.storageKey||this.STORAGE_KEY_V2,a=JSON.stringify(t);localStorage.setItem(s,a);const i=this.getUserProfiles(),r=i.find(n=>n.id===e.id);return r&&(r.cash=t.player.cash,r.foundryTier=t.player.foundryTier,r.companyName=t.player.companyName,r.name=t.player.ceoName,r.lastPlayedAt=Date.now(),localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(i))),!0}catch(e){return console.error("LocalStorage 存檔失敗:",e),!1}}static loadFromLocalStorage(){var t,e;try{const s=this.getActiveUserProfile();let a=localStorage.getItem(s.storageKey);if(!a&&s.id==="usr_default"&&(a=localStorage.getItem(this.STORAGE_KEY_V2)),a){const n=JSON.parse(a);if(n.schemaVersion===2){if(n.staff&&(n.staff=this.normalizeStaffData(n.staff)),n.facility||(n.facility={cleanroomPhase:1,bayGridSize:{width:10,height:10}}),(!n.facility.yellowRoomTiles||n.facility.yellowRoomTiles.length===0)&&(n.facility.yellowRoomTiles=[{x:3,y:1},{x:4,y:1},{x:5,y:1},{x:6,y:1},{x:7,y:1},{x:3,y:2},{x:4,y:2},{x:5,y:2},{x:6,y:2},{x:7,y:2},{x:3,y:3},{x:4,y:3},{x:5,y:3},{x:6,y:3},{x:7,y:3}]),(!n.facility.bayGridSize||n.facility.bayGridSize.width<10)&&(n.facility.bayGridSize={width:10,height:10}),n.userId=s.id,n.financialState=A.ensureFinancialState(n),n.player&&(n.player.totalOrdersFulfilled===void 0&&(n.player.totalOrdersFulfilled=0),n.player.totalWafersDelivered===void 0&&(n.player.totalWafersDelivered=0),n.player.rdInvestedCash===void 0&&(n.player.rdInvestedCash=0)),n.machines&&R.updateMachineNames(n.machines),n.rollingYieldHistory&&n.rollingYieldHistory.length>0&&n.rollingYieldHistory.every(l=>l>=.88)&&(((t=n.player)==null?void 0:t.foundryTier)||1)===1&&(n.rollingYieldHistory=[.56,.6,.58,.64,.56]),n.staff&&Array.isArray(n.staff)&&(n.staff.some(l=>l.moduleSpecialty==="PIE")||n.staff.push({id:"staff_pie_1",name:"Sarah Chen",rank:"Skilled Worker",moduleSpecialty:"PIE",fatigue:5,shiftMode:"THREE_SHIFT",workShift:"DAY",assignedMachineId:null,salary:75e3})),n.marketOrders){const l=Date.now();for(const o of n.marketOrders)if(o.allowedDurationSec||(o.allowedDurationSec=D.getAllowedDurationSec(o)),!o.marketExpiresAt||o.marketExpiresAt<=l){const p=(o.urgencyMultiplier||1)>=1.5?45e3:(o.urgencyMultiplier||1)>=1.2?7e4:1e5;o.marketExpiresAt=l+p}}if(n.activeOrders)for(const l of n.activeOrders)l.allowedDurationSec||(l.allowedDurationSec=D.getAllowedDurationSec(l)),l.deadlineGameTime<=(n.gameTime||0)&&l.goodDiesDelivered<l.totalDies&&(l.deadlineGameTime=(n.gameTime||0)+l.allowedDurationSec);D.ensureMarketOrders(n),(!n.marketCandidates||n.marketCandidates.length===0)&&(n.marketCandidates=j.generateMarketCandidates(((e=n.player)==null?void 0:e.foundryTier)||1,6),n.nextCandidateRespawnTime=0),n.unlockedFeatures?n.unlockedFeatures.mesAutoDispatch=!0:n.unlockedFeatures={cmp:!1,agv:!1,oht:!1,shrOht:!1,mesAutoDispatch:!0,mixAndMatchLitho:!1};const d=F.getInitialAchievements();if(!n.achievements||!Array.isArray(n.achievements))n.achievements=d;else{n.achievements=n.achievements.filter(l=>l.id!=="rework_savior");for(const l of d)n.achievements.some(o=>o.id===l.id)||n.achievements.push(l)}return n}}const i=localStorage.getItem(this.STORAGE_KEY_V1);if(i){const n=JSON.parse(i);if(n.schemaVersion===1){console.warn("偵測到舊版 SaveGameV1 存檔，執行自動升級至 SaveGameV2...");const d=this.migrateSaveV1toV2(n);return d.userId=s.id,d.financialState=A.ensureFinancialState(d),this.saveToLocalStorage(d),d}}const r=this.createDefaultSave(s.companyName,s.name);return r.userId=s.id,this.saveToLocalStorage(r),r}catch(s){return console.error("LocalStorage 讀檔失敗:",s),null}}static normalizeStaffData(t){return t.map((e,s)=>{const a=/[\u4e00-\u9fa5]/.test(e.name);let i=e.name;if(a||!i){const r=this.ENGLISH_FIRST_NAMES[s%this.ENGLISH_FIRST_NAMES.length],n=this.ENGLISH_LAST_NAMES[s%this.ENGLISH_LAST_NAMES.length];i=`${r} ${n}`}return{...e,name:i,workShift:e.workShift||(s%3===0?"DAY":s%3===1?"SWING":"NIGHT")}})}static migrateSaveV1toV2(t){var i;const e=new Date().toISOString().split("T")[0],s=t.machines.map(r=>({...r,pairedTrackIds:r.category==="LITHO"?[]:void 0})),a=t.activeOrders.map(r=>({...r,urgencyMultiplier:r.urgencyMultiplier??1,layerAllocations:[]}));return{schemaVersion:2,savedAt:t.savedAt??Date.now(),lastOnlineTimestamp:t.lastOnlineTimestamp??Date.now(),player:{...t.player},unlockedFeatures:{cmp:t.unlockedFeatures.cmp??!1,agv:t.unlockedFeatures.agv??!1,oht:t.unlockedFeatures.oht??!1,mesAutoDispatch:t.unlockedFeatures.mesAutoDispatch??!1,mixAndMatchLitho:!1},facility:{cleanroomPhase:((i=t.facility)==null?void 0:i.cleanroomPhase)??1,bayGridSize:{width:10,height:10},yellowRoomTiles:[{x:3,y:1},{x:4,y:1},{x:5,y:1},{x:6,y:1},{x:7,y:1},{x:3,y:2},{x:4,y:2},{x:5,y:2},{x:6,y:2},{x:7,y:2},{x:3,y:3},{x:4,y:3},{x:5,y:3},{x:6,y:3},{x:7,y:3}]},machines:s,staff:this.normalizeStaffData(t.staff??[]),activeOrders:a,activeLots:t.activeLots??[],rollingYieldHistory:t.rollingYieldHistory??[],clawbackDebt:t.clawbackDebt??0,questState:{lastDateStr:e,dailyQuests:[],allDailyClaimed:!1,weeklyCompletedCount:0,weeklyTarget:15,weeklyClaimed:!1},achievements:F.getInitialAchievements(),gameTime:t.gameTime??0,marketCandidates:j.generateMarketCandidates(t.player.foundryTier,6),nextCandidateRespawnTime:0}}static exportSaveToJson(t){return JSON.stringify(t,null,2)}static importSaveFromJson(t){try{const e=JSON.parse(t);return e.schemaVersion===2?{success:!0,state:e}:e.schemaVersion===1?{success:!0,state:this.migrateSaveV1toV2(e)}:{success:!1,error:"不相容的存檔格式版本！"}}catch(e){return{success:!1,error:`JSON 解析失敗: ${e.message}`}}}static calculateOfflineProgress(t,e){const s=Math.max(0,Math.floor((e-t.lastOnlineTimestamp)/1e3)),a=Math.min(14400,s),i={offlineDurationSeconds:a,lotsProcessed:0,wafersDelivered:0,revenueEarned:0,salaryPaid:0,utilityPaid:0,maintenanceExpense:0,debtRepaid:0,breakdownCount:0,explosionCount:0,tpmProtectedCount:0,netProfit:0};if(a<60)return i;const r=Math.floor(a/300),n=new Map(t.staff.map(u=>[u.id,u]));let d=0;for(const u of t.machines){const f=u.assignedEngineerId?n.get(u.assignedEngineerId):null;if(X.checkTPMConditions(u,f).isTPMActive)d++,u.wear=Math.min(5,u.wear),u.status="IDLE";else{const v=r*.4;u.wear=Math.min(100,u.wear+v),u.wear>=60&&Math.random()<.3&&(i.breakdownCount++,X.checkExplosionRisk(u,f).hasRisk&&Math.random()<.25?(i.explosionCount++,i.maintenanceExpense+=2e5*u.tier,u.status="EXPLODED"):(i.maintenanceExpense+=5e4*u.tier,u.status="MAINTENANCE"))}}i.tpmProtectedCount=d;const l=a/3600,o=t.staff.reduce((u,f)=>u+f.salary,0)/720,p=t.machines.length*15e3/720;if(i.salaryPaid=Math.round(o*l),i.utilityPaid=Math.round(p*l),t.unlockedFeatures.mesAutoDispatch&&t.activeOrders.length>0){const u=t.activeOrders.find(f=>f.status==="ACTIVE");if(u&&i.explosionCount===0){const f=Math.min(Math.floor(a/180),10);if(f>0){i.lotsProcessed=f;const g=f*5;i.wafersDelivered=g;const v=Math.round(g*100*u.unitPrice);i.revenueEarned=v;for(let y=0;y<f;y++)t.rollingYieldHistory.push(.92)}}}const c=i.revenueEarned,h=i.salaryPaid+i.utilityPaid+i.maintenanceExpense,m=c-h;if(m>0&&t.clawbackDebt>0){const u=Math.min(t.clawbackDebt,Math.round(m*.25));i.debtRepaid=u,t.clawbackDebt-=u}return i.netProfit=c-h-i.debtRepaid,t.player.cash=Math.max(0,t.player.cash+i.netProfit),t.gameTime+=a,t.lastOnlineTimestamp=e,t.savedAt=e,i}}E($,"STORAGE_KEY_V2","SILICON_TYCOON_SAVE_V2"),E($,"STORAGE_KEY_V1","SILICON_TYCOON_SAVE_V1"),E($,"REGISTRY_KEY","SILICON_TYCOON_USERS_REGISTRY"),E($,"ACTIVE_USER_ID_KEY","SILICON_TYCOON_ACTIVE_USER_ID"),E($,"ENGLISH_FIRST_NAMES",["Alex","David","Sarah","Kevin","Emily","Michael","Jessica","James","Daniel","Rachel","Robert","Brian","Olivia","William","Sophia","Thomas"]),E($,"ENGLISH_LAST_NAMES",["Miller","Chen","Smith","Williams","Johnson","Taylor","Davis","Wilson","Anderson","White","Harris","Martin","Clark","Lewis","Walker","Hall"]);class Y{static getTierConfig(t){return this.TIER_CONFIGS[t]||this.TIER_CONFIGS[1]}static getProgressionStatus(t){const e=t.player.foundryTier||1,s=e>=this.MAX_TIER,a=e+1,i=s?null:this.getTierConfig(a),r=t.player.totalOrdersFulfilled||0,n=t.player.totalWafersDelivered||0,d=t.player.rdInvestedCash||0;if(s||!i)return{currentTier:e,maxTier:this.MAX_TIER,isMaxTier:!0,nextTierConfig:null,ordersCompleted:r,ordersTarget:r,ordersMet:!0,ordersPct:100,wafersDelivered:n,wafersTarget:n,wafersMet:!0,wafersPct:100,fundsInvested:d,fundsTarget:d,fundsMet:!0,fundsPct:100,canAdvance:!1,overallPct:100};const l=i.reqOrders,o=i.reqWafers,p=i.reqResearchFunds,c=r>=l,h=n>=o,m=d>=p,u=Math.min(100,Math.round(r/Math.max(1,l)*100)),f=Math.min(100,Math.round(n/Math.max(1,o)*100)),g=Math.min(100,Math.round(d/Math.max(1,p)*100)),v=Math.round((u+f+g)/3),y=c&&h&&m;return{currentTier:e,maxTier:this.MAX_TIER,isMaxTier:!1,nextTierConfig:i,ordersCompleted:r,ordersTarget:l,ordersMet:c,ordersPct:u,wafersDelivered:n,wafersTarget:o,wafersMet:h,wafersPct:f,fundsInvested:d,fundsTarget:p,fundsMet:m,fundsPct:g,canAdvance:y,overallPct:v}}static investRDCapital(t,e){const s=this.getProgressionStatus(t);if(s.isMaxTier||!s.nextTierConfig)return{success:!1,invested:0,message:"晶圓廠已達最高科技世代，無需再注資！"};const a=s.fundsTarget-s.fundsInvested;if(a<=0)return{success:!1,invested:0,message:"本世代研發資金已全數募足，請達成代工訂單與晶圓量產目標以晉升！"};const i=Math.max(0,Math.min(e,a,t.player.cash));return i<=0?{success:!1,invested:0,message:"廠房資金不足，無法撥款注資！"}:(t.player.cash-=i,t.player.rdInvestedCash=(t.player.rdInvestedCash||0)+i,A.recordCapEx(t,i),{success:!0,invested:i,message:`成功撥款注資 NT$ ${i.toLocaleString()} 注入次世代製程研發！`})}static advanceFoundryTier(t){const e=this.getProgressionStatus(t);if(e.isMaxTier||!e.nextTierConfig)return{success:!1,newTier:t.player.foundryTier,message:"已達最高科技世代！"};if(!e.canAdvance){const a=[];return e.ordersMet||a.push(`還需交付 ${e.ordersTarget-e.ordersCompleted} 筆訂單`),e.wafersMet||a.push(`還需生產 ${e.wafersTarget-e.wafersDelivered} 片晶圓`),e.fundsMet||a.push(`還需研發注資 NT$ ${(e.fundsTarget-e.fundsInvested).toLocaleString()}`),{success:!1,newTier:t.player.foundryTier,message:`尚未達成晉升條件：${a.join("、")}`}}const s=e.nextTierConfig.tier;if(t.player.foundryTier=s,t.player.rdInvestedCash=0,t.player.popularity=Math.min(100,t.player.popularity+5),e.nextTierConfig.unlockedCleanroomClass&&(t.player.unlockedCleanroomClass=e.nextTierConfig.unlockedCleanroomClass),e.nextTierConfig.unlockedFeatureKeys)for(const a of e.nextTierConfig.unlockedFeatureKeys)t.unlockedFeatures[a]=!0;return F.checkAchievements(t),{success:!0,newTier:s,message:`🎉 狂賀！製程微縮重大突破！晶圓廠成功晉升至【Tier ${s} ${e.nextTierConfig.name}】！已解鎖次世代機台採購與合約！`}}}E(Y,"MAX_TIER",6),E(Y,"TIER_CONFIGS",{1:{tier:1,name:"微米微影啟蒙時代",subtitle:"5µm ~ 3µm 微米成熟製程",eraCode:"ERA_1_MICRON",minCDNm:3e3,unlockedCleanroomClass:"Class 10,000",description:"半導體萌芽初創期，以接觸式與等倍投影曝光為核心，邁出晶圓製造的第一步。",scienceHistory:"使用汞燈紫外光混光與手工旋塗光阻，光罩物理貼合或反射鏡投影，極限線寬約 3 微米。",reqOrders:0,reqWafers:0,reqResearchFunds:0,unlockedModelIds:["litho_contact","litho_projection","track_manual","film_evap","film_sputter","etch_wet_barrel","diff_box","diff_tube_manual"]},2:{tier:2,name:"亞微米步進縮小時代",subtitle:"1.2µm ~ 800nm (G-Line 436nm)",eraCode:"ERA_2_SUBMICRON",minCDNm:800,unlockedCleanroomClass:"Class 1,000",description:"引入 4:1 縮小透鏡與步進曝光技術，晶圓製造邁入百萬顆電晶體之 1 微米世代。",scienceHistory:"採用高壓汞燈 g-line (436nm) 搭配光學鏡頭群，突破接觸式光罩刮傷瓶頸，全面提升良率。",reqOrders:3,reqWafers:100,reqResearchFunds:15e6,unlockedModelIds:["litho_gline","track_single","film_pecvd","etch_rie","diff_auto_horiz"]},3:{tier:3,name:"次微米紫外深耕時代",subtitle:"500nm ~ 350nm (I-Line & CMP)",eraCode:"ERA_3_DEEPUV_STEP",minCDNm:350,unlockedCleanroomClass:"Class 100",description:"推進至 i-line 紫外光，雙軌 Track 連線作業，並解鎖化學機械研磨 (CMP) 平坦化神技。",scienceHistory:"採用 365nm i-line 高強度紫外光搭配 NA=0.50 鏡頭，CMP 平坦化技術解決多層金屬互連景深問題。",reqOrders:8,reqWafers:350,reqResearchFunds:5e7,unlockedModelIds:["litho_iline","track_dual","film_hdp_cvd","etch_merie","diff_vertical","cmp_manual","cmp_standard"],unlockedFeatureKeys:["cmp"]},4:{tier:4,name:"深紫外 DUV 跨越時代",subtitle:"250nm ~ 90nm (KrF/ArF & MES 自動化)",eraCode:"ERA_4_DUV_EXCIMER",minCDNm:90,unlockedCleanroomClass:"Class 10",description:"準分子雷射掃描曝光與化學增幅型光阻 (CAR)，產線導入 MES 智慧派工無人化管理。",scienceHistory:"248nm KrF 與 193nm ArF 準分子雷射結合動態掃描 (Step-and-Scan)，大幅擴大曝光視場與精準度。",reqOrders:18,reqWafers:1e3,reqResearchFunds:18e7,unlockedModelIds:["litho_krf","litho_arfdry","track_clean","film_ald_thermal","etch_icp_advanced","diff_lpcvd_rapid","cmp_auto"],unlockedFeatureKeys:["mesAutoDispatch"]},5:{tier:5,name:"浸潤式微影顛峰時代",subtitle:"65nm ~ 7nm (ArFi 193nm 水折射)",eraCode:"ERA_5_IMMERSION_PEAK",minCDNm:7,unlockedCleanroomClass:"Class 1",description:"林本堅博士浸潤式水折射微影革命，搭配雙工件台磁浮掃描與多重曝光 (SAQP)，極限微縮至 7nm。",scienceHistory:"鏡頭與晶圓間注入超純水 (n=1.44)，將等效 NA 推升至 1.35，打破物理極限，領先全球晶圓代工市場。",reqOrders:35,reqWafers:3e3,reqResearchFunds:6e8,unlockedModelIds:["litho_arfi","film_ald_plasma","etch_ale_atomic","diff_rtp_laser","cmp_atomic"],unlockedFeatureKeys:["mixAndMatchLitho"]},6:{tier:6,name:"埃米 EUV 矽島霸權時代",subtitle:"5nm ~ 2nm 以下 (High-NA EUV 埃米時代)",eraCode:"ERA_6_HIGH_NA_EUV",minCDNm:2,unlockedCleanroomClass:"Class 1 (ISO 3)",description:"13.5nm 極紫外光與 0.55 NA 變形鏡頭次世代巨獸，單次曝光推進 2nm，傲視全球的半導體科技霸主！",scienceHistory:"以二氧化碳雷射高頻擊打錫滴激發電漿產生 13.5nm 極紫外光，全機超高真空運行，登頂世界半導體工業之巔。",reqOrders:60,reqWafers:8e3,reqResearchFunds:25e8,unlockedModelIds:["litho_euv","litho_highna","track_advanced"]}});class Q{static getContainer(){if(!this.container||!document.body.contains(this.container)){let t=document.getElementById("cash-fx-container");t||(t=document.createElement("div"),t.id="cash-fx-container",t.className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden",document.body.appendChild(t)),this.container=t}return this.container}static trigger(t,e){if(Math.abs(t)<1)return;const s=t>0,a=Math.round(Math.abs(t)),i=this.getContainer();let r=window.innerWidth/2,n=48;if(e&&"getBoundingClientRect"in e){const m=e.getBoundingClientRect();r=m.left+m.width/2,n=s?m.top:m.bottom}else if(e&&typeof e.x=="number")r=e.x,n=e.y;else{const m=document.getElementById("btn-hud-cash")||document.getElementById("hud-cash-value");if(m){const u=m.getBoundingClientRect();r=u.left+u.width/2,n=u.bottom+4}}const d=(Math.random()-.5)*28,l=(Math.random()-.5)*8;r+=d,n+=l;const o=document.createElement("div");o.className=`absolute pointer-events-none font-mono font-black text-sm sm:text-base flex items-center gap-1.5 select-none ${s?"cash-fx-gain":"cash-fx-loss"}`,o.style.left=`${r}px`,o.style.top=`${n}px`,o.style.transform="translate(-50%, -50%)";const p=s?"💰":"💸",c=s?"+":"-";o.innerHTML=`
      <span class="text-xs sm:text-sm drop-shadow">${p}</span>
      <span>${c}NT$ ${a.toLocaleString()}</span>
    `,i.appendChild(o);const h=document.getElementById("hud-cash-value");h&&(h.classList.remove("cash-pulse-green","cash-pulse-red"),h.offsetWidth,h.classList.add(s?"cash-pulse-green":"cash-pulse-red"),setTimeout(()=>{h.classList.remove("cash-pulse-green","cash-pulse-red")},650)),s&&a>=5e4&&b.playCoinChime(),setTimeout(()=>{o.remove()},1400)}}E(Q,"container",null);class Ee{constructor(t,e){E(this,"container");E(this,"callbacks");E(this,"isInitialized",!1);E(this,"isDropdownOpen",!1);E(this,"currentState",null);E(this,"lastKnownCash",null);const s=document.getElementById(t);if(!s)throw new Error(`找不到 HUD 容器: #${t}`);this.container=s,this.callbacks=e,document.addEventListener("click",a=>{if(!this.isDropdownOpen)return;const i=document.getElementById("top-dropdown-menu"),r=document.getElementById("btn-top-more"),n=a.target;i&&!i.contains(n)&&r&&!r.contains(n)&&this.closeDropdown()})}rebuild(){this.isInitialized=!1,this.isDropdownOpen=!1,this.lastKnownCash=null}closeDropdown(){this.isDropdownOpen=!1;const t=document.getElementById("top-dropdown-menu");t&&t.classList.add("hidden")}toggleDropdown(){this.isDropdownOpen=!this.isDropdownOpen;const t=document.getElementById("top-dropdown-menu");t&&(this.isDropdownOpen?t.classList.remove("hidden"):t.classList.add("hidden"))}render(t){this.currentState=t,(!this.isInitialized||!this.container.firstElementChild)&&(this.renderInitialStructure(),this.bindEvents(),this.isInitialized=!0),this.updateValues(t)}renderInitialStructure(){this.container.innerHTML=`
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
    `}bindEvents(){var t,e,s,a,i,r,n,d,l,o,p,c,h,m,u,f,g,v,y;(t=document.getElementById("btn-contracts"))==null||t.addEventListener("click",x=>{x.stopPropagation(),this.closeDropdown(),b.playClick(),this.callbacks.onOpenContracts()}),(e=document.getElementById("btn-store"))==null||e.addEventListener("click",x=>{x.stopPropagation(),this.closeDropdown(),b.playClick(),this.callbacks.onOpenStore()}),(s=document.getElementById("btn-techtree"))==null||s.addEventListener("click",x=>{var w,T;x.stopPropagation(),this.closeDropdown(),b.playClick(),(T=(w=this.callbacks).onOpenTechTree)==null||T.call(w)}),(a=document.getElementById("btn-planner"))==null||a.addEventListener("click",x=>{var w,T;x.stopPropagation(),this.closeDropdown(),b.playClick(),(T=(w=this.callbacks).onOpenPlanner)==null||T.call(w)}),(i=document.getElementById("btn-finance"))==null||i.addEventListener("click",x=>{var w,T;x.stopPropagation(),this.closeDropdown(),b.playClick(),(T=(w=this.callbacks).onOpenFinance)==null||T.call(w)}),(r=document.getElementById("btn-hud-cash"))==null||r.addEventListener("click",x=>{var w,T;x.stopPropagation(),this.closeDropdown(),b.playClick(),(T=(w=this.callbacks).onOpenFinance)==null||T.call(w)}),(n=document.getElementById("btn-hud-yield"))==null||n.addEventListener("click",x=>{var w,T;x.stopPropagation(),this.closeDropdown(),b.playClick(),(T=(w=this.callbacks).onOpenWaferMap)==null||T.call(w)}),(d=document.getElementById("btn-advisory-alert"))==null||d.addEventListener("click",x=>{x.stopPropagation(),this.closeDropdown(),b.playClick(),this.callbacks.onOpenAdvisory()}),(l=document.getElementById("btn-hud-profile-avatar"))==null||l.addEventListener("click",x=>{var w,T;x.stopPropagation(),this.closeDropdown(),b.playClick(),(T=(w=this.callbacks).onOpenLogin)==null||T.call(w)}),(o=document.getElementById("btn-hud-switch-user"))==null||o.addEventListener("click",x=>{var w,T;x.stopPropagation(),this.closeDropdown(),b.playClick(),(T=(w=this.callbacks).onOpenLogin)==null||T.call(w)}),(p=document.getElementById("btn-top-more"))==null||p.addEventListener("click",x=>{x.stopPropagation(),b.playClick(),this.toggleDropdown()}),(c=document.getElementById("menu-item-hr"))==null||c.addEventListener("click",x=>{x.stopPropagation(),this.closeDropdown(),b.playClick(),this.callbacks.onOpenHR()}),(h=document.getElementById("menu-item-quests"))==null||h.addEventListener("click",x=>{x.stopPropagation(),this.closeDropdown(),b.playClick(),this.callbacks.onOpenQuests()}),(m=document.getElementById("menu-item-achievements"))==null||m.addEventListener("click",x=>{x.stopPropagation(),this.closeDropdown(),b.playClick(),this.callbacks.onOpenAchievements()}),(u=document.getElementById("menu-item-switch-user"))==null||u.addEventListener("click",x=>{var w,T;x.stopPropagation(),this.closeDropdown(),b.playClick(),(T=(w=this.callbacks).onOpenLogin)==null||T.call(w)}),(f=document.getElementById("menu-item-save"))==null||f.addEventListener("click",x=>{x.stopPropagation(),this.closeDropdown(),b.playClick(),this.callbacks.onOpenSaveModal()}),(g=document.getElementById("menu-item-tutorial"))==null||g.addEventListener("click",x=>{var w,T;x.stopPropagation(),this.closeDropdown(),b.playClick(),(T=(w=this.callbacks).onOpenTutorial)==null||T.call(w)}),(v=document.getElementById("menu-item-sound"))==null||v.addEventListener("click",x=>{x.stopPropagation(),b.toggleMute(),b.playClick(),this.currentState&&this.updateValues(this.currentState)}),(y=document.getElementById("menu-item-factory-reset"))==null||y.addEventListener("click",x=>{var w,T;x.stopPropagation(),this.closeDropdown(),b.playClick(),(T=(w=this.callbacks).onOpenFactoryReset)==null||T.call(w)})}updateValues(t){var W;const e=t.player,s=t.unlockedFeatures.cmp,a=document.getElementById("hud-company-name");a&&(a.textContent=e.companyName);const i=document.getElementById("hud-foundry-tier");i&&(i.textContent=`Tier ${e.foundryTier}`);const r=((W=t.financialState)==null?void 0:W.currentDateStr)||A.getTodayDateString(),n=["日","一","二","三","四","五","六"][new Date().getDay()],d=document.getElementById("hud-date-str");d&&(d.textContent=`📅 ${r} (週${n})`);const l=document.getElementById("hud-ceo-name");if(l&&(l.textContent=e.ceoName),this.lastKnownCash!==null){const H=Math.round(e.cash)-Math.round(this.lastKnownCash);Math.abs(H)>=1&&Q.trigger(H)}this.lastKnownCash=e.cash;const o=document.getElementById("hud-cash-value");o&&(o.textContent=`NT$ ${Math.round(e.cash).toLocaleString()}`);const p=document.getElementById("hud-pop-value");p&&(p.textContent=`★ ${e.popularity}`);const c=t.activeLots.some(H=>H.status==="PROCESSING")||t.machines.some(H=>H.status==="PROCESSING"),h=t.rollingYieldHistory.length>0?t.rollingYieldHistory.slice(-5).reduce((H,pe)=>H+pe,0)/Math.min(5,t.rollingYieldHistory.length):null,m=D.calculateTrustMultiplier(h),u=document.getElementById("hud-yield-value"),f=document.getElementById("hud-yield-sub");u&&(u.textContent=h!==null?`${(h*100).toFixed(1)}%`:"N/A",u.className=`text-sm font-bold font-mono whitespace-nowrap ${c?h&&h>=.9?"text-emerald-400":"text-amber-400":"text-slate-400"}`),f&&(f.textContent=c?`(${m.toFixed(2)}x)`:"(待命暫停)",f.className=`text-[10px] ${c?"text-slate-400 font-normal":"text-amber-400/90 font-medium"}`);const g=R.calculateFactoryWorkload(t.machines,t.staff,t.activeLots,t.unlockedFeatures,s);let v="#10b981";g.workloadPercent>85?v="#ef4444":g.workloadPercent>=70&&(v="#f59e0b");const y=document.getElementById("hud-workload-pct");y&&(y.textContent=`${g.workloadPercent}%`);const x=document.getElementById("hud-workload-bar");x&&(x.style.width=`${Math.min(100,g.workloadPercent)}%`,x.style.backgroundColor=v);const w=document.getElementById("btn-advisory-alert");w&&(g.workloadPercent>85?w.classList.remove("hidden"):w.classList.add("hidden"));const T=Y.getProgressionStatus(t),C=document.getElementById("hud-tech-label");C&&(C.textContent=`🔬 研發 (T${e.foundryTier})`);const M=document.getElementById("btn-techtree"),P=document.getElementById("hud-tech-badge");P&&(T.canAdvance?(P.classList.remove("hidden"),M==null||M.classList.add("border-emerald-400","text-emerald-300","ring-2","ring-emerald-500/40","animate-pulse")):(P.classList.add("hidden"),M==null||M.classList.remove("border-emerald-400","text-emerald-300","ring-2","ring-emerald-500/40","animate-pulse")));const O=t.questState.dailyQuests.some(H=>H.completed&&!H.claimed),I=t.achievements.some(H=>H.unlocked&&!H.claimed),_=O||I,G=b.isAudioMuted(),K=document.getElementById("hud-more-badge");K&&(_?K.classList.remove("hidden"):K.classList.add("hidden"));const U=document.getElementById("dropdown-staff-count");U&&(U.textContent=`${t.staff.length} 人`);const z=document.getElementById("dropdown-quests-badge");z&&(z.innerHTML=O?'<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs border border-amber-500/30">待領取</span>':"");const S=document.getElementById("dropdown-achievements-badge");S&&(S.innerHTML=I?'<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30">可解鎖</span>':"");const k=document.getElementById("dropdown-sound-icon");k&&(k.textContent=G?"🔇":"🔊");const B=document.getElementById("dropdown-sound-text");B&&(B.textContent=G?"靜音":"開啟")}}class he{static show(t,e){const s=document.getElementById("modal-container");if(!s)return;let a="avatar_1";const i=()=>{var r,n,d;s.innerHTML=`
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
      `,(r=document.getElementById("btn-random-company"))==null||r.addEventListener("click",()=>{b.playClick();const l=this.RANDOM_COMPANIES[Math.floor(Math.random()*this.RANDOM_COMPANIES.length)],o=document.getElementById("setup-company-name");o&&(o.value=l)}),(n=document.getElementById("btn-random-ceo"))==null||n.addEventListener("click",()=>{b.playClick();const l=this.RANDOM_CEOS[Math.floor(Math.random()*this.RANDOM_CEOS.length)],o=document.getElementById("setup-ceo-name");o&&(o.value=l)}),document.querySelectorAll(".avatar-card").forEach(l=>{l.addEventListener("click",o=>{b.playClick();const p=o.currentTarget.getAttribute("data-avatar-id");p&&(a=p,i())})}),(d=document.getElementById("btn-submit-foundry"))==null||d.addEventListener("click",()=>{const l=document.getElementById("setup-company-name"),o=document.getElementById("setup-ceo-name"),p=(l==null?void 0:l.value.trim())||"矽島先進積體電路",c=(o==null?void 0:o.value.trim())||"張創辦人";t.player.companyName=p,t.player.ceoName=c,t.player.avatarId=a,b.playSuccess(),s.innerHTML="",e(t.player)})};i()}}E(he,"RANDOM_COMPANIES",["矽島先進積體電路","台積微系統","聯華微電科技","世界微晶圓","美光矽島半導體","瑞昱微系統","聯詠積體科技","旺宏微晶科技"]),E(he,"RANDOM_CEOS",["張忠謨","劉德音","魏哲家","曹興成","黃仁勳","蘇姿丰","蔡力行","梁孟松"]);class Se{static show(t,e,s,a){var m,u,f,g,v,y;const i=document.getElementById("modal-container");if(!i)return;const r=t.unlockedFeatures.cmp,n=R.diagnoseBottleneck(t.machines,t.staff,t.activeLots,t.unlockedFeatures,r),{workloadPercent:d,throughputs:l}=R.calculateFactoryWorkload(t.machines,t.staff,t.activeLots,t.unlockedFeatures,r);let o="bg-red-950 text-red-400 border-red-500/50",p="⚠️";n.category==="MAINTENANCE"?(o="bg-amber-950 text-amber-400 border-amber-500/50",p="🔧"):n.category==="LOGISTICS"?(o="bg-cyan-950 text-cyan-400 border-cyan-500/50",p="🚛"):n.category==="LAYOUT"&&(o="bg-purple-950 text-purple-400 border-purple-500/50",p="📐");const c=x=>{x.key==="Escape"&&(i.innerHTML="",window.removeEventListener("keydown",c))};window.addEventListener("keydown",c);const h=()=>{b.playClick(),i.innerHTML="",window.removeEventListener("keydown",c)};i.innerHTML=`
      <div id="modal-backdrop-advisory" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-2xl text-slate-100 flex flex-col max-h-[88vh]">
          <!-- 頂部標題與關閉鈕 -->
          <div class="modal-header flex items-center justify-between pb-3 border-b border-slate-700/60 flex-shrink-0">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${p}</span>
              <div>
                <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2">
                  智能瓶頸診斷與產線優化顧問
                  <span class="text-xs px-2 py-0.5 rounded-full border ${o} font-mono">
                    ${n.category}
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
                <div class="text-2xl font-black font-mono ${d>85?"text-red-400":"text-amber-400"}">
                  ${d}%
                  <span class="text-xs font-normal text-slate-400">
                    ${d>85?"(嚴重超載塞車中，排隊即將突破 Q-Time 容許上限！)":"(負載偏高)"}
                  </span>
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs text-slate-400">最大有效承載量 (瓶頸站)</div>
                <div class="text-sm font-bold font-mono text-cyan-300">
                  ${n.chokePointThroughput} 片晶圓 / 分鐘
                </div>
              </div>
            </div>

            <!-- 核心診斷結果 (大白話分析) -->
            <div class="p-4 rounded-xl bg-red-950/30 border border-red-500/40">
              <div class="text-xs font-bold text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <span>● 診斷出之致命卡點：</span>
                <span>${n.title}</span>
              </div>
              <p class="text-sm text-slate-200 leading-relaxed">
                ${n.description}
              </p>
            </div>

            <!-- 系統改良建議對策 -->
            <div class="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40">
              <div class="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                💡 系統精確改良對策：
              </div>
              <p class="text-sm text-slate-200 font-medium leading-relaxed">
                ${n.recommendation}
              </p>
            </div>

            <!-- 各站點產能即時分佈對比 -->
            <div>
              <div class="text-xs font-bold text-slate-300 mb-2">全廠六大站點實效產能對比 (晶圓/分)：</div>
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                ${Object.values(l).map(x=>`
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
              ${n.category==="CAPACITY"&&e?`<button id="btn-advisory-store" class="btn-sci-fi bg-cyan-600 hover:bg-cyan-500 font-bold px-3 py-1.5 text-xs">
                      🛒 前往商城增購設備分流
                    </button>`:""}
              ${n.category==="MAINTENANCE"&&s?`<button id="btn-advisory-hr" class="btn-sci-fi bg-amber-600 hover:bg-amber-500 font-bold px-3 py-1.5 text-xs">
                      🔧 前往人資指派維修保養
                    </button>`:""}
              ${a?`<button id="btn-advisory-yield-guide" class="btn-sci-fi bg-gradient-to-r from-amber-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 font-bold px-3 py-1.5 text-xs text-white">
                      💡 良率實戰挽救指南
                    </button>`:""}
              <button id="btn-advisory-ok" class="btn-sci-fi px-4 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700">
                ◀ 返回無塵室
              </button>
            </div>
          </div>
        </div>
      </div>
    `,(m=document.getElementById("btn-close-advisory"))==null||m.addEventListener("click",h),(u=document.getElementById("btn-advisory-ok"))==null||u.addEventListener("click",h),(f=document.getElementById("modal-backdrop-advisory"))==null||f.addEventListener("click",x=>{x.target===x.currentTarget&&h()}),(g=document.getElementById("btn-advisory-store"))==null||g.addEventListener("click",()=>{h(),e&&e()}),(v=document.getElementById("btn-advisory-hr"))==null||v.addEventListener("click",()=>{h(),s&&s()}),(y=document.getElementById("btn-advisory-yield-guide"))==null||y.addEventListener("click",()=>{h(),a&&a()})}}class ke{static show(t,e){const s=document.getElementById("modal-container");if(!s)return;const a=()=>{var l,o,p,c,h;const i=t.questState,r=q.isAllDailyCompleted(i);s.innerHTML=`
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
                    ${i.dailyQuests.filter(m=>m.completed).length}/3 已達成
                  </span>
                </div>

                ${i.dailyQuests.map(m=>{const u=Math.min(100,Math.round(m.currentValue/m.targetValue*100));return`
                      <div class="p-3.5 rounded-xl bg-slate-900/70 border ${m.completed?"border-emerald-500/50 bg-emerald-950/20":"border-slate-800"} flex items-center justify-between gap-4">
                        <div class="flex-1">
                          <div class="flex items-center gap-2">
                            <span class="text-sm font-bold text-slate-100">${m.title}</span>
                            ${m.completed?'<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300">已達成</span>':""}
                          </div>
                          <p class="text-xs text-slate-400 mt-0.5">${m.description}</p>
                          
                          <!-- 進度條 -->
                          <div class="flex items-center gap-2 mt-2">
                            <div class="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div style="width: ${u}%" class="h-full bg-cyan-400"></div>
                            </div>
                            <span class="text-[11px] font-mono text-slate-300">${m.currentValue}/${m.targetValue}</span>
                          </div>
                        </div>

                        <!-- 獎勵與按鈕 -->
                        <div class="text-right flex flex-col items-end gap-1.5 min-w-[120px]">
                          <div class="text-xs font-bold font-mono text-amber-400">
                            +NT$ ${m.rewardCash.toLocaleString()}
                          </div>
                          <div class="text-[10px] text-cyan-300">
                            商譽 +${m.rewardPopularity}
                          </div>

                          ${m.claimed?'<span class="text-xs px-3 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">已領取</span>':m.completed?`<button class="btn-claim-quest btn-sci-fi bg-emerald-600 hover:bg-emerald-500 text-xs py-1 px-3" data-id="${m.id}">
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

                ${i.allDailyClaimed?'<span class="text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-400 border border-slate-700">今日已領</span>':r?`<button id="btn-claim-all-daily" class="btn-sci-fi bg-amber-600 hover:bg-amber-500 text-xs py-1.5 px-4 font-bold shadow-lg shadow-amber-500/30">
                        領取全勤獎
                      </button>`:'<span class="text-xs text-slate-500 font-mono">需完成 3/3</span>'}
              </div>

              <!-- 每週 15 任務大獎 -->
              <div class="p-3.5 rounded-xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/40 flex items-center justify-between">
                <div>
                  <div class="text-sm font-bold text-purple-300 flex items-center gap-2">
                    <span>🏆 每週 15 任務龍頭週大獎</span>
                    <span class="text-xs font-mono text-purple-400">
                      (${i.weeklyCompletedCount}/${i.weeklyTarget})
                    </span>
                  </div>
                  <p class="text-xs text-slate-300 mt-0.5">
                    一週內累計完成 15 次營運任務，領取海量現金補助與全廠客戶信任 Buff！
                  </p>
                </div>

                ${i.weeklyClaimed?'<span class="text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-400 border border-slate-700">本週已領</span>':i.weeklyCompletedCount>=i.weeklyTarget?`<button id="btn-claim-weekly" class="btn-sci-fi bg-purple-600 hover:bg-purple-500 text-xs py-1.5 px-4 font-bold shadow-lg shadow-purple-500/30">
                        領取龍頭大獎
                      </button>`:`<span class="text-xs text-slate-500 font-mono">還需 ${Math.max(0,i.weeklyTarget-i.weeklyCompletedCount)} 項</span>`}
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
      `;const n=()=>{b.playClick(),s.innerHTML="",window.removeEventListener("keydown",d)},d=m=>{m.key==="Escape"&&n()};window.addEventListener("keydown",d),(l=document.getElementById("btn-close-quests"))==null||l.addEventListener("click",n),(o=document.getElementById("btn-back-quests"))==null||o.addEventListener("click",n),(p=document.getElementById("modal-backdrop-quest"))==null||p.addEventListener("click",m=>{m.target===document.getElementById("modal-backdrop-quest")&&n()}),document.querySelectorAll(".btn-claim-quest").forEach(m=>{m.addEventListener("click",u=>{const f=u.currentTarget.getAttribute("data-id");if(f){const g=q.claimSingleQuest(t.questState,f);g.success&&(t.player.cash+=g.cash,A.recordSubsidy(t,g.cash),t.player.popularity+=g.popularity,b.playCoin(),a(),e())}})}),(c=document.getElementById("btn-claim-all-daily"))==null||c.addEventListener("click",()=>{const m=q.claimDailyAllClear(t.questState,t.player.foundryTier);m.success&&(t.player.cash+=m.cash,A.recordSubsidy(t,m.cash),t.player.popularity+=m.popularity,b.playSuccess(),a(),e())}),(h=document.getElementById("btn-claim-weekly"))==null||h.addEventListener("click",()=>{const m=q.claimWeeklyBounty(t.questState,t.player.foundryTier);m.success&&(t.player.cash+=m.cash,A.recordSubsidy(t,m.cash),t.player.popularity+=m.popularity,b.playSuccess(),a(),e())})};a()}}class be{static show(t,e){const s=document.getElementById("modal-container");if(!s)return;F.checkAchievements(t);const a=n=>{n.key==="Escape"&&(s.innerHTML="",window.removeEventListener("keydown",a))};window.addEventListener("keydown",a);const i=()=>{b.playClick(),s.innerHTML="",window.removeEventListener("keydown",a)},r=()=>{var p,c,h;const n=t.achievements,d=n.filter(m=>m.category===this.activeCategory),l=n.filter(m=>m.unlocked).length,o=[{key:"onboarding",label:"新手入門",icon:"🚀"},{key:"process",label:"製程突破",icon:"🔬"},{key:"operation",label:"廠務卓越",icon:"🛡️"},{key:"yield",label:"品質良率",icon:"💎"}];s.innerHTML=`
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
                ${o.map(m=>`
                  <button
                    class="btn-tab px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${this.activeCategory===m.key?"bg-cyan-600 text-white shadow-lg shadow-cyan-500/20 border border-cyan-400":"bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"}"
                    data-cat="${m.key}"
                  >
                    <span>${m.icon}</span>
                    <span>${m.label}</span>
                    <span class="text-[10px] font-mono opacity-80">
                      (${n.filter(u=>u.category===m.key&&u.unlocked).length}/${n.filter(u=>u.category===m.key).length})
                    </span>
                  </button>
                `).join("")}
              </div>

              <!-- 成就清單 -->
              <div class="space-y-3">
                ${d.map(m=>`
                  <div class="p-4 rounded-xl bg-slate-900/70 border ${m.unlocked?"border-cyan-500/50 bg-cyan-950/20 shadow-md shadow-cyan-500/10":"border-slate-800/80 opacity-65"} flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3.5">
                      <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl border ${m.unlocked?"bg-cyan-950/80 border-cyan-400/60 shadow-inner":"bg-slate-800/60 border-slate-700 text-slate-600"}">
                        ${m.unlocked?"🎖️":"🔒"}
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="text-sm font-bold ${m.unlocked?"text-slate-100":"text-slate-400"}">
                            ${m.title}
                          </span>
                          ${m.unlocked?'<span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">已達成</span>':""}
                        </div>
                        <p class="text-xs text-slate-400 mt-1">${m.description}</p>
                      </div>
                    </div>

                    <!-- 獎勵金與領取按鈕 -->
                    <div class="text-right flex flex-col items-end gap-1.5 min-w-[130px]">
                      <div class="text-xs font-bold font-mono text-amber-400">
                        +NT$ ${m.rewardCash.toLocaleString()}
                      </div>
                      ${m.claimed?'<span class="text-xs px-3 py-1 rounded bg-slate-800 text-slate-400 border border-slate-700">獎勵已領</span>':m.unlocked?`<button class="btn-claim-ach btn-sci-fi bg-emerald-600 hover:bg-emerald-500 text-xs py-1 px-3 font-bold" data-id="${m.id}">
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
      `,(p=document.getElementById("btn-close-achievements"))==null||p.addEventListener("click",i),(c=document.getElementById("btn-return-achievements"))==null||c.addEventListener("click",i),(h=document.getElementById("modal-backdrop-achievements"))==null||h.addEventListener("click",m=>{m.target===m.currentTarget&&i()}),document.querySelectorAll(".btn-tab").forEach(m=>{m.addEventListener("click",u=>{b.playClick();const f=u.currentTarget.getAttribute("data-cat");f&&(this.activeCategory=f,r())})}),document.querySelectorAll(".btn-claim-ach").forEach(m=>{m.addEventListener("click",u=>{const f=u.currentTarget.getAttribute("data-id");if(f){const g=F.claimReward(t.achievements,f);g.success&&(t.player.cash+=g.cash,A.recordSubsidy(t,g.cash),b.playCoin(),r(),e())}})})};r()}}E(be,"activeCategory","onboarding");class ge{static show(t,e={}){var I,_,G,K,U,z,S;const s=document.getElementById("modal-container");if(!s)return;const a=t.facility.yellowRoomTiles||[],i=(k,B)=>a.some(W=>W.x===k&&W.y===B),n=t.machines.filter(k=>(k.category==="LITHO"||k.category==="TRACK")&&k.status!=="EXPLODED").filter(k=>!i(k.gridX,k.gridY)),d=n.length>0,o=t.activeOrders.filter(k=>k.status==="ACTIVE"||k.status==="PENDING").filter(k=>!k.assignedPieId),p=t.staff.filter(k=>k.moduleSpecialty==="PIE"),c=t.machines.filter(k=>k.status!=="EXPLODED"),h=c.filter(k=>k.hasPmTuneUpBonus).length,m=c.length>0?Math.round(c.reduce((k,B)=>k+B.wear,0)/c.length):0,u=(m/100*6).toFixed(1),f=t.machines.find(k=>k.category==="LITHO"&&k.status!=="EXPLODED"),g=f!=null&&f.assignedEngineerId?t.staff.find(k=>k.id===f.assignedEngineerId):null;let v=.5,y="0.0";f&&(v=J.calculateEffectiveK1(t.unlockedFeatures.cmp?"CAR":"BASE",f.wear,g).effectiveK1,y=(J.getProcessWindowPenalty(v)*100).toFixed(1));const w=t.staff.filter(k=>k.workShift!=="OFF").filter(k=>k.fatigue>=80),T=t.player.unlockedCleanroomClass||"Class 10,000",C=t.rollingYieldHistory.slice(-5),M=C.length>0?(C.reduce((k,B)=>k+B,0)/C.length*100).toFixed(1)+"%":"N/A",P=()=>{var k;b.playClick(),s.innerHTML="",window.removeEventListener("keydown",O),(k=e.onClose)==null||k.call(e)},O=k=>{k.key==="Escape"&&P()};window.addEventListener("keydown",O),s.innerHTML=`
      <div id="modal-backdrop-yield-guide" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-4xl max-h-[92vh] flex flex-col text-slate-100 p-0 overflow-hidden animate-fadeIn">
          
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80 flex-shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl text-amber-300 flex-shrink-0">
                💡
              </div>
              <div>
                <h3 class="text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <span>晶圓良率實戰診斷與挽救指南 (Yield Optimization Guide)</span>
                  <span class="text-xs px-2 py-0.5 rounded-full font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    全廠滑動良率: ${M}
                  </span>
                </h3>
                <p class="text-xs text-slate-400">
                  以下 7 大方法皆為遊戲內核心物理引擎 100% 真實運算因子，立即點擊對應按鈕進行排查挽救！
                </p>
              </div>
            </div>

            <button id="btn-close-yield-guide" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉指南">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
            
            <!-- 1. 黃光專區防護 -->
            <div class="p-4 rounded-xl bg-slate-900/80 border ${d?"border-red-500/80 bg-red-950/20 shadow-lg shadow-red-950/40":"border-slate-800"} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-base">🟡</span>
                  <span class="font-bold text-white text-sm">1. 微影與塗膠設備之黃光區防護 (最致命項目)</span>
                  ${d?`<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white animate-pulse">🚨 ${n.length} 台設備白光污染 (良率 0%)</span>`:'<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">✓ 黃光防護合格</span>'}
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  微影機 (Scanner) 與塗膠顯影機 (Track) 上的光阻具高光敏性。若未座落於黃光專區地磚上，受環境可見白光曝曬將破壞光阻化學鍵，**該批次良率將被強制歸零 (0%)！**
                </p>
                <div class="text-[10px] font-mono text-slate-400">
                  實戰解法：點擊頂部「🏗️ 廠房規劃」，使用「🟡 劃設黃光區」將設備下方地磚塗為黃色，或使用「🔄 搬移機台」移入黃光區。
                </div>
              </div>
              <button id="btn-guide-goto-planner" class="btn-sci-fi px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold flex-shrink-0">
                🟡 開啟廠房規劃 (修正黃光)
              </button>
            </div>

            <!-- 2. 製程整合工程師 (PIE) 指派 -->
            <div class="p-4 rounded-xl bg-slate-900/80 border ${o.length>0?"border-indigo-500/80 bg-indigo-950/20":"border-slate-800"} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-base">👨‍💼</span>
                  <span class="font-bold text-white text-sm">2. 指派專任製程整合工程師 (PIE) 守護訂單</span>
                  ${o.length>0?`<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40">⚠️ ${o.length} 筆在製訂單未指派 PIE</span>`:'<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">✓ 在製訂單皆有 PIE 守護</span>'}
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  未指派 PIE 之訂單良率無額外守護；指派 PIE 可直接為該訂單提供 **+3.0% ~ +18.0% 的全廠良率守護** 與最高 **+45% 的工步提速**！
                </p>
                <div class="text-[10px] font-mono text-slate-400">
                  廠內現有 PIE: ${p.length} 位 | 實戰解法：前往合約看板，在訂單下拉式選單指派 PIE；若無 PIE 請至人資市場招募。
                </div>
              </div>
              <button id="btn-guide-goto-contracts" class="btn-sci-fi px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex-shrink-0">
                📋 前往合約指派 PIE
              </button>
            </div>

            <!-- 3. 機台精密預防保養 (PM) -->
            <div class="p-4 rounded-xl bg-slate-900/80 border ${h===0?"border-cyan-500/50":"border-slate-800"} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-base">🔍</span>
                  <span class="font-bold text-white text-sm">3. 執行駐站工程師精密預防保養 (PM 調校)</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono ${h>0?"bg-emerald-950 text-emerald-300 border border-emerald-500/40":"bg-slate-800 text-slate-400"}">
                    ${h} / ${c.length} 台享有 PM 調校加成
                  </span>
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  點選機台由駐站工程師執行「精密預防保養 (PM)」，清潔腔體真空並光學校準。磨損立即歸零，且下一輪加工晶圓享有 **+3.0% 精密調校良率加成**！
                </p>
                <div class="text-[10px] font-mono text-slate-400">
                  實戰解法：進入無塵室點擊任一機台，在整合卡片點選「🔍 工程師精密預防保養 (PM)」。
                </div>
              </div>
              <div class="text-[11px] font-mono text-cyan-300 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0">
                點擊任一機台 ➔ 執行 PM
              </div>
            </div>

            <!-- 4. 機台磨損度過高 -->
            <div class="p-4 rounded-xl bg-slate-900/80 border ${m>=40?"border-amber-500/60 bg-amber-950/10":"border-slate-800"} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-base">🛠️</span>
                  <span class="font-bold text-white text-sm">4. 消除機台平均磨損 (防止顆粒污染)</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${m>=40?"bg-amber-950 text-amber-300 border border-amber-500/40":"bg-emerald-950 text-emerald-300 border border-emerald-500/40"}">
                    全廠平均磨損: ${m}% (良率折損: -${u}%)
                  </span>
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  機台運轉將累積磨損，老化噴嘴與腔體刮傷會散播微粒污染。全廠平均磨損每增加 10% 即產生 0.6% 的良率懲罰，最高扣減 6.0%！
                </p>
                <div class="text-[10px] font-mono text-slate-400">
                  實戰解法：點擊機台執行「🛠️ 原廠專案深度大修 (Overhaul)」或「🔍 工程師 PM 保養」將磨損歸零至 0%。
                </div>
              </div>
              <div class="text-[11px] font-mono text-amber-300 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0">
                機台大修 / PM ➔ 磨損歸零
              </div>
            </div>

            <!-- 5. 微影 k1 光學製程視窗調校 -->
            <div class="p-4 rounded-xl bg-slate-900/80 border ${Number(y)>0?"border-purple-500/60 bg-purple-950/10":"border-slate-800"} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-base">🔬</span>
                  <span class="font-bold text-white text-sm">5. 微影 k1 因子與光學極限製程視窗調校</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold ${Number(y)>0?"bg-red-950 text-red-300 border border-red-500/40":"bg-emerald-950 text-emerald-300 border border-emerald-500/40"}">
                    k1: ${v.toFixed(3)} (光學折損: -${y}%)
                  </span>
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  依據 Rayleigh 微影物理公式，當 $k_1 < 0.38$ 時，光學景深急遽萎縮，產生邊緣光學離焦與線寬失真，**最高可造成高達 -25.0% 的製程視窗良率懲罰！**
                </p>
                <div class="text-[10px] font-mono text-slate-400">
                  實戰解法：為微影曝光機 (Scanner) 指派專精微影的工程師 (k1 可降低 0.02~0.06)，或升級高階微影設備與研發 CAR 化學增幅光阻。
                </div>
              </div>
              <div class="text-[11px] font-mono text-purple-300 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0">
                微影機駐站 ➔ 調降 k1
              </div>
            </div>

            <!-- 6. 工程師過勞失誤控制 -->
            <div class="p-4 rounded-xl bg-slate-900/80 border ${w.length>0?"border-red-500/60 bg-red-950/10":"border-slate-800"} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-base">☕</span>
                  <span class="font-bold text-white text-sm">6. 控制工程師疲勞度 (防止過勞人為操作失誤)</span>
                  ${w.length>0?`<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/40 animate-pulse">⚠️ ${w.length} 位同仁過勞 (疲勞≥80%)</span>`:'<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">✓ 全員體力充沛</span>'}
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  在職員工疲勞 $ge 80%$ 時，每次批次投片產生每人 **-1.5% 過勞失誤懲罰**，且責任 PIE 加成效果折減 40%！
                </p>
                <div class="text-[10px] font-mono text-slate-400">
                  實戰解法：前往「人資排班」，切換為「🏖️ 週休二日制」自然消退、發放「☕ 帶薪休假 (-40% 疲勞)」或「💆 撥發全員舒壓福利 (-25% 疲勞)」。
                </div>
              </div>
              <button id="btn-guide-goto-hr" class="btn-sci-fi px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold flex-shrink-0">
                👥 前往人資排休回血
              </button>
            </div>

            <!-- 7. 無塵室潔淨等級升級 -->
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="text-base">🏭</span>
                  <span class="font-bold text-white text-sm">7. 升級無塵室潔淨等級 (消除空氣落塵污染)</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    現行無塵等級: ${T}
                  </span>
                </div>
                <p class="text-slate-300 text-[11px] leading-relaxed">
                  初期 Class 10,000 單層基準良率僅 91.5%，累積 6~12 層後總良率自然落在 56%~65%（半導體真實學習曲線）。升級至 **Class 1,000 (95.5%)** 或 **Class 100 (97.5%)**，總良率將大幅躍升至 **85% ~ 95%**！
                </p>
                <div class="text-[10px] font-mono text-slate-400">
                  實戰解法：前往商城或廠房升級模組，升級無塵室階段以突破潔淨等級。
                </div>
              </div>
              <button id="btn-guide-goto-store" class="btn-sci-fi px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex-shrink-0">
                🛒 前往商城升級無塵室
              </button>
            </div>

          </div>

          <!-- Footer -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-between px-6 flex-shrink-0">
            <div class="text-[11px] text-slate-400">
              💡 診斷小結：只要**黃光防護正確 + 指派 PIE + 執行機台 PM + 無過勞同仁**，良率即可穩步突破 85% 以上！
            </div>
            <button id="btn-back-yield-guide" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回檢視
            </button>
          </div>

        </div>
      </div>
    `,(I=document.getElementById("btn-close-yield-guide"))==null||I.addEventListener("click",P),(_=document.getElementById("btn-back-yield-guide"))==null||_.addEventListener("click",P),(G=document.getElementById("modal-backdrop-yield-guide"))==null||G.addEventListener("click",k=>{k.target===document.getElementById("modal-backdrop-yield-guide")&&P()}),(K=document.getElementById("btn-guide-goto-planner"))==null||K.addEventListener("click",()=>{var k;P(),(k=e.onOpenPlanner)==null||k.call(e)}),(U=document.getElementById("btn-guide-goto-contracts"))==null||U.addEventListener("click",()=>{var k;P(),(k=e.onOpenContracts)==null||k.call(e)}),(z=document.getElementById("btn-guide-goto-hr"))==null||z.addEventListener("click",()=>{var k;P(),(k=e.onOpenHR)==null||k.call(e)}),(S=document.getElementById("btn-guide-goto-store"))==null||S.addEventListener("click",()=>{var k;P(),(k=e.onOpenStore)==null||k.call(e,"FACILITY")})}}class ee{static show(t,e,s,a){var d;const i=document.getElementById("modal-container");if(!i)return;this.callbacks=a,this.currentLot=e||(t.activeLots.length>0?t.activeLots[0]:null);const r=!!((d=this.currentLot)!=null&&d.hasYellowRoomViolation),n=r?0:this.currentLot?this.currentLot.yieldMultiplier:t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((l,o)=>l+o,0)/t.rollingYieldHistory.length:.92;if(r||n===0){this.dies=Z.generateWaferMap(0);for(const l of this.dies)l.passed=!1,l.defectType="CLUSTER"}else this.dies=Z.generateWaferMap(n);this.selectedDie=this.dies[12]||this.dies[0],this.render(i,t,s)}static render(t,e,s){var h,m;const a=this.dies.filter(u=>u.passed).length,i=this.dies.length-a,r=(a/this.dies.length*100).toFixed(1),n=this.dies.filter(u=>u.defectType==="CLUSTER").length,d=this.dies.filter(u=>u.defectType==="PARTICLE").length,l=this.dies.filter(u=>u.defectType==="OPTICAL_DEFOCUS").length,o=e.activeLots.some(u=>u.status==="PROCESSING")||e.machines.some(u=>u.status==="PROCESSING"),p=e.rollingYieldHistory.slice(-5),c=p.length>0?(p.reduce((u,f)=>u+f,0)/p.length*100).toFixed(1)+"%":"N/A";t.innerHTML=`
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
                  ${this.dies.map(u=>{var y;const f=((y=this.selectedDie)==null?void 0:y.index)===u.index;let g="bg-emerald-500 hover:bg-emerald-400 border-emerald-300/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]",v="✓";return u.passed||(u.defectType==="CLUSTER"?(g="bg-red-600 hover:bg-red-500 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.7)]",v="✕"):u.defectType==="OPTICAL_DEFOCUS"?(g="bg-amber-500 hover:bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]",v="⚠"):(g="bg-purple-600 hover:bg-purple-500 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]",v="●")),`
                      <button
                        class="btn-wafer-die rounded-md border text-xs font-bold text-white transition-all transform hover:scale-110 flex items-center justify-center font-mono ${g} ${f?"ring-2 ring-white scale-105":""}"
                        data-index="${u.index}"
                        title="Die [${u.row}, ${u.col}] - ${u.passed?"合格":"失效: "+u.defectType}"
                      >
                        ${v}
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
              ${(h=this.currentLot)!=null&&h.hasYellowRoomViolation||Number(r)===0?`
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
                    合格: ${a} / 失效: ${i}
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div class="text-[10px] text-slate-400">全廠滑動良率指數</div>
                  <div class="text-xl font-bold ${o?"text-cyan-300":"text-slate-400"}">
                    ${c}
                  </div>
                  <div class="text-[10px] ${o?"text-slate-400":"text-amber-400/90"} mt-0.5 font-sans">
                    ${o?"5 批次滑動窗口":"⏸️ 產線待命中 (良率暫停)"}
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
                        ${(m=this.currentLot)!=null&&m.hasYellowRoomViolation?"【致命白光曝曬污染】微影設備未設置於黃光專區，環境可見光破壞感光光阻化學鍵，全片晶粒完全報廢！":this.selectedDie.defectType==="CLUSTER"?"【區域群聚缺陷】微影光阻殘留或化學腐蝕液擴散，波及相鄰相連晶粒！":this.selectedDie.defectType==="OPTICAL_DEFOCUS"?"【邊緣聚焦離焦】晶圓邊緣物理翹曲與數值孔徑 NA 聚焦裕度不足導致線寬失真！":"【微影落塵污染】無塵室空氣中微粒穿透光阻，導致金屬互連斷路！"}
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
                  <span>${n} 顆</span>
                </div>
                <div class="flex justify-between text-amber-400">
                  <span>邊緣光學離焦 (Defocus):</span>
                  <span>${l} 顆</span>
                </div>
                <div class="flex justify-between text-purple-400">
                  <span>落塵雜質 (Particle):</span>
                  <span>${d} 顆</span>
                </div>
              </div>

              <!-- Yield Troubleshooting Action Guide Button -->
              <button id="btn-open-yield-guide" class="btn-sci-fi w-full justify-center py-2 px-3 text-xs font-bold bg-gradient-to-r from-amber-600 to-cyan-600 hover:from-amber-500 hover:to-cyan-500 text-white shadow-lg shadow-amber-900/40 flex items-center gap-2 animate-pulse cursor-pointer">
                <span>💡</span>
                <span>晶圓良率太低？開啟實戰挽救指南 (7 大真實解法)</span>
              </button>

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
    `,this.bindEvents(t,e,s)}static bindEvents(t,e,s){var r,n,d,l,o;const a=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",i)},i=p=>{p.key==="Escape"&&a()};window.addEventListener("keydown",i),(r=document.getElementById("btn-close-wafer-map"))==null||r.addEventListener("click",a),(n=document.getElementById("btn-back-wafer"))==null||n.addEventListener("click",a),(d=document.getElementById("modal-backdrop-wafer"))==null||d.addEventListener("click",p=>{p.target===document.getElementById("modal-backdrop-wafer")&&a()}),t.querySelectorAll(".btn-wafer-die").forEach(p=>{p.addEventListener("click",c=>{b.playClick();const h=parseInt(c.currentTarget.getAttribute("data-index")||"0",10);this.selectedDie=this.dies.find(m=>m.index===h)||null,this.render(t,e,s)})}),(l=document.getElementById("btn-resim-wafer"))==null||l.addEventListener("click",()=>{b.playClick();const p=this.currentLot?this.currentLot.yieldMultiplier:e.rollingYieldHistory.length>0?e.rollingYieldHistory.reduce((c,h)=>c+h,0)/e.rollingYieldHistory.length:.92;this.dies=Z.generateWaferMap(p),this.selectedDie=this.dies[12]||this.dies[0],this.render(t,e,s)}),(o=document.getElementById("btn-open-yield-guide"))==null||o.addEventListener("click",()=>{b.playClick(),ge.show(e,this.callbacks)})}}E(ee,"dies",[]),E(ee,"selectedDie",null),E(ee,"currentLot",null),E(ee,"callbacks");class oe{static show(t,e,s){const a=document.getElementById("modal-container");a&&(this.currentOrder=e,e.layerAllocations&&e.layerAllocations.length===e.layerCount?this.localAllocations=JSON.parse(JSON.stringify(e.layerAllocations)):this.localAllocations=R.autoFillBestEconomyAllocation(e,t.machines),this.render(a,t,s))}static render(t,e,s){if(!this.currentOrder)return;const a=this.currentOrder,i=e.machines.filter(o=>o.category==="LITHO"),r=new Map(e.staff.map(o=>[o.id,o])),n=new Map;for(const o of i){const p=o.assignedEngineerId?r.get(o.assignedEngineerId):null,c=J.calculateEffectiveCD(o.modelId,e.player.unlockedK1,o.wear,p);n.set(o.modelId,c)}let d=!1;for(const o of this.localAllocations)if((n.get(o.assignedMachineModelId)??99999)>o.targetCD){d=!0;break}const l=a.nodeNm>=1e3?`${a.nodeNm/1e3} µm`:`${a.nodeNm} nm`;t.innerHTML=`
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
            ${this.localAllocations.map(o=>{const p=n.get(o.assignedMachineModelId)??99999,c=p>o.targetCD,h=o.layerIndex<=3;return`
                <div class="p-3 rounded-xl bg-slate-900/80 border ${c?"border-red-500/60 bg-red-950/20":"border-slate-800 hover:border-slate-700"} flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all">
                  
                  <!-- 左側：層級資訊 -->
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${h?"bg-amber-950/80 border border-amber-500/40 text-amber-300":"bg-slate-800 text-slate-300"}">
                      L${o.layerIndex}
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-xs text-white">${o.layerType}</span>
                        ${h?'<span class="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30">關鍵層</span>':'<span class="px-1.5 py-0.2 rounded text-[9px] bg-slate-800 text-slate-400">導線層</span>'}
                      </div>
                      <div class="text-[11px] font-mono text-slate-400">
                        目標線寬需求: <span class="text-cyan-300 font-bold">${o.targetCD} nm</span>
                      </div>
                    </div>
                  </div>

                  <!-- 中間：機台指派下拉選單 -->
                  <div class="flex-1 max-w-sm">
                    <select data-layer="${o.layerIndex}" class="sel-layer-machine w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:border-indigo-500 focus:outline-none">
                      ${i.map(m=>{const u=n.get(m.modelId)??9999,f=m.modelId===o.assignedMachineModelId;return`
                          <option value="${m.modelId}" ${f?"selected":""}>
                            ${m.name} (實時CD: ${u}nm | 磨損: ${Math.round(m.wear)}%)
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
                        機台CD ${p}nm > 需求 ${o.targetCD}nm
                      </div>
                    `:`
                      <div class="text-xs font-bold text-emerald-400 flex items-center md:justify-end gap-1">
                        <span>✅</span>
                        <span>光學合規</span>
                      </div>
                      <div class="text-[10px] text-slate-400 font-mono">
                        安全裕度: +${o.targetCD-p} nm
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
              <button id="btn-save-layer-alloc" class="btn-sci-fi text-xs py-2 px-5 ${d?"opacity-50 cursor-not-allowed bg-slate-700":"bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"}" ${d?"disabled":""}>
                💾 確認並套用分層配方
              </button>
            </div>
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s)}static bindEvents(t,e,s){var n,d,l,o,p;const a=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",i)},i=c=>{c.key==="Escape"&&a()};window.addEventListener("keydown",i),(n=document.getElementById("btn-close-layer-modal"))==null||n.addEventListener("click",a),(d=document.getElementById("btn-cancel-layer-alloc"))==null||d.addEventListener("click",a),(l=document.getElementById("modal-backdrop-layer"))==null||l.addEventListener("click",c=>{c.target===document.getElementById("modal-backdrop-layer")&&a()}),t.querySelectorAll(".sel-layer-machine").forEach(c=>{c.addEventListener("change",h=>{const m=h.target,u=Number(m.dataset.layer),f=m.value,g=this.localAllocations.find(v=>v.layerIndex===u);g&&(g.assignedMachineModelId=f,b.playClick(),this.render(t,e,s))})}),(o=document.getElementById("btn-auto-fill-alloc"))==null||o.addEventListener("click",()=>{this.currentOrder&&(b.playCoinChime(),this.localAllocations=R.autoFillBestEconomyAllocation(this.currentOrder,e.machines),this.render(t,e,s))}),(p=document.getElementById("btn-save-layer-alloc"))==null||p.addEventListener("click",()=>{this.currentOrder&&(this.currentOrder.layerAllocations=JSON.parse(JSON.stringify(this.localAllocations)),b.playFanfare(),t.innerHTML="",s())})}}E(oe,"currentOrder",null),E(oe,"localAllocations",[]);class le{static show(t,e){const s=document.getElementById("modal-container");s&&(D.ensureMarketOrders(t),this.render(s,t,e))}static render(t,e,s){const a=e.marketOrders||[],i=e.rollingYieldHistory.length>0?e.rollingYieldHistory.reduce((l,o)=>l+o,0)/e.rollingYieldHistory.length:null,r=D.calculateTrustMultiplier(i),n=this.getBestLithoCD(e),d=D.getMarketRefreshCost(e.player.foundryTier);t.innerHTML=`
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
                <div class="text-sm font-mono font-bold ${r>=1?"text-emerald-400":"text-amber-400"}">
                  ${r.toFixed(2)}x
                  <span class="text-[10px] text-slate-400">(${i!==null?(i*100).toFixed(1)+"%":"N/A"})</span>
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
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">${e.activeOrders.length}</span>
            </button>
            <div class="ml-auto py-1.5 flex items-center">
              ${this.currentTab==="MARKET"?`
                <button id="btn-refresh-market" class="btn-sci-fi text-xs py-1.5 px-3 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/60 text-amber-300 font-bold flex items-center gap-1.5 shadow-sm cursor-pointer" title="派遣商業獵單顧問重新招攬合約池 (費用: NT$ ${d.toLocaleString()})">
                  <span>🔄 商業獵單刷新</span>
                  <span class="font-mono text-amber-200">(NT$ ${d.toLocaleString()})</span>
                </button>
              `:""}
            </div>
          </div>

          <!-- Body -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4">
            ${this.currentTab==="MARKET"?this.renderMarketOrders(e,n):this.renderActiveOrders(e)}
          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
            <button id="btn-back-contract" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s)}static renderMarketOrders(t,e){const s=t.marketOrders||[],a=s.length>=D.MAX_MARKET_ORDERS,i=t.nextOrderRespawnTime?Math.max(0,Math.ceil((t.nextOrderRespawnTime-Date.now())/1e3)):0;let r="";return a||(r=`
        <div id="contract-respawn-banner" class="mb-4 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex items-center justify-between text-xs text-slate-300 shadow-md">
          <div class="flex items-center gap-2.5">
            <span class="text-base animate-spin">⏳</span>
            <div>
              <span class="font-bold text-cyan-300">新客戶合約洽談中</span>
              <span class="text-slate-400 ml-1.5">(合約池: ${s.length}/${D.MAX_MARKET_ORDERS} 筆，每筆訂單冷卻 60 秒陸續送達)</span>
            </div>
          </div>
          <div class="font-mono font-bold text-amber-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
            下一筆合約抵達：<span id="contract-respawn-timer" class="text-amber-300 text-sm font-black">${i}</span> 秒
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
        ${s.map((n,d)=>{const l=e<=n.nodeNm,o=n.nodeNm>=1e3?`${n.nodeNm/1e3} µm`:`${n.nodeNm} nm`;let p='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">常規件 (1.0x)</span>';n.urgencyMultiplier===1.2?p='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">🟡 急件 (1.2x)</span>':n.urgencyMultiplier>=1.5&&(p='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">🔴 SHR 超急件 (1.5x)</span>');const c=n.nrePaid+n.totalDies*n.unitPrice;return`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${l?"border-slate-800 hover:border-cyan-500/40":"border-red-900/40 bg-red-950/10"} transition-all flex flex-col justify-between space-y-3">
              <!-- Card Header -->
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">${n.clientName}</span>
                    ${p}
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5 font-mono">
                    合約編號: ${n.id}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold font-mono text-cyan-300">${o}</div>
                  <div class="text-[10px] text-slate-400">${n.layerCount} 道光罩層</div>
                </div>
              </div>

              <!-- Card Specs -->
              <div class="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <div class="text-[10px] text-slate-400">總晶粒需求</div>
                  <div class="font-mono font-semibold text-slate-200">${n.totalDies.toLocaleString()} 顆</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">出貨單價</div>
                  <div class="font-mono font-semibold text-emerald-400">NT$ ${n.unitPrice.toFixed(2)} /顆</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">💰 接單即付 NRE</div>
                  <div class="font-mono font-bold text-amber-300">+NT$ ${n.nrePaid.toLocaleString()}</div>
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
                  <span class="font-mono text-cyan-300 font-semibold">${D.getAllowedDurationSec(n)} 遊戲秒</span>
                </div>
                <div class="flex items-center gap-1" title="客戶等待報價有效時間，逾時將轉向其他代工廠並刷新更換">
                  <span class="text-slate-400">⏳ 報價時效:</span>
                  <span class="market-order-timer font-mono font-bold ${Math.max(0,Math.ceil(((n.marketExpiresAt||Date.now()+6e4)-Date.now())/1e3))<=15?"text-red-400 animate-pulse":"text-amber-400"}" data-order-id="${n.id}">
                    ${Math.max(0,Math.ceil(((n.marketExpiresAt||Date.now()+6e4)-Date.now())/1e3))} 秒
                  </span>
                </div>
              </div>

              <!-- Litho CD warning if incapable -->
              ${l?"":`
                <div class="p-2 rounded bg-red-900/20 border border-red-700/30 text-[11px] text-red-300 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>廠內機台極限 CD (${e===999999?"無微影機":e+"nm"}) 無法滿足 ${o} 製程需求！</span>
                </div>
              `}

              <!-- Action Button -->
              <button
                class="btn-accept-order btn-sci-fi w-full justify-center ${l?"":"opacity-50 cursor-not-allowed"}"
                data-index="${d}"
                ${l?"":"disabled"}
              >
                ✍️ 簽約接單 (即刻領取 NT$ ${n.nrePaid.toLocaleString()})
              </button>
            </div>
          `}).join("")}
      </div>
    `}static renderActiveOrders(t){if(t.activeOrders.length===0)return`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">⚙️</div>
          <p class="text-sm">目前產線無在製或完工訂單，請前往「承接市場訂單池」簽約接單！</p>
        </div>
      `;const e=t.activeOrders.filter(r=>r.status==="COMPLETED"),s=t.activeOrders.filter(r=>r.status==="PENDING"||r.status==="ACTIVE");let a="";e.length>0&&(a=`
        <div class="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-teal-950/70 border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/50 space-y-4 mb-6">
          <div class="flex items-center justify-between border-b border-emerald-500/30 pb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-xl animate-bounce">
                🎉
              </div>
              <div>
                <h4 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <span>晶圓量產完工！待請領代工尾款</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    ${e.length} 筆已完工交貨
                  </span>
                </h4>
                <p class="text-[11px] text-slate-300 mt-0.5">
                  晶圓全數完成站點加工並通過電性檢測，請確認交貨良率與代工資訊，點擊收款入帳！
                </p>
              </div>
            </div>

            ${e.length>1?`
              <button class="btn-collect-all-orders btn-sci-fi text-xs py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-900/50 flex items-center gap-1.5 cursor-pointer">
                <span>💰</span><span>一鍵請領全部 (${e.length}筆)</span>
              </button>
            `:""}
          </div>

          <div class="space-y-3">
            ${e.map(r=>{const n=r.totalDies>0?r.goodDiesDelivered/r.totalDies:0,d=(n*100).toFixed(1),o=t.activeLots.filter(h=>h.orderId===r.id).reduce((h,m)=>h+(m.waferCount||25),0)||25,p=r.assignedPieId?t.staff.find(h=>h.id===r.assignedPieId):null,c=D.settleOrderPayout(r,r.goodDiesDelivered,t.player,t.staff,0,t.clawbackDebt);return`
                <div class="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-white text-base">${r.clientName}</span>
                        <span class="text-xs font-mono text-cyan-300">
                          [${r.nodeNm>=1e3?r.nodeNm/1e3+"µm":r.nodeNm+"nm"}]
                        </span>
                        <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                          <span>✓</span><span>完工並交貨</span>
                        </span>
                      </div>
                      <div class="text-xs text-slate-400 mt-1 font-mono flex flex-wrap items-center gap-3">
                        <span>合約編號: ${r.id}</span>
                        <span>|</span>
                        <span>投入晶圓: ${o} 片</span>
                        <span>|</span>
                        <span>光罩層數: ${r.layerCount} 層</span>
                        <span>|</span>
                        <span>責任 PIE: <strong class="text-indigo-300">${p?p.name+" ("+p.rank+")":"無"}</strong></span>
                      </div>
                    </div>

                    <div class="sm:text-right">
                      <div class="text-[11px] text-slate-400">
                        NRE 預付款 (已入帳): <strong class="text-amber-300">NT$ ${r.nrePaid.toLocaleString()}</strong>
                      </div>
                      <div class="text-[11px] text-slate-400 mt-0.5">
                        晶粒單價: NT$ ${r.unitPrice.toFixed(2)} /顆
                      </div>
                    </div>
                  </div>

                  <!-- Delivery Yield & Dies Statistics -->
                  <div class="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-4">
                      <div class="text-center px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex-shrink-0">
                        <div class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">交貨良率</div>
                        <div class="text-xl font-mono font-extrabold text-emerald-300">${d}%</div>
                      </div>
                      <div>
                        <div class="text-xs text-slate-200 font-mono">
                          實收良品晶粒: <strong class="text-emerald-400 font-bold">${r.goodDiesDelivered.toLocaleString()}</strong> / ${r.totalDies.toLocaleString()} 顆
                        </div>
                        <div class="text-[11px] text-slate-400 mt-0.5">
                          ${n>=.85?"🌟 良率優於業界水準！客戶信任度提升":n>=.6?"✓ 符合初期製程交貨規格":"⚠️ 製程落塵或缺陷較多，良品數偏低"}
                        </div>
                      </div>
                    </div>

                    <div class="w-full sm:w-auto">
                      <button class="btn-settle-order btn-sci-fi w-full sm:w-auto text-xs sm:text-sm py-2 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-1.5 cursor-pointer animate-pulse" data-order-id="${r.id}">
                        <span>💰</span>
                        <span>請領代工尾款 NT$ ${c.netPayout.toLocaleString()}</span>
                      </button>
                    </div>
                  </div>
                </div>
              `}).join("")}
          </div>
        </div>
      `);let i="";return s.length>0&&(i=`
        <div class="space-y-4">
          ${s.map(r=>{var m;const n=r.status==="PENDING",d=n?r.allowedDurationSec||240:Math.max(0,r.deadlineGameTime-t.gameTime),l=!n&&d===0,o=t.activeLots.filter(u=>u.orderId===r.id),p=Math.min(100,Math.round(r.goodDiesDelivered/r.totalDies*100)),c=r.assignedPieId?t.staff.find(u=>u.id===r.assignedPieId):null,h=Z.getPieBonus(c);return`
              <div class="p-4 rounded-xl bg-slate-900/80 border ${n?"border-amber-500/50":l?"border-red-600/50":"border-slate-800"} space-y-3">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-white">${r.clientName}</span>
                      <span class="text-xs font-mono text-cyan-300">
                        [${r.nodeNm>=1e3?r.nodeNm/1e3+"µm":r.nodeNm+"nm"}]
                      </span>
                      ${n?'<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">🟡 待啟動投片</span>':l?'<span class="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold animate-pulse">逾期追討中</span>':'<span class="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">⚡ 加工中</span>'}
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5 font-mono">
                      合約編號: ${r.id} | 光罩層數: ${r.layerCount} 層
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-xs ${n?"text-amber-300 font-semibold":l?"text-red-400 font-bold":"text-slate-400"}">
                      ${n?`約定工期: ${d} 秒 (啟動後計時)`:l?"已過期 (違約罰金累積中)":`剩餘交期: ${d} 秒`}
                    </div>
                    <div class="text-[10px] text-slate-400 mt-0.5">
                      出貨單價: NT$ ${r.unitPrice.toFixed(2)} /顆
                    </div>
                  </div>
                </div>

                <!-- Process Integration Engineer (PIE) Assignment Dropdown -->
                <div class="p-2.5 rounded-lg bg-slate-950/70 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-sm flex-shrink-0">
                      👨‍💼
                    </div>
                    <div>
                      <div class="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <span>製程整合工程師 (PIE) 指派</span>
                        ${c?`<span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-900/60 text-indigo-200 border border-indigo-400/30">${c.rank}</span>`:""}
                      </div>
                      <div class="text-[10px] text-slate-400 font-mono">
                        ${c?`⚡ 站點加速 +${Math.round(h.speedBonus*100)}% | 🎯 良率守護 +${(h.yieldBonus*100).toFixed(1)}% (疲勞: ${Math.round(c.fatigue)}%)`:"未指派 PIE (點選右側選單指派工程師，依職階提供全製程加速與良率守護)"}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 w-full sm:w-auto">
                    <select class="select-order-pie bg-slate-900 border border-indigo-500/40 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:border-indigo-400 focus:outline-none cursor-pointer" data-order-id="${r.id}">
                      <option value="">-- 未指派 PIE (無加成) --</option>
                      ${(()=>{const u=t.staff.filter(f=>f.moduleSpecialty==="PIE");return u.length===0?'<option value="" disabled>-- 廠內無在職 PIE (請至人資市場招聘) --</option>':u.map(f=>{const g=Z.getPieBonus(f),v=r.assignedPieId===f.id,y=t.activeOrders.find(T=>T.id!==r.id&&(T.status==="ACTIVE"||T.status==="PENDING")&&T.assignedPieId===f.id);let x="🟢 [待命專派]",w="";return v?x="🔵 [專責本單]":y&&(x=`🔄 [忙碌中: ${y.clientName}]`,w=" ➔ 選取將調派至此單"),`<option value="${f.id}" ${v?"selected":""}>
                            ${x} ${f.name} (${f.rank}) [+${Math.round(g.speedBonus*100)}%速 / +${(g.yieldBonus*100).toFixed(1)}%良]${w}
                          </option>`}).join("")})()}
                    </select>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-400">出貨進度</span>
                    <span class="font-mono text-cyan-300">${r.goodDiesDelivered.toLocaleString()} / ${r.totalDies.toLocaleString()} 顆 (${p}%)</span>
                  </div>
                  <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div class="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300" style="width: ${p}%"></div>
                  </div>
                </div>

                <!-- Lots in Production -->
                <div>
                  <div class="text-xs text-slate-400 font-semibold mb-2">在製批次 (Wafer Lots) 狀態：</div>
                  ${o.length===0?`
                    <div class="text-xs text-slate-400 italic">尚無加工批次投入</div>
                  `:`
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      ${o.map(u=>{let f=`<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">${u.currentStation}</span>`;u.status==="QUEUED"?f='<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-500/30">待命準備中</span>':u.currentStation==="LIT"?f=`<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">微影 (${u.litSubStep||"COAT"})</span>`:u.status==="COMPLETED"&&(f='<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">已完工</span>');const g=t.machines.find(x=>x.status==="EXPLODED"?!1:u.currentStation==="LIT"?u.litSubStep==="COAT"||u.litSubStep==="DEVELOP"?x.category==="TRACK":x.category==="LITHO":x.category===u.currentStation),v=g?g.name:"自動分配中";let y="";if(u.qTimeDeadline!==null){const x=Math.max(0,u.qTimeDeadline-t.gameTime);y=`<span class="text-[10px] font-mono ${x<10?"text-red-400 animate-pulse":"text-amber-400"}">⏳ Q-Time: ${x}s</span>`}return`
                          <div class="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-2">
                            <div>
                              <div class="font-mono text-slate-200 font-semibold flex items-center gap-1.5">
                                <span>${u.lotId}</span>
                                <button class="btn-inspect-lot text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 hover:bg-cyan-800 text-cyan-300 border border-cyan-700/50 flex items-center gap-0.5 cursor-pointer" data-lot-id="${u.lotId}" title="點擊檢視蒙地卡羅晶圓圖">
                                  <span>🔍</span><span>晶圓圖</span>
                                </button>
                              </div>
                              <div class="text-[10px] text-slate-400 mt-0.5">
                                層數: ${u.currentLayer}/${u.totalLayers} | 站點: ${f}
                              </div>
                              <div class="text-[10px] text-cyan-300/90 font-mono mt-0.5 flex items-center gap-1">
                                <span>🏭 機台:</span>
                                <span class="font-bold truncate max-w-[140px]">${v}</span>
                              </div>
                            </div>
                            <div class="text-right flex-shrink-0">
                              <div class="text-[10px] text-emerald-400 font-mono font-bold">良率: ${(u.yieldMultiplier*100).toFixed(0)}%</div>
                              ${y}
                            </div>
                          </div>
                        `}).join("")}
                    </div>
                  `}
                </div>

                <!-- Actions -->
                <div class="flex items-center justify-between gap-2 pt-1">
                  <div>
                    ${r.layerCount>1?`
                      <button class="btn-layer-allocation btn-sci-fi text-xs py-1 px-3 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 flex items-center gap-1.5 cursor-pointer" data-order-id="${r.id}" title="自訂先進製程多層微影機台分配">
                        <span>🎛️</span>
                        <span>微影分層配方 (${((m=r.layerAllocations)==null?void 0:m.length)||r.layerCount}層)</span>
                      </button>
                    `:""}
                  </div>

                  <div class="flex items-center gap-2">
                    ${n?`
                      <button class="btn-start-order-production btn-sci-fi text-xs py-2 px-5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold shadow-lg shadow-cyan-900/40 animate-pulse flex items-center gap-1.5 cursor-pointer" data-order-id="${r.id}">
                        <span>🚀</span>
                        <span>確認開始生產 (Start Production)</span>
                      </button>
                    `:`
                      <div class="text-[11px] text-slate-400 flex items-center gap-1">
                        <span class="animate-spin">⚙️</span>
                        <span>晶圓加工中，完工後可請領尾款...</span>
                      </div>
                    `}
                  </div>
                </div>

              </div>
            `}).join("")}
        </div>
      `),a+i}static bindEvents(t,e,s){var r,n,d,l,o,p;const a=()=>{this.countdownIntervalId!==null&&(clearInterval(this.countdownIntervalId),this.countdownIntervalId=null),b.playClick(),t.innerHTML="",window.removeEventListener("keydown",i)},i=c=>{c.key==="Escape"&&a()};window.addEventListener("keydown",i),(r=document.getElementById("btn-close-contract"))==null||r.addEventListener("click",a),(n=document.getElementById("btn-back-contract"))==null||n.addEventListener("click",a),(d=document.getElementById("modal-backdrop-contract"))==null||d.addEventListener("click",c=>{c.target===document.getElementById("modal-backdrop-contract")&&a()}),(l=document.getElementById("tab-market"))==null||l.addEventListener("click",()=>{b.playClick(),this.currentTab="MARKET",this.render(t,e,s)}),(o=document.getElementById("tab-active"))==null||o.addEventListener("click",()=>{b.playClick(),this.currentTab="ACTIVE",this.render(t,e,s)}),(p=document.getElementById("btn-refresh-market"))==null||p.addEventListener("click",()=>{const c=D.getMarketRefreshCost(e.player.foundryTier);if(e.player.cash<c){b.playClick(),alert(`❌ 廠房資金不足！派遣商業獵單顧問需要 NT$ ${c.toLocaleString()}，目前現金僅有 NT$ ${Math.round(e.player.cash).toLocaleString()}`);return}confirm(`【商業獵單刷新確認】

您確定要支付 NT$ ${c.toLocaleString()} 聘請半導體商業獵單顧問，為合約板重新引入 5 筆全新客戶合約嗎？`)&&(e.player.cash-=c,A.recordOpEx(e,"商業獵單顧問費",c),D.forceRefreshAllMarketOrders(e),$.saveToLocalStorage(e),b.playCoin(),this.render(t,e,s),s())}),this.countdownIntervalId!==null&&clearInterval(this.countdownIntervalId),this.countdownIntervalId=window.setInterval(()=>{if(this.currentTab==="MARKET"){const c=(e.marketOrders||[]).length,h=D.checkOrderReplenishment(e),m=D.checkMarketOrdersExpiry(e),u=(e.marketOrders||[]).length;if(h||m||c!==u){$.saveToLocalStorage(e),this.render(t,e,s);return}const f=document.getElementById("contract-respawn-timer");if(f){const g=e.nextOrderRespawnTime?Math.max(0,Math.ceil((e.nextOrderRespawnTime-Date.now())/1e3)):0;f.textContent=`${g}`}t.querySelectorAll(".market-order-timer").forEach(g=>{var x;const v=g.getAttribute("data-order-id"),y=(x=e.marketOrders)==null?void 0:x.find(w=>w.id===v);if(y&&y.marketExpiresAt){const w=Math.max(0,Math.ceil((y.marketExpiresAt-Date.now())/1e3));g.textContent=`${w} 秒`,w<=15?g.className="market-order-timer font-mono font-bold text-red-400 animate-pulse":g.className="market-order-timer font-mono font-bold text-amber-400"}})}},1e3),t.querySelectorAll(".btn-accept-order").forEach(c=>{c.addEventListener("click",h=>{const m=parseInt(h.currentTarget.getAttribute("data-index")||"0",10),u=e.marketOrders||[],f=u[m];if(!f)return;b.playCoinChime(),e.player.cash+=f.nrePaid,A.recordNREFee(e,f.nrePaid);const g=D.getAllowedDurationSec(f);f.allowedDurationSec=g,f.deadlineGameTime=e.gameTime+g,f.status="PENDING";const v=new Set(e.activeOrders.filter(T=>(T.status==="ACTIVE"||T.status==="PENDING")&&T.assignedPieId).map(T=>T.assignedPieId)),y=e.staff.find(T=>T.moduleSpecialty==="PIE"&&!v.has(T.id)&&T.workShift!=="OFF")||e.staff.find(T=>T.moduleSpecialty==="PIE"&&!v.has(T.id));y?f.assignedPieId=y.id:f.assignedPieId=void 0,e.activeOrders.push(f);const x=Math.max(1,Math.min(3,Math.ceil(f.totalDies/1e3))),w=Z.calculateLotYield({lotId:"",orderId:f.id,waferCount:25,currentStation:"FILM",currentLayer:1,totalLayers:f.layerCount,qTimeDeadline:null,yieldMultiplier:1,status:"QUEUED"},e,f);for(let T=0;T<x;T++){const C={lotId:`LOT-${Date.now().toString(36).toUpperCase().slice(-4)}-${T+1}`,orderId:f.id,waferCount:Math.ceil(f.totalDies/x/(f.nodeNm>=1e3?500:2e3)),currentStation:"FILM",currentLayer:1,totalLayers:f.layerCount,qTimeDeadline:null,yieldMultiplier:w,status:"QUEUED",stationProgressSeconds:0,stationRequiredSeconds:R.getStationRequiredSeconds("FILM")};e.activeLots.push(C)}u.splice(m,1),u.length<D.MAX_MARKET_ORDERS&&!e.nextOrderRespawnTime&&(e.nextOrderRespawnTime=Date.now()+D.ORDER_RESPAWN_COOLDOWN_MS),F.checkAchievements(e),$.saveToLocalStorage(e),s(),this.currentTab="ACTIVE",this.render(t,e,s)})}),t.querySelectorAll(".select-order-pie").forEach(c=>{c.addEventListener("change",h=>{const m=h.currentTarget,u=m.getAttribute("data-order-id"),f=m.value||null,g=e.activeOrders.find(x=>x.id===u);if(!g)return;const v=g.assignedPieId;if(f){const x=e.activeOrders.find(w=>w.id!==u&&(w.status==="ACTIVE"||w.status==="PENDING")&&w.assignedPieId===f);if(x){x.assignedPieId=v||null;const w=x.assignedPieId?e.staff.find(T=>T.id===x.assignedPieId):void 0;for(const T of e.activeLots)T.orderId===x.id&&T.status==="PROCESSING"&&(T.stationRequiredSeconds=R.getStationRequiredSeconds(T.currentStation,T.litSubStep,void 0,void 0,w))}}g.assignedPieId=f||null;const y=g.assignedPieId?e.staff.find(x=>x.id===g.assignedPieId):void 0;for(const x of e.activeLots)x.orderId===g.id&&x.status==="PROCESSING"&&(x.stationRequiredSeconds=R.getStationRequiredSeconds(x.currentStation,x.litSubStep,void 0,void 0,y));b.playClick(),F.checkAchievements(e),$.saveToLocalStorage(e),s(),this.render(t,e,s)})}),t.querySelectorAll(".btn-start-order-production").forEach(c=>{c.addEventListener("click",h=>{const m=h.currentTarget.getAttribute("data-order-id"),u=e.activeOrders.find(v=>v.id===m);if(!u)return;b.playClick(),u.status="ACTIVE";const f=D.getAllowedDurationSec(u);u.allowedDurationSec=f,u.deadlineGameTime=e.gameTime+f;const g=u.assignedPieId?e.staff.find(v=>v.id===u.assignedPieId):void 0;for(const v of e.activeLots)v.orderId===u.id&&v.status==="QUEUED"&&(v.status="PROCESSING",v.stationProgressSeconds=0,v.stationRequiredSeconds=R.getStationRequiredSeconds(v.currentStation,v.litSubStep,void 0,void 0,g));$.saveToLocalStorage(e),s(),this.render(t,e,s)})}),t.querySelectorAll(".btn-settle-order").forEach(c=>{c.addEventListener("click",h=>{const m=h.currentTarget.getAttribute("data-order-id"),u=e.activeOrders.findIndex(T=>T.id===m);if(u===-1)return;const f=e.activeOrders[u],g=f.goodDiesDelivered>0?f.goodDiesDelivered:Math.round(f.totalDies*.6),v=D.settleOrderPayout(f,g,e.player,e.staff,0,e.clawbackDebt);e.player.cash+=v.netPayout,Q.trigger(v.netPayout,c),b.playCoinChime(),A.recordWaferSales(e,v.netPayout),e.clawbackDebt=v.remainingDebt,e.player.popularity=Math.min(100,e.player.popularity+1);const y=f.totalDies>0?Number((g/f.totalDies).toFixed(3)):.6;e.rollingYieldHistory.push(y),e.rollingYieldHistory.length>5&&e.rollingYieldHistory.shift();const w=e.activeLots.filter(T=>T.orderId===f.id).reduce((T,C)=>T+(C.waferCount||25),0)||25;e.player.totalOrdersFulfilled=(e.player.totalOrdersFulfilled||0)+1,e.player.totalWafersDelivered=(e.player.totalWafersDelivered||0)+w,q.onOrderFulfilled(e.questState),F.checkAchievements(e),e.activeOrders.splice(u,1),e.activeLots=e.activeLots.filter(T=>T.orderId!==f.id),$.saveToLocalStorage(e),s(),this.render(t,e,s)})}),t.querySelectorAll(".btn-collect-all-orders").forEach(c=>{c.addEventListener("click",()=>{const h=e.activeOrders.filter(u=>u.status==="COMPLETED");if(h.length===0)return;let m=0;for(const u of h){const f=u.goodDiesDelivered>0?u.goodDiesDelivered:Math.round(u.totalDies*.6),g=D.settleOrderPayout(u,f,e.player,e.staff,0,e.clawbackDebt);e.player.cash+=g.netPayout,m+=g.netPayout,A.recordWaferSales(e,g.netPayout),e.clawbackDebt=g.remainingDebt,e.player.popularity=Math.min(100,e.player.popularity+1);const v=u.totalDies>0?Number((f/u.totalDies).toFixed(3)):.6;e.rollingYieldHistory.push(v),e.rollingYieldHistory.length>5&&e.rollingYieldHistory.shift();const x=e.activeLots.filter(w=>w.orderId===u.id).reduce((w,T)=>w+(T.waferCount||25),0)||25;e.player.totalOrdersFulfilled=(e.player.totalOrdersFulfilled||0)+1,e.player.totalWafersDelivered=(e.player.totalWafersDelivered||0)+x,q.onOrderFulfilled(e.questState),e.activeLots=e.activeLots.filter(w=>w.orderId!==u.id)}e.activeOrders=e.activeOrders.filter(u=>u.status!=="COMPLETED"),Q.trigger(m,c),b.playCoinChime(),F.checkAchievements(e),$.saveToLocalStorage(e),s(),this.render(t,e,s)})}),t.querySelectorAll(".btn-inspect-lot").forEach(c=>{c.addEventListener("click",h=>{const m=h.currentTarget.getAttribute("data-lot-id"),u=e.activeLots.find(f=>f.lotId===m);b.playClick(),ee.show(e,u,()=>{this.render(t,e,s),s()})})}),t.querySelectorAll(".btn-layer-allocation").forEach(c=>{c.addEventListener("click",h=>{const m=h.currentTarget.getAttribute("data-order-id"),u=e.activeOrders.find(f=>f.id===m);u&&(b.playClick(),oe.show(e,u,()=>{this.render(t,e,s),s()}))})})}static getBestLithoCD(t){const e=t.machines.filter(a=>a.category==="LITHO"&&a.status!=="EXPLODED");if(e.length===0)return 999999;let s=999999;for(const a of e){const i=J.OPTICAL_CATALOG[a.modelId];i&&i.baseRayleighLimitNm<s&&(s=i.baseRayleighLimitNm)}return s}}E(le,"currentTab","MARKET"),E(le,"countdownIntervalId",null);class xe{static show(t,e){const s=document.getElementById("modal-container");if(!s)return;const a=t.player.foundryTier||1;this.selectedViewTier=Math.min(Y.MAX_TIER,a+1),this.render(s,t,e)}static render(t,e,s){var d,l;const a=Y.getProgressionStatus(e),i=Y.getTierConfig(a.currentTier),r=this.selectedViewTier||Math.min(Y.MAX_TIER,a.currentTier+1),n=Y.getTierConfig(r);t.innerHTML=`
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
                  <span>當前掌握：<strong class="text-amber-300">${i.name}</strong> (${i.subtitle})</span>
                  <span>|</span>
                  <span>廠房可用資金: <strong class="text-emerald-400 font-mono">NT$ ${Math.round(e.player.cash).toLocaleString()}</strong></span>
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
              
              ${Array.from({length:Y.MAX_TIER},(o,p)=>p+1).map(o=>{const p=Y.getTierConfig(o),c=o<a.currentTier,h=o===a.currentTier,m=o===a.currentTier+1,u=o===r;let f="border-slate-700 bg-slate-900 text-slate-500",g="未解鎖",v="bg-slate-800 text-slate-500 border-slate-700";return c?(f="border-emerald-500/80 bg-emerald-950/60 text-emerald-400 shadow-lg shadow-emerald-950/50",g="已突破",v="bg-emerald-950/80 text-emerald-300 border-emerald-500/40"):h?(f="border-cyan-400 bg-cyan-950/80 text-cyan-300 ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-950/60",g="當前世代",v="bg-cyan-900/80 text-cyan-200 border-cyan-400/50"):m&&(f="border-amber-400/90 bg-amber-950/70 text-amber-300 ring-2 ring-amber-500/30 pulse-alert",g=`研發中 ${a.overallPct}%`,v="bg-amber-950/80 text-amber-300 border-amber-500/40"),`
                  <button
                    class="btn-tier-node z-10 flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer group ${u?"scale-105 bg-slate-800/80 ring-2 ring-cyan-400":"hover:bg-slate-900/50"}"
                    data-tier="${o}"
                    title="點擊檢視 Tier ${o} ${p.name} 詳細製程規格"
                  >
                    <div class="w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-mono font-bold text-sm transition-transform ${f} group-hover:scale-110">
                      ${c?"✓":`T${o}`}
                    </div>
                    <div class="text-center">
                      <div class="text-[11px] font-bold text-slate-200 truncate max-w-[105px]">${p.name.slice(0,7)}</div>
                      <span class="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono border ${v}">
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
                    Tier ${n.tier} • ${n.eraCode}
                  </span>
                  ${n.tier===a.currentTier?'<span class="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">★ 現役工廠世代</span>':""}
                  ${n.tier===a.currentTier+1?'<span class="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">🎯 次世代微縮目標</span>':""}
                </div>
                <h4 class="text-lg font-bold text-white tracking-wide">
                  ${n.name} <span class="text-sm font-normal text-slate-400 font-sans">(${n.subtitle})</span>
                </h4>
                <p class="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  ${n.description}
                </p>
                <div class="mt-2 text-[11px] text-amber-300/90 flex items-start gap-1.5 bg-amber-950/20 p-2 rounded-lg border border-amber-500/20">
                  <span>💡</span>
                  <span><strong>物理科技史：</strong>${n.scienceHistory}</span>
                </div>
              </div>

              <!-- 關鍵參數摘要 -->
              <div class="flex md:flex-col gap-3 min-w-[180px] bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
                <div>
                  <span class="text-[10px] text-slate-400 block font-sans">極限線寬 (Min CD)</span>
                  <span class="text-sm font-bold text-cyan-400">${n.minCDNm>=1e3?(n.minCDNm/1e3).toFixed(1)+" µm":n.minCDNm+" nm"}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 block font-sans">要求潔淨室標準</span>
                  <span class="text-sm font-bold text-emerald-400">${n.unlockedCleanroomClass}</span>
                </div>
              </div>
            </div>

            <!-- 研發進度三大指標 (若檢視的是次世代目標) -->
            ${!a.isMaxTier&&n.tier===a.currentTier+1?`
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
                        <button class="btn-invest-funds btn-sci-fi text-xs py-1 px-3 bg-amber-950/40 border-amber-500/40 text-amber-300 hover:text-white" data-amount="5000000" ${e.player.cash<5e6?"disabled":""}>
                          + NT$ 500 萬
                        </button>
                        <button class="btn-invest-funds btn-sci-fi text-xs py-1 px-3 bg-amber-950/40 border-amber-500/40 text-amber-300 hover:text-white" data-amount="20000000" ${e.player.cash<2e7?"disabled":""}>
                          + NT$ 2,000 萬
                        </button>
                        <button class="btn-invest-funds btn-sci-fi text-xs py-1 px-3 bg-amber-950/40 border-amber-500/40 text-amber-300 hover:text-white" data-amount="100000000" ${e.player.cash<1e8?"disabled":""}>
                          + NT$ 1 億
                        </button>
                        <button class="btn-invest-funds btn-sci-fi text-xs py-1 px-3 bg-emerald-950/50 border-emerald-500/50 text-emerald-300 hover:text-white ml-auto" data-amount="999999999999" ${e.player.cash<=0?"disabled":""}>
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
                    ${a.canAdvance?`🚀 達成三大研發條件！立即突破晉升【Tier ${(d=a.nextTierConfig)==null?void 0:d.tier} ${(l=a.nextTierConfig)==null?void 0:l.name}】！`:`🔒 尚未達成晉升條件 (完成度 ${a.overallPct}%)`}
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
                  <span>Tier ${n.tier} 專屬解鎖先進機台與製程特色</span>
                </h4>
                <span class="text-[11px] text-slate-400 font-mono">共 ${n.unlockedModelIds.length} 台次世代設備</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                ${n.unlockedModelIds.map(o=>{const p=te.STORE_CATALOG.find(c=>c.modelId===o);return p?`
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
    `,this.bindEvents(t,e,s)}static bindEvents(t,e,s){const a=t.querySelector("#modal-backdrop-techtree"),i=t.querySelector("#btn-close-techtree"),r=t.querySelector("#btn-back-techtree"),n=()=>{b.playClick(),t.innerHTML="",s()};a==null||a.addEventListener("click",l=>{l.target===a&&n()}),i==null||i.addEventListener("click",n),r==null||r.addEventListener("click",n),t.querySelectorAll(".btn-tier-node").forEach(l=>{l.addEventListener("click",o=>{const p=Number(o.currentTarget.getAttribute("data-tier"));p>=1&&p<=Y.MAX_TIER&&(b.playClick(),this.selectedViewTier=p,this.render(t,e,s))})}),t.querySelectorAll(".btn-invest-funds").forEach(l=>{l.addEventListener("click",o=>{const p=Number(o.currentTarget.getAttribute("data-amount"));Y.investRDCapital(e,p).success?b.playDing():b.playAlarm(),s(),this.render(t,e,s)})});const d=t.querySelector("#btn-advance-tier");d==null||d.addEventListener("click",()=>{const l=Y.advanceFoundryTier(e);l.success?(b.playFanfare(),this.selectedViewTier=Math.min(Y.MAX_TIER,l.newTier+1),s(),this.render(t,e,s)):(b.playAlarm(),alert(l.message))})}}E(xe,"selectedViewTier",null);class te{static show(t,e,s){const a=document.getElementById("modal-container");a&&(s&&(this.activeCategory=s),this.render(a,t,e))}static render(t,e,s){const a=[{key:"LITHO",label:"LITHO 微影機",icon:"🔦"},{key:"TRACK",label:"TRACK 塗膠顯影 (瓶頸)",icon:"🌀"},{key:"FILM",label:"FILM 薄膜成長",icon:"✨"},{key:"ETCH",label:"ETCH 蝕刻製程",icon:"⚡"},{key:"DIFF",label:"DIFF 擴散植入",icon:"🎯"},{key:"CMP",label:"CMP 平坦研磨",icon:"💿"},{key:"AMHS",label:"AMHS 運送設備",icon:"🚚"},{key:"FACILITY",label:"無塵廠房與潔淨度",icon:"🏛️"},{key:"FLEET",label:"廠內現役機台 ("+e.machines.length+")",icon:"🏭"}];t.innerHTML=`
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
            ${a.map(i=>{const r=this.activeCategory===i.key,n=i.key==="CMP"&&!e.unlockedFeatures.cmp;return`
                <button
                  class="btn-store-tab px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${r?"border-amber-400 text-amber-300":"border-transparent text-slate-400 hover:text-slate-200"} ${n?"opacity-50":""}"
                  data-cat="${i.key}"
                >
                  <span>${i.icon}</span>
                  <span>${i.label}</span>
                  ${n?'<span class="text-[10px] text-amber-500 font-mono">(Tier 3解鎖)</span>':""}
                </button>
              `}).join("")}
          </div>

          <!-- Body Content -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4">
            ${this.activeCategory==="FLEET"?this.renderFleetTab(e):this.activeCategory==="AMHS"?this.renderAMHSTab(e):this.activeCategory==="FACILITY"?this.renderFacilityTab(e):this.renderCatalogTab(e)}
          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
            <button id="btn-back-store" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s)}static renderAMHSTab(t){return`
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
        ${[{feature:"manual",name:"人工卡匣徒步搬運 (Manual Handling)",tier:1,price:0,speed:"1.0 格/秒",assetPath:N.characters.tech_cleanroom.path,isPurchased:!0,isUnlocked:!0,canAfford:!0,description:"無塵衣技術員手持晶圓盒穿梭各站手動交接。搬運速度慢，人員走動產生微塵，交接等待時間較長。",scienceNote:"半導體萌芽期仰賴人員手動搬運卡匣，每小時人員走動產生之微塵顆粒達數萬顆，對良率是巨大隱憂。",benefits:["基礎徒步搬運","無設備採購支出"]},{feature:"agv",name:"AGV 磁導激光無人自走車 (Automated Guided Vehicle)",tier:1,price:8e6,speed:"2.5 格/秒",assetPath:N.characters.agv_carrier.path,isPurchased:!!t.unlockedFeatures.agv,isUnlocked:t.player.foundryTier>=1,canAfford:t.player.cash>=8e6,description:"地面自主導航輪式無人載具，依循地面雷射激光自主穿梭於各站機台之間。自動對位上下料，大幅降低人員進出無塵室落塵。",scienceNote:"AGV 採用光學雷達 (LiDAR) 與磁帶導引，實現無塵室地面自動化運輸，有效平滑各站排隊緩衝並消弭交接震動。",benefits:["解鎖地面無人自走車自主巡航","消弭人工搬運落塵提升良率","達成自動化物料搬運 AMHS 里程碑"]},{feature:"oht",name:"OHT 高速天軌懸吊天車 (Overhead Hoist Transport)",tier:2,price:35e6,speed:"5.0 格/秒",assetPath:N.characters.oht_shuttle.path,isPurchased:!!t.unlockedFeatures.oht,isUnlocked:t.player.foundryTier>=2,canAfford:t.player.cash>=35e6,description:"天花板立體閉迴路天軌懸吊天車系統，晶圓 FOUP 完全在空中高速飛行傳送。徹底解耦地面人車交通，是現代晶圓廠的核心骨幹！",scienceNote:"現代 300mm 超級晶圓廠的神經中樞。透過空中立體懸吊軌道直接降下垂直機械爪 (Hoist) 對位 Load Port，站點傳送時間縮短 70%！",benefits:["解鎖天花板空中天軌高速巡航","站間交接時間縮短 70%","徹底消除地面交織塞車瓶頸"]},{feature:"shrOht",name:"SHR 超急件綠波磁浮天車 (Super Hot Run OHT)",tier:4,price:12e7,speed:"8.0 格/秒",assetPath:N.characters.oht_shuttle.path,isPurchased:!!t.unlockedFeatures.shrOht,isUnlocked:t.player.foundryTier>=4,canAfford:t.player.cash>=12e7,description:"旗艦級超急件動態調度系統！改裝超導磁浮提速馬達，天車空中巡航提速 2.5 倍，並在天軌享有超急件綠波路權 (翠綠色科技特效)！",scienceNote:"Super Hot Run (SHR) 為晶圓代工廠為戰略客戶特批之綠波急件協議，所有天軌道岔與機台排程優先強占，極速交件！",benefits:["天車飛行速度大幅激增 2.5 倍","空中天車呈現綠波磁浮特效 (Emerald Glow)","大幅壓制 Q-Time 逾期報廢風險"]}].map(s=>`
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
    `}static renderFacilityTab(t){const e=t.facility.cleanroomPhase||1,s=t.facility.bayGridSize||{width:10,height:10},a=s.width*s.height,r=(t.player.unlockedCleanroomClass||"Class 10000").replace(/,/g,""),n=[{phase:1,name:"Phase 1: 模組起步廠房 (Pilot Fab)",width:10,height:10,area:100,price:0,tier:1,icon:"🏭",desc:"標準 10×10 (100 格) 基礎無塵室空間。具備核心機台進駐廊道，適合 3µm ~ 350nm 早期製程。",benefits:["100 格基盤面積","標準黃光隔離區","基礎環形天軌迴路"]},{phase:2,name:"Phase 2: 規模量產廠房 (Volume Fab)",width:14,height:14,area:196,price:5e6,tier:1,icon:"🏗️",desc:"拓建為 14×14 (196 格，擴增 +96 格)。舒緩機台走道壅塞，容納多台並聯 Track 與薄膜機台。",benefits:["196 格寬敞廠房 (+96 格)","可容納並聯 Track 機群","AMHS 自走車通行效率大增"]},{phase:3,name:"Phase 3: 先進製程晶圓巨廠 (MegaFab)",width:18,height:18,area:324,price:15e6,tier:2,icon:"🏢",desc:"擴展為 18×18 (324 格，擴增 +128 格)。支援多層金屬佈線、浸潤式微影與 CMP 平坦化專案產線。",benefits:["324 格巨無霸廠房 (+128 格)","支援大陣列 CMP 研磨機群","全面支援 OHT 天車懸吊高速天軌"]},{phase:4,name:"Phase 4: 巨型超級晶圓廠 (GigaFab)",width:24,height:24,area:576,price:4e7,tier:3,icon:"🏛️",desc:"究極 24×24 (576 格，擴增 +252 格) 全球旗艦級半導體巨型廠 (GigaFab)！可容納整套 High-NA EUV 極紫外光微影旗艦機隊！",benefits:["576 格超級旗艦廠房 (+252 格)","🏆 解鎖【GigaFab 巨型潔淨室擴建】成就 (+NT$ 2,000,000)","無上限自由機台佈局空間"]}],d=[{id:"Class 10000",name:"Class 10,000 (ISO 7) 工業級無塵室",dustDensity:"<= 10,000 顆 / ft³",layerFactorVal:.915,layerFactor:"91.5%",est6Layer:"~57.5%",price:0,tier:1,desc:"半導體入門等級，每立方英尺允許 10,000 顆 >=0.5µm 微塵。微塵容易落在晶圓表面形成針孔與短路缺陷。",science:"美國聯邦標準 FED-STD-209E。微米早期製程尚可耐受，但多層加工累積良率較低。"},{id:"Class 1000",name:"Class 1,000 (ISO 6) 現代量產無塵室",dustDensity:"<= 1,000 顆 / ft³",layerFactorVal:.955,layerFactor:"95.5%",est6Layer:"~75.8%",price:8e6,tier:1,desc:"落塵量驟降 90%！物理單層良率大幅飆升至 95.5%，直接逆轉 6 層以上晶圓多層良率雪崩惡夢！",science:"加裝高效 HEPA 濾網與強化無塵送風天花板，顯著隔絕人員走動與設備摩擦產生的浮游微粒。"},{id:"Class 100",name:"Class 100 (ISO 5) 黃光專區無塵室",dustDensity:"<= 100 顆 / ft³",layerFactorVal:.975,layerFactor:"97.5%",est6Layer:"~85.9%",price:25e6,tier:2,desc:"先進微影黃光區標配環境，落塵控制在 100 顆以下。單層良率達 97.5%，六層累積良率突破 85%！",science:"採用全天花板垂直層流 (Laminar Flow)，新鮮潔淨氣流以固定風速向下吹送，微塵瞬即被帶入高架地板排氣孔。"},{id:"Class 10",name:"Class 10 (ISO 4) 奈米級無塵微環境",dustDensity:"<= 10 顆 / ft³",layerFactorVal:.988,layerFactor:"98.8%",est6Layer:"~93.0%",price:6e7,tier:3,desc:"嚴格控管落塵於 10 顆以下，關鍵尺寸 (CD) 與極薄閘極氧化層獲得金鐘罩級防護，單層良率 98.8%！",science:"ULPA 超高效空氣過濾器搭配化學氣體過濾器 (AMC Filter)，除微塵外更全面過濾酸鹼揮發性分子。"},{id:"Class 1",name:"Class 1 (ISO 3) 極致潔淨室",dustDensity:"<= 1 顆 / ft³",layerFactorVal:.995,layerFactor:"99.5%",est6Layer:"~97.0%",price:15e7,tier:3,desc:"每立方英尺僅容許 1 顆微塵！接近外太空真空純淨度，全流程多層累積良率直逼 97%！",science:"微影與蝕刻機台完全隔離於 mini-environment 局部微環境，人員不直接接觸晶圓，全部由自動化機械手臂傳輸。"},{id:"ISO 1",name:"ISO 1 (究極超純無塵室)",dustDensity:"<= 0.1 顆 / ft³",layerFactorVal:.9985,layerFactor:"99.85%",est6Layer:"~99.1%",price:4e8,tier:3,desc:"半導體物理極限潔淨殿堂！搭配全自動氮氣置換 FOUP 密閉晶圓盒，神級黃金良率 99%+ (Flawless Wafer) 必備利器！",science:"ISO 14644-1 最高極限標準，以雷射粒子計數器幾近量測不到任何大於 0.1µm 顆粒，為埃米世代提供終極防護。"}],l=d.findIndex(c=>r.includes(c.id.replace(/,/g,""))),o=l>=0?l:0,p=d[o];return`
      <!-- Overview Status Banner -->
      <div class="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-2xl flex-shrink-0">
              🏛️
            </div>
            <div>
              <h4 class="text-sm font-bold text-white flex items-center gap-2">
                <span>無塵廠房規模與潔淨度管理中心</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Phase ${e} / Tier ${t.player.foundryTier}
                </span>
              </h4>
              <p class="text-xs text-slate-400 mt-0.5">
                拓建廠房空間擴充機台進駐容量；升級潔淨度等級從根本消除落塵，大幅拉升晶圓多層良率！
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3 font-mono text-xs">
            <div class="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <div class="text-[10px] text-slate-400">當前廠房面積</div>
              <div class="font-bold text-cyan-300">${s.width}×${s.height} (${a} 格)</div>
            </div>
            <div class="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <div class="text-[10px] text-slate-400">當前無塵室等級</div>
              <div class="font-bold text-emerald-400">${p.name.split(" (")[0]}</div>
            </div>
            <div class="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-center">
              <div class="text-[10px] text-slate-400">單層良率係數</div>
              <div class="font-bold text-amber-400">${p.layerFactor}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section 1: 無塵廠房拓建 (Phase 1 ~ Phase 4) -->
      <div class="space-y-3">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <h4 class="font-bold text-white text-sm flex items-center gap-2">
            <span>🏗️</span>
            <span>無塵室廠房拓建 (Phase Expansion)</span>
          </h4>
          <span class="text-xs text-slate-400 font-mono">擴大無塵室地磚與機台放置空間</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          ${n.map(c=>{const h=c.phase===e,m=c.phase<e,u=c.phase===e+1,f=t.player.foundryTier>=c.tier,g=t.player.cash>=c.price;let v="border-slate-800 bg-slate-900/70";return h?v="border-cyan-500/60 bg-cyan-950/20":u&&(v="border-indigo-500/50 bg-indigo-950/10 hover:border-indigo-400/80"),`
              <div class="p-4 rounded-xl border ${v} transition-all flex flex-col justify-between space-y-3">
                <div class="space-y-2">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2.5">
                      <div class="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-lg flex-shrink-0">
                        ${c.icon}
                      </div>
                      <div>
                        <h5 class="font-bold text-white text-sm">${c.name}</h5>
                        <div class="text-[10px] font-mono text-cyan-400">
                          尺寸: ${c.width}×${c.height} 格 | 總面積: ${c.area} 格 (${c.area>100?`+${c.area-100} 格`:"基礎"})
                        </div>
                      </div>
                    </div>

                    ${h?`
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                        🔵 目前廠房
                      </span>
                    `:m?`
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-400">
                        ✔️ 已拓展
                      </span>
                    `:`
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono ${f?"bg-indigo-500/20 text-indigo-300 border border-indigo-500/30":"bg-slate-800 text-slate-400"}">
                        Tier ${c.tier}+
                      </span>
                    `}
                  </div>

                  <p class="text-[11px] text-slate-300 leading-relaxed">
                    ${c.desc}
                  </p>

                  <div class="flex flex-wrap gap-1.5 pt-1">
                    ${c.benefits.map(y=>`
                      <span class="px-2 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300">
                        ${y}
                      </span>
                    `).join("")}
                  </div>
                </div>

                <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div class="font-mono">
                    <span class="text-[10px] text-slate-400">擴建投資：</span>
                    <strong class="text-amber-400 text-xs">${c.price===0?"免費 (起步)":`NT$ ${c.price.toLocaleString()}`}</strong>
                  </div>

                  ${h?`
                    <button disabled class="py-1.5 px-3 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-bold font-mono cursor-default">
                      ✔️ 現役廠房規模
                    </button>
                  `:m?`
                    <button disabled class="py-1.5 px-3 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 text-xs font-mono cursor-default">
                      已由更高等級取代
                    </button>
                  `:f?u?`
                    <button
                      class="btn-upgrade-facility-phase btn-sci-fi px-4 py-1.5 text-xs font-bold cursor-pointer ${g?"bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/20":"opacity-50 cursor-not-allowed bg-slate-800"}"
                      data-phase="${c.phase}"
                      data-price="${c.price}"
                      data-width="${c.width}"
                      data-height="${c.height}"
                      ${g?"":"disabled"}
                    >
                      <span>🏗️ 立即擴建廠房</span>
                    </button>
                  `:`
                    <button disabled class="py-1.5 px-3 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-500 text-xs cursor-not-allowed">
                      🔒 需先完成 Phase ${c.phase-1}
                    </button>
                  `:`
                    <button class="btn-open-techtree-from-store py-1.5 px-3 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 text-xs cursor-pointer">
                      🔒 需晉升至 Tier ${c.tier}
                    </button>
                  `}
                </div>
              </div>
            `}).join("")}
        </div>
      </div>

      <!-- Section 2: 無塵室潔淨度等級升級 (Class 10,000 -> ISO 1) -->
      <div class="space-y-3 pt-4 border-t border-slate-800">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div>
            <h4 class="font-bold text-white text-sm flex items-center gap-2">
              <span>🔬</span>
              <span>無塵室潔淨度等級升級 (Cleanroom Cleanliness Class)</span>
            </h4>
            <span class="text-[11px] text-slate-400">過濾空氣落塵粒子，提供單層良率金鐘罩 (直接拉升多層晶圓累積良率)</span>
          </div>
          <span class="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
            解決「良率過低」核心神器
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          ${d.map((c,h)=>{const m=h===o,u=h<o,f=h===o+1,g=t.player.foundryTier>=c.tier,v=t.player.cash>=c.price;let y="border-slate-800 bg-slate-900/70";return m?y="border-emerald-500/60 bg-emerald-950/20":f&&(y="border-amber-500/50 bg-amber-950/10 hover:border-amber-400/80"),`
              <div class="p-3.5 rounded-xl border ${y} transition-all flex flex-col justify-between space-y-3">
                <div class="space-y-2">
                  <div class="flex items-start justify-between gap-1.5">
                    <div>
                      <h5 class="font-bold text-white text-xs">${c.name}</h5>
                      <div class="text-[10px] font-mono text-emerald-400 mt-0.5">
                        單層良率: <strong class="text-white">${c.layerFactor}</strong> | 6層預估: <strong class="text-cyan-300">${c.est6Layer}</strong>
                      </div>
                    </div>

                    ${m?`
                      <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex-shrink-0">
                        🟢 當前等級
                      </span>
                    `:u?`
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 flex-shrink-0">
                        ✔️ 已超越
                      </span>
                    `:`
                      <span class="px-1.5 py-0.5 rounded text-[10px] font-mono ${g?"bg-amber-500/20 text-amber-300 border border-amber-500/30":"bg-slate-800 text-slate-400"} flex-shrink-0">
                        Tier ${c.tier}+
                      </span>
                    `}
                  </div>

                  <div class="p-2 rounded bg-slate-950/80 border border-slate-800/80 text-[10px] font-mono text-slate-400 space-y-0.5">
                    <div class="flex justify-between">
                      <span>落塵容許密度:</span>
                      <span class="text-cyan-300 font-bold">${c.dustDensity}</span>
                    </div>
                  </div>

                  <p class="text-[11px] text-slate-300 leading-relaxed">
                    ${c.desc}
                  </p>
                </div>

                <div class="space-y-2 pt-2 border-t border-slate-800/80">
                  <div class="flex items-center justify-between text-xs font-mono">
                    <span class="text-[10px] text-slate-400">升級費用:</span>
                    <strong class="text-amber-400">${c.price===0?"初始免費":`NT$ ${c.price.toLocaleString()}`}</strong>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      class="btn-cleanroom-info btn-sci-fi py-1.5 px-2.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 cursor-pointer flex-shrink-0"
                      data-title="${c.name}"
                      data-note="${c.science}"
                      title="查看無塵室潔淨原理"
                    >
                      <span>ℹ️</span>
                      <span>原理</span>
                    </button>

                    ${m?`
                      <button disabled class="flex-1 py-1.5 px-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold font-mono cursor-default text-center">
                        ✔️ 現役潔淨規格
                      </button>
                    `:u?`
                      <button disabled class="flex-1 py-1.5 px-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-400 text-xs font-mono cursor-default text-center">
                        已超越此等級
                      </button>
                    `:g?f?`
                      <button
                        class="btn-upgrade-cleanroom-class flex-1 btn-sci-fi justify-center py-1.5 text-xs font-bold cursor-pointer ${v?"bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20":"opacity-50 cursor-not-allowed bg-slate-800"}"
                        data-class-id="${c.id}"
                        data-price="${c.price}"
                        data-name="${c.name}"
                        ${v?"":"disabled"}
                      >
                        <span>✨ 立即升級潔淨等級</span>
                      </button>
                    `:`
                      <button disabled class="flex-1 py-1.5 px-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-500 text-xs cursor-not-allowed text-center">
                        🔒 需先達成前一級
                      </button>
                    `:`
                      <button class="btn-open-techtree-from-store flex-1 py-1.5 px-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-cyan-300 text-xs cursor-pointer text-center">
                        🔒 需晉升 Tier ${c.tier}
                      </button>
                    `}
                  </div>
                </div>
              </div>
            `}).join("")}
        </div>
      </div>
    `}static renderCatalogTab(t){const e=this.STORE_CATALOG.filter(s=>s.category===this.activeCategory);return`
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
        ${e.map((s,a)=>{const i=t.player.foundryTier>=s.tier,r=t.player.cash>=s.price,n=s.category==="CMP"&&!t.unlockedFeatures.cmp;return`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${i?"border-slate-800 hover:border-amber-500/40":"border-slate-800/40 opacity-70"} transition-all flex flex-col justify-between space-y-3">
              
              <div class="flex items-start gap-3">
                <div class="store-thumb-box machine-card-thumb w-16 h-16 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden relative group">
                  <img src="${s.assetPath}" alt="${s.name}" class="w-full h-full object-contain filter drop-shadow" style="max-width: 56px; max-height: 56px;" />
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <h4 class="font-bold text-white text-sm truncate">${s.name}</h4>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono ${i?"bg-cyan-500/20 text-cyan-300":"bg-slate-800 text-slate-400"}">
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

                ${i?`
                  <button
                    class="btn-buy-equipment flex-1 btn-sci-fi justify-center text-xs py-2 ${!r||n?"opacity-50 cursor-not-allowed":""}"
                    data-model-id="${s.modelId}"
                    ${!r||n?"disabled":""}
                  >
                    ${n?"🔒 CMP 科技未解鎖":r?"🛒 採購並安裝至廠房":"資金不足"}
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
    `}static renderFleetTab(t){return t.machines.length===0?`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">🏭</div>
          <p class="text-sm">廠內目前尚未安裝任何機台，請前往各站點選購！</p>
        </div>
      `:`
      <div class="space-y-3">
        ${t.machines.map(e=>{const s=this.STORE_CATALOG.find(d=>d.modelId===e.modelId),a=Math.round((s?s.price:2e6)*.15),i=Math.round((s?s.price:2e6)*.4),r=Math.round(e.wear);let n='<span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">閒置 (IDLE)</span>';return e.status==="PROCESSING"?n='<span class="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">加工中</span>':e.status==="MAINTENANCE"?n='<span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">🛠️ 維護中</span>':e.status==="EXPLODED"&&(n='<span class="px-2 py-0.5 rounded text-[10px] bg-red-600 text-white font-bold animate-bounce">💥 腔體炸毀</span>'),`
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="store-thumb-box machine-card-thumb w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden">
                  <img src="${s?s.assetPath:N.machines.litho_contact.path}" alt="${e.name}" class="w-full h-full object-contain" style="max-width: 44px; max-height: 44px;" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">${e.name}</span>
                    ${n}
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
                  data-refund="${i}"
                >
                  ♻️ 報廢變賣 (+NT$ ${i.toLocaleString()})
                </button>
              </div>
            </div>
          `}).join("")}
      </div>
    `}static bindEvents(t,e,s){var r,n,d;const a=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",i)},i=l=>{l.key==="Escape"&&a()};window.addEventListener("keydown",i),(r=document.getElementById("btn-close-store"))==null||r.addEventListener("click",a),(n=document.getElementById("btn-back-store"))==null||n.addEventListener("click",a),(d=document.getElementById("modal-backdrop-store"))==null||d.addEventListener("click",l=>{l.target===document.getElementById("modal-backdrop-store")&&a()}),t.querySelectorAll(".btn-store-tab").forEach(l=>{l.addEventListener("click",o=>{b.playClick();const p=o.currentTarget.getAttribute("data-cat");if(p==="CMP"&&!e.unlockedFeatures.cmp){alert("CMP（化學機械研磨）機台需晉升至 Tier 3 世代後方可解鎖！");return}this.activeCategory=p,this.render(t,e,s)})}),t.querySelectorAll(".btn-sci-info").forEach(l=>{l.addEventListener("click",o=>{b.playClick();const p=parseInt(o.currentTarget.getAttribute("data-index")||"0",10),c=this.STORE_CATALOG.filter(h=>h.category===this.activeCategory)[p];c&&alert(`👨‍🏫 半導體晶圓教室：【${c.name}】

${c.scienceNote}`)})}),t.querySelectorAll(".btn-open-techtree-from-store").forEach(l=>{l.addEventListener("click",()=>{b.playClick(),t.innerHTML="",xe.show(e,()=>{s()})})}),t.querySelectorAll(".btn-buy-equipment").forEach(l=>{l.addEventListener("click",o=>{const p=o.currentTarget.getAttribute("data-model-id"),c=this.STORE_CATALOG.find(g=>g.modelId===p);if(!c)return;if(e.player.cash<c.price){alert("資金不足，無法完成設備採購！");return}e.player.cash-=c.price,A.recordCapEx(e,c.price),b.playCoinChime();const h=e.machines.length,m=h%4*2,u=Math.floor(h/4)*2,f={id:`MCH-${Date.now().toString(36).toUpperCase().slice(-5)}`,modelId:c.modelId,name:c.name.split(" (")[0],category:c.category,tier:c.tier,gridX:Math.min(7,m),gridY:Math.min(7,u),wear:0,status:"IDLE",assignedEngineerId:null,pairedTrackIds:c.category==="LITHO"?[]:void 0};e.machines.push(f),R.updateMachineNames(e.machines),F.checkAchievements(e),s(),this.activeCategory="FLEET",this.render(t,e,s)})}),t.querySelectorAll(".btn-overhaul").forEach(l=>{l.addEventListener("click",o=>{const p=o.currentTarget.getAttribute("data-machine-id"),c=parseInt(o.currentTarget.getAttribute("data-cost")||"0",10),h=e.machines.find(m=>m.id===p);if(h){if(e.player.cash<c){alert("資金不足，無法支付大修費用！");return}e.player.cash-=c,A.recordMaintenance(e,c),h.wear=0,h.status="IDLE",b.playClick(),s(),this.render(t,e,s)}})}),t.querySelectorAll(".btn-decommission").forEach(l=>{l.addEventListener("click",o=>{const p=o.currentTarget.getAttribute("data-machine-id"),c=parseInt(o.currentTarget.getAttribute("data-refund")||"0",10),h=e.machines.findIndex(u=>u.id===p);if(h===-1||!confirm(`確定要報廢並變賣此機台嗎？將回收變賣金 NT$ ${c.toLocaleString()}`))return;const m=e.machines[h];if(m.assignedEngineerId){const u=e.staff.find(f=>f.id===m.assignedEngineerId);u&&(u.assignedMachineId=null)}e.player.cash+=c,e.machines.splice(h,1),b.playCoinChime(),s(),this.render(t,e,s)})}),t.querySelectorAll(".btn-amhs-info").forEach(l=>{l.addEventListener("click",o=>{b.playClick();const p=o.currentTarget.getAttribute("data-note")||"",c=o.currentTarget.getAttribute("data-title")||"";alert(`🚚 廠務自動化物料搬運 (AMHS) 原理解析：【${c}】

${p}`)})}),t.querySelectorAll(".btn-buy-amhs").forEach(l=>{l.addEventListener("click",o=>{const p=o.currentTarget.getAttribute("data-feature"),c=parseInt(o.currentTarget.getAttribute("data-price")||"0",10),h=o.currentTarget.getAttribute("data-name")||"";if(e.player.cash<c){alert("流動資金不足，無法採購此運送設備！");return}confirm(`確定要投資 NT$ ${c.toLocaleString()} 採購並升級【${h}】嗎？`)&&(e.player.cash-=c,A.recordCapEx(e,c),p==="agv"?e.unlockedFeatures.agv=!0:p==="oht"?e.unlockedFeatures.oht=!0:p==="shrOht"&&(e.unlockedFeatures.shrOht=!0),$.saveToLocalStorage(e),F.checkAchievements(e),b.playFanfare(),s(),this.render(t,e,s))})}),t.querySelectorAll(".btn-upgrade-facility-phase").forEach(l=>{l.addEventListener("click",o=>{const p=parseInt(o.currentTarget.getAttribute("data-phase")||"1",10),c=parseInt(o.currentTarget.getAttribute("data-price")||"0",10),h=parseInt(o.currentTarget.getAttribute("data-width")||"10",10),m=parseInt(o.currentTarget.getAttribute("data-height")||"10",10);if(e.player.cash<c){alert("流動資金不足，無法進行無塵室廠房擴建！");return}confirm(`確定要投資 NT$ ${c.toLocaleString()} 擴建無塵室廠房至 Phase ${p} (${h}×${m} 格) 嗎？`)&&(e.player.cash-=c,A.recordCapEx(e,c),e.facility.cleanroomPhase=p,e.facility.bayGridSize={width:h,height:m},Q.trigger(-c),b.playFanfare(),F.checkAchievements(e),$.saveToLocalStorage(e),s(),this.render(t,e,s))})}),t.querySelectorAll(".btn-upgrade-cleanroom-class").forEach(l=>{l.addEventListener("click",o=>{const p=o.currentTarget.getAttribute("data-class-id")||"Class 10000",c=parseInt(o.currentTarget.getAttribute("data-price")||"0",10),h=o.currentTarget.getAttribute("data-name")||"";if(e.player.cash<c){alert("流動資金不足，無法升級無塵室潔淨度等級！");return}confirm(`確定要投資 NT$ ${c.toLocaleString()} 升級無塵室潔淨等級至【${h}】嗎？`)&&(e.player.cash-=c,A.recordCapEx(e,c),e.player.unlockedCleanroomClass=p,Q.trigger(-c),b.playFanfare(),F.checkAchievements(e),$.saveToLocalStorage(e),s(),this.render(t,e,s))})}),t.querySelectorAll(".btn-cleanroom-info").forEach(l=>{l.addEventListener("click",o=>{b.playClick();const p=o.currentTarget.getAttribute("data-note")||"",c=o.currentTarget.getAttribute("data-title")||"";alert(`🔬 無塵室物理原理科普：【${c}】

${p}`)})})}}E(te,"activeCategory","LITHO"),E(te,"STORE_CATALOG",[{modelId:"litho_contact",name:"Contact Aligner (接觸式微影機)",category:"LITHO",tier:1,price:25e5,throughputWpm:10,rayleighLimitNm:3007,description:"半導體萌芽期主力，光罩物理緊貼晶圓表面進行紫外曝光，維修容易。",scienceNote:"利用汞燈紫外混光 (436nm) 貼合曝光。因光罩直接碰觸晶圓表面，容易刮傷光罩與產生落塵，極限線寬約 3µm。",assetPath:N.machines.litho_contact.path},{modelId:"litho_projection",name:"1x Projection Aligner (1:1 投影曝光機)",category:"LITHO",tier:1,price:6e6,throughputWpm:15,rayleighLimitNm:1798,description:"反射鏡等倍投影微影，光罩懸空不接觸晶圓，徹底終結光罩刮傷磨損。",scienceNote:"Perkin-Elmer 經典反射光學系統，以凹面鏡聚焦達成 1:1 無接觸曝光，大幅提升光罩壽命與開局良率。",assetPath:N.machines.litho_projection.path},{modelId:"litho_gline",name:"G-Line Stepper (步進縮小曝光機)",category:"LITHO",tier:2,price:18e6,throughputWpm:25,rayleighLimitNm:997,description:"4:1 縮小投影透鏡，逐區步進曝光（Step-and-Repeat），進入 1µm 時代。",scienceNote:"高壓汞燈 g-line (436nm) 搭配數值孔徑 NA=0.35 之複合縮小透鏡，將光罩圖案縮小 4 倍投射，突破微米大關。",assetPath:N.machines.litho_gline.path},{modelId:"litho_iline",name:"I-Line Stepper (高壓汞燈微影機)",category:"LITHO",tier:3,price:35e6,throughputWpm:55,rayleighLimitNm:584,description:"次微米時代霸主，波長 365nm，支援精密對準與多層金屬互連製程。",scienceNote:"採用更短波長之高強度汞燈 i-line (365nm) 與 NA=0.50 鏡頭，成功壓制繞射效應，可清晰成像至 500nm。",assetPath:N.machines.litho_iline.path},{modelId:"litho_krf",name:"KrF DUV Scanner (準分子雷射微影機)",category:"LITHO",tier:4,price:85e6,throughputWpm:120,rayleighLimitNm:283,description:"深紫外光 (DUV) 準分子雷射，邁入動態連續掃描曝光 (Step-and-Scan)。",scienceNote:"248nm 氟化氪 (KrF) 準分子雷射光源，必須搭配化學增幅光阻 (CAR) 放大光化學反應，支援 0.25µm 製程。",assetPath:N.machines.litho_krf.path},{modelId:"litho_arfdry",name:"ArF Dry Scanner (氟化氬乾式微影機)",category:"LITHO",tier:4,price:18e7,throughputWpm:120,rayleighLimitNm:182,description:"193nm 紫外雷射，將大氣乾式微影發揮至極致，跨越次百奈米門檻。",scienceNote:"利用 193nm 氟化氬雷射與高折射石英透鏡群，是半導體製程縮小至 90nm/65nm 的核心關鍵機台。",assetPath:N.machines.litho_arfdry.path},{modelId:"litho_arfi",name:"ArFi Immersion TWINSCAN (浸潤式微影機)",category:"LITHO",tier:5,price:45e7,throughputWpm:260,rayleighLimitNm:114,description:"鏡頭與晶圓間注入超純水折射光線，雙工件台磁浮掃描，大氣產速最快！",scienceNote:"林本堅博士提出之革命性技術：利用水之折射率 n=1.44 巧妙將等效數值孔徑提升至 NA=1.35，多重曝光下推進至 7nm！",assetPath:N.machines.litho_arfi.path},{modelId:"litho_euv",name:"EUV Scanner (極紫外光微影巨獸)",category:"LITHO",tier:6,price:25e8,throughputWpm:180,rayleighLimitNm:33,description:"13.5nm 極紫外光，全真空反射鏡系統，單次曝光推進 7nm/5nm/3nm！",scienceNote:"以高功率二氧化碳雷射轟擊融熔錫滴激發電漿，產生 13.5nm EUV 光子，全機在超高真空運行，受抽真空限制產能為 180 片/分。",assetPath:N.machines.litho_euv.path},{modelId:"litho_highna",name:"High-NA EUV (高數值孔徑次世代巨獸)",category:"LITHO",tier:6,price:6e9,throughputWpm:180,rayleighLimitNm:20,description:"0.55 NA 變形數值孔徑透鏡，埃米世代霸主，稱霸矽島之終極神兵。",scienceNote:"採用變形鏡頭 (Anamorphic Optics)，X/Y 軸非對稱倍率，單次曝光極限線寬可達 20nm 以下，引領 2nm 埃米時代。",assetPath:N.machines.litho_highna.path},{modelId:"track_manual",name:"手動旋塗熱板台 (Manual Spin & Bake)",category:"TRACK",tier:1,price:8e5,throughputWpm:6,description:"⚠️ 開局先天產能瓶頸！人工滴膠手動離心旋塗與熱板預烤，產能僅 6 片/分。",scienceNote:"利用真空吸盤固定晶圓，手動注射光阻後以 3000 RPM 高速旋轉甩出均勻薄膜，再由人員夾入熱板烘烤。",assetPath:N.machines.track_manual.path},{modelId:"track_single",name:"單軌自動塗膠顯影機 (Single Track)",category:"TRACK",tier:2,price:45e5,throughputWpm:16,description:"初步自動化旋轉塗膠與自動烘烤模組，大幅減少人工操作失誤。",scienceNote:"機械手臂自動傳送晶圓至旋塗杯，自動注膠均勻成膜，並整合冷卻板 (Chill Plate) 精確控制膜厚。",assetPath:N.machines.track_single.path},{modelId:"track_dual",name:"雙軌連線 Track (Dual Track)",category:"TRACK",tier:3,price:12e6,throughputWpm:35,description:"雙獨立機械臂分開處理塗膠與顯影，有效提升次微米連線吞吐量。",scienceNote:"將塗膠旋塗單元 (Coater) 與顯影槽 (Developer) 實體隔離，避免顯影鹼液氣體污染光阻，保障微影良率。",assetPath:N.machines.track_dual.path},{modelId:"track_clean",name:"多工位精密 Clean Track",category:"TRACK",tier:4,price:3e7,throughputWpm:75,description:"多旋塗室並聯，高速熱板陣列，建議為先進微影機配備 2 台以上！",scienceNote:"配置多組 Coater/Developer 模組與快速溫控熱板，支援化學增幅光阻嚴苛的曝光後烘烤 (PEB) 溫度控制。",assetPath:N.machines.track_clean.path},{modelId:"track_advanced",name:"先進極限分子級 Track",category:"TRACK",tier:6,price:25e7,throughputWpm:160,description:"分子級膜厚控制，完美適配 EUV 超薄金屬氧化物光阻 (MOR)。",scienceNote:"具備超微量旋塗技術與化學氣相沉積底膜 (Underlayer)，將光阻粗糙度 (LWR) 降至分子級極限。",assetPath:N.machines.track_advanced.path},{modelId:"film_furnace",name:"高溫熱氧化爐管 (Horizontal Furnace)",category:"FILM",tier:1,price:18e5,throughputWpm:12,description:"利用 1000°C 高溫水汽使矽表面長出堅硬均勻的二氧化矽 (SiO2) 絕緣保護層。",scienceNote:"利用高純度氧氣或水蒸氣在高溫下與矽晶圓反應：Si + O2 -> SiO2，生長厚度均勻的高品質絕緣氧化層。",assetPath:N.machines.film_furnace.path},{modelId:"film_pecvd",name:"電漿增強化學氣相沉積機 (PECVD / ALD)",category:"FILM",tier:4,price:25e6,throughputWpm:110,description:"利用電漿在低溫下快速沉積氮化矽、金屬介電質，並支援原子層沉積 (ALD)。",scienceNote:"以射頻電漿解離前驅氣體，可在較低溫度 (300°C) 下沉積薄膜，避免破壞底層已摻雜之電晶體結構。",assetPath:N.machines.film_pecvd.path},{modelId:"etch_wet",name:"濕式酸槽清洗台 (Wet Chemical Bench)",category:"ETCH",tier:1,price:15e5,throughputWpm:12,description:"利用氫氟酸 (HF) 與化學酸液浸泡溶解未受光阻保護之薄膜，等向性腐蝕。",scienceNote:"化學濕法腐蝕屬於等向性蝕刻 (Isotropic)，容易產生側向掏空 (Undercut)，適合 3µm 以上粗線寬。",assetPath:N.machines.etch_wet.path},{modelId:"etch_plasma",name:"電漿乾式蝕刻機 (RIE / ICP-RIE)",category:"ETCH",tier:3,price:28e6,throughputWpm:50,description:"以高能反應離子轟擊進行垂直非等向性蝕刻，線條邊緣垂直銳利！",scienceNote:"反應性離子蝕刻 (RIE) 結合物理離子轟擊與化學自由基反應，具備極高垂直各向異性 (Anisotropic)，是次微米微影的關鍵搭檔。",assetPath:N.machines.etch_plasma.path},{modelId:"diff_furnace",name:"熱擴散摻雜爐管 (Thermal Diffusion)",category:"DIFF",tier:1,price:2e6,throughputWpm:10,description:"將磷或硼蒸氣高溫擴散滲透進矽晶格中，形成 N 型與 P 型半導體通道。",scienceNote:"利用高溫晶格熱運動使雜質原子由高濃度向低濃度擴散，控溫容易但橫向擴散量大。",assetPath:N.machines.diff_furnace.path},{modelId:"diff_implanter",name:"大束流離子佈植機 (Ion Implanter)",category:"DIFF",tier:2,price:15e6,throughputWpm:20,description:"將雜質原子電離成高能離子束，如子彈般精確轟擊打入矽晶圓特定深度。",scienceNote:"高壓電場加速磷/砷/硼離子束，可獨立精確控制植入劑量與深度，無橫向擴散失真，是現代電晶體的核心技術。",assetPath:N.machines.diff_implanter.path},{modelId:"cmp_polisher",name:"化學機械平坦化研磨機 (CMP Polisher)",category:"CMP",tier:3,price:2e7,throughputWpm:40,description:"化學研磨液搭配高速研磨墊，將晶圓表面磨至分子級平坦，解鎖多層金屬佈線！",scienceNote:"利用研磨液 (Slurry) 的化學腐蝕軟化與奈米磨料的機械研磨，實現全晶圓奈米級全域平坦化 (Global Planarization)。",assetPath:N.machines.cmp_polisher.path}]);const V=class V{static show(t,e){const s=document.getElementById("modal-container");s&&(j.checkMarketCandidatesExpiry(t),this.timerId&&(clearInterval(this.timerId),this.timerId=null),this.timerId=window.setInterval(()=>{if(!document.getElementById("modal-backdrop-hr")){V.timerId&&(clearInterval(V.timerId),V.timerId=null);return}const a=j.checkMarketCandidatesExpiry(t);V.activeTab==="MARKET"&&(a?(e(),V.render(s,t,e)):V.updateMarketTimers(t))},1e3),this.render(s,t,e))}static updateMarketTimers(t){const e=t.marketCandidates||[],s=Date.now();e.forEach((i,r)=>{const n=document.getElementById(`candidate-timer-${r}`);if(n){const d=Math.max(0,Math.ceil(((i.marketExpiresAt||0)-s)/1e3));n.textContent=d>0?`⏳ 剩餘考慮: ${d}s`:"⌛ 即將換人"}});const a=document.getElementById("market-respawn-countdown");if(a&&t.nextCandidateRespawnTime){const i=Math.max(0,Math.ceil((t.nextCandidateRespawnTime-s)/1e3));a.textContent=i>0?`${i}s`:"即將抵達"}}static render(t,e,s){var n;const a=e.staff.reduce((d,l)=>d+l.salary,0),i=((n=e.staff[0])==null?void 0:n.shiftMode)||"WEEKEND_REST",r=e.marketCandidates||[];t.innerHTML=`
      <div id="modal-backdrop-hr" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-5xl max-h-[92vh] flex flex-col text-slate-100 p-0 overflow-hidden">
          
          <!-- Header -->
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80 flex-shrink-0">
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
                  嚴格分離【製程整合 PIE】全廠訂單統籌與【模組設備工程師】機台駐守維修，靈活排班消除疲勞！
                </p>
              </div>
            </div>

            <button id="btn-close-hr" class="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono text-base transition-colors" title="關閉人資中心">
              ✕
            </button>
          </div>

          <!-- Shift & Payroll Banner -->
          <div class="px-6 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs flex-shrink-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-slate-400 font-semibold">廠區現行輪班制度:</span>
              <span class="px-2.5 py-1 rounded-lg font-bold font-mono border ${i==="WEEKEND_REST"?"bg-emerald-500/20 text-emerald-300 border-emerald-500/40":i==="TWO_ON_TWO_OFF"?"bg-sky-500/20 text-sky-300 border-sky-500/40":i==="THREE_SHIFT"?"bg-purple-500/20 text-purple-300 border-purple-500/40":"bg-amber-500/20 text-amber-300 border-amber-500/40"}">
                ${i==="WEEKEND_REST"?"🏖️ 週休二日制 (六日全員自動排休消疲勞)":i==="TWO_ON_TWO_OFF"?"🔄 四班二輪 (做二休二，台積電高彈性常態)":i==="THREE_SHIFT"?"🛡️ 三班制 (24H 在線 TPM 零故障防護)":"⚡ 兩班制 (節省 33% 薪水，疲勞累積快)"}
              </span>
            </div>

            <div class="flex items-center gap-4">
              <div>
                <span class="text-slate-400">每月人事薪資總額: </span>
                <span class="font-mono font-bold text-amber-300">NT$ ${a.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <!-- Navigation Tabs -->
          <div class="flex items-center border-b border-slate-700/60 bg-slate-900/40 px-6 pt-2 flex-shrink-0">
            <button
              id="tab-staff"
              class="px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${this.activeTab==="STAFF"?"border-purple-400 text-purple-300":"border-transparent text-slate-400 hover:text-slate-200"}"
            >
              <span>🧑‍🔬 全部員工職務</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">${e.staff.length}</span>
            </button>
            <button
              id="tab-schedule"
              class="px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${this.activeTab==="SCHEDULE"?"border-purple-400 text-purple-300":"border-transparent text-slate-400 hover:text-slate-200"}"
            >
              <span>📅 廠務排班與休假</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">${e.staff.length}人排班</span>
            </button>
            <button
              id="tab-market"
              class="px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${this.activeTab==="MARKET"?"border-purple-400 text-purple-300":"border-transparent text-slate-400 hover:text-slate-200"}"
            >
              <span>🤝 人才招募市場</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-purple-400">${r.length} / 6</span>
            </button>

            ${this.activeTab==="MARKET"?`
              <button id="btn-headhunter-refresh" class="ml-auto btn-sci-fi text-[11px] py-1 px-3 my-1 bg-purple-900/50 hover:bg-purple-800/60 border-purple-500/40 text-purple-200 font-bold" title="花費 NT$ 50,000 立即更換全批 6 位候選人">
                👔 派遣高階獵人頭顧問 (付費換批 NT$ 50,000)
              </button>
            `:""}
          </div>

          <!-- Body -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4">
            ${this.activeTab==="STAFF"?this.renderStaffTab(e):this.activeTab==="SCHEDULE"?this.renderScheduleTab(e):this.renderMarketTab(e)}
          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-between px-6 flex-shrink-0">
            <div class="text-[11px] text-slate-400">
              💡 提示：排休狀態 (OFF) 之員工疲勞消退速率高達 <strong class="text-emerald-300 font-mono">-2.0%/s</strong>，約 40 秒即可由全滿降至 0%！
            </div>
            <button id="btn-back-hr" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s)}static renderScheduleTab(t){var l;if(t.staff.length===0)return`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">📅</div>
          <p class="text-sm">廠內目前尚未招募任何員工，無法進行排班！請先前往「人才招募市場」進行招聘。</p>
        </div>
      `;const e=((l=t.staff[0])==null?void 0:l.shiftMode)||"WEEKEND_REST",s=j.isWeekend(),a=t.staff.filter(o=>(o.workShift||"DAY")==="DAY").length,i=t.staff.filter(o=>o.workShift==="SWING").length,r=t.staff.filter(o=>o.workShift==="NIGHT").length,n=t.staff.filter(o=>o.workShift==="OFF").length,d=a>0&&i>0&&r>0;return`
      <div class="space-y-4">
        <!-- 輪班機制切換卡片 (4 大排班制度) -->
        <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="text-xs font-bold text-slate-300">選擇晶圓廠輪班體系 (套用至全廠同仁)：</span>
            <span class="text-[11px] text-slate-400">系統即時判定排班與體力消耗規則</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <!-- 1. 週休二日制 -->
            <button
              class="btn-select-shift-mode p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${e==="WEEKEND_REST"?"bg-emerald-950/60 border-emerald-500/70 shadow-lg shadow-emerald-500/10":"bg-slate-950/70 border-slate-800 hover:border-slate-700"}"
              data-mode="WEEKEND_REST"
            >
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold ${e==="WEEKEND_REST"?"text-emerald-300":"text-slate-200"}">🏖️ 週休二日制</span>
                  ${e==="WEEKEND_REST"?'<span class="text-[10px] text-emerald-400 font-bold">現行</span>':""}
                </div>
                <div class="text-[11px] text-slate-400 mt-1">
                  週六與週日全廠強制排休，疲勞以 <strong class="text-emerald-300">-2.0%/s</strong> 歸零恢復！平日正常三班均衡值勤。
                </div>
              </div>
              <div class="text-[10px] text-emerald-400/80 font-mono mt-2 pt-1 border-t border-slate-800/80">
                勞基法首選・疲勞自癒防炸機
              </div>
            </button>

            <!-- 2. 四班二輪制 -->
            <button
              class="btn-select-shift-mode p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${e==="TWO_ON_TWO_OFF"?"bg-sky-950/60 border-sky-500/70 shadow-lg shadow-sky-500/10":"bg-slate-950/70 border-slate-800 hover:border-slate-700"}"
              data-mode="TWO_ON_TWO_OFF"
            >
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold ${e==="TWO_ON_TWO_OFF"?"text-sky-300":"text-slate-200"}">🔄 四班二輪制</span>
                  ${e==="TWO_ON_TWO_OFF"?'<span class="text-[10px] text-sky-400 font-bold">現行</span>':""}
                </div>
                <div class="text-[11px] text-slate-400 mt-1">
                  做二休二日夜輪替，兩組人員常態交換休假與值班，兼顧 24H 連續運轉與規律消疲勞。
                </div>
              </div>
              <div class="text-[10px] text-sky-400/80 font-mono mt-2 pt-1 border-t border-slate-800/80">
                半導體標竿・台積電常態輪調
              </div>
            </button>

            <!-- 3. 三班制 24H 在線 -->
            <button
              class="btn-select-shift-mode p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${e==="THREE_SHIFT"?"bg-purple-950/60 border-purple-500/70 shadow-lg shadow-purple-500/10":"bg-slate-950/70 border-slate-800 hover:border-slate-700"}"
              data-mode="THREE_SHIFT"
            >
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold ${e==="THREE_SHIFT"?"text-purple-300":"text-slate-200"}">🛡️ 三班制 24H</span>
                  ${e==="THREE_SHIFT"?'<span class="text-[10px] text-purple-400 font-bold">現行</span>':""}
                </div>
                <div class="text-[11px] text-slate-400 mt-1">
                  早中夜三班完整無縫覆蓋，只要駐廠工程師職級符合且疲勞 &lt; 50%，達成在線 TPM 零故障！
                </div>
              </div>
              <div class="text-[10px] text-purple-400/80 font-mono mt-2 pt-1 border-t border-slate-800/80">
                產能極致・需足夠人手輪替
              </div>
            </button>

            <!-- 4. 兩班制 節流 -->
            <button
              class="btn-select-shift-mode p-3 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${e==="TWO_SHIFT"?"bg-amber-950/60 border-amber-500/70 shadow-lg shadow-amber-500/10":"bg-slate-950/70 border-slate-800 hover:border-slate-700"}"
              data-mode="TWO_SHIFT"
            >
              <div>
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold ${e==="TWO_SHIFT"?"text-amber-300":"text-slate-200"}">⚡ 兩班制 (省 33%)</span>
                  ${e==="TWO_SHIFT"?'<span class="text-[10px] text-amber-400 font-bold">現行</span>':""}
                </div>
                <div class="text-[11px] text-slate-400 mt-1">
                  節省 33% 員工薪資支出，僅值早班與中班，大夜班無人看管，疲勞累積較快。
                </div>
              </div>
              <div class="text-[10px] text-amber-400/80 font-mono mt-2 pt-1 border-t border-slate-800/80">
                草創省錢・注意機台磨損
              </div>
            </button>
          </div>
        </div>

        <!-- 週末休假與 24H 覆蓋狀態橫幅 -->
        ${e==="WEEKEND_REST"&&s?`
              <div class="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/70 flex items-center justify-between gap-3 text-xs text-emerald-200 animate-pulse">
                <div class="flex items-center gap-2.5">
                  <span class="text-2xl">🏖️</span>
                  <div>
                    <span class="font-bold text-sm text-emerald-300">【週末公休日】週休二日制生效中！</span>
                    <div class="text-[11px] text-emerald-300/80 mt-0.5">全體同仁自動進入強制休假狀態，疲勞正以極速 <strong class="text-white font-mono">-2.0%/s</strong> 消除回血中。</div>
                  </div>
                </div>
                <span class="px-2.5 py-1 rounded bg-emerald-900 border border-emerald-400 text-xs font-mono font-bold text-white flex-shrink-0">
                  週六 / 週日公休中
                </span>
              </div>
            `:""}

        <div class="p-4 rounded-xl bg-slate-900/90 border ${d?"border-emerald-500/50 bg-emerald-950/20":"border-amber-500/40 bg-amber-950/10"} flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-base">${d?"🛡️":"⚠️"}</span>
              <span class="text-sm font-bold ${d?"text-emerald-300":"text-amber-300"}">
                ${d?"全廠 24H 輪班完整覆蓋 (維持 TPM 零故障在線保證)":"全廠 24H 輪班存在時段空窗 (缺乏工程師在線看管)"}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              ${d?"早班、中班與大夜班均有人員駐守，只要機台專長職等符合且疲勞 < 50%，即可維持 0% 故障率！":"注意：若某班別缺少駐廠工程師，該時段機台將無法享受在線預防保養，磨損率將正常累積！"}
            </p>
          </div>

          <!-- 各班人數統計膠囊 -->
          <div class="flex items-center gap-2 text-xs font-mono flex-wrap">
            <span class="px-2.5 py-1 rounded-lg bg-sky-950 text-sky-300 border border-sky-500/30">
              ☀️ 早班: ${a}
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/30">
              🌆 中班: ${i}
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-500/30">
              🌙 夜班: ${r}
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-500/30">
              🏖️ 排休: ${n}
            </span>
          </div>
        </div>

        <!-- 快捷一鍵排班與舒壓福利操作欄 -->
        <div class="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
          <span class="text-slate-400 font-medium">全廠快捷排班與疲勞消除輔助：</span>
          <div class="flex items-center gap-2 flex-wrap">
            <button id="btn-preset-balanced" class="btn-sci-fi text-xs py-1 px-3 bg-cyan-900/50 hover:bg-cyan-800/60 border-cyan-500/40">
              🔄 一鍵均衡三班
            </button>
            <button id="btn-preset-day-only" class="btn-sci-fi text-xs py-1 px-3 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300">
              ☀️ 一鍵集中早班
            </button>
            <button id="btn-preset-tpm-opt" class="btn-sci-fi text-xs py-1 px-3 bg-emerald-900/50 hover:bg-emerald-800/60 border-emerald-500/40 text-emerald-200 font-bold">
              🛡️ TPM 最佳化排班
            </button>
            <button id="btn-all-off" class="btn-sci-fi text-xs py-1 px-3 bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/60 text-emerald-300 font-bold" title="將全體員工排定為排休狀態，迅速消除疲勞">
              🏖️ 一鍵全員排休
            </button>
            <button id="btn-company-wellness" class="btn-sci-fi text-xs py-1 px-3 bg-amber-950/80 hover:bg-amber-900 border-amber-500/60 text-amber-200 font-bold" title="撥發全員紓壓津貼 (NT$ 2,000/人)，立即消除全員 25% 疲勞度">
              💆 撥發全員舒壓福利 (NT$ ${(t.staff.length*2e3).toLocaleString()})
            </button>
          </div>
        </div>

        <!-- 全體員工手動班表矩陣 (修正 flex-wrap 確保排休按鈕永不被遮蔽) -->
        <div class="space-y-2.5">
          ${t.staff.map(o=>{const p=o.workShift||"DAY",c=t.machines.find(h=>h.id===o.assignedMachineId);return`
              <div class="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                    🧑‍🔬
                  </div>
                  <div>
                    <div class="flex items-center gap-2 flex-wrap">
                      <span class="font-bold text-white text-sm">${o.name}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        ${o.rank}
                      </span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono ${o.moduleSpecialty==="PIE"?"bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold":"bg-cyan-500/20 text-cyan-300"}">
                        ${o.moduleSpecialty==="PIE"?"👨‍💼 製程整合 PIE":o.moduleSpecialty}
                      </span>
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono flex-wrap">
                      <span>崗位: <strong class="text-slate-200">${o.moduleSpecialty==="PIE"?"全廠合約訂單":c?c.name:"待命未指派"}</strong></span>
                      <span>|</span>
                      <span>疲勞度: <strong class="${o.fatigue>=60?"text-red-400 font-bold animate-pulse":o.fatigue>=30?"text-amber-400":"text-emerald-400"}">${Math.round(o.fatigue)}%</strong></span>
                      ${o.fatigue>=60?'<span class="text-[10px] text-red-400 font-bold">⚠️ 極度疲倦！建議安排休假</span>':""}
                    </div>
                  </div>
                </div>

                <!-- 手動班別與帶薪休假按鈕組 (含 flex-wrap 與個別休假消疲勞) -->
                <div class="flex flex-wrap items-center gap-1.5 w-full md:w-auto justify-start md:justify-end">
                  <button
                    class="btn-paid-leave px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 transition-all cursor-pointer flex items-center gap-1"
                    data-staff-id="${o.id}"
                    title="支付 NT$ 3,000 帶薪休假津貼，立即消除 40% 疲勞並轉入排休狀態"
                  >
                    <span>☕ 帶薪休假 (-40% 疲勞 / NT$ 3,000)</span>
                  </button>

                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${p==="DAY"?"bg-sky-600 text-white shadow-md shadow-sky-500/30 border border-sky-400":"bg-slate-950 text-slate-400 hover:text-white border border-slate-800"}"
                    data-staff-id="${o.id}"
                    data-shift="DAY"
                    title="早班: 07:00 ~ 15:00 (常規疲勞速率)"
                  >
                    ☀️ 早班 (07-15)
                  </button>
                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${p==="SWING"?"bg-amber-600 text-white shadow-md shadow-amber-500/30 border border-amber-400":"bg-slate-950 text-slate-400 hover:text-white border border-slate-800"}"
                    data-staff-id="${o.id}"
                    data-shift="SWING"
                    title="中班: 15:00 ~ 23:00 (常規疲勞速率)"
                  >
                    🌆 中班 (15-23)
                  </button>
                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${p==="NIGHT"?"bg-indigo-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-400":"bg-slate-950 text-slate-400 hover:text-white border border-slate-800"}"
                    data-staff-id="${o.id}"
                    data-shift="NIGHT"
                    title="夜班: 23:00 ~ 07:00 (大夜班需充足輪調)"
                  >
                    🌙 夜班 (23-07)
                  </button>
                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${p==="OFF"?"bg-emerald-600 text-white shadow-md shadow-emerald-500/30 border border-emerald-400 font-bold":"bg-slate-950 text-emerald-400 hover:text-white border border-slate-800"}"
                    data-staff-id="${o.id}"
                    data-shift="OFF"
                    title="排休: 暫停進駐機台，快速恢復體力 (-2.0%/s) 歸零疲勞"
                  >
                    🏖️ 排休 (OFF)
                  </button>
                </div>
              </div>
            `}).join("")}
        </div>
      </div>
    `}static renderStaffTab(t){return t.staff.length===0?`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">👥</div>
          <p class="text-sm">廠內目前尚未招募任何工程師，請前往「人才招募市場」進行招聘！</p>
        </div>
      `:`
      <div class="space-y-3">
        ${t.staff.map(e=>{const s=e.moduleSpecialty==="PIE",a=t.machines.find(n=>n.id===e.assignedMachineId);let i=!1,r=!1;return!s&&a&&(i=X.checkTPMConditions(a,e).isTPMActive,r=X.checkExplosionRisk(a,e).hasRisk),`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${r?"border-red-600/60 bg-red-950/10":i?"border-amber-500/50 bg-amber-950/10":"border-slate-800"} flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
              <!-- Info -->
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl flex-shrink-0">
                  🧑‍🔬
                </div>
                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-white">${e.name}</span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      ${e.rank}
                    </span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono ${s?"bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold":"bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"}">
                      ${s?"👨‍💼 製程整合 PIE":"模組專長: "+e.moduleSpecialty}
                    </span>
                  </div>

                  <div class="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                    <span>核定月薪: NT$ ${e.salary.toLocaleString()}</span>
                    <span>|</span>
                    <span>疲勞度: <strong class="${e.fatigue>=60?"text-red-400":"text-emerald-400"}">${Math.round(e.fatigue)}%</strong></span>
                    <span>|</span>
                    <span>班別: <strong class="text-slate-200">${e.workShift||"DAY"}</strong></span>
                  </div>
                </div>
              </div>

              <!-- Machine Assignment Dropdown OR PIE Badge (徹底分離) -->
              <div class="flex flex-col gap-1 w-full md:w-72">
                ${s?`
                      <label class="text-[10px] text-indigo-400 font-bold">職責崗位 (全廠跨站點整合):</label>
                      <div class="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-xs text-indigo-200 flex items-start gap-2">
                        <span class="text-base flex-shrink-0">👨‍💼</span>
                        <div>
                          <div class="font-bold text-indigo-300">製程整合 (PIE) 全廠統籌</div>
                          <div class="text-[10px] text-slate-300 mt-0.5">
                            專責全廠工藝良率與進度提升，請至【訂單中心】指派此工程師。不進駐單一機台。
                          </div>
                        </div>
                      </div>
                    `:`
                      <label class="text-[10px] text-slate-400 flex items-center justify-between">
                        <span>進駐機台指派 (模組維護調校):</span>
                        <span class="text-[10px] text-cyan-400/90 font-mono">支援交換崗位</span>
                      </label>
                      <select class="select-machine select-sci-fi text-xs py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200" data-staff-id="${e.id}">
                        <option value="">-- 未指派機台 (待命/休假) --</option>
                        ${t.machines.map(n=>{const d=n.category===e.moduleSpecialty,l=e.assignedMachineId===n.id,o=n.assignedEngineerId&&n.assignedEngineerId!==e.id?t.staff.find(h=>h.id===n.assignedEngineerId):null;let p="🟢 [機台空置]",c="";return l?p="🔵 [目前進駐]":o&&(p=`🔄 [已由 ${o.name} 進駐]`,c=" ➔ 選取將交換崗位"),`
                            <option value="${n.id}" ${l?"selected":""}>
                              ${p} ${n.name} (${n.category} T${n.tier}) ${d?"★專長吻合":""}${c}
                            </option>
                          `}).join("")}
                      </select>

                      ${i?`
                        <div class="text-[11px] text-amber-300 font-semibold flex items-center gap-1 mt-0.5">
                          <span>🛡️</span>
                          <span>TPM 24H 零故障在線維護保證中！</span>
                        </div>
                      `:""}
                      ${r?`
                        <div class="text-[11px] text-red-400 font-bold flex items-center gap-1 mt-0.5 animate-pulse">
                          <span>💥</span>
                          <span>越級操作！存在 25% 炸機風險！</span>
                        </div>
                      `:""}
                    `}
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
    `}static renderMarketTab(t){const e=t.marketCandidates||[];return`
      <div class="space-y-4">
        <!-- 人才市場機制資訊欄 -->
        <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-slate-300 font-bold">🤝 晶圓人才招募看板</span>
            <span class="text-slate-400">| 當前求職市場公開候選人: <strong class="text-purple-300 font-mono">${e.length} / 6</strong> 位</span>
            ${e.length<6&&t.nextCandidateRespawnTime?`
                  <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 font-mono">
                    ⏳ 下位求職者抵達倒數: <strong id="market-respawn-countdown">${Math.max(0,Math.ceil((t.nextCandidateRespawnTime-Date.now())/1e3))}s</strong>
                  </span>
                `:""}
          </div>
          <div class="text-[11px] text-slate-400">
            每位候選人皆有個人考慮倒數時效，逾期將轉赴其他半導體大廠！
          </div>
        </div>

        <!-- 6 名額人才候選人卡片網格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          ${e.map((s,a)=>{const i=t.player.cash>=s.signingBonus,r=Math.max(0,Math.ceil(((s.marketExpiresAt||0)-Date.now())/1e3)),n=s.moduleSpecialty==="PIE";return`
              <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between space-y-3">
                
                <!-- 標題與時效 -->
                <div>
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2.5">
                      <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                        🧑‍💻
                      </div>
                      <div>
                        <div class="font-bold text-white text-sm">${s.name}</div>
                        <div class="text-[11px] text-purple-300 font-semibold font-mono">${s.rank}</div>
                      </div>
                    </div>

                    <span class="px-2 py-0.5 rounded text-[10px] font-mono flex-shrink-0 ${n?"bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold":"bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"}">
                      ${n?"👨‍💼 製程整合 PIE":"模組: "+s.moduleSpecialty}
                    </span>
                  </div>

                  <!-- 倒數時效標籤 -->
                  <div class="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
                    <span id="candidate-timer-${a}" class="market-timer-badge px-2 py-0.5 rounded font-mono bg-slate-950 text-amber-300 border border-amber-500/30">
                      ${r>0?`⏳ 剩餘考慮: ${r}s`:"⌛ 即將換人"}
                    </span>
                    <span class="text-slate-400 font-mono">${n?"全廠跨站點整合":"機台駐守調機維護"}</span>
                  </div>
                </div>

                <!-- 描述 -->
                <div class="text-xs text-slate-300 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 min-h-[50px] flex items-center">
                  ${s.description}
                </div>

                <!-- 薪資條件 -->
                <div class="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                  <div>
                    <div class="text-[10px] text-slate-400">簽約獎金 (一次性)</div>
                    <div class="font-mono font-bold text-amber-300">NT$ ${s.signingBonus.toLocaleString()}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-[10px] text-slate-400">核定月薪</div>
                    <div class="font-mono font-semibold text-slate-200">NT$ ${s.salary.toLocaleString()} /月</div>
                  </div>
                </div>

                <!-- 聘任按鈕 -->
                <button
                  class="btn-hire-candidate btn-sci-fi w-full justify-center text-xs py-2 ${i?"":"opacity-50 cursor-not-allowed"}"
                  data-index="${a}"
                  ${i?"":"disabled"}
                >
                  ${i?`🤝 簽約聘任 (支付 NT$ ${s.signingBonus.toLocaleString()})`:"資金不足以支付簽約金"}
                </button>
              </div>
            `}).join("")}
        </div>
      </div>
    `}static bindEvents(t,e,s){var r,n,d,l,o,p,c,h,m,u,f,g;const a=()=>{b.playClick(),V.timerId&&(clearInterval(V.timerId),V.timerId=null),t.innerHTML="",window.removeEventListener("keydown",i)},i=v=>{v.key==="Escape"&&a()};window.addEventListener("keydown",i),(r=document.getElementById("btn-close-hr"))==null||r.addEventListener("click",a),(n=document.getElementById("btn-back-hr"))==null||n.addEventListener("click",a),(d=document.getElementById("modal-backdrop-hr"))==null||d.addEventListener("click",v=>{v.target===document.getElementById("modal-backdrop-hr")&&a()}),(l=document.getElementById("tab-staff"))==null||l.addEventListener("click",()=>{b.playClick(),this.activeTab="STAFF",this.render(t,e,s)}),(o=document.getElementById("tab-schedule"))==null||o.addEventListener("click",()=>{b.playClick(),this.activeTab="SCHEDULE",this.render(t,e,s)}),(p=document.getElementById("tab-market"))==null||p.addEventListener("click",()=>{b.playClick(),this.activeTab="MARKET",this.render(t,e,s)}),t.querySelectorAll(".btn-select-shift-mode").forEach(v=>{v.addEventListener("click",y=>{const x=y.currentTarget.getAttribute("data-mode");x&&(b.playClick(),j.applyShiftMode(e,x),s(),this.render(t,e,s))})}),(c=document.getElementById("btn-preset-balanced"))==null||c.addEventListener("click",()=>{b.playClick();const v=["DAY","SWING","NIGHT"];e.staff.forEach((y,x)=>{y.workShift=v[x%3]}),s(),this.render(t,e,s)}),(h=document.getElementById("btn-preset-day-only"))==null||h.addEventListener("click",()=>{b.playClick(),e.staff.forEach(v=>{v.workShift="DAY"}),s(),this.render(t,e,s)}),(m=document.getElementById("btn-preset-tpm-opt"))==null||m.addEventListener("click",()=>{b.playClick();const v=["DAY","SWING","NIGHT"];let y=0;e.staff.forEach(x=>{x.fatigue>=60?x.workShift="OFF":(x.workShift=v[y%3],y++)}),s(),this.render(t,e,s)}),(u=document.getElementById("btn-all-off"))==null||u.addEventListener("click",()=>{b.playClick(),e.staff.forEach(v=>{v.workShift="OFF"}),s(),this.render(t,e,s)}),(f=document.getElementById("btn-company-wellness"))==null||f.addEventListener("click",v=>{if(e.staff.length===0)return;const x=e.staff.length*2e3;if(e.player.cash<x){alert(`資金不足！撥發全員舒壓福利需 NT$ ${x.toLocaleString()}`);return}e.player.cash-=x,A.recordLaborCost(e,x),Q.trigger(-x,v.currentTarget),b.playCoinChime(),e.staff.forEach(w=>{w.fatigue=Math.max(0,w.fatigue-25)}),s(),this.render(t,e,s)}),t.querySelectorAll(".btn-paid-leave").forEach(v=>{v.addEventListener("click",y=>{const x=y.currentTarget.getAttribute("data-staff-id"),w=e.staff.find(C=>C.id===x);if(!w)return;const T=3e3;if(e.player.cash<T){alert("資金不足，無法支付個人帶薪休假津貼 (需 NT$ 3,000)！");return}e.player.cash-=T,A.recordLaborCost(e,T),Q.trigger(-T,y.currentTarget),b.playCoinChime(),w.fatigue=Math.max(0,w.fatigue-40),w.workShift="OFF",s(),this.render(t,e,s)})}),t.querySelectorAll(".btn-shift-select").forEach(v=>{v.addEventListener("click",y=>{const x=y.currentTarget,w=x.getAttribute("data-staff-id"),T=x.getAttribute("data-shift"),C=e.staff.find(M=>M.id===w);!C||!T||(C.workShift=T,b.playClick(),s(),this.render(t,e,s))})}),(g=document.getElementById("btn-headhunter-refresh"))==null||g.addEventListener("click",v=>{if(e.player.cash<5e4){alert(`資金不足！派遣高階獵人頭顧問需 NT$ ${5e4.toLocaleString()}`);return}e.player.cash-=5e4,A.recordLaborCost(e,5e4),Q.trigger(-5e4,v.currentTarget),b.playCoinChime(),j.forceRefreshAllCandidates(e),s(),this.render(t,e,s)}),t.querySelectorAll(".btn-hire-candidate").forEach(v=>{v.addEventListener("click",y=>{var P;const x=parseInt(y.currentTarget.getAttribute("data-index")||"0",10),w=e.marketCandidates||[],T=w[x];if(!T)return;if(e.player.cash<T.signingBonus){alert("資金不足，無法支付簽約獎金！");return}e.player.cash-=T.signingBonus,A.recordSigningBonus(e,T.signingBonus),Q.trigger(-T.signingBonus,y.currentTarget),b.playCoinChime();const C=((P=e.staff[0])==null?void 0:P.shiftMode)||"WEEKEND_REST",M={id:`STF-${Date.now().toString(36).toUpperCase().slice(-5)}`,name:T.name,rank:T.rank,moduleSpecialty:T.moduleSpecialty,fatigue:15,shiftMode:C,workShift:"DAY",assignedMachineId:null,salary:T.salary};e.staff.push(M),w.splice(x,1),e.nextCandidateRespawnTime||(e.nextCandidateRespawnTime=Date.now()+j.REPLENISH_COOLDOWN_MS),F.checkAchievements(e),s(),this.activeTab="STAFF",this.render(t,e,s)})}),t.querySelectorAll(".select-machine").forEach(v=>{v.addEventListener("change",y=>{const x=y.currentTarget.getAttribute("data-staff-id"),w=y.currentTarget.value||null,T=e.staff.find(P=>P.id===x);if(!T)return;const C=T.assignedMachineId,M=C?e.machines.find(P=>P.id===C):null;if(!w)T.assignedMachineId=null,M&&M.assignedEngineerId===T.id&&(M.assignedEngineerId=null);else{const P=e.machines.find(O=>O.id===w);if(P){const O=e.staff.find(I=>I.assignedMachineId===w&&I.id!==x);O&&M&&M.id!==P.id?(O.assignedMachineId=M.id,M.assignedEngineerId=O.id):O?O.assignedMachineId=null:M&&M.id!==P.id&&(M.assignedEngineerId=null),T.assignedMachineId=P.id,P.assignedEngineerId=T.id,q.onMachineMaintained(e.questState)}}b.playClick(),F.checkAchievements(e),$.saveToLocalStorage(e),s(),this.render(t,e,s)})}),t.querySelectorAll(".btn-fire-staff").forEach(v=>{v.addEventListener("click",y=>{const x=y.currentTarget.getAttribute("data-staff-id"),w=e.staff.findIndex(C=>C.id===x);if(w===-1)return;const T=e.staff[w];if(confirm(`確定要資遣工程師【${T.name}】嗎？`)){if(T.assignedMachineId){const C=e.machines.find(M=>M.id===T.assignedMachineId);C&&(C.assignedEngineerId=null)}e.staff.splice(w,1),b.playClick(),s(),this.render(t,e,s)}})})}};E(V,"activeTab","STAFF"),E(V,"timerId",null);let fe=V;class de{static getSpeedMultiplier(){return this.speedMultiplier}static init(t,e,s){const a=new URLSearchParams(window.location.search);(a.get("dev")==="true"||a.get("admin")==="foundry")&&this.toggle(t,e,s),window.addEventListener("keydown",r=>{r.ctrlKey&&r.shiftKey&&r.code==="KeyD"&&(r.preventDefault(),this.toggle(t,e,s))})}static toggle(t,e,s){this.isVisible=!this.isVisible;const a=document.getElementById("dev-console");if(a){if(!this.isVisible){a.innerHTML="";return}b.playClick(),this.render(a,t,e,s)}}static render(t,e,s,a){var i,r,n,d;t.innerHTML=`
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
    `,(i=document.getElementById("btn-dev-close"))==null||i.addEventListener("click",()=>{this.isVisible=!1,t.innerHTML=""}),document.querySelectorAll(".btn-speed").forEach(l=>{l.addEventListener("click",o=>{b.playClick();const p=Number(o.currentTarget.getAttribute("data-speed"));this.speedMultiplier=p,s(p),this.render(t,e,s,a)})}),(r=document.getElementById("btn-add-cash"))==null||r.addEventListener("click",()=>{e.player.cash+=5e7,b.playCoin(),a()}),(n=document.getElementById("btn-trigger-wear"))==null||n.addEventListener("click",()=>{for(const l of e.machines)l.wear=Math.min(100,l.wear+50),l.wear>=80&&(l.status="MAINTENANCE");b.playWarning(),a()}),(d=document.getElementById("btn-reset-save"))==null||d.addEventListener("click",()=>{confirm("確定要清空本地存檔並重置遊戲嗎？")&&(localStorage.clear(),window.location.reload())})}}E(de,"isVisible",!1),E(de,"speedMultiplier",1);const ae=class ae{static show(t,e,s){const a=document.getElementById("modal-container");a&&(s!==void 0&&(this.currentStep=s),this.render(a,t,e))}static isCompleted(t){var e;return((e=t==null?void 0:t.player)==null?void 0:e.tutorialCompleted)!==void 0?t.player.tutorialCompleted:t!=null&&t.userId?localStorage.getItem(`silicon_tycoon_tutorial_completed_${t.userId}`)==="true":!1}static markCompleted(t){t!=null&&t.player&&(t.player.tutorialCompleted=!0),t!=null&&t.userId&&localStorage.setItem(`silicon_tycoon_tutorial_completed_${t.userId}`,"true"),localStorage.setItem("silicon_tycoon_tutorial_completed","true")}static render(t,e,s){const a=this.currentStep,i=[{stepNum:1,badge:"🚀 歡迎創辦人",title:"歡迎來到《Silicon Tycoon: 矽島霸權》",icon:"🏭",content:`
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
        `,btnPrimaryText:"🎉 完成新手引導，稱霸矽島！",btnPrimaryAction:"finish"}],r=i[a]||i[0];t.innerHTML=`
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
            ${i.map((n,d)=>`
              <div class="h-1.5 rounded-full transition-all duration-300 ${d===a?"w-8 bg-cyan-400":d<a?"w-3 bg-emerald-400":"w-3 bg-slate-700"}"></div>
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
    `,this.bindEvents(t,e,s,r.btnPrimaryAction)}static bindEvents(t,e,s,a){var n,d,l,o,p;const i=()=>{b.playClick(),t.innerHTML="",ae.markCompleted(e),s()};(n=document.getElementById("btn-close-tutorial"))==null||n.addEventListener("click",i),(d=document.getElementById("btn-skip-tutorial-all"))==null||d.addEventListener("click",i);const r=t.querySelector(".modal-backdrop");r==null||r.addEventListener("click",c=>{c.target===r&&i()}),(l=document.getElementById("btn-tutorial-prev"))==null||l.addEventListener("click",()=>{b.playClick(),this.currentStep=Math.max(0,this.currentStep-1),this.render(t,e,s)}),(o=document.getElementById("btn-tutorial-skip-production"))==null||o.addEventListener("click",()=>{if(b.playFanfare(),e.activeLots.length>0)for(const c of e.activeLots)c.currentStation="DIFF",c.status="COMPLETED",c.yieldMultiplier=.96;else{const c=e.activeOrders.length>0?e.activeOrders[0].id:"starter_demo";e.activeLots.push({lotId:`LOT-${Date.now().toString().slice(-4)}`,orderId:c,waferCount:25,currentStation:"DIFF",currentLayer:3,totalLayers:3,qTimeDeadline:null,yieldMultiplier:.95,status:"COMPLETED"})}s(),this.currentStep=3,this.render(t,e,s)}),(p=document.getElementById("btn-tutorial-action"))==null||p.addEventListener("click",()=>{b.playClick(),a==="next"?(this.currentStep=Math.min(this.totalSteps-1,this.currentStep+1),this.render(t,e,s)):a==="open_contract"?(t.innerHTML="",le.show(e,()=>s())):a==="open_wafer_map"?(t.innerHTML="",ee.show(e,null,()=>s())):a==="finish"&&(ae.markCompleted(e),b.playFanfare(),t.innerHTML="",s())})}};E(ae,"currentStep",0),E(ae,"totalSteps",5);let se=ae;class ye{static show(t,e){const s=document.getElementById("modal-container");s&&(A.ensureFinancialState(t),this.render(s,t,e))}static render(t,e,s){const a=A.ensureFinancialState(e);let i=a.today,r=a.dailyHistory,n="日收支分析",l=`現實同步: 📅 ${a.currentDateStr||A.getTodayDateString()} (今日進行中)`;this.activeTab==="WEEK"?(i=a.thisWeek,r=a.weeklyHistory,n="周收支分析",l=`現實同步: 📅 本周累計 (${A.getWeekString()})`):this.activeTab==="MONTH"&&(i=a.thisMonth,r=a.monthlyHistory,n="月收支分析",l=`現實同步: 📅 本月累計 (${A.getMonthString()})`);const o=A.generateCFOAdvisory(i,e),p=A.calculateCompanyNetWorth(e);t.innerHTML=`
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
                    半導體財務報表中心 — ${n}
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
                  NT$ ${Math.round(i.revenue.totalRevenue).toLocaleString()}
                </div>
                <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                  出貨: NT$ ${Math.round(i.revenue.waferSales).toLocaleString()}
                </div>
              </div>

              <!-- 總營業支出 -->
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div class="text-[10px] text-slate-400 font-medium">總營業支出 (Total Expenses)</div>
                <div class="text-base font-black font-mono text-amber-300 mt-1">
                  NT$ ${Math.round(i.expenses.totalExpenses).toLocaleString()}
                </div>
                <div class="text-[10px] text-slate-500 font-mono mt-0.5">
                  折舊/水電/薪資/維護/資本
                </div>
              </div>

              <!-- 營業毛利與毛利率 -->
              <div class="p-3.5 rounded-xl bg-slate-900/80 border ${i.grossMarginPct>=53?"border-emerald-500/50 bg-emerald-950/20":"border-slate-800"}">
                <div class="text-[10px] text-slate-400 font-medium flex items-center justify-between">
                  <span>營業毛利率 (Gross Margin)</span>
                  ${i.grossMarginPct>=53?'<span class="text-[9px] text-emerald-400 font-bold">★TSMC標竿</span>':""}
                </div>
                <div class="text-base font-black font-mono ${i.grossMarginPct>=50?"text-emerald-400":i.grossMarginPct>=30?"text-cyan-300":"text-amber-400"} mt-1">
                  ${i.grossMarginPct}%
                </div>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                  毛利: NT$ ${Math.round(i.grossProfit).toLocaleString()}
                </div>
              </div>

              <!-- 淨利與淨利率 -->
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div class="text-[10px] text-slate-400 font-medium">營業淨利潤 (Net Profit)</div>
                <div class="text-base font-black font-mono ${i.netProfit>=0?"text-emerald-400":"text-red-400"} mt-1">
                  ${i.netProfit>=0?"+":""}NT$ ${Math.round(i.netProfit).toLocaleString()}
                </div>
                <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                  淨利率: ${i.netMarginPct}%
                </div>
              </div>
            </div>

            <!-- 收支結構明細表 (Detailed Breakdown Table) -->
            <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div class="flex items-center justify-between border-b border-slate-800 pb-2">
                <span class="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>📑</span>
                  <span>${i.label} — 收支會計明細科目</span>
                </span>
                <span class="text-[11px] font-mono text-slate-400">
                  期末留存現金: <strong class="text-amber-300">NT$ ${Math.round(i.endingCash).toLocaleString()}</strong>
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
                    <span class="font-bold text-slate-100">NT$ ${Math.round(i.revenue.waferSales).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>客戶 NRE 光罩開發款 (Mask Fees)</span>
                    <span class="font-bold text-slate-100">NT$ ${Math.round(i.revenue.nreFees).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>政府研發補助與成就獎勵 (Subsidies)</span>
                    <span class="font-bold text-slate-100">NT$ ${Math.round(i.revenue.subsidies).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-cyan-300 font-bold border-t border-slate-800 pt-1.5">
                    <span>營業收入總計 (Total Gross Revenue)</span>
                    <span>NT$ ${Math.round(i.revenue.totalRevenue).toLocaleString()}</span>
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
                    <span class="text-slate-200">NT$ ${Math.round(i.expenses.depreciation).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>設備日常保養與大修 (Maintenance)</span>
                    <span class="text-slate-200">NT$ ${Math.round(i.expenses.maintenance).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>超純水、特氣與無塵室電費 (Utilities)</span>
                    <span class="text-slate-200">NT$ ${Math.round(i.expenses.utilities).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>員工薪資與招募獎金 (Payroll & HR)</span>
                    <span class="text-slate-200">NT$ ${Math.round(i.expenses.payroll).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>晶圓不良報廢與重洗損失 (Scraps)</span>
                    <span class="text-slate-200">NT$ ${Math.round(i.expenses.scraps).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-slate-300">
                    <span>機台設備採購支出 (CapEx)</span>
                    <span class="text-slate-200">NT$ ${Math.round(i.expenses.capex).toLocaleString()}</span>
                  </div>
                  <div class="flex justify-between text-amber-300 font-bold border-t border-slate-800 pt-1.5">
                    <span>總營業支出總計 (Total Expenses)</span>
                    <span>NT$ ${Math.round(i.expenses.totalExpenses).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 歷史走勢長條圖 (Historical Bar Chart) -->
            <div class="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>📈</span>
                  <span>歷史${n}獲利趨勢走勢圖 (近 ${r.length+1} 期)</span>
                </span>
                <div class="flex items-center gap-3 text-[10px] font-mono">
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span> 營業收入</span>
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> 營業支出</span>
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> 淨獲利</span>
                </div>
              </div>

              <!-- 長條圖視覺容器 -->
              <div class="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-end justify-between gap-2 h-44 overflow-x-auto pt-4">
                ${this.renderHistoryBars([i,...r].slice(0,10).reverse())}
              </div>
            </div>

            <!-- 財務長 (CFO) 營運診斷評語 (Executive Advisory) -->
            <div class="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border ${o.rating==="EXCELLENT"?"border-emerald-500/60 bg-emerald-950/10":o.rating==="GOOD"?"border-cyan-500/50 bg-cyan-950/10":o.rating==="WARNING"?"border-amber-500/50 bg-amber-950/10":"border-red-500/60 bg-red-950/10"} flex items-start gap-3.5">
              <div class="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-2xl flex-shrink-0 shadow">
                🧑‍💼
              </div>
              <div class="space-y-1 text-xs">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white text-sm">${o.title}</span>
                  <span class="px-2 py-0.2 rounded text-[10px] font-mono ${o.rating==="EXCELLENT"?"bg-emerald-950 text-emerald-300 border border-emerald-500/40":o.rating==="GOOD"?"bg-cyan-950 text-cyan-300 border border-cyan-500/40":o.rating==="WARNING"?"bg-amber-950 text-amber-300 border border-amber-500/40":"bg-red-950 text-red-300 border border-red-500/40"}">
                    ${o.rating}
                  </span>
                </div>
                <p class="text-slate-300 leading-relaxed font-sans">
                  ${o.advice}
                </p>
                <div class="text-[11px] text-cyan-400 font-mono pt-0.5">
                  指標分析: ${o.metrics}
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
    `,this.bindEvents(t,e,s)}static renderHistoryBars(t){if(t.length===0)return'<div class="text-center w-full py-10 text-slate-500 text-xs font-mono">暫無足夠歷史數據，產線持續運轉中...</div>';const e=Math.max(...t.map(s=>Math.max(s.revenue.totalRevenue,s.expenses.totalExpenses,Math.abs(s.netProfit))),1e5);return t.map((s,a)=>{const i=a===t.length-1,r=Math.min(100,Math.max(4,Math.round(s.revenue.totalRevenue/e*100))),n=Math.min(100,Math.max(4,Math.round(s.expenses.totalExpenses/e*100))),d=Math.min(100,Math.max(4,Math.round(Math.abs(s.netProfit)/e*100)));return`
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
              style="height: ${n}%;"
              title="營業支出"
            ></div>
            <!-- 淨利柱 -->
            <div
              class="w-2.5 rounded-t ${s.netProfit>=0?"bg-emerald-500 group-hover:bg-emerald-400":"bg-red-500 group-hover:bg-red-400"} transition-all shadow-sm"
              style="height: ${d}%;"
              title="營業淨利"
            ></div>
          </div>

          <!-- Label -->
          <div class="text-[9px] font-mono mt-1 truncate max-w-full ${i?"text-cyan-400 font-bold":"text-slate-400"}">
            ${s.periodType==="DAY"?`D${s.periodIndex}`:s.periodType==="WEEK"?`W${s.periodIndex}`:`M${s.periodIndex}`}
            ${i?"*":""}
          </div>
        </div>
      `}).join("")}static bindEvents(t,e,s){var r,n,d,l,o,p;const a=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",i)},i=c=>{c.key==="Escape"&&a()};window.addEventListener("keydown",i),(r=document.getElementById("btn-close-finance"))==null||r.addEventListener("click",a),(n=document.getElementById("btn-back-finance"))==null||n.addEventListener("click",a),(d=document.getElementById("modal-backdrop-finance"))==null||d.addEventListener("click",c=>{c.target===document.getElementById("modal-backdrop-finance")&&a()}),(l=document.getElementById("tab-finance-day"))==null||l.addEventListener("click",()=>{b.playClick(),this.activeTab="DAY",this.render(t,e,s)}),(o=document.getElementById("tab-finance-week"))==null||o.addEventListener("click",()=>{b.playClick(),this.activeTab="WEEK",this.render(t,e,s)}),(p=document.getElementById("tab-finance-month"))==null||p.addEventListener("click",()=>{b.playClick(),this.activeTab="MONTH",this.render(t,e,s)})}}E(ye,"activeTab","DAY");class ie{static show(t,e,s=!0){const a=document.getElementById("modal-container");if(!a)return;const i=$.getActiveUserProfile();this.selectedUserId=i.id,this.isEditingName=!1,this.isCreatingUser=!1,this.render(a,t,e,s)}static render(t,e,s,a){const i=$.getUserProfiles();!this.selectedUserId&&i.length>0&&(this.selectedUserId=i[0].id);const r=i.find(n=>n.id===this.selectedUserId)||i[0];t.innerHTML=`
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
              ${i.map(n=>{const d=n.id===this.selectedUserId,l=new Date(n.lastPlayedAt).toLocaleDateString()+" "+new Date(n.lastPlayedAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});return`
                  <div
                    class="user-profile-item p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${d?"bg-amber-950/40 border-amber-400 shadow-md shadow-amber-500/20 text-white":"bg-slate-950/60 border-slate-800/80 hover:border-amber-500/40 text-slate-300"}"
                    data-user-id="${n.id}"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-8 h-8 rounded-full border ${d?"border-amber-400 bg-amber-500/20 text-amber-300":"border-slate-700 bg-slate-900 text-slate-400"} flex items-center justify-center font-bold text-sm flex-shrink-0">
                        ${d?"★":"👤"}
                      </div>
                      <div class="min-w-0">
                        <div class="font-bold text-sm truncate ${d?"text-amber-300":"text-slate-200"}">
                          ${n.name}
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono truncate">
                          ${n.companyName}
                        </div>
                      </div>
                    </div>

                    <div class="text-right flex-shrink-0 font-mono text-xs">
                      <div class="text-cyan-400 font-bold">Tier ${n.foundryTier}</div>
                      <div class="text-amber-300/90 text-[10px]">NT$ ${Math.round(n.cash).toLocaleString()}</div>
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
    `,this.bindEvents(t,e,s,a)}static bindEvents(t,e,s,a){var n,d,l,o,p,c,h,m,u,f,g,v;const i=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",r)},r=y=>{y.key==="Escape"&&a&&i()};window.addEventListener("keydown",r),a&&((n=document.getElementById("btn-close-login"))==null||n.addEventListener("click",i),(d=document.getElementById("btn-cancel-login"))==null||d.addEventListener("click",i),(l=document.getElementById("modal-backdrop-login"))==null||l.addEventListener("click",y=>{y.target===document.getElementById("modal-backdrop-login")&&i()})),t.querySelectorAll(".user-profile-item").forEach(y=>{y.addEventListener("click",x=>{const w=x.currentTarget.getAttribute("data-user-id");w&&(b.playClick(),this.selectedUserId=w,this.isEditingName=!1,this.isCreatingUser=!1,this.render(t,e,s,a))})}),(o=document.getElementById("btn-create-user-toggle"))==null||o.addEventListener("click",()=>{b.playClick(),this.isCreatingUser=!this.isCreatingUser,this.isEditingName=!1,this.render(t,e,s,a)}),(p=document.getElementById("btn-cancel-create"))==null||p.addEventListener("click",()=>{b.playClick(),this.isCreatingUser=!1,this.render(t,e,s,a)}),(c=document.getElementById("btn-confirm-create"))==null||c.addEventListener("click",()=>{const y=document.getElementById("input-new-username"),x=document.getElementById("input-new-company"),w=(y==null?void 0:y.value.trim())||"",T=(x==null?void 0:x.value.trim())||void 0;if(!w){alert("請輸入執行長姓名！");return}b.playCoinChime();const C=$.createUser(w,T);this.selectedUserId=C.id,this.isCreatingUser=!1,this.render(t,e,s,a)}),(h=document.getElementById("btn-rename-user-toggle"))==null||h.addEventListener("click",()=>{this.selectedUserId&&(b.playClick(),this.isEditingName=!this.isEditingName,this.isCreatingUser=!1,this.render(t,e,s,a))}),(m=document.getElementById("btn-cancel-rename"))==null||m.addEventListener("click",()=>{b.playClick(),this.isEditingName=!1,this.render(t,e,s,a)}),(u=document.getElementById("btn-confirm-rename"))==null||u.addEventListener("click",()=>{if(!this.selectedUserId)return;const y=document.getElementById("input-rename-username"),x=y==null?void 0:y.value.trim();if(!x){alert("名稱不能為空！");return}b.playClick(),$.renameUser(this.selectedUserId,x),this.isEditingName=!1,this.render(t,e,s,a)}),(f=document.getElementById("btn-delete-user"))==null||f.addEventListener("click",()=>{if(!this.selectedUserId)return;const y=$.getUserProfiles(),x=y.find(T=>T.id===this.selectedUserId);if(!x)return;if(y.length<=1){alert("這是唯一的玩家存檔，無法刪除！");return}if(!confirm(`確定要徹底刪除玩家【${x.name}】（${x.companyName}）的存檔嗎？此動作不可逆！`))return;b.playClick();const w=$.deleteUser(this.selectedUserId);if(!w.success){alert(w.message||"刪除失敗");return}this.selectedUserId=$.getActiveUserProfile().id,this.render(t,e,s,a)}),(g=document.getElementById("btn-factory-reset-login"))==null||g.addEventListener("click",()=>{b.playClick(),confirm(`⚠️ 警告：整機資料重置將徹底清除本裝置上的所有玩家帳號、廠房進度、財務紀錄與暫存設定，無法復原！

確定要刪除裝置全部資料使玩家能從零開始重新體驗嗎？`)&&($.factoryResetAllData(),alert("整機資料已全數清除！即將重新啟動遊戲。"),window.location.reload())}),(v=document.getElementById("btn-confirm-play"))==null||v.addEventListener("click",()=>{if(!this.selectedUserId)return;b.playCoinChime();const y=$.switchActiveUser(this.selectedUserId);if(!y){alert("載入該存檔失敗，將進入預設存檔！");return}i(),s(y)})}}E(ie,"selectedUserId",null),E(ie,"isEditingName",!1),E(ie,"isCreatingUser",!1);class Ie{constructor(t,e,s,a,i){E(this,"topHUD");E(this,"state");E(this,"onStateUpdated");E(this,"onUserSwitched");E(this,"onTogglePlanner");E(this,"isPlannerActive",!1);E(this,"currentPlannerTool","MOVE_MACHINE");E(this,"focusedOrderIndex",0);this.state=t,this.onStateUpdated=s,this.onUserSwitched=a,this.onTogglePlanner=i,this.topHUD=new Ee("top-hud",{onOpenContracts:()=>this.openContracts(),onOpenStore:()=>this.openStore(),onOpenHR:()=>this.openHR(),onOpenQuests:()=>this.openQuests(),onOpenAchievements:()=>this.openAchievements(),onOpenAdvisory:()=>this.openAdvisory(),onOpenSaveModal:()=>this.openSaveModal(),onOpenWaferMap:()=>this.openWaferMap(),onOpenTutorial:()=>this.openTutorial(),onOpenFinance:()=>this.openFinancialReport(),onOpenLogin:()=>this.openUserLogin(),onOpenPlanner:()=>this.togglePlannerMode(),onOpenTechTree:()=>this.openTechTree(),onOpenFactoryReset:()=>this.openFactoryResetConfirmation()}),de.init(t,e,s),!t.player.companyName||t.player.companyName==="矽島先進半導體"?he.show(t,()=>{this.render(),this.onStateUpdated(),se.isCompleted(this.state)||this.openTutorial()}):se.isCompleted(this.state)||setTimeout(()=>this.openTutorial(),400),this.render()}render(){this.topHUD.render(this.state),this.renderOrderStatusWidget()}renderOrderStatusWidget(){var P,O,I,_,G,K,U,z;const t=document.getElementById("hud-widgets");if(!t)return;if(this.state.activeOrders.length===0){t.innerHTML=`
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
      `,(P=document.getElementById("hud-order-status-bar"))==null||P.addEventListener("click",()=>{b.playClick(),this.openContracts()});return}const e=this.state.activeOrders.filter(S=>S.status==="COMPLETED"),s=this.state.activeOrders.filter(S=>S.status==="ACTIVE"||S.status==="PENDING");if(e.length>0&&s.length===0){const S=e[0],k=S.deliveryYield!==void 0?S.deliveryYield:S.goodDiesDelivered/Math.max(1,S.totalDies),B=e.reduce((W,H)=>W+(H.expectedPayout||0),0);t.innerHTML=`
        <div id="hud-order-status-bar" class="hud-order-bar order-completed cursor-pointer bg-gradient-to-r from-emerald-950/90 via-slate-900/90 to-cyan-950/90 border-2 border-emerald-500/60 shadow-xl shadow-emerald-500/20 animate-pulse">
          <div class="flex items-center justify-between w-full flex-wrap gap-2">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xl flex-shrink-0 text-emerald-300">
                📦
              </div>
              <div>
                <div class="text-sm font-bold text-emerald-300 flex items-center gap-2 flex-wrap">
                  <span>🎉 【訂單完工交貨】客戶尾款待請領！</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-900 text-emerald-200 border border-emerald-400/40">
                    ${S.clientName} (${S.nodeNm}nm)
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                    🎯 交貨良率: ${(k*100).toFixed(1)}%
                  </span>
                  ${e.length>1?`<span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">共 ${e.length} 筆完工</span>`:""}
                </div>
                <div class="text-xs text-slate-300 mt-0.5">
                  晶圓已加工檢驗完成並送抵客戶！請前往合約看板檢視代工資訊並點擊請領尾款。
                </div>
              </div>
            </div>
            <button id="btn-bar-action" class="btn-sci-fi text-xs font-bold py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/30 flex-shrink-0">
              💰 立即收款 NT$ ${B>0?B.toLocaleString():"請領尾款"}
            </button>
          </div>
        </div>
      `,(O=document.getElementById("hud-order-status-bar"))==null||O.addEventListener("click",W=>{W.stopPropagation(),b.playClick(),this.openContracts()}),(I=document.getElementById("btn-bar-action"))==null||I.addEventListener("click",W=>{W.stopPropagation(),b.playClick(),this.openContracts()});return}this.focusedOrderIndex>=s.length&&(this.focusedOrderIndex=Math.max(0,s.length-1));const a=s[this.focusedOrderIndex]||this.state.activeOrders[0],i=this.state.activeLots.filter(S=>S.orderId===a.id),r=i.find(S=>S.status==="PROCESSING")||i[0],n=a.goodDiesDelivered,d=a.totalDies,l=Math.min(100,Math.round(n/Math.max(1,d)*100)),o=r?r.currentLayer:1,p=r?r.totalLayers:a.layerCount||10,c=r?r.currentStation:"FILM",h=r?r.litSubStep:void 0,m=a.assignedPieId?this.state.staff.find(S=>S.id===a.assignedPieId):null,u=Z.getPieBonus(m);let f=c;c==="LIT"&&(h==="COAT"||h==="DEVELOP"?f="TRACK":f="LITHO");const g=this.state.machines.find(S=>S.category===f);let v="";if(r&&r.qTimeDeadline){const S=Math.max(0,Math.round(r.qTimeDeadline-this.state.gameTime));v=`
        <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold ${S<=15?"bg-red-950 text-red-300 border border-red-500/50 animate-pulse":"bg-amber-950 text-amber-300 border border-amber-500/30"}">
          ⏱️ Q-Time: ${S}s
        </span>
      `}const y=this.state.unlockedFeatures.cmp,x=[{key:"FILM",name:"薄膜沉積",en:"FILM",icon:"🧪",match:(S,k)=>S==="FILM"},{key:"TRACK_COAT",name:"光阻塗膠",en:"TRACK",icon:"🌀",match:(S,k)=>S==="LIT"&&k==="COAT"},{key:"LITHO",name:"微影曝光",en:"LITHO",icon:"🔬",match:(S,k)=>S==="LIT"&&k==="EXPOSE"},{key:"TRACK_DEV",name:"顯影烘烤",en:"DEVELOP",icon:"♨️",match:(S,k)=>S==="LIT"&&k==="DEVELOP"},{key:"ETCH",name:"電漿蝕刻",en:"ETCH",icon:"⚡",match:(S,k)=>S==="ETCH"},{key:"DIFF",name:"高溫擴散",en:"DIFF",icon:"🔥",match:(S,k)=>S==="DIFF"}];y&&x.push({key:"CMP",name:"平坦化研磨",en:"CMP",icon:"💎",match:S=>S==="CMP"});let w=-1;r&&r.status==="PROCESSING"&&(w=x.findIndex(S=>S.match(r.currentStation,r.litSubStep)));const T=a.goodDiesDelivered>=a.totalDies||i.length>0&&i.every(S=>S.status==="COMPLETED");let C="";s.length>1&&(C=`
        <div class="flex items-center justify-between bg-slate-950/90 border-b border-slate-800/80 px-3 py-1.5 gap-2 rounded-t-lg -mt-1 mb-2">
          <div class="flex items-center gap-1.5 overflow-x-auto py-0.5">
            <span class="text-[11px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
              <span>📑 在製訂單切換:</span>
            </span>
            ${s.map((S,k)=>`
              <button 
                class="btn-switch-hud-order px-2.5 py-1 rounded text-xs font-mono font-bold transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${k===this.focusedOrderIndex?"bg-cyan-600 text-white shadow-md shadow-cyan-500/30 border border-cyan-400":"bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/80"}"
                data-order-index="${k}"
                title="切換檢視【${S.clientName}】(${S.nodeNm}nm) 產線進度"
              >
                <span>${k+1}. ${S.clientName}</span>
                <span class="text-[10px] opacity-80 font-normal">(${S.nodeNm}nm)</span>
                <span class="text-[10px] px-1 py-0.2 rounded bg-black/40 ${S.status==="ACTIVE"?"text-emerald-300":"text-amber-300"}">
                  ${S.status==="ACTIVE"?"⚡投產":"⏳待產"}
                </span>
              </button>
            `).join("")}
          </div>
          <div class="flex items-center gap-1 flex-shrink-0">
            <button id="btn-prev-hud-order" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer" title="切換上一筆訂單">◀</button>
            <span class="text-[11px] font-mono text-cyan-300 px-1 font-bold">${this.focusedOrderIndex+1} / ${s.length}</span>
            <button id="btn-next-hud-order" class="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer" title="切換下一筆訂單">▶</button>
          </div>
        </div>
      `);let M="";if(e.length>0){const S=e[0],k=S.deliveryYield!==void 0?S.deliveryYield:S.goodDiesDelivered/Math.max(1,S.totalDies);M=`
        <div id="btn-quick-payout-banner" class="flex items-center justify-between bg-emerald-950/70 border border-emerald-500/50 rounded-lg px-3 py-1 mb-2 text-xs text-emerald-300 animate-pulse hover:bg-emerald-900/80 cursor-pointer">
          <span class="flex items-center gap-2 font-bold flex-wrap">
            <span>🎉</span>
            <span>【${S.clientName}】${e.length>1?`等 ${e.length} 筆訂單`:"訂單"}已完工交貨！</span>
            <span class="px-2 py-0.2 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40">
              🎯 良率: ${(k*100).toFixed(1)}%
            </span>
          </span>
          <span class="text-[11px] font-bold text-amber-300 flex items-center gap-1 hover:underline">
            💰 前往請領尾款 ➔
          </span>
        </div>
      `}t.innerHTML=`
      <div id="hud-order-status-bar" class="hud-order-bar cursor-pointer" title="點擊檢視訂單詳情與批次資訊">
        ${M}
        ${C}
        <!-- 上方：訂單資訊、良品產能、機台指派與動作按鈕 -->
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-lg flex-shrink-0 text-cyan-400">
              ⚙️
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-white text-sm">【${a.clientName}】</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  ${a.nodeNm}nm 工藝
                </span>
                <span class="text-xs text-slate-300 font-mono">
                  第 <strong class="text-cyan-300">${o}</strong> / ${p} 層
                </span>
                ${this.state.activeOrders.length>1?`<span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">共 ${this.state.activeOrders.length} 筆在製</span>`:""}
              </div>
              <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono flex-wrap">
                <span>交付進度: <strong class="text-amber-300">${n} / ${d} 顆</strong> (${l}%)</span>
                <span class="text-slate-600">|</span>
                <span>所在機台: <strong class="${(g==null?void 0:g.status)==="EXPLODED"?"text-red-400 font-bold animate-pulse":"text-cyan-300"}">📍 ${g?g.name:"產線調度中"}</strong></span>
                <span class="text-slate-600">|</span>
                ${m?`
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-500/40 flex items-center gap-1" title="製程整合工程師 (PIE): ${m.name} (${m.rank})">
                    👨‍💼 PIE: <strong>${m.name}</strong> 
                    <span class="text-emerald-400 font-bold">${u.speedBonus>0?`+${Math.round(u.speedBonus*100)}%速`:""} +${(u.yieldBonus*100).toFixed(1)}%良率</span>
                  </span>
                `:`
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-700/60" title="尚未指派製程整合工程師，前往合約訂單可指派">
                    👨‍💼 PIE: <span class="text-amber-400">未指派</span>
                  </span>
                `}
                <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 border border-slate-700 text-cyan-300">
                  ⏱️ 站點進度: <strong>${r&&r.stationProgressSeconds||0}s</strong> / ${r&&r.stationRequiredSeconds||10}s
                </span>
                ${r!=null&&r.hasYellowRoomViolation?`
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-500/60 animate-pulse">
                    🚨 致命白光污染！微影設備未在黃光區 (良率 0%)
                  </span>
                `:""}
                ${v}
              </div>
            </div>
          </div>

          <!-- 右側狀態與按鈕 -->
          <div class="flex items-center gap-2">
            ${e.length>0?`
              <button id="btn-bar-action" class="btn-sci-fi text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold animate-pulse shadow-md shadow-emerald-500/30">
                💰 請領尾款 (${e.length})
              </button>
            `:T?`
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
          <div class="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300" style="width: ${l}%"></div>
        </div>

        <!-- 下方：全機台流程 Pipeline -->
        <div class="flex items-center gap-1.5 w-full overflow-x-auto pt-1">
          ${x.map((S,k)=>{let B="step-waiting",W="待加工",H="text-slate-500";if(T)B="step-completed",W="✓ 完工",H="text-emerald-400";else if(k<w)B="step-completed",W="✓ 完工",H="text-emerald-400";else if(k===w){const me=(r==null?void 0:r.stationProgressSeconds)||0,ve=(r==null?void 0:r.stationRequiredSeconds)||10;B="step-active",W=`⚡ ${me}/${ve}s`,H="text-cyan-300 font-bold"}const pe=S.key.startsWith("TRACK")?"TRACK":S.key==="LITHO"?"LITHO":S.key,ne=this.state.machines.find(me=>me.category===pe),ue=(ne==null?void 0:ne.status)==="EXPLODED";return`
              <div class="pipeline-step ${B} ${ue?"border-red-500/80 bg-red-950/30":""}" title="${S.name} (${S.en})${ne?" - "+ne.name:""}">
                <div class="flex items-center gap-1 text-xs">
                  <span>${S.icon}</span>
                  <span class="font-bold text-white text-[11px] truncate">${S.name}</span>
                </div>
                <div class="flex items-center justify-between w-full px-1 text-[10px] mt-0.5">
                  <span class="font-mono text-slate-400 text-[9px]">${S.en}</span>
                  <span class="${ue?"text-red-400 font-bold animate-pulse":H}">
                    ${ue?"💥故障":W}
                  </span>
                </div>
              </div>
              ${k<x.length-1?'<span class="text-slate-600 text-xs flex-shrink-0 font-bold">➔</span>':""}
            `}).join("")}
        </div>
      </div>
    `,t.querySelectorAll(".btn-switch-hud-order").forEach(S=>{S.addEventListener("click",k=>{k.stopPropagation();const B=parseInt(k.currentTarget.getAttribute("data-order-index")||"0",10);this.focusedOrderIndex=B,b.playClick(),this.renderOrderStatusWidget()})}),(_=document.getElementById("btn-prev-hud-order"))==null||_.addEventListener("click",S=>{S.stopPropagation(),this.focusedOrderIndex=(this.focusedOrderIndex-1+s.length)%s.length,b.playClick(),this.renderOrderStatusWidget()}),(G=document.getElementById("btn-next-hud-order"))==null||G.addEventListener("click",S=>{S.stopPropagation(),this.focusedOrderIndex=(this.focusedOrderIndex+1)%s.length,b.playClick(),this.renderOrderStatusWidget()}),(K=document.getElementById("hud-order-status-bar"))==null||K.addEventListener("click",S=>{S.stopPropagation(),b.playClick(),this.openContracts()}),(U=document.getElementById("btn-bar-action"))==null||U.addEventListener("click",S=>{S.stopPropagation(),b.playClick(),this.openContracts()}),(z=document.getElementById("btn-quick-payout-banner"))==null||z.addEventListener("click",S=>{S.stopPropagation(),b.playClick(),this.openContracts()})}togglePlannerMode(t){var e;this.isPlannerActive=t!==void 0?t:!this.isPlannerActive,this.isPlannerActive&&this.currentPlannerTool==="NONE"&&(this.currentPlannerTool="MOVE_MACHINE"),(e=this.onTogglePlanner)==null||e.call(this,this.isPlannerActive,this.currentPlannerTool),this.renderPlannerToolbar()}setPlannerTool(t){var e;this.currentPlannerTool=t,(e=this.onTogglePlanner)==null||e.call(this,this.isPlannerActive,t),this.renderPlannerToolbar()}renderPlannerToolbar(){var e,s,a,i;let t=document.getElementById("planner-toolbar");if(!this.isPlannerActive){t&&t.remove();return}t||(t=document.createElement("div"),t.id="planner-toolbar",document.body.appendChild(t)),t.className="fixed top-18 left-1/2 -translate-x-1/2 z-50 glass-panel p-3 border-2 border-amber-500/70 shadow-2xl rounded-2xl flex flex-wrap items-center gap-3 animate-scaleUp pointer-events-auto bg-slate-950/95",t.innerHTML=`
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
    `,(e=document.getElementById("btn-planner-move"))==null||e.addEventListener("click",r=>{r.stopPropagation(),b.playClick(),this.setPlannerTool("MOVE_MACHINE")}),(s=document.getElementById("btn-planner-yellow"))==null||s.addEventListener("click",r=>{r.stopPropagation(),b.playClick(),this.setPlannerTool("PAINT_YELLOW")}),(a=document.getElementById("btn-planner-white"))==null||a.addEventListener("click",r=>{r.stopPropagation(),b.playClick(),this.setPlannerTool("PAINT_WHITE")}),(i=document.getElementById("btn-planner-exit"))==null||i.addEventListener("click",r=>{r.stopPropagation(),b.playClick(),this.togglePlannerMode(!1),this.onStateUpdated()})}openContracts(){le.show(this.state,()=>{this.render(),this.onStateUpdated()})}openStore(t){te.show(this.state,()=>{this.render(),this.onStateUpdated()},t)}openHR(){fe.show(this.state,()=>{this.render(),this.onStateUpdated()})}openQuests(){ke.show(this.state,()=>{this.render(),this.onStateUpdated()})}openAchievements(){be.show(this.state,()=>{this.render(),this.onStateUpdated()})}openAdvisory(){Se.show(this.state,()=>this.openStore(),()=>this.openHR(),()=>this.openYieldGuide())}openYieldGuide(){ge.show(this.state,{onOpenPlanner:()=>this.togglePlannerMode(!0),onOpenContracts:()=>this.openContracts(),onOpenHR:()=>this.openHR(),onOpenStore:t=>this.openStore(t)})}openWaferMap(t){ee.show(this.state,t,()=>{this.render(),this.onStateUpdated()},{onOpenPlanner:()=>this.togglePlannerMode(!0),onOpenContracts:()=>this.openContracts(),onOpenHR:()=>this.openHR(),onOpenStore:e=>this.openStore(e)})}openLayerAllocation(t){oe.show(this.state,t,()=>{this.render(),this.onStateUpdated()})}updateState(t){this.state=t,this.topHUD.rebuild(),this.render()}openFinancialReport(){ye.show(this.state,()=>{this.render(),this.onStateUpdated()})}openTechTree(){xe.show(this.state,()=>{this.render(),this.onStateUpdated()})}openUserLogin(){ie.show(this.state,t=>{var e;this.state=t,(e=this.onUserSwitched)==null||e.call(this,t),this.render(),this.onStateUpdated(),se.isCompleted(t)||setTimeout(()=>this.openTutorial(),400)})}openTutorial(t){se.show(this.state,()=>{this.render(),this.onStateUpdated()},t)}openSaveModal(){var a,i,r,n,d,l;const t=document.getElementById("modal-container");if(!t)return;const e=o=>{o.key==="Escape"&&(t.innerHTML="",window.removeEventListener("keydown",e))};window.addEventListener("keydown",e);const s=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",e)};t.innerHTML=`
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
    `,(a=document.getElementById("btn-close-save-modal"))==null||a.addEventListener("click",s),(i=document.getElementById("btn-return-save"))==null||i.addEventListener("click",s),(r=document.getElementById("modal-backdrop-save"))==null||r.addEventListener("click",o=>{o.target===o.currentTarget&&s()}),(n=document.getElementById("btn-export-save"))==null||n.addEventListener("click",()=>{b.playClick();const o=$.exportSaveToJson(this.state),p=new Blob([o],{type:"application/json"}),c=URL.createObjectURL(p),h=document.createElement("a");h.href=c,h.download=`silicon_tycoon_save_${Date.now()}.json`,h.click(),URL.revokeObjectURL(c)}),(d=document.getElementById("btn-import-save"))==null||d.addEventListener("click",()=>{var o;(o=document.getElementById("file-import-save"))==null||o.click()}),(l=document.getElementById("file-import-save"))==null||l.addEventListener("change",o=>{var c;const p=(c=o.target.files)==null?void 0:c[0];if(p){const h=new FileReader;h.onload=m=>{var g;const u=(g=m.target)==null?void 0:g.result,f=$.importSaveFromJson(u);f.success&&f.state?($.saveToLocalStorage(f.state),alert("存檔匯入成功！即將重新載入遊戲。"),window.location.reload()):alert(`匯入失敗: ${f.error}`)},h.readAsText(p)}})}showNotice(t){const e=document.createElement("div");e.className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs font-medium shadow-2xl animate-bounce",e.innerText=t,document.body.appendChild(e),setTimeout(()=>e.remove(),2500)}openFactoryResetConfirmation(){var a,i,r;const t=document.getElementById("modal-container");if(!t)return;b.playClick();const e=()=>{t.innerHTML="",window.removeEventListener("keydown",s)},s=n=>{n.key==="Escape"&&e()};window.addEventListener("keydown",s),t.innerHTML=`
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
    `,(a=document.getElementById("btn-cancel-factory-reset"))==null||a.addEventListener("click",e),(i=document.getElementById("modal-backdrop-reset"))==null||i.addEventListener("click",n=>{n.target===document.getElementById("modal-backdrop-reset")&&e()}),(r=document.getElementById("btn-confirm-factory-reset"))==null||r.addEventListener("click",()=>{b.playClick(),$.factoryResetAllData(),alert("全機資料已全數清空！即將重新整理進入全新遊戲。"),window.location.reload()})}}class Ce{static show(t,e,s){const a=document.getElementById("modal-container");a&&this.render(a,t,e,s)}static render(t,e,s,a){const i=N.machines[e.modelId],r=(i==null?void 0:i.path)||"./assets/machines/litho_contact.png",n=te.STORE_CATALOG.find(I=>I.modelId===e.modelId),d=n?Math.round(n.price*.15):3e5,l=n?Math.round(n.price*.4):8e5,o=Math.round(e.wear);let p=s.staff.find(I=>I.id===e.assignedEngineerId);p&&p.moduleSpecialty==="PIE"&&(e.assignedEngineerId=null,p=void 0);const c=s.staff.filter(I=>I.moduleSpecialty!=="PIE");let h=!1,m=!1;p&&(h=X.checkTPMConditions(e,p).isTPMActive,m=X.checkExplosionRisk(e,p).hasRisk);let u=null,f=null;if(e.category==="LITHO"){const I=J.OPTICAL_CATALOG[e.modelId];if(I){const _=J.calculateEffectiveK1(s.player.unlockedK1,e.wear,p||null);u={effectiveK1:_.effectiveK1,formula:`Base(${_.k1Tech.toFixed(2)}) + 磨損(+${_.deltaWear.toFixed(3)}) - 調校(-${_.deltaEngineer.toFixed(2)}) + 疲勞(+${_.deltaFatigue.toFixed(2)})`},f=Math.round(_.effectiveK1*(I.wavelengthNm/I.numericalAperture))}}const g=e.category==="LITHO",v=s.machines.filter(I=>I.category==="TRACK"&&I.status!=="EXPLODED"),y=e.pairedTrackIds||[],x=R.BASE_THROUGHPUT_BY_TIER.LIT[e.tier]||10;let w=0;for(const I of y){const _=s.machines.find(G=>G.id===I);_&&(w+=R.BASE_THROUGHPUT_BY_TIER.TRACK[_.tier]||6)}const T=g&&(y.length===0||w<x),C=s.activeLots.filter(I=>I.status!=="PROCESSING"?!1:e.category==="TRACK"?I.currentStation==="LIT"&&(I.litSubStep==="COAT"||I.litSubStep==="DEVELOP"):e.category==="LITHO"?I.currentStation==="LIT"&&I.litSubStep==="EXPOSE":I.currentStation===e.category),M=C.length>0,P=R.isMachineInYellowRoom(e,s.facility.yellowRoomTiles),O=e.category==="LITHO"||e.category==="TRACK";t.innerHTML=`
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
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono ${M||e.status==="PROCESSING"?"bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse":e.status==="MAINTENANCE"?"bg-amber-500/20 text-amber-300 border border-amber-500/30":e.status==="EXPLODED"?"bg-red-600 text-white font-bold animate-bounce":"bg-slate-800 text-slate-300"}">
                    ${M?"⚡ 加工中 (PROCESSING)":e.status}
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

            <!-- Yellow Room Safety Warning / Status Banner -->
            ${O?P?`
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
                ${(n==null?void 0:n.description)||"廠內現役半導體晶圓製造專用設備。"}
              </div>
              ${n!=null&&n.scienceNote?`
                <div class="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200/90 leading-relaxed">
                  <span class="font-bold text-cyan-300">ℹ️ 半導體物理原理：</span>
                  ${n.scienceNote}
                </div>
              `:""}
              <div class="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div class="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span class="text-slate-400">標準吞吐產能:</span>
                  <span class="text-cyan-300 font-bold">${(n==null?void 0:n.throughputWpm)||10} 晶圓/分</span>
                </div>
                <div class="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span class="text-slate-400">${e.category==="LITHO"?"Rayleigh 極限 CD:":"製程站點:"}</span>
                  <span class="text-emerald-400 font-bold">${n!=null&&n.rayleighLimitNm?n.rayleighLimitNm+" nm":e.category}</span>
                </div>
              </div>
            </div>

            <!-- 2. Live Production Job Status (即時生產在製狀態) -->
            <div class="p-3.5 rounded-xl bg-slate-900/80 border ${M?"border-cyan-500/40 bg-cyan-950/20":"border-slate-800"} space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-bold text-white flex items-center gap-1.5">
                  <span>⚙️</span>
                  <span>生產加工狀態 (Production Status)</span>
                </span>
                <span class="font-mono text-xs ${M?"text-cyan-300 font-bold animate-pulse":"text-slate-400"}">
                  ${M?"⚡ 正在加工批次":"待命中 (Ready / IDLE)"}
                </span>
              </div>
              ${M?`
                <div class="space-y-1.5 pt-1 font-mono text-xs">
                  ${C.map(I=>`
                    <div class="p-2.5 rounded-lg bg-slate-950/80 border border-cyan-500/30 flex items-center justify-between">
                      <div>
                        <span class="text-cyan-300 font-bold">${I.lotId}</span>
                        <span class="text-[11px] text-slate-400 ml-2">第 ${I.currentLayer}/${I.totalLayers} 層 [${I.currentStation}${I.litSubStep?" - "+I.litSubStep:""}]</span>
                      </div>
                      <div class="text-emerald-400 font-bold">
                        良率 ${(I.yieldMultiplier*100).toFixed(0)}%
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

            <!-- 4. Litho Specific Optical Rayleigh Details -->
            ${g&&u?`
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div class="flex items-center justify-between font-mono">
                  <span class="text-cyan-300 font-bold flex items-center gap-1.5">
                    <span>🔬</span>
                    <span>Rayleigh 微影光學解析度實時調校</span>
                  </span>
                  <span class="text-emerald-400 font-bold">極限 CD: ~${f} nm</span>
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
            ${g?`
              <div class="p-3.5 rounded-xl bg-slate-900/80 border ${T?"border-amber-500/40":"border-slate-800"} space-y-3">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-white flex items-center gap-1.5">
                    <span>🌀</span>
                    <span>連線機組 Track 塗膠顯影機配套綁定 (Option B)</span>
                  </span>
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    微影 ${x} 片/分 vs Track ${w} 片/分
                  </span>
                </div>

                <p class="text-[11px] text-slate-400">
                  半導體黃光區晶圓每層必須進出 Track 兩次 (塗膠 + 顯影)！可勾選並聯多台 Track 機台分流吞吐：
                </p>

                ${v.length===0?`
                  <div class="p-2.5 rounded bg-red-950/20 border border-red-800/30 text-red-300 text-[11px]">
                    ⚠️ 廠內尚未安裝任何 Track 塗膠顯影機！微影機無法單獨運作，請前往商城採購！
                  </div>
                `:`
                  <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    ${v.map(I=>{const _=y.includes(I.id),G=R.BASE_THROUGHPUT_BY_TIER.TRACK[I.tier]||6;return`
                        <label class="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border ${_?"border-cyan-500/40 bg-cyan-950/10":"border-slate-800"} cursor-pointer hover:border-slate-700">
                          <div class="flex items-center gap-2">
                            <input
                              type="checkbox"
                              class="chk-paired-track rounded border-slate-700 text-cyan-500 focus:ring-0"
                              data-track-id="${I.id}"
                              ${_?"checked":""}
                            />
                            <span class="font-semibold text-slate-200 text-xs">${I.name}</span>
                            <span class="text-[10px] text-slate-400 font-mono">(Tier ${I.tier})</span>
                          </div>
                          <span class="font-mono text-[11px] text-cyan-300">+${G} 晶圓/分</span>
                        </label>
                      `}).join("")}
                  </div>
                `}

                ${T?`
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

            <!-- 6. 整合看板：機台運轉監控與駐站工程師配置 (含雙軌維護機制) -->
            <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3.5">
              <!-- 設備磨損與健康狀態 -->
              <div>
                <div class="flex items-center justify-between font-mono pb-1.5">
                  <span class="text-white font-bold flex items-center gap-1.5 text-xs">
                    <span>🛠️</span>
                    <span>機台磨損度與在線健康狀態</span>
                  </span>
                  <span class="font-bold ${o>70?"text-red-400":o>40?"text-amber-400":"text-emerald-400"}">
                    磨損: ${o}% (健康度 ${100-o}%)
                  </span>
                </div>
                <div class="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div class="h-full transition-all duration-300 ${o>70?"bg-red-500":o>40?"bg-amber-500":"bg-emerald-500"}" style="width: ${o}%;"></div>
                </div>

                <!-- Status Badges -->
                <div class="mt-2 space-y-1">
                  ${h?`
                    <div class="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-2 text-[11px]">
                      <span class="text-sm">🛡️</span>
                      <div>
                        <span class="font-bold">TPM 24H 零故障在線維護中：</span>
                        駐站工程師在線微調，磨損鎖死在 5% 以下，故障率保證為 0%！
                      </div>
                    </div>
                  `:""}
                  ${e.hasPmTuneUpBonus?`
                    <div class="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-2 text-[11px]">
                      <span class="text-sm">✨</span>
                      <div>
                        <span class="font-bold">腔體精密調校完畢：</span>
                        下一輪加工晶圓批次享有 +3.0% 良率加成！
                      </div>
                    </div>
                  `:""}
                  ${m?`
                    <div class="p-2 rounded-lg bg-red-950/40 border border-red-600/50 text-red-300 flex items-center gap-2 animate-pulse text-[11px]">
                      <span class="text-sm">💥</span>
                      <div>
                        <span class="font-bold">越級操作極度危險！</span>
                        工程師職等落後機台 2 級以上，每次投片皆有 25% 炸機破壞風險！
                      </div>
                    </div>
                  `:""}
                </div>
              </div>

              <!-- 駐站模組工程師配置 (嚴格排除 PIE) -->
              <div class="pt-2 border-t border-slate-800/80 space-y-2">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-xs flex items-center gap-1">
                      <span>🧑‍🔬</span>
                      <span>駐站模組工程師配置</span>
                    </span>
                    <span class="text-[10px] text-slate-500">(PIE 專責全廠訂單整合，不進駐機台)</span>
                  </div>
                  ${p?`
                    <span class="text-[10px] font-mono text-purple-300">
                      ${p.rank} (${p.moduleSpecialty})
                    </span>
                  `:'<span class="text-[10px] text-slate-500">無駐站人員</span>'}
                </div>

                <select id="select-station-engineer" class="select-sci-fi w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs">
                  <option value="">-- 未指派駐站工程師 (機台待命，無調校加成) --</option>
                  ${c.map(I=>{const _=e.assignedEngineerId===I.id,G=I.moduleSpecialty===e.category,K=I.assignedMachineId&&I.assignedMachineId!==e.id?s.machines.find(S=>S.id===I.assignedMachineId):null;let U="🟢 [待命可進駐]",z="";return _?U="🔵 [目前駐站本機]":K&&(U=`🔄 [進駐於: ${K.name}]`,z=" ➔ 選取將交換崗位"),`
                      <option value="${I.id}" ${_?"selected":""}>
                        ${U} ${I.name} - ${I.rank} [${I.moduleSpecialty}${G?" ★專長吻合":""}] (疲勞: ${Math.round(I.fatigue)}%)${z}
                      </option>
                    `}).join("")}
                </select>

                <div class="text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-1">
                  ${p?`
                    <span>駐站人員：<strong class="text-slate-200">${p.name}</strong> (${p.rank} | 專長: ${p.moduleSpecialty} | 疲勞: <strong class="${p.fatigue>=80?"text-red-400 font-bold":"text-emerald-400"}">${Math.round(p.fatigue)}%</strong>)</span>
                  `:`
                    <span class="text-amber-400/80">💡 指派模組工程師駐站後，可啟動 TPM 零故障保護與執行精密 PM 預防保養！</span>
                  `}
                  <span class="text-[10px] text-cyan-400/90 font-mono">支援選取已派員機台自動「交換崗位」</span>
                </div>
              </div>

              <!-- 雙軌清晰維護操作：工程師精密 PM 保養 vs 原廠專案大修 -->
              <div class="pt-2 border-t border-slate-800/80 space-y-2">
                <div class="text-[11px] font-bold text-slate-300">設備維護與調校作業：</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <!-- 軌道一：工程師精密 PM 預防保養 -->
                  <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2">
                    <div>
                      <div class="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                        <span>🔍</span>
                        <span>工程師精密預防保養 (PM)</span>
                      </div>
                      <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        由駐站工程師清潔腔體與真空光學校準。消耗 10% 疲勞，磨損立即歸零，並賦予次輪良率 +3.0% 調校加成！
                      </p>
                    </div>
                    <button
                      id="btn-engineer-pm"
                      class="btn-sci-fi w-full justify-center text-xs py-2 bg-indigo-950/90 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 font-bold ${!p||p&&p.fatigue>=90?"opacity-50 cursor-not-allowed":""}"
                      ${!p||p&&p.fatigue>=90?"disabled":""}
                      title="由駐站工程師執行腔體深入清潔與精密調校"
                    >
                      ${p?p.fatigue>=90?"⚠️ 工程師過勞 (疲勞≥90%)":"🔍 執行精密 PM 保養 (-10%疲勞)":"⚠️ 需先指派駐站工程師"}
                    </button>
                  </div>

                  <!-- 軌道二：原廠深度大修 -->
                  <div class="p-3 rounded-lg bg-slate-950/70 border border-slate-800 flex flex-col justify-between space-y-2">
                    <div>
                      <div class="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                        <span>🛠️</span>
                        <span>原廠專案深度大修 (Overhaul)</span>
                      </div>
                      <p class="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        委請原廠設備商更換耗材零件，花費資金免消耗工程師疲勞。可修復所有磨損並解決故障停機。
                      </p>
                    </div>
                    <button
                      id="btn-machine-overhaul"
                      class="btn-sci-fi w-full justify-center text-xs py-2 bg-cyan-800/80 hover:bg-cyan-700 border border-cyan-500/50 text-white font-bold ${s.player.cash<d||e.wear<=5&&e.status!=="EXPLODED"&&e.status!=="MAINTENANCE"?"opacity-50 cursor-not-allowed":""}"
                      ${s.player.cash<d||e.wear<=5&&e.status!=="EXPLODED"&&e.status!=="MAINTENANCE"?"disabled":""}
                      title="花費資金由原廠設備商執行深度大修"
                    >
                      🛠️ 原廠大修 (NT$ ${d.toLocaleString()})
                    </button>
                  </div>
                </div>

                <!-- 報廢變賣按鈕 -->
                <div class="flex justify-end pt-1">
                  <button
                    id="btn-machine-decommission"
                    class="px-3.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900 border border-red-800/40 text-red-300 text-xs transition-colors cursor-pointer"
                  >
                    ♻️ 報廢變賣此機台 (+NT$ ${l.toLocaleString()})
                  </button>
                </div>
              </div>
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
    `,this.bindEvents(t,e,s,a)}static bindEvents(t,e,s,a){var d,l,o,p,c,h,m,u;const i=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",r)},r=f=>{f.key==="Escape"&&i()};window.addEventListener("keydown",r),(d=document.getElementById("btn-close-machine-panel"))==null||d.addEventListener("click",i),(l=document.getElementById("btn-back-machine"))==null||l.addEventListener("click",i),(o=document.getElementById("modal-backdrop-machine"))==null||o.addEventListener("click",f=>{f.target===document.getElementById("modal-backdrop-machine")&&i()}),t.querySelectorAll(".chk-paired-track").forEach(f=>{f.addEventListener("change",()=>{b.playClick();const g=[];t.querySelectorAll(".chk-paired-track:checked").forEach(v=>{const y=v.getAttribute("data-track-id");y&&g.push(y)}),e.pairedTrackIds=g,a(),this.render(t,e,s,a)})}),(p=document.getElementById("select-station-engineer"))==null||p.addEventListener("change",f=>{b.playClick();const g=f.target.value||null,v=e.assignedEngineerId?s.staff.find(y=>y.id===e.assignedEngineerId):null;if(!g)v&&(v.assignedMachineId=null),e.assignedEngineerId=null;else{const y=s.staff.find(x=>x.id===g);if(y){const x=y.assignedMachineId?s.machines.find(w=>w.id===y.assignedMachineId):null;x&&v&&x.id!==e.id?(x.assignedEngineerId=v.id,v.assignedMachineId=x.id,e.assignedEngineerId=y.id,y.assignedMachineId=e.id):(x&&(x.assignedEngineerId=null),v&&(v.assignedMachineId=null),e.assignedEngineerId=y.id,y.assignedMachineId=e.id),q.onMachineMaintained(s.questState),F.checkAchievements(s),$.saveToLocalStorage(s)}}a(),this.render(t,e,s,a)});const n=()=>{if(!e.assignedEngineerId){alert("請先在上方下拉選單指派駐站工程師，方可執行精密 PM 保養！");return}const f=s.staff.find(g=>g.id===e.assignedEngineerId);if(f){if(f.fatigue>=90){alert(`工程師 ${f.name} 疲勞度過高 (${Math.round(f.fatigue)}%)，體力不支無法執行調校！請至人資中心安排排休恢復精力！`);return}b.playClick(),e.wear=0,e.hasPmTuneUpBonus=!0,f.fatigue=Math.min(100,f.fatigue+10),q.onMachineMaintained(s.questState),F.checkAchievements(s),$.saveToLocalStorage(s),a(),this.render(t,e,s,a)}};(c=document.getElementById("btn-engineer-pm"))==null||c.addEventListener("click",n),(h=document.getElementById("btn-engineer-inspect"))==null||h.addEventListener("click",n),(m=document.getElementById("btn-machine-overhaul"))==null||m.addEventListener("click",f=>{const g=te.STORE_CATALOG.find(y=>y.modelId===e.modelId),v=g?Math.round(g.price*.15):3e5;if(s.player.cash<v){alert("資金不足，無法執行大修！");return}s.player.cash-=v,A.recordMaintenance(s,v),Q.trigger(-v,f.currentTarget),e.wear=0,e.status="IDLE",q.onMachineMaintained(s.questState),F.checkAchievements(s),$.saveToLocalStorage(s),b.playCoinChime(),a(),this.render(t,e,s,a)}),(u=document.getElementById("btn-machine-decommission"))==null||u.addEventListener("click",()=>{const f=te.STORE_CATALOG.find(y=>y.modelId===e.modelId),g=f?Math.round(f.price*.4):8e5;if(!confirm(`確定要將設備【${e.name}】除役報廢嗎？回收變賣金額 NT$ ${g.toLocaleString()}`))return;if(e.assignedEngineerId){const y=s.staff.find(x=>x.id===e.assignedEngineerId);y&&(y.assignedMachineId=null)}const v=s.machines.findIndex(y=>y.id===e.id);v!==-1&&(s.machines.splice(v,1),R.updateMachineNames(s.machines)),s.player.cash+=g,b.playCoinChime(),t.innerHTML="",a()})}}class Me{constructor(){E(this,"state",$.loadFromLocalStorage()||$.createDefaultSave());E(this,"phaserGame");E(this,"cleanroomScene");E(this,"uiManager");E(this,"autoSaveTimer",0);console.log("🚀 正在啟動 Silicon Tycoon: Foundry Master 矽島霸權...");const t=Date.now();if(this.state.lastOnlineTimestamp&&t-this.state.lastOnlineTimestamp>=2e3){const a=Math.floor((t-this.state.lastOnlineTimestamp)/1e3),i=R.simulateOfflineCatchUp(this.state,a);console.log("離線生產推進報告:",i),this.state.lastOnlineTimestamp=t,this.state.savedAt=t,$.saveToLocalStorage(this.state)}window.addEventListener("beforeunload",()=>{this.state.lastOnlineTimestamp=Date.now(),$.saveToLocalStorage(this.state)}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&(this.state.lastOnlineTimestamp=Date.now(),$.saveToLocalStorage(this.state))});const e=new Date().toISOString().split("T")[0];this.state.questState=q.refreshDailyQuests(this.state.questState,this.state.player,this.state.unlockedFeatures,e),F.checkAchievements(this.state);const s={type:Phaser.AUTO,parent:"game-container",width:window.innerWidth,height:window.innerHeight,backgroundColor:"#070b14",render:{antialias:!0,pixelArt:!1},scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH}};this.phaserGame=new Phaser.Game(s),this.cleanroomScene=new re,this.phaserGame.scene.add(re.KEY,this.cleanroomScene,!0,{saveGame:this.state,onMachineClick:a=>this.handleMachineClick(a),onStateUpdate:()=>this.onStateChanged()}),this.uiManager=new Ie(this.state,a=>{console.log(`開發者調整遊戲速度至: ${a}x`)},()=>{this.onStateChanged()},a=>{this.state=a,this.cleanroomScene.updateState(this.state),this.uiManager.updateState(this.state),this.onStateChanged()},(a,i)=>{this.cleanroomScene.setPlannerMode(a,i)}),setInterval(()=>this.simulationTick(),1e3)}simulationTick(){const t=de.getSpeedMultiplier();for(let s=0;s<t;s++){this.state.gameTime+=1,A.tickSimulation(this.state,1),D.checkOrderReplenishment(this.state),D.checkMarketOrdersExpiry(this.state),j.checkMarketCandidatesExpiry(this.state);const a=new Map(this.state.staff.map(n=>[n.id,n]));for(const n of this.state.machines){if(n.status==="EXPLODED")continue;const d=n.assignedEngineerId?a.get(n.assignedEngineerId):null,l=X.updateMachineHealth(n,d,1);n.wear=l.newWear,l.breakdownOccurred&&(n.status=l.isExploded?"EXPLODED":"MAINTENANCE")}const i=j.isWeekend();this.state.staff.forEach((n,d)=>{if(n.shiftMode==="WEEKEND_REST"){if(i)n.workShift="OFF";else if(n.workShift==="OFF"){const l=["DAY","SWING","NIGHT"];n.workShift=l[d%3]}}else if(n.shiftMode==="TWO_ON_TWO_OFF"){const l=(Math.floor(this.state.gameTime/60)+d)%2===1;n.workShift=l?"OFF":"DAY"}if(n.workShift==="OFF")n.fatigue=Math.max(0,n.fatigue-2);else{const l=n.shiftMode==="TWO_SHIFT"?.04:.02,o=n.workShift==="NIGHT"?1.4:1;n.fatigue=Math.min(100,n.fatigue+l*o)}});const r=new Set;for(const n of this.state.activeLots)n.status==="PROCESSING"&&(n.currentStation==="LIT"?n.litSubStep==="COAT"||n.litSubStep==="DEVELOP"?r.add("TRACK"):r.add("LITHO"):r.add(n.currentStation));for(const n of this.state.machines)n.status==="EXPLODED"||n.status==="MAINTENANCE"||(r.has(n.category)?n.status="PROCESSING":n.status="IDLE");for(const n of this.state.activeLots)if(n.status==="PROCESSING"){const d=this.state.activeOrders.find(o=>o.id===n.orderId),l=d!=null&&d.assignedPieId?this.state.staff.find(o=>o.id===d.assignedPieId):void 0;if(l&&l.workShift!=="OFF"&&(l.fatigue=Math.min(100,l.fatigue+.02)),n.stationProgressSeconds===void 0&&(n.stationProgressSeconds=0),n.stationRequiredSeconds||(n.stationRequiredSeconds=R.getStationRequiredSeconds(n.currentStation,n.litSubStep,void 0,void 0,l)),n.stationProgressSeconds+=1,n.stationProgressSeconds>=n.stationRequiredSeconds){n.stationProgressSeconds=0;const o=d?d.nodeNm:1e4,p=R.advanceLotStation(n,this.state.unlockedFeatures.cmp,o,this.state.player.unlockedCleanroomClass,this.state.gameTime,this.state.machines,this.state.facility.yellowRoomTiles);if(n.stationRequiredSeconds=R.getStationRequiredSeconds(n.currentStation,n.litSubStep,void 0,void 0,l),p.isLotCompleted&&(n.status="COMPLETED",d)){const c=this.state.activeLots.filter(u=>u.orderId===d.id);!n.hasYellowRoomViolation&&n.yieldMultiplier!==0&&(n.yieldMultiplier=Z.calculateLotYield(n,this.state,d));const h=Math.round(d.totalDies/Math.max(1,c.length)*n.yieldMultiplier);if(d.goodDiesDelivered=Math.min(d.totalDies,d.goodDiesDelivered+h),q.onWaferDelivered(this.state.questState,h>0?n.waferCount:0),c.every(u=>u.status==="COMPLETED")&&d.status!=="COMPLETED"){d.status="COMPLETED",d.deliveryYield=Number((d.goodDiesDelivered/d.totalDies).toFixed(3));const u=D.settleOrderPayout(d,d.goodDiesDelivered,this.state.player,this.state.staff,0,this.state.clawbackDebt);d.expectedPayout=u.netPayout,d.completedAtGameTime=this.state.gameTime,this.state.rollingYieldHistory.push(d.deliveryYield),this.state.rollingYieldHistory.length>5&&this.state.rollingYieldHistory.shift()}}}}}F.checkAchievements(this.state).newlyUnlocked.length>0&&this.uiManager.render(),this.autoSaveTimer+=1,this.autoSaveTimer>=10&&(this.autoSaveTimer=0,$.saveToLocalStorage(this.state)),this.uiManager.render(),this.cleanroomScene.updateState(this.state)}handleMachineClick(t){Ce.show(t,this.state,()=>this.onStateChanged())}onStateChanged(){$.saveToLocalStorage(this.state),this.cleanroomScene.updateState(this.state),this.uiManager.render()}}window.addEventListener("DOMContentLoaded",()=>{new Me});
