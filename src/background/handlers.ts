import { OpenRouterService } from "./openrouter-service.js";
import { getSettings } from "../lib/settings.js";
import type { OpenRouterModel, AppError } from "../lib/types.js";
import {
  EXPLAIN_RESPONSE_SCHEMA,
  FACT_CHECK_RESPONSE_SCHEMA,
} from "../lib/types.js";
import { ModelManager } from "../lib/model-manager.js";
import { PromptManager } from "../lib/prompt-manager.js";

/**
 * Initializes the keyboard shortcut listener related to Area Capture.
 */
export function initializeCaptureListeners() {
  // Handle keyboard shortcuts
  chrome.commands.onCommand.addListener(async (command) => {
    if (command === "activate-area-capture") {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (tab?.id) {
        chrome.tabs.sendMessage(tab.id, { type: "ACTIVATE_CAPTURE" });
      }
    }
  });
}

/**
 * Handles the "Explain" request by calling OpenRouterService.
 */
export async function handleExplain(
  text: string,
  emphasizedWords: string[] = [],
  imageUrl?: string
): Promise<any> {
  const settings = await getSettings();
  const {
    explainModel,
    explainSettings,
    areaCaptureModel,
    areaCaptureSettings,
    stylePreference,
  } = settings;

  let model = explainModel;
  let llmSettings = explainSettings;

  if (imageUrl) {
    const models = await ModelManager.getModels();
    const supportsImageInput = (modelId: string) =>
      models.some(
        (candidate) =>
          candidate.id === modelId &&
          (candidate.architecture?.input_modalities?.includes("image") ?? false)
      );

    const areaCaptureSupportsImages = supportsImageInput(areaCaptureModel);

    if (areaCaptureSupportsImages) {
      model = areaCaptureModel;
      llmSettings = areaCaptureSettings;
    } else {
      const explainSupportsImages = supportsImageInput(explainModel);

      if (explainSupportsImages) {
        model = explainModel;
        llmSettings = explainSettings;
      } else {
        throw {
          type: "llm",
          message:
            "No image-capable model is configured. Choose a vision model for Area Capture in settings.",
        };
      }
    }
  }

  // Check if the model supports structured outputs
  const supportsStructured = await ModelManager.supportsStructuredOutputs(
    model
  );

  const systemPrompt = PromptManager.getExplainPrompt(
    stylePreference,
    emphasizedWords
  );

  const userContent: any = imageUrl
    ? [
        { type: "text", text },
        { type: "image_url", image_url: { url: imageUrl } },
      ]
    : text;

  try {
    return await OpenRouterService.chatCompletion({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: userContent },
      ],
      temperature: llmSettings.temperature,
      max_tokens: llmSettings.max_tokens,
      // Only use response_format for models that support it
      ...(supportsStructured && { response_format: EXPLAIN_RESPONSE_SCHEMA }),
    });
  } catch (error) {
    // If the error is likely due to the model not supporting system prompts or structured outputs
    // (e.g. "Developer instruction is not enabled"), fallback to a more compatible request.
    console.warn(
      "Explain request failed, retrying with compatibility mode:",
      error
    );

    return OpenRouterService.chatCompletion({
      model,
      messages: [
        // Merge system prompt into user message for maximum compatibility
        { role: "user", content: imageUrl ? [
          { type: "text", text: `${systemPrompt}\n\n${text}` },
          { type: "image_url", image_url: { url: imageUrl } },
        ] : `${systemPrompt}\n\n${text}` },
      ],
      temperature: llmSettings.temperature,
      max_tokens: llmSettings.max_tokens,
    });
  }
}

/**
 * Handles the "Fact-check" request by calling OpenRouterService.
 */
export async function handleFactCheck(payload: {
  text: string;
  context?: {
    paragraph: string;
    pageTitle: string;
    pageDescription: string;
  };
  emphasizedWords?: string[];
}): Promise<any> {
  const settings = await getSettings();
  const { factCheckModel, factCheckSettings, stylePreference } = settings;

  // Build user message with context for disambiguation
  let userMessage = `CLAIM TO VERIFY:\n${payload.text}`;

  if (payload.context) {
    const contextParts: string[] = [];

    if (payload.context.pageTitle) {
      contextParts.push(`- Page Title: ${payload.context.pageTitle}`);
    }
    if (payload.context.pageDescription) {
      contextParts.push(
        `- Page Description: ${payload.context.pageDescription.slice(0, 150)}`
      );
    }
    if (payload.context.paragraph) {
      const truncated =
        payload.context.paragraph.length > 300
          ? payload.context.paragraph.slice(0, 300) + "..."
          : payload.context.paragraph;
      contextParts.push(`- Surrounding Text: ${truncated}`);
    }

    if (contextParts.length > 0) {
      userMessage += `\n\nCONTEXT FROM SOURCE PAGE (for disambiguation only, NOT a verified source):\n${contextParts.join(
        "\n"
      )}`;
    }
  }

  // Check if the model supports structured outputs
  const supportsStructured = await ModelManager.supportsStructuredOutputs(
    factCheckModel
  );

  const systemPrompt = PromptManager.getFactCheckPrompt(
    stylePreference,
    payload.emphasizedWords || []
  );

  try {
    return await OpenRouterService.chatCompletion({
      model: factCheckModel,
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        { role: "user", content: userMessage },
      ],
      temperature: factCheckSettings.temperature,
      max_tokens: factCheckSettings.max_tokens,
      // Only use response_format for models that support it
      ...(supportsStructured && {
        response_format: FACT_CHECK_RESPONSE_SCHEMA,
      }),
    });
  } catch (error) {
    console.warn(
      "Fact-check request failed, retrying with compatibility mode:",
      error
    );

    return OpenRouterService.chatCompletion({
      model: factCheckModel,
      messages: [
        // Merge system prompt into user message for maximum compatibility
        { role: "user", content: `${systemPrompt}\n\n${userMessage}` },
      ],
      temperature: factCheckSettings.temperature,
      max_tokens: factCheckSettings.max_tokens,
    });
  }
}

