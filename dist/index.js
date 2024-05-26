"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routes_1 = __importDefault(require("./routes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? [
        'https://pdf-extractor-app.uc.r.appspot.com',
        'https://pdf-extractor-react-d87ce.web.app',
    ]
    : ['http://localhost:3000'];
// const corsOptions = {
//   origin: (origin: any, callback: any) => {
//     if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true,
// };
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(routes_1.default);
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
