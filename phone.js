/* Touch interactions for the original application screens. All actions are local demos. */
let phoneDemo={balance:4500,frozen:false,automatic:false,history:[]};
function phoneGo(screen){
  const index=journeySteps().findIndex(item=>item.screen===screen);
  if(index>=0){step=index;journey();return;}
  toast('Этот экран доступен в другом сценарии');
}
function phoneNext(){if(step<journeySteps().length-1){step++;journey();}}
function phoneTap(element,action){
  const button=document.createElement('button');
  for(const attribute of element.attributes)button.setAttribute(attribute.name,attribute.value);
  button.type='button';button.classList.add('phone-tap');button.dataset.phoneAction=action;
  button.innerHTML=element.innerHTML;
  button.style.width='100%';button.style.textAlign=element.style.textAlign||'left';
  button.style.borderRadius=element.style.borderRadius||'0';
  if(!element.style.background)button.style.background='transparent';
  element.replaceWith(button);return button;
}
function phoneRows(){
  return [...document.querySelectorAll('#journey-phone-content div')].filter(element=>element.style.display==='flex'&&element.style.padding&&element.style.borderRadius&&element.style.border);
}
function phoneWireText(text,action){
  const root=document.querySelector('#journey-phone-content');
  const label=[...root.querySelectorAll('div,span')].find(element=>!element.children.length&&element.textContent.trim()===text);
  if(!label)return;
  let element=label.parentElement;
  while(element&&element!==root){
    if(element.style.padding&&(element.style.display==='flex'||element.style.textAlign==='center'))return phoneTap(element,action);
    element=element.parentElement;
  }
}
function phoneChoice(rows,group){
  rows.forEach((row,index)=>{
    const button=phoneTap(row,'choose:'+group);
    button.dataset.choiceIndex=index;button.setAttribute('aria-pressed',String(index===0));button.classList.add('phone-choice');
  });
}
function phoneAppend(label,action){
  const button=document.createElement('button');button.className='phone-tap phone-primary';button.type='button';
  button.dataset.phoneAction=action;button.textContent=label;
  document.querySelector('#journey-phone-content').firstElementChild.append(button);
}
function phoneEditable(label,valueElement,options={}){
  if(!valueElement)return;
  const input=document.createElement('input');input.className='phone-input';input.value=valueElement.textContent;
  input.setAttribute('aria-label',label+' (демо)');input.type='text';input.autocomplete='off';
  Object.assign(input,options);valueElement.replaceWith(input);
}
function enhanceJourneyPhone(screen){
  const root=document.querySelector('#journey-phone-content');root.dataset.screen=screen;
  root.onclick=phoneAction;
  root.oninput=event=>{if(event.target.dataset.profileField)checkoutProfile[event.target.dataset.profileField]=event.target.value;};
  if(['bind','checkout_methods','delivery'].includes(screen))phoneChoice(phoneRows(),screen);
  if(screen==='select_card'){
    const rows=phoneRows();phoneChoice(rows.slice(0,2),'cards');
    const newCard=rows.find(row=>row.textContent.includes('Выпустить новую карту'));
    if(newCard)phoneTap(newCard,'new-card');
  }
  if(screen==='identify'){
    const phone=[...root.querySelectorAll('div')].find(element=>!element.children.length&&element.textContent==='+7 (999) 123-45-67');
    phoneEditable('Номер телефона',phone,{inputMode:'tel',maxLength:22});
    const code=[...root.querySelectorAll('div')].find(element=>element.style.gap==='7px'&&element.children.length===4);
    if(code)[...code.children].forEach((element,index)=>phoneEditable('Цифра '+(index+1)+' кода',element,{inputMode:'numeric',maxLength:1}));
    if(code)code.classList.add('phone-code');
  }
  if(screen==='form'){
    for(const label of ['Фамилия','Имя','Отчество','Дата рождения']){
      const element=[...root.querySelectorAll('div')].find(item=>!item.children.length&&item.textContent===label);
      if(element){
        phoneEditable(label,element.nextElementSibling,{maxLength:60});
        const input=root.querySelector('input[aria-label="'+label+' (демо)"]');
        const field={'Фамилия':'surname','Имя':'givenName','Отчество':'patronymic','Дата рождения':'birthDate'}[label];
        input.dataset.profileField=field;input.value=checkoutProfile[field];
        if(field==='birthDate')input.type='date';
      }
    }
  }
  if(['pay_bonus','paid','offline_done'].includes(screen))phoneAppend('Начать заново','restart');
  if(screen==='qr_loyalty'){
    phoneTap(root.querySelector('svg').parentElement,'next');phoneAppend('Показать код кассиру','next');
  }
  if(screen==='cashier')phoneAppend('Подтвердить демооплату','next');
  if(screen==='profile_access')phoneWireText('Кошелёк Burger King Pay','go:wallet_home');
  if(screen==='wallet_home'){
    phoneWireText('Пополнить','go:wallet_topup');phoneWireText('Перевести','transfer');phoneWireText('Действия','go:wallet_actions');
    const balance=[...root.querySelectorAll('div')].find(element=>!element.children.length&&element.textContent.startsWith('Баланс ·'));
    if(balance)balance.textContent='Баланс · '+money(phoneDemo.balance);
    if(phoneDemo.history.length){const history=document.createElement('p');history.className='phone-history';history.textContent=phoneDemo.history.at(-1);root.firstElementChild.append(history);}
  }
  if(screen==='wallet_topup')for(const row of phoneRows())phoneTap(row,row.textContent.includes('Автопополнение')?'automatic':'topup');
  if(screen==='wallet_actions'){
    const actions={'Реквизиты кошелька':'go:wallet_requisites','Изменить ПИН-код':'pin','Автопополнение':'automatic','Заморозить кошелёк':'freeze','Тарифы и условия':'terms','Закрыть кошелёк':'close-wallet'};
    for(const [label,action]of Object.entries(actions)){
      const button=phoneWireText(label,action);
      if(action==='freeze'&&button&&phoneDemo.frozen)button.innerHTML=button.innerHTML.replace('Заморозить кошелёк','Разморозить кошелёк');
    }
  }
  if(screen==='wallet_requisites'){
    const eye=root.querySelector('svg circle[cx="12"]');
    if(eye){const button=phoneTap(eye.parentElement.parentElement,'show-cvc');button.setAttribute('aria-label','Показать демонстрационный CVC');button.style.width='auto';}
  }
}
function phoneSubview(title,html){
  document.querySelector('#journey-screen-title').textContent=title;
  document.querySelector('#journey-phone-content').innerHTML='<div class="phone-subview"><button type="button" class="phone-tap phone-back" data-phone-action="back">← Назад</button><h4>'+title+'</h4>'+html+'<p class="phone-disclaimer">Деморежим. Реальные деньги и банковские настройки не меняются.</p></div>';
}
function phoneAmount(transfer=false){
  phoneSubview(transfer?'Перевод':'Пополнение',`<p>Демобаланс: ${money(phoneDemo.balance)}</p><label for="phone-amount">Сумма, ₽</label><input class="phone-input" id="phone-amount" type="number" min="1" max="1000000" step="1" value="1000" inputmode="numeric"><p id="phone-error" role="alert"></p><button type="button" class="phone-tap phone-primary" data-phone-action="${transfer?'confirm-transfer':'confirm-topup'}">${transfer?'Перевести':'Пополнить'} (демо)</button>`);
}
async function phoneAction(event){
  const button=event.target.closest('button[data-phone-action]');if(!button)return;
  const action=button.dataset.phoneAction;
  if(action.startsWith('go:'))return phoneGo(action.slice(3));
  if(action.startsWith('choose:')){
    const buttons=[...button.parentElement.querySelectorAll('.phone-choice')];
    for(const option of buttons){
      const chosen=option===button;option.setAttribute('aria-pressed',String(chosen));
      option.style.border=chosen?'1.5px solid var(--ink-1)':'1px solid var(--phone-line-1)';option.style.background=chosen?'var(--phone-surf)':'#fff';
      const indicator=option.lastElementChild;
      if(indicator?.style.borderRadius==='50%')indicator.innerHTML=chosen?'<span style="width:8px;height:8px;border-radius:50%;background:var(--ink-1)"></span>':'';
    }
    if(action==='choose:checkout_methods'){
      const pay=document.querySelector('[data-phone-action="Оплатить Burger King Pay"]');
      pay.textContent=button.dataset.choiceIndex==='0'?'Оплатить Burger King Pay':'Продолжить (демо)';
    }
    return;
  }
  if(action==='back')return journey();
  if(action==='restart'){step=0;return journey();}
  if(action==='new-card'){
    selectedJourney=journeys.findIndex(item=>item.id==='no_card');journeyVariant='online';step=3;return journey();
  }
  if(action==='topup')return phoneAmount();
  if(action==='transfer')return phoneAmount(true);
  if(action==='confirm-topup'||action==='confirm-transfer'){
    const amount=Number(document.querySelector('#phone-amount').value);
    if(!Number.isInteger(amount)||amount<1||amount>1000000){document.querySelector('#phone-error').textContent='Введите сумму от 1 до 1 000 000 ₽';return;}
    if(action==='confirm-transfer'&&amount>phoneDemo.balance){document.querySelector('#phone-error').textContent='Недостаточно демосредств';return;}
    phoneDemo.balance+=action==='confirm-topup'?amount:-amount;
    phoneDemo.history.push((action==='confirm-topup'?'Пополнение +':'Перевод −')+money(amount)+' · демо');
    phoneGo('wallet_home');toast('Демобаланс обновлён');return;
  }
  if(action==='automatic'){
    phoneSubview('Автопополнение',`<p>При низком балансе кошелёк может пополняться автоматически.</p><button type="button" class="phone-tap phone-primary" data-phone-action="toggle-automatic">${phoneDemo.automatic?'Выключить':'Включить'} в демо</button>`);return;
  }
  if(action==='toggle-automatic'){phoneDemo.automatic=!phoneDemo.automatic;journey();toast('Автопополнение '+(phoneDemo.automatic?'включено':'выключено')+' (демо)');return;}
  if(action==='freeze'){phoneDemo.frozen=!phoneDemo.frozen;journey();toast('Кошелёк '+(phoneDemo.frozen?'заморожен':'разморожен')+' (демо)');return;}
  if(action==='pin'){
    phoneSubview('Изменить ПИН-код','<label for="phone-pin">Новый ПИН (демо)</label><input class="phone-input" id="phone-pin" type="password" inputmode="numeric" maxlength="4" placeholder="4 цифры" autocomplete="off"><p id="phone-error" role="alert"></p><button type="button" class="phone-tap phone-primary" data-phone-action="save-pin">Сохранить (демо)</button>');return;
  }
  if(action==='save-pin'){
    if(!/^\d{4}$/.test(document.querySelector('#phone-pin').value)){document.querySelector('#phone-error').textContent='Введите 4 цифры';return;}
    journey();toast('ПИН изменён в демонстрации');return;
  }
  if(action==='terms'){phoneSubview('Тарифы и условия','<p>Тарифы и условия определяет банк при запуске продукта. В демонстрации банковское обслуживание не подключено.</p>');return;}
  if(action==='close-wallet'){
    phoneSubview('Закрыть кошелёк','<p>Завершить демонстрацию управления кошельком?</p><button type="button" class="phone-tap phone-primary" data-phone-action="restart">Завершить демосценарий</button>');return;
  }
  if(action==='show-cvc'){
    const value=button.previousElementSibling;const shown=value.textContent==='123';value.textContent=shown?'•••':'123';button.setAttribute('aria-label',shown?'Показать демонстрационный CVC':'Скрыть демонстрационный CVC');return;
  }
  if(action==='Скопировать реквизиты'){
    const text='Демонстрационные реквизиты: 4790 12•• •••• 4567, 08/29';
    try{await navigator.clipboard.writeText(text);toast('Демонстрационные реквизиты скопированы');}
    catch{phoneSubview('Демонстрационные реквизиты','<p>4790 12•• •••• 4567<br>Срок действия: 08/29</p>');}return;
  }
  if(action==='Оплатить'&&journeySteps()[step].screen==='issued')toast('Сначала пополните демокошелёк');
  phoneNext();
}
