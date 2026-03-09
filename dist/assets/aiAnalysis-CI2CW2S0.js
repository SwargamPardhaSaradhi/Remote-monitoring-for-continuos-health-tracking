async function h(t,a){const r="AIzaSyCSFa4GGw45XoQRPSw3plIDUrcyX0xFSZc",d=`You are a medical AI assistant analyzing health vitals data. Analyze the following health metrics and provide insights.

Current Vital Signs:
- Heart Rate: ${t.heart_rate} BPM
- Blood Pressure: ${t.systolic_bp}/${t.diastolic_bp} mmHg
- Oxygen Saturation: ${t.oxygen_saturation}%
- Body Temperature: ${t.body_temperature}°F

${a.length>0?`Previous Measurements History (Last ${a.length} readings):
${a.map((e,o)=>`${o+1}. HR: ${e.heart_rate} BPM, BP: ${e.systolic_bp}/${e.diastolic_bp}, SpO₂: ${e.oxygen_saturation}%, Temp: ${e.body_temperature}°F`).join(`
`)}`:"No previous measurements available."}

Based on this data, provide:

1. DISEASE RISK PREDICTION: Analyze patterns and identify potential health risks or conditions that should be monitored. Look for trends, abnormal values, and potential early warning signs. Be specific about what conditions might develop if trends continue.

2. PERSONALIZED DIET RECOMMENDATIONS: Provide specific dietary suggestions to improve or maintain these vital signs. Include foods to eat more of, foods to avoid, and explain why each recommendation helps.

Format your response EXACTLY as follows:

DISEASE_PREDICTION:
[Your detailed disease risk analysis here]

DIET_RECOMMENDATIONS:
[Your detailed dietary recommendations here]

Be thorough, specific, and actionable in your recommendations.`;try{const e=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${r}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:d}]}],generationConfig:{temperature:.7,topK:40,topP:.95,maxOutputTokens:1024}})});if(!e.ok){const p=await e.json();throw new Error(`Gemini API error: ${JSON.stringify(p)}`)}const n=(await e.json()).candidates[0].content.parts[0].text,i=n.match(/DISEASE_PREDICTION:\s*([\s\S]*?)(?=DIET_RECOMMENDATIONS:|$)/i),s=n.match(/DIET_RECOMMENDATIONS:\s*([\s\S]*?)$/i),l=i?i[1].trim():"Unable to generate prediction. Please consult a healthcare professional.",c=s?s[1].trim():"Unable to generate recommendations. Please consult a nutritionist.";return{diseasePrediction:l,dietRecommendations:c}}catch(e){throw console.error("AI Analysis Error:",e),e}}export{h as analyzeHealthData};
