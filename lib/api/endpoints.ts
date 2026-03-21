export const API_ROUTES = {
  auth: {
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    getCurrentUser: "/auth/me",
  },
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
    confirmPayment: (id: string) => `/admin/payments/${id}/confirm`, // payload is note: string
    rejectPayment: (id: string) => `/admin/payments/${id}/reject`, // payload is note: string
  },
  notification: {
    notificationStat: "/admin/notifications/stats",
    getAllNotifications: "/admin/notifications",
    markAllNotAsRead: `/admin/notifications/mark-all-read`, //patch
    markSingleAsRead: (id: string) => `/admin/notifications/${id}/read`, //patch
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
    getAllOrders: "/orders/admin/all",
    getOrderById: (id: string) => `/orders/${id}`,
    updateOrderStatus: (id: string) => `/orders/${id}/status`,
    deleteOrder: (id: string) => `/orders/${id}`, // super-admin
    updateOrderPriority: (id: string) => `/orders/${id}/priority`,
    updateBulkOrderStatus: "/orders/bulk/status",
    updateOrderTag: (id: string) => `/orders/${id}/tags`,
    addNote: (id: string) => `/orders/${id}/notes`, // content: string, isInternal: boolean
    getAdminNoteForOrder: (id: string) => `/orders/${id}/notes`,
    softDeleteOrder: (id: string) => `/orders/${id}/soft`,
    getOrderCountGroupedByStatus: "/orders/stata/status-count",
    getOrderStatReveue: "/orders/stats/revenue",
  },
  profile: {
    getCurrentProfile: "/profile",
    getAllProfiles: "/profile",
    deleteAProfile: (id: string) => `/profile/${id}`,
  },
};
