export const REALTIME_EVENTS = Object.freeze({
  // Order Events
  ORDER_STATUS_UPDATED: 'order:status_updated',
  ORDER_CREATED: 'order:created',
  ORDER_CANCELLED: 'order:cancelled',

  // Delivery Events
  DELIVERY_ASSIGNED: 'delivery:assigned',
  DELIVERY_LOCATION_UPDATED: 'delivery:location_updated',
  DELIVERY_STATUS_CHANGED: 'delivery:status_changed',

  // Notification Events
  NOTIFICATION_RECEIVED: 'notification:received',

  // Room Subscription Commands
  JOIN_ORDER_ROOM: 'room:join_order',
  LEAVE_ORDER_ROOM: 'room:leave_order',
  JOIN_USER_ROOM: 'room:join_user',
  LEAVE_USER_ROOM: 'room:leave_user',
});

export default REALTIME_EVENTS;
