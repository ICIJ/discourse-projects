import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { service } from "@ember/service";
import { trustHTML } from "@ember/template";
import { popupAjaxError } from "discourse/lib/ajax-error";
import getURL from "discourse/lib/get-url";
import DiscourseURL from "discourse/lib/url";
import Category from "discourse/models/category";
import { i18n } from "discourse-i18n";

// The form's footer: the delete-blocked alert, then the actions row.
//
// The delete affordance mirrors core's edit-category footer
// (admin/templates/edit-category/tabs.gjs): when the server says the category
// can be deleted, a danger button behind a confirm dialog; otherwise the button
// stays visible as a plain one and reveals `cannot_delete_reason` in an alert
// above the actions. `cannot_delete_reason` is server-rendered HTML — it links
// the oldest topic — hence trustHTML.
//
// The alert sits above the row while its trigger sits inside it, so one
// component owns both.
export default class CategoryFormFooter extends Component {
  // @form, @onCancel, @category (edit mode only)

  @service dialog;

  @tracked showTooltip = false;

  // Mirrors core (admin/controllers/edit-category/tabs.js:103-106): the
  // button always toggles the tooltip, but the alert only actually renders
  // when the server sent a reason. `CategorySerializer#include_can_delete?`
  // only emits `can_delete` when true, and serializers like
  // `SiteCategorySerializer` omit `cannot_delete_reason` entirely — without
  // this guard, clicking the button on such a category would pop an empty
  // yellow box.
  get showDeleteReason() {
    return this.showTooltip && !!this.args.category?.cannot_delete_reason;
  }

  get deleteReason() {
    return trustHTML(this.args.category?.cannot_delete_reason ?? "");
  }

  // Where to land once the category is gone. Its parent if we can resolve one,
  // the projects index otherwise.
  get returnUrl() {
    const parentId = this.args.category?.parent_category_id;
    return Category.findById(parentId)?.url ?? getURL("/projects");
  }

  @action
  toggleDeleteReason() {
    this.showTooltip = !this.showTooltip;
  }

  @action
  confirmDelete() {
    const { category } = this.args;
    const { returnUrl } = this;

    this.dialog.deleteConfirm({
      title: i18n("category.delete_confirm"),
      didConfirm: async () => {
        try {
          await category.destroy();
          DiscourseURL.routeTo(returnUrl);
        } catch (error) {
          popupAjaxError(error);
        }
      },
    });
  }

  <template>
    {{#if this.showDeleteReason}}
      <@form.Alert @type="warning" class="category-form__delete-reason">
        {{this.deleteReason}}
      </@form.Alert>
    {{/if}}

    <div class="category-form__actions">
      <@form.Button
        class="btn-flat category-form__cancel"
        @label="cancel"
        @action={{@onCancel}}
      />

      {{#if @category}}
        {{#if @category.can_delete}}
          <@form.Button
            @action={{this.confirmDelete}}
            @icon="trash-can"
            @label="edit_category.delete"
            class="btn-danger category-form__delete"
          />
        {{else}}
          <@form.Button
            @action={{this.toggleDeleteReason}}
            @icon="circle-question"
            @label="edit_category.delete"
            class="btn-default category-form__delete"
          />
        {{/if}}
      {{/if}}

      <@form.Submit
        @label={{if @category "edit_category.submit" "new_category.submit"}}
      />
    </div>
  </template>
}
