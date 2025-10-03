"use client";

import {
  type MouseEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
} from "react";

export type ConfirmDialogProps = {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const DEFAULT_CANCEL_LABEL = "Cancelar";
const DEFAULT_CONFIRM_LABEL = "Eliminar";

const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = DEFAULT_CONFIRM_LABEL,
  cancelLabel = DEFAULT_CANCEL_LABEL,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  const titleId = useId();
  const descriptionId = useId();
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedElement = useRef<Element | null>(null);

  useEffect(() => {
    if (open) {
      previouslyFocusedElement.current = document.activeElement;
      window.requestAnimationFrame(() => {
        confirmButtonRef.current?.focus();
      });
    } else if (previouslyFocusedElement.current instanceof HTMLElement) {
      previouslyFocusedElement.current.focus();
      previouslyFocusedElement.current = null;
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!open) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key === "Tab") {
        const focusable = [confirmButtonRef.current, cancelButtonRef.current].filter(
          Boolean
        ) as HTMLElement[];

        if (focusable.length === 0) {
          event.preventDefault();
          return;
        }

        const currentIndex = focusable.findIndex(
          (element) => element === document.activeElement
        );

        if (event.shiftKey) {
          if (currentIndex <= 0) {
            event.preventDefault();
            focusable[focusable.length - 1].focus();
          }
        } else if (currentIndex === -1 || currentIndex === focusable.length - 1) {
          event.preventDefault();
          focusable[0].focus();
        }
      }
    },
    [onCancel, open]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const handler = (event: KeyboardEvent) => handleKeyDown(event);
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [handleKeyDown, open]);

  if (!open) {
    return null;
  }

  const dialogTitleId = title ? `${titleId}-title` : undefined;
  const dialogDescriptionId = description ? `${descriptionId}-description` : undefined;

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
      role="presentation"
      onMouseDown={handleOverlayClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
        className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-xl"
      >
        {title ? (
          <h2 id={dialogTitleId} className="text-lg font-semibold text-[var(--color-primary)]">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p
            id={dialogDescriptionId}
            className="mt-1 text-sm text-[var(--color-neutral-700)]"
          >
            {description}
          </p>
        ) : null}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="btn bg-[var(--color-neutral-200)] text-[var(--color-primary)] hover:brightness-95"
            onClick={onCancel}
            ref={cancelButtonRef}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn-primary hover:brightness-95"
            onClick={onConfirm}
            ref={confirmButtonRef}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
