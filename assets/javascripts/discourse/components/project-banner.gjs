import Component from "@glimmer/component";
import I18n from "I18n";

export default class ProjectBanner extends Component {

  get label() {
    return I18n.t('js.project_banner.label')
  }

  get href() {
    return `/c/${this.args.category.slug}/${this.args.category.id}`
  }

  <template>
    <div class="project-banner__wrapper">
      {{this.label}} <a href={{this.href}} class="project-banner__wrapper__link">{{@category.name}}</a>
    </div>
  </template>
}