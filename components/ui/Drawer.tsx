"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";

import { cn } from "@/lib/cn";

export function Drawer({
  open,
  onClose,
  title,
  side = "left",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "left" | "right";
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            key="backdrop"
            type="button"
            aria-label="Close"
            className="ui-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            key="panel"
            className={cn("ui-drawer", side === "right" && "ui-drawer-right")}
            initial={{ x: side === "right" ? 360 : -360 }}
            animate={{ x: 0 }}
            exit={{ x: side === "right" ? 360 : -360 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="ui-drawer-head">
              <h3>{title}</h3>
              <button type="button" className="ui-icon-btn" onClick={onClose}>
                ✕
              </button>
            </div>
            <div className="ui-drawer-body">{children}</div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
