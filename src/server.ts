import App from "./app";

const app = new App();

app.start();

process.on("SIGTERM", async () => {
  console.log("SIGTERM signal received: closing HTTP server");
  await app.stop();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT signal received: closing HTTP server");
  await app.stop();
  process.exit(0);
});
