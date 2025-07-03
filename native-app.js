// JSON-based DOM generation system
class DOMGenerator {
  constructor() {
    this.state = {};
    this.refs = {};
  }

  // Create DOM element from JSON structure
  createElement(jsonElement, parent = null) {
    if (typeof jsonElement === "string" || typeof jsonElement === "number") {
      return document.createTextNode(jsonElement);
    }

    if (Array.isArray(jsonElement)) {
      const fragment = document.createDocumentFragment();
      jsonElement.forEach((child) => {
        const element = this.createElement(child, parent);
        if (element) fragment.appendChild(element);
      });
      return fragment;
    }

    if (!jsonElement || typeof jsonElement !== "object" || !jsonElement.tag) {
      return null;
    }

    const { tag, props = {}, children = [], ref } = jsonElement;
    const element = document.createElement(tag);

    // Set properties and attributes
    Object.entries(props).forEach(([key, value]) => {
      if (key === "className") {
        element.className = value;
      } else if (key === "onclick" || key.startsWith("on")) {
        const eventName = key.slice(2).toLowerCase();
        element.addEventListener(eventName, value);
      } else if (key === "style" && typeof value === "object") {
        Object.assign(element.style, value);
      } else if (typeof value === "boolean") {
        if (value) element.setAttribute(key, key);
      } else {
        element.setAttribute(key, value);
      }
    });

    // Handle children
    if (children.length > 0) {
      children.forEach((child) => {
        const childElement = this.createElement(child, element);
        if (childElement) element.appendChild(childElement);
      });
    }

    // Store reference if provided
    if (ref) {
      this.refs[ref] = element;
    }

    return element;
  }

  // Update element with new JSON structure
  updateElement(oldElement, newJsonElement, parent) {
    if (!oldElement) {
      return parent.appendChild(this.createElement(newJsonElement, parent));
    }

    if (!newJsonElement) {
      return parent.removeChild(oldElement);
    }

    if (
      typeof oldElement === "string" ||
      typeof newJsonElement === "string" ||
      typeof oldElement === "number" ||
      typeof newJsonElement === "number"
    ) {
      if (oldElement !== newJsonElement) {
        return parent.replaceChild(
          this.createElement(newJsonElement, parent),
          oldElement
        );
      }
    }

    if (oldElement.tagName !== newJsonElement.tag?.toUpperCase()) {
      return parent.replaceChild(
        this.createElement(newJsonElement, parent),
        oldElement
      );
    }

    // Update properties
    if (newJsonElement.props) {
      Object.entries(newJsonElement.props).forEach(([key, value]) => {
        if (key === "className") {
          oldElement.className = value;
        } else if (!key.startsWith("on")) {
          oldElement.setAttribute(key, value);
        }
      });
    }

    return oldElement;
  }

  // Render JSON structure to DOM
  render(jsonElement, container) {
    const element = this.createElement(jsonElement);
    container.innerHTML = "";
    if (element) container.appendChild(element);
  }
}

