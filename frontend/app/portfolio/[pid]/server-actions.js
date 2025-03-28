"use server";
export const buyStock = async (symbol, shares, username, pid) => {
  try {
    const res = await fetch(`http://localhost:8080/portfolio/buy`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, pid, symbol, shares }),
    });

    if (!res.ok || (await res.json()).success == false)
      throw new Error("Failed to buy stocks");

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
