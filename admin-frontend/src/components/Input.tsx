import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`sc-input-wrapper ${className}`}>
      {label && <label className="sc-input-label">{label}</label>}
      <input 
        className={`sc-input ${error ? 'sc-input-error' : ''}`} 
        {...props} 
      />
      {error && <span className="sc-input-error-text">{error}</span>}
    </div>
  );
};
