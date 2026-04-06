import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'WhidbeyWave'
  const subtitle = searchParams.get('subtitle') || 'Whidbey Island, Washington'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0b2618 0%, #1a4a33 50%, #0e272e 100%)',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ fontSize: 80, marginBottom: 20 }}>🌊</div>
        <div
          style={{
            fontSize: title.length > 40 ? 42 : 56,
            fontWeight: 'bold',
            color: '#fdfaf3',
            textAlign: 'center',
            maxWidth: 900,
            lineHeight: 1.2,
            padding: '0 40px',
            marginBottom: 16,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#c8b888',
            textAlign: 'center',
            marginBottom: 40,
          }}
        >
          {subtitle}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 50,
            padding: '10px 24px',
          }}
        >
          <div style={{ fontSize: 24 }}>🌲</div>
          <div style={{ color: '#fdfaf3', fontSize: 24, fontWeight: 'bold' }}>
            WhidbeyWave.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
