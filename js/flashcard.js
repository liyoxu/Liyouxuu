const openFlashcard=document.getElementById('openFlashcard'),flashcardPage=document.getElementById('flashcardPage'),fcBackBtn=document.getElementById('fcBackBtn');
const replyDataView=document.getElementById('replyView'),pokeView=document.getElementById('pokeView'),pinziView=document.getElementById('pinziView');
const fcList=document.getElementById('fcList'),pokeList=document.getElementById('pokeList'),pinziList=document.getElementById('pinziList');
const tabs=document.querySelectorAll('.fc-tab'),replyToolbar=document.getElementById('replyToolbar'),replyFilters=document.getElementById('replyFilters'),pokeToolbar=document.getElementById('pokeToolbar'),pokeFilters=document.getElementById('pokeFilters'),selectModeBtn=document.getElementById('selectModeBtn'),batchActionBar=document.getElementById('batchActionBar'),batchSelectAllBtn=document.getElementById('batchSelectAllBtn'),batchMoveBtn=document.getElementById('batchMoveBtn'),batchBlockBtn=document.getElementById('batchBlockBtn'),batchDeleteBtn=document.getElementById('batchDeleteBtn');

let replyData={};
let pinziData=[];
let pokeData={};
let builtinData=[];
let builtinPokeData=[];
let groupBlocked={'内置字卡':false};
let pokeGroupBlocked={'内置颜文字':false};
let currentPokeGroup='内置颜文字';
let groupContext='reply';
let createGroupContext='reply';
let pokeSearchKeyword='';

function loadBuiltinCards(){const raw=window.BUILTIN_CARDS;let arr=[];if(Array.isArray(raw)){arr=raw;}else if(raw&&typeof raw==='object'){Object.keys(raw).forEach(k=>{if(Array.isArray(raw[k]))arr=arr.concat(raw[k]);});}const seen=new Set(),result=[];arr.forEach(t=>{if(typeof t!=='string')return;const text=t.trim();if(!text||seen.has(text))return;seen.add(text);result.push({text:text,blocked:false});});builtinData=result;}
loadBuiltinCards();

function loadBuiltinPoke(){const raw=window.BUILTIN_POKE;let arr=Array.isArray(raw)?raw:[];const seen=new Set(),result=[];arr.forEach(t=>{if(typeof t!=='string')return;const text=t.trim();if(!text||seen.has(text))return;seen.add(text);result.push({text:text,blocked:false});});builtinPokeData=result;}
loadBuiltinPoke();

function getAllAvailableCards(){let allCards=[];for(let group in replyData){if(!groupBlocked[group]){allCards=allCards.concat(replyData[group].filter(c=>!c.blocked).map(c=>c.text));}}if(!groupBlocked['内置字卡']){allCards=allCards.concat(builtinData.filter(c=>!c.blocked).map(c=>c.text));}return allCards;}
function getAllAvailablePoke(){let allPoke=[];for(let group in pokeData){if(!pokeGroupBlocked[group]){allPoke=allPoke.concat(pokeData[group].filter(c=>!c.blocked).map(c=>c.text));}}if(!pokeGroupBlocked['内置颜文字']){allPoke=allPoke.concat(builtinPokeData.filter(c=>!c.blocked).map(c=>c.text));}return allPoke;}
function generatePinziCard(){let allCards=getAllAvailableCards();if(allCards.length<2)return"没有足够的字卡来拼字~";let idx1=Math.floor(Math.random()*allCards.length),idx2=Math.floor(Math.random()*allCards.length);while(idx1===idx2){idx2=Math.floor(Math.random()*allCards.length);}const str1=allCards[idx1],str2=allCards[idx2];const len1=Math.floor(Math.random()*str1.length),len2=Math.floor(Math.random()*str2.length);const part1=str1.slice(0,Math.max(1,len1)),part2=str2.slice(Math.min(len2,str2.length-1));let newText=part1+"，"+part2;if(newText.length<2)newText="拼不出来了";pinziData.push({text:newText,blocked:false});renderSingleList(pinziData,pinziList);return newText;}

let currentGroup='内置字卡',searchKeyword='',currentTab='reply',currentBatchAction='',isSelectMode=false,selectedIndices=new Set();
const eyeOpenSVG=`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
const eyeClosedSVG=`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

