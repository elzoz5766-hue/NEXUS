
"use strict";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

let authMode = "login";
let toastTimer;

// إظهار رسالة للمستخدم
function showToast(message) {
  let toast = $("#toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// تحديث السنة
if ($("#year")) {
  $("#year").textContent = new Date().getFullYear();
}

// =============================
// القائمة ☰
// =============================

const menuToggle = $("#menuToggle");
const navLinks = $("#navLinks");

menuToggle?.addEventListener("click", () => {
  const opened = navLinks.classList.toggle("open");

  menuToggle.textContent = opened ? "✕" : "☰";
  menuToggle.setAttribute("aria-expanded", String(opened));
});

$$('#navLinks a').forEach(link => {
  link.addEventListener("click", () => {
    navLinks?.classList.remove("open");

    if (menuToggle) {
      menuToggle.textContent = "☰";
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });
});

// =============================
// البحث 🔍
// =============================

const searchBar = $("#searchBar");
const searchInput = $("#searchInput");

$("#searchToggle")?.addEventListener("click", () => {
  if (!searchBar) {
    showToast("تأكد من وجود عنصر البحث في HTML.");
    return;
  }

  searchBar.classList.toggle("active");

  if (searchBar.classList.contains("active")) {
    searchInput?.focus();
  }
});

function normalizeText(text) {
  return text
    .toLocaleLowerCase("ar")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .trim();
}

function performSearch() {
  const query = normalizeText(searchInput?.value || "");
  const items = $$(".searchable");

  if (!query) {
    items.forEach(item => item.classList.remove("search-hidden"));
    showToast("اكتب كلمة للبحث أولاً.");
    searchInput?.focus();
    return;
  }

  let count = 0;
  let firstResult = null;

  items.forEach(item => {
    const matches = normalizeText(item.textContent).includes(query);

    item.classList.toggle("search-hidden", !matches);

    if (matches) {
      count++;
      if (!firstResult) firstResult = item;
    }
  });

  if (firstResult) {
    showToast("وجدنا " + count + " نتيجة.");
    firstResult.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  } else {
    showToast("لا توجد نتائج مطابقة.");
  }
}

$("#searchButton")?.addEventListener("click", performSearch);

searchInput?.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    performSearch();
  }

  if (event.key === "Escape") {
    searchBar?.classList.remove("active");
  }
});

// =============================
// تسجيل الدخول وإنشاء الحساب
// =============================

const modal = $("#authModal");

function openAuth(mode) {
  if (!modal) {
    showToast("نافذة الحساب غير موجودة في HTML.");
    return;
  }

  authMode = mode;
  const signup = mode === "signup";

  $("#modalTitle").textContent = signup
    ? "أنشئ حسابك في NEXUS"
    : "مرحباً بعودتك";

  $("#modalDescription").textContent = signup
    ? "ابدأ رحلتك الرقمية الآن."
    : "أدخل بياناتك للمتابعة.";

  $("#authSubmit").textContent = signup
    ? "إنشاء حساب"
    : "تسجيل الدخول";

  const name = $("#authName");
  const nameLabel = $("#nameLabel");

  if (name) {
    name.hidden = !signup;
    name.required = signup;
    name.value = "";
  }

  if (nameLabel) {
    nameLabel.hidden = !signup;
  }

  $("#authEmail").value = "";
  $("#authPassword").value = "";
  $("#authMessage").textContent = "";

  modal.classList.add("active");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  setTimeout(() => {
    (signup ? name : $("#authEmail"))?.focus();
  }, 100);
}

function closeAuth() {
  if (!modal) return;

  modal.classList.remove("active");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

$$("[data-auth]").forEach(button => {
  button.addEventListener("click", () => {
    navLinks?.classList.remove("open");
    openAuth(button.dataset.auth);
  });
});

$("#closeModal")?.addEventListener("click", closeAuth);

modal?.addEventListener("click", event => {
  if (event.target === modal) closeAuth();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeAuth();
    navLinks?.classList.remove("open");

    if (menuToggle) menuToggle.textContent = "☰";
  }
});

