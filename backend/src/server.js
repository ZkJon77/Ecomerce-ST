import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { OAuth2Client } from 'google-auth-library'

/**
 * Backend auxiliar da Silver Tintas.
 * O checkout e o webhook de pagamentos são processados pelas rotas seguras do Next.js
 * em app/api/checkout/create-payment e app/api/webhooks/payment.
 */

const app = express()
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'backend', ts: Date.now() })
})

app.post('/api/auth/google', async (req, res) => {
  const { token } = req.body || {}
  if (!token) return res.status(400).json({ error: 'Token is required' })

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    return res.json({
      ok: true,
      user: {
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
      },
    })
  } catch (error) {
    console.error('Google Auth Error:', error)
    return res.status(401).json({ error: 'Invalid Google token' })
  }
})

const port = process.env.PORT ? Number(process.env.PORT) : 4000
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`)
})
