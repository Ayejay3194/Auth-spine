'use client';

import React from 'react';

interface CupertinoBlankStateProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  icon?: React.ReactNode;
  showButton?: boolean;
  className?: string;
}

export default function CupertinoBlankState({
  title = "Nothing here yet",
  subtitle = "This space will update automatically when there's something to show.",
  buttonText = "Get Started",
  onButtonClick,
  icon,
  showButton = true,
  className = ""
}: CupertinoBlankStateProps) {
  return (
    <div className={`cupertino-blank ${className}`}>
      <div className="cupertino-card">
        <div className="cupertino-icon">
          {icon || "⎯"}
        </div>
        <h1 className="cupertino-title">{title}</h1>
        <p className="cupertino-subtitle">{subtitle}</p>
        {showButton && (
          <button className="cupertino-button" onClick={onButtonClick}>
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
}
