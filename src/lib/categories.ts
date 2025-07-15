
export const bolaoCategories = {
  "Competições Nacionais": ["Brasileirão Série A", "Brasileirão Série B", "Copa do Brasil"],
  "Competições Estaduais": ["Paulistão", "Carioca", "Mineiro"],
  "Competições Internacionais": ["Libertadores", "Champions League", "Copa do Mundo"],
  "Futebol Amador/Várzea": [],
};

export type Category = keyof typeof bolaoCategories;
