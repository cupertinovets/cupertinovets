import multer from 'multer'
import fs from 'fs'
import xlsx from 'xlsx'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express';
import cors from 'cors';
import pg from 'pg';
import csv from 'csv-parser'
import fetch from 'node-fetch'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const port = 3000
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const upload = multer({ dest: 'uploads/' })
const app = express()


app.post('/upload', upload.single('file'), async (req, res) => {
  const filePath = req.file.path
  const ext = path.extname(req.file.originalname)
  let rows = []
  
  try {
    if (ext === '.csv') {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject)
      })
      
    } else if (ext === '.xlsx') {
      const workbook = xlsx.readFile(filePath)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      rows = xlsx.utils.sheet_to_json(sheet)
    } else {
      return res.status(400).json({ error: 'Unsupported file type. Use .csv or .xlsx' })
    }
    
    const columns = Object.keys(rows[0])
    if (columns.length === 0) {
      return res.status(400).json({ error: 'No columns found in file.' })
    }
    
    const client = await pool.connect()
    await client.query('DROP TABLE IF EXISTS sample_data')
    
    const columnDefs = columns.map(col => `"${col}" TEXT`).join(', ')
    await client.query(`CREATE TABLE sample_data (${columnDefs})`)
    
    const preview = rows.slice(0, 3)
    
    for (const row of rows) {
      const colNames = Object.keys(row)
      const values = Object.values(row)
      const placeholders = values.map((_, i) => `$${i + 1}`)
      
      await client.query(
        `INSERT INTO sample_data (${colNames.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders.join(', ')})`,
        values
      )
    }
    
    client.release()
    fs.unlinkSync(filePath)
    
    res.json({
      status: 'ok',
      message: `Imported ${rows.length} row(s)`,
      preview
    })
    
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Upload failed' })
  }
})

