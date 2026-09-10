import { Pool } from 'pg'; //postgres

const db = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT),
    ssl: {
        rejectUnauthorized: false
    }
})

export default db