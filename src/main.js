import 'dotenv/config';
import { web } from './application/web.js';
import { logger } from './application/logging.js';

web.listen(process.env.PORT, () => {
    logger.info(`App start on port ${process.env.PORT}`);
});
