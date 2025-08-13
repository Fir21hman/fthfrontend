const cloudName = 'dh7uz4qtw';
const unsignedUploadPreset = 'Portfolio form';
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:5000';

// --- Translations (EN, AM, AR, TR) for labels/placeholders/buttons ---
const translations = {
  en: {
    pageHeading: "Talent Pool Registration",
    stepIndicator: ["Personal Info","Work Type","Availability","Tool Selection","Tool Rating","Portfolio","Review & Submit"],
    next: "Next", previous: "Previous", submit: "Submit Application",
    toolsTitle: "Select the tools you are familiar with:",
    ratingTitle: "Rate your proficiency for each selected tool:",
    reviewTitle: "Review your information",
    successMessage: "✅ Thank you for registering! We will contact you soon."
  },
  am: {
    pageHeading: "የችሎታ ማህደር መመዝገቢያ",
    stepIndicator: ["የውስጥ መረጃ","የስራ አይነት","የመገኘት ጊዜ","መሣሪያ ምርጫ","የክህሎት ግምገማ","ፖርትፎሊዮ","እይ እና ላክ"],
    next: "ቀጣይ", previous: "ወደ ኋላ", submit: "ላክ",
    toolsTitle: "ያውቁትን መሣሪያዎች ይምረጡ:",
    ratingTitle: "ለእያንዳንዱ መሣሪያ የክህሎት ደረጃዎን ይገምግሙ:",
    reviewTitle: "የውሂብዎን ይመልከቱ",
    successMessage: "✅ እናመሰግናለን! በቅርቡ እናገናኝዎታለን።"
  },
  ar: {
    pageHeading: "تسجيل قاعدة المواهب",
    stepIndicator: ["المعلومات الشخصية","نوع العمل","التوافر","اختيار الأدوات","تقييم المهارة","المحفظة","المراجعة والإرسال"],
    next: "التالي", previous: "السابق", submit: "إرسال الطلب",
    toolsTitle: "اختر الأدوات التي تجيدها:",
    ratingTitle: "قيم مهارتك لكل أداة مختارة:",
    reviewTitle: "راجع معلوماتك",
    successMessage: "✅ شكرًا لتسجيلك! سنقوم بالاتصال بك قريبًا."
  },
  tr: {
    pageHeading: "Yetenek Havuzu Kaydı",
    stepIndicator: ["Kişisel Bilgiler","İş Tipi","Uygunluk","Araç Seçimi","Beceri Değerlendirme","Portföy","Gözden Geçir ve Gönder"],
    next: "İleri", previous: "Geri", submit: "Başvuruyu Gönder",
    toolsTitle: "Kullandığınız araçları seçin:",
    ratingTitle: "Seçilen her araç için yetkinliğinizi değerlendirin:",
    reviewTitle: "Bilgilerinizi gözden geçirin",
    successMessage: "✅ Kaydınız için teşekkürler! Yakında sizinle iletişime geçeceğiz."
  }
};

// --- State & DOM refs ---
const form = document.getElementById('talentForm');
const steps = Array.from(document.querySelectorAll('.form-step'));
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const reviewDiv = document.getElementById('reviewData');
const iconStepperItems = Array.from(document.querySelectorAll('.icon-stepper .step'));
const mobileStepper = document.getElementById('mobileStepper');
const stepIndicator = document.getElementById('stepIndicator');
const pageHeading = document.getElementById('pageHeading');
const formMessage = document.getElementById('formMessage');
const languageSelect = document.getElementById('languageSelect');

const softwareTools = [
  "AutoCAD","Revit","SketchUp","3ds Max","Rhino","Lumion","Enscape","Unreal Engine","Blender",
  "Artlantis","D5 Render","Corona Renderer","Archicad","Maya","V-Ray","Twinmotion","Cinema 4D",
  "Vectorworks","Photoshop","Illustrator","After Effects","Premiere Pro","Capcut","Final Cut Pro",
  "DaVinci Resolve","InDesign","Lightroom","Figma","Canva"
];

// UI state
let currentStep = 0;
const selectedTools = new Set();

