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
  const loader = document.getElementById('pageLoader');
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
