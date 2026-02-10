# frozen_string_literal: true

module DiscourseProjects
  # Overrides CategoriesController#fetch_topic_list to optionally scope the
  # "Latest" topic list on category pages to the current category (and its
  # subcategories) instead of showing topics from the entire site.
  #
  # By default, Discourse's fetch_topic_list builds a TopicQuery without any
  # category filter, so visiting /c/my-project/42/subcategories shows recent
  # topics from ALL categories. When `projects_limit_latest_to_category` is
  # enabled, this override detects the parent category from URL params and
  # passes it as the :category option to TopicQuery, which natively includes
  # subcategory topics. It also rewrites the "More" link to point to the
  # category-scoped latest page (e.g. /c/my-project/42/l/latest).
  #
  # On the top-level /categories page (no parent category in params), the
  # behavior is unchanged — global latest topics are shown as usual.
  module CategoryLatestFiltering
    def self.register(plugin)
      # Resolves the page style variant (latest, top, or hot) from the
      # topics_filter param or the site-wide setting.
      plugin.add_to_class(:categories_controller, :topic_list_style) do |topics_filter|
        topics_filter ? "categories_and_#{topics_filter}_topics" : SiteSetting.desktop_category_page_style
      end

      # Builds base topic query options (mirrors Discourse core defaults).
      plugin.add_to_class(:categories_controller, :base_topic_options) do |style|
        opts = { per_page: CategoriesController.topics_per_page, no_definitions: true }
        opts.merge!(build_topic_list_options)
        opts[:order] = "created" if style == "categories_and_latest_topics"
        opts
      end

      # Resolves the parent category from URL params, if present.
      plugin.add_to_class(:categories_controller, :parent_category_from_params) do
        if params[:parent_category_id].present?
          Category.find_by_slug(params[:parent_category_id]) || Category.find_by(id: params[:parent_category_id].to_i)
        elsif params[:category_slug_path_with_id].present?
          Category.find_by_slug_path_with_id(params[:category_slug_path_with_id])
        end
      end

      # Applies category scoping to topic options when the setting is enabled.
      plugin.add_to_class(:categories_controller, :apply_category_filter) do |topic_options|
        parent = parent_category_from_params if SiteSetting.projects_limit_latest_to_category
        topic_options[:category] = parent.id if parent
        parent
      end

      # Builds the "More" URL for the latest style, scoped to category when filtering.
      plugin.add_to_class(:categories_controller, :latest_more_url) do |parent_category, order|
        parent_category ? "#{parent_category.url}/l/latest" : url_for(latest_path(sort: order))
      end

      # Builds the topic list for the given style and returns it.
      plugin.add_to_class(:categories_controller, :build_topic_list) do |style, topic_options, parent_category|
        case style
        when "categories_and_latest_topics", "categories_and_latest_topics_created_date"
          list = TopicQuery.new(current_user, topic_options).list_latest
          list.more_topics_url = latest_more_url(parent_category, topic_options[:order])
          list
        when "categories_and_top_topics"
          list = TopicQuery.new(current_user, topic_options).list_top_for(SiteSetting.top_page_default_timeframe.to_sym)
          list.more_topics_url = url_for(top_path)
          list
        when "categories_and_hot_topics"
          list = TopicQuery.new(current_user, topic_options).list_hot
          list.more_topics_url = url_for(hot_path)
          list
        end
      end

      # Main override: composes the helpers above to produce a category-scoped topic list.
      plugin.add_to_class(:categories_controller, :fetch_topic_list) do |topics_filter: nil|
        style = topic_list_style(topics_filter)
        topic_options = base_topic_options(style)
        parent_category = apply_category_filter(topic_options)
        @topic_list = build_topic_list(style, topic_options, parent_category)
      end
    end
  end
end
