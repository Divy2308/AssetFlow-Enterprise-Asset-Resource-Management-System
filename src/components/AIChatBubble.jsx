import React from 'react';

export default function AIChatBubble({ message }) {
  if (!message) return null;

  const isUser = message.sender === 'user';

  // Format basic bold (**text**) and bullet points (•) into clean React elements
  const formatText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      // Check if line is a bullet point
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = line.replace(/^[•\-*]\s*/, '');

      // Replace **bold** with <strong>
      const parts = cleanLine.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-extrabold text-text-primary">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-primary-orange font-bold text-sm leading-tight">•</span>
            <span className="flex-1">{renderedParts}</span>
          </div>
        );
      }

      return (
        <p key={idx} className={`${idx > 0 ? 'mt-2' : ''} leading-relaxed m-0`}>
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <div className={`flex flex-col gap-1 w-full ${isUser ? 'items-end' : 'items-start'} animate-fadeIn`}>
      <div className="flex items-center gap-1.5 px-1">
        <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
          {isUser ? 'You' : '🤖 AssetFlow AI Co-Pilot'}
        </span>
        <span className="text-[9px] font-semibold text-text-muted">
          {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
        </span>
      </div>

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs font-medium shadow-2xs ${
          isUser
            ? 'bg-primary-orange text-white rounded-br-2xs'
            : 'bg-bg-gray border border-border-color text-text-primary rounded-bl-2xs'
        }`}
      >
        {isUser ? (
          <p className="m-0 leading-relaxed font-semibold">{message.text}</p>
        ) : (
          <div className="flex flex-col">{formatText(message.text)}</div>
        )}

        {/* Action badge confirmation box if the assistant executed a database tool */}
        {!isUser && message.actionTaken && (
          <div className="mt-3 bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 flex items-center gap-2.5 text-emerald-800 font-bold shadow-2xs">
            <span className="text-base">✅</span>
            <div className="flex flex-col">
              <span className="text-[11px] font-extrabold">System Action Executed</span>
              <span className="text-[10px] font-semibold text-emerald-700">
                Created Maintenance Ticket #{message.actionTaken.requestId || '104'} for {message.actionTaken.assetTag || 'Asset'} ({message.actionTaken.priority || 'MEDIUM'} Priority)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
