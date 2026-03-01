import React from 'react';
import { STATUS_COLORS, STATUS_LABELS } from '../utils/helpers';

const StatusBadge = ({ status }) => (
  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'}`}>
    {STATUS_LABELS[status] || status}
  </span>
);

export default StatusBadge;
