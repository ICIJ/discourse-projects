import { i18n } from "discourse-i18n";
import CategoryForm from "../components/category-form";

<template>
  <section class="projects-new-category">
    <h1>{{i18n "js.new_category.title"}}</h1>
    <CategoryForm
      @parentCategoryId={{@controller.numericParentCategoryId}}
      @onCreated={{@controller.onCreated}}
    />
  </section>
</template>
