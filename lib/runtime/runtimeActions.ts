import type { EditorAction } from "@/types/project";
import type { RuntimeContext, RuntimeEvent } from "@/lib/runtime/runtimeTypes";

export function describeRuntimeAction(action?: EditorAction) {
  if (!action || action.type === "none") {
    return "No action assigned.";
  }

  if (action.type === "nextScene") {
    return "Move to the next scene.";
  }

  if (action.type === "goToScene") {
    return "Jump to the selected scene.";
  }

  if (action.type === "startGame") {
    return "Start the gameplay scene.";
  }

  if (action.type === "showEndCard") {
    return "Show the end card scene.";
  }

  if (action.type === "replay") {
    return "Restart the playable from the first scene.";
  }

  return "Open the CTA URL placeholder.";
}

export function runRuntimeAction(action: EditorAction | undefined, context: RuntimeContext): RuntimeEvent {
  if (!action || action.type === "none") {
    return { type: "action", message: "Tapped object with no action." };
  }

  if (action.type === "nextScene") {
    if (action.targetSceneId) {
      context.goToScene(action.targetSceneId);
    } else {
      context.goToSceneIndex(Math.min(context.sceneIndex + 1, context.project.scenes.length - 1));
    }

    return { type: "sceneChange", message: "Runtime moved to the next scene." };
  }

  if (action.type === "goToScene") {
    if (action.targetSceneId) {
      context.goToScene(action.targetSceneId);
    }

    return { type: "sceneChange", message: "Runtime jumped to the selected scene." };
  }

  if (action.type === "startGame") {
    context.goToSceneType("gameplay");
    return { type: "sceneChange", message: "Runtime started the gameplay scene." };
  }

  if (action.type === "showEndCard") {
    context.goToSceneType("endCard");
    return { type: "sceneChange", message: "Runtime showed the end card scene." };
  }

  if (action.type === "replay") {
    context.reset();
    return { type: "sceneChange", message: "Runtime replayed from the first scene." };
  }

  context.openUrl(action.url);
  return { type: "cta", message: "Runtime opened the CTA URL placeholder." };
}
