export function Filter(State, filterInfo) {
    const $filterList = document.createElement("div");
    $filterList.id = "filter-list";

    $filterList.append(YearFilter(State, filterInfo.yearValues));
    $filterList.append(AddFilter(State, filterInfo));

    const updateFilterList = () => {
        if (State.activeFilterChange == "add") {
            const $activeFilter = ActiveFilter(
                State,
                State.activeFilters.at(-1)
            );
            $filterList.append($activeFilter);
        }
    };
    State.onChange("activeFilterChange", updateFilterList);

    updateFilterList();
    return $filterList;
}

function ActiveFilter(State, newFilter) {
    const $filter = document.createElement("div");
    $filter.className = "filter";

    const $content = document.createElement("div");
    $content.class = "filter-content";
    $content.innerText = `${newFilter.name}: ${newFilter.value}`;

    const $removeBtn = document.createElement("button");
    $removeBtn.className = "remove-filter";
    $removeBtn.innerHTML = '<i class="las la-times"></i>';

    $removeBtn.addEventListener("click", () => {
        $filter.remove();

        State.activeFilters = State.activeFilters.filter(
            (filter) => filter.id !== newFilter.id
        );
        State.activeFilterChange = "remove";
    });

    $filter.append($content);
    $filter.append($removeBtn);

    return $filter;
}

function AddFilter(State, filterInfo) {
    const $addFilter = document.createElement("div");
    $addFilter.id = "add-filter";
    $addFilter.className = "filter";

    const $btn = AddFilterBtn(State);
    const $availableFilterList = AvailableFilterList(State, filterInfo);

    $addFilter.append($btn);
    $addFilter.append($availableFilterList);
    return $addFilter;
}

function AddFilterBtn(State) {
    const $btn = document.createElement("button");
    $btn.id = "add-filter-btn";
    $btn.innerText = "검색조건추가";

    $btn.addEventListener("click", () => {
        State.filterSelectHide = !State.filterSelectHide;
    });

    return $btn;
}

function AvailableFilterList(State, filterInfo) {
    const $list = document.createElement("div");
    $list.id = "available-filter-list";
    $list.className = "hide";

    filterInfo.type.forEach((filterType, idx) => {
        $list.append(
            AvailableFilter(
                State,
                filterType,
                filterInfo.name[idx],
                filterInfo.value[filterType]
            )
        );
    });

    State.onChange("filterSelectHide", () => $list.classList.toggle("hide"));

    return $list;
}

function AvailableFilter(State, filterType, name, values) {
    const $filter = document.createElement("div");
    $filter.className = "available-filter";

    const $content = document.createElement("div");
    $content.className = "available-filter-content";
    $content.innerText = name;

    const $selectList = AvailableFilterSelectList(
        State,
        filterType,
        name,
        values
    );

    $content.addEventListener(
        "click",
        () => (State.displayFilterSelect = filterType)
    );

    $filter.append($content);
    $filter.append($selectList);
    return $filter;
}

function AvailableFilterSelectList(State, filterType, name, values) {
    const $list = document.createElement("div");
    $list.classList.add("available-filter-select-list", "hide");

    const $search = AvailableFilterSearch(State, filterType, name);

    const $btns = document.createElement("div");
    $btns.className = "available-filter-btn-list";
    $btns.append(ApplyFilterBtn(State));
    $btns.append(CancleFilterBtn(State));

    const $selects = document.createDocumentFragment();
    values.forEach((value) => {
        const $select = document.createElement("div");
        $select.className = "available-filter-select";
        $select.innerText = value;

        $select.addEventListener("click", () => {
            State.tempFilter.type = filterType;
            State.tempFilter.name = name;
            State.tempFilter.value = value;

            State.emit("tempFilter");
        });

        $selects.append($select);
    });

    State.onChange("searchValue", () => {
        if (filterType != State.displayFilterSelect) return;

        State.tempFilter.type = filterType;
        State.tempFilter.value = State.searchValue;
        State.tempFilter.name = name;

        const $selects = $list.querySelectorAll(".available-filter-select");

        values.forEach((value, idx) => {
            if (value.includes(State.searchValue) || !State.searchValue) {
                $selects[idx].classList.remove("hide");
            } else {
                $selects[idx].classList.add("hide");
            }
        });
    });

    $list.append($search);
    $list.append($btns);
    $list.append($selects);

    State.onChange("displayFilterSelect", () => {
        emptyFilter(State);

        if (filterType == State.displayFilterSelect) {
            $list.classList.remove("hide");
        } else {
            $list.classList.add("hide");
        }
    });

    return $list;
}

