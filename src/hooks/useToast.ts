"use client";

import { useToastContext } from "../components/ToastProvider";

export const useToast = () => {
  const { toast } = useToastContext();
  return { toast };
};

export default useToast;
