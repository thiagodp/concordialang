"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppController_1 = require("./modules/app/AppController");
process.on('uncaughtException', console.error);
(new AppController_1.AppController())
    .start(__dirname, process.cwd())
    .then((success) => {
    process.exit(success ? 0 : 1);
})
    .catch((err) => {
    console.error(err);
    process.exit(1);
});
