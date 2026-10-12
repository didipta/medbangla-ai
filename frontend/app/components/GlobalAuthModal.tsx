"use client";

import React from "react";
import { AuthModal } from "./AuthModal";
import { useAuth } from "../context/AuthContext";

export const GlobalAuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, authModalMode } = useAuth();

  return (
    <AuthModal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      onLoginSuccess={login}
      initialMode={authModalMode}
    />
  );
};
