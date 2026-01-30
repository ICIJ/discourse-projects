# Discourse Projects Plugin

Organize your Discourse instance by using **projects** to separate and structure categories and topics.

A **project** is a top-level category (no parent) that serves as a container for subcategories. If `projects_private` is enabled, only read-restricted top-level categories are considered projects.

---

## Features

### Core Functionality

- **Project identification**: Top-level categories are automatically treated as projects
- **Project serialization**: Categories and topics include their parent project in API responses
- **Recursive ancestry**: Categories can look up their project via ancestor traversal

### Categories Page Customization

When `projects_hide_projects_from_categories_page` is enabled:

- The `/categories` page displays **project subcategories** (level 1) instead of projects themselves
- Subcategories appear as top-level items with a **project badge** showing their parent project
- The `/c/:slug/subcategories` page continues to show subcategories normally

### Sorting

When `projects_sort_categories_alphabetically` is enabled:

- Categories are sorted alphabetically (case-insensitive) instead of by position
- Applies to both the global category cache and category list pages

### UI Enhancements

- **Project banner**: Displays a banner on project pages (configurable routes and nesting levels)
- **Project dropdown**: Adds a project selector in breadcrumbs
- **Sidebar customization**: Highlights project links, optionally hides category section
- **Logo placeholder**: Shows placeholder for projects without custom logos
- **Styled links**: Alternative styling for project links

---

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `projects_enabled` | `true` | Activate projects |
| `projects_private` | `true` | Only read-restricted top-level categories are projects |
| `projects_sort_categories_alphabetically` | `true` | Sort categories alphabetically instead of by position |
| `projects_hide_projects_from_categories_page` | `false` | Show project subcategories instead of projects on `/categories` |
| `projects_addon` | `true` | Show project addon next to category on topic list |
| `projects_banner` | `true` | Show banner on project pages |
| `projects_banner_sticky` | `true` | Make project banner sticky |
| `projects_banner_min_level` | `0` | Minimum nesting level for banner display |
| `projects_banner_max_level` | `4` | Maximum nesting level for banner display |
| `projects_banner_routes` | `discovery\|subcategories\|...` | Routes where banner is shown |
| `projects_category_requires_parent` | `true` | New categories require a parent |
| `projects_hide_navigation_menu_categories` | `false` | Hide categories section in navigation menu |
| `projects_highlight_projects_sidebar_link` | `true` | Highlight projects link in sidebar |
| `projects_show_logo_placeholder` | `true` | Show placeholder for projects without logo |
| `projects_styled_links` | `true` | Use alternative style for project links |
| `projects_home_logo_to_projects` | `false` | Make homepage logo link to projects page |

---

## Architecture

### Project Definition

A category is considered a **project** if:
1. It has no parent category (`parent_category_id IS NULL`)
2. It is not the "Uncategorized" category
3. If `projects_private` is enabled: it must be read-restricted

### Backend Implementation

#### Category Extension (`lib/discourse_projects/category_extension.rb`)

Extends the `Category` model with:

- **Scopes**: `Category.projects` returns all project categories
- **Methods**:
  - `category.project?` - Returns true if this category is a project
  - `category.project` - Returns the parent project for subcategories
  - `category.ancestors` - Returns all ancestor categories using recursive SQL

#### Category Sorting (`lib/discourse_projects/category_sorting.rb`)

Registers two modifiers:

1. **`:site_all_categories_cache_query`** - Sorts the global category cache alphabetically

2. **`:category_list_find_categories_query`** - Handles `/categories` page filtering:
   - When `projects_hide_projects_from_categories_page` is enabled
   - Builds an Arel subquery to find project IDs
   - Filters to show only direct children of projects
   - Re-applies `secured(guardian)` for permission checks

```ruby
# Simplified logic
project_ids_subquery = categories.project(categories[:id])
  .where(categories[:parent_category_id].eq(nil))
  .where(categories[:id].not_eq(SiteSetting.uncategorized_category_id))

query.where(categories[:parent_category_id].in(project_ids_subquery))
```

#### Serializers (`plugin.rb`)

Adds project data to API responses:

- `basic_category` serializer: `is_project` and `project` fields
- `topic_list_item` serializer: `project` field

### Frontend Implementation

