const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

export const getProperties = async (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();

  const url = queryString
    ? `${API_URL}/properties?${queryString}`
    : `${API_URL}/properties`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch properties");
  }

  return data;
};

export const getPropertyById = async (id) => {
  const response = await fetch(`${API_URL}/properties/${id}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch property");
  }

  return data;
};

// Razorpay
export const createPaymentOrder = async (bookingId, token) => {
  const response = await fetch(
    `${API_URL}/payments/create-order/${bookingId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create payment order");
  }

  return data;
};

export const verifyPayment = async (paymentData, token) => {
  const response = await fetch(`${API_URL}/payments/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(paymentData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Payment verification failed");
  }

  return data;
};

export const getOwnerBookings = async (token) => {
  const response = await fetch(`${API_URL}/bookings/owner`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch owner bookings");
  }

  return data;
};

export const confirmBooking = async (bookingId, token) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/confirm`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to confirm booking");
  }

  return data;
};

export const rejectBooking = async (bookingId, reason, token) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reason,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to reject booking");
  }

  return data;
};

export const completeBooking = async (bookingId, token) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/complete`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to complete booking");
  }

  return data;
};

export const getOwnerProperties = async (token) => {
  const response = await fetch(`${API_URL}/properties?owner=me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch owner properties");
  }

  return data;
};

export const createProperty = async (propertyData, token) => {
  const response = await fetch(`${API_URL}/properties`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(propertyData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create property");
  }

  return data;
};

export const updateProperty = async (propertyId, propertyData, token) => {
  const response = await fetch(`${API_URL}/properties/${propertyId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(propertyData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update property");
  }

  return data;
};

export const deleteProperty = async (propertyId, token) => {
  const response = await fetch(`${API_URL}/properties/${propertyId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete property");
  }

  return data;
};


export const getAdminStats = async (token) => {
  const response = await fetch(
    `${API_URL}/admin/stats`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch admin statistics"
    );
  }

  return data;
};

// ----------------------------------------
// Admin - Get Pending Properties
// ----------------------------------------

export const getPendingProperties = async (
  token
) => {
  const response = await fetch(
    `${API_URL}/admin/properties/pending`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch pending properties"
    );
  }

  return data;
};

// ----------------------------------------
// Admin - Approve Property
// ----------------------------------------

export const approveProperty = async (
  propertyId,
  token
) => {
  const response = await fetch(
    `${API_URL}/admin/properties/${propertyId}/approve`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to approve property"
    );
  }

  return data;
};

// ----------------------------------------
// Admin - Reject Property
// ----------------------------------------

export const rejectProperty = async (
  propertyId,
  reason,
  token
) => {
  const response = await fetch(
    `${API_URL}/admin/properties/${propertyId}/reject`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reason,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to reject property"
    );
  }

  return data;
};

// ----------------------------------------
// Admin - Get All Users
// ----------------------------------------

export const getAllUsers = async (
  token
) => {
  const response = await fetch(
    `${API_URL}/admin/users`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch users"
    );
  }

  return data;
};

// ----------------------------------------
// Admin - Update User Role
// ----------------------------------------

export const updateUserRole = async (
  userId,
  role,
  token
) => {
  const response = await fetch(
    `${API_URL}/admin/users/${userId}/role`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        role,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update user role"
    );
  }

  return data;
};

// ----------------------------------------
// Admin - Get All Bookings
// ----------------------------------------

export const getAdminBookings = async (
  token
) => {
  const response = await fetch(
    `${API_URL}/bookings/admin`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch admin bookings"
    );
  }

  return data;
};

export const getOwnerPropertyById = async (
  propertyId,
  token
) => {
  const response = await fetch(
    `${API_URL}/properties/owner/${propertyId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch owner property"
    );
  }

  return data;
};

export const getMyProfile = async (token) => {
  const response = await fetch(
    `${API_URL}/users/profile`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to fetch profile"
    );
  }

  return data;
};


export const updateMyProfile = async (
  profileData,
  token
) => {
  const response = await fetch(
    `${API_URL}/users/profile`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to update profile"
    );
  }

  return data;
};