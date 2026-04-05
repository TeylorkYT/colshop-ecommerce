import React from 'react';
import PropTypes from 'prop-types';

const statusStyles = {
  open: 'bg-green-500/20 text-green-400',
  closed: 'bg-gray-500/20 text-gray-400',
  pending: 'text-yellow-300 bg-yellow-500/10',
  completed: 'text-green-300 bg-green-500/10',
  cancelled: 'text-red-300 bg-red-500/10',
  unknown: 'text-gray-300 bg-gray-500/10',
};

const statusLabels = {
  open: 'Abierto',
  closed: 'Cerrado',
  pending: 'Pendiente',
  completed: 'Completado',
  cancelled: 'Cancelado',
  unknown: 'Desconocido',
};

const StatusBadge = ({ status }) => {
  const safeStatus = status?.toLowerCase() || 'unknown';
  const style = statusStyles[safeStatus] || statusStyles.unknown;
  const label = statusLabels[safeStatus] || statusLabels.unknown;

  return (
    <span className={`px-3 py-1 rounded-full text-xs ${style}`}>
      {label}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

export default StatusBadge;
