let waitReplyTimer=null;
let quotedMsgData = null;

function createTapbackElement() {
  if (!tapbackEnabled || Math.random() * 100 >= tapbackChance) return null;
  const stickers = ['❗️', '❓', '❤️'];
  const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
  const tapback = document.createElement('div');
  tapback.className = 'msg-tapback';
  tapback.innerHTML = `<span class="tb-text">${randomSticker}</span><span class="tb-dots">••</span>`;
  tapback.onclick = function(e) {
    e.stopPropagation();
    this.classList.toggle('collapsed');
  };
  return tapback;
}

function initChat(){
  lastMsgTimestamp=Date.now()-3600000;
  insertTimeDivider(new Date(lastMsgTimestamp));
  const initialMsgs=[
    {text:"新年有什么愿望吗",type:"me"},
    {text:"想见你",type:"other"},
    {text:"换一个",type:"me"},
    {text:"……没有了",type:"other"},
    {text:"三分钟之后就实现啦",type:"me"},
    {text:"所以叫你换一个",type:"me"},
    {text:"和你在一起 永远 一直",type:"other"},
    {text:"可以吗",type:"other"}
  ];
  let prevType="",lastMsgText="";
  initialMsgs.forEach((msgData,index)=>{
    const el=document.createElement('div');
    el.className='msg '+msgData.type;
    if(msgData.type===prevType){
      el.classList.add('same-sender');
      const allMsgs=chatBox.querySelectorAll('.msg');
      const prevMsg=allMsgs.length>0?allMsgs[allMsgs.length-1]:null;
      if(prevMsg)prevMsg.classList.add('hide-tail');
    }else{prevType=msgData.type;}
    
    el.textContent=msgData.text;
    
    chatBox.appendChild(el);
    if(msgData.type==='me'){
      const status=document.createElement('div');
      status.className='msg-status';
      if(el.classList.contains('same-sender'))status.classList.add('same-sender');
      status.style.display='none';
      chatBox.appendChild(status);
    }
    if(index===initialMsgs.length-1){lastMsgText=msgData.text;}
  });
  document.getElementById('listPreviewText').textContent=lastMsgText;
  scrollToBottom();
}

