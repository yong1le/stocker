import React from "react";
import { getUserServer } from "@/lib/auth-server";
import { redirect } from "next/navigation";

const PortfolioView = async ({ params }) => {
  const pid = (await params).pid;
  const user = await getUserServer();
  if (!user) redirect("/login");

  const getPortfolioInfo = async (username, pid) => {
    const res = await fetch(
      `http://localhost:8080/portfolio/view/one/${username}/${pid}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      window.alert(`Failed to get portfolio ${pid}`);
      return null;
    }

    const json = await res.json();
    if (Object.keys(json).length === 0) return null;
    return json;
  };

  const portfolio = await getPortfolioInfo(user, pid);
  console.log(portfolio);

  return (
    <div>
      {(portfolio !== null) && (
        <div>
          <h1>
            {portfolio.name} - ${portfolio.value}
          </h1>
          <p>Cash: ${portfolio.amount}</p>
          <div className="flex flex-col gap-2">
            {portfolio.stocks && portfolio.stocks.map((e, i) => (
              <span className="flex flex-row gap-2" key={i}>
                <p>{e.symbol}</p>
                <p>{e.share}</p>
                <p>{e.value}</p>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioView;
