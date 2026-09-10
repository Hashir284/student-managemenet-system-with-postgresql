import express from "express"
import "dotenv/config"
import db from "./Config/db.js"
import cors from "cors"
import path from "path"

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/students', (req, res) => {
  db.query('SELECT * FROM students', (err, result) => {
    if (err) {
      console.error("Error fetching students:", err)
      return res.status(500).send({ error: err, message: "Failed to fetch students" })
    }
    res.status(200).send(result.rows)
  })
})

app.get('/api/students/:id', (req, res) => {
  const { id } = req.params

  db.query('SELECT * FROM students WHERE id=$1', [id], (err, result) => {
    if (err) {
      console.error("Error fetching student:", err)
      return res.status(500).send({ error: err, message: "Failed to fetch student" })
    }
    if (result.rows.length === 0) {
      return res.status(404).send({ error: "Student not found" })
    }
    res.status(200).send(result.rows[0])
  })
})

app.post("/api/students", (req, res) => {
  const { name, batch, course, email, rollnumber } = req.body
    if(!name || !batch || !course || !email || !rollnumber) {
    return res.status(400).send({ error: "All fields are required" })
  }
  db.query(
    "INSERT INTO students (name, batch, course, email, rollnumber) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [name, batch, course, email, rollnumber],
    (err, result) => {
      if (err) {
        console.error("Error inserting student:", err)
        return res.status(500).send({ error:err, message: "Failed to insert student" })
      }
      else res.status(201).send(result.rows[0])
    }
  )
})

app.put("/api/students/:id", (req, res) => {
  const { id } = req.params
  const { name, batch, course, email, rollnumber } = req.body

  db.query(
    `UPDATE students SET name=$1, batch=$2, course=$3, email=$4, rollnumber=$5 WHERE id=$6 RETURNING *`,
    [name, batch, course, email, rollnumber, id],
    (err, result) => {
      if (err) {
        console.error("Error updating student:", err)
        return res.status(500).send({ error: err, message: "Failed to update student" })
      }
      res.status(200).send(result.rows[0])
    }
  )
})

app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params

  db.query(`DELETE FROM students WHERE id=$1 RETURNING *`, [id], (err, result) => {
    if (err) {
      console.error("Error deleting student:", err)
      return res.status(500).send({ error: err, message: "Failed to delete student" })
    }
    res.status(200).send('Deleted successfully')
  })
})

// const __dirname = path.resolve();//D:\shariq\saylani-batch-18\react-with-server\ecom-without-db
// const __frontend = path.join(__dirname, './web/dist')//D:\shariq\saylani-batch-18\react-with-server\ecom-without-db\web\.next
// app.use('/', express.static(__frontend))
// app.use("/*splat", express.static(__frontend))

const PORT = 4000

// app.listen(PORT, () => {
//     console.log(`App is Running On Port ${PORT}`)
// })

export default app