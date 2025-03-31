"use server";
import { cookies } from "next/headers";

export const loginUser = async (username, password) => {
  try {
    const res = await fetch("http://localhost:8080/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok || (await res.json()).success == false)
      throw new Error("Login Failed");

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const registerUser = async (username, password, fname, lname) => {
  "use server";

  try {
    const res = await fetch("http://localhost:8080/user/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, fname, lname }),
    });

    if (!res.ok || (await res.json()).success == false)
      throw new Error("Registration Failed");

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const getUserServer = async () => {
  const cookieStore = await cookies();
  return cookieStore.get("user")?.value;
};

export const logoutUser = async () => {
  cookies().delete("user");
};