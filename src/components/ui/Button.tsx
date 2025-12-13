import React from "react";

interface ButtonProps {
  children: React.ReactNode;   // 👈 icon + label
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center gap-2 ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
