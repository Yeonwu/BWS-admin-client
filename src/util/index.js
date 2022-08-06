export function removeValue(array, value) {
    const idx = array.indexOf(value);
    if (idx > -1) {
        array.splice(idx, 1);
    }
    return array;
}

export function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

export function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export function deleteCookie(cname) {
    setCookie(cname, "", -1);
}

export async function readFile(file) {
    let reader = new FileReader();
    let promise = new Promise((resolve, reject) => {
        reader.onload = () => {
            resolve(csvToArray(reader.result));
        };

        reader.onerror = () => {
            reject(reader.error);
        };
    });
    reader.readAsText(file);

    return promise;
}

function csvToArray(str, delimiter = ",") {
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

    const rows = str.slice(str.indexOf("\n") + 1).split("\n");

    const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            if (header == "grade" && values[index]) {
                object.history = [];
                object.history.push({ grade: values[index] });
                return object;
            }

            if (header == "adviser_email" && values[index]) {
                object.history[0].adviserEmail = values[index];
                return object;
            }

            if (values[index]) {
                object[header] = values[index]
                    .replace("\r", "")
                    .replace("\n", "");
            }
            return object;
        }, {});
        return el;
    });

    return arr;
}

export function arrcyToCsv(array) {
    const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
    const header = Object.keys(array[0]);
    const csv = [
        header.join(","), // header row first
        ...array.map((row) =>
            header
                .map((fieldName) => JSON.stringify(row[fieldName], replacer))
                .join(",")
        ),
    ].join("\r\n");

    return csv;
}

export function downloadText(filename, text) {
    var element = document.createElement("a");
    element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
