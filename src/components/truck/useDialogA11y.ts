"use client";

import { useEffect } from "react";

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Escape-to-close, optional Left/Right navigation, and a Tab focus-trap
 * for a full-screen dialog — shared by every accessible modal on the
 * truck profile page (gallery/menu-item lightbox, QR poster preview) so
 * they all behave identically instead of each reimplementing this.
 */
export function useDialogKeyTrap({
  dialogRef,
  onClose,
  onArrowLeft,
  onArrowRight,
}: {
  dialogRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (onArrowLeft && e.key === "ArrowLeft") {
        e.preventDefault();
        onArrowLeft();
        return;
      }
      if (onArrowRight && e.key === "ArrowRight") {
        e.preventDefault();
        onArrowRight();
        return;
      }
      if (e.key === "Tab") {
        const container = dialogRef.current;
        if (!container) return;
        const focusables = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dialogRef, onClose, onArrowLeft, onArrowRight]);
}

/** Locks background scroll for as long as a full-screen dialog is mounted. */
export function useBodyScrollLock() {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);
}
