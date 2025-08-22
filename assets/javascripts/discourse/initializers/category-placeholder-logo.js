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
          if (!this.showLogoPlaceholder) {
            return null;
          }
          const svg = categoryPlaceholderLogo(
            this.name,
            this.color,
            this.text_color
          );
          const header = "data:image/svg+xml;charset=utf-8";
          const payload = encodeURIComponent(svg);
          const url = `${header},${payload}`;
          return { url, height: 60, width: 60 };
        }

        get showLogoPlaceholder() {
          return this.siteSettings.projects_show_logo_placeholder && this.is_project;
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
