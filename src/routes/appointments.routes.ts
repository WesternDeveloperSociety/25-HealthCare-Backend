import { Router } from "express";
import { getAllAppointments, getAppointmentById, createAppointment } from "../controllers/appointments.controller.js";

const router = Router();

// TODO: add Clerk requireAuth middleware to all routes

router.get("/", getAllAppointments);
router.get("/:id", getAppointmentById);
router.post("/", createAppointment);

export default router;
