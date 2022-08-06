import { readFile, arrcyToCsv, downloadText } from "../util";
import { API } from "../api";

export function Controls(State, userList) {
    let $controls = document.createElement("div");
    $controls.id = "controls";

    $controls.append(LoadUserBtn(State));
    $controls.append(DownloadUserBtn(State, userList));
    $controls.append(EditUserBtn(State));
    $controls.append(DeleteUserBtn(State, userList));

    return $controls;
}

function LoadUserBtn(State) {
    let $input = document.createElement("input");
    $input.type = "file";
    $input.className = "hide";
    $input.addEventListener("change", async () => {
        const users = await readFile($input.files[0]);
        alert("업로드 중. 새로고침하지 마세요.");
        const result = await API.User.addUsers(users);
        alert("업로드 완료");

        State.emit("userInfoUpdated");
    });

    let $button = document.createElement("label");
    $button.id = "load-user-btn";
    $button.className = "button";
    $button.innerText = "사용자 추가";

    $button.addEventListener("click", () => {
        alert(
            "주의사항 \n .csv 파일만 업로드 가능합니다. \n 이메일이 중복되는 사용자가 포함되어 있을 경우 해당 사용자를 제외한 나머지 사용자만 추가됩니다."
        );
    });

    $button.append($input);

    return $button;
}

function DownloadUserBtn(State, userList) {
    let $button = document.createElement("button");
    $button.id = "download-user-btn";
    $button.innerText = "내보내기";

    $button.addEventListener("click", () => {
        let formattedUsers = userList.map((user) => {
            user.adviserName = user?.adviser?.name;
            user.adviserUid = user?.adviser?.ref._path.segments[1];

            delete user.adviser;
            return user;
        });
        let csvText = arrcyToCsv(formattedUsers);
        let filename = "bws users - " + new Date().toISOString() + ".csv";
        downloadText(filename, csvText);
    });

    return $button;
}

function EditUserBtn(State) {
    let $button = document.createElement("button");
    $button.id = "edit-user-btn";
    $button.innerText = "수정";

    $button.addEventListener("click", () => {
        State.displayEditor = true;
    });

    State.onChange("checkedUsersIdx", () => {
        if (State.checkedUsersIdx.length > 1) {
            $button.innerText = "일괄 수정";
        } else {
            $button.innerText = "수정";
        }
    });

    return $button;
}

function DeleteUserBtn(State, userList) {
    let $button = document.createElement("button");
    $button.id = "delete-user-btn";
    $button.innerText = "삭제";

    $button.addEventListener("click", () => {
        let isConfirmed = confirm(
            `선택된 ${State.checkedUsersIdx.length} 사용자를 삭제하시겠습니까?`
        );
        if (isConfirmed) {
            let uids = State.checkedUsersIdx.map(
                (userIdx) => userList[userIdx].uid
            );
            API.User.deleteUsers(uids);

            State.checkedUsersIdx = [];
            State.emit("userInfoUpdated");
        }
    });

    State.onChange("checkedUsersIdx", () => {
        if (State.checkedUsersIdx.length > 1) {
            $button.innerText = "일괄 삭제";
        } else {
            $button.innerText = "삭제";
        }
    });

    return $button;
}
