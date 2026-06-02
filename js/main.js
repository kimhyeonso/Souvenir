const categoryData = {
  accessories: {
    kicker: "Accessories",
    title: "악세사리 컬렉션",
    heroEyebrow: "Everyday Fine Jewelry",
    heroTitle: "매일의 장면을 선명하게 만드는 주얼리",
    heroDescription: "반지, 목걸이, 귀걸이까지 일상에 자연스럽게 스며드는 수베니아의 기본 컬렉션입니다.",
    heroImage: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1800&q=85"
  },
  anniversary: {
    kicker: "Anniversary",
    title: "기념일 컬렉션",
    heroEyebrow: "For The Promise",
    heroTitle: "둘만의 약속을 오래 간직하는 방식",
    heroDescription: "웨딩 링과 커플링을 중심으로 사랑의 순간을 섬세하게 기록하는 시그니처 라인입니다.",
    heroImage: "https://img.magnific.com/free-photo/closeup-shot-newlyweds-holding-hands-showing-wedding-rings_181624-15865.jpg?t=st=1780371964~exp=1780375564~hmac=2c9d439614af31f8ddf7f481c4c247a5b449a1bcd75f156c81b507d963f2e475&w=1060"
  },
  zodiac: {
    kicker: "Zodiac",
    title: "별자리 컬렉션",
    heroEyebrow: "Written In The Stars",
    heroTitle: "당신의 계절과 별을 담은 디자인",
    heroDescription: "12가지 별자리의 상징을 모티브로 신비로운 분위기를 더한 맞춤형 컬렉션입니다.",
    heroImage: "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4f5?auto=format&fit=crop&w=1800&q=85"
  },
  baby: {
    kicker: "Baby",
    title: "베이비 컬렉션",
    heroEyebrow: "First Celebration",
    heroTitle: "처음 맞이하는 축복을 위한 작은 빛",
    heroDescription: "백일, 돌, 탄생의 순간을 따뜻하고 정갈하게 기념하는 베이비 주얼리입니다.",
    heroImage: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1800&q=85"
  }
};

const state = {
  products: [],
  currentCategory: "accessories"
};

const hero = document.querySelector("#hero");
const heroEyebrow = document.querySelector("#heroEyebrow");
const heroTitle = document.querySelector("#heroTitle");
const heroDescription = document.querySelector("#heroDescription");
const categoryKicker = document.querySelector("#categoryKicker");
const categoryTitle = document.querySelector("#categoryTitle");
const productGrid = document.querySelector("#productGrid");
const navLinks = document.querySelectorAll(".nav-link");
const brand = document.querySelector(".brand");
const menuToggle = document.querySelector(".menu-toggle");
const gnb = document.querySelector(".gnb");

const formatPrice = (price) => `${price.toLocaleString("ko-KR")}원`;

const getCategoryFromPath = () => {
  const pageName = window.location.pathname.split("/").pop().replace(".html", "");
  return categoryData[pageName] ? pageName : null;
};

const renderProducts = (category) => {
  if (!productGrid) return;

  const filteredProducts = state.products.filter((product) => product.category === category);

  productGrid.classList.remove("fade-in");
  void productGrid.offsetWidth;
  productGrid.classList.add("fade-in");

  productGrid.innerHTML = filteredProducts.map((product) => `
    <article class="product-card">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-meta">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <span class="product-price">${formatPrice(product.price)}</span>
      </div>
    </article>
  `).join("");

  observeRevealElements();
};

const renderCategory = (category) => {
  const content = categoryData[category];
  if (!content) return;

  state.currentCategory = category;

  hero?.style.setProperty("--hero-image", `url("${content.heroImage}")`);

  if (heroEyebrow) heroEyebrow.textContent = content.heroEyebrow;
  if (heroTitle) heroTitle.textContent = content.heroTitle;
  if (heroDescription) heroDescription.textContent = content.heroDescription;
  if (categoryKicker) categoryKicker.textContent = content.kicker;
  if (categoryTitle) categoryTitle.textContent = content.title;

  navLinks.forEach((link) => {
    const linkCategory = link.dataset.category || link.getAttribute("href")?.replace(".html", "");
    link.classList.toggle("active", linkCategory === category);
  });

  renderProducts(category);
};

const closeMobileMenu = () => {
  gnb?.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
};

const loadProducts = async () => {
  try {
    const response = await fetch("data/products.json");

    if (!response.ok) {
      throw new Error("상품 데이터를 불러오지 못했습니다.");
    }

    state.products = await response.json();
    const currentCategory = getCategoryFromPath();

    if (currentCategory) {
      state.currentCategory = currentCategory;
      renderCategory(state.currentCategory);
    }
  } catch (error) {
    if (productGrid) productGrid.innerHTML = `<p class="empty-message">${error.message}</p>`;
  }
};

