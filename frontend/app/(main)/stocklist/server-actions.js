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
    
    return await res.json() ;
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    return null;
  }
};

export const fetchStocklists = async (username) => {
  return apiCall(`/stocklist/view/all/${username}`);
};

export const addStock = async (username, slid, symbol, shares) => {
  return apiCall(`/stocklist/add`,"POST", {username, slid, symbol, shares})
};

export const friendList = async (username) => {
  return apiCall(`/friend/view/all/${username}`);
};

export const shareStocklist = async (username, friend, slid) => {
  return apiCall(`/stocklist/share/${slid}`, "POST", {username, friend});
};

export const newStocklist = async (username, sname) => {
  return apiCall(`/stocklist/create/`, "POST", {username, sname});
};

export const createReview = async (username, content, slid) => {
  return apiCall(`/stocklist/create/review/${slid}`, "POST", {username, content});
};

export const viewAllReviews = async (slid) => {
  return apiCall(`/stocklist/reviews/view/all/${slid}`);
};

export const removeStocklist = async (slid, username) => {
  console.log(username, slid );
  return apiCall(`/stocklist/remove/${slid}`, "DELETE", {username});
};