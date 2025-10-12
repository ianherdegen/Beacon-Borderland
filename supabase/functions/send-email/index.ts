import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, message } = await req.json()

    // Validate required fields
    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, message' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.log('=== EMAIL TEST (No API Key) ===')
      console.log('To:', to)
      console.log('Subject:', subject)
      console.log('Message:', message)
      console.log('================================')
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email logged to console (RESEND_API_KEY not set)',
          to,
          subject,
          timestamp: new Date().toISOString()
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Send actual email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@thebeaconhq.com', // Using your custom domain
        to: [to],
        subject: subject,
        html: `<h1>♠ BORDERLAND ♥</h1><h2>${subject}</h2><p>${message}</p><p><em>This is an automated message from Borderland</em></p>`,
        text: message
      })
    })

    const emailData = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error('Resend API error:', {
        status: emailResponse.status,
        statusText: emailResponse.statusText,
        response: emailData
      })
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to send email via Resend',
          status: emailResponse.status,
          statusText: emailResponse.statusText,
          details: emailData 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Email sent successfully via Resend:', emailData)

    const result = {
      success: true,
      message: 'Email sent successfully via Resend',
      to,
      subject,
      messageId: emailData.id,
      timestamp: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
