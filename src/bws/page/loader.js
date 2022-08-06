const loaderElement = document.createElement("div");
loaderElement.id = "bws-loader";
loaderElement.style.position = "fixed";
loaderElement.style.top = 0;
loaderElement.style.left = 0;
loaderElement.style.width = "100vw";
loaderElement.style.height = "100vh";
loaderElement.style.backgroundColor = "#fff";
loaderElement.style.zIndex = 1000;
loaderElement.style.display = "flex";
loaderElement.innerHTML = `
<img
  width="48px"
  height="48px"
  src="/bws/static/img/loader.svg"
  style="margin: auto; font-size: x-large;"
/>`;

/**
 * 로딩 아이콘을 화면에 표시
 */
function display() {
  console.log("loading");
  document.querySelector("body").append(loaderElement);
}

/**
 * 로딩 아이콘을 숨김.
 *
 * 함수 실행 시점에 로딩이 완료되었을 경우 즉시 숨기고, 로딩중일 경우 Eventlistener를 추가하여 로딩이 완료된 시점에 아이콘을 숨김.
 */
function hide() {
  if (document.readyState !== "complete") {
    document.addEventListener("DOMContentLoaded", () => {
      loaderElement.remove();
    });
  } else {
    loaderElement.remove();
  }
  console.log("loaded");
}

/**
 * @typedef {Object} Loader
 * @property {display} display
 * @property {hide} hide
 *
 * @constant
 * @type {Loader}
 */
export const loader = {
  display: display,
  hide: hide
};
