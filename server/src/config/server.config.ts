import dotenv from 'dotenv'
dotenv.config();


export interface ServerConfig {
    port: string | number
}

export const serverConfig: ServerConfig = {
    port: process.env.PORT || 8081
}