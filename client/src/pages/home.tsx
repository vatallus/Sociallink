import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import ProfileSection from "@/components/profile-section";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProfileSection />
          
          <div className="mt-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Book Your Appointment</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Schedule a consultation with our experienced medical professionals. We provide comprehensive care tailored to your needs.
            </p>
            <Link href="/booking">
              <Button size="lg" className="font-semibold">
                Schedule Now
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-card">
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f"
                alt="Modern Medical Office"
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">State-of-the-art Facility</h3>
              <p className="text-muted-foreground">
                Our modern medical center is equipped with the latest technology to provide the best care possible.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card">
              <img
                src="https://images.unsplash.com/photo-1487017159836-4e23ece2e4cf"
                alt="Consultation Room"
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Expert Consultation</h3>
              <p className="text-muted-foreground">
                Get personalized attention from our experienced medical professionals.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-card">
              <img
                src="https://images.unsplash.com/photo-1431540015161-0bf868a2d407"
                alt="Treatment Room"
                className="w-full h-48 object-cover rounded-md mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">Advanced Treatment</h3>
              <p className="text-muted-foreground">
                Access to advanced medical treatments and procedures for optimal results.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
