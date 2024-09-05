import app from "./app";
import { connectionDB } from "./database/connection";
import config from "./config";
// Start the server
const startSever = async () => {
  await connectionDB();

  app.listen(`${config.PORT}`, () => {
    console.log(`Server is running on port 4001`);
  });
};
startSever();
