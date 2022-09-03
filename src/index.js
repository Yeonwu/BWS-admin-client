import { Heading, Controls, Filter, Table, Editor } from "./components";
import { getBWS } from "./bws";
import { setCookie, deleteCookie } from "./util";
import { API } from "./api";
import { State, addState } from "./util/state";

// TODO: 하드코딩에서 Firebase에서 불러오는 걸로 변경.

const PAGES = ["사용자 관리", "백업관리"];

// 사용자 검색시 사용할 필터 정보
let FILTER_YEAR_VALUES = [];
const FILTER_TYPES = ["name", "type", "email", "grade", "adviser"];
const FILTER_NAMES = ["이름", "종류", "이메일", "학년", "어드바이저"];
const FILTER_VALUES = {
    name: [],
    type: ["학생", "교사", "외부인"],
    email: [],
    grade: [
        "6학년",
        "7학년",
        "8학년",
        "9학년",
        "10학년",
        "11학년",
        "12학년",
        "13학년",
    ],
    adviser: [],
};

addState("currentPageIdx", 0);

addState("filterSelectHide", true, true);
addState("displayFilterSelect", "", true);
addState("activeFilters", [], false);
addState("activeFilterChange", "", true);
addState("tempFilter", { type: "", value: "" }, true);
addState("searchValue", "", true);

addState("yearFilter", new Date().getFullYear(), true);
addState("yearSelectHide", true, true);

addState("checkedUsersIdx", [], true);

addState("userInfoUpdated", undefined, true);

addState("displayEditor", [], true);
addState("editorInputEnabled", [], false);
addState("editorInputValue", [], false);
addState("changedEditorInput", undefined, true);

async function renderPage() {
    let $body = document.querySelector("#bws-page-wrap");
    $body.innerHTML = `
        <h1 class='w3-xxxlarge w3-center'>Loading...</h1>
    `;

    let userList = (await API.User.getUsers(State.yearFilter)).map((user) => {
        return {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            type: user.auth,
            adviser: user.adviser,
            grade: user.grade,
        };
    });

    // 필터 정보 세팅
    FILTER_VALUES.adviser = userList
        .filter((user) => user.type == "교사")
        .map((user) => user.name);

    FILTER_VALUES.name = userList.map((user) => user.name);
    FILTER_VALUES.email = userList.map((user) => user.email);

    let currentYear = new Date().getFullYear();
    let years = [];
    for (let year = 2019; year <= currentYear; year++) {
        years.unshift(year);
    }
    FILTER_YEAR_VALUES = years;

    // 화면 렌더링
    let $heading = Heading(State, PAGES);
    let $controls = Controls(State, userList);
    let $filter = Filter(State, {
        yearValues: FILTER_YEAR_VALUES,
        type: FILTER_TYPES,
        name: FILTER_NAMES,
        value: FILTER_VALUES,
    });

    let $table = Table(State, FILTER_NAMES, userList);
    let $editor = Editor(State, FILTER_VALUES, userList);

    const Hr = () => document.createElement("hr");

    $body.innerHTML = "";
    $body.append($heading);
    $body.append(Hr());
    $body.append($controls);
    $body.append(Hr());
    $body.append($filter);
    $body.append(Hr());
    $body.append($table);

    $body.append($editor);
}

window.onload = async () => {
    const BWS = getBWS();
    BWS.renderNav();

    let loginUser;
    let token;
    let isAdmin;
    try {
        loginUser = await BWS.User.getCurrentUser();
        if (loginUser) {
            token = await loginUser.getIdToken();
            setCookie("bws_t", token, 1);

            try {
                isAdmin = await API.User.isLoginUserAdmin();
            } catch {
                isAdmin = false;
            }
        }
    } catch {
        deleteCookie("bws_t");
        alert("사용자 인증에 실패했습니다. 새로고침해주세요.");
    }

    if (!loginUser || !isAdmin) {
        document.querySelector("#bws-page-wrap").innerHTML = `
            <h1 class='w3-xxxlarge w3-center'>관리자 계정으로 로그인해주세요</h1>
        `;
    } else {
        renderPage();
    }

    State.onChange("yearFilter", renderPage);
    State.onChange("userInfoUpdated", renderPage);
};

window.State = State;
