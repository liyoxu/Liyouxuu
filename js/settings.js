const openSettingsBtn=document.getElementById('openSettingsBtn'),settingsPage=document.getElementById('settingsPage'),settingsBackBtn=document.getElementById('settingsBackBtn');
const mainTabs=document.querySelectorAll('.settings-tab');
const chatSubtabs=document.getElementById('chatSubtabs');
const chatSettingsView=document.getElementById('chatSettingsView'),soundMainView=document.getElementById('soundMainView'),appearanceView=document.getElementById('appearanceView'),aboutView=document.getElementById('aboutView');

function switchMainTab(main){
  mainTabs.forEach(t=>t.classList.toggle('active',t.dataset.main===main));
  chatSettingsView.style.display='none';soundMainView.style.display='none';appearanceView.style.display='none';aboutView.style.display='none';
  chatSubtabs.style.display='none';
  if(main==='chat'){chatSettingsView.style.display='block';chatSubtabs.style.display='flex';}
  else if(main==='sound'){soundMainView.style.display='block';}
  else if(main==='appearance'){appearanceView.style.display='block';}
  else if(main==='about'){aboutView.style.display='block';}
}
mainTabs.forEach(tab=>tab.addEventListener('click',()=>switchMainTab(tab.dataset.main)));

openSettingsBtn.addEventListener('click',()=>{page2.classList.add('page-hidden');settingsPage.classList.remove('page-hidden');});
settingsBackBtn.addEventListener('click',()=>{settingsPage.classList.add('page-hidden');page2.classList.remove('page-hidden');});

document.getElementById('timelineSwitch').addEventListener('click',function(){this.classList.toggle('on');timelineEnabled=this.classList.contains('on');});
document.getElementById('pinziSwitch').addEventListener('click',function(){this.classList.toggle('on');pinziEnabled=this.classList.contains('on');});

// 多回复
const multiReplySwitch=document.getElementById('multiReplySwitch'),multiReplyChanceRow=document.getElementById('multiReplyChanceRow'),multiReplyChanceInput=document.getElementById('multiReplyChance');
multiReplySwitch.addEventListener('click',function(){this.classList.toggle('on');multiReplyEnabled=this.classList.contains('on');multiReplyChanceRow.style.display=multiReplyEnabled?'flex':'none';});
multiReplyChanceInput.addEventListener('change',e=>{let val=parseInt(e.target.value);if(isNaN(val)||val<0)val=0;if(val>100)val=100;multiReplyChance=val;e.target.value=val;});

// 未接收消息
const testNotReceivedSwitch=document.getElementById('testNotReceivedSwitch'),notReceivedChanceRow=document.getElementById('notReceivedChanceRow'),notReceivedChanceInput=document.getElementById('notReceivedChance');
testNotReceivedSwitch.addEventListener('click',function(){this.classList.toggle('on');testNotReceivedEnabled=this.classList.contains('on');notReceivedChanceRow.style.display=testNotReceivedEnabled?'flex':'none';});
notReceivedChanceInput.addEventListener('change',e=>{let val=parseInt(e.target.value);if(isNaN(val)||val<0)val=0;if(val>100)val=100;testNotReceivedChance=val;e.target.value=val;});

// 已读不回
const testReadNoReplySwitch=document.getElementById('testReadNoReplySwitch'),readNoReplyChanceRow=document.getElementById('readNoReplyChanceRow'),readNoReplyChanceInput=document.getElementById('readNoReplyChance');
testReadNoReplySwitch.addEventListener('click',function(){this.classList.toggle('on');testReadNoReplyEnabled=this.classList.contains('on');readNoReplyChanceRow.style.display=testReadNoReplyEnabled?'flex':'none';});
readNoReplyChanceInput.addEventListener('change',e=>{let val=parseInt(e.target.value);if(isNaN(val)||val<0)val=0;if(val>100)val=100;testReadNoReplyChance=val;e.target.value=val;});

// 回复时间
const minReplyInput=document.getElementById('minReplyTime'),maxReplyInput=document.getElementById('maxReplyTime');
minReplyInput.addEventListener('change',e=>{let val=parseInt(e.target.value);if(isNaN(val)||val<1)val=1;if(val>300)val=300;minReplySec=val;e.target.value=val;if(maxReplySec<minReplySec){maxReplySec=minReplySec;maxReplyInput.value=maxReplySec;}});
maxReplyInput.addEventListener('change',e=>{let val=parseInt(e.target.value);if(isNaN(val)||val<1)val=1;if(val>300)val=300;maxReplySec=val;e.target.value=val;if(minReplySec>maxReplySec){minReplySec=maxReplySec;minReplyInput.value=minReplySec;}});

