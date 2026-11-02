const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s), money=n=>n.toLocaleString('ru-RU')+' ₽';
const catalog=[{id:1,name:'Кинг Бокс',cat:'Наборы',price:2729,desc:'4 бургера + Кинг Фри. Для большой компании.',kind:'box',tag:'ИЗ ИСХОДНОГО ПРОТОТИПА'},{id:2,name:'Воппер',cat:'Бургеры',price:329,desc:'Говядина на огне, свежие овощи и фирменная булочка.',kind:'burger',tag:'ЛЕГЕНДА НА ОГНЕ'},{id:3,name:'Чизбургер',cat:'Бургеры',price:129,desc:'Говядина, сыр, огурчики и соус.',kind:'cheese',tag:'ТОТ САМЫЙ ВКУС'},{id:4,name:'Кинг Фри',cat:'Закуски',price:159,desc:'Золотистый картофель с хрустящей корочкой.',kind:'fries',tag:'ИДЕАЛЬНАЯ ПАРА'},{id:5,name:'Наггетсы',cat:'Закуски',price:199,desc:'Куриные наггетсы в хрустящей панировке, 6 штук.',kind:'nuggets',tag:'ХРУСТИ С УДОВОЛЬСТВИЕМ'},{id:6,name:'Лимонад',cat:'Напитки',price:149,desc:'Прохладный лимонад, 0,4 л.',kind:'drink',tag:'ОСВЕЖАЮЩИЙ ФИНАЛ'}];
function art(kind){
  const photos={burger:['whopper','Воппер'],cheese:['cheeseburger','Чизбургер'],fries:['fries','Кинг Фри'],nuggets:['nuggets','Наггетсы'],drink:['lemonade','Лимонад']};
  if(kind==='box')return '<div class="food-art food-photo-set" role="img" aria-label="Демонстрационный набор: четыре бургера и Кинг Фри"><img src="assets/products/whopper.png" alt="" class="set-burger set-one"><img src="assets/products/cheeseburger.png" alt="" class="set-burger set-two"><img src="assets/products/cheeseburger.png" alt="" class="set-burger set-three"><img src="assets/products/cheeseburger.png" alt="" class="set-burger set-four"><img src="assets/products/fries.png" alt="" class="set-fries"></div>';
  const [file,label]=photos[kind];
  return `<img class="food-art food-photo" src="assets/products/${file}.png" alt="${label}" width="512" height="512" decoding="async">`;
}
let state={cart:{},balance:1830,crowns:0};try{const saved=JSON.parse(localStorage.getItem('bk-pay-v3'));if(saved&&Number.isFinite(saved.balance)&&saved.balance>=0&&Number.isFinite(saved.crowns)){state.balance=saved.balance;state.crowns=saved.crowns;for(const p of catalog){let n=saved.cart?.[p.id];if(Number.isInteger(n)&&n>0&&n<=99)state.cart[p.id]=n}}}catch{}
let category='Все', selectedJourney=0,step=0,timer;
function save(){try{localStorage.setItem('bk-pay-v3',JSON.stringify(state))}catch{}update()}
function update(){$$('.count').forEach(e=>e.textContent=Object.values(state.cart).reduce((a,b)=>a+b,0));$$('.balance').forEach(e=>e.textContent=money(state.balance))}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>$('#toast').classList.remove('show'),2200)}
function menu(){const q=$('#search').value.toLocaleLowerCase('ru');const list=catalog.filter(p=>(category==='Все'||p.cat===category)&&p.name.toLocaleLowerCase('ru').includes(q));$('#products').innerHTML=list.map(p=>`<article class="product"><div class="tag">${p.tag}</div>${art(p.kind)}<h3>${p.name}</h3><p>${p.desc}</p><div class="product-bottom"><strong>${money(p.price)}</strong><button data-add="${p.id}" aria-label="Добавить ${p.name}">В корзину +</button></div></article>`).join('');$('#empty-search').hidden=list.length>0}
$('.filters').innerHTML=['Все','Бургеры','Наборы','Закуски','Напитки'].map(c=>`<button data-category="${c}" class="${c===category?'active':''}" aria-pressed="${c===category}">${c}</button>`).join('');
$('.filters').onclick=e=>{const b=e.target.closest('[data-category]');if(!b)return;category=b.dataset.category;$$('[data-category]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});menu()};$('#search').oninput=menu;
$('#products').onclick=e=>{const b=e.target.closest('[data-add]');if(!b)return;let id=b.dataset.add;if((state.cart[id]||0)>=99)return toast('Максимум 99 штук');state.cart[id]=(state.cart[id]||0)+1;save();toast('Добавлено в корзину')};
const total=()=>catalog.reduce((a,p)=>a+p.price*(state.cart[p.id]||0),0);const dialog=$('#cart-dialog');
function cart(){const items=catalog.filter(p=>state.cart[p.id]);$('#cart-title').textContent='Твой заказ';$('#cart-body').innerHTML=items.length?checkoutCartProgressHTML()+items.map(p=>`<div class="line"><div class="cart-item-info"><div class="cart-item-photo">${art(p.kind)}</div><div><b>${p.name}</b><p>${money(p.price)} за шт.</p></div></div><div class="qty"><button data-qty="${p.id}" data-delta="-1" aria-label="Уменьшить ${p.name}">−</button><span>${state.cart[p.id]}</span><button data-qty="${p.id}" data-delta="1" aria-label="Увеличить ${p.name}">+</button></div></div>`).join('')+`<div class="total"><span>Итого</span><span>${money(total())}</span></div><div class="notice">♛ +100 демонстрационных корон при оплате кошельком</div>${checkoutChoiceHTML()}<button id="checkout" class="wide">К оформлению →</button>`:'<div class="success"><span>♛</span><h3>Здесь пока пусто</h3><p>Самое время выбрать что-нибудь вкусное.</p><button id="back-menu">Перейти к меню</button></div>'}
$$('.cart-open').forEach(b=>b.onclick=()=>{cart();dialog.showModal()});$('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
$('#cart-body').onclick=e=>{if(handleCheckoutAction(e))return;const q=e.target.closest('[data-qty]');if(q){const id=q.dataset.qty;state.cart[id]=Math.min(99,state.cart[id]+Number(q.dataset.delta));if(!state.cart[id])delete state.cart[id];save();cart()}if(e.target.id==='back-menu'){dialog.close();location.hash='menu'}if(e.target.id==='checkout')beginCheckout();if(e.target.id==='back-cart')cart();if(e.target.id==='add-funds'){state.balance+=1000;save();checkout()}if(e.target.id==='finish'){dialog.close()}};
function checkout(){if(!total())return cart();$('#cart-title').textContent='Оформление';const insufficient=state.balance<total();$('#cart-body').innerHTML=`<button id="back-cart" class="cream">← К корзине</button><form id="order-form"><label for="method">Как заберёте?</label><select id="method"><option>Самовывоз</option><option>В ресторане</option></select><label for="restaurant">Ресторан</label><select id="restaurant"><option>Демонстрационный ресторан · Центр</option><option>Демонстрационный ресторан · Парк</option></select><label for="time">Когда приготовить?</label><select id="time"><option>Как можно скорее</option><option>Через 30 минут</option><option>Через 1 час</option></select><label>Способ оплаты</label><div class="notice"><b>Burger King Pay · деморежим</b><br>Баланс ${money(state.balance)} · +100 корон<br>Реальная оплата не подключена.</div><div class="total"><span>Итого</span><span>${money(total())}</span></div>${insufficient?'<p role="alert">Не хватает '+money(total()-state.balance)+'.</p><button type="button" id="add-funds" class="wide">Добавить 1 000 деморублей</button>':'<button type="submit" class="wide">Подтвердить демозаказ · '+money(total())+'</button>'}<p><small>Заказ останется в браузере. В ресторан и банк ничего не отправляется.</small></p></form>`;finishCheckoutRender();$('#order-form').onsubmit=e=>{e.preventDefault();if(state.balance<total()||!total())return;const amount=total(),method=$('#method').value,restaurant=$('#restaurant').value,time=$('#time').value;state.balance-=amount;state.crowns+=100;state.cart={};save();$('#cart-title').textContent='Всё получилось';$('#cart-body').innerHTML=`<div class="success"><span>✓</span><h3>Демозаказ собран!</h3><p>${method} · ${restaurant}<br>${time}</p><p>Виртуально списано ${money(amount)}<br>Начислено 100 корон · Всего ${state.crowns}<br>Остаток ${money(state.balance)}</p><div class="notice">Это результат демонстрации. Реальный заказ не создан, деньги не списаны.</div><button id="finish" class="wide">Отлично, спасибо</button></div>`;finishCheckoutRender();}}
$('#topup').onclick=()=>{state.balance+=1000;save();toast('Добавлено 1 000 деморублей')};$('#reset').onclick=()=>{state={cart:{},balance:1830,crowns:0};Object.assign(checkoutSession,{customer:'new',stage:'entry',connected:null,issued:false,card:0,furthest:0,phoneLinked:false,orderAmount:0,orderNames:''});save();toast('Демоданные сброшены')};
let journeyVariant='online';
function journeySteps(){
  const current=journeys[selectedJourney];
  return current.variants ? current.variants[journeyVariant] : current.steps;
}
function journey(){
  const current=journeys[selectedJourney];
  const steps=journeySteps();
  const active=steps[step];
  $('#journey-tabs').innerHTML=journeys.map((item,index)=>`<button data-journey="${index}" class="${index===selectedJourney?'active':''}" aria-pressed="${index===selectedJourney}">${item.label}</button>`).join('');
  $('#journey-variants').hidden=!current.variants;
  $('#journey-variants').innerHTML=current.variants ? ['online','offline'].map(variant=>`<button data-variant="${variant}" class="${journeyVariant===variant?'active':''}" aria-pressed="${journeyVariant===variant}">${variant==='online'?'В приложении':'На кассе'}</button>`).join('') : '';
  $('#steps').innerHTML=steps.map((item,index)=>`<button data-step="${index}" class="${index===step?'active':''}" aria-current="${index===step?'step':'false'}">${String(index+1).padStart(2,'0')} / ${item.title}</button>`).join('');
  const screen=journeyScreens[active.screen];
  $('#journey-phone-mark').innerHTML=journeyMark;
  $('#journey-screen-title').textContent=screen.title;
  $('#journey-phone-content').innerHTML=screen.html;
  enhanceJourneyPhone(active.screen);
  syncCheckoutPhoneContent();
  $('.journey-phone').setAttribute('aria-label','Макет экрана приложения: '+screen.title);
  $('#journey-step-counter').textContent=String(step+1).padStart(2,'0')+' / '+String(steps.length).padStart(2,'0');
  $('#prev-step').disabled=step===0;
  $('#next-step').disabled=step===steps.length-1;
  $('#step-detail').innerHTML=`<div class="eyebrow">${active.zone} · ${step+1} / ${steps.length}</div><h3>${active.title}</h3><p>${active.desc}</p><small><b>Гостю и Burger King</b><br>${active.metricPartner}</small><small><b>Банку</b><br>${active.metricBank}</small><small class="journey-hypothesis">Описание гипотезы из исходного CJM. Данные на экранах демонстрационные, банковская интеграция не подключена.</small>`;
  const activeButton=$('#steps .active');
  $('#steps').scrollTo({left:Math.max(0,activeButton.offsetLeft-$('#steps').offsetLeft-16),behavior:'instant'});
}
$('#journey-tabs').onclick=event=>{
  const button=event.target.closest('[data-journey]');
  if(button){checkoutSession.phoneLinked=false;selectedJourney=Number(button.dataset.journey);step=0;journeyVariant='online';journey();}
};
$('#journey-variants').onclick=event=>{
  const button=event.target.closest('[data-variant]');
  if(button){journeyVariant=button.dataset.variant;step=0;journey();}
};
$('#steps').onclick=event=>{
  const button=event.target.closest('[data-step]');
  if(button){step=Number(button.dataset.step);journey();}
};
$('#prev-step').onclick=()=>{if(step>0){step--;journey();}};
$('#next-step').onclick=()=>{if(step<journeySteps().length-1){step++;journey();}};
update();menu();journey();

// Annual revenue is in billions, guest count is in thousands. All values are assumptions.
const calcNumber=new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2});
const calcMoney=value=>value>=1e9?new Intl.NumberFormat('ru-RU',{minimumFractionDigits:2,maximumFractionDigits:2}).format(value/1e9)+' млрд ₽':new Intl.NumberFormat('ru-RU',{minimumFractionDigits:1,maximumFractionDigits:2}).format(value/1e6)+' млн ₽';
const calculator=$('#calculator');
const calculatorInputs=[...calculator.querySelectorAll('input[type="range"]')];
function updateCalculator(){
  const turnover=Number($('#calc-turnover').value);
  const share=Number($('#calc-share').value);
  const currentRate=Number($('#calc-current-rate').value);
  const walletRate=Number($('#calc-wallet-rate').value);
  const guests=Number($('#calc-guests').value);
  const averageBalance=Number($('#calc-average-balance').value);
  const revenue=turnover*1e9,walletRevenue=revenue*share/100;
  const before=revenue*currentRate/100;
  const after=(revenue-walletRevenue)*currentRate/100+walletRevenue*walletRate/100;
  const saving=walletRevenue*(currentRate-walletRate)/100;
  const values={'calc-turnover':calcNumber.format(turnover)+' млрд ₽','calc-share':share+'%','calc-current-rate':calcNumber.format(currentRate)+'%','calc-wallet-rate':calcNumber.format(walletRate)+'%','calc-guests':calcNumber.format(guests)+' тыс.','calc-average-balance':money(averageBalance)};
  for(const input of calculatorInputs){
    $('#'+input.id+'-value').textContent=values[input.id];
    input.setAttribute('aria-valuetext',values[input.id]);
    const fill=(Number(input.value)-Number(input.min))/(Number(input.max)-Number(input.min))*100;
    input.style.setProperty('--range-fill',fill+'%');
  }
  $('#calc-saving-label').textContent=saving<0?'Дополнительные расходы в год':'Экономия на эквайринге в год';
  $('#calc-saving').textContent=calcMoney(Math.abs(saving));
  $('#calc-balances').textContent=calcMoney(guests*1000*averageBalance);
  $('#calc-fees-before').textContent=calcMoney(before);
  $('#calc-fees-after').textContent=calcMoney(after);
  $('#calc-formula').textContent=`${values['calc-turnover']} × ${share}% × (${values['calc-current-rate']} − ${values['calc-wallet-rate']}) = ${saving<0?'−':''}${calcMoney(Math.abs(saving))}.\nНа кошельках: ${values['calc-guests']} × ${money(averageBalance)} = ${calcMoney(guests*1000*averageBalance)}`;
}
calculatorInputs.forEach(input=>input.addEventListener('input',updateCalculator));
updateCalculator();
