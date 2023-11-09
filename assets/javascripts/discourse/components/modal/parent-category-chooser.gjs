import Component from "@glimmer/component";
import { action } from "@ember/object";
import { tracked } from "@glimmer/tracking";
import { on } from "@ember/modifier";
import DModal from "discourse/components/d-modal";
import DButton from "discourse/components/d-button";
import CategoryChooser from "select-kit/components/category-chooser";

export default class ParentCategoryChooser extends Component {
  get modalTitle() {
    return I18n.t("js.parent_category_chooser.title");
  }

  @computed
  get isInvalid() {
    return this.value === "" || this.value === null || typeof this.value === "undefined"
  }
  
  @action
  submit(test) {
    if(!this.isInvalid){
      this.args.closeModal({ categoryId: this.value })
    }
  }

  <template>
    <DModal
        @closeModal={{@closeModal}}
        @title={{this.modalTitle}}
      >
        <:body>
          <CategoryChooser
            @value={{this.value}}
            @class="small"
          />
        </:body>
        <:footer>
          <DButton
            @action={{this.submit}}
            @disabled={{this.isInvalid}}
            @label="Continue"
            class="btn-primary"
          />
        </:footer>
      </DModal>
  </template>
}