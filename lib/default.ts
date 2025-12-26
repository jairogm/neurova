export const DEFAULT_EDITOR_DATA_TOOLS = {
  header: {
    text: "Título",
    level: 2,
  },
  checklist: {
    items: [{ text: "Tarea 1", checked: false }],
  },
  list: {
    style: "unordered",
    items: ["Elemento 1", "Elemento 2"],
  },
  image: {
    file: { url: "https://placekitten.com/300/200" },
    caption: "Gatito 🐱",
    withBorder: true,
    stretched: false,
    withBackground: false,
  },
  warning: {
    title: "Advertencia",
    message: "Este es un mensaje de advertencia.",
  },
  delimiter: {},
};
