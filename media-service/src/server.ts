import app from './app';

const PORT = process.env.PORT!;

app.listen(PORT, () => {
  console.log(
    `🚀 Media service started! Listening on http://localhost:${PORT}`
  );
});
