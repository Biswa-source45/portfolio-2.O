import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const UPLOAD_DIR = path.resolve(here, '../../uploads');
export const CLIENT_DIST = path.resolve(here, '../../../client/dist');
