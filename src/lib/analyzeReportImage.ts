export interface ReportAnalysisResult {
    extractedText: string;
    diseases: string;
    prediction: string;
    dietPlan: string;
}

export async function analyzeReportImage(
    base64Image: string,
    mimeType: string
): Promise<ReportAnalysisResult> {
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY not configured in environment variables');
    }

    const prompt = `You are an expert medical AI assistant. You have been given an image of a medical report (such as a blood test, CBC, urine test, lipid profile, thyroid panel, liver function test, or other lab report).

Please perform the following tasks:

1. REPORT SUMMARY: Summarize the key data points visible in the report image in your own words. Include a brief overview of patient info, the test names and their measured values, and reference ranges where visible. Do NOT copy text verbatim — rephrase and summarize.

2. IDENTIFIED DISEASES & FINDINGS: Based on the values, identify any abnormal findings, potential diseases, or health conditions indicated by the report. Compare values against standard reference ranges and highlight what is abnormal (high or low).

3. RISK PREDICTION: Based on the findings, provide a risk assessment. What conditions could develop if these values persist or worsen? What is the severity level? Are there any urgent concerns?

4. PERSONALIZED DIET PLAN: Provide a detailed, actionable diet plan to help improve the identified conditions. Include:
   - Foods to eat more of (and why)
   - Foods to avoid (and why)
   - Suggested daily meal structure
   - Any supplements that might help

Format your response EXACTLY as follows:

EXTRACTED_TEXT:
[Your summarized overview of the report data]

DISEASES_AND_FINDINGS:
[Identified diseases, abnormal values, and clinical findings]

RISK_PREDICTION:
[Risk assessment and severity analysis]

DIET_PLAN:
[Detailed personalized diet recommendations]

Be thorough, specific, and medically accurate in your analysis.`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    inlineData: {
                                        mimeType: mimeType,
                                        data: base64Image,
                                    },
                                },
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.4,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 4096,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();

        // Defensive checks for response structure
        if (
            !data.candidates ||
            !data.candidates[0] ||
            !data.candidates[0].content ||
            !data.candidates[0].content.parts ||
            !data.candidates[0].content.parts[0]
        ) {
            console.error('Unexpected Gemini API response:', JSON.stringify(data, null, 2));
            const blockReason = data.candidates?.[0]?.finishReason || data.promptFeedback?.blockReason || 'unknown';
            throw new Error(
                `The AI could not analyze this report (reason: ${blockReason}). Please try a different image or try again later.`
            );
        }

        const analysisText = data.candidates[0].content.parts[0].text;

        // Parse the structured response
        const extractedTextMatch = analysisText.match(
            /EXTRACTED_TEXT:\s*([\s\S]*?)(?=DISEASES_AND_FINDINGS:|$)/i
        );
        const diseasesMatch = analysisText.match(
            /DISEASES_AND_FINDINGS:\s*([\s\S]*?)(?=RISK_PREDICTION:|$)/i
        );
        const predictionMatch = analysisText.match(
            /RISK_PREDICTION:\s*([\s\S]*?)(?=DIET_PLAN:|$)/i
        );
        const dietPlanMatch = analysisText.match(
            /DIET_PLAN:\s*([\s\S]*?)$/i
        );

        return {
            extractedText: extractedTextMatch
                ? extractedTextMatch[1].trim()
                : 'Unable to extract text from the report.',
            diseases: diseasesMatch
                ? diseasesMatch[1].trim()
                : 'Unable to identify diseases. Please consult a healthcare professional.',
            prediction: predictionMatch
                ? predictionMatch[1].trim()
                : 'Unable to generate prediction. Please consult a healthcare professional.',
            dietPlan: dietPlanMatch
                ? dietPlanMatch[1].trim()
                : 'Unable to generate diet plan. Please consult a nutritionist.',
        };
    } catch (error) {
        console.error('Report Analysis Error:', error);
        throw error;
    }
}