const blockGroupBtn=document.getElementById('blockGroupBtn');
const pokeBlockGroupBtn=document.getElementById('pokeBlockGroupBtn');
function updateGroupActionButtons(){const isAll=currentGroup==='全部';blockGroupBtn.style.display=isAll?'none':'grid';if(!isAll){const isBlocked=!!groupBlocked[currentGroup];blockGroupBtn.innerHTML=isBlocked?eyeClosedSVG:eyeOpenSVG;blockGroupBtn.classList.toggle('active',isBlocked);}}
function updatePokeGroupActionButtons(){const isAll=currentPokeGroup==='全部';pokeBlockGroupBtn.style.display=isAll?'none':'grid';if(!isAll){const isBlocked=!!pokeGroupBlocked[currentPokeGroup];pokeBlockGroupBtn.innerHTML=isBlocked?eyeClosedSVG:eyeOpenSVG;pokeBlockGroupBtn.classList.toggle('active',isBlocked);}}
blockGroupBtn.addEventListener('click',e=>{e.stopPropagation();if(currentGroup==='全部')return;groupBlocked[currentGroup]=!groupBlocked[currentGroup];updateGroupActionButtons();renderReplyList();showToast(groupBlocked[currentGroup]?'已屏蔽整组':'已解除整组屏蔽');});
pokeBlockGroupBtn.addEventListener('click',e=>{e.stopPropagation();if(currentPokeGroup==='全部')return;pokeGroupBlocked[currentPokeGroup]=!pokeGroupBlocked[currentPokeGroup];updatePokeGroupActionButtons();renderPokeList();showToast(pokeGroupBlocked[currentPokeGroup]?'已屏蔽整组':'已解除整组屏蔽');});

function renderGroupList(){const container=document.getElementById('groupListContainer');container.innerHTML='';
const data=groupContext==='reply'?replyData:pokeData;
const current=groupContext==='reply'?currentGroup:currentPokeGroup;
const builtinName=groupContext==='reply'?'内置字卡':'内置颜文字';
const allRow=document.createElement('div');allRow.className='group-row';allRow.dataset.group='全部';allRow.id='allGroupRow';allRow.innerHTML=`<span class="group-name">全部</span><div class="group-row-actions"><div class="group-trash-btn hidden"></div><div class="group-check">✓</div></div>`;if(current==='全部')allRow.classList.add('active');bindGroupRowClick(allRow);container.appendChild(allRow);
const builtinRow=document.createElement('div');builtinRow.className='group-row';builtinRow.dataset.group=builtinName;builtinRow.id='builtinGroupRow';builtinRow.innerHTML=`<span class="group-name">${builtinName}</span><div class="group-row-actions"><div class="group-trash-btn hidden"></div><div class="group-check">✓</div></div>`;if(current===builtinName)builtinRow.classList.add('active');bindGroupRowClick(builtinRow);container.appendChild(builtinRow);
for(let group in data){const row=document.createElement('div');row.className='group-row';row.dataset.group=group;row.innerHTML=`<span class="group-name">${group}</span><div class="group-row-actions"><div class="group-trash-btn" data-group="${group}"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></div><div class="group-check">✓</div></div>`;if(current===group)row.classList.add('active');const trash=row.querySelector('.group-trash-btn');trash.addEventListener('click',e=>{e.stopPropagation();deleteGroup(group);});bindGroupRowClick(row);container.appendChild(row);}
const addRow=document.createElement('div');addRow.className='group-row add-new';addRow.innerHTML='<span>+ 新建分组</span>';addRow.addEventListener('click',()=>{if(isSelectMode)return;isRenaming=false;createGroupContext=groupContext;createGroupTitle.textContent='新建分组';newGroupInput.value='';createGroupModal.classList.add('active');setTimeout(()=>newGroupInput.focus(),200);});container.appendChild(addRow);}

function deleteGroup(group){if(group==='全部'||group==='内置字卡'||group==='内置颜文字')return;const data=groupContext==='reply'?replyData:pokeData;const blockedMap=groupContext==='reply'?groupBlocked:pokeGroupBlocked;if(!data[group])return;if(!confirm(`确定删除分组「${group}」及其中所有内容吗？`))return;delete data[group];delete blockedMap[group];if(groupContext==='reply'){if(currentGroup===group){const keys=Object.keys(replyData);currentGroup=keys[0]||'内置字卡';document.getElementById('currentGroupName').textContent=currentGroup;batchGroupName.textContent=`添加到：${currentGroup}`;}}else{if(currentPokeGroup===group){const keys=Object.keys(pokeData);currentPokeGroup=keys[0]||'内置颜文字';document.getElementById('currentPokeGroupName').textContent=currentPokeGroup;}}renderGroupList();if(groupContext==='reply'){updateGroupActionButtons();renderReplyList();}else{updatePokeGroupActionButtons();renderPokeList();}groupModal.classList.remove('active');showToast(`已删除分组「${group}」`);}

