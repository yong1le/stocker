"use client";

import ReactMatrixTable from "@paraboly/react-matrix-table";
import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronsDown,
  ChevronsUpDown,
  ChevronUp,
} from "lucide-react";

const CorrelationMatrix = ({ username, pid, type }) => {
  const [chartData, setChartData] = useState(null);
  const [interval, setInterval] = useState(365);
  const [isOpen, setIsOpen] = useState(false);

  const getStatistics = async (username, pid, interval) => {
    try {
      const res = await fetch(
        `http://localhost:8080/folder/statistic/${username}/${pid}/${interval}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        return null;
      }

      return await res.json();
    } catch (e) {
      console.log(e);
      return null;
    }
  };

  useEffect(() => {
    getStatistics(username, pid, interval).then((data) => {
      if (!data) return;
      setChartData({
        rows: data.symbols,
        columns: data.symbols,
        data: data.correlations,
      });
    });
  }, [interval]);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2"
    >
      <div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <h4 className="text-sm font-semibold">
              {type} Statistics
              </h4>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent >
        {chartData &&
        chartData.rows &&
        chartData.columns &&
        chartData.columns ? (
          <div className="px-4 flex flex-row gap-2 pb-6">
            <ReactMatrixTable
              rows={chartData.rows}
              columns={chartData.columns}
              data={chartData.data}
            />
            <div className="flex flex-col gap-2">
              <Button onClick={() => setInterval(7)}>7 days</Button>
              <Button onClick={() => setInterval(30)}>1 months</Button>
              <Button onClick={() => setInterval(90)}>1 quarter</Button>
              <Button onClick={() => setInterval(365)}>1 year</Button>
              <Button onClick={() => setInterval(1825)}>5 years</Button>
            </div>
          </div>
        ) : (
          <div>Please buy some stocks first</div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default CorrelationMatrix;
