export const State = {
    onChange: (propName, callback) => {
        if (!State[`_${propName}Listener`]) {
            throw Error(`${propName} has no listener`);
        }
        State[`_${propName}Listener`].push(callback);
    },

    emit: (propName) => {
        if (State[`_${propName}Listener`]?.length) {
            State[`_${propName}Listener`].forEach((listener) => {
                listener();
            });
        }
    },
};

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
