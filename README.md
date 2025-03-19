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