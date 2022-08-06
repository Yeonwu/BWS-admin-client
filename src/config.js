const server = "prod";

let config;
if (server == "dev") {
    config = {
        API_URL: {
            isAdmin: "http://localhost:3000/isadmin",
            get: (year) => `http://localhost:3000/users/get?year=${year}`,
            add: "http://localhost:3000/users/add",
            update: "http://localhost:3000/users/update",
            delete: "http://localhost:3000/users/delete",
        },
    };
} else if (server == "prod") {
    config = {
        API_URL: {
            isAdmin: "https://bws-admin-test.herokuapp.com/isadmin",
            get: (year) =>
                `https://bws-admin-test.herokuapp.com/users/get?year=${year}`,
            add: "https://bws-admin-test.herokuapp.com/users/add",
            update: "https://bws-admin-test.herokuapp.com/users/update",
            delete: "https://bws-admin-test.herokuapp.com/users/delete",
        },
    };
}

Object.freeze(config);

export { config };
