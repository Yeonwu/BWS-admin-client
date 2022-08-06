import { renderNav } from "./component/topbar.js";
import { User, OtherServices, Season } from "./api";
import { getFirestore } from "firebase/firestore";
import firebase from "firebase/compat/app";
import firebaseConfig from "./firebaseConfig";

/**
 * @typedef {Object} firebaseConfig BWS 설정
 * @param {firebaseConfig} config
 */
function initFirebase(config) {
  if (!config) {
    config = firebaseConfig;
  }
  const app = firebase.initializeApp(config, "BWS");
  return app;
}

/** @type {firebase.app.App} */
let firebaseApp;

/** @type {import('firebase/firestore').Firestore} */
let firestore;

/**
 * BWS 객체 받아옴.
 * Initalizes BWS. Required to be executed before using BWS.
 *
 * @typedef {Object} BWSConfig BWS 설정
 * @property {Object|undefined} firebaseConfig
 *
 * @param {BWSConfig=} config
 *
 *
 */
export function getBWS(config) {
  if (!firebaseApp) {
    firebaseApp = initFirebase(config?.firebaseConfig);
    firestore = getFirestore(firebaseApp);
  }

  return {
    firebaseApp,
    firestore,
    renderNav,
    User,
    OtherServices,
    Season
  };
}
