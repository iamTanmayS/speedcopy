import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      className={`sc-card ${onClick ? 'sc-card-clickable' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
