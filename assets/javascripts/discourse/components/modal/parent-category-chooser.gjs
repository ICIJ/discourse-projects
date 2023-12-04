import Component from "@glimmer/component";
import { action, computed } from "@ember/object";
import { inject as service } from "@ember/service";
import DModal from "discourse/components/d-modal";
import DButton from "discourse/components/d-button";
import ProjectChooser from "../project-chooser";

export default class ParentCategoryChooser extends Component {
  @service service

  get modalTitle() {
    return I18n.t("js.parent_category_chooser.title");
  }

  @computed('value')
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
          <ProjectChooser @value={{this.value}} />
        </:body>
        <:footer>
          <DButton
            @action={{this.submit}}
            @disabled={{this.isInvalid}}
            @label="parent_category_chooser.continue"
            class="btn-primary"
          />
        </:footer>
      </DModal>
  </template>
}