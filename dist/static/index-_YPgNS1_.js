var fe=Object.defineProperty;var xe=(M,t,e)=>t in M?fe(M,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):M[t]=e;var w=(M,t,e)=>xe(M,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))s(a);new MutationObserver(a=>{for(const i of a)if(i.type==="childList")for(const n of i.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&s(n)}).observe(document,{childList:!0,subtree:!0});function e(a){const i={};return a.integrity&&(i.integrity=a.integrity),a.referrerPolicy&&(i.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?i.credentials="include":a.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function s(a){if(a.ep)return;a.ep=!0;const i=e(a);fetch(a.href,i)}})();class j{static getRequiredRankWeight(t){return t<=2?1:t<=4?2:t===5?3:4}static checkTPMConditions(t,e){if(!e)return{isTPMActive:!1,reason:"未指派工程師進駐"};if(e.moduleSpecialty!==t.category)return{isTPMActive:!1,reason:`專長不符！該機台為 ${t.category}，工程師專精為 ${e.moduleSpecialty}`};const s=this.getRequiredRankWeight(t.tier),a=this.RANK_WEIGHT[e.rank];return a<s?{isTPMActive:!1,reason:`職等不足！機台需等級 ${s}，該工程師為 ${e.rank} (等級 ${a})`}:e.workShift==="OFF"?{isTPMActive:!1,reason:"該工程師目前處於排休狀態 (OFF)，機台暫無在線工程師值班"}:e.fatigue>=50?{isTPMActive:!1,reason:`工程師疲勞度過高 (${e.fatigue} >= 50)，在線預防保養中斷`}:e.shiftMode!=="THREE_SHIFT"?{isTPMActive:!1,reason:"非三班輪調制（超時兩班制疲勞將持續爬升，無法達成 24H 永久零故障保障）"}:{isTPMActive:!0,reason:"🛡️ 滿足專長相符、資歷合規、在線值勤且低疲勞，享有 24 小時不停機零故障保障！"}}static checkExplosionRisk(t,e){if(!e)return{hasRisk:!1,rankDiff:0};const s=this.getRequiredRankWeight(t.tier),a=this.RANK_WEIGHT[e.rank],i=s-a;return{hasRisk:i>=2,rankDiff:i}}static updateMachineHealth(t,e,s=1){const{isTPMActive:a}=this.checkTPMConditions(t,e);if(a){const c=Math.min(t.wear,5),p=100-c;return{newWear:c,healthPercent:p,isTPMActive:!0,breakdownOccurred:!1,isExploded:!1}}let n=Math.min(100,t.wear+.005*s);const r=100-n,l=(n/100)**2*.05*(s/60),d=Math.random()<l;let o=!1;if(d&&e){const c=this.getRequiredRankWeight(t.tier),p=this.RANK_WEIGHT[e.rank];c-p>=2&&Math.random()<.25&&(o=!0)}return{newWear:Number(n.toFixed(2)),healthPercent:Number(r.toFixed(2)),isTPMActive:!1,breakdownOccurred:d,isExploded:o}}static calculateOverhaulCost(t){return Math.round(t*.15)}}w(j,"RANK_WEIGHT",{"Young Specialist":1,"Skilled Worker":2,"Senior Engineer":3,Fellow:4});class q{static calculateEffectiveK1(t,e,s){let a=.8;switch(t){case"BASE":a=.8;break;case"CAR":a=.65;break;case"OPC":a=.5;break;case"PSM":a=.38;break;case"SAQP":a=.28;break}const n=Math.max(0,Math.min(100,e))/100*.05;let r=0,l=0;if(s&&s.moduleSpecialty==="LITHO")if(s.fatigue>=80)r=0,l=.03;else switch(s.rank){case"Young Specialist":r=.01;break;case"Skilled Worker":r=.02;break;case"Senior Engineer":r=.04;break;case"Fellow":r=.06;break}let d=a+n-r+l;return d=Math.max(t==="SAQP"?.15:.25,Math.min(.95,d)),{effectiveK1:Number(d.toFixed(3)),k1Tech:a,deltaWear:Number(n.toFixed(3)),deltaEngineer:Number(r.toFixed(3)),deltaFatigue:Number(l.toFixed(3))}}static calculateEffectiveCD(t,e,s,a){const i=this.OPTICAL_CATALOG[t];if(!i)return 999999;const{effectiveK1:n}=this.calculateEffectiveK1(e,s,a),r=n*(i.wavelengthNm/i.numericalAperture);return Math.round(r)}static validateResolution(t,e,s,a,i){if(!this.OPTICAL_CATALOG[t])return{canResolve:!1,effectiveCD:999999,effectiveK1:.8,reason:"未知的微影機台型號"};const{effectiveK1:r}=this.calculateEffectiveK1(s,a,i),l=this.calculateEffectiveCD(t,s,a,i);return l>e?{canResolve:!1,effectiveCD:l,effectiveK1:r,reason:`光學解析度不足！當前極限 CD 為 ${l}nm，無法解析目標 ${e}nm 製程（磨損或人員疲勞導致 k1 劣化至 ${r}）。`}:{canResolve:!0,effectiveCD:l,effectiveK1:r}}static getProcessWindowPenalty(t){if(t>=.38)return 0;const e=(.38-t)*.5;return Math.max(0,Math.min(.25,e))}}w(q,"OPTICAL_CATALOG",{litho_contact:{modelId:"litho_contact",name:"Contact Aligner (接觸式微影機)",wavelengthNm:436,numericalAperture:.116,baseRayleighLimitNm:3007,unlockTier:1,baseCost:25e5,baseMttrSec:10},litho_projection:{modelId:"litho_projection",name:"1x Projection Aligner (1:1 投影微影機)",wavelengthNm:436,numericalAperture:.194,baseRayleighLimitNm:1798,unlockTier:1,baseCost:6e6,baseMttrSec:15},litho_gline:{modelId:"litho_gline",name:"G-Line Stepper (步進縮小曝光機)",wavelengthNm:436,numericalAperture:.35,baseRayleighLimitNm:997,unlockTier:2,baseCost:18e6,baseMttrSec:20},litho_iline:{modelId:"litho_iline",name:"I-Line Stepper (高壓汞燈微影機)",wavelengthNm:365,numericalAperture:.5,baseRayleighLimitNm:584,unlockTier:3,baseCost:35e6,baseMttrSec:30},litho_krf:{modelId:"litho_krf",name:"KrF DUV Scanner (準分子雷射掃描機)",wavelengthNm:248,numericalAperture:.7,baseRayleighLimitNm:283,unlockTier:4,baseCost:85e6,baseMttrSec:40},litho_arfdry:{modelId:"litho_arfdry",name:"ArF Dry Scanner (氟化氬乾式微影機)",wavelengthNm:193,numericalAperture:.85,baseRayleighLimitNm:182,unlockTier:4,baseCost:18e7,baseMttrSec:50},litho_arfi:{modelId:"litho_arfi",name:"ArFi Immersion TWINSCAN (雙工件台浸潤微影機)",wavelengthNm:193,numericalAperture:1.35,baseRayleighLimitNm:114,unlockTier:5,baseCost:45e7,baseMttrSec:60},litho_euv:{modelId:"litho_euv",name:"EUV Scanner (極紫外真空微影機)",wavelengthNm:13.5,numericalAperture:.33,baseRayleighLimitNm:33,unlockTier:6,baseCost:25e8,baseMttrSec:90},litho_highna:{modelId:"litho_highna",name:"High-NA EUV Scanner (變形高數值孔徑微影機)",wavelengthNm:13.5,numericalAperture:.55,baseRayleighLimitNm:20,unlockTier:6,baseCost:6e9,baseMttrSec:120}});class V{static getPieBonus(t){if(!t||t.workShift==="OFF")return{speedBonus:0,yieldBonus:0};let e=0,s=0;return t.rank==="Young Specialist"?(e=.08,s=.03):t.rank==="Skilled Worker"?(e=.15,s=.06):t.rank==="Senior Engineer"?(e=.25,s=.1):t.rank==="Fellow"&&(e=.4,s=.16),t.moduleSpecialty==="PIE"&&(s+=.02,e+=.05),t.fatigue>=80&&(e*=.6,s*=.6),{speedBonus:Number(e.toFixed(3)),yieldBonus:Number(s.toFixed(3))}}static calculateRollingYieldIndex(t){if(!t||t.length===0)return null;const e=t.slice(-5),a=e.reduce((i,n)=>i+n,0)/e.length;return Number(a.toFixed(4))}static calculateLayerYield(t=1,e=0,s=0){let a=.985*t*(1-e)+s;return Math.max(.7,Math.min(.999,a))}static calculateFinalLotYield(t,e=0){if(t.status==="SCRAPPED")return 0;let s=1;for(let a=0;a<t.totalLayers;a++)s*=this.calculateLayerYield(1,e,0);return s*=t.yieldMultiplier||1,Number(Math.max(0,Math.min(1,s)).toFixed(4))}static calculateLotYield(t,e,s){if(t.hasYellowRoomViolation||t.yieldMultiplier===0)return 0;const a=Math.max(1,t.totalLayers||(s?s.layerCount:6));let i=.915;const n=e.player.unlockedCleanroomClass;n==="Class 1000"?i=.955:n==="Class 100"?i=.975:n==="Class 10"?i=.988:n==="Class 1"?i=.995:n==="ISO 1"&&(i=.9985);const r=e.machines.filter(y=>y.status!=="EXPLODED");let l=0;r.length>0&&(l=r.reduce((y,T)=>y+T.wear,0)/r.length);const d=l/100*.06;let o=0;const c=e.staff.filter(y=>y.workShift!=="OFF");for(const y of c)y.fatigue>=80?o-=.015:y.rank==="Young Specialist"?o+=.005:y.rank==="Skilled Worker"?o+=.01:y.rank==="Senior Engineer"?o+=.018:y.rank==="Fellow"&&(o+=.025);o=Math.max(-.05,Math.min(.06,o));let p=0;if(s&&s.assignedPieId){const y=e.staff.find(v=>v.id===s.assignedPieId);p=this.getPieBonus(y).yieldBonus}let h=0;const m=e.machines.find(y=>y.category==="LITHO"&&y.status!=="EXPLODED");if(m){const y=m.assignedEngineerId?e.staff.find(v=>v.id===m.assignedEngineerId):null,{effectiveK1:T}=q.calculateEffectiveK1(e.unlockedFeatures.cmp?"CAR":"BASE",m.wear,y);h=q.getProcessWindowPenalty(T)}const u=Math.max(.85,i-d/a);let x=Math.pow(u,Math.min(12,a))+o+p-h;t.yieldMultiplier<.99&&t.yieldMultiplier>0&&(x*=t.yieldMultiplier);const g=(Math.random()-.5)*.024;return x+=g,Number(Math.max(.4,Math.min(.985,x)).toFixed(3))}static generateWaferMap(t){const e=[],i=Math.sqrt(8);for(let n=0;n<5;n++)for(let r=0;r<5;r++){const l=n*5+r,d=Math.sqrt((n-2)**2+(r-2)**2),o=d/i,c=1.1-o*.4,p=Math.min(.99,t*c),h=Math.random()<p;e.push({index:l,row:n,col:r,distanceFromCenter:Number(d.toFixed(2)),passed:h,defectType:h?void 0:o>.6?"OPTICAL_DEFOCUS":"PARTICLE"})}for(let n=0;n<e.length;n++)if(!e[n].passed&&Math.random()<.4){const r=e.filter(l=>Math.abs(l.row-e[n].row)<=1&&Math.abs(l.col-e[n].col)<=1&&l.index!==e[n].index);if(r.length>0){const l=r[Math.floor(Math.random()*r.length)];l.passed=!1,l.defectType="CLUSTER"}}return e}}class L{static getTodayDateString(t=new Date){const e=t.getFullYear(),s=String(t.getMonth()+1).padStart(2,"0"),a=String(t.getDate()).padStart(2,"0");return`${e}-${s}-${a}`}static getWeekString(t=new Date){const e=new Date(t.valueOf()),s=(t.getDay()+6)%7;e.setDate(e.getDate()-s+3);const a=e.valueOf();e.setMonth(0,1),e.getDay()!==4&&e.setMonth(0,1+(4-e.getDay()+7)%7);const i=1+Math.ceil((a-e.valueOf())/6048e5);return`${e.getFullYear()}-W${String(i).padStart(2,"0")}`}static getMonthString(t=new Date){const e=t.getFullYear(),s=String(t.getMonth()+1).padStart(2,"0");return`${e}-${s}`}static createEmptyRecord(t,e,s,a=5e7,i=7e7){return{periodType:t,periodIndex:e,label:s,timestamp:Date.now(),revenue:{waferSales:0,nreFees:0,subsidies:0,totalRevenue:0},expenses:{depreciation:0,maintenance:0,utilities:0,payroll:0,scraps:0,capex:0,totalExpenses:0},grossProfit:0,grossMarginPct:0,netProfit:0,netMarginPct:0,endingCash:a,endingNetWorth:i}}static initFinancialState(t=5e7,e=7e7){const s=this.getTodayDateString();return{daySeconds:0,currentDay:1,currentWeek:1,currentMonth:1,currentDateStr:s,today:this.createEmptyRecord("DAY",1,`📅 ${s} (今日)`,t,e),thisWeek:this.createEmptyRecord("WEEK",1,`📅 本周 (${this.getWeekString()})`,t,e),thisMonth:this.createEmptyRecord("MONTH",1,`📅 本月 (${this.getMonthString()})`,t,e),dailyHistory:[],weeklyHistory:[],monthlyHistory:[],allTimeRevenue:0,allTimeExpenses:0,allTimeProfit:0}}static calculateCompanyNetWorth(t){const e=t.player.cash,s=t.machines.reduce((n,r)=>{const l=r.tier*15e6,d=Math.max(.2,(100-r.wear)/100);return n+Math.round(l*d)},0),a=t.facility.cleanroomPhase*25e6,i=t.clawbackDebt||0;return Math.max(0,e+s+a-i)}static recordWaferSales(t,e){const s=this.ensureFinancialState(t);s.today.revenue.waferSales+=e,s.thisWeek.revenue.waferSales+=e,s.thisMonth.revenue.waferSales+=e,s.allTimeRevenue+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static recordNREFee(t,e){const s=this.ensureFinancialState(t);s.today.revenue.nreFees+=e,s.thisWeek.revenue.nreFees+=e,s.thisMonth.revenue.nreFees+=e,s.allTimeRevenue+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static recordSubsidy(t,e){const s=this.ensureFinancialState(t);s.today.revenue.subsidies+=e,s.thisWeek.revenue.subsidies+=e,s.thisMonth.revenue.subsidies+=e,s.allTimeRevenue+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static recordMaintenance(t,e){const s=this.ensureFinancialState(t);s.today.expenses.maintenance+=e,s.thisWeek.expenses.maintenance+=e,s.thisMonth.expenses.maintenance+=e,s.allTimeExpenses+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static recordCapEx(t,e){const s=this.ensureFinancialState(t);s.today.expenses.capex+=e,s.thisWeek.expenses.capex+=e,s.thisMonth.expenses.capex+=e,s.allTimeExpenses+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static recordOpEx(t,e,s){const a=this.ensureFinancialState(t);a.today.expenses.maintenance+=s,a.thisWeek.expenses.maintenance+=s,a.thisMonth.expenses.maintenance+=s,a.allTimeExpenses+=s,this.updateRecordTotals(a.today,t),this.updateRecordTotals(a.thisWeek,t),this.updateRecordTotals(a.thisMonth,t)}static recordSigningBonus(t,e){const s=this.ensureFinancialState(t);s.today.expenses.payroll+=e,s.thisWeek.expenses.payroll+=e,s.thisMonth.expenses.payroll+=e,s.allTimeExpenses+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static recordScrapLoss(t,e){const s=this.ensureFinancialState(t);s.today.expenses.scraps+=e,s.thisWeek.expenses.scraps+=e,s.thisMonth.expenses.scraps+=e,s.allTimeExpenses+=e,this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t)}static tickSimulation(t,e=1){const s=this.ensureFinancialState(t),a=t.machines.reduce((p,h)=>p+h.tier*1200,0)*e;s.today.expenses.depreciation+=Math.round(a),s.thisWeek.expenses.depreciation+=Math.round(a),s.thisMonth.expenses.depreciation+=Math.round(a);const i=t.machines.filter(p=>p.status==="PROCESSING").length,r=(t.facility.cleanroomPhase*800+i*600)*e;s.today.expenses.utilities+=Math.round(r),s.thisWeek.expenses.utilities+=Math.round(r),s.thisMonth.expenses.utilities+=Math.round(r);const o=t.staff.reduce((p,h)=>p+h.salary,0)/300*e;s.today.expenses.payroll+=Math.round(o),s.thisWeek.expenses.payroll+=Math.round(o),s.thisMonth.expenses.payroll+=Math.round(o),this.updateRecordTotals(s.today,t),this.updateRecordTotals(s.thisWeek,t),this.updateRecordTotals(s.thisMonth,t);const c=this.getTodayDateString();if(s.currentDateStr||(s.currentDateStr=c),s.currentDateStr!==c){const p=s.currentDateStr;s.currentDateStr=c,this.closeDay(t,p,c)}}static closeDay(t,e,s){const a=this.ensureFinancialState(t);this.updateRecordTotals(a.today,t),e&&(a.today.label=`📅 ${e} (結算)`),a.dailyHistory.unshift(JSON.parse(JSON.stringify(a.today))),a.dailyHistory.length>14&&a.dailyHistory.pop(),a.daySeconds=0,a.currentDay+=1;const i=s||this.getTodayDateString();a.currentDateStr=i,a.today=this.createEmptyRecord("DAY",a.currentDay,`📅 ${i} (今日)`,t.player.cash,this.calculateCompanyNetWorth(t));const n=e?new Date(e):new Date(Date.now()-864e5),r=new Date(i);this.getWeekString(n)!==this.getWeekString(r)&&this.closeWeek(t),this.getMonthString(n)!==this.getMonthString(r)&&this.closeMonth(t)}static closeWeek(t){const e=this.ensureFinancialState(t);this.updateRecordTotals(e.thisWeek,t),e.weeklyHistory.unshift(JSON.parse(JSON.stringify(e.thisWeek))),e.weeklyHistory.length>8&&e.weeklyHistory.pop(),e.currentWeek+=1;const s=e.currentWeek;e.thisWeek=this.createEmptyRecord("WEEK",s,`📅 本周 (${this.getWeekString()})`,t.player.cash,this.calculateCompanyNetWorth(t))}static closeMonth(t){const e=this.ensureFinancialState(t);this.updateRecordTotals(e.thisMonth,t),e.monthlyHistory.unshift(JSON.parse(JSON.stringify(e.thisMonth))),e.monthlyHistory.length>6&&e.monthlyHistory.pop(),e.currentMonth+=1;const s=e.currentMonth;e.thisMonth=this.createEmptyRecord("MONTH",s,`📅 本月 (${this.getMonthString()})`,t.player.cash,this.calculateCompanyNetWorth(t))}static updateRecordTotals(t,e){t.revenue.totalRevenue=t.revenue.waferSales+t.revenue.nreFees+t.revenue.subsidies,t.expenses.totalExpenses=t.expenses.depreciation+t.expenses.maintenance+t.expenses.utilities+t.expenses.payroll+t.expenses.scraps+t.expenses.capex;const s=t.expenses.depreciation+t.expenses.maintenance+t.expenses.utilities+t.expenses.scraps;t.grossProfit=t.revenue.totalRevenue-s,t.grossMarginPct=t.revenue.totalRevenue>0?Number((t.grossProfit/t.revenue.totalRevenue*100).toFixed(1)):0;const a=s+t.expenses.payroll;t.netProfit=t.revenue.totalRevenue-a,t.netMarginPct=t.revenue.totalRevenue>0?Number((t.netProfit/t.revenue.totalRevenue*100).toFixed(1)):0,t.endingCash=e.player.cash,t.endingNetWorth=this.calculateCompanyNetWorth(e)}static ensureFinancialState(t){return(!t.financialState||!t.financialState.today)&&(t.financialState=this.initFinancialState(t.player.cash,this.calculateCompanyNetWorth(t))),t.financialState.currentDateStr||(t.financialState.currentDateStr=this.getTodayDateString()),t.financialState}static generateCFOAdvisory(t,e){const s=t.revenue.totalRevenue,a=t.grossMarginPct,i=e.player.cash;return s===0?{rating:"WARNING",title:"💤 產線待命中 — 週期營收缺口警示",advice:"本週期尚未認列任何晶圓出貨尾款或 NRE 光罩開發款，但固定水電與工程師薪資持續流出。請立即前往【合約公告板】承接高毛利訂單！",metrics:"毛利率: 0.0% | 產能營收: NT$ 0"}:i<1e7?{rating:"CRITICAL",title:"🚨 流動資金偏低 — 嚴控資本開支",advice:"現金儲備低於安全水位！建議暫緩購買高價新機台，優先全力推進在製晶圓批次出貨，或檢查機台磨損避免意外炸機造成大修支出！",metrics:`流動現金: NT$ ${Math.round(i).toLocaleString()}（建議最低安全門檻: NT$ 20,000,000）`}:a>=53?{rating:"EXCELLENT",title:"🌟 傳奇毛利率 — 達到台積電 53% 卓越標竿！",advice:"恭喜！本週期毛利率高達 "+a+"%，超越全球半導體龍頭 53.0% 標竿！製程良率優異且 NRE 溢價充沛。建議積極將獲利轉入 CapEx 擴大產能，搶佔次世代製程領導地位！",metrics:`當期毛利率: ${a}%（超越全球龍頭標竿 53.0% 達成！）`}:a>=35?{rating:"GOOD",title:"⚖️ 獲利穩健 — 符合晶圓代工常態",advice:"收支結構健康，毛利率維持在良好的 35% ~ 50% 區間。建議透過 🛡️ TPM 在線保養維持零故障，並優化員工排班減少夜班過勞，進一步釋放產能。",metrics:`當期毛利率: ${a}%（符合產業健康標準 35% ~ 45%）`}:{rating:"WARNING",title:"⚠️ 毛利受壓 — 成本與耗損偏高",advice:"本週期毛利率偏低，主要受限於機台維修頻繁、折舊沉重或報廢損失。建議檢查機台配對狀態與工程師職級，減少晶圓報廢，拉升合格晶粒產出比率。",metrics:`當期毛利率: ${a}%（低於產業安全水準 35.0%）`}}}w(L,"DAY_SECONDS",86400),w(L,"DAYS_PER_WEEK",7),w(L,"DAYS_PER_MONTH",30);class ${static getNodeSpec(t){return this.PRICING_TABLE.slice().reverse().find(s=>t<=s.nodeNm)||this.PRICING_TABLE[0]}static calculateUpfrontNRE(t,e,s=1){const a=this.getNodeSpec(t);return Math.round(a.baseNRE*e*s)}static calculateTrustMultiplier(t){if(t===null||isNaN(t))return 1;const e=.7+t*.5;return Math.max(.75,Math.min(1.25,Number(e.toFixed(3))))}static calculateUnitPrice(t,e,s,a){const i=this.getNodeSpec(t),n=1+(e-1)*.08,r=i.basePrice*n*s*a;return Number(r.toFixed(2))}static settleOrderPayout(t,e,s,a,i=0,n=0){const r=Math.max(0,Math.round(e*t.unitPrice-i));let l=0,d=n;if(d>0&&r>0){const p=a.reduce((m,u)=>m+u.salary,0)*1.5,h=s.cash+r;if(h>p){const m=h-p,u=Math.min(m*.25,r*.25);l=Math.min(d,Math.round(u)),d-=l}}const o=r-l;return{grossPayout:r,netPayout:o,debtDeducted:l,remainingDebt:d}}static calculateOverdueClawback(t,e,s=!1){const a=e-t.deadlineGameTime;return a<=0?{clawbackRatio:0,clawbackAmount:0,isCancelled:!1}:s&&a<=86400?{clawbackRatio:.1,clawbackAmount:Math.round(t.nrePaid*.1),isCancelled:!1}:a<=28800?{clawbackRatio:.3,clawbackAmount:Math.round(t.nrePaid*.3),isCancelled:!1}:a<=86400?{clawbackRatio:.7,clawbackAmount:Math.round(t.nrePaid*.7),isCancelled:!1}:{clawbackRatio:1,clawbackAmount:t.nrePaid,isCancelled:!0}}static getMarketRefreshCost(t){return{1:5e4,2:15e4,3:5e5,4:15e5,5:5e6,6:2e7}[t]||5e4}static generateSingleOrder(t,e,s,a=0){const i=["聯發通訊","蘋果核心","輝達智能","高通晶創","超微運算","台積晶心","瑞昱音訊","博通網通"],n=this.PRICING_TABLE.filter(H=>H.minTier<=t),r=this.calculateTrustMultiplier(e),l=n[Math.floor(Math.random()*n.length)],d=i[(a+Math.floor(Math.random()*8))%i.length],o=l.minTier<=2?3:5,c=l.minTier<=2?5:l.minTier<=4?12:24,p=Math.floor(Math.random()*(c-o+1))+o,h=[3,5,10,25][Math.floor(Math.random()*4)],m=l.nodeNm>=1e3?500:2e3,u=h*m,f=[1,1,1,1.2,1.5],x=f[Math.floor(Math.random()*f.length)],g=this.calculateUpfrontNRE(l.nodeNm,p,x),y=this.calculateUnitPrice(l.nodeNm,p,x,r),v=Math.round(p*30*h*.8/x+180),E=s+v,k=x>=1.5?45e3:x>=1.2?7e4:1e5,_=Date.now()+k;return{id:`ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random()*900+100)}`,clientName:d,nodeNm:l.nodeNm,layerCount:p,totalDies:u,goodDiesDelivered:0,nrePaid:g,unitPrice:y,urgencyMultiplier:x,allowedDurationSec:v,marketExpiresAt:_,deadlineGameTime:E,status:"ACTIVE"}}static getAllowedDurationSec(t){if(t.allowedDurationSec&&t.allowedDurationSec>0)return t.allowedDurationSec;const e=Math.max(1,Math.ceil(t.totalDies/(t.nodeNm>=1e3?500:2e3))),s=30,a=t.urgencyMultiplier||1;return Math.round((t.layerCount||4)*s*e*.8/a+180)}static generateContractBoard(t,e,s,a=this.MAX_MARKET_ORDERS){const i=[];for(let n=0;n<a;n++)i.push(this.generateSingleOrder(t,e,s,n));return i}static ensureMarketOrders(t){if(!t.marketOrders||t.marketOrders.length===0){const e=t.rollingYieldHistory&&t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((s,a)=>s+a,0)/t.rollingYieldHistory.length:null;t.marketOrders=this.generateContractBoard(t.player.foundryTier,e,t.gameTime),t.nextOrderRespawnTime=0}}static checkOrderReplenishment(t){if(t.marketOrders||(t.marketOrders=[]),t.marketOrders.length>=this.MAX_MARKET_ORDERS)return t.nextOrderRespawnTime=0,!1;const e=Date.now();if(!t.nextOrderRespawnTime||t.nextOrderRespawnTime===0)return t.nextOrderRespawnTime=e+this.ORDER_RESPAWN_COOLDOWN_MS,!0;if(e>=t.nextOrderRespawnTime){const s=t.rollingYieldHistory&&t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((i,n)=>i+n,0)/t.rollingYieldHistory.length:null,a=this.generateSingleOrder(t.player.foundryTier,s,t.gameTime);return t.marketOrders.push(a),t.marketOrders.length<this.MAX_MARKET_ORDERS?t.nextOrderRespawnTime=e+this.ORDER_RESPAWN_COOLDOWN_MS:t.nextOrderRespawnTime=0,!0}return!1}static checkMarketOrdersExpiry(t){if(!t.marketOrders||t.marketOrders.length===0)return!1;const e=Date.now();let s=!1;const a=t.rollingYieldHistory&&t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((i,n)=>i+n,0)/t.rollingYieldHistory.length:null;for(let i=0;i<t.marketOrders.length;i++){const n=t.marketOrders[i];if(!n.marketExpiresAt){const r=(n.urgencyMultiplier||1)>=1.5?45e3:(n.urgencyMultiplier||1)>=1.2?7e4:1e5;n.marketExpiresAt=e+r;continue}e>=n.marketExpiresAt&&(t.marketOrders[i]=this.generateSingleOrder(t.player.foundryTier,a,t.gameTime,i),s=!0)}return s}static forceRefreshAllMarketOrders(t){const e=t.rollingYieldHistory&&t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((s,a)=>s+a,0)/t.rollingYieldHistory.length:null;t.marketOrders=this.generateContractBoard(t.player.foundryTier,e,t.gameTime),t.nextOrderRespawnTime=0}}w($,"PRICING_TABLE",[{nodeNm:1e4,basePrice:180,baseNRE:18e3,minTier:1},{nodeNm:3e3,basePrice:320,baseNRE:35e3,minTier:1},{nodeNm:1e3,basePrice:500,baseNRE:8e4,minTier:2},{nodeNm:350,basePrice:850,baseNRE:18e4,minTier:3},{nodeNm:180,basePrice:1400,baseNRE:35e4,minTier:3},{nodeNm:90,basePrice:2400,baseNRE:8e5,minTier:4},{nodeNm:45,basePrice:4200,baseNRE:18e5,minTier:4},{nodeNm:28,basePrice:7500,baseNRE:4e6,minTier:5},{nodeNm:7,basePrice:18e3,baseNRE:12e6,minTier:6},{nodeNm:2,basePrice:45e3,baseNRE:35e6,minTier:6}]),w($,"MAX_MARKET_ORDERS",5),w($,"ORDER_RESPAWN_COOLDOWN_MS",6e4);class G{static refreshDailyQuests(t,e,s,a){if(t.lastDateStr===a&&t.dailyQuests.length===3)return t;const i=e.foundryTier,n=[0,6e4,18e4,45e4,12e5,35e5,12e6][i]??6e4,r=[],l=i===1?5:i===2?15:i===3?30:i===4?60:100;r.push({id:`quest_produce_${a}`,title:"穩定投片交付產出",description:`完成出貨累計 ${l} 片合格晶圓至客戶端。`,tier:i,currentValue:0,targetValue:l,rewardCash:n,rewardPopularity:3,completed:!1,claimed:!1}),i>=3&&s.cmp?r.push({id:`quest_cmp_operation_${a}`,title:"平坦化製程精進",description:"成功執行 5 次 CMP 化學機械平坦化拋光研磨。",tier:i,currentValue:0,targetValue:5,rewardCash:Math.round(n*1.2),rewardPopularity:4,completed:!1,claimed:!1}):r.push({id:`quest_maintain_fab_${a}`,title:"廠務設備巡檢維護",description:"指派工程師對機台進行保養或維持機台健康度在 90% 以上。",tier:i,currentValue:0,targetValue:2,rewardCash:n,rewardPopularity:3,completed:!1,claimed:!1});const d=i<=2?2:3;return r.push({id:`quest_order_fulfill_${a}`,title:"光罩合約履約達成",description:`順利交貨並履約 ${d} 筆晶圓製造合約，取得全額尾款。`,tier:i,currentValue:0,targetValue:d,rewardCash:Math.round(n*1.5),rewardPopularity:5,completed:!1,claimed:!1}),{lastDateStr:a,dailyQuests:r,allDailyClaimed:!1,weeklyCompletedCount:t.weeklyCompletedCount??0,weeklyTarget:15,weeklyClaimed:t.weeklyClaimed??!1}}static onWaferDelivered(t,e){for(const s of t.dailyQuests)s.id.startsWith("quest_produce")&&!s.completed&&(s.currentValue+=e,s.currentValue>=s.targetValue&&(s.currentValue=s.targetValue,s.completed=!0))}static onOrderFulfilled(t){for(const e of t.dailyQuests)e.id.startsWith("quest_order_fulfill")&&!e.completed&&(e.currentValue+=1,e.currentValue>=e.targetValue&&(e.currentValue=e.targetValue,e.completed=!0))}static onMachineMaintained(t){for(const e of t.dailyQuests)e.id.startsWith("quest_maintain_fab")&&!e.completed&&(e.currentValue+=1,e.currentValue>=e.targetValue&&(e.currentValue=e.targetValue,e.completed=!0))}static onCmpProcessed(t){for(const e of t.dailyQuests)e.id.startsWith("quest_cmp_operation")&&!e.completed&&(e.currentValue+=1,e.currentValue>=e.targetValue&&(e.currentValue=e.targetValue,e.completed=!0))}static isAllDailyCompleted(t){return t.dailyQuests.length!==3?!1:t.dailyQuests.every(e=>e.completed)}static claimSingleQuest(t,e){const s=t.dailyQuests.find(a=>a.id===e);return s?s.completed?s.claimed?{success:!1,cash:0,popularity:0,message:"該任務獎勵已領取"}:(s.claimed=!0,{success:!0,cash:s.rewardCash,popularity:s.rewardPopularity,message:`領取成功！獲得獎勵金 NT$ ${s.rewardCash.toLocaleString()} 與商譽 +${s.rewardPopularity}！`}):{success:!1,cash:0,popularity:0,message:"該任務尚未達成目標"}:{success:!1,cash:0,popularity:0,message:"找不到該任務"}}static claimDailyAllClear(t,e){if(!this.isAllDailyCompleted(t))return{success:!1,cash:0,popularity:0,message:"尚有每日任務未完成，無法領取全勤特獎"};if(t.allDailyClaimed)return{success:!1,cash:0,popularity:0,message:"今日全勤特獎已經領取過囉"};t.allDailyClaimed=!0,t.weeklyCompletedCount=Math.min(21,(t.weeklyCompletedCount??0)+3);const s=[0,15e4,45e4,12e5,3e6,8e6,25e6][e]??15e4,a=10;return{success:!0,cash:s,popularity:a,message:`🎉 達成今日 3/3 全勤！獲得全勤特獎 NT$ ${s.toLocaleString()}、商譽 +${a}，每週任務進度累計 +3！`}}static claimWeeklyBounty(t,e){if(t.weeklyCompletedCount<t.weeklyTarget)return{success:!1,cash:0,popularity:0,message:`每週任務尚未達標！目前進度 ${t.weeklyCompletedCount}/${t.weeklyTarget}`};if(t.weeklyClaimed)return{success:!1,cash:0,popularity:0,message:"本週龍頭週大獎已領取過囉"};t.weeklyClaimed=!0;const s=[0,1e6,3e6,8e6,2e7,6e7,2e8][e]??1e6,a=30;return{success:!0,cash:s,popularity:a,message:`🏆 榮膺半導體龍頭週大獎！領取巨額扶持金 NT$ ${s.toLocaleString()} 與商譽 +${a}！全廠客戶信任度提升！`}}}class D{static isTileInYellowRoom(t,e,s){return s&&s.length>0?s.some(a=>a.x===t&&a.y===e):e<=3&&t>=3&&t<=7}static isMachineInYellowRoom(t,e){return this.isTileInYellowRoom(t.gridX,t.gridY,e)}static getStationRequiredSeconds(t,e,s,a,i){let n=this.BASE_STATION_DURATION_SEC[t]||10;if(t==="LIT"&&e&&(n=this.LIT_SUBSTEP_DURATION_SEC[e]||10),s&&(n-=Math.min(2,(s.tier-1)*.5),s.wear>50&&(n+=Math.round((s.wear-50)/50*3))),a&&s&&a.moduleSpecialty===s.category&&a.fatigue<80&&(n=Math.max(4,Math.round(n*.85))),i){const r=V.getPieBonus(i);r.speedBonus>0&&(n=Math.max(3,Math.round(n/(1+r.speedBonus))))}return Math.max(3,Math.round(n))}static getStationSequence(t){return t?["FILM","LIT","ETCH","DIFF","CMP"]:["FILM","LIT","ETCH","DIFF"]}static calculateEffectiveQTimeSec(t,e,s,a){let i=45;t==="LIT"&&e==="ETCH"?i=45:t==="ETCH"&&e==="DIFF"?i=60:t==="CMP"&&(i=45);let n=1;a.includes("1000")&&!a.includes("10000")?n=1.15:a.includes("100")&&!a.includes("1000")?n=1.3:a.includes("1")&&!a.includes("10")&&(n=1.5);let r=1;return s>=1e3?r=1.5:s<=28&&(r=.8),Math.round(i*n*r)}static checkQTimeStatus(t,e,s=5e4){if(!t.qTimeDeadline)return{isOverdue:!1,overdueSeconds:0,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:1,urgencyLevel:"SAFE",remainingSeconds:999};const a=t.qTimeDeadline-e,i=t.currentStation==="ETCH";if(a>15)return{isOverdue:!1,overdueSeconds:0,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:1,urgencyLevel:"SAFE",remainingSeconds:a};if(a>0)return{isOverdue:!1,overdueSeconds:0,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:1,urgencyLevel:"WARNING",remainingSeconds:a};const n=Math.abs(a);return n<=15?{isOverdue:!0,overdueSeconds:n,isFatal:!1,canRework:!1,reworkCost:0,penaltyYieldRatio:.65,urgencyLevel:"CRITICAL",remainingSeconds:0}:i?{isOverdue:!0,overdueSeconds:n,isFatal:!0,canRework:!0,reworkCost:s,penaltyYieldRatio:0,urgencyLevel:"EXPIRED",remainingSeconds:0}:{isOverdue:!0,overdueSeconds:n,isFatal:!0,canRework:!1,reworkCost:0,penaltyYieldRatio:0,urgencyLevel:"EXPIRED",remainingSeconds:0}}static executeReworkLot(t,e){return t.currentStation="LIT",t.litSubStep="COAT",t.qTimeDeadline=null,t.status="PROCESSING",t.yieldMultiplier=Math.max(.85,t.yieldMultiplier*.95),{success:!0,message:`成功救回批次 ${t.lotId}！耗費溶劑費 NT$ ${e.toLocaleString()}，已退回黃光塗膠站重新加工。`}}static advanceLotStation(t,e,s,a,i,n,r){const l=this.getStationSequence(e);if(n&&r&&t.currentStation==="LIT"){const o=n.find(p=>p.category==="LITHO"),c=n.find(p=>p.category==="TRACK");(t.litSubStep==="EXPOSE"&&o&&!this.isMachineInYellowRoom(o,r)||(t.litSubStep==="COAT"||t.litSubStep==="DEVELOP")&&c&&!this.isMachineInYellowRoom(c,r))&&(t.yieldMultiplier=0,t.hasYellowRoomViolation=!0)}if(t.currentStation==="LIT"){if(!t.litSubStep||t.litSubStep==="COAT")return t.litSubStep="EXPOSE",t.qTimeDeadline=null,{nextStation:"LIT",nextSubStep:"EXPOSE",isLayerCompleted:!1,isLotCompleted:!1};if(t.litSubStep==="EXPOSE")return t.litSubStep="DEVELOP",t.qTimeDeadline=null,{nextStation:"LIT",nextSubStep:"DEVELOP",isLayerCompleted:!1,isLotCompleted:!1};if(t.litSubStep==="DEVELOP"){t.currentStation="ETCH",t.litSubStep=void 0;const o=this.calculateEffectiveQTimeSec("LIT","ETCH",s,a);return t.qTimeDeadline=i+o,{nextStation:"ETCH",isLayerCompleted:!1,isLotCompleted:!1}}}const d=l.indexOf(t.currentStation);if(d>=0&&d<l.length-1){const o=l[d+1];if(t.currentStation=o,o==="LIT"&&(t.litSubStep="COAT"),t.currentStation==="DIFF"){const c=this.calculateEffectiveQTimeSec("ETCH","DIFF",s,a);t.qTimeDeadline=i+c}else t.qTimeDeadline=null;return{nextStation:o,isLayerCompleted:!1,isLotCompleted:!1}}return t.currentLayer<t.totalLayers?(t.currentLayer+=1,t.currentStation="FILM",t.litSubStep=void 0,t.qTimeDeadline=null,{nextStation:"FILM",isLayerCompleted:!0,isLotCompleted:!1}):(t.status="COMPLETED",t.qTimeDeadline=null,{nextStation:t.currentStation,isLayerCompleted:!0,isLotCompleted:!0})}static calculateStationThroughputs(t,e,s){var d;const a=["FILM","TRACK","LIT","ETCH","DIFF","CMP"],i={FILM:{station:"FILM",totalCapacity:0,machineCount:0,isChokePoint:!1},TRACK:{station:"TRACK",totalCapacity:0,machineCount:0,isChokePoint:!1},LIT:{station:"LIT",totalCapacity:0,machineCount:0,isChokePoint:!1},ETCH:{station:"ETCH",totalCapacity:0,machineCount:0,isChokePoint:!1},DIFF:{station:"DIFF",totalCapacity:0,machineCount:0,isChokePoint:!1},CMP:{station:"CMP",totalCapacity:0,machineCount:0,isChokePoint:!1}},n=new Map;for(const o of e)n.set(o.id,o);for(const o of t){if(o.status==="EXPLODED")continue;let c=o.category;o.category==="LITHO"&&(c="LIT");const p=((d=this.BASE_THROUGHPUT_BY_TIER[c])==null?void 0:d[o.tier])??10,h=1-o.wear/100*.3;let m=1;if(o.assignedEngineerId&&n.has(o.assignedEngineerId)){const f=n.get(o.assignedEngineerId);f.moduleSpecialty===o.category&&f.fatigue<80&&(m=1.2)}c==="LIT"&&o.pairedTrackIds&&o.pairedTrackIds.length>=2&&(m+=.05);const u=p*h*m;i[c].totalCapacity+=u,i[c].machineCount+=1}let r=1/0,l="TRACK";for(const o of a)o==="CMP"&&!s||i[o].totalCapacity<r&&(r=i[o].totalCapacity,l=o);return r<1/0&&l&&(i[l].isChokePoint=!0),i}static calculateLogisticsFactor(t,e,s){let a=.5;t.oht?a=1.2:t.agv&&(a=.85);let i=5;if(e.length>=2){let l=0,d=0;for(let o=0;o<e.length-1;o++){const c=Math.abs(e[o].gridX-e[o+1].gridX)+Math.abs(e[o].gridY-e[o+1].gridY);l+=c,d++}i=d>0?l/d:5}const n=Math.max(.6,Math.min(1.1,6/Math.max(2,i))),r=Math.min(.2,s*.02);return Number((a*n*(1-r)).toFixed(2))}static calculateFactoryWorkload(t,e,s,a,i){const n=this.calculateStationThroughputs(t,e,i),r=this.calculateLogisticsFactor(a,t,s.length),l=["FILM","TRACK","LIT","ETCH","DIFF"];i&&l.push("CMP");let d=1/0;for(const m of l){const u=n[m].totalCapacity;u<d&&(d=u)}const o=Math.max(1,d*r);let c=0;for(const m of s)(m.status==="PROCESSING"||m.status==="WAITING_QTIME"||m.status==="TRANSPORTING")&&(c+=m.waferCount);const p=Math.min(150,Math.round(c/o*100));let h="SMOOTH";return p>85?h="OVERLOADED":p>=70&&(h="HEAVY"),{workloadPercent:p,maxCapacityWafersPerMin:Math.round(o),totalDemandWafers:c,statusLevel:h,throughputs:n}}static diagnoseBottleneck(t,e,s,a,i){var m;const{workloadPercent:n,throughputs:r}=this.calculateFactoryWorkload(t,e,s,a,i),l=t.find(u=>u.wear>=70);if(l){const u=l.category==="LITHO"?"LIT":l.category;return{category:"MAINTENANCE",title:"機台嚴重老化致效能衰退",stationName:l.category,description:`【${l.name}】磨損度高達 ${l.wear}%，抽真空與加工速率嚴重衰退超過 20%！`,recommendation:"請立即指派工程師對該機台執行「就地大修（Overhaul）」或保養，恢復 100% 原始效能。",workloadPercent:n,chokePointThroughput:Math.round(((m=r[u])==null?void 0:m.totalCapacity)??10)}}const d=r.TRACK.totalCapacity,o=r.LIT.totalCapacity;if(d<o&&d<40)return{category:"CAPACITY",title:"塗膠顯影 (Track) 先天物理產能瓶頸",stationName:"TRACK",description:`LITHO 曝光機正在空轉等待！【Track 塗膠顯影站】產能僅 ${Math.round(d)} 片/分，是產線最大卡點！`,recommendation:"光阻旋塗與烘烤受熱擴散物理限制，建議增購第 2 台 Track 機台或將其並聯綁定至微影機以分流消化產能！",workloadPercent:n,chokePointThroughput:Math.round(d)};let c="FILM",p=1/0;const h=["FILM","TRACK","LIT","ETCH","DIFF"];i&&h.push("CMP");for(const u of h)r[u].totalCapacity<p&&(p=r[u].totalCapacity,c=u);return p<=15?{category:"CAPACITY",title:"關鍵製程站點設備數量不足",stationName:c,description:`【${c} 站】產能僅 ${Math.round(p)} 片/分，遠低於其他站點，晶圓在門口嚴重堆積！`,recommendation:`建議前往商城增購第 2 台 ${c} 設備進行分流，或將現有機台升級為更高階型號。`,workloadPercent:n,chokePointThroughput:Math.round(p)}:!a.agv&&!a.oht&&s.length>=2?{category:"LOGISTICS",title:"人工手持搬運效率偏低",stationName:"AMHS 物流",description:"當前仍為「技術員手持晶圓盒步行搬運」，走動搬運耗時佔據了整個製程週期的 40% 以上！",recommendation:"投片量已超越人工負荷極限！強烈建議研發解鎖「地面 AGV 自走車」或「天花板 OHT 天軌」。",workloadPercent:n,chokePointThroughput:Math.round(p)}:{category:"LAYOUT",title:"機台動線規劃待最佳化",stationName:"廠房佈局",description:"前後站點相隔較遠，搬運載具在走道往返耗時過多，拉長了晶圓整體的傳送等待時間。",recommendation:"建議在廠房編輯模式中將相鄰製程機台（如 Track 與 Litho、Etch 與 Diff）就近排列，縮短傳送時間。",workloadPercent:n,chokePointThroughput:Math.round(p)}}static autoFillBestEconomyAllocation(t,e){const s=e.filter(l=>l.category==="LITHO");if(s.length===0)return[];const a=[...s].sort((l,d)=>{var p,h;const o=((p=q.OPTICAL_CATALOG[l.modelId])==null?void 0:p.baseRayleighLimitNm)??9999,c=((h=q.OPTICAL_CATALOG[d.modelId])==null?void 0:h.baseRayleighLimitNm)??9999;return o-c}),i=a[0],n=a[a.length-1],r=[];for(let l=1;l<=t.layerCount;l++){let d=l<=3,o=d?t.nodeNm:Math.max(t.nodeNm*2.5,350),c=d?i.modelId:n.modelId;r.push({layerIndex:l,layerType:d?"關鍵層 (Critical Layer)":"繞線層 (Metal Interconnect)",targetCD:Math.round(o),assignedMachineModelId:c})}return r}static updateMachineNames(t){if(!t||t.length===0)return;const e=new Map;for(const s of t)e.has(s.modelId)||e.set(s.modelId,[]),e.get(s.modelId).push(s);for(const[s,a]of e.entries())if(a.length<=1)for(const i of a)i.name=i.name.replace(/\s*#\d+$/,"").trim();else a.forEach((i,n)=>{const r=i.name.replace(/\s*#\d+$/,"").trim();i.name=`${r} #${n+1}`})}static simulateOfflineCatchUp(t,e){const s=Math.min(14400,Math.max(0,e));if(s<2)return{simulatedSec:0,lotsCompleted:0,wafersDelivered:0,revenueEarned:0};let a=0,i=0,n=0;const r=new Map(t.staff.map(l=>[l.id,l]));for(let l=0;l<s;l++){if(t.gameTime+=1,l%30===0&&L.tickSimulation(t,30),l%10===0)for(const o of t.machines){if(o.status==="EXPLODED")continue;const c=o.assignedEngineerId?r.get(o.assignedEngineerId):null,p=j.updateMachineHealth(o,c,10);o.wear=p.newWear,p.breakdownOccurred&&(o.status=p.isExploded?"EXPLODED":"MAINTENANCE")}if(l%10===0)for(const o of t.staff)if(o.workShift==="OFF")o.fatigue=Math.max(0,o.fatigue-2.5);else{const c=o.shiftMode==="TWO_SHIFT"?.5:.2,p=o.workShift==="NIGHT"?1.5:1;o.fatigue=Math.min(100,o.fatigue+c*p)}const d=[];for(const o of t.activeLots){if(o.status!=="PROCESSING")continue;const c=t.activeOrders.find(h=>h.id===o.orderId),p=c!=null&&c.assignedPieId?t.staff.find(h=>h.id===c.assignedPieId):void 0;if(o.stationProgressSeconds===void 0&&(o.stationProgressSeconds=0),o.stationRequiredSeconds||(o.stationRequiredSeconds=this.getStationRequiredSeconds(o.currentStation,o.litSubStep,void 0,void 0,p)),o.stationProgressSeconds+=1,o.stationProgressSeconds>=o.stationRequiredSeconds){o.stationProgressSeconds=0;const h=c?c.nodeNm:1e4,m=this.advanceLotStation(o,t.unlockedFeatures.cmp,h,t.player.unlockedCleanroomClass,t.gameTime,t.machines,t.facility.yellowRoomTiles);if(o.stationRequiredSeconds=this.getStationRequiredSeconds(o.currentStation,o.litSubStep,void 0,void 0,p),m.isLotCompleted&&(o.status="COMPLETED",a++,c)){const u=t.activeLots.filter(y=>y.orderId===c.id);!o.hasYellowRoomViolation&&o.yieldMultiplier!==0&&(o.yieldMultiplier=V.calculateLotYield(o,t,c));const f=Math.round(c.totalDies/Math.max(1,u.length)*o.yieldMultiplier);c.goodDiesDelivered=Math.min(c.totalDies,c.goodDiesDelivered+f);const x=f>0?o.waferCount||25:0;i+=x,G.onWaferDelivered(t.questState,x),u.every(y=>y.status==="COMPLETED")&&!d.includes(c)&&(c.status="COMPLETED",c.deliveryYield=Number((c.goodDiesDelivered/c.totalDies).toFixed(3)),t.rollingYieldHistory.push(c.deliveryYield),t.rollingYieldHistory.length>5&&t.rollingYieldHistory.shift(),d.push(c))}}}}return $.checkOrderReplenishment(t),$.checkMarketOrdersExpiry(t),{simulatedSec:s,lotsCompleted:a,wafersDelivered:i,revenueEarned:n}}}w(D,"BASE_STATION_DURATION_SEC",{FILM:10,LIT:27,ETCH:12,DIFF:16,CMP:10}),w(D,"LIT_SUBSTEP_DURATION_SEC",{COAT:7,EXPOSE:12,DEVELOP:8}),w(D,"BASE_THROUGHPUT_BY_TIER",{LIT:{1:10,2:25,3:55,4:120,5:260,6:180},TRACK:{1:6,2:16,3:35,4:75,5:140,6:160},FILM:{1:12,2:24,3:50,4:110,5:220,6:200},ETCH:{1:12,2:24,3:50,4:110,5:220,6:200},DIFF:{1:10,2:20,3:45,4:100,5:200,6:180},CMP:{1:0,2:0,3:40,4:90,5:180,6:160}});const A={machines:{litho_contact:{path:"./assets/machines/litho_contact.png",label:"Contact Aligner",tier:1},litho_projection:{path:"./assets/machines/litho_projection.png",label:"1x Projection Aligner",tier:1},litho_gline:{path:"./assets/machines/litho_gline.png",label:"G-Line Stepper",tier:2},litho_iline:{path:"./assets/machines/litho_iline.png",label:"I-Line Stepper",tier:3},litho_krf:{path:"./assets/machines/litho_krf.png",label:"KrF DUV Scanner",tier:4},litho_arfdry:{path:"./assets/machines/litho_arfdry.png",label:"ArF Dry Scanner",tier:4},litho_arfi:{path:"./assets/machines/litho_arfi.png",label:"ArFi Immersion TWINSCAN",tier:5},litho_euv:{path:"./assets/machines/litho_euv.png",label:"EUV Scanner (無標誌 2.5D 旗艦)",tier:6},litho_highna:{path:"./assets/machines/litho_highna.png",label:"High-NA EUV Scanner",tier:6},track_manual:{path:"./assets/machines/track_manual.png",label:"手動旋塗熱板台",tier:1},track_single:{path:"./assets/machines/track_clean.png",label:"單軌自動塗膠顯影機",tier:2},track_dual:{path:"./assets/machines/track_dual.png",label:"雙軌連線 Track",tier:3},track_clean:{path:"./assets/machines/track_clean.png",label:"多工位精密 Clean Track",tier:4},track_advanced:{path:"./assets/machines/track_advanced.png",label:"先進極限分子級 Track",tier:6},etch_wet:{path:"./assets/machines/etch_wet.png",label:"濕式酸槽清洗台",tier:1},etch_plasma:{path:"./assets/machines/etch_plasma.png",label:"電漿乾式蝕刻機 (RIE)",tier:3},film_furnace:{path:"./assets/machines/film_furnace.png",label:"高溫熱氧化爐管",tier:1},film_pecvd:{path:"./assets/machines/film_pecvd.png",label:"電漿化學沉積 / ALD 機",tier:4},diff_furnace:{path:"./assets/machines/diff_furnace.png",label:"熱擴散高溫爐管",tier:1},diff_implanter:{path:"./assets/machines/diff_implanter.png",label:"大束流離子佈植機",tier:2},cmp_polisher:{path:"./assets/machines/cmp_polisher.png",label:"化學機械平坦化研磨機",tier:3}},characters:{tech_cleanroom:{path:"./assets/characters/tech_cleanroom.png",label:"Cleanroom Technician"},agv_carrier:{path:"./assets/characters/agv_carrier.png",label:"AGV Wafer Carrier"},oht_shuttle:{path:"./assets/characters/oht_shuttle.png",label:"OHT Sky-Rail Shuttle"}}};class b{static getContext(){if(this.isMuted)return null;if(!this.audioCtx){const t=window.AudioContext||window.webkitAudioContext;t&&(this.audioCtx=new t)}return this.audioCtx&&this.audioCtx.state==="suspended"&&this.audioCtx.resume(),this.audioCtx}static toggleMute(){return this.isMuted=!this.isMuted,this.isMuted}static isAudioMuted(){return this.isMuted}static playClick(){const t=this.getContext();if(!t)return;const e=t.createOscillator(),s=t.createGain(),a=t.currentTime;e.type="sine",e.frequency.setValueAtTime(800,a),e.frequency.exponentialRampToValueAtTime(1200,a+.04),s.gain.setValueAtTime(.15,a),s.gain.exponentialRampToValueAtTime(.001,a+.04),e.connect(s),s.connect(t.destination),e.start(a),e.stop(a+.04)}static playCoin(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.createOscillator(),a=t.createOscillator(),i=t.createGain();s.type="sine",s.frequency.setValueAtTime(987.77,e),s.frequency.setValueAtTime(1318.51,e+.08),a.type="triangle",a.frequency.setValueAtTime(1975.53,e+.08),i.gain.setValueAtTime(.2,e),i.gain.exponentialRampToValueAtTime(.001,e+.28),s.connect(i),a.connect(i),i.connect(t.destination),s.start(e),s.stop(e+.28),a.start(e+.08),a.stop(e+.28)}static playCoinChime(){this.playCoin()}static playSuccess(){const t=this.getContext();if(!t)return;const e=t.currentTime;[523.25,659.25,783.99,1046.5].forEach((a,i)=>{const n=t.createOscillator(),r=t.createGain(),l=e+i*.08;n.type="triangle",n.frequency.setValueAtTime(a,l),r.gain.setValueAtTime(.2,l),r.gain.exponentialRampToValueAtTime(.001,l+.35),n.connect(r),r.connect(t.destination),n.start(l),n.stop(l+.35)})}static playFanfare(){this.playSuccess()}static playWarning(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.createOscillator(),a=t.createGain();s.type="sawtooth",s.frequency.setValueAtTime(440,e),s.frequency.setValueAtTime(554.37,e+.1),a.gain.setValueAtTime(.12,e),a.gain.exponentialRampToValueAtTime(.001,e+.25),s.connect(a),a.connect(t.destination),s.start(e),s.stop(e+.25)}static playCriticalAlarm(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.createOscillator(),a=t.createGain();s.type="sawtooth",s.frequency.setValueAtTime(600,e),s.frequency.linearRampToValueAtTime(950,e+.18),s.frequency.linearRampToValueAtTime(600,e+.36),a.gain.setValueAtTime(.18,e),a.gain.exponentialRampToValueAtTime(.001,e+.4),s.connect(a),a.connect(t.destination),s.start(e),s.stop(e+.4)}static playExplosion(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.sampleRate*.6,a=t.createBuffer(1,s,t.sampleRate),i=a.getChannelData(0);for(let d=0;d<s;d++)i[d]=Math.random()*2-1;const n=t.createBufferSource();n.buffer=a;const r=t.createBiquadFilter();r.type="lowpass",r.frequency.setValueAtTime(800,e),r.frequency.exponentialRampToValueAtTime(40,e+.6);const l=t.createGain();l.gain.setValueAtTime(.4,e),l.gain.exponentialRampToValueAtTime(.001,e+.6),n.connect(r),r.connect(l),l.connect(t.destination),n.start(e),n.stop(e+.6)}static playRework(){const t=this.getContext();if(!t)return;const e=t.currentTime,s=t.sampleRate*.4,a=t.createBuffer(1,s,t.sampleRate),i=a.getChannelData(0);for(let d=0;d<s;d++)i[d]=Math.random()*2-1;const n=t.createBufferSource();n.buffer=a;const r=t.createBiquadFilter();r.type="bandpass",r.frequency.setValueAtTime(1200,e),r.frequency.exponentialRampToValueAtTime(300,e+.4),r.Q.value=3;const l=t.createGain();l.gain.setValueAtTime(.2,e),l.gain.exponentialRampToValueAtTime(.001,e+.4),n.connect(r),r.connect(l),l.connect(t.destination),n.start(e),n.stop(e+.4)}static playAlarm(){this.playWarning()}static playDing(){this.playCoin()}}w(b,"audioCtx",null),w(b,"isMuted",!1);const de=class de extends Phaser.Scene{constructor(){super({key:de.KEY});w(this,"saveGame");w(this,"tileWidth",200);w(this,"tileHeight",100);w(this,"isPlannerMode",!1);w(this,"plannerTool","NONE");w(this,"movingMachineId",null);w(this,"pointerDownMachineId",null);w(this,"plannerIndicatorGraphics");w(this,"selectionRingGraphics");w(this,"onStateUpdateCallback");w(this,"floorGraphics");w(this,"railGraphics");w(this,"machineMap",new Map);w(this,"technicians",[]);w(this,"ohtShuttles",[]);w(this,"agvCarriers",[]);w(this,"isDragging",!1);w(this,"dragStartX",0);w(this,"dragStartY",0);w(this,"totalDragDistance",0);w(this,"dragThreshold",6);w(this,"justSelectedMachineOnPointerUp",!1);w(this,"onMachineClickCallback")}init(e){this.saveGame=e.saveGame,this.onMachineClickCallback=e.onMachineClick,this.onStateUpdateCallback=e.onStateUpdate}preload(){this.load.on("complete",()=>{this.refreshMachineSprites()}),this.load.on("loaderror",e=>{console.warn("⚠️ 貼圖載入失敗:",e==null?void 0:e.key,e==null?void 0:e.url)});for(const[e,s]of Object.entries(A.machines))this.textures.exists(e)||this.load.image(e,s.path);for(const[e,s]of Object.entries(A.characters))!this.textures.exists(e)&&s.path&&this.load.image(e,s.path)}refreshMachineSprites(){for(const e of this.saveGame.machines){const s=this.machineMap.get(e.id);if(s&&!s.sprite&&this.textures.exists(e.modelId)){s.fallback&&(s.fallback.destroy(),s.fallback=void 0);const a=this.add.image(0,-35,e.modelId),i=this.tileWidth*.95;a.setDisplaySize(i,i),s.container.addAt(a,1),s.sprite=a}}}create(){this.floorGraphics=this.add.graphics(),this.selectionRingGraphics=this.add.graphics(),this.selectionRingGraphics.setDepth(45),this.plannerIndicatorGraphics=this.add.graphics(),this.plannerIndicatorGraphics.setDepth(48),this.railGraphics=this.add.graphics(),this.renderFloor(),this.renderOHTRails(),this.renderMachines(),this.spawnTechnicians(),this.spawnAGVCarriers(),this.spawnOHTShuttles(),this.cameras.main.centerOn(0,300),this.cameras.main.setZoom(.85),this.setupCameraControls(),this.scale.on("resize",this.onResize,this)}toScreen(e,s){const a=(e-s)*(this.tileWidth/2),i=(e+s)*(this.tileHeight/2);return{x:a,y:i}}toGrid(e,s){const a=Math.round(e/this.tileWidth+s/this.tileHeight),i=Math.round(s/this.tileHeight-e/this.tileWidth);return{gridX:a,gridY:i}}renderFloor(){this.floorGraphics.clear();const e=this.saveGame.facility.bayGridSize,s=this.saveGame.facility.yellowRoomTiles||[];for(let a=0;a<e.width;a++)for(let i=0;i<e.height;i++){const{x:n,y:r}=this.toScreen(a,i),l=s.length>0?s.some(h=>h.x===a&&h.y===i):i<=3&&a>=3&&a<=7,d={x:n,y:r-this.tileHeight/2},o={x:n+this.tileWidth/2,y:r},c={x:n,y:r+this.tileHeight/2},p={x:n-this.tileWidth/2,y:r};l?(this.floorGraphics.fillStyle(3153414,.96),this.floorGraphics.lineStyle(1.8,16096779,.55)):(this.floorGraphics.fillStyle((a+i)%2===0?594210:792109,.95),this.floorGraphics.lineStyle(1,1976635,.55)),this.floorGraphics.beginPath(),this.floorGraphics.moveTo(d.x,d.y),this.floorGraphics.lineTo(o.x,o.y),this.floorGraphics.lineTo(c.x,c.y),this.floorGraphics.lineTo(p.x,p.y),this.floorGraphics.closePath(),this.floorGraphics.fillPath(),this.floorGraphics.strokePath()}}renderOHTRails(){this.railGraphics.clear();const e=this.saveGame.facility.bayGridSize,s=-160;this.railGraphics.lineStyle(2.5,440020,.35);const a=this.toScreen(1,1),i=this.toScreen(e.width-2,1),n=this.toScreen(e.width-2,e.height-2),r=this.toScreen(1,e.height-2);this.railGraphics.beginPath(),this.railGraphics.moveTo(a.x,a.y+s),this.railGraphics.lineTo(i.x,i.y+s),this.railGraphics.lineTo(n.x,n.y+s),this.railGraphics.lineTo(r.x,r.y+s),this.railGraphics.closePath(),this.railGraphics.strokePath()}renderMachines(){D.updateMachineNames(this.saveGame.machines);const e=new Set(this.saveGame.machines.map(a=>a.id));for(const[a,i]of this.machineMap)e.has(a)||(i.container.destroy(),this.machineMap.delete(a));const s=new Map(this.saveGame.staff.map(a=>[a.id,a]));for(const a of this.saveGame.machines){const{x:i,y:n}=this.toScreen(a.gridX,a.gridY),r=(a.gridX+a.gridY)*10+50;let l=this.machineMap.get(a.id);if(l){if(l.container.setPosition(i,n),l.container.setDepth(r),!l.sprite&&this.textures.exists(a.modelId)){l.fallback&&(l.fallback.destroy(),l.fallback=void 0);const h=this.add.image(0,-25,a.modelId),m=118;h.setDisplaySize(m,m),l.container.addAt(h,1),l.sprite=h}if(l.ledArc.setFillStyle(this.getLEDColor(a.status)),l.label.setText(`${a.name} (${Math.round(a.wear)}%)`),a.status==="PROCESSING"){if(!l.processingText){const h=this.add.text(0,-104,"⚡ 加工中",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#38bdf8",backgroundColor:"rgba(8, 47, 73, 0.95)",padding:{x:5,y:2}});h.setOrigin(.5),l.container.add(h),l.processingText=h}}else l.processingText&&(l.processingText.destroy(),l.processingText=void 0);const d=D.isMachineInYellowRoom(a,this.saveGame.facility.yellowRoomTiles);if((a.category==="LITHO"||a.category==="TRACK")&&!d){if(!l.yellowAlertText){const h=this.add.text(0,-125,"🚨 缺乏黃光防護 (良率 0%)",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#ffffff",backgroundColor:"rgba(220, 38, 38, 0.95)",padding:{x:6,y:3}});h.setOrigin(.5),l.container.add(h),l.yellowAlertText=h}}else l.yellowAlertText&&(l.yellowAlertText.destroy(),l.yellowAlertText=void 0);const c=a.assignedEngineerId?s.get(a.assignedEngineerId):null,p=j.checkTPMConditions(a,c);if(p.isTPMActive&&!l.tpmText){const h=this.add.text(0,-104,"🛡️ TPM 零故障",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#10b981",backgroundColor:"rgba(6, 78, 59, 0.92)",padding:{x:5,y:2}});h.setOrigin(.5),l.container.add(h),l.tpmText=h}else!p.isTPMActive&&l.tpmText&&(l.tpmText.destroy(),l.tpmText=void 0)}else{const d=this.add.container(i,n);d.setDepth(r);const o=this.add.ellipse(0,10,88,38,0,.4);d.add(o);let c,p;const h=118;this.textures.exists(a.modelId)?(c=this.add.image(0,-25,a.modelId),c.setDisplaySize(h,h),d.add(c)):(p=this.createFallbackMachineGraphic(a),d.add(p));const m=this.getLEDColor(a.status),u=this.add.circle(0,-82,6,m);d.add(u);const f=this.add.text(0,18,`${a.name} (${Math.round(a.wear)}%)`,{fontFamily:"Noto Sans TC, sans-serif",fontSize:"11px",fontStyle:"bold",color:"#f8fafc",backgroundColor:"rgba(15, 23, 42, 0.88)",padding:{x:6,y:3}});f.setOrigin(.5),d.add(f);const x=a.assignedEngineerId?s.get(a.assignedEngineerId):null,g=j.checkTPMConditions(a,x);let y;g.isTPMActive&&(y=this.add.text(0,-104,"🛡️ TPM 零故障",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#10b981",backgroundColor:"rgba(6, 78, 59, 0.92)",padding:{x:5,y:2}}),y.setOrigin(.5),d.add(y));let T;a.status==="PROCESSING"&&(T=this.add.text(0,-104,"⚡ 加工中",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#38bdf8",backgroundColor:"rgba(8, 47, 73, 0.95)",padding:{x:5,y:2}}),T.setOrigin(.5),d.add(T));const v=D.isMachineInYellowRoom(a,this.saveGame.facility.yellowRoomTiles),E=a.category==="LITHO"||a.category==="TRACK";let k;E&&!v&&(k=this.add.text(0,-125,"🚨 缺乏黃光防護 (良率 0%)",{fontFamily:"Noto Sans TC, sans-serif",fontSize:"10px",fontStyle:"bold",color:"#ffffff",backgroundColor:"rgba(220, 38, 38, 0.95)",padding:{x:6,y:3}}),k.setOrigin(.5),d.add(k));const _=96,H=96;d.setInteractive(new Phaser.Geom.Rectangle(-_/2,-H+15,_,H),Phaser.Geom.Rectangle.Contains),d.on("pointerdown",I=>{var P;document.querySelector(".modal-backdrop")||(((P=document.getElementById("modal-container"))==null?void 0:P.children.length)??0)>0||(this.pointerDownMachineId=a.id,I.event&&I.event.stopPropagation())}),d.on("pointerover",()=>{var P;if(document.querySelector(".modal-backdrop")||(((P=document.getElementById("modal-container"))==null?void 0:P.children.length)??0)>0)return;const I=this.machineMap.get(a.id);I!=null&&I.sprite&&I.sprite.setTint(3718648)}),d.on("pointerout",()=>{const I=this.machineMap.get(a.id);I!=null&&I.sprite&&I.sprite.clearTint()}),d.on("pointerup",I=>{var P;if(document.querySelector(".modal-backdrop")||(((P=document.getElementById("modal-container"))==null?void 0:P.children.length)??0)>0){this.pointerDownMachineId=null;return}this.pointerDownMachineId===a.id&&this.totalDragDistance<=this.dragThreshold&&(I.event&&I.event.stopPropagation(),b.playClick(),this.isPlannerMode&&this.plannerTool==="MOVE_MACHINE"?(this.justSelectedMachineOnPointerUp=!0,this.selectMachineToMove(a)):this.isPlannerMode||this.onMachineClickCallback&&this.onMachineClickCallback(a)),this.pointerDownMachineId=null}),this.machineMap.set(a.id,{container:d,ledArc:u,label:f,tpmText:y,processingText:T,yellowAlertText:k,sprite:c,fallback:p})}}}createFallbackMachineGraphic(e){const s=this.add.graphics(),a=60;let i=3900150;return e.category==="LITHO"&&(i=16096779),e.category==="TRACK"&&(i=1096065),e.category==="ETCH"&&(i=9133302),e.category==="DIFF"&&(i=15485081),e.category==="CMP"&&(i=440020),s.fillStyle(i,.9),s.beginPath(),s.moveTo(0,-70),s.lineTo(a/2,-60),s.lineTo(0,-50),s.lineTo(-a/2,-60),s.closePath(),s.fillPath(),s.fillStyle(i,.7),s.beginPath(),s.moveTo(-a/2,-60),s.lineTo(0,-50),s.lineTo(0,0),s.lineTo(-a/2,-10),s.closePath(),s.fillPath(),s.fillStyle(i,.5),s.beginPath(),s.moveTo(0,-50),s.lineTo(a/2,-60),s.lineTo(a/2,-10),s.lineTo(0,0),s.closePath(),s.fillPath(),s}getLEDColor(e){switch(e){case"IDLE":return 1096065;case"PROCESSING":return 440020;case"MAINTENANCE":return 16096779;case"EXPLODED":return 15680580}}spawnTechnicians(){const e=Math.min(6,Math.max(2,this.saveGame.staff.length));for(let s=0;s<e;s++){const a=this.add.container(0,0);a.setDepth(200);const i=this.add.ellipse(0,4,18,9,0,.35);if(a.add(i),this.textures.exists("tech_cleanroom")){const r=this.add.image(0,-18,"tech_cleanroom");r.setDisplaySize(48,48),a.add(r)}else{const r=this.add.circle(0,-12,8,16317180),l=this.add.rectangle(0,-12,8,4,3718648),d=this.add.rectangle(0,-4,12,12,14870768);a.add([d,r,l])}const n=this.toScreen(2+s,3);a.setPosition(n.x,n.y),this.technicians.push({container:a,targetX:n.x,targetY:n.y,speed:.6+Math.random()*.4})}}spawnAGVCarriers(){if(this.saveGame.unlockedFeatures.agv)for(let e=0;e<2;e++){const s=this.add.container(0,0);s.setDepth(205);const a=this.add.ellipse(0,4,24,12,0,.4);if(s.add(a),this.textures.exists("agv_carrier")){const n=this.add.image(0,-14,"agv_carrier");n.setDisplaySize(54,40),s.add(n)}else{const n=this.add.rectangle(0,-8,28,16,165063),r=this.add.rectangle(0,-18,16,12,1096065),l=this.add.circle(10,-8,3,15680580);s.add([n,r,l])}const i=this.toScreen(1+e*3,2);s.setPosition(i.x,i.y),this.agvCarriers.push({container:s,targetX:i.x,targetY:i.y,speed:1.1+e*.2})}}spawnOHTShuttles(){if(!this.saveGame.unlockedFeatures.oht)return;const e=!!this.saveGame.unlockedFeatures.shrOht,s=this.add.container(0,-160);if(s.setDepth(500),this.textures.exists("oht_shuttle")){const i=this.add.image(0,16,"oht_shuttle");i.setDisplaySize(56,42),e&&i.setTint(3462041),s.add(i)}else{const i=this.add.rectangle(0,0,8,12,4674921),n=this.add.rectangle(0,10,32,18,e?1096065:959977),r=this.add.rectangle(0,22,20,16,1096065),l=this.add.circle(12,10,3,e?1096065:2278750);s.add([i,n,r,l])}const a=this.toScreen(1,1);s.setPosition(a.x,a.y-160),this.ohtShuttles.push({container:s,progress:0,speed:e?.005:.002})}update(e,s){const a=this.saveGame.facility.bayGridSize,i=[this.toScreen(1,1),this.toScreen(a.width-2,1),this.toScreen(a.width-2,a.height-2),this.toScreen(1,a.height-2)];for(const n of this.ohtShuttles){n.progress=(n.progress+n.speed*(s/16))%1;const r=i.length,l=Math.floor(n.progress*r),d=(l+1)%r,o=n.progress*r%1,c=i[l],p=i[d],h=c.x+(p.x-c.x)*o,m=c.y+(p.y-c.y)*o-160;n.container.setPosition(h,m)}for(const n of this.technicians){const r=n.targetX-n.container.x,l=n.targetY-n.container.y,d=Math.sqrt(r*r+l*l);if(d<4){const o=Math.floor(Math.random()*(a.width-2))+1,c=Math.floor(Math.random()*(a.height-2))+1,p=this.toScreen(o,c);n.targetX=p.x,n.targetY=p.y}else n.container.x+=r/d*n.speed*(s/16),n.container.y+=l/d*n.speed*(s/16)}for(const n of this.agvCarriers){const r=n.targetX-n.container.x,l=n.targetY-n.container.y,d=Math.sqrt(r*r+l*l);if(d<4){const o=Math.floor(Math.random()*(a.width-2))+1,c=Math.floor(Math.random()*(a.height-2))+1,p=this.toScreen(o,c);n.targetX=p.x,n.targetY=p.y}else n.container.x+=r/d*n.speed*(s/16),n.container.y+=l/d*n.speed*(s/16)}}setPlannerMode(e,s="NONE"){this.isPlannerMode=e,this.plannerTool=s,this.movingMachineId=null,this.plannerIndicatorGraphics.clear(),this.selectionRingGraphics.clear()}selectMachineToMove(e){if(this.movingMachineId===e.id){this.movingMachineId=null,this.selectionRingGraphics.clear(),this.plannerIndicatorGraphics.clear(),b.playClick();return}this.movingMachineId=e.id,b.playClick(),this.drawSelectionRing(e.gridX,e.gridY)}drawSelectionRing(e,s){this.selectionRingGraphics.clear();const{x:a,y:i}=this.toScreen(e,s);this.selectionRingGraphics.lineStyle(3.5,440020,.95);const n={x:a,y:i-this.tileHeight/2-2},r={x:a+this.tileWidth/2+4,y:i},l={x:a,y:i+this.tileHeight/2+2},d={x:a-this.tileWidth/2-4,y:i};this.selectionRingGraphics.beginPath(),this.selectionRingGraphics.moveTo(n.x,n.y),this.selectionRingGraphics.lineTo(r.x,r.y),this.selectionRingGraphics.lineTo(l.x,l.y),this.selectionRingGraphics.lineTo(d.x,d.y),this.selectionRingGraphics.closePath(),this.selectionRingGraphics.strokePath()}updatePlannerCursorIndicator(e,s){if(!this.isPlannerMode||!this.plannerIndicatorGraphics)return;this.plannerIndicatorGraphics.clear();const{gridX:a,gridY:i}=this.toGrid(e,s),n=this.saveGame.facility.bayGridSize;if(a<0||a>=n.width||i<0||i>=n.height)return;const{x:r,y:l}=this.toScreen(a,i),d={x:r,y:l-this.tileHeight/2},o={x:r+this.tileWidth/2,y:l},c={x:r,y:l+this.tileHeight/2},p={x:r-this.tileWidth/2,y:l};this.plannerTool==="PAINT_YELLOW"?(this.plannerIndicatorGraphics.fillStyle(16096779,.45),this.plannerIndicatorGraphics.lineStyle(2.5,16498468,.95)):this.plannerTool==="PAINT_WHITE"?(this.plannerIndicatorGraphics.fillStyle(165063,.45),this.plannerIndicatorGraphics.lineStyle(2.5,3718648,.95)):this.plannerTool==="MOVE_MACHINE"&&(this.saveGame.machines.some(m=>m.id!==this.movingMachineId&&m.gridX===a&&m.gridY===i)?(this.plannerIndicatorGraphics.fillStyle(15680580,.45),this.plannerIndicatorGraphics.lineStyle(2.5,16281969,.95)):(this.plannerIndicatorGraphics.fillStyle(1096065,.45),this.plannerIndicatorGraphics.lineStyle(2.5,3462041,.95))),this.plannerIndicatorGraphics.beginPath(),this.plannerIndicatorGraphics.moveTo(d.x,d.y),this.plannerIndicatorGraphics.lineTo(o.x,o.y),this.plannerIndicatorGraphics.lineTo(c.x,c.y),this.plannerIndicatorGraphics.lineTo(p.x,p.y),this.plannerIndicatorGraphics.closePath(),this.plannerIndicatorGraphics.fillPath(),this.plannerIndicatorGraphics.strokePath()}handlePlannerTileClick(e,s){var i,n,r;const a=this.saveGame.facility.bayGridSize;if(!(e<0||e>=a.width||s<0||s>=a.height)){if(this.plannerTool==="PAINT_YELLOW")this.saveGame.facility.yellowRoomTiles||(this.saveGame.facility.yellowRoomTiles=[]),this.saveGame.facility.yellowRoomTiles.some(d=>d.x===e&&d.y===s)||(this.saveGame.facility.yellowRoomTiles.push({x:e,y:s}),b.playClick(),this.renderFloor(),this.renderMachines(),(i=this.onStateUpdateCallback)==null||i.call(this));else if(this.plannerTool==="PAINT_WHITE"){if(this.saveGame.facility.yellowRoomTiles){const l=this.saveGame.facility.yellowRoomTiles.findIndex(d=>d.x===e&&d.y===s);l>=0&&(this.saveGame.facility.yellowRoomTiles.splice(l,1),b.playClick(),this.renderFloor(),this.renderMachines(),(n=this.onStateUpdateCallback)==null||n.call(this))}}else if(this.plannerTool==="MOVE_MACHINE"&&this.movingMachineId){const l=this.saveGame.machines.find(o=>o.id===this.movingMachineId);if(!l||l.gridX===e&&l.gridY===s)return;if(this.saveGame.machines.some(o=>o.id!==this.movingMachineId&&o.gridX===e&&o.gridY===s)){b.playAlarm();return}l.gridX=e,l.gridY=s,b.playDing(),this.movingMachineId=null,this.selectionRingGraphics.clear(),this.plannerIndicatorGraphics.clear(),this.renderMachines(),this.renderOHTRails(),(r=this.onStateUpdateCallback)==null||r.call(this)}}}setupCameraControls(){this.input.on("pointerdown",e=>{var s;document.querySelector(".modal-backdrop")||(((s=document.getElementById("modal-container"))==null?void 0:s.children.length)??0)>0||e.leftButtonDown()&&(this.isDragging=!0,this.dragStartX=e.x,this.dragStartY=e.y,this.totalDragDistance=0)}),this.input.on("pointermove",e=>{if(this.isPlannerMode){const s=this.cameras.main.getWorldPoint(e.x,e.y);this.updatePlannerCursorIndicator(s.x,s.y)}if(this.isDragging){if(!e.isDown||!e.leftButtonDown()){this.isDragging=!1;return}const s=e.x-this.dragStartX,a=e.y-this.dragStartY;this.totalDragDistance+=Math.hypot(s,a),this.totalDragDistance>this.dragThreshold&&(this.cameras.main.scrollX-=s*.85/this.cameras.main.zoom,this.cameras.main.scrollY-=a*.85/this.cameras.main.zoom),this.dragStartX=e.x,this.dragStartY=e.y}}),this.input.on("pointerup",e=>{var a;const s=this.totalDragDistance>this.dragThreshold;if(this.isDragging=!1,this.pointerDownMachineId=null,this.justSelectedMachineOnPointerUp){this.justSelectedMachineOnPointerUp=!1;return}if(!(document.querySelector(".modal-backdrop")||(((a=document.getElementById("modal-container"))==null?void 0:a.children.length)??0)>0)&&!s&&this.isPlannerMode){const i=this.cameras.main.getWorldPoint(e.x,e.y),{gridX:n,gridY:r}=this.toGrid(i.x,i.y);this.handlePlannerTileClick(n,r)}}),window.addEventListener("mouseup",()=>{this.isDragging=!1,this.pointerDownMachineId=null}),window.addEventListener("blur",()=>{this.isDragging=!1,this.pointerDownMachineId=null}),this.input.on("wheel",(e,s,a,i)=>{var r;if(document.querySelector(".modal-backdrop")||(((r=document.getElementById("modal-container"))==null?void 0:r.children.length)??0)>0)return;const n=Phaser.Math.Clamp(this.cameras.main.zoom-i*.001,.45,2.2);this.cameras.main.setZoom(n)})}onResize(e){this.cameras.main.setSize(e.width,e.height)}updateState(e){const s=!this.saveGame||e.userId&&this.saveGame.userId!==e.userId;if(this.saveGame=e,s){for(const[a,i]of this.machineMap)i.container.destroy();this.machineMap.clear();for(const a of this.technicians)a.container.destroy();this.technicians=[];for(const a of this.agvCarriers)a.container.destroy();this.agvCarriers=[];for(const a of this.ohtShuttles)a.container.destroy();this.ohtShuttles=[],this.movingMachineId=null,this.selectionRingGraphics.clear(),this.plannerIndicatorGraphics.clear(),this.renderFloor(),this.renderOHTRails(),this.renderMachines(),this.spawnTechnicians(),this.saveGame.unlockedFeatures.agv&&this.spawnAGVCarriers(),this.saveGame.unlockedFeatures.oht&&this.spawnOHTShuttles()}else if(this.renderFloor(),this.renderMachines(),this.saveGame.unlockedFeatures.agv&&this.agvCarriers.length===0&&this.spawnAGVCarriers(),this.saveGame.unlockedFeatures.oht){if(this.ohtShuttles.length===0)this.spawnOHTShuttles();else if(this.saveGame.unlockedFeatures.shrOht)for(const a of this.ohtShuttles){a.speed=.005;const i=a.container.getAt(0);i&&i.setTint&&i.setTint(3462041)}}}};w(de,"KEY","CleanroomScene");let ne=de;class N{static getInitialAchievements(){return JSON.parse(JSON.stringify(this.INITIAL_ACHIEVEMENTS))}static checkAchievements(t){const e=[],s=new Map;for(const d of t.achievements)s.set(d.id,d);const a=d=>{const o=s.get(d);o&&!o.unlocked&&(o.unlocked=!0,e.push(o))};t.rollingYieldHistory.length>=1&&a("first_silicon"),(t.activeLots.some(d=>d.currentStation==="LIT"||d.currentStation==="ETCH"||d.currentStation==="DIFF")||t.rollingYieldHistory.length>=1)&&a("step_into_yellow");const n=t.activeOrders.filter(d=>d.status==="FULFILLED");n.length>=1&&a("first_cash"),t.unlockedFeatures.mesAutoDispatch&&a("mes_mastery"),n.some(d=>d.nodeNm<=350)&&a("submicron_explorer"),t.unlockedFeatures.cmp&&t.machines.some(d=>d.category==="CMP")&&a("copper_cmp_era"),t.machines.some(d=>d.modelId==="litho_arfi")&&a("immersion_wave"),t.machines.some(d=>d.modelId==="litho_euv"||d.modelId==="litho_highna")&&a("euv_domination");const r=new Map(t.staff.map(d=>[d.id,d]));let l=0;for(const d of t.machines){const o=d.assignedEngineerId?r.get(d.assignedEngineerId):null;j.checkTPMConditions(d,o).isTPMActive&&l++}if(l>=3&&a("tpm_zero_defect"),t.machines.some(d=>{var o;return d.category==="LITHO"&&(((o=d.pairedTrackIds)==null?void 0:o.length)??0)>=2})&&a("inline_cluster_master"),t.facility.cleanroomPhase>=4&&a("gigafab_expansion"),t.unlockedFeatures.agv&&t.unlockedFeatures.oht&&a("automation_highway"),t.rollingYieldHistory.some(d=>d>=.99)&&a("flawless_wafer"),t.rollingYieldHistory.length>=5){const d=t.rollingYieldHistory.slice(-5);d.reduce((c,p)=>c+p,0)/d.length>=.95&&a("five_star_foundry")}return t.player.cash>=1e8&&a("trillion_chip_dynasty"),{newlyUnlocked:e}}static triggerManualUnlock(t,e){const s=t.find(a=>a.id===e);return s&&!s.unlocked?(s.unlocked=!0,!0):!1}static claimReward(t,e){const s=t.find(a=>a.id===e);return s?s.unlocked?s.claimed?{success:!1,cash:0,message:"該成就獎勵已領取"}:(s.claimed=!0,{success:!0,cash:s.rewardCash,message:`🏆 成功領取成就【${s.title}】獎勵！獲得獎勵金 NT$ ${s.rewardCash.toLocaleString()}！`}):{success:!1,cash:0,message:"尚未達成該成就解鎖條件"}:{success:!1,cash:0,message:"找不到該成就"}}}w(N,"INITIAL_ACHIEVEMENTS",[{id:"first_silicon",category:"onboarding",title:"矽島啟航 (First Silicon)",description:"成功在廠房內完成並產出第一批晶圓。",rewardCash:5e4,unlocked:!1,claimed:!1},{id:"step_into_yellow",category:"onboarding",title:"邁入黃光密室 (Yellow Room Entry)",description:"首次完成微影站塗膠、曝光與顯影連線作業。",rewardCash:8e4,unlocked:!1,claimed:!1},{id:"first_cash",category:"onboarding",title:"首桶金進帳 (First Cash Delivery)",description:"成功履約第一張客戶製造合約並取得全額尾款。",rewardCash:1e5,unlocked:!1,claimed:!1},{id:"mes_mastery",category:"onboarding",title:"智慧製造大師 (MES Mastery)",description:"完成新手教學，解鎖並啟用 MES 智慧自動派工系統。",rewardCash:15e4,unlocked:!1,claimed:!1},{id:"submicron_explorer",category:"process",title:"突破次微米壁壘 (Sub-micron Explorer)",description:"成功承接並交付線寬 <= 350nm 之高階次微米訂單。",rewardCash:5e5,unlocked:!1,claimed:!1},{id:"copper_cmp_era",category:"process",title:"銅導線與平坦化時代 (CMP Era)",description:"解鎖並在廠房內運作 CMP 化學機械平坦化拋光設備。",rewardCash:1e6,unlocked:!1,claimed:!1},{id:"immersion_wave",category:"process",title:"水中折射奇蹟 (Immersion Wave)",description:"購買並安裝 Tier 5 ArFi 浸潤微影雙工件台設備 (TWINSCAN)。",rewardCash:5e6,unlocked:!1,claimed:!1},{id:"euv_domination",category:"process",title:"極紫外神之光 (EUV Domination)",description:"購買並啟用極紫外光微影巨獸 (EUV Scanner)。",rewardCash:2e7,unlocked:!1,claimed:!1},{id:"tpm_zero_defect",category:"operation",title:"零非計畫停機殿堂 (TPM Zero-Defect)",description:"同時維持 3 台以上機台處於 🛡️ TPM 24H 零故障在線維護保障狀態。",rewardCash:2e6,unlocked:!1,claimed:!1},{id:"inline_cluster_master",category:"operation",title:"雙軌並聯突破極限 (Inline Cluster Master)",description:"為微影機台並聯配套綁定 2 台以上 Track 塗膠顯影設備，消除產能瓶頸。",rewardCash:15e5,unlocked:!1,claimed:!1},{id:"gigafab_expansion",category:"operation",title:"GigaFab 超級晶圓廠 (GigaFab Expansion)",description:"將潔淨室無塵廠房拓建至 Phase 4 (24x24 巨型潔淨室)。",rewardCash:1e7,unlocked:!1,claimed:!1},{id:"automation_highway",category:"operation",title:"自動化天軌物流 (Automation Highway)",description:"同時解鎖地面 AGV 自走車與天花板 OHT 懸吊天軌系統。",rewardCash:3e6,unlocked:!1,claimed:!1},{id:"flawless_wafer",category:"yield",title:"神級黃金良率 (Flawless Wafer 99%+)",description:"成功生產交付一批最終良率達 99% 以上的頂級晶圓。",rewardCash:1e6,unlocked:!1,claimed:!1},{id:"rework_savior",category:"yield",title:"點石成金光阻重洗 (Rework Savior)",description:"成功對 Q-Time 逾期晶圓執行光阻重洗 (Rework)，拯救昂貴晶片免於報廢。",rewardCash:5e5,unlocked:!1,claimed:!1},{id:"five_star_foundry",category:"yield",title:"五星品質金字招牌 (Five-Star Foundry)",description:"累積至少 5 批出貨紀錄，且 RollingYieldIndex 滾動良率指數突破 95%！",rewardCash:8e6,unlocked:!1,claimed:!1},{id:"trillion_chip_dynasty",category:"yield",title:"稱霸全球矽島霸權 (Silicon Hegemony)",description:"總現金累積突破 NT$ 100,000,000，建立無可撼動的半導體傳奇帝國。",rewardCash:5e7,unlocked:!1,claimed:!1}]);class C{static createDefaultSave(t="矽島先進半導體",e="張創辦人",s="avatar_1"){const a=Date.now(),i={schemaVersion:2,savedAt:a,lastOnlineTimestamp:a,player:{companyName:t,ceoName:e,avatarId:s,cash:5e7,foundryTier:1,popularity:100,unlockedK1:"BASE",unlockedCleanroomClass:"Class 10000",totalOrdersFulfilled:0,totalWafersDelivered:0,rdInvestedCash:0,tutorialCompleted:!1},unlockedFeatures:{cmp:!1,agv:!1,oht:!1,shrOht:!1,mesAutoDispatch:!1,mixAndMatchLitho:!1},facility:{cleanroomPhase:1,bayGridSize:{width:10,height:10},yellowRoomTiles:[{x:3,y:1},{x:4,y:1},{x:5,y:1},{x:6,y:1},{x:7,y:1},{x:3,y:2},{x:4,y:2},{x:5,y:2},{x:6,y:2},{x:7,y:2},{x:3,y:3},{x:4,y:3},{x:5,y:3},{x:6,y:3},{x:7,y:3}]},machines:[{id:"mach_film_1",modelId:"film_furnace",name:"熱氧化爐 (Thermal Oxidation)",category:"FILM",tier:1,gridX:1,gridY:2,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_track_1",modelId:"track_clean",name:"手動旋塗熱板台 (Manual Track)",category:"TRACK",tier:1,gridX:4,gridY:2,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_litho_1",modelId:"litho_contact",name:"接觸式微影機 (Contact Aligner)",category:"LITHO",tier:1,gridX:6,gridY:2,wear:0,status:"IDLE",assignedEngineerId:"staff_1",pairedTrackIds:["mach_track_1"]},{id:"mach_etch_1",modelId:"etch_plasma",name:"電漿乾式蝕刻機 (Dry Plasma Etcher)",category:"ETCH",tier:1,gridX:6,gridY:6,wear:0,status:"IDLE",assignedEngineerId:null},{id:"mach_diff_1",modelId:"diff_furnace",name:"擴散退火爐 (Diffusion Furnace)",category:"DIFF",tier:1,gridX:2,gridY:6,wear:0,status:"IDLE",assignedEngineerId:null}],staff:[{id:"staff_1",name:"Alex Miller",rank:"Skilled Worker",moduleSpecialty:"LITHO",fatigue:10,shiftMode:"THREE_SHIFT",workShift:"DAY",assignedMachineId:"mach_litho_1",salary:6e4},{id:"staff_2",name:"Sarah Chen",rank:"Skilled Worker",moduleSpecialty:"PIE",fatigue:5,shiftMode:"THREE_SHIFT",workShift:"DAY",assignedMachineId:null,salary:75e3}],activeOrders:[],activeLots:[],rollingYieldHistory:[],clawbackDebt:0,questState:{lastDateStr:new Date().toISOString().split("T")[0],dailyQuests:[],allDailyClaimed:!1,weeklyCompletedCount:0,weeklyTarget:15,weeklyClaimed:!1},achievements:N.getInitialAchievements(),gameTime:0,financialState:L.initFinancialState(5e7,7e7),marketOrders:$.generateContractBoard(1,null,0),nextOrderRespawnTime:0};return D.updateMachineNames(i.machines),i}static getUserProfiles(){try{const t=localStorage.getItem(this.REGISTRY_KEY);if(t){const e=JSON.parse(t);if(Array.isArray(e)&&e.length>0)return e}}catch(t){console.warn("讀取使用者目錄失敗:",t)}return this.initializeDefaultProfile()}static initializeDefaultProfile(){const t=localStorage.getItem(this.STORAGE_KEY_V2);let e="張創辦人",s="矽島先進半導體",a=1,i=5e7,n=Date.now();if(t)try{const d=JSON.parse(t);d.player&&(e=d.player.ceoName||e,s=d.player.companyName||s,a=d.player.foundryTier||a,i=d.player.cash||i,n=d.savedAt||n)}catch{}const r={id:"usr_default",name:e,companyName:s,foundryTier:a,cash:i,createdAt:n,lastPlayedAt:Date.now(),storageKey:this.STORAGE_KEY_V2},l=[r];try{localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(l)),localStorage.setItem(this.ACTIVE_USER_ID_KEY,r.id)}catch{}return l}static getActiveUserProfile(){const t=this.getUserProfiles(),e=localStorage.getItem(this.ACTIVE_USER_ID_KEY),s=t.find(i=>i.id===e);if(s)return s;const a=t[0]||this.initializeDefaultProfile()[0];return localStorage.setItem(this.ACTIVE_USER_ID_KEY,a.id),a}static createUser(t,e){const s=t.trim()||`執行長 ${Math.floor(Math.random()*900+100)}`,a=(e==null?void 0:e.trim())||`${s}半導體`,i=`usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2,6)}`,n=`SILICON_TYCOON_SAVE_${i}`,r={id:i,name:s,companyName:a,foundryTier:1,cash:5e7,createdAt:Date.now(),lastPlayedAt:Date.now(),storageKey:n},l=this.createDefaultSave(a,s);l.userId=i,localStorage.setItem(n,JSON.stringify(l));const d=this.getUserProfiles();return d.push(r),localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(d)),localStorage.setItem(this.ACTIVE_USER_ID_KEY,i),r}static renameUser(t,e){const s=e.trim();if(!s)return!1;const a=this.getUserProfiles(),i=a.find(r=>r.id===t);if(!i)return!1;i.name=s,localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(a));const n=localStorage.getItem(i.storageKey);if(n)try{const r=JSON.parse(n);r.player&&(r.player.ceoName=s,localStorage.setItem(i.storageKey,JSON.stringify(r)))}catch{}return!0}static deleteUser(t){const e=this.getUserProfiles();if(e.length<=1)return{success:!1,message:"至少需要保留一個玩家存檔，無法全部刪除！"};const s=e.findIndex(n=>n.id===t);if(s===-1)return{success:!1,message:"找不到該玩家存檔！"};const a=e[s];return localStorage.removeItem(a.storageKey),e.splice(s,1),localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(e)),localStorage.getItem(this.ACTIVE_USER_ID_KEY)===t&&localStorage.setItem(this.ACTIVE_USER_ID_KEY,e[0].id),{success:!0}}static switchActiveUser(t){return this.getUserProfiles().find(a=>a.id===t)?(localStorage.setItem(this.ACTIVE_USER_ID_KEY,t),this.loadFromLocalStorage()):null}static factoryResetAllData(){try{const t=[];for(let e=0;e<localStorage.length;e++){const s=localStorage.key(e);s&&s.toLowerCase().startsWith("silicon_tycoon")&&t.push(s)}for(const e of t)localStorage.removeItem(e)}catch(t){console.warn("清空存檔時發生例外:",t),localStorage.clear()}}static saveToLocalStorage(t){try{t.savedAt=Date.now(),t.lastOnlineTimestamp=Date.now();const e=this.getActiveUserProfile(),s=t.userId&&t.userId===e.id?e.storageKey:e.storageKey||this.STORAGE_KEY_V2,a=JSON.stringify(t);localStorage.setItem(s,a);const i=this.getUserProfiles(),n=i.find(r=>r.id===e.id);return n&&(n.cash=t.player.cash,n.foundryTier=t.player.foundryTier,n.companyName=t.player.companyName,n.name=t.player.ceoName,n.lastPlayedAt=Date.now(),localStorage.setItem(this.REGISTRY_KEY,JSON.stringify(i))),!0}catch(e){return console.error("LocalStorage 存檔失敗:",e),!1}}static loadFromLocalStorage(){var t;try{const e=this.getActiveUserProfile();let s=localStorage.getItem(e.storageKey);if(!s&&e.id==="usr_default"&&(s=localStorage.getItem(this.STORAGE_KEY_V2)),s){const n=JSON.parse(s);if(n.schemaVersion===2){if(n.staff&&(n.staff=this.normalizeStaffData(n.staff)),n.facility||(n.facility={cleanroomPhase:1,bayGridSize:{width:10,height:10}}),(!n.facility.yellowRoomTiles||n.facility.yellowRoomTiles.length===0)&&(n.facility.yellowRoomTiles=[{x:3,y:1},{x:4,y:1},{x:5,y:1},{x:6,y:1},{x:7,y:1},{x:3,y:2},{x:4,y:2},{x:5,y:2},{x:6,y:2},{x:7,y:2},{x:3,y:3},{x:4,y:3},{x:5,y:3},{x:6,y:3},{x:7,y:3}]),(!n.facility.bayGridSize||n.facility.bayGridSize.width<10)&&(n.facility.bayGridSize={width:10,height:10}),n.userId=e.id,n.financialState=L.ensureFinancialState(n),n.player&&(n.player.totalOrdersFulfilled===void 0&&(n.player.totalOrdersFulfilled=0),n.player.totalWafersDelivered===void 0&&(n.player.totalWafersDelivered=0),n.player.rdInvestedCash===void 0&&(n.player.rdInvestedCash=0)),n.machines&&D.updateMachineNames(n.machines),n.rollingYieldHistory&&n.rollingYieldHistory.length>0&&n.rollingYieldHistory.every(r=>r>=.88)&&(((t=n.player)==null?void 0:t.foundryTier)||1)===1&&(n.rollingYieldHistory=[.56,.6,.58,.64,.56]),n.staff&&Array.isArray(n.staff)&&(n.staff.some(r=>r.moduleSpecialty==="PIE")||n.staff.push({id:"staff_pie_1",name:"Sarah Chen",rank:"Skilled Worker",moduleSpecialty:"PIE",fatigue:5,shiftMode:"THREE_SHIFT",workShift:"DAY",assignedMachineId:null,salary:75e3})),n.marketOrders){const r=Date.now();for(const l of n.marketOrders)if(l.allowedDurationSec||(l.allowedDurationSec=$.getAllowedDurationSec(l)),!l.marketExpiresAt||l.marketExpiresAt<=r){const d=(l.urgencyMultiplier||1)>=1.5?45e3:(l.urgencyMultiplier||1)>=1.2?7e4:1e5;l.marketExpiresAt=r+d}}if(n.activeOrders)for(const r of n.activeOrders)r.allowedDurationSec||(r.allowedDurationSec=$.getAllowedDurationSec(r)),r.deadlineGameTime<=(n.gameTime||0)&&r.goodDiesDelivered<r.totalDies&&(r.deadlineGameTime=(n.gameTime||0)+r.allowedDurationSec);return $.ensureMarketOrders(n),n}}const a=localStorage.getItem(this.STORAGE_KEY_V1);if(a){const n=JSON.parse(a);if(n.schemaVersion===1){console.warn("偵測到舊版 SaveGameV1 存檔，執行自動升級至 SaveGameV2...");const r=this.migrateSaveV1toV2(n);return r.userId=e.id,r.financialState=L.ensureFinancialState(r),this.saveToLocalStorage(r),r}}const i=this.createDefaultSave(e.companyName,e.name);return i.userId=e.id,this.saveToLocalStorage(i),i}catch(e){return console.error("LocalStorage 讀檔失敗:",e),null}}static normalizeStaffData(t){return t.map((e,s)=>{const a=/[\u4e00-\u9fa5]/.test(e.name);let i=e.name;if(a||!i){const n=this.ENGLISH_FIRST_NAMES[s%this.ENGLISH_FIRST_NAMES.length],r=this.ENGLISH_LAST_NAMES[s%this.ENGLISH_LAST_NAMES.length];i=`${n} ${r}`}return{...e,name:i,workShift:e.workShift||(s%3===0?"DAY":s%3===1?"SWING":"NIGHT")}})}static migrateSaveV1toV2(t){var i;const e=new Date().toISOString().split("T")[0],s=t.machines.map(n=>({...n,pairedTrackIds:n.category==="LITHO"?[]:void 0})),a=t.activeOrders.map(n=>({...n,urgencyMultiplier:n.urgencyMultiplier??1,layerAllocations:[]}));return{schemaVersion:2,savedAt:t.savedAt??Date.now(),lastOnlineTimestamp:t.lastOnlineTimestamp??Date.now(),player:{...t.player},unlockedFeatures:{cmp:t.unlockedFeatures.cmp??!1,agv:t.unlockedFeatures.agv??!1,oht:t.unlockedFeatures.oht??!1,mesAutoDispatch:t.unlockedFeatures.mesAutoDispatch??!1,mixAndMatchLitho:!1},facility:{cleanroomPhase:((i=t.facility)==null?void 0:i.cleanroomPhase)??1,bayGridSize:{width:10,height:10},yellowRoomTiles:[{x:3,y:1},{x:4,y:1},{x:5,y:1},{x:6,y:1},{x:7,y:1},{x:3,y:2},{x:4,y:2},{x:5,y:2},{x:6,y:2},{x:7,y:2},{x:3,y:3},{x:4,y:3},{x:5,y:3},{x:6,y:3},{x:7,y:3}]},machines:s,staff:this.normalizeStaffData(t.staff??[]),activeOrders:a,activeLots:t.activeLots??[],rollingYieldHistory:t.rollingYieldHistory??[],clawbackDebt:t.clawbackDebt??0,questState:{lastDateStr:e,dailyQuests:[],allDailyClaimed:!1,weeklyCompletedCount:0,weeklyTarget:15,weeklyClaimed:!1},achievements:N.getInitialAchievements(),gameTime:t.gameTime??0}}static exportSaveToJson(t){return JSON.stringify(t,null,2)}static importSaveFromJson(t){try{const e=JSON.parse(t);return e.schemaVersion===2?{success:!0,state:e}:e.schemaVersion===1?{success:!0,state:this.migrateSaveV1toV2(e)}:{success:!1,error:"不相容的存檔格式版本！"}}catch(e){return{success:!1,error:`JSON 解析失敗: ${e.message}`}}}static calculateOfflineProgress(t,e){const s=Math.max(0,Math.floor((e-t.lastOnlineTimestamp)/1e3)),a=Math.min(14400,s),i={offlineDurationSeconds:a,lotsProcessed:0,wafersDelivered:0,revenueEarned:0,salaryPaid:0,utilityPaid:0,maintenanceExpense:0,debtRepaid:0,breakdownCount:0,explosionCount:0,tpmProtectedCount:0,netProfit:0};if(a<60)return i;const n=Math.floor(a/300),r=new Map(t.staff.map(u=>[u.id,u]));let l=0;for(const u of t.machines){const f=u.assignedEngineerId?r.get(u.assignedEngineerId):null;if(j.checkTPMConditions(u,f).isTPMActive)l++,u.wear=Math.min(5,u.wear),u.status="IDLE";else{const g=n*.4;u.wear=Math.min(100,u.wear+g),u.wear>=60&&Math.random()<.3&&(i.breakdownCount++,j.checkExplosionRisk(u,f).hasRisk&&Math.random()<.25?(i.explosionCount++,i.maintenanceExpense+=2e5*u.tier,u.status="EXPLODED"):(i.maintenanceExpense+=5e4*u.tier,u.status="MAINTENANCE"))}}i.tpmProtectedCount=l;const d=a/3600,o=t.staff.reduce((u,f)=>u+f.salary,0)/720,c=t.machines.length*15e3/720;if(i.salaryPaid=Math.round(o*d),i.utilityPaid=Math.round(c*d),t.unlockedFeatures.mesAutoDispatch&&t.activeOrders.length>0){const u=t.activeOrders.find(f=>f.status==="ACTIVE");if(u&&i.explosionCount===0){const f=Math.min(Math.floor(a/180),10);if(f>0){i.lotsProcessed=f;const x=f*5;i.wafersDelivered=x;const g=Math.round(x*100*u.unitPrice);i.revenueEarned=g;for(let y=0;y<f;y++)t.rollingYieldHistory.push(.92)}}}const p=i.revenueEarned,h=i.salaryPaid+i.utilityPaid+i.maintenanceExpense,m=p-h;if(m>0&&t.clawbackDebt>0){const u=Math.min(t.clawbackDebt,Math.round(m*.25));i.debtRepaid=u,t.clawbackDebt-=u}return i.netProfit=p-h-i.debtRepaid,t.player.cash=Math.max(0,t.player.cash+i.netProfit),t.gameTime+=a,t.lastOnlineTimestamp=e,t.savedAt=e,i}}w(C,"STORAGE_KEY_V2","SILICON_TYCOON_SAVE_V2"),w(C,"STORAGE_KEY_V1","SILICON_TYCOON_SAVE_V1"),w(C,"REGISTRY_KEY","SILICON_TYCOON_USERS_REGISTRY"),w(C,"ACTIVE_USER_ID_KEY","SILICON_TYCOON_ACTIVE_USER_ID"),w(C,"ENGLISH_FIRST_NAMES",["Alex","David","Sarah","Kevin","Emily","Michael","Jessica","James","Daniel","Rachel","Robert","Brian","Olivia","William","Sophia","Thomas"]),w(C,"ENGLISH_LAST_NAMES",["Miller","Chen","Smith","Williams","Johnson","Taylor","Davis","Wilson","Anderson","White","Harris","Martin","Clark","Lewis","Walker","Hall"]);class F{static getTierConfig(t){return this.TIER_CONFIGS[t]||this.TIER_CONFIGS[1]}static getProgressionStatus(t){const e=t.player.foundryTier||1,s=e>=this.MAX_TIER,a=e+1,i=s?null:this.getTierConfig(a),n=t.player.totalOrdersFulfilled||0,r=t.player.totalWafersDelivered||0,l=t.player.rdInvestedCash||0;if(s||!i)return{currentTier:e,maxTier:this.MAX_TIER,isMaxTier:!0,nextTierConfig:null,ordersCompleted:n,ordersTarget:n,ordersMet:!0,ordersPct:100,wafersDelivered:r,wafersTarget:r,wafersMet:!0,wafersPct:100,fundsInvested:l,fundsTarget:l,fundsMet:!0,fundsPct:100,canAdvance:!1,overallPct:100};const d=i.reqOrders,o=i.reqWafers,c=i.reqResearchFunds,p=n>=d,h=r>=o,m=l>=c,u=Math.min(100,Math.round(n/Math.max(1,d)*100)),f=Math.min(100,Math.round(r/Math.max(1,o)*100)),x=Math.min(100,Math.round(l/Math.max(1,c)*100)),g=Math.round((u+f+x)/3),y=p&&h&&m;return{currentTier:e,maxTier:this.MAX_TIER,isMaxTier:!1,nextTierConfig:i,ordersCompleted:n,ordersTarget:d,ordersMet:p,ordersPct:u,wafersDelivered:r,wafersTarget:o,wafersMet:h,wafersPct:f,fundsInvested:l,fundsTarget:c,fundsMet:m,fundsPct:x,canAdvance:y,overallPct:g}}static investRDCapital(t,e){const s=this.getProgressionStatus(t);if(s.isMaxTier||!s.nextTierConfig)return{success:!1,invested:0,message:"晶圓廠已達最高科技世代，無需再注資！"};const a=s.fundsTarget-s.fundsInvested;if(a<=0)return{success:!1,invested:0,message:"本世代研發資金已全數募足，請達成代工訂單與晶圓量產目標以晉升！"};const i=Math.max(0,Math.min(e,a,t.player.cash));return i<=0?{success:!1,invested:0,message:"廠房資金不足，無法撥款注資！"}:(t.player.cash-=i,t.player.rdInvestedCash=(t.player.rdInvestedCash||0)+i,L.recordCapEx(t,i),{success:!0,invested:i,message:`成功撥款注資 NT$ ${i.toLocaleString()} 注入次世代製程研發！`})}static advanceFoundryTier(t){const e=this.getProgressionStatus(t);if(e.isMaxTier||!e.nextTierConfig)return{success:!1,newTier:t.player.foundryTier,message:"已達最高科技世代！"};if(!e.canAdvance){const a=[];return e.ordersMet||a.push(`還需交付 ${e.ordersTarget-e.ordersCompleted} 筆訂單`),e.wafersMet||a.push(`還需生產 ${e.wafersTarget-e.wafersDelivered} 片晶圓`),e.fundsMet||a.push(`還需研發注資 NT$ ${(e.fundsTarget-e.fundsInvested).toLocaleString()}`),{success:!1,newTier:t.player.foundryTier,message:`尚未達成晉升條件：${a.join("、")}`}}const s=e.nextTierConfig.tier;if(t.player.foundryTier=s,t.player.rdInvestedCash=0,t.player.popularity=Math.min(100,t.player.popularity+5),e.nextTierConfig.unlockedCleanroomClass&&(t.player.unlockedCleanroomClass=e.nextTierConfig.unlockedCleanroomClass),e.nextTierConfig.unlockedFeatureKeys)for(const a of e.nextTierConfig.unlockedFeatureKeys)t.unlockedFeatures[a]=!0;return N.checkAchievements(t),{success:!0,newTier:s,message:`🎉 狂賀！製程微縮重大突破！晶圓廠成功晉升至【Tier ${s} ${e.nextTierConfig.name}】！已解鎖次世代機台採購與合約！`}}}w(F,"MAX_TIER",6),w(F,"TIER_CONFIGS",{1:{tier:1,name:"微米微影啟蒙時代",subtitle:"5µm ~ 3µm 微米成熟製程",eraCode:"ERA_1_MICRON",minCDNm:3e3,unlockedCleanroomClass:"Class 10,000",description:"半導體萌芽初創期，以接觸式與等倍投影曝光為核心，邁出晶圓製造的第一步。",scienceHistory:"使用汞燈紫外光混光與手工旋塗光阻，光罩物理貼合或反射鏡投影，極限線寬約 3 微米。",reqOrders:0,reqWafers:0,reqResearchFunds:0,unlockedModelIds:["litho_contact","litho_projection","track_manual","film_evap","film_sputter","etch_wet_barrel","diff_box","diff_tube_manual"]},2:{tier:2,name:"亞微米步進縮小時代",subtitle:"1.2µm ~ 800nm (G-Line 436nm)",eraCode:"ERA_2_SUBMICRON",minCDNm:800,unlockedCleanroomClass:"Class 1,000",description:"引入 4:1 縮小透鏡與步進曝光技術，晶圓製造邁入百萬顆電晶體之 1 微米世代。",scienceHistory:"採用高壓汞燈 g-line (436nm) 搭配光學鏡頭群，突破接觸式光罩刮傷瓶頸，全面提升良率。",reqOrders:3,reqWafers:100,reqResearchFunds:15e6,unlockedModelIds:["litho_gline","track_single","film_pecvd","etch_rie","diff_auto_horiz"]},3:{tier:3,name:"次微米紫外深耕時代",subtitle:"500nm ~ 350nm (I-Line & CMP)",eraCode:"ERA_3_DEEPUV_STEP",minCDNm:350,unlockedCleanroomClass:"Class 100",description:"推進至 i-line 紫外光，雙軌 Track 連線作業，並解鎖化學機械研磨 (CMP) 平坦化神技。",scienceHistory:"採用 365nm i-line 高強度紫外光搭配 NA=0.50 鏡頭，CMP 平坦化技術解決多層金屬互連景深問題。",reqOrders:8,reqWafers:350,reqResearchFunds:5e7,unlockedModelIds:["litho_iline","track_dual","film_hdp_cvd","etch_merie","diff_vertical","cmp_manual","cmp_standard"],unlockedFeatureKeys:["cmp"]},4:{tier:4,name:"深紫外 DUV 跨越時代",subtitle:"250nm ~ 90nm (KrF/ArF & MES 自動化)",eraCode:"ERA_4_DUV_EXCIMER",minCDNm:90,unlockedCleanroomClass:"Class 10",description:"準分子雷射掃描曝光與化學增幅型光阻 (CAR)，產線導入 MES 智慧派工無人化管理。",scienceHistory:"248nm KrF 與 193nm ArF 準分子雷射結合動態掃描 (Step-and-Scan)，大幅擴大曝光視場與精準度。",reqOrders:18,reqWafers:1e3,reqResearchFunds:18e7,unlockedModelIds:["litho_krf","litho_arfdry","track_clean","film_ald_thermal","etch_icp_advanced","diff_lpcvd_rapid","cmp_auto"],unlockedFeatureKeys:["mesAutoDispatch"]},5:{tier:5,name:"浸潤式微影顛峰時代",subtitle:"65nm ~ 7nm (ArFi 193nm 水折射)",eraCode:"ERA_5_IMMERSION_PEAK",minCDNm:7,unlockedCleanroomClass:"Class 1",description:"林本堅博士浸潤式水折射微影革命，搭配雙工件台磁浮掃描與多重曝光 (SAQP)，極限微縮至 7nm。",scienceHistory:"鏡頭與晶圓間注入超純水 (n=1.44)，將等效 NA 推升至 1.35，打破物理極限，領先全球晶圓代工市場。",reqOrders:35,reqWafers:3e3,reqResearchFunds:6e8,unlockedModelIds:["litho_arfi","film_ald_plasma","etch_ale_atomic","diff_rtp_laser","cmp_atomic"],unlockedFeatureKeys:["mixAndMatchLitho"]},6:{tier:6,name:"埃米 EUV 矽島霸權時代",subtitle:"5nm ~ 2nm 以下 (High-NA EUV 埃米時代)",eraCode:"ERA_6_HIGH_NA_EUV",minCDNm:2,unlockedCleanroomClass:"Class 1 (ISO 3)",description:"13.5nm 極紫外光與 0.55 NA 變形鏡頭次世代巨獸，單次曝光推進 2nm，傲視全球的半導體科技霸主！",scienceHistory:"以二氧化碳雷射高頻擊打錫滴激發電漿產生 13.5nm 極紫外光，全機超高真空運行，登頂世界半導體工業之巔。",reqOrders:60,reqWafers:8e3,reqResearchFunds:25e8,unlockedModelIds:["litho_euv","litho_highna","track_advanced"]}});class ie{static getContainer(){if(!this.container||!document.body.contains(this.container)){let t=document.getElementById("cash-fx-container");t||(t=document.createElement("div"),t.id="cash-fx-container",t.className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden",document.body.appendChild(t)),this.container=t}return this.container}static trigger(t,e){if(Math.abs(t)<1)return;const s=t>0,a=Math.round(Math.abs(t)),i=this.getContainer();let n=window.innerWidth/2,r=48;if(e&&"getBoundingClientRect"in e){const m=e.getBoundingClientRect();n=m.left+m.width/2,r=s?m.top:m.bottom}else if(e&&typeof e.x=="number")n=e.x,r=e.y;else{const m=document.getElementById("btn-hud-cash")||document.getElementById("hud-cash-value");if(m){const u=m.getBoundingClientRect();n=u.left+u.width/2,r=u.bottom+4}}const l=(Math.random()-.5)*28,d=(Math.random()-.5)*8;n+=l,r+=d;const o=document.createElement("div");o.className=`absolute pointer-events-none font-mono font-black text-sm sm:text-base flex items-center gap-1.5 select-none ${s?"cash-fx-gain":"cash-fx-loss"}`,o.style.left=`${n}px`,o.style.top=`${r}px`,o.style.transform="translate(-50%, -50%)";const c=s?"💰":"💸",p=s?"+":"-";o.innerHTML=`
      <span class="text-xs sm:text-sm drop-shadow">${c}</span>
      <span>${p}NT$ ${a.toLocaleString()}</span>
    `,i.appendChild(o);const h=document.getElementById("hud-cash-value");h&&(h.classList.remove("cash-pulse-green","cash-pulse-red"),h.offsetWidth,h.classList.add(s?"cash-pulse-green":"cash-pulse-red"),setTimeout(()=>{h.classList.remove("cash-pulse-green","cash-pulse-red")},650)),s&&a>=5e4&&b.playCoinChime(),setTimeout(()=>{o.remove()},1400)}}w(ie,"container",null);class be{constructor(t,e){w(this,"container");w(this,"callbacks");w(this,"isInitialized",!1);w(this,"isDropdownOpen",!1);w(this,"currentState",null);w(this,"lastKnownCash",null);const s=document.getElementById(t);if(!s)throw new Error(`找不到 HUD 容器: #${t}`);this.container=s,this.callbacks=e,document.addEventListener("click",a=>{if(!this.isDropdownOpen)return;const i=document.getElementById("top-dropdown-menu"),n=document.getElementById("btn-top-more"),r=a.target;i&&!i.contains(r)&&n&&!n.contains(r)&&this.closeDropdown()})}rebuild(){this.isInitialized=!1,this.isDropdownOpen=!1,this.lastKnownCash=null}closeDropdown(){this.isDropdownOpen=!1;const t=document.getElementById("top-dropdown-menu");t&&t.classList.add("hidden")}toggleDropdown(){this.isDropdownOpen=!this.isDropdownOpen;const t=document.getElementById("top-dropdown-menu");t&&(this.isDropdownOpen?t.classList.remove("hidden"):t.classList.add("hidden"))}render(t){this.currentState=t,(!this.isInitialized||!this.container.firstElementChild)&&(this.renderInitialStructure(),this.bindEvents(),this.isInitialized=!0),this.updateValues(t)}renderInitialStructure(){this.container.innerHTML=`
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
    `}bindEvents(){var t,e,s,a,i,n,r,l,d,o,c,p,h,m,u,f,x,g,y,T;(t=document.getElementById("btn-contracts"))==null||t.addEventListener("click",v=>{v.stopPropagation(),this.closeDropdown(),b.playClick(),this.callbacks.onOpenContracts()}),(e=document.getElementById("btn-store"))==null||e.addEventListener("click",v=>{v.stopPropagation(),this.closeDropdown(),b.playClick(),this.callbacks.onOpenStore()}),(s=document.getElementById("btn-techtree"))==null||s.addEventListener("click",v=>{var E,k;v.stopPropagation(),this.closeDropdown(),b.playClick(),(k=(E=this.callbacks).onOpenTechTree)==null||k.call(E)}),(a=document.getElementById("btn-planner"))==null||a.addEventListener("click",v=>{var E,k;v.stopPropagation(),this.closeDropdown(),b.playClick(),(k=(E=this.callbacks).onOpenPlanner)==null||k.call(E)}),(i=document.getElementById("btn-finance"))==null||i.addEventListener("click",v=>{var E,k;v.stopPropagation(),this.closeDropdown(),b.playClick(),(k=(E=this.callbacks).onOpenFinance)==null||k.call(E)}),(n=document.getElementById("btn-hud-cash"))==null||n.addEventListener("click",v=>{var E,k;v.stopPropagation(),this.closeDropdown(),b.playClick(),(k=(E=this.callbacks).onOpenFinance)==null||k.call(E)}),(r=document.getElementById("btn-hud-yield"))==null||r.addEventListener("click",v=>{var E,k;v.stopPropagation(),this.closeDropdown(),b.playClick(),(k=(E=this.callbacks).onOpenWaferMap)==null||k.call(E)}),(l=document.getElementById("btn-advisory-alert"))==null||l.addEventListener("click",v=>{v.stopPropagation(),this.closeDropdown(),b.playClick(),this.callbacks.onOpenAdvisory()}),(d=document.getElementById("btn-hud-profile-avatar"))==null||d.addEventListener("click",v=>{var E,k;v.stopPropagation(),this.closeDropdown(),b.playClick(),(k=(E=this.callbacks).onOpenLogin)==null||k.call(E)}),(o=document.getElementById("btn-hud-switch-user"))==null||o.addEventListener("click",v=>{var E,k;v.stopPropagation(),this.closeDropdown(),b.playClick(),(k=(E=this.callbacks).onOpenLogin)==null||k.call(E)}),(c=document.getElementById("btn-top-more"))==null||c.addEventListener("click",v=>{v.stopPropagation(),b.playClick(),this.toggleDropdown()}),(p=document.getElementById("menu-item-hr"))==null||p.addEventListener("click",v=>{v.stopPropagation(),this.closeDropdown(),b.playClick(),this.callbacks.onOpenHR()}),(h=document.getElementById("menu-item-quests"))==null||h.addEventListener("click",v=>{v.stopPropagation(),this.closeDropdown(),b.playClick(),this.callbacks.onOpenQuests()}),(m=document.getElementById("menu-item-achievements"))==null||m.addEventListener("click",v=>{v.stopPropagation(),this.closeDropdown(),b.playClick(),this.callbacks.onOpenAchievements()}),(u=document.getElementById("menu-item-toggle-mes"))==null||u.addEventListener("click",v=>{if(v.stopPropagation(),b.playClick(),!this.currentState)return;const E=!this.currentState.unlockedFeatures.mesAutoDispatch;this.currentState.unlockedFeatures.mesAutoDispatch=E,this.callbacks.onToggleMES(E),this.updateValues(this.currentState)}),(f=document.getElementById("menu-item-switch-user"))==null||f.addEventListener("click",v=>{var E,k;v.stopPropagation(),this.closeDropdown(),b.playClick(),(k=(E=this.callbacks).onOpenLogin)==null||k.call(E)}),(x=document.getElementById("menu-item-save"))==null||x.addEventListener("click",v=>{v.stopPropagation(),this.closeDropdown(),b.playClick(),this.callbacks.onOpenSaveModal()}),(g=document.getElementById("menu-item-tutorial"))==null||g.addEventListener("click",v=>{var E,k;v.stopPropagation(),this.closeDropdown(),b.playClick(),(k=(E=this.callbacks).onOpenTutorial)==null||k.call(E)}),(y=document.getElementById("menu-item-sound"))==null||y.addEventListener("click",v=>{v.stopPropagation(),b.toggleMute(),b.playClick(),this.currentState&&this.updateValues(this.currentState)}),(T=document.getElementById("menu-item-factory-reset"))==null||T.addEventListener("click",v=>{var E,k;v.stopPropagation(),this.closeDropdown(),b.playClick(),(k=(E=this.callbacks).onOpenFactoryReset)==null||k.call(E)})}updateValues(t){var z;const e=t.player,s=t.unlockedFeatures.cmp,a=document.getElementById("hud-company-name");a&&(a.textContent=e.companyName);const i=document.getElementById("hud-foundry-tier");i&&(i.textContent=`Tier ${e.foundryTier}`);const n=((z=t.financialState)==null?void 0:z.currentDateStr)||L.getTodayDateString(),r=["日","一","二","三","四","五","六"][new Date().getDay()],l=document.getElementById("hud-date-str");l&&(l.textContent=`📅 ${n} (週${r})`);const d=document.getElementById("hud-ceo-name");if(d&&(d.textContent=e.ceoName),this.lastKnownCash!==null){const R=Math.round(e.cash)-Math.round(this.lastKnownCash);Math.abs(R)>=1&&ie.trigger(R)}this.lastKnownCash=e.cash;const o=document.getElementById("hud-cash-value");o&&(o.textContent=`NT$ ${Math.round(e.cash).toLocaleString()}`);const c=document.getElementById("hud-pop-value");c&&(c.textContent=`★ ${e.popularity}`);const p=t.activeLots.some(R=>R.status==="PROCESSING")||t.machines.some(R=>R.status==="PROCESSING"),h=t.rollingYieldHistory.length>0?t.rollingYieldHistory.slice(-5).reduce((R,ce)=>R+ce,0)/Math.min(5,t.rollingYieldHistory.length):null,m=$.calculateTrustMultiplier(h),u=document.getElementById("hud-yield-value"),f=document.getElementById("hud-yield-sub");u&&(u.textContent=h!==null?`${(h*100).toFixed(1)}%`:"N/A",u.className=`text-sm font-bold font-mono whitespace-nowrap ${p?h&&h>=.9?"text-emerald-400":"text-amber-400":"text-slate-400"}`),f&&(f.textContent=p?`(${m.toFixed(2)}x)`:"(待命暫停)",f.className=`text-[10px] ${p?"text-slate-400 font-normal":"text-amber-400/90 font-medium"}`);const x=D.calculateFactoryWorkload(t.machines,t.staff,t.activeLots,t.unlockedFeatures,s);let g="#10b981";x.workloadPercent>85?g="#ef4444":x.workloadPercent>=70&&(g="#f59e0b");const y=document.getElementById("hud-workload-pct");y&&(y.textContent=`${x.workloadPercent}%`);const T=document.getElementById("hud-workload-bar");T&&(T.style.width=`${Math.min(100,x.workloadPercent)}%`,T.style.backgroundColor=g);const v=document.getElementById("btn-advisory-alert");v&&(x.workloadPercent>85?v.classList.remove("hidden"):v.classList.add("hidden"));const E=F.getProgressionStatus(t),k=document.getElementById("hud-tech-label");k&&(k.textContent=`🔬 研發 (T${e.foundryTier})`);const _=document.getElementById("btn-techtree"),H=document.getElementById("hud-tech-badge");H&&(E.canAdvance?(H.classList.remove("hidden"),_==null||_.classList.add("border-emerald-400","text-emerald-300","ring-2","ring-emerald-500/40","animate-pulse")):(H.classList.add("hidden"),_==null||_.classList.remove("border-emerald-400","text-emerald-300","ring-2","ring-emerald-500/40","animate-pulse")));const I=t.questState.dailyQuests.some(R=>R.completed&&!R.claimed),P=t.achievements.some(R=>R.unlocked&&!R.claimed),K=I||P,ee=b.isAudioMuted(),S=document.getElementById("hud-more-badge");S&&(K?S.classList.remove("hidden"):S.classList.add("hidden"));const O=document.getElementById("dropdown-staff-count");O&&(O.textContent=`${t.staff.length} 人`);const W=document.getElementById("dropdown-quests-badge");W&&(W.innerHTML=I?'<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-xs border border-amber-500/30">待領取</span>':"");const B=document.getElementById("dropdown-achievements-badge");B&&(B.innerHTML=P?'<span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-xs border border-emerald-500/30">可解鎖</span>':"");const Y=document.getElementById("dropdown-mes-status");Y&&(Y.textContent=t.unlockedFeatures.mesAutoDispatch?"🟢 已開啟":"⚪ 已停用",Y.className=`text-xs font-bold font-mono px-2 py-0.5 rounded ${t.unlockedFeatures.mesAutoDispatch?"bg-emerald-950 text-emerald-300 border border-emerald-500/40":"bg-slate-900 text-slate-400 border border-slate-700"}`);const se=document.getElementById("dropdown-sound-icon");se&&(se.textContent=ee?"🔇":"🔊");const U=document.getElementById("dropdown-sound-text");U&&(U.textContent=ee?"靜音":"開啟")}}class pe{static show(t,e){const s=document.getElementById("modal-container");if(!s)return;let a="avatar_1";const i=()=>{var n,r,l;s.innerHTML=`
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
                  ${[{id:"avatar_1",icon:"👨‍💼",label:"產業領袖"},{id:"avatar_2",icon:"👩‍💼",label:"營運長"},{id:"avatar_3",icon:"👨‍🔬",label:"黃光院士"},{id:"avatar_4",icon:"👩‍🔬",label:"材料博士"},{id:"avatar_5",icon:"🧑‍💻",label:"製程先鋒"},{id:"avatar_6",icon:"🤖",label:"AI晶片狂"}].map(d=>`
                    <button
                      class="avatar-card p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${a===d.id?"border-cyan-400 bg-cyan-950/60 shadow-lg shadow-cyan-500/30 scale-105":"border-slate-800 bg-slate-900/50 hover:border-slate-600"}"
                      data-avatar-id="${d.id}"
                    >
                      <span class="text-2xl">${d.icon}</span>
                      <span class="text-[10px] text-slate-300">${d.label}</span>
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
      `,(n=document.getElementById("btn-random-company"))==null||n.addEventListener("click",()=>{b.playClick();const d=this.RANDOM_COMPANIES[Math.floor(Math.random()*this.RANDOM_COMPANIES.length)],o=document.getElementById("setup-company-name");o&&(o.value=d)}),(r=document.getElementById("btn-random-ceo"))==null||r.addEventListener("click",()=>{b.playClick();const d=this.RANDOM_CEOS[Math.floor(Math.random()*this.RANDOM_CEOS.length)],o=document.getElementById("setup-ceo-name");o&&(o.value=d)}),document.querySelectorAll(".avatar-card").forEach(d=>{d.addEventListener("click",o=>{b.playClick();const c=o.currentTarget.getAttribute("data-avatar-id");c&&(a=c,i())})}),(l=document.getElementById("btn-submit-foundry"))==null||l.addEventListener("click",()=>{const d=document.getElementById("setup-company-name"),o=document.getElementById("setup-ceo-name"),c=(d==null?void 0:d.value.trim())||"矽島先進積體電路",p=(o==null?void 0:o.value.trim())||"張創辦人";t.player.companyName=c,t.player.ceoName=p,t.player.avatarId=a,b.playSuccess(),s.innerHTML="",e(t.player)})};i()}}w(pe,"RANDOM_COMPANIES",["矽島先進積體電路","台積微系統","聯華微電科技","世界微晶圓","美光矽島半導體","瑞昱微系統","聯詠積體科技","旺宏微晶科技"]),w(pe,"RANDOM_CEOS",["張忠謨","劉德音","魏哲家","曹興成","黃仁勳","蘇姿丰","蔡力行","梁孟松"]);class ge{static show(t,e,s){var h,m,u,f,x;const a=document.getElementById("modal-container");if(!a)return;const i=t.unlockedFeatures.cmp,n=D.diagnoseBottleneck(t.machines,t.staff,t.activeLots,t.unlockedFeatures,i),{workloadPercent:r,throughputs:l}=D.calculateFactoryWorkload(t.machines,t.staff,t.activeLots,t.unlockedFeatures,i);let d="bg-red-950 text-red-400 border-red-500/50",o="⚠️";n.category==="MAINTENANCE"?(d="bg-amber-950 text-amber-400 border-amber-500/50",o="🔧"):n.category==="LOGISTICS"?(d="bg-cyan-950 text-cyan-400 border-cyan-500/50",o="🚛"):n.category==="LAYOUT"&&(d="bg-purple-950 text-purple-400 border-purple-500/50",o="📐");const c=g=>{g.key==="Escape"&&(a.innerHTML="",window.removeEventListener("keydown",c))};window.addEventListener("keydown",c);const p=()=>{b.playClick(),a.innerHTML="",window.removeEventListener("keydown",c)};a.innerHTML=`
      <div id="modal-backdrop-advisory" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-2xl text-slate-100 flex flex-col max-h-[88vh]">
          <!-- 頂部標題與關閉鈕 -->
          <div class="modal-header flex items-center justify-between pb-3 border-b border-slate-700/60 flex-shrink-0">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${o}</span>
              <div>
                <h3 class="text-lg font-bold text-slate-100 flex items-center gap-2">
                  智能瓶頸診斷與產線優化顧問
                  <span class="text-xs px-2 py-0.5 rounded-full border ${d} font-mono">
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
                <div class="text-2xl font-black font-mono ${r>85?"text-red-400":"text-amber-400"}">
                  ${r}%
                  <span class="text-xs font-normal text-slate-400">
                    ${r>85?"(嚴重超載塞車中，排隊即將突破 Q-Time 容許上限！)":"(負載偏高)"}
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
                ${Object.values(l).map(g=>`
                  <div class="p-2 rounded-lg bg-slate-900/60 border ${g.isChokePoint?"border-red-500/80 bg-red-950/20":"border-slate-800"} text-center">
                    <div class="text-[11px] font-bold ${g.isChokePoint?"text-red-400":"text-slate-300"}">
                      ${g.station} ${g.isChokePoint?"⚠️":""}
                    </div>
                    <div class="text-xs font-mono font-bold text-slate-100 mt-1">
                      ${Math.round(g.totalCapacity)} 片/分
                    </div>
                    <div class="text-[10px] text-slate-400">
                      ${g.machineCount} 台設備
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
              <button id="btn-advisory-ok" class="btn-sci-fi px-4 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700">
                ◀ 返回無塵室
              </button>
            </div>
          </div>
        </div>
      </div>
    `,(h=document.getElementById("btn-close-advisory"))==null||h.addEventListener("click",p),(m=document.getElementById("btn-advisory-ok"))==null||m.addEventListener("click",p),(u=document.getElementById("modal-backdrop-advisory"))==null||u.addEventListener("click",g=>{g.target===g.currentTarget&&p()}),(f=document.getElementById("btn-advisory-store"))==null||f.addEventListener("click",()=>{p(),e&&e()}),(x=document.getElementById("btn-advisory-hr"))==null||x.addEventListener("click",()=>{p(),s&&s()})}}class ye{static show(t,e){const s=document.getElementById("modal-container");if(!s)return;const a=()=>{var d,o,c,p,h;const i=t.questState,n=G.isAllDailyCompleted(i);s.innerHTML=`
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

                ${i.allDailyClaimed?'<span class="text-xs px-3 py-1.5 rounded bg-slate-800 text-slate-400 border border-slate-700">今日已領</span>':n?`<button id="btn-claim-all-daily" class="btn-sci-fi bg-amber-600 hover:bg-amber-500 text-xs py-1.5 px-4 font-bold shadow-lg shadow-amber-500/30">
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
      `;const r=()=>{b.playClick(),s.innerHTML="",window.removeEventListener("keydown",l)},l=m=>{m.key==="Escape"&&r()};window.addEventListener("keydown",l),(d=document.getElementById("btn-close-quests"))==null||d.addEventListener("click",r),(o=document.getElementById("btn-back-quests"))==null||o.addEventListener("click",r),(c=document.getElementById("modal-backdrop-quest"))==null||c.addEventListener("click",m=>{m.target===document.getElementById("modal-backdrop-quest")&&r()}),document.querySelectorAll(".btn-claim-quest").forEach(m=>{m.addEventListener("click",u=>{const f=u.currentTarget.getAttribute("data-id");if(f){const x=G.claimSingleQuest(t.questState,f);x.success&&(t.player.cash+=x.cash,L.recordSubsidy(t,x.cash),t.player.popularity+=x.popularity,b.playCoin(),a(),e())}})}),(p=document.getElementById("btn-claim-all-daily"))==null||p.addEventListener("click",()=>{const m=G.claimDailyAllClear(t.questState,t.player.foundryTier);m.success&&(t.player.cash+=m.cash,L.recordSubsidy(t,m.cash),t.player.popularity+=m.popularity,b.playSuccess(),a(),e())}),(h=document.getElementById("btn-claim-weekly"))==null||h.addEventListener("click",()=>{const m=G.claimWeeklyBounty(t.questState,t.player.foundryTier);m.success&&(t.player.cash+=m.cash,L.recordSubsidy(t,m.cash),t.player.popularity+=m.popularity,b.playSuccess(),a(),e())})};a()}}class me{static show(t,e){const s=document.getElementById("modal-container");if(!s)return;N.checkAchievements(t);const a=r=>{r.key==="Escape"&&(s.innerHTML="",window.removeEventListener("keydown",a))};window.addEventListener("keydown",a);const i=()=>{b.playClick(),s.innerHTML="",window.removeEventListener("keydown",a)},n=()=>{var c,p,h;const r=t.achievements,l=r.filter(m=>m.category===this.activeCategory),d=r.filter(m=>m.unlocked).length,o=[{key:"onboarding",label:"新手入門",icon:"🚀"},{key:"process",label:"製程突破",icon:"🔬"},{key:"operation",label:"廠務卓越",icon:"🛡️"},{key:"yield",label:"品質良率",icon:"💎"}];s.innerHTML=`
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
                      ${d}/16 已達成
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
                      (${r.filter(u=>u.category===m.key&&u.unlocked).length}/${r.filter(u=>u.category===m.key).length})
                    </span>
                  </button>
                `).join("")}
              </div>

              <!-- 成就清單 -->
              <div class="space-y-3">
                ${l.map(m=>`
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
      `,(c=document.getElementById("btn-close-achievements"))==null||c.addEventListener("click",i),(p=document.getElementById("btn-return-achievements"))==null||p.addEventListener("click",i),(h=document.getElementById("modal-backdrop-achievements"))==null||h.addEventListener("click",m=>{m.target===m.currentTarget&&i()}),document.querySelectorAll(".btn-tab").forEach(m=>{m.addEventListener("click",u=>{b.playClick();const f=u.currentTarget.getAttribute("data-cat");f&&(this.activeCategory=f,n())})}),document.querySelectorAll(".btn-claim-ach").forEach(m=>{m.addEventListener("click",u=>{const f=u.currentTarget.getAttribute("data-id");if(f){const x=N.claimReward(t.achievements,f);x.success&&(t.player.cash+=x.cash,L.recordSubsidy(t,x.cash),b.playCoin(),n(),e())}})})};n()}}w(me,"activeCategory","onboarding");class Z{static show(t,e,s){var r;const a=document.getElementById("modal-container");if(!a)return;this.currentLot=e||(t.activeLots.length>0?t.activeLots[0]:null);const i=!!((r=this.currentLot)!=null&&r.hasYellowRoomViolation),n=i?0:this.currentLot?this.currentLot.yieldMultiplier:t.rollingYieldHistory.length>0?t.rollingYieldHistory.reduce((l,d)=>l+d,0)/t.rollingYieldHistory.length:.92;if(i||n===0){this.dies=V.generateWaferMap(0);for(const l of this.dies)l.passed=!1,l.defectType="CLUSTER"}else this.dies=V.generateWaferMap(n);this.selectedDie=this.dies[12]||this.dies[0],this.render(a,t,s)}static render(t,e,s){var h,m;const a=this.dies.filter(u=>u.passed).length,i=this.dies.length-a,n=(a/this.dies.length*100).toFixed(1),r=this.dies.filter(u=>u.defectType==="CLUSTER").length,l=this.dies.filter(u=>u.defectType==="PARTICLE").length,d=this.dies.filter(u=>u.defectType==="OPTICAL_DEFOCUS").length,o=e.activeLots.some(u=>u.status==="PROCESSING")||e.machines.some(u=>u.status==="PROCESSING"),c=e.rollingYieldHistory.slice(-5),p=c.length>0?(c.reduce((u,f)=>u+f,0)/c.length*100).toFixed(1)+"%":"N/A";t.innerHTML=`
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
                  ${this.dies.map(u=>{var y;const f=((y=this.selectedDie)==null?void 0:y.index)===u.index;let x="bg-emerald-500 hover:bg-emerald-400 border-emerald-300/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]",g="✓";return u.passed||(u.defectType==="CLUSTER"?(x="bg-red-600 hover:bg-red-500 border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.7)]",g="✕"):u.defectType==="OPTICAL_DEFOCUS"?(x="bg-amber-500 hover:bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.6)]",g="⚠"):(x="bg-purple-600 hover:bg-purple-500 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]",g="●")),`
                      <button
                        class="btn-wafer-die rounded-md border text-xs font-bold text-white transition-all transform hover:scale-110 flex items-center justify-center font-mono ${x} ${f?"ring-2 ring-white scale-105":""}"
                        data-index="${u.index}"
                        title="Die [${u.row}, ${u.col}] - ${u.passed?"合格":"失效: "+u.defectType}"
                      >
                        ${g}
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
              ${(h=this.currentLot)!=null&&h.hasYellowRoomViolation||Number(n)===0?`
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
                  <div class="text-xl font-bold ${Number(n)>=90?"text-emerald-400":"text-amber-400"}">
                    ${n}%
                  </div>
                  <div class="text-[10px] text-slate-400 mt-0.5">
                    合格: ${a} / 失效: ${i}
                  </div>
                </div>

                <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div class="text-[10px] text-slate-400">全廠滑動良率指數</div>
                  <div class="text-xl font-bold ${o?"text-cyan-300":"text-slate-400"}">
                    ${p}
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
                  <span>${r} 顆</span>
                </div>
                <div class="flex justify-between text-amber-400">
                  <span>邊緣光學離焦 (Defocus):</span>
                  <span>${d} 顆</span>
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

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
            <button id="btn-back-wafer" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s)}static bindEvents(t,e,s){var n,r,l,d;const a=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",i)},i=o=>{o.key==="Escape"&&a()};window.addEventListener("keydown",i),(n=document.getElementById("btn-close-wafer-map"))==null||n.addEventListener("click",a),(r=document.getElementById("btn-back-wafer"))==null||r.addEventListener("click",a),(l=document.getElementById("modal-backdrop-wafer"))==null||l.addEventListener("click",o=>{o.target===document.getElementById("modal-backdrop-wafer")&&a()}),t.querySelectorAll(".btn-wafer-die").forEach(o=>{o.addEventListener("click",c=>{b.playClick();const p=parseInt(c.currentTarget.getAttribute("data-index")||"0",10);this.selectedDie=this.dies.find(h=>h.index===p)||null,this.render(t,e,s)})}),(d=document.getElementById("btn-resim-wafer"))==null||d.addEventListener("click",()=>{b.playClick();const o=this.currentLot?this.currentLot.yieldMultiplier:e.rollingYieldHistory.length>0?e.rollingYieldHistory.reduce((c,p)=>c+p,0)/e.rollingYieldHistory.length:.92;this.dies=V.generateWaferMap(o),this.selectedDie=this.dies[12]||this.dies[0],this.render(t,e,s)})}}w(Z,"dies",[]),w(Z,"selectedDie",null),w(Z,"currentLot",null);class re{static show(t,e,s){const a=document.getElementById("modal-container");a&&(this.currentOrder=e,e.layerAllocations&&e.layerAllocations.length===e.layerCount?this.localAllocations=JSON.parse(JSON.stringify(e.layerAllocations)):this.localAllocations=D.autoFillBestEconomyAllocation(e,t.machines),this.render(a,t,s))}static render(t,e,s){if(!this.currentOrder)return;const a=this.currentOrder,i=e.machines.filter(o=>o.category==="LITHO"),n=new Map(e.staff.map(o=>[o.id,o])),r=new Map;for(const o of i){const c=o.assignedEngineerId?n.get(o.assignedEngineerId):null,p=q.calculateEffectiveCD(o.modelId,e.player.unlockedK1,o.wear,c);r.set(o.modelId,p)}let l=!1;for(const o of this.localAllocations)if((r.get(o.assignedMachineModelId)??99999)>o.targetCD){l=!0;break}const d=a.nodeNm>=1e3?`${a.nodeNm/1e3} µm`:`${a.nodeNm} nm`;t.innerHTML=`
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
                  客戶: ${a.clientName} | 目標技術節點: ${d} | 總層數: ${a.layerCount} 層
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
            ${this.localAllocations.map(o=>{const c=r.get(o.assignedMachineModelId)??99999,p=c>o.targetCD,h=o.layerIndex<=3;return`
                <div class="p-3 rounded-xl bg-slate-900/80 border ${p?"border-red-500/60 bg-red-950/20":"border-slate-800 hover:border-slate-700"} flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all">
                  
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
                      ${i.map(m=>{const u=r.get(m.modelId)??9999,f=m.modelId===o.assignedMachineModelId;return`
                          <option value="${m.modelId}" ${f?"selected":""}>
                            ${m.name} (實時CD: ${u}nm | 磨損: ${Math.round(m.wear)}%)
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
                        機台CD ${c}nm > 需求 ${o.targetCD}nm
                      </div>
                    `:`
                      <div class="text-xs font-bold text-emerald-400 flex items-center md:justify-end gap-1">
                        <span>✅</span>
                        <span>光學合規</span>
                      </div>
                      <div class="text-[10px] text-slate-400 font-mono">
                        安全裕度: +${o.targetCD-c} nm
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
    `,this.bindEvents(t,e,s)}static bindEvents(t,e,s){var r,l,d,o,c;const a=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",i)},i=p=>{p.key==="Escape"&&a()};window.addEventListener("keydown",i),(r=document.getElementById("btn-close-layer-modal"))==null||r.addEventListener("click",a),(l=document.getElementById("btn-cancel-layer-alloc"))==null||l.addEventListener("click",a),(d=document.getElementById("modal-backdrop-layer"))==null||d.addEventListener("click",p=>{p.target===document.getElementById("modal-backdrop-layer")&&a()}),t.querySelectorAll(".sel-layer-machine").forEach(p=>{p.addEventListener("change",h=>{const m=h.target,u=Number(m.dataset.layer),f=m.value,x=this.localAllocations.find(g=>g.layerIndex===u);x&&(x.assignedMachineModelId=f,b.playClick(),this.render(t,e,s))})}),(o=document.getElementById("btn-auto-fill-alloc"))==null||o.addEventListener("click",()=>{this.currentOrder&&(b.playCoinChime(),this.localAllocations=D.autoFillBestEconomyAllocation(this.currentOrder,e.machines),this.render(t,e,s))}),(c=document.getElementById("btn-save-layer-alloc"))==null||c.addEventListener("click",()=>{this.currentOrder&&(this.currentOrder.layerAllocations=JSON.parse(JSON.stringify(this.localAllocations)),b.playFanfare(),t.innerHTML="",s())})}}w(re,"currentOrder",null),w(re,"localAllocations",[]);class oe{static show(t,e){const s=document.getElementById("modal-container");s&&($.ensureMarketOrders(t),this.render(s,t,e))}static render(t,e,s){const a=e.marketOrders||[],i=e.rollingYieldHistory.length>0?e.rollingYieldHistory.reduce((d,o)=>d+o,0)/e.rollingYieldHistory.length:null,n=$.calculateTrustMultiplier(i),r=this.getBestLithoCD(e),l=$.getMarketRefreshCost(e.player.foundryTier);t.innerHTML=`
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
                <button id="btn-refresh-market" class="btn-sci-fi text-xs py-1.5 px-3 bg-amber-950/70 hover:bg-amber-900 border border-amber-500/60 text-amber-300 font-bold flex items-center gap-1.5 shadow-sm cursor-pointer" title="派遣商業獵單顧問重新招攬合約池 (費用: NT$ ${l.toLocaleString()})">
                  <span>🔄 商業獵單刷新</span>
                  <span class="font-mono text-amber-200">(NT$ ${l.toLocaleString()})</span>
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
    `,this.bindEvents(t,e,s)}static renderMarketOrders(t,e){const s=t.marketOrders||[],a=s.length>=$.MAX_MARKET_ORDERS,i=t.nextOrderRespawnTime?Math.max(0,Math.ceil((t.nextOrderRespawnTime-Date.now())/1e3)):0;let n="";return a||(n=`
        <div id="contract-respawn-banner" class="mb-4 p-3 rounded-xl bg-slate-900/90 border border-cyan-500/40 flex items-center justify-between text-xs text-slate-300 shadow-md">
          <div class="flex items-center gap-2.5">
            <span class="text-base animate-spin">⏳</span>
            <div>
              <span class="font-bold text-cyan-300">新客戶合約洽談中</span>
              <span class="text-slate-400 ml-1.5">(合約池: ${s.length}/${$.MAX_MARKET_ORDERS} 筆，每筆訂單冷卻 60 秒陸續送達)</span>
            </div>
          </div>
          <div class="font-mono font-bold text-amber-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-right">
            下一筆合約抵達：<span id="contract-respawn-timer" class="text-amber-300 text-sm font-black">${i}</span> 秒
          </div>
        </div>
      `),s.length===0?`
        ${n}
        <div class="text-center py-12 text-slate-400 space-y-3">
          <div class="text-5xl mb-2 animate-bounce">📭</div>
          <p class="text-base font-bold text-slate-200">目前合約公告板已全數接單完畢！</p>
          <p class="text-xs text-slate-400">
            新客戶合約將在冷卻倒數結束後自動送達，或可點擊右上角【商業獵單刷新】即刻引進 5 筆全新合約。
          </p>
        </div>
      `:`
      ${n}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${s.map((r,l)=>{const d=e<=r.nodeNm,o=r.nodeNm>=1e3?`${r.nodeNm/1e3} µm`:`${r.nodeNm} nm`;let c='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">常規件 (1.0x)</span>';r.urgencyMultiplier===1.2?c='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">🟡 急件 (1.2x)</span>':r.urgencyMultiplier>=1.5&&(c='<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/20 text-red-300 border border-red-500/30 animate-pulse">🔴 SHR 超急件 (1.5x)</span>');const p=r.nrePaid+r.totalDies*r.unitPrice;return`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${d?"border-slate-800 hover:border-cyan-500/40":"border-red-900/40 bg-red-950/10"} transition-all flex flex-col justify-between space-y-3">
              <!-- Card Header -->
              <div class="flex items-start justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">${r.clientName}</span>
                    ${c}
                  </div>
                  <div class="text-xs text-slate-400 mt-0.5 font-mono">
                    合約編號: ${r.id}
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold font-mono text-cyan-300">${o}</div>
                  <div class="text-[10px] text-slate-400">${r.layerCount} 道光罩層</div>
                </div>
              </div>

              <!-- Card Specs -->
              <div class="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
                <div>
                  <div class="text-[10px] text-slate-400">總晶粒需求</div>
                  <div class="font-mono font-semibold text-slate-200">${r.totalDies.toLocaleString()} 顆</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">出貨單價</div>
                  <div class="font-mono font-semibold text-emerald-400">NT$ ${r.unitPrice.toFixed(2)} /顆</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">💰 接單即付 NRE</div>
                  <div class="font-mono font-bold text-amber-300">+NT$ ${r.nrePaid.toLocaleString()}</div>
                </div>
                <div>
                  <div class="text-[10px] text-slate-400">預估合約總值</div>
                  <div class="font-mono font-semibold text-cyan-300">~NT$ ${Math.round(p).toLocaleString()}</div>
                </div>
              </div>

              <!-- Delivery Duration & Market Expiration Countdown -->
              <div class="flex items-center justify-between text-[11px] p-2 rounded bg-slate-950/40 border border-slate-800/60">
                <div class="flex items-center gap-1 text-slate-400" title="簽約接單後承諾之總生產交付時間">
                  <span>⏱️ 交付時限:</span>
                  <span class="font-mono text-cyan-300 font-semibold">${$.getAllowedDurationSec(r)} 遊戲秒</span>
                </div>
                <div class="flex items-center gap-1" title="客戶等待報價有效時間，逾時將轉向其他代工廠並刷新更換">
                  <span class="text-slate-400">⏳ 報價時效:</span>
                  <span class="market-order-timer font-mono font-bold ${Math.max(0,Math.ceil(((r.marketExpiresAt||Date.now()+6e4)-Date.now())/1e3))<=15?"text-red-400 animate-pulse":"text-amber-400"}" data-order-id="${r.id}">
                    ${Math.max(0,Math.ceil(((r.marketExpiresAt||Date.now()+6e4)-Date.now())/1e3))} 秒
                  </span>
                </div>
              </div>

              <!-- Litho CD warning if incapable -->
              ${d?"":`
                <div class="p-2 rounded bg-red-900/20 border border-red-700/30 text-[11px] text-red-300 flex items-center gap-1.5">
                  <span>⚠️</span>
                  <span>廠內機台極限 CD (${e===999999?"無微影機":e+"nm"}) 無法滿足 ${o} 製程需求！</span>
                </div>
              `}

              <!-- Action Button -->
              <button
                class="btn-accept-order btn-sci-fi w-full justify-center ${d?"":"opacity-50 cursor-not-allowed"}"
                data-index="${l}"
                ${d?"":"disabled"}
              >
                ✍️ 簽約接單 (即刻領取 NT$ ${r.nrePaid.toLocaleString()})
              </button>
            </div>
          `}).join("")}
      </div>
    `}static renderActiveOrders(t){if(t.activeOrders.length===0)return`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">⚙️</div>
          <p class="text-sm">目前產線無在製或完工訂單，請前往「承接市場訂單池」簽約接單！</p>
        </div>
      `;const e=t.activeOrders.filter(n=>n.status==="COMPLETED"),s=t.activeOrders.filter(n=>n.status==="PENDING"||n.status==="ACTIVE");let a="";e.length>0&&(a=`
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
            ${e.map(n=>{const r=n.totalDies>0?n.goodDiesDelivered/n.totalDies:0,l=(r*100).toFixed(1),o=t.activeLots.filter(h=>h.orderId===n.id).reduce((h,m)=>h+(m.waferCount||25),0)||25,c=n.assignedPieId?t.staff.find(h=>h.id===n.assignedPieId):null,p=$.settleOrderPayout(n,n.goodDiesDelivered,t.player,t.staff,0,t.clawbackDebt);return`
                <div class="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 space-y-3">
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-white text-base">${n.clientName}</span>
                        <span class="text-xs font-mono text-cyan-300">
                          [${n.nodeNm>=1e3?n.nodeNm/1e3+"µm":n.nodeNm+"nm"}]
                        </span>
                        <span class="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                          <span>✓</span><span>完工並交貨</span>
                        </span>
                      </div>
                      <div class="text-xs text-slate-400 mt-1 font-mono flex flex-wrap items-center gap-3">
                        <span>合約編號: ${n.id}</span>
                        <span>|</span>
                        <span>投入晶圓: ${o} 片</span>
                        <span>|</span>
                        <span>光罩層數: ${n.layerCount} 層</span>
                        <span>|</span>
                        <span>責任 PIE: <strong class="text-indigo-300">${c?c.name+" ("+c.rank+")":"無"}</strong></span>
                      </div>
                    </div>

                    <div class="sm:text-right">
                      <div class="text-[11px] text-slate-400">
                        NRE 預付款 (已入帳): <strong class="text-amber-300">NT$ ${n.nrePaid.toLocaleString()}</strong>
                      </div>
                      <div class="text-[11px] text-slate-400 mt-0.5">
                        晶粒單價: NT$ ${n.unitPrice.toFixed(2)} /顆
                      </div>
                    </div>
                  </div>

                  <!-- Delivery Yield & Dies Statistics -->
                  <div class="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div class="flex items-center gap-4">
                      <div class="text-center px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex-shrink-0">
                        <div class="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">交貨良率</div>
                        <div class="text-xl font-mono font-extrabold text-emerald-300">${l}%</div>
                      </div>
                      <div>
                        <div class="text-xs text-slate-200 font-mono">
                          實收良品晶粒: <strong class="text-emerald-400 font-bold">${n.goodDiesDelivered.toLocaleString()}</strong> / ${n.totalDies.toLocaleString()} 顆
                        </div>
                        <div class="text-[11px] text-slate-400 mt-0.5">
                          ${r>=.85?"🌟 良率優於業界水準！客戶信任度提升":r>=.6?"✓ 符合初期製程交貨規格":"⚠️ 製程落塵或缺陷較多，良品數偏低"}
                        </div>
                      </div>
                    </div>

                    <div class="w-full sm:w-auto">
                      <button class="btn-settle-order btn-sci-fi w-full sm:w-auto text-xs sm:text-sm py-2 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-1.5 cursor-pointer animate-pulse" data-order-id="${n.id}">
                        <span>💰</span>
                        <span>請領代工尾款 NT$ ${p.netPayout.toLocaleString()}</span>
                      </button>
                    </div>
                  </div>
                </div>
              `}).join("")}
          </div>
        </div>
      `);let i="";return s.length>0&&(i=`
        <div class="space-y-4">
          ${s.map(n=>{var m;const r=n.status==="PENDING",l=r?n.allowedDurationSec||240:Math.max(0,n.deadlineGameTime-t.gameTime),d=!r&&l===0,o=t.activeLots.filter(u=>u.orderId===n.id),c=Math.min(100,Math.round(n.goodDiesDelivered/n.totalDies*100)),p=n.assignedPieId?t.staff.find(u=>u.id===n.assignedPieId):null,h=V.getPieBonus(p);return`
              <div class="p-4 rounded-xl bg-slate-900/80 border ${r?"border-amber-500/50":d?"border-red-600/50":"border-slate-800"} space-y-3">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-white">${n.clientName}</span>
                      <span class="text-xs font-mono text-cyan-300">
                        [${n.nodeNm>=1e3?n.nodeNm/1e3+"µm":n.nodeNm+"nm"}]
                      </span>
                      ${r?'<span class="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">🟡 待啟動投片</span>':d?'<span class="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold animate-pulse">逾期追討中</span>':'<span class="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">⚡ 加工中</span>'}
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5 font-mono">
                      合約編號: ${n.id} | 光罩層數: ${n.layerCount} 層
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-xs ${r?"text-amber-300 font-semibold":d?"text-red-400 font-bold":"text-slate-400"}">
                      ${r?`約定工期: ${l} 秒 (啟動後計時)`:d?"已過期 (違約罰金累積中)":`剩餘交期: ${l} 秒`}
                    </div>
                    <div class="text-[10px] text-slate-400 mt-0.5">
                      出貨單價: NT$ ${n.unitPrice.toFixed(2)} /顆
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
                        ${p?`<span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-indigo-900/60 text-indigo-200 border border-indigo-400/30">${p.rank}</span>`:""}
                      </div>
                      <div class="text-[10px] text-slate-400 font-mono">
                        ${p?`⚡ 站點加速 +${Math.round(h.speedBonus*100)}% | 🎯 良率守護 +${(h.yieldBonus*100).toFixed(1)}% (疲勞: ${Math.round(p.fatigue)}%)`:"未指派 PIE (點選右側選單指派工程師，依職階提供全製程加速與良率守護)"}
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center gap-2 w-full sm:w-auto">
                    <select class="select-order-pie bg-slate-900 border border-indigo-500/40 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:border-indigo-400 focus:outline-none cursor-pointer" data-order-id="${n.id}">
                      <option value="">-- 未指派 PIE (無加成) --</option>
                      ${t.staff.map(u=>{const f=V.getPieBonus(u),x=n.assignedPieId===u.id;return`<option value="${u.id}" ${x?"selected":""}>
                          ${u.name} (${u.rank} / ${u.moduleSpecialty==="PIE"?"PIE 專精":u.moduleSpecialty}) [+${Math.round(f.speedBonus*100)}%速 / +${(f.yieldBonus*100).toFixed(1)}%良]
                        </option>`}).join("")}
                    </select>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div>
                  <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-400">出貨進度</span>
                    <span class="font-mono text-cyan-300">${n.goodDiesDelivered.toLocaleString()} / ${n.totalDies.toLocaleString()} 顆 (${c}%)</span>
                  </div>
                  <div class="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div class="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300" style="width: ${c}%"></div>
                  </div>
                </div>

                <!-- Lots in Production -->
                <div>
                  <div class="text-xs text-slate-400 font-semibold mb-2">在製批次 (Wafer Lots) 狀態：</div>
                  ${o.length===0?`
                    <div class="text-xs text-slate-400 italic">尚無加工批次投入</div>
                  `:`
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      ${o.map(u=>{let f=`<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">${u.currentStation}</span>`;u.status==="QUEUED"?f='<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-950 text-blue-300 border border-blue-500/30">待命準備中</span>':u.currentStation==="LIT"?f=`<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">微影 (${u.litSubStep||"COAT"})</span>`:u.status==="COMPLETED"&&(f='<span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">已完工</span>');const x=t.machines.find(T=>T.status==="EXPLODED"?!1:u.currentStation==="LIT"?u.litSubStep==="COAT"||u.litSubStep==="DEVELOP"?T.category==="TRACK":T.category==="LITHO":T.category===u.currentStation),g=x?x.name:"自動分配中";let y="";if(u.qTimeDeadline!==null){const T=Math.max(0,u.qTimeDeadline-t.gameTime);y=`<span class="text-[10px] font-mono ${T<10?"text-red-400 animate-pulse":"text-amber-400"}">⏳ Q-Time: ${T}s</span>`}return`
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
                                <span class="font-bold truncate max-w-[140px]">${g}</span>
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
                    ${n.layerCount>1?`
                      <button class="btn-layer-allocation btn-sci-fi text-xs py-1 px-3 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 flex items-center gap-1.5 cursor-pointer" data-order-id="${n.id}" title="自訂先進製程多層微影機台分配">
                        <span>🎛️</span>
                        <span>微影分層配方 (${((m=n.layerAllocations)==null?void 0:m.length)||n.layerCount}層)</span>
                      </button>
                    `:""}
                  </div>

                  <div class="flex items-center gap-2">
                    ${r?`
                      <button class="btn-start-order-production btn-sci-fi text-xs py-2 px-5 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold shadow-lg shadow-cyan-900/40 animate-pulse flex items-center gap-1.5 cursor-pointer" data-order-id="${n.id}">
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
      `),a+i}static bindEvents(t,e,s){var n,r,l,d,o,c;const a=()=>{this.countdownIntervalId!==null&&(clearInterval(this.countdownIntervalId),this.countdownIntervalId=null),b.playClick(),t.innerHTML="",window.removeEventListener("keydown",i)},i=p=>{p.key==="Escape"&&a()};window.addEventListener("keydown",i),(n=document.getElementById("btn-close-contract"))==null||n.addEventListener("click",a),(r=document.getElementById("btn-back-contract"))==null||r.addEventListener("click",a),(l=document.getElementById("modal-backdrop-contract"))==null||l.addEventListener("click",p=>{p.target===document.getElementById("modal-backdrop-contract")&&a()}),(d=document.getElementById("tab-market"))==null||d.addEventListener("click",()=>{b.playClick(),this.currentTab="MARKET",this.render(t,e,s)}),(o=document.getElementById("tab-active"))==null||o.addEventListener("click",()=>{b.playClick(),this.currentTab="ACTIVE",this.render(t,e,s)}),(c=document.getElementById("btn-refresh-market"))==null||c.addEventListener("click",()=>{const p=$.getMarketRefreshCost(e.player.foundryTier);if(e.player.cash<p){b.playClick(),alert(`❌ 廠房資金不足！派遣商業獵單顧問需要 NT$ ${p.toLocaleString()}，目前現金僅有 NT$ ${Math.round(e.player.cash).toLocaleString()}`);return}confirm(`【商業獵單刷新確認】

您確定要支付 NT$ ${p.toLocaleString()} 聘請半導體商業獵單顧問，為合約板重新引入 5 筆全新客戶合約嗎？`)&&(e.player.cash-=p,L.recordOpEx(e,"商業獵單顧問費",p),$.forceRefreshAllMarketOrders(e),C.saveToLocalStorage(e),b.playCoin(),this.render(t,e,s),s())}),this.countdownIntervalId!==null&&clearInterval(this.countdownIntervalId),this.countdownIntervalId=window.setInterval(()=>{if(this.currentTab==="MARKET"){const p=(e.marketOrders||[]).length,h=$.checkOrderReplenishment(e),m=$.checkMarketOrdersExpiry(e),u=(e.marketOrders||[]).length;if(h||m||p!==u){C.saveToLocalStorage(e),this.render(t,e,s);return}const f=document.getElementById("contract-respawn-timer");if(f){const x=e.nextOrderRespawnTime?Math.max(0,Math.ceil((e.nextOrderRespawnTime-Date.now())/1e3)):0;f.textContent=`${x}`}t.querySelectorAll(".market-order-timer").forEach(x=>{var T;const g=x.getAttribute("data-order-id"),y=(T=e.marketOrders)==null?void 0:T.find(v=>v.id===g);if(y&&y.marketExpiresAt){const v=Math.max(0,Math.ceil((y.marketExpiresAt-Date.now())/1e3));x.textContent=`${v} 秒`,v<=15?x.className="market-order-timer font-mono font-bold text-red-400 animate-pulse":x.className="market-order-timer font-mono font-bold text-amber-400"}})}},1e3),t.querySelectorAll(".btn-accept-order").forEach(p=>{p.addEventListener("click",h=>{const m=parseInt(h.currentTarget.getAttribute("data-index")||"0",10),u=e.marketOrders||[],f=u[m];if(!f)return;b.playCoinChime(),e.player.cash+=f.nrePaid,L.recordNREFee(e,f.nrePaid);const x=$.getAllowedDurationSec(f);f.allowedDurationSec=x,f.deadlineGameTime=e.gameTime+x,f.status="PENDING";const g=e.staff.find(v=>v.moduleSpecialty==="PIE"&&v.workShift!=="OFF")||e.staff[0];g&&(f.assignedPieId=g.id),e.activeOrders.push(f);const y=Math.max(1,Math.min(3,Math.ceil(f.totalDies/1e3))),T=V.calculateLotYield({lotId:"",orderId:f.id,waferCount:25,currentStation:"FILM",currentLayer:1,totalLayers:f.layerCount,qTimeDeadline:null,yieldMultiplier:1,status:"QUEUED"},e,f);for(let v=0;v<y;v++){const E={lotId:`LOT-${Date.now().toString(36).toUpperCase().slice(-4)}-${v+1}`,orderId:f.id,waferCount:Math.ceil(f.totalDies/y/(f.nodeNm>=1e3?500:2e3)),currentStation:"FILM",currentLayer:1,totalLayers:f.layerCount,qTimeDeadline:null,yieldMultiplier:T,status:"QUEUED",stationProgressSeconds:0,stationRequiredSeconds:D.getStationRequiredSeconds("FILM")};e.activeLots.push(E)}u.splice(m,1),u.length<$.MAX_MARKET_ORDERS&&!e.nextOrderRespawnTime&&(e.nextOrderRespawnTime=Date.now()+$.ORDER_RESPAWN_COOLDOWN_MS),N.checkAchievements(e),C.saveToLocalStorage(e),s(),this.currentTab="ACTIVE",this.render(t,e,s)})}),t.querySelectorAll(".select-order-pie").forEach(p=>{p.addEventListener("change",h=>{const m=h.currentTarget,u=m.getAttribute("data-order-id"),f=m.value,x=e.activeOrders.find(g=>g.id===u);x&&(x.assignedPieId=f||null,b.playClick(),C.saveToLocalStorage(e),s(),this.render(t,e,s))})}),t.querySelectorAll(".btn-start-order-production").forEach(p=>{p.addEventListener("click",h=>{const m=h.currentTarget.getAttribute("data-order-id"),u=e.activeOrders.find(g=>g.id===m);if(!u)return;b.playClick(),u.status="ACTIVE";const f=$.getAllowedDurationSec(u);u.allowedDurationSec=f,u.deadlineGameTime=e.gameTime+f;const x=u.assignedPieId?e.staff.find(g=>g.id===u.assignedPieId):void 0;for(const g of e.activeLots)g.orderId===u.id&&g.status==="QUEUED"&&(g.status="PROCESSING",g.stationProgressSeconds=0,g.stationRequiredSeconds=D.getStationRequiredSeconds(g.currentStation,g.litSubStep,void 0,void 0,x));C.saveToLocalStorage(e),s(),this.render(t,e,s)})}),t.querySelectorAll(".btn-settle-order").forEach(p=>{p.addEventListener("click",h=>{const m=h.currentTarget.getAttribute("data-order-id"),u=e.activeOrders.findIndex(E=>E.id===m);if(u===-1)return;const f=e.activeOrders[u],x=f.goodDiesDelivered>0?f.goodDiesDelivered:Math.round(f.totalDies*.6),g=$.settleOrderPayout(f,x,e.player,e.staff,0,e.clawbackDebt);e.player.cash+=g.netPayout,ie.trigger(g.netPayout,p),b.playCoinChime(),L.recordWaferSales(e,g.netPayout),e.clawbackDebt=g.remainingDebt,e.player.popularity=Math.min(100,e.player.popularity+1);const y=f.totalDies>0?Number((x/f.totalDies).toFixed(3)):.6;e.rollingYieldHistory.push(y),e.rollingYieldHistory.length>5&&e.rollingYieldHistory.shift();const v=e.activeLots.filter(E=>E.orderId===f.id).reduce((E,k)=>E+(k.waferCount||25),0)||25;e.player.totalOrdersFulfilled=(e.player.totalOrdersFulfilled||0)+1,e.player.totalWafersDelivered=(e.player.totalWafersDelivered||0)+v,G.onOrderFulfilled(e.questState),N.checkAchievements(e),e.activeOrders.splice(u,1),e.activeLots=e.activeLots.filter(E=>E.orderId!==f.id),C.saveToLocalStorage(e),s(),this.render(t,e,s)})}),t.querySelectorAll(".btn-collect-all-orders").forEach(p=>{p.addEventListener("click",()=>{const h=e.activeOrders.filter(u=>u.status==="COMPLETED");if(h.length===0)return;let m=0;for(const u of h){const f=u.goodDiesDelivered>0?u.goodDiesDelivered:Math.round(u.totalDies*.6),x=$.settleOrderPayout(u,f,e.player,e.staff,0,e.clawbackDebt);e.player.cash+=x.netPayout,m+=x.netPayout,L.recordWaferSales(e,x.netPayout),e.clawbackDebt=x.remainingDebt,e.player.popularity=Math.min(100,e.player.popularity+1);const g=u.totalDies>0?Number((f/u.totalDies).toFixed(3)):.6;e.rollingYieldHistory.push(g),e.rollingYieldHistory.length>5&&e.rollingYieldHistory.shift();const T=e.activeLots.filter(v=>v.orderId===u.id).reduce((v,E)=>v+(E.waferCount||25),0)||25;e.player.totalOrdersFulfilled=(e.player.totalOrdersFulfilled||0)+1,e.player.totalWafersDelivered=(e.player.totalWafersDelivered||0)+T,G.onOrderFulfilled(e.questState),e.activeLots=e.activeLots.filter(v=>v.orderId!==u.id)}e.activeOrders=e.activeOrders.filter(u=>u.status!=="COMPLETED"),ie.trigger(m,p),b.playCoinChime(),N.checkAchievements(e),C.saveToLocalStorage(e),s(),this.render(t,e,s)})}),t.querySelectorAll(".btn-inspect-lot").forEach(p=>{p.addEventListener("click",h=>{const m=h.currentTarget.getAttribute("data-lot-id"),u=e.activeLots.find(f=>f.lotId===m);b.playClick(),Z.show(e,u,()=>{this.render(t,e,s),s()})})}),t.querySelectorAll(".btn-layer-allocation").forEach(p=>{p.addEventListener("click",h=>{const m=h.currentTarget.getAttribute("data-order-id"),u=e.activeOrders.find(f=>f.id===m);u&&(b.playClick(),re.show(e,u,()=>{this.render(t,e,s),s()}))})})}static getBestLithoCD(t){const e=t.machines.filter(a=>a.category==="LITHO"&&a.status!=="EXPLODED");if(e.length===0)return 999999;let s=999999;for(const a of e){const i=q.OPTICAL_CATALOG[a.modelId];i&&i.baseRayleighLimitNm<s&&(s=i.baseRayleighLimitNm)}return s}}w(oe,"currentTab","MARKET"),w(oe,"countdownIntervalId",null);class ue{static show(t,e){const s=document.getElementById("modal-container");if(!s)return;const a=t.player.foundryTier||1;this.selectedViewTier=Math.min(F.MAX_TIER,a+1),this.render(s,t,e)}static render(t,e,s){var l,d;const a=F.getProgressionStatus(e),i=F.getTierConfig(a.currentTier),n=this.selectedViewTier||Math.min(F.MAX_TIER,a.currentTier+1),r=F.getTierConfig(n);t.innerHTML=`
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
              
              ${Array.from({length:F.MAX_TIER},(o,c)=>c+1).map(o=>{const c=F.getTierConfig(o),p=o<a.currentTier,h=o===a.currentTier,m=o===a.currentTier+1,u=o===n;let f="border-slate-700 bg-slate-900 text-slate-500",x="未解鎖",g="bg-slate-800 text-slate-500 border-slate-700";return p?(f="border-emerald-500/80 bg-emerald-950/60 text-emerald-400 shadow-lg shadow-emerald-950/50",x="已突破",g="bg-emerald-950/80 text-emerald-300 border-emerald-500/40"):h?(f="border-cyan-400 bg-cyan-950/80 text-cyan-300 ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-950/60",x="當前世代",g="bg-cyan-900/80 text-cyan-200 border-cyan-400/50"):m&&(f="border-amber-400/90 bg-amber-950/70 text-amber-300 ring-2 ring-amber-500/30 pulse-alert",x=`研發中 ${a.overallPct}%`,g="bg-amber-950/80 text-amber-300 border-amber-500/40"),`
                  <button
                    class="btn-tier-node z-10 flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer group ${u?"scale-105 bg-slate-800/80 ring-2 ring-cyan-400":"hover:bg-slate-900/50"}"
                    data-tier="${o}"
                    title="點擊檢視 Tier ${o} ${c.name} 詳細製程規格"
                  >
                    <div class="w-12 h-12 rounded-2xl border-2 flex items-center justify-center font-mono font-bold text-sm transition-transform ${f} group-hover:scale-110">
                      ${p?"✓":`T${o}`}
                    </div>
                    <div class="text-center">
                      <div class="text-[11px] font-bold text-slate-200 truncate max-w-[105px]">${c.name.slice(0,7)}</div>
                      <span class="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono border ${g}">
                        ${x}
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
                    Tier ${r.tier} • ${r.eraCode}
                  </span>
                  ${r.tier===a.currentTier?'<span class="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">★ 現役工廠世代</span>':""}
                  ${r.tier===a.currentTier+1?'<span class="text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">🎯 次世代微縮目標</span>':""}
                </div>
                <h4 class="text-lg font-bold text-white tracking-wide">
                  ${r.name} <span class="text-sm font-normal text-slate-400 font-sans">(${r.subtitle})</span>
                </h4>
                <p class="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                  ${r.description}
                </p>
                <div class="mt-2 text-[11px] text-amber-300/90 flex items-start gap-1.5 bg-amber-950/20 p-2 rounded-lg border border-amber-500/20">
                  <span>💡</span>
                  <span><strong>物理科技史：</strong>${r.scienceHistory}</span>
                </div>
              </div>

              <!-- 關鍵參數摘要 -->
              <div class="flex md:flex-col gap-3 min-w-[180px] bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
                <div>
                  <span class="text-[10px] text-slate-400 block font-sans">極限線寬 (Min CD)</span>
                  <span class="text-sm font-bold text-cyan-400">${r.minCDNm>=1e3?(r.minCDNm/1e3).toFixed(1)+" µm":r.minCDNm+" nm"}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 block font-sans">要求潔淨室標準</span>
                  <span class="text-sm font-bold text-emerald-400">${r.unlockedCleanroomClass}</span>
                </div>
              </div>
            </div>

            <!-- 研發進度三大指標 (若檢視的是次世代目標) -->
            ${!a.isMaxTier&&r.tier===a.currentTier+1?`
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
                    ${a.canAdvance?`🚀 達成三大研發條件！立即突破晉升【Tier ${(l=a.nextTierConfig)==null?void 0:l.tier} ${(d=a.nextTierConfig)==null?void 0:d.name}】！`:`🔒 尚未達成晉升條件 (完成度 ${a.overallPct}%)`}
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
                  <span>Tier ${r.tier} 專屬解鎖先進機台與製程特色</span>
                </h4>
                <span class="text-[11px] text-slate-400 font-mono">共 ${r.unlockedModelIds.length} 台次世代設備</span>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                ${r.unlockedModelIds.map(o=>{const c=X.STORE_CATALOG.find(p=>p.modelId===o);return c?`
                    <div class="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700 transition-colors">
                      <div class="w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center p-1 flex-shrink-0">
                        <img src="${c.assetPath}" alt="${c.name}" class="w-full h-full object-contain" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-xs font-bold text-white truncate">${c.name}</div>
                        <div class="text-[10px] text-slate-400 mt-0.5">${c.category} • 產能 ${c.throughputWpm} wpm</div>
                        <div class="text-xs font-mono font-bold text-amber-400 mt-1">NT$ ${c.price.toLocaleString()}</div>
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
    `,this.bindEvents(t,e,s)}static bindEvents(t,e,s){const a=t.querySelector("#modal-backdrop-techtree"),i=t.querySelector("#btn-close-techtree"),n=t.querySelector("#btn-back-techtree"),r=()=>{b.playClick(),t.innerHTML="",s()};a==null||a.addEventListener("click",d=>{d.target===a&&r()}),i==null||i.addEventListener("click",r),n==null||n.addEventListener("click",r),t.querySelectorAll(".btn-tier-node").forEach(d=>{d.addEventListener("click",o=>{const c=Number(o.currentTarget.getAttribute("data-tier"));c>=1&&c<=F.MAX_TIER&&(b.playClick(),this.selectedViewTier=c,this.render(t,e,s))})}),t.querySelectorAll(".btn-invest-funds").forEach(d=>{d.addEventListener("click",o=>{const c=Number(o.currentTarget.getAttribute("data-amount"));F.investRDCapital(e,c).success?b.playDing():b.playAlarm(),s(),this.render(t,e,s)})});const l=t.querySelector("#btn-advance-tier");l==null||l.addEventListener("click",()=>{const d=F.advanceFoundryTier(e);d.success?(b.playFanfare(),this.selectedViewTier=Math.min(F.MAX_TIER,d.newTier+1),s(),this.render(t,e,s)):(b.playAlarm(),alert(d.message))})}}w(ue,"selectedViewTier",null);class X{static show(t,e){const s=document.getElementById("modal-container");s&&this.render(s,t,e)}static render(t,e,s){const a=[{key:"LITHO",label:"LITHO 微影機",icon:"🔦"},{key:"TRACK",label:"TRACK 塗膠顯影 (瓶頸)",icon:"🌀"},{key:"FILM",label:"FILM 薄膜成長",icon:"✨"},{key:"ETCH",label:"ETCH 蝕刻製程",icon:"⚡"},{key:"DIFF",label:"DIFF 擴散植入",icon:"🎯"},{key:"CMP",label:"CMP 平坦研磨",icon:"💿"},{key:"AMHS",label:"AMHS 運送設備",icon:"🚚"},{key:"FLEET",label:"廠內現役機台 ("+e.machines.length+")",icon:"🏭"}];t.innerHTML=`
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
            ${a.map(i=>{const n=this.activeCategory===i.key,r=i.key==="CMP"&&!e.unlockedFeatures.cmp;return`
                <button
                  class="btn-store-tab px-3.5 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-all flex items-center gap-1.5 ${n?"border-amber-400 text-amber-300":"border-transparent text-slate-400 hover:text-slate-200"} ${r?"opacity-50":""}"
                  data-cat="${i.key}"
                >
                  <span>${i.icon}</span>
                  <span>${i.label}</span>
                  ${r?'<span class="text-[10px] text-amber-500 font-mono">(Tier 3解鎖)</span>':""}
                </button>
              `}).join("")}
          </div>

          <!-- Body Content -->
          <div class="modal-body p-6 overflow-y-auto flex-1 space-y-4">
            ${this.activeCategory==="FLEET"?this.renderFleetTab(e):this.activeCategory==="AMHS"?this.renderAMHSTab(e):this.renderCatalogTab(e)}
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
        ${[{feature:"manual",name:"人工卡匣徒步搬運 (Manual Handling)",tier:1,price:0,speed:"1.0 格/秒",assetPath:A.characters.tech_cleanroom.path,isPurchased:!0,isUnlocked:!0,canAfford:!0,description:"無塵衣技術員手持晶圓盒穿梭各站手動交接。搬運速度慢，人員走動產生微塵，交接等待時間較長。",scienceNote:"半導體萌芽期仰賴人員手動搬運卡匣，每小時人員走動產生之微塵顆粒達數萬顆，對良率是巨大隱憂。",benefits:["基礎徒步搬運","無設備採購支出"]},{feature:"agv",name:"AGV 磁導激光無人自走車 (Automated Guided Vehicle)",tier:1,price:8e6,speed:"2.5 格/秒",assetPath:A.characters.agv_carrier.path,isPurchased:!!t.unlockedFeatures.agv,isUnlocked:t.player.foundryTier>=1,canAfford:t.player.cash>=8e6,description:"地面自主導航輪式無人載具，依循地面雷射激光自主穿梭於各站機台之間。自動對位上下料，大幅降低人員進出無塵室落塵。",scienceNote:"AGV 採用光學雷達 (LiDAR) 與磁帶導引，實現無塵室地面自動化運輸，有效平滑各站排隊緩衝並消弭交接震動。",benefits:["解鎖地面無人自走車自主巡航","消弭人工搬運落塵提升良率","達成自動化物料搬運 AMHS 里程碑"]},{feature:"oht",name:"OHT 高速天軌懸吊天車 (Overhead Hoist Transport)",tier:2,price:35e6,speed:"5.0 格/秒",assetPath:A.characters.oht_shuttle.path,isPurchased:!!t.unlockedFeatures.oht,isUnlocked:t.player.foundryTier>=2,canAfford:t.player.cash>=35e6,description:"天花板立體閉迴路天軌懸吊天車系統，晶圓 FOUP 完全在空中高速飛行傳送。徹底解耦地面人車交通，是現代晶圓廠的核心骨幹！",scienceNote:"現代 300mm 超級晶圓廠的神經中樞。透過空中立體懸吊軌道直接降下垂直機械爪 (Hoist) 對位 Load Port，站點傳送時間縮短 70%！",benefits:["解鎖天花板空中天軌高速巡航","站間交接時間縮短 70%","徹底消除地面交織塞車瓶頸"]},{feature:"shrOht",name:"SHR 超急件綠波磁浮天車 (Super Hot Run OHT)",tier:4,price:12e7,speed:"8.0 格/秒",assetPath:A.characters.oht_shuttle.path,isPurchased:!!t.unlockedFeatures.shrOht,isUnlocked:t.player.foundryTier>=4,canAfford:t.player.cash>=12e7,description:"旗艦級超急件動態調度系統！改裝超導磁浮提速馬達，天車空中巡航提速 2.5 倍，並在天軌享有超急件綠波路權 (翠綠色科技特效)！",scienceNote:"Super Hot Run (SHR) 為晶圓代工廠為戰略客戶特批之綠波急件協議，所有天軌道岔與機台排程優先強占，極速交件！",benefits:["天車飛行速度大幅激增 2.5 倍","空中天車呈現綠波磁浮特效 (Emerald Glow)","大幅壓制 Q-Time 逾期報廢風險"]}].map(s=>`
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
        ${e.map((s,a)=>{const i=t.player.foundryTier>=s.tier,n=t.player.cash>=s.price,r=s.category==="CMP"&&!t.unlockedFeatures.cmp;return`
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
                    class="btn-buy-equipment flex-1 btn-sci-fi justify-center text-xs py-2 ${!n||r?"opacity-50 cursor-not-allowed":""}"
                    data-model-id="${s.modelId}"
                    ${!n||r?"disabled":""}
                  >
                    ${r?"🔒 CMP 科技未解鎖":n?"🛒 採購並安裝至廠房":"資金不足"}
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
        ${t.machines.map(e=>{const s=this.STORE_CATALOG.find(l=>l.modelId===e.modelId),a=Math.round((s?s.price:2e6)*.15),i=Math.round((s?s.price:2e6)*.4),n=Math.round(e.wear);let r='<span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">閒置 (IDLE)</span>';return e.status==="PROCESSING"?r='<span class="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">加工中</span>':e.status==="MAINTENANCE"?r='<span class="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30">🛠️ 維護中</span>':e.status==="EXPLODED"&&(r='<span class="px-2 py-0.5 rounded text-[10px] bg-red-600 text-white font-bold animate-bounce">💥 腔體炸毀</span>'),`
            <div class="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="store-thumb-box machine-card-thumb w-12 h-12 rounded-lg bg-slate-950 border border-slate-800 flex-shrink-0 flex items-center justify-center p-1 overflow-hidden">
                  <img src="${s?s.assetPath:A.machines.litho_contact.path}" alt="${e.name}" class="w-full h-full object-contain" style="max-width: 44px; max-height: 44px;" />
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-white text-sm">${e.name}</span>
                    ${r}
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
                  <span class="${n>70?"text-red-400 font-bold":n>40?"text-amber-400":"text-emerald-400"}">${n}%</span>
                </div>
                <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div class="h-full ${n>70?"bg-red-500":n>40?"bg-amber-500":"bg-emerald-500"}" style="width: ${n}%;"></div>
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
    `}static bindEvents(t,e,s){var n,r,l;const a=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",i)},i=d=>{d.key==="Escape"&&a()};window.addEventListener("keydown",i),(n=document.getElementById("btn-close-store"))==null||n.addEventListener("click",a),(r=document.getElementById("btn-back-store"))==null||r.addEventListener("click",a),(l=document.getElementById("modal-backdrop-store"))==null||l.addEventListener("click",d=>{d.target===document.getElementById("modal-backdrop-store")&&a()}),t.querySelectorAll(".btn-store-tab").forEach(d=>{d.addEventListener("click",o=>{b.playClick();const c=o.currentTarget.getAttribute("data-cat");if(c==="CMP"&&!e.unlockedFeatures.cmp){alert("CMP（化學機械研磨）機台需晉升至 Tier 3 世代後方可解鎖！");return}this.activeCategory=c,this.render(t,e,s)})}),t.querySelectorAll(".btn-sci-info").forEach(d=>{d.addEventListener("click",o=>{b.playClick();const c=parseInt(o.currentTarget.getAttribute("data-index")||"0",10),p=this.STORE_CATALOG.filter(h=>h.category===this.activeCategory)[c];p&&alert(`👨‍🏫 半導體晶圓教室：【${p.name}】

${p.scienceNote}`)})}),t.querySelectorAll(".btn-open-techtree-from-store").forEach(d=>{d.addEventListener("click",()=>{b.playClick(),t.innerHTML="",ue.show(e,()=>{s()})})}),t.querySelectorAll(".btn-buy-equipment").forEach(d=>{d.addEventListener("click",o=>{const c=o.currentTarget.getAttribute("data-model-id"),p=this.STORE_CATALOG.find(x=>x.modelId===c);if(!p)return;if(e.player.cash<p.price){alert("資金不足，無法完成設備採購！");return}e.player.cash-=p.price,L.recordCapEx(e,p.price),b.playCoinChime();const h=e.machines.length,m=h%4*2,u=Math.floor(h/4)*2,f={id:`MCH-${Date.now().toString(36).toUpperCase().slice(-5)}`,modelId:p.modelId,name:p.name.split(" (")[0],category:p.category,tier:p.tier,gridX:Math.min(7,m),gridY:Math.min(7,u),wear:0,status:"IDLE",assignedEngineerId:null,pairedTrackIds:p.category==="LITHO"?[]:void 0};e.machines.push(f),D.updateMachineNames(e.machines),N.checkAchievements(e),s(),this.activeCategory="FLEET",this.render(t,e,s)})}),t.querySelectorAll(".btn-overhaul").forEach(d=>{d.addEventListener("click",o=>{const c=o.currentTarget.getAttribute("data-machine-id"),p=parseInt(o.currentTarget.getAttribute("data-cost")||"0",10),h=e.machines.find(m=>m.id===c);if(h){if(e.player.cash<p){alert("資金不足，無法支付大修費用！");return}e.player.cash-=p,L.recordMaintenance(e,p),h.wear=0,h.status="IDLE",b.playClick(),s(),this.render(t,e,s)}})}),t.querySelectorAll(".btn-decommission").forEach(d=>{d.addEventListener("click",o=>{const c=o.currentTarget.getAttribute("data-machine-id"),p=parseInt(o.currentTarget.getAttribute("data-refund")||"0",10),h=e.machines.findIndex(u=>u.id===c);if(h===-1||!confirm(`確定要報廢並變賣此機台嗎？將回收變賣金 NT$ ${p.toLocaleString()}`))return;const m=e.machines[h];if(m.assignedEngineerId){const u=e.staff.find(f=>f.id===m.assignedEngineerId);u&&(u.assignedMachineId=null)}e.player.cash+=p,e.machines.splice(h,1),b.playCoinChime(),s(),this.render(t,e,s)})}),t.querySelectorAll(".btn-amhs-info").forEach(d=>{d.addEventListener("click",o=>{b.playClick();const c=o.currentTarget.getAttribute("data-note")||"",p=o.currentTarget.getAttribute("data-title")||"";alert(`🚚 廠務自動化物料搬運 (AMHS) 原理解析：【${p}】

${c}`)})}),t.querySelectorAll(".btn-buy-amhs").forEach(d=>{d.addEventListener("click",o=>{const c=o.currentTarget.getAttribute("data-feature"),p=parseInt(o.currentTarget.getAttribute("data-price")||"0",10),h=o.currentTarget.getAttribute("data-name")||"";if(e.player.cash<p){alert("流動資金不足，無法採購此運送設備！");return}confirm(`確定要投資 NT$ ${p.toLocaleString()} 採購並升級【${h}】嗎？`)&&(e.player.cash-=p,L.recordCapEx(e,p),c==="agv"?e.unlockedFeatures.agv=!0:c==="oht"?e.unlockedFeatures.oht=!0:c==="shrOht"&&(e.unlockedFeatures.shrOht=!0),C.saveToLocalStorage(e),N.checkAchievements(e),b.playFanfare(),s(),this.render(t,e,s))})})}}w(X,"activeCategory","LITHO"),w(X,"STORE_CATALOG",[{modelId:"litho_contact",name:"Contact Aligner (接觸式微影機)",category:"LITHO",tier:1,price:25e5,throughputWpm:10,rayleighLimitNm:3007,description:"半導體萌芽期主力，光罩物理緊貼晶圓表面進行紫外曝光，維修容易。",scienceNote:"利用汞燈紫外混光 (436nm) 貼合曝光。因光罩直接碰觸晶圓表面，容易刮傷光罩與產生落塵，極限線寬約 3µm。",assetPath:A.machines.litho_contact.path},{modelId:"litho_projection",name:"1x Projection Aligner (1:1 投影曝光機)",category:"LITHO",tier:1,price:6e6,throughputWpm:15,rayleighLimitNm:1798,description:"反射鏡等倍投影微影，光罩懸空不接觸晶圓，徹底終結光罩刮傷磨損。",scienceNote:"Perkin-Elmer 經典反射光學系統，以凹面鏡聚焦達成 1:1 無接觸曝光，大幅提升光罩壽命與開局良率。",assetPath:A.machines.litho_projection.path},{modelId:"litho_gline",name:"G-Line Stepper (步進縮小曝光機)",category:"LITHO",tier:2,price:18e6,throughputWpm:25,rayleighLimitNm:997,description:"4:1 縮小投影透鏡，逐區步進曝光（Step-and-Repeat），進入 1µm 時代。",scienceNote:"高壓汞燈 g-line (436nm) 搭配數值孔徑 NA=0.35 之複合縮小透鏡，將光罩圖案縮小 4 倍投射，突破微米大關。",assetPath:A.machines.litho_gline.path},{modelId:"litho_iline",name:"I-Line Stepper (高壓汞燈微影機)",category:"LITHO",tier:3,price:35e6,throughputWpm:55,rayleighLimitNm:584,description:"次微米時代霸主，波長 365nm，支援精密對準與多層金屬互連製程。",scienceNote:"採用更短波長之高強度汞燈 i-line (365nm) 與 NA=0.50 鏡頭，成功壓制繞射效應，可清晰成像至 500nm。",assetPath:A.machines.litho_iline.path},{modelId:"litho_krf",name:"KrF DUV Scanner (準分子雷射微影機)",category:"LITHO",tier:4,price:85e6,throughputWpm:120,rayleighLimitNm:283,description:"深紫外光 (DUV) 準分子雷射，邁入動態連續掃描曝光 (Step-and-Scan)。",scienceNote:"248nm 氟化氪 (KrF) 準分子雷射光源，必須搭配化學增幅光阻 (CAR) 放大光化學反應，支援 0.25µm 製程。",assetPath:A.machines.litho_krf.path},{modelId:"litho_arfdry",name:"ArF Dry Scanner (氟化氬乾式微影機)",category:"LITHO",tier:4,price:18e7,throughputWpm:120,rayleighLimitNm:182,description:"193nm 紫外雷射，將大氣乾式微影發揮至極致，跨越次百奈米門檻。",scienceNote:"利用 193nm 氟化氬雷射與高折射石英透鏡群，是半導體製程縮小至 90nm/65nm 的核心關鍵機台。",assetPath:A.machines.litho_arfdry.path},{modelId:"litho_arfi",name:"ArFi Immersion TWINSCAN (浸潤式微影機)",category:"LITHO",tier:5,price:45e7,throughputWpm:260,rayleighLimitNm:114,description:"鏡頭與晶圓間注入超純水折射光線，雙工件台磁浮掃描，大氣產速最快！",scienceNote:"林本堅博士提出之革命性技術：利用水之折射率 n=1.44 巧妙將等效數值孔徑提升至 NA=1.35，多重曝光下推進至 7nm！",assetPath:A.machines.litho_arfi.path},{modelId:"litho_euv",name:"EUV Scanner (極紫外光微影巨獸)",category:"LITHO",tier:6,price:25e8,throughputWpm:180,rayleighLimitNm:33,description:"13.5nm 極紫外光，全真空反射鏡系統，單次曝光推進 7nm/5nm/3nm！",scienceNote:"以高功率二氧化碳雷射轟擊融熔錫滴激發電漿，產生 13.5nm EUV 光子，全機在超高真空運行，受抽真空限制產能為 180 片/分。",assetPath:A.machines.litho_euv.path},{modelId:"litho_highna",name:"High-NA EUV (高數值孔徑次世代巨獸)",category:"LITHO",tier:6,price:6e9,throughputWpm:180,rayleighLimitNm:20,description:"0.55 NA 變形數值孔徑透鏡，埃米世代霸主，稱霸矽島之終極神兵。",scienceNote:"採用變形鏡頭 (Anamorphic Optics)，X/Y 軸非對稱倍率，單次曝光極限線寬可達 20nm 以下，引領 2nm 埃米時代。",assetPath:A.machines.litho_highna.path},{modelId:"track_manual",name:"手動旋塗熱板台 (Manual Spin & Bake)",category:"TRACK",tier:1,price:8e5,throughputWpm:6,description:"⚠️ 開局先天產能瓶頸！人工滴膠手動離心旋塗與熱板預烤，產能僅 6 片/分。",scienceNote:"利用真空吸盤固定晶圓，手動注射光阻後以 3000 RPM 高速旋轉甩出均勻薄膜，再由人員夾入熱板烘烤。",assetPath:A.machines.track_manual.path},{modelId:"track_single",name:"單軌自動塗膠顯影機 (Single Track)",category:"TRACK",tier:2,price:45e5,throughputWpm:16,description:"初步自動化旋轉塗膠與自動烘烤模組，大幅減少人工操作失誤。",scienceNote:"機械手臂自動傳送晶圓至旋塗杯，自動注膠均勻成膜，並整合冷卻板 (Chill Plate) 精確控制膜厚。",assetPath:A.machines.track_single.path},{modelId:"track_dual",name:"雙軌連線 Track (Dual Track)",category:"TRACK",tier:3,price:12e6,throughputWpm:35,description:"雙獨立機械臂分開處理塗膠與顯影，有效提升次微米連線吞吐量。",scienceNote:"將塗膠旋塗單元 (Coater) 與顯影槽 (Developer) 實體隔離，避免顯影鹼液氣體污染光阻，保障微影良率。",assetPath:A.machines.track_dual.path},{modelId:"track_clean",name:"多工位精密 Clean Track",category:"TRACK",tier:4,price:3e7,throughputWpm:75,description:"多旋塗室並聯，高速熱板陣列，建議為先進微影機配備 2 台以上！",scienceNote:"配置多組 Coater/Developer 模組與快速溫控熱板，支援化學增幅光阻嚴苛的曝光後烘烤 (PEB) 溫度控制。",assetPath:A.machines.track_clean.path},{modelId:"track_advanced",name:"先進極限分子級 Track",category:"TRACK",tier:6,price:25e7,throughputWpm:160,description:"分子級膜厚控制，完美適配 EUV 超薄金屬氧化物光阻 (MOR)。",scienceNote:"具備超微量旋塗技術與化學氣相沉積底膜 (Underlayer)，將光阻粗糙度 (LWR) 降至分子級極限。",assetPath:A.machines.track_advanced.path},{modelId:"film_furnace",name:"高溫熱氧化爐管 (Horizontal Furnace)",category:"FILM",tier:1,price:18e5,throughputWpm:12,description:"利用 1000°C 高溫水汽使矽表面長出堅硬均勻的二氧化矽 (SiO2) 絕緣保護層。",scienceNote:"利用高純度氧氣或水蒸氣在高溫下與矽晶圓反應：Si + O2 -> SiO2，生長厚度均勻的高品質絕緣氧化層。",assetPath:A.machines.film_furnace.path},{modelId:"film_pecvd",name:"電漿增強化學氣相沉積機 (PECVD / ALD)",category:"FILM",tier:4,price:25e6,throughputWpm:110,description:"利用電漿在低溫下快速沉積氮化矽、金屬介電質，並支援原子層沉積 (ALD)。",scienceNote:"以射頻電漿解離前驅氣體，可在較低溫度 (300°C) 下沉積薄膜，避免破壞底層已摻雜之電晶體結構。",assetPath:A.machines.film_pecvd.path},{modelId:"etch_wet",name:"濕式酸槽清洗台 (Wet Chemical Bench)",category:"ETCH",tier:1,price:15e5,throughputWpm:12,description:"利用氫氟酸 (HF) 與化學酸液浸泡溶解未受光阻保護之薄膜，等向性腐蝕。",scienceNote:"化學濕法腐蝕屬於等向性蝕刻 (Isotropic)，容易產生側向掏空 (Undercut)，適合 3µm 以上粗線寬。",assetPath:A.machines.etch_wet.path},{modelId:"etch_plasma",name:"電漿乾式蝕刻機 (RIE / ICP-RIE)",category:"ETCH",tier:3,price:28e6,throughputWpm:50,description:"以高能反應離子轟擊進行垂直非等向性蝕刻，線條邊緣垂直銳利！",scienceNote:"反應性離子蝕刻 (RIE) 結合物理離子轟擊與化學自由基反應，具備極高垂直各向異性 (Anisotropic)，是次微米微影的關鍵搭檔。",assetPath:A.machines.etch_plasma.path},{modelId:"diff_furnace",name:"熱擴散摻雜爐管 (Thermal Diffusion)",category:"DIFF",tier:1,price:2e6,throughputWpm:10,description:"將磷或硼蒸氣高溫擴散滲透進矽晶格中，形成 N 型與 P 型半導體通道。",scienceNote:"利用高溫晶格熱運動使雜質原子由高濃度向低濃度擴散，控溫容易但橫向擴散量大。",assetPath:A.machines.diff_furnace.path},{modelId:"diff_implanter",name:"大束流離子佈植機 (Ion Implanter)",category:"DIFF",tier:2,price:15e6,throughputWpm:20,description:"將雜質原子電離成高能離子束，如子彈般精確轟擊打入矽晶圓特定深度。",scienceNote:"高壓電場加速磷/砷/硼離子束，可獨立精確控制植入劑量與深度，無橫向擴散失真，是現代電晶體的核心技術。",assetPath:A.machines.diff_implanter.path},{modelId:"cmp_polisher",name:"化學機械平坦化研磨機 (CMP Polisher)",category:"CMP",tier:3,price:2e7,throughputWpm:40,description:"化學研磨液搭配高速研磨墊，將晶圓表面磨至分子級平坦，解鎖多層金屬佈線！",scienceNote:"利用研磨液 (Slurry) 的化學腐蝕軟化與奈米磨料的機械研磨，實現全晶圓奈米級全域平坦化 (Global Planarization)。",assetPath:A.machines.cmp_polisher.path}]);class te{static show(t,e){const s=document.getElementById("modal-container");s&&(this.candidates.length===0&&this.generateCandidates(t.player.foundryTier),this.render(s,t,e))}static generateCandidates(t){const e=["PIE","LITHO","TRACK","FILM","ETCH","DIFF","CMP"];this.candidates=[];for(let s=0;s<4;s++){const a=this.FIRST_NAMES[Math.floor(Math.random()*this.FIRST_NAMES.length)],i=this.LAST_NAMES[Math.floor(Math.random()*this.LAST_NAMES.length)],n=e[Math.floor(Math.random()*e.length)];let r="Young Specialist",l=2e4,d=45e3,o=n==="PIE"?"跨站點製程整合專才，指派訂單可加速工步 +8%，保障交貨良率 +3%":"專精基礎機台操作，磨損累積 -10%，微影 k1 -0.01。適合操作 Tier 1~2。";const c=Math.random();t>=5&&c>.6?(r="Fellow",l=5e5,d=35e4,o=n==="PIE"?"世界級晶圓製程整合權威泰斗，指派訂單可加速工步 +40%，保障交貨良率 +16%！":"頂級半導體物理泰斗，磨損累積 -80%，微影 k1 -0.06，良率 +15%，可抵銷先進製程視窗損失！"):t>=3&&c>.4?(r="Senior Engineer",l=12e4,d=15e4,o=n==="PIE"?"多年製程整合資深主管，指派訂單可加速工步 +25%，保障交貨良率 +10%":"多年產線調機權威，磨損累積 -50%，微影 k1 -0.04，良率 +10%。適合操作 Tier 3~5。"):t>=2&&c>.3&&(r="Skilled Worker",l=5e4,d=75e3,o=n==="PIE"?"專任製程整合工程師，指派訂單可加速工步 +15%，保障交貨良率 +6%":"熟練製程技師，磨損累積 -25%，微影 k1 -0.02，良率 +5%。適合操作 Tier 1~3。"),this.candidates.push({id:`CAN-${Date.now().toString(36).slice(-4)}-${s}`,name:`${a} ${i}`,rank:r,moduleSpecialty:n,signingBonus:l,salary:d,description:o})}}static render(t,e,s){var n;const a=e.staff.reduce((r,l)=>r+l.salary,0),i=((n=e.staff[0])==null?void 0:n.shiftMode)||"THREE_SHIFT";t.innerHTML=`
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
                class="px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${i==="THREE_SHIFT"?"bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30":"bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"}"
                title="點擊切換兩班制/三班制"
              >
                <span>${i==="THREE_SHIFT"?"🛡️ 三班制 (24H 在線 TPM 零故障)":"⚡ 兩班制 (節省 33% 薪水，疲勞累積快)"}</span>
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
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono">${e.staff.length}</span>
            </button>
            <button
              id="tab-schedule"
              class="px-4 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${this.activeTab==="SCHEDULE"?"border-purple-400 text-purple-300":"border-transparent text-slate-400 hover:text-slate-200"}"
            >
              <span>📅 廠務排班表</span>
              <span class="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] font-mono text-cyan-400">${e.staff.length}人排班</span>
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
            ${this.activeTab==="STAFF"?this.renderStaffTab(e):this.activeTab==="SCHEDULE"?this.renderScheduleTab(e):this.renderMarketTab(e)}
          </div>

          <!-- Footer with Return Button -->
          <div class="modal-footer p-3 border-t border-slate-700/80 bg-slate-900/90 flex items-center justify-end px-6">
            <button id="btn-back-hr" class="btn-sci-fi px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 border-slate-600 text-white shadow-md">
              ◀ 返回無塵室 (Back to Cleanroom)
            </button>
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s)}static renderScheduleTab(t){if(t.staff.length===0)return`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">📅</div>
          <p class="text-sm">廠內目前尚未招募任何員工，無法進行排班！請先前往「人才招募市場」進行招聘。</p>
        </div>
      `;const e=t.staff.filter(r=>(r.workShift||"DAY")==="DAY").length,s=t.staff.filter(r=>r.workShift==="SWING").length,a=t.staff.filter(r=>r.workShift==="NIGHT").length,i=t.staff.filter(r=>r.workShift==="OFF").length,n=e>0&&s>0&&a>0;return`
      <div class="space-y-4">
        <!-- 輪班健康度與 24H 覆蓋看板 -->
        <div class="p-4 rounded-xl bg-slate-900/90 border ${n?"border-emerald-500/50 bg-emerald-950/20":"border-amber-500/40 bg-amber-950/10"} flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-base">${n?"🛡️":"⚠️"}</span>
              <span class="text-sm font-bold ${n?"text-emerald-300":"text-amber-300"}">
                ${n?"全廠 24H 輪班完整覆蓋 (達成 TPM 零故障保護條件)":"全廠 24H 輪班存在時段空窗"}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">
              ${n?"早班、中班與大夜班均有人員駐守，只要機台專長職等符合且疲勞 < 50%，即可維持 0% 故障率！":"注意：若某個班別缺少工程師值班，在該時段機台將無法享受在線預防保養，磨損率將正常累積！"}
            </p>
          </div>

          <!-- 各班人數統計膠囊 -->
          <div class="flex items-center gap-2 text-xs font-mono">
            <span class="px-2.5 py-1 rounded-lg bg-sky-950 text-sky-300 border border-sky-500/30">
              ☀️ 早班: ${e}
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-500/30">
              🌆 中班: ${s}
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-500/30">
              🌙 夜班: ${a}
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700">
              🏖️ 排休: ${i}
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
          ${t.staff.map(r=>{const l=r.workShift||"DAY",d=t.machines.find(o=>o.id===r.assignedMachineId);return`
              <div class="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl flex-shrink-0">
                    🧑‍🔬
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-white text-sm">${r.name}</span>
                      <span class="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        ${r.rank}
                      </span>
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono ${r.moduleSpecialty==="PIE"?"bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold":"bg-cyan-500/20 text-cyan-300"}">
                        ${r.moduleSpecialty==="PIE"?"👨‍💼 製程整合 PIE":r.moduleSpecialty}
                      </span>
                    </div>
                    <div class="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
                      <span>進駐: <strong class="text-slate-200">${d?d.name:"待命未指派"}</strong></span>
                      <span>|</span>
                      <span>疲勞: <strong class="${r.fatigue>=50?"text-red-400 font-bold":r.fatigue>=30?"text-amber-400":"text-emerald-400"}">${Math.round(r.fatigue)}%</strong></span>
                    </div>
                  </div>
                </div>

                <!-- 手動班別切換按鈕組 -->
                <div class="flex items-center gap-1.5 w-full md:w-auto justify-end">
                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${l==="DAY"?"bg-sky-600 text-white shadow-md shadow-sky-500/30 border border-sky-400":"bg-slate-950 text-slate-400 hover:text-white border border-slate-800"}"
                    data-staff-id="${r.id}"
                    data-shift="DAY"
                    title="早班: 07:00 ~ 15:00 (常規疲勞速率)"
                  >
                    ☀️ 早班 (07-15)
                  </button>
                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${l==="SWING"?"bg-amber-600 text-white shadow-md shadow-amber-500/30 border border-amber-400":"bg-slate-950 text-slate-400 hover:text-white border border-slate-800"}"
                    data-staff-id="${r.id}"
                    data-shift="SWING"
                    title="中班: 15:00 ~ 23:00 (常規疲勞速率)"
                  >
                    🌆 中班 (15-23)
                  </button>
                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${l==="NIGHT"?"bg-indigo-600 text-white shadow-md shadow-indigo-500/30 border border-indigo-400":"bg-slate-950 text-slate-400 hover:text-white border border-slate-800"}"
                    data-staff-id="${r.id}"
                    data-shift="NIGHT"
                    title="夜班: 23:00 ~ 07:00 (夜班疲勞稍快，需定期輪替)"
                  >
                    🌙 夜班 (23-07)
                  </button>
                  <button
                    class="btn-shift-select px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${l==="OFF"?"bg-emerald-600 text-white shadow-md shadow-emerald-500/30 border border-emerald-400":"bg-slate-950 text-slate-400 hover:text-white border border-slate-800"}"
                    data-staff-id="${r.id}"
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
    `}static renderStaffTab(t){return t.staff.length===0?`
        <div class="text-center py-12 text-slate-400">
          <div class="text-4xl mb-2">👥</div>
          <p class="text-sm">廠內目前尚未招募任何工程師，請前往「人才招募市場」進行招聘！</p>
        </div>
      `:`
      <div class="space-y-3">
        ${t.staff.map(e=>{const s=t.machines.find(n=>n.id===e.assignedMachineId);let a=!1,i=!1;return s&&(a=j.checkTPMConditions(s,e).isTPMActive,i=j.checkExplosionRisk(s,e).hasRisk),`
            <div class="p-4 rounded-xl bg-slate-900/80 border ${i?"border-red-600/60 bg-red-950/10":a?"border-amber-500/50 bg-amber-950/10":"border-slate-800"} flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              
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
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono ${e.moduleSpecialty==="PIE"?"bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold":"bg-cyan-500/20 text-cyan-300"}">
                      ${e.moduleSpecialty==="PIE"?"👨‍💼 製程整合 PIE":"專長: "+e.moduleSpecialty}
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
                  ${t.machines.map(n=>`
                    <option value="${n.id}" ${e.assignedMachineId===n.id?"selected":""}>
                      ${n.name} (${n.category} Tier ${n.tier})
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
                ${i?`
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

                <span class="px-2 py-0.5 rounded text-[10px] font-mono ${e.moduleSpecialty==="PIE"?"bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 font-bold":"bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"}">
                  ${e.moduleSpecialty==="PIE"?"👨‍💼 製程整合 PIE":"模組: "+e.moduleSpecialty}
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
    `}static bindEvents(t,e,s){var n,r,l,d,o,c,p,h,m,u,f;const a=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",i)},i=x=>{x.key==="Escape"&&a()};window.addEventListener("keydown",i),(n=document.getElementById("btn-close-hr"))==null||n.addEventListener("click",a),(r=document.getElementById("btn-back-hr"))==null||r.addEventListener("click",a),(l=document.getElementById("modal-backdrop-hr"))==null||l.addEventListener("click",x=>{x.target===document.getElementById("modal-backdrop-hr")&&a()}),(d=document.getElementById("tab-staff"))==null||d.addEventListener("click",()=>{b.playClick(),this.activeTab="STAFF",this.render(t,e,s)}),(o=document.getElementById("tab-schedule"))==null||o.addEventListener("click",()=>{b.playClick(),this.activeTab="SCHEDULE",this.render(t,e,s)}),(c=document.getElementById("tab-market"))==null||c.addEventListener("click",()=>{b.playClick(),this.activeTab="MARKET",this.render(t,e,s)}),(p=document.getElementById("btn-preset-balanced"))==null||p.addEventListener("click",()=>{b.playClick();const x=["DAY","SWING","NIGHT"];e.staff.forEach((g,y)=>{g.workShift=x[y%3]}),s(),this.render(t,e,s)}),(h=document.getElementById("btn-preset-day-only"))==null||h.addEventListener("click",()=>{b.playClick(),e.staff.forEach(x=>{x.workShift="DAY"}),s(),this.render(t,e,s)}),(m=document.getElementById("btn-preset-tpm-opt"))==null||m.addEventListener("click",()=>{b.playClick();const x=["DAY","SWING","NIGHT"];let g=0;e.staff.forEach(y=>{y.fatigue>=70?y.workShift="OFF":(y.workShift=x[g%3],g++)}),s(),this.render(t,e,s)}),t.querySelectorAll(".btn-shift-select").forEach(x=>{x.addEventListener("click",g=>{const y=g.currentTarget,T=y.getAttribute("data-staff-id"),v=y.getAttribute("data-shift"),E=e.staff.find(k=>k.id===T);!E||!v||(E.workShift=v,b.playClick(),s(),this.render(t,e,s))})}),(u=document.getElementById("btn-refresh-candidates"))==null||u.addEventListener("click",()=>{b.playClick(),this.generateCandidates(e.player.foundryTier),this.render(t,e,s)}),(f=document.getElementById("btn-toggle-shift"))==null||f.addEventListener("click",()=>{var y;b.playClick();const g=(((y=e.staff[0])==null?void 0:y.shiftMode)||"THREE_SHIFT")==="THREE_SHIFT"?"TWO_SHIFT":"THREE_SHIFT";e.staff.forEach(T=>{T.shiftMode=g,g==="TWO_SHIFT"?T.salary=Math.round(T.salary*.67):T.salary=Math.round(T.salary/.67)}),s(),this.render(t,e,s)}),t.querySelectorAll(".btn-hire-candidate").forEach(x=>{x.addEventListener("click",g=>{var k;const y=parseInt(g.currentTarget.getAttribute("data-index")||"0",10),T=this.candidates[y];if(!T)return;if(e.player.cash<T.signingBonus){alert("資金不足，無法支付簽約獎金！");return}e.player.cash-=T.signingBonus,L.recordSigningBonus(e,T.signingBonus),b.playCoinChime();const v=((k=e.staff[0])==null?void 0:k.shiftMode)||"THREE_SHIFT",E={id:`STF-${Date.now().toString(36).toUpperCase().slice(-5)}`,name:T.name,rank:T.rank,moduleSpecialty:T.moduleSpecialty,fatigue:20,shiftMode:v,workShift:"DAY",assignedMachineId:null,salary:T.salary};e.staff.push(E),this.candidates.splice(y,1),N.checkAchievements(e),s(),this.activeTab="STAFF",this.render(t,e,s)})}),t.querySelectorAll(".select-machine").forEach(x=>{x.addEventListener("change",g=>{const y=g.currentTarget.getAttribute("data-staff-id"),T=g.currentTarget.value||null,v=e.staff.find(E=>E.id===y);if(v){if(T){const E=e.staff.find(k=>k.assignedMachineId===T&&k.id!==y);E&&(E.assignedMachineId=null)}v.assignedMachineId=T,e.machines.forEach(E=>{E.id===T?E.assignedEngineerId=v.id:E.assignedEngineerId===v.id&&(E.assignedEngineerId=null)}),b.playClick(),N.checkAchievements(e),s(),this.render(t,e,s)}})}),t.querySelectorAll(".btn-fire-staff").forEach(x=>{x.addEventListener("click",g=>{const y=g.currentTarget.getAttribute("data-staff-id"),T=e.staff.findIndex(E=>E.id===y);if(T===-1)return;const v=e.staff[T];if(confirm(`確定要資遣工程師【${v.name}】嗎？`)){if(v.assignedMachineId){const E=e.machines.find(k=>k.id===v.assignedMachineId);E&&(E.assignedEngineerId=null)}e.staff.splice(T,1),b.playClick(),s(),this.render(t,e,s)}})})}}w(te,"activeTab","STAFF"),w(te,"candidates",[]),w(te,"FIRST_NAMES",["Alex","David","Sarah","Kevin","Emily","Michael","Jessica","James","Daniel","Rachel","Robert","Brian","Olivia","William","Sophia","Thomas","Emma","Chris","Grace","Eric","Lucas","Chloe","Nathan","Hannah"]),w(te,"LAST_NAMES",["Miller","Chen","Smith","Williams","Johnson","Taylor","Davis","Wilson","Anderson","White","Harris","Martin","Clark","Lewis","Walker","Hall","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill"]);class le{static getSpeedMultiplier(){return this.speedMultiplier}static init(t,e,s){const a=new URLSearchParams(window.location.search);(a.get("dev")==="true"||a.get("admin")==="foundry")&&this.toggle(t,e,s),window.addEventListener("keydown",n=>{n.ctrlKey&&n.shiftKey&&n.code==="KeyD"&&(n.preventDefault(),this.toggle(t,e,s))})}static toggle(t,e,s){this.isVisible=!this.isVisible;const a=document.getElementById("dev-console");if(a){if(!this.isVisible){a.innerHTML="";return}b.playClick(),this.render(a,t,e,s)}}static render(t,e,s,a){var i,n,r,l;t.innerHTML=`
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
            ${[1,2,4,8].map(d=>`
              <button
                class="btn-speed btn-sci-fi text-xs py-1 justify-center ${this.speedMultiplier===d?"bg-red-600 border-red-400 text-white font-bold":""}"
                data-speed="${d}"
              >
                ${d}x
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
    `,(i=document.getElementById("btn-dev-close"))==null||i.addEventListener("click",()=>{this.isVisible=!1,t.innerHTML=""}),document.querySelectorAll(".btn-speed").forEach(d=>{d.addEventListener("click",o=>{b.playClick();const c=Number(o.currentTarget.getAttribute("data-speed"));this.speedMultiplier=c,s(c),this.render(t,e,s,a)})}),(n=document.getElementById("btn-add-cash"))==null||n.addEventListener("click",()=>{e.player.cash+=5e7,b.playCoin(),a()}),(r=document.getElementById("btn-trigger-wear"))==null||r.addEventListener("click",()=>{for(const d of e.machines)d.wear=Math.min(100,d.wear+50),d.wear>=80&&(d.status="MAINTENANCE");b.playWarning(),a()}),(l=document.getElementById("btn-reset-save"))==null||l.addEventListener("click",()=>{confirm("確定要清空本地存檔並重置遊戲嗎？")&&(localStorage.clear(),window.location.reload())})}}w(le,"isVisible",!1),w(le,"speedMultiplier",1);const J=class J{static show(t,e,s){const a=document.getElementById("modal-container");a&&(s!==void 0&&(this.currentStep=s),this.render(a,t,e))}static isCompleted(t){var e;return((e=t==null?void 0:t.player)==null?void 0:e.tutorialCompleted)!==void 0?t.player.tutorialCompleted:t!=null&&t.userId?localStorage.getItem(`silicon_tycoon_tutorial_completed_${t.userId}`)==="true":!1}static markCompleted(t){t!=null&&t.player&&(t.player.tutorialCompleted=!0),t!=null&&t.userId&&localStorage.setItem(`silicon_tycoon_tutorial_completed_${t.userId}`,"true"),localStorage.setItem("silicon_tycoon_tutorial_completed","true")}static render(t,e,s){const a=this.currentStep,i=[{stepNum:1,badge:"🚀 歡迎創辦人",title:"歡迎來到《Silicon Tycoon: 矽島霸權》",icon:"🏭",content:`
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
        `,btnPrimaryText:"🎉 完成新手引導，稱霸矽島！",btnPrimaryAction:"finish"}],n=i[a]||i[0];t.innerHTML=`
      <div class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-xl text-slate-100 flex flex-col relative animate-fade-in">
          
          <!-- Close button -->
          <button id="btn-close-tutorial" class="absolute top-4 right-4 text-slate-400 hover:text-white font-mono text-lg" title="跳過教學">
            ✕
          </button>

          <!-- Step Badge & Header -->
          <div class="flex items-center gap-3 pb-3 border-b border-slate-700/70">
            <div class="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-2xl shadow-inner">
              ${n.icon}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  ${n.badge}
                </span>
                <span class="text-xs text-slate-400 font-mono">
                  步驟 ${n.stepNum} / ${this.totalSteps}
                </span>
              </div>
              <h3 class="text-base font-bold text-white tracking-wide mt-0.5">
                ${n.title}
              </h3>
            </div>
          </div>

          <!-- Step Progress Dots -->
          <div class="flex items-center justify-center gap-2 py-3">
            ${i.map((r,l)=>`
              <div class="h-1.5 rounded-full transition-all duration-300 ${l===a?"w-8 bg-cyan-400":l<a?"w-3 bg-emerald-400":"w-3 bg-slate-700"}"></div>
            `).join("")}
          </div>

          <!-- Step Content Body -->
          <div class="modal-body text-xs text-slate-300 space-y-3 pb-4 max-h-[60vh] overflow-y-auto pr-1">
            ${n.content}
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
                ${n.btnPrimaryText}
              </button>
            </div>
          </div>

        </div>
      </div>
    `,this.bindEvents(t,e,s,n.btnPrimaryAction)}static bindEvents(t,e,s,a){var r,l,d,o,c;const i=()=>{b.playClick(),t.innerHTML="",J.markCompleted(e),s()};(r=document.getElementById("btn-close-tutorial"))==null||r.addEventListener("click",i),(l=document.getElementById("btn-skip-tutorial-all"))==null||l.addEventListener("click",i);const n=t.querySelector(".modal-backdrop");n==null||n.addEventListener("click",p=>{p.target===n&&i()}),(d=document.getElementById("btn-tutorial-prev"))==null||d.addEventListener("click",()=>{b.playClick(),this.currentStep=Math.max(0,this.currentStep-1),this.render(t,e,s)}),(o=document.getElementById("btn-tutorial-skip-production"))==null||o.addEventListener("click",()=>{if(b.playFanfare(),e.activeLots.length>0)for(const p of e.activeLots)p.currentStation="DIFF",p.status="COMPLETED",p.yieldMultiplier=.96;else{const p=e.activeOrders.length>0?e.activeOrders[0].id:"starter_demo";e.activeLots.push({lotId:`LOT-${Date.now().toString().slice(-4)}`,orderId:p,waferCount:25,currentStation:"DIFF",currentLayer:3,totalLayers:3,qTimeDeadline:null,yieldMultiplier:.95,status:"COMPLETED"})}s(),this.currentStep=3,this.render(t,e,s)}),(c=document.getElementById("btn-tutorial-action"))==null||c.addEventListener("click",()=>{b.playClick(),a==="next"?(this.currentStep=Math.min(this.totalSteps-1,this.currentStep+1),this.render(t,e,s)):a==="open_contract"?(t.innerHTML="",oe.show(e,()=>s())):a==="open_wafer_map"?(t.innerHTML="",Z.show(e,null,()=>s())):a==="finish"&&(J.markCompleted(e),b.playFanfare(),t.innerHTML="",s())})}};w(J,"currentStep",0),w(J,"totalSteps",5);let Q=J;class he{static show(t,e){const s=document.getElementById("modal-container");s&&(L.ensureFinancialState(t),this.render(s,t,e))}static render(t,e,s){const a=L.ensureFinancialState(e);let i=a.today,n=a.dailyHistory,r="日收支分析",d=`現實同步: 📅 ${a.currentDateStr||L.getTodayDateString()} (今日進行中)`;this.activeTab==="WEEK"?(i=a.thisWeek,n=a.weeklyHistory,r="周收支分析",d=`現實同步: 📅 本周累計 (${L.getWeekString()})`):this.activeTab==="MONTH"&&(i=a.thisMonth,n=a.monthlyHistory,r="月收支分析",d=`現實同步: 📅 本月累計 (${L.getMonthString()})`);const o=L.generateCFOAdvisory(i,e),c=L.calculateCompanyNetWorth(e);t.innerHTML=`
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
                    半導體財務報表中心 — ${r}
                  </h2>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    P&L / Cash Flow
                  </span>
                </div>
                <div class="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                  <span>廠曆進度: <strong class="text-amber-300">${d}</strong></span>
                  <span>|</span>
                  <span>公司總淨值: <strong class="text-emerald-400">NT$ ${Math.round(c).toLocaleString()}</strong></span>
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
                  <span>歷史${r}獲利趨勢走勢圖 (近 ${n.length+1} 期)</span>
                </span>
                <div class="flex items-center gap-3 text-[10px] font-mono">
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span> 營業收入</span>
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-amber-500"></span> 營業支出</span>
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> 淨獲利</span>
                </div>
              </div>

              <!-- 長條圖視覺容器 -->
              <div class="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-end justify-between gap-2 h-44 overflow-x-auto pt-4">
                ${this.renderHistoryBars([i,...n].slice(0,10).reverse())}
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
    `,this.bindEvents(t,e,s)}static renderHistoryBars(t){if(t.length===0)return'<div class="text-center w-full py-10 text-slate-500 text-xs font-mono">暫無足夠歷史數據，產線持續運轉中...</div>';const e=Math.max(...t.map(s=>Math.max(s.revenue.totalRevenue,s.expenses.totalExpenses,Math.abs(s.netProfit))),1e5);return t.map((s,a)=>{const i=a===t.length-1,n=Math.min(100,Math.max(4,Math.round(s.revenue.totalRevenue/e*100))),r=Math.min(100,Math.max(4,Math.round(s.expenses.totalExpenses/e*100))),l=Math.min(100,Math.max(4,Math.round(Math.abs(s.netProfit)/e*100)));return`
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
              style="height: ${n}%;"
              title="營業收入"
            ></div>
            <!-- 支出柱 -->
            <div
              class="w-2.5 rounded-t bg-amber-500 group-hover:bg-amber-400 transition-all shadow-sm"
              style="height: ${r}%;"
              title="營業支出"
            ></div>
            <!-- 淨利柱 -->
            <div
              class="w-2.5 rounded-t ${s.netProfit>=0?"bg-emerald-500 group-hover:bg-emerald-400":"bg-red-500 group-hover:bg-red-400"} transition-all shadow-sm"
              style="height: ${l}%;"
              title="營業淨利"
            ></div>
          </div>

          <!-- Label -->
          <div class="text-[9px] font-mono mt-1 truncate max-w-full ${i?"text-cyan-400 font-bold":"text-slate-400"}">
            ${s.periodType==="DAY"?`D${s.periodIndex}`:s.periodType==="WEEK"?`W${s.periodIndex}`:`M${s.periodIndex}`}
            ${i?"*":""}
          </div>
        </div>
      `}).join("")}static bindEvents(t,e,s){var n,r,l,d,o,c;const a=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",i)},i=p=>{p.key==="Escape"&&a()};window.addEventListener("keydown",i),(n=document.getElementById("btn-close-finance"))==null||n.addEventListener("click",a),(r=document.getElementById("btn-back-finance"))==null||r.addEventListener("click",a),(l=document.getElementById("modal-backdrop-finance"))==null||l.addEventListener("click",p=>{p.target===document.getElementById("modal-backdrop-finance")&&a()}),(d=document.getElementById("tab-finance-day"))==null||d.addEventListener("click",()=>{b.playClick(),this.activeTab="DAY",this.render(t,e,s)}),(o=document.getElementById("tab-finance-week"))==null||o.addEventListener("click",()=>{b.playClick(),this.activeTab="WEEK",this.render(t,e,s)}),(c=document.getElementById("tab-finance-month"))==null||c.addEventListener("click",()=>{b.playClick(),this.activeTab="MONTH",this.render(t,e,s)})}}w(he,"activeTab","DAY");class ae{static show(t,e,s=!0){const a=document.getElementById("modal-container");if(!a)return;const i=C.getActiveUserProfile();this.selectedUserId=i.id,this.isEditingName=!1,this.isCreatingUser=!1,this.render(a,t,e,s)}static render(t,e,s,a){const i=C.getUserProfiles();!this.selectedUserId&&i.length>0&&(this.selectedUserId=i[0].id);const n=i.find(r=>r.id===this.selectedUserId)||i[0];t.innerHTML=`
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
              ${i.map(r=>{const l=r.id===this.selectedUserId,d=new Date(r.lastPlayedAt).toLocaleDateString()+" "+new Date(r.lastPlayedAt).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});return`
                  <div
                    class="user-profile-item p-3 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-3 ${l?"bg-amber-950/40 border-amber-400 shadow-md shadow-amber-500/20 text-white":"bg-slate-950/60 border-slate-800/80 hover:border-amber-500/40 text-slate-300"}"
                    data-user-id="${r.id}"
                  >
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-8 h-8 rounded-full border ${l?"border-amber-400 bg-amber-500/20 text-amber-300":"border-slate-700 bg-slate-900 text-slate-400"} flex items-center justify-center font-bold text-sm flex-shrink-0">
                        ${l?"★":"👤"}
                      </div>
                      <div class="min-w-0">
                        <div class="font-bold text-sm truncate ${l?"text-amber-300":"text-slate-200"}">
                          ${r.name}
                        </div>
                        <div class="text-[11px] text-slate-400 font-mono truncate">
                          ${r.companyName}
                        </div>
                      </div>
                    </div>

                    <div class="text-right flex-shrink-0 font-mono text-xs">
                      <div class="text-cyan-400 font-bold">Tier ${r.foundryTier}</div>
                      <div class="text-amber-300/90 text-[10px]">NT$ ${Math.round(r.cash).toLocaleString()}</div>
                      <div class="text-slate-500 text-[9px]">${d}</div>
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
                value="${n?n.name:""}"
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
              目前選取: <strong class="text-amber-300">${n?n.name:"未選擇"}</strong>
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
    `,this.bindEvents(t,e,s,a)}static bindEvents(t,e,s,a){var r,l,d,o,c,p,h,m,u,f,x,g;const i=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",n)},n=y=>{y.key==="Escape"&&a&&i()};window.addEventListener("keydown",n),a&&((r=document.getElementById("btn-close-login"))==null||r.addEventListener("click",i),(l=document.getElementById("btn-cancel-login"))==null||l.addEventListener("click",i),(d=document.getElementById("modal-backdrop-login"))==null||d.addEventListener("click",y=>{y.target===document.getElementById("modal-backdrop-login")&&i()})),t.querySelectorAll(".user-profile-item").forEach(y=>{y.addEventListener("click",T=>{const v=T.currentTarget.getAttribute("data-user-id");v&&(b.playClick(),this.selectedUserId=v,this.isEditingName=!1,this.isCreatingUser=!1,this.render(t,e,s,a))})}),(o=document.getElementById("btn-create-user-toggle"))==null||o.addEventListener("click",()=>{b.playClick(),this.isCreatingUser=!this.isCreatingUser,this.isEditingName=!1,this.render(t,e,s,a)}),(c=document.getElementById("btn-cancel-create"))==null||c.addEventListener("click",()=>{b.playClick(),this.isCreatingUser=!1,this.render(t,e,s,a)}),(p=document.getElementById("btn-confirm-create"))==null||p.addEventListener("click",()=>{const y=document.getElementById("input-new-username"),T=document.getElementById("input-new-company"),v=(y==null?void 0:y.value.trim())||"",E=(T==null?void 0:T.value.trim())||void 0;if(!v){alert("請輸入執行長姓名！");return}b.playCoinChime();const k=C.createUser(v,E);this.selectedUserId=k.id,this.isCreatingUser=!1,this.render(t,e,s,a)}),(h=document.getElementById("btn-rename-user-toggle"))==null||h.addEventListener("click",()=>{this.selectedUserId&&(b.playClick(),this.isEditingName=!this.isEditingName,this.isCreatingUser=!1,this.render(t,e,s,a))}),(m=document.getElementById("btn-cancel-rename"))==null||m.addEventListener("click",()=>{b.playClick(),this.isEditingName=!1,this.render(t,e,s,a)}),(u=document.getElementById("btn-confirm-rename"))==null||u.addEventListener("click",()=>{if(!this.selectedUserId)return;const y=document.getElementById("input-rename-username"),T=y==null?void 0:y.value.trim();if(!T){alert("名稱不能為空！");return}b.playClick(),C.renameUser(this.selectedUserId,T),this.isEditingName=!1,this.render(t,e,s,a)}),(f=document.getElementById("btn-delete-user"))==null||f.addEventListener("click",()=>{if(!this.selectedUserId)return;const y=C.getUserProfiles(),T=y.find(E=>E.id===this.selectedUserId);if(!T)return;if(y.length<=1){alert("這是唯一的玩家存檔，無法刪除！");return}if(!confirm(`確定要徹底刪除玩家【${T.name}】（${T.companyName}）的存檔嗎？此動作不可逆！`))return;b.playClick();const v=C.deleteUser(this.selectedUserId);if(!v.success){alert(v.message||"刪除失敗");return}this.selectedUserId=C.getActiveUserProfile().id,this.render(t,e,s,a)}),(x=document.getElementById("btn-factory-reset-login"))==null||x.addEventListener("click",()=>{b.playClick(),confirm(`⚠️ 警告：整機資料重置將徹底清除本裝置上的所有玩家帳號、廠房進度、財務紀錄與暫存設定，無法復原！

確定要刪除裝置全部資料使玩家能從零開始重新體驗嗎？`)&&(C.factoryResetAllData(),alert("整機資料已全數清除！即將重新啟動遊戲。"),window.location.reload())}),(g=document.getElementById("btn-confirm-play"))==null||g.addEventListener("click",()=>{if(!this.selectedUserId)return;b.playCoinChime();const y=C.switchActiveUser(this.selectedUserId);if(!y){alert("載入該存檔失敗，將進入預設存檔！");return}i(),s(y)})}}w(ae,"selectedUserId",null),w(ae,"isEditingName",!1),w(ae,"isCreatingUser",!1);class ve{constructor(t,e,s,a,i){w(this,"topHUD");w(this,"state");w(this,"onStateUpdated");w(this,"onUserSwitched");w(this,"onTogglePlanner");w(this,"isPlannerActive",!1);w(this,"currentPlannerTool","MOVE_MACHINE");this.state=t,this.onStateUpdated=s,this.onUserSwitched=a,this.onTogglePlanner=i,this.topHUD=new be("top-hud",{onOpenContracts:()=>this.openContracts(),onOpenStore:()=>this.openStore(),onOpenHR:()=>this.openHR(),onOpenQuests:()=>this.openQuests(),onOpenAchievements:()=>this.openAchievements(),onOpenAdvisory:()=>this.openAdvisory(),onToggleMES:n=>this.onStateUpdated(),onOpenSaveModal:()=>this.openSaveModal(),onOpenWaferMap:()=>this.openWaferMap(),onOpenTutorial:()=>this.openTutorial(),onOpenFinance:()=>this.openFinancialReport(),onOpenLogin:()=>this.openUserLogin(),onOpenPlanner:()=>this.togglePlannerMode(),onOpenTechTree:()=>this.openTechTree(),onOpenFactoryReset:()=>this.openFactoryResetConfirmation()}),le.init(t,e,s),!t.player.companyName||t.player.companyName==="矽島先進半導體"?pe.show(t,()=>{this.render(),this.onStateUpdated(),Q.isCompleted(this.state)||this.openTutorial()}):Q.isCompleted(this.state)||setTimeout(()=>this.openTutorial(),400),this.render()}render(){this.topHUD.render(this.state),this.renderOrderStatusWidget()}renderOrderStatusWidget(){var _,H,I,P,K,ee;const t=document.getElementById("hud-widgets");if(!t)return;if(this.state.activeOrders.length===0){t.innerHTML=`
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
      `,(_=document.getElementById("hud-order-status-bar"))==null||_.addEventListener("click",()=>{b.playClick(),this.openContracts()});return}const e=this.state.activeOrders.filter(S=>S.status==="COMPLETED"),s=this.state.activeOrders.filter(S=>S.status==="ACTIVE"||S.status==="PENDING");if(e.length>0&&s.length===0){const S=e[0],O=S.deliveryYield!==void 0?S.deliveryYield:S.goodDiesDelivered/Math.max(1,S.totalDies),W=e.reduce((B,Y)=>B+(Y.expectedPayout||0),0);t.innerHTML=`
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
                    🎯 交貨良率: ${(O*100).toFixed(1)}%
                  </span>
                  ${e.length>1?`<span class="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300">共 ${e.length} 筆完工</span>`:""}
                </div>
                <div class="text-xs text-slate-300 mt-0.5">
                  晶圓已加工檢驗完成並送抵客戶！請前往合約看板檢視代工資訊並點擊請領尾款。
                </div>
              </div>
            </div>
            <button id="btn-bar-action" class="btn-sci-fi text-xs font-bold py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/30 flex-shrink-0">
              💰 立即收款 NT$ ${W>0?W.toLocaleString():"請領尾款"}
            </button>
          </div>
        </div>
      `,(H=document.getElementById("hud-order-status-bar"))==null||H.addEventListener("click",B=>{B.stopPropagation(),b.playClick(),this.openContracts()}),(I=document.getElementById("btn-bar-action"))==null||I.addEventListener("click",B=>{B.stopPropagation(),b.playClick(),this.openContracts()});return}const a=s[0]||this.state.activeOrders[0],i=this.state.activeLots.filter(S=>S.orderId===a.id),n=i.find(S=>S.status==="PROCESSING")||i[0],r=a.goodDiesDelivered,l=a.totalDies,d=Math.min(100,Math.round(r/Math.max(1,l)*100)),o=n?n.currentLayer:1,c=n?n.totalLayers:a.layerCount||10,p=n?n.currentStation:"FILM",h=n?n.litSubStep:void 0,m=a.assignedPieId?this.state.staff.find(S=>S.id===a.assignedPieId):null,u=V.getPieBonus(m);let f=p;p==="LIT"&&(h==="COAT"||h==="DEVELOP"?f="TRACK":f="LITHO");const x=this.state.machines.find(S=>S.category===f);let g="";if(n&&n.qTimeDeadline){const S=Math.max(0,Math.round(n.qTimeDeadline-this.state.gameTime));g=`
        <span class="px-2 py-0.5 rounded text-[11px] font-mono font-bold ${S<=15?"bg-red-950 text-red-300 border border-red-500/50 animate-pulse":"bg-amber-950 text-amber-300 border border-amber-500/30"}">
          ⏱️ Q-Time: ${S}s
        </span>
      `}const y=this.state.unlockedFeatures.cmp,T=[{key:"FILM",name:"薄膜沉積",en:"FILM",icon:"🧪",match:(S,O)=>S==="FILM"},{key:"TRACK_COAT",name:"光阻塗膠",en:"TRACK",icon:"🌀",match:(S,O)=>S==="LIT"&&O==="COAT"},{key:"LITHO",name:"微影曝光",en:"LITHO",icon:"🔬",match:(S,O)=>S==="LIT"&&O==="EXPOSE"},{key:"TRACK_DEV",name:"顯影烘烤",en:"DEVELOP",icon:"♨️",match:(S,O)=>S==="LIT"&&O==="DEVELOP"},{key:"ETCH",name:"電漿蝕刻",en:"ETCH",icon:"⚡",match:(S,O)=>S==="ETCH"},{key:"DIFF",name:"高溫擴散",en:"DIFF",icon:"🔥",match:(S,O)=>S==="DIFF"}];y&&T.push({key:"CMP",name:"平坦化研磨",en:"CMP",icon:"💎",match:S=>S==="CMP"});let v=-1;n&&n.status==="PROCESSING"&&(v=T.findIndex(S=>S.match(n.currentStation,n.litSubStep)));const E=a.goodDiesDelivered>=a.totalDies||i.length>0&&i.every(S=>S.status==="COMPLETED");let k="";if(e.length>0){const S=e[0],O=S.deliveryYield!==void 0?S.deliveryYield:S.goodDiesDelivered/Math.max(1,S.totalDies);k=`
        <div id="btn-quick-payout-banner" class="flex items-center justify-between bg-emerald-950/70 border border-emerald-500/50 rounded-lg px-3 py-1 mb-2 text-xs text-emerald-300 animate-pulse hover:bg-emerald-900/80 cursor-pointer">
          <span class="flex items-center gap-2 font-bold flex-wrap">
            <span>🎉</span>
            <span>【${S.clientName}】${e.length>1?`等 ${e.length} 筆訂單`:"訂單"}已完工交貨！</span>
            <span class="px-2 py-0.2 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40">
              🎯 良率: ${(O*100).toFixed(1)}%
            </span>
          </span>
          <span class="text-[11px] font-bold text-amber-300 flex items-center gap-1 hover:underline">
            💰 前往請領尾款 ➔
          </span>
        </div>
      `}t.innerHTML=`
      <div id="hud-order-status-bar" class="hud-order-bar cursor-pointer" title="點擊檢視訂單詳情與批次資訊">
        ${k}
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
                  第 <strong class="text-cyan-300">${o}</strong> / ${c} 層
                </span>
                ${this.state.activeOrders.length>1?`<span class="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-mono">共 ${this.state.activeOrders.length} 筆在製</span>`:""}
              </div>
              <div class="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-mono flex-wrap">
                <span>交付進度: <strong class="text-amber-300">${r} / ${l} 顆</strong> (${d}%)</span>
                <span class="text-slate-600">|</span>
                <span>所在機台: <strong class="${(x==null?void 0:x.status)==="EXPLODED"?"text-red-400 font-bold animate-pulse":"text-cyan-300"}">📍 ${x?x.name:"產線調度中"}</strong></span>
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
                  ⏱️ 站點進度: <strong>${n&&n.stationProgressSeconds||0}s</strong> / ${n&&n.stationRequiredSeconds||10}s
                </span>
                ${n!=null&&n.hasYellowRoomViolation?`
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-300 border border-red-500/60 animate-pulse">
                    🚨 致命白光污染！微影設備未在黃光區 (良率 0%)
                  </span>
                `:""}
                ${g}
              </div>
            </div>
          </div>

          <!-- 右側狀態與按鈕 -->
          <div class="flex items-center gap-2">
            ${e.length>0?`
              <button id="btn-bar-action" class="btn-sci-fi text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold animate-pulse shadow-md shadow-emerald-500/30">
                💰 請領尾款 (${e.length})
              </button>
            `:E?`
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
          <div class="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full transition-all duration-300" style="width: ${d}%"></div>
        </div>

        <!-- 下方：全機台流程 Pipeline -->
        <div class="flex items-center gap-1.5 w-full overflow-x-auto pt-1">
          ${T.map((S,O)=>{let W="step-waiting",B="待加工",Y="text-slate-500";if(E)W="step-completed",B="✓ 完工",Y="text-emerald-400";else if(O<v)W="step-completed",B="✓ 完工",Y="text-emerald-400";else if(O===v){const R=(n==null?void 0:n.stationProgressSeconds)||0,ce=(n==null?void 0:n.stationRequiredSeconds)||10;W="step-active",B=`⚡ ${R}/${ce}s`,Y="text-cyan-300 font-bold"}const se=S.key.startsWith("TRACK")?"TRACK":S.key==="LITHO"?"LITHO":S.key,U=this.state.machines.find(R=>R.category===se),z=(U==null?void 0:U.status)==="EXPLODED";return`
              <div class="pipeline-step ${W} ${z?"border-red-500/80 bg-red-950/30":""}" title="${S.name} (${S.en})${U?" - "+U.name:""}">
                <div class="flex items-center gap-1 text-xs">
                  <span>${S.icon}</span>
                  <span class="font-bold text-white text-[11px] truncate">${S.name}</span>
                </div>
                <div class="flex items-center justify-between w-full px-1 text-[10px] mt-0.5">
                  <span class="font-mono text-slate-400 text-[9px]">${S.en}</span>
                  <span class="${z?"text-red-400 font-bold animate-pulse":Y}">
                    ${z?"💥故障":B}
                  </span>
                </div>
              </div>
              ${O<T.length-1?'<span class="text-slate-600 text-xs flex-shrink-0 font-bold">➔</span>':""}
            `}).join("")}
        </div>
      </div>
    `,(P=document.getElementById("hud-order-status-bar"))==null||P.addEventListener("click",S=>{S.stopPropagation(),b.playClick(),this.openContracts()}),(K=document.getElementById("btn-bar-action"))==null||K.addEventListener("click",S=>{S.stopPropagation(),b.playClick(),this.openContracts()}),(ee=document.getElementById("btn-quick-payout-banner"))==null||ee.addEventListener("click",S=>{S.stopPropagation(),b.playClick(),this.openContracts()})}togglePlannerMode(t){var e;this.isPlannerActive=t!==void 0?t:!this.isPlannerActive,this.isPlannerActive&&this.currentPlannerTool==="NONE"&&(this.currentPlannerTool="MOVE_MACHINE"),(e=this.onTogglePlanner)==null||e.call(this,this.isPlannerActive,this.currentPlannerTool),this.renderPlannerToolbar()}setPlannerTool(t){var e;this.currentPlannerTool=t,(e=this.onTogglePlanner)==null||e.call(this,this.isPlannerActive,t),this.renderPlannerToolbar()}renderPlannerToolbar(){var e,s,a,i;let t=document.getElementById("planner-toolbar");if(!this.isPlannerActive){t&&t.remove();return}t||(t=document.createElement("div"),t.id="planner-toolbar",document.body.appendChild(t)),t.className="fixed top-18 left-1/2 -translate-x-1/2 z-50 glass-panel p-3 border-2 border-amber-500/70 shadow-2xl rounded-2xl flex flex-wrap items-center gap-3 animate-scaleUp pointer-events-auto bg-slate-950/95",t.innerHTML=`
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
    `,(e=document.getElementById("btn-planner-move"))==null||e.addEventListener("click",n=>{n.stopPropagation(),b.playClick(),this.setPlannerTool("MOVE_MACHINE")}),(s=document.getElementById("btn-planner-yellow"))==null||s.addEventListener("click",n=>{n.stopPropagation(),b.playClick(),this.setPlannerTool("PAINT_YELLOW")}),(a=document.getElementById("btn-planner-white"))==null||a.addEventListener("click",n=>{n.stopPropagation(),b.playClick(),this.setPlannerTool("PAINT_WHITE")}),(i=document.getElementById("btn-planner-exit"))==null||i.addEventListener("click",n=>{n.stopPropagation(),b.playClick(),this.togglePlannerMode(!1),this.onStateUpdated()})}openContracts(){oe.show(this.state,()=>{this.render(),this.onStateUpdated()})}openStore(){X.show(this.state,()=>{this.render(),this.onStateUpdated()})}openHR(){te.show(this.state,()=>{this.render(),this.onStateUpdated()})}openQuests(){ye.show(this.state,()=>{this.render(),this.onStateUpdated()})}openAchievements(){me.show(this.state,()=>{this.render(),this.onStateUpdated()})}openAdvisory(){ge.show(this.state,()=>{this.openStore()},()=>{this.openHR()})}openWaferMap(t){Z.show(this.state,t,()=>{this.render(),this.onStateUpdated()})}openLayerAllocation(t){re.show(this.state,t,()=>{this.render(),this.onStateUpdated()})}updateState(t){this.state=t,this.topHUD.rebuild(),this.render()}openFinancialReport(){he.show(this.state,()=>{this.render(),this.onStateUpdated()})}openTechTree(){ue.show(this.state,()=>{this.render(),this.onStateUpdated()})}openUserLogin(){ae.show(this.state,t=>{var e;this.state=t,(e=this.onUserSwitched)==null||e.call(this,t),this.render(),this.onStateUpdated(),Q.isCompleted(t)||setTimeout(()=>this.openTutorial(),400)})}openTutorial(t){Q.show(this.state,()=>{this.render(),this.onStateUpdated()},t)}openSaveModal(){var a,i,n,r,l,d;const t=document.getElementById("modal-container");if(!t)return;const e=o=>{o.key==="Escape"&&(t.innerHTML="",window.removeEventListener("keydown",e))};window.addEventListener("keydown",e);const s=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",e)};t.innerHTML=`
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
    `,(a=document.getElementById("btn-close-save-modal"))==null||a.addEventListener("click",s),(i=document.getElementById("btn-return-save"))==null||i.addEventListener("click",s),(n=document.getElementById("modal-backdrop-save"))==null||n.addEventListener("click",o=>{o.target===o.currentTarget&&s()}),(r=document.getElementById("btn-export-save"))==null||r.addEventListener("click",()=>{b.playClick();const o=C.exportSaveToJson(this.state),c=new Blob([o],{type:"application/json"}),p=URL.createObjectURL(c),h=document.createElement("a");h.href=p,h.download=`silicon_tycoon_save_${Date.now()}.json`,h.click(),URL.revokeObjectURL(p)}),(l=document.getElementById("btn-import-save"))==null||l.addEventListener("click",()=>{var o;(o=document.getElementById("file-import-save"))==null||o.click()}),(d=document.getElementById("file-import-save"))==null||d.addEventListener("change",o=>{var p;const c=(p=o.target.files)==null?void 0:p[0];if(c){const h=new FileReader;h.onload=m=>{var x;const u=(x=m.target)==null?void 0:x.result,f=C.importSaveFromJson(u);f.success&&f.state?(C.saveToLocalStorage(f.state),alert("存檔匯入成功！即將重新載入遊戲。"),window.location.reload()):alert(`匯入失敗: ${f.error}`)},h.readAsText(c)}})}showNotice(t){const e=document.createElement("div");e.className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs font-medium shadow-2xl animate-bounce",e.innerText=t,document.body.appendChild(e),setTimeout(()=>e.remove(),2500)}openFactoryResetConfirmation(){var a,i,n;const t=document.getElementById("modal-container");if(!t)return;b.playClick();const e=()=>{t.innerHTML="",window.removeEventListener("keydown",s)},s=r=>{r.key==="Escape"&&e()};window.addEventListener("keydown",s),t.innerHTML=`
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
    `,(a=document.getElementById("btn-cancel-factory-reset"))==null||a.addEventListener("click",e),(i=document.getElementById("modal-backdrop-reset"))==null||i.addEventListener("click",r=>{r.target===document.getElementById("modal-backdrop-reset")&&e()}),(n=document.getElementById("btn-confirm-factory-reset"))==null||n.addEventListener("click",()=>{b.playClick(),C.factoryResetAllData(),alert("全機資料已全數清空！即將重新整理進入全新遊戲。"),window.location.reload()})}}class we{static show(t,e,s){const a=document.getElementById("modal-container");a&&this.render(a,t,e,s)}static render(t,e,s,a){const i=A.machines[e.modelId],n=(i==null?void 0:i.path)||"./assets/machines/litho_contact.png",r=X.STORE_CATALOG.find(I=>I.modelId===e.modelId),l=r?Math.round(r.price*.15):3e5,d=r?Math.round(r.price*.4):8e5,o=Math.round(e.wear),c=s.staff.find(I=>I.id===e.assignedEngineerId);let p=!1,h=!1;c&&(p=j.checkTPMConditions(e,c).isTPMActive,h=j.checkExplosionRisk(e,c).hasRisk);let m=null,u=null;if(e.category==="LITHO"){const I=q.OPTICAL_CATALOG[e.modelId];if(I){const P=q.calculateEffectiveK1(s.player.unlockedK1,e.wear,c||null);m={effectiveK1:P.effectiveK1,formula:`Base(${P.k1Tech.toFixed(2)}) + 磨損(+${P.deltaWear.toFixed(3)}) - 調校(-${P.deltaEngineer.toFixed(2)}) + 疲勞(+${P.deltaFatigue.toFixed(2)})`},u=Math.round(P.effectiveK1*(I.wavelengthNm/I.numericalAperture))}}const f=e.category==="LITHO",x=s.machines.filter(I=>I.category==="TRACK"&&I.status!=="EXPLODED"),g=e.pairedTrackIds||[],y=D.BASE_THROUGHPUT_BY_TIER.LIT[e.tier]||10;let T=0;for(const I of g){const P=s.machines.find(K=>K.id===I);P&&(T+=D.BASE_THROUGHPUT_BY_TIER.TRACK[P.tier]||6)}const v=f&&(g.length===0||T<y),E=s.activeLots.filter(I=>I.status!=="PROCESSING"?!1:e.category==="TRACK"?I.currentStation==="LIT"&&(I.litSubStep==="COAT"||I.litSubStep==="DEVELOP"):e.category==="LITHO"?I.currentStation==="LIT"&&I.litSubStep==="EXPOSE":I.currentStation===e.category),k=E.length>0,_=D.isMachineInYellowRoom(e,s.facility.yellowRoomTiles),H=e.category==="LITHO"||e.category==="TRACK";t.innerHTML=`
      <div id="modal-backdrop-machine" class="modal-backdrop">
        <div class="modal-content glass-panel glass-panel-glow max-w-2xl max-h-[90vh] flex flex-col text-slate-100 p-0 overflow-hidden animate-fadeIn">
          
          <!-- Header -->
          <div class="modal-header flex items-center justify-between px-6 py-4 border-b border-slate-700/80 bg-slate-900/80">
            <div class="flex items-center gap-3">
              <div class="machine-panel-thumb w-14 h-14 rounded-xl bg-slate-950 border border-cyan-500/50 p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src="${n}" alt="${e.name}" class="w-full h-full object-contain filter drop-shadow" style="max-width: 52px; max-height: 52px;" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base font-bold text-white tracking-wide">${e.name}</h3>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Tier ${e.tier}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono ${k||e.status==="PROCESSING"?"bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse":e.status==="MAINTENANCE"?"bg-amber-500/20 text-amber-300 border border-amber-500/30":e.status==="EXPLODED"?"bg-red-600 text-white font-bold animate-bounce":"bg-slate-800 text-slate-300"}">
                    ${k?"⚡ 加工中 (PROCESSING)":e.status}
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
            ${H?_?`
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
                ${(r==null?void 0:r.description)||"廠內現役半導體晶圓製造專用設備。"}
              </div>
              ${r!=null&&r.scienceNote?`
                <div class="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-[11px] text-cyan-200/90 leading-relaxed">
                  <span class="font-bold text-cyan-300">ℹ️ 半導體物理原理：</span>
                  ${r.scienceNote}
                </div>
              `:""}
              <div class="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                <div class="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span class="text-slate-400">標準吞吐產能:</span>
                  <span class="text-cyan-300 font-bold">${(r==null?void 0:r.throughputWpm)||10} 晶圓/分</span>
                </div>
                <div class="p-2 rounded bg-slate-950/60 border border-slate-800/80 flex justify-between">
                  <span class="text-slate-400">${e.category==="LITHO"?"Rayleigh 極限 CD:":"製程站點:"}</span>
                  <span class="text-emerald-400 font-bold">${r!=null&&r.rayleighLimitNm?r.rayleighLimitNm+" nm":e.category}</span>
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
                  ${E.map(I=>`
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

            <!-- 3. Wear & Health Bar -->
            <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div class="flex items-center justify-between font-mono">
                <span class="text-slate-400 flex items-center gap-1.5">
                  <span>🛠️</span>
                  <span>機台磨損與在線健康度</span>
                </span>
                <span class="font-bold ${o>70?"text-red-400":o>40?"text-amber-400":"text-emerald-400"}">
                  磨損: ${o}% (健康度 ${100-o}%)
                </span>
              </div>
              <div class="w-full h-2.5 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                <div class="h-full transition-all duration-300 ${o>70?"bg-red-500":o>40?"bg-amber-500":"bg-emerald-500"}" style="width: ${o}%;"></div>
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
            ${f&&m?`
              <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div class="flex items-center justify-between font-mono">
                  <span class="text-cyan-300 font-bold flex items-center gap-1.5">
                    <span>🔬</span>
                    <span>Rayleigh 微影光學解析度實時調校</span>
                  </span>
                  <span class="text-emerald-400 font-bold">極限 CD: ~${u} nm</span>
                </div>
                <div class="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 space-y-1 font-mono text-[11px]">
                  <div class="flex justify-between">
                    <span class="text-slate-400">當前實效 k1 因子:</span>
                    <span class="text-cyan-300 font-bold">${m.effectiveK1.toFixed(3)}</span>
                  </div>
                  <div class="text-[10px] text-slate-500">
                    計算分解: ${m.formula}
                  </div>
                  ${m.effectiveK1<.38?`
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
                    微影 ${y} 片/分 vs Track ${T} 片/分
                  </span>
                </div>

                <p class="text-[11px] text-slate-400">
                  半導體黃光區晶圓每層必須進出 Track 兩次 (塗膠 + 顯影)！可勾選並聯多台 Track 機台分流吞吐：
                </p>

                ${x.length===0?`
                  <div class="p-2.5 rounded bg-red-950/20 border border-red-800/30 text-red-300 text-[11px]">
                    ⚠️ 廠內尚未安裝任何 Track 塗膠顯影機！微影機無法單獨運作，請前往商城採購！
                  </div>
                `:`
                  <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    ${x.map(I=>{const P=g.includes(I.id),K=D.BASE_THROUGHPUT_BY_TIER.TRACK[I.tier]||6;return`
                        <label class="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border ${P?"border-cyan-500/40 bg-cyan-950/10":"border-slate-800"} cursor-pointer hover:border-slate-700">
                          <div class="flex items-center gap-2">
                            <input
                              type="checkbox"
                              class="chk-paired-track rounded border-slate-700 text-cyan-500 focus:ring-0"
                              data-track-id="${I.id}"
                              ${P?"checked":""}
                            />
                            <span class="font-semibold text-slate-200 text-xs">${I.name}</span>
                            <span class="text-[10px] text-slate-400 font-mono">(Tier ${I.tier})</span>
                          </div>
                          <span class="font-mono text-[11px] text-cyan-300">+${K} 晶圓/分</span>
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
                ${c?`
                  <span class="text-[10px] font-mono text-purple-300">
                    ${c.rank} (${c.moduleSpecialty})
                  </span>
                `:'<span class="text-[10px] text-slate-500">無工程師</span>'}
              </div>

              <select id="select-station-engineer" class="select-sci-fi w-full py-2 px-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs">
                <option value="">-- 未指派 (無調校加成，磨損正常累積) --</option>
                ${s.staff.map(I=>`
                  <option value="${I.id}" ${e.assignedEngineerId===I.id?"selected":""}>
                    ${I.name} - ${I.rank} [專長: ${I.moduleSpecialty}] (疲勞: ${Math.round(I.fatigue)}%)
                  </option>
                `).join("")}
              </select>

              <!-- 工程師日常巡檢維護功能 -->
              <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div class="text-[11px] text-slate-400">
                  ${c?`
                    <span>駐機人員：<strong class="text-slate-200">${c.name}</strong> (疲勞 ${Math.round(c.fatigue)}%)</span>
                  `:`
                    <span class="text-amber-400/80">💡 指派工程師駐機後，即可執行日常巡檢以降低磨損！</span>
                  `}
                </div>
                <button
                  id="btn-engineer-inspect"
                  class="btn-sci-fi text-xs py-1.5 px-3 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 flex items-center gap-1.5 cursor-pointer ${!c||c&&c.fatigue>=95?"opacity-50 cursor-not-allowed":""}"
                  ${!c||c&&c.fatigue>=95?"disabled":""}
                  title="由駐機工程師對設備執行日常精密巡檢調校與落塵清除，降低 12% 磨損度並累積每日巡檢任務"
                >
                  <span>🔍</span>
                  <span>工程師日常巡檢 (消耗 8% 疲勞)</span>
                </button>
              </div>
            </div>

            <!-- 7. Machine Maintenance Actions -->
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
                ♻️ 報廢變賣 (+NT$ ${d.toLocaleString()})
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
    `,this.bindEvents(t,e,s,a)}static bindEvents(t,e,s,a){var r,l,d,o,c,p,h;const i=()=>{b.playClick(),t.innerHTML="",window.removeEventListener("keydown",n)},n=m=>{m.key==="Escape"&&i()};window.addEventListener("keydown",n),(r=document.getElementById("btn-close-machine-panel"))==null||r.addEventListener("click",i),(l=document.getElementById("btn-back-machine"))==null||l.addEventListener("click",i),(d=document.getElementById("modal-backdrop-machine"))==null||d.addEventListener("click",m=>{m.target===document.getElementById("modal-backdrop-machine")&&i()}),t.querySelectorAll(".chk-paired-track").forEach(m=>{m.addEventListener("change",()=>{b.playClick();const u=[];t.querySelectorAll(".chk-paired-track:checked").forEach(f=>{const x=f.getAttribute("data-track-id");x&&u.push(x)}),e.pairedTrackIds=u,a(),this.render(t,e,s,a)})}),(o=document.getElementById("select-station-engineer"))==null||o.addEventListener("change",m=>{b.playClick();const u=m.target.value||null;if(e.assignedEngineerId){const f=s.staff.find(x=>x.id===e.assignedEngineerId);f&&(f.assignedMachineId=null)}if(e.assignedEngineerId=u,u){const f=s.staff.find(x=>x.id===u);if(f){if(f.assignedMachineId){const x=s.machines.find(g=>g.id===f.assignedMachineId);x&&(x.assignedEngineerId=null)}f.assignedMachineId=e.id,G.onMachineMaintained(s.questState),N.checkAchievements(s),C.saveToLocalStorage(s)}}a(),this.render(t,e,s,a)}),(c=document.getElementById("btn-engineer-inspect"))==null||c.addEventListener("click",()=>{if(!e.assignedEngineerId){alert("請先在上方下拉選單指派駐機工程師，方可執行巡檢！");return}const m=s.staff.find(u=>u.id===e.assignedEngineerId);if(m){if(m.fatigue>=95){alert(`工程師 ${m.name} 疲勞度過高 (${Math.round(m.fatigue)}%)，體力不支無法執行巡檢！請至人資中心安排排休恢復精神！`);return}if(e.wear<=0){alert(`設備【${e.name}】目前處於 100% 完美健康狀態，無需額外調校！`);return}b.playClick(),e.wear=Math.max(0,e.wear-12),m.fatigue=Math.min(100,m.fatigue+8),G.onMachineMaintained(s.questState),N.checkAchievements(s),C.saveToLocalStorage(s),a(),this.render(t,e,s,a)}}),(p=document.getElementById("btn-machine-overhaul"))==null||p.addEventListener("click",()=>{const m=X.STORE_CATALOG.find(f=>f.modelId===e.modelId),u=m?Math.round(m.price*.15):3e5;if(s.player.cash<u){alert("資金不足，無法執行大修！");return}s.player.cash-=u,L.recordMaintenance(s,u),e.wear=0,e.status="IDLE",G.onMachineMaintained(s.questState),N.checkAchievements(s),C.saveToLocalStorage(s),b.playClick(),a(),this.render(t,e,s,a)}),(h=document.getElementById("btn-machine-decommission"))==null||h.addEventListener("click",()=>{const m=X.STORE_CATALOG.find(x=>x.modelId===e.modelId),u=m?Math.round(m.price*.4):8e5;if(!confirm(`確定要將設備【${e.name}】除役報廢嗎？回收變賣金額 NT$ ${u.toLocaleString()}`))return;if(e.assignedEngineerId){const x=s.staff.find(g=>g.id===e.assignedEngineerId);x&&(x.assignedMachineId=null)}const f=s.machines.findIndex(x=>x.id===e.id);f!==-1&&(s.machines.splice(f,1),D.updateMachineNames(s.machines)),s.player.cash+=u,b.playCoinChime(),t.innerHTML="",a()})}}class Te{constructor(){w(this,"state",C.loadFromLocalStorage()||C.createDefaultSave());w(this,"phaserGame");w(this,"cleanroomScene");w(this,"uiManager");w(this,"autoSaveTimer",0);console.log("🚀 正在啟動 Silicon Tycoon: Foundry Master 矽島霸權...");const t=Date.now();if(this.state.lastOnlineTimestamp&&t-this.state.lastOnlineTimestamp>=2e3){const a=Math.floor((t-this.state.lastOnlineTimestamp)/1e3),i=D.simulateOfflineCatchUp(this.state,a);console.log("離線生產推進報告:",i),this.state.lastOnlineTimestamp=t,this.state.savedAt=t,C.saveToLocalStorage(this.state)}window.addEventListener("beforeunload",()=>{this.state.lastOnlineTimestamp=Date.now(),C.saveToLocalStorage(this.state)}),document.addEventListener("visibilitychange",()=>{document.visibilityState==="hidden"&&(this.state.lastOnlineTimestamp=Date.now(),C.saveToLocalStorage(this.state))});const e=new Date().toISOString().split("T")[0];this.state.questState=G.refreshDailyQuests(this.state.questState,this.state.player,this.state.unlockedFeatures,e),N.checkAchievements(this.state);const s={type:Phaser.AUTO,parent:"game-container",width:window.innerWidth,height:window.innerHeight,backgroundColor:"#070b14",render:{antialias:!0,pixelArt:!1},scale:{mode:Phaser.Scale.RESIZE,autoCenter:Phaser.Scale.CENTER_BOTH}};this.phaserGame=new Phaser.Game(s),this.cleanroomScene=new ne,this.phaserGame.scene.add(ne.KEY,this.cleanroomScene,!0,{saveGame:this.state,onMachineClick:a=>this.handleMachineClick(a),onStateUpdate:()=>this.onStateChanged()}),this.uiManager=new ve(this.state,a=>{console.log(`開發者調整遊戲速度至: ${a}x`)},()=>{this.onStateChanged()},a=>{this.state=a,this.cleanroomScene.updateState(this.state),this.uiManager.updateState(this.state),this.onStateChanged()},(a,i)=>{this.cleanroomScene.setPlannerMode(a,i)}),setInterval(()=>this.simulationTick(),1e3)}simulationTick(){const t=le.getSpeedMultiplier();for(let s=0;s<t;s++){this.state.gameTime+=1,L.tickSimulation(this.state,1),$.checkOrderReplenishment(this.state),$.checkMarketOrdersExpiry(this.state);const a=new Map(this.state.staff.map(n=>[n.id,n]));for(const n of this.state.machines){if(n.status==="EXPLODED")continue;const r=n.assignedEngineerId?a.get(n.assignedEngineerId):null,l=j.updateMachineHealth(n,r,1);n.wear=l.newWear,l.breakdownOccurred&&(n.status=l.isExploded?"EXPLODED":"MAINTENANCE")}for(const n of this.state.staff)if(n.workShift==="OFF")n.fatigue=Math.max(0,n.fatigue-.25);else{const r=n.shiftMode==="TWO_SHIFT"?.05:.02,l=n.workShift==="NIGHT"?1.5:1;n.fatigue=Math.min(100,n.fatigue+r*l)}const i=new Set;for(const n of this.state.activeLots)n.status==="PROCESSING"&&(n.currentStation==="LIT"?n.litSubStep==="COAT"||n.litSubStep==="DEVELOP"?i.add("TRACK"):i.add("LITHO"):i.add(n.currentStation));for(const n of this.state.machines)n.status==="EXPLODED"||n.status==="MAINTENANCE"||(i.has(n.category)?n.status="PROCESSING":n.status="IDLE");for(const n of this.state.activeLots)if(n.status==="PROCESSING"){const r=this.state.activeOrders.find(d=>d.id===n.orderId),l=r!=null&&r.assignedPieId?this.state.staff.find(d=>d.id===r.assignedPieId):void 0;if(l&&l.workShift!=="OFF"&&(l.fatigue=Math.min(100,l.fatigue+.02)),n.stationProgressSeconds===void 0&&(n.stationProgressSeconds=0),n.stationRequiredSeconds||(n.stationRequiredSeconds=D.getStationRequiredSeconds(n.currentStation,n.litSubStep,void 0,void 0,l)),n.stationProgressSeconds+=1,n.stationProgressSeconds>=n.stationRequiredSeconds){n.stationProgressSeconds=0;const d=r?r.nodeNm:1e4,o=D.advanceLotStation(n,this.state.unlockedFeatures.cmp,d,this.state.player.unlockedCleanroomClass,this.state.gameTime,this.state.machines,this.state.facility.yellowRoomTiles);if(n.stationRequiredSeconds=D.getStationRequiredSeconds(n.currentStation,n.litSubStep,void 0,void 0,l),o.isLotCompleted&&(n.status="COMPLETED",r)){const c=this.state.activeLots.filter(m=>m.orderId===r.id);!n.hasYellowRoomViolation&&n.yieldMultiplier!==0&&(n.yieldMultiplier=V.calculateLotYield(n,this.state,r));const p=Math.round(r.totalDies/Math.max(1,c.length)*n.yieldMultiplier);if(r.goodDiesDelivered=Math.min(r.totalDies,r.goodDiesDelivered+p),G.onWaferDelivered(this.state.questState,p>0?n.waferCount:0),c.every(m=>m.status==="COMPLETED")&&r.status!=="COMPLETED"){r.status="COMPLETED",r.deliveryYield=Number((r.goodDiesDelivered/r.totalDies).toFixed(3));const m=$.settleOrderPayout(r,r.goodDiesDelivered,this.state.player,this.state.staff,0,this.state.clawbackDebt);r.expectedPayout=m.netPayout,r.completedAtGameTime=this.state.gameTime,this.state.rollingYieldHistory.push(r.deliveryYield),this.state.rollingYieldHistory.length>5&&this.state.rollingYieldHistory.shift()}}}}}N.checkAchievements(this.state).newlyUnlocked.length>0&&this.uiManager.render(),this.autoSaveTimer+=1,this.autoSaveTimer>=10&&(this.autoSaveTimer=0,C.saveToLocalStorage(this.state)),this.uiManager.render(),this.cleanroomScene.updateState(this.state)}handleMachineClick(t){we.show(t,this.state,()=>this.onStateChanged())}onStateChanged(){C.saveToLocalStorage(this.state),this.cleanroomScene.updateState(this.state),this.uiManager.render()}}window.addEventListener("DOMContentLoaded",()=>{new Te});
