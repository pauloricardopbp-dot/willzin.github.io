const header = document.getElementById('header');
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

menuToggle.addEventListener('click', () => {
  const open = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', open);
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

const tabs = document.querySelectorAll('.model-tab');
const panels = document.querySelectorAll('.model-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const id = tab.dataset.tab;

    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });

    panels.forEach(panel => panel.classList.remove('active'));

    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    document.querySelector(`[data-panel="${id}"]`).classList.add('active');
  });
});

document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const isOpen = item.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm && formStatus) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    formStatus.textContent = 'Formulário demonstrativo. Integre-o a um serviço de envio antes de publicar.';
  });
}


// Victoria Juris — transição entre páginas
(() => {
  const loader = document.getElementById('pageLoaderLegacyRemoved');
  if (!loader) return;

  const showLoader = () => {
    loader.classList.add('is-visible');
    loader.setAttribute('aria-hidden', 'false');
  };

  const hideLoader = () => {
    loader.classList.remove('is-visible');
    loader.setAttribute('aria-hidden', 'true');
  };

  // Garante que o loader desapareça ao voltar pelo histórico do navegador.
  window.addEventListener('pageshow', hideLoader);

  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
        href.startsWith('tel:') || link.target === '_blank' ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

    let url;
    try {
      url = new URL(link.href, window.location.href);
    } catch {
      return;
    }

    // Só usa a animação para navegação interna do próprio site.
    if (url.origin !== window.location.origin) return;

    event.preventDefault();
    showLoader();

    // Pequeno tempo proposital para a identidade visual aparecer sem deixar a navegação lenta.
    setTimeout(() => {
      window.location.href = link.href;
    }, 380);
  });
})();


// =========================================================
// MOTION CONCEPT — V6 limpa
// =========================================================
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  // Barra fina de progresso.
  const progress=document.createElement('div');
  progress.className='motion-progress';
  document.body.appendChild(progress);

  // HERO: identifica o bloco de conteúdo textual dentro do container.
  const hero=document.querySelector('.hero-old-motion-disabled');
  let heroCopy=null;
  if(hero){
    // Na V6 o conteúdo principal vive dentro do container do hero.
    // Criamos um wrapper só para a parte esquerda quando possível.
    const container=hero.querySelector('.container');
    if(container){
      const candidates=[...container.children];
      // O primeiro filho estrutural costuma ser o bloco de texto.
      heroCopy=candidates.find(el =>
        el.querySelector && (el.querySelector('h1') || el.matches('.hero-content,.hero-copy'))
      );
      if(!heroCopy && container.querySelector('h1')){
        heroCopy=container.querySelector('h1').parentElement;
      }
      if(heroCopy) heroCopy.classList.add('hero-copy-motion');
    }
  }

  // Títulos / introduções entram primeiro.
  const headings=document.querySelectorAll(
    'main section:not(.hero) .section-heading, main section:not(.hero) .office-heading, '+
    'main section:not(.hero) h2'
  );
  headings.forEach((el,i)=>{
    if(el.closest('.section-heading') && el!==el.closest('.section-heading')) return;
    el.classList.add('motion-reveal');
    if(i%3===1) el.classList.add('motion-from-left');
  });

  // Cards e blocos repetidos: entrada escalonada.
  const selector=[
    '.issue-card','.area-card','.article-card','.value-card','.diff-card',
    '.pillar-card','.model-card','.audience-card','.law-card'
  ].join(',');
  const cards=[...document.querySelectorAll(selector)];
  cards.forEach((card,i)=>{
    card.classList.add('motion-card');
    const group=[...card.parentElement.children].filter(x=>x.matches(selector));
    const pos=Math.max(0,group.indexOf(card));
    card.dataset.motionCol=String(pos%3);
    card.style.setProperty('--motion-delay',`${Math.min(pos%6,5)*95}ms`);
  });

  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('motion-in');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.14,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.motion-reveal,.motion-card').forEach(el=>observer.observe(el));

  let ticking=false;
  function update(){
    const y=scrollY||0;
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    progress.style.transform=`scaleX(${Math.min(1,y/max)})`;

    // Movimento solicitado: SÓ o bloco textual do hero sai à esquerda.
    // O fundo azul e a arte VJ continuam compondo a seção.
    if(hero && heroCopy){
      const h=Math.max(hero.offsetHeight,1);
      const start=h*.08, end=h*.72;
      const raw=(y-start)/(end-start);
      const t=Math.max(0,Math.min(1,raw));
      const ease=1-Math.pow(1-t,3);
      const travel=Math.min(innerWidth*.72,980)*ease;
      heroCopy.style.transform=`translate3d(${-travel}px,0,0)`;
      heroCopy.style.opacity=String(1-.94*ease);
    }
    ticking=false;
  }
  function request(){if(!ticking){requestAnimationFrame(update);ticking=true}}
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',request);
  update();
})();

