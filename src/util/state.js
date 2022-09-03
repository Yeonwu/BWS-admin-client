export const State = {
    // 해당 State 변화 이벤트 리스너 등록
    onChange: (propName, callback) => {
        if (!State[`_${propName}Listener`]) {
            throw Error(`${propName} has no listener`);
        }
        State[`_${propName}Listener`].push(callback);
    },

    // 해당 State 변화 이벤트 발생
    // 배열, 객체와 같이 내부 값이 변화되었을 때 이벤트를 발생시켜주어야 리스너 작동.
    emit: (propName) => {
        if (State[`_${propName}Listener`]?.length) {
            State[`_${propName}Listener`].forEach((listener) => {
                listener();
            });
        }
    },
};

// State 추가
export const addState = (propName, value, listen) => {
    State[`_${propName}`] = value;
    if (listen) {
        State[`_${propName}Listener`] = [];
        Object.defineProperty(State, propName, {
            get() {
                return this[`_${propName}`];
            },

            set(value) {
                this[`_${propName}`] = value;
                State.emit(propName);
            },
        });
    } else {
        Object.defineProperty(State, propName, {
            get() {
                return this[`_${propName}`];
            },

            set(value) {
                this[`_${propName}`] = value;
            },
        });
    }
};
