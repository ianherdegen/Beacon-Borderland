import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Player {
  id: number;
  username: string;
  status: string;
  last_game_at: string | null;
  user_id: string | null;
}

interface User {
  id: string;
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get only active players (not eliminated or already forfeited)
    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('id, username, status, last_game_at, user_id')
      .eq('status', 'Active')  // Only active players need warnings
      .not('user_id', 'is', null)

    if (playersError) {
      console.error('Error fetching players:', playersError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch players' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!players || players.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active players found' }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user emails for connected players using admin client
    const userIds = players.map(p => p.user_id).filter(Boolean)
    const users = []
    
    for (const userId of userIds) {
      try {
        const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId)
        if (!userError && user.user) {
          users.push({
            id: user.user.id,
            email: user.user.email
          })
        }
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error)
      }
    }

    const userMap = new Map(users?.map(u => [u.id, u.email]) || [])
    const now = new Date()
    const emailsSent = []

    // Check each player for forfeit warnings
    for (const player of players as Player[]) {
      if (!player.last_game_at || !player.user_id) continue

      const lastGameDate = new Date(player.last_game_at)
      const hoursSinceLastGame = (now.getTime() - lastGameDate.getTime()) / (1000 * 60 * 60)

      // Calculate warning time (72 hours = forfeit deadline)
      const oneDayBefore = 48 // 48 hours (72 - 24)
      const oneDayAfter = 72 // 72 hours (forfeit deadline)

      let shouldSendWarning = false
      let timeRemaining = '1 day'

      // Send warning if between 48-72 hours since last game
      if (hoursSinceLastGame >= oneDayBefore && hoursSinceLastGame < oneDayAfter) {
        shouldSendWarning = true
      }

      if (shouldSendWarning && userMap.has(player.user_id)) {
        const userEmail = userMap.get(player.user_id)!
        
        // Send warning email
        const emailResult = await sendForfeitWarning(
          userEmail,
          player.username,
          timeRemaining,
          hoursSinceLastGame
        )

        if (emailResult.success) {
          emailsSent.push({
            player: player.username,
            email: userEmail,
            timeRemaining
          })
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${players.length} players`,
        emailsSent: emailsSent.length,
        details: emailsSent
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in forfeit warnings function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function sendForfeitWarning(
  email: string,
  username: string,
  timeRemaining: string,
  hoursSinceLastGame: number
) {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not found')
    }

    const subject = `Borderland: Game Activity Reminder - ${username}`
    
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #e63946; text-shadow: 0 0 10px rgba(230, 57, 70, 0.5); font-size: 2.5em; margin: 0;">♠ BORDERLAND ♥</h1>
          <p style="color: #666; margin: 5px 0 0 0; font-size: 0.9em; letter-spacing: 2px;">SURVIVAL GAME</p>
        </div>
        
        <div style="background: #1a1a1a; padding: 30px; border-radius: 8px; border-left: 4px solid #e63946;">
          <h2 style="color: #e63946; margin-top: 0; font-size: 1.5em;">Game Activity Reminder</h2>
          
          <p style="color: #ffffff; line-height: 1.6; margin-bottom: 20px;">
            Hello <strong>${username}</strong>,
          </p>
          
          <p style="color: #ffffff; line-height: 1.6; margin-bottom: 20px;">
            We noticed you haven't completed a game in a while. To maintain your active status in Borderland, please complete a game soon.
          </p>
          
          <div style="background: #2a2a2a; padding: 20px; border-radius: 6px; margin: 20px 0;">
            <p style="color: #ffffff; margin: 0; font-weight: bold;">Time Since Last Game:</p>
            <p style="color: #e63946; margin: 5px 0 0 0; font-size: 1.2em;">${Math.floor(hoursSinceLastGame)} hours</p>
          </div>
          
          <p style="color: #ffffff; line-height: 1.6; margin-bottom: 20px;">
            Players who don't complete a game within 72 hours of their last game will be automatically removed from active play. 
            We'd love to keep you in the game!
          </p>
          
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
          <p>This is an automated warning from Borderland</p>
        </div>
      </div>
    `

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'noreply@thebeaconhq.com',
        to: [email],
        subject: subject,
        html: message,
        text: `Borderland Game Activity Reminder: ${username}, we noticed you haven't completed a game in ${Math.floor(hoursSinceLastGame)} hours. Players who don't complete a game within 72 hours will be removed from active play.`
      })
    })

    const emailData = await emailResponse.json()

    if (!emailResponse.ok) {
      console.error('Resend API error:', emailData)
      return { success: false, error: emailData }
    }

    return { success: true, data: emailData }

  } catch (error) {
    console.error('Error sending forfeit warning email:', error)
    return { success: false, error: error.message }
  }
}
