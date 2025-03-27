import Cookies from "js-cookie";

export const getUser = () => {
  return Cookies.get("user");
};

export const setUser = (username) => {
  Cookies.set("user", username, { expires: 30 }); // 30 days
};

export const removeUser = () => {
  Cookies.remove("user");
};
