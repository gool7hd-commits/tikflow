export function formatTtsText(template, variables) {
  let text = template || '{kullanici}: {yorum}';
  for (const [key, val] of Object.entries(variables)) {
    const regex = new RegExp(`\\{${key}\\}`, 'gi');
    text = text.replace(regex, val || '');
  }
  return text;
}

export default {
  formatTtsText
};
