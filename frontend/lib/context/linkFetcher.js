/**
 * Fetches HTML from a webpage URL and cleanses it to plain text.
 * Public hosted mode blocks local hostnames, embedded credentials, and oversized responses.
 */
const MAX_RESPONSE_CHARS = 1_000_000;
const MAX_CONTEXT_CHARS = 10000;
const FETCH_TIMEOUT_MS = 8000;

export async function fetchUrlContent(urlStr) {
  if (!urlStr) return null;

  const result = {
    url: "",
    title: "",
    description: "",
    text: "",
    warnings: []
  };

  let url;
  try {
    url = normalizeAndValidateUrl(urlStr);
    result.url = url.toString();
  } catch (err) {
    return {
      ...result,
      url: String(urlStr || "").trim(),
      warnings: [`Skipped URL: ${err.message}`]
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const resp = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "SignalFlowStudio/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5"
      }
    });

    clearTimeout(timeoutId);

    if (!resp.ok) {
      throw new Error(`HTTP Error ${resp.status}`);
    }

    const contentLength = Number(resp.headers.get("content-length") || 0);
    if (contentLength > MAX_RESPONSE_CHARS) {
      throw new Error("Response is larger than the allowed fetch limit.");
    }

    let html = await resp.text();
    if (html.length > MAX_RESPONSE_CHARS) {
      result.warnings.push("Fetched content was truncated before parsing because it exceeded the fetch limit.");
      html = html.substring(0, MAX_RESPONSE_CHARS);
    }

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
      result.title = cleanText(titleMatch[1]);
    }

    const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i) ||
      html.match(/<meta\s+content=["']([\s\S]*?)["']\s+name=["']description["']/i);
    if (descMatch && descMatch[1]) {
      result.description = cleanText(descMatch[1]);
    }

    let bodyContent = html;
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      bodyContent = bodyMatch[1];
    }

    bodyContent = bodyContent.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
    bodyContent = bodyContent.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
    bodyContent = bodyContent.replace(/<!--([\s\S]*?)-->/g, "");
    bodyContent = bodyContent.replace(/<\/p>|<\/div>|<\/h[1-6]>|<\/li>|<\/tr>/gi, "\n");

    let plainText = bodyContent.replace(/<[^>]*>/g, " ");
    plainText = decodeHtmlEntities(plainText)
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");

    if (plainText.length > MAX_CONTEXT_CHARS) {
      plainText = `${plainText.substring(0, MAX_CONTEXT_CHARS)}\n\n... [Content truncated to fit context budget] ...`;
    }

    result.text = plainText;
  } catch (err) {
    result.warnings.push(`Failed to fetch URL content for ${result.url}: ${err.message}`);
  }

  return result;
}

function normalizeAndValidateUrl(urlStr) {
  let normalized = String(urlStr || "").trim();
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = `https://${normalized}`;
  }

  const url = new URL(normalized);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs are supported.");
  }
  if (url.username || url.password) {
    throw new Error("URLs with embedded credentials are not allowed.");
  }
  if (process.env.SIGNALFLOW_PUBLIC_HOSTED === "true" && looksLocal(url.hostname)) {
    throw new Error("Local/internal targets are blocked in public hosted mode.");
  }
  return url;
}

function looksLocal(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  return host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.includes("metadata");
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