#### Categories as Top-Level (`api-initializers/categories-as-top-level.js`)

When `projects_hide_projects_from_categories_page` is enabled:

1. Overrides `CategoryList.categoriesFrom` static method
2. On the `/categories` page (no parent category):
   - Preserves original `parent_category_id` in `_original_parent_category_id`
   - Sets `parent_category_id` to `null` so categories render as top-level
3. Registers a value transformer to add `project-subcategory-as-top-level` CSS class

```javascript
// Categories appear as top-level but retain original parent reference
const modifiedResult = {
  ...result,
  category_list: {
    ...result.category_list,
    categories: result.category_list.categories.map((c) => ({
      ...c,
      _original_parent_category_id: c.parent_category_id,
      parent_category_id: null,
    })),
  },
};
```

#### Project Badge Connector (`connectors/below-category-title-link/project-badge.gjs`)

Plugin outlet connector that:

1. Checks if current route is `discovery.categories` or `discovery.subcategories`
2. Renders project badge below category title when category has a project

---

## File Structure

```
discourse-projects/
├── plugin.rb                          # Plugin entry point, serializers, routes
├── config/
│   ├── settings.yml                   # Plugin settings definitions
│   └── locales/
│       └── server.en.yml              # Setting descriptions
├── lib/
│   ├── engine.rb                      # Rails engine configuration
│   └── discourse_projects/
│       ├── category_extension.rb      # Category model extensions
│       ├── category_sorting.rb        # Category list filtering/sorting
│       ├── topic_extension.rb         # Topic model extensions
│       └── application_layout_preloader_extension.rb
└── assets/
    ├── stylesheets/
    │   └── common/
    │       └── index.scss             # Plugin styles
    └── javascripts/discourse/
        ├── api-initializers/
        │   ├── categories-as-top-level.js  # CategoryList override
        │   └── add-category-column.gjs
        ├── connectors/
        │   ├── below-category-title-link/
        │   │   └── project-badge.gjs       # Project badge component
        │   ├── above-main-container/
        │   ├── bread-crumbs-left/
        │   └── ...
        ├── components/
        │   ├── project-banner.gjs
        │   ├── project-dropdown.js
        │   └── ...
        ├── models/
        │   └── Project.js
        ├── services/
        │   └── project.js
        ├── helpers/
        │   └── project-link.js
        └── initializers/
            └── ...
```

---

## Maintenance Notes

### Known Fragility Points

1. **Internal state access**: The backend uses `instance_variable_get` to access `@options` and `@guardian` from `CategoryList`. These are internal implementation details that could change.

2. **Static method override**: The frontend overrides `CategoryList.categoriesFrom`, which is not a documented extension point. Discourse upgrades may require adjustments.

3. **Data mutation**: Setting `parent_category_id` to `null` in the frontend is a workaround. Other UI components relying on this field may behave unexpectedly.

### Recommendations

- **Test after Discourse upgrades**: The modifier hooks and method overrides may break
- **Monitor deprecation warnings**: Discourse may introduce official extension points
- **Consider upstream contributions**: Propose proper hooks for category list customization

### Extension Points Used

| Type | Name | Purpose |
|------|------|---------|
| Modifier | `:site_all_categories_cache_query` | Sort global category cache |
| Modifier | `:category_list_find_categories_query` | Filter/sort category list |
| API | `api.modifyClass('model:category-list')` | Override CategoryList behavior |
| API | `api.registerValueTransformer` | Add CSS classes to category rows |
| Outlet | `below-category-title-link` | Inject project badge |
| Serializer | `add_to_serializer` | Add project data to responses |

---

## Custom Routes

| Route | Controller | Description |
|-------|------------|-------------|
| `/new-subcategory/:parent` | `categories#show` | Create subcategory form |
| `/c/*category_slug/categories` | `categories#find_by_slug` | Subcategories index |
| `/c/*category_slug/members` | `categories#find_by_slug` | Project members |

---

## Keeping the Plugin Up to Date

This plugin is built on the [Discourse Plugin Skeleton](https://github.com/discourse/discourse-plugin-skeleton).

To rebase your fork with the latest changes from upstream:

```bash
git remote add upstream git@github.com:discourse/discourse-plugin-skeleton.git
git fetch upstream
git rebase upstream/main
```