/**
 * Verifies the API key by sending a minimal request to OpenRouter.
 */
export async function handleTestApiKey(apiKey: string): Promise<boolean> {
  return OpenRouterService.testKey(apiKey);
}

/**
 * Fetches available models from OpenRouter via ModelManager.
 */
export async function handleFetchModels(): Promise<OpenRouterModel[]> {
  try {
    return await ModelManager.getModels();
  } catch (error) {
    // We still need a way to map errors for ModelManager if it doesn't use OpenRouterService
    // But for now, we'll just throw a simple error if it's not already an AppError
    if ((error as AppError).type) throw error;
    throw {
      type: "unknown",
      message: `Failed to fetch models: ${
        (error as any)?.message || "Unexpected error"
      }`,
    } as AppError;
  }
}

/**
 * Captures the currently visible tab and crops it to the specified rectangle using OffscreenCanvas.
 * Returns the cropped image as a base64 encoded string.
 */
export async function handleCaptureVisibleTab(rect: { x: number; y: number; width: number; height: number }): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.captureVisibleTab(
      { format: "png", quality: 100 },
      async (dataUrl) => {
        if (chrome.runtime.lastError) {
          return reject({
            type: "unknown",
            message: chrome.runtime.lastError.message || "Failed to capture tab",
          });
        }
        
        if (!dataUrl) {
          return reject({
            type: "unknown",
            message: "Failed to capture tab, no data returned",
          });
        }

        try {
          // Sanitize rect values: round to integers and clamp to bitmap bounds
          const x = Math.round(rect.x);
          const y = Math.round(rect.y);
          const width = Math.round(rect.width);
          const height = Math.round(rect.height);

          if (width <= 0 || height <= 0) {
            return reject({
              type: "unknown",
              message: "Invalid capture rect: width and height must be positive",
            });
          }

          // Fetch the data URL to get a Blob
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          
          // Use ImageBitmap for processing
          const imageBitmap = await createImageBitmap(blob);
          
          // Clamp the crop region to the imageBitmap bounds to prevent out-of-bounds errors
          const clampedX = Math.max(0, Math.min(x, imageBitmap.width));
          const clampedY = Math.max(0, Math.min(y, imageBitmap.height));
          const clampedWidth = Math.max(1, Math.min(width, imageBitmap.width - clampedX));
          const clampedHeight = Math.max(1, Math.min(height, imageBitmap.height - clampedY));

          // Device pixel ratio must be handled here or by the caller.
          // Since captureVisibleTab captures the actual pixels, and the rect is in logical CSS pixels,
          // we need to scale the rect if the screen is high DPI.
          // We can estimate the scale factor by comparing image width to window width, 
          // or rely on the content script to pass the correct physical pixel rect.
          // Let's assume the content script passes the logical CSS rect, and we'll just use it directly,
          // OR we can do the cropping in the content script.
          // Wait, doing the cropping in the background script requires knowing devicePixelRatio.
          // It's safer to just do the simple crop here assuming the coordinates are physical, 
          // but if they are logical, they won't match the image size.
          // Let's rely on the content script to pass physical pixels by multiplying with window.devicePixelRatio.
          
          const canvas = new OffscreenCanvas(clampedWidth, clampedHeight);
          const ctx = canvas.getContext("2d");
          if (!ctx) {
             throw new Error("Failed to get 2D context");
          }

          // Draw the cropped portion
          ctx.drawImage(
            imageBitmap,
            clampedX,
            clampedY,
            clampedWidth,
            clampedHeight,
            0,
            0,
            clampedWidth,
            clampedHeight
          );

          const croppedBlob = await canvas.convertToBlob({ type: "image/png" });
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.onerror = () => {
            reject({ type: "unknown", message: "Failed to read cropped blob" });
          };
          reader.readAsDataURL(croppedBlob);
        } catch (error) {
          reject({
            type: "unknown",
            message: `Failed to crop image: ${(error as any)?.message || "Unexpected error"}`,
          });
        }
      }
    );
  });
}