// =========================================================
// V²R²W MOTION V1
// vertical page movement + horizontal outgoing elements
// =========================================================
(()=>{
 document.documentElement.classList.add('motion-ready');

 // Identify hero copy on every page.
 const hero=document.querySelector('.hero,.page-hero');
 let copy=null;
 if(hero){
   copy=hero.querySelector('.hero-content,.hero-copy,.page-hero-content');
   if(!copy){
     const h=hero.querySelector('h1');
     if(h) copy=h.parentElement;
   }
   if(copy) copy.classList.add('motion-scene-copy');
 }

 // Reveal groups safely. If JS/observer fails, fallback removes motion-ready.
 const cardSel='.issue-card,.area-card,.article-card,.value-card,.diff-card,.pillar-card,.model-card,.audience-card,.law-card';
 const cards=[...document.querySelectorAll(cardSel)];
 cards.forEach((c,i)=>{
   c.classList.add('motion-card');
   const siblings=[...c.parentElement.children].filter(x=>x.matches(cardSel));
   const pos=Math.max(0,siblings.indexOf(c));
   c.style.setProperty('--motion-delay',`${Math.min(pos,5)*90}ms`);
 });
 const reveals=[...document.querySelectorAll('main section:not(.hero):not(.page-hero) .section-heading,main section:not(.hero):not(.page-hero) .office-heading')];
 reveals.forEach(x=>x.classList.add('motion-reveal'));

 if('IntersectionObserver' in window){
   const ob=new IntersectionObserver(entries=>entries.forEach(e=>{
     if(e.isIntersecting){e.target.classList.add('motion-in');ob.unobserve(e.target)}
   }),{threshold:.08,rootMargin:'0px 0px -5% 0px'});
   [...cards,...reveals].forEach(x=>ob.observe(x));
   // content already in viewport gets shown immediately
   requestAnimationFrame(()=>[...cards,...reveals].forEach(x=>{
     const r=x.getBoundingClientRect();
     if(r.top<innerHeight && r.bottom>0)x.classList.add('motion-in');
   }));
 }else{
   [...cards,...reveals].forEach(x=>x.classList.add('motion-in'));
 }

 let ticking=false;
 const update=()=>{
   const y=scrollY||0;
   if(hero&&copy){
     const top=hero.offsetTop;
     const local=Math.max(0,y-top);
     const range=Math.max(hero.offsetHeight*.58,280);
     const t=Math.min(1,local/range);
     const ease=1-Math.pow(1-t,3);

     // Motion V2 overrides this scene movement below.
     // Keep V1 observer/reveal system, but do not push the copy left here.
   }
   ticking=false;
 };
 const req=()=>{if(!ticking){requestAnimationFrame(update);ticking=true}};
 addEventListener('scroll',req,{passive:true});
 addEventListener('resize',req);
 update();

 // Absolute fallback: never leave content invisible because of animation.
 setTimeout(()=>{
   document.querySelectorAll('.motion-card,.motion-reveal').forEach(x=>x.classList.add('motion-in'));
 },2200);
})();

