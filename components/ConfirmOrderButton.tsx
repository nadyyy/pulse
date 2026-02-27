"use client";

type ConfirmOrderButtonProps = {
  className?: string;
};

export function ConfirmOrderButton({ className }: ConfirmOrderButtonProps) {
  return (
    <button
      className={className ?? "button"}
      type="submit"
      onClick={(event) => {
        const confirmed = window.confirm(
          "Confirm this order? Your cart will be cleared after placing it.",
        );
        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      Place order
    </button>
  );
}

