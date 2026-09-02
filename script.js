/**
 * La Vista Developments — Interactive Functionality & Web3Forms Integration
 * Connects lead submissions to Web3Forms and WhatsApp to +201003565002
 */

document.addEventListener('DOMContentLoaded', () => {
  const WHATSAPP_NUMBER = '201003565002';

  /* ==========================================================================
     1. INTERACTIVE PROJECT FILTER TABS
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
     2. MODAL TRIGGERING & AUTO-PROJECT SELECTION
     ========================================================================== */
  const modalBackdrop = document.getElementById('inquiry-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalProjectHidden = document.getElementById('modal-project-hidden');
  const modalProjectTitle = document.getElementById('modal-project-title');
  const openModalBtns = document.querySelectorAll('.open-modal-btn');

  function openModal(projectName) {
    if (modalBackdrop) {
      modalBackdrop.classList.add('active');
      modalBackdrop.setAttribute('aria-hidden', 'false');

      if (modalProjectHidden) {
        modalProjectHidden.value = projectName || 'All Developments';
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
     3. ASYNCHRONOUS WEB3FORMS SUBMISSION HANDLER
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
      const projectName = formData.get('project_interest') || 'General La Vista Inquiry';
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
          feedbackElement.innerHTML = `<strong>Thank you, ${escapeHtml(clientName)}!</strong><br />Your request has been received. Our senior property advisor is preparing your files and will message you on WhatsApp shortly.`;
          feedbackElement.classList.remove('hidden');

          formElement.reset();

          // Trigger Google Ads Conversion Tracking if available
          if (typeof window.gtag_report_conversion === 'function') {
            window.gtag_report_conversion();
          }

          // Automatically offer direct WhatsApp continuation
          setTimeout(() => {
            const waMsg = encodeURIComponent(`Hello, I just requested project details for La Vista Developments. My name is ${clientName}. Please share the floor plans and price sheet.`);
            const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${waMsg}`;
            window.open(waUrl, '_blank');
          }, 2200);

        } else {
          // Error response from API
          feedbackElement.className = 'form-feedback error';
          feedbackElement.textContent = result.message || 'Something went wrong. Please check your details or connect with us directly on WhatsApp.';
          feedbackElement.classList.remove('hidden');
        }

      } catch (err) {
        console.error('Submission Error:', err);
        feedbackElement.className = 'form-feedback error';
        feedbackElement.textContent = 'Connection error. Please connect with us directly on WhatsApp.';
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