// 颜文字
const pokeReplySwitch=document.getElementById('pokeReplySwitch'),pokeChanceRow=document.getElementById('pokeChanceRow'),pokeReplyChanceInput=document.getElementById('pokeReplyChance');
pokeReplySwitch.addEventListener('click',function(){this.classList.toggle('on');pokeReplyEnabled=this.classList.contains('on');pokeChanceRow.style.display=pokeReplyEnabled?'flex':'none';});
pokeReplyChanceInput.addEventListener('change',e=>{let val=parseInt(e.target.value);if(isNaN(val)||val<0)val=0;if(val>100)val=100;pokeReplyChance=val;e.target.value=val;});

// 角标
const tapbackSwitch=document.getElementById('tapbackSwitch'),tapbackChanceRow=document.getElementById('tapbackChanceRow'),tapbackChanceInput=document.getElementById('tapbackChance');
tapbackSwitch.addEventListener('click',function(){this.classList.toggle('on');tapbackEnabled=this.classList.contains('on');tapbackChanceRow.style.display=tapbackEnabled?'flex':'none';});
tapbackChanceInput.addEventListener('change',e=>{let val=parseInt(e.target.value);if(isNaN(val)||val<0)val=0;if(val>100)val=100;tapbackChance=val;e.target.value=val;});

// 引用
const quoteReplySwitch=document.getElementById('quoteReplySwitch'),quoteReplyChanceRow=document.getElementById('quoteReplyChanceRow'),quoteReplyChanceInput=document.getElementById('quoteReplyChance');
quoteReplySwitch.addEventListener('click',function(){this.classList.toggle('on');quoteReplyEnabled=this.classList.contains('on');quoteReplyChanceRow.style.display=quoteReplyEnabled?'flex':'none';});
quoteReplyChanceInput.addEventListener('change',e=>{let val=parseInt(e.target.value);if(isNaN(val)||val<0)val=0;if(val>100)val=100;quoteReplyChance=val;e.target.value=val;});

// 主题
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const lightCheck = document.getElementById('themeLightBtn').querySelector('.theme-check');
  const darkCheck = document.getElementById('themeDarkBtn').querySelector('.theme-check');
  if (theme === 'dark') {
    if(lightCheck) lightCheck.style.display = 'none';
    if(darkCheck) darkCheck.style.display = 'inline';
  } else {
    if(lightCheck) lightCheck.style.display = 'inline';
    if(darkCheck) darkCheck.style.display = 'none';
  }
}
document.getElementById('themeLightBtn').addEventListener('click', () => applyTheme('light'));
document.getElementById('themeDarkBtn').addEventListener('click', () => applyTheme('dark'));

// 气泡颜色
let currentHex = '#0b84ff';
function hexToRgba(hex, alpha) {
  if(!hex || !hex.startsWith('#')) return `rgba(11, 132, 255, ${alpha})`;
  let r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
function applyBubbleColor() {
  document.documentElement.style.setProperty('--bubble-me-bg', currentHex);
  document.documentElement.style.setProperty('--bubble-me-bg-trans', hexToRgba(currentHex, 0.65));
}
const colorCircles = document.querySelectorAll('.color-circle');
colorCircles.forEach(circle => {
  circle.addEventListener('click', function() {
    colorCircles.forEach(c => c.classList.remove('active'));
    this.classList.add('active');
    currentHex = this.dataset.color;
    applyBubbleColor();
  });
});

// 背景
const changeBgBtn = document.getElementById('changeBgBtn');
const resetBgBtn = document.getElementById('resetBgBtn');
const bgUploadInput = document.getElementById('bgUploadInput');
const page1Element = document.getElementById('page1'); 
const chatBoxElement = document.getElementById('chatBox');

if (changeBgBtn && bgUploadInput) {
  changeBgBtn.addEventListener('click', () => {
    bgUploadInput.click(); 
  });
  bgUploadInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
      page1Element.style.backgroundImage = `url(${event.target.result})`;
      document.documentElement.classList.add('has-bg');
      showToast('背景更换成功');
      
      const sysMsg = document.createElement('div');
      sysMsg.className = 'time-divider';
      sysMsg.textContent = '你已更改背景';
      chatBoxElement.appendChild(sysMsg);
      chatBoxElement.scrollTop = chatBoxElement.scrollHeight;
    };
    reader.readAsDataURL(file);
    this.value = ''; 
  });
}

if (resetBgBtn) {
  resetBgBtn.addEventListener('click', () => {
    page1Element.style.backgroundImage = 'none';
    document.documentElement.classList.remove('has-bg');
    showToast('已恢复默认背景');
    
    const sysMsg = document.createElement('div');
    sysMsg.className = 'time-divider';
    sysMsg.textContent = '你已恢复默认背景';
    chatBoxElement.appendChild(sysMsg);
    chatBoxElement.scrollTop = chatBoxElement.scrollHeight;
  });
}

window.addEventListener('DOMContentLoaded', () => {
  applyTheme('light');
  applyBubbleColor();
});