// التحقق من نموذج الحساب
$("#authForm")?.addEventListener("submit", event => {
  event.preventDefault();

  const email = $("#authEmail").value.trim();
  const password = $("#authPassword").value;
  const name = $("#authName")?.value.trim() || "";
  const message = $("#authMessage");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    message.textContent = "أدخل بريدًا إلكترونيًا صحيحًا.";
    return;
  }

  if (password.length < 6) {
    message.textContent = "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
    return;
  }

  if (authMode === "signup" && !name) {
    message.textContent = "اكتب اسمك أولاً.";
    return;
  }

  message.textContent = authMode === "signup"
    ? "تم التحقق من البيانات التجريبية. يلزم خادم لإنشاء حساب."
    : "يلزم ربط نظام مصادقة للتحقق من بيانات الدخول.";

  showToast("هذه واجهة تجريبية؛ لم يتم إنشاء حساب حقيقي.");
});

// =============================
// نموذج الاشتراك
// =============================

$("#newsletterForm")?.addEventListener("submit", event => {
  event.preventDefault();

  const email = $("#newsletterEmail").value.trim();
  const message = $("#newsletterMessage");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    message.textContent = "أدخل بريدًا إلكترونيًا صحيحًا.";
    return;
  }

  message.textContent =
    "تم التحقق من البريد، لكن الاشتراك يحتاج إلى خدمة خلفية.";

  showToast("لم يتم إرسال البريد أو حفظه.");
});

// =============================
// زر اكتشف المزيد
// =============================

$$('a[href="#features"]').forEach(link => {
  link.addEventListener("click", () => {
    navLinks?.classList.remove("open");
  });
});

// بدء التشغيل
console.log("NEXUS JavaScript loaded successfully!");

/* ===== NEXUS: تفعيل بطاقات المميزات ===== */

const nexusFeatureDetails = {
  "محتوى حصري": {
    icon: "☆",
    title: "محتوى حصري",
    description:
      "مساحة لاكتشاف المحتوى الرقمي والأفكار الجديدة. يمكن إضافة مقالات وفيديوهات حقيقية عند ربط الموقع بنظام إدارة محتوى."
  },

  "دعم متعدد اللغات": {
    icon: "◎",
    title: "دعم متعدد اللغات",
    description:
      "يمكن تطوير الموقع لدعم العربية والإنجليزية ولغات أخرى، مع تغيير اتجاه الصفحة تلقائياً حسب اللغة المختارة."
  },

  "سرعة فائقة": {
    icon: "ϟ",
    title: "سرعة فائقة",
    description:
      "واجهة مصممة لتكون خفيفة ومتجاوبة مع الهاتف. سرعة التحميل الفعلية تعتمد أيضاً على الصور والاتصال والخدمات المستخدمة."
  },

  "أمان عالي": {
    icon: "⬡",
    title: "أمان عالي",
    description:
      "يمكن تعزيز الأمان باستخدام اتصال HTTPS ومصادقة حقيقية وصلاحيات قاعدة البيانات والتحقق من المدخلات."
  },

  "تخزين سحابي": {
    icon: "☁",
    title: "تخزين سحابي",
    description:
      "يمكن ربط ملفات المستخدمين بخدمة تخزين سحابي، لكن رفع الملفات وحفظها يحتاج إلى إعداد خدمة خلفية وصلاحيات مناسبة."
  }
};

