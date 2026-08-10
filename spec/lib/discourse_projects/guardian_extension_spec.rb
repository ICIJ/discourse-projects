# frozen_string_literal: true

RSpec.describe DiscourseProjects::GuardianExtension do
  fab!(:owner, :user)
  fab!(:other, :user)
  fab!(:admin)
  fab!(:group)

  # `projects_private` defaults to true, so a project is a read-restricted
  # top-level category.
  fab!(:project) { Fabricate(:private_category, group: group, user: owner) }
  fab!(:category) { Fabricate(:category, user: owner, parent_category: project) }

  before { SiteSetting.projects_enabled = true }

  # Creating categories is opened up to groups by a sibling plugin
  # (discourse-datashare), which is not loaded in this suite. Stub the
  # capability on the guardian under test so these specs exercise only the
  # ownership branch this plugin adds.
  def guardian_for(user, can_create: true)
    Guardian.new(user).tap { |g| g.stubs(:can_create_category?).returns(can_create) }
  end

  describe "#can_edit_category?" do
    it "lets the creator edit their own subcategory" do
      expect(guardian_for(owner).can_edit_category?(category)).to be_truthy
    end

    it "does not let another user edit it" do
      expect(guardian_for(other).can_edit_category?(category)).to be_falsey
    end

    it "does not let a user who cannot create categories edit their own" do
      expect(guardian_for(owner, can_create: false).can_edit_category?(category)).to be_falsey
    end

    it "does not let the creator edit a project" do
      expect(guardian_for(owner).can_edit_category?(project)).to be_falsey
    end

    it "does not let an anonymous visitor edit anything" do
      expect(Guardian.new.can_edit_category?(category)).to be_falsey
    end

    it "still lets an admin edit a project" do
      expect(Guardian.new(admin).can_edit_category?(project)).to be_truthy
    end
  end

  describe "#can_delete_category?" do
    it "lets the creator delete their own empty subcategory" do
      expect(guardian_for(owner).can_delete_category?(category)).to be_truthy
    end

    it "does not let another user delete it" do
      expect(guardian_for(other).can_delete_category?(category)).to be_falsey
    end

    it "refuses when the category holds topics" do
      category.topic_count = 10
      expect(guardian_for(owner).can_delete_category?(category)).to be_falsey
    end

    it "refuses when the category has subcategories" do
      category.expects(:has_children?).returns(true)
      expect(guardian_for(owner).can_delete_category?(category)).to be_falsey
    end

    it "does not let the creator delete a project" do
      expect(guardian_for(owner).can_delete_category?(project)).to be_falsey
    end
  end
end
