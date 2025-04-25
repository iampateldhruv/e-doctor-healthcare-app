import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import FindDoctors from "@/pages/FindDoctors";
import Pharmacy from "@/pages/Pharmacy";
import MedicineDetailPage from "@/pages/MedicineDetailPage";
import Community from "@/pages/Community";
import BlogDetailPage from "@/pages/BlogDetailPage";
import SymptomCheckerPage from "@/pages/SymptomCheckerPage";
import AppointmentBookingPage from "@/pages/AppointmentBookingPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/doctors" component={FindDoctors} />
      <Route path="/pharmacy" component={Pharmacy} />
      <Route path="/medicine/:id" component={MedicineDetailPage} />
      <Route path="/community" component={Community} />
      <Route path="/blog/:id" component={BlogDetailPage} />
      <Route path="/symptom-checker" component={SymptomCheckerPage} />
      <Route path="/appointment/new" component={AppointmentBookingPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Header />
        <main className="pt-16 pb-10 min-h-screen">
          <Router />
        </main>
        <Footer />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
