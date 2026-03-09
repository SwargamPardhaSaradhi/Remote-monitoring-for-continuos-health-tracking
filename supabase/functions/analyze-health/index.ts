import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface HealthMetric {
  heart_rate: number;
  systolic_bp: number;
  diastolic_bp: number;
  oxygen_saturation: number;
  body_temperature: number;
  created_at?: string;
}

interface RequestBody {
  currentMetrics: HealthMetric;
  previousMetrics: HealthMetric[];
  userId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { currentMetrics, previousMetrics }: RequestBody = await req.json();

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const prompt = `You are a medical AI assistant analyzing health vitals data. Analyze the following health metrics and provide insights.

Current Vital Signs:
- Heart Rate: ${currentMetrics.heart_rate} BPM
- Blood Pressure: ${currentMetrics.systolic_bp}/${currentMetrics.diastolic_bp} mmHg
- Oxygen Saturation: ${currentMetrics.oxygen_saturation}%
- Body Temperature: ${currentMetrics.body_temperature}°F

${previousMetrics.length > 0 ? `Previous Measurements History (Last ${previousMetrics.length} readings):
${previousMetrics.map((m, i) => `${i + 1}. HR: ${m.heart_rate} BPM, BP: ${m.systolic_bp}/${m.diastolic_bp}, SpO₂: ${m.oxygen_saturation}%, Temp: ${m.body_temperature}°F`).join('\n')}` : 'No previous measurements available.'}

Based on this data, provide:

1. DISEASE RISK PREDICTION: Analyze patterns and identify potential health risks or conditions that should be monitored. Look for trends, abnormal values, and potential early warning signs. Be specific about what conditions might develop if trends continue.

2. PERSONALIZED DIET RECOMMENDATIONS: Provide specific dietary suggestions to improve or maintain these vital signs. Include foods to eat more of, foods to avoid, and explain why each recommendation helps.

Format your response EXACTLY as follows:

DISEASE_PREDICTION:
[Your detailed disease risk analysis here]

DIET_RECOMMENDATIONS:
[Your detailed dietary recommendations here]

Be thorough, specific, and actionable in your recommendations.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.candidates[0].content.parts[0].text;

    const diseasePredictionMatch = analysisText.match(
      /DISEASE_PREDICTION:\s*([\s\S]*?)(?=DIET_RECOMMENDATIONS:|$)/i
    );
    const dietRecommendationsMatch = analysisText.match(
      /DIET_RECOMMENDATIONS:\s*([\s\S]*?)$/i
    );

    const diseasePrediction = diseasePredictionMatch
      ? diseasePredictionMatch[1].trim()
      : "Unable to generate prediction. Please consult a healthcare professional.";
    const dietRecommendations = dietRecommendationsMatch
      ? dietRecommendationsMatch[1].trim()
      : "Unable to generate recommendations. Please consult a nutritionist.";

    return new Response(
      JSON.stringify({
        diseasePrediction,
        dietRecommendations,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});