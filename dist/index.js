"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
dotenv_1.default.config({ debug: false });
const port = 3100;
const express_form_data_1 = __importDefault(require("express-form-data"));
app.use(express_1.default.json());
app.use(express_form_data_1.default.parse());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: ["http://localhost:5173", "https://booknest-client-zy9d.vercel.app"],
    credentials: true,
}));
app.use(body_parser_1.default.json({ limit: "20mb" }));
app.use(body_parser_1.default.urlencoded({ extended: true, limit: "20mb" }));
app.use((0, cookie_parser_1.default)());
// ✅ auth routes
const user_route_1 = __importDefault(require("./src/users/user.route"));
app.use("/api/auth", user_route_1.default);
// ✅ product routes
const product_route_1 = __importDefault(require("./src/products/product.route"));
app.use("/api/products", product_route_1.default);
// ✅ review routes
const review_route_1 = __importDefault(require("./src/reviews/review.route"));
app.use("/api/reviews", review_route_1.default);
// ✅ order routes
const order_route_1 = __importDefault(require("./src/orders/order.route"));
app.use("/api/orders", order_route_1.default);
// ✅ stats routes
const stats_route_1 = __importDefault(require("./src/stats/stats.route"));
app.use("/api/stats", stats_route_1.default);
// ✅ contact routes
const contact_route_1 = __importDefault(require("./src/contact/contact.route"));
const upload_route_1 = __importDefault(require("./src/utils/upload.route"));
app.use("/api/contact", contact_route_1.default);
// ✅ upload image to cloudinary
app.use("/api", upload_route_1.default);
// ✅ database connection
async function bootstrap() {
    try {
        const dbUrl = process.env.DB_URL;
        if (!dbUrl) {
            console.error("❌ No MongoDB URL found in environment variables.");
            process.exit(1);
        }
        await mongoose_1.default.connect(dbUrl);
        console.log("✅ MongoDB Connected!");
        app.listen(port, () => {
            console.log(`🚀 Server running on http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error("❌ MongoDB Connection Failed!", error);
    }
}
bootstrap();
// gKj9ArnMu3KiZSFI   naimurrahmun34
