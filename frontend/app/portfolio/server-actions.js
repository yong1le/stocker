"use server";

export const createPortfolio = async (username, pname) => {
  try {
    const res = await fetch(`http://localhost:8080/portfolio/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({username, pname})
    });

    if (!res.ok || (await res.json()).pid == -1) {
      throw new Error(`Error creating portfolio`);
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