// =========================================================
// MOTION V2 — comportamento conforme o desenho do usuário:
// o conteúdo da capa curva visualmente para CIMA + DIREITA,
// enquanto a rolagem vertical já entrega a próxima seção.
// =========================================================
(()=>{
  const hero=document.querySelector('.hero-v2-disabled,.page-hero-v2-disabled');
  if(!hero) return;

  let copy=hero.querySelector('.hero-content,.hero-copy,.page-hero-content,.motion-scene-copy');
  if(!copy){
    const h1=hero.querySelector('h1');
    if(h1) copy=h1.parentElement;
  }
  const deco=hero.querySelector('.hero-visual,.hero-art,.visual');
  let ticking=false;

  function update(){
    const y=window.scrollY||0;
    const top=hero.offsetTop;
    const local=Math.max(0,y-top);

    // Curto: com pouco scroll a capa já está praticamente encerrada.
    const range=Math.max(230,Math.min(hero.offsetHeight*.38,390));
    const t=Math.max(0,Math.min(1,local/range));
    const ease=1-Math.pow(1-t,3);

    if(copy){
      // Direção VERDE: sobe e vai para a direita.
      const x=Math.min(window.innerWidth*.30,480)*ease;
      const up=Math.min(hero.offsetHeight*.34,250)*ease;
      // pequena aceleração/escala ajuda a sensação de profundidade
      copy.style.transform=`translate3d(${x}px,${-up}px,0) scale(${1-.035*ease})`;
      copy.style.opacity=String(Math.max(0,1-ease*1.12));
    }

    if(deco){
      // Arte acompanha a mesma linguagem, mas mais devagar.
      const dx=Math.min(window.innerWidth*.14,220)*ease;
      const dy=Math.min(hero.offsetHeight*.20,145)*ease;
      deco.style.transform=`translate3d(${dx}px,${-dy}px,0)`;
      deco.style.opacity=String(Math.max(0,1-ease*1.08));
    }

    // A capa não atravessa lateralmente; apenas perde presença
    // enquanto o scroll normal traz a próxima seção por baixo.
    hero.style.opacity=String(Math.max(.18,1-ease*.30));
    ticking=false;
  }

  function request(){
    if(!ticking){requestAnimationFrame(update);ticking=true}
  }
  addEventListener('scroll',request,{passive:true});
  addEventListener('resize',request);
  update();
})();

// =========================================================
// MOTION V3 — transição encaixada:
// 1) conteúdo da capa sobe + direita;
// 2) ao MESMO TEMPO, a próxima seção sobe cobrindo a capa;
// 3) não existe estágio com "capa vazia".
// =========================================================
(()=>{
 const hero=document.querySelector('.hero-v3-disabled,.page-hero-v3-disabled'); if(!hero)return;
 const next=hero.nextElementSibling;
 let copy=hero.querySelector('.hero-content,.hero-copy,.page-hero-content,.motion-scene-copy');
 if(!copy){const h=hero.querySelector('h1');if(h)copy=h.parentElement}
 const deco=hero.querySelector('.hero-visual,.hero-art,.visual');
 let ticking=false;

 function update(){
   const y=scrollY||0, top=hero.offsetTop, local=Math.max(0,y-top);
   // A transição inteira ocorre em pouco scroll.
   const range=Math.max(210,Math.min(innerHeight*.34,330));
   const t=Math.max(0,Math.min(1,local/range));
   const ease=1-Math.pow(1-t,3);

   if(copy){
     const x=Math.min(innerWidth*.27,430)*ease;
     const up=Math.min(hero.offsetHeight*.30,225)*ease;
     copy.style.transform=`translate3d(${x}px,${-up}px,0) scale(${1-.025*ease})`;
     copy.style.opacity=String(Math.max(0,1-ease*1.18));
   }
   if(deco){
     deco.style.transform=`translate3d(${Math.min(innerWidth*.12,190)*ease}px,${-Math.min(hero.offsetHeight*.17,125)*ease}px,0)`;
     deco.style.opacity=String(Math.max(0,1-ease*1.12));
   }

   // Fundamental: a seção de baixo SOBE junto, tapando a capa.
   // No fim da curta transição, seu topo já alcançou o topo visível.
   if(next){
     const heroRect=hero.getBoundingClientRect();
     const desiredLift=Math.max(0,hero.offsetHeight - range*.18);
     next.style.transform=`translate3d(0,${-desiredLift*ease}px,0)`;
     // Compensa visualmente para não criar buraco depois da seção.
     next.style.marginBottom=`${-desiredLift*ease}px`;
   }
   ticking=false;
 }
 const req=()=>{if(!ticking){requestAnimationFrame(update);ticking=true}};
 addEventListener('scroll',req,{passive:true});addEventListener('resize',req);update();
})();

