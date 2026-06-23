/**
 * Builds a structured, future-ready video generation prompt object.
 * This prompt configuration is designed to be sent to high-fidelity motion models
 * (e.g. LTX-2, Runway Gen-2, Veo, Sora, or custom GPU pipelines) in the future.
 */
export function buildVideoPrompt(pkg) {
  if (!pkg) return null;

  const projectName = pkg.project?.name || "Product";
  const desc = pkg.project?.description || "";
  const angle = pkg.strategy?.coreAngle || "";
  const hooks = pkg.strategy?.hooks || [];
  
  // Synthesize visual style attributes
  const visualStyle = {
    resolution: "1080x1920 (Vertical 9:16)",
    fps: 30,
    cameraMovement: "Cinematic steady camera, slow forward tracks, smooth pans, UI focus macros",
    lighting: "High-contrast dark mode UI, vibrant glow ambient accent lights (neon teal/orange)",
    colorPalette: "Deep Slate Slate, Cyber Green, Electric Blue, stark white typography overlay",
    renderingEngine: "Realistic screen render, clean vector geometry, soft shadow depth"
  };

  // Compile scenes from available shotList/videoScript
  const scenes = [];
  const shots = pkg.media?.shotList || [];
  const scripts = pkg.media?.videoScript || [];
  const voiceovers = pkg.media?.voiceoverScript || [];
  const guides = pkg.media?.recordingGuide || [];

  const size = Math.max(shots.length, scripts.length, 1);

  for (let i = 0; i < size; i++) {
    const shot = shots[i] || `Scene showing ${projectName} application features.`;
    const script = scripts[i] || `Check out ${projectName}!`;
    const vo = voiceovers[i] || script;
    const guide = guides[i] || "Screencast the main application workspace.";
    
    scenes.push({
      sceneNumber: i + 1,
      shotDescription: shot,
      voiceoverText: vo,
      demoActionGuide: guide,
      suggestedDurationSeconds: 4.5,
      motionPrompt: `Generate high-fidelity vertical screen video. Show close-up interaction: ${shot}. Professional tech aesthetic, smooth camera track, sharp UI elements, dark mode theme. No compression artifacts.`
    });
  }

  return {
    version: "1.0.0",
    generator: "SignalFlow Video Prompt Compiler",
    projectName,
    promptTheme: angle || desc.substring(0, 150),
    styleConfiguration: visualStyle,
    scenePlan: scenes,
    futureModelTarget: "LTX-2 / Runway Gen-3 / Meta Veo / OpenAI Sora",
    compiledAt: new Date().toISOString()
  };
}
