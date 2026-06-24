import { X } from "lucide-react";
import { CARBON } from "../lib/constants";
import { Card } from "./Card";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  /** Extra element(s) rendered next to the close button */
  headerExtra?: React.ReactNode;
}

const WIDTHS: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
};

export function Modal({ open, onClose, title, children, maxWidth = "md", className = "", headerExtra }: ModalProps) {
  if (!open) return null;

  const hasHeader = title || headerExtra;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${WIDTHS[maxWidth]} z-10 ${className}`}>
        <Card className="p-6 shadow-2xl" hover={false}>
          {hasHeader ? (
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-black" style={{ color: CARBON }}>
                {title}
              </h2>
              <div className="flex items-center gap-1">
                {headerExtra}
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end mb-3">
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {children}
        </Card>
      </div>
    </div>
  );
}
