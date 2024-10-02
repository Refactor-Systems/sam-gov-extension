(()=>{"use strict";const t="https://api.sam.gov/prod/opportunities/v2/search";function e(t,e){const n=new URL(t);return Object.entries(e).forEach((([t,e])=>{n.searchParams.append(t,e.toString())})),n.toString()}chrome.runtime.onMessage.addListener(((n,o,r)=>{if("getSolicitationNumber"!==n.action){if("fetchData"===n.action&&n.solnum)return async function(n){try{const{apiKey:o}=await chrome.storage.sync.get("apiKey");if(!o)return{error:"API key not set"};let r;const i=e(t,{solnum:n,api_key:o,limit:1e3});if(r=await fetch(i),!r.ok)throw new Error(`HTTP error! status: ${r.status}`);let s=await r.json();const a=function(){const t=window.location.href.match(/\/opp\/([a-f0-9]+)\//);return t?t[1]:null}();if(s.opportunitiesData&&0===s.opportunitiesData.length&&a){console.log("No results found with solnum. Trying with noticeid...");const n=e(t,{noticeid:a,api_key:o,limit:1e3});if(r=await fetch(n),!r.ok)throw new Error(`HTTP error! status: ${r.status}`);s=await r.json()}return{opportunityData:s}}catch(t){return{error:t.message}}}(n.solnum).then(r),!0}else r({solicitationNumber:function(){const t=document.querySelectorAll(".header");for(const e of t)if("Notice ID"===e.textContent?.trim()){const t=e.nextElementSibling;if(t&&t.classList.contains("description"))return t.textContent?.trim()||null}return null}()})}))})();
//# sourceMappingURL=content.js.map