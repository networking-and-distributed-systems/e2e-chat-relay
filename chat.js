var options = {
    key: fs.readFileSync(path.join(__dirname,'key.pem')),
    cert: fs.readFileSync(path.join(__dirname,'cert.pem'))
  };
  