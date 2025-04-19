"use client";

import { useState } from 'react';

export function useResizableSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return { isCollapsed, setIsCollapsed };
} 