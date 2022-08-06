import { getBWS } from "../";
import { commonConfig } from "../config";

async function App() {
  const BWS = getBWS();
  BWS.renderNav();

  let body = document.querySelector("#bws-page-wrap");

  const user = await BWS.User.getCurrentUser();

  let basicInfoSection = BasicInfoSection(user);
  let securitySection = SecuritySection();

  body.append(basicInfoSection);
  body.append(securitySection);
}

/**
 *
 * @param {import('firebase/auth').User} user
 */
function BasicInfoSection(user) {
  let sectionTitle, sectionDesc, basicInfoSection, profileImgEditer, nameEditer;

  sectionTitle = "개인정보";
  sectionDesc = "별무리학교 웹 서비스들에서 보여지는 사용자의 정보입니다.";

  basicInfoSection = Section(sectionTitle, sectionDesc);
  profileImgEditer = ProfileImgEditer(user.photoURL);
  nameEditer = NameEditer(user);

  basicInfoSection.append(profileImgEditer, nameEditer);

  return basicInfoSection;
}

/**
 *
 * @param {import('firebase/auth').User} user
 */
function NameEditer(user) {
  let editer = TextInputEditer(user.displayName, () => {
    console.log("saving User Name");
  });

  editer.classList.add("name-editer");

  return editer;
}

function ProfileImgEditer(userImgURL) {
  let imgViewer, imgInput, imgUploadBtn, imgSaveBtn;

  imgViewer = ImgViewer(userImgURL);
  imgSaveBtn = ImgSaveBtn();

  imgInput = ImgInput(imgViewer.children[0], imgSaveBtn);
  imgUploadBtn = ImgUploadBtn(imgInput);

  let wrap = document.createElement("div");
  wrap.className = "profile-img-editer";

  let btnWrap = document.createElement("div");
  btnWrap.className = "profile-img-editer-btn-wrap";

  wrap.append(imgViewer, btnWrap);
  btnWrap.append(imgSaveBtn, imgUploadBtn);

  return wrap;
}

/**
 *
 * @param {HTMLImageElement} previewEl
 */
function ImgInput(previewEl, saveBtn) {
  let imgInput = document.createElement("input");
  imgInput.setAttribute("type", "file");
  imgInput.setAttribute("accept", "image/**");

  saveBtn.addEventListener("click", () => {
    console.log("saving img");
  });

  imgInput.addEventListener("change", () => {
    const [file] = imgInput.files;
    if (file) {
      previewEl.src = URL.createObjectURL(file);
      saveBtn.classList.remove("disable");
    }
  });

  return imgInput;
}

function ImgViewer(userImgURL) {
  let imgViewerCon = document.createElement("div");
  imgViewerCon.className = "img-viewer-container";

  let img = document.createElement("img");
  img.src = userImgURL ? userImgURL : commonConfig.defaultUserImg;
  imgViewerCon.append(img);

  return imgViewerCon;
}

/**
 *
 * @param {HTMLInputElement} inputEl
 */
function ImgUploadBtn(inputEl) {
  let uploadBtn = Button("사진 선택");
  uploadBtn.classList.add("upload-btn");

  uploadBtn.addEventListener("click", () => {
    inputEl.click();
  });

  return uploadBtn;
}

function ImgSaveBtn() {
  let saveBtn = Button("저장");
  saveBtn.classList.add("save-btn", "disable");

  return saveBtn;
}

function TextInputEditer(placeHolder, onSave) {
  let wrap, input, saveBtn;

  wrap = document.createElement("div");
  wrap.classList.add("text-input-editer");

  input = TextInput();
  input.placeholder = placeHolder;

  saveBtn = Button("저장");
  saveBtn.addEventListener("click", onSave);

  wrap.append(input, saveBtn);
  return wrap;
}

function SecuritySection(user) {
  let title = "보안";
  let description = "aaaaa";
  let section = Section(title, description);

  return section;
}

function Section(title, desc) {
  let el = document.createElement("div");
  el.classList.add("section");

  let titleEl = document.createElement("h2");
  titleEl.classList.add("section-title");
  titleEl.innerHTML = title;
  el.append(titleEl);

  let descEl = document.createElement("p");
  descEl.classList.add("section-desc");
  descEl.innerHTML = desc;
  el.append(descEl);

  return el;
}

function Button(text) {
  let btn = document.createElement("div");
  btn.classList.add("btn");
  btn.innerHTML = text;

  return btn;
}

function TextInput() {
  let input = document.createElement("input");
  input.classList.add("text-input");

  return input;
}

App();
