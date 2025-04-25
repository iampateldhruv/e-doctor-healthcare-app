import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("patient"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Doctor schema
export const doctors = pgTable("doctors", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  specialization: text("specialization").notNull(),
  hospital: text("hospital").notNull(),
  rating: text("rating"),
  reviewCount: integer("review_count"),
  description: text("description"),
  experience: text("experience"),
  nextAvailable: text("next_available"),
  availability: text("availability"), // today, tomorrow, this_week, next_week
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({
  id: true,
});

export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;

// Appointments schema
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  doctorId: integer("doctor_id").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled, completed
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({
  id: true,
  createdAt: true,
});

export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

// Notification schema
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // appointment, prescription, consultation
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  metadata: json("metadata").default({}),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Medicine schema
export const medicines = pgTable("medicines", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  genericName: text("generic_name"),
  manufacturer: text("manufacturer").notNull(),
  dosage: text("dosage").notNull(),
  count: text("count"),
  category: text("category").notNull(),
  type: text("type").notNull(), // prescription, otc
  price: text("price").notNull(),
  description: text("description").notNull(),
  usage: text("usage").notNull(),
  sideEffects: text("side_effects"),
  storage: text("storage"),
  image: text("image"),
  thumbnails: json("thumbnails").default([]),
  requiredPrescription: boolean("required_prescription").default(false),
});

export const insertMedicineSchema = createInsertSchema(medicines).omit({
  id: true,
});

export type InsertMedicine = z.infer<typeof insertMedicineSchema>;
export type Medicine = typeof medicines.$inferSelect;

// Prescription schema
export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  filePath: text("file_path").notNull(),
  status: text("status").default("pending"), // pending, verified, rejected
  isUrgent: boolean("is_urgent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
});

export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Prescription = typeof prescriptions.$inferSelect;

// Blog schema
export const blogs = pgTable("blogs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  featuredImage: text("featured_image"),
  authorId: integer("author_id").notNull(),
  category: text("category").notNull(),
  tags: json("tags").default([]),
  views: integer("views").default(0),
  publishedAt: timestamp("published_at").defaultNow(),
});

export const insertBlogSchema = createInsertSchema(blogs).omit({
  id: true,
  views: true,
  publishedAt: true,
});

export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type Blog = typeof blogs.$inferSelect;

// Comment schema
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  blogId: integer("blog_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  parentId: integer("parent_id"), // For nested replies, null if it's a top-level comment
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  likes: true,
  createdAt: true,
});

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

// Chat messages for doctor-patient communication
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  appointmentId: integer("appointment_id").notNull().references(() => appointments.id),
  senderId: integer("sender_id").notNull(), // User ID of the sender
  senderType: text("sender_type").notNull(), // 'doctor' or 'patient'
  content: text("content").notNull(),
  attachmentUrl: text("attachment_url"),
  attachmentType: text("attachment_type"), // 'image', 'document', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
