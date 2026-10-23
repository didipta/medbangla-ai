"use client";

import React, { useState } from "react";
import { AndroidExperienceBanner } from "./AndroidExperienceBanner";
import { ApkDownloadModal } from "./ApkDownloadModal";

export const AndroidAppExperience: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  return (
    <>
      <AndroidExperienceBanner onOpenDownloadModal={() => setIsModalOpen(true)} />
      <ApkDownloadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
