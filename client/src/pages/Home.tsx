import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Pill,
  PenSquare,
  ArrowRight,
  BriefcaseMedical,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  // Fetch user to determine if logged in
  const { data: user } = useQuery({
    queryKey: ["/api/users/current"],
  });

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Your Health, Our Priority
              </h1>
              <p className="text-xl text-blue-100 mb-8">
                Connect with top healthcare professionals, manage prescriptions,
                and access health resources all in one place.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50"
                >
                  <Link href="/doctors">Find a Doctor</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-blue-700 hover:bg-blue-600 font-bold"
                >
                  <Link href="/symptom-checker">Health Check</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80"
                alt="Healthcare professionals"
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive healthcare solutions designed to meet your needs
              with convenience and care.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ServiceCard
              icon={<Users className="text-primary w-12 h-12 mb-4" />}
              title="Find Specialists"
              description="Connect with top healthcare professionals across various specializations."
              link="/doctors"
            />
            <ServiceCard
              icon={<Pill className="text-primary w-12 h-12 mb-4" />}
              title="Online Pharmacy"
              description="Order prescriptions and medications with convenient home delivery."
              link="/pharmacy"
            />
            <ServiceCard
              icon={<PenSquare className="text-primary w-12 h-12 mb-4" />}
              title="Health Community"
              description="Access expert health articles and join discussions on health topics."
              link="/community"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple steps to access quality healthcare from the comfort of your
              home.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StepCard
              number="1"
              icon={<Search className="text-primary w-8 h-8 mb-2" />}
              title="Search"
              description="Find doctors by specialty, location, or availability"
            />
            <StepCard
              number="2"
              icon={<BriefcaseMedical className="text-primary w-8 h-8 mb-2" />}
              title="Book"
              description="Schedule an appointment at your convenience"
            />
            <StepCard
              number="3"
              icon={<Stethoscope className="text-primary w-8 h-8 mb-2" />}
              title="Consult"
              description="Meet with your doctor online or in-person"
            />
            <StepCard
              number="4"
              icon={<ShieldCheck className="text-primary w-8 h-8 mb-2" />}
              title="Follow-up"
              description="Get prescriptions and schedule follow-up care"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12 flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Ready to take control of your health?
              </h3>
              <p className="text-lg text-gray-600">
                Join thousands of patients who have already transformed their
                healthcare experience with E-Doctor.
              </p>
            </div>
            <div>
              <Button
                size="lg"
                className="bg-primary hover:bg-blue-700 text-white"
              >
                <Link href="/doctors">Get Started Today</Link>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

const ServiceCard = ({ icon, title, description, link }: ServiceCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow duration-300">
      <div className="text-center">
        {icon}
        <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{description}</p>
        <Link href={link}>
          <span className="inline-flex items-center text-primary font-medium hover:text-blue-700 cursor-pointer">
            Learn More <ArrowRight className="ml-2 h-4 w-4" />
          </span>
        </Link>
      </div>
    </div>
  );
};

interface StepCardProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const StepCard = ({ number, icon, title, description }: StepCardProps) => {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-primary text-2xl font-bold mb-4">
        {number}
      </div>
      <div>{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default Home;
