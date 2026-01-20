import type { Request, Response } from 'express';

interface CalendarEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  type: string;
  userId?: string;
}

// In-memory storage for events (replace with database later)
let events: CalendarEvent[] = [
  {
    id: '1',
    date: '2025-12-01T10:00:00Z',
    title: 'Annual Checkup',
    description: 'Regular annual physical examination',
    type: 'appointment',
  },
  {
    id: '2',
    date: '2025-12-05T14:30:00Z',
    title: 'Dental Cleaning',
    description: 'Routine dental cleaning and checkup',
    type: 'appointment',
  },
  {
    id: '3',
    date: '2025-12-10T09:00:00Z',
    title: 'Lab Results Review',
    description: 'Review of recent lab work',
    type: 'follow-up',
  },
  {
    id: '4',
    date: '2025-12-15T11:00:00Z',
    title: 'Specialist Consultation',
    description: 'Consultation with specialist',
    type: 'consultation',
  },
  {
    id: '5',
    date: '2025-12-01T15:00:00Z',
    title: 'Medication Review',
    description: 'Review current medications',
    type: 'follow-up',
  },
];

/**
 * GET /api/events
 * Get all events for the calendar, sorted by date.
 * Supports optional filtering by date range, type, and userId.
 */
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, type, userId } = req.query;

    let filteredEvents = [...events];

    // Filter by date range if provided
    if (startDate) {
      const start = new Date(startDate as string);
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.date) >= start
      );
    }

    if (endDate) {
      const end = new Date(endDate as string);
      filteredEvents = filteredEvents.filter(
        (event) => new Date(event.date) <= end
      );
    }

    // Filter by type if provided
    if (type) {
      filteredEvents = filteredEvents.filter(
        (event) => event.type === type
      );
    }

    // Filter by userId if provided
    if (userId) {
      filteredEvents = filteredEvents.filter(
        (event) => event.userId === userId
      );
    }

    // Sort events by date (ascending)
    filteredEvents.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    res.json({
      success: true,
      count: filteredEvents.length,
      data: filteredEvents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * GET /api/events/:id
 * Get a specific event by ID
 */
export const getEventById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = events.find((e) => e.id === id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/events
 * Create a new event for the calendar.
 * Required fields: date, title, type
 */
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { date, title, description, type, userId } = req.body;

    // Validate required fields
    if (!date || !title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: date, title, and type are required',
      });
    }

    // Validate date format
    const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Please use ISO 8601 format.',
      });
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      date: eventDate.toISOString(),
      title,
      description,
      type,
      userId,
    };

    events.push(newEvent);

    // Re-sort events by date
    events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating event',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
