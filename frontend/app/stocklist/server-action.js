"use server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const apiCall = async (endpoint, method = "GET", body = null) => {
  try {
    const options = {
      method,
      headers: body ? { "Content-Type": "application/json" } : {},
      body: body ? JSON.stringify(body) : undefined,
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error (${res.status}): ${errorText}`);
    }
    
    return method === "GET" ? await res.json() : true;
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    return null;
  }
};

export const fetchStocklists = async (username) => {
  return apiCall(`/stocklist/view/all/${username}`);
};

// export const fetchIncomingFriendRequests = async (username) => {
//   return apiCall(`/friend/view/requests/in/${username}`);
// };

// export const fetchOutgoingFriendRequests = async (username) => {
//   return apiCall(`/friend/view/requests/out/${username}`);
// };

// export const sendFriendRequest = async (username, friend) => {
//   return apiCall(`/friend/sendrequest/${username}`, "POST", { friend });
// };

// export const acceptFriendRequest = async (username, friend) => {
//   return apiCall(`/friend/accept/${username}`, "POST", { friend });
// };

// export const rejectFriendRequest = async (username, friend) => {
//   return apiCall(`/friend/reject/${username}`, "POST", { friend });
// };

// export const removeFriend = async (username, friend) => {
//   return apiCall(`/friend/remove/${username}`, "POST", { friend });
// };