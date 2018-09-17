import config from "./init.config";
import ResizeSensor from "css-element-queries/src/ResizeSensor";

async function kirjastohakemisto(element) {
  if (!element) {
    throw "Passed null element to kirjastohakemisto()";
  }

  const params = extract_params(element.dataset);
  const enable_sandbox = !params.nosandbox;
  const sandbox_height = parseInt(params.height) || "auto";

  sandboxed(enable_sandbox).then(async ([window, viewport]) => {
    const scope = window.document;
    const App = await load_app(params.widget);
    let wrapper = scope.createElement("div");
    wrapper.id = "hakemisto-app-" + Math.floor((Math.random() * 99999));

    viewport.appendChild(wrapper);

    let app = new App(wrapper, params);

    if (enable_sandbox && sandbox_height == "auto") {
      resize_sandbox(window.frameElement, viewport);
    }

    /*
     * MUST load the script sandboxed, otherwise Vue.js injects the styles from the app
     * to the parent document and messes everything up.
     */
    function load_app(app_id) {
      return new Promise((resolve, reject) => {
        const path = [config.path, app_id + ".js"].join("/");
        const script = scope.createElement("script");

        script.src = path;
        script.type = "application/javascript";

        script.addEventListener("load", () => resolve(window["kirjastot.fi." + app_id]));

        scope.head.appendChild(script);
      });
    }
  });

  function extract_params(dataset) {
    let params = Object.create(null);

    for (let key in dataset) {
      if (key == "hakemistoWidget") {
        params.widget = dataset[key];
      } else {
        params[key] = dataset[key].length ? dataset[key] : true;
      }
    }

    if (!params.lang) {
      params.lang = document.documentElement.lang;

      if (!params.lang) {
        params.lang = config.lang;
      }
    }

    return params;
  }

  function sandboxed(enable_sandbox) {
    if (enable_sandbox) {
      return new Promise((resolve, reject) => {
        let sandbox = create_sandbox(params);

        sandbox.addEventListener("load", () => {
          /*
           * NOTE: Additional wrapper is required to ensure that widgets with multiple views
           * will also work with ResizeObserver. Vue replaces the parent node with its own for each view,
           * so we need to what that parent inside another element that is used as the observed element.
           */

          const scope = sandbox.contentWindow.document;

          let base = scope.createElement("base");
          base.setAttribute("target", "_top");
          scope.head.appendChild(base);

          scope.documentElement.className = "zxc-sandbox";
          let wrapper = scope.createElement("div");
          wrapper.className = "zxc-safety-layer";

          scope.body.appendChild(wrapper);
          resolve([sandbox.contentWindow, wrapper]);
        });

        element.appendChild(sandbox);

        if (element.dataset.css) {
          const css = document.querySelector(element.dataset.css).innerText;
          const style = sandbox.contentWindow.document.createElement("style");
          style.innerText = css;
          sandbox.contentWindow.document.body.appendChild(style);
        }
      });
    } else {
      return Promise.resolve([window, element]);
    }
  }

  function create_sandbox(params) {
    let sandbox = document.createElement("iframe");
    sandbox.style.width = "100%";
    sandbox.style.borderWidth = "0";

    if (params.height) {
      sandbox.style.height = params.height + "px";
    }

    return sandbox;
  }

  function resize_sandbox(sandbox, widget) {
    let body = sandbox.contentWindow.document.body;

    function on_resize() {
      // Add 20 px to work around Firefox's margin collapse.
      sandbox.style.height = widget.offsetHeight + "px";
    }

    if (typeof ResizeObserver == "function") {
      let observer = new ResizeObserver(on_resize);
      observer.observe(widget);
    } else {
      let observer = new ResizeSensor(widget, on_resize);
    }
  }
}

window.addEventListener("load", () => {
  document.querySelectorAll('[data-hakemisto-widget]').forEach((container, i) => {
    // hakemisto_widget(container);

    kirjastohakemisto(container);
  });
});

export default kirjastohakemisto;
