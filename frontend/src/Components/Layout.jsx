import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import PageNav from "./PageNav";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <PageNav />
      <Outlet />
      <Footer />
    </div>
  );
}