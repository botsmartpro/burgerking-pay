/* The cart and application walkthrough use the same journey data. All actions are demos. */
const checkoutSession={customer:'new',stage:'entry',connected:null,issued:false,card:0,furthest:0,phoneLinked:false,orderAmount:0,orderNames:''};
const checkoutProfile={surname:'Купреев',givenName:'Роман',patronymic:'Александрович',birthDate:'1990-03-15'};
const checkoutCards=[{name:'Альфа-Карта',last:'4567',balance:15200},{name:'Карта Альфа-Банка',last:'3456',balance:1100}];
function checkoutJourney(){return journeys.find(item=>item.id===(checkoutSession.customer==='new'?'new':'existing'));}
function checkoutFlow(){
  const stages=checkoutSession.customer==='new'?['entry','offer','verify','profile','issued','topup','bind','payment']:['entry','offer','verify','card','ready','topup','payment'];
  return checkoutJourney().steps.map((item,index)=>({...item,stage:stages[index],index}));
}
function syncCheckoutJourney(stage){
  const flow=checkoutFlow(),current=flow.find(item=>item.stage===stage);
  if(!current)return;
  checkoutSession.stage=stage;checkoutSession.furthest=Math.max(checkoutSession.furthest,current.index);checkoutSession.phoneLinked=true;
  if(total()){
    checkoutSession.orderAmount=total();
    checkoutSession.orderNames=catalog.filter(item=>state.cart[item.id]).map(item=>item.name+' × '+state.cart[item.id]).join(', ');
  }
  selectedJourney=journeys.indexOf(checkoutJourney());journeyVariant='online';step=current.index;journey();
}
function checkoutProgressHTML(stage){
  const flow=checkoutFlow(),current=flow.find(item=>item.stage===stage)||flow[0];
  return `<div class="connection-progress"><span>${checkoutSession.customer==='new'?'Новый клиент':'Действующий клиент'}</span><b>Шаг ${current.index+1} / ${flow.length}</b></div><nav class="checkout-step-rail" aria-label="Шаги сценария в корзине">${flow.map(item=>`<button type="button" data-checkout-step="${item.stage}" aria-current="${item.stage===stage?'step':'false'}" class="${item.stage===stage?'active':''}" ${item.index>checkoutSession.furthest||!total()?'disabled':''}><span>${String(item.index+1).padStart(2,'0')}</span>${item.title}</button>`).join('')}</nav>`;
}
function finishCheckoutRender(stage='payment'){
  syncCheckoutJourney(stage);
  $('#cart-body').insertAdjacentHTML('afterbegin',checkoutProgressHTML(stage));
  const rail=$('#cart-body .checkout-step-rail'),active=rail.querySelector('.active');
  rail.scrollTo({left:Math.max(0,active.offsetLeft-rail.offsetLeft-10),behavior:'instant'});
  dialog.scrollTop=0;
}
function checkoutCartProgressHTML(){syncCheckoutJourney('entry');return checkoutProgressHTML('entry');}
function checkoutChoiceHTML(){
  const connected=checkoutSession.connected===checkoutSession.customer;
  return `<div class="checkout-choice"><h3>${connected?'Burger King Pay подключён':'Подключите Burger King Pay'}</h3><p>${connected?'Можно продолжить оформление заказа.':'Выберите свой сценарий — все шаги пройдут здесь, в корзине.'}</p><div class="checkout-customer-options"><button type="button" data-customer="new" class="checkout-customer ${checkoutSession.customer==='new'?'selected':''}" aria-pressed="${checkoutSession.customer==='new'}"><b>Новый клиент</b><span>Открыть кошелёк</span></button><button type="button" data-customer="existing" class="checkout-customer ${checkoutSession.customer==='existing'?'selected':''}" aria-pressed="${checkoutSession.customer==='existing'}"><b>Действующий клиент</b><span>Добавить карту Альфа-Банка</span></button></div>${connected?'<div class="checkout-connected">✓ Кошелёк готов · '+money(state.balance)+'</div>':''}</div>`;
}
function beginCheckout(){
  if(!total())return cart();
  if(checkoutSession.connected===checkoutSession.customer)return checkout();
  checkoutSession.stage='offer';renderConnection();
}
function connectionShell(content){
  syncCheckoutJourney(checkoutSession.stage);
  const flow=checkoutFlow(),current=flow.find(item=>item.stage===checkoutSession.stage);
  $('#cart-title').textContent=current.title;
  $('#cart-body').innerHTML=`${checkoutProgressHTML(current.stage)}<button type="button" class="connection-back" data-checkout-action="back">← ${current.index===1?'В корзину':'Назад'}</button><div class="connection-order">Твой заказ <b>${money(total())}</b></div>${content}<p class="connection-demo">Демосценарий. СМС не отправляются, банковские услуги не подключаются, реальные деньги не списываются.</p>`;
  const rail=$('#cart-body .checkout-step-rail'),active=rail.querySelector('.active');
  rail.scrollTo({left:Math.max(0,active.offsetLeft-rail.offsetLeft-10),behavior:'instant'});
  dialog.scrollTop=0;
}
function renderConnection(){
  const stage=checkoutSession.stage,isNew=checkoutSession.customer==='new';
  if(stage==='entry')return cart();
  if(stage==='payment')return checkout();
  if(stage==='offer'){
    connectionShell(`<div class="connection-heading"><span>♛</span><h3>${isNew?'Откройте кошелёк':'Подключите карту'} — получайте короны</h3><p>${isNew?'Открытие демокошелька без пластика, затем пополнение на сумму заказа.':'Выберите демонстрационную карту Альфа-Банка и добавьте её к Burger King Pay.'}</p></div><div class="notice">+100 демонстрационных корон за оплату этого заказа</div><form id="connection-form"><label class="connection-consent"><input type="checkbox" id="connection-consent" required><span>Хочу пройти демонстрацию подключения Burger King Pay</span></label><button type="submit" class="wide">Продолжить</button></form>`);
    $('#connection-form').onsubmit=event=>{event.preventDefault();checkoutSession.stage='verify';renderConnection();};return;
  }
  if(stage==='verify'){
    connectionShell(`<p>В демонстрации используем тестовый номер и код.</p><form id="connection-form"><label for="connection-phone">Демонстрационный номер</label><input id="connection-phone" type="tel" value="+7 (900) 000-00-00" readonly><label for="connection-code">Код подтверждения</label><input id="connection-code" inputmode="numeric" autocomplete="off" pattern="1234" maxlength="4" value="1234" required aria-describedby="connection-code-help"><small id="connection-code-help">Демокод: 1234. Настоящее СМС не отправляется.</small><button type="submit" class="wide">Подтвердить</button></form>`);
    $('#connection-form').onsubmit=event=>{event.preventDefault();checkoutSession.stage=isNew?'profile':'card';renderConnection();};return;
  }
  if(stage==='profile'){
    connectionShell(`<h3 class="connection-form-title">Заполните заявку</h3><p>Поля предзаполнены демонстрационными данными, как на экране приложения.</p><form id="connection-form"><label for="connection-surname">Фамилия</label><input id="connection-surname" data-profile-field="surname" maxlength="60" required autocomplete="off"><label for="connection-given-name">Имя</label><input id="connection-given-name" data-profile-field="givenName" maxlength="60" required autocomplete="off"><label for="connection-patronymic">Отчество</label><input id="connection-patronymic" data-profile-field="patronymic" maxlength="60" autocomplete="off"><label for="connection-birthday">Дата рождения</label><input id="connection-birthday" data-profile-field="birthDate" type="date" required><small>Данные остаются в этой демонстрации и не передаются в банк.</small><button type="submit" class="wide">Открыть кошелёк</button></form>`);
    for(const input of $$('#connection-form [data-profile-field]'))input.value=checkoutProfile[input.dataset.profileField];
    $('#connection-form').oninput=event=>{if(event.target.dataset.profileField)checkoutProfile[event.target.dataset.profileField]=event.target.value;};
    $('#connection-form').onsubmit=event=>{event.preventDefault();if(!checkoutSession.issued){state.balance=0;checkoutSession.issued=true;save();}checkoutSession.stage='issued';renderConnection();};return;
  }
  if(stage==='issued'){
    connectionShell(`<div class="connection-heading"><span>✓</span><h3>Кошелёк Burger King Pay выпущен</h3><p>Пополните кошелёк и оплачивайте покупки с коронами.</p></div><div class="connection-wallet"><b>BURGER KING PAY</b><span>•••• 2026</span><strong>${money(state.balance)}</strong></div><button type="button" class="wide" data-checkout-action="topup">Пополнить кошелёк</button>`);return;
  }
  if(stage==='topup'){
    const needed=Math.max(0,total()-state.balance);
    connectionShell(`<p>${isNew?'С карты другого банка — демонстрация пополнения.':'Пополнение между своими счетами — демонстрация.'}</p><div class="connection-wallet"><b>${needed?'ДЕМОПОПОЛНЕНИЕ':'ПОПОЛНЕНИЕ НЕ ТРЕБУЕТСЯ'}</b><strong>${money(needed)}</strong><span>Баланс после пополнения: ${money(state.balance+needed)}</span></div><div class="notice connection-spacer">${needed?'Добавим виртуальные деньги на сумму, которой не хватает для заказа.':'На выбранной карте достаточно демосредств для заказа.'} Данные карты и вход в банк не нужны.</div><button type="button" class="wide" data-checkout-action="confirm-topup">${needed?'Добавить '+money(needed)+' в демо':'Продолжить к оплате'}</button>`);return;
  }
  if(stage==='bind'){
    connectionShell(`<h3 class="connection-form-title">Способ оплаты</h3><p>Кошелёк выпущен и пополнен. Добавьте его как способ оплаты этого заказа.</p><div class="connection-bank-card selected"><span><b>Burger King Pay</b><small>•••• 2026 · ${money(state.balance)}</small></span><span aria-hidden="true">●</span></div><div class="notice connection-spacer">+100 демонстрационных корон за оплату кошельком</div><button type="button" class="wide" data-checkout-action="bind-wallet">Привязать Burger King Pay</button>`);return;
  }
  if(stage==='card'){
    connectionShell(`<p>Выберите карту для подключения к Burger King Pay. Все карты и остатки демонстрационные.</p><div class="connection-cards">${checkoutCards.map((card,index)=>`<button type="button" class="connection-bank-card ${checkoutSession.card===index?'selected':''}" data-checkout-card="${index}" aria-pressed="${checkoutSession.card===index}"><span><b>${card.name}</b><small>•••• ${card.last} · ${money(card.balance)}</small></span><span class="connection-radio" aria-hidden="true">${checkoutSession.card===index?'●':'○'}</span></button>`).join('')}</div><button type="button" class="wide" data-checkout-action="link-card">Добавить выбранную карту</button>`);return;
  }
  if(stage==='ready'){
    connectionShell(`<div class="connection-heading"><span>✓</span><h3>Burger King Pay подключён</h3><p>Демонстрационная карта •••• ${checkoutCards[checkoutSession.card].last} добавлена к кошельку.</p></div><div class="connection-wallet"><b>BURGER KING PAY</b><strong>${money(state.balance)}</strong><span>Твой заказ: ${money(total())}</span></div><button type="button" class="wide" data-checkout-action="topup">Проверить баланс и продолжить</button>`);
  }
}
function handleCheckoutAction(event){
  const customer=event.target.closest('[data-customer]');
  if(customer){
    if(checkoutSession.customer!==customer.dataset.customer)Object.assign(checkoutSession,{customer:customer.dataset.customer,connected:null,issued:false,furthest:0});
    cart();return true;
  }
  const rail=event.target.closest('[data-checkout-step]');
  if(rail){checkoutSession.stage=rail.dataset.checkoutStep;renderConnection();return true;}
  const card=event.target.closest('[data-checkout-card]');
  if(card){checkoutSession.card=Number(card.dataset.checkoutCard);renderConnection();return true;}
  const button=event.target.closest('[data-checkout-action]');if(!button)return false;
  const action=button.dataset.checkoutAction;
  if(action==='back'){
    const flow=checkoutFlow(),index=flow.findIndex(item=>item.stage===checkoutSession.stage);
    checkoutSession.stage=flow[Math.max(0,index-1)].stage;renderConnection();
  }
  if(action==='topup'){checkoutSession.stage='topup';renderConnection();}
  if(action==='confirm-topup'){
    state.balance=Math.max(state.balance,total());save();checkoutSession.stage=checkoutSession.customer==='new'?'bind':'payment';renderConnection();
  }
  if(action==='link-card'){
    state.balance=checkoutCards[checkoutSession.card].balance;save();checkoutSession.connected='existing';checkoutSession.stage='ready';renderConnection();
  }
  if(action==='bind-wallet'){checkoutSession.connected='new';checkoutSession.stage='payment';renderConnection();}
  return true;
}
function syncCheckoutPhoneContent(){
  if(!checkoutSession.phoneLinked||journeys[selectedJourney]!==checkoutJourney())return;
  const root=$('#journey-phone-content'),walk=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const replacement=money(checkoutSession.orderAmount);
  let text;while((text=walk.nextNode())){
    text.nodeValue=text.nodeValue.replaceAll('2 729 ₽',replacement).replaceAll('Кинг Бокс — 4 бургера + Кинг Фри',checkoutSession.orderNames).replaceAll('Кинг Бокс · набор',checkoutSession.orderNames);
  }
  for(const item of root.querySelectorAll('div'))if(!item.children.length&&item.textContent.startsWith('Баланс ·')&&journeySteps()[step].screen!=='issued')item.textContent='Баланс · '+money(state.balance);
}
