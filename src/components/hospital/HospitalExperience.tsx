"use client";

import { apiFetch } from "@/lib/api-client";

import { AnimatePresence, motion, animate, useInView } from "framer-motion";
import QRCode from "qrcode";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Baby,
  BadgeCheck,
  BedDouble,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Dna,
  FileCheck2,
  Heart,
  HeartPulse,
  Hospital,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Microscope,
  MoveUpRight,
  Phone,
  Pill,
  Quote,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  Syringe,
  TestTubeDiagonal,
  X,
} from "lucide-react";
import { FormEvent, PointerEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  department?: string | null;
  departmentId?: number | null;
  qualifications: string;
  pmdcRegistration: string;
  experienceYears: number;
  consultationFee: number;
  opdDays: string;
  opdTimings: string;
  availableSlots: number;
  photoUrl?: string | null;
  isDemo?: boolean;
};
type Service = { id?: number; title: string; description: string; category: string; icon?: string; imageUrl?: string | null };
type PackageItem = { id?: number; name: string; description: string; price: number; includedTests: string[]; includedConsultations: string[] };
type TestItem = { id?: number; name: string; category: string; price: number; turnaround: string };
type Article = { id?: number; slug?: string; title: string; excerpt: string; body: string; author: string; imageUrl?: string | null; publishedAt?: string | null; isDemo?: boolean };
type Faq = { question: string; answer: string };
type ReviewRecord = { displayName: string; department: string; rating: number; feedback: string; reviewDate?: string | null; isIllustrative?: boolean };
type PublicData = { doctors: Doctor[]; departments: Array<{ id: number; name: string }>; services: Service[]; packages: PackageItem[]; tests: TestItem[]; articles: Article[]; faqs: Faq[]; testimonials: ReviewRecord[] };
type Report = { reference: string; patientName: string; testName: string; sampleDate: string; status: string; authorized: boolean; isDemo: boolean; results: Array<{ name: string; value: string; unit: string; range: string; flag: string }> };

const photo = {
  hero: "https://images.pexels.com/photos/6627926/pexels-photo-6627926.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1500&h=1200",
  doctor: "https://images.pexels.com/photos/4173249/pexels-photo-4173249.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=900&h=1000",
  consult: "https://images.pexels.com/photos/8413162/pexels-photo-8413162.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=900",
  team: "https://images.pexels.com/photos/6627910/pexels-photo-6627910.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=900",
  lab: "https://images.pexels.com/photos/8460124/pexels-photo-8460124.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1100&h=900",
  corridor: "https://images.pexels.com/photos/4173244/pexels-photo-4173244.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1000&h=1200",
};
const fallbackDoctors: Doctor[] = [
  { id: 1, name: "Sample Dr. Ayesha Rahman", specialty: "Medicine", department: "General Medicine", qualifications: "Sample profile · qualifications to be verified", pmdcRegistration: "Not supplied · verify before publication", experienceYears: 12, consultationFee: 1800, opdDays: "Mon · Wed · Fri", opdTimings: "09:00 AM – 01:00 PM", availableSlots: 6, isDemo: true },
  { id: 2, name: "Sample Dr. Hamza Malik", specialty: "Surgery", department: "General Surgery", qualifications: "Sample profile · qualifications to be verified", pmdcRegistration: "Not supplied · verify before publication", experienceYears: 15, consultationFee: 2200, opdDays: "Tue · Thu · Sat", opdTimings: "04:00 PM – 08:00 PM", availableSlots: 4, isDemo: true },
  { id: 3, name: "Sample Dr. Zainab Shah", specialty: "Gynecology", department: "Gynecology & Maternity", qualifications: "Sample profile · qualifications to be verified", pmdcRegistration: "Not supplied · verify before publication", experienceYears: 10, consultationFee: 2000, opdDays: "Mon · Tue · Thu", opdTimings: "10:00 AM – 02:00 PM", availableSlots: 5, isDemo: true },
  { id: 4, name: "Sample Dr. Bilal Ahmed", specialty: "Child Specialist", department: "Pediatrics", qualifications: "Sample profile · qualifications to be verified", pmdcRegistration: "Not supplied · verify before publication", experienceYears: 9, consultationFee: 1600, opdDays: "Mon · Wed · Sat", opdTimings: "05:00 PM – 09:00 PM", availableSlots: 7, isDemo: true },
  { id: 5, name: "Sample Dr. Sara Qureshi", specialty: "Cardiology", department: "Cardiology", qualifications: "Sample profile · qualifications to be verified", pmdcRegistration: "Not supplied · verify before publication", experienceYears: 14, consultationFee: 2500, opdDays: "Tue · Thu · Sat", opdTimings: "11:00 AM – 03:00 PM", availableSlots: 3, isDemo: true },
  { id: 6, name: "Sample Dr. Omar Farooq", specialty: "Orthopedics", department: "Orthopedics", qualifications: "Sample profile · qualifications to be verified", pmdcRegistration: "Not supplied · verify before publication", experienceYears: 11, consultationFee: 2000, opdDays: "Mon · Wed · Fri", opdTimings: "03:00 PM – 07:00 PM", availableSlots: 5, isDemo: true },
];
const fallbackServices: Service[] = [
  { title: "OPD Clinics", description: "Thoughtful outpatient consultations across core specialties, with clear next steps and continuity of care.", category: "Clinics", icon: "stethoscope" },
  { title: "24/7 Emergency", description: "Urgent assessment and emergency support. Please confirm current availability before travelling.", category: "Emergency", icon: "activity" },
  { title: "General Surgery", description: "Surgical consultations and coordinated care before and after a procedure.", category: "Surgery", icon: "scalpel" },
  { title: "Laparoscopic Surgery", description: "Assessment for minimally invasive approaches where clinically appropriate.", category: "Surgery", icon: "sparkles" },
  { title: "Gynecology & Maternity", description: "Personal, respectful women's health and maternity consultations.", category: "Women's health", icon: "baby" },
  { title: "Pediatrics", description: "Family-centred clinical care for infants, children and young people.", category: "Child health", icon: "baby" },
  { title: "Cardiology", description: "Heart-health reviews and diagnostic pathways shaped around your needs.", category: "Specialty", icon: "heart" },
  { title: "Orthopedics", description: "Bone, joint and mobility assessment, from first review to recovery.", category: "Specialty", icon: "activity" },
  { title: "Dental Care", description: "Preventive and restorative oral-health consultations for the whole family.", category: "Specialty", icon: "sparkles" },
  { title: "Physiotherapy", description: "Individualized movement, pain-management and rehabilitation support.", category: "Rehabilitation", icon: "activity" },
];
const fallbackPackages: PackageItem[] = [
  { name: "Executive Full Body Checkup", description: "A coordinated, broad baseline screening, designed around a clinician review.", price: 14500, includedTests: ["CBC", "LFT", "RFT", "Lipid profile", "ECG"], includedConsultations: ["Physician review"] },
  { name: "Diabetes Care Package", description: "A focused metabolic check-in with clear follow-up guidance.", price: 6200, includedTests: ["Fasting glucose", "HbA1c", "Urine examination"], includedConsultations: ["Medicine consultation"] },
  { name: "Mother & Child Package", description: "A sample antenatal wellness pathway with tailored clinical care.", price: 9800, includedTests: ["CBC", "Blood group", "Urine examination"], includedConsultations: ["Gynecology consultation"] },
  { name: "Cardiac Screening", description: "A sample heart-health review to support a conversation with your clinician.", price: 7800, includedTests: ["ECG", "Lipid profile", "Blood pressure"], includedConsultations: ["Cardiology consultation"] },
  { name: "Basic Health Screening", description: "Essential baseline checks at an illustrative price.", price: 3900, includedTests: ["CBC", "Fasting glucose", "Urine examination"], includedConsultations: ["Physician review"] },
  { name: "Pre-Surgery Assessment", description: "A sample pre-operative assessment tailored by the treating team.", price: 8500, includedTests: ["CBC", "RFT", "ECG"], includedConsultations: ["Anaesthesia review"] },
];
const fallbackTests: TestItem[] = [
  { name: "Complete Blood Count", category: "Hematology", price: 1200, turnaround: "Same day" },
  { name: "Fasting Blood Glucose", category: "Biochemistry", price: 550, turnaround: "Same day" },
  { name: "HbA1c", category: "Biochemistry", price: 1800, turnaround: "Same day" },
  { name: "Lipid Profile", category: "Biochemistry", price: 2100, turnaround: "Same day" },
  { name: "Liver Function Tests", category: "Biochemistry", price: 1900, turnaround: "Same day" },
  { name: "Renal Function Tests", category: "Biochemistry", price: 1800, turnaround: "Same day" },
  { name: "Urine Complete Examination", category: "Pathology", price: 450, turnaround: "Same day" },
  { name: "Thyroid Profile", category: "Endocrinology", price: 2600, turnaround: "24 hours" },
];
const fallbackArticles: Article[] = [
  { slug: "diabetes-prevention-healthy-lifestyle", title: "Diabetes prevention starts with small, steady habits", excerpt: "Practical, evidence-informed ways to support blood sugar health over time.", body: "Healthy routines can support wellbeing, but personal advice depends on your history and current health. A balanced eating pattern, regular movement, adequate sleep and check-ups can all play a role. People at increased risk should discuss screening with a qualified clinician. Never stop or change prescribed treatment based on an online article.", author: "Rana Medical Hospital editorial team · sample content", imageUrl: photo.consult },
  { slug: "regular-heart-checkups", title: "Why regular heart-health conversations matter", excerpt: "A check-up can help you understand your risk factors and next steps.", body: "Blood pressure, cholesterol, family history, activity, smoking and diabetes are among factors clinicians may review. Screening is individualized: ask a qualified healthcare professional which checks are appropriate for you. Seek urgent care for severe chest pain or sudden breathing difficulty.", author: "Rana Medical Hospital editorial team · sample content", imageUrl: photo.team },
  { slug: "pregnancy-care-maternal-health", title: "A calmer guide to pregnancy care and maternal health", excerpt: "What to discuss at antenatal visits and how to prepare your questions.", body: "Antenatal schedules and tests should follow guidance from your own clinician. Bring your medicines list, note new symptoms and ask when to seek urgent assessment. Individual care varies; information here is educational and is not a substitute for medical advice.", author: "Rana Medical Hospital editorial team · sample content", imageUrl: photo.lab },
];
const fallbackFaqs: Faq[] = [
  { question: "What are the OPD timings?", answer: "Doctor schedules vary by specialty. Please check the current directory or call 0324-6627054 before travelling." },
  { question: "How do I book an appointment?", answer: "Use the online booking form or call 0324-6627054. Online requests are confirmed by the hospital team." },
  { question: "How does the digital token work?", answer: "A token is generated when a booking is recorded. Please wait for staff confirmation before relying on a queue time." },
  { question: "Can I get laboratory home sampling?", answer: "Home sampling availability has not been confirmed. Please contact the laboratory to ask about current arrangements." },
  { question: "How can I access my lab report?", answer: "Use the secure verification form with your report reference and registered mobile number. Only authorized published reports are returned." },
  { question: "How do I get emergency admission?", answer: "For urgent concerns, call 0324-6627054 or go to the nearest emergency department. Confirm local emergency availability directly." },
  { question: "What payment methods are accepted?", answer: "Payment methods can change. Please contact reception for currently accepted options." },
  { question: "How can I contact the hospital?", answer: "Call 0324-6627054 or use the contact form. WhatsApp opens a message to the hospital number." },
];
const testimonials = [
  { person: "Illustrative patient", department: "Outpatient care", date: "Sample review", quote: "Sample review only. Replace with feedback shared with consent before publication.", rating: 5, illustrative: true },
  { person: "Illustrative family member", department: "Pediatrics", date: "Sample review", quote: "Demonstration content — not an authentic patient testimonial.", rating: 5, illustrative: true },
  { person: "Illustrative visitor", department: "Diagnostics", date: "Sample review", quote: "Demo content; no Google or third-party verification is claimed.", rating: 4, illustrative: true },
];
const currencies = new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 });
const departmentsDefault = ["General Medicine", "General Surgery", "Gynecology & Maternity", "Pediatrics", "Cardiology", "Orthopedics", "Emergency"];
const slots = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM"];
const specialties = ["All", "Medicine", "Surgery", "Gynecology", "Child Specialist", "Cardiology", "Orthopedics"];
const doctorPortraits = [photo.doctor, photo.corridor, photo.team, photo.consult, photo.lab, photo.hero];

