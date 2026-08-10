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

    # A bare `Guardian.new` never reaches `own_category?` at all: core's
    # `can_create_category?` already returns false for it, so the expression
    # short-circuits before touching `user.id`. Stubbing `can_create_category?`
    # true is what actually exercises the `authenticated?` guard.
    it "does not let an anonymous visitor with create rights edit anything" do
      anonymous_guardian = Guardian.new.tap { |g| g.stubs(:can_create_category?).returns(true) }

      expect(anonymous_guardian.can_edit_category?(category)).to be_falsey
    end

    it "still lets an admin edit a project" do
      expect(Guardian.new(admin).can_edit_category?(project)).to be_truthy
    end

    it "does not let the creator edit their category once removed from the group that grants them visibility" do
      restricted = Fabricate(:private_category, group: group, user: owner, parent_category: project)
      group.add(owner)
      group.remove(owner)

      expect(guardian_for(owner).can_edit_category?(restricted)).to be_falsey
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

    it "does not let the creator delete their category once removed from the group that grants them visibility" do
      restricted = Fabricate(:private_category, group: group, user: owner, parent_category: project)
      group.add(owner)
      group.remove(owner)

      expect(guardian_for(owner).can_delete_category?(restricted)).to be_falsey
    end
  end

  describe "#can_edit_serialized_category?" do
    it "delegates to can_edit_category? for the creator of their own subcategory" do
      guardian = guardian_for(owner)

      result =
        guardian.can_edit_serialized_category?(
          category_id: category.id,
          read_restricted: category.read_restricted,
        )

      expect(result).to be_truthy
    end

    it "does not let another user edit it" do
      guardian = guardian_for(other)

      result =
        guardian.can_edit_serialized_category?(
          category_id: category.id,
          read_restricted: category.read_restricted,
        )

      expect(result).to be_falsey
    end

    it "returns false rather than raising when the category no longer exists" do
      guardian = guardian_for(owner)

      result = guardian.can_edit_serialized_category?(category_id: -1, read_restricted: true)

      expect(result).to be_falsey
    end

    it "still lets an admin edit through the core super check, without loading the category" do
      guardian = Guardian.new(admin)

      result = guardian.can_edit_serialized_category?(category_id: -1, read_restricted: true)

      expect(result).to be_truthy
    end

    # `Site#categories` calls this once per visible category on every page
    # load (core app/models/site.rb:158), so a user who can never satisfy the
    # ownership branch must not cost a query.
    it "does not query the database for a guardian who cannot create categories" do
      allow(Category).to receive(:find_by)

      result =
        guardian_for(owner, can_create: false).can_edit_serialized_category?(
          category_id: category.id,
          read_restricted: category.read_restricted,
        )

      expect(result).to be_falsey
      expect(Category).not_to have_received(:find_by)
    end
  end
end
