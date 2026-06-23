import { requireOwnerAccess } from "../_auth";
import { validateGenerationInputs } from "../../../lib/package/validatePackage";
import { ingestGitHubRepo } from "../../../lib/context/github";
import { fetchUrlContent } from "../../../lib/context/linkFetcher";
import { captureAppScreenshot } from "../../../lib/capture/appCapture";
import { generateStudioPackage } from "../../../lib/ai/generateStudioPackage";

export async function POST(request) {
  const accessError = requireOwnerAccess(request);
  if (accessError) {
    return accessError;
  }

  try {
    const body = await request.json();

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

    // 2. Perform GitHub Ingestion if repo URL provided
    if (repoUrl) {
      try {
        repoContext = await ingestGitHubRepo(repoUrl);
        if (repoContext?.warnings?.length) {
          warnings.push(...repoContext.warnings);
        }
      } catch (err) {
        warnings.push(`GitHub ingestion failed: ${err.message}. Generating with available inputs.`);
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

    // 4. Perform App Screenshot Capture if explicitly enabled
    if (appUrl && enableAutoCapture) {
      try {
        const captureResult = await captureAppScreenshot(appUrl);
        if (captureResult.success) {
          mediaItems.push({
            type: "screenshot",
            name: captureResult.name,
            url: captureResult.url
          });
        }
        if (captureResult.warnings?.length) {
          warnings.push(...captureResult.warnings);
        }
      } catch (err) {
        warnings.push(`App screenshot failed: ${err.message}.`);
      }
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
      model_name: modelName,
      model_endpoint: modelEndpoint,
      appUrl
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
