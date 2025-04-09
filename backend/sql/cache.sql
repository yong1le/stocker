CREATE MATERIALIZED VIEW StockPrices AS
(
      SELECT symbol, close FROM (
        Stockdata s1 NATURAL JOIN (
          SELECT s2.symbol, MAX(s2.time_stamp) as time_stamp
          FROM Stockdata s2
          GROUP BY symbol 
        )
      )
);

CREATE TABLE StockCorrelation (
  s1 TEXT NOT NULL REFERENCES Stock(symbol),
  s2 TEXT NOT NULL REFERENCES Stock(symbol),
  interval_value INTERVAL NOT NULL,
  corr  DOUBLE PRECISION,

  PRIMARY KEY (s1, s2, interval_value)
);