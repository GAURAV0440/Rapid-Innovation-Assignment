import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./styles/index.css";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import ImageGen from "./pages/ImageGen";
import Dashboard from "./pages/Dashboard";
import EntryDetail from "./pages/EntryDetail"; // Add this import
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ToasterProvider } from "./components/Toaster";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Search /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "search", element: <Search /> },
      { path: "image", element: <ImageGen /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          // Add this route for EntryDetail
          { path: "dashboard/:type/:id", element: <EntryDetail /> }
        ]
      },
      { path: "*", element: <NotFound /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToasterProvider>
        <RouterProvider router={router} />
      </ToasterProvider>
    </AuthProvider>
  </React.StrictMode>
);