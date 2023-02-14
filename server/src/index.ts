import { readFileSync } from 'fs'
import {createServer} from 'http'
import express from 'express'
import {WebSocket, WebSocketServer} from 'ws'
import * as PinoLogger from 'pino';
import { serverConfig } from './config/server.config.js';
import {handleAuth} from './handlers/auth.handler.js'

import {dirname, join} from 'path'
import { fileURLToPath, parse } from 'url';
import { connectToDatabase } from './services/database.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * register logger for development env...
 */
const logger = PinoLogger.pino();
global.logger = logger;


connectToDatabase().then(() => {
    const app = express();
    // const httpsServer = createServer({
    //     cert: readFileSync(join(__dirname, '..', 'cert.pem')),
    //     key: readFileSync(join(__dirname, '..', 'key.pem'))
    // }, app);
    const httpsServer = createServer(app);

    app.get('/', (req, res) => {
        res.send('websocket service')
    })

    const nonSecureWss = new WebSocketServer({ noServer: true });
    const wss = new WebSocketServer({ noServer: true });

    httpsServer.on('upgrade', function upgrade(request, socket, head) {
        const { pathname } = parse(request.url);

        if (pathname === '/auth') {
            nonSecureWss.handleUpgrade(request, socket, head, function done(ws) {
                nonSecureWss.emit('connection', ws, request);

                ws.on('message', (data) => handleAuth(wss, ws, data))

            });
        } else if (pathname === '/') {
            wss.handleUpgrade(request, socket, head, function done(ws) {
                console.log(request.headers)
                console.log(wss.clients)
                wss.emit('connection', ws, request);
            });
        } else {
            socket.destroy();
        }
    });

    httpsServer.listen(serverConfig.port, () => logger.info(`server is listening on port : ${serverConfig.port}`))
}).catch((e) => {
    logger.error(`database connection failed : ${e.message}`)
})