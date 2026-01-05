function languageInstruction(language) {
  if (language === "da") return "Svar altid på dansk.";
  return `Respond in ${language}.`;
}

module.exports = {
  languageInstruction,
};
