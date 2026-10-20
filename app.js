'use strict';
(() => {
  const KEY = 'focus-search-v2';
  const BUILTINS = [
    {id:'xhs',name:'小红书',symbol:'红',color:'#ff2442',template:'https://www.xiaohongshu.com/search_result?keyword={query}&source=web_search_result_notes'},
    {id:'zhihu',name:'知乎',symbol:'知',color:'#1772f6',template:'https://www.zhihu.com/search?type=content&q={query}'},
    {id:'google',name:'Google',symbol:'G',color:'#4285f4',template:'https://www.google.com/search?q={query}'},
    {id:'baidu',name:'百度',symbol:'度',color:'#346efd',template:'https://www.baidu.com/s?wd={query}'},
    {id:'bilibili',name:'B站',symbol:'哔',color:'#fb7299',template:'https://search.bilibili.com/all?keyword={query}'},
    {id:'douyin',name:'抖音',symbol:'抖',color:'#111111',template:'https://www.douyin.com/search/{query}?type=general'},
    {id:'youtube',name:'YouTube',symbol:'▶',color:'#ea4335',template:'https://www.youtube.com/results?search_query={query}'},
    {id:'reddit',name:'Reddit',symbol:'r',color:'#f4501e',template:'https://www.reddit.com/search/?q={query}'},
    {id:'github',name:'GitHub',symbol:'⌘',color:'#70757a',template:'https://github.com/search?q={query}&type=repositories'}
  ];
  const WALLPAPERS = [{"id": "lake", "name": "湖光山色", "src": "./assets/wallpapers/lake.webp", "thumb": "./assets/wallpapers/lake-thumb.webp", "source": "https://images.unsplash.com/photo-1470770841072-f978cf4d019e"}, {"id": "peaks", "name": "远山", "src": "./assets/wallpapers/peaks.webp", "thumb": "./assets/wallpapers/peaks-thumb.webp", "source": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b"}, {"id": "sunset", "name": "山野暮色", "src": "./assets/wallpapers/sunset.webp", "thumb": "./assets/wallpapers/sunset-thumb.webp", "source": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"}, {"id": "forest", "name": "林间光影", "src": "./assets/wallpapers/forest.webp", "thumb": "./assets/wallpapers/forest-thumb.webp", "source": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e"}, {"id": "alpine", "name": "高山湖泊", "src": "./assets/wallpapers/alpine.webp", "thumb": "./assets/wallpapers/alpine-thumb.webp", "source": "https://images.unsplash.com/photo-1501785888041-af3ef285b470"}, {"id": "woods", "name": "绿意森林", "src": "./assets/wallpapers/woods.webp", "thumb": "./assets/wallpapers/woods-thumb.webp", "source": "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d"}, {"id": "meadow", "name": "原野", "src": "./assets/wallpapers/meadow.webp", "thumb": "./assets/wallpapers/meadow-thumb.webp", "source": "https://images.unsplash.com/photo-1472214103451-9374bd1c798e"}, {"id": "stars", "name": "雪山星空", "src": "./assets/wallpapers/stars.webp", "thumb": "./assets/wallpapers/stars-thumb.webp", "source": "https://images.unsplash.com/photo-1519681393784-d120267933ba"}];
  const $ = selector => document.querySelector(selector);
  const input = $('#keyword');
  let storageOK = true, stored = {};
  try { stored = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { storageOK = false; }
  function validTemplate(value) {
    if (typeof value !== 'string' || value.length > 2000 || !value.includes('{query}')) return false;
    try { const url=new URL(value.replaceAll('{query}','focus-test'));return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password&&!url.hostname.includes('focus-test'); } catch { return false; }
  }
  function parseSearchTemplate(value) {
    try {
      const u = new URL(value.trim());
      if (!['http:','https:'].includes(u.protocol)) return null;
      const keys=['q','query','keyword','keywords','search_query','wd','text'];
      for (const key of keys) if (u.searchParams.has(key)) { u.searchParams.set(key,'{query}'); return u.toString(); }
      const parts=u.pathname.split('/').filter(Boolean);
      const index=parts.findIndex(part=>/^(search|search_result|results|s)$/i.test(part));
      if (index>=0 && parts[index+1]) { parts[index+1]='{query}'; u.pathname='/'+parts.join('/'); return u.toString(); }
      return null;
    } catch { return null; }
  }
  function validImageUrl(value) {
    try { const u=new URL(value);return value.length<=4000&&u.protocol==='https:'&&!u.username&&!u.password; } catch { return false; }
  }
  function cleanSite(site) {
    if(!site||typeof site.id!=='string'||!(/^[a-z][a-z0-9-]{0,70}$/).test(site.id)||typeof site.name!=='string'||!site.name.trim()||site.name.length>24||!validTemplate(site.template))return null;
    return {id:site.id,name:site.name.trim(),template:site.template,symbol:typeof site.symbol==='string'?Array.from(site.symbol).slice(0,2).join(''):Array.from(site.name)[0],color:/^#[a-f0-9]{6}$/i.test(site.color)?site.color:'#1a73e8'};
  }
  const initialSites=Array.isArray(stored.sites)?stored.sites:[...BUILTINS,...(Array.isArray(stored.custom)?stored.custom:[])];
  const seen=new Set();
  const loadedSites=initialSites.map(cleanSite).filter(site=>site&&!seen.has(site.id)&&seen.add(site.id)).slice(0,24);
  const oldWallpaper=stored.wallpaper&&typeof stored.wallpaper==='object'?stored.wallpaper:{};
  const state={version:3,sites:loadedSites,selected:typeof stored.selected==='string'?stored.selected:'xhs',theme:['light','dark','system'].includes(stored.theme)?stored.theme:'light',newTab:stored.newTab!==false,remember:stored.remember===true,multi:Array.isArray(stored.multi)?stored.multi.filter(x=>typeof x==='string'):['xhs','zhihu'],history:stored.remember===true&&Array.isArray(stored.history)?stored.history.filter(x=>typeof x==='string'&&x.length<=500).slice(0,8):[],wallpaper:{mode:['scenery','none','local','url'].includes(oldWallpaper.mode)?oldWallpaper.mode:'scenery',rotation:['visit','daily','fixed'].includes(oldWallpaper.rotation)?oldWallpaper.rotation:'visit',photoId:WALLPAPERS.some(p=>p.id===oldWallpaper.photoId)?oldWallpaper.photoId:'lake',shade:typeof oldWallpaper.shade==='number'?Math.max(10,Math.min(70,oldWallpaper.shade)):35,url:typeof oldWallpaper.url==='string'&&validImageUrl(oldWallpaper.url)?oldWallpaper.url:''}};
  const sites=()=>state.sites;
  const siteById=id=>sites().find(site=>site.id===id);
  function reconcileSites(){if(!siteById(state.selected))state.selected=sites()[0]?.id||'';state.multi=state.multi.filter(id=>siteById(id));}
  reconcileSites();
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));storageOK=true;}catch{storageOK=false;toast('浏览器无法保存偏好，本次使用不受影响');}}
  function toast(message,undo){const el=$('#toast');$('#toast-message').textContent=message;$('#toast-undo').hidden=!undo;$('#toast-undo').onclick=undo?()=>{undo();el.hidden=true;}:null;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>{el.hidden=true;},undo?6500:3200);}
  function node(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el;}
  function icon(name){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#i-'+name);svg.append(use);svg.setAttribute('aria-hidden','true');return svg;}
  function symbol(site){const el=node('span','site-symbol',site.symbol);el.style.setProperty('--site-color',site.color);el.setAttribute('aria-hidden','true');return el;}
  function makeUrl(site,query){return site.template.replaceAll('{query}',encodeURIComponent(query));}
  function applyTheme(){document.body.dataset.theme=state.theme==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):state.theme;document.querySelector('meta[name="theme-color"]').content=document.body.dataset.theme==='dark'?'#202124':'#ffffff';}
  applyTheme();matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(state.theme==='system')applyTheme();});
  function renderPlatforms(){
    const list=$('#platforms');list.replaceChildren();
    for(const site of sites()){
      const label=node('label','platform'),radio=node('input');radio.type='radio';radio.name='platform';radio.value=site.id;radio.checked=site.id===state.selected;
      radio.addEventListener('change',()=>{state.selected=site.id;$('#search-button').textContent='搜索'+site.name;save();renderSiteList();});
      label.append(radio,symbol(site),node('span','',site.name));list.append(label);
    }
    if(sites().length){const add=node('button','platform-manage','+');add.type='button';add.title='添加或管理网站';add.setAttribute('aria-label','添加或管理网站');add.addEventListener('click',()=>openDialog('sites-dialog'));list.append(add);}
    else{const empty=node('div','empty-platforms','还没有搜索网站');const add=node('button','text-btn link-color','添加网站');add.type='button';add.addEventListener('click',()=>openDialog('sites-dialog'));empty.append(add);list.append(empty);}
    $('#search-button').textContent=siteById(state.selected)?'搜索'+siteById(state.selected).name:'先添加搜索网站';$('#search-button').disabled=!sites().length;$('#multi-button').disabled=!sites().length;$('.search-submit').disabled=!sites().length;
  }
  function query(){const q=input.value.trim();if(!q){input.focus();input.reportValidity();return null;}return q;}
  function remember(q){if(!state.remember)return;state.history=[q,...state.history.filter(item=>item!==q)].slice(0,8);save();renderHistory();}
  function showResults(q,chosen,multiple=false){$('#results-heading').textContent='“'+q+'”';$('#results-note').textContent=multiple?'已请求打开所选平台。如新标签未打开，请点击以下链接。':'已请求打开'+chosen[0].name+'。也可以点击下方链接再次打开。';$('#result-links').replaceChildren();for(const site of chosen){const link=node('a','result-link',site.name);link.href=makeUrl(site,q);link.target='_blank';link.rel='noopener noreferrer';link.append(icon('arrow'));$('#result-links').append(link);}$('#results').hidden=false;}
  function search(chosen,multiple=false){chosen=chosen.filter(Boolean);if(!chosen.length){openDialog('sites-dialog');return;}const q=query();if(!q)return;remember(q);showResults(q,chosen,multiple);if(multiple||state.newTab)for(const site of chosen)window.open(makeUrl(site,q),'_blank','noopener,noreferrer');else window.location.assign(makeUrl(chosen[0],q));}
  $('#search-form').addEventListener('submit',event=>{event.preventDefault();search([siteById(state.selected)]);});input.addEventListener('input',()=>{$('#clear-input').hidden=!input.value;});$('#clear-input').addEventListener('click',()=>{input.value='';$('#clear-input').hidden=true;input.focus();});$('#close-results').addEventListener('click',()=>{$('#results').hidden=true;});
  function openDialog(id){if(id==='sites-dialog')renderSiteList();if(id==='background-dialog'){renderWallpaperGallery();syncBackgroundControls();}const dialog=$('#'+id);if(!dialog.open)dialog.showModal();}
  document.querySelectorAll('[data-dialog]').forEach(button=>button.addEventListener('click',()=>openDialog(button.dataset.dialog)));
  document.querySelectorAll('[data-switch]').forEach(button=>button.addEventListener('click',()=>{button.closest('dialog').close();openDialog(button.dataset.switch);}));
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}));
  function updateMultiCount(){const count=$('#multi-platforms').querySelectorAll('input:checked').length;$('#multi-count').textContent='已选择 '+count+' 个平台';$('#run-multi').disabled=count===0;}
  function openMulti(){if(!sites().length){openDialog('sites-dialog');return;}if(!query())return;$('#multi-platforms').replaceChildren();for(const site of sites()){const label=node('label','multi-option'),checkbox=node('input');checkbox.type='checkbox';checkbox.value=site.id;checkbox.checked=state.multi.includes(site.id);checkbox.addEventListener('change',updateMultiCount);label.append(checkbox,symbol(site),node('span','',site.name));$('#multi-platforms').append(label);}updateMultiCount();openDialog('multi-dialog');}
  $('#multi-button').addEventListener('click',openMulti);$('#run-multi').addEventListener('click',()=>{state.multi=Array.from($('#multi-platforms').querySelectorAll('input:checked'),c=>c.value);save();$('#multi-dialog').close();search(state.multi.map(siteById),true);});
  $('#theme').value=state.theme;$('#new-tab').checked=state.newTab;$('#remember-history').checked=state.remember;
  $('#theme').addEventListener('change',e=>{state.theme=e.target.value;applyTheme();save();});$('#new-tab').addEventListener('change',e=>{state.newTab=e.target.checked;save();});$('#remember-history').addEventListener('change',e=>{state.remember=e.target.checked;if(!state.remember)state.history=[];save();renderHistory();});
  function renderHistory(){$('#history-section').hidden=!state.remember||!state.history.length;$('#history-items').replaceChildren();for(const q of state.history){const b=node('button','history-item');b.type='button';b.append(icon('clock'),node('span','',q));b.addEventListener('click',()=>{input.value=q;$('#clear-input').hidden=false;input.focus();});$('#history-items').append(b);}}
  $('#clear-history').addEventListener('click',()=>{state.history=[];save();renderHistory();toast('搜索记录已清空');});
  let editingId=null;
  function resetEditor(){editingId=null;$('#custom-form').reset();$('#editor-heading').textContent='添加搜索网站';$('#save-site').textContent='添加网站';$('#cancel-edit').hidden=true;$('#custom-error').textContent='';}
  function refreshSites(){reconcileSites();save();renderPlatforms();renderSiteList();$('#results').hidden=true;}
  function renderSiteList(){
    const list=$('#site-list');list.replaceChildren();$('#site-count').textContent=sites().length+' / 24 个';
    if(!sites().length)list.append(node('p','muted small','网站已清空。在下方添加，或恢复内置网站。'));
    for(const [index,site] of sites().entries()){
      const row=node('div','managed-site'),info=node('div','managed-info'),name=node('div','managed-name',site.name);
      if(site.id===state.selected)name.append(node('span','default-badge','默认'));
      info.append(name,node('div','managed-address',new URL(site.template.replaceAll('{query}','search')).hostname));
      const actions=node('div','managed-actions');
      for(const [direction,label] of [[-1,'上移'],[1,'下移']]){const b=node('button','mini-button',direction===-1?'↑':'↓');b.type='button';b.setAttribute('aria-label',label+site.name);b.disabled=index+direction<0||index+direction>=sites().length;b.addEventListener('click',()=>{const a=state.sites;[a[index],a[index+direction]]=[a[index+direction],a[index]];refreshSites();});actions.append(b);}
      const edit=node('button','edit-button','编辑');edit.type='button';edit.setAttribute('aria-label','编辑'+site.name);edit.addEventListener('click',()=>{editingId=site.id;$('#custom-name').value=site.name;$('#custom-url').value=site.template;$('#editor-heading').textContent='编辑 '+site.name;$('#save-site').textContent='保存修改';$('#cancel-edit').hidden=false;$('#custom-error').textContent='';$('#custom-name').focus();});
      const remove=node('button','delete-button','删除');remove.type='button';remove.setAttribute('aria-label','删除'+site.name);remove.addEventListener('click',()=>{const selectedBefore=state.selected,multiBefore=[...state.multi];state.sites=state.sites.filter(item=>item.id!==site.id);if(editingId===site.id)resetEditor();refreshSites();toast('已删除 '+site.name,()=>{if(siteById(site.id))return;state.sites.splice(Math.min(index,sites().length),0,site);state.selected=selectedBefore;state.multi=multiBefore;refreshSites();});});
      actions.append(edit,remove);row.append(symbol(site),info,actions);list.append(row);
    }
  }
  $('#cancel-edit').addEventListener('click',resetEditor);
  $('#restore-sites').addEventListener('click',()=>{const missing=BUILTINS.filter(site=>!siteById(site.id));const room=24-sites().length;state.sites.push(...missing.slice(0,room).map(s=>({...s})));refreshSites();toast(missing.length?'已恢复 '+Math.min(missing.length,room)+' 个内置网站':'内置网站都在列表中');});
  $('#parse-site').addEventListener('click',()=>{
    const parsed=parseSearchTemplate($('#custom-url').value),error=$('#custom-error');
    if(!parsed){error.textContent='请粘贴一个已经包含关键词的搜索结果网址，例如 ?q=电影 或 /search/电影';return;}
    $('#custom-url').value=parsed;error.textContent='已识别搜索地址，请检查后保存。';
  });
  $('#custom-form').addEventListener('submit',event=>{event.preventDefault();const name=$('#custom-name').value.trim(),template=$('#custom-url').value.trim(),error=$('#custom-error');if(!name){error.textContent='请输入网站名称';return;}if(!validTemplate(template)){error.textContent='请输入包含 {query} 的 HTTP 或 HTTPS 搜索地址，关键词须放在路径或参数中。';return;}if(!editingId&&sites().length>=24){error.textContent='最多保留 24 个网站，请先删除一个。';return;}const existing=siteById(editingId);const data={id:editingId||'custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),name,template,symbol:existing?.symbol||Array.from(name)[0],color:existing?.color||'#1a73e8'};if(editingId){const index=state.sites.findIndex(s=>s.id===editingId);if(index>=0)state.sites[index]=data;}else state.sites.push(data);const wasEditing=!!editingId;resetEditor();refreshSites();toast((wasEditing?'已更新 ':'已添加 ')+name);});
  // Local photos are stored in IndexedDB, never in GitHub or a server.
  function imageStore(action,value){return new Promise((resolve,reject)=>{if(!window.indexedDB){reject(new Error('浏览器不支持图片存储'));return;}const req=indexedDB.open('focus-search-images',1);req.onupgradeneeded=()=>{req.result.createObjectStore('images');};req.onerror=()=>reject(req.error);req.onblocked=()=>reject(new Error('图片存储被其他标签页占用'));req.onsuccess=()=>{const db=req.result;const tx=db.transaction('images',action==='get'?'readonly':'readwrite'),store=tx.objectStore('images');let read;try{if(action==='get')read=store.get('background');else if(action==='put')store.put(value,'background');else store.delete('background');}catch(e){db.close();reject(e);return;}tx.oncomplete=()=>{resolve(read?.result);db.close();};tx.onerror=()=>{reject(tx.error);db.close();};tx.onabort=()=>{reject(tx.error||new Error('保存被取消'));db.close();};};});}
  let wallpaperToken=0,localObjectUrl=null,localAvailable=false;
  function clearBackground(){document.body.classList.remove('has-wallpaper');$('#wallpaper').style.backgroundImage='none';$('#wallpaper-credit').hidden=true;$('#next-wallpaper').hidden=true;}
  function setBackgroundStatus(text){$('#background-status').textContent=text;}
  function showImage(src,credit,link,token){return new Promise((resolve,reject)=>{const image=new Image();let done=false;const timer=setTimeout(()=>finish(new Error('图片加载超时')),12000);function finish(error){if(done)return;done=true;clearTimeout(timer);image.onload=null;image.onerror=null;if(error){reject(error);return;}if(token!==wallpaperToken){resolve(false);return;}$('#wallpaper').style.backgroundImage='url('+JSON.stringify(src)+')';document.body.classList.add('has-wallpaper');const anchor=$('#wallpaper-credit');anchor.textContent=credit;anchor.hidden=!credit;if(link){anchor.href=link;anchor.removeAttribute('aria-disabled');}else{anchor.removeAttribute('href');anchor.setAttribute('aria-disabled','true');}$('#next-wallpaper').hidden=state.wallpaper.mode!=='scenery';setBackgroundStatus('已应用 · 更改自动保存');resolve(true);}image.onload=()=>finish();image.onerror=()=>finish(new Error('图片无法加载'));image.referrerPolicy='no-referrer';image.src=src;});}
  function chooseScenery(forceNext=false){const pref=state.wallpaper;let last='';try{last=localStorage.getItem(KEY+'-last-photo')||'';}catch{}let chosen=pref.photoId;if(pref.rotation==='daily'&&!forceNext){const day=new Date().toLocaleDateString('en-CA');let sum=0;for(const c of day)sum=(sum*31+c.charCodeAt(0))>>>0;chosen=WALLPAPERS[sum%WALLPAPERS.length].id;}else if(pref.rotation==='visit'||forceNext){const pool=WALLPAPERS.filter(p=>p.id!==(last||pref.photoId));chosen=pool[Math.floor(Math.random()*pool.length)].id;}pref.photoId=chosen;try{localStorage.setItem(KEY+'-last-photo',chosen);}catch{}return WALLPAPERS.find(p=>p.id===chosen)||WALLPAPERS[0];}
  async function applyWallpaper({next=false,reroll=false}={}){
    const token=++wallpaperToken;document.body.style.setProperty('--wallpaper-shade',String(state.wallpaper.shade/100));
    if(localObjectUrl){URL.revokeObjectURL(localObjectUrl);localObjectUrl=null;}
    if(state.wallpaper.mode==='none'){clearBackground();setBackgroundStatus('纯色背景已应用');return;}
    setBackgroundStatus('正在加载背景…');
    try{
      if(state.wallpaper.mode==='scenery'){const photo=next||reroll?chooseScenery(true):WALLPAPERS.find(p=>p.id===state.wallpaper.photoId)||WALLPAPERS[0];save();await showImage(photo.src,photo.name+' · Unsplash',photo.source,token);}
      else if(state.wallpaper.mode==='local'){const blob=await imageStore('get');if(token!==wallpaperToken)return;localAvailable=!!blob;$('#remove-local').hidden=!localAvailable;if(!blob){clearBackground();setBackgroundStatus('请选择一张本地图片');return;}localObjectUrl=URL.createObjectURL(blob);await showImage(localObjectUrl,'本地图片 · 仅保存在此浏览器',null,token);}
      else{if(!state.wallpaper.url){clearBackground();setBackgroundStatus('请填写图片直链');return;}await showImage(state.wallpaper.url,'自定义背景图片',state.wallpaper.url,token);}
      if(token===wallpaperToken)renderWallpaperSelection();
    }catch(error){if(token!==wallpaperToken)return;clearBackground();setBackgroundStatus(error.message+'，可以选择其他图片或上传本地背景。');}
  }
  function renderWallpaperGallery(){const gallery=$('#wallpaper-gallery');if(gallery.children.length)return;for(const photo of WALLPAPERS){const button=node('button','wallpaper-choice'),image=node('img');button.type='button';button.setAttribute('aria-label','使用'+photo.name+'背景');image.src=photo.thumb;image.alt='';image.loading='lazy';button.dataset.photoId=photo.id;button.append(image,node('span','',photo.name));button.addEventListener('click',()=>{state.wallpaper.mode='scenery';state.wallpaper.photoId=photo.id;state.wallpaper.rotation='fixed';save();syncBackgroundControls();applyWallpaper();});gallery.append(button);}renderWallpaperSelection();}
  function renderWallpaperSelection(){document.querySelectorAll('.wallpaper-choice').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.photoId===state.wallpaper.photoId&&state.wallpaper.mode==='scenery')));}
  function syncBackgroundControls(){document.querySelectorAll('[name="background-mode"]').forEach(r=>r.checked=r.value===state.wallpaper.mode);for(const mode of ['scenery','local','url'])$('#'+mode+'-panel').hidden=state.wallpaper.mode!==mode;$('#shade-row').hidden=state.wallpaper.mode==='none';$('#wallpaper-rotation').value=state.wallpaper.rotation;$('#wallpaper-url').value=state.wallpaper.url;$('#wallpaper-shade').value=state.wallpaper.shade;$('#shade-value').textContent=state.wallpaper.shade+'%';$('#remove-local').hidden=!localAvailable;renderWallpaperSelection();}
  document.querySelectorAll('[name="background-mode"]').forEach(r=>r.addEventListener('change',()=>{state.wallpaper.mode=r.value;save();syncBackgroundControls();applyWallpaper({reroll:r.value==='scenery'&&state.wallpaper.rotation==='visit'});}));
  $('#wallpaper-rotation').addEventListener('change',e=>{state.wallpaper.rotation=e.target.value;save();applyWallpaper({reroll:e.target.value!=='fixed'});});
  $('#wallpaper-shade').addEventListener('input',e=>{state.wallpaper.shade=Number(e.target.value);$('#shade-value').textContent=state.wallpaper.shade+'%';document.body.style.setProperty('--wallpaper-shade',String(state.wallpaper.shade/100));});$('#wallpaper-shade').addEventListener('change',save);
  $('#next-wallpaper').addEventListener('click',()=>{state.wallpaper.mode='scenery';applyWallpaper({next:true});});
  $('#wallpaper-url-form').addEventListener('submit',event=>{event.preventDefault();const url=$('#wallpaper-url').value.trim();if(!validImageUrl(url)){setBackgroundStatus('请使用不含账号密码的 HTTPS 图片直链');return;}state.wallpaper.url=url;state.wallpaper.mode='url';save();syncBackgroundControls();applyWallpaper();});
  async function resizeUpload(file){if(!['image/jpeg','image/png','image/webp','image/avif'].includes(file.type))throw new Error('请选择 JPG、PNG、WebP 或 AVIF 图片');if(file.size>20*1024*1024)throw new Error('图片超过 20 MB，请换一张小一些的');const url=URL.createObjectURL(file);try{const image=new Image();image.src=url;await image.decode();const ratio=Math.min(1,2560/image.naturalWidth,1600/image.naturalHeight);const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.naturalWidth*ratio));canvas.height=Math.max(1,Math.round(image.naturalHeight*ratio));const context=canvas.getContext('2d');if(!context)throw new Error('浏览器无法处理这张图片');context.drawImage(image,0,0,canvas.width,canvas.height);return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('图片处理失败')),'image/webp',.88));}finally{URL.revokeObjectURL(url);}}
  $('#wallpaper-upload').addEventListener('change',async event=>{const file=event.target.files[0];if(!file)return;setBackgroundStatus('正在保存图片到当前浏览器…');const modeAtStart=state.wallpaper.mode;try{const blob=await resizeUpload(file);await imageStore('put',blob);localAvailable=true;$('#remove-local').hidden=false;if(state.wallpaper.mode===modeAtStart){state.wallpaper.mode='local';save();syncBackgroundControls();await applyWallpaper();}else setBackgroundStatus('本地图片已保存，可切换到“本地图片”使用');}catch(e){setBackgroundStatus(e.message||'图片保存失败，浏览器存储空间可能不足');}event.target.value='';});
  $('#remove-local').addEventListener('click',async()=>{try{await imageStore('delete');localAvailable=false;state.wallpaper.mode='none';save();syncBackgroundControls();applyWallpaper();toast('本地背景图片已删除');}catch{setBackgroundStatus('图片暂时无法删除，请稍后重试');}});
  document.addEventListener('keydown',e=>{if(e.isComposing||document.querySelector('dialog[open]'))return;const editing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)||document.activeElement.isContentEditable;if(e.key==='/'&&!editing&&!e.ctrlKey&&!e.metaKey&&!e.altKey){e.preventDefault();input.focus();}if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();openMulti();}});
  $('#multi-shortcut').textContent=/Mac|iPhone|iPad/.test(navigator.platform)?'⌘ ↵':'Ctrl ↵';
  const params=new URLSearchParams(location.search),initialQuery=params.get('q'),initialSite=params.get('site');if(initialQuery){input.value=initialQuery.slice(0,500);$('#clear-input').hidden=false;}if(siteById(initialSite))state.selected=initialSite;
  renderPlatforms();renderHistory();renderSiteList();syncBackgroundControls();applyWallpaper({reroll:true});
  imageStore('get').then(blob=>{localAvailable=!!blob;$('#remove-local').hidden=!blob;}).catch(()=>{});
  if(!storageOK)$('#saved-note').textContent='浏览器存储不可用，偏好将在本次会话内生效';
})();
