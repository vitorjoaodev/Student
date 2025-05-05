import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client', 'index.html'));
  });
}

if (process.env.NODE_ENV === 'development') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;