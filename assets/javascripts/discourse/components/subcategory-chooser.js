import { classNames } from "@ember-decorators/component";
import { ajax } from "discourse/lib/ajax";
import Category from "discourse/models/category";
import Site from "discourse/models/site";
import CategoryChooserComponent from "select-kit/components/category-chooser";
import {
  pluginApiIdentifiers,
  selectKitOptions,
} from "select-kit/components/select-kit";

@pluginApiIdentifiers(["subcategory-chooser"])
@classNames("subcategory-chooser")
@selectKitOptions({
  displayCategoryDescription: false,
})
export default class SubcategoryChooser extends CategoryChooserComponent {
  _loadPromise = null;
  _loadedForParent = null;

  init() {
    super.init(...arguments);
    this.ensureLoaded();
  }

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    if (this.parentCategoryId !== this._loadedForParent) {
      this._loadPromise = null;
      this.ensureLoaded();
    }
  }

  get content() {
    return this.allDescendants(this.parentCategoryId);
  }

  async search(filter = "") {
    await this.ensureLoaded();

    const categories = this.allDescendants(this.parentCategoryId);

    if (!filter) {
      return categories;
    }

    const needle = filter.toLowerCase().trim();
    return categories.filter((cat) => cat.name.toLowerCase().includes(needle));
  }

  /**
   * Recursively collect all descendants of a category.
   */
  allDescendants(categoryId) {
    const parent = Category.findById(categoryId);
    const children = parent?.subcategories ?? [];
    const result = [];

    for (const child of children) {
      result.push(child);
      result.push(...this.allDescendants(child.id));
    }

    return result;
  }

  /**
   * Load all descendants in two passes:
   * 1. Fetch direct children of the project
   * 2. Batch-load sub-subcategories by ID for children that have them
   *
   * Caches the promise so subsequent searches don't re-fetch.
   */
  ensureLoaded() {
    if (!this.parentCategoryId) {
      return Promise.resolve();
    }
    if (!this._loadPromise) {
      this._loadedForParent = this.parentCategoryId;
      this._loadPromise = this._loadAll(this.parentCategoryId);
    }
    return this._loadPromise;
  }

  async _loadAll(projectId) {
    // Pass 1: fetch direct children
    const data = await ajax("/categories.json", {
      data: { parent_category_id: projectId },
    });

    const children = data.category_list?.categories ?? [];
    children.forEach((cat) => Site.current().updateCategory(cat));

    // Pass 2: collect all sub-subcategory IDs and load them in one batch
    const subIds = children.flatMap((cat) => cat.subcategory_ids ?? []);

    if (subIds.length) {
      await this._loadByIds(subIds);
    }
  }

  async _loadByIds(ids) {
    const missing = ids.filter((id) => !Category.findById(id));

    if (!missing.length) {
      return;
    }

    const data = await ajax("/categories/find.json", {
      data: { ids: missing },
    });

    (data.categories ?? []).forEach((cat) =>
      Site.current().updateCategory(cat)
    );
  }
}
