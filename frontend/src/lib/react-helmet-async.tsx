'use client';

import React from 'react';

export const Helmet: React.FC<{ children?: React.ReactNode; [key: string]: any }> = ({ children }) => {
  return null;
};

export const HelmetProvider: React.FC<{ children?: React.ReactNode; [key: string]: any }> = ({ children }) => {
  return <>{children}</>;
};

export default Helmet;