function doctorTimeSlots(doctor?: Doctor) {
  if (!doctor) return slots;
  const range = doctor.opdTimings.match(/(\\d{1,2}:\\d{2}\\s*[AP]M)\\s*[–—-]\\s*(\\d{1,2}:\\d{2}\\s*[AP]M)/i);
  if (!range) return slots;
  const minuteValue = (time: string) => {
    const match = time.match(/(\\d{1,2}):(\\d{2})\\s*([AP]M)/i);
    if (!match) return 0;
    const hour = Number(match[1]) % 12 + (match[3].toUpperCase() === "PM" ? 12 : 0);
    return hour * 60 + Number(match[2]);
  };
  const start = minuteValue(range[1]);
  const end = minuteValue(range[2]);
  const available = slots.filter((time) => minuteValue(time) >= start && minuteValue(time) <= end);
  const capacity = Math.max(1, Number(doctor.availableSlots) || available.length);
  return (available.length ? available : slots).slice(0, capacity);
}

function IconBubble({ children, tone = "mint" }: { children: React.ReactNode; tone?: "mint" | "blue" | "peach" | "violet" }) {
  return <span className={`icon-bubble icon-${tone}`}>{children}</span>;
}

function Counter({ value, suffix = "", label, icon, detail }: { value: number; suffix?: string; label: string; icon: React.ReactNode; detail: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, { duration: 1.7, ease: "easeOut", onUpdate: (v) => setCount(Math.round(v)) });
    return () => controls.stop();
  }, [inView, value]);
  return <motion.div ref={ref} className="impact-card" whileHover={{ y: -5, rotateX: 2, rotateY: -2 }} transition={{ type: "spring", stiffness: 240, damping: 20 }}>
    <div className="impact-card-top"><IconBubble>{icon}</IconBubble><span className="impact-index">0{Math.min(value % 9 + 1, 9)}</span></div>
    <div className="impact-number">{count.toLocaleString("en-PK")}{suffix}</div>
    <div className="impact-label">{label}</div><p>{detail}</p>
  </motion.div>;
}

function CubeFace({ className, children }: { className: string; children: React.ReactNode }) {
  return <div className={`cube-face ${className}`}>{children}</div>;
}

function MedicalCube({ onDoctors }: { onDoctors: () => void }) {
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef({ x: 0, y: 0, rotX: -7, rotY: -20 });
  const rotation = useRef({ x: -7, y: -20 });
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a,button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragOrigin.current = { x: event.clientX, y: event.clientY, rotX: rotation.current.x, rotY: rotation.current.y };
    setDragging(true);
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    rotation.current = { x: dragOrigin.current.rotX - (event.clientY - dragOrigin.current.y) * 0.4, y: dragOrigin.current.rotY + (event.clientX - dragOrigin.current.x) * 0.55 };
    event.currentTarget.style.transform = `rotateX(${rotation.current.x}deg) rotateY(${rotation.current.y}deg)`;
  }
  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    setDragging(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }
  return <div className="hero-visual" aria-label="Interactive rotating four-face medical service cube">
    <div className="visual-wash" />
    <div className="visual-photo" style={{ backgroundImage: `linear-gradient(180deg,rgba(7,33,40,.06),rgba(7,33,40,.34)),url(${photo.hero})` }} />
    <div className="visual-halo halo-one" /><div className="visual-halo halo-two" />
    <div className="floating-cross" aria-hidden="true"><span /><span /></div>
    <div className="floating-dna" aria-hidden="true"><Dna size={26} strokeWidth={1.4} /></div>
    <div className="floating-pulse" aria-hidden="true"><span>♡</span><svg viewBox="0 0 190 48"><path d="M0 25h36l9-2 9-14 10 31 11-24 8 9h17l8-1 8-13 9 27 11-20 8 7h36" /></svg></div>
    <div className="cube-stage" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp}>
      <div className={`medical-cube ${dragging ? "cube-dragging" : ""}`} style={dragging ? { transform: `rotateX(${rotation.current.x}deg) rotateY(${rotation.current.y}deg)` } : undefined}>
        <CubeFace className="face-front"><div className="face-topline"><span className="face-symbol"><Activity size={17} /></span><span className="face-tag">CARE, WHEN IT MATTERS</span></div><div className="face-copy"><small>01 / EMERGENCY</small><h3>Emergency<br />care, 24/7.</h3><p>Urgent support, around the clock.</p></div><div className="ambulance-art"><div className="ambulance-light" /><div className="ambulance-body"><span className="ambulance-cross">+</span><span className="ambulance-window" /></div><i /><i /></div><a className="face-link" href="tel:+923246627054" onPointerDown={(e) => e.stopPropagation()}>Call emergency <ArrowUpRight size={15} /></a></CubeFace>
        <CubeFace className="face-right"><div className="face-topline"><span className="face-symbol"><Stethoscope size={17} /></span><span className="face-tag">THE PEOPLE BEHIND YOUR CARE</span></div><div className="face-copy"><small>02 / SPECIALISTS</small><h3>Expert care.<br />Human first.</h3><p>Explore sample specialist profiles.</p></div><div className="doctor-art"><div className="doctor-head" /><div className="doctor-coat"><span>+</span></div><div className="doctor-steth"><i /></div></div><button className="face-link" onClick={onDoctors} onPointerDown={(e) => e.stopPropagation()}>Meet our doctors <ArrowUpRight size={15} /></button></CubeFace>
        <CubeFace className="face-back"><div className="face-topline"><span className="face-symbol"><Microscope size={17} /></span><span className="face-tag">INSIGHT FOR BETTER CARE</span></div><div className="face-copy"><small>03 / ADVANCED LAB</small><h3>Answers,<br />with clarity.</h3><p>Secure access to authorized lab reports.</p></div><div className="lab-art"><div className="lab-flask"><span /><i /><b /></div><div className="lab-orbit orbit-a" /><div className="lab-orbit orbit-b" /></div><a className="face-link" href="#lab-reports" onPointerDown={(e) => e.stopPropagation()}>Explore lab services <ArrowUpRight size={15} /></a></CubeFace>
        <CubeFace className="face-left"><div className="face-topline"><span className="face-symbol"><Baby size={17} /></span><span className="face-tag">CARE ACROSS EVERY CHAPTER</span></div><div className="face-copy"><small>04 / WOMEN & CHILDREN</small><h3>Gentle care.<br />Growing together.</h3><p>Gynecology, maternity & pediatrics.</p></div><div className="mother-art"><div className="mother-arc" /><div className="mother-shape" /><div className="baby-dot">♡</div><span className="little-star">✦</span></div><a className="face-link" href="#appointment" onPointerDown={(e) => e.stopPropagation()}>Book a consultation <ArrowUpRight size={15} /></a></CubeFace>
      </div>
    </div>
    <div className="cube-instruction"><MoveUpRight size={13} /> Drag to explore · Hover to pause</div>
    <div className="glass-stat stat-a"><span><HeartPulse size={16} /></span><div><b>One team.</b><small>Connected care</small></div></div>
    <div className="glass-stat stat-b"><span><ShieldCheck size={16} /></span><div><b>Care with clarity</b><small>Digital by design</small></div></div>
    <div className="visual-caption"><span className="live-dot" /> INTERACTIVE CARE EXPERIENCE <span className="caption-line" /></div>
  </div>;
}

