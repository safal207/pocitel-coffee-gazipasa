// On-site communication aid. No form submission, free-text collection or network.
const words={
 tr:['Ekibimizden yardım','Bu ekranı ekibimize gösterin. Mesaj gönderilmez.', 'Konu','Menü veya içerik sorusu','Fiyat veya sipariş sorusu','Alerjen sorusu','Sitede teknik sorun','Kapat'],
 en:['Ask our team','Show this screen to our team. No message is sent.', 'Topic','Menu or ingredients question','Price or order question','Allergen question','Website issue','Close'],
 ru:['Обратиться к сотруднику','Покажите этот экран сотруднику. Сообщение не отправляется.', 'Тема','Вопрос о меню или составе','Вопрос о цене или заказе','Вопрос об аллергенах','Проблема с сайтом','Закрыть'],
};
const trigger=document.createElement('button');trigger.type='button';trigger.id='open-feedback';trigger.className='button quiet';
const dialog=document.createElement('dialog');dialog.id='feedback';dialog.setAttribute('aria-labelledby','feedback-title');
const title=document.createElement('h2');title.id='feedback-title';
const hint=document.createElement('p');
const label=document.createElement('label');label.htmlFor='feedback-topic';
const select=document.createElement('select');select.id='feedback-topic';
for(let i=0;i<4;i++){const option=document.createElement('option');option.value=String(i);select.append(option)}
const question=document.createElement('p');question.lang='tr';question.setAttribute('role','status');
const close=document.createElement('button');close.type='button';close.className='button primary';
dialog.append(title,hint,label,select,question,close);document.body.append(dialog);
document.querySelector('footer')?.append(trigger);
function render(){const text=words[document.documentElement.lang]??words.tr;trigger.textContent=text[0];title.textContent=text[0];hint.textContent=text[1];label.textContent=text[2];
 [...select.options].forEach((option,i)=>{option.textContent=text[i+3]});question.textContent=words.tr[3+Number(select.value)];close.textContent=text[7];}
trigger.addEventListener('click',()=>{render();dialog.showModal();select.focus()});
select.addEventListener('change',render);
close.addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>trigger.focus({preventScroll:true}));
new MutationObserver(render).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
render();
