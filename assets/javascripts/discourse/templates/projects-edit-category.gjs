import { i18n } from "discourse-i18n";
import CategoryForm from "../components/category-form";

<template>
  <section class="projects-edit-category">
    <header class="projects-new-category__header">
      <h1>{{i18n "js.edit_category.title"}}</h1>
      <p class="projects-new-category__subtitle">
        {{i18n "js.edit_category.subtitle"}}
      </p>
    </header>

    <CategoryForm @category={{@model}} />
  </section>
</template>
