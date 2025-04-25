import { Link } from "wouter";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin 
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">E-Doctor</h3>
            <p className="text-gray-400 mb-4">
              Providing accessible healthcare solutions and connecting patients with
              qualified medical professionals.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <span className="text-gray-400 hover:text-white cursor-pointer">Home</span>
                </Link>
              </li>
              <li>
                <Link href="/doctors">
                  <span className="text-gray-400 hover:text-white cursor-pointer">Find Doctors</span>
                </Link>
              </li>
              <li>
                <Link href="/pharmacy">
                  <span className="text-gray-400 hover:text-white cursor-pointer">Pharmacy</span>
                </Link>
              </li>
              <li>
                <Link href="/community">
                  <span className="text-gray-400 hover:text-white cursor-pointer">Community</span>
                </Link>
              </li>
              <li>
                <Link href="/about">
                  <span className="text-gray-400 hover:text-white cursor-pointer">About Us</span>
                </Link>
              </li>
              <li>
                <Link href="/contact">
                  <span className="text-gray-400 hover:text-white cursor-pointer">Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Our Services</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Online Consultations
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Medication Delivery
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Health Checkups
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Lab Tests
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  Health Articles
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white">
                  24/7 Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="mt-1 mr-3 text-gray-400" size={18} />
                <span className="text-gray-400">
                  123 Healthcare Avenue, Medical District, CA 90210
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-3 text-gray-400" size={18} />
                <span className="text-gray-400">+1 (800) MED-HELP</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-3 text-gray-400" size={18} />
                <span className="text-gray-400">support@e-doctor.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} E-Doctor Healthcare. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-white text-sm">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