function ApplyFilterBtn(State) {
    const $applyBtn = document.createElement("button");
    $applyBtn.className = "apply-filter-btn";
    $applyBtn.innerHTML = "확인";
    $applyBtn.addEventListener("click", () => {
        const { type, value, name } = State.tempFilter;
        if (!(type && value && name)) return;

        State.filterSelectHide = false;
        State.activeFilters.push({
            id: new Date().getTime(),
            type,
            value,
            name,
        });
        emptyFilter(State);
        State.activeFilterChange = "add";
        State.emit("activeFilters");
    });

    return $applyBtn;
}

function CancleFilterBtn(State) {
    const $cancleBtn = document.createElement("button");
    $cancleBtn.className = "cancle-filter-btn";
    $cancleBtn.innerHTML = "취소";
    $cancleBtn.addEventListener("click", () => {
        emptyFilter(State);
        State.filterSelectHide = false;
    });

    return $cancleBtn;
}

function AvailableFilterSearch(State, type, name) {
    const $search = document.createElement("div");
    $search.className = "available-filter-search";

    const $input = document.createElement("input");
    $input.type = "text";
    $input.placeholder = name;

    $search.append($input);

    let timeout;
    $input.addEventListener("keyup", () => {
        // 0.5초 이내에 추가 입력이 없을 경우 검색
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => (State.searchValue = $input.value), 500);
    });

    State.onChange("tempFilter", () => {
        if (type == State.tempFilter.type) {
            $input.value = State.tempFilter.value;
        }
    });

    return $search;
}

function YearFilter(State, yearFilterValues) {
    const $yearFilter = document.createElement("div");
    $yearFilter.id = "filter-year";
    $yearFilter.className = "filter";

    const $filterContent = FilterContent(State);

    const $selectYearBtn = SelectYearBtn(State);

    const $yearFilterList = YearFilterList(State, yearFilterValues);

    $yearFilter.append($filterContent);
    $yearFilter.append($yearFilterList);
    $yearFilter.append($selectYearBtn);
    return $yearFilter;
}

function FilterContent(State) {
    const $filterContent = document.createElement("div");
    $filterContent.className = "filter-content";
    $filterContent.innerText = State.yearFilter;

    State.onChange("yearFilter", () => {
        $filterContent.innerText = State.yearFilter;
    });

    return $filterContent;
}

function SelectYearBtn(State) {
    const $btn = document.createElement("button");
    $btn.id = "select-year-btn";
    $btn.innerHTML = `<i class="las la-angle-down"></i>`;

    $btn.addEventListener("click", () => {
        State.yearSelectHide = !State.yearSelectHide;
        if (State.yearSelectHide) {
            $btn.innerHTML = `<i class="las la-angle-down"></i>`;
        } else {
            $btn.innerHTML = `<i class="las la-angle-up"></i>`;
        }
    });

    return $btn;
}

function YearFilterList(State, yearFilterValues) {
    const $list = document.createElement("div");
    $list.id = "year-filter-list";
    $list.classList.add("hide");

    yearFilterValues.forEach((filterValue) => {
        $list.append(YearFilterSelect(State, filterValue));
    });

    State.onChange("yearSelectHide", () => $list.classList.toggle("hide"));

    return $list;
}

function YearFilterSelect(State, filterValue) {
    const $select = document.createElement("div");
    $select.className = "available-filter";

    const $content = document.createElement("div");
    $content.className = "available-filter-content";
    $content.innerText = filterValue;

    $select.addEventListener("click", () => {
        State.yearFilter = filterValue;
    });

    $select.append($content);
    return $select;
}

function emptyFilter(State) {
    State.tempFilter = { type: "", value: "" };
    State.searchValue = "";

    const inputs = document.querySelectorAll(".available-filter-search>input");
    inputs.forEach((input) => (input.value = ""));
}
