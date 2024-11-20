"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http2_1 = __importDefault(require("http2"));
const cors_1 = __importDefault(require("cors"));
const types_1 = require("./types");
dotenv_1.default.config();
const checkedEnv = types_1.types.env.safeParse(process.env);
if (!checkedEnv.success) {
    throw new Error(checkedEnv.error.errors.map((err) => err.message).join(", "));
}
const env = checkedEnv.data;
const app = (0, express_1.default)();
const httpServer = http2_1.default.createServer(app);
// const io = new SocketioServer(httpServer);
app.use((0, cors_1.default)());
app.get("/", (req, res) => {
    res.json({ test: "coucuo" });
});
app.listen(8080);
// httpServer.listen(env.PORT, () => {
//   console.log(`Server listening on port ${env.PORT}`);
// });
