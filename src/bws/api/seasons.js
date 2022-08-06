import { getBWS } from "../";
import { collection, getDocs, query } from "firebase/firestore";
import { querySnapshotToArr, isDate, isString } from "../util";

export const Season = {
  getAll,
  getQuaterOfDate,
  getPeriodOfQuater
};

function getAll() {
  return repository.Seasons();
}

/**
 *
 * @param {Date} date
 */
function getQuaterOfDate(date) {
  if (!isDate(date)) {
    throw TypeError("date must be Date Object.");
  }
  return service.getQuaterOfDate(date);
}

/**
 *
 * @param {string} year
 * @param {string} quater
 */
function getPeriodOfQuater(year, quater) {
  if (!isString(year)) {
    throw TypeError("year must be String.");
  }

  if (!isString(quater)) {
    throw TypeError("quater must be String");
  }
  return service.getPeriodOfQuater(year, quater);
}

const repository = {
  Seasons: async () => {
    const BWS = getBWS();
    const seasonsCol = collection(BWS.firestore, "seasons");
    const q = query(seasonsCol);

    const snapshot = await getDocs(q);
    const seasons = querySnapshotToArr(snapshot, (season) => {
      season.from = season.from.toDate();
      season.to = season.to.toDate();
      return season;
    });

    return seasons;
  }
};

const service = {
  getPeriodOfQuater: async (year, quater) => {
    try {
      const seasons = await repository.Seasons();
      return seasons.filter(
        (season) =>
          season.year === String(year) && season.quater === String(quater)
      )[0];
    } catch (e) {
      console.error(`${year}년도 ${quater}쿼터 정보를 가져오지 못했습니다.`);
      throw e;
    }
  },

  /**
   *
   * @param {Date} date
   */
  getQuaterOfDate: async (date) => {
    try {
      const seasons = await repository.Seasons();
      const SECOND_PER_DAY = 86400;

      return seasons.filter(
        (season) =>
          // 밀리세컨드 단위에서 오차가 발생함. 하루 기준으로 판단하기 위해 다음과 같이 비교.
          (season.from.getTime() - date.getTime()) / SECOND_PER_DAY <= 1 &&
          (season.to.getTime() - date.getTime()) / SECOND_PER_DAY >= 1
      )[0];
    } catch (e) {
      console.error(`${date}: 해당 날짜의 쿼터 정보를 가져오지 못했습니다.`);
      throw e;
    }
  }
};
