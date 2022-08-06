// Import the functions you need from the SDKs you need
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  fetchSignInMethodsForEmail,
  sendEmailVerification
} from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import commonConfig from "../config";
import { getBWS } from "../";

const BWS = getBWS();
function init() {
  // 이메일 인증을 거쳐 들어왔는지 확인

  // 이메일 로그인 버튼 클릭시 이메일/비밀번호로 로그인 함수 호출.
  const emailLoginFormBtn = document.querySelector("#email-loginform-btn");
  emailLoginFormBtn.addEventListener("click", onEmailLoginFormBtnClicked);

  // 구글 로그인 버튼 클릭시 구글 로그인 함수 호출.
  const googleLoginBtn = document.querySelector("#google-login-btn");
  googleLoginBtn.addEventListener("click", onGoogleLoginBtnClicked);
}

async function onEmailLoginFormBtnClicked() {
  document.querySelector("#login-loader").style.display = "block";
  document.querySelector("#error-message").innerHTML = "";

  const email = document.querySelector("#email-loginform-email").value;
  const password = document.querySelector("#email-loginform-pw").value;
  const confirmPassword = document.querySelector("#email-loginform-pw-confirm")
    .value;
  const name = document.querySelector("#email-loginform-name").value;
  const auth = getAuth(BWS.firebaseApp);

  try {
    if (password !== confirmPassword) {
      showErrorMessage("wrong-confirm-password");
      return;
    }

    if (!name) {
      showErrorMessage("empty-name");
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Signed in
    const user = userCredential.user;
    updateProfile(user, {
      displayName: name
    });

    const actionCodeSettings = {
      url: `${commonConfig.url.index}/bws/signup.html?checked-email=${email}`,
      handleCodeInApp: true
    };

    await sendEmailVerification(user, actionCodeSettings);
    showMessage(
      "인증 이메일이 발송되었습니다. 3초 후 메인페이지로 이동합니다."
    );
    setInterval(() => {
      window.location.href = "/";
    }, 3000);
  } catch (error) {
    console.log(error.message);

    // 구글 로그인으로 가입된 이메일인지 확인.
    let availableSignInMethods = [];
    try {
      availableSignInMethods = await fetchSignInMethodsForEmail(auth, email);
    } catch {
      showErrorMessage("이메일 형식이 올바르지 않습니다.");
    }
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

    if (userCredential.AdditionalUserInfo?.isNewUser) {
      window.location.href = "/bws/signup.html";
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
      "구글 로그인으로 가입된 이메일입니다.<br>구글 로그인으로 다시 시도해주세요.",
    "wrong-confirm-password": "비밀번호와 비밀번호 확인란이 다릅니다.",
    "empty-name": "이름을 입력해주세요."
  };

  if (map[errorCode]) {
    return map[errorCode];
  }
  return "인증 오류가 발생했습니다. 다시 시도해주세요.";
}

function showMessage(message) {
  let messageElem = document.querySelector("#info-message");
  messageElem.innerHTML = message;
  messageElem.display = "block";
}

init();

document.querySelector("#bws-loader").style.display = "none";
