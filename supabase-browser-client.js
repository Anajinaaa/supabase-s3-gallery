// src/lib/supabase-browser-client.js

// Import the necessary function from the Supabase CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Read keys exposed by Vite (VITE_ prefixed)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY 

if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase keys are missing in the .env file.")
}

// Export the client initialized with the high-privilege Service Role Key
export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        // Tells the browser to skip session persistence, as we are using a static key
        persistSession: false 
    }
})


