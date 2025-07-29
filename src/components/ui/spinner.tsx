import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "inline-flex animate-spin rounded-full border-t-2 border-r-2 border-solid border-white",
  {
    variants: {
      size: {
        default: "h-4 w-4",
        sm: "h-3 w-3",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "default" | "sm" | "lg";
}

export function Spinner({ className, size, ...props }: SpinnerProps) {
  return <div className={cn(spinnerVariants({ size }), className)} {...props} />;
}
