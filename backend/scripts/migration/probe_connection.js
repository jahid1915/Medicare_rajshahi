require("dotenv").config();
const { Client } = require("pg");

const PROJECT_REF = "ickofuqtxsexxyjenmac";
const PASSWORD = process.env.SUPABASE_DB_PASSWORD;
const HOSTS = [
  "aws-0-ap-southeast-1.pooler.supabase.com",
  "aws-0-us-east-1.pooler.supabase.com",
  "aws-0-eu-west-1.pooler.supabase.com",
  "aws-0-ap-northeast-1.pooler.supabase.com",
  "aws-0-ap-south-1.pooler.supabase.com",
];
const PORTS = [6543, 5432];
const USERS = [
  `postgres.${PROJECT_REF}`,   // New format
  `postgres`,                   // Old format
  `${PROJECT_REF}`,             // Project-only
  `authenticator`,              // Supabase internal
];

async function tryConn(host, port, user) {
  const client = new Client({
    host, port, user, password: PASSWORD, database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000
  });
  try {
    await client.connect();
    const r = await client.query("SELECT current_user, current_database()");
    console.log(`✅ CONNECTED! host=${host} port=${port} user=${user}`);
    console.log(`   current_user=${r.rows[0].current_user} db=${r.rows[0].current_database}`);
    await client.end();
    return true;
  } catch (e) {
    const msg = e.message.substring(0, 70);
    process.stdout.write(`❌ ${host.split('.')[0]} :${port} user=${user.substring(0,20).padEnd(22)} → ${msg}\n`);
    try { await client.end(); } catch {}
    return false;
  }
}

async function main() {
  console.log(`Testing ${HOSTS.length} hosts × ${PORTS.length} ports × ${USERS.length} users...\n`);
  
  // Try AP southeast first (most likely for Bangladesh)
  for (const host of HOSTS) {
    for (const port of PORTS) {
      for (const user of USERS) {
        const ok = await tryConn(host, port, user);
        if (ok) {
          console.log(`\n🎯 Working config:\n  host=${host}\n  port=${port}\n  user=${user}\n  password=***${PASSWORD.slice(-4)}`);
          process.exit(0);
        }
      }
    }
  }
  console.log("\n❌ No working connection found.");
  console.log("\nPlease go to Supabase Dashboard → Project Settings → Database");
  console.log("and copy the EXACT connection string shown there.");
}

main().catch(console.error);
