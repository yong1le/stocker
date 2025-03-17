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

## Documentation
- [Express Documentation](https://expressjs.com/) 
- [Postgres Driver for Node.JS](https://node-postgres.com/guides/project-structure)