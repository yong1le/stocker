# CSCC43 Project

## Setup
The backend needs to connect the data, create a `backend/.env` file and add
the following information (use the gcp credentials for prod):
```bash
PGUSER=postgres
PGPASSWORD=password
PGHOST=localhost
PGPORT=9999
PGDATABASE=postgres
```

```bash
cd backend
docker compose up -d
cd ..
psql -h localhost -p 9999 -U postgres
```
Then in the `psql` prompt
```sql
\i ./backend/sql/schema.sql;

\copy Stock(symbol) FROM './backend/stock.csv' DELIMITER ','
CSV HEADER;

\copy Stockdata(time_stamp, open, high,
low, close, volume, symbol) FROM './backend/SP500History.csv' DELIMITER ','
CSV HEADER;

\i ./backend/sql/cache.sql;

```

## Structure
```bash
backend/
  db/             # code for accessing db
    index.js
  routes/         # route endpoints

  sql/            # sql files
    schema.js
  index.js
```

## Endpoints
- register(username, password, fname, lname)
- login(username, password)

- createportfolio(username, foldername)
- viewallportfolios(username)
- viewoneportfolio(username, pid)
- withdraw(username, pid, amount)
- buystock(username, id, symbol, shares)
- portfoliomarketvalue(username, pid)
- pastperformance(symbol, interval)

- createstocklist(username, foldername)
- viewallstocklist(username)
- viewonestocklist(username, slid)
- statusstocklist(slid, status)

- sendrequeset(uid1, uid2)
- acceptrequest(uid2, uid1)
- rejectrequest(uid2, uid1)
- sharestocklist(uid1,uid2, slid)
- createreviewstocklist(uid1, slid, content)
- updatereviewstocklist(uid1, slid, content)

## Documentation
- [Express Documentation](https://expressjs.com/) 
- [Postgres Driver for Node.JS](https://node-postgres.com/guides/project-structure)