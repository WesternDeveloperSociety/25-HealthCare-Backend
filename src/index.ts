import express from "express";
import usersRouter from "./routes/users.routes.js";
import appointmentsRouter from "./routes/appointments.routes.js";
import documentsRouter from "./routes/documents.routes.js";

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", usersRouter);
app.use("/api/appointments", appointmentsRouter);
app.use("/api/documents", documentsRouter);

app.get("/", (req, res) => {
  res.send("Hello, TypeScript + Express!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
