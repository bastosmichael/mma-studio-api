import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import paymentRoutes from "./routes/paymentRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/payments", paymentRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