// Data and constants
const TABS = {
  all: {
    title: "Все",
    items: [
      {
        icon: "light2",
        iconLabel: "Освещение",
        title: "Xiaomi Yeelight LED Smart Bulb",
        subtitle: "Включено",
      },
      {
        icon: "light",
        iconLabel: "Освещение",
        title: "D-Link Omna 180 Cam",
        subtitle: "Включится в 17:00",
      },
      {
        icon: "temp",
        iconLabel: "Температура",
        title: "Elgato Eve Degree Connected",
        subtitle: "Выключено до 17:00",
      },
      {
        icon: "light",
        iconLabel: "Освещение",
        title: "LIFX Mini Day & Dusk A60 E27",
        subtitle: "Включится в 17:00",
      },
      {
        icon: "light2",
        iconLabel: "Освещение",
        title: "Xiaomi Mi Air Purifier 2S",
        subtitle: "Включено",
      },
      {
        icon: "light",
        iconLabel: "Освещение",
        title: "Philips Zhirui",
        subtitle: "Включено",
      },
      {
        icon: "light",
        iconLabel: "Освещение",
        title: "Philips Zhirui",
        subtitle: "Включено",
      },
      {
        icon: "light2",
        iconLabel: "Освещение",
        title: "Xiaomi Mi Air Purifier 2S",
        subtitle: "Включено",
      },
    ],
  },
  kitchen: {
    title: "Кухня",
    items: [
      {
        icon: "light2",
        iconLabel: "Освещение",
        title: "Xiaomi Yeelight LED Smart Bulb",
        subtitle: "Включено",
      },
      {
        icon: "temp",
        iconLabel: "Температура",
        title: "Elgato Eve Degree Connected",
        subtitle: "Выключено до 17:00",
      },
    ],
  },
  hall: {
    title: "Зал",
    items: [
      {
        icon: "light",
        iconLabel: "Освещение",
        title: "Philips Zhirui",
        subtitle: "Выключено",
      },
      {
        icon: "light2",
        iconLabel: "Освещение",
        title: "Xiaomi Mi Air Purifier 2S",
        subtitle: "Выключено",
      },
    ],
  },
  lights: {
    title: "Лампочки",
    items: [
      {
        icon: "light",
        iconLabel: "Освещение",
        title: "D-Link Omna 180 Cam",
        subtitle: "Включится в 17:00",
      },
      {
        icon: "light",
        iconLabel: "Освещение",
        title: "LIFX Mini Day & Dusk A60 E27",
        subtitle: "Включится в 17:00",
      },
      {
        icon: "light2",
        iconLabel: "Освещение",
        title: "Xiaomi Mi Air Purifier 2S",
        subtitle: "Включено",
      },
      {
        icon: "light",
        iconLabel: "Освещение",
        title: "Philips Zhirui",
        subtitle: "Включено",
      },
    ],
  },
  cameras: {
    title: "Камеры",
    items: [
      {
        icon: "light2",
        iconLabel: "Освещение",
        title: "Xiaomi Mi Air Purifier 2S",
        subtitle: "Включено",
      },
    ],
  },
};

// Multiply items for performance testing
const originalItems = TABS.all.items;
const multiplier = Math.pow(2, 6);
TABS.all.items = Array.from({ length: multiplier }, () => originalItems).flat();

const TABS_KEYS = Object.keys(TABS);

