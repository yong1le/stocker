import React from 'react'
import { Card, CardTitle } from './ui/card';
import Link from 'next/link';

const StockHolding = ({symbol, shares, value}) => {
  return (
    <Link href={`/stock/${symbol}`}>
      <Card className="flex flex-row gap-2 items-start justify-between p-4">
        <CardTitle>{symbol}</CardTitle>
        <div className="flex flex-col gap-2">
          <p>Shares: {shares}</p>
          <p>Total value: {Number(value).toFixed(2)}</p>
        </div>
      </Card>
    </Link>
  );
}

export default StockHolding