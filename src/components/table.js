import { removeValue } from "../util";

export function Table(State, columnName, userList) {
    const $table = document.createElement("table");
    $table.id = "table";
    $table.classList.add("w3-table", "w3-bordered");

    const $tableHead = TableHead(State, columnName, userList);

    const $tableRows = document.createDocumentFragment();
    userList.forEach((user, idx) => {
        $tableRows.append(Row(State, user, idx));
    });

    $table.append($tableHead);
    $table.append($tableRows);

    State.onChange("activeFilterChange", () => updateTable(State, userList));
    return $table;
}

function TableHead(State, columnName, userList) {
    const $tableHead = document.createElement("tr");
    $tableHead.innerHTML = `
		<td id="check-box-head"><input type="checkbox" /></td>
		<td id="user-name-head">${columnName[0]}</td>
		<td id="user-type-head">${columnName[1]}</td>
		<td id="email-head">${columnName[2]}</td>
		<td id="grade-head">${columnName[3]}</td>
		<td id="adviser-head">${columnName[4]}</td>
	`;

    const $headCheckbox = $tableHead.querySelector("input");
    $headCheckbox.addEventListener("change", () => {
        checkDisplayUser($headCheckbox.checked);

        // 필터에 맞는 사용자를 전부 추가
        userList.forEach((user, idx) => {
            if (filterUser(State.activeFilters, user)) {
                if ($headCheckbox.checked) {
                    State.checkedUsersIdx.push(idx);
                } else {
                    removeValue(State.checkedUsersIdx, idx);
                }
            }
        });

        // 중복 제거
        State.checkedUsersIdx = [...new Set(State.checkedUsersIdx)];
    });

    return $tableHead;
}

function checkDisplayUser(tableheadChecked) {
    const $displayedUserCheckbox = document.querySelectorAll(
        ".table-row:not(.hide) input[type=checkbox]"
    );
    $displayedUserCheckbox.forEach(
        (checkbox) => (checkbox.checked = tableheadChecked)
    );
}

function updateTable(State, userList) {
    let filters = State.activeFilters;
    let rows = document.querySelectorAll(".table-row");

    userList.forEach((user, idx) => {
        if (filterUser(filters, user)) {
            rows[idx].classList.remove("hide");
        } else {
            rows[idx].classList.add("hide");
        }
    });
}

function filterUser(filters, user) {
    const filterPassed = filters.reduce((prev, filter) => {
        if (!prev || !user[filter.type]) {
            return false;
        }

        if (filter.type == "adviser") {
            return user.adviser.name.includes(filter.value);
        }
        return user[filter.type].includes(filter.value);
    }, true);

    return filterPassed;
}

function Row(State, user, idx) {
    const $row = document.createElement("tr");
    $row.className = "table-row";
    $row.innerHTML = `
		<td class="check-box-row"><input type="checkbox" /></td>
		<td class="user-name-row">${user.name}</td>
		<td class="user-type-row">${user.type ? user.type : "외부인"}</td>
		<td class="email-row">${user.email}</td>
		<td class="grade-row">${user.grade ? user.grade : ""}</td>
		<td id="adviser-row">${user.adviser ? user.adviser.name : ""}</td>
	`;

    const $input = $row.querySelector("input");
    $input.addEventListener("click", () => {
        if ($input.checked && !State.checkedUsersIdx.includes(idx)) {
            State.checkedUsersIdx.push(idx);
        } else {
            removeValue(State.checkedUsersIdx, idx);
        }
        State.emit("checkedUsersIdx");
    });

    return $row;
}
