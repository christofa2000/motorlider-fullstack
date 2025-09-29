"use client";

import { useToastContext } from "../components/ToastProvider";

export const useToast = () => {
  const { show } = useToastContext();

  return { show };
};

export default useToast;
