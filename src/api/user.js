import { getCookie } from "../util";
import { config } from "../config";

const User = { isLoginUserAdmin, getUsers, addUsers, updateUsers, deleteUsers };
const URL = config.API_URL;

async function isLoginUserAdmin() {
    const token = getCookie("bws_t");
    const result = await fetch(URL.isAdmin, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const json = await result.json();

    return json.isAdmin;
}

async function getUsers(year) {
    const result = await fetch(URL.get(year));
    const json = await result.json();

    return json;
}

async function addUsers(users) {
    const token = getCookie("bws_t");
    const result = await fetch(URL.add, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(users),
    });

    const json = await result.json();
    return json;
}

async function updateUsers(users) {
    const token = getCookie("bws_t");
    const result = await fetch(URL.update, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ updatedUsers: users }),
    });

    return result;
}

async function deleteUsers(uids) {
    const token = getCookie("bws_t");
    const result = await fetch(URL.delete, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uids }),
    });

    return result;
}

export { User };
