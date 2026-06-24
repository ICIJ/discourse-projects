import { array, concat } from "@ember/helper";
import { i18n } from "discourse-i18n";
import CategoryForm from "../components/category-form";

<template>
  <section class="projects-new-category">
    <header class="projects-new-category__header">
      <h1>{{i18n "js.new_category.title"}}</h1>
      <p class="projects-new-category__subtitle">
        {{i18n "js.new_category.subtitle"}}
      </p>
    </header>
    {{! Re-mount the form whenever the preselection changes. /categories/new is
    a single route, so without a changing key Ember would reuse one form
    instance and its once-seeded fields would keep a previous selection. }}
    {{#each
      (array
        (concat
          @controller.numericProjectId "/" @controller.numericParentCategoryId
        )
      )
      key="@identity"
      as |seed|
    }}
      <CategoryForm
        @key={{seed}}
        @projectId={{@controller.numericProjectId}}
        @parentCategoryId={{@controller.numericParentCategoryId}}
      />
    {{/each}}
  </section>
</template>
