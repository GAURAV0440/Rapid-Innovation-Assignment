import React from "react";
import { Link, useRouteError } from "react-router-dom";

const NotFound: React.FC = () => {
  const error: any = useRouteError?.() ?? null;
  return (
    <div className="mx-auto max-w-xl text-center">
      <h1 className="mb-2 text-3xl font-bold">404</h1>
      <p className="mb-6 text-neutral-600 dark:text-neutral-300">
        Page not found{error?.statusText ? `: ${error.statusText}` : "."}
      </p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  );
};

export default NotFound;
