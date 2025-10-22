import React from "react";
import Link from "next/link";

const AuthButtons: React.FC = () => {
  return (
    <div className="flex items-center space-x-3">
      <Link
        href="/login"
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
      >
        Connexion
      </Link>
      <Link
        href="/register"
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Inscription
      </Link>
    </div>
  );
};

export default AuthButtons;
