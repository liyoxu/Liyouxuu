// ===== 塔罗牌 =====
const openTarotBtn=document.getElementById('openTarotBtn'),tarotPage=document.getElementById('tarotPage'),tarotBackBtn=document.getElementById('tarotBackBtn'),tarotDeckArea=document.getElementById('tarotDeckArea'),tarotStatusPill=document.getElementById('tarotStatusPill'),deckCountText=document.getElementById('deckCountText'),drawnCountText=document.getElementById('drawnCountText'),tarotResultArea=document.getElementById('tarotResultArea'),resetTarotBtn=document.getElementById('resetTarotBtn');
let drawnCards=[];const totalCardsToDraw=3;

// 兜底：data/tarot-deck.js 没加载或数据无效时，用这份内置数据
const _tarotDeck = (typeof tarotDeck !== 'undefined' && Array.isArray(tarotDeck) && tarotDeck.length > 0) ? tarotDeck : [
{name:"愚者",up:"新的开始、冒险。",rev:"鲁莽、不切实际。"},
{name:"魔术师",up:"创造力、行动力。",rev:"欺骗、计划受阻。"},
{name:"女祭司",up:"直觉、潜意识。",rev:"忽视直觉、表面化。"},
{name:"女皇",up:"丰饶、孕育。",rev:"依赖、创造力停滞。"},
{name:"皇帝",up:"权威、稳固。",rev:"独裁、缺乏纪律。"},
{name:"教皇",up:"传统、指引。",rev:"教条主义、反叛。"},
{name:"恋人",up:"爱情、结合。",rev:"不和谐、价值观冲突。"},
{name:"战车",up:"意志力、胜利。",rev:"失控、缺乏动力。"},
{name:"力量",up:"勇气、内在力量。",rev:"软弱、自我怀疑。"},
{name:"隐士",up:"内省、寻求真理。",rev:"孤立、拒绝帮助。"},
{name:"命运之轮",up:"转折点、契机。",rev:"厄运、阻碍。"},
{name:"正义",up:"公平、真相。",rev:"不公、失衡。"},
{name:"倒吊人",up:"换位思考、牺牲。",rev:"无谓的牺牲、停滞。"},
{name:"死神",up:"结束与新生。",rev:"抗拒改变、旧事纠缠。"},
{name:"节制",up:"平衡、调和。",rev:"失衡、缺乏耐性。"},
{name:"恶魔",up:"诱惑、欲望。",rev:"解脱、挣脱束缚。"},
{name:"高塔",up:"突变、打破虚假。",rev:"避免灾难、延迟。"},
{name:"星星",up:"希望、灵感。",rev:"失望、失去目标。"},
{name:"月亮",up:"迷惘、不安。",rev:"真相大白、解除误会。"},
{name:"太阳",up:"成功、快乐。",rev:"短暂的阴霾、过度自信。"},
{name:"审判",up:"觉醒、复苏。",rev:"自我怀疑、逃避责任。"},
{name:"世界",up:"圆满、完成。",rev:"未完成、停滞。"}
];

function initTarot(){tarotDeckArea.innerHTML='';drawnCards=[];tarotStatusPill.textContent='请默念问题，抽取 3 张牌';tarotResultArea.style.display='none';tarotDeckArea.style.display='flex';for(let i=0;i<78;i++){const cardEl=document.createElement('div');cardEl.className='card-back-item';cardEl.dataset.index=i;cardEl.addEventListener('click',()=>drawCard(cardEl));tarotDeckArea.appendChild(cardEl);}updateTarotStatus();}
function updateTarotStatus(){deckCountText.textContent=`剩 ${78-drawnCards.length} 张`;drawnCountText.textContent=`已抽 ${drawnCards.length}/${totalCardsToDraw} 张`;}
function drawCard(cardElement){if(drawnCards.length>=totalCardsToDraw)return;const randomIndex=Math.floor(Math.random()*_tarotDeck.length),cardData=_tarotDeck[randomIndex],isReverse=Math.random()>0.5;drawnCards.push({...cardData,isReverse});cardElement.classList.add('drawn');updateTarotStatus();tarotStatusPill.textContent=drawnCards.length===totalCardsToDraw?'抽牌完毕，正在解牌...':'抽牌中...';if(drawnCards.length===totalCardsToDraw){setTimeout(showTarotResult,600);}}
function showTarotResult(){tarotDeckArea.style.display='none';tarotResultArea.style.display='flex';tarotStatusPill.textContent='你的专属塔罗指引';for(let i=0;i<3;i++){const cardBox=document.getElementById(`resCard${i+1}`),cardName=cardBox.querySelector('.result-name'),cardStatus=cardBox.querySelector('.result-status'),cardMeaning=cardBox.querySelector('.result-meaning'),data=drawnCards[i];cardName.textContent=data.name;cardStatus.textContent=data.isReverse?'逆位':'正位';if(data.isReverse){cardStatus.classList.add('rev');cardMeaning.textContent=data.rev;}else{cardStatus.classList.remove('rev');cardMeaning.textContent=data.up;}cardBox.classList.remove('flipped');setTimeout(()=>{cardBox.classList.add('flipped');},i*400+300);}}
openTarotBtn.addEventListener('click',()=>{appDrawer.classList.remove('active');plusBtn.classList.remove('active');page1.classList.add('page-hidden');tarotPage.classList.remove('page-hidden');initTarot();});
tarotBackBtn.addEventListener('click',()=>{tarotPage.classList.add('page-hidden');page1.classList.remove('page-hidden');setTimeout(scrollToBottom,350);});
resetTarotBtn.addEventListener('click',()=>{initTarot();});