import Component from "@ember/component";
import { classNames } from "@ember-decorators/component";
import { i18n } from "discourse-i18n";
import SearchAdvancedProjectChooser from "../../components/search-advanced-project-chooser";

@classNames("advanced-search-options-above-outlet", "project-filter")
export default class ProjectFilterConnector extends Component {
  <template>
    <div class="control-group advanced-search-project">
      <label class="control-label">
        {{i18n "search.advanced.in_project.label"}}
      </label>
      <div class="controls">
        <SearchAdvancedProjectChooser
          @id="search-in-project"
          @value={{@outletArgs.searchedTerms.project.id}}
          @onChangeSearchedTermField={{@outletArgs.onChangeSearchedTermField}}
        />
      </div>
    </div>
  </template>
}
