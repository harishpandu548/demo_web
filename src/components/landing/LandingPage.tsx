import Navbar from "./Navbar";
import HeroSection from "./HeroSection";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-ivory">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
