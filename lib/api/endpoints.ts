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
    updateUser: (id: string) => `/admin/users/${id}`,
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
    confirmPayment: (id: string) => `/admin/orders/${id}/confirm-payment`, // payload is { status: "COMPLETED", note: string }
    confirmSinglePayment: (id: string) => `/admin/payments/${id}/confirm`, // payload is note: string
    rejectPayment: (id: string) => `/admin/payments/${id}/reject`, // payload is note: string
    notifySeller: (id: string) => `/admin/payments/${id}/notify-seller`,
  },
  notification: {
    notificationStat: "/admin/notifications/stats",
    getAllNotifications: "/admin/notifications",
    markAllNotAsRead: `/admin/notifications/mark-all-read`, //patch
    markSingleAsRead: (id: string) => `/admin/notifications/${id}/read`, //patch
  },
  sellers: {
    getASellerApplication: "/sellers/applications",
    verifySeller: (id: string) => `/sellers/applications/${id}/verify`, //patch, payload includes approve: true
    rejectSeller: (id: string) => `/sellers/applications/${id}/verify`, //patch, payload includes approve: false
  },
  sellerVehicles: {
    getAllSellerVehicles: "/seller-vehicles",
    createSellerVehicle: "/seller-vehicles/submit",
    getSellerVehicleById: (id: string) => `/seller-vehicles/${id}`,
    deleteSellerVehicleById: (id: string) => `/seller-vehicles/${id}`,
    updateSellerVehicleById: (id: string) => `/seller-vehicles/${id}/status`,
  },
  vehicleDefinitions: {
    getTrendingVehicles: "/vehicles/trending-definitions",
    createTrendingVehicle: "/vehicles/trending-definitions",
    updateTrendingVehicle: (id: string) =>
      `/vehicles/trending-definitions/${id}`,
    deleteTrendingVehicle: (id: string) =>
      `/vehicles/trending-definitions/${id}`,
    getRecommendedVehicles: "/vehicles/recommended-definitions",
    createRecommendedVehicle: "/vehicles/recommended-definitions",
    updateRecommendedVehicle: (id: string) =>
      `/vehicles/recommended-definitions/${id}`,
    deleteRecommendedVehicle: (id: string) =>
      `/vehicles/recommended-definitions/${id}`,
  },
  vehicleCategories: {
    getVehicleCategories: "/vehicles/admin/categories",
    createVehicleCategory: "/vehicles/admin/categories",
    updateVehicleCategory: (id: string) => `/vehicles/admin/categories/${id}`,
    deleteVehicleCategory: (id: string) => `/vehicles/admin/categories/${id}`,
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
    cancelOrder: (id: string) => `/orders/${id}/cancel`,
    deleteOrder: (id: string) => `/orders/${id}`, // super-admin
    updateOrderPriority: (id: string) => `/orders/${id}/priority`,
    updateBulkOrderStatus: "/orders/bulk/status",
    updateOrderTag: (id: string) => `/orders/${id}/tags`,
    addOrderNote: (id: string) => `/orders/${id}/notes`,
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