// Application state management
class AppState {
  constructor() {
    this.state = {
      activeTab: "all",
    };
    this.listeners = [];
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  getState() {
    return this.state;
  }
}

// Component generators (return JSON structures)
function createEvent({ icon, iconLabel, title, subtitle, slim = false }) {
  return {
    tag: "li",
    props: {
      className: `event${slim ? " event_slim" : ""}`,
    },
    children: [
      {
        tag: "button",
        props: {
          className: "event__button",
        },
        children: [
          {
            tag: "span",
            props: {
              className: `event__icon event__icon_${icon}`,
              role: "img",
              "aria-label": iconLabel,
            },
          },
          {
            tag: "h3",
            props: {
              className: "event__title",
            },
            children: [title],
          },
          ...(subtitle
            ? [
                {
                  tag: "span",
                  props: {
                    className: "event__subtitle",
                  },
                  children: [subtitle],
                },
              ]
            : []),
        ],
      },
    ],
  };
}

function createHorizontalVirtualizedList(activeTab, domGenerator) {
  const items = TABS[activeTab]?.items ?? [];

  return {
    tag: "div",
    props: {
      className: "section__panel-wrapper",
    },
    children: [
      {
        tag: "div",
        props: {
          className: "section__panel",
          role: "tabpanel",
          id: `panel_${activeTab}`,
          "aria-labelledby": `tab_${activeTab}`,
        },
        ref: "horizontalList",
        children: [
          {
            tag: "ul",
            props: {
              className: "section__panel-list",
            },
            children: items.map((item, index) =>
              createEvent({ ...item, key: index })
            ),
          },
        ],
      },
      {
        tag: "button",
        props: {
          className: "section__arrow",
          onclick: () => {
            const listElement = domGenerator.refs.horizontalList;
            if (listElement) {
              listElement.scrollTo({
                left: listElement.scrollLeft + 400,
                behavior: "smooth",
              });
            }
          },
        },
        children: [
          {
            tag: "img",
            props: {
              className: "section__arrow_icon",
              src: "assets/images/arrow-left.svg",
            },
          },
        ],
      },
    ],
  };
}

function createMainComponent(appState, domGenerator) {
  const { activeTab } = appState.getState();

  return {
    tag: "main",
    props: {
      className: "main",
    },
    children: [
      // Hero section
      {
        tag: "section",
        props: {
          className: "section main__general",
        },
        children: [
          {
            tag: "h2",
            props: {
              className:
                "section__title section__title-header section__main-title",
            },
            children: ["Главное"],
          },
          {
            tag: "div",
            props: {
              className: "hero-dashboard",
            },
            children: [
              {
                tag: "div",
                props: {
                  className: "hero-dashboard__primary",
                },
                children: [
                  {
                    tag: "h3",
                    props: {
                      className: "hero-dashboard__title",
                    },
                    children: ["Привет, Геннадий!"],
                  },
                  {
                    tag: "p",
                    props: {
                      className: "hero-dashboard__subtitle",
                    },
                    children: ["Двери и окна закрыты, сигнализация включена."],
                  },
                  {
                    tag: "ul",
                    props: {
                      className: "hero-dashboard__info",
                    },
                    children: [
                      {
                        tag: "li",
                        props: {
                          className: "hero-dashboard__item",
                        },
                        children: [
                          {
                            tag: "div",
                            props: {
                              className: "hero-dashboard__item-title",
                            },
                            children: ["Дома"],
                          },
                          {
                            tag: "div",
                            props: {
                              className: "hero-dashboard__item-details",
                            },
                            children: [
                              "+23",
                              {
                                tag: "span",
                                props: {
                                  className: "a11y-hidden",
                                },
                                children: ["°"],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        tag: "li",
                        props: {
                          className: "hero-dashboard__item",
                        },
                        children: [
                          {
                            tag: "div",
                            props: {
                              className: "hero-dashboard__item-title",
                            },
                            children: ["За окном"],
                          },
                          {
                            tag: "div",
                            props: {
                              className: "hero-dashboard__item-details",
                            },
                            children: [
                              "+19",
                              {
                                tag: "span",
                                props: {
                                  className: "a11y-hidden",
                                },
                                children: ["°"],
                              },
                              {
                                tag: "div",
                                props: {
                                  className:
                                    "hero-dashboard__icon hero-dashboard__icon_rain",
                                  role: "img",
                                  "aria-label": "Дождь",
                                },
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                tag: "ul",
                props: {
                  className: "hero-dashboard__schedule",
                },
                children: [
                  createEvent({
                    icon: "temp",
                    iconLabel: "Температура",
                    title: "Philips Cooler",
                    subtitle: "Начнет охлаждать в 16:30",
                  }),
                  createEvent({
                    icon: "light",
                    iconLabel: "Освещение",
                    title: "Xiaomi Yeelight LED Smart Bulb",
                    subtitle: "Включится в 17:00",
                  }),
                  createEvent({
                    icon: "light",
                    iconLabel: "Освещение",
                    title: "Xiaomi Yeelight LED Smart Bulb",
                    subtitle: "Включится в 17:00",
                  }),
                ],
              },
            ],
          },
        ],
      },
      // Scripts section
      {
        tag: "section",
        props: {
          className: "section main__scripts",
        },
        children: [
          {
            tag: "h2",
            props: {
              className: "section__title section__title-header",
            },
            children: ["Избранные сценарии"],
          },
          {
            tag: "ul",
            props: {
              className: "event-grid",
            },
            children: [
              createEvent({
                slim: true,
                icon: "light2",
                iconLabel: "Освещение",
                title: "Выключить весь свет в доме и во дворе",
              }),
              createEvent({
                slim: true,
                icon: "schedule",
                iconLabel: "Расписание",
                title: "Я ухожу",
              }),
              createEvent({
                slim: true,
                icon: "light2",
                iconLabel: "Освещение",
                title: "Включить свет в коридоре",
              }),
              createEvent({
                slim: true,
                icon: "temp2",
                iconLabel: "Температура",
                title: "Набрать горячую ванну",
                subtitle: "Начнётся в 18:00",
              }),
              createEvent({
                slim: true,
                icon: "temp2",
                iconLabel: "Температура",
                title: "Сделать пол тёплым во всей квартире",
              }),
            ],
          },
        ],
      },
      // Devices section
      {
        tag: "section",
        props: {
          className: "section main__devices",
        },
        children: [
          {
            tag: "div",
            props: {
              className: "section__title",
            },
            children: [
              {
                tag: "h2",
                props: {
                  className: "section__title-header",
                },
                children: ["Избранные устройства"],
              },
              {
                tag: "select",
                props: {
                  className: "section__select",
                  onchange: (event) => {
                    appState.setState({ activeTab: event.target.value });
                  },
                },
                children: TABS_KEYS.map((key) => ({
                  tag: "option",
                  props: {
                    value: key,
                    ...(key === activeTab ? { selected: true } : {}),
                  },
                  children: [TABS[key].title],
                })),
              },
              {
                tag: "ul",
                props: {
                  className: "section__tabs",
                  role: "tablist",
                },
                children: TABS_KEYS.map((key) => ({
                  tag: "li",
                  props: {
                    className: `section__tab${
                      key === activeTab ? " section__tab_active" : ""
                    }`,
                    role: "tab",
                    "aria-selected": key === activeTab ? "true" : "false",
                    ...(key === activeTab ? { tabindex: "0" } : {}),
                    id: `tab_${key}`,
                    "aria-controls": `panel_${key}`,
                    onclick: () => {
                      appState.setState({ activeTab: key });
                    },
                  },
                  children: [TABS[key].title],
                })),
              },
            ],
          },
          createHorizontalVirtualizedList(activeTab, domGenerator),
        ],
      },
    ],
  };
}

// Initialize application
class SmartHomeApp {
  constructor() {
    this.appState = new AppState();
    this.domGenerator = new DOMGenerator();
    this.container = document.getElementById("app");

    // Initialize state from URL
    const urlParams = new URLSearchParams(location.search);
    const tabFromUrl = urlParams.get("tab");
    if (tabFromUrl && TABS_KEYS.includes(tabFromUrl)) {
      this.appState.setState({ activeTab: tabFromUrl });
    }

    // Subscribe to state changes
    this.appState.subscribe(() => {
      this.render();
      this.updateScrollButton();
    });

    // Initial render
    this.render();
    this.updateScrollButton();
  }

  render() {
    const appJson = createMainComponent(this.appState, this.domGenerator);
    this.domGenerator.render(appJson, this.container);
  }

  updateScrollButton() {
    // Check if scroll button should be visible
    setTimeout(() => {
      const listElement = this.domGenerator.refs.horizontalList;
      const arrowElement = this.container.querySelector(".section__arrow");

      if (listElement && arrowElement) {
        const hasRightScroll =
          listElement.scrollWidth >
          listElement.offsetWidth + listElement.scrollLeft;
        arrowElement.style.display = hasRightScroll ? "block" : "none";
      }
    }, 0);
  }
}

// Start the application when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new SmartHomeApp();
  });
} else {
  new SmartHomeApp();
}
