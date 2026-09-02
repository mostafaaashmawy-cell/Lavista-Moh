/**
 * La Vista Developments — Interactive Functionality & Web3Forms Integration
 * Connects lead submissions to Web3Forms and WhatsApp to +201003565002
 */

document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_NUMBER = '201003565002';

  /* ==========================================================================
     1. STICKY NAVBAR SCROLL STATE
     ========================================================================== */
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  /* ==========================================================================
     2. MOBILE MENU TOGGLE
     ========================================================================== */
  const mobileToggle = document.getElementById('mobile-toggle');
  const mainNav = document.getElementById('main-nav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      const spans = mobileToggle.querySelectorAll('span');
      if (mainNav.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(6px, -6px)';
      } else {
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      }
    });

    // Close mobile nav when clicking nav links
    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        const spans = mobileToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
      });
    });
  }

  /* ==========================================================================
     3. INTERACTIVE PROJECT FILTER TABS
     ========================================================================== */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filterValue === 'all' || categories.includes(filterValue)) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(10px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });

  /* ==========================================================================
     4. MODAL TRIGGERING & AUTO-PROJECT SELECTION
     ========================================================================== */
  const modalBackdrop = document.getElementById('inquiry-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalProjectSelect = document.getElementById('modal-project');
  const modalProjectTitle = document.getElementById('modal-project-title');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');

  function openModal(projectName) {
    if (modalBackdrop) {
      modalBackdrop.classList.add('active');
      modalBackdrop.setAttribute('aria-hidden', 'false');

      if (modalProjectSelect && projectName) {
        // Try to match select options
        let matched = false;
        for (let i = 0; i < modalProjectSelect.options.length; i++) {
          if (modalProjectSelect.options[i].value.toLowerCase().includes(projectName.toLowerCase()) ||
              modalProjectSelect.options[i].text.toLowerCase().includes(projectName.toLowerCase())) {
            modalProjectSelect.selectedIndex = i;
            matched = true;
            break;
          }
        }
        if (!matched) {
          modalProjectSelect.value = 'All La Vista Projects';
        }
      }

      if (modalProjectTitle) {
        modalProjectTitle.textContent = projectName && projectName !== 'All Developments' 
          ? `Inquire About ${projectName}` 
          : 'Request Pricing & Floorplans';
      }
    }
  }

  function closeModal() {
    if (modalBackdrop) {
      modalBackdrop.classList.remove('active');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const project = btn.getAttribute('data-project') || 'All Developments';
      openModal(project);
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalBackdrop && modalBackdrop.classList.contains('active')) {
      closeModal();
    }
  });

  /* ==========================================================================
     5. ASYNCHRONOUS WEB3FORMS SUBMISSION HANDLER
     ========================================================================== */
  function handleFormSubmission(formElement, submitBtnElement, feedbackElement) {
    if (!formElement) return;

    formElement.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btnText = submitBtnElement.querySelector('.btn-text');
      const btnSpinner = submitBtnElement.querySelector('.btn-spinner');

      // UI Loading State
      submitBtnElement.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (btnSpinner) btnSpinner.classList.remove('hidden');
      if (feedbackElement) {
        feedbackElement.className = 'form-feedback hidden';
        feedbackElement.textContent = '';
      }

      // Collect Data
      const formData = new FormData(formElement);
      const countryCode = formData.get('country_code') || '+20';
      const rawPhone = formData.get('phone') || '';
      const fullPhone = `${countryCode} ${rawPhone}`;
      const projectName = formData.get('project_interest') || 'General Inquiry';
      const clientName = formData.get('name') || '';

      formData.set('phone', fullPhone);

      // JSON payload for Web3Forms API
      const object = Object.fromEntries(formData);
      const json = JSON.stringify(object);

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: json
        });

        const result = await response.json();

        if (response.status === 200 || result.success) {
          // Success
          feedbackElement.className = 'form-feedback success';
          feedbackElement.innerHTML = `<strong>Thank you, ${escapeHtml(clientName)}!</strong><br />Your request for <em>${escapeHtml(projectName)}</em> has been received. Our senior advisor is preparing your files and will message you on WhatsApp shortly.`;
          feedbackElement.classList.remove('hidden');

          formElement.reset();

          // Trigger Google Ads Conversion Tracking if available
          if (typeof window.gtag_report_conversion === 'function') {
            window.gtag_report_conversion();
          }

          // Automatically offer direct WhatsApp continuation
          setTimeout(() => {
            const waMsg = encodeURIComponent(`Hello, I just registered on the website for ${projectName}. My name is ${clientName}. Please send me the brochure and price list.`);
            const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;
            window.open(waUrl, '_blank');
          }, 2500);

        } else {
          // Error response from API
          feedbackElement.className = 'form-feedback error';
          feedbackElement.textContent = result.message || 'Something went wrong. Please check your details or contact us directly on WhatsApp.';
          feedbackElement.classList.remove('hidden');
        }

      } catch (err) {
        console.error('Submission Error:', err);
        feedbackElement.className = 'form-feedback error';
        feedbackElement.textContent = 'Connection error. Please contact us directly via WhatsApp (+201003565002).';
        feedbackElement.classList.remove('hidden');
      } finally {
        submitBtnElement.disabled = false;
        if (btnText) btnText.style.display = 'inline-block';
        if (btnSpinner) btnSpinner.classList.add('hidden');
      }
    });
  }

  // Bind Hero Form
  const heroForm = document.getElementById('hero-lead-form');
  const heroSubmitBtn = document.getElementById('hero-submit-btn');
  const heroFeedback = document.getElementById('hero-feedback');
  handleFormSubmission(heroForm, heroSubmitBtn, heroFeedback);

  // Bind Modal Form
  const modalForm = document.getElementById('modal-lead-form');
  const modalSubmitBtn = document.getElementById('modal-submit-btn');
  const modalFeedback = document.getElementById('modal-feedback');
  handleFormSubmission(modalForm, modalSubmitBtn, modalFeedback);

  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
