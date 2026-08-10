import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { service } from "@ember/service";
import { trustHTML } from "@ember/template";
import { ajax } from "discourse/lib/ajax";
import { popupAjaxError } from "discourse/lib/ajax-error";
import Composer from "discourse/models/composer";
import DDecoratedHtml from "discourse/ui-kit/d-decorated-html";
import { i18n } from "discourse-i18n";

// Edit mode only. `category.description` holds the *cooked* HTML of the
// category definition topic's first post, not the markdown the create form's
// textarea produces, so round-tripping it through the form would degrade the
// author's formatting. Render it read-only and hand editing to the composer,
// exactly as core's admin form does
// (admin/components/upsert-category/general.gjs).
export default class CategoryFormDescriptionDisplay extends Component {
  // @category, @form

  @service composer;
  @service store;

  @tracked loading = false;

  // DDecoratedHtml requires an htmlSafe string; `category.description` is a
  // plain string of the definition topic's cooked HTML.
  get descriptionHtml() {
    return trustHTML(this.args.category.description ?? "");
  }

  @action
  async editDescription() {
    this.loading = true;

    try {
      const topicData = await ajax(`${this.args.category.topic_url}.json`);
      const firstPost = topicData.post_stream?.posts?.[0];
      if (!firstPost) {
        return;
      }

      this.composer.close();

      const post = this.store.createRecord("post", firstPost);
      const topic = this.store.createRecord("topic", topicData);
      post.set("topic", topic);

      await this.composer.open({
        post,
        topic,
        action: Composer.EDIT,
        draftKey: topicData.draft_key || `topic_${topicData.id}`,
        draftSequence: topicData.draft_sequence ?? 0,
        skipJumpOnSave: true,
      });
    } catch (error) {
      popupAjaxError(error);
    } finally {
      this.loading = false;
    }
  }

  <template>
    <@form.Container
      @title={{i18n "js.edit_category.description.label"}}
      class="category-form__description"
    >
      <DDecoratedHtml
        @html={{this.descriptionHtml}}
        @className="readonly-field"
      />

      {{#if @category.topic_url}}
        <@form.Button
          @action={{this.editDescription}}
          @icon="pencil"
          @label="edit_category.description.edit"
          @isLoading={{this.loading}}
          class="btn-default btn-small category-form__edit-description"
        />
      {{/if}}
    </@form.Container>
  </template>
}
