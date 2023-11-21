import { computed } from "@ember/object";
import { htmlSafe } from "@ember/template";
import DiscourseURL from "discourse/lib/url";
import Category from "discourse/models/category";
import CategoryDrop from "select-kit/components/category-drop";


const ALL_PROJECTS_ID = "ALL_PROJECTS_ID"

export default CategoryDrop.extend({

  pluginApiIdentifiers: ["group-category-dropdown"],
  classNames: "group-category-dropdown",

  content: computed(function() {
    const all = {
      id: ALL_PROJECTS_ID,
      name:this.noneLabel, 
      title:this.noneLabel,
      value:ALL_PROJECTS_ID,
      label:htmlSafe(`<b>${this.noneLabel}</b>`)
   
    }
    return [all,...Category.list().filter(c=>c.is_project)]
  }),
  selectKitOptions: {
    none: "project_drop.all_projects",
  },

  allCategoriesLabel: computed( "parentCategoryName", "selectKit.options.subCategory",
    function () {
      if (this.editingCategory) {
        return this.noCategoriesLabel;
      }
      if (this.selectKit.options.subCategory) {
        return I18n.t("categories.all_subcategories", {
          categoryName: this.parentCategoryName,
        });
      }
      return this.noneLabel;
    }
  ),

  get noneLabel(){
    return I18n.t(this.selectKit.options.none)
  },
  
  actions: {
    onChange(categoryId) {
      if(categoryId == ALL_PROJECTS_ID){
        DiscourseURL.routeToUrl("/projects");
      } else {
        this._super(categoryId)
      }
    
    },
  },
});