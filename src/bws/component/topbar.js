import BWSConfig from "../config";
import { getBWS } from "../";

/**
 * 네비게이션바를 표시
 * @typedef {Object} NavConfig
 * @property {Array<NavSection>=} navList
 *
 * @typedef {Object} NavSection
 * @property {string=} name
 * @property {string=} url
 * @property {Array<NavSection>=} innerSection
 *
 * @param {NavConfig} config
 */
export function renderNav(config) {
  let navList = config?.navList
    ? config.navList
    : BWSConfig.service.navigation.navList;

  initTopBar(navList);
}

/**
 * @param {Array<NavSection>=} navList
 */
async function initTopBar(navList) {
  let nav = document.createElement("nav");
  nav.classList.add("bws-top-bar");
  nav.innerHTML = getTopbarHTML();
  document.querySelector("body").append(nav);

  loadServicePanel();

  if (navList) {
    let navListElement = makeNavListElement(navList);
    document.querySelector(".bws-logo-wrap").after(navListElement);

    setTopBarHoverHeight(navList);
  }

  // 패널 버튼 클릭시 패널 보이기, 숨기기.
  let panelBtn = document.querySelector(".bws-service-panel-button");
  let panel = document.querySelector(".bws-service-panel");

  panelBtn.addEventListener("click", (event) => {
    if (panel.style.display === "grid") {
      panel.style.display = "none";
      profilePanel.style.display = "none";
    } else {
      panel.style.display = "grid";
      profilePanel.style.display = "none";
    }
    event.stopPropagation();
  });

  // 프로필 클릭시 사용자 정보 보이기, 숨기기
  let profile = document.querySelector(".bws-user-profile");
  let profilePanel = document.querySelector(".bws-profile-panel");

  profile.addEventListener("click", (event) => {
    if (profilePanel.style.display === "flex") {
      profilePanel.style.display = "none";
      panel.style.display = "none";
    } else {
      profilePanel.style.display = "flex";
      panel.style.display = "none";
    }
    event.stopPropagation();
  });

  let signOutBtn = document.querySelector(".bws-top-bar .bws-signout");
  signOutBtn.addEventListener("click", (event) => {
    localStorage.clear();
    window.parent.location.reload();
    return true;
  });

  // 패널이 보여진 상태에서 다른 곳을 클릭할 경우 패널을 숨긴다.
  document.querySelector("body").addEventListener("click", (event) => {
    let target = event.target;

    let is_target_in_panels = false;

    let elems_in_panels = document.querySelectorAll(
      ".bws-service-panel-wrap *, .bws-user-profile-wrap *"
    );

    for (let i = 0; i < elems_in_panels.length; i++) {
      is_target_in_panels =
        is_target_in_panels || target === elems_in_panels[i];
      if (is_target_in_panels) break;
    }

    if (is_target_in_panels) return;

    profilePanel.style.display = "none";
    panel.style.display = "none";
  });

  // 사용자 정보 표시
  loadUserPanel();
}

function hideElement(selector) {
  document.querySelector(selector).classList.add("hide");
}

async function loadServicePanel() {
  const BWS = getBWS();
  const otherServices = await BWS.OtherServices.getAll();

  let html = "";
  otherServices.forEach((service) => {
    html += `
      <div class="bws-service">
        <a href="${service.url}">
          <img src="${
            service.logo.imgHref
              ? service.logo.imgHref
              : BWSConfig.defaultServiceImg
          }" />
          <div>${service.name}</div>
        </a>
      </div>
    `;
  });

  document.querySelector(".bws-service-panel").innerHTML = html;
}

