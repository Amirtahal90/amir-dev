(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;

  body.classList.add("js-ready");

  const page = body.dataset.page || "";

  // Keep the document language metadata explicit for accessibility tools.
  root.lang = "fa";

  const iconRefresh = () => {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    localStorage.setItem("amir-theme", theme);
    iconRefresh();
  };

  const storedTheme = localStorage.getItem("amir-theme");
  const systemDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = storedTheme || (systemDark ? "dark" : "light");

  const themeToggle = document.querySelector(".theme-toggle");
  themeToggle?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });

  const nav = document.querySelector(".main-nav");
  const menuToggle = document.querySelector(".menu-toggle");

  const closeMobileMenu = () => {
    if (!nav || !menuToggle) return;
    nav.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle?.addEventListener("click", () => {
    const open = !nav?.classList.contains("is-open");
    nav?.classList.toggle("is-open", open);
    menuToggle.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
  });

  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMobileMenu));

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
      closeModal();
    }
  });

  const header = document.querySelector(".site-header");
  const progress = document.querySelector(".scroll-progress span");
  const backTop = document.querySelector(".back-to-top");

  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 8);
    backTop?.classList.toggle("visible", y > 480);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(y / max, 1) : 0;
      progress.style.width = (ratio * 100) + "%";
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  const revealNodes = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -45px" });

    revealNodes.forEach((node) => observer.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }

  document.querySelectorAll("[data-placeholder-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const label = link.dataset.placeholderLabel || "این لینک";
      window.alert(label + " هنوز تنظیم نشده است. لینک واقعی را در HTML جایگزین کنید.");
    });
  });

  const currentYear = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach((node) => {
    node.textContent = currentYear;
  });

  // Project filtering/search/modal
  const projectGrid = document.querySelector("#projects-grid");
  const projectCards = projectGrid ? [...projectGrid.querySelectorAll(".project-card")] : [];
  const filterButtons = [...document.querySelectorAll(".filter-btn")];
  const searchInput = document.querySelector("#project-search");
  const projectCount = document.querySelector("#project-count");
  const projectEmpty = document.querySelector("#projects-empty");

  const projectData = {
    portfolio: {
      title: "Personal Portfolio",
      description: "این پروژه همان سایت فعلی است: چند صفحه HTML مستقل، style.css مشترک و script.js مشترک برای یک تجربه ساده و responsive.",
      tags: ["HTML", "CSS", "Vanilla JS"],
      status: "در حال استفاده / قابل توسعه",
      category: "Web + UI"
    },
    landing: {
      title: "Modern Landing Page",
      description: "نمونه قابل ویرایش برای تمرین hierarchy، CTA، responsive design و ساخت بخش‌های معرفی یک محصول یا سرویس.",
      tags: ["HTML", "CSS", "UI"],
      status: "نمونه قابل ویرایش",
      category: "Web + UI"
    },
    clock: {
      title: "Digital Clock",
      description: "پروژه‌ای سبک برای تمرین زمان واقعی، به‌روزرسانی DOM و ارائه یک رابط خوانا برای نمایش ساعت.",
      tags: ["JavaScript", "DOM", "UI"],
      status: "پروژه تمرینی",
      category: "JavaScript + UI"
    },
    responsive: {
      title: "Responsive Website",
      description: "تمرین ساخت یک Layout که در موبایل، تبلت و دسکتاپ بدون overflow ناخواسته تغییر ساختار دهد.",
      tags: ["HTML", "CSS", "Responsive"],
      status: "نمونه قابل ویرایش",
      category: "Web + UI"
    },
    ui: {
      title: "JavaScript UI Project",
      description: "مجموعه‌ای از تعاملات کوچک سمت کاربر برای تمرین Modal، Filter، Search، Validation و وضعیت اجزای UI.",
      tags: ["JavaScript", "DOM", "UI"],
      status: "پروژه تمرینی",
      category: "JavaScript + UI"
    },
    python: {
      title: "Python Utility",
      description: "ایده‌ای برای ساخت یک ابزار کوچک Python جهت حل یک نیاز روزمره یا اتوماسیون ساده؛ جزئیات دقیق بعداً قابل افزودن است.",
      tags: ["Python", "Utility"],
      status: "نمونه قابل ویرایش",
      category: "Python"
    },
    image: {
      title: "Security / Image Tool",
      description: "ایده‌ای برای یک ابزار شخصی پردازش تصویر با تمرکز روی عملیات‌هایی مانند watermark، metadata یا بررسی‌های کم‌ریسک مربوط به فایل.",
      tags: ["Python", "Images", "Security"],
      status: "نمونه قابل ویرایش",
      category: "Python + UI"
    }
  };

  let activeFilter = "all";

  const normalize = (value) => (value || "").toLocaleLowerCase("fa-IR").trim();

  const updateProjectView = () => {
    if (!projectCards.length) return;
    const query = normalize(searchInput?.value);
    let visible = 0;

    projectCards.forEach((card) => {
      const category = normalize(card.dataset.category);
      const text = normalize(card.dataset.search);
      const filterMatch = activeFilter === "all" || category.includes(normalize(activeFilter));
      const searchMatch = !query || text.includes(query);
      const show = filterMatch && searchMatch;

      card.hidden = !show;
      if (show) visible++;
    });

    if (projectCount) projectCount.textContent = visible + " نتیجه";
    if (projectEmpty) projectEmpty.hidden = visible !== 0;
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      activeFilter = button.dataset.filter || "all";
      updateProjectView();
    });
  });

  searchInput?.addEventListener("input", updateProjectView);

  const modal = document.querySelector("#project-modal");
  const modalTitle = document.querySelector("#modal-title");
  const modalDescription = document.querySelector("#modal-description");
  const modalTags = document.querySelector("#modal-tags");
  const modalStatus = document.querySelector("#modal-status");
  const modalCategory = document.querySelector("#modal-category");
  let lastFocus = null;

  const closeModal = () => {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    body.classList.remove("modal-open");
    if (lastFocus instanceof HTMLElement) lastFocus.focus();
  };

  const openModal = (key, trigger) => {
    const data = projectData[key];
    if (!data || !modal) return;

    lastFocus = trigger;
    modalTitle.textContent = data.title;
    modalDescription.textContent = data.description;
    modalStatus.textContent = data.status;
    modalCategory.textContent = data.category;
    modalTags.innerHTML = data.tags.map((tag) => "<span>" + tag + "</span>").join("");
    modal.setAttribute("aria-hidden", "false");
    body.classList.add("modal-open");
    iconRefresh();
    modal.querySelector(".modal-close")?.focus();
  };

  document.querySelectorAll(".quick-view").forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.project, button));
  });

  modal?.querySelectorAll("[data-modal-close], .modal-close").forEach((node) => {
    node.addEventListener("click", closeModal);
  });

  updateProjectView();

  // Contact form validation
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");

  const showFieldError = (field, message) => {
    const input = contactForm?.querySelector("#" + field);
    const error = contactForm?.querySelector('[data-error-for="' + field + '"]');
    input?.classList.toggle("invalid", Boolean(message));
    if (error) error.textContent = message || "";
    if (message) input?.setAttribute("aria-invalid", "true");
    else input?.removeAttribute("aria-invalid");
  };

  const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  contactForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const values = {
      name: contactForm.elements.name.value.trim(),
      email: contactForm.elements.email.value.trim(),
      subject: contactForm.elements.subject.value.trim(),
      message: contactForm.elements.message.value.trim()
    };

    const errors = {
      name: values.name.length < 2 ? "نام باید حداقل ۲ کاراکتر باشد." : "",
      email: !validEmail(values.email) ? "یک ایمیل معتبر وارد کنید." : "",
      subject: values.subject.length < 3 ? "موضوع را کامل‌تر وارد کنید." : "",
      message: values.message.length < 10 ? "پیام باید حداقل ۱۰ کاراکتر باشد." : ""
    };

    Object.entries(errors).forEach(([field, message]) => showFieldError(field, message));

    const hasError = Object.values(errors).some(Boolean);
    if (hasError) {
      if (formStatus) formStatus.textContent = "لطفاً موارد مشخص‌شده را اصلاح کنید.";
      const firstError = Object.keys(errors).find((field) => errors[field]);
      contactForm.querySelector("#" + firstError)?.focus();
      return;
    }

    if (formStatus) formStatus.textContent = "پیام از نظر فرم معتبر است. برای ارسال واقعی، ایمیل یا Backend به سایت متصل کنید.";
    contactForm.reset();
    Object.keys(errors).forEach((field) => showFieldError(field, ""));
  });

  iconRefresh();
})();