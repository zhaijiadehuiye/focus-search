'use strict';
(() => {
  const KEY = 'focus-search-v2';
  const BUILTINS = [
    {id:'xhs',name:'小红书',symbol:'红',color:'#ff2442',template:'https://www.xiaohongshu.com/search_result?keyword={query}&source=web_search_result_notes'},
    {id:'zhihu',name:'知乎',symbol:'知',color:'#1772f6',template:'https://www.zhihu.com/search?type=content&q={query}'},
    {id:'google',name:'Google',symbol:'G',color:'#4285f4',template:'https://www.google.com/search?q={query}'},
    {id:'baidu',name:'百度',symbol:'度',color:'#346efd',template:'https://www.baidu.com/s?wd={query}'},
    {id:'bilibili',name:'B站',symbol:'哔',color:'#fb7299',template:'https://search.bilibili.com/all?keyword={query}'},
    {id:'youtube',name:'YouTube',symbol:'▶',color:'#ea4335',template:'https://www.youtube.com/results?search_query={query}'},
    {id:'reddit',name:'Reddit',symbol:'r',color:'#f4501e',template:'https://www.reddit.com/search/?q={query}'},
    {id:'github',name:'GitHub',symbol:'⌘',color:'#70757a',template:'https://github.com/search?q={query}&type=repositories'}
  ];
  const $ = selector => document.querySelector(selector);
  const input = $('#keyword');
  let storageOK = true;
  let stored = {};
  try { stored = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { storageOK = false; }
  function validTemplate(value) {
    if (typeof value !== 'string' || value.length > 2000 || !value.includes('{query}')) return false;
    try { const url = new URL(value.replaceAll('{query}', 'focus-test')); return ['https:','http:'].includes(url.protocol) && !url.username && !url.password && !url.hostname.includes('focus-test'); } catch { return false; }
  }
  const state = {
    selected: typeof stored.selected === 'string' ? stored.selected : 'xhs',
    theme: ['light','dark','system'].includes(stored.theme) ? stored.theme : 'light',
    newTab: stored.newTab !== false,
    remember: stored.remember === true,
    multi: Array.isArray(stored.multi) ? stored.multi.filter(x => typeof x === 'string') : ['xhs','zhihu'],
    custom: Array.isArray(stored.custom) ? stored.custom.filter(x => x && /^custom-[a-z0-9-]+$/.test(x.id) && typeof x.name === 'string' && x.name.trim() && x.name.length <= 20 && validTemplate(x.template)).slice(0,8).map(x=>({...x,symbol:x.name.slice(0,1),color:'#1a73e8'})) : [],
    history: stored.remember === true && Array.isArray(stored.history) ? stored.history.filter(x => typeof x === 'string' && x.length <= 500).slice(0,8) : []
  };
  const sites = () => [...BUILTINS,...state.custom];
  const siteById = id => sites().find(site => site.id === id);
  if (!siteById(state.selected)) state.selected = 'xhs';
  state.multi = state.multi.filter(id => siteById(id));
  function save() { try { localStorage.setItem(KEY,JSON.stringify(state)); storageOK=true; } catch { storageOK=false; toast('当前浏览器无法保存偏好，本次使用不受影响'); } }
  function toast(message) { const el=$('#toast');el.textContent=message;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>{el.hidden=true;},3200); }
  function node(tag,cls,text) { const el=document.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el; }
  function icon(name) { const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#i-'+name);svg.append(use);svg.setAttribute('aria-hidden','true');return svg; }
  function symbol(site) { const el=node('span','site-symbol',site.symbol);el.style.setProperty('--site-color',site.color);el.setAttribute('aria-hidden','true');return el; }
  function makeUrl(site,query) { return site.template.replaceAll('{query}',encodeURIComponent(query)); }
  function applyTheme() { document.body.dataset.theme=state.theme==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):state.theme;document.querySelector('meta[name="theme-color"]').content=document.body.dataset.theme==='dark'?'#202124':'#ffffff'; }
  applyTheme();
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(state.theme==='system')applyTheme();});
  function renderPlatforms() {
    $('#platforms').replaceChildren();
    for(const site of sites()) {
      const label=node('label','platform');const radio=node('input');radio.type='radio';radio.name='platform';radio.value=site.id;radio.checked=site.id===state.selected;
      radio.addEventListener('change',()=>{state.selected=site.id;$('#search-button').textContent='搜索'+site.name;save();});
      label.append(radio,symbol(site),node('span','',site.name));$('#platforms').append(label);
    }
    $('#search-button').textContent='搜索'+siteById(state.selected).name;
  }
  function query() { const q=input.value.trim();if(!q){input.focus();input.reportValidity();return null;}return q; }
  function remember(q) { if(!state.remember)return;state.history=[q,...state.history.filter(item=>item!==q)].slice(0,8);save();renderHistory(); }
  function showResults(q,chosen,multiple=false) {
    $('#results-heading').textContent='“'+q+'”';
    $('#results-note').textContent=multiple?'已请求打开所选平台。如新标签未打开，请点击以下链接。':'已请求打开'+chosen[0].name+'。也可以通过下方链接再次打开。';
    $('#result-links').replaceChildren();
    for(const site of chosen) { const link=node('a','result-link',site.name);link.href=makeUrl(site,q);link.target='_blank';link.rel='noopener noreferrer';link.append(icon('arrow'));$('#result-links').append(link); }
    $('#results').hidden=false;
  }
  function search(chosen,multiple=false) {
    const q=query();if(!q||!chosen.length)return;
    remember(q);showResults(q,chosen,multiple);
    if(multiple||state.newTab) for(const site of chosen) window.open(makeUrl(site,q),'_blank','noopener,noreferrer');
    else window.location.assign(makeUrl(chosen[0],q));
  }
  $('#search-form').addEventListener('submit',event=>{event.preventDefault();search([siteById(state.selected)]);});
  input.addEventListener('input',()=>{$('#clear-input').hidden=!input.value;});
  $('#clear-input').addEventListener('click',()=>{input.value='';$('#clear-input').hidden=true;input.focus();});
  $('#close-results').addEventListener('click',()=>{$('#results').hidden=true;});
  function openDialog(id) { const dialog=$('#'+id);if(!dialog.open)dialog.showModal(); }
  document.querySelectorAll('[data-dialog]').forEach(button=>button.addEventListener('click',()=>openDialog(button.dataset.dialog)));
  document.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();}));
  function updateMultiCount() { const count=$('#multi-platforms').querySelectorAll('input:checked').length;$('#multi-count').textContent='已选择 '+count+' 个平台';$('#run-multi').disabled=count===0; }
  function openMulti() {
    if(!query())return;
    $('#multi-platforms').replaceChildren();
    for(const site of sites()) { const label=node('label','multi-option');const checkbox=node('input');checkbox.type='checkbox';checkbox.value=site.id;checkbox.checked=state.multi.includes(site.id);checkbox.addEventListener('change',updateMultiCount);label.append(checkbox,symbol(site),node('span','',site.name));$('#multi-platforms').append(label); }
    updateMultiCount();openDialog('multi-dialog');
  }
  $('#multi-button').addEventListener('click',openMulti);
  $('#run-multi').addEventListener('click',()=>{state.multi=Array.from($('#multi-platforms').querySelectorAll('input:checked'),checkbox=>checkbox.value);save();$('#multi-dialog').close();search(state.multi.map(siteById),true);});
  $('#theme').value=state.theme;$('#new-tab').checked=state.newTab;$('#remember-history').checked=state.remember;
  $('#theme').addEventListener('change',event=>{state.theme=event.target.value;applyTheme();save();});
  $('#new-tab').addEventListener('change',event=>{state.newTab=event.target.checked;save();});
  $('#remember-history').addEventListener('change',event=>{state.remember=event.target.checked;if(!state.remember)state.history=[];save();renderHistory();});
  function renderHistory() {
    $('#history-section').hidden=!state.remember||!state.history.length;$('#history-items').replaceChildren();
    for(const q of state.history) { const button=node('button','history-item');button.type='button';button.append(icon('clock'),node('span','',q));button.addEventListener('click',()=>{input.value=q;$('#clear-input').hidden=false;input.focus();});$('#history-items').append(button); }
  }
  $('#clear-history').addEventListener('click',()=>{state.history=[];save();renderHistory();toast('搜索记录已清空');});
  function renderCustom() {
    $('#custom-list').replaceChildren();
    for(const site of state.custom) { const row=node('div','custom-item');const remove=node('button','text-btn','移除');remove.type='button';remove.setAttribute('aria-label','移除'+site.name);remove.addEventListener('click',()=>{state.custom=state.custom.filter(item=>item.id!==site.id);state.multi=state.multi.filter(id=>id!==site.id);if(state.selected===site.id)state.selected='xhs';save();renderPlatforms();renderCustom();});row.append(node('span','',site.name),remove);$('#custom-list').append(row); }
  }
  $('#custom-form').addEventListener('submit',event=>{
    event.preventDefault();const name=$('#custom-name').value.trim();const template=$('#custom-url').value.trim();const error=$('#custom-error');
    if(!name){error.textContent='请输入网站名称';return;}
    if(!validTemplate(template)){error.textContent='请输入包含 {query} 的 http 或 https 搜索地址，关键词须放在路径或参数中。';return;}
    if(state.custom.length>=8){error.textContent='最多添加 8 个自定义网站，请先移除一个。';return;}
    state.custom.push({id:'custom-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),name,template,symbol:name.slice(0,1),color:'#1a73e8'});save();renderPlatforms();renderCustom();event.target.reset();error.textContent='';toast('已添加 '+name);
  });
  document.addEventListener('keydown',event=>{
    if(event.isComposing)return;
    if(document.querySelector('dialog[open]'))return;
    const editing=['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)||document.activeElement.isContentEditable;
    if(event.key==='/'&&!editing&&!event.ctrlKey&&!event.metaKey&&!event.altKey){event.preventDefault();input.focus();}
    if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();openMulti();}
  });
  $('#multi-shortcut').textContent=/Mac|iPhone|iPad/.test(navigator.platform)?'⌘ ↵':'Ctrl ↵';
  const params=new URLSearchParams(location.search);const initialQuery=params.get('q');const initialSite=params.get('site');
  if(initialQuery){input.value=initialQuery.slice(0,500);$('#clear-input').hidden=false;}
  if(siteById(initialSite))state.selected=initialSite;
  renderPlatforms();renderHistory();renderCustom();
  if(!storageOK)$('#saved-note').textContent='浏览器存储不可用，偏好将在本次会话内生效';
})();
