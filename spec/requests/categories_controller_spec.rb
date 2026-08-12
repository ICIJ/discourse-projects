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
    fab!(:topic_in_other, :topic)

    before do
      SiteSetting.desktop_category_page_style = "categories_and_latest_topics"
    end

    # Helper: extract the preloaded topic_list JSON from an HTML response.
    # Discourse embeds serialized data in a <script#data-preloaded> element since
    # core 2026.7, and in a <div#data-preloaded[data-preloaded]> before that.
    # The structure is: { "topic_list" => JSON string of { "topic_list" => { "topics" => [...] } } }
    def preloaded_topic_list(response)
      html = Nokogiri::HTML5(response.body)
      preloaded = html.at_css("script#data-preloaded, div#data-preloaded")
      return nil unless preloaded
      data = JSON.parse(preloaded["data-preloaded"] || preloaded.text)
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

  describe "creator-only category editing" do
    fab!(:owner, :user)
    fab!(:stranger, :user)
    fab!(:group)
    fab!(:project) { Fabricate(:private_category, group: group, user: owner) }
    fab!(:owned) { Fabricate(:category, user: owner, parent_category: project) }

    before do
      SiteSetting.projects_enabled = true
      # See the guardian spec: category creation is granted by a sibling plugin.
      Guardian.any_instance.stubs(:can_create_category?).returns(true)
      # Both users need to see the private project's subcategory.
      group.add(owner)
      group.add(stranger)
    end

    it "lets the creator rename their own category" do
      sign_in(owner)

      put "/categories/#{owned.id}.json", params: { name: "Renamed" }

      expect(response.status).to eq(200)
      expect(owned.reload.name).to eq("Renamed")
    end

    it "refuses a rename by another user" do
      sign_in(stranger)

      put "/categories/#{owned.id}.json", params: { name: "Hijacked" }

      expect(response.status).to eq(403)
      expect(owned.reload.name).not_to eq("Hijacked")
    end

    it "lets the creator delete their own empty category" do
      sign_in(owner)

      delete "/categories/#{owned.id}.json"

      expect(response.status).to eq(200)
      expect(Category.find_by(id: owned.id)).to be_nil
    end

    it "refuses a delete by another user" do
      sign_in(stranger)

      delete "/categories/#{owned.id}.json"

      expect(response.status).to eq(403)
      expect(Category.find_by(id: owned.id)).to be_present
    end

    it "refuses to delete a category that holds topics" do
      sign_in(owner)
      owned.update!(topic_count: 3)

      delete "/categories/#{owned.id}.json"

      expect(response.status).to eq(403)
      expect(Category.find_by(id: owned.id)).to be_present
    end

    it "refuses to delete a project" do
      sign_in(owner)

      delete "/categories/#{project.id}.json"

      expect(response.status).to eq(403)
      expect(Category.find_by(id: project.id)).to be_present
    end
  end

  describe "non-staff category placement" do
    fab!(:owner, :user)
    fab!(:stranger, :user)
    fab!(:group)
    fab!(:other_group, :group)
    fab!(:project) { Fabricate(:private_category, group: group, user: owner) }
    fab!(:hidden_project) { Fabricate(:private_category, group: other_group, user: admin) }
    fab!(:owned) { Fabricate(:category, user: owner, parent_category: project) }

    before do
      SiteSetting.projects_enabled = true
      # See the guardian spec: category creation is granted by a sibling plugin.
      Guardian.any_instance.stubs(:can_create_category?).returns(true)
      group.add(owner)
    end

    it "rejects a non-staff create with no parent_category_id" do
      sign_in(owner)

      expect { post "/categories.json", params: { name: "Orphan Category" } }.not_to change(
        Category,
        :count,
      )

      expect(response.status).to eq(422)
    end

    it "rejects a non-staff create with a parent the user cannot see" do
      sign_in(owner)

      expect {
        post "/categories.json",
             params: { name: "Sneaky Category", parent_category_id: hidden_project.id }
      }.not_to change(Category, :count)

      expect(response.status).to eq(422)
    end

    it "lets a non-staff create with a visible parent succeed" do
      sign_in(owner)

      post "/categories.json", params: { name: "Legit Category", parent_category_id: project.id }

      expect(response.status).to eq(200)
      expect(Category.find_by(name: "Legit Category").parent_category_id).to eq(project.id)
    end

    it "rejects a non-staff detaching their category from its project" do
      sign_in(owner)

      put "/categories/#{owned.id}.json", params: { parent_category_id: "" }

      expect(response.status).to eq(422)
      expect(owned.reload.parent_category_id).to eq(project.id)
    end

    it "rejects a non-staff moving their category to another project" do
      sign_in(owner)

      put "/categories/#{owned.id}.json", params: { parent_category_id: hidden_project.id }

      expect(response.status).to eq(422)
      expect(owned.reload.parent_category_id).to eq(project.id)
    end

    it "lets a non-staff update that does not mention parent_category_id succeed" do
      sign_in(owner)

      put "/categories/#{owned.id}.json", params: { name: "Renamed Category" }

      expect(response.status).to eq(200)
      expect(owned.reload.name).to eq("Renamed Category")
    end

    it "lets a non-staff update that repeats the current parent_category_id succeed" do
      sign_in(owner)

      put "/categories/#{owned.id}.json",
          params: { name: "Still Same Project", parent_category_id: project.id }

      expect(response.status).to eq(200)
      expect(owned.reload.parent_category_id).to eq(project.id)
    end

    it "does not restrict an admin from either check" do
      sign_in(admin)

      post "/categories.json", params: { name: "Admin Top Level Category" }
      expect(response.status).to eq(200)
      admin_category = Category.find_by(name: "Admin Top Level Category")

      put "/categories/#{admin_category.id}.json",
          params: { parent_category_id: hidden_project.id }
      expect(response.status).to eq(200)

      put "/categories/#{admin_category.id}.json", params: { parent_category_id: "" }
      expect(response.status).to eq(200)
    end

    # Without an edit-permission check ahead of the placement guard, these two
    # would return different statuses (422 vs 403) depending on whether the
    # submitted parent_category_id happens to match the real one — letting a
    # stranger probe a category they cannot see for its real parent id.
    it "returns 403 for a non-staff stranger, whichever parent_category_id they submit" do
      sign_in(stranger)

      put "/categories/#{owned.id}.json", params: { parent_category_id: hidden_project.id }
      expect(response.status).to eq(403)

      put "/categories/#{owned.id}.json", params: { parent_category_id: project.id }
      expect(response.status).to eq(403)
    end
  end
end
