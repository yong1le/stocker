"use server";

export const createStockRecord = async (
  date,
  symbol,
  open,
  high,
  low,
  close,
  volume
) => {
  try {
    const res = await fetch(`http://localhost:8080/stock/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        date,
        symbol,
        open,
        high,
        low,
        close,
        volume,
      }),
    });

    if (!res.ok || (await res.json()).success == false) {
      throw new Error(`Error creating stock record`);
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
