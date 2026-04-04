import { load } from "cheerio";

export async function extractTextFromUrl(
  url: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const response = await fetchImpl(url, {
    headers: {
      "user-agent": "22B-QuickBook/0.1 (+https://github.com/sinmb79/22B-Novel-One-Click-Long-Form-Novel-Generator-)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch reference URL: ${url} (${response.status})`);
  }

  const html = await response.text();
  const $ = load(html);
  $("script, style, noscript, nav, footer, header, aside, form, iframe").remove();

  const text = $("main").text() || $("article").text() || $("body").text();

  return text.replace(/\s+/g, " ").trim();
}
