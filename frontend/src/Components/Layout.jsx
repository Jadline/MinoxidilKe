import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import PageNav from "./PageNav";
import BackToTop from "./BackToTop";
import WhatsAppWidget from "./WhatsAppWidget";
import MobileBottomNav from "./MobileBottomNav";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <PageNav />
      <Outlet />
      <Footer />
      <BackToTop />
      <WhatsAppWidget />
      <MobileBottomNav />
    </div>
  );
}