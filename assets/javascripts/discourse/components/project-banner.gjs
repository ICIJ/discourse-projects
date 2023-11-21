import Component from "@glimmer/component";

export default class ProjectBanner extends Component {

  get label() {
    return I18n.t('js.project_banner.label')
  }

  <template>
    <div class="project-banner__head">
        {{this.label}} <a href{{@category.url}} class="project-banner__link">{{@category.name}}</a>
    </div>
  </template>
}