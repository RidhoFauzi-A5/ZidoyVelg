import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-white text-black hover:bg-gray-200": variant === "primary",
                        "bg-zinc-800 text-white hover:bg-zinc-700": variant === "secondary",
                        "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground": variant === "outline",
                        "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
                        "h-9 px-3 text-xs": size === "sm",
                        "h-10 px-4 py-2": size === "md",
                        "h-11 px-8": size === "lg",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
