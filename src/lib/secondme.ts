const BASE_URL = process.env.SECONDME_API_BASE_URL!;

export async function getSecondMeUser(accessToken: string) {
  const res = await fetch(`${BASE_URL}/api/secondme/user/info`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.message || "Failed to get user");
  return json.data;
}

export async function searchKeyMemory(accessToken: string, keyword: string) {
  const res = await fetch(
    `https://app.mindos.com/gate/in/rest/third-party-agent/v1/memories/key/search?keyword=${encodeURIComponent(keyword)}&pageNo=1&pageSize=20`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const json = await res.json();
  return json.data;
}

export async function insertKeyMemory(accessToken: string, content: string) {
  const res = await fetch(
    `https://app.mindos.com/gate/in/rest/third-party-agent/v1/memories/key`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mode: "direct", content, visibility: 1 }),
    }
  );
  const json = await res.json();
  return json.data;
}

export async function chatWithSecondMe(
  accessToken: string,
  message: string,
  context?: string
) {
  const res = await fetch(`${BASE_URL}/api/secondme/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      context: context || "",
    }),
  });
  const json = await res.json();
  if (json.code !== 0) throw new Error(json.message || "Chat failed");
  return json.data;
}

export async function discoverUsers(accessToken: string) {
  const res = await fetch(
    `https://app.mindos.com/gate/in/rest/third-party-agent/v1/discover/users?pageNo=1&pageSize=12`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const json = await res.json();
  return json.data;
}
