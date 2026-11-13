if(!window.BUILTIN_CARDS){window.BUILTIN_CARDS=["今天天气很好","我也很喜欢你","你在干嘛呀","晚上吃什么","早点休息","想你了","在忙吗","晚安","早安","吃了吗"];}

let minReplySec=1,maxReplySec=3;
let pinziEnabled=false;
let multiReplyEnabled=false, multiReplyChance=50;
let testNotReceivedEnabled=false, testNotReceivedChance=30;
let testReadNoReplyEnabled=false, testReadNoReplyChance=30;
let timelineEnabled=true,lastMsgTimestamp=0;
let bannerTimeout=null,bannerCount=0,unreadCount=0;
let pokeReplyEnabled=false,pokeReplyChance=20;
let tapbackEnabled=false,tapbackChance=30;
let quoteReplyEnabled=false,quoteReplyChance=30;

let toastTimeout=null;
function showToast(message){const toast=document.getElementById('globalToast');toast.textContent=message;toast.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>{toast.classList.remove('show');},1500);}
function playSound(type){try{const audio=document.getElementById(type==='send'?'sendSound':'receiveSound');if(audio){audio.currentTime=0;audio.play().catch(e=>{});}}catch(err){}}

const banner=document.getElementById('bannerNotification'),bannerMessage=document.getElementById('bannerMessage'),bannerTitle=document.getElementById('bannerTitle'),bannerAvatar=document.getElementById('bannerAvatar'),unreadBadge=document.getElementById('unreadBadge');
function updateUnreadUI(){if(unreadCount>0){unreadBadge.textContent=unreadCount;unreadBadge.classList.add('show');}else{unreadBadge.classList.remove('show');}}
function showBanner(text){unreadCount++;updateUnreadUI();if(bannerCount>=2)return;bannerCount++;bannerMessage.textContent=text;bannerTitle.textContent=document.getElementById('chatHeaderName').textContent;const chatAvatarStyle=document.getElementById('chatAvatar').style.backgroundImage;if(chatAvatarStyle&&chatAvatarStyle!=='none'){bannerAvatar.style.backgroundImage=chatAvatarStyle;bannerAvatar.querySelector('svg').style.display='none';}else{bannerAvatar.style.backgroundImage='linear-gradient(160deg, #7b9ced, #4d6dc4)';bannerAvatar.querySelector('svg').style.display='block';}banner.classList.add('show');clearTimeout(bannerTimeout);bannerTimeout=setTimeout(()=>{banner.classList.remove('show');},3000);}
function jumpToChatFromBanner(){banner.classList.remove('show');document.getElementById('page2').classList.add('page-hidden');document.getElementById('settingsPage').classList.add('page-hidden');document.getElementById('flashcardPage').classList.add('page-hidden');document.getElementById('tarotPage').classList.add('page-hidden');document.getElementById('page1').classList.remove('page-hidden');unreadCount=0;updateUnreadUI();setTimeout(scrollToBottom,350);}

const chatBox=document.getElementById('chatBox'),input=document.getElementById('chatInput'),sendBtn=document.getElementById('sendBtn'),plusBtn=document.getElementById('plusBtn'),appDrawer=document.getElementById('appDrawer'),page1=document.getElementById('page1'),page2=document.getElementById('page2'),backToMenu=document.getElementById('backToMenu');

function scrollToBottom(){chatBox.scrollTop=chatBox.scrollHeight;}

function getTimeDividerString(date){const now=new Date(),today=new Date(now.getFullYear(),now.getMonth(),now.getDate()),target=new Date(date.getFullYear(),date.getMonth(),date.getDate());const diffDays=Math.round((today-target)/86400000);let dateStr="";if(diffDays===0)dateStr="今日";else if(diffDays===1)dateStr="昨日";else if(diffDays===2)dateStr="前日";else dateStr=`${date.getMonth()+1}月${date.getDate()}日`;const hh=String(date.getHours()).padStart(2,'0'),mm=String(date.getMinutes()).padStart(2,'0');return `<div>${dateStr} ${hh}:${mm}</div>`;}
function insertTimeDivider(date){if(!timelineEnabled)return;const div=document.createElement('div');div.className='time-divider';div.innerHTML=getTimeDividerString(date);const currentTyping=document.getElementById('typing');if(currentTyping){chatBox.insertBefore(div,currentTyping);}else{chatBox.appendChild(div);}}
function checkTimeline(){const now=Date.now();if(now-lastMsgTimestamp>30*60*1000){insertTimeDivider(new Date(now));lastMsgTimestamp=now;return true;}lastMsgTimestamp=now;return false;}

backToMenu.addEventListener('click',()=>{page1.classList.add('page-hidden');page2.classList.remove('page-hidden');bannerCount=0;});
document.getElementById('mainContactItem').addEventListener('click',()=>{page2.classList.add('page-hidden');page1.classList.remove('page-hidden');banner.classList.remove('show');bannerCount=0;unreadCount=0;updateUnreadUI();setTimeout(scrollToBottom,350);});
document.getElementById('pinnedContact').addEventListener('click',()=>{page2.classList.add('page-hidden');page1.classList.remove('page-hidden');banner.classList.remove('show');bannerCount=0;unreadCount=0;updateUnreadUI();setTimeout(scrollToBottom,350);});