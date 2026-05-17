/* ========================================
   SCRIPT.JS — João Silva 2026
   Funcionalidades:
   - Navbar scroll + menu mobile
   - Barra de progresso de scroll
   - Reveal on scroll (IntersectionObserver)
   - Contador animado de números
   - Formulário de apoio com localStorage
   - Máscara de telefone
   ======================================== */

// ── NAVBAR: efeito ao rolar ──────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  updateScrollProgress();
});

// ── MENU HAMBÚRGUER ──────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Fecha menu ao clicar em um link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── BARRA DE PROGRESSO DE SCROLL ────────────────────────
function updateScrollProgress() {
  const scrollTop    = window.scrollY;
  const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPct    = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  document.getElementById('scroll-progress').style.width = scrollPct + '%';
}

// ── REVEAL ON SCROLL ─────────────────────────────────────
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => revealObserver.observe(el));

// ── CONTADOR ANIMADO ─────────────────────────────────────
function animarContador(el, target, duration = 1800) {
  const start     = performance.now();
  const isDecimal = target % 1 !== 0;

  function step(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out
    const ease     = 1 - Math.pow(1 - progress, 3);
    const value    = Math.floor(ease * target);
    el.textContent = value.toLocaleString('pt-BR');
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString('pt-BR');
  }

  requestAnimationFrame(step);
}

const numerosSection = document.getElementById('numeros');
let numerosAnimados = false;

const numerosObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !numerosAnimados) {
    numerosAnimados = true;
    document.querySelectorAll('.numero-val').forEach(el => {
      const target = parseInt(el.dataset.target, 10);
      animarContador(el, target);
    });
  }
}, { threshold: 0.3 });

if (numerosSection) numerosObserver.observe(numerosSection);

// ── CONTADOR DE APOIADORES (localStorage) ────────────────
function carregarApoiadores() {
  const base = 2340;
  const extra = parseInt(localStorage.getItem('apoiadores_extra') || '0', 10);
  const total = base + extra;
  const el = document.getElementById('numero-apoiadores');
  if (el) el.textContent = total.toLocaleString('pt-BR');
}

carregarApoiadores();

// ── MÁSCARA DE TELEFONE ───────────────────────────────────
const telInput = document.getElementById('telefone');
if (telInput) {
  telInput.addEventListener('input', (e) => {
    let v = e.target.value.replace(/\D/g, '');
    if (v.length > 11) v = v.slice(0, 11);
    if (v.length > 7) {
      v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    } else if (v.length > 0) {
      v = `(${v}`;
    }
    e.target.value = v;
  });
}

// ── FORMULÁRIO DE APOIO ───────────────────────────────────
function salvarApoiador(event) {
  event.preventDefault();

  const nome      = document.getElementById('nome').value.trim();
  const telefone  = document.getElementById('telefone').value.trim();
  const bairro    = document.getElementById('bairro').value.trim();
  const voluntario = document.getElementById('voluntario').checked;

  // Validação básica
  if (!nome || nome.split(' ').length < 2) {
    mostrarAlerta('Por favor, informe seu nome completo.', 'erro');
    return;
  }

  const telLimpo = telefone.replace(/\D/g, '');
  if (telLimpo.length < 10) {
    mostrarAlerta('Por favor, informe um WhatsApp válido com DDD.', 'erro');
    return;
  }

  // Salvar no localStorage
  const apoiadores = JSON.parse(localStorage.getItem('apoiadores_lista') || '[]');
  const novoApoiador = {
    nome, telefone, bairro, voluntario,
    data: new Date().toLocaleDateString('pt-BR')
  };
  apoiadores.push(novoApoiador);
  localStorage.setItem('apoiadores_lista', JSON.stringify(apoiadores));

  // Incrementar contador
  const extra = parseInt(localStorage.getItem('apoiadores_extra') || '0', 10);
  localStorage.setItem('apoiadores_extra', extra + 1);
  carregarApoiadores();

  // Esconder form e mostrar sucesso
  document.getElementById('form-apoio').style.display = 'none';
  const successMsg = document.getElementById('success-msg');
  successMsg.style.display = 'block';
  successMsg.innerHTML = `
    <i class="fa-solid fa-circle-check"></i>
    <h3>Obrigado, ${nome.split(' ')[0]}!</h3>
    <p>Seu apoio foi registrado com sucesso.<br>Entraremos em contato pelo WhatsApp em breve!</p>
    ${voluntario ? '<p style="margin-top:12px; color:#1d4ed8; font-weight:600;"><i class="fa-solid fa-star"></i> Você se inscreveu como voluntário!</p>' : ''}
  `;
}

// ── ALERTA CUSTOMIZADO ────────────────────────────────────
function mostrarAlerta(msg, tipo) {
  const existente = document.getElementById('alerta-custom');
  if (existente) existente.remove();

  const alerta = document.createElement('div');
  alerta.id = 'alerta-custom';
  alerta.style.cssText = `
    position: fixed; top: 90px; right: 20px;
    background: ${tipo === 'erro' ? '#ef4444' : '#16a34a'};
    color: white; padding: 14px 20px; border-radius: 12px;
    font-size: 14px; font-weight: 600; z-index: 9999;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    animation: fadeInDown 0.3s ease;
    max-width: 320px;
  `;
  alerta.innerHTML = `<i class="fa-solid fa-${tipo === 'erro' ? 'triangle-exclamation' : 'check'}"></i> ${msg}`;
  document.body.appendChild(alerta);
  setTimeout(() => alerta.remove(), 3500);
}

// ── ACTIVE NAV LINK AO ROLAR ─────────────────────────────
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 120;
  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');
    const link   = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (link) {
      link.style.color = (scrollY >= top && scrollY < top + height)
        ? 'white'
        : '';
    }
  });
});
