// Importing the clsx function and ClassValue type from the clsx library
import { clsx, type ClassValue } from "clsx";

// Importing the twMerge function from the tailwind-merge library
import { twMerge } from "tailwind-merge";

// Function to merge class names using clsx and twMerge
// clsx is used to conditionally join class names together
// twMerge is used to merge Tailwind CSS classes with conflict resolution
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
