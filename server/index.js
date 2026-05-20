const fs = require('fs');
const path = require('path');
const app = require('./app');

const PORT = process.env.PORT || 3001;
const dist = path.join(__dirname, '..', 'client', 'dist');

app.listen(PORT, () => {
  console.log(`Study app server: http://localhost:${PORT}`);
  if (!fs.existsSync(dist)) {
    console.log('(frontend not built yet - run `npm run build`, or use `npm run dev`)');
  }
});
