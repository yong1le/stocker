"use client";

import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";

const chartConfig = {
  time_stamp: {
    label: "Date",
    color: "#2563eb",
  },
  close: {
    label: "Price",
    color: "#60a5fa",
  },
};

const shortFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
});

const Stock = () => {
  const symbol = useParams().symbol;

  const [interval, setInterval] = useState(1825);
  const [chartData, setChartData] = useState([]);
  const [lastHistorialDate, setLastHistorialDate] = useState(null);
  const [statistic, setStatistic] = useState(null);

  const getData = async (symbol, interval) => {
    try {
      const pastRes = await fetch(
        `http://localhost:8080/stock/performance/past/${symbol}/${interval}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!pastRes.ok) {
        window.alert("Failed to fetch data");
        return [];
      }

      const futureRes = await fetch(
        `http://localhost:8080/stock/prediction/${symbol}/${interval / 2}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!futureRes.ok) {
        window.alert("Failed to fetch data");
        return [];
      }

      const pastData = (await pastRes.json()).map((e) => {
        return {
          time_stamp: shortFormat.format(e.time_stamp * 1000),
          close: Number(Number(e.close).toFixed(2)),
        };
      });
      const futureData = (await futureRes.json()).predictions.map((e) => {
        return {
          time_stamp: shortFormat.format(e.time_stamp * 1000),
          close: Number(Number(e.predictedValue).toFixed(2)),
        };
      });

      return {
        date: pastData[pastData.length - 1].time_stamp,
        data: [...pastData, ...futureData].sort(
          (a, b) => new Date(a.time_stamp) <= new Date(b.time_stamp)
        ),
      };
    } catch (e) {
      window.alert(e);
      return [];
    }
  };

  const getStatistics = async (symbol, interval) => {
    try {
      const res = await fetch(
        `http://localhost:8080/stock/statistic/${symbol}/${interval}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        return {};
      }

      return await res.json();
    } catch (e) {
      console.log(e);
      return {};
    }
  };

  useEffect(() => {
    getData(symbol, interval).then((data) => {
      setLastHistorialDate(data.date);
      setChartData(data.data);
    });

    getStatistics(symbol, interval).then((data) => {
      setStatistic(data);
    })
  }, [interval]);

  return (
    <div className="p-4 flex flex-col items-center w-full gap-6">
      <div className="mb-4">
        <h1 className="font-bold text-4xl">{symbol}</h1>
        {statistic && (
          <div>
            <p>Stock COV: {statistic.cov || "N/A"}</p>
            <p>Stock Beta: {statistic.beta || "N/A"}</p>
          </div>
        )}
      </div>
      <div className="flex flex-row gap-2 self-center">
        <Button onClick={() => setInterval(7)}>7 days</Button>
        <Button onClick={() => setInterval(30)}>1 months</Button>
        <Button onClick={() => setInterval(90)}>1 quarter</Button>
        <Button onClick={() => setInterval(365)}>1 year</Button>
        <Button onClick={() => setInterval(1825)}>5 years</Button>
      </div>
      <div className="w-4/5">
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
            {lastHistorialDate && (
              <ReferenceLine
                x={lastHistorialDate}
                stroke="#666"
                strokeDasharray="3 3"
                label={{ value: "Present", position: "top" }}
              />
            )}
          </AreaChart>
        </ChartContainer>
      </div>

     
    </div>
  );
};

export default Stock;