export default function HospitalExperience() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [content, setContent] = useState<PublicData>({ doctors: fallbackDoctors, departments: departmentsDefault.map((name, index) => ({ id: index + 1, name })), services: fallbackServices, packages: fallbackPackages, tests: fallbackTests, articles: fallbackArticles, faqs: fallbackFaqs, testimonials: [] });
  const [selectedDepartment, setSelectedDepartment] = useState("General Medicine");
  const [selectedDoctorId, setSelectedDoctorId] = useState("1");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentSlot, setAppointmentSlot] = useState(slots[0]);
  const [patientName, setPatientName] = useState("");
  const [patientMobile, setPatientMobile] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<{ reference: string; token: string; date: string; time: string; patientName: string; whatsapp: { status: string; url: string } } | null>(null);
  const [doctorFilter, setDoctorFilter] = useState("All");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [labSearch, setLabSearch] = useState("");
  const [reportReference, setReportReference] = useState("");
  const [reportMobile, setReportMobile] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [reportError, setReportError] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportQr, setReportQr] = useState("");
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [contactStatus, setContactStatus] = useState("");
  const [contactError, setContactError] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactFields, setContactFields] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 28);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    const sections = ["home", "about", "services", "doctors", "packages", "lab-reports", "contact"];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { rootMargin: "-28% 0px -62% 0px", threshold: [0, 0.2, 0.5] });
    sections.forEach((id) => { const element = document.getElementById(id); if (element) observer.observe(element); });
    const loadPublicContent = () => {
      void apiFetch("/api/public", { cache: "no-store" }).then(async (response) => {
        if (!response.ok) return;
        const data = await response.json() as Partial<PublicData>;
        if (!data.doctors?.length) return;
        const departments = data.departments ?? [];
        const doctors = data.doctors.map((doctor) => ({ ...doctor, department: departments.find((item) => item.id === doctor.departmentId)?.name ?? doctor.specialty }));
        setContent((previous) => ({ ...previous, ...data, doctors, departments: departments.length ? departments : previous.departments, services: data.services?.length ? data.services : previous.services, packages: data.packages?.length ? data.packages : previous.packages, tests: data.tests?.length ? data.tests : previous.tests, articles: data.articles?.length ? data.articles : previous.articles, faqs: data.faqs?.length ? data.faqs : previous.faqs, testimonials: data.testimonials?.length ? data.testimonials : previous.testimonials }));
      }).catch(() => undefined);
    };
    loadPublicContent();
    const publicRefresh = window.setInterval(loadPublicContent, 30_000);
    return () => { window.removeEventListener("scroll", onScroll); window.clearInterval(publicRefresh); observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!report) { setReportQr(""); return; }
    const base = typeof window === "undefined" ? "https://rana-medical.example" : window.location.origin;
    QRCode.toDataURL(`${base}/#lab-reports?reference=${encodeURIComponent(report.reference)}`, { width: 156, margin: 1, color: { dark: "#0f3527", light: "#ffffff" } }).then(setReportQr).catch(() => setReportQr(""));
  }, [report]);

  const doctorsForDepartment = useMemo(() => content.doctors.filter((doctor) => {
    const department = doctor.department || doctor.specialty;
    return department === selectedDepartment || doctor.specialty === selectedDepartment || selectedDepartment === "General Medicine" && doctor.specialty === "Medicine";
  }), [content.doctors, selectedDepartment]);
  const activeBookingDoctor = doctorsForDepartment.find((doctor) => String(doctor.id) === selectedDoctorId) ?? doctorsForDepartment[0];
  const activeTimeSlots = doctorTimeSlots(activeBookingDoctor);
  useEffect(() => {
    if (activeTimeSlots.length && !activeTimeSlots.includes(appointmentSlot)) setAppointmentSlot(activeTimeSlots[0]);
  }, [activeBookingDoctor?.id, activeBookingDoctor?.opdTimings]);
  const reviewCards = content.testimonials.length ? content.testimonials.map((review) => ({
    person: review.displayName,
    department: review.department,
    date: review.isIllustrative || !review.reviewDate ? "Illustrative sample" : new Date(review.reviewDate).toLocaleDateString("en-PK", { month: "short", year: "numeric" }),
    quote: review.feedback,
    rating: review.rating,
    illustrative: review.isIllustrative ?? false,
  })) : testimonials;
  const activeReview = reviewCards[reviewIndex % reviewCards.length] ?? testimonials[0];
  const visibleDoctors = useMemo(() => content.doctors.filter((doctor) => {
    const matchesCategory = doctorFilter === "All" || doctor.specialty.toLowerCase().includes(doctorFilter.toLowerCase()) || (doctor.department ?? "").toLowerCase().includes(doctorFilter.toLowerCase());
    return matchesCategory && `${doctor.name} ${doctor.specialty} ${doctor.department ?? ""}`.toLowerCase().includes(doctorSearch.toLowerCase());
  }), [content.doctors, doctorFilter, doctorSearch]);
  const visibleTests = content.tests.filter((test) => `${test.name} ${test.category}`.toLowerCase().includes(labSearch.toLowerCase()));

  function jumpToBooking(department?: string, doctor?: Doctor) {
    if (department) setSelectedDepartment(department);
    if (doctor) { setSelectedDoctorId(String(doctor.id)); setSelectedDepartment(doctor.department || doctor.specialty); }
    window.setTimeout(() => document.getElementById("appointment")?.scrollIntoView({ behavior: "smooth", block: "center" }), 40);
  }

  async function submitAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBookingError(""); setBookingSuccess(null);
    if (!appointmentDate) { setBookingError("Please choose an appointment date."); return; }
    if (!/^((\+?92|0)?3\d{9})$/.test(patientMobile.trim().replace(/[\s()-]/g, ""))) { setBookingError("Enter a valid Pakistani mobile number, for example 0324-6627054."); return; }
    setBookingLoading(true);
    try {
      const response = await apiFetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: patientName, mobile: patientMobile, department: selectedDepartment, doctorId: activeBookingDoctor?.id, date: appointmentDate, timeSlot: appointmentSlot }) });
      const data = await response.json() as { error?: string; appointment?: { reference: string; token: string; appointmentDate: string; timeSlot: string }; whatsapp?: { status: string; url: string } };
      if (!response.ok || !data.appointment) throw new Error(data.error || "Booking could not be saved.");
      setBookingSuccess({ reference: data.appointment.reference, token: data.appointment.token, date: data.appointment.appointmentDate, time: data.appointment.timeSlot, patientName: patientName.trim(), whatsapp: data.whatsapp ?? { status: "fallback", url: "https://wa.me/923246627054" } });
      setPatientName(""); setPatientMobile("");
    } catch (error) { setBookingError(error instanceof Error ? error.message : "Please try again or call 0324-6627054."); }
    finally { setBookingLoading(false); }
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setReportError(""); setReport(null); setReportLoading(true);
    try {
      const response = await apiFetch("/api/public/lab-report", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference: reportReference, mobile: reportMobile }) });
      const data = await response.json() as { report?: Report; error?: string };
      if (!response.ok || !data.report) throw new Error(data.error || "We could not verify this report.");
      setReport(data.report);
    } catch (error) { setReportError(error instanceof Error ? error.message : "Report verification is temporarily unavailable."); }
    finally { setReportLoading(false); }
  }

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setContactStatus(""); setContactError(""); setContactLoading(true);
    try {
      const response = await apiFetch("/api/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contactFields) });
      const data = await response.json() as { reference?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Please try again.");
      setContactStatus(`Thank you — your message was saved as ${data.reference}. Our team can follow up.`);
      setContactFields({ name: "", phone: "", email: "", subject: "", message: "" });
    } catch (error) { setContactError(error instanceof Error ? error.message : "Your message could not be sent."); }
    finally { setContactLoading(false); }
  }

  function printSlip() { window.print(); }

  const navLinks = [{ label: "Home", id: "home" }, { label: "About", id: "about" }, { label: "Services", id: "services" }, { label: "Doctors", id: "doctors" }, { label: "Packages", id: "packages" }, { label: "Lab Reports", id: "lab-reports" }, { label: "Contact", id: "contact" }];
  const mapEmbed = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL;

  return <div className="hospital-site">
    <header id="top" data-section="01" className={`site-header ${scrolled ? "header-scrolled" : ""}`}>
      <div className="top-ribbon"><div className="shell ribbon-inner"><span><span className="live-dot" /> Hospital information desk · <b>24/7 line</b> <a href="tel:+923246627054">0324-6627054</a></span><span className="ribbon-links"><span className="status-indicator"><i /> Status: Please confirm availability</span><a href="https://wa.me/923246627054" target="_blank" rel="noreferrer" aria-label="WhatsApp Rana Medical Hospital"><Phone size={13} /> WhatsApp</a><span>Pakistan · PKR</span></span></div></div>
      <nav className="main-nav shell" aria-label="Main navigation">
        <a className="brand-lockup" href="#home" onClick={() => setMenuOpen(false)}><span className="brand-mark"><span>R</span><i /></span><span className="brand-copy"><b>Rana Medical</b><small>HOSPITAL · CARE WITH CLARITY</small></span></a>
        <button className="mobile-menu-button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={23} /> : <Menu size={23} />}</button>
        <div className={`nav-links ${menuOpen ? "nav-open" : ""}`}>
          {navLinks.map((item) => <a key={item.id} href={`#${item.id}`} className={activeSection === item.id ? "nav-active" : ""} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
          <a className="nav-login" href="/erp"><LockKeyhole size={14} /> Staff login</a>
          <a className="nav-cta" href="#appointment" onClick={() => setMenuOpen(false)}>Book an appointment <ArrowUpRight size={15} /></a>
        </div>
      </nav>
    </header>

    <main>
      <section id="home" data-section="02" className="hero-section">
        <div className="hero-grain" />
        <div className="shell hero-grid">
          <motion.div className="hero-copy" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: [.22, 1, .36, 1] }}>
            <div className="eyebrow hero-eyebrow"><span className="eyebrow-icon"><Sparkles size={14} /></span> THE CLARITY STANDARD <span className="eyebrow-rule" /></div>
            <h1>Precision care,<br /><em>delivered with grace.</em></h1>
            <p className="hero-lede">A hospital built on measured medicine — specialist attention, modern diagnostics and a calm, deliberate way of working.</p>
            <div className="hero-actions"><a className="button button-primary" href="#appointment">Book online appointment <ArrowUpRight size={17} /></a><a className="button button-light" href="https://wa.me/923246627054" target="_blank" rel="noreferrer"><Phone size={16} /> WhatsApp emergency</a></div>
            <a className="hero-explore" href="#services"><span className="explore-mark"><ArrowDownRight size={17} /></span> Explore our services</a>
            <div className="hero-trust"><span><i><Clock3 size={15} /></i> 24/7 Emergency*</span><span><i><Stethoscope size={15} /></i> Specialist care</span><span><i><FileCheck2 size={15} /></i> Digital records</span></div>
            <small className="hero-footnote">*Emergency service availability must be confirmed directly with the hospital.</small>
          </motion.div>
          <motion.div className="hero-art-wrap" initial={{ opacity: 0, scale: .96, x: 18 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ duration: 1, delay: .15, ease: [.22, 1, .36, 1] }}>
            <MedicalCube onDoctors={() => document.getElementById("doctors")?.scrollIntoView({ behavior: "smooth" })} />
          </motion.div>
        </div>
        <div className="hero-side-note"><span>01</span><i /> PATIENT-FIRST, ALWAYS</div>
      </section>

      <section id="appointment" data-section="03" className="booking-section shell">
        <div className="booking-card">
          <div className="booking-intro"><div className="booking-kicker"><CalendarDays size={15} /> YOUR NEXT STEP, MADE SIMPLE</div><h2>Find your<br /><em>appointment.</em></h2><p>Choose your care team and preferred time. Our team will follow up to confirm your request.</p><div className="booking-secure"><ShieldCheck size={16} /><span>Your details are only used to coordinate this booking.</span></div><span className="booking-number">01 <i /> ONLINE REQUEST</span></div>
          <div className="booking-form-wrap">
            {bookingSuccess ? <div className="booking-confirmation" role="status"><div className="confirm-icon"><Check size={26} /></div><div className="booking-kicker">REQUEST RECORDED</div><h3>Thank you, {bookingSuccess.patientName}.</h3><p>Your appointment request is in the reception queue. Please wait for hospital confirmation before travelling.</p><div className="token-ticket"><div><small>APPOINTMENT REFERENCE</small><b>{bookingSuccess.reference}</b></div><div><small>DIGITAL OPD TOKEN</small><b>{bookingSuccess.token}</b></div><div><small>REQUESTED SLOT</small><b>{bookingSuccess.date} · {bookingSuccess.time}</b></div></div><div className="confirm-actions"><button type="button" className="button button-primary button-small" onClick={printSlip}>Print request slip <FileCheck2 size={15} /></button><a className="button button-light button-small" href={bookingSuccess.whatsapp.url} target="_blank" rel="noreferrer"><Phone size={14} /> {bookingSuccess.whatsapp.status === "sent" ? "WhatsApp sent" : "Open WhatsApp"}</a><button type="button" className="text-button" onClick={() => { setBookingSuccess(null); setPatientName(""); setPatientMobile(""); }}>New booking</button></div><div className="print-slip"><h2>RANA MEDICAL HOSPITAL</h2><p>0324-6627054 · Appointment request</p><hr /><p>Reference: {bookingSuccess.reference}</p><p>OPD Token: {bookingSuccess.token}</p><p>Requested: {bookingSuccess.date} · {bookingSuccess.time}</p><p>Pending hospital confirmation</p></div></div> : <form className="booking-form" onSubmit={submitAppointment}>
              <div className="form-heading"><div><span className="eyebrow-small">ONLINE APPOINTMENT</span><h3>Tell us what you need.</h3></div><span className="form-step">STEP 01 <i>—</i> 02</span></div>
              <div className="form-grid">
                <label className="field"><span>Department</span><div className="select-wrap"><select value={selectedDepartment} onChange={(e) => { setSelectedDepartment(e.target.value); const next = content.doctors.find((doctor) => doctor.department === e.target.value || doctor.specialty === e.target.value || e.target.value === "General Medicine" && doctor.specialty === "Medicine"); setSelectedDoctorId(next ? String(next.id) : ""); }} required>{(content.departments.length ? content.departments.map((item) => item.name) : departmentsDefault).map((department) => <option key={department} value={department}>{department}</option>)}</select><ChevronDown size={15} /></div></label>
                <label className="field"><span>Doctor <small>optional</small></span><div className="select-wrap"><select value={activeBookingDoctor ? String(activeBookingDoctor.id) : ""} onChange={(e) => setSelectedDoctorId(e.target.value)}><option value="">First available</option>{doctorsForDepartment.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name.replace("Sample ", "")} · {currencies.format(doctor.consultationFee)}</option>)}</select><ChevronDown size={15} /></div></label>
                <label className="field"><span>Appointment date</span><div className="input-icon"><CalendarDays size={16} /><input type="date" min={today} value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required /></div></label>
                <label className="field"><span>Available time</span><div className="select-wrap"><select value={appointmentSlot} onChange={(e) => setAppointmentSlot(e.target.value)} required>{activeTimeSlots.map((slot) => <option key={slot}>{slot}</option>)}</select><ChevronDown size={15} /></div></label>
                <label className="field"><span>Patient name</span><div className="input-icon"><span className="input-initial">Aa</span><input value={patientName} onChange={(e) => setPatientName(e.target.value)} minLength={2} maxLength={160} placeholder="Full name" required /></div></label>
                <label className="field"><span>Mobile number</span><div className="input-icon"><span className="phone-prefix">+92</span><input type="tel" value={patientMobile} onChange={(e) => setPatientMobile(e.target.value)} placeholder="324 6627054" autoComplete="tel" required /></div></label>
              </div>
              {bookingError && <p className="form-error" role="alert">{bookingError}</p>}
              <div className="booking-submit-row"><button className="button button-primary booking-submit" disabled={bookingLoading}>{bookingLoading ? <><span className="spinner" /> Saving your request…</> : <>Request an appointment <ArrowUpRight size={16} /></>}</button><span><LockKeyhole size={13} /> Private by design</span></div>
              <p className="booking-note">A token is generated when the request is saved. It is not a confirmed appointment until our team contacts you.</p>
            </form>}
          </div>
        </div>
      </section>

      <section id="impact" data-section="04" className="impact-section section-space">
        <div className="shell"><div className="section-intro impact-intro"><div><div className="eyebrow"><span className="eyebrow-icon"><Activity size={14} /></span> CARE THAT MOVES FORWARD</div><h2>Built around the<br /><em>moments that matter.</em></h2></div><p>Illustrative demonstration metrics. Please replace with verified hospital statistics before publication.</p></div>
          <div className="impact-grid"><Counter value={25000} suffix="+" label="Patients supported" detail="Illustrative figure · verify before use" icon={<Heart size={17} />} /><Counter value={35} suffix="+" label="Specialist profiles" detail="Sample directory · not staff verified" icon={<Stethoscope size={17} />} /><Counter value={24} suffix="/7" label="Emergency information" detail="Confirm operational coverage directly" icon={<Clock3 size={17} />} /><Counter value={100} suffix="%" label="Digital-ready records" detail="Platform capability · deployment dependent" icon={<FileCheck2 size={17} />} /></div>
        </div>
      </section>

      <section id="about" data-section="05" className="about-section section-space">
        <div className="shell about-grid"><div className="about-gallery"><div className="about-main-photo" style={{ backgroundImage: `url(${photo.consult})` }}><span className="photo-tag"><span className="live-dot" /> CARE, IN EVERY DETAIL</span><span className="photo-caption">A more connected experience of care</span></div><div className="about-side-photo" style={{ backgroundImage: `url(${photo.corridor})` }}><div className="about-photo-stamp"><span>R</span><b>Care<br />with<br />clarity.</b></div></div><div className="about-gallery-note"><span>02 / 04</span><i /> A PEOPLE-FIRST APPROACH</div></div>
          <div className="about-copy"><div className="eyebrow"><span className="eyebrow-icon"><Hospital size={14} /></span> ABOUT RANA MEDICAL HOSPITAL</div><h2>Care feels different<br />when it feels <em>connected.</em></h2><p className="about-lede">Rana Medical Hospital is building a thoughtful healthcare experience around expert attention, clear communication and compassionate treatment.</p><p>From an outpatient consultation to diagnostics and follow-up, our ambition is to make each step feel considered. This digital experience is a foundation for that promise — with hospital operations, schedules and public information to be confirmed by the Rana Medical Hospital team.</p>
            <div className="about-pillars"><div><span>01</span><div><b>Our vision</b><p>Make trusted healthcare easier to reach, understand and navigate.</p></div></div><div><span>02</span><div><b>Our mission</b><p>Bring people, clinical teams and useful information into one connected experience.</p></div></div></div>
            <div className="director-note"><div className="director-seal"><Quote size={18} /></div><div><p>“Good care starts with listening — and continues with every thoughtful next step.”</p><b>Medical Director message <small>Editorial placeholder · confirm and approve before publication</small></b></div></div>
            <div className="quality-strip"><span><BadgeCheck size={16} /> Quality standards</span><b>Accreditations & certifications: details to be verified before publication.</b></div>
          </div>
        </div>
      </section>

      <section id="services" data-section="06" className="services-section section-space">
        <div className="shell"><div className="section-intro"><div><div className="eyebrow"><span className="eyebrow-icon"><Stethoscope size={14} /></span> CARE, UNDER ONE ROOF</div><h2>Expertise for your<br /><em>whole health.</em></h2></div><p>Explore care pathways designed around people. Service availability and clinical scope should be confirmed directly.</p></div>
          <div className="services-grid">{content.services.slice(0, 10).map((service, index) => {
            const icons = [<Stethoscope size={19} />, <Activity size={19} />, <Syringe size={19} />, <Sparkles size={19} />, <Heart size={19} />, <Baby size={19} />, <HeartPulse size={19} />, <Activity size={19} />, <BadgeCheck size={19} />, <MoveUpRight size={19} />];
            const images = [photo.consult, photo.hero, photo.team, photo.lab, photo.doctor, photo.consult, photo.hero, photo.corridor, photo.lab, photo.team];
            return <motion.article className={`service-card service-card-${index + 1}`} key={service.id ?? service.title} whileHover={{ y: -7, rotateX: 1.5, rotateY: index % 2 ? -1.5 : 1.5 }} transition={{ type: "spring", stiffness: 240, damping: 22 }}>
              <div className="service-image" style={{ backgroundImage: `linear-gradient(180deg,rgba(9,44,46,.06),rgba(9,44,46,.48)),url(${service.imageUrl || images[index]})` }}><span className="service-number">0{index + 1}</span><span className="service-icon">{icons[index]}</span></div>
              <div className="service-card-content"><span className="service-category">{service.category}</span><h3>{service.title}</h3><p>{service.description}</p><div className="service-actions"><button type="button" onClick={() => setSelectedService(service)}>Details <ArrowUpRight size={14} /></button><button type="button" className="service-book" onClick={() => jumpToBooking(service.title.includes("Maternity") ? "Gynecology & Maternity" : service.title.includes("Pediatric") ? "Pediatrics" : "General Medicine")}>Book service <ArrowRight size={14} /></button></div></div>
            </motion.article>;
          })}</div>
          <div className="service-footer"><span>More than a list of services — a considered next step.</span><a href="#appointment">Start with a consultation <ArrowUpRight size={15} /></a></div>
        </div>
      </section>

      <section id="why-us" data-section="07" className="why-section section-space">
        <div className="shell"><div className="section-intro"><div><div className="eyebrow"><span className="eyebrow-icon"><Sparkles size={14} /></span> THE RANA DIFFERENCE</div><h2>Thoughtfully designed<br />around <em>you.</em></h2></div><p>Quality, affordability and access deserve more than a promise. Here is the experience we are working toward.</p></div>
          <div className="bento-grid"><article className="bento-card bento-doctors"><div className="bento-overline">01 / PEOPLE & EXPERTISE</div><div className="bento-doctor-stack"><span>AR</span><span>HM</span><span>ZS</span><span><ArrowRight size={14} /></span></div><h3>Qualified senior<br />consultants.</h3><p>Meet the team, review credentials and confirm the next available clinic.</p><a href="#doctors">Explore sample profiles <ArrowUpRight size={15} /></a></article>
            <article className="bento-card bento-lab"><div className="bento-overline">02 / DIAGNOSTICS, MADE CLEAR</div><div className="bento-lab-art"><div className="lab-ring ring-one" /><div className="lab-ring ring-two" /><div className="lab-core"><Microscope size={28} /></div><span className="lab-dot dot-one" /><span className="lab-dot dot-two" /></div><h3>Answers with<br />a little more clarity.</h3><p>Digital report access, built around authorization and privacy.</p><a href="#lab-reports">Explore the lab portal <ArrowUpRight size={15} /></a></article>
            <article className="bento-card bento-affordable"><span className="bento-icon"><Heart size={19} /></span><div className="bento-overline">03 / ACCESS WITH CARE</div><h3>Affordable care<br />packages.</h3><p>Illustrative PKR pricing, editable by the hospital team.</p><a href="#packages">See packages <ArrowUpRight size={15} /></a><span className="bento-currency">PKR</span></article>
            <article className="bento-card bento-digital"><div className="bento-overline">04 / A MORE CONNECTED VISIT</div><div className="token-mini"><span>YOUR OPD TOKEN</span><b>OPD-<i>024</i></b><small><span className="live-dot" /> QUEUE REQUESTED</small></div><h3>Less waiting<br />in the unknown.</h3><p>Digital tokens are requests — confirmed queue times come from reception.</p></article>
            <article className="bento-card bento-pharmacy"><span className="bento-icon"><Pill size={18} /></span><div className="bento-overline">05 / EVERYDAY SUPPORT</div><h3>Pharmacy &<br />medication support.</h3><p>Availability and operating hours must be confirmed with the hospital.</p><a href="tel:+923246627054">Ask our team <ArrowUpRight size={15} /></a></article>
            <article className="bento-card bento-standards"><span className="bento-icon"><ShieldCheck size={18} /></span><div className="bento-overline">06 / SAFETY & QUALITY</div><h3>Standards worth<br />asking about.</h3><p>ICU, hygiene and accreditation details are placeholders until verified.</p><span className="bento-verified">VERIFY BEFORE PUBLISHING</span></article>
          </div>
        </div>
      </section>

      <section id="doctors" data-section="08" className="doctors-section section-space">
        <div className="shell"><div className="section-intro doctor-section-intro"><div><div className="eyebrow"><span className="eyebrow-icon"><Stethoscope size={14} /></span> THE PEOPLE BEHIND YOUR CARE</div><h2>Find your <em>specialist.</em></h2></div><p>Editable demonstration profiles. Names, qualifications, PMDC registration and clinic schedules must be verified before public use.</p></div>
          <div className="doctor-tools"><div className="doctor-filters">{specialties.map((specialty) => <button type="button" className={doctorFilter === specialty ? "filter-active" : ""} key={specialty} onClick={() => setDoctorFilter(specialty)}>{specialty}</button>)}</div><label className="doctor-search"><Search size={16} /><input value={doctorSearch} onChange={(e) => setDoctorSearch(e.target.value)} placeholder="Search doctors or specialty" aria-label="Search doctors or specialty" />{doctorSearch && <button type="button" aria-label="Clear search" onClick={() => setDoctorSearch("")}><X size={14} /></button>}</label></div>
          <div className="doctor-grid">{visibleDoctors.length ? visibleDoctors.map((doctor, index) => <article className="doctor-card" key={doctor.id}><div className="doctor-card-image" style={{ backgroundImage: `url(${doctor.photoUrl || doctorPortraits[index % doctorPortraits.length]})` }}><span className="doctor-demo-label">Illustrative profile</span><span className="doctor-open"><i /> {doctor.availableSlots} sample slots</span><span className="doctor-photo-index">0{index + 1}</span></div><div className="doctor-card-body"><div className="doctor-specialty">{doctor.specialty}</div><h3>{doctor.name.replace("Sample ", "")}</h3><p className="doctor-qualification">{doctor.qualifications}</p><div className="doctor-meta"><span><Clock3 size={14} /> {doctor.experienceYears} yrs · sample</span><span>{currencies.format(doctor.consultationFee)}</span></div><div className="doctor-schedule"><span>{doctor.opdDays}</span><b>{doctor.opdTimings}</b></div><p className="doctor-reg">PMDC registration: {doctor.pmdcRegistration}</p><button type="button" className="doctor-book" onClick={() => jumpToBooking(doctor.department || doctor.specialty, doctor)}>Request appointment <ArrowUpRight size={15} /></button></div></article>) : <div className="empty-state"><Search size={22} /><b>No matching profiles</b><span>Try a different name or specialty.</span></div>}</div>
          <div className="demo-notice"><ShieldCheck size={16} /><p><b>Directory transparency.</b> All displayed profiles are synthetic examples. No PMDC registration, employment, availability or credentials are represented as verified.</p><a href="/erp">Manage directory <ArrowUpRight size={14} /></a></div>
        </div>
      </section>

      <section id="packages" data-section="09" className="packages-section section-space">
        <div className="shell"><div className="section-intro"><div><div className="eyebrow"><span className="eyebrow-icon"><FileCheck2 size={14} /></span> WELLNESS, WITH A PLAN</div><h2>Good care begins<br />with a <em>check-in.</em></h2></div><p>Sample packages and PKR prices are editable. Confirm inclusions, clinical suitability and current rates before booking.</p></div>
          <div className="package-feature-row"><div className="package-feature-copy"><span className="package-star"><Sparkles size={15} /> MOST COMPREHENSIVE</span><h3>Know more.<br /><em>Feel more prepared.</em></h3><p>A coordinated screening can be a useful starting point for a conversation with your clinician.</p><a href="#lab-reports">Explore diagnostics <ArrowUpRight size={15} /></a><div className="package-abstract"><div /><div /><span>RMH / WELLNESS</span></div></div><div className="package-feature-photo" style={{ backgroundImage: `linear-gradient(180deg,rgba(8,38,41,.04),rgba(8,38,41,.32)),url(${photo.lab})` }}><span>SCREENING · SAMPLE OFFER</span></div></div>
          <div className="package-grid">{content.packages.slice(0, 6).map((item, index) => <article className={`package-card ${index === 0 ? "package-card-featured" : ""}`} key={item.id ?? item.name}><div className="package-card-top"><span>0{index + 1}</span><span className="package-mini-icon">{index === 2 ? <Baby size={18} /> : index === 3 ? <HeartPulse size={18} /> : <Activity size={18} />}</span></div><h3>{item.name}</h3><p>{item.description}</p><div className="package-price"><small>FROM</small><b>{currencies.format(item.price)}</b><small>PKR · SAMPLE PRICE</small></div><div className="package-inclusions"><b>INCLUDES</b><div>{item.includedTests.slice(0, 3).map((test) => <span key={test}><Check size={12} /> {test}</span>)}</div><small>{item.includedConsultations.join(" · ")}</small></div><div className="package-card-actions"><button type="button" onClick={() => jumpToBooking("General Medicine")}>Book now <ArrowUpRight size={15} /></button><a href={`https://wa.me/923246627054?text=${encodeURIComponent(`Hello, please share current details for the ${item.name} package.`)}`} target="_blank" rel="noreferrer">WhatsApp inquiry <Phone size={13} /></a></div></article>)}</div>
        </div>
      </section>

      <section id="lab-reports" data-section="10" className="lab-section section-space">
        <div className="shell lab-layout"><div className="lab-copy"><div className="eyebrow"><span className="eyebrow-icon"><Microscope size={14} /></span> YOUR RESULTS, WITH CARE</div><h2>Good decisions<br />start with <em>clarity.</em></h2><p>Verify an authorized, published report with its reference and registered mobile number. No record is returned from an unmatched search.</p><div className="lab-assurance"><span><LockKeyhole size={15} /></span><div><b>Privacy-first verification</b><small>Reference + registered mobile · rate-limited lookup</small></div></div><div className="lab-contact"><span>Need a hand?</span><a href="tel:+923246627054">Call the laboratory desk <ArrowUpRight size={14} /></a></div>
            <form className="report-form" onSubmit={submitReport}><label className="field"><span>Patient ID / lab reference</span><div className="input-icon"><FileCheck2 size={16} /><input value={reportReference} onChange={(e) => setReportReference(e.target.value)} placeholder="e.g. RMH-DEMO-2401" maxLength={40} required /></div></label><label className="field"><span>Registered mobile number</span><div className="input-icon"><span className="phone-prefix">+92</span><input type="tel" value={reportMobile} onChange={(e) => setReportMobile(e.target.value)} placeholder="324 6627054" required /></div></label>{reportError && <p className="form-error" role="alert">{reportError}</p>}<button className="button button-dark" disabled={reportLoading}>{reportLoading ? <><span className="spinner" /> Verifying securely…</> : <>Verify report <ArrowUpRight size={16} /></>}</button><p className="report-demo-hint">Fictional sample: RMH-DEMO-2401 · mobile 03246627054</p></form>
          </div><div className="lab-visual-column"><div className="lab-visual" style={{ backgroundImage: `linear-gradient(180deg,rgba(8,41,43,.08),rgba(8,41,43,.5)),url(${photo.lab})` }}><div className="lab-visual-tag"><span className="live-dot" /> RESULTS, AUTHORIZED FIRST</div><div className="lab-visual-caption"><span>DIAGNOSTICS</span><b>Precision in every<br />detail.</b></div><div className="lab-glass-card"><span className="lab-glass-icon"><TestTubeDiagonal size={16} /></span><div><b>Every result, reviewed.</b><small>Sample capability illustration</small></div><CheckCircle2 size={17} /></div></div>
            <div className="test-menu"><div className="test-menu-heading"><div><span className="eyebrow-small">LABORATORY MENU</span><h3>Common tests</h3></div><label className="test-search"><Search size={15} /><input value={labSearch} onChange={(e) => setLabSearch(e.target.value)} placeholder="Search tests" aria-label="Search laboratory tests" /></label></div><div className="test-list">{visibleTests.slice(0, 6).map((test) => <div className="test-row" key={test.id ?? test.name}><div><b>{test.name}</b><small>{test.category} <i /> {test.turnaround}</small></div><span>{currencies.format(test.price)}</span></div>)}{visibleTests.length === 0 && <div className="test-empty">No tests match this search.</div>}</div><small className="price-disclaimer">Illustrative rates · confirm current pricing and clinical requirements.</small></div>
          </div>
          {report && <div className="report-result" role="status"><div className="report-result-head"><div><span className="eyebrow-small">AUTHORIZED REPORT · DEMO</span><h3>{report.testName}</h3><p>{report.reference} · {new Date(report.sampleDate).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}</p></div><span className="published-tag"><CheckCircle2 size={14} /> Published</span><button type="button" aria-label="Close report" onClick={() => setReport(null)}><X size={18} /></button></div><div className="report-patient"><span>Patient</span><b>{report.patientName}</b><span>Verification status</span><b>Authorized sample record</b></div><div className="result-table"><div className="result-tr result-th"><span>Test parameter</span><span>Result</span><span>Reference range</span><span>Flag</span></div>{report.results.map((result) => <div className="result-tr" key={result.name}><span>{result.name}</span><b>{result.value} <small>{result.unit}</small></b><span>{result.range}</span><span className={`result-flag flag-${result.flag.toLowerCase()}`}>{result.flag}</span></div>)}</div><div className="report-result-footer"><div><BadgeCheck size={16} /> Authorized digital sample · not medical advice</div>{reportQr && <div className="report-qr"><img src={reportQr} alt="QR code opens the report verification page" /><small>VERIFY REFERENCE</small></div>}<button type="button" className="button button-primary button-small" onClick={printSlip}>Print report <FileCheck2 size={14} /></button></div><div className="print-slip"><h2>RANA MEDICAL HOSPITAL</h2><p>0324-6627054 · Authorized laboratory report</p><p>Patient: {report.patientName} · Reference: {report.reference}</p><p>Test: {report.testName} · Sample date: {report.sampleDate}</p>{report.results.map((item) => <p key={item.name}>{item.name}: {item.value} {item.unit} · Ref: {item.range} · {item.flag}</p>)}<p>Authorized demonstration sample · Not for clinical decisions</p></div></div>}
        </div>
      </section>

      <section id="facilities" data-section="11" className="facilities-section section-space">
        <div className="shell"><div className="section-intro"><div><div className="eyebrow"><span className="eyebrow-icon"><Hospital size={14} /></span> SPACES THAT SUPPORT CARE</div><h2>Modern care.<br /><em>Thoughtful spaces.</em></h2></div><p>Facility information is illustrative. Equipment, services, room types and availability must be verified by the hospital before publication.</p></div>
          <div className="facility-grid"><div className="facility-mosaic"><div className="facility-large" style={{ backgroundImage: `linear-gradient(180deg,transparent 45%,rgba(6,33,37,.7)),url(${photo.team})` }}><span className="facility-label">01 / CLINICAL TEAMWORK</span><div><b>Care that<br />works together.</b><small>Demonstration imagery</small></div></div><div className="facility-small facility-small-blue"><span className="facility-icon"><Activity size={18} /></span><small>DIAGNOSTICS</small><b>Digital X-ray<br />& 4D ultrasound*</b><span className="facility-orbit" /><i>*Availability to confirm</i></div><div className="facility-small facility-small-green"><span className="facility-icon"><HeartPulse size={18} /></span><small>CRITICAL CARE</small><b>NICU &<br />ICU standards*</b><span className="facility-grid-mark" /><i>*Details to verify</i></div><div className="facility-wide" style={{ backgroundImage: `linear-gradient(90deg,rgba(8,42,43,.88),rgba(8,42,43,.12)),url(${photo.corridor})` }}><span className="facility-label">02 / YOUR COMFORT MATTERS</span><b>Room options, made<br />for a little more ease.</b><span className="facility-room-chip"><BedDouble size={14} /> Private · semi-private · sample</span></div></div><div className="facility-list"><span className="eyebrow-small">EXPLORE THE ENVIRONMENT</span><h3>Every detail,<br />considered.</h3><p>A calm, clean environment can make care feel more human. Explore areas the hospital may choose to highlight.</p>{[{ icon: <Activity size={17} />, title: "Digital X-ray & imaging", note: "Equipment availability to verify" }, { icon: <HeartPulse size={17} />, title: "ECG / Echo diagnostics", note: "Confirm current clinical scope" }, { icon: <Syringe size={17} />, title: "Modular operation theatre", note: "Confirm current operational status" }, { icon: <Baby size={17} />, title: "NICU & child care", note: "Facilities and staffing to verify" }, { icon: <Hospital size={17} />, title: "Private recovery rooms", note: "Room categories may vary" }, { icon: <Microscope size={17} />, title: "Advanced laboratory", note: "See available tests and timings" }].map((item, index) => <div className="facility-list-row" key={item.title}><span className="facility-list-icon">{item.icon}</span><div><b>{item.title}</b><small>{item.note}</small></div><span className="facility-list-no">0{index + 1}</span></div>)}<a href="#contact" className="facility-contact">Ask about facilities <ArrowUpRight size={15} /></a></div></div>
        </div>
      </section>

      <section id="booking-steps" data-section="12" className="steps-section section-space">
        <div className="shell"><div className="section-intro"><div><div className="eyebrow"><span className="eyebrow-icon"><CalendarDays size={14} /></span> A SIMPLE WAY TO BEGIN</div><h2>Four steps to a<br /><em>more considered visit.</em></h2></div><p>Online appointment requests are shared with reception. Appointment and arrival details are confirmed by hospital staff.</p></div><div className="steps-line" />
          <div className="steps-grid">{[{ icon: <Search size={20} />, label: "01", title: "Choose a specialist", text: "Find a specialty or start with the care team that feels right." }, { icon: <CalendarDays size={20} />, label: "02", title: "Pick a date & time", text: "Share a preferred date and a sample available time slot." }, { icon: <FileCheck2 size={20} />, label: "03", title: "Receive your token", text: "Get a request reference and digital OPD token to keep handy." }, { icon: <HeartPulse size={20} />, label: "04", title: "Confirm your visit", text: "Our team follows up with confirmed appointment details." }].map((step, index) => <motion.article className="step-card" key={step.label} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .3 }} transition={{ delay: index * .1 }}><div className="step-index"><span>{step.label}</span><div>{step.icon}</div></div><h3>{step.title}</h3><p>{step.text}</p>{index === 3 && <a href="#appointment">Start a booking <ArrowUpRight size={14} /></a>}</motion.article>)}</div><div className="steps-foot"><ShieldCheck size={15} /> A token is a request reference, not a guarantee of a confirmed time or priority status.</div>
        </div>
      </section>

      <section id="testimonials" data-section="13" className="reviews-section section-space">
        <div className="shell reviews-layout"><div className="reviews-heading"><div className="eyebrow"><span className="eyebrow-icon"><Heart size={14} /></span> VOICES, WITH RESPECT</div><h2>Trust is built<br />one <em>moment</em><br />at a time.</h2><p>{reviewCards.every((review) => review.illustrative) ? "Patient stories belong to the people who share them. These clearly labeled illustrations are placeholders, not authentic or verified reviews." : "Reviews shown here are managed by the hospital and should only be published with explicit patient consent."}</p><div className="review-controls"><button type="button" aria-label="Previous sample review" onClick={() => setReviewIndex((reviewIndex + reviewCards.length - 1) % reviewCards.length)}><ChevronLeft size={18} /></button><span>0{(reviewIndex % reviewCards.length) + 1} <i>/</i> 0{reviewCards.length}</span><button type="button" aria-label="Next sample review" onClick={() => setReviewIndex((reviewIndex + 1) % reviewCards.length)}><ChevronRight size={18} /></button></div></div><div className="review-card-wrap"><AnimatePresence mode="wait"><motion.article className="review-card" key={reviewIndex} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: .25 }}><div className="review-card-top"><span className="quote-mark"><Quote size={22} /></span><span className="review-demo"><span /> {activeReview.illustrative ? "SAMPLE REVIEW" : "PATIENT REVIEW"}</span></div><div className="review-stars">{Array.from({ length: activeReview.rating }, (_, index) => <Star size={15} fill="currentColor" key={index} />)}</div><blockquote>“{activeReview.quote}”</blockquote><div className="review-person"><span className="review-avatar">{activeReview.person.charAt(0)}</span><div><b>{activeReview.person}</b><small>{activeReview.department} · {activeReview.date}</small></div><span className="review-illustrative">{activeReview.illustrative ? "Illustrative" : "Hospital CMS"}</span></div><div className="review-card-bg">“</div></motion.article></AnimatePresence><div className="review-privacy"><ShieldCheck size={15} /> Reviews should only be published with explicit patient consent.</div></div></div>
      </section>

      <section id="journal" data-section="14" className="journal-section section-space">
        <div className="shell"><div className="section-intro"><div><div className="eyebrow"><span className="eyebrow-icon"><BookOpen size={14} /></span> THE CARE NOTES</div><h2>Useful ideas for<br /><em>everyday health.</em></h2></div><p>Editorial education can help you ask better questions. It never replaces a diagnosis or advice from your own clinician.</p></div><div className="journal-grid">{content.articles.slice(0, 3).map((article, index) => <article className={`journal-card journal-card-${index + 1}`} key={article.id ?? article.slug ?? article.title}><div className="journal-image" style={{ backgroundImage: `linear-gradient(180deg,rgba(8,35,37,.02),rgba(8,35,37,.28)),url(${article.imageUrl || [photo.consult, photo.team, photo.lab][index]})` }}><span className="journal-category">{["WELLNESS", "HEART HEALTH", "MATERNAL CARE"][index]}</span><span className="journal-arrow"><ArrowUpRight size={17} /></span></div><div className="journal-content"><div className="journal-meta"><span>{article.author}</span><span>{article.publishedAt ? new Date(article.publishedAt).toLocaleDateString("en-PK", { month: "short", year: "numeric" }) : "Editorial placeholder"}</span></div><h3>{article.title}</h3><p>{article.excerpt}</p><button type="button" onClick={() => setSelectedArticle(article)}>Read article <ArrowRight size={15} /></button></div></article>)}</div><div className="journal-disclaimer"><ShieldCheck size={14} /> Educational sample content · not individualized medical advice · managed through the hospital CMS.</div></div>
      </section>

      <section id="emergency" data-section="15" className="emergency-section">
        <div className="emergency-glow" /><div className="shell emergency-inner"><div className="emergency-mark"><span><Activity size={25} /></span><i /></div><div className="emergency-copy"><div className="eyebrow emergency-eyebrow"><span className="live-dot" /> URGENT HELP & INFORMATION</div><h2>When it can’t wait,<br /><em>start with a call.</em></h2><p>Call the hospital information number for current emergency guidance. Ambulance dispatch and response coverage must be confirmed directly.</p><div className="emergency-caveat"><ShieldCheck size={15} /> The number below is a contact line; it does not guarantee emergency dispatch.</div></div><div className="emergency-actions"><a className="button button-white" href="tel:+923246627054"><Phone size={17} /> Call 0324-6627054 <ArrowUpRight size={15} /></a><a className="button button-outline-white" href="https://wa.me/923246627054" target="_blank" rel="noreferrer">WhatsApp the hospital <ArrowUpRight size={15} /></a><div className="corporate-panel"><span><Hospital size={16} /></span><div><b>Corporate & panel inquiries</b><small>Coverage is not confirmed; ask our team.</small></div><a href="#contact" aria-label="Send a corporate inquiry"><ArrowUpRight size={16} /></a></div><div className="ambulance-status"><span className="status-dot" /> Ambulance availability: <b>please confirm directly</b></div></div></div>
      </section>

      <section id="faq" data-section="16" className="faq-section section-space">
        <div className="shell faq-layout"><div className="faq-intro"><div className="eyebrow"><span className="eyebrow-icon"><MessageIcon /></span> CLEAR ANSWERS, WHEN YOU NEED THEM</div><h2>Good to<br /><em>know.</em></h2><p>Hospital-specific information should always be checked with the team. The answers below are editable CMS placeholders.</p><a href="#contact" className="button button-light">Ask a question <ArrowUpRight size={15} /></a><div className="faq-side-note">16 / 17 <i /> COMMON QUESTIONS</div></div><div className="faq-list">{content.faqs.map((faq, index) => <div className={`faq-item ${faqOpen === index ? "faq-open" : ""}`} key={faq.question}><button type="button" aria-expanded={faqOpen === index} onClick={() => setFaqOpen(faqOpen === index ? null : index)}><span className="faq-number">0{index + 1}</span><span>{faq.question}</span><span className="faq-toggle"><ChevronDown size={17} /></span></button><AnimatePresence initial={false}>{faqOpen === index && <motion.div className="faq-answer" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: .25 }}><p>{faq.answer}</p></motion.div>}</AnimatePresence></div>)}</div></div>
      </section>

      <section id="contact" data-section="17" className="contact-section">
        <div className="shell contact-main"><div className="contact-copy"><div className="eyebrow"><span className="eyebrow-icon"><MapPin size={14} /></span> WE'RE HERE TO HELP</div><h2>Start a<br /><em>conversation.</em></h2><p>For appointments, current service availability or a general question, our team is a call away.</p><a className="contact-phone" href="tel:+923246627054"><span><Phone size={17} /></span><div><small>CALL RANA MEDICAL HOSPITAL</small><b>0324-6627054</b></div><ArrowUpRight size={17} /></a><div className="contact-details"><div><span><MapPin size={16} /></span><div><small>VISIT US</small><b>Hospital address to be added by the hospital team.</b><i>Address placeholder · please confirm before travelling</i></div></div><div><span><Clock3 size={16} /></span><div><small>OPD HOURS</small><b>Schedules vary by specialist.</b><i>Call reception for today's timings</i></div></div><div><span><Mail size={16} /></span><div><small>EMAIL</small><b>Email address to be configured</b><i>Contact details placeholder</i></div></div></div></div>
          <div className="contact-right"><div className="contact-form-card"><div className="contact-form-header"><div><span className="eyebrow-small">WE'LL LISTEN</span><h3>Send us a message.</h3></div><span className="contact-form-icon"><Mail size={19} /></span></div><form onSubmit={submitContact}><div className="contact-form-grid"><label className="field"><span>Your name</span><input value={contactFields.name} onChange={(e) => setContactFields({ ...contactFields, name: e.target.value })} placeholder="Full name" required minLength={2} /></label><label className="field"><span>Mobile number</span><input value={contactFields.phone} onChange={(e) => setContactFields({ ...contactFields, phone: e.target.value })} placeholder="03XX-XXXXXXX" type="tel" required /></label><label className="field field-full"><span>Email <small>optional</small></span><input value={contactFields.email} onChange={(e) => setContactFields({ ...contactFields, email: e.target.value })} placeholder="you@example.com" type="email" /></label><label className="field field-full"><span>How can we help?</span><div className="select-wrap"><select value={contactFields.subject} onChange={(e) => setContactFields({ ...contactFields, subject: e.target.value })}><option value="">Choose a topic</option><option>Appointment question</option><option>Corporate or panel inquiry</option><option>Laboratory question</option><option>General information</option><option>Website feedback</option></select><ChevronDown size={15} /></div></label><label className="field field-full"><span>Your message</span><textarea value={contactFields.message} onChange={(e) => setContactFields({ ...contactFields, message: e.target.value })} placeholder="Tell us a little about what you need…" rows={3} required minLength={8} maxLength={2500} /></label></div>{contactError && <p className="form-error" role="alert">{contactError}</p>}{contactStatus && <p className="form-success" role="status">{contactStatus}</p>}<button className="button button-primary contact-submit" disabled={contactLoading}>{contactLoading ? <><span className="spinner" /> Sending…</> : <>Send message <ArrowUpRight size={15} /></>}</button><p className="contact-privacy"><LockKeyhole size={12} /> Please do not include urgent or highly sensitive medical details.</p></form></div>
            <div className="map-panel">{mapEmbed ? <iframe src={mapEmbed} title="Rana Medical Hospital map" loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : <div className="map-placeholder"><div className="map-contour contour-one" /><div className="map-contour contour-two" /><div className="map-pin"><MapPin size={22} fill="currentColor" /></div><span className="map-label">HOSPITAL LOCATION</span><b>Map location to be<br />configured by the hospital</b><a href="https://maps.google.com/?q=Rana+Medical+Hospital" target="_blank" rel="noreferrer">Open Google Maps <ArrowUpRight size={14} /></a><small>Address placeholder · no location has been verified</small></div>}</div>
          </div></div>
        <footer className="site-footer"><div className="shell footer-top"><div className="footer-brand"><a className="brand-lockup brand-light" href="#home"><span className="brand-mark"><span>R</span><i /></span><span className="brand-copy"><b>Rana Medical</b><small>HOSPITAL · CARE WITH CLARITY</small></span></a><p>Compassionate care. Thoughtful technology.<br />A more connected healthcare experience.</p><div className="footer-social"><a href="https://wa.me/923246627054" target="_blank" rel="noreferrer" aria-label="WhatsApp"><Phone size={16} /></a><a href="tel:+923246627054" aria-label="Call hospital"><Activity size={16} /></a><a href="mailto:hello@example.invalid" aria-label="Email placeholder"><Mail size={16} /></a></div></div><div className="footer-column"><b>EXPLORE</b><a href="#about">About the hospital</a><a href="#services">Medical services</a><a href="#doctors">Sample directory</a><a href="#packages">Wellness packages</a></div><div className="footer-column"><b>FOR PATIENTS</b><a href="#appointment">Request an appointment</a><a href="#lab-reports">Verify a lab report</a><a href="#faq">Frequently asked questions</a><a href="/erp">Staff portal</a></div><div className="footer-column footer-contact"><b>CONTACT</b><a href="tel:+923246627054"><Phone size={14} /> 0324-6627054</a><a href="https://wa.me/923246627054" target="_blank" rel="noreferrer"><Phone size={14} /> WhatsApp</a><span><MapPin size={14} /> Address placeholder</span><span><Clock3 size={14} /> Confirm OPD hours</span></div></div><div className="footer-bottom"><div className="shell footer-bottom-inner"><span>© {new Date().getFullYear()} Rana Medical Hospital · Illustrative demo experience</span><div><a href="#contact">Privacy policy placeholder</a><a href="#contact">Terms placeholder</a><span>Powered by <b>Wafa Smart Tech</b></span></div></div></div></footer>
      </section>
    </main>

    <a className="mobile-emergency" href="tel:+923246627054" aria-label="Call Rana Medical Hospital"><Phone size={17} /><span>Call hospital</span></a>

    <AnimatePresence>{(selectedArticle || selectedService) && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) { setSelectedArticle(null); setSelectedService(null); } }}><motion.div className="content-modal" role="dialog" aria-modal="true" aria-label={selectedArticle?.title || selectedService?.title} initial={{ opacity: 0, y: 18, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 14, scale: .98 }} transition={{ duration: .2 }}><button type="button" className="modal-close" onClick={() => { setSelectedArticle(null); setSelectedService(null); }} aria-label="Close"><X size={19} /></button><span className="eyebrow-small">{selectedArticle ? "THE CARE NOTES · SAMPLE EDITORIAL" : "RANA MEDICAL HOSPITAL · SERVICE INFORMATION"}</span><h2>{selectedArticle?.title || selectedService?.title}</h2>{selectedArticle?.imageUrl && <div className="modal-image" style={{ backgroundImage: `url(${selectedArticle.imageUrl})` }} />}<p>{selectedArticle?.body || selectedService?.description}</p><div className="modal-disclaimer"><ShieldCheck size={15} /> {selectedArticle ? "Educational sample only; not individualized medical advice." : "Please confirm current service availability with the hospital."}</div>{selectedArticle && <small className="modal-author">{selectedArticle.author}</small>}<button type="button" className="button button-primary" onClick={() => { setSelectedArticle(null); setSelectedService(null); jumpToBooking(); }}>Request an appointment <ArrowUpRight size={15} /></button></motion.div></motion.div>}</AnimatePresence>
  </div>;
}

function MessageIcon() { return <Quote size={14} />; }
