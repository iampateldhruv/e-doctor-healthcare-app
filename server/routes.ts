import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer storage for prescription uploads
const prescriptionStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: prescriptionStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed.") as any);
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API prefix
  const apiPrefix = "/api";

  // Auth-related routes
  app.post(`${apiPrefix}/login`, async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await storage.getUserByUsername(username);

    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({ user });
  });

  // User routes
  app.get(`${apiPrefix}/users/current`, async (req: Request, res: Response) => {
    // In a real app, this would be fetched from the session
    // For demo purposes, let's return a default user
    const user = await storage.getUserByUsername("john");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  });

  // Doctor routes
  app.get(`${apiPrefix}/doctors`, async (req: Request, res: Response) => {
    const { specialization } = req.query;
    
    let doctors;
    if (specialization && typeof specialization === 'string') {
      doctors = await storage.listDoctorsBySpecialization(specialization);
    } else {
      doctors = await storage.listDoctorsWithUsers();
    }
    
    // Debug log
    console.log("Doctors count:", doctors.length);
    console.log("Raw doctors:", await storage.listDoctors());
    
    return res.status(200).json(doctors);
  });

  app.get(`${apiPrefix}/doctors/:id`, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const doctor = await storage.getDoctorWithUser(id);
    
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    
    return res.status(200).json(doctor);
  });

  // Appointment routes
  app.get(`${apiPrefix}/appointments`, async (req: Request, res: Response) => {
    const { userId, role } = req.query;
    
    let appointments;
    if (userId && role) {
      const id = parseInt(userId as string);
      if (role === 'patient') {
        appointments = await storage.listAppointmentsByPatient(id);
      } else if (role === 'doctor') {
        appointments = await storage.listAppointmentsByDoctor(id);
      }
    } else {
      appointments = await storage.listAppointmentsWithDetails();
    }
    
    return res.status(200).json(appointments);
  });

  app.post(`${apiPrefix}/appointments`, async (req: Request, res: Response) => {
    const { patientId, doctorId, date, time } = req.body;
    
    try {
      const appointment = await storage.createAppointment({
        patientId,
        doctorId,
        date,
        time,
        status: 'pending'
      });
      
      // Create a notification for the patient
      const doctor = await storage.getDoctorWithUser(doctorId);
      if (doctor) {
        await storage.createNotification({
          userId: patientId,
          type: 'appointment',
          title: 'Appointment Scheduled',
          message: `Your appointment with ${doctor.user.fullName} on ${date} at ${time} has been scheduled.`,
          isRead: false,
          metadata: { appointmentId: appointment.id }
        });
      }
      
      return res.status(201).json(appointment);
    } catch (error) {
      return res.status(400).json({ message: "Failed to create appointment" });
    }
  });

  // Notification routes
  app.get(`${apiPrefix}/notifications`, async (req: Request, res: Response) => {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const notifications = await storage.listNotificationsByUser(parseInt(userId as string));
    return res.status(200).json(notifications);
  });

  app.patch(`${apiPrefix}/notifications/:id/read`, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const notification = await storage.markNotificationAsRead(id);
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    return res.status(200).json(notification);
  });

  // Medicine routes
  app.get(`${apiPrefix}/medicines`, async (req: Request, res: Response) => {
    const { category, type } = req.query;
    
    let medicines;
    if (category && typeof category === 'string') {
      medicines = await storage.listMedicinesByCategory(category);
    } else if (type && typeof type === 'string') {
      medicines = await storage.listMedicinesByType(type);
    } else {
      medicines = await storage.listMedicines();
    }
    
    return res.status(200).json(medicines);
  });

  app.get(`${apiPrefix}/medicines/:id`, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const medicine = await storage.getMedicine(id);
    
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    
    return res.status(200).json(medicine);
  });

  // Prescription routes
  app.post(`${apiPrefix}/prescriptions/upload`, upload.single('prescription'), async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const { userId, isUrgent } = req.body;
    
    try {
      const prescription = await storage.createPrescription({
        userId: parseInt(userId),
        filePath: req.file.path,
        status: 'pending',
        isUrgent: isUrgent === 'true'
      });
      
      // Create a notification for the user
      await storage.createNotification({
        userId: parseInt(userId),
        type: 'prescription',
        title: 'Prescription Received',
        message: 'Your prescription has been received and is being processed.',
        isRead: false,
        metadata: { prescriptionId: prescription.id }
      });
      
      return res.status(201).json(prescription);
    } catch (error) {
      return res.status(400).json({ message: "Failed to upload prescription" });
    }
  });

  app.get(`${apiPrefix}/prescriptions`, async (req: Request, res: Response) => {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    
    const prescriptions = await storage.listPrescriptionsByUser(parseInt(userId as string));
    return res.status(200).json(prescriptions);
  });

  // Blog routes
  app.get(`${apiPrefix}/blogs`, async (req: Request, res: Response) => {
    const blogs = await storage.listBlogsWithAuthors();
    return res.status(200).json(blogs);
  });

  app.get(`${apiPrefix}/blogs/:id`, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const blog = await storage.getBlog(id);
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    
    // Increment view count
    await storage.incrementBlogViews(id);
    
    // Get the author
    const author = await storage.getUser(blog.authorId);
    
    return res.status(200).json({ ...blog, author });
  });

  // Comment routes
  app.get(`${apiPrefix}/blogs/:blogId/comments`, async (req: Request, res: Response) => {
    const blogId = parseInt(req.params.blogId);
    const comments = await storage.listCommentsByBlogWithUsers(blogId);
    return res.status(200).json(comments);
  });

  app.post(`${apiPrefix}/blogs/:blogId/comments`, async (req: Request, res: Response) => {
    const blogId = parseInt(req.params.blogId);
    const { userId, content, parentId } = req.body;
    
    try {
      const comment = await storage.createComment({
        blogId,
        userId,
        content,
        parentId: parentId ? parseInt(parentId) : undefined
      });
      
      // Get the user for the response
      const user = await storage.getUser(userId);
      
      return res.status(201).json({ ...comment, user });
    } catch (error) {
      return res.status(400).json({ message: "Failed to create comment" });
    }
  });

  app.post(`${apiPrefix}/comments/:id/like`, async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const comment = await storage.incrementCommentLikes(id);
    
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    return res.status(200).json(comment);
  });

  const httpServer = createServer(app);
  return httpServer;
}
