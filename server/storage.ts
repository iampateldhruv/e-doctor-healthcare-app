import {
  users, type User, type InsertUser,
  doctors, type Doctor, type InsertDoctor,
  appointments, type Appointment, type InsertAppointment,
  notifications, type Notification, type InsertNotification,
  medicines, type Medicine, type InsertMedicine,
  prescriptions, type Prescription, type InsertPrescription,
  blogs, type Blog, type InsertBlog,
  comments, type Comment, type InsertComment
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;

  // Doctor methods
  getDoctor(id: number): Promise<Doctor | undefined>;
  getDoctorWithUser(id: number): Promise<(Doctor & { user: User }) | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  listDoctors(): Promise<Doctor[]>;
  listDoctorsWithUsers(): Promise<(Doctor & { user: User })[]>;
  listDoctorsBySpecialization(specialization: string): Promise<(Doctor & { user: User })[]>;

  // Appointment methods
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined>;
  listAppointmentsByPatient(patientId: number): Promise<Appointment[]>;
  listAppointmentsByDoctor(doctorId: number): Promise<Appointment[]>;
  listAppointmentsWithDetails(): Promise<(Appointment & { doctor: Doctor & { user: User }, patient: User })[]>;

  // Notification methods
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  listNotificationsByUser(userId: number): Promise<Notification[]>;

  // Medicine methods
  getMedicine(id: number): Promise<Medicine | undefined>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  listMedicines(): Promise<Medicine[]>;
  listMedicinesByCategory(category: string): Promise<Medicine[]>;
  listMedicinesByType(type: string): Promise<Medicine[]>;

  // Prescription methods
  getPrescription(id: number): Promise<Prescription | undefined>;
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  updatePrescriptionStatus(id: number, status: string): Promise<Prescription | undefined>;
  listPrescriptionsByUser(userId: number): Promise<Prescription[]>;

  // Blog methods
  getBlog(id: number): Promise<Blog | undefined>;
  createBlog(blog: InsertBlog): Promise<Blog>;
  listBlogs(): Promise<Blog[]>;
  listBlogsWithAuthors(): Promise<(Blog & { author: User })[]>;
  incrementBlogViews(id: number): Promise<Blog | undefined>;

  // Comment methods
  getComment(id: number): Promise<Comment | undefined>;
  createComment(comment: InsertComment): Promise<Comment>;
  listCommentsByBlog(blogId: number): Promise<Comment[]>;
  listCommentsByBlogWithUsers(blogId: number): Promise<(Comment & { user: User })[]>;
  incrementCommentLikes(id: number): Promise<Comment | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private doctors: Map<number, Doctor>;
  private appointments: Map<number, Appointment>;
  private notifications: Map<number, Notification>;
  private medicines: Map<number, Medicine>;
  private prescriptions: Map<number, Prescription>;
  private blogs: Map<number, Blog>;
  private comments: Map<number, Comment>;

  private currentUserId: number;
  private currentDoctorId: number;
  private currentAppointmentId: number;
  private currentNotificationId: number;
  private currentMedicineId: number;
  private currentPrescriptionId: number;
  private currentBlogId: number;
  private currentCommentId: number;

  constructor() {
    this.users = new Map();
    this.doctors = new Map();
    this.appointments = new Map();
    this.notifications = new Map();
    this.medicines = new Map();
    this.prescriptions = new Map();
    this.blogs = new Map();
    this.comments = new Map();

    this.currentUserId = 1;
    this.currentDoctorId = 1;
    this.currentAppointmentId = 1;
    this.currentNotificationId = 1;
    this.currentMedicineId = 1;
    this.currentPrescriptionId = 1;
    this.currentBlogId = 1;
    this.currentCommentId = 1;

    console.log("Initializing storage...");
    this.initializeData();
    console.log("Storage initialized.");
    console.log("Doctors after initialization:", Array.from(this.doctors.values()).length);
  }

  // Initialize with demo data
  private async initializeData() {
    // Create users - await these to ensure the ids are available
    const adminUser = await this.createUser({
      username: "admin",
      password: "password",
      fullName: "Admin",
      email: "admin@edoctor.com",
      role: "admin",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });

    const patientUser = await this.createUser({
      username: "john",
      password: "password",
      fullName: "John Doe",
      email: "john@example.com",
      role: "patient",
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });

    // Create doctors - await user creation and log the actual user ID
    const drSarah = await this.createUser({
      username: "drsarah",
      password: "password",
      fullName: "Dr. Sarah Johnson",
      email: "sarah@example.com",
      role: "doctor",
      profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    console.log("Created doctor user with ID:", drSarah.id);

    await this.createDoctor({
      userId: drSarah.id,
      specialization: "cardiology",
      hospital: "City Medical Center",
      rating: "4.8",
      reviewCount: 124,
      description: "Specializes in heart conditions, hypertension, and preventive cardiology. 15+ years of experience.",
      experience: "15+ years",
      nextAvailable: "Today, 2:00 PM",
      availability: "today"
    });

    const drRobert = await this.createUser({
      username: "drrobert",
      password: "password",
      fullName: "Dr. Robert Chen",
      email: "robert@example.com",
      role: "doctor",
      profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    console.log("Created doctor user with ID:", drRobert.id);

    await this.createDoctor({
      userId: drRobert.id,
      specialization: "dermatology",
      hospital: "Westside Skin Clinic",
      rating: "4.9",
      reviewCount: 78,
      description: "Expert in medical, surgical and cosmetic dermatology. Specializing in acne, eczema and skin cancer treatment.",
      experience: "12 years",
      nextAvailable: "Tomorrow, 9:30 AM",
      availability: "tomorrow"
    });

    const drEmily = await this.createUser({
      username: "dremily",
      password: "password",
      fullName: "Dr. Emily Rodriguez",
      email: "emily@example.com",
      role: "doctor",
      profileImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    console.log("Created doctor user with ID:", drEmily.id);

    await this.createDoctor({
      userId: drEmily.id,
      specialization: "neurology",
      hospital: "Neuro Health Institute",
      rating: "4.7",
      reviewCount: 96,
      description: "Focuses on headaches, movement disorders, epilepsy and neurological rehabilitation. Board certified.",
      experience: "10 years",
      nextAvailable: "Wed, 1:15 PM",
      availability: "this_week"
    });

    const drMichael = await this.createUser({
      username: "drmichael",
      password: "password",
      fullName: "Dr. Michael Thompson",
      email: "michael@example.com",
      role: "doctor",
      profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    console.log("Created doctor user with ID:", drMichael.id);

    await this.createDoctor({
      userId: drMichael.id,
      specialization: "pediatrics",
      hospital: "Children's Wellness Center",
      rating: "4.9",
      reviewCount: 145,
      description: "Specialized in general pediatrics, childhood development, and preventive care for infants, children, and adolescents.",
      experience: "18 years",
      nextAvailable: "Tomorrow, 10:00 AM",
      availability: "tomorrow"
    });

    const drJessica = await this.createUser({
      username: "drjessica",
      password: "password",
      fullName: "Dr. Jessica Lee",
      email: "jessica@example.com",
      role: "doctor",
      profileImage: "https://images.unsplash.com/photo-1551601651-bc60f254d532?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    console.log("Created doctor user with ID:", drJessica.id);

    await this.createDoctor({
      userId: drJessica.id,
      specialization: "psychiatry",
      hospital: "Mental Wellness Center",
      rating: "4.8",
      reviewCount: 87,
      description: "Specializes in mood disorders, anxiety, ADHD, and psychotherapy. Offers both medication management and therapy.",
      experience: "9 years",
      nextAvailable: "Today, 4:30 PM",
      availability: "today"
    });

    const drDavid = await this.createUser({
      username: "drdavid",
      password: "password",
      fullName: "Dr. David Williams",
      email: "david@example.com",
      role: "doctor",
      profileImage: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    console.log("Created doctor user with ID:", drDavid.id);

    await this.createDoctor({
      userId: drDavid.id,
      specialization: "orthopedics",
      hospital: "Joint & Spine Center",
      rating: "4.7",
      reviewCount: 112,
      description: "Expert in sports injuries, joint replacements, and spine disorders. Utilizes minimally invasive surgical techniques.",
      experience: "14 years",
      nextAvailable: "Thu, 2:45 PM",
      availability: "this_week"
    });

    // Create appointments
    await this.createAppointment({
      patientId: patientUser.id,
      doctorId: 1, // Dr. Sarah
      date: "May 15, 2023",
      time: "10:00 AM",
      status: "confirmed"
    });

    await this.createAppointment({
      patientId: patientUser.id,
      doctorId: 2, // Dr. Robert
      date: "May 20, 2023",
      time: "2:30 PM",
      status: "pending"
    });

    // Create notifications
    await this.createNotification({
      userId: patientUser.id,
      type: "appointment",
      title: "Upcoming Appointment",
      message: "Dr. Sarah Johnson (Cardiologist) - Tomorrow at 10:00 AM",
      isRead: false,
      metadata: { appointmentId: 1, doctorId: 1 }
    });

    await this.createNotification({
      userId: patientUser.id,
      type: "prescription",
      title: "Prescription Ready",
      message: "Your prescription for Lisinopril has been processed and is ready for pickup",
      isRead: false,
      metadata: { medicineId: 1 }
    });

    await this.createNotification({
      userId: patientUser.id,
      type: "consultation",
      title: "Consultation Follow-up",
      message: "Dr. Mark Wilson has sent you follow-up instructions from your recent consultation",
      isRead: false,
      metadata: { doctorId: 4 }
    });

    // Create medicines
    this.createMedicine({
      name: "Lisinopril (Prinivil, Zestril)",
      genericName: "Lisinopril",
      manufacturer: "Novartis Pharmaceuticals",
      dosage: "10mg Tablets",
      count: "30 Count",
      category: "Heart Health",
      type: "prescription",
      price: "$12.99",
      description: "Lisinopril is an ACE inhibitor that is used to treat high blood pressure (hypertension) in adults and children who are at least 6 years old. Lisinopril is also used to improve survival after a heart attack and to treat heart failure in adults.",
      usage: "Take exactly as prescribed by your doctor. Usually taken once daily with or without food. The dosage is based on your medical condition and response to treatment.",
      sideEffects: "Dizziness, lightheadedness, dry cough, headache, and drowsiness may occur. If any of these effects persist or worsen, tell your doctor or pharmacist promptly.",
      storage: "Store at room temperature away from moisture and heat. Keep the bottle tightly closed when not in use. Keep out of reach of children.",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      thumbnails: ["https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80", "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"],
      requiredPrescription: true
    });

    this.createMedicine({
      name: "Metformin (Glucophage)",
      genericName: "Metformin Hydrochloride",
      manufacturer: "Bristol-Myers Squibb",
      dosage: "500mg Tablets",
      count: "60 Count",
      category: "Diabetes Care",
      type: "prescription",
      price: "$15.50",
      description: "Metformin is used with a proper diet and exercise program and possibly with other medications to control high blood sugar. It is used in patients with type 2 diabetes. Controlling high blood sugar helps prevent kidney damage, blindness, nerve problems, loss of limbs, and sexual function problems.",
      usage: "Take this medication by mouth as directed by your doctor, usually 1-3 times a day with meals. Drink plenty of fluids while taking this medication unless otherwise directed by your doctor.",
      sideEffects: "Nausea, vomiting, stomach upset, diarrhea, weakness, or a metallic taste in the mouth may occur. If any of these effects persist or worsen, tell your doctor or pharmacist promptly.",
      storage: "Store at room temperature away from light and moisture. Do not store in the bathroom. Keep all medications away from children and pets.",
      image: "https://images.unsplash.com/photo-1585435557343-3b348233d0bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      thumbnails: ["https://images.unsplash.com/photo-1585435557343-3b348233d0bf?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"],
      requiredPrescription: true
    });

    this.createMedicine({
      name: "Tylenol Extra Strength",
      genericName: "Acetaminophen",
      manufacturer: "Johnson & Johnson",
      dosage: "500mg Caplets",
      count: "100 Count",
      category: "Pain Relief",
      type: "otc",
      price: "$9.99",
      description: "Tylenol Extra Strength provides fast, effective relief of headaches, backaches, muscular aches, minor arthritis pain, toothaches, menstrual cramps, and helps reduce fever.",
      usage: "Take 2 caplets every 6 hours while symptoms last. Do not take more than 6 caplets in 24 hours, unless directed by a doctor. Do not use for more than 10 days unless directed by a doctor.",
      sideEffects: "This medication usually has no side effects. If you experience rash, itching/swelling, severe dizziness, or trouble breathing, seek immediate medical attention.",
      storage: "Store at room temperature away from light and moisture. Do not store in the bathroom. Keep all medications away from children and pets.",
      image: "https://images.unsplash.com/photo-1550572017-edd951b55104?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      thumbnails: ["https://images.unsplash.com/photo-1550572017-edd951b55104?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"],
      requiredPrescription: false
    });

    this.createMedicine({
      name: "Advil (Ibuprofen)",
      genericName: "Ibuprofen",
      manufacturer: "Pfizer Inc.",
      dosage: "200mg Tablets",
      count: "50 Count",
      category: "Pain Relief",
      type: "otc",
      price: "$8.49",
      description: "Advil is a nonsteroidal anti-inflammatory drug (NSAID) that temporarily reduces fever and relieves minor aches and pains due to headache, muscular aches, menstrual cramps, the common cold, backache, and minor pain of arthritis.",
      usage: "Take 1 tablet every 4 to 6 hours while symptoms persist. If pain or fever does not respond to 1 tablet, 2 tablets may be used. Do not exceed 6 tablets in 24 hours, unless directed by a doctor.",
      sideEffects: "Upset stomach, nausea, vomiting, headache, diarrhea, constipation, dizziness, or drowsiness may occur. If any of these effects persist or worsen, tell your doctor or pharmacist promptly.",
      storage: "Store at room temperature. Keep all medications away from children and pets.",
      image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      thumbnails: ["https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"],
      requiredPrescription: false
    });

    // Create blogs
    const blogAuthor1 = await this.createUser({
      username: "drhealthexpert",
      password: "password",
      fullName: "Dr. Sarah Johnson",
      email: "sarahjohnson@example.com",
      role: "doctor",
      profileImage: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    console.log("Created blog author with ID:", blogAuthor1.id);

    const blog1 = await this.createBlog({
      title: "Understanding Heart Health: 10 Tips for a Healthy Heart",
      content: `<p>Heart disease remains one of the leading causes of death worldwide. The good news is that many risk factors for heart disease are controllable through lifestyle changes and preventive care. In this article, we'll explore 10 practical tips to maintain and improve your heart health.</p>
            
      <h3>1. Maintain a Heart-Healthy Diet</h3>
      <p>Your diet significantly impacts your heart health. Focus on consuming:</p>
      <ul>
        <li>Fruits and vegetables rich in antioxidants and fiber</li>
        <li>Whole grains instead of refined carbohydrates</li>
        <li>Lean proteins such as fish, poultry, and plant-based proteins</li>
        <li>Healthy fats from sources like olive oil, avocados, and nuts</li>
        <li>Limited sodium, added sugars, and saturated fats</li>
      </ul>
      
      <h3>2. Stay Physically Active</h3>
      <p>Regular physical activity strengthens your heart and improves circulation. Aim for at least 150 minutes of moderate-intensity aerobic activity per week, such as brisk walking, swimming, or cycling. Additionally, include muscle-strengthening activities on two or more days per week.</p>
      
      <h3>3. Maintain a Healthy Weight</h3>
      <p>Excess weight, particularly around the midsection, increases the risk of heart disease. Even modest weight loss can reduce blood pressure and improve cholesterol levels. Work with your healthcare provider to determine a healthy weight goal and develop a sustainable plan to achieve it.</p>
      
      <h3>4. Quit Smoking and Limit Alcohol</h3>
      <p>Smoking damages blood vessels and can lead to atherosclerosis. If you smoke, quitting is one of the best things you can do for your heart. Additionally, limit alcohol consumption to moderate levels – up to one drink per day for women and up to two drinks per day for men.</p>
      
      <h3>5. Manage Stress Effectively</h3>
      <p>Chronic stress can contribute to heart disease risk factors like high blood pressure and unhealthy coping behaviors. Incorporate stress-reduction techniques such as meditation, deep breathing exercises, yoga, or spending time in nature.</p>
      
      <h3>6. Prioritize Quality Sleep</h3>
      <p>Poor sleep quality and insufficient sleep duration are associated with increased risk of heart disease. Most adults need 7-9 hours of sleep per night. Practice good sleep hygiene by maintaining a consistent sleep schedule and creating a restful environment.</p>
      
      <h3>7. Monitor Blood Pressure Regularly</h3>
      <p>High blood pressure often has no symptoms but can damage your heart over time. Regular monitoring allows you to detect elevations early and take appropriate action. Aim for a blood pressure below 120/80 mm Hg.</p>
      
      <h3>8. Check Cholesterol Levels</h3>
      <p>High levels of LDL ("bad") cholesterol can build up in your arteries, increasing the risk of heart attack and stroke. Have your cholesterol checked regularly and work with your healthcare provider to achieve optimal levels through diet, exercise, and medication if necessary.</p>
      
      <h3>9. Manage Diabetes</h3>
      <p>If you have diabetes, your risk of heart disease is significantly higher. Careful management of blood sugar levels through diet, exercise, and medications as prescribed by your healthcare provider is essential for heart health.</p>
      
      <h3>10. Get Regular Check-ups</h3>
      <p>Regular medical check-ups allow your healthcare provider to assess your overall cardiovascular health and catch potential issues early. Follow your provider's recommendations for screening tests and preventive care.</p>
      
      <h3>Conclusion</h3>
      <p>Protecting your heart health is a lifelong journey that involves multiple aspects of your lifestyle. By implementing these evidence-based strategies, you can significantly reduce your risk of heart disease and enjoy better overall health.</p>
      
      <p>Remember that small, consistent changes often lead to the most sustainable improvements in heart health. Start with one or two areas where you feel you can make immediate improvements, and gradually incorporate additional heart-healthy habits into your routine.</p>`,
      excerpt: "Heart disease remains one of the leading causes of death worldwide. Learn these essential tips to keep your cardiovascular system in optimal condition and reduce risk factors.",
      featuredImage: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      authorId: blogAuthor1.id,
      category: "Heart Health",
      tags: ["Heart Health", "Cardiology", "Preventive Care", "Lifestyle"],
      views: 1200
    });

    const blogAuthor2 = await this.createUser({
      username: "drmentalhealth",
      password: "password",
      fullName: "Dr. Emily Rodriguez",
      email: "emilyrodriguez@example.com",
      role: "doctor",
      profileImage: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    console.log("Created blog author with ID:", blogAuthor2.id);

    const blog2 = await this.createBlog({
      title: "Mental Wellness in the Digital Age: Finding Balance",
      content: `<p>The constant connectivity of modern life can take a toll on mental health. With smartphones, social media, and 24/7 accessibility, many people struggle to find a healthy balance. This article explores strategies to maintain psychological wellbeing while navigating our increasingly digital world.</p>
      
      <h3>The Impact of Digital Technology on Mental Health</h3>
      <p>While digital technology offers numerous benefits, excessive use has been linked to various mental health concerns:</p>
      <ul>
        <li>Increased anxiety and depression symptoms</li>
        <li>Sleep disturbances due to blue light exposure and mental stimulation</li>
        <li>Decreased attention spans and difficulty focusing</li>
        <li>Social comparison and feelings of inadequacy from social media</li>
        <li>FOMO (Fear of Missing Out) and social anxiety</li>
        <li>Reduced in-person social interactions and potential isolation</li>
      </ul>
      
      <h3>Signs of Digital Overload</h3>
      <p>Recognizing when technology use is becoming problematic is the first step toward finding balance. Warning signs include:</p>
      <ul>
        <li>Feeling anxious when separated from your phone</li>
        <li>Checking devices compulsively, even during conversations or activities</li>
        <li>Losing track of time while online</li>
        <li>Neglecting responsibilities or relationships due to screen time</li>
        <li>Using digital devices to escape negative emotions</li>
        <li>Experiencing physical symptoms like eye strain, headaches, or disrupted sleep</li>
      </ul>
      
      <h3>Strategies for Digital Wellbeing</h3>
      
      <h4>1. Implement Boundaries</h4>
      <p>Creating healthy boundaries with technology helps reclaim control over your time and attention:</p>
      <ul>
        <li>Designate tech-free zones in your home, such as bedrooms or dining areas</li>
        <li>Establish tech-free times, like the first hour after waking or the hour before bed</li>
        <li>Use "Do Not Disturb" settings during focused work, family time, or relaxation</li>
        <li>Turn off non-essential notifications to reduce interruptions</li>
      </ul>
      
      <h4>2. Practice Digital Mindfulness</h4>
      <p>Being intentional about how and why you use technology can transform your relationship with digital devices:</p>
      <ul>
        <li>Before picking up your device, pause and ask yourself why</li>
        <li>Set specific purposes for online sessions rather than mindless browsing</li>
        <li>Use apps and tools that track screen time to increase awareness</li>
        <li>Regularly audit social media accounts and unfollow sources that trigger negative emotions</li>
      </ul>
      
      <h4>3. Nurture In-Person Connections</h4>
      <p>While digital communication is convenient, face-to-face interactions provide unique psychological benefits:</p>
      <ul>
        <li>Prioritize regular in-person social activities with friends and family</li>
        <li>Join community groups, classes, or volunteer organizations</li>
        <li>Practice active listening and engagement during in-person interactions (without checking your phone)</li>
        <li>Consider the quality of relationships over the quantity of connections</li>
      </ul>
      
      <h4>4. Cultivate Digital Literacy</h4>
      <p>Understanding how digital platforms are designed to capture attention helps you make more conscious choices:</p>
      <ul>
        <li>Learn about persuasive design techniques used in apps and websites</li>
        <li>Recognize how algorithms curate content to maximize engagement</li>
        <li>Critically evaluate information sources and be aware of misinformation</li>
        <li>Teach children and adolescents about healthy technology use</li>
      </ul>
      
      <h4>5. Prioritize Physical and Mental Self-Care</h4>
      <p>Balance digital activities with practices that support overall wellbeing:</p>
      <ul>
        <li>Engage in regular physical activity, which reduces stress and improves mood</li>
        <li>Spend time in nature, which has restorative effects on attention and mental health</li>
        <li>Practice mindfulness meditation to strengthen attention and reduce reactivity</li>
        <li>Ensure adequate sleep by avoiding screens 1-2 hours before bedtime</li>
        <li>Pursue creative and intellectual interests that don't involve screens</li>
      </ul>
      
      <h3>When to Seek Help</h3>
      <p>If you find that digital habits are significantly impacting your mental health, relationships, or daily functioning, consider seeking support from a mental health professional. They can help you develop personalized strategies for healthier technology use and address underlying concerns like anxiety, depression, or compulsive behaviors.</p>
      
      <h3>Conclusion</h3>
      <p>Finding balance in the digital age isn't about rejecting technology but rather developing a mindful, intentional relationship with it. By implementing boundaries, practicing digital mindfulness, nurturing in-person connections, cultivating digital literacy, and prioritizing self-care, you can harness the benefits of digital tools while protecting your mental wellbeing.</p>
      
      <p>Remember that digital wellness is a continuous process rather than a destination. Be compassionate with yourself as you navigate this complex landscape, celebrating small improvements and adjusting strategies as needed for your unique circumstances.</p>`,
      excerpt: "The constant connectivity of modern life can take a toll on mental health. Explore strategies to maintain psychological wellbeing while navigating our increasingly digital world.",
      featuredImage: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      authorId: blogAuthor2.id,
      category: "Mental Health",
      tags: ["Mental Health", "Digital Wellness", "Self-Care", "Stress Management"],
      views: 956
    });

    const blogAuthor3 = await this.createUser({
      username: "drnutrition",
      password: "password",
      fullName: "Dr. Robert Chen",
      email: "robertchen@example.com",
      role: "doctor",
      profileImage: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    console.log("Created blog author with ID:", blogAuthor3.id);

    const blog3 = await this.createBlog({
      title: "Nutrition Myths Debunked: Science-Based Eating Habits",
      content: `<p>With so much conflicting nutrition advice circulating online and in popular media, it's hard to know what to believe. Nutrition science is complex and evolving, but there are evidence-based principles that can guide healthy eating habits. This article separates fact from fiction and provides scientifically-grounded guidelines for nutrition.</p>
      
      <h3>Myth #1: Carbs Are Bad for You</h3>
      <p><strong>The Truth:</strong> Carbohydrates are a fundamental macronutrient and the body's preferred energy source. The key is distinguishing between different types:</p>
      <ul>
        <li><strong>Whole, minimally processed carbs</strong> like fruits, vegetables, legumes, and whole grains provide essential nutrients, fiber, and sustained energy.</li>
        <li><strong>Refined carbs</strong> like white flour products and added sugars offer minimal nutritional value and can cause rapid blood sugar fluctuations.</li>
      </ul>
      <p>Instead of eliminating carbs, focus on selecting nutrient-dense sources and appropriate portions based on your activity level and health status.</p>
      
      <h3>Myth #2: All Fat Makes You Fat</h3>
      <p><strong>The Truth:</strong> Dietary fat is essential for health and doesn't automatically translate to body fat. Fat serves crucial functions:</p>
      <ul>
        <li>Provides essential fatty acids the body cannot produce</li>
        <li>Supports cell membrane integrity</li>
        <li>Enables absorption of fat-soluble vitamins (A, D, E, K)</li>
        <li>Helps maintain hormone balance</li>
        <li>Contributes to satiety and stable energy</li>
      </ul>
      <p>Focus on unsaturated fats from sources like olive oil, avocados, nuts, and fish, while limiting saturated fats and avoiding trans fats.</p>
      
      <h3>Myth #3: High-Protein Diets Are Harmful to Kidneys</h3>
      <p><strong>The Truth:</strong> For individuals with healthy kidney function, moderate to higher protein intakes are not detrimental. Protein:</p>
      <ul>
        <li>Supports muscle maintenance and recovery</li>
        <li>Promotes satiety, potentially aiding weight management</li>
        <li>Provides essential amino acids for numerous bodily functions</li>
      </ul>
      <p>However, those with existing kidney disease should follow medical guidance regarding protein intake, as their needs differ.</p>
      
      <h3>Myth #4: Eating Small, Frequent Meals Boosts Metabolism</h3>
      <p><strong>The Truth:</strong> The frequency of eating has minimal impact on metabolic rate. Total calorie intake and macronutrient composition are more significant factors. Some research indicates that fewer, larger meals might actually provide greater satiety for some individuals.</p>
      <p>The best meal frequency depends on personal factors like schedule, hunger cues, energy needs, and health conditions. There's no one-size-fits-all approach.</p>
      
      <h3>Myth #5: Detox Diets and Cleanses Remove Toxins</h3>
      <p><strong>The Truth:</strong> The body has sophisticated detoxification systems primarily involving the liver, kidneys, and digestive tract. No specific food, juice, or supplement has been scientifically proven to enhance these natural processes.</p>
      <p>Many "detox" approaches involve severe calorie restriction, potentially leading to:</p>
      <ul>
        <li>Muscle loss</li>
        <li>Electrolyte imbalances</li>
        <li>Energy depletion</li>
        <li>Nutrient deficiencies if followed long-term</li>
      </ul>
      <p>Support your body's natural detoxification by staying hydrated, consuming fiber-rich foods, eating adequate protein, and limiting alcohol and processed foods.</p>
      
      <h3>Myth #6: Superfoods Can Make Up for an Unhealthy Diet</h3>
      <p><strong>The Truth:</strong> While certain foods offer impressive nutrient profiles, no single food can compensate for an otherwise unbalanced diet. "Superfoods" like berries, leafy greens, and nuts are beneficial, but they work best as part of a varied, nutrient-dense dietary pattern.</p>
      <p>Dietary patterns like the Mediterranean diet, which emphasizes a range of whole foods, show stronger health associations than any individual food component.</p>
      
      <h3>Myth #7: Natural Sugars Are Healthier Than Added Sugars</h3>
      <p><strong>The Truth:</strong> Chemically, the sugars in honey, maple syrup, agave, and fruit juice concentrate are similar to table sugar. The body processes them in largely the same way.</p>
      <p>The advantage of naturally occurring sugars in whole fruits comes from their package deal:</p>
      <ul>
        <li>Fiber that slows sugar absorption</li>
        <li>Water content that provides volume and satiety</li>
        <li>Vitamins, minerals, and phytonutrients</li>
      </ul>
      <p>All concentrated sweeteners, natural or refined, should be consumed mindfully.</p>
      
      <h3>Evidence-Based Nutrition Guidelines</h3>
      <p>While individual needs vary based on age, sex, activity level, health status, and genetics, these principles are well-supported by research:</p>
      
      <ol>
        <li><strong>Emphasize whole, minimally processed foods</strong> from all food groups.</li>
        <li><strong>Include a variety of colorful fruits and vegetables</strong> to obtain a range of phytonutrients.</li>
        <li><strong>Choose fiber-rich carbohydrate sources</strong> like whole grains, legumes, and starchy vegetables.</li>
        <li><strong>Incorporate quality protein</strong> from both plant sources (legumes, nuts, seeds) and animal sources (if consumed).</li>
        <li><strong>Include healthy fats</strong> from sources like olive oil, avocados, nuts, and fatty fish.</li>
        <li><strong>Stay adequately hydrated</strong>, primarily with water.</li>
        <li><strong>Practice portion awareness</strong> without rigid restriction.</li>
        <li><strong>Consider your eating pattern holistically</strong> rather than focusing on individual nutrients or foods.</li>
      </ol>
      
      <h3>Conclusion</h3>
      <p>Nutrition science continues to evolve, but the fundamental principles of eating predominantly whole, minimally processed foods in appropriate amounts remain consistent. Be skeptical of extreme claims, dramatic testimonials, and advice that demonizes entire food groups or promises quick fixes.</p>
      
      <p>Instead of pursuing perfect eating, aim for sustainable habits that nourish your body, mind, and relationship with food. Consider working with a registered dietitian for personalized guidance based on your unique needs and health goals.</p>`,
      excerpt: "With so much conflicting nutrition advice, it's hard to know what to believe. This article separates fact from fiction and provides evidence-based guidelines for healthy eating.",
      featuredImage: "https://images.unsplash.com/photo-1514995669114-6081e934b693?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      authorId: blogAuthor3.id,
      category: "Nutrition",
      tags: ["Nutrition", "Diet", "Healthy Eating", "Myths"],
      views: 783
    });

    // Create comments for the first blog
    const commenter1 = await this.createUser({
      username: "lisa_wang",
      password: "password",
      fullName: "Lisa Wang",
      email: "lisa@example.com",
      role: "patient",
      profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    console.log("Created commenter with ID:", commenter1.id);

    await this.createComment({
      blogId: blog1.id,
      userId: commenter1.id,
      content: "This article was really helpful! I've been trying to improve my heart health after my last check-up showed high cholesterol. The dietary recommendations are practical and easy to follow.",
      likes: 12
    });

    const commenter2 = await this.createUser({
      username: "michael_roberts",
      password: "password",
      fullName: "Michael Roberts",
      email: "michael@example.com",
      role: "patient",
      profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });
    
    console.log("Created commenter with ID:", commenter2.id);

    const parentComment = await this.createComment({
      blogId: blog1.id,
      userId: commenter2.id,
      content: "I'd love to see a follow-up article about specific exercises that are most beneficial for heart health. Is HIIT better than steady-state cardio? What about strength training?",
      likes: 8
    });
    
    console.log("Created parent comment with ID:", parentComment.id);

    // Reply to the comment
    await this.createComment({
      blogId: blog1.id,
      userId: blogAuthor1.id,
      content: "That's a great suggestion, Michael! I'm actually working on a follow-up piece that will cover different types of exercise and their specific benefits for cardiovascular health. Stay tuned!",
      likes: 5,
      parentId: parentComment.id
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Doctor methods
  async getDoctor(id: number): Promise<Doctor | undefined> {
    return this.doctors.get(id);
  }

  async getDoctorWithUser(id: number): Promise<(Doctor & { user: User }) | undefined> {
    const doctor = await this.getDoctor(id);
    if (!doctor) return undefined;

    const user = await this.getUser(doctor.userId);
    if (!user) return undefined;

    return { ...doctor, user };
  }

  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const id = this.currentDoctorId++;
    const doctor: Doctor = { ...insertDoctor, id };
    this.doctors.set(id, doctor);
    console.log(`Doctor created with ID ${id}, specialization: ${doctor.specialization}, userId: ${doctor.userId}`);
    return doctor;
  }

  async listDoctors(): Promise<Doctor[]> {
    return Array.from(this.doctors.values());
  }

  async listDoctorsWithUsers(): Promise<(Doctor & { user: User })[]> {
    const doctors = await this.listDoctors();
    const result: (Doctor & { user: User })[] = [];

    for (const doctor of doctors) {
      const user = await this.getUser(doctor.userId);
      if (user) {
        result.push({ ...doctor, user });
      }
    }

    return result;
  }

  async listDoctorsBySpecialization(specialization: string): Promise<(Doctor & { user: User })[]> {
    const doctors = await this.listDoctorsWithUsers();
    if (!specialization) return doctors;
    return doctors.filter(doctor => doctor.specialization === specialization);
  }

  // Appointment methods
  async getAppointment(id: number): Promise<Appointment | undefined> {
    return this.appointments.get(id);
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentAppointmentId++;
    const appointment: Appointment = { ...insertAppointment, id, createdAt: new Date() };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async updateAppointmentStatus(id: number, status: string): Promise<Appointment | undefined> {
    const appointment = await this.getAppointment(id);
    if (!appointment) return undefined;

    const updatedAppointment: Appointment = { ...appointment, status };
    this.appointments.set(id, updatedAppointment);
    return updatedAppointment;
  }

  async listAppointmentsByPatient(patientId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.patientId === patientId,
    );
  }

  async listAppointmentsByDoctor(doctorId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appointment) => appointment.doctorId === doctorId,
    );
  }

  async listAppointmentsWithDetails(): Promise<(Appointment & { doctor: Doctor & { user: User }, patient: User })[]> {
    const appointments = Array.from(this.appointments.values());
    const result: (Appointment & { doctor: Doctor & { user: User }, patient: User })[] = [];

    for (const appointment of appointments) {
      const doctor = await this.getDoctorWithUser(appointment.doctorId);
      const patient = await this.getUser(appointment.patientId);

      if (doctor && patient) {
        result.push({ ...appointment, doctor, patient });
      }
    }

    return result;
  }

  // Notification methods
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = { ...insertNotification, id, createdAt: new Date() };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = await this.getNotification(id);
    if (!notification) return undefined;

    const updatedNotification: Notification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async listNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }

  // Medicine methods
  async getMedicine(id: number): Promise<Medicine | undefined> {
    return this.medicines.get(id);
  }

  async createMedicine(insertMedicine: InsertMedicine): Promise<Medicine> {
    const id = this.currentMedicineId++;
    const medicine: Medicine = { ...insertMedicine, id };
    this.medicines.set(id, medicine);
    return medicine;
  }

  async listMedicines(): Promise<Medicine[]> {
    return Array.from(this.medicines.values());
  }

  async listMedicinesByCategory(category: string): Promise<Medicine[]> {
    return Array.from(this.medicines.values()).filter(
      (medicine) => medicine.category === category,
    );
  }

  async listMedicinesByType(type: string): Promise<Medicine[]> {
    return Array.from(this.medicines.values()).filter(
      (medicine) => medicine.type === type,
    );
  }

  // Prescription methods
  async getPrescription(id: number): Promise<Prescription | undefined> {
    return this.prescriptions.get(id);
  }

  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const id = this.currentPrescriptionId++;
    const prescription: Prescription = { ...insertPrescription, id, createdAt: new Date() };
    this.prescriptions.set(id, prescription);
    return prescription;
  }

  async updatePrescriptionStatus(id: number, status: string): Promise<Prescription | undefined> {
    const prescription = await this.getPrescription(id);
    if (!prescription) return undefined;

    const updatedPrescription: Prescription = { ...prescription, status };
    this.prescriptions.set(id, updatedPrescription);
    return updatedPrescription;
  }

  async listPrescriptionsByUser(userId: number): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).filter(
      (prescription) => prescription.userId === userId,
    );
  }

  // Blog methods
  async getBlog(id: number): Promise<Blog | undefined> {
    return this.blogs.get(id);
  }

  async createBlog(insertBlog: InsertBlog): Promise<Blog> {
    const id = this.currentBlogId++;
    const blog: Blog = { ...insertBlog, id, views: 0, publishedAt: new Date() };
    this.blogs.set(id, blog);
    return blog;
  }

  async listBlogs(): Promise<Blog[]> {
    return Array.from(this.blogs.values());
  }

  async listBlogsWithAuthors(): Promise<(Blog & { author: User })[]> {
    const blogs = await this.listBlogs();
    const result: (Blog & { author: User })[] = [];

    for (const blog of blogs) {
      const author = await this.getUser(blog.authorId);
      if (author) {
        result.push({ ...blog, author });
      }
    }

    return result;
  }

  async incrementBlogViews(id: number): Promise<Blog | undefined> {
    const blog = await this.getBlog(id);
    if (!blog) return undefined;

    const updatedBlog: Blog = { ...blog, views: blog.views + 1 };
    this.blogs.set(id, updatedBlog);
    return updatedBlog;
  }

  // Comment methods
  async getComment(id: number): Promise<Comment | undefined> {
    return this.comments.get(id);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.currentCommentId++;
    const comment: Comment = { ...insertComment, id, likes: 0, createdAt: new Date() };
    this.comments.set(id, comment);
    return comment;
  }

  async listCommentsByBlog(blogId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.blogId === blogId,
    );
  }

  async listCommentsByBlogWithUsers(blogId: number): Promise<(Comment & { user: User })[]> {
    const comments = await this.listCommentsByBlog(blogId);
    const result: (Comment & { user: User })[] = [];

    for (const comment of comments) {
      const user = await this.getUser(comment.userId);
      if (user) {
        result.push({ ...comment, user });
      }
    }

    return result;
  }

  async incrementCommentLikes(id: number): Promise<Comment | undefined> {
    const comment = await this.getComment(id);
    if (!comment) return undefined;

    const updatedComment: Comment = { ...comment, likes: comment.likes + 1 };
    this.comments.set(id, updatedComment);
    return updatedComment;
  }
}

export const storage = new MemStorage();