// --- Utilities: sanitization, validation, URL normalization ---
const sanitize = (str) => {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[<>"'`]/g, '');
};

const validateContact = (contact) => /^[\w@.+\-\_]+$/.test(contact || '');

const normalizeUrl = (url) => {
  if (!url) return '';
  const t = url.trim();
  if (/^https?:\/\//i.test(t)) return t;
  return 'https://' + t;
};

function showMessage(text, isError = false) {
  if (!formMessage) return;
  formMessage.textContent = text;
  formMessage.style.color = isError ? '#c62828' : 'var(--primary)';
}

// --- Skills initialization & rating rendering ---
function initSkills() {
  const toolGrid = document.getElementById('toolSelectGrid');
  if (!toolGrid) return;
  toolGrid.innerHTML = '';
  selectedTools.clear();
  softwareTools.forEach(tool => {
    const div = document.createElement('button');
    div.type = 'button';
    div.className = 'tool-card';
    div.textContent = tool;
    div.dataset.tool = sanitize(tool);
    div.addEventListener('click', () => {
      if (selectedTools.has(tool)) {
        selectedTools.delete(tool);
        div.classList.remove('selected');
      } else {
        selectedTools.add(tool);
        div.classList.add('selected');
      }
    });
    toolGrid.appendChild(div);
  });
}

function renderRatings() {
  const ratingGrid = document.getElementById('ratingGrid');
  if (!ratingGrid) return;
  ratingGrid.innerHTML = '';
  if (selectedTools.size === 0) {
    const noMsg = document.createElement('div');
    noMsg.className = 'skill-item';
    noMsg.textContent = 'No tools selected yet. Please select at least one.';
    ratingGrid.appendChild(noMsg);
    return;
  }
  selectedTools.forEach(tool => {
    const div = document.createElement('div');
    div.className = 'skill-item';
    const id = `skill_${tool.replace(/\s/g, '')}`;
    div.innerHTML = `
      <label for="${id}">${sanitize(tool)}</label>
      <select id="${id}" name="${id}" required>
        <option value="">Select proficiency</option>
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Expert</option>
      </select>
    `;
    ratingGrid.appendChild(div);
  });
}

// --- Stepper UI ---
function updateMobileStepper(step) {
  if (!mobileStepper) return;
  mobileStepper.innerHTML = '';
  const total = steps.length;
  const final = total - 1;
  const addDot = (i, cls='') => {
    const s = document.createElement('span');
    s.className = 'circle' + (cls ? ' ' + cls : '');
    s.textContent = i+1;
    mobileStepper.appendChild(s);
  };
  const dots = document.createElement('span');
  dots.className = 'ellipsis';
  dots.textContent = '...';

  if (step === 0) {
    addDot(0, 'active'); mobileStepper.appendChild(dots); addDot(final, 'final');
  } else if (step === final) {
    addDot(0); mobileStepper.appendChild(dots); addDot(final, 'active');
  } else {
    addDot(0); mobileStepper.appendChild(dots); addDot(step, 'active');
    if (step < final - 1) { addDot(step+1); mobileStepper.appendChild(dots); }
    addDot(final);
  }
}

function showStep(step) {
  steps.forEach((s, i) => s.classList.toggle('active', i === step));
  prevBtn.disabled = step === 0;
  nextBtn.style.display = step === steps.length - 1 ? 'none' : 'inline-block';
  submitBtn.style.display = step === steps.length - 1 ? 'inline-block' : 'none';

  // update text indicator & icon-stepper
  const lang = languageSelect.value || 'en';
  const labels = translations[lang].stepIndicator;
  if (stepIndicator) stepIndicator.textContent = `Step ${step+1} of ${steps.length}: ${labels[step]}`;
  iconStepperItems.forEach((el,i)=> el.classList.toggle('active', i===step));
  updateMobileStepper(step);

  // dynamic content actions
  if (step === 3) renderRatings(); // make sure ratings exist after selection step
  if (step === 6) displayReview();
}

// --- Validation ---
function validateStep(step) {
  const section = steps[step];
  const requiredInputs = Array.from(section.querySelectorAll('input,select'));
  for (const input of requiredInputs) {
    if (input.hasAttribute('required')) {
      if ((input.type === 'radio') || (input.type === 'checkbox')) {
        // group check handled below
        const name = input.name;
        const anyChecked = section.querySelector(`input[name="${name}"]:checked`);
        if (!anyChecked) return false;
      } else {
        if (!input.value || !String(input.value).trim()) return false;
      }
    }
  }

  // contact validation on personal info step (0)
  if (step === 0) {
    const contact = (form.contact && form.contact.value) ? form.contact.value.trim() : '';
    if (!validateContact(contact)) {
      alert('Please enter a valid contact (letters, numbers, @ . + - _ allowed).');
      return false;
    }
  }

  // tools step must have at least one selected
  if (step === 3 && selectedTools.size === 0) {
    alert('Please select at least one tool.');
    return false;
  }

  // rating step must have ratings for each selected tool
  if (step === 4) {
    for (const tool of selectedTools) {
      const id = `skill_${tool.replace(/\s/g, '')}`;
      const sel = document.getElementById(id);
      if (!sel || !sel.value) {
        alert(`Please rate your proficiency for ${tool}`);
        return false;
      }
    }
  }

  return true;
}

// --- Gather form data ---
function gatherFormData() {
  const data = {
    name: sanitize(form.name.value.trim()),
    contact: sanitize(form.contact.value.trim()),
    location: sanitize(form.location.value.trim()),
    currentRole: sanitize(form.currentRole.value),
    profession: sanitize(form.profession.value),
    workType: sanitize((form.querySelector('input[name="workType"]:checked')||{}).value || ''),
    availability: Array.from(form.querySelectorAll('input[name="availability"]:checked')).map(i => sanitize(i.value)),
    timeZone: sanitize(form.timeZone.value),
    preferredHours: sanitize(form.preferredHours.value.trim()),
    enjoyedTools: sanitize(form.enjoyedTools.value.trim()),
    selectedTools: [],
    portfolioLinks: [],
    submittedAt: new Date().toISOString()
  };

  selectedTools.forEach(tool => {
    const id = `skill_${tool.replace(/\s/g, '')}`;
    const sel = document.getElementById(id);
    const prof = sel && sel.value ? sanitize(sel.value) : 'Not rated';
    data.selectedTools.push({ name: sanitize(tool), proficiency: prof });
  });

  return data;
}

// --- Review display ---
function displayReview() {
  const d = gatherFormData();
  let html = '';
  html += `<div class="review-section"><strong>Full Name:</strong> ${d.name || '—'}</div>`;
  html += `<div class="review-section"><strong>Contact:</strong> ${d.contact || '—'}</div>`;
  html += `<div class="review-section"><strong>Location:</strong> ${d.location || '—'}</div>`;
  html += `<div class="review-section"><strong>Current Role:</strong> ${d.currentRole || '—'}</div>`;
  html += `<div class="review-section"><strong>Profession:</strong> ${d.profession || '—'}</div>`;
  html += `<div class="review-section"><strong>Work Type:</strong> ${d.workType || '—'}</div>`;
  html += `<div class="review-section"><strong>Availability:</strong> ${d.availability.join(', ') || '—'}</div>`;
  html += `<div class="review-section"><strong>Time Zone:</strong> ${d.timeZone || '—'}</div>`;
  html += `<div class="review-section"><strong>Preferred Hours:</strong> ${d.preferredHours || '—'}</div>`;
  html += `<div class="review-section"><strong>Skills & Proficiency:</strong>`;
  d.selectedTools.forEach(t => { html += `<div class="review-skill">• ${t.name}: ${t.proficiency}</div>`; });
  html += `</div>`;
  html += `<div class="review-section"><strong>Enjoyed Tools:</strong> ${d.enjoyedTools || '—'}</div>`;
  reviewDiv.innerHTML = html;
}

// --- Cloudinary upload helper ---
async function uploadToCloudinary(file, folderName) {
  if (!file) throw new Error('No file');
  if (file.size > 5 * 1024 * 1024) throw new Error('File exceeds 5MB limit');
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', unsignedUploadPreset);
  fd.append('folder', `portfolio_uploads/${folderName}`);
  const res = await fetch(url, { method: 'POST', body: fd });
  if (!res.ok) {
    const err = await res.json().catch(()=>({error:{message:'Upload failed'}}));
    throw new Error(err.error?.message || 'Upload failed');
  }
  return res.json();
}

// --- Submit handler ---
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) {
      alert('Please complete required fields.');
      return;
    }
    displayReview();
    prevBtn.disabled = nextBtn.disabled = submitBtn.disabled = true;
    showMessage('Submitting...');
  
    try {
      const data = gatherFormData();
  
      // handle file uploads to Cloudinary
      const portfolioInput = document.getElementById('portfolioFiles');
      const files = portfolioInput ? Array.from(portfolioInput.files) : [];
      const folderSafe = `${data.name || 'user'}_${data.contact || 'contact'}`
        .replace(/[^\w-]/g, '_')
        .toLowerCase();
  
      for (const f of files) {
        try {
          const res = await uploadToCloudinary(f, folderSafe);
          if (res && res.secure_url) data.portfolioLinks.push(res.secure_url);
        } catch (err) {
          console.warn('File upload error:', err.message);
        }
      }
  
      // manual portfolio URL
      const manual = (form.portfolioURL && form.portfolioURL.value) ? normalizeUrl(form.portfolioURL.value) : '';
      if (manual) data.portfolioLinks.push(manual);
      data.portfolioLinks = Array.from(new Set(data.portfolioLinks.filter(Boolean)));
  
      // prepare payload per your backend spec
      const payload = {
        name: data.name,
        contact: data.contact,
        location: data.location,
        current_job_role: data.currentRole, // ✅ renamed for Supabase
        profession: data.profession,
        work_type: data.workType,
        availability: data.availability,
        time_zone: data.timeZone,
        preferred_hours: data.preferredHours,
        enjoyed_tools: data.enjoyedTools,
        selectedTools: data.selectedTools,
        portfolioLinks: data.portfolioLinks
      };
  
      // send to your Node backend
      const resp = await fetch("http://localhost:5000/register-talent", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
  
      if (!resp.ok) {
        const text = await resp.text().catch(() => null);
        let errMsg = text || `Server responded ${resp.status}`;
        try { const j = JSON.parse(text); errMsg = j.message || JSON.stringify(j); } catch (_) {}
        throw new Error(errMsg);
      }
  
      // success
      const lang = languageSelect.value || 'en';
      showMessage(translations[lang].successMessage);
      form.reset();
      selectedTools.clear();
      initSkills();
      currentStep = 0;
      showStep(currentStep);
      setTimeout(() => { if (formMessage) formMessage.textContent = ''; }, 8000);
  
    } catch (err) {
      console.error('Submit error:', err);
      showMessage('Error: ' + (err.message || 'Submission failed'), true);
    } finally {
      prevBtn.disabled = nextBtn.disabled = submitBtn.disabled = false;
    }
  });
  