// =========================================================
// V4 — UMA RODADA DO SCROLL troca a cena inteira.
// A capa some 100%; nada azul fica aparecendo.
// =========================================================
(()=>{
 const hero=document.querySelector('.hero-v4-disabled,.page-hero-v4-disabled'); if(!hero)return;
 const next=hero.nextElementSibling; if(!next)return;
 let copy=hero.querySelector('.hero-content,.hero-copy,.page-hero-content,.motion-scene-copy');
 if(!copy){const h=hero.querySelector('h1');if(h)copy=h.parentElement}
 const deco=hero.querySelector('.hero-visual,.hero-art,.visual');
 let locked=false, atNext=false;

 const duration=620;
 const ease=t=>1-Math.pow(1-t,4);

 function animateScene(toNext){
   if(locked)return;
   locked=true;
   hero.classList.remove('motion-cover-gone');
   const start=performance.now();
   const startY=scrollY;
   const targetY=toNext ? next.offsetTop : hero.offsetTop;
   const delta=targetY-startY;

   function frame(now){
     const t=Math.min(1,(now-start)/duration), e=ease(t);
     // Real scroll: guarantees no blue strip remains after completion.
     window.scrollTo(0,startY+delta*e);

     if(copy){
       const p=toNext?e:1-e;
       copy.style.transform=`translate3d(${Math.min(innerWidth*.28,440)*p}px,${-Math.min(hero.offsetHeight*.30,225)*p}px,0) scale(${1-.025*p})`;
       copy.style.opacity=String(1-p);
     }
     if(deco){
       const p=toNext?e:1-e;
       deco.style.transform=`translate3d(${Math.min(innerWidth*.12,190)*p}px,${-Math.min(hero.offsetHeight*.17,125)*p}px,0)`;
       deco.style.opacity=String(1-p);
     }
     if(t<1) requestAnimationFrame(frame);
     else{
       atNext=toNext;
       locked=false;
       if(toNext){
         window.scrollTo(0,targetY);
         hero.classList.add('motion-cover-gone');
       }else{
         hero.classList.remove('motion-cover-gone');
         window.scrollTo(0,targetY);
       }
     }
   }
   requestAnimationFrame(frame);
 }

 // One wheel notch while the cover is active = complete transition.
 addEventListener('wheel',e=>{
   if(locked){e.preventDefault();return}
   const y=scrollY;
   const nearHero=y < next.offsetTop-4;
   if(e.deltaY>0 && nearHero){
     e.preventDefault(); animateScene(true);
   }else if(e.deltaY<0 && y<=next.offsetTop+6 && y>hero.offsetTop+4){
     e.preventDefault(); animateScene(false);
   }
 },{passive:false});

 // Keyboard equivalent.
 addEventListener('keydown',e=>{
   if(['ArrowDown','PageDown',' '].includes(e.key) && scrollY<next.offsetTop-4){
     e.preventDefault();animateScene(true);
   }
 });

 // On refresh at/after section 2, never expose the hero strip.
 const sync=()=>{
   if(scrollY>=next.offsetTop-2)hero.classList.add('motion-cover-gone');
   else if(!locked)hero.classList.remove('motion-cover-gone');
 };
 addEventListener('scroll',sync,{passive:true});sync();
})();

