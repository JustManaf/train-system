import express from "express";
import passengerRoutes from "./routes/passenger.js";
import adminRoutes from "./routes/admin.js";
import generalRoutes from "./routes/general.js"; // Import general routes
import reportRoutes from "./routes/reports.js";
import { config } from "dotenv";
config();
const app = express();

// Parse JSON request data (used for POST requests)
app.use(express.json());
// Parse post request
app.use(express.urlencoded({ extended: true }));
app.use("/passenger", passengerRoutes);
app.use("/general", generalRoutes);
app.use("/admin", adminRoutes);
app.use("/reports", reportRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}...`);
});
