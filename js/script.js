document.querySelector(".icon-menu").addEventListener("click", function (event) {
  event.preventDefault();
  document.body.classList.toggle("menu-open");
});

/* Contact page form validation */
(function initContactFormValidation() {
  const form = document.querySelector(".contact-form");
  if (!form) return;
  const successMessage = document.getElementById("contact-form-success");
  const query = new URLSearchParams(window.location.search);
  if (successMessage && query.get("sent") === "true") {
    successMessage.hidden = false;
  }

  const fields = Array.from(form.querySelectorAll(".contact-form__field"));

  function fieldLabel(field) {
    const label = form.querySelector('label[for="' + field.id + '"]');
    if (!label) return "This field";
    return label.textContent.replace("*", "").trim();
  }

  function errorMessage(field) {
    if (field.validity.valueMissing) {
      return fieldLabel(field) + " is required.";
    }
    if (field.type === "email" && field.validity.typeMismatch) {
      return "Please enter a valid email address.";
    }
    return "";
  }

  function setFieldError(field, message) {
    const errorEl = field.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains("contact-form__error")) return;
    errorEl.textContent = message;
    field.classList.toggle("contact-form__field_invalid", Boolean(message));
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function validateField(field) {
    const message = errorMessage(field);
    setFieldError(field, message);
    return !message;
  }

  fields.forEach(function (field) {
    field.addEventListener("input", function () {
      validateField(field);
    });
    field.addEventListener("blur", function () {
      validateField(field);
    });
    field.addEventListener("invalid", function (event) {
      event.preventDefault();
      validateField(field);
    });
  });

  form.addEventListener("submit", function (event) {
    let isValid = true;
    fields.forEach(function (field) {
      if (!validateField(field)) isValid = false;
    });
    if (!isValid) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    const submitButton = form.querySelector(".contact-form__submit");
    if (submitButton) submitButton.disabled = true;

    const subjectInput = form.querySelector("#contact-subject");
    const subjectHidden = form.querySelector('input[name="_subject"]');
    if (subjectInput && subjectHidden) {
      const trimmed = subjectInput.value.trim();
      subjectHidden.value = trimmed
        ? "Herbal Link Contact: " + trimmed
        : "New message from Herbal Link contact form";
    }

    const body = new FormData(form);
    fetch("https://formsubmit.co/ajax/web@doririvera.com", {
      method: "POST",
      body: body,
      headers: {
        Accept: "application/json",
      },
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Request failed");
        return response.json();
      })
      .then(function () {
        form.reset();
        fields.forEach(function (field) {
          setFieldError(field, "");
        });
        if (successMessage) {
          successMessage.textContent = "Thank you! Your message has been sent successfully.";
          successMessage.hidden = false;
        }
      })
      .catch(function () {
        if (successMessage) {
          successMessage.textContent = "Something went wrong while sending your message. Please try again.";
          successMessage.hidden = false;
        }
      })
      .finally(function () {
        if (submitButton) submitButton.disabled = false;
      });
  });
})();

const spollerButtons = document.querySelectorAll("[data-spoller] .spollers-faq__button");

spollerButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const currentItem = button.closest("[data-spoller]");
    const content = currentItem.querySelector(".spollers-faq__text");

    const parent = currentItem.parentNode;
    const isOneSpoller = parent.hasAttribute("data-one-spoller");

    if (isOneSpoller) {
      const allItems = parent.querySelectorAll("[data-spoller]");
      allItems.forEach((item) => {
        if (item !== currentItem) {
          const otherContent = item.querySelector(".spollers-faq__text");
          item.classList.remove("active");
          otherContent.style.maxHeight = null;
        }
      });
    }

    if (currentItem.classList.contains("active")) {
      currentItem.classList.remove("active");
      content.style.maxHeight = null;
    } else {
      currentItem.classList.add("active");
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});

/* Crystal article pages: mobile slider with prev/next arrows (scrollbar hidden; swipe still works) */
(function initCrystalArticleImageSlider() {
  const figuresRoot = document.querySelector(".crystal-article__figures");
  if (!figuresRoot) return;

  const mqMobile = window.matchMedia("(max-width: 40rem)");
  const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  const chevronLeft =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
  const chevronRight =
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

  let sliderWrap = null;
  let prevBtn = null;
  let nextBtn = null;
  let onScroll = null;

  function slides() {
    return figuresRoot.querySelectorAll(".crystal-article__figure");
  }

  function activeIndex() {
    const w = figuresRoot.clientWidth;
    if (w <= 0) return 0;
    const n = slides().length;
    if (n <= 1) return 0;
    return Math.min(n - 1, Math.max(0, Math.round(figuresRoot.scrollLeft / w)));
  }

  function updateArrows() {
    if (!prevBtn || !nextBtn) return;
    const i = activeIndex();
    const n = slides().length;
    prevBtn.disabled = i <= 0;
    nextBtn.disabled = i >= n - 1;
  }

  function scrollToSlide(index) {
    const w = figuresRoot.clientWidth;
    const n = slides().length;
    const clamped = Math.min(n - 1, Math.max(0, index));
    figuresRoot.scrollTo({
      left: clamped * w,
      behavior: mqReduce.matches ? "auto" : "smooth",
    });
  }

  function step(delta) {
    scrollToSlide(activeIndex() + delta);
  }

  function destroy() {
    if (onScroll) {
      figuresRoot.removeEventListener("scroll", onScroll);
      onScroll = null;
    }
    prevBtn = null;
    nextBtn = null;
    if (sliderWrap && sliderWrap.parentNode) {
      const parent = sliderWrap.parentNode;
      parent.insertBefore(figuresRoot, sliderWrap);
      sliderWrap.remove();
      sliderWrap = null;
    }
  }

  function build() {
    destroy();
    const items = slides();
    if (items.length <= 1) return;

    const layout = figuresRoot.parentNode;
    if (!layout) return;

    sliderWrap = document.createElement("div");
    sliderWrap.className = "crystal-article__slider-wrap";

    layout.insertBefore(sliderWrap, figuresRoot);
    sliderWrap.appendChild(figuresRoot);

    prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "crystal-article__slider-arrow crystal-article__slider-arrow--prev";
    prevBtn.setAttribute("aria-label", "Previous image");
    prevBtn.innerHTML = chevronLeft;
    prevBtn.addEventListener("click", function () {
      step(-1);
    });

    nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "crystal-article__slider-arrow crystal-article__slider-arrow--next";
    nextBtn.setAttribute("aria-label", "Next image");
    nextBtn.innerHTML = chevronRight;
    nextBtn.addEventListener("click", function () {
      step(1);
    });

    sliderWrap.appendChild(prevBtn);
    sliderWrap.appendChild(nextBtn);

    onScroll = function () {
      window.requestAnimationFrame(updateArrows);
    };
    figuresRoot.addEventListener("scroll", onScroll, { passive: true });
    updateArrows();
  }

  function apply() {
    destroy();
    if (mqMobile.matches && !mqReduce.matches && slides().length > 1) {
      build();
    }
  }

  apply();
  mqMobile.addEventListener("change", apply);
  mqReduce.addEventListener("change", apply);
  window.addEventListener("resize", function () {
    if (sliderWrap) updateArrows();
  });
})();
