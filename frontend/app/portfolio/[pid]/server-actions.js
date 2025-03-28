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

export const depositPortfolio = async (amount, username, pid1, pid2) => {
  let url = `http://localhost:8080/portfolio/deposit/${username}/${pid1}`;
  if (pid2 !== "bank") {
    url = url + `/${pid2}`;
  }

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    if (!res.ok || (await res.json()).success == false)
      throw new Error("Failed to deposit");

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const withdrawalPortfolio = async (amount, username, pid) => {
  let url = `http://localhost:8080/portfolio/withdraw/${username}/${pid}`;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    if (!res.ok || (await res.json()).success == false)
      throw new Error("Failed to withdraw");

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};
