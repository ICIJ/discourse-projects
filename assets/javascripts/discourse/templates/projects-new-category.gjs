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
    <div class="projects-new-category__card">
      <CategoryForm
        @parentCategoryId={{@controller.numericParentCategoryId}}
        @onCreated={{@controller.onCreated}}
      />
    </div>
  </section>
</template>
