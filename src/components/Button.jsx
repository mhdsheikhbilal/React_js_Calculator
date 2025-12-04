import React from "react";

const Button = ({ children, onClick, className = "" }) => {
  const base = "rounded-md p-3 shadow-sm hover:opacity-90";
  return (
    <div>
      <button onClick={onClick} className={`${base} ${className}`}>
        {children}
      </button>
    </div>
  );
};

export default Button;
