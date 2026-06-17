import app from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`BookFlow API running on port ${config.port} [${config.nodeEnv}]`);
  if (config.nodeEnv === 'production') {
    console.log(`CORS allowed origin: ${config.frontendUrl}`);
  }
});