function renderReplyList(){fcList.innerHTML='';let displayData=[];
if(currentGroup==='全部'){const map=new Map();for(let g in replyData){const gBlocked=!!groupBlocked[g];replyData[g].forEach(card=>{const blocked=card.blocked||gBlocked;if(!map.has(card.text)||(map.get(card.text).blocked&&!blocked)){map.set(card.text,{...card,blocked,isAll:true});}});}const bBlocked=!!groupBlocked['内置字卡'];builtinData.forEach(card=>{const blocked=card.blocked||bBlocked;if(!map.has(card.text)||(map.get(card.text).blocked&&!blocked)){map.set(card.text,{...card,blocked,isAll:true});}});displayData=Array.from(map.values());}
else if(currentGroup==='内置字卡'){const bBlocked=!!groupBlocked['内置字卡'];displayData=builtinData.map((card,idx)=>({...card,originalIndex:idx,blocked:card.blocked||bBlocked}));}
else{const gBlocked=!!groupBlocked[currentGroup];displayData=(replyData[currentGroup]||[]).map((card,idx)=>({...card,originalIndex:idx,blocked:card.blocked||gBlocked}));}
if(searchKeyword.trim()!==''){const kw=searchKeyword.trim().toLowerCase();displayData=displayData.filter(item=>item.text.toLowerCase().includes(kw));}
if(displayData.length===0){const empty=document.createElement('div');empty.style.cssText='text-align:center;color:#8e8e93;font-size:14px;padding:40px 0;';empty.textContent=currentGroup==='内置字卡'?'暂无内置字卡，请在 data/builtin-cards.js 中添加':'暂无字卡';fcList.appendChild(empty);return;}
displayData.forEach((item,index)=>{const newItem=document.createElement('div');newItem.className='fc-item';if(isSelectMode)newItem.classList.add('selecting');if(item.blocked)newItem.classList.add('blocked');if(isSelectMode&&selectedIndices.has(item.originalIndex)){newItem.classList.add('selected');}let html='';if(isSelectMode)html+=`<div class="select-circle"></div>`;html+=`<div class="fc-index">${index+1}</div><div class="fc-text">${item.text}</div>`;if(!isSelectMode&&currentGroup!=='全部'){html+=`<div class="eye-btn ${item.blocked?'blocked':''}" data-idx="${item.originalIndex}">${item.blocked?eyeClosedSVG:eyeOpenSVG}</div>`;}newItem.innerHTML=html;newItem.addEventListener('click',e=>{if(e.target.closest('.eye-btn')){const idx=parseInt(e.target.closest('.eye-btn').dataset.idx);if(groupBlocked[currentGroup]){showToast('请先解除整组屏蔽');return;}if(currentGroup==='内置字卡'){builtinData[idx].blocked=!builtinData[idx].blocked;}else{replyData[currentGroup][idx].blocked=!replyData[currentGroup][idx].blocked;}renderReplyList();return;}if(isSelectMode&&currentGroup!=='全部'&&currentGroup!=='内置字卡'){if(selectedIndices.has(item.originalIndex))selectedIndices.delete(item.originalIndex);else selectedIndices.add(item.originalIndex);renderAllViews();updateBatchActionBar();}});fcList.appendChild(newItem);});}

function getPokeListForGroup(group){if(group==='全部'){const map=new Map();for(let g in pokeData){const gBlocked=!!pokeGroupBlocked[g];pokeData[g].forEach(card=>{const blocked=card.blocked||gBlocked;if(!map.has(card.text)||(map.get(card.text).blocked&&!blocked)){map.set(card.text,{...card,blocked,isAll:true});}});}const bBlocked=!!pokeGroupBlocked['内置颜文字'];builtinPokeData.forEach(card=>{const blocked=card.blocked||bBlocked;if(!map.has(card.text)||(map.get(card.text).blocked&&!blocked)){map.set(card.text,{...card,blocked,isAll:true});}});return Array.from(map.values());}if(group==='内置颜文字'){const bBlocked=!!pokeGroupBlocked['内置颜文字'];return builtinPokeData.map((card,idx)=>({...card,originalIndex:idx,blocked:card.blocked||bBlocked}));}const gBlocked=!!pokeGroupBlocked[group];return (pokeData[group]||[]).map((card,idx)=>({...card,originalIndex:idx,blocked:card.blocked||gBlocked}));}

function renderPokeList(){pokeList.innerHTML='';let displayData=getPokeListForGroup(currentPokeGroup);
if(pokeSearchKeyword.trim()!==''){const kw=pokeSearchKeyword.trim().toLowerCase();displayData=displayData.filter(item=>item.text.toLowerCase().includes(kw));}
if(displayData.length===0){const empty=document.createElement('div');empty.style.cssText='text-align:center;color:#8e8e93;font-size:14px;padding:40px 0;';empty.textContent=currentPokeGroup==='内置颜文字'?'暂无内置颜文字，请在 data/builtin-poke.js 中添加':'暂无颜文字';pokeList.appendChild(empty);return;}
displayData.forEach((item,index)=>{const newItem=document.createElement('div');newItem.className='fc-item';if(isSelectMode)newItem.classList.add('selecting');if(item.blocked)newItem.classList.add('blocked');if(isSelectMode&&selectedIndices.has(item.originalIndex)){newItem.classList.add('selected');}let html='';if(isSelectMode)html+=`<div class="select-circle"></div>`;html+=`<div class="fc-index">${index+1}</div><div class="fc-text">${item.text}</div>`;if(!isSelectMode&&currentPokeGroup!=='全部'){html+=`<div class="eye-btn ${item.blocked?'blocked':''}" data-idx="${item.originalIndex}">${item.blocked?eyeClosedSVG:eyeOpenSVG}</div>`;}newItem.innerHTML=html;newItem.addEventListener('click',e=>{if(e.target.closest('.eye-btn')){const idx=parseInt(e.target.closest('.eye-btn').dataset.idx);if(pokeGroupBlocked[currentPokeGroup]){showToast('请先解除整组屏蔽');return;}if(currentPokeGroup==='内置颜文字'){builtinPokeData[idx].blocked=!builtinPokeData[idx].blocked;}else{pokeData[currentPokeGroup][idx].blocked=!pokeData[currentPokeGroup][idx].blocked;}renderPokeList();return;}if(isSelectMode&&currentPokeGroup!=='全部'&&currentPokeGroup!=='内置颜文字'){if(selectedIndices.has(item.originalIndex))selectedIndices.delete(item.originalIndex);else selectedIndices.add(item.originalIndex);renderAllViews();updateBatchActionBar();}});pokeList.appendChild(newItem);});}