// إنشاء نافذة تفاصيل الميزة
function createFeatureModal() {
  let overlay = document.getElementById("featureDetailsModal");

  if (overlay) return overlay;

  overlay = document.createElement("div");
  overlay.id = "featureDetailsModal";
  overlay.className = "modal";
  overlay.setAttribute("aria-hidden", "true");

  overlay.innerHTML = `
    <div class="modal-box feature-details-box" role="dialog"
         aria-modal="true" aria-labelledby="featureDetailsTitle">

      <button type="button" class="close-modal"
              id="closeFeatureDetails" aria-label="إغلاق">×</button>

      <div class="modal-logo" id="featureDetailsIcon">N</div>

      <h2 id="featureDetailsTitle">مميزات NEXUS</h2>

      <p id="featureDetailsDescription"></p>

      <button type="button" class="primary-btn full-width"
              id="closeFeatureDetailsButton">
        فهمت ذلك
      </button>
    </div>
  `;

  document.body.appendChild(overlay);

  function closeFeatureModal() {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  overlay.querySelector("#closeFeatureDetails")
    .addEventListener("click", closeFeatureModal);

  overlay.querySelector("#closeFeatureDetailsButton")
    .addEventListener("click", closeFeatureModal);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeFeatureModal();
  });

  return overlay;
}

// فتح تفاصيل البطاقة عند الضغط عليها
document.querySelectorAll(".feature-card").forEach(card => {
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  card.setAttribute("aria-haspopup", "dialog");

  function openFeatureDetails() {
    const heading = card.querySelector("h3");
    const title = heading?.textContent.trim();

    const details = nexusFeatureDetails[title];

    if (!details) {
      showToast("تفاصيل هذه الميزة غير متاحة حالياً.");
      return;
    }

    const overlay = createFeatureModal();

    overlay.querySelector("#featureDetailsIcon").textContent =
      details.icon;

    overlay.querySelector("#featureDetailsTitle").textContent =
      details.title;

    overlay.querySelector("#featureDetailsDescription").textContent =
      details.description;

    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  card.addEventListener("click", openFeatureDetails);

  card.addEventListener("keydown", event => {
    if (event.target !== card) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFeatureDetails();
    }
  });
});

/* ===== NEXUS SERVICES: تشغيل بطاقات الخدمات ===== */

