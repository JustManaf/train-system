import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config();
// create a Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
// Log to check if the client is created
if (supabase) {
  console.log("Supabase client successfully created");
} else {
  console.error("Failed to create Supabase client");
}
async function testConnection() {
  // Run a simple query to test
  const { data, error } = await supabase
    .from("station") // Replace with your table name
    .select("*")
    .limit(1);

  if (error) {
    console.error("Error during Supabase query:", error);
  } else {
    console.log("Test data fetched:", data);
  }
}

testConnection();
export default supabase;