function renderSingleList(dataArray,container){container.innerHTML='';dataArray.forEach((item,index)=>{const newItem=document.createElement('div');newItem.className='fc-item';if(isSelectMode)newItem.classList.add('selecting');if(item.blocked)newItem.classList.add('blocked');if(isSelectMode&&selectedIndices.has(index)){newItem.classList.add('selected');}let html='';if(isSelectMode)html+=`<div class="select-circle"></div>`;html+=`<div class="fc-index">${index+1}</div><div class="fc-text">${item.text}</div>`;if(!isSelectMode){html+=`<div class="eye-btn ${item.blocked?'blocked':''}" data-idx="${index}">${item.blocked?eyeClosedSVG:eyeOpenSVG}</div>`;}newItem.innerHTML=html;newItem.addEventListener('click',e=>{if(e.target.closest('.eye-btn')){const idx=parseInt(e.target.closest('.eye-btn').dataset.idx);dataArray[idx].blocked=!dataArray[idx].blocked;renderAllViews();return;}if(isSelectMode){if(selectedIndices.has(index))selectedIndices.delete(index);else selectedIndices.add(index);renderAllViews();updateBatchActionBar();}});container.appendChild(newItem);});}

function renderAllViews(){renderReplyList();renderPokeList();renderSingleList(pinziData,pinziList);updateGroupActionButtons();updatePokeGroupActionButtons();}

tabs.forEach(tab=>{tab.addEventListener('click',function(){if(isSelectMode)return;tabs.forEach(t=>t.classList.remove('active'));this.classList.add('active');currentTab=this.dataset.tab;replyDataView.style.display='none';pokeView.style.display='none';pinziView.style.display='none';if(currentTab==='reply')replyDataView.style.display='block';else if(currentTab==='poke')pokeView.style.display='block';else if(currentTab==='pinzi')pinziView.style.display='block';});});
openFlashcard.addEventListener('click',()=>{settingsPage.classList.add('page-hidden');flashcardPage.classList.remove('page-hidden');renderGroupList();updateGroupActionButtons();updatePokeGroupActionButtons();renderAllViews();});
fcBackBtn.addEventListener('click',()=>{if(isSelectMode){exitSelectMode();return;}flashcardPage.classList.add('page-hidden');settingsPage.classList.remove('page-hidden');});

document.getElementById('dedupBtn').addEventListener('click',()=>{
  let dupCount=0;
  const seen=new Set();
  builtinData.forEach(card=>{ if(!seen.has(card.text)) seen.add(card.text); });
  for(let group in replyData){
    replyData[group]=replyData[group].filter(card=>{
      if(seen.has(card.text)){ dupCount++; return false; }
      seen.add(card.text);
      return true;
    });
  }
  renderReplyList();
  showToast(dupCount>0?`已删除了 ${dupCount} 条重复字卡`:`没有发现重复字卡`);
});

document.getElementById('pokeDedupBtn').addEventListener('click',()=>{
  let dupCount=0;
  const seen=new Set();
  builtinPokeData.forEach(card=>{ if(!seen.has(card.text)) seen.add(card.text); });
  for(let group in pokeData){
    pokeData[group]=pokeData[group].filter(card=>{
      if(seen.has(card.text)){ dupCount++; return false; }
      seen.add(card.text);
      return true;
    });
  }
  renderPokeList();
  showToast(dupCount>0?`已删除了 ${dupCount} 条重复颜文字`:`没有发现重复颜文字`);
});

const searchBtn=document.getElementById('searchBtn'),searchContainer=document.getElementById('searchContainer'),searchInput=document.getElementById('searchInput');searchBtn.addEventListener('click',()=>{searchContainer.style.display='block';const allRow=document.getElementById('allGroupRow');if(allRow)allRow.click();setTimeout(()=>{searchInput.focus();},100);});searchInput.addEventListener('input',e=>{searchKeyword=e.target.value;renderReplyList();});