function sendMessage(){
  const text=input.value.trim();
  if(!text)return;
  playSound('send');
  
  const currentTyping=document.getElementById('typing');
  const timeInserted=checkTimeline();
  const myMsg=document.createElement('div');
  myMsg.className='msg me';
  
  if (quotedMsgData) {
    myMsg.classList.add('has-quote');
    const quoteBubble = document.createElement('div');
    quoteBubble.className = `msg ${quotedMsgData.type} quote-bubble`; 
    quoteBubble.textContent = quotedMsgData.text;
    
    if (quotedMsgData.type === 'me' && chatBox.lastElementChild && chatBox.lastElementChild.classList.contains('me')) {
       quoteBubble.classList.add('same-sender');
    }
    
    if(currentTyping){ chatBox.insertBefore(quoteBubble, currentTyping); }
    else{ chatBox.appendChild(quoteBubble); }
  }

  let prevMsg=null;
  if(currentTyping){prevMsg=currentTyping.previousElementSibling;while(prevMsg&&!prevMsg.classList.contains('msg')){prevMsg=prevMsg.previousElementSibling;}}
  else{const allMsgs=chatBox.querySelectorAll('.msg');prevMsg=allMsgs.length>0?allMsgs[allMsgs.length-1]:null;}
  
  if(!timeInserted&&prevMsg&&prevMsg.classList.contains('me')&&!quotedMsgData){ 
    myMsg.classList.add('same-sender');
    prevMsg.classList.add('hide-tail');
  }
  
  myMsg.textContent=text;
  
  const myTapback = createTapbackElement();
  if(myTapback) myMsg.appendChild(myTapback);

  const status=document.createElement('div');
  status.className='msg-status';
  if(myMsg.classList.contains('same-sender'))status.classList.add('same-sender');
  status.innerHTML='<span class="status-dots"><span></span><span></span><span></span></span>';
  
  if(currentTyping){chatBox.insertBefore(myMsg,currentTyping);chatBox.insertBefore(status,currentTyping);}
  else{chatBox.appendChild(myMsg);chatBox.appendChild(status);}
  
  input.value='';
  input.focus();
  scrollToBottom();
  document.getElementById('listPreviewText').textContent=text;
  bannerCount=0;
  
  quotedMsgData = null;
  input.placeholder = "iMessage 信息";

  function executeReply(replyCount){
    let currentCount=0;
    function loopReply(){
      if(currentCount>=replyCount)return;
      pushReply();
      currentCount++;
      if(currentCount<replyCount){setTimeout(loopReply,600+Math.random()*400);}
    }
    loopReply();
  }

  function pushReply(){
    playSound('receive');
    let replyText="";
    if(pinziEnabled){
      replyText=generatePinziCard();
    }else if(pokeReplyEnabled&&Math.random()*100<pokeReplyChance){
      let allPoke=getAllAvailablePoke();
      if(allPoke.length>0){replyText=allPoke[Math.floor(Math.random()*allPoke.length)];}
      else{let allCards=getAllAvailableCards();if(allCards.length>0){replyText=allCards[Math.floor(Math.random()*allCards.length)];}else{return;}}
    }else{
      let allCards=getAllAvailableCards();
      if(allCards.length>0){replyText=allCards[Math.floor(Math.random()*allCards.length)];}
      else{return;}
    }
    
    const otherTimeInserted=checkTimeline();
    
    let isAutoQuoting = false;
    const myMsgs = chatBox.querySelectorAll('.msg.me:not(.quote-bubble)');
    if (quoteReplyEnabled && myMsgs.length > 0 && Math.random() * 100 < quoteReplyChance) {
      const lastMyMsg = myMsgs[myMsgs.length - 1];
      let text = lastMyMsg.innerText || "";
      if (text.trim()) {
        isAutoQuoting = true;
        const quoteBubble = document.createElement('div');
        quoteBubble.className = 'msg me quote-bubble'; 
        quoteBubble.textContent = text.trim();
        if (currentTyping) { chatBox.insertBefore(quoteBubble, currentTyping); }
        else { chatBox.appendChild(quoteBubble); }
      }
    }

    const otherMsg=document.createElement('div');
    otherMsg.className='msg other';
    if (isAutoQuoting) {
      otherMsg.classList.add('reply-to-quote');
    }

    const currentAllMsgs=chatBox.querySelectorAll('.msg');
    const currentLast=currentAllMsgs.length>0?currentAllMsgs[currentAllMsgs.length-1]:null;
    if(!otherTimeInserted&&currentLast&&currentLast.classList.contains('other')&&!isAutoQuoting){otherMsg.classList.add('same-sender');currentLast.classList.add('hide-tail');}
    
    otherMsg.textContent=replyText;

    chatBox.appendChild(otherMsg);
    if(!page1.classList.contains('page-hidden')){scrollToBottom();}
    else{showBanner(replyText);}
    document.getElementById('listPreviewText').textContent=replyText;
  }

  const _final=getFinalMsgState();
  const _delay=600+Math.random()*800;
  setTimeout(()=>{
    if(!status.parentNode)return;
    status.innerHTML='';
    status.textContent='';
    status.className='msg-status';
    if(myMsg.classList.contains('same-sender'))status.classList.add('same-sender');
    if(_final.text==='已发送'){
      status.style.display='none';
      if(waitReplyTimer)clearTimeout(waitReplyTimer);
      let typingEl=document.getElementById('typing');
      if(!typingEl){typingEl=document.createElement('div');typingEl.className='typing-indicator';typingEl.id='typing';typingEl.innerHTML='<span></span><span></span><span></span>';chatBox.appendChild(typingEl);scrollToBottom();}
      let delayMs=(Math.random()*(maxReplySec-minReplySec)+minReplySec)*1000;
      waitReplyTimer=setTimeout(()=>{
        const t=document.getElementById('typing');if(t)t.remove();
        waitReplyTimer=null;
        let count=1;
        if(multiReplyEnabled && Math.random()*100 < multiReplyChance){
          count = Math.floor(Math.random()*2) + 2;
        }
        executeReply(count);
      },delayMs);
    }else{
      status.style.display='block';
      status.textContent=_final.text;
      if(_final.cls)status.classList.add('_final.cls');
    }
  },_delay);
}

function getFinalMsgState(){
  if(testNotReceivedEnabled && Math.random()*100 < testNotReceivedChance) {
    return {text:'未送达',cls:'failed'};
  }
  if(testReadNoReplyEnabled && Math.random()*100 < testReadNoReplyChance) {
    return {text:'未回复',cls:'no-reply'};
  }
  return{text:'已发送',cls:''};
}

let targetMsg = null;
let longPressTimer = null;

