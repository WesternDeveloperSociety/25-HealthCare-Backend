import type { Request, Response } from "express";

let appointments: any[] = [
  {
    id: "1",
    patientID: "patient-123",
    doctorID: "doctor-456",
    date: "2025-12-01T10:00:00Z",
    appointmentType: "checkup",
    summary: "Annual physical examination",
  }
];

/**
 * GET /api/appointments
 * List all appointments (filtered by user, doctor, date, type)
 */
export const getAllAppointments = async (req: Request, res: Response) => {
  // TODO: connect to Postgres + schema
  // TODO: Add filtering by patientID, doctorID, date range, appointmentType, status
  res.json(appointments);
};

/**
 * GET /api/appointments/:id
 * Get specific appointment details
 */
export const getAppointmentById = async (req: Request, res: Response) => {
  // TODO: connect to Postgres + schema
  const { id } = req.params;
  const appointment = appointments.find((a) => a.id === id);
  
  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }
  
  res.json(appointment);
};

/**
 * POST /api/appointments
 * Create new appointment
 */
export const createAppointment = async (req: Request, res: Response) => {
  // TODO: connect to Postgres + schema
  
  const newAppointment = {
    id: Date.now().toString(),
    patientID: req.body.patientID,
    doctorID: req.body.doctorID,
    appointmentType: req.body.appointmentType,
    date: req.body.date,
    summary: req.body.summary,
    ...req.body // Allow other fields for now
  };
  
  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
};