(function initNexusServices() {
  const serviceCards = document.querySelectorAll(
    ".service-card, .service-item, .service-box"
  );

  if (!serviceCards.length) {
    console.warn(
      "NEXUS: لم يتم العثور على بطاقات الخدمات. راجع class في Index.html."
    );
    return;
  }

  let overlay = document.getElementById("nexusServiceModal");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "nexusServiceModal";
    overlay.className = "nexus-service-overlay";

    overlay.innerHTML = `
      <section class="nexus-service-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="nexusServiceTitle">

        <button type="button" class="nexus-service-close"
          aria-label="إغلاق">×</button>

        <div class="nexus-service-icon" id="nexusServiceIcon">✨</div>

        <span class="nexus-service-category" id="nexusServiceCategory">
          خدمة NEXUS
        </span>

        <h2 id="nexusServiceTitle">خدمات NEXUS</h2>

        <p id="nexusServiceDescription"></p>

        <div class="nexus-service-actions">
          <button type="button" id="nexusServiceStart">
            استكشف الخدمة ←
          </button>

          <button type="button" class="nexus-service-back">
            رجوع
          </button>
        </div>

        <p id="nexusServiceMessage" role="status"></p>
      </section>
    `;

    document.body.appendChild(overlay);
  }

  const closeButton = overlay.querySelector(".nexus-service-close");
  const backButton = overlay.querySelector(".nexus-service-back");
  const startButton = overlay.querySelector("#nexusServiceStart");

  let activeCard = null;

  function closeModal() {
    overlay.classList.remove("visible");
    document.body.style.overflow = "";

    if (activeCard) activeCard.focus();
  }

  function openModal(card) {
    activeCard = card;

    const title =
      card.querySelector("h2, h3, h4, .service-title")
        ?.textContent.trim() || "خدمة NEXUS";

    const description =
      card.querySelector("p, .service-description")
        ?.textContent.trim() ||
      "اكتشف هذه الخدمة من خدمات NEXUS.";

    const category =
      card.querySelector(".service-category, .category, small")
        ?.textContent.trim() || "خدمة رقمية";

    const iconElement = card.querySelector(
      ".service-icon, .icon, img, .service-image"
    );

    let icon = "✨";

    if (iconElement) {
      if (iconElement.tagName === "IMG") {
        icon = iconElement.alt || "✨";
      } else {
        icon = iconElement.textContent.trim() || "✨";
      }
    } else {
      const emojiMatch = card.textContent.match(
        /[🎬🛒🚀🎮🎨📚🎵☁️💻📱✨]/
      );

      if (emojiMatch) icon = emojiMatch[0];
    }

    overlay.querySelector("#nexusServiceIcon").textContent = icon;
    overlay.querySelector("#nexusServiceTitle").textContent = title;
    overlay.querySelector("#nexusServiceCategory").textContent = category;
    overlay.querySelector("#nexusServiceDescription").textContent =
      description;

    overlay.querySelector("#nexusServiceMessage").textContent = "";

    overlay.classList.add("visible");
    document.body.style.overflow = "hidden";
  }

  serviceCards.forEach(card => {
    card.style.cursor = "pointer";
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");

    card.addEventListener("click", event => {
      if (event.target.closest("a, button")) return;
      openModal(card);
    });

    card.addEventListener("keydown", event => {
      if (event.target !== card) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openModal(card);
      }
    });
  });

  closeButton.addEventListener("click", closeModal);
  backButton.addEventListener("click", closeModal);

  overlay.addEventListener("click", event => {
    if (event.target === overlay) closeModal();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" &&
        overlay.classList.contains("visible")) {
      closeModal();
    }
  });

  startButton.addEventListener("click", () => {
    if (!activeCard) return;

    const link = activeCard.querySelector("a[href]");

    if (link) {
      window.location.href = link.href;
      return;
    }

    const title =
      activeCard.querySelector("h2, h3, h4, .service-title")
        ?.textContent.trim() || "الخدمة";

    overlay.querySelector("#nexusServiceMessage").textContent =
      "خدمة " + title +
      " جاهزة لإضافة وظيفتها الفعلية. يلزم برمجة وربط الخدمة المطلوبة.";

  });

  console.log(
    "NEXUS: تم تفعيل " + serviceCards.length + " بطاقة خدمة."
  );
})();

/* NEXUS - إصلاح الضغط على بطاقات الخدمات */

document.addEventListener("click", function (event) {
  const card = event.target.closest(
    ".service-card, .service-item, .service-box, .service"
  );

  if (!card) return;

  // لو البطاقة فيها رابط، اترك الرابط يعمل طبيعياً
  if (event.target.closest("a, button")) return;

  const title =
    card.querySelector("h1, h2, h3, h4")?.textContent.trim()
    || "خدمة NEXUS";

  const description =
    card.querySelector("p")?.textContent.trim()
    || "اكتشف خدمات NEXUS الرقمية.";

  let popup = document.getElementById("nexusQuickPopup");

  if (!popup) {
    popup = document.createElement("div");
    popup.id = "nexusQuickPopup";

    popup.style.cssText = `
      position:fixed;
      inset:0;
      z-index:999999;
      display:none;
      align-items:center;
      justify-content:center;
      padding:20px;
      background:rgba(3,5,18,.88);
      direction:rtl;
    `;

    popup.innerHTML = `
      <div style="
        width:100%;
        max-width:400px;
        padding:26px;
        border-radius:22px;
        border:1px solid #793cff;
        background:#0b1025;
        color:white;
        text-align:center;
        box-shadow:0 0 35px #43208a55;
      ">
        <button id="nexusQuickClose"
          style="float:left;background:none;border:0;color:white;font-size:28px">
          ×
        </button>

        <h2 id="nexusQuickTitle"></h2>
        <p id="nexusQuickDescription"
          style="color:#bac8e4;line-height:2"></p>

        <button id="nexusQuickBack"
          style="padding:12px 25px;border:0;border-radius:12px;
          background:linear-gradient(90deg,#893cff,#08baff);
          color:white;font-size:16px">
          رجوع
        </button>
      </div>
    `;

    document.body.appendChild(popup);

    function closePopup() {
      popup.style.display = "none";
      document.body.style.overflow = "";
    }

    popup.querySelector("#nexusQuickClose")
      .addEventListener("click", closePopup);

    popup.querySelector("#nexusQuickBack")
      .addEventListener("click", closePopup);

    popup.addEventListener("click", e => {
      if (e.target === popup) closePopup();
    });
  }

  popup.querySelector("#nexusQuickTitle").textContent = title;
  popup.querySelector("#nexusQuickDescription").textContent = description;

  popup.style.display = "flex";
  document.body.style.overflow = "hidden";
});