// =========================================================
// V5 — transição em DUAS ETAPAS:
// 1. primeiro a animação da capa acontece;
// 2. depois a página desce suavemente para a próxima seção.
// Um único scroll inicia tudo.
// =========================================================
(()=>{
 const hero=document.querySelector('.hero-v5-disabled,.page-hero-v5-disabled'); if(!hero)return;
 const next=hero.nextElementSibling; if(!next)return;
 let copy=hero.querySelector('.hero-content,.hero-copy,.page-hero-content,.motion-scene-copy');
 if(!copy){const h=hero.querySelector('h1');if(h)copy=h.parentElement}
 const deco=hero.querySelector('.hero-visual,.hero-art,.visual');
 let locked=false;

 const sceneDuration=720;   // animação da capa primeiro
 const scrollDuration=820;  // depois descida suave
 const ease=t=>1-Math.pow(1-t,4);
 const smooth=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

 function animateCover(out, done){
   const start=performance.now();
   function frame(now){
     const t=Math.min(1,(now-start)/sceneDuration), e=ease(t);
     const p=out?e:1-e;
     if(copy){
       copy.style.transform=`translate3d(${Math.min(innerWidth*.28,440)*p}px,${-Math.min(hero.offsetHeight*.30,225)*p}px,0) scale(${1-.025*p})`;
       copy.style.opacity=String(1-p);
     }
     if(deco){
       deco.style.transform=`translate3d(${Math.min(innerWidth*.12,190)*p}px,${-Math.min(hero.offsetHeight*.17,125)*p}px,0)`;
       deco.style.opacity=String(1-p);
     }
     if(t<1)requestAnimationFrame(frame); else done();
   }
   requestAnimationFrame(frame);
 }

 function smoothScrollTo(target, done){
   const startY=scrollY, delta=target-startY, start=performance.now();
   function frame(now){
     const t=Math.min(1,(now-start)/scrollDuration);
     window.scrollTo(0,startY+delta*smooth(t));
     if(t<1)requestAnimationFrame(frame); else {window.scrollTo(0,target);done()}
   }
   requestAnimationFrame(frame);
 }

 function goDown(){
   if(locked)return; locked=true;
   hero.classList.remove('motion-cover-gone');
   // Importante: NÃO rola enquanto a animação está acontecendo.
   animateCover(true,()=>{
     smoothScrollTo(next.offsetTop,()=>{
       hero.classList.add('motion-cover-gone');
       locked=false;
     });
   });
 }

 function goUp(){
   if(locked)return; locked=true;
   hero.classList.remove('motion-cover-gone');
   // Ao voltar, primeiro retornamos à capa e só então remontamos o conteúdo.
   smoothScrollTo(hero.offsetTop,()=>{
     animateCover(false,()=>{locked=false});
   });
 }

 addEventListener('wheel',e=>{
   if(locked){e.preventDefault();return}
   if(e.deltaY>0 && scrollY<next.offsetTop-4){
     e.preventDefault();goDown();
   }else if(e.deltaY<0 && scrollY<=next.offsetTop+8 && scrollY>hero.offsetTop+4){
     e.preventDefault();goUp();
   }
 },{passive:false});

 addEventListener('keydown',e=>{
   if(['ArrowDown','PageDown',' '].includes(e.key) && scrollY<next.offsetTop-4){
     e.preventDefault();goDown();
   }
 });

 // Não deixa faixa azul ao carregar já na segunda seção.
 if(scrollY>=next.offsetTop-2)hero.classList.add('motion-cover-gone');
})();


// =========================================================
// V6 — two-stage transition with exact reset + sticky header
// =========================================================
(()=>{
 const hero=document.querySelector('.hero,.page-hero'); if(!hero)return;
 const next=hero.nextElementSibling; if(!next)return;
 let copy=hero.querySelector('.hero-content,.hero-copy,.page-hero-content,.motion-scene-copy');
 if(!copy){const h=hero.querySelector('h1');if(h)copy=h.parentElement}
 const deco=hero.querySelector('.hero-visual,.hero-art,.visual');
 let locked=false;
 const sceneDuration=720, scrollDuration=820;
 const ease=t=>1-Math.pow(1-t,4);
 const smooth=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;

 function resetBase(){
   hero.classList.remove('motion-cover-gone');
   hero.style.visibility=''; hero.style.opacity='';
   next.style.transform=''; next.style.marginBottom='';
   if(copy){copy.style.transform='';copy.style.opacity=''}
   if(deco){deco.style.transform='';deco.style.opacity=''}
 }
 function cover(out,done){
   const st=performance.now();
   function f(now){
     const t=Math.min(1,(now-st)/sceneDuration),e=ease(t),p=out?e:1-e;
     if(copy){copy.style.transform=`translate3d(${Math.min(innerWidth*.28,440)*p}px,${-Math.min(hero.offsetHeight*.30,225)*p}px,0) scale(${1-.025*p})`;copy.style.opacity=String(1-p)}
     if(deco){deco.style.transform=`translate3d(${Math.min(innerWidth*.12,190)*p}px,${-Math.min(hero.offsetHeight*.17,125)*p}px,0)`;deco.style.opacity=String(1-p)}
     if(t<1)requestAnimationFrame(f);else done();
   } requestAnimationFrame(f);
 }
 function scrollToY(target,done){
   const sy=scrollY,d=target-sy,st=performance.now();
   function f(now){const t=Math.min(1,(now-st)/scrollDuration);scrollTo(0,sy+d*smooth(t));if(t<1)requestAnimationFrame(f);else{scrollTo(0,target);done()}}
   requestAnimationFrame(f);
 }
 function down(){if(locked)return;locked=true;resetBase();cover(true,()=>scrollToY(next.offsetTop,()=>{hero.classList.add('motion-cover-gone');locked=false}))}
 function up(){if(locked)return;locked=true;hero.classList.remove('motion-cover-gone');scrollToY(hero.offsetTop,()=>cover(false,()=>{resetBase();scrollTo(0,hero.offsetTop);locked=false}))}
 addEventListener('wheel',e=>{
   if(locked){e.preventDefault();return}
   if(e.deltaY>0&&scrollY<next.offsetTop-4){e.preventDefault();down()}
   else if(e.deltaY<0&&scrollY<=next.offsetTop+10&&scrollY>hero.offsetTop+4){e.preventDefault();up()}
 },{passive:false});
 addEventListener('keydown',e=>{if(['ArrowDown','PageDown',' '].includes(e.key)&&scrollY<next.offsetTop-4){e.preventDefault();down()}});
 // At exact top always restore pristine base state.
 addEventListener('scroll',()=>{if(!locked&&scrollY<=hero.offsetTop+1)resetBase()},{passive:true});
 if(scrollY<=hero.offsetTop+1)resetBase(); else if(scrollY>=next.offsetTop-2)hero.classList.add('motion-cover-gone');
})();

