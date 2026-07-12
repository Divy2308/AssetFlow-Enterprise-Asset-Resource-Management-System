import React from 'react';
import { CalendarIcon, HandIcon } from './Icons';

export default function QuickActions({ onRegisterAsset, onBookResource, onRaiseRequests }) {
  return (
    <div className="quick-actions-row">
      {/* Register Asset Button */}
      <button 
        className="btn-primary-orange" 
        onClick={onRegisterAsset}
      >
        <span>+</span> Register Asset
      </button>

      {/* Book Resource Button */}
      <button 
        className="btn-secondary-outline" 
        onClick={onBookResource}
      >
        <CalendarIcon size={16} className="action-icon" />
        Book Resource
      </button>

      {/* Raise Requests Button */}
      <button 
        className="btn-secondary-outline" 
        onClick={onRaiseRequests}
      >
        <HandIcon size={16} className="action-icon" />
        Raise Requests
      </button>
    </div>
  );
}