const pokeSearchBtn=document.getElementById('pokeSearchBtn'),pokeSearchContainer=document.getElementById('pokeSearchContainer'),pokeSearchInput=document.getElementById('pokeSearchInput');
pokeSearchBtn.addEventListener('click',()=>{const isOpen=pokeSearchContainer.style.display==='block';pokeSearchContainer.style.display=isOpen?'none':'block';if(!isOpen)setTimeout(()=>pokeSearchInput.focus(),100);});
pokeSearchInput.addEventListener('input',e=>{pokeSearchKeyword=e.target.value;renderPokeList();});

document.getElementById('pokeImportBtn').addEventListener('click',()=>showToast('导入功能开发中'));
document.getElementById('pokeExportBtn').addEventListener('click',()=>showToast('导出功能开发中'));

const renameGroupBtn=document.getElementById('renameGroupBtn'),createGroupModal=document.getElementById('createGroupModal'),createGroupTitle=document.getElementById('createGroupTitle'),newGroupInput=document.getElementById('newGroupInput'),createGroupCancelBtn=document.getElementById('createGroupCancelBtn'),createGroupConfirmBtn=document.getElementById('createGroupConfirmBtn');let isRenaming=false;
renameGroupBtn.addEventListener('click',()=>{if(currentGroup==='全部'){showToast('“全部”分组不可重命名');return;}if(currentGroup==='内置字卡'){showToast('内置分组不可重命名');return;}isRenaming=true;createGroupContext='reply';createGroupTitle.textContent='重命名分组';newGroupInput.value=currentGroup;createGroupModal.classList.add('active');setTimeout(()=>newGroupInput.focus(),100);});
document.getElementById('renamePokeGroupBtn').addEventListener('click',()=>{if(currentPokeGroup==='全部'){showToast('“全部”分组不可重命名');return;}if(currentPokeGroup==='内置颜文字'){showToast('内置分组不可重命名');return;}isRenaming=true;createGroupContext='poke';createGroupTitle.textContent='重命名分组';newGroupInput.value=currentPokeGroup;createGroupModal.classList.add('active');setTimeout(()=>newGroupInput.focus(),100);});
createGroupCancelBtn.addEventListener('click',()=>{createGroupModal.classList.remove('active');newGroupInput.value='';});createGroupModal.addEventListener('click',e=>{if(e.target===createGroupModal){createGroupModal.classList.remove('active');newGroupInput.value='';}});
createGroupConfirmBtn.addEventListener('click',()=>{const name=newGroupInput.value.trim();const data=createGroupContext==='reply'?replyData:pokeData;const blockedMap=createGroupContext==='reply'?groupBlocked:pokeGroupBlocked;const builtinName=createGroupContext==='reply'?'内置字卡':'内置颜文字';if(name&&name!=='全部'&&name!==builtinName&&name!=='内置字卡'&&name!=='内置颜文字'){if(isRenaming){const oldName=createGroupContext==='reply'?currentGroup:currentPokeGroup;if(name!==oldName){data[name]=data[oldName];delete data[oldName];blockedMap[name]=blockedMap[oldName]||false;delete blockedMap[oldName];if(createGroupContext==='reply'){currentGroup=name;document.getElementById('currentGroupName').textContent=name;batchGroupName.textContent=`添加到：${name}`;}else{currentPokeGroup=name;document.getElementById('currentPokeGroupName').textContent=name;}showToast('重命名成功');}}else{if(data[name]){showToast('分组已存在');return;}data[name]=[];blockedMap[name]=false;if(createGroupContext==='reply'){currentGroup=name;document.getElementById('currentGroupName').textContent=name;batchGroupName.textContent=`添加到：${name}`;}else{currentPokeGroup=name;document.getElementById('currentPokeGroupName').textContent=name;}showToast('分组已创建');}renderGroupList();if(createGroupContext==='reply'){updateGroupActionButtons();renderReplyList();}else{updatePokeGroupActionButtons();renderPokeList();}createGroupModal.classList.remove('active');newGroupInput.value='';}else if(name==='全部'||name===builtinName||name==='内置字卡'||name==='内置颜文字'){showToast('该名称为系统保留名称');}});