let revealObserver;
const observedRevealElements = new WeakSet();

function observeRevealElements() {
  const revealTargets = document.querySelectorAll(`
    .brand-story,
    .main-intro,
    .main-collections .section-heading,
    .main-category-card,
    .main-feature-image,
    .main-feature-text,
    .product-section .section-heading,
    .product-card,
    .instagram-section .section-heading,
    .instagram-grid figure
  `);

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  revealTargets.forEach((target, index) => {
    if (observedRevealElements.has(target)) return;

    const isImageLike = target.matches(".main-category-card, .product-card, .instagram-grid figure, .main-feature-image");
    target.classList.add("reveal");
    if (isImageLike) target.classList.add("reveal-scale");
    target.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 80}ms`);

    revealObserver.observe(target);
    observedRevealElements.add(target);
  });
}

function initScrollAnimations() {
  if (!("IntersectionObserver" in window)) {
    observeRevealElements();
    return;
  }

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, {
    root: null,
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.16
  });

  observeRevealElements();
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    if (!link.dataset.category) {
      closeMobileMenu();
      return;
    }

    renderCategory(link.dataset.category);
    closeMobileMenu();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

brand?.addEventListener("click", () => {
  closeMobileMenu();
});

menuToggle?.addEventListener("click", () => {
  const isOpen = gnb.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

initScrollAnimations();
loadProducts();


  const section = document.querySelector('.instagram-section');
  const slider = document.querySelector('.instagram-grid');
  const cursor = document.querySelector('.custom-cursor');
  const cursorText = document.querySelector('.cursor-text');
  
  let isDown = false;
  let startX;
  let scrollLeft;
  let velX = 0;
  let momentumID;

  // 1. 🖱️ 커서 위치 및 노출 제어 (윈도우 전체에서 추적)
  window.addEventListener('mousemove', (e) => {
    // 마우스 좌표 업데이트 (커서 중심점 보정)
    cursor.style.left = `${e.clientX - 40}px`;
    cursor.style.top = `${e.clientY - 40}px`;

    // 마우스가 인스타 섹션 내부에 있을 때만 커서 활성화
    // e.target이 인스타 섹션 내부 요소인지 확인합니다.
    if (section.contains(e.target)) {
      cursor.classList.add('visible');
    } else if (!isDown) {
      // 단, 드래그 중(isDown === true)일 때는 마우스가 나가도 커서가 유지되도록 함
      cursor.classList.remove('visible');
    }
  });

  // 2. 🎢 드래그 시작 (Mousedown)
  window.addEventListener('mousedown', (e) => {
    // 사용자가 인스타 그리드 영역 안에서 클릭을 시작했을 때만 작동
    if (!slider.contains(e.target)) return;

    isDown = true;
    cursor.classList.add('grabbing');
    cursorText.innerText = 'DRAG'; 
    
    cancelAnimationFrame(momentumID);
    
    // slider 기준 좌표 및 스크롤 위치 계산
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
    velX = 0;
  });

  // 3. 🏃 드래그 중 (Mousemove)
  window.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    
    // 드래그 중일 때는 윈도우 전체에서 마우스가 움직여도 스크롤이 계산됨
    e.preventDefault(); 
    
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 1.2; // 드래그 감도 설정
    
    const prevScrollLeft = slider.scrollLeft;
    slider.scrollLeft = scrollLeft - walk;
    velX = slider.scrollLeft - prevScrollLeft;
  });

  // 4. 🛑 드래그 종료 (Mouseup) - 사용자가 어디서 마우스를 떼든 안전하게 종료
  window.addEventListener('mouseup', (e) => {
    if (!isDown) return;
    
    isDown = false;
    cursor.classList.remove('grabbing');
    cursorText.innerText = 'GRAB';
    
    // 마우스를 뗀 시점에 마우스가 인스타 섹션 밖에 있다면 커서도 숨김
    if (!section.contains(e.target)) {
      cursor.classList.remove('visible');
    }
    
    momentumLoop(); // 관성 스크롤 시작
  });

  // 5. 🌊 부드러운 감속 관성 루프
  function momentumLoop() {
    slider.scrollLeft -= velX;
    velX *= 0.92; // 1에 가까울수록 더 미끄러짐
    if (Math.abs(velX) > 0.5) {
      momentumID = requestAnimationFrame(momentumLoop);
    }
  }
