import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { ImageData, GenerationMode } from '../types';

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateNailArt(
  baseImage: ImageData,
  styleImage: ImageData | null,
  prompt: string,
  isRegeneration: boolean = false,
  mode: GenerationMode = 'inspiration'
): Promise<string> {
  const model = 'gemini-2.5-flash-image-preview';
  
  let textPrompt: string;
  const parts: ({ text: string } | { inlineData: { data: string, mimeType: string }})[] = [];

  const qualityInstructions = "The resulting nail art must be hyper-photorealistic, seamlessly blended with the original hand photo. It should look as if done by a professional artist in a physical nail salon. Crucially, match the lighting, shadows, and reflections of the original photo to make the new nail art look completely natural on the hand. The art should follow the natural curvature of each nail. It must have a glossy top coat finish. Avoid flat, 'pasted-on', cartoonish, or surreal effects.";
  
  if (isRegeneration) {
    const crucialRule = "Crucial rule: Only modify the nail art on the nails. Do not change the hand's shape, pose, skin texture, nail shape, or the background in any way. You MUST preserve the original nail shape and length. The final image must retain the original photo's realism and quality.";
    textPrompt = `Edit the nail art on the hand in the image based on the following instruction: "${prompt}". ${qualityInstructions} ${crucialRule}`;
    
    parts.push({ inlineData: { data: baseImage.data, mimeType: baseImage.mimeType } });
    parts.push({ text: textPrompt });

  } else {
    if (!styleImage) {
        throw new Error("Style image is required for initial generation.");
    }

    if (mode === 'inspiration') {
        const crucialRule = "ABSOLUTE DIRECTIVE: You MUST preserve the original nail shape and length from the user's hand photo (first image). Any alteration to the nail shape is a failure. Only modify the nail art itself. Do not change the hand's shape, pose, skin texture, or the background.";
        textPrompt = `Apply nail art to the user's hand (first image) inspired by the style of the second image. The user's specific request is: "${prompt || 'a creative design based on the style image'}". ${qualityInstructions} ${crucialRule}`;
    } else { // 'tryon' mode
        textPrompt = `
Objective: You are a hyper-precise digital nail artist. Your task is to transfer a nail art design from a reference photo onto a client's hand photo with perfect realism and accuracy.

Image 1 (BASE IMAGE): The client's hand. This is your canvas.
Image 2 (STYLE REFERENCE): The nail art design to be applied.

--- ABSOLUTE DIRECTIVES ---

1.  **NAIL SHAPE AND LENGTH ARE SACROSANCT:** This is your highest priority. You MUST analyze the exact nail shape, length, and cuticle lines from the BASE IMAGE and replicate them perfectly. The final image's nails must be IDENTICAL in shape and length to the BASE IMAGE. Changing the nail shape (e.g., making a square nail pointy) is a critical failure.

2.  **PRESERVE THE HAND AND BACKGROUND:** The client's hand (shape, skin tone, pose, texture) and the entire background from the BASE IMAGE must remain completely untouched and identical to the original.

3.  **DESIGN MAPPING LOGIC:**
    *   **If the STYLE REFERENCE shows distinct designs on multiple fingers:** You MUST map each unique design to the corresponding finger on the BASE IMAGE. (e.g., style index finger design -> base index finger, style ring finger design -> base ring finger). Replicate the entire set as shown.
    *   **If the STYLE REFERENCE shows only a few fingers or a repeating pattern:** Creatively apply the style to all nails on the BASE IMAGE to create a cohesive, professional set.

4.  **SEAMLESS PHOTOREALISM:** The applied art must blend perfectly. Match the lighting, shadows, reflections, and glossy finish from the BASE IMAGE to make the result indistinguishable from a real-world manicure.

--- CRITICAL FAILURE CONDITIONS (AVOID AT ALL COSTS) ---
*   Altering the nail shape or length from the BASE IMAGE.
*   Using the nail shape from the STYLE REFERENCE.
*   Changing the hand or background.
*   Randomly mixing designs when a full set is shown in the STYLE REFERENCE.
*   Producing a result that looks like a flat sticker pasted onto the nails.`;
    }

    parts.push({ inlineData: { data: baseImage.data, mimeType: baseImage.mimeType } }); 
    parts.push({ inlineData: { data: styleImage.data, mimeType: styleImage.mimeType } });
    parts.push({ text: textPrompt });
  }

  const contents = { parts };
  const config = {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
  };

  try {
    const response = await ai.models.generateContent({ model, contents, config });
    
    const imagePart = response.candidates?.[0]?.content?.parts?.find(part => part.inlineData?.data);

    if (imagePart && imagePart.inlineData) {
        return imagePart.inlineData.data;
    }
    
    const textPart = response.candidates?.[0]?.content?.parts?.find(part => part.text);
    if (textPart?.text) {
      console.warn("Gemini API returned text instead of an image:", textPart.text);
    }
    
    throw new Error("API response did not contain an image.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('quota') || errorMessage.includes('resource has been exhausted')) {
            throw new Error("QUOTA_EXHAUSTED");
        }
        if (errorMessage.includes('api response did not contain an image')) {
            throw error;
        }
    }
    throw new Error("The AI model failed to generate an image. Please try again.");
  }
}


export async function extractDominantColors(image: ImageData): Promise<string[]> {
  const model = 'gemini-2.5-flash';
  const textPart = { text: "Analyze the nail art in this image. Identify and list the 3-5 most prominent and distinct colors used. For each color, provide a simple, common name (e.g., 'sky blue', 'cherry red', 'off-white'). Do not list shades that are too similar. Focus on the main colors that define the design." };
  const imagePart = {
    inlineData: {
      data: image.data,
      mimeType: image.mimeType,
    },
  };
  
  const contents = { parts: [imagePart, textPart] };

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      colors: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
          description: 'A simple, common name for a dominant color in the nail art.'
        }
      }
    }
  };

  const config = {
    responseMimeType: "application/json",
    responseSchema: responseSchema,
  };

  try {
    const response = await ai.models.generateContent({ model, contents, config });
    const jsonText = response.text.trim();
    const cleanJsonText = jsonText.replace(/^```json\n?/, '').replace(/```$/, '');
    const parsed = JSON.parse(cleanJsonText);
    if (parsed.colors && Array.isArray(parsed.colors)) {
      return parsed.colors;
    }
    console.warn("Parsed JSON for color extraction is not in the expected format:", parsed);
    return [];
  } catch (error) {
    console.error("Error extracting colors with Gemini:", error);
    return [];
  }
}