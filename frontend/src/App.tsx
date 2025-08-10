import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";

const App: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container py-6">
        <Outlet />
      </main>
    </div>
  );
};

export default App;
