require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const url =
  process.env.SUPABASE_URL || "https://pwpqgjinqsjwwtpntxjv.supabase.co";

const key =
  process.env.SUPABASE_ANON_KEY || "sb_publishable_UM04B5baRxDmXiHI5zp6GA_4w6etaQs";

const supabase = createClient(url, key, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

module.exports = { supabase };