const openGroupModal=document.getElementById('openGroupModal'),groupModal=document.getElementById('groupModal'),groupCancelBtn=document.getElementById('groupCancelBtn'),groupListContainer=document.getElementById('groupListContainer'),currentGroupName=document.getElementById('currentGroupName'),batchGroupName=document.getElementById('batchGroupName'),groupModalTitle=document.getElementById('groupModalTitle');let isMovingCards=false;
openGroupModal.addEventListener('click',()=>{if(isSelectMode)return;isMovingCards=false;groupContext='reply';groupModalTitle.textContent='选择分组';renderGroupList();groupModal.classList.add('active');});
document.getElementById('openPokeGroupModal').addEventListener('click',()=>{if(isSelectMode)return;isMovingCards=false;groupContext='poke';groupModalTitle.textContent='选择颜文字分组';renderGroupList();groupModal.classList.add('active');});
batchMoveBtn.addEventListener('click',()=>{if(selectedIndices.size===0)return;if(currentTab!=='reply')return;isMovingCards=true;groupContext='reply';groupModalTitle.textContent=`移动 ${selectedIndices.size} 张字卡到...`;renderGroupList();groupModal.classList.add('active');});
groupCancelBtn.addEventListener('click',()=>groupModal.classList.remove('active'));groupModal.addEventListener('click',e=>{if(e.target===groupModal)groupModal.classList.remove('active');});
function bindGroupRowClick(rowElement){rowElement.addEventListener('click',function(){const targetGroup=this.dataset.group;if(groupContext==='reply'){if(isMovingCards){if(targetGroup==='全部'){showToast('不能移动到“全部”');return;}if(targetGroup==='内置字卡'){showToast('不能移动到内置分组');return;}const cardsToMove=Array.from(selectedIndices).map(idx=>replyData[currentGroup][idx]);const sortedIndices=Array.from(selectedIndices).sort((a,b)=>b-a);sortedIndices.forEach(idx=>replyData[currentGroup].splice(idx,1));if(!replyData[targetGroup])replyData[targetGroup]=[];cardsToMove.forEach(card=>{if(!replyData[targetGroup].some(c=>c.text===card.text)){replyData[targetGroup].push(card);}});showToast(`已移动 ${cardsToMove.length} 张字卡`);exitSelectMode();groupModal.classList.remove('active');return;}currentGroup=targetGroup;currentGroupName.textContent=currentGroup;batchGroupName.textContent=`添加到：${currentGroup}`;searchKeyword='';searchInput.value='';updateGroupActionButtons();renderReplyList();}else{currentPokeGroup=targetGroup;document.getElementById('currentPokeGroupName').textContent=currentPokeGroup;updatePokeGroupActionButtons();renderPokeList();}renderGroupList();groupModal.classList.remove('active');});}

function enterSelectMode(){if(currentTab==='reply'){if(currentGroup==='全部'){showToast('请在具体分组内进行批量操作');return;}if(currentGroup==='内置字卡'){showToast('内置字卡请使用整组屏蔽按钮');return;}}else if(currentTab==='poke'){if(currentPokeGroup==='全部'){showToast('请在具体分组内进行批量操作');return;}if(currentPokeGroup==='内置颜文字'){showToast('内置颜文字请使用整组屏蔽按钮');return;}}isSelectMode=true;selectedIndices.clear();selectModeBtn.textContent='取消';selectModeBtn.style.color='#333';replyToolbar.classList.add('disabled');replyFilters.classList.add('disabled');pokeToolbar.classList.add('disabled');if(pokeFilters)pokeFilters.classList.add('disabled');if(currentTab==='reply'){batchMoveBtn.style.display='block';}else{batchMoveBtn.style.display='none';}batchActionBar.classList.add('show');updateBatchActionBar();renderAllViews();}
function exitSelectMode(){isSelectMode=false;selectedIndices.clear();selectModeBtn.textContent='选择';selectModeBtn.style.color='var(--im-blue)';replyToolbar.classList.remove('disabled');replyFilters.classList.remove('disabled');pokeToolbar.classList.remove('disabled');if(pokeFilters)pokeFilters.classList.remove('disabled');batchActionBar.classList.remove('show');renderAllViews();}
selectModeBtn.addEventListener('click',()=>{if(isSelectMode)exitSelectMode();else enterSelectMode();});
function updateBatchActionBar(){const count=selectedIndices.size;if(count>0){batchMoveBtn.style.pointerEvents='auto';batchMoveBtn.style.color='#333';batchBlockBtn.style.pointerEvents='auto';batchBlockBtn.style.color='#333';batchDeleteBtn.style.pointerEvents='auto';batchDeleteBtn.style.color='var(--im-red)';}else{batchMoveBtn.style.pointerEvents='none';batchMoveBtn.style.color='#c7c7cc';batchBlockBtn.style.pointerEvents='none';batchBlockBtn.style.color='#c7c7cc';batchDeleteBtn.style.pointerEvents='none';batchDeleteBtn.style.color='#c7c7cc';}}
batchSelectAllBtn.addEventListener('click',()=>{let currentList=[];if(currentTab==='reply')currentList=replyData[currentGroup]||[];else if(currentTab==='poke')currentList=pokeData[currentPokeGroup]||[];else if(currentTab==='pinzi')currentList=pinziData;if(selectedIndices.size===currentList.length){selectedIndices.clear();}else{selectedIndices.clear();currentList.forEach((_,idx)=>selectedIndices.add(idx));}renderAllViews();updateBatchActionBar();});
batchBlockBtn.addEventListener('click',()=>{if(selectedIndices.size===0)return;if(currentTab==='reply'){selectedIndices.forEach(idx=>{replyData[currentGroup][idx].blocked=true;});}else if(currentTab==='poke'){selectedIndices.forEach(idx=>{pokeData[currentPokeGroup][idx].blocked=true;});}else if(currentTab==='pinzi'){selectedIndices.forEach(idx=>{pinziData[idx].blocked=true;});}showToast(`已屏蔽 ${selectedIndices.size} 条`);exitSelectMode();});
batchDeleteBtn.addEventListener('click',()=>{if(selectedIndices.size===0)return;const sortedIndices=Array.from(selectedIndices).sort((a,b)=>b-a);if(currentTab==='reply'){sortedIndices.forEach(idx=>replyData[currentGroup].splice(idx,1));}else if(currentTab==='poke'){sortedIndices.forEach(idx=>pokeData[currentPokeGroup].splice(idx,1));}else if(currentTab==='pinzi'){sortedIndices.forEach(idx=>pinziData.splice(idx,1));}showToast(`已删除 ${selectedIndices.size} 条`);exitSelectMode();});

