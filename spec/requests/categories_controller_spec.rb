# frozen_string_literal: true

require "rails_helper"

describe CategoriesController do
  fab!(:admin)
  fab!(:user)

  describe "#fetch_topic_list (CategoryLatestFiltering)" do
    fab!(:parent_category) { Fabricate(:category, slug: "aladdin") }
    fab!(:subcategory) { Fabricate(:category, parent_category: parent_category) }

    fab!(:topic_in_parent) { Fabricate(:topic, category: parent_category) }
    fab!(:topic_in_subcategory) { Fabricate(:topic, category: subcategory) }
    fab!(:topic_in_other) { Fabricate(:topic) }

    before do
      SiteSetting.desktop_category_page_style = "categories_and_latest_topics"
    end

    # Helper: extract the preloaded topic_list JSON from an HTML response.
    # Discourse embeds serialized data in a <div#data-preloaded> element.
    # The structure is: { "topic_list" => JSON string of { "topic_list" => { "topics" => [...] } } }
    def preloaded_topic_list(response)
      html = Nokogiri::HTML5(response.body)
      preloaded = html.at_css("div#data-preloaded")
      return nil unless preloaded
      data = JSON.parse(preloaded["data-preloaded"])
      return nil unless data["topic_list"]
      JSON.parse(data["topic_list"])["topic_list"]
    end

    context "when projects_limit_latest_to_category is enabled" do
      before do
        SiteSetting.projects_limit_latest_to_category = true
      end

      it "scopes latest topics to the parent category on a subcategories page" do
        sign_in(user)

        get "/c/#{parent_category.slug}/#{parent_category.id}/subcategories"

        expect(response.status).to eq(200)

        topic_ids = preloaded_topic_list(response)["topics"].map { |t| t["id"] }
        expect(topic_ids).to include(topic_in_parent.id)
        expect(topic_ids).to include(topic_in_subcategory.id)
        expect(topic_ids).not_to include(topic_in_other.id)
      end

      it "sets the more_topics_url to the category-scoped latest page" do
        sign_in(user)

        SiteSetting.categories_topics = 5
        5.times { Fabricate(:topic, category: parent_category) }

        get "/c/#{parent_category.slug}/#{parent_category.id}/subcategories"

        expect(response.status).to eq(200)

        more_url = preloaded_topic_list(response)["more_topics_url"]
        expect(more_url).to start_with("/c/#{parent_category.slug}/#{parent_category.id}/l/latest")
      end

      it "shows global latest topics on the top-level /categories page" do
        sign_in(user)

        get "/categories"

        expect(response.status).to eq(200)

        topic_ids = preloaded_topic_list(response)["topics"].map { |t| t["id"] }
        expect(topic_ids).to include(topic_in_parent.id)
        expect(topic_ids).to include(topic_in_subcategory.id)
        expect(topic_ids).to include(topic_in_other.id)
      end
    end

    context "when projects_limit_latest_to_category is disabled" do
      before do
        SiteSetting.projects_limit_latest_to_category = false
      end

      it "shows all topics on a subcategories page" do
        sign_in(user)

        get "/c/#{parent_category.slug}/#{parent_category.id}/subcategories"

        expect(response.status).to eq(200)

        topic_ids = preloaded_topic_list(response)["topics"].map { |t| t["id"] }
        expect(topic_ids).to include(topic_in_parent.id)
        expect(topic_ids).to include(topic_in_subcategory.id)
        expect(topic_ids).to include(topic_in_other.id)
      end
    end
  end
end
