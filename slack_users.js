// n8n Code Node
const BASE_URL = "https://pb.levelingupdata.com/api/collections/slack_user/records";

const data = $('HTTP Request5').first().json;
// const userInfo = $input.first().json;

const team_id = data.team?.id || "Self";
const team_name = data.team?.name || "unknown";
const bot_token = data.access_token;
const bot_user_id = data.bot_user_id;
const installer_user_id = data.authed_user?.id;
const user_name = $input.first().json.user.real_name || "";
const user_email = $input.first().json.user.profile.email || "";

// ✅ Step 1: Check if team exists
let existing = await this.helpers.httpRequest({
  method: "GET",
  url: `${BASE_URL}?filter=(team_id='${team_id}')`,
  headers: {
    accept: "application/json",
  },
});

if (existing?.items?.length > 0) {
  return [
    {
      json: {
        message: "Record already exists",
        team_id,
        exists: true,
      },
    },
  ];
}

// ✅ Step 2: Insert new record
let payload = {
  team_id,
  team_name,
  bot_token,
  bot_user_id,
  installer_user_id,
  user_name,
  user_email,
};

let inserted = await this.helpers.httpRequest({
  method: "POST",
  url: BASE_URL,
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),  // ✅ IMPORTANT
});

return [
  {
    json: {
      message: "Inserted new record",
      inserted,
      exists: false,
    },
  },
];