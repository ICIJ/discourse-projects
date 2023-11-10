import CategoryChooserComponent from "select-kit/components/category-chooser";

export default CategoryChooserComponent.extend({
  pluginApiIdentifiers: ["project-chooser"],
  classNames: ["project-chooser"],
  services: ['site'],

  selectKitOptions: {
    displayCategoryDescription: true
  },

  get content(){
    return this.site.categories.filter((category) => {
      return category.read_restricted && (!category.parent_category_id || category.parent_category_id === 0)
    })
  }
});