function showContextMenu(msgElement) {
  targetMsg = msgElement;
  const stickerTitle = document.getElementById('ctxStickerTitle');
  const stickerContainer = document.getElementById('ctxStickerContainer');
  const stickerDivider = document.getElementById('ctxStickerDivider');
  
  if (msgElement.classList.contains('me')) {
    stickerTitle.style.display = 'none';
    stickerContainer.style.display = 'none';
    stickerDivider.style.display = 'none';
  } else {
    stickerTitle.style.display = 'block';
    stickerContainer.style.display = 'flex';
    stickerDivider.style.display = 'block';
  }

  document.getElementById('contextMenuOverlay').classList.add('active');
  if (navigator.vibrate) navigator.vibrate(10);
}

function hideContextMenu() {
  document.getElementById('contextMenuOverlay').classList.remove('active');
  setTimeout(() => { targetMsg = null; }, 300);
}

chatBox.addEventListener('touchstart', (e) => {
  const msgEl = e.target.closest('.msg');
  if (!msgEl) return;
  if (e.target.closest('.msg-tapback')) return; 
  longPressTimer = setTimeout(() => { showContextMenu(msgEl); }, 500);
}, {passive: true});
chatBox.addEventListener('touchend', () => { if (longPressTimer) clearTimeout(longPressTimer); });
chatBox.addEventListener('touchmove', () => { if (longPressTimer) clearTimeout(longPressTimer); });
chatBox.addEventListener('contextmenu', (e) => {
  const msgEl = e.target.closest('.msg');
  if (!msgEl) return;
  if (e.target.closest('.msg-tapback')) return;
  e.preventDefault();
  showContextMenu(msgEl);
});

document.getElementById('contextMenuOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'contextMenuOverlay') hideContextMenu();
});

// ===== 改用 touchstart 强制抓取点击 =====
const ctxQuoteBtn = document.getElementById('ctxQuoteBtn');
if (ctxQuoteBtn) {
  ctxQuoteBtn.addEventListener('touchstart', function(e) {
    e.preventDefault(); 
    if (!targetMsg) return;
    quotedMsgData = {
      text: targetMsg.innerText.trim(),
      type: targetMsg.classList.contains('me') ? 'me' : 'other'
    };
    const inputEl = document.getElementById('chatInput');
    inputEl.placeholder = "正在引用..."; 
    inputEl.focus();
    hideContextMenu();
  }, { passive: false });
}

const ctxDeleteBtn = document.getElementById('ctxDeleteBtn');
if (ctxDeleteBtn) {
  ctxDeleteBtn.addEventListener('touchstart', function(e) {
    e.preventDefault();
    if (!targetMsg) return;
    targetMsg.remove();
    hideContextMenu();
  }, { passive: false });
}

// 贴纸点击改用事件委托
document.getElementById('ctxStickerContainer').addEventListener('touchstart', function(e) {
  const btn = e.target.closest('.ctx-sticker-btn');
  if (!btn) return;
  e.preventDefault();
  if (!targetMsg) return;
  
  const emoji = btn.dataset.emoji;
  let tapback = targetMsg.querySelector('.msg-tapback');
  
  if (emoji === '') {
    if (tapback) tapback.remove();
    hideContextMenu();
    return;
  }

  if (tapback) {
    const tbText = tapback.querySelector('.tb-text');
    if (tbText.textContent === emoji) {
      tapback.remove();
    } else {
      tbText.textContent = emoji;
      tapback.classList.remove('collapsed');
    }
  } else {
    tapback = document.createElement('div');
    tapback.className = 'msg-tapback';
    tapback.innerHTML = `<span class="tb-text">${emoji}</span><span class="tb-dots">••</span>`;
    tapback.onclick = function(e) {
      e.stopPropagation();
      this.classList.toggle('collapsed');
    };
    targetMsg.appendChild(tapback);
  }
  hideContextMenu();
}, { passive: false });


sendBtn.addEventListener('click',sendMessage);
input.addEventListener('keydown',event=>{if(event.key==='Enter')sendMessage();});
input.addEventListener('focus',()=>{appDrawer.classList.remove('active');plusBtn.classList.remove('active');setTimeout(()=>{scrollToBottom();window.scrollTo(0,0);},300);});
if(window.visualViewport)window.visualViewport.addEventListener('resize',scrollToBottom);
plusBtn.addEventListener('click',()=>{const isActive=appDrawer.classList.contains('active');if(isActive){appDrawer.classList.remove('active');plusBtn.classList.remove('active');}else{input.blur();appDrawer.classList.add('active');plusBtn.classList.add('active');scrollToBottom();}});

window.addEventListener('DOMContentLoaded',()=>{initChat();});