async function loadUserPanel() {
  try {
    const BWS = getBWS();
    let user = await BWS.User.getCurrentUser();

    if (user) {
      hideElement(".bws-signin");
      hideElement(".bws-signup");

      document.querySelector(
        ".bws-profile-info .bws-email"
      ).innerHTML += `${user.email}`;

      if (user.emailVerified) {
        hideElement(".error-message");
      }

      let grade = user.history?.at(0).grade;
      document.querySelector(".bws-profile-info .bws-grade").innerText = grade
        ? grade
        : "";

      document.querySelector(".bws-profile-info .bws-name").innerText =
        user.displayName;

      document
        .querySelector(".bws-profile-img img")
        .setAttribute(
          "src",
          user.photoURL ? user.photoURL : BWSConfig.defaultUserImg
        );

      document
        .querySelector(".bws-user-profile-img")
        .setAttribute(
          "src",
          user.photoURL ? user.photoURL : BWSConfig.defaultUserImg
        );
    } else {
      hideElement(".bws-profile-info");
      hideElement(".bws-profile-img");
      hideElement(".bws-signout");
    }
  } catch (error) {
    console.error(error);
  }
}

/**
 *
 * @param {Array<NavSection>} navList
 * @returns {*} navListElement
 */
function makeNavListElement(navList) {
  const navListElement = document.createElement("div");
  navListElement.classList.add("bws-link-wrap");

  navList.forEach((navSection) => {
    let navSectionElement = document.createElement("div");
    navSectionElement.classList.add("bws-link-section");
    if (navSection.innerSection) {
      let innerSection = navSection.innerSection.reduce((acc, navItem) => {
        return `${acc} <a class="bws-link-inner" href="${navItem.url}">${navItem.name}</a>`;
      }, "");

      navSectionElement.innerHTML = `
      <div class='bws-link-section-name'>
        ${navSection.name}
      </div>
      <div class='bws-link-inner-wrap'>
        ${innerSection}
      </div>`;
    } else {
      navSectionElement.innerHTML = `<a class='bws-link-section-name' href=${navSection.url}>${navSection.name}</a>`;
    }
    navListElement.append(navSectionElement);
  });

  return navListElement;
}

/**
 *
 * @param {Array<NavSection>} navList
 */
function setTopBarHoverHeight(navList) {
  let linkItemNumber = 0;

  navList.forEach((navSection) => {
    if (navSection.innerSection) {
      linkItemNumber =
        linkItemNumber > navSection.innerSection.length
          ? linkItemNumber
          : navSection.innerSection.length;
    }
  });

  let cssRule = `
  .bws-link-wrap:hover {
    padding-bottom: ${linkItemNumber * 18.5 + 24}px;
  }`;

  let style = document.createElement("style");
  style.innerHTML = cssRule;

  document.querySelector("body").append(style);
}

function getTopbarHTML() {
  const topbarHTML = `
  <div class="bws-logo-wrap">
    <a class="bws-logo" href="/"
      ><img src="${BWSConfig.service.logo.imgHref}" />
      <span class="bws-service-name">${BWSConfig.service.name}</span>
    </a>
    </div>
    <div class="bws-service-panel-wrap">
    <div class="bws-service-panel-button">
      <img src="/bws/static/img/panel.png" />
    </div>
    <div class="bws-service-panel">
      Loading..
    </div>
    </div>
    <div class="bws-user-profile-wrap">
    <div class="bws-user-profile">
      <img
        class="bws-user-profile-img"
        src="/bws/static/img/default-profile.svg"
      />
    </div>
    <div class="bws-profile-panel">
      <div class="bws-profile-img">
        <img src="/bws/static/img/default-profile.svg" />
      </div>
      <div class="bws-profile-info">
        <div class="bws-profile-info-row">
          <div class="bws-grade"></div>
          <div class="bws-name"></div>
        </div>
        <!--
        <div class="bws-profile-info-row">
          <a href="" class="bws-setting">
              계정 관리
          </a>
        </div>
        -->
        <div class="bws-email">
          <span class="error-message">
            <img src="/bws/static/img/warning.svg"/>
          </span>
        </div>
      </div>
      <a class="bws-signout" href="/bws/signout.html">로그아웃</a>
      <a class="bws-signin" href="/bws/signin.html">로그인</a>
      <a class="bws-signup" href="/bws/signup.html">회원가입</a>
    </div>
    </div>`;
  return topbarHTML;
}
