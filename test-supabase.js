import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are missing.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("users").select("*").limit(1);
    if (error) {
      console.error("Error querying Supabase:", error);
    } else {
      console.log("Supabase query successful. Data:", data);
    }
  } catch (err) {
    console.error("Unexpected error during Supabase test:", err);
  }
}

testSupabaseConnection();
