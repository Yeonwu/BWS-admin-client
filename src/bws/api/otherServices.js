import { getBWS } from "../";
import { collection, getDocs, query } from "firebase/firestore";
import { querySnapshotToArr } from "../util";

export const OtherServices = {
  getAll
};

function getAll() {
  return service.getOtherServices();
}

const service = {
  getOtherServices: () => {
    return repository.Services();
  }
};

const repository = {
  Services: async () => {
    const BWS = getBWS();

    const serviceCol = collection(BWS.firestore, "services");
    const q = query(serviceCol);

    const snapshot = await getDocs(q);
    return querySnapshotToArr(snapshot);
  }
};
