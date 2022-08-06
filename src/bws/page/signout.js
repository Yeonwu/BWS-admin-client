import { getAuth, signOut } from "firebase/auth";
import config from "../config";
import { getBWS } from "../";

const auth = getAuth(getBWS().firebaseApp);
signOut(auth)
  .then(() => {
    window.location.href = config.url.signOutRedirect;
  })
  .catch((e) => {
    console.error(e);
    alert("로그아웃 중 오류가 발생했습니다.");
  })
  .finally(() => {
    window.location.href = config.url.signOutRedirect;
  });
