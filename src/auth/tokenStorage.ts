/// Sesión del validador guardada en sessionStorage (se borra al cerrar la
/// pestaña) — suficiente para un prototipo de revisión, sin necesidad de
/// tocar Identity-Service.
const TOKEN_KEY = 'meditrack_validator_token';
const NAME_KEY = 'meditrack_validator_name';

export const tokenStorage = {
  getToken: (): string | null => sessionStorage.getItem(TOKEN_KEY),
  getName: (): string | null => sessionStorage.getItem(NAME_KEY),
  set: (token: string, name: string) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(NAME_KEY, name);
  },
  clear: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(NAME_KEY);
  },
};