const openBatchAddBtn=document.getElementById('openBatchAddBtn'),openPokeBatchAddBtn=document.getElementById('openPokeBatchAddBtn'),batchAddModal=document.getElementById('batchAddModal'),batchModalTitle=document.getElementById('batchModalTitle'),batchSelectGroupBtn=document.getElementById('batchSelectGroupBtn'),batchCancelBtn=document.getElementById('batchCancelBtn'),batchConfirmBtn=document.getElementById('batchConfirmBtn'),batchInput=document.getElementById('batchInput'),batchCountHint=document.getElementById('batchCountHint');
function openBatchModal(actionType){currentBatchAction=actionType;batchAddModal.classList.add('active');batchInput.value='';updateHint();if(actionType==='reply'){batchModalTitle.textContent='批量添加字卡回复';batchSelectGroupBtn.style.display='flex';batchGroupName.textContent=`添加到：${currentGroup}`;}else if(actionType==='poke'){batchModalTitle.textContent='批量添加颜文字';batchSelectGroupBtn.style.display='flex';batchGroupName.textContent=`添加到：${currentPokeGroup}`;}}
openBatchAddBtn.addEventListener('click',()=>{if(currentGroup==='全部'){showToast('请在具体分组内添加');return;}if(currentGroup==='内置字卡'){showToast('内置分组不可添加');return;}openBatchModal('reply');});
openPokeBatchAddBtn.addEventListener('click',()=>{if(currentPokeGroup==='全部'){showToast('请在具体分组内添加');return;}if(currentPokeGroup==='内置颜文字'){showToast('内置分组不可添加');return;}openBatchModal('poke');});
batchCancelBtn.addEventListener('click',()=>{batchAddModal.classList.remove('active');batchInput.value='';});batchAddModal.addEventListener('click',e=>{if(e.target===batchAddModal){batchAddModal.classList.remove('active');batchInput.value='';}});
batchSelectGroupBtn.addEventListener('click',()=>{batchAddModal.classList.remove('active');isMovingCards=false;groupContext=currentBatchAction==='reply'?'reply':'poke';groupModalTitle.textContent=groupContext==='reply'?'选择分组':'选择颜文字分组';renderGroupList();groupModal.classList.add('active');});
batchInput.addEventListener('input',updateHint);function updateHint(){const lines=batchInput.value.split('\n').map(line=>line.trim()).filter(line=>line!=='');batchCountHint.textContent=`准备添加 ${lines.length} 条内容`;}
batchConfirmBtn.addEventListener('click',()=>{const lines=batchInput.value.split('\n').map(line=>line.trim()).filter(line=>line!=='');if(lines.length===0){showToast('请先输入内容哦！');return;}const uniqueInputLines=[...new Set(lines)];const dupInBatch=lines.length-uniqueInputLines.length;let targetArray=[];if(currentBatchAction==='reply')targetArray=replyData[currentGroup]||[];else if(currentBatchAction==='poke')targetArray=pokeData[currentPokeGroup]||[];let addedCount=0,dupInExisting=0;uniqueInputLines.forEach(text=>{if(!targetArray.some(c=>c.text===text)){targetArray.push({text:text,blocked:false});addedCount++;}else{dupInExisting++;}});if(currentBatchAction==='reply')replyData[currentGroup]=targetArray;else if(currentBatchAction==='poke')pokeData[currentPokeGroup]=targetArray;const totalDup=dupInBatch+dupInExisting;batchInput.value='';batchAddModal.classList.remove('active');renderAllViews();if(totalDup>0)showToast(`去重 ${totalDup} 条，成功添加 ${addedCount} 条`);else showToast(`成功添加 ${addedCount} 条`);});

// 导入
const importBtn = document.getElementById('importBtn');
const importModal = document.getElementById('importModal');
const importGroupSelect = document.getElementById('importGroupSelect');
const importFileInput = document.getElementById('importFileInput');
const importFileName = document.getElementById('importFileName');
const importCancelBtn = document.getElementById('importCancelBtn');
const importConfirmBtn = document.getElementById('importConfirmBtn');
let pendingImportData = null;

