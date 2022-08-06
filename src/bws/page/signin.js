// Import the functions you need from the SDKs you need
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  fetchSignInMethodsForEmail,
  getAdditionalUserInfo
} from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import commonConfig from "../config";
import { getBWS } from "../";

const BWS = getBWS();

function init() {
  // 이미 로그인 되어있을 경우 메인 화면으로 이동

  const auth = getAuth(BWS.firebaseApp);
  auth.onAuthStateChanged(function (user) {
    if (user) {
      window.location.href = commonConfig.url.index;
    }
  });

  // 엔터 눌렸을 시 이메일/비밀번호로 로그인 함수 호출.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      onEmailLoginFormBtnClicked();
    }
  });

  // 이메일 로그인 버튼 클릭시 이메일/비밀번호로 로그인 함수 호출.
  const emailLoginFormBtn = document.querySelector("#email-loginform-btn");
  emailLoginFormBtn.addEventListener("click", onEmailLoginFormBtnClicked);

  // 구글 로그인 버튼 클릭시 구글 로그인 함수 호출.
  const googleLoginBtn = document.querySelector("#google-login-btn");
  googleLoginBtn.addEventListener("click", onGoogleLoginBtnClicked);

  document.querySelector(".wrap").style.display = "flex";
}

async function onEmailLoginFormBtnClicked() {
  document.querySelector("#login-loader").style.display = "block";
  document.querySelector("#error-message").innerHTML = "";

  const email = document.querySelector("#email-loginform-email").value;
  const password = document.querySelector("#email-loginform-pw").value;
  const auth = getAuth(BWS.firebaseApp);

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = commonConfig.url.signInRedirect;
  } catch (error) {
    console.log(error.message);

    // 구글 로그인으로 가입된 이메일인지 확인.
    let availableSignInMethods = [];
    try {
      availableSignInMethods = await fetchSignInMethodsForEmail(auth, email);
    } catch (error) {
      showErrorMessage(error.code);
    }

    //  구글 로그인으로 가입되었다면 구글 로그인으로 로그인하라고 안내.
    if (availableSignInMethods.includes("google.com")) {
      showErrorMessage("custom/signed-in-with-google");
    } else {
      showErrorMessage(error.code);
    }
  } finally {
    document.querySelector("#login-loader").style.display = "none";
  }
}

async function onGoogleLoginBtnClicked() {
  const provider = new GoogleAuthProvider();

  const auth = getAuth(BWS.firebaseApp);
  const ignoreErrorCode = [
    "auth/popup-closed-by-user",
    "auth/cancelled-popup-request"
  ];

  let userCredential;
  try {
    userCredential = await signInWithPopup(auth, provider);

    if (getAdditionalUserInfo(userCredential).isNewUser) {
      // 새로운 사용자일 경우.
      // window.location.href = "/bws/signup.html";
    }

    window.location.href = commonConfig.url.signInRedirect;
  } catch (error) {
    console.error(error);

    if (!ignoreErrorCode.includes(error.code)) {
      showErrorMessage(error.code);
    }
  }
}
function showErrorMessage(errorCode) {
  let message = getErrorMessage(errorCode);
  document.querySelector("#error-message").innerHTML = message;
}

function getErrorMessage(errorCode) {
  const map = {
    "auth/user-disabled": "정지된 계정입니다.",
    "auth/wrong-password": "비밀번호가 올바르지 않습니다.",
    "auth/invalid-email": "이메일 형식이 올바르지 않습니다.",
    "auth/user-not-found": "가입되지 않은 이메일입니다.",
    "auth/popup-blocked": "팝업 차단을 해제해주세요.",
    "auth/weak-password": "비밀번호는 6자리 이상이어야합니다.",
    "auth/email-already-in-use": "이미 가입된 이메일입니다.",
    "auth/network-request-failed": "인터넷이 불안정합니다.",
    "custom/signed-in-with-google":
      "구글 로그인으로 가입된 이메일입니다.<br>구글 로그인으로 다시 시도해주세요."
  };

  if (map[errorCode]) {
    return map[errorCode];
  }
  return "인증 오류가 발생했습니다. 다시 시도해주세요.";
}

init();
