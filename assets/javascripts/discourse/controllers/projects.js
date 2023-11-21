import Controller from "@ember/controller";
import Category from "discourse/models/category";
import { filterBy, sort } from '@ember/object/computed';
import { computed } from '@ember/object';

export default class ProjectsController extends Controller {
  categories = Category.list();
  searchTerm = '';
  sortBy = 'name:asc';

  @filterBy('categories', 'is_project') projects;
  @sort('projects', 'sortByFields') sortedProjects;

  @computed('sortedProjects', 'searchTerm')
  get filteredProjects() {
    const searchTerm = this.searchTerm.toLowerCase();
    return this.sortedProjects.filter(({ name, description, slug }) => {
      // No search term, no filter
      if (!searchTerm) return true;
      // We search in the name, the description and the slug
      return [name, description, slug].some(value => value.toLowerCase().includes(searchTerm));
    });
  }

  @computed('filteredProjects')
  get hasProjects() {
    return this.filteredProjects.length > 0;
  }

  @computed('filteredProjects')
  get showMatches() {
    return this.searchTerm && this.hasProjects;
  }

  @computed('sortBy')
  get sortByFields() {
    return [this.sortBy];
  }

  get sortByOptions() {
    return [
      { value: 'name:asc', name: I18n.t('projects.sort_by.name') },
      { value: 'name:desc', name: I18n.t('projects.sort_by.name_reverse') },
      { value: 'post_count:asc', name: I18n.t('projects.sort_by.post_count') },
      { value: 'post_count:desc', name: I18n.t('projects.sort_by.post_count_reverse') }
    ];
  }
}
