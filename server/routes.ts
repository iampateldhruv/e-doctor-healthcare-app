import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import { supabase, testSupabaseConnection } from "./supabase";
import { identifyDisease, recommendSpecialists, symptoms } from "./symptomChecker";
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

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
  
  // Test Supabase connection
  try {
    const connected = await testSupabaseConnection();
    console.log(`Supabase connection test: ${connected ? 'SUCCESS' : 'FAILED'}`);
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
  }

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
  
  // =============== SYMPTOM CHECKER ROUTES ===============
  
  // Get all available symptoms
  app.get(`${apiPrefix}/symptoms`, async (req: Request, res: Response) => {
    return res.status(200).json(symptoms);
  });
  
  // Check symptoms and identify possible diseases
  app.post(`${apiPrefix}/symptom-checker`, async (req: Request, res: Response) => {
    const { symptoms } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: "Symptoms array is required" });
    }
    
    const result = identifyDisease(symptoms);
    return res.status(200).json(result);
  });
  
  // Recommend specialists based on symptoms
  app.post(`${apiPrefix}/symptom-checker/recommend-specialists`, async (req: Request, res: Response) => {
    const { symptoms } = req.body;
    
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: "Symptoms array is required" });
    }
    
    const recommendation = recommendSpecialists(symptoms);
    
    // Get doctors by the recommended specialties
    const doctorsBySpecialty = [];
    
    for (const specialty of recommendation.recommendedSpecialists) {
      const doctors = await storage.listDoctorsBySpecialization(specialty.toLowerCase());
      if (doctors.length > 0) {
        doctorsBySpecialty.push({
          specialty,
          doctors
        });
      }
    }
    
    return res.status(200).json({
      ...recommendation,
      doctorsBySpecialty
    });
  });

  // =============== CHAT ROUTES ===============
  
  // Configure multer storage for chat file uploads
  const chatUploadsStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), "uploads", "chat");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
  
  const chatUpload = multer({
    storage: chatUploadsStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: function (req, file, cb) {
      const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      const allowedDocTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain"];
      
      if ([...allowedImageTypes, ...allowedDocTypes].includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Invalid file type. Only images, PDFs, DOC, DOCX, and TXT are allowed.") as any);
      }
    },
  });
  
  // Chat file upload endpoint
  app.post(`${apiPrefix}/chat/upload`, chatUpload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const { appointmentId } = req.body;
    
    if (!appointmentId) {
      return res.status(400).json({ message: "Appointment ID is required" });
    }
    
    try {
      // In a production environment, you'd probably upload to a cloud storage service
      // For this example, we'll just use the local path
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const relativePath = `/uploads/chat/${path.basename(req.file.path)}`;
      const fileUrl = `${baseUrl}${relativePath}`;
      
      return res.status(201).json({
        url: fileUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error) {
      console.error("File upload error:", error);
      return res.status(500).json({ message: "Failed to upload file" });
    }
  });

  const httpServer = createServer(app);
  
  // =============== CHAT VIA WEBSOCKETS ===============
  
  // Set up the WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active connections
  const clients = new Map();
  
  // Handle WebSocket connections
  wss.on('connection', (ws) => {
    // Generate a unique client ID
    const clientId = uuidv4();
    
    // Store the connection
    clients.set(clientId, { 
      ws, 
      userId: null,
      doctorId: null,
      appointmentId: null,
      userType: null
    });
    
    console.log(`WebSocket client connected: ${clientId}`);
    
    // Handle authentication and messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        // Handle authentication
        if (data.type === 'auth') {
          const client = clients.get(clientId);
          client.userId = data.userId;
          client.userType = data.userType;
          
          if (data.userType === 'doctor') {
            client.doctorId = data.doctorId;
          }
          
          clients.set(clientId, client);
          
          // Send confirmation message
          ws.send(JSON.stringify({
            type: 'auth_success',
            clientId,
            userId: data.userId,
            userType: data.userType
          }));
          
          console.log(`WebSocket client authenticated: ${clientId}, User: ${data.userId}, Type: ${data.userType}`);
        }
        
        // Handle joining a chat room for an appointment
        if (data.type === 'join_appointment_chat') {
          const client = clients.get(clientId);
          client.appointmentId = data.appointmentId;
          clients.set(clientId, client);
          
          // Send confirmation
          ws.send(JSON.stringify({
            type: 'join_success',
            appointmentId: data.appointmentId
          }));
          
          // Load chat history
          const chatHistory = await storage.getChatHistory(data.appointmentId);
          if (chatHistory && chatHistory.length > 0) {
            ws.send(JSON.stringify({
              type: 'chat_history',
              messages: chatHistory
            }));
          }
          
          console.log(`WebSocket client joined appointment chat: ${clientId}, Appointment: ${data.appointmentId}`);
        }
        
        // Handle chat messages
        if (data.type === 'chat_message') {
          const client = clients.get(clientId);
          
          if (!client.appointmentId) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'You must join an appointment chat first'
            }));
            return;
          }
          
          // Save the message to the database
          const message = await storage.createChatMessage({
            appointmentId: client.appointmentId,
            senderId: client.userId,
            senderType: client.userType,
            content: data.content,
            attachmentUrl: data.attachmentUrl || null,
            attachmentType: data.attachmentType || null
          });
          
          // Get the appointment details to find the other participant
          const appointment = await storage.getAppointment(client.appointmentId);
          
          if (!appointment) {
            ws.send(JSON.stringify({
              type: 'error',
              message: 'Appointment not found'
            }));
            return;
          }
          
          // Prepare the message to broadcast
          const chatMessage = {
            type: 'chat_message',
            message: {
              id: message.id,
              appointmentId: message.appointmentId,
              senderId: message.senderId,
              senderType: message.senderType,
              content: message.content,
              attachmentUrl: message.attachmentUrl,
              attachmentType: message.attachmentType,
              timestamp: message.createdAt
            }
          };
          
          // Broadcast to all clients in this appointment chat room
          clients.forEach((c, id) => {
            if (c.appointmentId === client.appointmentId && c.ws.readyState === 1) {
              c.ws.send(JSON.stringify(chatMessage));
            }
          });
          
          // Create notification for the recipient
          const recipientId = client.userType === 'patient' ? appointment.doctorId : appointment.patientId;
          const recipient = client.userType === 'patient' 
            ? await storage.getDoctor(appointment.doctorId)
            : await storage.getUser(appointment.patientId);
          
          if (recipient) {
            await storage.createNotification({
              userId: client.userType === 'patient' ? 
                (recipient as any).userId : // If doctor, need user ID associated with doctor
                recipientId, // If patient, use patient ID directly
              type: 'chat',
              title: 'New Chat Message',
              message: `You have a new message from ${client.userType === 'patient' ? 'patient' : 'doctor'}`,
              isRead: false,
              metadata: { appointmentId: client.appointmentId, messageId: message.id }
            });
          }
        }
        
        // Handle typing status
        if (data.type === 'typing_status') {
          const client = clients.get(clientId);
          
          if (!client.appointmentId) {
            return;
          }
          
          // Broadcast typing status to other clients in the same appointment chat
          clients.forEach((c, id) => {
            if (id !== clientId && 
                c.appointmentId === client.appointmentId && 
                c.ws.readyState === 1) {
              c.ws.send(JSON.stringify({
                type: 'typing_status',
                userId: client.userId,
                userType: client.userType,
                isTyping: data.isTyping
              }));
            }
          });
        }
        
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format'
        }));
      }
    });
    
    // Handle disconnections
    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`WebSocket client disconnected: ${clientId}`);
    });
  });
  
  return httpServer;
}
