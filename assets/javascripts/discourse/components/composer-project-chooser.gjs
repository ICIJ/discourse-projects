import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { hash } from "@ember/helper";
import { action } from "@ember/object";
import { not } from "truth-helpers";
import Category from "discourse/models/category";
import ProjectChooser from "./project-chooser";
import SubcategoryChooser from "./subcategory-chooser";

/**
 * Replaces the default category chooser in the composer with two
 * linked dropdowns: one for the project and one for the subcategory.
 *
 * When a project is selected, the subcategory dropdown is scoped to
 * that project's children. Selecting a subcategory sets the composer's
 * categoryId.
 */
export default class ComposerProjectChooser extends Component {
  @tracked selectedProjectId = null;

  constructor() {
    super(...arguments);
    this.initFromComposer();
  }

  get composer() {
    return this.args.composer;
  }

  get hasProject() {
    return !!this.selectedProjectId;
  }

  /**
   * Derive the initial project from the composer's pre-set categoryId.
   * If the composer was opened on a project category, clear the categoryId
   * and pre-select the project. If on a subcategory, pre-select both.
   */
  initFromComposer() {
    const categoryId = this.composer.get("categoryId");
    const category = categoryId ? Category.findById(categoryId) : null;

    if (!category) {
      return;
    }

    if (category.is_project) {
      this.selectedProjectId = category.id;
      this.composer.set("categoryId", null);
    } else {
      this.selectedProjectId =
        category.project?.id ?? category.parent_category_id;
    }
  }

  @action
  onProjectChange(projectId) {
    this.selectedProjectId = projectId;
    this.composer.set("categoryId", null);
  }

  @action
  onSubcategoryChange(categoryId) {
    this.composer.set("categoryId", categoryId);
  }

  <template>
    <div class="composer-project-chooser">
      <div class="composer-project-chooser__project">
        <ProjectChooser
          @value={{this.selectedProjectId}}
          @onChange={{this.onProjectChange}}
          @options={{hash none="js.composer.project.placeholder"}}
        />
      </div>

      <div class="composer-project-chooser__subcategory">
        <SubcategoryChooser
          @parentCategoryId={{this.selectedProjectId}}
          @value={{this.composer.categoryId}}
          @onChange={{this.onSubcategoryChange}}
          @options={{hash
            none="js.composer.subcategory.placeholder"
            disabled=(not this.hasProject)
          }}
        />
      </div>
    </div>
  </template>
}
