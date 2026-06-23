/**
 * Fetches HTML from a webpage URL and cleanses it to plain text.
 */
export async function fetchUrlContent(urlStr) {
  if (!urlStr) return null;

  let url = urlStr.trim();
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }

  const result = {
    url,
    title: "",
    description: "",
    text: "",
    warnings: []
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second timeout

    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
      }
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      throw new Error(`HTTP Error ${resp.status}`);
    }

    const html = await resp.text();

    // 1. Extract title
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      result.title = cleanText(titleMatch[1]);
    }

    // 2. Extract meta description
    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i) || 
                      html.match(/<meta\s+content=["']([\s\S]*?)["']\s+name=["']description["']/i);
    if (descMatch && descMatch[1]) {
      result.description = cleanText(descMatch[1]);
    }

    // 3. Clean HTML body
    let bodyContent = html;
    
    // Find body element if present to restrict scraping to body
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      bodyContent = bodyMatch[1];
    }

    // Strip scripts
    bodyContent = bodyContent.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
    // Strip styles
    bodyContent = bodyContent.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
    // Strip comments
    bodyContent = bodyContent.replace(/<!--([\s\S]*?)-->/g, "");
    // Replace block tags with newlines
    bodyContent = bodyContent.replace(/<\/p>|<\/div>|<\/h[1-6]>|<\/li>|<\/tr>/gi, "\n");
    // Strip all HTML tags
    let plainText = bodyContent.replace(/<[^>]*>/g, " ");

    // Decode standard HTML entities
    plainText = decodeHtmlEntities(plainText);

    // Normalize spacing and newlines
    plainText = plainText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join("\n");

    // Limit output length to conserve tokens
    if (plainText.length > 10000) {
      plainText = plainText.substring(0, 10000) + "\n\n... [Content truncated to fit context budget] ...";
    }

    result.text = plainText;

  } catch (err) {
    result.warnings.push(`Failed to fetch URL content for ${url}: ${err.message}`);
  }

  return result;
}

function cleanText(text) {
  return decodeHtmlEntities(text.replace(/\s+/g, " ").trim());
}

function decodeHtmlEntities(str) {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}
