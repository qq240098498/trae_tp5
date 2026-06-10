/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import dashboardRoutes from './routes/dashboard.js'
import boardingRoutes from './routes/boarding.js'
import feedingRoutes from './routes/feeding.js'
import staffRoutes from './routes/staff.js'
import petsRoutes from './routes/pets.js'
import customersRoutes from './routes/customers.js'
import memberDiscountsRoutes from './routes/memberDiscounts.js'
import reviewsRoutes from './routes/reviews.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const NODE_ENV = process.env.NODE_ENV || 'development';
const envFiles = [
  `.env.${NODE_ENV}.local`,
  `.env.${NODE_ENV}`,
  '.env.local',
  '.env',
];
for (const file of envFiles) {
  dotenv.config({ path: file, override: false });
}
console.log(`[Server] Environment: ${NODE_ENV.toUpperCase()}`);

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/boarding', boardingRoutes)
app.use('/api/feeding', feedingRoutes)
app.use('/api/staff', staffRoutes)
app.use('/api/pets', petsRoutes)
app.use('/api/customers', customersRoutes)
app.use('/api/member-discounts', memberDiscountsRoutes)
app.use('/api/reviews', reviewsRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
