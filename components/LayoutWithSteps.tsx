"use client";

import { usePathname } from "next/navigation";
import { StepIndicator } from "./StepIndicator";

export function LayoutWithSteps() {
  const pathname = usePathname();
  if (pathname === "/") return null;
  if (pathname === "/upload") return <StepIndicator currentStep={1} />;
  if (pathname === "/map") return null; /* map page renders its own (step 2 or 3) */
  if (pathname === "/download") return <StepIndicator currentStep={3} />;
  return null;
}
