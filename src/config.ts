import dotenv from "dotenv"
import path from "path"

dotenv.config({ path: path.join(__dirname, "../.env") })

const config = {
    PORT: process.env.PORT,
    MONGODB_URL: process.env.MONGODB_URL
}
export default config