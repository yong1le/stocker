"use client";

import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts";

const chartConfig = {
  time_stamp: {
    label: "Date",
    color: "#2563eb",
  },
  close: {
    label: "Price",
    color: "#60a5fa",
  },
  future: {
    label: "Future",
    color: "#ff0000",
  },
};

const shortFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
});

const Stock = () => {
  const symbol = useParams().symbol;

  const [interval, setInterval] = useState(3650);
  const [pastData, setPastData] = useState([]);
  const [futurePerformance, setFuturePerformance] = useState([]);
  const [chartData, setChartData] = useState([]);

  const getPastData = async (symbol, interval) => {
    const res = await fetch(
      `http://localhost:8080/stock/performance/past/${symbol}/${interval}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      window.alert("Failed to fetch data");
      return [];
    }

    return await res.json();
  };

  const getFutureData = async (symbol) => {
    const res = await fetch(
      `http://localhost:8080/stock/prediction/${symbol}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      window.alert("Failed to fetch data");
      return [];
    }

    return (await res.json()).predictions;
  };

  useEffect(() => {
    getFutureData(symbol).then((data) => {
      setFuturePerformance(
        data.map((e) => {
          return {
            time_stamp: e.time_stamp * 1000,
            future: Number(e.predictedValue).toFixed(2),
          };
        })
      );
    });
  }, []);

  useEffect(() => {
    getPastData(symbol, interval).then((data) => {
      setPastData(data);
    });
  }, [interval]);

  useEffect(() => {
    setChartData(
      [...pastData, ...futurePerformance].sort(
        (a, b) => a.time_stamp <= b.time_stamp
      )
    );
  }, [pastData, futurePerformance])

  return (
    <div className="p-4">
      <h1 className="font-bold text-4xl">{symbol}</h1>
      {(
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time_stamp"
              tickLine={false}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => {
                console.log(value, shortFormat.format(new Date(value)));
                return shortFormat.format(new Date(value));
              }}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              dataKey="close"
              type="natural"
              fill="var(--color-close)"
              fillOpacity={0.4}
              stroke="var(--color-close)"
              connectNulls
            />
            <Area
              dataKey="future"
              type="natural"
              fill="var(--color-future)"
              fillOpacity={0.4}
              stroke="var(--color-future)"
              connectNulls
            />
          </AreaChart>
        </ChartContainer>
      )}
      <div className="flex flex-row gap-2">
        <Button onClick={() => setInterval(7)}>7 days</Button>
        <Button onClick={() => setInterval(30)}>1 months</Button>
        <Button onClick={() => setInterval(90)}>1 quarter</Button>
        <Button onClick={() => setInterval(365)}>1 year</Button>
        <Button onClick={() => setInterval(1825)}>5 years</Button>
        <Button onClick={() => setInterval(3650)}>10 years</Button>
      </div>
    </div>
  );
};

export default Stock;
