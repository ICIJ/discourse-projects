import { service } from "@ember/service";
import { withPluginApi } from "discourse/lib/plugin-api";
import categoryPlaceholderLogo from "../helpers/category-logo-placeholder";

function initialize(api) {
  api.modifyClass(
    "model:category",
    (Superclass) =>
      class extends Superclass {
        @service siteSettings;

        init() {
          super.init(...arguments);
          this.uploaded_logo ||= this.uploaded_logo_placeholder;
        }

        get uploaded_logo_placeholder() {
          const svg = categoryPlaceholderLogo(
            this.name,
            this.color,
            this.text_color,
            60,
            60
          );
          const url =
            "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
          return { url, height: 60, width: 60 };
        }
      }
  );
}

export default {
  name: "category-placeholder-logo",
  initialize() {
    withPluginApi("1.8.0", initialize);
  },
};
