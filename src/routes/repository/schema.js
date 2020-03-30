import express from 'express';
import asyncHandler from 'express-async-handler';
import * as schema from '@controllers/repository/schema';

const router = express.Router();
const controllers = [
    { url: '/create', func: schema.createSchema },
    { url: '/update', func: schema.updateSchema },
    { url: '/delete', func: schema.deleteSchema },
    { url: '/get', func: schema.getSchema },
    { url: '/list', func: schema.listSchemas }
];

controllers.map((config) => {
    router.post(config.url, asyncHandler(async (req, res, next) => {
        res.json(await config.func(req.body));
    }));
});

export default router;
