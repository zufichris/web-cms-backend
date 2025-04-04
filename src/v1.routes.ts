import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();
router.get('/v1', (req: Request, res: Response) => {
    res.status(200).send("API V1");
});
export const routesV1 = router;