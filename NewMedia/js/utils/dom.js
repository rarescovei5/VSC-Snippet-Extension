
export const domUtils = {
  createElement(tag, options = {}) {
    const element = document.createElement(tag);
    if (options.classes) {
      options.classes.forEach(cls => element.classList.add(cls));
    }
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => 
        element.setAttribute(key, value)
      );
    }
    if (options.text) element.textContent = options.text;
    if (options.html) element.innerHTML = options.html;
    return element;
  },
  
};
