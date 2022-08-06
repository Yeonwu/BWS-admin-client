/**
 *
 * @param {import('firebase/firestore').QuerySnapshot} querySnapshot
 * @param {Function=} formatter
   
 }}
 * @returns {Array<any>} Array
 */
export function querySnapshotToArr(querySnapshot, formatter) {
  let arr = [];
  if (formatter) {
    querySnapshot.forEach((docSnapshot) => {
      arr.push(formatter(docSnapshot.data()));
    });
  } else {
    querySnapshot.forEach((docSnapshot) => {
      arr.push(docSnapshot.data());
    });
  }

  return arr;
}

export function isString(val) {
  return typeof val === "string" || val instanceof String;
}

export function isDate(val) {
  return val instanceof Date;
}
