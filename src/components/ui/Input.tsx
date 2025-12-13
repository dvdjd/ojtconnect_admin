import React from "react";

interface InputProps {
  type?: string;
  name?: string;
  id?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  name,
  id,
  value,
  placeholder,
  onChange,
  className = "",
}) => {
  return (
    <input
      type={type}
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`border border-[#dddddd] p-2 rounded-md text-[#666666] ${className}`}
    />
  );
};

export default Input;
