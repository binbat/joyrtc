import { startServer } from './src/server.js';
import { startBrowser} from './src/browser.js';

const port = Number.parseInt(process.env.PORT) || 7778;

startServer(port);
startBrowser(port);
