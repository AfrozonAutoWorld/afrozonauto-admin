export const API_ROUTES = {
  stats: {
    platformStat: "/admin/dashboard/stats",
    pendingOrder: "/admin/dashboard/pending-orders",
    recentActivity: "/admin/dashboard/recent-activity",
  },
  users: {
    getAllUsers: "/admin/users",
    getUserById: (id: string) => `/admin/users/${id}`,
    createAUser: "/admin/users/create",
    deactivateUser: (id: string) => `/admin/users/${id}`,
    createUserLegacy: "/users/admincreate",
  },
  payments: {
    paymentStat: "/admin/payments/stats",
    getAllPayments: "/admin/payments",
    getPaymentById: (id: string) => `/admin/payments/${id}`,
    getPaymentByOrderId: (orderId: string) =>
      `/admin/payments/order/${orderId}`,
    initiateRefund: (paymentId: string) =>
      `/admin/payments/${paymentId}/refund`,
  },
  notification: {
    notificationStat: "/admin/notifications/stats",
    getAllPayments: "/admin/notifications",
    getAllNotifications: "/admin/notifications",
    getNotificationById: (id: string) => `/admin/notifications/${id}`,
    markAllNotAsRead: `/admin/notifications/mark-all-read`, //patch
    markSingleNotAsRead: (id: string) => `/admin/notifications/${id}/read`, //patch
  },
  sellers: {
    getASellerApplication: "/sellers/application",
  },
  sellerVehicles: {
    getAllSellerVehicles: "/seller-vehicles",
    createSellerVehicle: "/seller-vehicles/submit",
    getSellerVehicleById: (id: string) => `/seller-vehicles/${id}`,
    deleteSellerVehicleById: (id: string) => `/seller-vehicles/${id}`,
    updateSellerVehicleById: (id: string) => `/seller-vehicles/${id}/status`,
  },
  testimonials: {
    approveTestimonial: "/testimonial", //patch
    getTestimonialById: (id: string) => `/testimonial/${id}`,
  },
  sourceRequest: {
    getAllSourceReq: "/sourcing-requests",
    sourceReqById: (id: string) => `/sourcing-requests/${id}`,
  },
  orders: {
    getAllOrders: "/admin/orders",
    getOrderById: (id: string) => `/admin/orders/${id}`,
    updateOrderStatus: (id: string) => `/orders/${id}/status`,
    deleteOrder: (id: string) => `/orders/${id}`,
    addOrderNote: (id: string) => `/admin/orders/${id}/notes`,
    cancelOrder: (id: string) => `/admin/orders/${id}/cancel`,
  },
  profile: {
    getAllProfiles: "/profile",
    deleteAProfile: (id: string) => `/profile/${id}`,
  },
};
