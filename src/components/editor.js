import { API } from "../api";

export function Editor(State, FILTER_VALUES, userList) {
    const $editor = document.createElement("div");
    $editor.id = "editor";
    $editor.innerHTML = `<p class="w3-center">
		수정하고 싶은 항목 옆의 체크박스를 눌러주세요. <br />
		체크하지 않은 항목은 원래 값으로 유지됩니다. <br />
	</p>`;
    $editor.classList.add("hide");

    State.onChange("displayEditor", () => {
        if (State.displayEditor) {
            $editor.classList.remove("hide");
        } else {
            $editor.classList.add("hide");
        }
    });

    const $inputs = EditorInputs(State);
    const $btns = EditorBtns(State, FILTER_VALUES, userList);

    $editor.append($inputs);
    $editor.append($btns);
    return $editor;
}

function EditorInputs(State) {
    const $inputs = document.createElement("div");
    $inputs.id = "editor-inputs";

    const $nameInput = NameInput(State);
    const $typeInput = TypeInput(State);
    const $emailInput = EmailInput(State);
    const $gradeInput = GradeInput(State);
    const $adviserInput = AdviserInput(State);

    $inputs.append($nameInput);
    $inputs.append($typeInput);
    $inputs.append($emailInput);
    $inputs.append($gradeInput);
    $inputs.append($adviserInput);

    return $inputs;
}

function EditorBtns(State, FILTER_VALUES, userList) {
    const $btns = document.createElement("div");
    $btns.id = "editor-btns";

    const $submitBtn = SubmitBtn(State, FILTER_VALUES, userList);
    const $calcleBtn = CancleBtn(State);

    $btns.append($submitBtn);
    $btns.append($calcleBtn);

    return $btns;
}

function NameInput(State) {
    const { $wrap } = TextInput(State, "name", "이름");
    return $wrap;
}

function TypeInput(State) {
    const { $wrap } = TextInput(State, "type", "종류(학생 / 교사 / 외부인)");
    return $wrap;
}

function EmailInput(State) {
    const { $wrap } = TextInput(State, "email", "이메일");
    return $wrap;
}

function GradeInput(State) {
    const { $wrap } = TextInput(State, "grade", "학년 (6학년 ~ 13학년)");
    return $wrap;
}

function AdviserInput(State) {
    const { $wrap } = TextInput(State, "adviser", "어드바이저 이메일");
    return $wrap;
}

function TextInput(State, inputName, placeholder) {
    const $wrap = document.createElement("div");
    $wrap.id = `edit-${inputName}`;

    const $input = document.createElement("input");
    $input.type = "text";
    $input.placeholder = placeholder;
    $input.disabled = true;

    $input.addEventListener("change", () => {
        State.editorInputValue[inputName] = $input.value;
    });

    State.onChange("changedEditorInput", () => {
        if (State.changedEditorInput == inputName) {
            $input.disabled = !State.editorInputEnabled[inputName];
        }
    });

    const $checkbox = document.createElement("input");
    $checkbox.type = "checkbox";

    State.editorInputEnabled[inputName] = false;
    $checkbox.addEventListener("click", () => {
        State.editorInputEnabled[inputName] = $checkbox.checked;
        State.changedEditorInput = inputName;
    });

    $wrap.append($checkbox);
    $wrap.append($input);

    return { $wrap, $checkbox, $input };
}

function SubmitBtn(State, FILTER_VALUES, userList) {
    const $btn = document.createElement("button");
    $btn.id = "editor-submit";
    $btn.innerText = "수정";

    $btn.addEventListener("click", () => {
        const checkedUserNumber = State.checkedUsersIdx.length;
        if (confirm(`${checkedUserNumber}명의 정보를 수정하시겠습니까?`))
            updateUser(State, FILTER_VALUES, userList);
    });

    return $btn;
}

function CancleBtn(State) {
    const $btn = document.createElement("button");
    $btn.id = "editor-cancle";
    $btn.innerText = "취소";

    $btn.addEventListener("click", () => {
        State.displayEditor = false;
    });
    return $btn;
}

async function updateUser(State, FILTER_VALUES, userList) {
    try {
        validateUpdateValue(State, FILTER_VALUES, userList);
    } catch (error) {
        alert(error.message);
        return false;
    }

    let updatedUsers = formatUpdateInfo(State, userList);

    try {
        await API.User.updateUsers(updatedUsers);
        console.log(updatedUsers);
    } catch (error) {
        console.error(error);
    }
}

function validateUpdateValue(State, FILTER_VALUES, userList) {
    let updateValue = State.editorInputValue;
    let isInputEnabled = State.editorInputEnabled;

    if (isBatch(State)) {
        if (updateValue["name"] && isInputEnabled.name) {
            throw Error("사용자명은 일괄수정이 불가능합니다.");
        }

        if (updateValue["email"] && isInputEnabled.email) {
            throw Error("이메일은 일괄수정이 불가능합니다.");
        }
    }

    if (isEmailDup(updateValue.email, userList) && isInputEnabled.email) {
        throw Error(`이메일이 중복되는 사용자가 있습니다.`);
    }

    if (
        !isValueAllowed(updateValue["type"], FILTER_VALUES["type"]) &&
        isInputEnabled.type
    ) {
        throw Error("사용자 종류는 학생, 교사, 외부인만 가능합니다.");
    }

    if (
        !isValueAllowed(updateValue["grade"], FILTER_VALUES["grade"]) &&
        isInputEnabled.grade
    ) {
        throw Error("학년은 6학년 ~ 13학년만 가능합니다.");
    }

    let adviserEmails = userList
        .filter((user) => user.type == "교사")
        .map((user) => user.email);

    if (
        !isValueAllowed(updateValue["adviser"], adviserEmails) &&
        isInputEnabled.adviser
    ) {
        throw Error("존재하지 않는 어드바이저 이메일입니다.");
    }
}

function formatUpdateInfo(State, userList) {
    let updateValue = State.editorInputValue;
    let isInputEnabled = State.editorInputEnabled;
    let updateUserInfo = State.checkedUsersIdx.map((userIdx) => {
        let user = userList[userIdx];
        let newUser = {};

        newUser.uid = user.uid;

        if (updateValue.name && isInputEnabled.name) {
            newUser.name = updateValue.name;
        }

        if (updateValue.type && isInputEnabled.type) {
            newUser.type = updateValue.type;
        }

        if (updateValue.email && isInputEnabled.email) {
            newUser.email = updateValue.email;
        }

        if (updateValue.grade && isInputEnabled.grade) {
            newUser.history = [];
            newUser.history.push({
                grade: updateValue.grade,
                year: new Date().getFullYear().toString(),
            });
        }

        if (updateValue.adviser && isInputEnabled.adviser) {
            if (!newUser.history) {
                newUser.history = [];
                newUser.history.push({
                    grade: user.grade,
                    year: new Date().getFullYear().toString(),
                });
            }

            let adviser = userList.find(
                (user) => user.email == updateValue.adviser
            );
            newUser.history[0].adviser = {
                uid: adviser.uid,
                name: adviser.name,
            };
        }

        return newUser;
    });

    return updateUserInfo;
}

function isBatch(State) {
    return State.checkedUsersIdx.length > 1;
}

function isEmailDup(email, userList) {
    if (email) {
        return userList.find((user) => user.email == email) !== undefined;
    }
    return false;
}

function isValueAllowed(value, allowed) {
    if (value) {
        return allowed.includes(value);
    }
    return false;
}