/* ===== NEXUS BLOG CARDS CLICK FIX ===== */

/* جعل بطاقات الخدمات قابلة للتحديد بلوحة المفاتيح */
document.querySelectorAll(".blog-card").forEach(function (card) {
  card.style.cursor = "pointer";
});

/* ===== NEXUS: محتوى إضافي للبطاقات ===== */

document.addEventListener("DOMContentLoaded", function () {
  const cards = document.querySelectorAll(".blog-card");

  const content = {
    "مساحتك للمحتوى الإبداعي": {
      icon: "🎬",
      text: "اكتشف أفكار صناعة المحتوى والفيديوهات الإبداعية.",
      items: ["أفكار فيديوهات", "صناعة المحتوى", "الإبداع الرقمي"]
    },
    "متجر رقمي بتصميم عصري": {
      icon: "🛒",
      text: "تصفح المنتجات الرقمية التجريبية وتعرف على أسعارها.",
      items: ["قوالب مواقع", "أدوات تصميم", "منتجات رقمية"]
    },
    "خطوتك التالية نحو المستقبل": {
      icon: "🚀",
      text: "ابدأ تعلم تطوير المواقع خطوة بخطوة.",
      items: ["HTML", "CSS", "JavaScript"]
    }
  };

  cards.forEach(function (card) {
    const heading = card.querySelector("h3");
    if (!heading) return;

    const title = heading.textContent.trim();
    const data = content[title];

    if (!data || card.dataset.nexusExtraReady) return;

    card.dataset.nexusExtraReady = "1";

    card.addEventListener("dblclick", function (event) {
      if (event.target.closest("a, button")) return;

      let box = document.getElementById("nexusExtraContent");

      if (!box) {
        box = document.createElement("div");
        box.id = "nexusExtraContent";
        box.dir = "rtl";

        box.style.cssText =
          "position:fixed;inset:0;z-index:999999;" +
          "background:#050817ee;display:flex;" +
          "align-items:center;justify-content:center;padding:20px";

        document.body.appendChild(box);
      }

      box.innerHTML = "";

      const panel = document.createElement("div");
      panel.style.cssText =
        "background:#0b1023;color:white;padding:25px;" +
        "border:1px solid #7046ff;border-radius:22px;" +
        "max-width:420px;width:100%;text-align:center";

      const close = document.createElement("button");
      close.textContent = "× إغلاق";
      close.style.cssText =
        "float:left;background:#202744;color:white;" +
        "border:0;padding:8px 14px;border-radius:8px";

      close.onclick = function () {
        box.style.display = "none";
      };

      const icon = document.createElement("div");
      icon.style.fontSize = "48px";
      icon.textContent = data.icon;

      const h = document.createElement("h2");
      h.textContent = title;

      const p = document.createElement("p");
      p.style.cssText = "line-height:2;color:#b9c9e6";
      p.textContent = data.text;

      const list = document.createElement("div");

      data.items.forEach(function (item) {
        const row = document.createElement("p");
        row.textContent = "✦ " + item;
        row.style.cssText =
          "padding:10px;background:#151b35;border-radius:10px";
        list.appendChild(row);
      });

      panel.append(close, icon, h, p, list);
      box.appendChild(panel);
      box.style.display = "flex";
    });
  });
});