if (importBtn) {
  importBtn.addEventListener('click', () => {
    importGroupSelect.innerHTML = '';
    if (currentGroup !== '全部') {
      const opt = document.createElement('option');
      opt.value = currentGroup;
      opt.textContent = currentGroup;
      importGroupSelect.appendChild(opt);
    }
    for (let group in replyData) {
      if (group !== currentGroup) {
        const opt = document.createElement('option');
        opt.value = group;
        opt.textContent = group;
        importGroupSelect.appendChild(opt);
      }
    }
    importFileInput.value = '';
    importFileName.textContent = '点击选择 JSON 文件';
    importFileName.style.color = 'var(--im-text-soft)';
    pendingImportData = null;
    importModal.classList.add('active');
  });
}

if (importFileInput) {
  importFileInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    importFileName.textContent = file.name;
    importFileName.style.color = 'var(--im-text-dark)';
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const json = JSON.parse(event.target.result);
        if (!Array.isArray(json)) { showToast('JSON格式错误：必须是数组格式'); pendingImportData = null; return; }
        const parsedCards = [];
        json.forEach(item => {
          if (typeof item === 'string') { if (item.trim()) parsedCards.push(item.trim()); }
          else if (item && typeof item.text === 'string') { if (item.text.trim()) parsedCards.push(item.text.trim()); }
        });
        pendingImportData = parsedCards;
        showToast(`解析成功，共 ${parsedCards.length} 条数据`);
      } catch (err) {
        showToast('读取失败：文件不是有效的 JSON 格式');
        pendingImportData = null;
        importFileName.textContent = '点击选择 JSON 文件';
        importFileName.style.color = 'var(--im-text-soft)';
      }
    };
    reader.readAsText(file);
  });
}

if (importCancelBtn) { importCancelBtn.addEventListener('click', () => { importModal.classList.remove('active'); }); }

if (importConfirmBtn) {
  importConfirmBtn.addEventListener('click', () => {
    if (!pendingImportData || pendingImportData.length === 0) { showToast('请先选择包含有效数据的 JSON 文件'); return; }
    const targetGroup = importGroupSelect.value;
    if (!targetGroup || targetGroup === '全部' || targetGroup === '内置字卡') { showToast('请选择一个有效的自定义分组'); return; }
    if (!replyData[targetGroup]) replyData[targetGroup] = [];
    let addedCount = 0, dupCount = 0;
    pendingImportData.forEach(text => {
      if (!replyData[targetGroup].some(c => c.text === text)) { replyData[targetGroup].push({ text: text, blocked: false }); addedCount++; }
      else { dupCount++; }
    });
    currentGroup = targetGroup;
    document.getElementById('currentGroupName').textContent = currentGroup;
    batchGroupName.textContent = `添加到：${currentGroup}`;
    renderGroupList(); updateGroupActionButtons(); renderReplyList();
    importModal.classList.remove('active');
    showToast(`导入完成：新增 ${addedCount} 条，跳过重复 ${dupCount} 条`);
  });
}

// 导出
const exportBtn = document.getElementById('exportBtn');
const exportModal = document.getElementById('exportModal');
const exportGroupSelectWrap = document.getElementById('exportGroupSelectWrap');
const exportGroupSelect = document.getElementById('exportGroupSelect');
const exportCancelBtn = document.getElementById('exportCancelBtn');
const exportConfirmBtn = document.getElementById('exportConfirmBtn');
const exportRadios = document.querySelectorAll('input[name="exportType"]');

if (exportRadios) {
  exportRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'group') exportGroupSelectWrap.style.display = 'flex';
      else exportGroupSelectWrap.style.display = 'none';
    });
  });
}

if (exportBtn) {
  exportBtn.addEventListener('click', () => {
    document.querySelector('input[name="exportType"][value="all"]').checked = true;
    exportGroupSelectWrap.style.display = 'none';
    exportGroupSelect.innerHTML = '';
    for (let group in replyData) {
      const opt = document.createElement('option');
      opt.value = group; opt.textContent = group; exportGroupSelect.appendChild(opt);
    }
    exportModal.classList.add('active');
  });
}

if (exportCancelBtn) { exportCancelBtn.addEventListener('click', () => { exportModal.classList.remove('active'); }); }

if (exportConfirmBtn) {
  exportConfirmBtn.addEventListener('click', () => {
    const selectedType = document.querySelector('input[name="exportType"]:checked').value;
    let cardsToExport = [];
    if (selectedType === 'all') {
      builtinData.forEach(card => cardsToExport.push(card.text));
      for (let group in replyData) { replyData[group].forEach(card => cardsToExport.push(card.text)); }
    } else {
      const targetGroup = exportGroupSelect.value;
      if (targetGroup && replyData[targetGroup]) { replyData[targetGroup].forEach(card => cardsToExport.push(card.text)); }
    }
    cardsToExport = [...new Set(cardsToExport)];
    if (cardsToExport.length === 0) { showToast('没有可以导出的字卡'); return; }
    const jsonString = JSON.stringify(cardsToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const fileName = selectedType === 'all' ? '字卡库_全部.json' : `字卡库_${exportGroupSelect.value}.json`;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    exportModal.classList.remove('active');
    showToast(`成功导出 ${cardsToExport.length} 条字卡`);
  });
}