// =========================================================
// V7 — hard guards for the two confirmed issues.
// =========================================================
(()=>{
 const header=document.querySelector('.site-header');
 const hero=document.querySelector('.hero,.page-hero');
 if(!header||!hero)return;
 const next=hero.nextElementSibling;

 function syncHeaderHeight(){
   const h=Math.round(header.getBoundingClientRect().height)||78;
   document.documentElement.style.setProperty('--fixed-header-h',h+'px');
 }
 syncHeaderHeight();
 addEventListener('resize',syncHeaderHeight);

 // Header must NEVER inherit hide/translate states.
 const keepHeader=()=>{
   header.style.setProperty('position','fixed','important');
   header.style.setProperty('top','0','important');
   header.style.setProperty('transform','none','important');
   header.style.setProperty('opacity','1','important');
   header.style.setProperty('visibility','visible','important');
 };
 keepHeader();

 // Exact reset when returning to the cover.
 let resetTimer;
 const resetCoverIfTop=()=>{
   keepHeader();
   if(scrollY<=2){
     document.body.classList.add('v7-cover-rest');
     hero.classList.remove('motion-cover-gone');
     hero.style.removeProperty('opacity');

     // Clear all animation residue from the next section.
     if(next){
       next.style.removeProperty('transform');
       next.style.removeProperty('margin-bottom');
     }

     // Existing motion code controls copy. Once the return animation has
     // completed at top, guarantee its exact resting state.
     clearTimeout(resetTimer);
     resetTimer=setTimeout(()=>{
       if(scrollY<=2){
         const copy=hero.querySelector('.hero-content,.hero-copy,.page-hero-content,.motion-scene-copy') ||
                    hero.querySelector('h1')?.parentElement;
         const deco=hero.querySelector('.hero-visual,.hero-art,.visual');
         if(copy){
           copy.style.transform='translate3d(0,0,0) scale(1)';
           copy.style.opacity='1';
         }
         if(deco){
           deco.style.transform='translate3d(0,0,0)';
           deco.style.opacity='1';
         }
         window.scrollTo(0,0);
       }
     },80);
   }else{
     document.body.classList.remove('v7-cover-rest');
   }
 };
 addEventListener('scroll',resetCoverIfTop,{passive:true});
 resetCoverIfTop();

 // Observe accidental class/style changes from legacy code and immediately
 // restore the fixed header.
 new MutationObserver(keepHeader).observe(header,{
   attributes:true,attributeFilter:['class','style']
 });
})();

// V8 loader — intentionally visible long enough to be perceived.
(()=>{
 const l=document.getElementById('premiumLoader');if(!l)return;
 const born=performance.now(), minimum=2500;
 const close=()=>setTimeout(()=>l.classList.add('is-leaving'),Math.max(0,minimum-(performance.now()-born)));
 if(document.readyState==='complete')close();else addEventListener('load',close,{once:true});
})();

// V9B hard cleanup: old loader must never exist or flash.
(()=>{
 document.querySelectorAll('.page-loader,#pageLoader,.vj-loader').forEach(el=>{
   if(!el.closest('#premiumLoader')) el.remove();
 });
})();
