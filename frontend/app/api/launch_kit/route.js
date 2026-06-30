import { requireOwnerAccess } from "../_auth";
import { validateGenerationInputs } from "../../../lib/package/validatePackage";
import { ingestGitHubRepo } from "../../../lib/context/github";
import { ingestLocalRepo } from "../../../lib/context/localRepo";
import { fetchUrlContent } from "../../../lib/context/linkFetcher";
import { generateStudioPackage } from "../../../lib/ai/generateStudioPackage";

export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  const isOwner = accessError === null;

  try {
    const body = await request.json();

    if (!isOwner && Boolean(process.env.SIGNALFLOW_ACCESS_KEY)) {
      const generator = body.generator || "template";
      const userKey = (body.providerApiKey || "").trim();
      if (generator !== "template" && generator !== "offline" && !userKey) {
        return new Response(
          JSON.stringify({
            error: "This hosted workspace is private. Enter the owner's access key or supply your own personal API key in settings to use cloud providers.",
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // 1. Validate inputs
    const validation = validateGenerationInputs(body);
    if (!validation.valid) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: "Validation failed", 
        warnings: validation.errors 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const projectName = (body.project_name || body.projectName || "SignalFlow Studio Project").trim();
    const notes = (body.notes || "").trim();
    const audience = (body.audience || "developers, founders, and creators").trim();
    const repoUrl = (body.repo || "").trim();
    const docsUrl = (body.docs_url || body.research_url || "").trim();
    const appUrl = (body.app_url || body.appUrl || "").trim();
    const enableAutoCapture = Boolean(body.enable_auto_capture || body.enableAutoCapture);
    
    const selectedChannels = Array.isArray(body.channels) ? body.channels : [];
    const selectedOutputs = Array.isArray(body.output_types) ? body.output_types : [];
    
    const generator = body.generator || "prompt";
    const modelName = body.model_name || "";
    const modelEndpoint = body.model_endpoint || "";

    const warnings = [];
    let repoContext = null;
    let linksContext = [];
    const mediaItems = Array.isArray(body.media_items) ? [...body.media_items] : [];

    const githubToken = (body.github_token || body.githubToken || "").trim();

    // 2. Perform Repository Ingestion if repo URL or local path provided
    if (repoUrl) {
      try {
        const isLocal = !repoUrl.includes("github.com") && 
          (repoUrl.startsWith("/") || 
           repoUrl.startsWith("\\") || 
           /^[a-zA-Z]:\\/.test(repoUrl) || 
           /^[a-zA-Z]:\//.test(repoUrl) || 
           repoUrl.startsWith(".") ||
           (!repoUrl.includes("http://") && !repoUrl.includes("https://")));
        
        if (isLocal) {
          repoContext = await ingestLocalRepo(repoUrl);
        } else {
          repoContext = await ingestGitHubRepo(repoUrl, githubToken);
        }
        if (repoContext?.warnings?.length) {
          warnings.push(...repoContext.warnings);
        }
      } catch (err) {
        warnings.push(`Repository ingestion failed: ${err.message}. Generating with available inputs.`);
      }
    }

    // 3. Perform Docs/Links scraping if urls provided
    if (docsUrl) {
      // Split by spaces or newlines to support multiple links
      const urls = docsUrl.split(/\s+/).filter(Boolean);
      for (const url of urls) {
        try {
          const fetchResult = await fetchUrlContent(url);
          if (fetchResult) {
            linksContext.push(fetchResult);
            if (fetchResult.warnings?.length) {
              warnings.push(...fetchResult.warnings);
            }
          }
        } catch (err) {
          warnings.push(`Scraping docs link "${url}" failed: ${err.message}.`);
        }
      }
    }

    // 4. In V1, automated screenshot capture is disabled in the main flow.
    if (appUrl) {
      warnings.push("Automatic app capture is disabled in main flow. Upload screenshots or record manually.");
    }

    // 5. Build context & generate package (supports AI routes & templates fallbacks)
    const result = await generateStudioPackage({
      projectName,
      notes,
      audience,
      repoContext,
      linksContext,
      fileNames: Array.isArray(body.document_text) ? body.document_text : [body.document_text].filter(Boolean),
      mediaItems,
      selectedChannels,
      selectedOutputs,
      generator,
      model_name: body.providerModelName || modelName,
      model_endpoint: body.providerBaseUrl || modelEndpoint,
      appUrl,
      config: {
        apiKey: body.providerApiKey || "",
        baseUrl: body.providerBaseUrl || "",
        modelName: body.providerModelName || ""
      }
    });

    // Merge API warnings with generation warnings
    const allWarnings = Array.from(new Set([...warnings, ...(result.warnings || [])]));

    return new Response(JSON.stringify({
      ...result,
      warnings: allWarnings
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ 
      ok: false, 
      error: `Server failed to assemble kit: ${err.message}`, 
      warnings: [err.message] 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