app.post('/upload-custom', upload.single('file'), async (req, res) => {
  const filePath = req.file.path
  const ext = path.extname(req.file.originalname)
  let rows = []
  
  try {
    if (ext === '.csv') {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject)
      })
    } else if (ext === '.xlsx') {
      const workbook = xlsx.readFile(filePath)
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      rows = xlsx.utils.sheet_to_json(sheet)
    } else {
      return res.status(400).json({ error: 'Only CSV or XLSX supported' })
    }
    
    const columns = Object.keys(rows[0])
    if (columns.length === 0) return res.status(400).json({ error: 'No columns found' })
      
      const client = await pool.connect()
      await client.query('DROP TABLE IF EXISTS custom_upload')
      
      const columnDefs = columns.map(col => `"${col}" TEXT`).join(', ')
      await client.query(`CREATE TABLE custom_upload (${columnDefs})`)
      
      for (const row of rows) {
        const colNames = Object.keys(row)
        const values = Object.values(row)
        const placeholders = values.map((_, i) => `$${i + 1}`)
        await client.query(
          `INSERT INTO custom_upload (${colNames.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders.join(', ')})`,
          values
        )
      }
      
      client.release()
      fs.unlinkSync(filePath)
      
      res.json({
        status: 'ok',
        message: `Imported ${rows.length} row(s) into custom_upload`,
        preview: rows.slice(0, 3)
      })
      
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Upload failed' })
    }
  })
  
  app.post('/ml-result', upload.single('file'), async (req, res) => {
    const filePath = req.file.path
    const ext = path.extname(req.file.originalname)
    let rows = []
    
    if (ext !== '.csv') {
      fs.unlinkSync(filePath)
      return res.status(400).json({ error: 'Only .csv allowed for ML result' })
    }
    
    try {
      await new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject)
      })
      
      if (rows.length === 0) {
        fs.unlinkSync(filePath)
        return res.status(400).json({ error: 'Empty or invalid CSV file' })
      }
      
      const columns = Object.keys(rows[0]).filter(c => c && c.trim() !== '');
      if (columns.length === 0) {
        fs.unlinkSync(filePath)
        return res.status(400).json({ error: 'CSV file has no columns' })
      }
      
      const client = await pool.connect()
      await client.query('DROP TABLE IF EXISTS ml_result')
      await client.query(
        `CREATE TABLE ml_result (${columns.map(c => `"${c}" TEXT`).join(', ')})`
      )
      
      for (const row of rows) {
        const colNames = Object.keys(row).filter(c => c && c.trim() !== '');
        const values = colNames.map(key => row[key]);
        const placeholders = values.map((_, i) => `$${i + 1}`);
        await client.query(
          `INSERT INTO ml_result (${colNames.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders.join(', ')})`,
          values
        )
      }
      
      client.release()
      fs.unlinkSync(filePath)
      
      res.json({ status: 'ok', inserted: rows.length })
      
    } catch (err) {
      console.error('ML Result Upload Error:', err)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
      res.status(500).json({ error: err.message })
    }
  })
  
  app.use(cors())
  app.use(express.json())
  
  const pool = new pg.Pool({
    user: 'root',
    host: 'localhost',
    database: 'ai_data',
    password: 'root',
    port: 5432,
  })
  
  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      location TEXT
      )
      `).then(() => console.log("✅ Users table ready"))
      .catch(console.error);
      
      app.post('/auth/register', async (req, res) => {
      try {
        const { email, password, location } = req.body;
        if (!email || !password) {
          return res.status(400).json({ error: 'Missing email or password' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
          'INSERT INTO users (email, password, location) VALUES ($1, $2, $3) RETURNING id, email, location',
          [email, hashedPassword, location || null]
        );

        const token = jwt.sign({ id: result.rows[0].id, email: result.rows[0].email }, 'secret123');

        res.json({ token });
      } catch (err) {
        console.error("❌ Register crash:", err);
        res.status(500).json({ error: 'Server error' });
      }
    });
      
      app.post('/auth/login', async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });
        
        try {
          const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
          const user = result.rows[0];
          if (!user) return res.status(401).json({ error: 'Invalid credentials' });
          
          const match = await bcrypt.compare(password, user.password);
          if (!match) return res.status(401).json({ error: 'Invalid credentials' });
          
          const token = jwt.sign({ id: user.id, email: user.email }, 'secret123'); // You can use env here
          res.json({ token });
        } catch (err) {
          console.error('Login error:', err);
          res.status(500).json({ error: 'Login failed' });
        }
      });
      
      function authenticate(req, res, next) {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'Missing token' });
        
        const token = authHeader.split(' ')[1];
        try {
          const decoded = jwt.verify(token, 'secret123'); // Use env here
          req.user = decoded;
          next();
        } catch (err) {
          res.status(401).json({ error: 'Invalid token' });
        }
      }
      
      app.get('/me', authenticate, async (req, res) => {
        const result = await pool.query('SELECT id, email, location FROM users WHERE id = $1', [req.user.id]);
        res.json({ user: result.rows[0] });
      });
      
      app.get('/ml-result', async (req, res) => {
        try {
          const result = await pool.query('SELECT * FROM ml_result LIMIT 500')
          res.json(result.rows)
        } catch (err) {
          res.status(500).json({ error: err.message })
        }
      })
      
      app.get('/data', async (req, res) => {
        try {
          const [sampleData, customUpload] = await Promise.all([
            pool.query('SELECT * FROM sample_data'),
            pool.query('SELECT * FROM custom_upload')
          ])
          
          return res.json({
            sample_data: sampleData.rows,
            custom_upload: customUpload.rows
          })
        } catch (err) {
          console.error(err)
          res.status(500).json({ error: 'Internal server error' })
        }
      })
      
      app.get('/geocode', async (req, res) => {
        const { address } = req.query;
        console.log('🔍 Received geocode request for:', address);
        if (!address) return res.status(400).json({ error: 'Missing address' });
        
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`, {
            headers: {
              'User-Agent': 'cupertinovets-map/1.0 (your@email.com)',
            },
          });
          
          const data = await response.json();
          if (!data.length) return res.status(404).json({ error: 'No result' });
          
          const loc = {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          };
          
          res.json(loc);
        } catch (err) {
          console.error('Geocoding proxy error:', err);
          res.status(500).json({ error: 'Geocoding failed' });
        }
      });
      
      app.post('/result', (req, res) => {
        const { id, prediction } = req.body
        console.log(`📩 Received result: ID ${id} → ${prediction}`)
        res.json({ status: 'ok' })
      })
      app.use(express.static('public'))
      
      app.listen(port, () => {
        console.log(`🚀 Express API running at http://0.0.0.0:${port}`)
})