/* ===== NEXUS: محتوى مخصص لكل قسم ===== */

(function () {
  const nexusPages = {
    "مساحتك للمحتوى الإبداعي": {
      icon: "🎬",
      title: "استوديو المحتوى",
      description: "ابدأ رحلتك في صناعة المحتوى الرقمي.",
      items: [
        ["🎥", "أفكار الفيديوهات", "خطط لمحتوى جديد ومميز."],
        ["✍️", "كتابة المحتوى", "جهز أفكارك ونصوص منشوراتك."],
        ["📸", "التصميم والإبداع", "اكتشف طرق تطوير تصاميمك."]
      ]
    },

    "متجر رقمي بتصميم عصري": {
      icon: "🛒",
      title: "متجر NEXUS",
      description: "اكتشف المنتجات الرقمية التجريبية.",
      items: [
        ["🌐", "قوالب المواقع", "قوالب واجهات HTML وCSS."],
        ["🎨", "أدوات التصميم", "موارد تساعدك في التصميم."],
        ["💻", "أدوات المطورين", "أدوات مفيدة لمشروعاتك."]
      ]
    },

    "خطوتك التالية نحو المستقبل": {
      icon: "🚀",
      title: "أكاديمية NEXUS",
      description: "تعلم تطوير المواقع من البداية.",
      items: [
        ["🧱", "HTML", "تعلم بناء صفحات الويب."],
        ["🎨", "CSS", "تعلم تنسيق وتصميم الصفحات."],
        ["⚡", "JavaScript", "تعلم إضافة التفاعلات للموقع."]
      ]
    }
  };

  function addNexusContent() {
    const modal = document.getElementById("nexusBlogModal");
    if (!modal || modal.dataset.contentReady) return;
    modal.dataset.contentReady = "1";

    const description = modal.querySelector("#nexusBlogDescription");
    if (!description) return;

    const content = document.createElement("div");
    content.id = "nexusDynamicContent";
    content.style.cssText =
      "display:grid;gap:12px;margin-top:20px;text-align:right";

    description.insertAdjacentElement("afterend", content);

    document.addEventListener("click", function (event) {
      const card = event.target.closest(".blog-card");
      if (!card) return;

      if (event.target.closest("a, button")) return;

      const heading = card.querySelector("h3");
      const title = heading?.textContent.trim();
      const page = nexusPages[title];

      content.replaceChildren();

      if (!page) {
        const note = document.createElement("p");
        note.textContent =
          "هذا القسم جاهز لإضافة محتواه الخاص قريبًا.";
        content.appendChild(note);
        return;
      }

      page.items.forEach(function (item) {
        const itemBox = document.createElement("div");
        itemBox.style.cssText =
          "padding:14px;background:#121a35;" +
          "border:1px solid #29345c;border-radius:14px";

        const heading = document.createElement("h3");
        heading.textContent = item[0] + " " + item[1];
        heading.style.cssText = "margin:0 0 8px;font-size:17px";

        const text = document.createElement("p");
        text.textContent = item[2];
        text.style.cssText =
          "margin:0;color:#b9c9e6;line-height:1.8";

        itemBox.append(heading, text);
        content.appendChild(itemBox);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addNexusContent);
  } else {
    addNexusContent();
  }
})();

/* ===== NEXUS: إصلاح وتشغيل بطاقات المحتوى ===== */

(function () {
  const pages = {
    "مساحتك للمحتوى الإبداعي": {
      icon: "🎬",
      category: "الترفيه",
      description: "اكتشف أفكار صناعة المحتوى الرقمي.",
      items: [
        "أفكار فيديوهات جديدة",
        "كتابة المنشورات",
        "التصميم والإبداع"
      ]
    },
    "متجر رقمي بتصميم عصري": {
      icon: "🛒",
      category: "التسوق",
      description: "استكشف أقسام المنتجات الرقمية.",
      items: [
        "قوالب المواقع",
        "أدوات التصميم",
        "موارد المطورين"
      ]
    },
    "خطوتك التالية نحو المستقبل": {
      icon: "🚀",
      category: "التطوير",
      description: "ابدأ تعلم تطوير المواقع خطوة بخطوة.",
      items: [
        "HTML - بناء الصفحات",
        "CSS - تنسيق المواقع",
        "JavaScript - التفاعلات"
      ]
    }
  };

  function openPage(card) {
    const heading = card.querySelector("h3");
    const title = heading ? heading.textContent.trim() : "";
    const page = pages[title];

    const old = document.getElementById("nexusFixedModal");
    if (old) old.remove();

    const modal = document.createElement("div");
    modal.id = "nexusFixedModal";
    modal.dir = "rtl";
    modal.style.cssText =
      "position:fixed;inset:0;z-index:999999;" +
      "background:rgba(3,5,18,.94);display:flex;" +
      "align-items:center;justify-content:center;padding:20px;";

    const box = document.createElement("div");
    box.style.cssText =
      "width:100%;max-width:430px;max-height:85vh;" +
      "overflow:auto;box-sizing:border-box;padding:25px;" +
      "background:#0b1025;color:#f5f7ff;border:1px solid #713bff;" +
      "border-radius:24px;text-align:center;box-shadow:0 0 35px #713bff44;";

    const close = document.createElement("button");
    close.textContent = "✕";
    close.setAttribute("aria-label", "إغلاق");
    close.style.cssText =
      "display:block;margin-right:auto;background:transparent;" +
      "color:white;border:0;font-size:28px;padding:5px 10px;";
    close.onclick = () => modal.remove();

    const icon = document.createElement("div");
    icon.textContent = page ? page.icon : "✨";
    icon.style.fontSize = "58px";
    icon.style.margin = "18px 0";

    const category = document.createElement("p");
    category.textContent = page ? page.category : "NEXUS";

    const h2 = document.createElement("h2");
    h2.textContent = page ? page.category : title;

    const desc = document.createElement("p");
    desc.textContent = page
      ? page.description
      : "اكتشف المزيد من محتوى NEXUS.";
    desc.style.cssText = "color:#bdc8df;line-height:2;";

    box.append(close, icon, category, h2, desc);

    if (page) {
      page.items.forEach(function (item) {
        const row = document.createElement("div");
        row.textContent = "✦ " + item;
        row.style.cssText =
          "margin-top:12px;padding:14px;background:#151b35;" +
          "border:1px solid #29345c;border-radius:12px;color:#fff;";
        box.appendChild(row);
      });
    }

    const back = document.createElement("button");
    back.textContent = "رجوع";
    back.style.cssText =
      "width:100%;margin-top:22px;padding:14px;border:0;" +
      "border-radius:14px;background:linear-gradient(90deg,#8d36ff,#08baff);" +
      "color:white;font-size:17px;font-weight:bold;";
    back.onclick = () => modal.remove();

    box.appendChild(back);
    modal.appendChild(box);
    modal.addEventListener("click", e => {
      if (e.target === modal) modal.remove();
    });
    document.body.appendChild(modal);
  }

  document.querySelectorAll(".blog-card").forEach(function (card) {
    if (card.dataset.nexusFixedReady) return;
    card.dataset.nexusFixedReady = "1";
    card.style.cursor = "pointer";

    card.addEventListener("click", function (event) {
      if (event.target.closest("a, button")) return;
      openPage(card);
    });
  });

  console.log("NEXUS content cards initialized");
})();
