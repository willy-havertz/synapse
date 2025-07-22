import { createContext } from "react";

const ThemeContext = createContext({
  dark: true, // default value
  toggleTheme: () => {},
});

export default ThemeContext;
