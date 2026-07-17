/* ==========================================================
   Ember & Oak — Frontend Web Development Competition 2026
   Vanilla JS: navigation, menu filter/search, form validation,
   scroll reveals, local storage for reservations.
   ========================================================== */
 
document.addEventListener('DOMContentLoaded', () => {
 
  /* ---------- Sticky nav ---------- */
  const nav = document.querySelector('.nav');
  const toTop = document.querySelector('.to-top');
 
  const onScroll = () => {
    if (window.scrollY > 40) {
      nav?.classList.add('scrolled');
    } else {
      nav?.classList.remove('scrolled');
    }
    if (toTop) {
      window.scrollY > 500 ? toTop.classList.add('show') : toTop.classList.remove('show');
    }
  };
  window.addEventListener('scroll', onScroll);
  onScroll();
 
  toTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
 
  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  const navOverlay = document.querySelector('.nav-overlay');
 
  const closeMenu = () => {
    navToggle?.classList.remove('open');
    navLinks?.classList.remove('open');
    navOverlay?.classList.remove('open');
  };
 
  navToggle?.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks?.classList.toggle('open');
    navOverlay?.classList.toggle('open');
  });
  navOverlay?.addEventListener('click', closeMenu);
  navLinks?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
 
  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }
 
  /* ---------- Menu filter + search ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuItems = document.querySelectorAll('.menu-item');
  const searchInput = document.querySelector('#menuSearch');
  const emptyState = document.querySelector('.menu-empty');
  let activeCategory = 'all';
 
  const applyMenuFilter = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    let visibleCount = 0;
 
    menuItems.forEach(item => {
      const category = item.dataset.category;
      const name = item.dataset.name.toLowerCase();
      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const matchesSearch = query === '' || name.includes(query);
      const show = matchesCategory && matchesSearch;
      item.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });
 
    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  };
 
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.filter;
      applyMenuFilter();
    });
  });
 
  searchInput?.addEventListener('input', applyMenuFilter);
 
  /* ---------- Reservation form validation ---------- */
  const reserveForm = document.querySelector('#reserveForm');
  const toast = document.querySelector('#toast');
 
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3600);
  };
 
  const setFieldError = (field, message) => {
    const wrap = field.closest('.field');
    const msgEl = wrap?.querySelector('.field-msg');
    wrap?.classList.add('error');
    if (msgEl) msgEl.textContent = message;
  };
 
  const clearFieldError = (field) => {
    const wrap = field.closest('.field');
    const msgEl = wrap?.querySelector('.field-msg');
    wrap?.classList.remove('error');
    if (msgEl) msgEl.textContent = '';
  };
 
  const validators = {
    name: (v) => v.trim().length >= 2 ? '' : 'Please enter your full name.',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.',
    phone: (v) => /^[0-9+\-\s()]{7,15}$/.test(v.trim()) ? '' : 'Enter a valid phone number.',
    date: (v) => {
      if (!v) return 'Please choose a date.';
      const chosen = new Date(v);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return chosen >= today ? '' : 'Please choose a future date.';
    },
    time: (v) => v ? '' : 'Please choose a time.',
    guests: (v) => {
      const n = Number(v);
      return n >= 1 && n <= 20 ? '' : 'Guests must be between 1 and 20.';
    }
  };
 
  if (reserveForm) {
    const statusEl = reserveForm.querySelector('.form-status');
 
    reserveForm.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('blur', () => {
        const rule = validators[field.name];
        if (!rule) return;
        const error = rule(field.value);
        error ? setFieldError(field, error) : clearFieldError(field);
      });
    });
 
    reserveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
 
      Object.keys(validators).forEach(name => {
        const field = reserveForm.querySelector(`[name="${name}"]`);
        if (!field) return;
        const error = validators[name](field.value);
        if (error) {
          setFieldError(field, error);
          isValid = false;
        } else {
          clearFieldError(field);
        }
      });
 
      if (!isValid) {
        if (statusEl) {
          statusEl.textContent = 'Please fix the highlighted fields.';
          statusEl.classList.add('show');
          statusEl.style.color = '#e0703f';
        }
        return;
      }
 
      const data = Object.fromEntries(new FormData(reserveForm).entries());
      data.submittedAt = new Date().toISOString();
 
      try {
        const saved = JSON.parse(localStorage.getItem('emberOakReservations') || '[]');
        saved.push(data);
        localStorage.setItem('emberOakReservations', JSON.stringify(saved));
      } catch (err) {
        console.warn('Could not save reservation locally:', err);
      }
 
      if (statusEl) {
        statusEl.textContent = 'Reservation request received — we will confirm by email shortly.';
        statusEl.style.color = '#4a5240';
        statusEl.classList.add('show');
      }
      showToast(`Thank you, ${data.name.split(' ')[0]}. Your table request is in.`);
      reserveForm.reset();
    });
  }
 
  /* ---------- Contact form validation ---------- */
  const contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameField = contactForm.querySelector('[name="name"]');
      const emailField = contactForm.querySelector('[name="email"]');
      const messageField = contactForm.querySelector('[name="message"]');
      let isValid = true;
 
      if (nameField.value.trim().length < 2) {
        setFieldError(nameField, 'Please enter your name.');
        isValid = false;
      } else clearFieldError(nameField);
 
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
        setFieldError(emailField, 'Enter a valid email address.');
        isValid = false;
      } else clearFieldError(emailField);
 
      if (messageField.value.trim().length < 10) {
        setFieldError(messageField, 'Message should be at least 10 characters.');
        isValid = false;
      } else clearFieldError(messageField);
 
      if (!isValid) return;
 
      showToast('Message sent — thank you for reaching out.');
      contactForm.reset();
    });
  }
 
  /* ---------- Footer year ---------- */
  const yearEl = document.querySelector('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
 
});