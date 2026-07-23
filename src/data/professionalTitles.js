import {
  Monitor,
  LayoutTemplate,
  PenTool,
  Palette,
  Paintbrush,
  Laptop,
  Code2,
  Database,
  Cpu,
  Smartphone,
  Gamepad2,
  ServerCog,
  Cloud,
  Brain,
  Camera,
  Video,
  Image,
  BookOpen,
  Megaphone,
  Briefcase,
  Building2,
  Home,
  PencilRuler,
  Package,
  Globe,
  Brush,
  FileText,
  GraduationCap,
  Users,
  BarChart3,
  Search,
  Bot,
  Music4,
  Mic2,
  Plane,
  HeartPulse,
  Dumbbell,
  ShoppingBag,
  Gem,
  Shirt,
  CheckSquare,
} from "lucide-react";

const professionalSuggestions = [
  // DESIGN
  { title: "UI Designer", icon: Monitor },
  { title: "UX Designer", icon: LayoutTemplate },
  { title: "Product Designer", icon: PenTool },
  { title: "Graphic Designer", icon: Palette },
  { title: "Web Designer", icon: Laptop },
  { title: "Brand Designer", icon: Paintbrush },
  { title: "Logo Designer", icon: Brush },
  { title: "Illustrator", icon: PenTool },
  { title: "Concept Artist", icon: Brush },
  { title: "3D Artist", icon: Package },
  { title: "Motion Designer", icon: Video },
  { title: "Figma Designer", icon: PenTool },

  // DEVELOPMENT
  { title: "Frontend Developer", icon: Code2 },
  { title: "Backend Developer", icon: Database },
  { title: "Full Stack Developer", icon: Cpu },
  { title: "React Developer", icon: Code2 },
  { title: "Node.js Developer", icon: ServerCog },
  { title: "Python Developer", icon: Code2 },
  { title: "Mobile Developer", icon: Smartphone },
  { title: "Game Developer", icon: Gamepad2 },
  { title: "Software Engineer", icon: Cpu },
  { title: "DevOps Engineer", icon: Cloud },
  { title: "Cloud Engineer", icon: Cloud },

  // AI / DATA
  { title: "AI Engineer", icon: Brain },
  { title: "Machine Learning Engineer", icon: Brain },
  { title: "Data Scientist", icon: BarChart3 },
  { title: "Data Analyst", icon: BarChart3 },
  { title: "Prompt Engineer", icon: Bot },

  // CONTENT
  { title: "Copywriter", icon: FileText },
  { title: "Content Creator", icon: Image },
  { title: "Technical Writer", icon: BookOpen },
  { title: "Translator", icon: Globe },

  // MARKETING
  { title: "Marketing Specialist", icon: Megaphone },
  { title: "SEO Specialist", icon: Search },
  { title: "Social Media Manager", icon: Users },
  { title: "Brand Strategist", icon: Briefcase },

  // VIDEO
  { title: "Video Editor", icon: Video },
  { title: "Photographer", icon: Camera },
  { title: "Music Producer", icon: Music4 },
  { title: "Podcast Editor", icon: Mic2 },

  // BUSINESS
  { title: "Project Manager", icon: Briefcase },
  { title: "Product Manager", icon: Briefcase },
  { title: "Business Consultant", icon: Building2 },
  { title: "Virtual Assistant", icon: Users },

  // ARCHITECTURE
  { title: "Architect", icon: Home },
  { title: "Interior Designer", icon: PencilRuler },

  // EDUCATION
  { title: "Tutor", icon: GraduationCap },
  { title: "Course Creator", icon: GraduationCap },

  // HEALTH
  { title: "Nutritionist", icon: HeartPulse },
  { title: "Personal Trainer", icon: Dumbbell },

  // E-COMMERCE
  { title: "E-commerce Manager", icon: ShoppingBag },

  // FASHION
  { title: "Fashion Designer", icon: Shirt },
  { title: "Jewelry Designer", icon: Gem },

  // OTHERS
  { title: "Travel Planner", icon: Plane },
  { title: "Consultant", icon: CheckSquare },
];

export default professionalSuggestions;