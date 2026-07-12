import React from 'react';
import { CalendarIcon, HandIcon } from './Icons';

export default function QuickActions({ onRegisterAsset, onBookResource, onRaiseRequests }) {
  return (
    <div className="flex gap-4 items-center flex-wrap">
      {/* Register Asset Button */}
      <button 
        className="bg-primary-orange hover:bg-primary-orange-hover text-white text-sm font-extrabold py-3 px-6 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5" 
        onClick={onRegisterAsset}
      >
        <span className="text-lg font-normal">+</span> Register Asset
      </button>

      {/* Book Resource Button */}
      <button 
        className="border border-border-color bg-white text-text-primary hover:bg-bg-gray text-sm font-bold py-3 px-6 rounded-xl transition flex items-center gap-2 cursor-pointer" 
        onClick={onBookResource}
      >
        <CalendarIcon size={16} className="text-text-secondary" />
        Book Resource
      </button>

      {/* Raise Requests Button */}
      <button 
        className="border border-border-color bg-white text-text-primary hover:bg-bg-gray text-sm font-bold py-3 px-6 rounded-xl transition flex items-center gap-2 cursor-pointer" 
        onClick={onRaiseRequests}
      >
        <HandIcon size={16} className="text-text-secondary" />
        Raise Requests
      </button>
    </div>
  );
}
