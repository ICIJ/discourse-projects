import { tracked } from "@glimmer/tracking";
import Controller from "@ember/controller";
import { computed } from "@ember/object";
import { sort } from "@ember/object/computed";
import { i18n } from "discourse-i18n";

export default class ProjectsController extends Controller {
  @tracked searchTerm = "";
  @tracked sortBy = "name:asc";

  @sort("projects", "sortByFields") sortedProjects;

  @computed("sortBy", "searchTerm")
  get filteredProjects() {
    const searchTerm = this.searchTerm.toLowerCase();
    return this.sortedProjects.filter(({ name, description, slug }) => {
      // No search term, no filter
      if (!searchTerm) {
        return true;
      }
      // We search in the name, the description and the slug
      return [name, description, slug].some((value) =>
        value?.toLowerCase().includes(searchTerm)
      );
    });
  }

  @computed("filteredProjects")
  get hasProjects() {
    return this.filteredProjects.length > 0;
  }

  @computed("filteredProjects")
  get showMatches() {
    return this.searchTerm && this.hasProjects;
  }

  @computed("sortBy")
  get sortByFields() {
    return [this.sortBy];
  }

  get sortByOptions() {
    return [
      { value: "name:asc", name: i18n("projects.sort_by.name") },
      { value: "name:desc", name: i18n("projects.sort_by.name_reverse") },
      { value: "post_count:asc", name: i18n("projects.sort_by.post_count") },
      {
        value: "post_count:desc",
        name: i18n("projects.sort_by.post_count_reverse"),
      },
    ];
  }

  get projectsListStyle() {
    const th = i18n("projects.list.th");
    return `--projects-list-th: '${th}'`;
  }

}
