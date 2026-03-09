/**
 * Formats AI-generated text by removing stars, cleaning up formatting,
 * and structuring the content for better display
 */
export function formatAIText(text: string): string {
  if (!text) return '';

  return text
    // Remove markdown bold/italic stars
    .replace(/\*\*\*/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Trim each line
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n\n');
}

/**
 * Parses AI text into structured sections for better rendering
 */
export function parseAITextToSections(text: string): Array<{ title?: string; content: string }> {
  if (!text) return [];

  const cleaned = formatAIText(text);
  const sections: Array<{ title?: string; content: string }> = [];
  
  // Split by double newlines to get paragraphs
  const paragraphs = cleaned.split('\n\n');
  
  paragraphs.forEach(para => {
    // Check if paragraph looks like a heading (short, ends with colon)
    if (para.length < 100 && para.endsWith(':')) {
      sections.push({ title: para.replace(':', ''), content: '' });
    } else if (sections.length > 0 && !sections[sections.length - 1].content) {
      // Add to previous section if it had a title
      sections[sections.length - 1].content = para;
    } else {
      sections.push({ content: para });
    }
  });

  return sections;
}