// --- Navigation handlers ---
nextBtn.addEventListener('click', () => {
  if (!validateStep(currentStep)) return;
  // when moving from tools step to rating, ensure ratings render
  if (currentStep === 3) renderRatings();
  if (currentStep === 5) displayReview();
  currentStep++;
  showStep(currentStep);
});
prevBtn.addEventListener('click', () => {
  if (currentStep === 0) return;
  currentStep--;
  showStep(currentStep);
});

// --- Language handling ---
function applyLang(lang) {
  languageSelect.value = lang;
  const t = translations[lang] || translations.en;
  pageHeading.textContent = t.pageHeading;
  // update step indicator headings if visible
  if (stepIndicator) stepIndicator.textContent = `Step ${currentStep+1} of ${steps.length}: ${t.stepIndicator[currentStep]}`;
  // update buttons
  if (nextBtn) nextBtn.textContent = t.next;
  if (prevBtn) prevBtn.textContent = t.previous;
  if (submitBtn) submitBtn.textContent = t.submit;
  // titles
  const toolsTitle = document.getElementById('toolsTitle'); if (toolsTitle) toolsTitle.textContent = t.toolsTitle;
  const ratingTitle = document.getElementById('ratingTitle'); if (ratingTitle) ratingTitle.textContent = t.ratingTitle;
  const reviewTitle = document.querySelector('.review-title'); if (reviewTitle) reviewTitle.textContent = t.reviewTitle;
}

languageSelect.addEventListener('change', () => {
  const lang = languageSelect.value || 'en';
  localStorage.setItem('FTH_lang', lang);
  applyLang(lang);
});

// --- Init on DOM ready ---
document.addEventListener('DOMContentLoaded', () => {
  // initialize language
  const saved = localStorage.getItem('FTH_lang') || 'en';
  applyLang(saved);

  // populate skills
  initSkills();

  // ensure stepper visuals exist
  showStep(currentStep);
});
