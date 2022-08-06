import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getBWS } from "../";
import { doc, getDoc } from "firebase/firestore";

export const User = {
  getCurrentUser
};
Object.freeze(User);

/**
 * Get Current User. 현재 로그인한 사용자 정보를 가져옵니다.
 *
 * @returns {Promise<import("firebase/auth").User>} Current User
 */
function getCurrentUser() {
  const auth = getAuth(getBWS().firebaseApp);

  const promise = new Promise(function (resovle, reject) {
    onAuthStateChanged(
      auth,
      async (user) => {
        if (user) {
          let BWS = getBWS();
          const docRef = doc(BWS.firestore, "users", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            let userData = docSnap.data();
            user.auth = userData.auth;
            user.history = userData.history.map((history) => {
              history.createdAt = new Date(history.createdAt.seconds);
              return history;
            });

            user.history.sort(
              (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
            );
          }
        }
        resovle(user);
      },
      async (error) => {
        reject(error);
      }
    );
  });

  return promise;
}
